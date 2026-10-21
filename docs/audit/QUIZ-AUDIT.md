# Audit dell'esame fotografico — 21/10/2026

File analizzati: `components/PhotoExam.tsx`, `web/public/exam-core.js` (motore condiviso web e nativo), `src/data/exam-bank.json`, `scripts/exam-*.test.mjs`. Le prove sono state eseguite con Node sul motore reale, sia con il bank versionato (89 casi) sia con quello rigenerato da `npm run prepare:data` (86 casi).

## Requisiti funzionali

| Requisito | Esito | Evidenza |
|---|---|---|
| Sessioni di 15 funghi | ✅ | `selectCases(bank,15)`; ogni sessione contiene almeno 3 condizionate, 3 tossiche, 2 mortali e 3 libere (2–4 mortali su 2000 simulazioni) |
| Suggerimenti dopo tre lettere | ✅ parziale | `suggestNames` restituisce `[]` sotto i 3 caratteri; cerca solo **dall'inizio del nome**. Vedi QZ-04 |
| Tutte le corrispondenze pertinenti | ⚠︎ | “ama” → 15 *Amanita* ✅; “rub” → solo *Rubroboletus* (nessuna *A. rubescens*); “amà” → 0; “porcino” → 0 |
| Sinonimi | ✅ parziale | *Cyclocybe cylindracea* accetta *Agrocybe aegerita*; *R. satanas* accetta *Boletus satanas*; *C. phyllophila* accetta *Clitocybe cerussata/phyllophila*. Accetta solo binomi di generi conosciuti |
| Punteggi separati per nome, commestibilità e dettaglio | ✅ | `gradeResponse` → `{name, category, details[]}`; lo storico mostra Nome x/15 · Commestibilità x/15 · Preparazione · Tossicologia |
| Verde corretto, rosso errato, risposta corretta indicata | ✅ | `fieldFeedback` in `PhotoExam.tsx` |
| Ripetizione degli errori fino alla correzione | ✅ | `advanceTraining`: le schede non superate tornano in coda in round successivi |
| Persistenza e ripresa dopo la chiusura | ✅ | Bozza salvata a ogni modifica (`edit` → `persist`); `restoreTraining` ripristina la bozza |
| Storico e report degli errori ricorrenti | ✅ | “Specie sbagliate più spesso” (top 10) |
| Nessuna risposta errata valutata come corretta per normalizzazione | ✅ | Nessun falso positivo trovato; ci sono invece **falsi negativi** (QZ-06) |

## Regressioni obbligatorie

| Caso | Esito |
|---|---|
| *Amanita rubescens* fra i suggerimenti dopo “ama”/“AMA” | ✅ presente |
| *Marasmius oreades*: nome corretto, categoria sbagliata | ✅ `name:true, category:false, passed:false`: il nome è valutato a parte |
| Maiuscole e spazi multipli (“  amanita   RUBESCENS ”) | ✅ corretto |
| Spazio non separabile | ✅ corretto |
| Accenti (“Amanità rubescens”) | ❌ rifiutato (QZ-06) |
| Punto finale o autore (“Amanita rubescens.”, “… Pers.”) | ❌ rifiutato (QZ-06) |
| Trattino omesso (“Scutiger pes caprae”) | ❌ rifiutato (QZ-06) |
| Bozza ripristinata dopo la chiusura | ✅ |
| Sessione dopo un cambio del bank | ❌ scartata: viene mostrato un messaggio, lo storico resta (ARC-06) |

## Difetti

