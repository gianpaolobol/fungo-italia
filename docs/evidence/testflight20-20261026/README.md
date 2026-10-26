# TestFlight 1.1.0 (20) — ricevuta finale

Verifica Apple26/10/2026 ore18:32:54 UTC: **IN_BETA_TESTING**, processing **VALID**. Build Apple `d1127faf-fbb5-4d34-819e-cfb2ebfb4d11`. Solo gruppo interno account holder `f642807c-e4b2-43d4-a32a-d9fd087fdfe3`, un membro verificato, zero tester individuali. Conferma separata in sola lettura alle18:33:01 UTC. Sorgente app `b844fb2cb53b497d5301ad86e737e03886c55a69`; il successivo commit documentale non cambia l'app compilata.

- [Apple TestFlight](https://appstoreconnect.apple.com/apps/6821140326/testflight/ios)
- [EAS Submit FINISHED](https://expo.dev/accounts/gianpaolobol/projects/fungo-italia-/submissions/f02f940d-07e5-476f-8f83-6ccabb959041), creato17:31:32, completato18:28:16 UTC.
- [Produttore IPA e log originali](https://github.com/gianpaolobol/fungo-italia/actions/runs/40357011280/job/121727450378): build e firma success, invio client fallito per DNS Expo alle18:20:47; submission server completata successivamente. Non riscritto come successo.
- [Recupero della conferma Apple: SUCCESS](https://github.com/gianpaolobol/fungo-italia/actions/runs/40378621868/job/121768437771), orchestratore su branch audit, commit `2c92a65a24a5ed9b757e068b7f28bb2c73147ee1`. Checkout applicativo esatto b844, nessun nuovo upload, cancellazione o pubblicazione pubblica. Revisione tecnica separata senza difetti bloccanti.
- [Lettura EAS di sola verifica, tentativo2](https://github.com/gianpaolobol/fungo-italia/actions/runs/40375880753/attempts/2).

## Prove obbligatorie dello stesso sorgente

| Verifica | Esito | Workflow |
|---|---|---|
| Atlante, policy, scienza beta del titolare | PASS | [40357011228](https://github.com/gianpaolobol/fungo-italia/actions/runs/40357011228) |
| Source, rigenerazione senza drift, TypeScript, export iOS, web WebKit/Chromium/smoke | PASS | [40357011280 source](https://github.com/gianpaolobol/fungo-italia/actions/runs/40357011280/job/121727452818) |
| StoreKit nativo, acquisto verificato/rimborso/scadenza | PASS | [40357011278](https://github.com/gianpaolobol/fungo-italia/actions/runs/40357011278) |
| UI acquisti annuale, riapertura/ripristino/rimborso/scadenza iPhone e iPad | PASS | [40357011216 tentativo2](https://github.com/gianpaolobol/fungo-italia/actions/runs/40357011216/attempts/2) |
| Demo iPhone e iPad | PASS | [40357011285](https://github.com/gianpaolobol/fungo-italia/actions/runs/40357011285) |
| Recupero e IN_BETA_TESTING | PASS | [40378621868](https://github.com/gianpaolobol/fungo-italia/actions/runs/40378621868) |

Il primo job iPad e il primo beta non avevano acquisito runner macOS per limiti di capacità; i retry hanno mantenuto lo stesso sorgente. Il probe opzionale diagnostico di avvio entitlement resta intenzionalmente escluso dalla suite UI standard preesistente; le due prove obbligatorie di ciascun dispositivo sono riuscite. Suite locali policy del recupero40/40,0skip; suite completa del cambiamento272/272,0skip. Non interpretare questi conteggi come numero di test nativi.

## Ricevute e conservazione

- [consolidated-testflight.json](consolidated-testflight.json): ricevuta Apple finale integrale con source, build, scope, gruppo, disponibilità, prove e diagnostiche scientifiche strict.
- [consolidated-build.json](consolidated-build.json): ricevuta originale del binario con provenienza e recupero annotato.
- [internal-beta-science.json](internal-beta-science.json): nuova verifica del contenuto invariato,867 file e dichiarazione del titolare fissata da hash.
- Artefatto finale `Owner-TestFlight-build20-final-proof`, ID12678475207, SHA-256 ZIP `5ec29cbb9e227ebaf2665163b8da498a008cf07d2df57b0edf348c2a5b6ce482`, conservato90giorni; ricevute qui versionate senza scadenza del workflow.
- IPA originale `Consolidated-signed-IPA`, ID12674659320, ZIP SHA-256 `a0aa894ad82af7056c2744a73ec4103bb79e9199be815c4d0085fcf8e6f605f4`; binario SHA-256 `b9870cf8658ebc3154356232e6941340c762561f51de9ba109f2ac3a7c988b7e`, conservazione CI7giorni.

Expo Doctor ha segnalato2 diagnostiche nel build: euristica sulla configurazione dinamica e disallineamenti rispetto alle versioni SDK consigliate. Il primo è verificabile da `app.config.js`, che importa `app.json`; le raccomandazioni restano aperte. Non sono state disabilitate o dichiarate superate. Il build e le suite native obbligatorie sul sorgente bloccato sono riusciti.

La dichiarazione del titolare autorizza esclusivamente il suo collaudo interno.148schede non revisionate indipendentemente,143triadi,147sporate e147giudizi/148 restano espliciti. Nessuna certificazione micologica, nessuna selezione App Store e nessuna promozione web pubblica. Gestione dei revisori riservata all'amministratore, invisibile agli utenti.
