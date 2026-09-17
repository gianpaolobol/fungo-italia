import generatedTaxa from "../data/atlas-taxa.json" with { type: "json" };
import objectives from "../data/taxonomic-objectives.json" with { type: "json" };

import type { AtlasTaxon, Taxon } from "./domain.ts";
import { betaTaxa } from "./seed-data.ts";

export type TrainingObjectiveRecord = (typeof objectives)[number];

export const objectiveRecords: TrainingObjectiveRecord[] = objectives;

const orderPriority = new Map([
  ["Agaricales", 0],
  ["Russulales", 1],
  ["Boletales", 2],
  ["Cantharellales", 3],
  ["Gomphales", 4],
  ["Polyporales", 5],
  ["Thelephorales", 6],
  ["Phallales", 7],
  ["Geastrales", 8],
  ["Auriculariales", 9],
  ["Dacrymycetales", 10],
  ["Tremellales", 11],
  ["Pezizales", 12],
  ["Helotiales", 13],
  ["Leotiales", 14],
  ["Hypocreales", 15],
  ["Geoglossales", 16],
]);

function detailedOverlay(taxon: AtlasTaxon): AtlasTaxon {
  const detailed = betaTaxa.find(
    (entry) => entry.scientificName.toLocaleLowerCase("it") === taxon.scientificName.toLocaleLowerCase("it"),
  );
  if (!detailed) return taxon;
  return {
    ...taxon,
    id: detailed.id,
    commonName: detailed.commonName,
    aliases: [...new Set([...taxon.aliases, ...detailed.aliases])],
    regionalNames: detailed.regionalNames,
    edibility: detailed.edibility,
    safetyNote: detailed.safetyNote,
    ecology: detailed.hosts ?? taxon.ecology,
  };
}

export const atlasTaxa: AtlasTaxon[] = (generatedTaxa as AtlasTaxon[]).map(detailedOverlay);

export function sortAtlasTaxa(taxa: readonly AtlasTaxon[]): AtlasTaxon[] {
  return [...taxa].sort((left, right) => {
    const division = left.division.localeCompare(right.division, "it");
    if (division !== 0) return left.division === "Basidiomycota" ? -1 : 1;
    const leftOrder = orderPriority.get(left.order) ?? 999;
    const rightOrder = orderPriority.get(right.order) ?? 999;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    const family = (left.family ?? "").localeCompare(right.family ?? "", "it");
    if (family !== 0) return family;
    return left.scientificName.localeCompare(right.scientificName, "it");
  });
}

export function asLegacyTaxa(taxa: readonly AtlasTaxon[]): Taxon[] {
  return [...taxa];
}
