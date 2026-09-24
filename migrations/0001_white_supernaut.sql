CREATE TABLE `catalog_change_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`target_taxon_id` text,
	`proposal_kind` text NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`criticality` text NOT NULL,
	`region_scope` text,
	`taxonomic_scope` text,
	`rationale` text NOT NULL,
	`published_release_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_taxon_id`) REFERENCES `taxa`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_catalog_changes_status` ON `catalog_change_sets` (`status`,`criticality`);--> statement-breakpoint
CREATE INDEX `idx_catalog_changes_scope` ON `catalog_change_sets` (`region_scope`,`taxonomic_scope`);--> statement-breakpoint
CREATE INDEX `idx_catalog_changes_target` ON `catalog_change_sets` (`target_taxon_id`);--> statement-breakpoint
CREATE TABLE `catalog_field_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`change_set_id` text NOT NULL,
	`field_path` text NOT NULL,
	`previous_value_json` text,
	`proposed_value_json` text NOT NULL,
	`source_citation` text NOT NULL,
	`evidence_note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`change_set_id`) REFERENCES `catalog_change_sets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_catalog_field_changes_set` ON `catalog_field_changes` (`change_set_id`);--> statement-breakpoint
CREATE TABLE `catalog_releases` (
	`id` text PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`published_by` text NOT NULL,
	`published_at` text NOT NULL,
	`source_report_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`published_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_catalog_release_version` ON `catalog_releases` (`version`);--> statement-breakpoint
CREATE TABLE `catalog_review_decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`change_set_id` text NOT NULL,
	`reviewer_id` text NOT NULL,
	`stage` text NOT NULL,
	`decision` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`change_set_id`) REFERENCES `catalog_change_sets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_catalog_review_change` ON `catalog_review_decisions` (`change_set_id`);--> statement-breakpoint
CREATE INDEX `idx_catalog_review_reviewer` ON `catalog_review_decisions` (`reviewer_id`);--> statement-breakpoint
CREATE TABLE `catalog_role_grants` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`region` text,
	`taxonomic_group` text,
	`active` integer DEFAULT true NOT NULL,
	`granted_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_catalog_grants_user_active` ON `catalog_role_grants` (`user_id`,`active`);--> statement-breakpoint
CREATE INDEX `idx_catalog_grants_scope` ON `catalog_role_grants` (`region`,`taxonomic_group`);--> statement-breakpoint
CREATE TABLE `cell_taxon_forecasts` (
	`id` text PRIMARY KEY NOT NULL,
	`area_id` text NOT NULL,
	`taxon_id` text NOT NULL,
	`model_version_id` text NOT NULL,
	`snapshot_id` text,
	`ecological_suitability` integer NOT NULL,
	`phenology_fit` integer NOT NULL,
	`weather_fit` integer NOT NULL,
	`evidence_score` integer NOT NULL,
	`pressure_penalty` integer NOT NULL,
	`score` integer NOT NULL,
	`recommendation` text NOT NULL,
	`confidence` text NOT NULL,
	`reasons_json` text NOT NULL,
	`calculated_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`taxon_id`) REFERENCES `taxa`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`model_version_id`) REFERENCES `forecast_model_versions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`snapshot_id`) REFERENCES `environmental_snapshots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_cell_taxon_forecast_unique` ON `cell_taxon_forecasts` (`area_id`,`taxon_id`,`model_version_id`,`calculated_at`);--> statement-breakpoint
CREATE INDEX `idx_cell_taxon_forecast_area_score` ON `cell_taxon_forecasts` (`area_id`,`score`);--> statement-breakpoint
CREATE TABLE `environmental_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`area_id` text NOT NULL,
	`provider` text NOT NULL,
	`observed_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`payload_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_environment_area_observed` ON `environmental_snapshots` (`area_id`,`observed_at`);--> statement-breakpoint
CREATE TABLE `forecast_model_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`weights_json` text NOT NULL,
	`active` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_forecast_model_active` ON `forecast_model_versions` (`active`);