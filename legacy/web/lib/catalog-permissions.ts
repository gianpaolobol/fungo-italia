import type { CatalogRole, ChangeCriticality } from "./catalog-workflow.ts";

export type ReviewerGrant = {
  userId: string;
  role: CatalogRole;
  region: string | null;
  taxonomicGroup: string | null;
  active: boolean;
};

export type ReviewableChange = {
  id: string;
  authorId: string;
  criticality: ChangeCriticality;
  regionScope: string | null;
  taxonomicScope: string | null;
  mycologistReviewerId?: string | null;
};

export type ReviewerActor = {
  id: string;
  role: CatalogRole;
};

function scopeMatches(granted: string | null, required: string | null) {
  if (!required) return !granted || granted === "*";
  return !granted || granted === "*" || granted === required;
}

export function hasEditorialScope(
  grants: readonly ReviewerGrant[],
  regionScope: string | null,
  taxonomicScope: string | null,
): boolean {
  return grants.some((grant) => {
    if (!grant.active) return false;
    if (grant.role === "scientificCurator") return true;
    if (grant.role !== "mycologist") return false;
    return (
      scopeMatches(grant.region, regionScope) &&
      scopeMatches(grant.taxonomicGroup, taxonomicScope)
    );
  });
}

export function canReviewChange(
  grants: readonly ReviewerGrant[],
  change: ReviewableChange,
): boolean {
  if (grants.length === 0) return false;
  const actorId = grants[0].userId;
  if (actorId === change.authorId) return false;

  return grants.some((grant) => {
    if (!grant.active || grant.userId !== actorId) return false;
    return hasEditorialScope([grant], change.regionScope, change.taxonomicScope);
  });
}

export function canApproveCriticalChange(
  actor: ReviewerActor,
  change: ReviewableChange,
): boolean {
  return (
    change.criticality === "critical" &&
    actor.role === "scientificCurator" &&
    actor.id !== change.authorId &&
    Boolean(change.mycologistReviewerId) &&
    actor.id !== change.mycologistReviewerId
  );
}

export function resolveBootstrapRole(
  email: string,
  configuredEmails: string | null | undefined,
): CatalogRole | null {
  if (!configuredEmails) return null;
  const normalized = email.trim().toLocaleLowerCase("it");
  const allowed = configuredEmails
    .split(",")
    .map((entry) => entry.trim().toLocaleLowerCase("it"))
    .filter(Boolean);
  return allowed.includes(normalized) ? "scientificCurator" : null;
}
