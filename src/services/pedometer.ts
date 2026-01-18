import { Pedometer } from 'expo-sensors';
import { db } from '../db/client';
import { dailyLogs } from '../db/schema';
import { eq } from 'drizzle-orm';

export const PedometerService = {
    isAvailable: async () => {
        return await Pedometer.isAvailableAsync();
    },

    requestPermissions: async () => {
        const { status } = await Pedometer.requestPermissionsAsync();
        return status === 'granted';
    },

    // Get steps for today (from Sensor)
    getTodaysSteps: async () => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(); // now

        try {
            const result = await Pedometer.getStepCountAsync(start, end);
            return result.steps;
        } catch (e) {
            console.log('Error getting steps:', e);
            return 0;
        }
    },

    // Save steps to DB
    saveSteps: async (steps: number) => {
        const today = new Date().toISOString().split('T')[0];

        // Check if log exists
        const existing = await db.select().from(dailyLogs).where(eq(dailyLogs.date, today));

        if (existing.length > 0) {
            await db.update(dailyLogs)
                .set({ steps: steps, updated_at: new Date() })
                .where(eq(dailyLogs.date, today));
        } else {
            await db.insert(dailyLogs).values({
                date: today,
                steps: steps,
                updated_at: new Date()
            });
        }
    }
};
