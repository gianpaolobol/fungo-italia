import attestationsJson from "../data/catalog/release-attestations.json" with { type: "json" };

import { catalogSearchDocuments } from "./catalog-search.ts";
import { minimumCards } from "./minimum-cards.ts";
import { minimumGenusCards } from "./minimum-genus-cards.ts";
import {
  nomenclatureConflicts,
  unresolvedNomenclatureMappings,
} from "./minimum-nomenclature.ts";
import { scientificReviewQueue } from "./scientific-review-queue.ts";

type Attestations = typeof attestationsJson;

export interface BetaReleaseGate {
  ready: boolean;
  blockers: string[];
  checks: {
    minimumCards: number;
    genusCards: number;
    searchDocuments: number;
    nomenclatureConflicts: number;
    nomenclatureUnresolved: number;
    reviewNeededClaims: number;
    visualViewportSmoke: string;
    independentMycologicalReview: string;
  };
}

export function evaluateBetaReleaseGate(
  attestations: Attestations = attestationsJson,
): BetaReleaseGate {
  const blockers: string[] = [];

  if (minimumCards.length !== 148) {
    blockers.push(`Expected 148 minimum cards, found ${minimumCards.length}`);
  }
  if (minimumGenusCards.length !== 66) {
    blockers.push(`Expected 66 genus/group cards, found ${minimumGenusCards.length}`);
  }
  if (catalogSearchDocuments.length !== 214) {
    blockers.push(`Expected 214 structured atlas search documents, found ${catalogSearchDocuments.length}`);
  }
  if (nomenclatureConflicts.length > 0) {
    blockers.push(`Nomenclature conflicts remain: ${nomenclatureConflicts.length}`);
  }
  if (unresolvedNomenclatureMappings.length > 0) {
    blockers.push(`Unresolved nomenclature mappings remain: ${unresolvedNomenclatureMappings.length}`);
  }
  if (scientificReviewQueue.length > 0) {
    blockers.push(`Scientific review queue is not empty: ${scientificReviewQueue.length} claims remain`);
  }
  if (attestations.visualViewportSmoke.status !== "verified") {
    blockers.push("Final visual viewport smoke test has not been verified");
  }
  if (attestations.independentMycologicalReview.status !== "verified") {
    blockers.push("Independent mycological review has not been verified");
  }

  return {
    ready: blockers.length === 0,
    blockers,
    checks: {
      minimumCards: minimumCards.length,
      genusCards: minimumGenusCards.length,
      searchDocuments: catalogSearchDocuments.length,
      nomenclatureConflicts: nomenclatureConflicts.length,
      nomenclatureUnresolved: unresolvedNomenclatureMappings.length,
      reviewNeededClaims: scientificReviewQueue.length,
      visualViewportSmoke: attestations.visualViewportSmoke.status,
      independentMycologicalReview: attestations.independentMycologicalReview.status,
    },
  };
}
