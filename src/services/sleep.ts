import { db } from '../db/client';
import { dailyLogs } from '../db/schema';
import { eq } from 'drizzle-orm';

export const SleepService = {
    logSleep: async (hours: number) => {
        const today = new Date().toISOString().split('T')[0];

        // Check if log exists
        const existing = await db.select().from(dailyLogs).where(eq(dailyLogs.date, today));

        if (existing.length > 0) {
            await db.update(dailyLogs)
                .set({ sleep_hours: hours, updated_at: new Date() })
                .where(eq(dailyLogs.date, today));
        } else {
            await db.insert(dailyLogs).values({
                date: today,
                sleep_hours: hours,
                updated_at: new Date()
            });
        }
        return true;
    }
};
