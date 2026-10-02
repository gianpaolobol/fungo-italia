import { ArrowLeft, Camera, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { ObservationForm } from "./observation-form";
import { studyAtlasTaxa } from "@/lib/study-atlas-catalog";

export const dynamic = "force-dynamic";

export default async function NewObservationPage() {
  await requireChatGPTUser("/observations/new");

  return (
    <main className="min-h-screen bg-[#f4f7f2] px-4 py-5 text-[#14261a] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 rounded-lg px-1 py-2 font-bold text-[#315d3c] hover:text-[#173f25]"><ArrowLeft className="size-4" /> Torna alla mappa</Link>
        <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
          <section className="rounded-[26px] border border-[#dbe4d9] bg-white p-5 shadow-[0_18px_60px_rgba(23,79,43,0.08)] sm:p-8">
            <div className="flex items-start gap-4 border-b border-[#e2e9e0] pb-6"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e5efe2] text-[#205d34]"><Camera className="size-6" /></div><div><p className="text-sm font-bold text-[#607365]">Contributo alla banca dati</p><h1 className="text-3xl font-black tracking-[-0.04em]">Segnala una specie</h1><p className="mt-2 max-w-2xl leading-relaxed text-[#5c7061]">Inserisci fotografie, caratteri osservati e coordinate. Il punto esatto resta privato e la segnalazione resta privata durante la verifica.</p></div></div>
            <ObservationForm taxa={studyAtlasTaxa} />
          </section>
          <aside className="space-y-4">
            <div className="rounded-[22px] border border-[#dbe4d9] bg-[#eaf2e7] p-5"><ShieldCheck className="size-7 text-[#255f37]" /><h2 className="mt-3 text-lg font-black">Coordinate protette</h2><p className="mt-2 text-sm leading-relaxed text-[#546b59]">Il punto preciso resta protetto. I revisori ricevono un contesto geografico aggregato; questa versione non pubblica le osservazioni sulla mappa.</p></div>
            <div className="rounded-[22px] border border-[#ead58c] bg-[#fff8dc] p-5"><h2 className="font-black text-[#6b5418]">Fotografie utili</h2><ul className="mt-3 space-y-2 text-sm text-[#675821]"><li>• esemplare intero nel suo ambiente</li><li>• cappello visto dall&apos;alto</li><li>• imenoforo: lamelle, pori o aculei</li><li>• gambo completo e base</li><li>• sezione e viraggi, quando opportuno</li></ul></div>
          </aside>
        </div>
      </div>
    </main>
  );
}
