import type { ChangeCriticality } from "./catalog-workflow.ts";

const supportedRanks = new Set([
  "family",
  "genus",
  "subgenus",
  "section",
  "subsection",
  "speciesGroup",
  "aggregate",
  "species",
  "subspecies",
  "variety",
  "operationalGroup",
]);

const supportedFields = new Set([
  "taxonomy.create",
  "taxonomy.acceptedScientificName",
  "taxonomy.rank",
  "names.common",
  "names.regional",
  "ecology.habitat",
  "ecology.association",
  "phenology.profile",
  "geography.profile",
  "edibility.category",
  "edibility.treatment",
  "safety.confusion.high",
]);

const criticalPrefixes = [
  "taxonomy.",
  "edibility.",
  "safety.confusion.high",
];

export type CatalogProposalInput = {
  proposalKind: "create" | "update";
  targetTaxonId: string | null;
  proposedScientificName: string | null;
  proposedRank: string | null;
  fieldPath: string;
  proposedValue: string;
  rationale: string;
  sourceCitation: string;
  regionScope: string | null;
  taxonomicScope: string | null;
  criticality: ChangeCriticality;
};

function textValue(input: Record<string, unknown>, key: string) {
  return typeof input[key] === "string" ? input[key].trim() : "";
}

export function classifyCriticality(fieldPaths: readonly string[]): ChangeCriticality {
  return fieldPaths.some((fieldPath) =>
    criticalPrefixes.some((prefix) => fieldPath.startsWith(prefix)),
  )
    ? "critical"
    : "ordinary";
}

export function validateCatalogProposal(
  input: unknown,
):
  | { success: true; data: CatalogProposalInput }
  | { success: false; errors: string[] } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { success: false, errors: ["Dati della proposta non validi."] };
  }
  const values = input as Record<string, unknown>;
  const proposalKind = textValue(values, "proposalKind");
  const targetTaxonId = textValue(values, "targetTaxonId");
  const proposedScientificName = textValue(values, "proposedScientificName");
  const proposedRank = textValue(values, "proposedRank");
  const fieldPath = textValue(values, "fieldPath");
  const proposedValue = textValue(values, "proposedValue");
  const rationale = textValue(values, "rationale");
  const sourceCitation = textValue(values, "sourceCitation");
  const regionScope = textValue(values, "regionScope");
  const taxonomicScope = textValue(values, "taxonomicScope");
  const errors: string[] = [];

  if (proposalKind !== "create" && proposalKind !== "update") {
    errors.push("Seleziona se vuoi creare o modificare un taxon.");
  }
  if (proposalKind === "update" && !targetTaxonId) {
    errors.push("Seleziona la scheda da modificare.");
  }
  if (proposalKind === "create" && !proposedScientificName) {
    errors.push("Inserisci il nome scientifico proposto.");
  }
  if (proposalKind === "create" && !supportedRanks.has(proposedRank)) {
    errors.push("Seleziona un rango tassonomico supportato.");
  }
  if (!supportedFields.has(fieldPath)) {
    errors.push("Seleziona un campo modificabile.");
  }
  if (!proposedValue && fieldPath !== "taxonomy.create") {
    errors.push("Inserisci il valore proposto.");
  }
  if (rationale.length < 20) {
    errors.push("Descrivi la motivazione con almeno 20 caratteri.");
  }
  if (sourceCitation.length < 6) {
    errors.push("Indica una fonte verificabile.");
  }
  if (errors.length > 0) return { success: false, errors };

  return {
    success: true,
    data: {
      proposalKind: proposalKind as "create" | "update",
      targetTaxonId: targetTaxonId || null,
      proposedScientificName: proposedScientificName || null,
      proposedRank: proposedRank || null,
      fieldPath,
      proposedValue: proposedValue || proposedScientificName,
      rationale,
      sourceCitation,
      regionScope: regionScope || null,
      taxonomicScope: taxonomicScope || null,
      criticality: classifyCriticality([fieldPath]),
    },
  };
}
