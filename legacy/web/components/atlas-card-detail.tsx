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
import {
  publicAuditedFieldProfile,
  publicConfusionWarnings,
  publicDescriptiveCardContent,
  publicSafetySummary,
} from "@/lib/public-scientific-policy";
import { publicGenusLayer } from "@/lib/public-genus-policy";
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

const diagnosticStatusLabels: Record<string, string> = {
  field_high_confidence: "Alta confidenza di campo",
  field_high_confidence_when_typical: "Alta confidenza negli esemplari tipici",
  field_high_confidence_when_host_known: "Alta confidenza con ospite/ecologia noti",
  field_high_confidence_when_young: "Alta confidenza negli esemplari giovani",
  field_high_confidence_at_source_rank: "Alta confidenza al rango S1",
  field_confirmatory: "Campo + conferma fine nei casi dubbi",
  microscopy_required_for_fine_id: "Microscopia per la specie fine",
  dna_confirmatory: "Conferma molecolare per la risoluzione fine",
  defined_morphogroup_s1: "Morfogruppo didattico S1",
  defined_set_s1: "Insieme didattico definito S1",
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
    const publicLayer = genusCard
      ? publicGenusLayer(genusCard, depth)
      : {
          objectiveSummary: view.objectiveSummary,
          bullets: [] as string[],
          taxonomyNotes: [] as string[],
          safetyFocus: [] as string[],
          pendingScientificContent: true,
        };

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
              aria-pressed={depth === entry}
              className={cn(
                "min-h-11 shrink-0 rounded-full border px-3 py-1.5 text-sm font-bold",
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
          {publicLayer.objectiveSummary && (
            <p className="mt-2 break-words leading-relaxed text-[#314d38]">
              {publicLayer.objectiveSummary}
            </p>
          )}
          {publicLayer.pendingScientificContent && (
            <p className="mt-3 rounded-xl border border-[#dce5da] bg-white p-3 text-sm leading-relaxed text-[#52675a]">
              I caratteri descrittivi e le note tassonomiche di questo livello sono in revisione scientifica e restano nascosti nella beta finché non raggiungono lo stato reviewed.
            </p>
          )}
          {publicLayer.bullets.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#52675a]">
              {publicLayer.bullets.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          )}
          {publicLayer.taxonomyNotes.length > 0 && (
            <div className="mt-4 rounded-xl border border-[#dce5da] bg-white p-3 text-sm text-[#52675a]">
              {publicLayer.taxonomyNotes.map((item) => <p key={item} className="mt-1 first:mt-0">{item}</p>)}
            </div>
          )}
          {publicLayer.safetyFocus.length > 0 && (
            <div className="mt-4 rounded-xl border border-[#ead58c] bg-[#fff8dc] p-3 text-sm text-[#67541f]">
              {publicLayer.safetyFocus.map((item) => (
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
  const fieldProfile = publicAuditedFieldProfile(card);
  const descriptive = publicDescriptiveCardContent(card);
  const publicConfusions = publicConfusionWarnings(card);
  const safetySummary = publicSafetySummary(card);

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
      <div className="mt-4 rounded-2xl border border-[#cfe0cc] bg-[#f4f9f2] p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.08em] text-[#54725a]">Scheda rapida scientifica</p>
            <h3 className="mt-1 text-lg font-black">3 caratteri principali + 1 differenziante</h3>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#315d3c] ring-1 ring-[#c8d9c5]">
            {diagnosticStatusLabels[fieldProfile.diagnosticStatus] ?? fieldProfile.diagnosticStatus}
          </span>
        </div>
        <ol className="mt-4 space-y-2">
          {fieldProfile.characters.map((item, index) => (
            <li key={item} className="flex gap-3 rounded-xl bg-white p-3 text-sm leading-relaxed text-[#314d38] ring-1 ring-[#dce7d9]">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#174f2b] text-xs font-black text-white">{index + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
        <div className="mt-2 flex gap-3 rounded-xl border border-[#d8e3d6] bg-white p-3 text-sm leading-relaxed text-[#314d38]">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e9f2e6] text-xs font-black text-[#174f2b]">+1</span>
          <span>{fieldProfile.plusOne}</span>
        </div>
        {fieldProfile.diagnosticNote && (
          <p className="mt-3 text-xs leading-relaxed text-[#607465]">
            <strong>Limite di risoluzione:</strong> {fieldProfile.diagnosticNote}
          </p>
        )}
        {fieldProfile.safetyCheck && (
          <p className="mt-3 flex gap-2 rounded-xl border border-[#e3a6a0] bg-[#fff1ef] p-3 text-sm leading-relaxed text-[#842d26]">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <span><strong>Safety check:</strong> {fieldProfile.safetyCheck}</span>
          </p>
        )}
        <p className="mt-3 text-[11px] font-semibold text-[#718277]">
          {fieldProfile.version} · audit interno {fieldProfile.auditedAt} · revisione micologica indipendente non attestata
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-[#f5f8f3] p-4">
        <h3 className="font-black">Contenuto scientifico esteso</h3>
        {descriptive.pending ? (
          <p className="mt-2 text-sm leading-relaxed text-[#52675a]">
            Contenuti morfologici ed ecologici in revisione scientifica: non vengono pubblicati come fatti finché non raggiungono almeno lo stato reviewed.
          </p>
        ) : (
          <>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {descriptive.terminology.map((item) => (
                <span key={item} className="rounded-full bg-white px-2 py-1 text-xs font-semibold ring-1 ring-[#dce5da]">
                  {item}
                </span>
              ))}
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#52675a]">
              {descriptive.essentialMorphology.map((item) => <li key={item}>• {item}</li>)}
            </ul>
            {descriptive.ecologySummary && (
              <p className="mt-3 text-sm leading-relaxed text-[#52675a]">
                <strong>Ecologia:</strong> {descriptive.ecologySummary}
              </p>
            )}
          </>
        )}
      </div>
      <div className="mt-4 rounded-xl border border-[#ead58c] bg-[#fff8dc] p-3 text-sm text-[#67541f]">
        <strong>Sicurezza:</strong> {safetySummary}
      </div>
      {publicConfusions.length > 0 && (
        <div className="mt-4">
          <h3 className="font-black">Confusioni prioritarie</h3>
          <div className="mt-2 space-y-2">
            {publicConfusions.map((confusion) => (
              <div key={confusion.with} className="rounded-xl border border-[#e0e7de] p-3 text-sm">
                <p className="font-bold">{confusion.with} · rischio {confusion.risk}</p>
                <p className="mt-1 text-[#52675a]">{confusion.context}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {card.confusionWarnings.length > 0 && publicConfusions.length === 0 && (
        <p className="mt-4 text-sm text-[#67541f]">
          Avvisi di confusione in revisione: verranno pubblicati dopo approvazione micologica.
        </p>
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
      <Button type="button" variant="ghost" onClick={onBack} className="-ml-2 h-11 rounded-xl px-2 text-[#315d3c]">
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
