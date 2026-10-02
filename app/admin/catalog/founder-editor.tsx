"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TaxonOption = { id: string; scientificName: string; commonName: string };
export function FounderEditor() {
  const [taxa, setTaxa] = useState<TaxonOption[]>([]); const [founder, setFounder] = useState(false);
  const [taxonId, setTaxonId] = useState(""); const [fieldPath, setFieldPath] = useState("names.common");
  const [value, setValue] = useState(""); const [sourceCitation, setSourceCitation] = useState(""); const [rationale, setRationale] = useState(""); const [message, setMessage] = useState("");
  useEffect(() => { fetch("/api/admin/atlas").then((r) => r.json() as Promise<{ founder?: boolean; taxa?: TaxonOption[] }>).then((p) => { setFounder(Boolean(p.founder)); setTaxa(p.taxa ?? []); setTaxonId(p.taxa?.[0]?.id ?? ""); }).catch(() => undefined); }, []);
  if (!founder) return null;
  const submit = async () => { setMessage("Salvataggio…"); const response = await fetch("/api/admin/atlas", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taxonId, fieldPath, value, sourceCitation, rationale }) }); const payload = await response.json() as { error?: string; status?: string }; setMessage(response.ok ? payload.status === "submitted" ? "Proposta inviata alla revisione micologica e curatoriale indipendente." : "Modifica pubblicata e registrata nello storico." : payload.error ?? "Errore."); if (response.ok) setValue(""); };
  return <section className="mt-5 rounded-[24px] border border-[#b9cfb8] bg-white p-5 sm:p-7"><h2 className="text-xl font-black">Modifica fondatore-admin</h2><p className="mt-1 text-sm text-[#5c7061]">Ogni modifica richiede fonte e motivazione. Tassonomia e sicurezza passano dalla revisione indipendente prima della pubblicazione.</p><div className="mt-4 grid gap-3 md:grid-cols-2">
    <label className="text-sm font-bold">Taxon<select className="mt-1 h-11 w-full rounded-xl border px-3 font-normal" value={taxonId} onChange={(e) => setTaxonId(e.target.value)}>{taxa.map((t) => <option key={t.id} value={t.id}>{t.scientificName} — {t.commonName}</option>)}</select></label>
    <label className="text-sm font-bold">Campo<select className="mt-1 h-11 w-full rounded-xl border px-3 font-normal" value={fieldPath} onChange={(e) => setFieldPath(e.target.value)}><option value="names.common">Nome volgare</option><option value="taxonomy.acceptedScientificName">Nome scientifico accettato</option><option value="edibility.safetyNote">Nota di sicurezza/commestibilità</option><option value="diagnostics.odor">Odore</option><option value="ecology.association">Habitat/associazione</option></select></label>
    <label className="text-sm font-bold md:col-span-2">Nuovo valore<Input className="mt-1" value={value} onChange={(e) => setValue(e.target.value)} /></label>
    <label className="text-sm font-bold">Fonte verificabile<Input className="mt-1" value={sourceCitation} onChange={(e) => setSourceCitation(e.target.value)} /></label>
    <label className="text-sm font-bold">Motivazione<Input className="mt-1" value={rationale} onChange={(e) => setRationale(e.target.value)} /></label>
  </div><Button className="mt-4 bg-[#174f2b]" onClick={submit}>Salva modifica</Button>{message && <p className="mt-3 text-sm font-bold">{message}</p>}</section>;
}
