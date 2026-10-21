# Readiness per App Store e Google Play e monetizzazione — 21/10/2026

> Da questo ambiente non sono raggiungibili GitHub Actions, App Store Connect, TestFlight né Google Play Console. Ogni stato non ricavabile da file versionati è indicato come **NON VERIFICATO**. I dati con data provengono da registri presenti nel repository e vanno riletti alla fonte.

## Stato per piattaforma

| Stato | iOS 1.0 (`main`) | iOS 1.1.0 (branch `design/study-dashboard-v1-1`) | Android |
|---|---|---|---|
| CODICE PRONTO | Parziale: solo annuale | Parziale: Base + annuale + Dashboard; branch non integrato | No: nessun billing, accesso completo gratuito |
| BUILD VALIDA | 1.0.0 (9) `VALID` secondo `docs/APP-STORE-SUBSCRIPTION-2026-10-16.md`. NON VERIFICATO oggi | 1.1.0 (13) `VALID`, `testFlightOnly:true` (`store/releases/study-1.1.0-build13.json`, 20/10). NON VERIFICATO oggi | APK preview con firma debug; AAB di produzione configurato in `eas.json`. NON VERIFICATO |
| TEST SUPERATI | StoreKit nativo PASS; **UI StoreKit iPhone/iPad non stabilmente verdi** (registro del 16/10) | `storekitUIVerified:false`; controlli UI “failure-before-Base” su iPhone e iPad | Smoke test su emulatore nella pipeline. NON VERIFICATO |
| INVIATO A REVISIONE | Versione 1.0 `WAITING_FOR_REVIEW` con la build `abed149c…` selezionata (registro del branch, 20/10 23:48). NON VERIFICATO oggi | No | No |
| APPROVATO | NON VERIFICATO | No | No |
| PUBBLICATO | No (README: “non ancora pubblicata”) | No | No |

## Monetizzazione: modello approvato e codice attuale

| Voce | Modello approvato | `main` | Branch `design/study-dashboard-v1-1` |
|---|---|---|---|
| Download | Gratuito | Gratuito ✅ | Gratuito ✅ |
| Base permanente 9,99 € | Non-consumable | **Assente** | `it.fungoitalia.base.lifetime`, `NON_CONSUMABLE`, 9,99 € ITA (`scripts/configure-base-purchase.mjs`) |
| Accesso completo +9,99 €/anno | Abbonamento annuale | `it.fungoitalia.premium.annual`: da solo sblocca tutto | Annuale acquistabile **solo dopo** la Base (`canPurchaseAnnual`) ✅ |
| Gratuito senza acquisto | — (da definire) | 5 schede + Aree | Anteprima (`study-preview.mjs`) |
| Android | Coerente con iOS | **Tutto gratuito** (`App.tsx:21`) | Invariato |

### Rischi

| ID | Gr. | Rischio | Evidenza | Proposta | Test |
|---|---|---|---|---|---|
| IAP-01 | **P0** | La 1.0 in revisione vende solo l'annuale. Gli abbonati 1.0 passerebbero poi a un modello in cui l'annuale “si aggiunge” alla Base | Registri citati | **Decisione del titolare prima dell'approvazione:** (a) ritirare la 1.0 dalla revisione e pubblicare direttamente la 1.1 con Base + annuale; oppure (b) pubblicare la 1.0 e garantire nella 1.1 che chi ha l'annuale conservi tutto (`deriveAccess` lo fa già: `annual → minimum+extended`), comunicandolo nelle note | Sandbox: utente con annuale 1.0 → aggiornamento a 1.1 → accesso invariato |
| IAP-02 | **P1** | A ogni `AppState==='active'` l'entitlement viene azzerato prima della verifica | `hooks/useSubscription.ts:48-49` | Tenere l'ultimo stato verificato durante la nuova verifica; aggiornarlo solo all'arrivo della risposta | Test: tornare in primo piano non smonta Esame e Studio |
| IAP-03 | **P1** | **Ipotesi** (non dimostrata) sul problema storico dei test UI iPhone: dopo il foglio di acquisto o un alert di sistema, iPhone emette `inactive→active`. Il gestore (IAP-02) avvia un nuovo `refresh()`, incrementa `generation` e scarta la risposta in volo. Se gli eventi si ripetono o la risposta di `Transaction.currentEntitlements` è lenta (> 20 s), la verifica resta “pendente”. Su iPad il foglio è una modale che può non cambiare lo `AppState`: questo spiegherebbe esiti diversi. Sul branch 1.1 il hook è stato riscritto (93 righe modificate): verificare lì la stessa logica | Registro del 16/10: “la verifica iniziale rimane pendente oltre 120 secondi” solo in alcuni run | Registrare in log ogni transizione di `AppState` e ogni `generation` nel test UI; disattivare il refresh durante `busy`; aggiungere un debounce | Log del run UI con transizioni e generazioni; 5 run iPhone verdi di fila |
| IAP-04 | P1 | Android distribuibile senza billing: se pubblicato su Play, tutto gratuito; aggiungerlo dopo richiederebbe di revocare l'accesso a utenti esistenti | `App.tsx:21` | Google Play Billing (Base + annuale) prima della pubblicazione, oppure Android limitato all'anteprima | Test con Play Billing in sandbox |
| IAP-05 | P2 | Periodo di tolleranza (billing grace period) ignorato: `expiry > now` toglie l'accesso durante il periodo di grazia | `FungoSubscriptionModule.swift:78` | Leggere `Product.SubscriptionInfo.status`/`renewalInfo.gracePeriodExpirationDate` | Test StoreKit con grace period attivo |
| IAP-06 | P2 | Il prodotto non viene ricaricato se il prezzo fallisce offline; “Prezzo non disponibile” resta fino a un nuovo refresh | `useSubscription.ts` | Riprova automatica al ritorno della rete | — |
| IAP-07 | P2 | Rimborso o revoca: gestiti tramite `Transaction.updates` e `revocationDate` ✅. Manca un test che verifichi la revoca **a app chiusa** | Swift | Test “revoca offline → riapertura” | — |

