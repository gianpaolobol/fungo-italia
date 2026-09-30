import { CircleAlert, ExternalLink, Leaf, Utensils } from "lucide-react";

import { SporePrint } from "@/components/spore-print";
import type { SummaryCard } from "@/lib/summary-cards";

const rankLabels: Record<string, string> = {
  species: "Specie",
  speciesGroup: "Gruppo di specie",
  aggregate: "Aggregato",
  section: "Sezione",
  subsection: "Sottosezione",
  subgenus: "Sottogenere",
  genus: "Genere",
  family: "Famiglia",
  operationalGroup: "Gruppo didattico",
  group: "Gruppo",
  subspecies: "Sottospecie",
  variety: "Varietà",
};

const edibilityLabels: Record<string, string> = {
  commestibile: "Commestibile",
  "commestibile-dopo-trattamento": "Dopo trattamento",
  sconsigliato: "Sconsigliato",
  "non-commestibile": "Non commestibile",
  tossico: "Tossico",
  "senza-valore": "Privo di valore alimentare",
  mixed: "Stati diversi nel gruppo",
  "non-valutato": "Non valutato",
};

export function SummaryCardShell({
  card,
  onOpenAtlas,
}: {
  card: SummaryCard;
  onOpenAtlas?: (atlasId: string) => void;
}) {
  const p = card.presentation;

  return (
    <article className="overflow-hidden rounded-[26px] border border-[#cfd9cd] bg-[#fbfaf4] text-[#17251b] shadow-[0_18px_55px_rgba(27,55,34,0.08)]">
      <header className="grid gap-3 border-b border-[#d9dfd5] p-5 sm:grid-cols-[1fr_auto] sm:p-6">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#68796d]">
            {rankLabels[card.rank] ?? card.rank}
          </p>
          <h2 className="mt-1 break-words font-serif text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
            {card.displayCommonName}
          </h2>
          <p className="mt-1 break-words font-serif text-xl italic text-[#31553b]">
            {card.scientificName}
          </p>
        </div>
        <div className="text-xs leading-relaxed text-[#5c6c61] sm:text-right">
          <div>{card.classification.division}</div>
          <div>{card.classification.order}</div>
          <div>{card.classification.family ?? "Famiglia in revisione"}</div>
        </div>
      </header>

      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_220px]">
        <section className="min-h-72 overflow-hidden rounded-[22px] border border-[#dde4da] bg-[#f4f1e8]">
          {p.primaryImageUrl ? (
            <img
              src={p.primaryImageUrl}
              alt={`${card.displayCommonName} — ${card.scientificName}`}
              className="h-full min-h-72 w-full object-cover"
            />
          ) : (
            <div className="grid min-h-72 place-items-center p-8 text-center text-[#6d7d70]">
              <div>
                <Leaf className="mx-auto size-10" />
                <p className="mt-3 font-black">Immagine in preparazione</p>
                <p className="mt-1 text-sm">La Scheda resta collegata all’Atlante senza inventare contenuti visuali.</p>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-3">
          {p.detailImageUrls.length > 0 ? (
            p.detailImageUrls.slice(0, 2).map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`Dettaglio diagnostico ${index + 1} di ${card.displayCommonName}`}
                className="aspect-square w-full rounded-full border border-[#cbd6c8] object-cover"
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[#cbd6c8] p-4 text-sm text-[#6d7d70]">
              Dettagli diagnostici in preparazione
            </div>
          )}
          {p.representativeTaxon && (
            <div className="rounded-2xl border border-[#d8e3d6] bg-white p-3 text-sm leading-relaxed">
              <strong>Specie rappresentativa:</strong> {p.representativeTaxon}
            </div>
          )}
        </aside>
      </div>

      <div className="grid gap-2 border-t border-[#d9dfd5] p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-5">
        <InfoBox title="Habitat">
          <p>{p.habitatSummary ?? "In preparazione"}</p>
        </InfoBox>
        <InfoBox title="Stagione">
          <p>{p.seasonSummary ?? "In preparazione"}</p>
        </InfoBox>
        <InfoBox title="Commestibilità">
          <Utensils className="mb-2 size-7 text-[#5d735e]" />
          <p>{edibilityLabels[card.edibility] ?? card.edibility}</p>
        </InfoBox>
        <InfoBox title="Sporata">
          <SporePrint token={p.sporePrint} size="sm" className="mx-auto" />
        </InfoBox>
        <InfoBox title="Caratteri chiave">
          {p.diagnosticCharacters ? (
            <ol className="space-y-1.5">
              {p.diagnosticCharacters.map((item, index) => (
                <li key={item} className="flex gap-2">
                  <span className="font-black text-[#315d3c]">{index + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
              {p.differentiatingCharacter && (
                <li className="flex gap-2">
                  <span className="font-black text-[#315d3c]">+1</span>
                  <span>{p.differentiatingCharacter}</span>
                </li>
              )}
            </ol>
          ) : (
            <p>3+1 in preparazione</p>
          )}
        </InfoBox>
      </div>

      {card.reviewStatus !== "ready" && (
        <div className="mx-4 mb-4 flex gap-2 rounded-2xl border border-[#ead58c] bg-[#fff8dc] p-3 text-sm text-[#67541f] sm:mx-6 sm:mb-6">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <span>Scheda sintetica {card.reviewStatus === "source-gap" ? "con fonte insufficiente" : "in preparazione"}.</span>
        </div>
      )}

      {onOpenAtlas && (
        <div className="border-t border-[#d9dfd5] p-4 sm:p-6">
          <button
            type="button"
            onClick={() => onOpenAtlas(card.atlasTarget.id)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#a9bca8] bg-white px-4 font-bold text-[#315d3c]"
          >
            Apri nell’Atlante
            <ExternalLink className="size-4" />
          </button>
        </div>
      )}
    </article>
  );
}

function InfoBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#d8e0d5] bg-white p-3 text-sm leading-relaxed">
      <h3 className="mb-2 font-black text-[#315d3c]">{title}</h3>
      {children}
    </section>
  );
}
