import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  applyPublishedChanges,
  type PublishedFieldChange,
} from "@/lib/catalog-publication";
import { betaTaxa } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Registrazione richiesta." }, { status: 401 });
  if (!env.DB) {
    return NextResponse.json({
      release: "beta-base",
      taxa: betaTaxa,
      status: "degraded",
    });
  }

  try {
    const result = await env.DB.prepare(
      "SELECT cs.id AS changeSetId, cs.status, cs.proposal_kind AS proposalKind, cs.target_taxon_id AS targetTaxonId, fc.field_path AS fieldPath, fc.proposed_value_json AS proposedValueJson, cs.region_scope AS regionScope, COALESCE(cr.published_at, cs.updated_at) AS publishedAt FROM catalog_change_sets cs JOIN catalog_field_changes fc ON fc.change_set_id = cs.id LEFT JOIN catalog_releases cr ON cr.id = cs.published_release_id WHERE cs.status = 'published' ORDER BY publishedAt ASC, cs.id ASC",
    ).all<PublishedFieldChange>();
    return NextResponse.json({
      release: result.results.at(-1)?.publishedAt ?? "beta-base",
      taxa: applyPublishedChanges(betaTaxa, result.results),
      status: "live",
    }, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch (error) {
    console.error("catalog_read_failed", error);
    return NextResponse.json({
      release: "beta-base",
      taxa: betaTaxa,
      status: "degraded",
    });
  }
}
