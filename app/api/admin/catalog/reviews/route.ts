import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  canApproveCriticalChange,
  canReviewChange,
  resolveBootstrapRole,
  type ReviewerGrant,
  type ReviewableChange,
} from "@/lib/catalog-permissions";

type RuntimeEnv = {
  CATALOG_CURATOR_EMAILS?: string;
};

type ChangeRow = {
  id: string;
  authorId: string;
  authorName: string | null;
  targetTaxonId: string | null;
  proposalKind: string;
  status: string;
  criticality: "ordinary" | "critical";
  regionScope: string | null;
  taxonomicScope: string | null;
  rationale: string;
  fieldPath: string;
  proposedValueJson: string;
  sourceCitation: string;
  createdAt: string;
};

type DecisionInput = {
  changeSetId?: string;
  decision?: "approve" | "reject" | "requestChanges";
  notes?: string;
};

function curatorConfig() {
  return (env as unknown as RuntimeEnv).CATALOG_CURATOR_EMAILS;
}

async function reviewerGrants(userId: string, email: string): Promise<ReviewerGrant[]> {
  const result = await env.DB!.prepare(
    "SELECT user_id AS userId, role, region, taxonomic_group AS taxonomicGroup, active FROM catalog_role_grants WHERE user_id = ? AND active = 1",
  ).bind(userId).all<{
    userId: string;
    role: ReviewerGrant["role"];
    region: string | null;
    taxonomicGroup: string | null;
    active: number;
  }>();
  const grants: ReviewerGrant[] = result.results.map((grant) => ({
    ...grant,
    active: Boolean(grant.active),
  }));
  const bootstrap = resolveBootstrapRole(email, curatorConfig());
  if (bootstrap) {
    grants.push({
      userId,
      role: bootstrap,
      region: null,
      taxonomicGroup: null,
      active: true,
    });
  }
  return grants;
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Registrazione richiesta." }, { status: 401 });
  if (!env.DB) return NextResponse.json({ error: "Archivio non disponibile." }, { status: 503 });
  const grants = await reviewerGrants(user.userId, user.email);
  if (grants.length === 0) {
    return NextResponse.json({ error: "Non hai un incarico di revisione attivo." }, { status: 403 });
  }

  const rows = await env.DB.prepare(
    "SELECT cs.id, cs.author_id AS authorId, u.display_name AS authorName, cs.target_taxon_id AS targetTaxonId, cs.proposal_kind AS proposalKind, cs.status, cs.criticality, cs.region_scope AS regionScope, cs.taxonomic_scope AS taxonomicScope, cs.rationale, fc.field_path AS fieldPath, fc.proposed_value_json AS proposedValueJson, fc.source_citation AS sourceCitation, cs.created_at AS createdAt FROM catalog_change_sets cs JOIN users u ON u.id = cs.author_id JOIN catalog_field_changes fc ON fc.change_set_id = cs.id WHERE cs.status IN ('submitted', 'inReview', 'changesRequested') ORDER BY cs.created_at ASC",
  ).all<ChangeRow>();

  const visible = rows.results.filter((row) => canReviewChange(grants, {
    id: row.id,
    authorId: row.authorId,
    criticality: row.criticality,
    regionScope: row.regionScope,
    taxonomicScope: row.taxonomicScope,
  }));

  return NextResponse.json({
    role: grants.some((grant) => grant.role === "scientificCurator")
      ? "scientificCurator"
      : "mycologist",
    changes: visible,
  });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Registrazione richiesta." }, { status: 401 });
  if (!env.DB) return NextResponse.json({ error: "Archivio non disponibile." }, { status: 503 });

  let input: DecisionInput;
  try {
    input = await request.json() as DecisionInput;
  } catch {
    return NextResponse.json({ error: "Decisione non valida." }, { status: 400 });
  }
  if (
    !input.changeSetId ||
    !input.decision ||
    !["approve", "reject", "requestChanges"].includes(input.decision)
  ) {
    return NextResponse.json({ error: "Decisione non valida." }, { status: 400 });
  }

  const change = await env.DB.prepare(
    "SELECT id, author_id AS authorId, criticality, region_scope AS regionScope, taxonomic_scope AS taxonomicScope FROM catalog_change_sets WHERE id = ? AND status IN ('submitted', 'inReview', 'changesRequested')",
  ).bind(input.changeSetId).first<ReviewableChange>();
  if (!change) return NextResponse.json({ error: "Proposta non trovata." }, { status: 404 });

  const grants = await reviewerGrants(user.userId, user.email);
  if (!canReviewChange(grants, change)) {
    return NextResponse.json({ error: "Proposta fuori dal tuo ambito di competenza." }, { status: 403 });
  }

  const priorApproval = await env.DB.prepare(
    "SELECT reviewer_id AS reviewerId FROM catalog_review_decisions WHERE change_set_id = ? AND stage = 'mycologist' AND decision = 'approve' ORDER BY created_at ASC LIMIT 1",
  ).bind(change.id).first<{ reviewerId: string }>();
  const actorRole = grants.some((grant) => grant.role === "scientificCurator")
    ? "scientificCurator"
    : "mycologist";
  const changeWithReviewer = {
    ...change,
    mycologistReviewerId: priorApproval?.reviewerId ?? null,
  };
  const scientificApproval =
    input.decision === "approve" &&
    canApproveCriticalChange({ id: user.userId, role: actorRole }, changeWithReviewer);
  const stage = scientificApproval ? "scientific" : "mycologist";
  const nextStatus =
    input.decision === "reject"
      ? "rejected"
      : input.decision === "requestChanges"
        ? "changesRequested"
        : change.criticality === "ordinary" || scientificApproval
          ? "published"
          : "inReview";
  const decisionId = crypto.randomUUID();
  const releaseId = nextStatus === "published" ? crypto.randomUUID() : null;
  const publishedAt = new Date().toISOString();
  const releaseVersion = releaseId
    ? "catalog-" + publishedAt.replace(/[-:.TZ]/g, "").slice(0, 14) + "-" + releaseId.slice(0, 8)
    : null;

  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO users (id, email, display_name, role) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name, role = excluded.role, updated_at = CURRENT_TIMESTAMP",
    ).bind(user.userId, user.email, user.displayName, actorRole),
    env.DB.prepare(
      "INSERT INTO catalog_review_decisions (id, change_set_id, reviewer_id, stage, decision, notes) VALUES (?, ?, ?, ?, ?, ?)",
    ).bind(decisionId, change.id, user.userId, stage, input.decision, input.notes?.trim() ?? ""),
    ...(releaseId ? [
      env.DB.prepare(
        "INSERT INTO catalog_releases (id, version, published_by, published_at, source_report_json) VALUES (?, ?, ?, ?, ?)",
      ).bind(
        releaseId,
        releaseVersion,
        user.userId,
        publishedAt,
        JSON.stringify({ changeSetId: change.id, decisionId }),
      ),
    ] : []),
    env.DB.prepare(
      "UPDATE catalog_change_sets SET status = ?, published_release_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).bind(nextStatus, releaseId, change.id),
  ]);

  return NextResponse.json({ id: change.id, status: nextStatus, stage });
}
