import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { validateCatalogProposal } from "@/lib/catalog-proposal";
import {
  hasEditorialScope,
  resolveBootstrapRole,
  type ReviewerGrant,
} from "@/lib/catalog-permissions";
import { betaTaxa } from "@/lib/seed-data";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) {
    return NextResponse.json({ error: "Registrazione richiesta." }, { status: 401 });
  }
  if (!env.DB) {
    return NextResponse.json({ error: "Archivio temporaneamente non disponibile." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ errors: ["Dati della proposta non validi."] }, { status: 400 });
  }
  const validation = validateCatalogProposal(body);
  if (!validation.success) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }
  const proposal = validation.data;
  const targetTaxon = proposal.targetTaxonId
    ? betaTaxa.find((taxon) => taxon.id === proposal.targetTaxonId)
    : null;
  if (proposal.proposalKind === "update" && !targetTaxon) {
    return NextResponse.json({ errors: ["La scheda selezionata non è disponibile."] }, { status: 400 });
  }

  const changeSetId = crypto.randomUUID();
  const fieldChangeId = crypto.randomUUID();
  const grantRows = await env.DB.prepare(
    "SELECT user_id AS userId, role, region, taxonomic_group AS taxonomicGroup, active FROM catalog_role_grants WHERE user_id = ? AND active = 1",
  ).bind(user.userId).all<{
    userId: string;
    role: ReviewerGrant["role"];
    region: string | null;
    taxonomicGroup: string | null;
    active: number;
  }>();
  const grants: ReviewerGrant[] = grantRows.results.map((grant) => ({
    ...grant,
    active: Boolean(grant.active),
  }));
  const configuredCurators = (env as unknown as { CATALOG_CURATOR_EMAILS?: string }).CATALOG_CURATOR_EMAILS;
  const bootstrapRole = resolveBootstrapRole(user.email, configuredCurators);
  if (bootstrapRole) {
    grants.push({
      userId: user.userId,
      role: bootstrapRole,
      region: null,
      taxonomicGroup: null,
      active: true,
    });
  }
  const directPublish =
    proposal.criticality === "ordinary" &&
    hasEditorialScope(grants, proposal.regionScope, proposal.taxonomicScope);
  const releaseId = directPublish ? crypto.randomUUID() : null;
  const publishedAt = directPublish ? new Date().toISOString() : null;
  const releaseVersion = releaseId && publishedAt
    ? "catalog-" + publishedAt.replace(/[-:.TZ]/g, "").slice(0, 14) + "-" + releaseId.slice(0, 8)
    : null;
  const proposedValueJson = JSON.stringify({
    value: proposal.proposedValue,
    scientificName: proposal.proposedScientificName,
    rank: proposal.proposedRank,
  });

  const statements = [
    env.DB.prepare(
      "INSERT INTO users (id, email, display_name, role) VALUES (?, ?, ?, 'collector') ON CONFLICT(id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name, updated_at = CURRENT_TIMESTAMP",
    ).bind(user.userId, user.email, user.displayName),
    ...(targetTaxon ? [
      env.DB.prepare(
        "INSERT INTO taxa (id, scientific_name, rank, edibility, recognition_level, morphology_depth_required, safety_note) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
      ).bind(
        targetTaxon.id,
        targetTaxon.scientificName,
        targetTaxon.rank,
        targetTaxon.edibility,
        targetTaxon.recognitionLevel ?? "minimo",
        targetTaxon.recognitionLevel === "approfondito" ? 1 : 0,
        targetTaxon.safetyNote,
      ),
    ] : []),
    env.DB.prepare(
      "INSERT INTO catalog_change_sets (id, author_id, target_taxon_id, proposal_kind, status, criticality, region_scope, taxonomic_scope, rationale, published_release_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).bind(
      changeSetId,
      user.userId,
      proposal.targetTaxonId,
      proposal.proposalKind,
      directPublish ? "published" : "submitted",
      proposal.criticality,
      proposal.regionScope,
      proposal.taxonomicScope,
      proposal.rationale,
      releaseId,
    ),
    env.DB.prepare(
      "INSERT INTO catalog_field_changes (id, change_set_id, field_path, previous_value_json, proposed_value_json, source_citation, evidence_note) VALUES (?, ?, ?, NULL, ?, ?, '')",
    ).bind(
      fieldChangeId,
      changeSetId,
      proposal.fieldPath,
      proposedValueJson,
      proposal.sourceCitation,
    ),
    ...(releaseId && publishedAt ? [
      env.DB.prepare(
        "INSERT INTO catalog_releases (id, version, published_by, published_at, source_report_json) VALUES (?, ?, ?, ?, ?)",
      ).bind(
        releaseId,
        releaseVersion,
        user.userId,
        publishedAt,
        JSON.stringify({ changeSetId, mode: "direct-ordinary-edit" }),
      ),
    ] : []),
  ];

  try {
    await env.DB.batch(statements);
    return NextResponse.json({
      id: changeSetId,
      status: directPublish ? "published" : "submitted",
      criticality: proposal.criticality,
    }, { status: 201 });
  } catch (error) {
    console.error("catalog_proposal_failed", error);
    return NextResponse.json({ error: "Invio non riuscito. Riprova." }, { status: 500 });
  }
}
