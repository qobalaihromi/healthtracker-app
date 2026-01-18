CREATE TABLE `activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text DEFAULT 'run',
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`duration_seconds` integer DEFAULT 0,
	`distance_meters` real DEFAULT 0,
	`avg_pace` real DEFAULT 0,
	`path_coordinates` text,
	`created_at` integer DEFAULT '"2026-01-18T11:12:17.501Z"'
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_food_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`daily_log_id` integer,
	`food_name` text NOT NULL,
	`calories` integer NOT NULL,
	`meal_type` text NOT NULL,
	`created_at` integer DEFAULT '"2026-01-18T11:12:17.500Z"',
	FOREIGN KEY (`daily_log_id`) REFERENCES `daily_logs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_food_logs`("id", "daily_log_id", "food_name", "calories", "meal_type", "created_at") SELECT "id", "daily_log_id", "food_name", "calories", "meal_type", "created_at" FROM `food_logs`;--> statement-breakpoint
DROP TABLE `food_logs`;--> statement-breakpoint
ALTER TABLE `__new_food_logs` RENAME TO `food_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;