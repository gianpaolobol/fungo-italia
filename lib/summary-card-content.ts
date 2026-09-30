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

  "atlas-auricularia-auricula-judae": {
    displayCommonName: "Orecchio di Giuda",
    reviewedAt: "2026-09-30",
    presentation: {
      primaryImageUrl: "/schede/s1/auricularia-auricula-judae.webp",
      detailImageUrls: [],
      habitatSummary:
        "Lignicolo su rami, tronchi e legno marcescente di latifoglie, soprattutto in ambienti umidi.",
      seasonSummary: "Durante tutto l’anno nei periodi umidi.",
      diagnosticCharacters: [
        "Basidioma a forma di orecchio o coppa, irregolarmente ripiegato.",
        "Consistenza gelatinosa-elastica da fresco e reviviscente dopo reidratazione.",
        "Colore bruno-rossastro o bruno-grigiastro, con faccia fertile più liscia.",
      ],
      differentiatingCharacter:
        "Lignicola su latifoglie, frequentemente su sambuco.",
      sporePrint: "white",
      representativeTaxon: null,
    },
  },

  "atlas-clitocybe-geotropa": {
    displayCommonName: "Geotropa",
    reviewedAt: "2026-09-30",
    presentation: {
      primaryImageUrl: "/schede/s1/clitocybe-geotropa.webp",
      detailImageUrls: [],
      habitatSummary:
        "Terricola in boschi di latifoglie e conifere, prati e pascoli; spesso in grandi file o cerchi.",
      seasonSummary: "Soprattutto in autunno inoltrato.",
      diagnosticCharacters: [
        "Grande cappello crema-beige, depresso fino a imbutiforme.",
        "Umbone centrale persistente anche nel fondo dell’imbuto.",
        "Lamelle bianche-crema fortemente decorrenti.",
      ],
      differentiatingCharacter:
        "Gambo alto e robusto; spesso forma grandi archi o cerchi.",
      sporePrint: "white",
      representativeTaxon: null,
    },
  },

  "atlas-coprinus-comatus": {
    displayCommonName: "Coprino chiomato",
    reviewedAt: "2026-09-30",
    presentation: {
      primaryImageUrl: "/schede/s1/coprinus-comatus.webp",
      detailImageUrls: [],
      habitatSummary:
        "Prati, margini di strade e sentieri e terreni disturbati o concimati; isolato o in gruppi.",
      seasonSummary: "Dalla primavera all’autunno.",
      diagnosticCharacters: [
        "Cappello lungo cilindrico-ovoidale, bianco e fortemente squamoso-lanoso.",
        "Lamelle libere da bianche a rosa e infine nere, con deliquescenza.",
        "Gambo lungo, bianco e cavo con piccolo anello mobile o fugace.",
      ],
      differentiatingCharacter:
        "Commestibile solo quando le lamelle sono ancora completamente bianche.",
      sporePrint: "black",
      representativeTaxon: null,
    },
  },

  "atlas-marasmius-oreades": {
    displayCommonName: "Gambesecche",
    reviewedAt: "2026-09-30",
    presentation: {
      primaryImageUrl: "/schede/s1/marasmius-oreades.webp",
      detailImageUrls: [],
      habitatSummary:
        "Luoghi aperti ed erbosi, prati e margini; cresce in file, archi e caratteristici cerchi.",
      seasonSummary: "Dalla primavera all’autunno.",
      diagnosticCharacters: [
        "Cappello ocra-beige con piccolo umbone, marcatamente igrofano.",
        "Lamelle molto distanti, pallide e non decorrenti.",
        "Gambo sottile ma eccezionalmente tenace, elastico e flessibile.",
      ],
      differentiatingCharacter:
        "Crescita tipica nei prati in file, archi e cerchi delle streghe.",
      sporePrint: "white",
      representativeTaxon: null,
    },
  },

  "atlas-pleurotus-ostreatus": {
    displayCommonName: "Orecchione",
    reviewedAt: "2026-09-30",
    presentation: {
      primaryImageUrl: "/schede/s1/pleurotus-ostreatus.webp",
      detailImageUrls: [],
      habitatSummary:
        "Lignicolo su tronchi, ceppi e legno di latifoglie; spesso in gruppi sovrapposti.",
      seasonSummary: "Soprattutto nel tardo autunno e in inverno.",
      diagnosticCharacters: [
        "Cappello a conchiglia o ventaglio, grigio, grigio-blu o bruno-grigiastro.",
        "Lamelle chiare, fitte e fortemente decorrenti.",
        "Gambo laterale o eccentrico molto corto, talvolta quasi assente.",
      ],
      differentiatingCharacter:
        "Carpofori tipicamente sovrapposti in gruppi su legno.",
      sporePrint: "white",
      representativeTaxon: null,
    },
  },

  "atlas-imleria-badia": {
    displayCommonName: "Boleto baio",
    reviewedAt: "2026-09-30",
    presentation: {
      primaryImageUrl: "/schede/s1/imleria-badia.webp",
      detailImageUrls: [],
      habitatSummary:
        "Boschi di conifere e, più raramente, misti o di latifoglie; predilige terreni acidi.",
      seasonSummary: "Dall’estate all’autunno.",
      diagnosticCharacters: [
        "Cappello liscio bruno-baio, spesso viscido con umidità.",
        "Pori gialli poi olivastri, relativamente grandi o angolosi, che azzurrano alla pressione.",
        "Gambo giallo-brunastro con fibrille brune, senza reticolo.",
      ],
      differentiatingCharacter:
        "Carne biancastra-giallastra con azzurramento soprattutto sopra i tubuli.",
      sporePrint: "olive-brown",
      representativeTaxon: null,
    },
  },

  "atlas-craterellus-lutescens": {
    displayCommonName: "Finferle",
    reviewedAt: "2026-09-30",
    presentation: {
      primaryImageUrl: "/schede/s1/craterellus-lutescens.webp",
      detailImageUrls: [],
      habitatSummary:
        "Boschi umidi di conifere e latifoglie, spesso tra muschi; può comparire in gruppi numerosi.",
      seasonSummary: "Soprattutto in autunno.",
      diagnosticCharacters: [
        "Cappello sottile bruno-arancio, presto imbutiforme e perforato.",
        "Gambo cavo, giallo vivo o arancio-giallo.",
        "Imenoforo quasi liscio o appena rugoso, giallo-aranciato o rosato.",
      ],
      differentiatingCharacter:
        "Carne molto sottile ed elastica; pliche molto meno sviluppate che in Craterellus tubaeformis.",
      sporePrint: "cream",
      representativeTaxon: null,
    },
  },

  "atlas-craterellus-tubaeformis": {
    displayCommonName: "Finferlo imbutiforme",
    reviewedAt: "2026-09-30",
    presentation: {
      primaryImageUrl: "/schede/s1/craterellus-tubaeformis.webp",
      detailImageUrls: [],
      habitatSummary:
        "Boschi di conifere e latifoglie, frequentemente tra muschi e lettiera.",
      seasonSummary: "Dall’estate all’autunno.",
      diagnosticCharacters: [
        "Cappello grigio-bruno o bruno, imbutiforme e perforato.",
        "Gambo giallo-ocraceo e cavo.",
        "Imenoforo con pieghe grigio-giallastre ben rilevate, forcate e anastomizzate, decorrenti.",
      ],
      differentiatingCharacter:
        "Pliche nettamente più sviluppate rispetto a Craterellus lutescens.",
      sporePrint: "cream",
      representativeTaxon: null,
    },
  },

  "atlas-lyophyllum-decastes": {
    displayCommonName: "Lyophyllum aggregato",
    reviewedAt: "2026-09-30",
    presentation: {
      primaryImageUrl: "/schede/s1/lyophyllum-decastes.webp",
      detailImageUrls: [],
      habitatSummary:
        "Terreni disturbati, margini, sentieri, radure e aree erbose presso boschi di latifoglie o misti.",
      seasonSummary: "Dall’estate all’autunno avanzato.",
      diagnosticCharacters: [
        "Crescita in grandi cespi compatti con numerosi gambi confluenti alla base.",
        "Cappelli lisci, irregolari o lobati, da grigi a grigio-bruni.",
        "Lamelle chiare e fitte che non anneriscono vistosamente alla pressione.",
      ],
      differentiatingCharacter:
        "Frequente su terreni disturbati, sentieri, margini e aree erbose.",
      sporePrint: "white",
      representativeTaxon: null,
    },
  },

  "atlas-tricholoma-columbetta": {
    displayCommonName: "Colombetta",
    reviewedAt: "2026-09-30",
    presentation: {
      primaryImageUrl: "/schede/s1/tricholoma-columbetta.webp",
      detailImageUrls: [],
      habitatSummary:
        "Boschi di latifoglie, in gruppi, soprattutto su terreni silicei.",
      seasonSummary: "Dall’estate all’autunno.",
      diagnosticCharacters: [
        "Cappello completamente bianco-crema, radialmente sericeo-fibrilloso e lucente.",
        "Lamelle bianche-crema smarginate.",
        "Gambo bianco spesso con macchie verde-bluastre, brunastre o rosate verso la base.",
      ],
      differentiatingCharacter:
        "Tipico di boschi di latifoglie; le sfumature blu-verdastre alla base del gambo sono molto utili.",
      sporePrint: "white",
      representativeTaxon: null,
    },
  },
};
