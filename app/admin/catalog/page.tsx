import { ArrowLeft, ClipboardCheck } from "lucide-react";
import Link from "next/link";

import { requireChatGPTUser } from "@/app/chatgpt-auth";

import { ReviewClient } from "./review-client";

export const dynamic = "force-dynamic";

export default async function CatalogReviewPage() {
  await requireChatGPTUser("/admin/catalog");

  return (
    <main className="min-h-screen max-w-full overflow-x-hidden bg-[#f4f7f2] px-3 py-4 text-[#14261a] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 py-2 font-bold text-[#315d3c] hover:text-[#173f25]">
          <ArrowLeft className="size-4" />
          Torna al catalogo
        </Link>
        <header className="mt-2 min-w-0 rounded-[24px] border border-[#dbe4d9] bg-white p-5 shadow-[0_18px_60px_rgba(23,79,43,0.08)] sm:p-7">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e5efe2] text-[#205d34]">
              <ClipboardCheck className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#607365]">Area micologi</p>
              <h1 className="break-words text-2xl font-black tracking-[-0.04em] sm:text-3xl">Revisioni del catalogo</h1>
              <p className="mt-2 max-w-3xl leading-relaxed text-[#5c7061]">
                Vedi soltanto le proposte comprese nelle regioni e nei gruppi tassonomici assegnati. Le decisioni restano nel registro storico.
              </p>
            </div>
          </div>
        </header>
        <ReviewClient />
      </div>
    </main>
  );
}
