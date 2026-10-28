# Android Play Billing Implementation Plan

> For agentic workers: execute inline using superpowers:executing-plans.

Goal: implementare il percorso Google annuale e produrre un candidato Android interno, senza distribuzioni pubbliche.
Architecture: modulo Expo Kotlin, verifica Node tramite Google API, hook condiviso e copy per piattaforma.
Tech Stack: Expo 58, Kotlin, Play Billing 8.3.0, Node 24 senza nuove dipendenze JS runtime.
Spec: docs/superpowers/specs/2026-10-27-android-play-billing-design.md

## Global Constraints
Package it.fungoitalia.app; prodotto it.fungoitalia.premium.annual; piano annual; Italia EUR19.99; nessun dato scientifico/iOS/OTA modificato. Token e chiavi solo server, mai loggati. Demo in assenza di verifica. Nessun abbonamento fittizio.

## Review Focus
Token revocato durante acknowledgment; offerte trial/mensili; callback dopo distruzione; backend non configurato; firma AAB stabile assente.

## Task 1: Verifica server
Files: server/play-billing/{verify,google,server}.mjs; scripts/play-billing.test.mjs.
Consumes: purchaseToken posseduto. Produces: active/productId/expiresAt/checkedAt/nonce.
- [ ] Test RED per stati, prodotto/piano, scadenza, ack e secondo controllo, errori e nonce.
- [ ] Implementare verifica Google e server con timeout, limiti corpo/concorrenza, nessun log sensibile.
- [ ] Test GREEN e suite base.

## Task 2: Android e UI
Files: modules/fungo-subscription/android, expo-module.config.json, index.ts; hooks/useSubscription.ts; components/SubscriptionGate.tsx; lib/subscriptionStore.ts.
Consumes: endpoint compilato. Produces: contratto nativo esistente, acquisti/restore/aggiornamenti, copy Google.
- [ ] Test RED per offerte anno/no trial e configurazione; implementare nativo e policy condivisa.
- [ ] TypeScript, test Node, prebuild/autolinking e compilazione Android CI.

## Task 3: Build interna e consegna
Files: .github/workflows/android-play-billing.yml; docs/ANDROID-PLAY-BILLING.md; master/handoff.
- [ ] Workflow separato su feature branch: test, prebuild, APK/AAB diagnostici, nessuna pubblicazione automatica.
- [ ] Se firma EAS disponibile, candidato store su stesso SHA, senza submit automatico. Mai caricare firma debug.
- [ ] Revisione separata, correggere difetti importanti con regressioni, commit/push/PR e leggere gli esiti CI.
- [ ] Registrare esattamente blocchi credenziali/hosting/Play; non attestare acquisti reali senza prova nel canale Play.

## Ledger di esecuzione
- Baseline312 test Node PASS; ramo isolato in clone dedicato. Nessuna riscrittura main.
- Task1: implementato localmente; test RED→GREEN per stati/ack/scadenza/nonce; readiness OAuth rilevata dalla revisione e corretta con canary test reale acknowledged.
- Task2: TypeScript e324Node PASS;10Java PASS; prebuild e autolinking PASS. Compilazione Kotlin ancora non verificata per download Gradle con rete irraggiungibile.
- Task3: workflow e runbook predisposti. Push negato da automatic approval review, nessun tentativo alternativo. Attesa consenso specifico. Firma EAS/artefatto/Play e backend restano non verificati.
- Ruling: nessun provider di hosting creato e nessun diritto Google aggiunto senza consenso specifico; acquisti restano disabilitati fino alla configurazione verificata.
- Revisione separata conclusa: unico P1 readiness corretto, test precedentemente falliti e ora verdi. Non equivale a test Google reali o compilazione nativa.
