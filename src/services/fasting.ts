import { db } from '../db/client';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// We need a separate table for fasting sessions
export const fastingSessions = sqliteTable('fasting_sessions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    start_time: text('start_time').notNull(), // ISO String
    end_time: text('end_time'), // Null if currently fasting
    target_hours: integer('target_hours').default(16), // e.g., 16 hours
    status: text('status').default('active'), // active, completed, broken
});

import { eq, desc, isNull } from 'drizzle-orm';

export const FastingService = {
    // Get current active fast
    getCurrentFast: async () => {
        const active = await db.select().from(fastingSessions)
            .where(eq(fastingSessions.status, 'active'))
            .orderBy(desc(fastingSessions.start_time))
            .limit(1);
        return active[0] || null;
    },

    // Start new fast
    startFast: async (targetHours: number = 16) => {
        // End any existing fast first
        const active = await FastingService.getCurrentFast();
        if (active) {
            await FastingService.endFast();
        }

        const startTime = new Date().toISOString();
        await db.insert(fastingSessions).values({
            start_time: startTime,
            target_hours: targetHours,
            status: 'active'
        });
        return true;
    },

    // End fast
    endFast: async () => {
        const active = await FastingService.getCurrentFast();
        if (!active) return false;

        await db.update(fastingSessions)
            .set({
                end_time: new Date().toISOString(),
                status: 'completed'
            })
            .where(eq(fastingSessions.id, active.id));
        return true;
    }
};