| ID | Gr. | Problema | File:riga | Riproduzione | Conseguenza | Soluzione | Test di accettazione |
|---|---|---|---|---|---|---|---|
| QZ-01 | **P1** | Copertura: 89/148 unità. `buildExamBank` accetta solo `rank==='species'` con binomio, quindi tutti i 37 `speciesGroup` restano fuori (*Boletus edulis* s.l., *Cantharellus cibarius* complex, *Macrolepiota procera* s.l., *Galerina marginata* group mortale, *Lactarius* sez. *Deliciosi*…) | `web/public/exam-core.js:21-36` (filtro a riga 25) | Cercare “Boletus edulis” in `exam-bank.json` | Le specie più importanti per l'esame (porcino, finferlo, mazza di tamburo) e la mortale *Galerina marginata* group non vengono mai esaminate (con QZ-03, 3 mortali su 10 restano fuori) | Casi di gruppo: risposta accettata al rango del gruppo (“Boletus edulis s.l.”, “gruppo edulis”) e accepted names espliciti | Bank ≥ 140 unità; tutte e 10 le mortali presenti |
| QZ-02 | **P1** | Le domande di preparazione non hanno distrattori: le opzioni sono le precauzioni corrette più “Nessuna delle precauzioni elencate è necessaria” | `exam-core.js:82-86` | 8/8 casi `preparation` si superano selezionando tutto tranne “Nessuna” | La domanda non misura alcuna conoscenza | Distrattori presi da precauzioni di **altre** specie (prebollitura, eliminare i gambi, evitare l'alcol…) etichettati come “non richiesti per questa scheda” | Nessun caso risolvibile con “tutto tranne Nessuna” |
| QZ-03 | **P1** | Due specie mortali escluse per corrispondenza di stringhe: *Cortinarius rubellus* (subjectTaxon “Cortinarius orellanoides (= C. speciosissimus, C. rubellus)”), *Amanita verna / vidua* (nome non binomiale). Escluse anche *Pleurotus ostreatus*, *Lactarius porniniae* e *Leucocybe connata* per la stessa causa | `exam-core.js:14-21` | `exam-bank.json` non contiene *C. rubellus* | Le mortali più difficili da riconoscere mancano | Normalizzare `subjectTaxon` (tenere solo il binomio prima della parentesi) oppure un campo `subjectAcceptedName` | Test: *C. rubellus* nel bank |
| QZ-04 | P1 | Suggerimenti solo dall'inizio della stringa e senza togliere gli accenti; nessun nome comune | `exam-core.js:63-66` | “rub”, “amà”, “porcino” | Nomi difficili da trovare; i principianti non usano i nomi comuni | Ricerca su ogni parola, senza accenti; facoltativa: suggerimenti dai nomi comuni che inseriscono il nome scientifico (marcati `assisted`) | Test sui tre input |
| QZ-05 | P1 | Livelli di obiettivi fittizi: `desirableItems` filtra con una condizione sempre vera e restituisce tutte le schede, come `deepItems`; il catalogo contiene solo obiettivi minimi | `components/Studio.tsx:19-20` | Scegliere “Obiettivi auspicabili” | Lo studente crede di studiare un livello superiore | Campo `curriculum.level` reale nei dati e filtro su quel campo; nascondere i livelli vuoti | Conteggi diversi per livello, oppure livelli nascosti |
| QZ-06 | P2 | Falsi negativi di normalizzazione: accenti, punteggiatura finale, autore, trattino | `exam-core.js:3` | Vedi regressioni | Una risposta giusta viene segnata sbagliata | Togliere diacritici e punteggiatura finale e normalizzare i trattini; tagliare l'autore dopo il binomio | Test sui casi della tabella |
| QZ-07 | P2 | “Pericoloso” segnala solo le risposte commestibili: una mortale classificata “sconsigliato” o “non commestibile” non viene segnalata | `exam-core.js:44-48` | *A. phalloides* → “inedible”: `danger:false` | Sottostima del rischio non evidenziata | Secondo indicatore, “sottostima grave”, per mortale → non tossico | Test |
| QZ-08 | P2 | Le domande di tossicologia chiedono la **dicitura** della scheda (“secondo la scheda dell'atlante”): si memorizzano frasi lunghe invece di classi (latenza breve/lunga, organo bersaglio) | `exam-core.js:88-95` | Qualsiasi caso tossico | Valore didattico limitato | Domande per classe: latenza (< 6 h / > 6 h), organo bersaglio, tossina | Revisione didattica |
| QZ-09 | P2 | Le foto d'esame vengono dalla scheda stessa: chi ha studiato l'atlante riconosce la **foto**, non il fungo | `exam-core.js:14` | — | Sovrastima della preparazione | Foto d'esame distinte da quelle dell'atlante, quando disponibili | Campo `examOnly` sulle immagini |
| QZ-10 | P2 | “Inizia 15 casi” sostituisce senza conferma una sessione non conclusa | `components/PhotoExam.tsx:24` | Avviarne una nuova a metà sessione | Perdita della sessione in corso | Conferma | Test UI |

## Copertura della banca rispetto agli obiettivi

| Categoria | Unità nel catalogo | Casi nel bank versionato | Nel bank rigenerato |
|---|---|---|---|
| Libera | 59 | 34 | 34 |
| Condizionata | 16 | 8 | 8 |
| Sconsigliato | 13 | 9 | 8 (perde *T. equestre*) |
| Non commestibile | 17 | 10 | 10 |
| Tossico | 28 | 21 | 19 (perde *Ramaria formosa* e *R. pallida*: manca la vista “sotto”) |
| Tossico mortale | 10 | 7 | 7 |
| Variabile / mancante | 5 | 0 | 0 |
| **Totale** | **148** | **89** | **86** |

Obiettivi auspicabili e approfondimenti: **nessuna copertura**, perché non ci sono dati (QZ-05, SCI-11).

## Test esistenti

`exam-core`, `exam-feedback`, `exam-grading`, `exam-training`: 12 test, tutti passati. Non coprono QZ-01…QZ-10. Test da aggiungere: autocompletamento su ogni parola e senza accenti; presenza di tutte le mortali nel bank; nessuna domanda di preparazione banale; normalizzazione di punteggiatura e trattini; regressione *Marasmius oreades* (oggi verificata solo da questo audit).
