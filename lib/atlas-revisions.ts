import type { AtlasTaxon, TaxonMedia } from "./domain.ts";

export interface AtlasRevision {
  id: string;
  targetTaxonId: string;
  fieldPath: string;
  value: unknown;
  sourceCitation: string;
  rationale: string;
  publishedAt: string;
}

function cloneTaxon(taxon: AtlasTaxon): AtlasTaxon {
  return structuredClone(taxon);
}

function applyRevision(taxon: AtlasTaxon, revision: AtlasRevision) {
  switch (revision.fieldPath) {
    case "taxonomy.acceptedScientificName": {
      if (typeof revision.value !== "string" || !revision.value.trim()) return;
      const previous = taxon.acceptedName;
      const accepted = revision.value.trim();
      if (previous !== accepted && !taxon.aliases.includes(previous)) taxon.aliases.push(previous);
      taxon.acceptedName = accepted;
      taxon.scientificName = accepted;
      return;
    }
    case "taxonomy.authorship":
      taxon.authorship = typeof revision.value === "string" ? revision.value : null;
      return;
    case "taxonomy.family":
      taxon.family = typeof revision.value === "string" ? revision.value : null;
      return;
    case "taxonomy.order":
      if (typeof revision.value === "string") taxon.order = revision.value;
      return;
    case "taxonomy.parentScientificName":
      if (typeof revision.value === "string") taxon.parentScientificName = revision.value;
      return;
    case "names.common":
      if (typeof revision.value === "string") taxon.commonName = revision.value;
      return;
    case "names.alias.add":
      if (typeof revision.value === "string" && !taxon.aliases.includes(revision.value)) taxon.aliases.push(revision.value);
      return;
    case "edibility.category":
      taxon.edibility = revision.value as AtlasTaxon["edibility"];
      return;
    case "edibility.safetyNote":
      if (typeof revision.value === "string") taxon.safetyNote = revision.value;
      return;
    case "diagnostics.characters":
      if (Array.isArray(revision.value)) taxon.diagnosticCharacters = revision.value.filter((item): item is string => typeof item === "string");
      return;
    case "diagnostics.odor":
      taxon.odor = typeof revision.value === "string" ? revision.value : null;
      return;
    case "ecology.profile":
      if (Array.isArray(revision.value)) taxon.ecology = revision.value.filter((item): item is string => typeof item === "string");
      return;
    case "media.add": {
      const media = revision.value as TaxonMedia;
      if (!media?.id || !media.imageUrl || taxon.media?.some((item) => item.id === media.id)) return;
      taxon.media = [...(taxon.media ?? []), media];
      taxon.mediaStatus = taxon.media.some((item) => item.verified && !item.hidden) ? "ready" : "preparing";
      return;
    }
    case "media.hide":
    case "media.remove": {
      if (typeof revision.value !== "string") return;
      taxon.media = (taxon.media ?? []).map((item) => item.id === revision.value ? { ...item, hidden: true } : item);
      taxon.mediaStatus = taxon.media.some((item) => item.verified && !item.hidden) ? "ready" : "preparing";
      return;
    }
  }
}

export function applyAtlasRevisions(taxa: AtlasTaxon[], revisions: AtlasRevision[]) {
  const result = taxa.map(cloneTaxon);
  const byId = new Map(result.map((taxon) => [taxon.id, taxon]));
  const ordered = [...revisions].sort((left, right) => left.publishedAt.localeCompare(right.publishedAt));
  for (const revision of ordered) {
    const taxon = byId.get(revision.targetTaxonId);
    if (taxon) applyRevision(taxon, revision);
  }
  return result;
}
