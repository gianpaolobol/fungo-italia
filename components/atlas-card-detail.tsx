"use client";

import { ChevronLeft, CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  availableGenusDepths,
  findGenusCardViewModel,
} from "@/lib/atlas-genus-view";
import type {
  AtlasDepth,
  AtlasSelectionKind,
} from "@/lib/atlas-navigation-state";
import { minimumCards } from "@/lib/minimum-cards";
import { minimumGenusCards } from "@/lib/minimum-genus-cards";
import { cn } from "@/lib/utils";

type AtlasCardDetailProps = {
  selectedKind: AtlasSelectionKind;
  selectedId: string;
  depth: AtlasDepth;
  hasReturnContext: boolean;
  onDepthChange: (depth: AtlasDepth) => void;
  onChildOpen: (parentCardId: string, childCardId: string) => void;
  onBack: () => void;
};

const depthLabels: Record<AtlasDepth, string> = {
  essential: "Essenziale",
  deepening: "Approfondimento",
  specialist: "Specialistico",
};

export function AtlasCardDetail({
  selectedKind,
  selectedId,
  depth,
  hasReturnContext,
  onDepthChange,
  onChildOpen,
  onBack,
}: AtlasCardDetailProps) {
  if (selectedKind === "teachingGroup") {
    const view = findGenusCardViewModel(selectedId, depth);
    if (!view) return <MissingCard onBack={onBack} />;

    const genusCard = minimumGenusCards.find((entry) => entry.cardId === selectedId);
    const available = genusCard
      ? availableGenusDepths(genusCard)
      : ["essential" as const];

    return (
      <article className="min-w-0 rounded-[22px] border border-[#dce5da] bg-white p-4 shadow-[0_18px_60px_rgba(23,79,43,0.08)] sm:p-5">
        <Header
          title={view.displayTitle}
          subtitle={view.sourceRank === "genus" ? "Genere didattico" : "Gruppo didattico"}
          onBack={onBack}
          backLabel={hasReturnContext ? "Torna al gruppo precedente" : "Torna ai risultati"}
        />

        <div className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-1">
          {available.map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => onDepthChange(entry)}
              className={cn(
                "min-h-10 shrink-0 rounded-full border px-3 py-1.5 text-sm font-bold",
                depth === entry
                  ? "border-[#174f2b] bg-[#174f2b] text-white"
                  : "border-[#cfdccc] bg-white text-[#315d3c]",
              )}
            >
              {depthLabels[entry]}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-[#f5f8f3] p-4">
          <p className="text-xs font-black uppercase tracking-wide text-[#67806c]">
            {view.sectionTitle}
          </p>
          {view.objectiveSummary && (
            <p className="mt-2 break-words leading-relaxed text-[#314d38]">
              {view.objectiveSummary}
            </p>
          )}
          {view.bullets.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#52675a]">
              {view.bullets.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          )}
          {view.taxonomyNotes.length > 0 && (
            <div className="mt-4 rounded-xl border border-[#dce5da] bg-white p-3 text-sm text-[#52675a]">
              {view.taxonomyNotes.map((item) => <p key={item} className="mt-1 first:mt-0">{item}</p>)}
            </div>
          )}
          {view.safetyFocus.length > 0 && (
            <div className="mt-4 rounded-xl border border-[#ead58c] bg-[#fff8dc] p-3 text-sm text-[#67541f]">
              {view.safetyFocus.map((item) => (
                <p key={item} className="mt-1 flex gap-2 first:mt-0">
                  <CircleAlert className="mt-0.5 size-4 shrink-0" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        {view.minimumChildCardIds.length > 0 && (
          <div className="mt-5">
            <h3 className="font-black">Taxa Minimo collegati</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {view.minimumChildCardIds.map((childId) => {
                const child = minimumCards.find((card) => card.cardId === childId);
                if (!child) return null;
                return (
                  <button
                    key={child.cardId}
                    type="button"
                    onClick={() => onChildOpen(view.cardId, child.cardId)}
                    className="min-h-12 rounded-xl border border-[#d8e3d6] bg-[#fbfcfa] p-3 text-left hover:border-[#98b29c]"
                  >
                    <span className="block break-words font-bold">{child.displayName}</span>
                    <span className="mt-1 block text-xs text-[#66786b]">{child.rank}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-[#708076]">
          Fonte didattica S1, pagina {view.sourcePage}. Stato: {view.reviewStatus}.
        </p>
      </article>
    );
  }

  const card = minimumCards.find((entry) => entry.cardId === selectedId);
  if (!card) return <MissingCard onBack={onBack} />;

  return (
    <article className="min-w-0 rounded-[22px] border border-[#dce5da] bg-white p-4 shadow-[0_18px_60px_rgba(23,79,43,0.08)] sm:p-5">
      <Header
        title={card.displayName}
        subtitle={card.rank}
        onBack={onBack}
        backLabel={hasReturnContext ? "Torna al genere / gruppo" : "Torna ai risultati"}
      />
      {card.sourceLabel !== card.displayName && (
        <p className="mt-3 text-sm text-[#5f7064]">S1: {card.sourceLabel}</p>
      )}
      <div className="mt-4 rounded-2xl bg-[#f5f8f3] p-4">
        <h3 className="font-black">Caratteri essenziali</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {card.terminology.map((item) => (
            <span key={item} className="rounded-full bg-white px-2 py-1 text-xs font-semibold ring-1 ring-[#dce5da]">
              {item}
            </span>
          ))}
        </div>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#52675a]">
          {card.essentialMorphology.map((item) => <li key={item}>• {item}</li>)}
        </ul>
        {card.ecologySummary && (
          <p className="mt-3 text-sm leading-relaxed text-[#52675a]">
            <strong>Ecologia:</strong> {card.ecologySummary}
          </p>
        )}
      </div>
      <div className="mt-4 rounded-xl border border-[#ead58c] bg-[#fff8dc] p-3 text-sm text-[#67541f]">
        <strong>Sicurezza:</strong> {card.safetySummary}
      </div>
      {card.confusionWarnings.length > 0 && (
        <div className="mt-4">
          <h3 className="font-black">Confusioni prioritarie</h3>
          <div className="mt-2 space-y-2">
            {card.confusionWarnings.map((confusion) => (
              <div key={confusion.with} className="rounded-xl border border-[#e0e7de] p-3 text-sm">
                <p className="font-bold">{confusion.with} · rischio {confusion.risk}</p>
                <p className="mt-1 text-[#52675a]">{confusion.context}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-[#708076]">Stato: {card.reviewStatus}.</p>
    </article>
  );
}

function Header({
  title,
  subtitle,
  onBack,
  backLabel,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  backLabel: string;
}) {
  return (
    <div className="min-w-0">
      <Button type="button" variant="ghost" onClick={onBack} className="-ml-2 h-10 rounded-xl px-2 text-[#315d3c]">
        <ChevronLeft />
        {backLabel}
      </Button>
      <p className="mt-2 text-xs font-black uppercase tracking-wide text-[#66806d]">{subtitle}</p>
      <h2 className="mt-1 break-words text-2xl font-black tracking-[-0.03em]">{title}</h2>
    </div>
  );
}

function MissingCard({ onBack }: { onBack: () => void }) {
  return (
    <div className="rounded-[22px] border border-dashed border-[#cbd8c9] bg-white p-6 text-center">
      <p className="font-bold text-[#617266]">Scheda non disponibile.</p>
      <Button type="button" variant="outline" onClick={onBack} className="mt-3 rounded-xl">
        Torna ai risultati
      </Button>
    </div>
  );
}
