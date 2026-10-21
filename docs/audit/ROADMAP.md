> **Snapshot storico:** audit di main `6aa6848`, precedente al consolidamento. Il modello vigente è download gratuito, demo Agaricus (7 schede catalogo + 1 genere e test ripetibile di 4 casi), unico annuale completo a 19,99 €. Le proposte Base + annuale sono superate. Per stato corrente, selezione e prove vedere [BRANCH-SELECTION-2026-10-21.md](BRANCH-SELECTION-2026-10-21.md). Le ipotesi StoreKit non sono cause dimostrate. Esiste autorizzazione del titolare in `docs/reference-image-permission.md`: la catena dei diritti non è stata verificata indipendentemente; non equivale a un accertamento di uso non autorizzato. La ricerca per prefisso è un contratto testato; substring è una proposta, non una correzione. I conteggi delle fonti esportate non dimostrano l'assenza nei registri canonici. I test completi sono già eseguiti anche da `store-build.yml`.

# Roadmap degli interventi — 21/10/2026

Ogni voce corrisponde a **una PR piccola e indipendente**. “Dipende da” indica le PR da unire prima. Le PR marcate 🔬 richiedono l'approvazione di un micologo qualificato prima del merge; quelle marcate 👤 richiedono una decisione del titolare.

## P0 — Bloccanti

| # | Branch | Contenuto | Dipende da | Accettazione |
|---|---|---|---|---|
| 1 | `fix/unknown-edibility-safe-display` | Se la commestibilità manca, l'interfaccia mostra “Dato mancante — non considerare commestibile”, in rosso, mai il badge grigio neutro | — | Test: scheda senza categoria → badge di pericolo |
| 2 | `fix/lepiota-elaiophylla-edibility` 🔬 | Categoria e sindrome con fonte puntuale (AUSL Bologna 2023, p. 206) a monte della pipeline | 1 | Gate: 0 unità senza categoria |
| 3 | `fix/tricholoma-equestre-category` 🔬 | Categoria coerente con la sindrome rabdomiolitica e con il divieto | — | Il test di coerenza (8) passa |
| 4 | `fix/native-safety-notice` 👤 | Riga fissa sotto ogni badge di commestibilità e schermata informativa al primo avvio con la nota autorizzata del 9/10 | — | Screenshot; VoiceOver legge l'avvertenza |
| 5 | `audit/photo-rights-ledger` | Schema `author/license/permissionId/specimenId/reviewedBy` e registro per i 630 riferimenti; `validate-reference-images.mjs` blocca gli asset senza `publishable:true` | — | Report con i 379 bloccati |
| 6 | `fix/photo-rights-hold` 👤 | Esclusione dal bundle di produzione degli asset non pubblicabili, oppure sostituzione con CC0/CC BY; decisione sul repository pubblico (IMG-02) | 5 | 0 asset non autorizzati nel bundle |
| 7 | `docs/monetization-decision` 👤 | Decisione su IAP-01 (ritirare la 1.0 oppure garantire la continuità agli abbonati annuali) e matrice dei diritti | — | Documento firmato dal titolare |
| 8 | `test/edibility-scale-coherence` | Test: `deadly` ⇔ sindrome grave; nessuna unità `discouraged` con sindrome “potenzialmente mortale”; scala unica (SCI-20) | — | Il test passa sui dati corretti |
| 9 | `feat/edibility-source-visible` 🔬 | Mostrare fonte e pagina del giudizio alimentare (oggi le fonti `S1-`/`S2-` sono nascoste) | — | Ogni badge ha una fonte cliccabile o citata |

## P1 — Alta

| # | Branch | Contenuto | Dipende da | Accettazione |
|---|---|---|---|---|
| 10 | `fix/exam-bank-reproducible` | Generazione deterministica; versionare il bank rigenerato; `git diff --exit-code src/data` in CI | — | La CI fallisce se il bank è stantio |
| 11 | `ci/run-unit-tests` | `npm test` = `node --test scripts/*.test.mjs` nella pipeline principale; solo `npm ci` | — | I 92 test girano su ogni PR |
| 12 | `fix/exam-subject-normalization` | Corrispondenza di `subjectTaxon` sul binomio (QZ-03): rientrano *C. rubellus*, *P. ostreatus*, *L. connata*, *L. porninsis* | 10 | Tutte le specie mortali binomiali nel bank |
| 13 | `feat/exam-group-cases` 🔬 | Casi d'esame per i 37 `speciesGroup`, con risposta accettata al rango del gruppo (QZ-01) | 10, 12 | Bank ≥ 140 unità |
| 14 | `fix/exam-preparation-distractors` | Distrattori presi da precauzioni di altre specie (QZ-02) | 10 | Nessuna domanda risolvibile con “tutto tranne Nessuna” |
| 15 | `fix/exam-name-search` | Suggerimenti su ogni parola, senza accenti, con i nomi comuni; normalizzazione di punteggiatura, trattini e autore (QZ-04, QZ-06) | — | Test: “rub”, “amà”, “porcino”, “pes caprae” |
| 16 | `fix/curriculum-levels` | Campo reale `curriculum.level`; nascondere i livelli vuoti (QZ-05) | — | I conteggi per livello corrispondono ai dati |
| 17 | `data/lookalikes-deadly-toxic` 🔬 | Sosia per i 4 mortali e le 20 tossiche senza confronti, poi per le 42 “libere” (SCI-05…07) | — | 0 tossiche o mortali senza sosia |
| 18 | `fix/subscription-foreground` | Niente reset dell'entitlement in primo piano; log di `AppState` e `generation`; debounce (IAP-02, IAP-03) | — | 5 run UI iPhone e 5 iPad verdi di fila |
| 19 | `chore/rebase-dashboard-branch` | Rebase di `design/study-dashboard-v1-1` su `main`, senza perdere `AGENTS.md`, `CLAUDE.md` e `claude.yml` (ARC-08) | 7 | Branch allineato e CI verde |
| 20 | `feat/base-purchase` | Modulo StoreKit Base + gate (dal branch 19) | 7, 19 | Sandbox: Base, poi annuale, ripristino, rimborso |
| 21 | `feat/study-dashboard` | Dashboard dal branch 19 con le correzioni del modello (§Dashboard) | 16, 19 | Test del modello; accessibilità del fungo come `progressbar` |
| 22 | `fix/a11y-danger-contrast` | Badge mortale ≥ 4,5:1 con icona; categoria visibile in elenco (UX-01, UX-02) | — | Contrasto misurato |
| 23 | `feat/android-billing` 👤 | Play Billing Library: Base + annuale (IAP-04) | 7 | Test sandbox Play |
| 24 | `fix/exam-photo-attribution` | Credito e licenza nel feedback d'esame (IMG-03) | — | Revisione UI |
| 25 | `data/photo-representative` 🔬 | Sostituire le foto non rappresentative (IMG-05) e le 51 sotto i 400 px (IMG-06) | 5 | Revisione visiva firmata |

