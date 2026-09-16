export type RecommendationLabel = "Vai ora" | "Buona" | "Attendi";
export type VisitPressure = "nessuno" | "pochi" | "alcuni" | "molti";
export type TaxonRank =
  | "family"
  | "genus"
  | "subgenus"
  | "section"
  | "subsection"
  | "speciesGroup"
  | "aggregate"
  | "species"
  | "subspecies"
  | "variety"
  | "operationalGroup"
  | "group";

export interface RegionalName {
  name: string;
  regions: string[];
}

export interface Taxon {
  id: string;
  commonName: string;
  scientificName: string;
  rank: TaxonRank;
  aliases: string[];
  regionalNames: RegionalName[];
  edibility:
    | "commestibile"
    | "commestibile-dopo-trattamento"
    | "sconsigliato"
    | "non-commestibile"
    | "tossico"
    | "senza-valore"
    | "non-valutato";
  safetyNote: string;
  hosts?: string[];
  recognitionLevel?: "minimo" | "approfondito" | "auspicabile";
}

export interface Area {
  id: string;
  name: string;
  region: string;
  center: [number, number];
  habitat: string[];
  moisture: number;
  temperatureFit: number;
  seasonFit: number;
  verifiedSignals: number;
  delayedVisitors: number;
  lastUpdatedLabel: string;
  expectedTaxa: string[];
  reasons: string[];
}

export interface Recommendation {
  score: number;
  label: RecommendationLabel;
}

export function getVisitPressure(count: number): VisitPressure {
  if (count <= 0) return "nessuno";
  if (count <= 4) return "pochi";
  if (count <= 15) return "alcuni";
  return "molti";
}

export function scoreArea(area: Area): Recommendation {
  const signalAverage =
    (area.moisture +
      area.temperatureFit +
      area.seasonFit +
      area.verifiedSignals) /
    4;
  const pressure = getVisitPressure(area.delayedVisitors);
  const penalty = pressure === "molti" ? 18 : pressure === "alcuni" ? 8 : 0;
  const score = Math.max(0, Math.min(100, Math.round(signalAverage - penalty)));

  return {
    score,
    label: score >= 75 ? "Vai ora" : score >= 55 ? "Buona" : "Attendi",
  };
}

export function formatTaxonLabel(taxon: Taxon) {
  return `${taxon.commonName} · ${taxon.scientificName}`;
}
