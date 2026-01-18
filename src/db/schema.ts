import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const dailyLogs = sqliteTable('daily_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull().unique(), // YYYY-MM-DD

    // Nutrition
    calories: integer('calories').default(0),
    sugar: real('sugar').default(0), // grams
    salt: real('salt').default(0), // grams

    // Activity
    steps: integer('steps').default(0),
    distance_km: real('distance_km').default(0),
    active_minutes: integer('active_minutes').default(0),

    // Sleep
    sleep_hours: real('sleep_hours').default(0),

    // Body Metrics
    weight_kg: real('weight_kg'),
    height_cm: real('height_cm'),
    waist_cm: real('waist_cm'),

    updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
});

export const foodLogs = sqliteTable('food_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    daily_log_id: integer('daily_log_id').references(() => dailyLogs.id),
    food_name: text('food_name').notNull(),
    calories: integer('calories').notNull(),
    meal_type: text('meal_type').notNull(), // breakfast, lunch, dinner, snack
    created_at: integer('created_at', { mode: 'timestamp' }).default(new Date()),
});

export const fastingSessions = sqliteTable('fasting_sessions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    start_time: text('start_time').notNull(), // ISO String
    end_time: text('end_time'), // Null if currently fasting
    target_hours: integer('target_hours').default(16), // e.g., 16 hours
    status: text('status').default('active'), // active, completed, broken
});
