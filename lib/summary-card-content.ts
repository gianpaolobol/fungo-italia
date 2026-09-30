import type { SummaryCardPresentation } from "./summary-cards";

export type ReviewedSummaryCardContent = {
  displayCommonName: string;
  reviewedAt: string;
  presentation: SummaryCardPresentation;
};

/**
 * Lotto S1 — first reviewed edible cards.
 *
 * IMPORTANT:
 * - keys are Atlas IDs;
 * - this file only adds presentation data;
 * - scientific identity, rank and edibility continue to come from Atlas;
 * - 3+1 characters are taken from the reviewed field baseline or from the
 *   corresponding approved taxonomic group when explicitly applicable.
 */
export const reviewedSummaryCardContent: Readonly<
  Record<string, ReviewedSummaryCardContent>
> = {
  "atlas-cantharellus-cibarius": {
    displayCommonName: "Galletti",
    reviewedAt: "2026-09-30",
    presentation: {
      primaryImageUrl: "/schede/s1/galletti.webp",
      detailImageUrls: [],
      habitatSummary:
        "Boschi di latifoglie e conifere, dal livello del mare alla montagna; frequente con castagno, querce e faggio.",
      seasonSummary: "Da maggio a novembre.",
      diagnosticCharacters: [
        "Imenoforo a pliche ottuse, carnose, forcate e decorrenti: non vere lamelle.",
        "Basidioma giallo o giallo-arancio, con cappello e gambo continui.",
        "Gambo pieno e carne compatta.",
      ],
      differentiatingCharacter:
        "Odore frequentemente fruttato, spesso ricordante l’albicocca.",
      sporePrint: "pale-yellow",
      representativeTaxon: null,
    },
  },

  "atlas-lactarius-deliciosus": {
    displayCommonName: "Sanguinelli",
    reviewedAt: "2026-09-30",
    presentation: {
      primaryImageUrl: "/schede/s1/sanguinelli.webp",
      detailImageUrls: [],
      habitatSummary:
        "Simbionte dei pini; cresce isolato o in gruppi nei boschi e nelle pinete.",
      seasonSummary: "Dall’estate all’autunno.",
      diagnosticCharacters: [
        "Latice arancio che compare alla rottura di lamelle e carne.",
        "Cappello arancio con zonature concentriche, spesso macchiante di verde con l’età.",
        "Gambo arancio con tipiche scrobicolature depresse.",
      ],
      differentiatingCharacter:
        "Carne e superfici lesionate possono assumere gradualmente tonalità verdastre.",
      sporePrint: "cream",
      representativeTaxon: null,
    },
  },

  "atlas-amanita-caesarea": {
    displayCommonName: "Ovuli buoni",
    reviewedAt: "2026-09-30",
    presentation: {
      primaryImageUrl: "/schede/s1/ovuli-buoni.webp",
      detailImageUrls: [],
      habitatSummary:
        "Boschi termofili di latifoglie, soprattutto querce e castagni, in ambienti caldi e asciutti.",
      seasonSummary: "Dalla fine dell’estate per tutto l’autunno.",
      diagnosticCharacters: [
        "Cappello arancio-rosso, liscio, con margine fortemente striato.",
        "Lamelle, gambo e anello di colore giallo vivo.",
        "Grande volva bianca, membranosa e sacciforme alla base.",
      ],
      differentiatingCharacter:
        "Nello stadio chiuso la sezione longitudinale mostra già strutture interne gialle.",
      sporePrint: "white",
      representativeTaxon: null,
    },
  },

  "atlas-calocybe-gambosa": {
    displayCommonName: "Prugnoli",
    reviewedAt: "2026-09-30",
    presentation: {
      primaryImageUrl: "/schede/s1/prugnoli.webp",
      detailImageUrls: [],
      habitatSummary:
        "Radure, prati, siepi, roveti e margini con vegetazione arbustiva; spesso in archi o cerchi.",
      seasonSummary: "In primavera, fino all’inizio dell’estate.",
      diagnosticCharacters: [
        "Basidioma robusto bianco-crema con cappello carnoso.",
        "Lamelle bianche-crema molto fitte, smarginate o sinuose.",
        "Odore intenso di farina fresca o pasta.",
      ],
      differentiatingCharacter:
        "Fruttificazione tipicamente primaverile in prati, siepi e margini.",
      sporePrint: "white",
      representativeTaxon: null,
    },
  },

  "atlas-pleurotus-eryngii": {
    displayCommonName: "Cardoncelli",
    reviewedAt: "2026-09-30",
    presentation: {
      primaryImageUrl: "/schede/s1/cardoncelli.webp",
      detailImageUrls: [],
      habitatSummary:
        "Pascoli e incolti, apparentemente terricolo ma associato a radici e residui di Eryngium e altre Apiaceae.",
      seasonSummary: "Dalla primavera all’autunno.",
      diagnosticCharacters: [
        "Cappello molto carnoso beige-bruno e relativamente spesso.",
        "Lamelle bianche-crema nettamente decorrenti.",
        "Gambo robusto, centrale o eccentrico, ben sviluppato.",
      ],
      differentiatingCharacter:
        "Sviluppo caratteristico presso radici o basi di Apiaceae, soprattutto Eryngium e Ferula.",
      sporePrint: "white",
      representativeTaxon: null,
    },
  },
};
