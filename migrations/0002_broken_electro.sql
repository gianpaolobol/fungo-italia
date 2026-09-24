CREATE TABLE `taxon_media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`taxon_id` text NOT NULL,
	`image_url` text NOT NULL,
	`source_url` text NOT NULL,
	`author` text NOT NULL,
	`license` text NOT NULL,
	`license_url` text NOT NULL,
	`caption` text DEFAULT '' NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`hidden` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`taxon_id`) REFERENCES `taxa`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_taxon_media_visible` ON `taxon_media_assets` (`taxon_id`,`hidden`,`sort_order`);--> statement-breakpoint
CREATE TABLE `taxon_placements` (
	`id` text PRIMARY KEY NOT NULL,
	`taxon_id` text NOT NULL,
	`accepted_scientific_name` text NOT NULL,
	`authorship` text,
	`family` text,
	`order_name` text NOT NULL,
	`parent_scientific_name` text NOT NULL,
	`valid_from` text NOT NULL,
	`valid_to` text,
	`source_citation` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`taxon_id`) REFERENCES `taxa`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_taxon_placements_current` ON `taxon_placements` (`taxon_id`,`valid_to`);--> statement-breakpoint
CREATE TABLE `taxon_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`taxon_id` text NOT NULL,
	`diagnostic_characters_json` text DEFAULT '[]' NOT NULL,
	`odor` text,
	`ecology_json` text DEFAULT '[]' NOT NULL,
	`source_citation` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`taxon_id`) REFERENCES `taxa`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_taxon_profiles_taxon` ON `taxon_profiles` (`taxon_id`);