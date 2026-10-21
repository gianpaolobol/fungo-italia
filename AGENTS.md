# Fungo Italia — istruzioni per agenti AI

## Identità e vincoli
- Repository: `gianpaolobol/fungo-italia`; applicazione didattica in italiano, non strumento di identificazione per consumo.
- Leggere nell'ordine `AGENTS.md`, `docs/HANDOFF.md`, `README.md`, `docs/RELEASE-READINESS-GATE.md` e documentazione di rilascio.
- Separare sempre **implementato**, **testato**, **documentato**, **approvato scientificamente** e **pubblicato**.
- Branch dedicato `feat/...`, `fix/...`, `audit/...`, `docs/...`; PR verso `main`; non sovrascrivere lavori di un altro agente. Aggiornare l'handoff al termine.

## Stack verificato su main (21/10/2026)
- Node: `>=24.3.0`; EAS Node `24.3.0`.
- JavaScript (script `.mjs`, `index.js`, `app.config.js`), TypeScript/TSX (app mobile), JSON (dataset).
- Expo `58.0.2`; React `19.3.0`; React Native `0.88.0-rc.3`.
- Entrata: `index.js` → `App.tsx` (`registerRootComponent`).
- Navigazione: tab **custom** in `App.tsx` tramite `useState`; Expo Router e React Navigation: **non presenti tra le dipendenze**.
- Stato: React hooks; preferiti/ripresa studio con AsyncStorage (`fungo-italia:study:v1`); esame e storico con AsyncStorage; StoreKit 2 nativo per entitlement iOS.
- Config: `app.json` + `app.config.js` (progetto EAS, aggiornamenti e runtime fingerprint quando `EXPO_PROJECT_ID` è definito); `eas.json`.
- ID piattaforme: `it.fungoitalia.app`; Android `versionCode: 1` in `app.json`, versione EAS da sorgente remota; versione app `1.1.0`.
- iOS tablet supportato; Android senza permessi camera/microfono/geolocalizzazione; modulo Foto dichiarato in `app.json`.
- UI nativa non equivale alla PWA: i relativi percorsi e gate di distribuzione sono differenti.

## Mappa operativa delle cartelle
- `App.tsx`, `index.js`: bootstrap, tab e gate di accesso.
- `components/`: Studio, PhotoExam, Areas, ReferencePhotos, SubscriptionGate, CommercializationInfo.
- `hooks/`: `useSubscription.ts`, lifecycle e stato StoreKit.
- `modules/fungo-subscription/`: modulo Expo nativo StoreKit.
- `lib/`: logica e policy dell'abbonamento.
- `src/data/`: output mobile `catalog.json`, `groups.json`, `areas.json`, `exam-bank.json`, `reference-image-assets` e dati integrativi.
- `scripts/`: preparazione dataset, import evidenze, immagini, controlli readiness.
- `legacy/web/`: sorgenti e pipeline web/PWA e artefatti canonici; **non** eliminare come presunto codice morto.
- `web/public/`: logica quiz condivisa `exam-core.js` e asset/pagine web.
- `assets/`: branding Expo, incluso `icon.png`.
- `docs/`: audit, provenance, check di rilascio e handoff.
- `.github/workflows/`: CI, web deploy e build/distribuzione; inventariare i singoli YAML prima di cambiarli.
- `ios/` e `android/`: presenza e contenuti nel checkout **da verificare**, non presumerli versionati.

## Dataset e significato dei campi
- Sorgente canonica di generazione: `legacy/web/artifacts/floot-readiness/` (manifest con SHA-256), integrata da `src/data/supplementary-literature.json` e trasformazioni in `scripts/prepare-mobile-data.mjs`.
- **Output generato**: `src/data/catalog.json` (148 unità didattiche, non 148 specie tassonomiche), `groups.json` (66 gruppi/generi), `areas.json` (71 macroaree), `exam-bank.json`.
- `id`: identificatore stabile; `scientificName`: etichetta tassonomica; `rank`: specie/sezione/gruppo ecc.; `kind`: ruolo, es. `teaching-group`.
- `commonNames`, `aliases`, `currentAcceptedNames`: nomi comuni, sinonimi/alternative, nomi accettati (non intercambiabili).
- `characters`: tre caratteri del 3+1; `differentiatingCharacter`: quarto carattere differenziale; `lookalikes`: confronti; `habitat`: contesto ecologico.
- `diagnosticStatus`, `deepMorphologyRequired`: limiti della diagnosi; non certificazioni.
- `studyProfile.odor`: odore documentato; `studyProfile.sporePrint.{label,color,scale}`: sporata; `studyProfile.edibility.{label,category,precautions,syndrome}`: classificazione didattica e possibili avvertenze; non autorizza consumo.
- `sources[]`: `sourceId`, `title`, `url`, `location`, `supportedClaim`, `fields`, `reviewScope`, `reviewStatus` ove presenti; una fonte generale non valida automaticamente ogni campo.
- `referenceImages[]`: `src`, `view` (`lateral`, `top`, `underside`), `alt`, `credit`, eventuali `subjectTaxon`, `sourceUrl`, `licenseUrl`. `credit` non implica autorizzazione.
- `curriculum`: origine nel programma didattico; `commercialization`: contesto normativo, distinto dalla commestibilità.
- Le macroaree contengono centro `[latitudine,longitudine]`, habitat e segnali euristici, **non** indicatori meteo in tempo reale.

