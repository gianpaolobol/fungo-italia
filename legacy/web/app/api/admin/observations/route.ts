import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { studyAtlasTaxa } from "@/lib/study-atlas-catalog";
import { canReviewObservation, observationStatusForOutcome, validateObservationReview, type ObservationReviewOutcome } from "@/lib/observation-review";
import { canReviewRow, findObservationRow, observationReviewerGrants, privateJSON, reviewSelect, type ObservationReviewRow } from "./review-access";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return privateJSON({ error: "Registrazione richiesta." }, 401);
  if (!env.DB) return privateJSON({ error: "Archivio non disponibile." }, 503);
  try {
    const grants = await observationReviewerGrants(user.userId, user.email);
    if (!grants.some(grant => grant.role === "mycologist" || grant.role === "scientificCurator")) return privateJSON({ error: "Serve un incarico micologico attivo." }, 403);
    const rows = await env.DB.prepare(reviewSelect + " WHERE o.status IN ('pending', 'needsEvidence') ORDER BY o.created_at ASC").all<ObservationReviewRow>();
    const scoped = rows.results.filter(row => canReviewRow(user.userId, grants, row));
    const visible = scoped.slice(0, 100);
    const photos = await env.DB.prepare("SELECT p.id, p.observation_id AS observationId FROM observation_photos p JOIN observations o ON o.id = p.observation_id WHERE o.status IN ('pending', 'needsEvidence')").all<{ id: string; observationId: string }>();
    return privateJSON({
      observations: visible.map(row => ({ ...row, photos: photos.results.filter(photo => photo.observationId === row.id).map(photo => ({ id: photo.id, url: "/api/admin/observations/photos/" + photo.id })) })),
      taxa: studyAtlasTaxa.map(taxon => ({ id: taxon.id, scientificName: taxon.scientificName, rank: taxon.rank })),
      totalInScope: scoped.length,
      scopeNote: "La revisione riguarda il materiale documentato. Non autorizza la raccolta o il consumo.",
    });
  } catch (error) {
    console.error("observation_review_queue_failed", error);
    return privateJSON({ error: "Coda temporaneamente non disponibile." }, 503);
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return privateJSON({ error: "Registrazione richiesta." }, 401);
  if (!env.DB) return privateJSON({ error: "Archivio non disponibile." }, 503);
  let raw: unknown;
  try { raw = await request.json(); } catch { return privateJSON({ error: "Decisione non valida." }, 400); }
  const errors = validateObservationReview(raw);
  if (errors.length) return privateJSON({ errors }, 400);
  const input = raw as { observationId: string; outcome: ObservationReviewOutcome; notes: string; expectedReviewVersion: number; acceptedTaxonId?: string | null };
  try {
    const row = await findObservationRow(input.observationId);
    const grants = await observationReviewerGrants(user.userId, user.email);
    if (!row || !canReviewRow(user.userId, grants, row)) return privateJSON({ error: "Osservazione non disponibile nel tuo ambito." }, 404);
    if (!["pending", "needsEvidence"].includes(row.status) || row.reviewVersion !== input.expectedReviewVersion) return privateJSON({ error: "La revisione è cambiata. Ricarica la coda." }, 409);
    const acceptedTaxon = input.outcome === "documented" ? studyAtlasTaxa.find(taxon => taxon.id === input.acceptedTaxonId) : null;
    if (input.outcome === "documented" && !acceptedTaxon) return privateJSON({ error: "Taxon non presente nel catalogo riconciliato." }, 400);
    if (acceptedTaxon && !canReviewObservation(user.userId, grants, { authorId: row.authorId, region: row.region, taxonomicGroup: acceptedTaxon.scientificName.trim().split(/\s+/)[0] })) return privateJSON({ error: "Il taxon proposto è fuori dal tuo incarico." }, 403);
    let acceptedTaxonId: string | null = null;
    const statements: D1PreparedStatement[] = [
      env.DB.prepare("INSERT INTO users (id, email, display_name, role) VALUES (?, ?, ?, 'collector') ON CONFLICT(id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name, updated_at = CURRENT_TIMESTAMP").bind(user.userId, user.email, user.displayName),
    ];
    if (acceptedTaxon) {
      const existing = await env.DB.prepare("SELECT id, rank FROM taxa WHERE id = ? OR scientific_name = ? ORDER BY CASE WHEN id = ? THEN 0 ELSE 1 END LIMIT 1").bind(acceptedTaxon.id, acceptedTaxon.scientificName, acceptedTaxon.id).first<{ id: string; rank: string }>();
      if (existing && existing.rank !== acceptedTaxon.rank) return privateJSON({ error: "Il concetto è registrato con un rango diverso: serve una revisione del catalogo." }, 409);
      acceptedTaxonId = existing?.id ?? acceptedTaxon.id;
      if (!existing) statements.push(env.DB.prepare("INSERT INTO taxa (id, scientific_name, rank, edibility, recognition_level, morphology_depth_required, safety_note) VALUES (?, ?, ?, ?, 'minimo', 0, ?) ON CONFLICT(id) DO NOTHING").bind(acceptedTaxon.id, acceptedTaxon.scientificName, acceptedTaxon.rank, acceptedTaxon.edibility, acceptedTaxon.safetyNote));
    }
    const decisionIndex = statements.length;
    statements.push(
      env.DB.prepare("INSERT INTO reviews (observation_id, reviewer_id, accepted_taxon_id, outcome, notes) SELECT id, ?, ?, ?, ? FROM observations WHERE id = ? AND status IN ('pending', 'needsEvidence') AND COALESCE((SELECT MAX(id) FROM reviews WHERE observation_id = ?), 0) = ?").bind(user.userId, acceptedTaxonId, input.outcome, input.notes.trim(), row.id, row.id, input.expectedReviewVersion),
      env.DB.prepare("UPDATE observations SET status = COALESCE((SELECT CASE outcome WHEN 'documented' THEN 'reviewed' ELSE outcome END FROM reviews WHERE observation_id = ? ORDER BY id DESC LIMIT 1), status), updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(row.id, row.id),
    );
    const result = await env.DB.batch(statements);
    if (result[decisionIndex].meta.changes !== 1) return privateJSON({ error: "Un altro revisore ha aggiornato l'osservazione. Ricarica la coda." }, 409);
    return privateJSON({ id: row.id, status: observationStatusForOutcome(input.outcome), reviewVersion: result[decisionIndex].meta.last_row_id, message: "Esame documentale registrato. Non è un'autorizzazione alimentare." });
  } catch (error) {
    console.error("observation_review_failed", error);
    return privateJSON({ error: "Revisione non salvata: riprova." }, 503);
  }
}
