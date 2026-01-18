import { db } from '../db/client';
import { foodLogs, dailyLogs } from '../db/schema';
import { indonesianFoods } from '../data/indonesian-foods';
import { eq } from 'drizzle-orm';

export interface FoodItem {
    food_name: string;
    calories: number;
    sugar?: number;
    salt?: number;
}

export const FoodService = {
    // 1. Search Local Indonesian DB
    searchLocal: (query: string): FoodItem[] => {
        if (!query) return indonesianFoods;
        return indonesianFoods.filter(f =>
            f.food_name.toLowerCase().includes(query.toLowerCase())
        );
    },

    // 2. Search OpenFoodFacts (External API)
    searchOnline: async (query: string): Promise<FoodItem[]> => {
        try {
            const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1`);
            const data = await response.json();

            return data.products.map((p: any) => ({
                food_name: p.product_name || 'Unknown',
                calories: p.nutriments?.['energy-kcal_100g'] || 0,
                sugar: p.nutriments?.sugars_100g || 0,
                salt: p.nutriments?.salt_100g || 0,
            }));
        } catch (e) {
            console.error('API Error:', e);
            return [];
        }
    },

    // 3. Log Food to DB
    logFood: async (item: FoodItem, mealType: string) => {
        const today = new Date().toISOString().split('T')[0];

        // Get or Create Daily Log
        let dailyLog = await db.select().from(dailyLogs).where(eq(dailyLogs.date, today));
        let dailyLogId;

        if (dailyLog.length === 0) {
            // Create new daily log
            const newLog = await db.insert(dailyLogs).values({ date: today }).returning();
            dailyLogId = newLog[0].id;
        } else {
            dailyLogId = dailyLog[0].id;
        }

        // Insert Food Log
        await db.insert(foodLogs).values({
            daily_log_id: dailyLogId,
            food_name: item.food_name,
            calories: item.calories,
            meal_type: mealType
        });

        // Update Totals in Daily Log
        const currentCalories = dailyLog.length > 0 ? (dailyLog[0].calories || 0) : 0;
        const currentSugar = dailyLog.length > 0 ? (dailyLog[0].sugar || 0) : 0;
        const currentSalt = dailyLog.length > 0 ? (dailyLog[0].salt || 0) : 0;

        await db.update(dailyLogs).set({
            calories: currentCalories + item.calories,
            sugar: currentSugar + (item.sugar || 0),
            salt: currentSalt + (item.salt || 0),
            updated_at: new Date()
        }).where(eq(dailyLogs.id, dailyLogId));

        return true;
    }
};
