import { profileForSourceLabel } from "./minimum-card-content.ts";
import { minimumCards } from "./minimum-cards.ts";
import type { MinimumGenusCard } from "./minimum-genus-card.ts";
import { minimumGenusTeachingMaps } from "./minimum-genus-map.ts";
import { minimumGenusSourceUnits } from "./minimum-genus-source.ts";

const mapByTeachingUnit = new Map(
  minimumGenusTeachingMaps.map((entry) => [entry.teachingUnitId, entry]),
);

const minimumCardIdByLearningUnit = new Map(
  minimumCards.map((card) => [card.learningUnitId, card.cardId]),
);

function isGenericProfile(profile: ReturnType<typeof profileForSourceLabel>) {
  return profile.terminology.length === 1 &&
    profile.terminology[0] === "Caratteri macroscopici del taxon";
}

function teachingProfile(
  sourceGenera: readonly string[],
  currentGenera: readonly string[],
) {
  for (const genus of [...sourceGenera, ...currentGenera]) {
    const profile = profileForSourceLabel(genus);
    if (!isGenericProfile(profile)) return profile;
  }
  return profileForSourceLabel(sourceGenera[0] ?? currentGenera[0] ?? "Fungi");
}

function safetyFocusForObjective(objective: string) {
  const normalized = objective.toLocaleLowerCase("it");
  const focus: string[] = [];

  if (/mortali|mortale|falloidea|orellanica/.test(normalized)) {
    focus.push(
      "Nel perimetro Minimo sono presenti taxa a rischio potenzialmente mortale: la determinazione deve privilegiare i caratteri discriminanti e le schede figlie di sicurezza.",
    );
  } else if (/tossic|velenos/.test(normalized)) {
    focus.push(
      "Nel gruppo sono presenti taxa tossici: non estendere mai una valutazione alimentare dal genere alle singole specie senza verifica.",
    );
  }

  if (/commestibil/.test(normalized)) {
    focus.push(
      "La presenza di taxa commestibili nel gruppo non autorizza il consumo di esemplari non determinati con certezza.",
    );
  }

  if (/bambin/.test(normalized)) {
    focus.push(
      "S1 segnala possibili richieste in caso di ingestione accidentale da parte di bambini: mantenere distinta la valutazione del rischio dalla determinazione tassonomica.",
    );
  }

  return focus;
}

function essentialSummary(sourceLabel: string, sourceRank: string) {
  return (
    `Riconoscere ${sourceLabel} al livello Essenziale, mantenendo la risoluzione ` +
    `${sourceRank} prevista da S1 e collegando i taxa specifici richiesti alle relative schede Minimo.`
  );
}

function deepeningSummary(sourceLabel: string, hasDesirable: boolean) {
  return hasDesirable
    ? `Approfondire ${sourceLabel} con i taxa e i caratteri indicati da S1 nel livello Auspicabile, senza sovraccaricare la vista Essenziale.`
    : null;
}

function specialistSummary(sourceLabel: string, hasAdvanced: boolean) {
  return hasAdvanced
    ? `Estendere lo studio di ${sourceLabel} agli approfondimenti specialistici previsti da S1, inclusi i caratteri fini necessari nei casi complessi.`
    : null;
}

function taxonomyNotes(sourceGenera: readonly string[], currentGenera: readonly string[]) {
  if (currentGenera.length === 0) {
    return [
      "Il nome didattico S1 resta il riferimento della scheda finché la nomenclatura del genere non viene verificata in un record dedicato.",
    ];
  }

  const same =
    sourceGenera.length === currentGenera.length &&
    sourceGenera.every((genus) => currentGenera.includes(genus));

  if (same) {
    return [
      "I generi correnti dei taxa figli coincidono con il perimetro nominale principale della scheda didattica.",
    ];
  }

  return [
    `La scheda didattica S1 usa ${sourceGenera.join(", ")}; i taxa figli verificati ricadono attualmente in ${currentGenera.join(", ")}.`,
    "Il nome didattico e la nomenclatura corrente restano separati e ricercabili entrambi.",
  ];
}

export const minimumGenusCards: MinimumGenusCard[] =
  minimumGenusSourceUnits.map((source) => {
    const mapping = mapByTeachingUnit.get(source.id);
    if (!mapping) throw new Error(`Missing genus teaching map for ${source.id}`);

    const profile = teachingProfile(mapping.sourceGenera, mapping.currentChildGenera);
    const childCardIds = mapping.childLearningUnitIds.map((learningUnitId) => {
      const cardId = minimumCardIdByLearningUnit.get(learningUnitId);
      if (!cardId) {
        throw new Error(
          `Missing minimum child card for ${source.id}: ${learningUnitId}`,
        );
      }
      return cardId;
    });

    const hasDesirable = source.desirableObjective !== null;
    const hasAdvanced = source.advancedObjective !== null;

    return {
      cardId: `minimum-genus-card-${source.id.replace(/^genus-source-/, "")}`,
      teachingUnitId: source.id,
      sourceLabel: source.sourceLabel,
      sourceRank: source.sourceRank,
      sourcePage: source.sourcePage,
      displayTitle: source.sourceLabel,
      sourceGenera: [...mapping.sourceGenera],
      currentGenera: [...mapping.currentChildGenera],
      minimumChildCardIds: childCardIds,
      essential: {
        objectiveSummary: essentialSummary(source.sourceLabel, source.sourceRank),
        terminology: [...profile.terminology],
        macroCharacters: [...profile.morphology],
        safetyFocus: safetyFocusForObjective(source.minimumObjective),
        claimIds: [`claim-genus-essential-${source.id}`],
      },
      deepening: {
        objectiveSummary: deepeningSummary(source.sourceLabel, hasDesirable),
        discriminatingCharacters: hasDesirable
          ? [
              "Confrontare i caratteri macroscopici dei taxa aggiuntivi con quelli del nucleo Essenziale.",
              "Usare odore, sporata, veli, imenoforo, viraggi e habitat solo quando pertinenti al gruppo in esame.",
            ]
          : [],
        taxonomyNotes: taxonomyNotes(mapping.sourceGenera, mapping.currentChildGenera),
        claimIds: hasDesirable ? [`claim-genus-deepening-${source.id}`] : [],
      },
      specialist: {
        objectiveSummary: specialistSummary(source.sourceLabel, hasAdvanced),
        specialistTopics: hasAdvanced
          ? [
              "Microscopia e caratteri fini quando la determinazione macroscopica non e sufficiente.",
              "Variabilita, delimitazione dei taxa e aggiornamenti nomenclaturali pertinenti al gruppo.",
            ]
          : [],
        claimIds: hasAdvanced ? [`claim-genus-specialist-${source.id}`] : [],
      },
      reviewStatus: "reviewNeeded",
    };
  });
