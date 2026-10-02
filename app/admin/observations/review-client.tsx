"use client";

/* eslint-disable @next/next/no-img-element -- Authenticated R2 photographs must retain the user's request credentials. */
import { useCallback, useEffect, useState, type FormEvent } from "react";

type ReviewObservation = {
  id: string; description: string; observedAt: string; status: string;
  publicLatitude: number; publicLongitude: number; region: string | null;
  scientificName: string | null; reviewVersion: number;
  photos: Array<{ id: string; url: string }>;
};
type QueuePayload = {
  observations: ReviewObservation[];
  taxa: Array<{ id: string; scientificName: string; rank: string }>;
  totalInScope: number;
};
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function responseError(payload: unknown) {
  if (!isRecord(payload)) return "Operazione non riuscita.";
  if (Array.isArray(payload.errors)) return payload.errors.filter((value: unknown) => typeof value === "string").join(" ") || "Operazione non riuscita.";
  return typeof payload.error === "string" ? payload.error : "Operazione non riuscita.";
}
function isQueuePayload(value: unknown): value is QueuePayload {
  if (!isRecord(value) || !Array.isArray(value.observations) || !Array.isArray(value.taxa) || typeof value.totalInScope !== "number") return false;
  return value.observations.every((row: unknown) => {
    if (!isRecord(row) || typeof row.id !== "string" || typeof row.description !== "string" || typeof row.observedAt !== "string" || typeof row.status !== "string" || !Number.isInteger(row.reviewVersion) || typeof row.publicLatitude !== "number" || typeof row.publicLongitude !== "number" || !Array.isArray(row.photos)) return false;
    return (row.region === null || typeof row.region === "string") && (row.scientificName === null || typeof row.scientificName === "string") && row.photos.every((photo: unknown) => isRecord(photo) && typeof photo.id === "string" && typeof photo.url === "string" && photo.url.startsWith("/api/admin/observations/photos/"));
  }) && value.taxa.every((taxon: unknown) => isRecord(taxon) && typeof taxon.id === "string" && typeof taxon.scientificName === "string" && typeof taxon.rank === "string");
}
export function ObservationReviewClient() {
  const [payload, setPayload] = useState<QueuePayload | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/admin/observations", { cache: "no-store", credentials: "same-origin", signal });
      const data = await response.json();
      if (!response.ok) throw new Error(responseError(data));
      if (!isQueuePayload(data)) throw new Error("Risposta della coda non valida.");
      if (!signal?.aborted) { setPayload(data); setError(""); }
    } catch (failure) {
      if (!signal?.aborted) { setPayload(null); setError(failure instanceof Error ? failure.message : "Coda non disponibile."); }
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);
  return (
    <section aria-label="Coda di revisione osservazioni" className="space-y-4">
      <button className="min-h-11 rounded-xl border bg-white px-4 font-bold" type="button" onClick={() => { void refresh(); }}>Aggiorna coda</button>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-white p-4">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-[#e5efe2] p-4">{notice}</p>}
      {!payload && !error && <p role="status">Caricamento osservazioni…</p>}
      {payload && <p className="text-sm text-[#52675a]">{payload.observations.length} osservazioni mostrate su {payload.totalInScope} nel tuo ambito. Le decisioni registrate restano nella cronologia.</p>}
      {payload && payload.observations.length === 0 && <p className="rounded-xl bg-white p-4">Nessuna osservazione da revisionare nel tuo incarico.</p>}
      {payload?.observations.map(row => <ObservationReviewForm key={row.id} row={row} taxa={payload.taxa} onSaved={async () => { setNotice("Revisione registrata. L’esito riguarda il materiale documentato."); await refresh(); }} />)}
    </section>
  );
}
function ObservationReviewForm({ row, taxa, onSaved }: { row: ReviewObservation; taxa: QueuePayload["taxa"]; onSaved: () => Promise<void> }) {
  const [outcome, setOutcome] = useState("needsEvidence");
  const [notes, setNotes] = useState("");
  const [taxonId, setTaxonId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/observations", {
        method: "POST", cache: "no-store", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observationId: row.id, outcome, notes, expectedReviewVersion: row.reviewVersion, acceptedTaxonId: outcome === "documented" ? taxonId : null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(responseError(data));
      setNotes(""); setTaxonId(""); setOutcome("needsEvidence");
      await onSaved();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Revisione non salvata.");
    } finally { setBusy(false); }
  }
  const observed = new Date(row.observedAt);
  return (
    <article className="min-w-0 rounded-2xl border border-[#dbe4d9] bg-white p-4 sm:p-5">
      <h2 className="break-words text-lg font-black">{row.scientificName || "Taxon da determinare"}</h2>
      <p className="mt-1 text-sm text-[#52675a]">{Number.isFinite(observed.getTime()) ? observed.toLocaleString("it-IT") : "Data da verificare"} · {row.region || "Località non assegnata"} · {row.status === "needsEvidence" ? "Ulteriori evidenze richieste" : "In attesa di revisione"}</p>
      <p className="mt-2 text-xs text-[#52675a]">Centro territoriale aggregato: {row.publicLatitude}, {row.publicLongitude}</p>
      <p className="my-4 whitespace-pre-wrap break-words leading-relaxed">{row.description}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {row.photos.map((photo, index) => <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" className="min-w-0 rounded-xl border p-2" aria-label={"Apri fotografia " + (index + 1)}>
          <img src={photo.url} alt={"Fotografia " + (index + 1) + " dell’osservazione"} loading="lazy" className="max-h-80 w-full rounded-lg object-contain" />
          <span className="mt-2 block text-sm font-bold underline">Apri fotografia {index + 1} a dimensione originale</span>
        </a>)}
      </div>
      <form className="mt-5 space-y-3" onSubmit={submit}>
        <label className="block font-bold" htmlFor={"outcome-" + row.id}>Esito dell’esame documentale</label>
        <select id={"outcome-" + row.id} value={outcome} onChange={event => setOutcome(event.target.value)} className="min-h-11 w-full min-w-0 rounded-xl border px-3">
          <option value="needsEvidence">Richiedi ulteriori evidenze</option>
          <option value="documented">Registra una determinazione documentata</option>
          <option value="rejected">Materiale non idoneo alla determinazione</option>
        </select>
        {outcome === "documented" && <>
          <label className="block font-bold" htmlFor={"taxon-" + row.id}>Taxon del materiale documentato</label>
          <select required id={"taxon-" + row.id} value={taxonId} onChange={event => setTaxonId(event.target.value)} className="min-h-11 w-full min-w-0 rounded-xl border px-3">
            <option value="">Seleziona nel catalogo riconciliato</option>
            {taxa.map(taxon => <option key={taxon.id} value={taxon.id}>{taxon.scientificName} · {taxon.rank}</option>)}
          </select>
        </>}
        <label className="block font-bold" htmlFor={"notes-" + row.id}>Caratteri osservati, motivazione e limiti</label>
        <textarea required minLength={20} maxLength={20000} id={"notes-" + row.id} value={notes} onChange={event => setNotes(event.target.value)} rows={5} className="w-full min-w-0 rounded-xl border p-3" placeholder="Indica i caratteri visibili e quelli mancanti, eventuali riferimenti consultati e le fotografie o analisi necessarie." />
        {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
        <button type="submit" disabled={busy} className="min-h-11 rounded-xl bg-[#174f2b] px-4 font-bold text-white disabled:opacity-50">{busy ? "Salvataggio…" : "Registra revisione"}</button>
      </form>
    </article>
  );
}
