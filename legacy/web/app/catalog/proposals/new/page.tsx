import { ArrowLeft, BookPlus, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { studyAtlasTaxa } from "@/lib/study-atlas-catalog";

import { ProposalForm } from "./proposal-form";

export const dynamic = "force-dynamic";

export default async function NewCatalogProposalPage() {
  await requireChatGPTUser("/catalog/proposals/new");

  return (
    <main className="min-h-screen max-w-full overflow-x-hidden bg-[#f4f7f2] px-3 py-4 text-[#14261a] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 py-2 font-bold text-[#315d3c] hover:text-[#173f25]">
          <ArrowLeft className="size-4" />
          Torna al catalogo
        </Link>
        <div className="mt-2 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0 rounded-[24px] border border-[#dbe4d9] bg-white p-4 shadow-[0_18px_60px_rgba(23,79,43,0.08)] sm:p-8">
            <div className="flex min-w-0 items-start gap-3 border-b border-[#e2e9e0] pb-5 sm:gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e5efe2] text-[#205d34] sm:size-12">
                <BookPlus className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#607365]">Catalogo collaborativo</p>
                <h1 className="break-words text-2xl font-black tracking-[-0.04em] sm:text-3xl">Proponi un taxon o una modifica</h1>
                <p className="mt-2 leading-relaxed text-[#5c7061]">
                  La proposta non cambia subito la scheda pubblica: viene conservata con fonte e motivazione e inviata ai micologi competenti.
                </p>
              </div>
            </div>
            <ProposalForm taxa={studyAtlasTaxa} />
          </section>
          <aside className="min-w-0 space-y-4">
            <div className="rounded-[22px] border border-[#dbe4d9] bg-[#eaf2e7] p-5">
              <ShieldCheck className="size-7 text-[#255f37]" />
              <h2 className="mt-3 text-lg font-black">Nessuna falsa precisione</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#546b59]">
                Se la fonte lavora a livello di genere, sezione o gruppo, usa lo stesso rango. Non trasformarlo in una specie presunta.
              </p>
            </div>
            <div className="rounded-[22px] border border-[#ead58c] bg-[#fff8dc] p-5 text-sm leading-relaxed text-[#675821]">
              Tassonomia, commestibilità, tossicità e confusioni ad alto rischio richiedono una seconda revisione curatoriale indipendente.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
