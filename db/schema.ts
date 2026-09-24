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
}, (table) => [uniqueIndex("idx_users_email").on(table.email)]);

export const userPasswords = sqliteTable("user_passwords", {
  userId: text("user_id").primaryKey().references(() => users.id),
  passwordHash: text("password_hash").notNull(),
  ...timestamps,
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  expiresAt: text("expires_at").notNull(),
  lastAccessed: text("last_accessed").notNull().default(sql`CURRENT_TIMESTAMP`),
  ...timestamps,
}, (table) => [
  index("idx_sessions_user").on(table.userId),
  index("idx_sessions_expiry").on(table.expiresAt),
]);

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

export const taxonPlacements = sqliteTable("taxon_placements", {
  id: text("id").primaryKey(),
  taxonId: text("taxon_id").notNull().references(() => taxa.id),
  acceptedScientificName: text("accepted_scientific_name").notNull(),
  authorship: text("authorship"),
  family: text("family"),
  orderName: text("order_name").notNull(),
  parentScientificName: text("parent_scientific_name").notNull(),
  validFrom: text("valid_from").notNull(),
  validTo: text("valid_to"),
  sourceCitation: text("source_citation").notNull(),
  ...timestamps,
}, (table) => [index("idx_taxon_placements_current").on(table.taxonId, table.validTo)]);

export const taxonProfiles = sqliteTable("taxon_profiles", {
  id: text("id").primaryKey(),
  taxonId: text("taxon_id").notNull().references(() => taxa.id),
  diagnosticCharactersJson: text("diagnostic_characters_json").notNull().default("[]"),
  odor: text("odor"),
  ecologyJson: text("ecology_json").notNull().default("[]"),
  sourceCitation: text("source_citation").notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("idx_taxon_profiles_taxon").on(table.taxonId)]);

export const taxonMediaAssets = sqliteTable("taxon_media_assets", {
  id: text("id").primaryKey(),
  taxonId: text("taxon_id").notNull().references(() => taxa.id),
  imageUrl: text("image_url").notNull(),
  sourceUrl: text("source_url").notNull(),
  author: text("author").notNull(),
  license: text("license").notNull(),
  licenseUrl: text("license_url").notNull(),
  caption: text("caption").notNull().default(""),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
}, (table) => [index("idx_taxon_media_visible").on(table.taxonId, table.hidden, table.sortOrder)]);

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

export const catalogRoleGrants = sqliteTable("catalog_role_grants", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role").notNull(),
  region: text("region"),
  taxonomicGroup: text("taxonomic_group"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  grantedBy: text("granted_by").notNull(),
  ...timestamps,
}, (table) => [
  index("idx_catalog_grants_user_active").on(table.userId, table.active),
  index("idx_catalog_grants_scope").on(table.region, table.taxonomicGroup),
]);

export const catalogChangeSets = sqliteTable("catalog_change_sets", {
  id: text("id").primaryKey(),
  authorId: text("author_id").notNull().references(() => users.id),
  targetTaxonId: text("target_taxon_id").references(() => taxa.id),
  proposalKind: text("proposal_kind").notNull(),
  status: text("status").notNull().default("submitted"),
  criticality: text("criticality").notNull(),
  regionScope: text("region_scope"),
  taxonomicScope: text("taxonomic_scope"),
  rationale: text("rationale").notNull(),
  publishedReleaseId: text("published_release_id"),
  ...timestamps,
}, (table) => [
  index("idx_catalog_changes_status").on(table.status, table.criticality),
  index("idx_catalog_changes_scope").on(table.regionScope, table.taxonomicScope),
  index("idx_catalog_changes_target").on(table.targetTaxonId),
]);

export const catalogFieldChanges = sqliteTable("catalog_field_changes", {
  id: text("id").primaryKey(),
  changeSetId: text("change_set_id").notNull().references(() => catalogChangeSets.id),
  fieldPath: text("field_path").notNull(),
  previousValueJson: text("previous_value_json"),
  proposedValueJson: text("proposed_value_json").notNull(),
  sourceCitation: text("source_citation").notNull(),
  evidenceNote: text("evidence_note").notNull().default(""),
  ...timestamps,
}, (table) => [index("idx_catalog_field_changes_set").on(table.changeSetId)]);

export const catalogReviewDecisions = sqliteTable("catalog_review_decisions", {
  id: text("id").primaryKey(),
  changeSetId: text("change_set_id").notNull().references(() => catalogChangeSets.id),
  reviewerId: text("reviewer_id").notNull().references(() => users.id),
  stage: text("stage").notNull(),
  decision: text("decision").notNull(),
  notes: text("notes").notNull().default(""),
  ...timestamps,
}, (table) => [
  index("idx_catalog_review_change").on(table.changeSetId),
  index("idx_catalog_review_reviewer").on(table.reviewerId),
]);

export const catalogReleases = sqliteTable("catalog_releases", {
  id: text("id").primaryKey(),
  version: text("version").notNull(),
  publishedBy: text("published_by").notNull().references(() => users.id),
  publishedAt: text("published_at").notNull(),
  sourceReportJson: text("source_report_json").notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("idx_catalog_release_version").on(table.version)]);

export const forecastModelVersions = sqliteTable("forecast_model_versions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  weightsJson: text("weights_json").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
}, (table) => [index("idx_forecast_model_active").on(table.active)]);

export const environmentalSnapshots = sqliteTable("environmental_snapshots", {
  id: text("id").primaryKey(),
  areaId: text("area_id").notNull().references(() => areas.id),
  provider: text("provider").notNull(),
  observedAt: text("observed_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  payloadJson: text("payload_json").notNull(),
  ...timestamps,
}, (table) => [
  index("idx_environment_area_observed").on(table.areaId, table.observedAt),
]);

export const cellTaxonForecasts = sqliteTable("cell_taxon_forecasts", {
  id: text("id").primaryKey(),
  areaId: text("area_id").notNull().references(() => areas.id),
  taxonId: text("taxon_id").notNull().references(() => taxa.id),
  modelVersionId: text("model_version_id").notNull().references(() => forecastModelVersions.id),
  snapshotId: text("snapshot_id").references(() => environmentalSnapshots.id),
  ecologicalSuitability: integer("ecological_suitability").notNull(),
  phenologyFit: integer("phenology_fit").notNull(),
  weatherFit: integer("weather_fit").notNull(),
  evidenceScore: integer("evidence_score").notNull(),
  pressurePenalty: integer("pressure_penalty").notNull(),
  score: integer("score").notNull(),
  recommendation: text("recommendation").notNull(),
  confidence: text("confidence").notNull(),
  reasonsJson: text("reasons_json").notNull(),
  calculatedAt: text("calculated_at").notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_cell_taxon_forecast_unique").on(table.areaId, table.taxonId, table.modelVersionId, table.calculatedAt),
  index("idx_cell_taxon_forecast_area_score").on(table.areaId, table.score),
]);
