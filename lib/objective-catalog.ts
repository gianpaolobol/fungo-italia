import objectives from "../data/taxonomic-objectives.json" with { type: "json" };

import type { Taxon, TaxonRank } from "./domain.ts";
import { betaTaxa } from "./seed-data.ts";

type ObjectiveRecord = {
  id: string;
  commonName: string;
  scientificName: string;
  rank: TaxonRank;
  objectives: {
    minimum: string | null;
    desirable: string | null;
    advanced: string | null;
  };
  sources: {
    minimumObjectives: { title: string; page: number };
    edibilityGuide: { title: string; page: number | null };
  };
};

const objectiveTaxa: Taxon[] = (objectives as ObjectiveRecord[]).map((record) => {
  const primaryObjective =
    record.objectives.minimum ??
    record.objectives.desirable ??
    record.objectives.advanced ??
    "Obiettivo presente nella fonte, dettaglio editoriale da verificare.";
  return {
    id: record.id,
    commonName:
      record.rank === "genus"
        ? `Genere ${record.commonName}`
        : `Gruppo ${record.commonName}`,
    scientificName: record.scientificName,
    rank: record.rank,
    aliases: [],
    regionalNames: [],
    edibility: "mixed",
    safetyNote: primaryObjective,
    recognitionLevel: record.objectives.minimum
      ? "minimo"
      : record.objectives.desirable
        ? "auspicabile"
        : "approfondimento",
    objectiveSummary: record.objectives,
    sources: [
      {
        ...record.sources.minimumObjectives,
        kind: "obiettivi-minimi",
      },
      ...(record.sources.edibilityGuide.page
        ? [{
            title: record.sources.edibilityGuide.title,
            page: record.sources.edibilityGuide.page,
            kind: "guida-commestibilita" as const,
          }]
        : []),
    ],
  };
});

const detailedTaxaWithSources = betaTaxa.map((taxon): Taxon => {
  const genus = taxon.scientificName.match(/[A-Z][a-z]+/)?.[0];
  const parent = genus
    ? (objectives as ObjectiveRecord[]).find((record) =>
        new RegExp(`\\b${genus}\\b`).test(record.scientificName),
      )
    : undefined;
  if (!parent) return taxon;
  return {
    ...taxon,
    sources: [
      {
        ...parent.sources.minimumObjectives,
        kind: "obiettivi-minimi",
      },
      ...(parent.sources.edibilityGuide.page
        ? [{
            title: parent.sources.edibilityGuide.title,
            page: parent.sources.edibilityGuide.page,
            kind: "guida-commestibilita" as const,
          }]
        : []),
    ],
  };
});

export const catalogTaxa: Taxon[] = [...detailedTaxaWithSources, ...objectiveTaxa];
