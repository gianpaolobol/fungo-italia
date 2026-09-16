CREATE TABLE `areas` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`region` text NOT NULL,
	`public_center_lat` real NOT NULL,
	`public_center_lng` real NOT NULL,
	`habitat_json` text NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`recommendation` text DEFAULT 'Attendi' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_areas_region_score` ON `areas` (`region`,`score`);--> statement-breakpoint
CREATE TABLE `observation_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`observation_id` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`observation_id`) REFERENCES `observations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_observation_photos_observation` ON `observation_photos` (`observation_id`);--> statement-breakpoint
CREATE TABLE `observations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`area_id` text,
	`proposed_taxon_id` text,
	`description` text NOT NULL,
	`observed_at` text NOT NULL,
	`private_lat` real NOT NULL,
	`private_lng` real NOT NULL,
	`public_lat` real NOT NULL,
	`public_lng` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`proposed_taxon_id`) REFERENCES `taxa`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_observations_status_area` ON `observations` (`status`,`area_id`);--> statement-breakpoint
CREATE TABLE `reviewer_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`region` text NOT NULL,
	`taxonomic_group` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_reviewer_assignment_unique` ON `reviewer_assignments` (`user_id`,`region`,`taxonomic_group`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`observation_id` text NOT NULL,
	`reviewer_id` text NOT NULL,
	`accepted_taxon_id` text,
	`outcome` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`observation_id`) REFERENCES `observations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`accepted_taxon_id`) REFERENCES `taxa`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_reviews_observation` ON `reviews` (`observation_id`);--> statement-breakpoint
CREATE TABLE `taxa` (
	`id` text PRIMARY KEY NOT NULL,
	`scientific_name` text NOT NULL,
	`rank` text NOT NULL,
	`parent_id` text,
	`edibility` text NOT NULL,
	`recognition_level` text NOT NULL,
	`morphology_depth_required` integer DEFAULT false NOT NULL,
	`safety_note` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_taxa_scientific_name` ON `taxa` (`scientific_name`);--> statement-breakpoint
CREATE TABLE `taxon_names` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`taxon_id` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`region` text,
	`language` text DEFAULT 'it' NOT NULL,
	FOREIGN KEY (`taxon_id`) REFERENCES `taxa`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_taxon_names_taxon_region` ON `taxon_names` (`taxon_id`,`region`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text,
	`role` text DEFAULT 'collector' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `visits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`area_id` text NOT NULL,
	`visited_at` text NOT NULL,
	`published_after` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_visits_area_published` ON `visits` (`area_id`,`published_after`);