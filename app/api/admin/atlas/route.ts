import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { atlasTaxa } from "@/lib/atlas-catalog";
import { isFounderAdmin } from "@/lib/founder-admin";

type RuntimeEnv = { CATALOG_CURATOR_EMAILS?: string };
const allowedFields = new Set(["names.common", "taxonomy.acceptedScientificName", "edibility.safetyNote", "diagnostics.odor", "ecology.association"]);

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Registrazione richiesta." }, { status: 401 });
  const founder = isFounderAdmin(user.email, (env as unknown as RuntimeEnv).CATALOG_CURATOR_EMAILS);
  return NextResponse.json({ founder, taxa: atlasTaxa.map(({ id, scientificName, commonName }) => ({ id, scientificName, commonName })) });
}

export async function PATCH(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Registrazione richiesta." }, { status: 401 });
  if (!isFounderAdmin(user.email, (env as unknown as RuntimeEnv).CATALOG_CURATOR_EMAILS)) return NextResponse.json({ error: "Accesso riservato al fondatore-admin." }, { status: 403 });
  if (!env.DB) return NextResponse.json({ error: "Archivio non disponibile." }, { status: 503 });
  const input = await request.json() as { taxonId?: string; fieldPath?: string; value?: string; sourceCitation?: string; rationale?: string };
  if (!input.taxonId || !atlasTaxa.some((taxon) => taxon.id === input.taxonId) || !input.fieldPath || !allowedFields.has(input.fieldPath) || !input.value?.trim() || !input.sourceCitation?.trim() || !input.rationale?.trim()) {
    return NextResponse.json({ error: "Compila taxon, campo, valore, fonte e motivazione." }, { status: 400 });
  }
  const changeSetId = crypto.randomUUID();
  const fieldChangeId = crypto.randomUUID();
  const releaseId = crypto.randomUUID();
  const publishedAt = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare("INSERT INTO users (id, email, display_name, role) VALUES (?, ?, ?, 'scientificCurator') ON CONFLICT(id) DO UPDATE SET email=excluded.email, display_name=excluded.display_name, role='scientificCurator', updated_at=CURRENT_TIMESTAMP").bind(user.userId, user.email, user.displayName),
    env.DB.prepare("INSERT INTO catalog_change_sets (id, author_id, target_taxon_id, proposal_kind, status, criticality, rationale, published_release_id) VALUES (?, ?, ?, 'update', 'published', 'ordinary', ?, ?)").bind(changeSetId, user.userId, input.taxonId, input.rationale.trim(), releaseId),
    env.DB.prepare("INSERT INTO catalog_field_changes (id, change_set_id, field_path, proposed_value_json, source_citation, evidence_note) VALUES (?, ?, ?, ?, ?, ?)").bind(fieldChangeId, changeSetId, input.fieldPath, JSON.stringify({ value: input.value.trim() }), input.sourceCitation.trim(), input.rationale.trim()),
    env.DB.prepare("INSERT INTO catalog_releases (id, version, published_by, published_at, source_report_json) VALUES (?, ?, ?, ?, ?)").bind(releaseId, `founder-${publishedAt.replace(/\D/g, "").slice(0, 14)}`, user.userId, publishedAt, JSON.stringify({ changeSetId, directFounderPublication: true })),
  ]);
  return NextResponse.json({ ok: true, changeSetId, publishedAt });
}
