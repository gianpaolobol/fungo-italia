import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { resolveBootstrapRole, type ReviewerGrant } from "@/lib/catalog-permissions";
import { canReviewObservation } from "@/lib/observation-review";

export type ObservationReviewRow = {
  id: string; authorId: string; description: string; observedAt: string;
  publicLatitude: number; publicLongitude: number; status: string;
  proposedTaxonId: string | null; scientificName: string | null;
  region: string | null; reviewVersion: number;
};
export const reviewSelect = "SELECT o.id, o.user_id AS authorId, o.description, o.observed_at AS observedAt, o.public_lat AS publicLatitude, o.public_lng AS publicLongitude, o.status, o.proposed_taxon_id AS proposedTaxonId, t.scientific_name AS scientificName, a.region, COALESCE((SELECT MAX(r.id) FROM reviews r WHERE r.observation_id = o.id), 0) AS reviewVersion FROM observations o LEFT JOIN taxa t ON t.id = o.proposed_taxon_id LEFT JOIN areas a ON a.id = o.area_id";
export function privateJSON(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", "Vary": "Cookie, oai-authenticated-user-id", "X-Content-Type-Options": "nosniff" } });
}
export async function observationReviewerGrants(userId: string, email: string): Promise<ReviewerGrant[]> {
  const result = await env.DB!.prepare("SELECT user_id AS userId, role, region, taxonomic_group AS taxonomicGroup, active FROM catalog_role_grants WHERE user_id = ? AND active = 1").bind(userId).all<Omit<ReviewerGrant, "active"> & { active: number }>();
  const grants: ReviewerGrant[] = result.results.map(grant => ({ ...grant, active: Boolean(grant.active) }));
  const bootstrap = resolveBootstrapRole(email, (env as unknown as { CATALOG_CURATOR_EMAILS?: string }).CATALOG_CURATOR_EMAILS);
  if (bootstrap) grants.push({ userId, role: bootstrap, region: null, taxonomicGroup: null, active: true });
  return grants;
}
export function rowTaxonomicGroup(row: ObservationReviewRow) {
  return row.scientificName?.trim().split(/\s+/)[0] || null;
}
export function canReviewRow(actorId: string, grants: readonly ReviewerGrant[], row: ObservationReviewRow) {
  return canReviewObservation(actorId, grants, { authorId: row.authorId, region: row.region, taxonomicGroup: rowTaxonomicGroup(row) });
}
export async function findObservationRow(id: string) {
  return env.DB!.prepare(reviewSelect + " WHERE o.id = ?").bind(id).first<ObservationReviewRow>();
}
