> **Snapshot storico:** audit di main `6aa6848`, precedente al consolidamento. Il modello vigente è download gratuito, demo Agaricus (7 schede catalogo + 1 genere e test ripetibile di 4 casi), unico annuale completo a 19,99 €. Le proposte Base + annuale sono superate. Per stato corrente, selezione e prove vedere [BRANCH-SELECTION-2026-10-21.md](BRANCH-SELECTION-2026-10-21.md). Le ipotesi StoreKit non sono cause dimostrate. Esiste autorizzazione del titolare in `docs/reference-image-permission.md`: la catena dei diritti non è stata verificata indipendentemente; non equivale a un accertamento di uso non autorizzato. La ricerca per prefisso è un contratto testato; substring è una proposta, non una correzione. I conteggi delle fonti esportate non dimostrano l'assenza nei registri canonici. I test completi sono già eseguiti anche da `store-build.yml`.

# Audit completo di Fungo Italia — Claude, 21 ottobre 2026

**Branch:** `audit/claude-full-review-20261021`, creato da `main` @ `6aa68489c7b29582be6bcddae56f2a46fb29d10e` (PR #110, 21/10/2026 12:48).
**Data di esecuzione:** 21/10/2026, la stessa della missione.
**Perimetro:** codice e dati di `main`. È stato letto anche il branch non integrato `design/study-dashboard-v1-1` (Dashboard, Base, build 1.1.0).
**Regole rispettate:** codice applicativo, dataset, prodotti e pipeline non sono stati modificati. Questo branch aggiunge solo i sei rapporti in `docs/audit/`.

> **Limite fondamentale.** Nessun campo è marcato `VERIFICATO`. Nel repository non c'è alcuna revisione micologica indipendente (`independentReviewComplete:false`, 0/148 nel gate di rilascio), e Claude non è un micologo abilitato. Le osservazioni micologiche di questo audit vengono dalla conoscenza generale del modello e dal confronto interno fra i dati. Sono **segnalazioni da sottoporre a un revisore qualificato**, non correzioni da applicare direttamente.

## 1. Ambiente e prove eseguite

| Verifica | Comando | Esito |
|---|---|---|
| Dipendenze | `npm ci --ignore-scripts` (Node 22.22: il progetto richiede ≥24.3, quindi solo avviso) | OK, 0 errori; `npm audit` segnala vulnerabilità non analizzate |
| TypeScript | `npx tsc --noEmit` | **PASS** |
| Test unitari | `node --test scripts/*.test.mjs` (23 file, 92 test) | **PASS 92/92** |
| Gate di rilascio | `node scripts/release-readiness.mjs --strict` | **FAIL atteso**: 0/148 schede pronte, 148 bloccate |
| Riproducibilità dati | `npm run prepare:data`, poi `git diff` | **FAIL**: rigenerati `exam-bank.json` (−3 casi, 29 casi modificati) e `provenance.json` (`sourceExportCommit` → `null`). Vedi ARC-01 |
| Validazione dati mobile | `node scripts/validate-mobile-data.mjs` | PASS |
| Validazione immagini | `node scripts/validate-reference-images.mjs` | PASS: 630 immagini e 212 schede (controlla formato e metadati, non i diritti) |
| Regressioni del quiz | script dedicato su `web/public/exam-core.js` | Vedi `QUIZ-AUDIT.md` |
| Build iOS/Android, simulatori, dispositivi | — | **NON ESEGUITO**: container Linux senza Xcode né emulatore |
| Stato CI, TestFlight, App Store Connect, Google Play | — | **NON VERIFICATO**: nessun accesso all'API GitHub né alle console degli store |

Dopo la prova di rigenerazione i file in `src/data` sono stati ripristinati (`git checkout -- src/data`).

## 2. Sintesi esecutiva

Fungo Italia ha basi solide e prudenti: dati generati da una pipeline con checksum, distinzione rigorosa fra specie e gruppi, dichiarazioni prudenti sulle fonti, 92 test che passano, un gate di rilascio che rifiuta onestamente di dichiarare completezza. Ci sono però quattro blocchi da risolvere prima di poterla definire la migliore app di studio micologico in commercio:

1. **Sicurezza dei contenuti.** Una Lepiota con amatossine viene mostrata come “non documentata”. Tricholoma equestre ha una categoria incoerente con la sua stessa scheda. Il 70% delle schede non ha sosia e l'80% non ha habitat. Nessuna revisione indipendente.
2. **Diritti sulle immagini.** 379 riferimenti fotografici su 630 (60%) sono ritagli da dispense di corso senza licenza degli autori. La sola autorizzazione registrata è una dichiarazione del titolare dell'app, non dei fotografi. L'app è a pagamento.
3. **Didattica dell'esame.** L'esame esclude tutti i gruppi di specie: porcino, finferlo, mazza di tamburo e Galerina non vengono mai esaminati. Esclude anche due specie mortali. Le domande di preparazione si risolvono senza conoscenza (8 su 8). I tre livelli di obiettivi sono fittizi.
4. **Monetizzazione e rilascio.** `main` implementa solo l'abbonamento annuale. Android è gratuito senza limiti. Il modello approvato (Base 9,99 € + annuale 9,99 €) esiste solo su un branch non integrato. Secondo il registro di quel branch, la versione 1.0 era in `WAITING_FOR_REVIEW` con il solo modello annuale (dato del 20/10, NON VERIFICATO oggi).

**Voti (1–10):** micologia 5 · didattica 5 · grafica 6 · usabilità e accessibilità 6 · tecnica 7 · readiness per gli store 4.

## 3. I dieci problemi più importanti

| # | ID | Gravità | Problema | Dove |
|---|---|---|---|---|
| 1 | SCI-01 | P0 | *Lepiota elaiophylla*: commestibilità nulla; l'app mostra “non documentata” anche se la nota diagnostica cita α/β-amanitina | `src/data/catalog.json` (indice 63); `components/Studio.tsx:27` |
| 2 | IMG-01 | P0 | 379/630 immagini (104/148 schede) sono ritagli da PDF di corso senza licenza scritta dei fotografi, in un'app commerciale | `docs/reference-image-permission.md`; `referenceImages[].credit` |
| 3 | SCI-02 | P0 | *Tricholoma equestre* “Sconsigliato” con sindrome rabdomiolitica potenzialmente mortale e divieto italiano citati nella stessa scheda | `catalog.json` (indice 87) |
| 4 | SCI-03 | P0 | Avvertenza sulla commestibilità assente nell'app nativa: le schede mostrano “libera” senza alcun avviso, che compare solo nel tab Esame | `components/Studio.tsx`, `App.tsx` |
| 5 | IAP-01 | P0 | Il modello approvato (Base + annuale) non è su `main`; Android ha accesso completo gratuito; la 1.0 in revisione è annual-only | `App.tsx:21`; branch `design/study-dashboard-v1-1` |
| 6 | SCI-04 | P0 | 141/148 commestibilità e 134/148 caratteri 3+1 senza fonte puntuale visibile nel record; 103/148 senza sosia, compresi 4 mortali e 20 tossici | `catalog.json` `sources[].fields` |
| 7 | QZ-01 | P1 | L'esame copre 89/148 unità: esclusi tutti i `speciesGroup` (porcino, finferlo, mazza di tamburo, Galerina) e due mortali (*C. rubellus*, *A. verna/vidua*) | `web/public/exam-core.js:14-36` |
| 8 | ARC-01 | P1 | `exam-bank.json` versionato non è riproducibile: la rigenerazione toglie 3 casi e cambia le foto di 29; la build EAS lo rigenera, quindi app pubblicata e repo divergono | `package.json` (`eas-build-post-install`) |
| 9 | QZ-02 | P1 | Le domande di preparazione si risolvono scegliendo tutto tranne “Nessuna” (8/8) | `web/public/exam-core.js:82-86` |
| 10 | IAP-02 | P1 | A ogni ritorno in primo piano l'entitlement viene forzato a inattivo: l'abbonato perde l'accesso per qualche istante e l'Esame si smonta. Ipotesi per i test iPhone falliti | `hooks/useSubscription.ts:48-49` |

## 4. Le cinque correzioni più urgenti

1. **`fix/lepiota-elaiophylla-edibility`**: assegnare una categoria tossicologica con fonte puntuale (AUSL Bologna 2023, p. 206), previa conferma del revisore. Nel frattempo l'interfaccia deve mostrare “Dato mancante: trattare come potenzialmente pericoloso”, mai un badge neutro.
2. **`fix/native-safety-notice`**: avvertenza sintetica permanente vicino al badge di commestibilità di ogni scheda, più una schermata informativa al primo avvio. Va in contrasto con la decisione del 9/10 di non usare banner: la decisione spetta al titolare, ma è la difesa più efficace in sede di revisione Apple e di responsabilità civile.
3. **`audit/photo-rights` → `fix/photo-rights-hold`**: bloccare la pubblicazione delle 379 immagini dei corsi finché non arrivano liberatorie scritte da ciascun autore (Sitta, Suriano, Palumbo, Missanelli, Floriani, Perini, autori di Baselga di Piné) con uso commerciale e diritto di ritaglio. In alternativa, sostituirle con immagini CC0/CC BY già verificate.
4. **`fix/tricholoma-equestre-category`**: allineare la categoria alla scala e ai dati tossicologici. Proposta: “Tossico” con nota sul divieto, da confermare con il revisore e la Guida.
5. **`fix/exam-bank-reproducible`**: rendere deterministica la generazione, versionare il bank rigenerato e aggiungere in CI un controllo che fallisca se `prepare:data` produce differenze.

## 5. Sintesi per fase

- **Fase 0, acquisizione.** `AGENTS.md` e `HANDOFF.md` sono complessivamente accurati. Imprecisioni: non citano il branch `design/study-dashboard-v1-1`, che contiene Dashboard, prodotto Base e build 1.1.0 (13); la pipeline principale (`pipeline.yml`) non esegue i 23 file di test unitari; `HANDOFF.md` descrive gli strati `minimum/desirable/deep` come progressione, ma nel codice sono fittizi (QZ-05).
- **Fase 1, scientifica.** Vedi `SCIENTIFIC-GAPS.md`: matrice delle 148 unità, 23 anomalie nominate e conteggi per campo.
- **Fase 2, immagini.** Vedi `IMAGE-LICENSE-AUDIT.md`: 630 riferimenti, 502 file unici (34,6 MB di duplicati), 51 sotto i 400 px sul lato corto, 36 triadi con fonti miste, 107 soggetti diversi dal nome della scheda.
- **Fase 3, quiz.** Vedi `QUIZ-AUDIT.md`. Le regressioni *Amanita rubescens* e *Marasmius oreades* risultano **corrette**; trovati 9 difetti.
- **Fase 4, Dashboard.** Esiste solo sul branch `design/study-dashboard-v1-1`: `components/StudyDashboard.tsx`, `StudyMushroom.tsx`, `lib/study-progress.mjs`, `lib/study-scheduler.mjs`. Il modello è buono (accuratezza, copertura, ritenzione, simulazioni; ripasso a intervalli 1/3/7/14/30 giorni), con due difetti: la copertura pesa due volte, e i livelli “auspicabili” poggiano sul filtro fittizio. Specifica proposta in `ROADMAP.md`, §Dashboard.
- **Fase 5, UI/UX.** Vedi §6.
- **Fase 6, monetizzazione.** Vedi `STORE-READINESS.md`.
- **Fase 7, architettura.** Vedi §7.
- **Fase 8, store.** Vedi `STORE-READINESS.md`: quasi tutti gli stati sono `NON VERIFICATO` da qui.

## 6. UI/UX e accessibilità (P1/P2)

| ID | Gr. | Problema | Evidenza | Proposta | Accettazione |
|---|---|---|---|---|---|
| UX-01 | P1 | Il badge “tossico mortale” ha il contrasto più basso dell'app: 3,48:1 (bianco su `#eb5757`, testo 13 pt). Non supera WCAG AA 4,5:1 | `components/Studio.tsx:14,27`; `PhotoExam.tsx` | Rosso `#b3261e` con testo bianco (6,5:1) e icona di pericolo; non affidarsi al solo colore | Contrasto ≥ 4,5:1 misurato; VoiceOver legge “Tossico mortale” |
| UX-02 | P1 | Le schede in elenco mostrano solo nome e rango, senza categoria alimentare né indicatore di pericolo | `Studio.tsx`, `renderItem` | Pallino colorato con etichetta testuale e filtro per categoria (es. “solo mortali”) | Test del filtro; lettore schermo legge la categoria |
| UX-03 | P1 | Ricerca dei nomi nell'esame solo a inizio stringa: “rub” non trova *A. rubescens*, “amà” non trova nulla, i nomi comuni non funzionano | `exam-core.js:63` | Ricerca su ogni parola, senza accenti; sinonimi etichettati | Test: “rub”, “Amà”, “porcino” |
| UX-04 | P2 | Barra con 4 tab e testo 12 pt; “Abbonamento” a 320 pt rischia il troncamento; etichette con larghezza fissa 98 pt in `StudyFacts` con Dynamic Type | `App.tsx` (stili `tab/label`); `Studio.tsx:27` | Icone con etichette brevi (“Piano”); layout a colonna oltre la categoria XL | Screenshot a 320 pt con AX5 senza troncamenti |
| UX-05 | P2 | Solo tema chiaro (`userInterfaceStyle: light`) | `app.json` | Palette scura con token | Screenshot in modalità scura |
| UX-06 | P2 | Le miniature usano `cover`: i caratteri diagnostici (volva, anello, base) possono restare fuori dall'inquadratura; nel visore a schermo intero è corretto (`contain`) | `ReferencePhotos.tsx` | `contain` su fondo neutro, oppure punto focale per foto | Revisione visiva delle 143 triadi |
| UX-07 | P2 | “Inizia 15 casi” sovrascrive senza conferma una sessione in corso | `PhotoExam.tsx:24` | Chiedere conferma se `session.phase!=='complete'` | Test |
| UX-08 | P2 | La mappa delle Aree carica Leaflet da unpkg senza SRI e le tile direttamente da tile.openstreetmap.org: la policy OSM non lo consente per app commerciali ad alto traffico, e offline la mappa non funziona | `components/Areas.tsx:6` | Leaflet incluso nel bundle e provider di tile con contratto, oppure mappa statica offline | Mappa funzionante in modalità aereo con lo sfondo |
| UX-09 | P2 | Cambiando stato dell'abbonamento, la `key` di Studio passa da `full` a `preview`: posizione e scheda aperta si perdono | `App.tsx` (`key={fullAccess?…}`) | Mantenere lo stato e filtrare i dati | Test: posizione conservata dopo un cambio di entitlement |
| UX-10 | P3 | I 3 livelli di obiettivi sono presentati come progressivi, ma “auspicabili” e “approfondimenti” mostrano le stesse 214 schede | `Studio.tsx:19-20` | Vedi QZ-05 | — |

## 7. Architettura, sicurezza e prestazioni

| ID | Gr. | Problema | Evidenza | Proposta |
|---|---|---|---|---|
| ARC-01 | P1 | Bank d'esame non riproducibile (vedi §1). `prepare:data` azzera anche `provenance.sourceExportCommit` | `git diff` dopo `npm run prepare:data` | Generazione deterministica; controllo `git diff --exit-code src/data` in CI |
| ARC-02 | P1 | I 23 test unitari non girano nella pipeline principale | `.github/workflows/pipeline.yml` | Aggiungere `node --test scripts/*.test.mjs` e uno script `npm test` |
| ARC-03 | P2 | `npm install --package-lock-only && npm ci` in CI riscrive il lockfile: installazioni non riproducibili | `pipeline.yml:35` | Solo `npm ci` |
| ARC-04 | P2 | React Native `0.88.0-rc.3` (release candidate) in produzione, con override dei peer | `package.json` | Passare alla 0.88 stabile appena disponibile per SDK 58 |
| ARC-05 | P2 | 160 MB di immagini nel bundle tramite `require`, di cui 34,6 MB duplicati (128 file identici fra genere e specie); pesano anche sugli aggiornamenti OTA | `src/data/reference-image-assets.ts` | Deduplicare per hash; ricomprimere (es. 1600 px, qualità 80); valutare la consegna differita |
| ARC-06 | P2 | La sessione d'esame in corso diventa invalida a ogni cambio del bank (firma `bankSignature`) | `exam-core.js` (`restoreTraining`) | Migrazione: tenere i casi ancora esistenti |
| ARC-07 | P2 | 36 workflow su `main`, molti diagnostici una tantum (`inspect-*`, `ios-launch-fix`) | `.github/workflows/` | Archiviare i diagnostici; documentare i 5–6 workflow vivi |
| ARC-08 | P2 | Il branch `design/study-dashboard-v1-1` diverge molto da `main`: 109 file, non contiene `AGENTS.md`, `CLAUDE.md` né `claude.yml` | `git diff main design/study-dashboard-v1-1` | Rebase su `main` prima del merge, con revisione dei conflitti |
| ARC-09 | P3 | Codice TSX minificato su poche righe lunghe: revisioni e diff difficili da leggere | `components/*.tsx` | Formattazione Prettier in una PR dedicata, senza modifiche funzionali |

Positivo: TypeScript `strict` senza errori; gestione prudente degli errori AsyncStorage (non sovrascrive dati illeggibili); scritture serializzate; nessun flag premium locale; verifica JWS di StoreKit 2; nessun segreto nel repository oltre agli ID pubblici di progetto e team.

## 8. Allegati

`SCIENTIFIC-GAPS.md` · `IMAGE-LICENSE-AUDIT.md` · `QUIZ-AUDIT.md` · `STORE-READINESS.md` · `ROADMAP.md`
