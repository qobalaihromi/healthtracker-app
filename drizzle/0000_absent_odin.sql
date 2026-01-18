CREATE TABLE `daily_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`calories` integer DEFAULT 0,
	`sugar` real DEFAULT 0,
	`salt` real DEFAULT 0,
	`steps` integer DEFAULT 0,
	`distance_km` real DEFAULT 0,
	`active_minutes` integer DEFAULT 0,
	`sleep_hours` real DEFAULT 0,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_logs_date_unique` ON `daily_logs` (`date`);--> statement-breakpoint
CREATE TABLE `food_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`daily_log_id` integer,
	`food_name` text NOT NULL,
	`calories` integer NOT NULL,
	`meal_type` text NOT NULL,
	`created_at` integer DEFAULT '"2026-01-18T09:44:51.334Z"',
	FOREIGN KEY (`daily_log_id`) REFERENCES `daily_logs`(`id`) ON UPDATE no action ON DELETE no action
);
