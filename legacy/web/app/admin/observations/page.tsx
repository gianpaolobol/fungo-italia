import Link from "next/link";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { ObservationReviewClient } from "./review-client";

export const dynamic = "force-dynamic";
export default async function ObservationReviewPage() {
  await requireChatGPTUser("/admin/observations");
  return (
    <main className="min-h-screen max-w-full overflow-x-hidden bg-[#f4f7f2] px-3 py-5 text-[#14261a] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <nav className="flex flex-wrap gap-3" aria-label="Navigazione revisioni">
          <Link className="inline-flex min-h-11 items-center font-bold underline" href="/">Torna all’app</Link>
          <Link className="inline-flex min-h-11 items-center font-bold underline" href="/admin/catalog">Revisioni del catalogo</Link>
          <Link className="inline-flex min-h-11 items-center font-bold underline" href="/observations">Le mie osservazioni</Link>
        </nav>
        <header className="my-4 rounded-2xl border border-[#dbe4d9] bg-white p-5">
          <p className="text-sm font-bold text-[#52675a]">Area micologi</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">Revisioni delle osservazioni</h1>
          <p className="mt-3 leading-relaxed">Esamina fotografie e caratteri documentati, indica i limiti della determinazione o richiedi altre evidenze. Vedi soltanto il materiale nel tuo incarico; le coordinate precise restano private.</p>
          <p className="mt-3 rounded-xl bg-[#fff8dc] p-3 text-sm">La revisione documentale non autorizza la raccolta o il consumo. L’autore non può revisionare la propria osservazione.</p>
        </header>
        <ObservationReviewClient />
      </div>
    </main>
  );
}
