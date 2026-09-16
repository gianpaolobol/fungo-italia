import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  role: text("role").notNull().default("collector"),
  ...timestamps,
});

export const taxa = sqliteTable("taxa", {
  id: text("id").primaryKey(),
  scientificName: text("scientific_name").notNull(),
  rank: text("rank").notNull(),
  parentId: text("parent_id"),
  edibility: text("edibility").notNull(),
  recognitionLevel: text("recognition_level").notNull(),
  morphologyDepthRequired: integer("morphology_depth_required", { mode: "boolean" }).notNull().default(false),
  safetyNote: text("safety_note").notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("idx_taxa_scientific_name").on(table.scientificName)]);

export const taxonNames = sqliteTable("taxon_names", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taxonId: text("taxon_id").notNull().references(() => taxa.id),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  region: text("region"),
  language: text("language").notNull().default("it"),
}, (table) => [index("idx_taxon_names_taxon_region").on(table.taxonId, table.region)]);

export const areas = sqliteTable("areas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  publicCenterLat: real("public_center_lat").notNull(),
  publicCenterLng: real("public_center_lng").notNull(),
  habitatJson: text("habitat_json").notNull(),
  score: integer("score").notNull().default(0),
  recommendation: text("recommendation").notNull().default("Attendi"),
  ...timestamps,
}, (table) => [index("idx_areas_region_score").on(table.region, table.score)]);

export const visits = sqliteTable("visits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  areaId: text("area_id").notNull().references(() => areas.id),
  visitedAt: text("visited_at").notNull(),
  publishedAfter: text("published_after").notNull(),
  ...timestamps,
}, (table) => [index("idx_visits_area_published").on(table.areaId, table.publishedAfter)]);

export const observations = sqliteTable("observations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  areaId: text("area_id").references(() => areas.id),
  proposedTaxonId: text("proposed_taxon_id").references(() => taxa.id),
  description: text("description").notNull(),
  observedAt: text("observed_at").notNull(),
  privateLat: real("private_lat").notNull(),
  privateLng: real("private_lng").notNull(),
  publicLat: real("public_lat").notNull(),
  publicLng: real("public_lng").notNull(),
  status: text("status").notNull().default("pending"),
  ...timestamps,
}, (table) => [index("idx_observations_status_area").on(table.status, table.areaId)]);

export const observationPhotos = sqliteTable("observation_photos", {
  id: text("id").primaryKey(),
  observationId: text("observation_id").notNull().references(() => observations.id),
  objectKey: text("object_key").notNull(),
  contentType: text("content_type").notNull(),
  ...timestamps,
}, (table) => [index("idx_observation_photos_observation").on(table.observationId)]);

export const reviewerAssignments = sqliteTable("reviewer_assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  region: text("region").notNull(),
  taxonomicGroup: text("taxonomic_group").notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("idx_reviewer_assignment_unique").on(table.userId, table.region, table.taxonomicGroup)]);

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  observationId: text("observation_id").notNull().references(() => observations.id),
  reviewerId: text("reviewer_id").notNull().references(() => users.id),
  acceptedTaxonId: text("accepted_taxon_id").references(() => taxa.id),
  outcome: text("outcome").notNull(),
  notes: text("notes").notNull().default(""),
  ...timestamps,
}, (table) => [index("idx_reviews_observation").on(table.observationId)]);
