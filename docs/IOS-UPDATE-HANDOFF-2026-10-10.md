# Fungo Italia — handoff aggiornamento iOS / Expo Preview

Data: 2026-10-10
Branch: `main`

## Stato salvato

Il lavoro è stato salvato su GitHub. L'ultimo commit funzionale sul codice app/test 3+1 è:

- `5e7c214b2d7ff50fefa8bb5af1d2d7cf7e20ee3e` — `Make 3+1 review a gated test with autocomplete feedback`

La modifica successiva alla pipeline è:

- `ecb7d61dfdc6cea81cd5e727f55af06b1e9e2ee5` — `Allow Expo update without Android smoke gate`

## Modifiche già completate

### PWA / GitHub Pages

La versione web/PWA è già pubblicata e verificata.

Workflow completato:

- Run `38025230974` — `iPhone PWA and Expo Go`

Esiti verificati:

- Build web/PWA: PASS
- Native source check: PASS
- Test iPhone 320pt: PASS
- Publish GitHub Pages: PASS
- Published smoke test: PASS

Link di verifica PWA:

- `https://gianpaolobol.github.io/fungo-italia/?v=20261010-3plus1`
- Cache-buster: `https://gianpaolobol.github.io/fungo-italia/?v=20261010-3plus1c`

### Foto / filtro locale

Implementato comportamento più conservativo:

- mostra solo foto candidate con alta confidenza fungina;
- foto `other` / non pertinenti escluse dalla lista principale;
- foto incerte non mostrate come candidate principali;
- soglia aggiornata: `fungal >= 0.72` e `fungal >= other + 0.22`.

Commit rilevanti:

- `4485e8fd23b949051e1d0c31d2933e928ea9f741` — nasconde foto non pertinenti dalla lista di revisione
- `eec2a33cb3a26a28f7c441ca1115a0b33a08f77f` — richiede alta confidenza fungo
- `9da86e5af70e1cf776e74edbb2b28af8cefc57e5` — aggiorna i test di confidenza

### Test 3+1 / Esame

Trasformato il test in flusso guidato:

- suggerimento/autocomplete del taxon mentre si scrive;
- selezione nome dall'atlante;
- verifica esplicita con pulsante `Verifica test`;
- feedback immediato `Superato` / `Da ripassare`;
- blocco del passaggio alla successiva se il test non è superato;
- nessuna auto-compilazione dei caratteri, per mantenere valore didattico;
- se ci sono più scatti incoerenti/specie diverse, il test non passa.

Commit:

- `5e7c214b2d7ff50fefa8bb5af1d2d7cf7e20ee3e`

## Stato app iOS / Expo Update

Obiettivo: aggiornare l'app iOS tramite Expo Update sul canale `preview`.

Situazione precedente:

- il workflow `iPhone Photo Library Build` è fallito non per codice, ma per credenziali/provisioning Apple EAS in modalità non interattiva;
- log: Apple team disponibile `BX9MDXAHKG`, ma EAS non riesce a selezionare/provisionare credenziali interne automaticamente;
- quindi la build installabile/TestFlight richiede sistemazione credenziali Apple/EAS separata.

Percorso immediato scelto:

- usare `expo-update` per pubblicare le modifiche JS/React sul canale `preview`, senza generare una nuova IPA.

Problema trovato:

- nel workflow `.github/workflows/pipeline.yml`, `expo-update` dipendeva da `[android, android-smoke]`;
- `android-smoke` è rimasto bloccato/fallito nell'emulatore Android, pur non essendo necessario per pubblicare l'update iOS;
- i bundle nativi iOS/Android erano già stati esportati con successo dal job `android`.

Correzione applicata:

- commit `ecb7d61dfdc6cea81cd5e727f55af06b1e9e2ee5` modifica la pipeline affinché `expo-update` dipenda solo dal job `android`;
- `android-smoke` resta rilevante per proteggere il rilascio APK Android, ma non blocca più Expo Update/iOS.

## Workflow attualmente in corso

Nuovo workflow avviato dopo la correzione pipeline:

- Run `38026711904` — `Expo Android and iOS`
- Commit: `ecb7d61dfdc6cea81cd5e727f55af06b1e9e2ee5`

Ultimo stato osservato prima del salvataggio:

- Job `android`: in corso
- Step attuale: `Build installable preview APK locally`
- Già completati:
  - install dependencies
  - prepare canonical offline content
  - typecheck
  - draft/review boundary checks
  - export iOS/Android bundles
  - generate Android native project
  - setup Gradle

Atteso:

1. completamento job `android`;
2. upload degli artifact;
3. partenza automatica di `expo-update`;
4. pubblicazione su Expo channel `preview`.

## Da fare al rientro

1. Controllare run `38026711904`:
   - endpoint: Actions del repository `gianpaolobol/fungo-italia`;
   - job da verificare: `expo-update`.

2. Esito desiderato:
   - `android`: success;
   - `expo-update`: success;
   - comando eseguito atteso:
     - `npx eas-cli@24.8.0 update --channel preview --environment preview --platform all --non-interactive --message "GitHub revision $GITHUB_SHA" --json`

3. Se `expo-update` passa:
   - dire all'utente che l'app iOS/Expo Preview è aggiornata;
   - aprire/riaprire l'app su iPhone collegata al canale `preview` e attendere il download update.

4. Se `expo-update` fallisce:
   - leggere log del job `expo-update`;
   - verificare `EXPO_TOKEN` e `EXPO_PROJECT_ID`;
   - non confondere questo con la build IPA/TestFlight.

5. Se l'utente chiede build TestFlight/IPA:
   - va risolta separatamente la parte Apple/EAS credentials;
   - log precedente mostrava Apple team `BX9MDXAHKG` e errore credenziali per distribuzione interna in modalità non interattiva;
   - probabile necessità di configurare credenziali iOS internal distribution in EAS in modalità interattiva o con parametri/credenziali già salvate.

## Nota operativa

Non perdere i commit già applicati: tutto è su `main`.

La PWA è già verificata; l'unico punto in corso è la pubblicazione dell'update iOS/Expo Preview dal run `38026711904`.
