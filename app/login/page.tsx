import { Leaf, ShieldCheck } from "lucide-react";

import { safeRelativeReturnPath } from "@/app/chatgpt-auth";
import { LoginClient } from "./login-client";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeRelativeReturnPath(params.return_to ?? "/");

  return (
    <main className="min-h-screen bg-[#f4f7f2] px-4 py-8 text-[#14261a]">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:py-16">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe0ca] bg-white px-3 py-1.5 text-sm font-bold text-[#315d3c]">
            <Leaf className="size-4" />
            Beta privata
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">
            Fungo Italia
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#59705e]">
            Atlante micologico progressivo, osservazioni private e workflow scientifico per lo studio e la consultazione sul campo.
          </p>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#dbe4d9] bg-[#eaf2e7] p-4 text-sm text-[#46624e]">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#255f37]" />
            <p>Le schede scientifiche e i contenuti di sicurezza restano soggetti a revisione indipendente.</p>
          </div>
        </section>

        <section className="rounded-[26px] border border-[#dbe4d9] bg-white p-5 shadow-[0_18px_60px_rgba(23,79,43,0.10)] sm:p-7">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#65806b]">Accesso</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">Entra nella beta</h2>
          </div>
          <LoginClient returnTo={returnTo} />
        </section>
      </div>
    </main>
  );
}
