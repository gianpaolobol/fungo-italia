import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { aggregateCoordinates, normalizeProposedTaxonId, validateObservation } from "@/lib/observation";
import { betaTaxa } from "@/lib/seed-data";

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Registrazione richiesta." }, { status: 401 });
  if (!env.DB || !env.BUCKET) return NextResponse.json({ error: "Archivio temporaneamente non disponibile." }, { status: 503 });

  const form = await request.formData();
  const photos = form.getAll("photos").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const description = String(form.get("description") ?? "");
  const observedAt = String(form.get("observedAt") ?? "");
  const latitude = Number(form.get("latitude"));
  const longitude = Number(form.get("longitude"));
  const proposedTaxonId = normalizeProposedTaxonId(String(form.get("proposedTaxonId") ?? ""), new Set(betaTaxa.map((taxon) => taxon.id)));
  const proposedTaxon = proposedTaxonId ? betaTaxa.find((taxon) => taxon.id === proposedTaxonId) : null;
  const errors = validateObservation({ description, observedAt, latitude, longitude, photoCount: photos.length });

  if (photos.length > 6) errors.push("Puoi allegare al massimo 6 fotografie.");
  for (const photo of photos) {
    if (!ACCEPTED_TYPES.has(photo.type)) errors.push(`Formato non supportato: ${photo.name}.`);
    if (photo.size > MAX_PHOTO_BYTES) errors.push(`${photo.name} supera 12 MB.`);
  }
  if (errors.length) return NextResponse.json({ errors }, { status: 400 });

  const observationId = crypto.randomUUID();
  const publicCoordinates = aggregateCoordinates(latitude, longitude);
  const uploadedKeys: string[] = [];

  try {
    const photoRows: Array<{ id: string; key: string; contentType: string }> = [];
    for (const photo of photos) {
      const extension = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
      const photoId = crypto.randomUUID();
      const key = `observations/${user.userId}/${observationId}/${photoId}.${extension}`;
      await env.BUCKET.put(key, await photo.arrayBuffer(), { httpMetadata: { contentType: photo.type } });
      uploadedKeys.push(key);
      photoRows.push({ id: photoId, key, contentType: photo.type });
    }

    const statements = [
      env.DB.prepare("INSERT INTO users (id, email, display_name, role) VALUES (?, ?, ?, 'collector') ON CONFLICT(id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name, updated_at = CURRENT_TIMESTAMP").bind(user.userId, user.email, user.displayName),
      ...(proposedTaxon ? [env.DB.prepare("INSERT INTO taxa (id, scientific_name, rank, edibility, recognition_level, morphology_depth_required, safety_note) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING").bind(proposedTaxon.id, proposedTaxon.scientificName, proposedTaxon.rank, proposedTaxon.edibility, proposedTaxon.recognitionLevel ?? "minimo", proposedTaxon.recognitionLevel === "approfondito" ? 1 : 0, proposedTaxon.safetyNote)] : []),
      env.DB.prepare("INSERT INTO observations (id, user_id, proposed_taxon_id, description, observed_at, private_lat, private_lng, public_lat, public_lng, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')").bind(observationId, user.userId, proposedTaxonId, description.trim(), observedAt, latitude, longitude, publicCoordinates.lat, publicCoordinates.lng),
      ...photoRows.map((photo) => env.DB!.prepare("INSERT INTO observation_photos (id, observation_id, object_key, content_type) VALUES (?, ?, ?, ?)").bind(photo.id, observationId, photo.key, photo.contentType)),
    ];
    await env.DB.batch(statements);
    return NextResponse.json({ id: observationId, status: "pending", message: "Segnalazione inviata alla verifica micologica." }, { status: 201 });
  } catch (error) {
    await Promise.allSettled(uploadedKeys.map((key) => env.BUCKET!.delete(key)));
    console.error("observation_submission_failed", error);
    return NextResponse.json({ error: "Invio non riuscito. Le foto non sono state conservate: riprova." }, { status: 500 });
  }
}