## Aggiunta o correzione di un taxon
1. Identificare l'unità curricolare e il suo rango: non inserire manualmente un record nel solo JSON generato.
2. Modificare la fonte canonica/registro di evidenze e la trasformazione appropriata in `scripts/`, preservando ID, manifest e checksum.
3. Annotare fonti puntuali per ogni carattere; mai propagare un carattere di genere come certo per una specie.
4. Verificare triade anatomica, identità del soggetto, autore, licenza e diritti commerciali; se assenti, lasciare il dato non documentato.
5. Rigenerare con `npm run prepare:data`; verificare `catalog.json`, `exam-bank.json` e mappatura asset.
6. Eseguire verifiche, documentare delta, limiti e approvazione scientifica separatamente dalla validazione software.

## Comandi verificati
```bash
npm ci
npm run prepare:data
npm start
npm run ios
npm run android
npm run typecheck
npm run test:release-readiness
npm run validate:release
npm run export:release-readiness
npm run export
```
- `npm run ios/android`: `expo run:ios` / `expo run:android`; richiedono ambiente nativo idoneo.
- Test/lint: script `lint` e `test` generico **non presenti** in `package.json`; esistono test e controlli dedicati da censire nei workflow e in `legacy/web`.
- `validate:release` è intenzionalmente strict: non rendere verde inserendo dati fittizi.

## Ambiente e segreti
- Nomi osservati: `EXPO_PROJECT_ID` (`app.config.js`, `eas.json`); `FUNGO_CATALOG_JSON`, `FUNGO_GROUPS_JSON`, `FUNGO_RELEASE_READINESS_REPORT` (override del gate).
- Ricercare altre variabili nei workflow/moduli prima di affermarne l'assenza. Non copiare in documentazione token, chiavi, valori, credenziali o file `.env`.

## Build e rilascio
- `eas.json`: profili `preview` (Android APK, simulatore iOS), `production` (store, Android AAB, autoincremento, canale production), `iphone-library` (installazione interna su device).
- Build: `npx eas-cli build --platform ios --profile production` oppure `--platform android --profile production`.
- Submit: `npx eas-cli submit --platform ios --profile production` / `--platform android --profile production`; configurazione Google Play `internal`, `draft`; **non significa pubblicato**.
- Verificare sempre app version, build number remoto EAS, commit SHA, workflow, binario TestFlight e versione selezionata in App Store Connect prima di affermare allineamento.
- OTA: `expo-updates` con runtime fingerprint quando configurato; non distribuire modifiche native come soli OTA.
- Prodotto corrente: download gratuito; demo tutte le schede Agaricus + test4casi ripetibile; unico annuale19,99€. Nessun Base. Android demo-only. Dashboard/progressi separati dai diritti StoreKit.
- StoreKit annuale attuale: `lib/subscriptionPolicy.ts`, `hooks/useSubscription.ts`, `modules/fungo-subscription/`; nessun acquisto Base permanente implementato nel codice letto.

## Convenzioni e sicurezza
- Componenti React/TSX PascalCase; hook `use...`; funzioni/script JS camelCase; ID catalogo stabili in kebab-case. Conservare convenzioni specifiche di file esistenti.
- TypeScript `strict` (`tsconfig.json`). Non introdurre dipendenze senza giustificazione e compatibilità SDK 58.
- No accesso premium tramite flag locale: deriva da verifiche StoreKit valide. Non indebolire con workaround di test.
- Dati personali/locali: evitare riscritture distruttive e migrazioni senza backup; verificare privacy e permessi.
- Rilasci multipiattaforma: distinguere comportamento iOS, Android, web e verificare ciascuno.
- Le proposte di Claude/ChatGPT non sono fatti finché il codice, le prove e il responsabile non li confermano.

## Regole micologiche (non negoziabili)
- App esclusivamente di **studio**: nessuna foto, quiz, somiglianza o classificazione alimentare abilita l'uso alimentare. Per il consumo rivolgersi agli Ispettorati micologici ASL.
- Nessun dato tassonomico, tossicologico, di latenza, dose, sindrome o commestibilità privo di evidenza puntuale deve essere promosso a verità; controversie e lacune vanno segnalate a un revisore qualificato, non riempite per inferenza.
- Separare `species`, `speciesGroup`, `section`, `genus`, sinonimi e identificazioni solo probabili. Usare nomenclatura aggiornata **quando documentata** e preservare i sinonimi.
- Per ogni immagine: taxon del soggetto, vista, autore, provenienza, licenza e autorizzazione compatibile con uso commerciale. Se la licenza non è dimostrabile, bloccare la pubblicazione dell'asset.
- Mantenere distinta l'evidenza bibliografica dalla **revisione micologica indipendente**; nessun test software sostituisce quest'ultima.
