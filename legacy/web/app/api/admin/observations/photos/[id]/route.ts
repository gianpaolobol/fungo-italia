import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { canReviewRow, findObservationRow, observationReviewerGrants, privateJSON } from "../../review-access";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return privateJSON({ error: "Registrazione richiesta." }, 401);
  if (!env.DB || !env.BUCKET) return privateJSON({ error: "Archivio non disponibile." }, 503);
  try {
    const { id } = await context.params;
    const photo = await env.DB.prepare("SELECT observation_id AS observationId, object_key AS objectKey FROM observation_photos WHERE id = ?").bind(id).first<{ observationId: string; objectKey: string }>();
    if (!photo) return privateJSON({ error: "Foto non disponibile." }, 404);
    const row = await findObservationRow(photo.observationId);
    if (!row) return privateJSON({ error: "Foto non disponibile." }, 404);
    if (row.authorId !== user.userId) {
      const grants = await observationReviewerGrants(user.userId, user.email);
      if (!canReviewRow(user.userId, grants, row)) return privateJSON({ error: "Foto non disponibile." }, 404);
    }
    const object = await env.BUCKET.get(photo.objectKey);
    if (!object) return privateJSON({ error: "Foto non disponibile." }, 404);
    const contentType = object.httpMetadata?.contentType;
    if (!contentType || !["image/jpeg", "image/png", "image/webp"].includes(contentType)) return privateJSON({ error: "Formato non disponibile." }, 415);
    return new Response(object.body, { headers: { "Content-Type": contentType, "Cache-Control": "private, no-store", "Vary": "Cookie, oai-authenticated-user-id", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    console.error("observation_photo_read_failed", error);
    return privateJSON({ error: "Foto temporaneamente non disponibile." }, 503);
  }
}
