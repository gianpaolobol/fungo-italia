import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { aggregateCoordinates, normalizeProposedTaxonId, validateObservation } from "@/lib/observation";
import { contributionTaxa, storageTaxonFor } from "@/lib/catalog-taxonomy";

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Registrazione richiesta." }, { status: 401 });
  if (!env.DB || !env.BUCKET) return NextResponse.json({ error: "Archivio temporaneamente non disponibile." }, { status: 503 });

  let form: FormData;
  try { form = await request.formData(); } catch { return NextResponse.json({error:"Modulo non valido."},{status:400}); }
  const photos = form.getAll("photos").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const description = String(form.get("description") ?? "");
  const observedAt = String(form.get("observedAt") ?? "");
  const rawLatitude = String(form.get("latitude") ?? "").trim();
  const rawLongitude = String(form.get("longitude") ?? "").trim();
  const latitude = rawLatitude ? Number(rawLatitude) : Number.NaN;
  const longitude = rawLongitude ? Number(rawLongitude) : Number.NaN;
  const proposedTaxonId = normalizeProposedTaxonId(String(form.get("proposedTaxonId") ?? ""), new Set(contributionTaxa.map((taxon) => taxon.id)));
  const proposedTaxon = proposedTaxonId ? contributionTaxa.find((taxon) => taxon.id === proposedTaxonId) : null;
  const storedTaxon = proposedTaxon ? storageTaxonFor(proposedTaxon) : null;
  const errors = validateObservation({ description, observedAt, latitude, longitude, photoCount: photos.length });

  if (String(form.get("proposedTaxonId") ?? "").trim() && !proposedTaxonId) errors.push("Taxon proposto non disponibile.");
  if (photos.length > 6) errors.push("Puoi allegare al massimo 6 fotografie.");
  for (const photo of photos) {
    if (!ACCEPTED_TYPES.has(photo.type)) errors.push(`Formato non supportato: ${photo.name}.`);
    if (photo.size > MAX_PHOTO_BYTES) errors.push(`${photo.name} supera 12 MB.`);
  }
  if (errors.length) return NextResponse.json({ errors }, { status: 400 });

  if (storedTaxon) {
    const existing = await env.DB.prepare("SELECT rank FROM taxa WHERE scientific_name=?").bind(storedTaxon.scientificName).first<{rank:string}>();
    if (existing && existing.rank !== storedTaxon.rank) return NextResponse.json({error:"Conflitto di rango tassonomico: scegli Non determinato."},{status:409});
  }
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
      ...(storedTaxon ? [env.DB.prepare("INSERT INTO taxa (id, scientific_name, rank, edibility, recognition_level, morphology_depth_required, safety_note) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(scientific_name) DO UPDATE SET scientific_name=CASE WHEN taxa.rank=excluded.rank THEN taxa.scientific_name ELSE NULL END").bind(storedTaxon.id, storedTaxon.scientificName, storedTaxon.rank, storedTaxon.edibility, storedTaxon.recognitionLevel ?? "minimo", storedTaxon.recognitionLevel === "approfondito" ? 1 : 0, storedTaxon.safetyNote)] : []),
      env.DB.prepare("INSERT INTO observations (id, user_id, proposed_taxon_id, description, observed_at, private_lat, private_lng, public_lat, public_lng, status) VALUES (?, ?, (SELECT id FROM taxa WHERE scientific_name=? AND rank=?), ?, ?, ?, ?, ?, ?, 'pending')").bind(observationId, user.userId, storedTaxon?.scientificName ?? null, storedTaxon?.rank ?? null, description.trim(), observedAt, latitude, longitude, publicCoordinates.lat, publicCoordinates.lng),
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

export async function GET(){
 const user=await getChatGPTUser();if(!user)return NextResponse.json({error:"Registrazione richiesta."},{status:401});if(!env.DB)return NextResponse.json({error:"Archivio temporaneamente non disponibile."},{status:503});
 try {
 const rows=await env.DB.prepare("SELECT o.id,o.description,o.observed_at AS observedAt,o.status,o.proposed_taxon_id AS proposedTaxonId,t.scientific_name AS scientificName,o.created_at AS createdAt,(SELECT COUNT(*) FROM observation_photos p WHERE p.observation_id=o.id) AS photoCount,(SELECT notes FROM reviews WHERE observation_id=o.id ORDER BY id DESC LIMIT 1) AS reviewNotes,(SELECT tx.scientific_name FROM reviews r LEFT JOIN taxa tx ON tx.id=r.accepted_taxon_id WHERE r.observation_id=o.id ORDER BY r.id DESC LIMIT 1) AS acceptedScientificName FROM observations o LEFT JOIN taxa t ON t.id=o.proposed_taxon_id WHERE o.user_id=? ORDER BY o.observed_at DESC,o.created_at DESC LIMIT 200").bind(user.userId).all<{id:string;[key:string]:unknown}>();
 const photos=await env.DB.prepare("SELECT p.id,p.observation_id AS observationId FROM observation_photos p JOIN observations o ON o.id=p.observation_id WHERE o.user_id=?").bind(user.userId).all<{id:string;observationId:string}>();
 const observations=rows.results.map(row=>({...row,photos:photos.results.filter(photo=>photo.observationId===row.id).map(photo=>({id:photo.id,url:"/api/admin/observations/photos/"+encodeURIComponent(photo.id)}))}));
 return NextResponse.json({observations,limit:200},{headers:{"Cache-Control":"private, no-store"}});
 } catch(error){console.error("observation_history_failed",error);return NextResponse.json({error:"Storico non disponibile. Riprova."},{status:503,headers:{"Cache-Control":"private, no-store"}});}
}