### Piano di migrazione commerciale (proposta)

1. Il titolare sceglie fra le opzioni IAP-01 (a) e (b).
2. Rebase di `design/study-dashboard-v1-1` su `main` (ARC-08), PR separate: (i) modulo StoreKit Base, (ii) gate di accesso, (iii) Dashboard.
3. Matrice dei diritti: nessun acquisto → anteprima; Base → obiettivi minimi + una sessione d'esame ripristinabile; Base + annuale → tutto; solo annuale (utente 1.0) → tutto. **Le schede auspicabili non esistono ancora** (SCI-11): oggi l'annuale aggiunge solo le schede di genere/gruppo e l'esame illimitato, quindi le descrizioni dei prodotti devono restare veritiere (Linee guida Apple 3.1.2 e 2.3).
4. Google Play: stessi prodotti (`base_lifetime` managed product, `premium_annual` subscription) con Play Billing Library; verifica lato client o con un server leggero.
5. Test sandbox su iPhone e iPad, e Play Billing su Android: acquisto, ripristino, rinnovo, rimborso, scadenza, offline.

## Policy e metadati

| Area | Stato | Note |
|---|---|---|
| Linea guida Apple 1.4.1 (rischio di danno fisico) | ⚠︎ Rischio | Un'app che fornisce dati di commestibilità **senza avvertenza visibile** nelle schede è esposta (SCI-03). La nota “non visibile, senza banner” decisa il 9/10 aumenta il rischio |
| Proprietà intellettuale (Apple 5.2, Google “Intellectual property”) | ⚠︎ **P0** | 379 immagini senza licenza degli autori (IMG-01) |
| Privacy (manifest, etichette) | NON VERIFICATO | `NSPhotoLibraryUsageDescription` e il plugin `expo-media-library` sono dichiarati, ma `App.tsx` non importa `PhotoLibrary`, `ThreePlusOneReview`, `Drafts`, `Community` né `ObservationPhotos`: la funzione Foto non è raggiungibile nell'app nativa. Togliere permesso e dipendenza, oppure attivare la funzione (Apple 5.1.1, privacy manifest) |
| Abbonamenti: testi obbligatori | ✅ | Prezzo, periodo, rinnovo automatico, EULA standard Apple, privacy, “Gestisci abbonamento” presenti in `SubscriptionGate.tsx` |
| Ripristino acquisti | ✅ | `AppStore.sync()` |
| DSA UE (trader status) | NON VERIFICATO | Checklist del titolare in `docs/APP-STORE-OWNER-CHECKLIST.md` |
| Google Play: target SDK, Data safety, sezione Salute | NON VERIFICATO | — |
| Screenshot | 6 nativi annual-only (registro del 16/10) | Vanno rifatti per la 1.1 (Base + Dashboard) |
| Mappa OSM | ⚠︎ | Policy delle tile OSM e attribuzione (UX-08) |
| Contenuti psicotropi | ⚠︎ | *Panaeolus cyanescens* e *Psilocybe*: tono strettamente tossicologico; nessuna informazione d'uso (oggi è così ✅) |
