import type { AtlasTaxon } from "./domain.ts";
import {
  atlasTaxa,
  objectiveRecords,
  sortAtlasTaxa,
} from "./atlas-catalog.ts";

/**
 * Compatibility export for APIs and observation forms. Objective headings are
 * training records and are intentionally excluded from the atlas.
 */
export const catalogTaxa: AtlasTaxon[] = sortAtlasTaxa(atlasTaxa);

export { objectiveRecords };
