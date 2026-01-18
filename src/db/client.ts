import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

const DATABASE_NAME = 'health_tracker.db';

// Initialize the Database
export const expoDb = openDatabaseSync(DATABASE_NAME);
export const db = drizzle(expoDb, { schema });

// Helper to check DB functionality
export const checkDbConnection = async () => {
    try {
        const result = await db.select().from(schema.dailyLogs).limit(1);
        console.log('Database connected:', result);
        return true;
    } catch (e) {
        console.error('Database connection failed:', e);
        return false;
    }
};