## P2 — Media

| # | Branch | Contenuto |
|---|---|---|
| 26 | `data/habitat-season` 🔬 | Campo `season` nello schema; habitat per le 118 unità vuote |
| 27 | `data/syndrome-normalization` 🔬 | Latenza e gravità unificate per sindrome, da `toxicology-syndromes.json` (SCI-15) |
| 28 | `fix/nomenclature-flags` 🔬 | *Lactarius porninsis*, *Coprinopsis atramentaria*, *Mycena* sez. *Purae* (SCI-08, 16, 17) |
| 29 | `perf/image-dedup-compress` | Deduplica per hash e ricompressione (ARC-05, IMG-07) |
| 30 | `fix/thumbnail-contain` | Miniature `contain` o punto focale (UX-06) |
| 31 | `fix/areas-offline-map` | Leaflet incluso nel bundle, provider di tile con contratto, fallback offline (UX-08) |
| 32 | `fix/exam-session-migration` | Sessioni conservate a un cambio del bank (ARC-06); conferma prima di sostituirle (UX-07) |
| 33 | `fix/dynamic-type-320` | Layout a 320 pt con AX5 e tab con icone (UX-04) |
| 34 | `chore/remove-unused-photo-permission` | Togliere `expo-media-library` e il permesso Foto se la funzione resta solo web |
| 35 | `fix/grace-period` | Periodo di tolleranza StoreKit (IAP-05) |
| 36 | `chore/workflow-cleanup` | Archiviare i workflow diagnostici (ARC-07) |
| 37 | `chore/rn-stable` | React Native 0.88 stabile (ARC-04) |
| 38 | `chore/format` | Prettier sui TSX, nessuna modifica funzionale (ARC-09) |

## P3 — Evolutive

39. Obiettivi auspicabili: *Armillaria*, *Inocybe*, *Paxillus*, *Morchella*, *Leccinum*, *Russula* commestibili, *Tuber* 🔬 · 40. Schermata “Confronta sosia” affiancati · 41. Chiavi dicotomiche guidate per genere · 42. Modalità scura · 43. Simulazione d'esame con tempo e punteggio come all'esame reale · 44. Glossario morfologico illustrato · 45. Esportazione e importazione dei progressi; sincronizzazione su richiesta.

## Dashboard: specifica proposta

**Stato attuale:** implementata sul branch `design/study-dashboard-v1-1`, non su `main`.

**Modello.** Il branch calcola `score = 0,40·A + 0,25·C + 0,20·R + 0,15·E`, dove A è l'accuratezza recente, C la copertura, R la ritenzione a ≥ 2 giorni senza aiuti ed E la media delle ultime 3 simulazioni. Correzioni proposte:
1. **A non deve contenere C.** Oggi A divide per tutte le unità, comprese quelle mai viste, che valgono 0, quindi la copertura pesa due volte. Usare A = media sulle unità *viste* (come fa già `assessedScore`).
2. **Peso per difficoltà e rischio.** Gli errori sulle mortali e sui sosia mortali pesano di più. `criticalOpen > 0` limita la preparazione al 69% (“non pronto”), qualunque sia il punteggio.
3. **Dimensioni separate**, mai fuse in un solo numero senza mostrarle: Copertura (contenuti visti), Accuratezza (test), Mantenimento (ripasso distanziato), Simulazioni d'esame.
4. **Confidenza** “iniziale” sotto 3 sessioni o 30 unità coperte (già presente): mostrare “Stima iniziale”.
5. **Livelli:** usare il campo reale del livello (PR 16) per minimi, auspicabili e approfondimenti.

**Interfaccia.** Saluto con nome solo dopo un consenso esplicito e memorizzato in locale. Pulsante principale “Inizia lo studio” o “Riprendi lo studio”. Fungo-indicatore con percentuale e quattro barre per dimensione. Grafico dell'andamento delle ultime 10 sessioni. “Le tue 3 lacune” con link diretto alla scheda e al ripasso. Competenze per genere (heatmap verde/arancio/rosso con etichette testuali). Riga fissa: “La stima misura lo studio nell'app, non abilita al riconoscimento per il consumo”.

**Ripasso adattivo.** Lo scheduler del branch (intervalli 1/3/7/14/30 giorni; 50% lacune, 30% ripassi, 20% nuove) è adeguato. Aggiungere una priorità per le mortali e le coppie di sosia.
