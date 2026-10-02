"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, Send, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { classifyCriticality } from "@/lib/catalog-proposal";
import type { Taxon } from "@/lib/domain";

const ranks = [
  "family", "genus", "subgenus", "section", "subsection", "speciesGroup",
  "aggregate", "species", "subspecies", "variety", "operationalGroup",
];

const fields = [
  ["names.common", "Nome comune nazionale"],
  ["names.regional", "Nome regionale o locale"],
  ["ecology.habitat", "Habitat"],
  ["ecology.association", "Associazione con pianta, fungo o substrato"],
  ["phenology.profile", "Periodo di crescita"],
  ["geography.profile", "Distribuzione geografica o quota"],
  ["taxonomy.acceptedScientificName", "Nome scientifico o sinonimia"],
  ["taxonomy.rank", "Rango tassonomico"],
  ["edibility.category", "Categoria di commestibilità"],
  ["edibility.treatment", "Trattamento alimentare"],
  ["safety.confusion.high", "Confusione ad alto rischio"],
] as const;

export function ProposalForm({ taxa }: { taxa: Taxon[] }) {
  const [proposalKind, setProposalKind] = useState<"update" | "create">("update");
  const [fieldPath, setFieldPath] = useState("names.regional");
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const criticality = useMemo(
    () => proposalKind === "create" ? "critical" : classifyCriticality([fieldPath]),
    [fieldPath, proposalKind],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors([]);
    setStatus("sending");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/catalog/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json() as { errors?: string[]; error?: string };
      if (!response.ok) {
        setErrors(result.errors ?? [result.error ?? "Invio non riuscito."]);
        setStatus("idle");
        return;
      }
      setStatus("success");
    } catch {
      setErrors(["Connessione interrotta. I dati sono ancora nel modulo: riprova."]);
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-7 rounded-2xl border border-[#a8d3ad] bg-[#edf8ec] p-6 text-center">
        <CheckCircle2 className="mx-auto size-11 text-[#22703a]" />
        <h2 className="mt-3 text-xl font-black">Proposta inviata</h2>
        <p className="mt-2 text-[#506757]">È registrata nella coda di revisione con fonte, motivazione e autore.</p>
        <Button asChild className="mt-5 rounded-xl bg-[#174f2b]"><Link href="/">Torna al catalogo</Link></Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 min-w-0 space-y-5">
      {errors.length > 0 && (
        <div role="alert" className="rounded-xl border border-[#e3a6a0] bg-[#fff1ef] p-4 text-sm text-[#842d26]">
          <div className="font-black">Controlla questi dati</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">{errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Choice active={proposalKind === "update"} onClick={() => setProposalKind("update")} label="Modifica scheda" />
        <Choice active={proposalKind === "create"} onClick={() => setProposalKind("create")} label="Nuovo taxon" />
      </div>
      <input type="hidden" name="proposalKind" value={proposalKind} />
      {proposalKind === "update" ? (
        <Field label="Scheda da modificare">
          <NativeSelect name="targetTaxonId" required className="h-12 w-full rounded-xl text-base">
            <NativeSelectOption value="">Seleziona taxon</NativeSelectOption>
            {taxa.map((taxon) => <NativeSelectOption key={taxon.id} value={taxon.id}>{taxon.commonName} · {taxon.scientificName}</NativeSelectOption>)}
          </NativeSelect>
        </Field>
      ) : (
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <Field label="Nome scientifico proposto"><Input name="proposedScientificName" required className="h-12 rounded-xl text-base" /></Field>
          <Field label="Rango">
            <NativeSelect name="proposedRank" required className="h-12 w-full rounded-xl text-base">
              <NativeSelectOption value="">Seleziona rango</NativeSelectOption>
              {ranks.map((rank) => <NativeSelectOption key={rank} value={rank}>{rank}</NativeSelectOption>)}
            </NativeSelect>
          </Field>
        </div>
      )}
      <Field label="Campo interessato">
        <NativeSelect name="fieldPath" value={proposalKind === "create" ? "taxonomy.create" : fieldPath} disabled={proposalKind === "create"} onChange={(event) => setFieldPath(event.target.value)} className="h-12 w-full rounded-xl text-base">
          {proposalKind === "create" && <NativeSelectOption value="taxonomy.create">Creazione del taxon</NativeSelectOption>}
          {proposalKind === "update" && fields.map(([value, label]) => <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>)}
        </NativeSelect>
        {proposalKind === "create" && <input type="hidden" name="fieldPath" value="taxonomy.create" />}
      </Field>
      {proposalKind === "update" && (
        <Field label="Nuovo valore" hint="Conserva eventuali diciture s.l., s.str., gr., agg. o sect.">
          <Textarea name="proposedValue" required className="min-h-24 rounded-xl text-base" />
        </Field>
      )}
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <Field label="Regione o area interessata"><Input name="regionScope" className="h-12 rounded-xl text-base" placeholder="Es. Basilicata o tutta Italia" /></Field>
        <Field label="Gruppo tassonomico"><Input name="taxonomicScope" className="h-12 rounded-xl text-base" placeholder="Es. Russulaceae" /></Field>
      </div>
      <Field label="Motivazione" hint="Spiega cosa va aggiunto o corretto e perché.">
        <Textarea name="rationale" minLength={20} required className="min-h-28 rounded-xl text-base" />
      </Field>
      <Field label="Fonte verificabile" hint="Titolo, autore, edizione, pagina, URL o riferimento del campione.">
        <Textarea name="sourceCitation" minLength={6} required className="min-h-24 rounded-xl text-base" />
      </Field>
      {criticality === "critical" && (
        <div className="flex min-w-0 gap-3 rounded-xl border border-[#e6c35b] bg-[#fff8dc] p-4 text-sm text-[#67541f]">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" />
          <span>Modifica scientifica critica: servirà una revisione curatoriale indipendente oltre alla verifica micologica.</span>
        </div>
      )}
      <Button disabled={status === "sending"} className="h-12 w-full rounded-xl bg-[#174f2b] text-base hover:bg-[#0f3f20]">
        {status === "sending" ? <><LoaderCircle className="animate-spin" /> Invio in corso…</> : <><Send /> Invia alla revisione</>}
      </Button>
    </form>
  );
}

function Choice({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} className={active ? "min-h-12 rounded-xl border border-[#174f2b] bg-[#174f2b] px-3 font-bold text-white" : "min-h-12 rounded-xl border border-[#cad8c8] bg-white px-3 font-bold text-[#45604c]"}>{label}</button>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block min-w-0"><span className="mb-2 block text-sm font-black text-[#38563f]">{label}</span>{children}{hint && <span className="mt-2 block text-xs leading-relaxed text-[#6b7b70]">{hint}</span>}</label>;
}
