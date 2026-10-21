# Handoff — Fungo Italia

## Stato al 21 ottobre 2026

Questo documento descrive il branch `design/study-dashboard-v1-1`, PR #107, non il codice già distribuito su main. Il 21 ottobre main contiene anche nuovi file iniziali AGENTS.md, CLAUDE.md e docs/HANDOFF.md. Integrare i due handoff preservando questo stato verificato; non sovrascrivere il lavoro parallelo degli altri agenti.

## Implementazione e distribuzione

- Versione studio 1.1.0: Dashboard con fungo percentuale, copertura e preparazione separate, storico, lacune, prossima attività; banca 214 casi / 336 domande.
- Modello: download gratuito, Base permanente 9,99 € (minimi e una sessione), completo aggiuntivo 9,99 €/anno. Accessi annuali precedenti conservati.
- TestFlight 1.1.0 (13) deriva da `976702381e32d66893d8922e1a85e7a3300eceb3`. I commit successivi sono diagnostici, test e documentazione, non una nuova IPA.
- Ultima lettura Apple: 21/10/2026 01:48:59 Europe/Rome; build VALID, non scaduta, gruppo interno assegnato, IN_BETA_TESTING. App Store 1.0 WAITING_FOR_REVIEW con un'altra build. Lettura senza scritture Apple.
- Dettagli esatti: `store/releases/study-1.1.0-build13.json` e `store/releases/study-build13-apple-readback.json`.

## Verifiche

- 153 test sorgente, TypeScript, export iOS riusciti.
- Nuova regressione nativa StoreKit: 3/3 riusciti, run 39505471948. Prova nativa originale del candidato: 2/2.
- Verifiche sull'ultimo commit documentale b06b5f4: Dashboard run 39517551936 e 39517545370 riusciti; scientific generator run 39517551927 riuscito. Quest'ultimo non è una revisione scientifica indipendente.

## Blocco aperto

**UI acquisti non verificata. Nessuna correzione di produzione dimostrata.** Sul simulatore la query Transaction.currentEntitlements resta in attesa nel percorso UI prima di Base. Prodotti-prima-degli-accessi fallisce comunque su iPhone e iPad. La modalità UseDestinationArtifacts richiede un dispositivo fisico; runtime alternativi 26.1 e 26.6 non scaricabili nell'ambiente CI. Non presentare questi tentativi come successi dell'app.

Diagnosi, limiti e procedura su iPhone fisico: `docs/STOREKIT-UI-BLOCKER.md`.

## Decisioni e prossimi passi

1. Provare la build 13 su iPhone tramite TestFlight: Base, annuale, riapertura, ripristino; registrare primo errore e schermata. Completare poi annullamento, errori, scadenza e rimborso con controlli sandbox.
2. Conservare storekitUIVerified=false finché l'intero collaudo non è superato. Non cambiare verificatore, firme o concessione degli accessi per aggirare i test.
3. Non unire PR107 per pubblicare App Store 1.1 mentre resta questo blocco. Non modificare la revisione App Store 1.0.
4. Non generare una nuova IPA per soli cambi diagnostici/documentali. Un'eventuale correzione del prodotto richiede verifiche nuove e una build tracciata al suo sorgente.
5. Difetto UI minore osservato ma non corretto: etichetta tab Abbonamento va a capo su iPhone. Valutare Acquisti mantenendo l'identificatore di test quando si riprende l'intervento sull'app.

## Ultima sessione

- Strumento: Codex / ChatGPT.
- Branch/PR: design/study-dashboard-v1-1 / https://github.com/gianpaolobol/fungo-italia/pull/107.
- Eseguito: lettura Apple attuale, registrazione delle prove positive/negative, procedura di collaudo fisico, controllo CI finale. Nessuna modifica del codice applicativo né ulteriore upload IPA.
