import type { Taxon, TaxonRank } from "./domain.ts";

export type PublishedFieldChange = {
  changeSetId: string;
  status: string;
  proposalKind: "create" | "update";
  targetTaxonId: string | null;
  fieldPath: string;
  proposedValueJson: string;
  regionScope: string | null;
  publishedAt: string;
};

const ranks = new Set<TaxonRank>([
  "family",
  "genus",
  "subgenus",
  "section",
  "subsection",
  "speciesGroup",
  "aggregate",
  "group",
  "species",
  "subspecies",
  "variety",
  "operationalGroup",
]);

type ProposedValue = {
  value?: string;
  scientificName?: string | null;
  rank?: string | null;
};

function parseValue(value: string): ProposedValue | null {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" ? parsed as ProposedValue : null;
  } catch {
    return null;
  }
}

function cloneTaxon(taxon: Taxon): Taxon {
  return {
    ...taxon,
    aliases: [...taxon.aliases],
    regionalNames: taxon.regionalNames.map((entry) => ({
      name: entry.name,
      regions: [...entry.regions],
    })),
    hosts: taxon.hosts ? [...taxon.hosts] : undefined,
  };
}

export function applyPublishedChanges(
  baseTaxa: Taxon[],
  changes: PublishedFieldChange[],
): Taxon[] {
  const catalog = baseTaxa.map(cloneTaxon);
  const byId = new Map(catalog.map((taxon) => [taxon.id, taxon]));
  const ordered = changes
    .filter((change) => change.status === "published")
    .sort((left, right) => (
      left.publishedAt.localeCompare(right.publishedAt) ||
      left.changeSetId.localeCompare(right.changeSetId)
    ));

  for (const change of ordered) {
    const proposed = parseValue(change.proposedValueJson);
    if (!proposed) continue;

    if (change.proposalKind === "create" && change.fieldPath === "taxonomy.create") {
      const scientificName = proposed.scientificName?.trim() || proposed.value?.trim();
      const rank = proposed.rank as TaxonRank | undefined;
      if (!scientificName || !rank || !ranks.has(rank)) continue;
      const id = "catalog-" + change.changeSetId;
      if (byId.has(id)) continue;
      const taxon: Taxon = {
        id,
        commonName: scientificName,
        scientificName,
        rank,
        aliases: [],
        regionalNames: [],
        edibility: "non-valutato",
        safetyNote: "Commestibilità non valutata nella fonte S2 per questa pubblicazione.",
      };
      catalog.push(taxon);
      byId.set(id, taxon);
      continue;
    }

    if (!change.targetTaxonId) continue;
    const taxon = byId.get(change.targetTaxonId);
    const value = proposed.value?.trim();
    if (!taxon || !value) continue;

    if (change.fieldPath === "names.common") taxon.commonName = value;
    if (change.fieldPath === "names.regional") {
      const regions = [change.regionScope || "Ambito non specificato"];
      const existing = taxon.regionalNames.find((entry) =>
        entry.name === value && entry.regions.join("|") === regions.join("|"),
      );
      if (!existing) taxon.regionalNames.push({ name: value, regions });
    }
    if (change.fieldPath === "taxonomy.acceptedScientificName") {
      if (!taxon.aliases.includes(taxon.scientificName)) taxon.aliases.push(taxon.scientificName);
      taxon.scientificName = value;
      if ("acceptedName" in taxon) (taxon as Taxon & { acceptedName: string }).acceptedName = value;
    }
    if (change.fieldPath === "taxonomy.rank" && ranks.has(value as TaxonRank)) {
      taxon.rank = value as TaxonRank;
    }
    if (change.fieldPath === "ecology.association") {
      taxon.hosts = [...new Set([...(taxon.hosts ?? []), value])];
      if ("ecology" in taxon) {
        const extended = taxon as Taxon & { ecology: string[] };
        extended.ecology = [...new Set([...(extended.ecology ?? []), value])];
      }
    }
    if (change.fieldPath === "edibility.safetyNote") taxon.safetyNote = value;
    if (change.fieldPath === "diagnostics.odor" && "odor" in taxon) (taxon as Taxon & { odor: string | null }).odor = value;
  }

  return catalog;
}
