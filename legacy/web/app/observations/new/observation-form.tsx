"use client";

import { FormEvent, useState } from "react";
import { Camera, CheckCircle2, LoaderCircle, LocateFixed, Send } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { Taxon } from "@/lib/domain";

export function ObservationForm({ taxa }: { taxa: Taxon[] }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [coords, setCoords] = useState({ latitude: "", longitude: "" });

  function locate() {
    if (!navigator.geolocation) return setErrors(["Geolocalizzazione non disponibile: inserisci le coordinate manualmente."]);
    navigator.geolocation.getCurrentPosition(
      ({ coords: found }) => { setCoords({ latitude: found.latitude.toFixed(6), longitude: found.longitude.toFixed(6) }); setErrors([]); },
      () => setErrors(["Non è stato possibile leggere la posizione. Controlla i permessi o inseriscila manualmente."]),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors([]);
    setStatus("sending");
    try {
      const response = await fetch("/api/observations", { method: "POST", body: new FormData(event.currentTarget) });
      const result = await response.json() as { errors?: string[]; error?: string };
      if (!response.ok) { setErrors(result.errors ?? [result.error ?? "Invio non riuscito."]); setStatus("idle"); return; }
      setStatus("success");
    } catch {
      setErrors(["Connessione interrotta. I dati sono ancora nel modulo: riprova."]);
      setStatus("idle");
    }
  }

  if (status === "success") {
    return <div className="mt-8 rounded-2xl border border-[#a8d3ad] bg-[#edf8ec] p-7 text-center"><CheckCircle2 className="mx-auto size-11 text-[#22703a]" /><h2 className="mt-3 text-xl font-black">Segnalazione ricevuta</h2><p className="mt-2 text-[#506757]">È ora in attesa di verifica da parte di un micologo competente per territorio e gruppo tassonomico.</p><Button asChild className="mt-5 rounded-xl bg-[#174f2b]"><Link href="/observations">Vedi le mie osservazioni</Link></Button></div>;
  }

  return <form onSubmit={submit} className="mt-7 space-y-6">
    {errors.length > 0 && <div role="alert" className="rounded-xl border border-[#e3a6a0] bg-[#fff1ef] p-4 text-sm text-[#842d26]"><div className="font-black">Controlla questi dati</div><ul className="mt-2 list-disc space-y-1 pl-5">{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
    <Field label="Taxon proposto" hint="Puoi fermarti al genere o al gruppo se non hai elementi per la specie."><NativeSelect name="proposedTaxonId" className="h-11 w-full rounded-xl text-base"><NativeSelectOption value="">Non determinato</NativeSelectOption>{taxa.map((taxon) => <NativeSelectOption key={taxon.id} value={taxon.id}>{taxon.commonName} · {taxon.scientificName}</NativeSelectOption>)}</NativeSelect></Field>
    <Field label="Descrizione" hint="Habitat, piante vicine, odore, viraggi, lattice, consistenza e numero di esemplari."><Textarea name="description" minLength={20} required className="min-h-32 rounded-xl text-base" placeholder="Esempio: tre esemplari sotto faggio, cappello viscido, lamelle decorrenti…" /></Field>
    <div className="grid gap-5 sm:grid-cols-2"><Field label="Data dell'osservazione"><Input type="date" name="observedAt" required max={new Date().toISOString().slice(0, 10)} className="h-11 rounded-xl text-base" /></Field><Field label="Fotografie" hint="Da 1 a 6 immagini, JPG/PNG/WebP, massimo 12 MB ciascuna."><label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#cddacb] bg-[#f8faf7] px-4 font-bold text-[#315d3c] hover:bg-[#edf4eb]"><Camera className="size-4" /> Scegli foto<input type="file" name="photos" accept="image/jpeg,image/png,image/webp" multiple required className="sr-only" /></label></Field></div>
    <div className="rounded-2xl border border-[#dce5da] bg-[#f5f8f3] p-4"><div className="flex items-center justify-between gap-3"><div><div className="font-black">Coordinate private</div><div className="text-sm text-[#617266]">Non saranno mostrate come punto preciso.</div></div><Button type="button" onClick={locate} variant="outline" className="rounded-xl bg-white"><LocateFixed /> Usa la posizione</Button></div><div className="mt-4 grid grid-cols-2 gap-3"><Field label="Latitudine"><Input name="latitude" inputMode="decimal" required value={coords.latitude} onChange={(event) => setCoords((current) => ({ ...current, latitude: event.target.value }))} className="h-11 rounded-xl text-base" placeholder="44.283100" /></Field><Field label="Longitudine"><Input name="longitude" inputMode="decimal" required value={coords.longitude} onChange={(event) => setCoords((current) => ({ ...current, longitude: event.target.value }))} className="h-11 rounded-xl text-base" placeholder="10.837700" /></Field></div></div>
    <label className="flex items-start gap-3 rounded-xl border border-[#e5d292] bg-[#fff9e8] p-4 text-sm text-[#635520]"><input type="checkbox" required className="mt-1 size-4 accent-[#174f2b]" /><span>Confermo che la segnalazione ha finalità scientifica ed educativa e che non userò l&apos;eventuale identificazione come autorizzazione al consumo.</span></label>
    <Button disabled={status === "sending"} className="h-12 w-full rounded-xl bg-[#174f2b] text-base hover:bg-[#0f3f20]">{status === "sending" ? <><LoaderCircle className="animate-spin" /> Invio in corso…</> : <><Send /> Invia alla verifica</>}</Button>
  </form>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-black text-[#38563f]">{label}</span>{children}{hint && <span className="mt-2 block text-xs leading-relaxed text-[#6b7b70]">{hint}</span>}</label>;
}
