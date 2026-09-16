"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, LoaderCircle, RotateCcw, ShieldAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChangeRow = {
  id: string;
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

export function ReviewClient() {
  const [changes, setChanges] = useState<ChangeRow[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "forbidden" | "error">("loading");
  const [role, setRole] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/admin/catalog/reviews");
      const payload = await response.json() as { changes?: ChangeRow[]; role?: string };
      if (response.status === 403) {
        setStatus("forbidden");
        return;
      }
      if (!response.ok) throw new Error("review queue unavailable");
      setChanges(payload.changes ?? []);
      setRole(payload.role ?? "");
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/catalog/reviews")
      .then(async (response) => {
        const payload = await response.json() as { changes?: ChangeRow[]; role?: string };
        return { response, payload };
      })
      .then(({ response, payload }) => {
        if (!active) return;
        if (response.status === 403) {
          setStatus("forbidden");
          return;
        }
        if (!response.ok) {
          setStatus("error");
          return;
        }
        setChanges(payload.changes ?? []);
        setRole(payload.role ?? "");
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  async function decide(changeSetId: string, decision: "approve" | "reject" | "requestChanges") {
    setBusyId(changeSetId);
    try {
      const response = await fetch("/api/admin/catalog/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changeSetId, decision, notes: notes[changeSetId] ?? "" }),
      });
      if (!response.ok) throw new Error("decision failed");
      await load();
    } catch {
      setStatus("error");
    } finally {
      setBusyId(null);
    }
  }

  if (status === "loading") {
    return <div className="mt-5 flex min-h-48 items-center justify-center gap-2 rounded-[22px] border bg-white font-bold text-[#46614d]"><LoaderCircle className="size-5 animate-spin" /> Carico le revisioni</div>;
  }
  if (status === "forbidden") {
    return <div className="mt-5 rounded-[22px] border border-[#e5c985] bg-[#fff8dc] p-6 text-[#67541f]"><ShieldAlert className="size-7" /><h2 className="mt-3 text-xl font-black">Incarico non configurato</h2><p className="mt-2">Un amministratore deve assegnarti almeno una regione e un gruppo tassonomico.</p></div>;
  }
  if (status === "error") {
    return <div className="mt-5 rounded-[22px] border border-[#e3a6a0] bg-[#fff1ef] p-6 text-[#842d26]"><h2 className="text-xl font-black">Coda non disponibile</h2><Button type="button" variant="outline" onClick={() => void load()} className="mt-4 rounded-xl"><RotateCcw /> Riprova</Button></div>;
  }

  return (
    <section className="mt-5 min-w-0">
      <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-[#5d7362]">{changes.length} proposte nel tuo ambito</p>
        <span className="rounded-full bg-[#e5efe2] px-3 py-1 text-xs font-black text-[#315d3c]">{role === "scientificCurator" ? "Curatore scientifico" : "Micologo"}</span>
      </div>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        {changes.map((change) => {
          const parsed = safeJson(change.proposedValueJson);
          return (
            <article key={change.id} className="min-w-0 rounded-[22px] border border-[#dbe4d9] bg-white p-5 shadow-[0_12px_40px_rgba(23,79,43,0.06)]">
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="break-words text-sm font-bold text-[#617266]">{change.proposalKind === "create" ? "Nuovo taxon" : change.targetTaxonId}</p>
                  <h2 className="mt-1 break-words text-lg font-black">{change.fieldPath}</h2>
                </div>
                <span className={change.criticality === "critical" ? "rounded-full bg-[#fff0c7] px-2.5 py-1 text-xs font-black text-[#805300]" : "rounded-full bg-[#e9f2e7] px-2.5 py-1 text-xs font-black text-[#315d3c]"}>
                  {change.criticality === "critical" ? "Revisione rafforzata" : "Ordinaria"}
                </span>
              </div>
              <dl className="mt-4 min-w-0 space-y-3 text-sm">
                <ReviewValue label="Valore proposto" value={parsed} />
                <ReviewValue label="Motivazione" value={change.rationale} />
                <ReviewValue label="Fonte" value={change.sourceCitation} />
                <ReviewValue label="Ambito" value={[change.regionScope, change.taxonomicScope].filter(Boolean).join(" · ") || "Nazionale / non specificato"} />
                <ReviewValue label="Autore" value={change.authorName || "Utente registrato"} />
              </dl>
              <Textarea value={notes[change.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [change.id]: event.target.value }))} className="mt-4 min-h-20 rounded-xl text-base" placeholder="Nota della revisione" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Button type="button" disabled={busyId === change.id} onClick={() => void decide(change.id, "approve")} className="min-h-11 rounded-xl bg-[#174f2b] px-2"><Check /> <span className="hidden sm:inline">Approva</span></Button>
                <Button type="button" disabled={busyId === change.id} onClick={() => void decide(change.id, "requestChanges")} variant="outline" className="min-h-11 rounded-xl px-2"><RotateCcw /> <span className="hidden sm:inline">Correggi</span></Button>
                <Button type="button" disabled={busyId === change.id} onClick={() => void decide(change.id, "reject")} variant="outline" className="min-h-11 rounded-xl border-[#dfaaa6] px-2 text-[#8a312b]"><X /> <span className="hidden sm:inline">Respingi</span></Button>
              </div>
            </article>
          );
        })}
        {changes.length === 0 && <div className="rounded-[22px] border border-dashed border-[#cbd8c9] bg-white p-8 text-center text-[#617266] lg:col-span-2">Nessuna proposta in attesa nel tuo ambito.</div>}
      </div>
    </section>
  );
}

function safeJson(value: string) {
  try {
    const parsed = JSON.parse(value) as { value?: string; scientificName?: string; rank?: string };
    return [parsed.scientificName, parsed.rank, parsed.value].filter(Boolean).join(" · ");
  } catch {
    return value;
  }
}

function ReviewValue({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-xs font-black uppercase tracking-wide text-[#6d7e72]">{label}</dt><dd className="mt-1 break-words leading-relaxed text-[#314d38]">{value}</dd></div>;
}
