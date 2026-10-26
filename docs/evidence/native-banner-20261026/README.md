# Fungo Italia1.1.0(21) — avviso TestFlight rimosso

**Disponibile: VALID e IN_BETA_TESTING**,26/10/2026 ore19:53:24 UTC. Apple build `973f19b7-d772-4418-9df0-250fcc6c957a`, unico gruppo interno del titolare `f642807c-e4b2-43d4-a32a-d9fd087fdfe3`, zero tester individuali. Lettura Apple separata19:53:56 conferma gli stati. Installare la21 dalla scheda Fungo Italia in TestFlight per ricevere la correzione.

Sorgente app `6dfb92656ec94485d94aecba72543930c2759d17`. I successivi commit documentali non sono il sorgente del binario. IPA SHA-256 `05164da1bfc4210b1b9aa691ce542b570409619fb89eb97123a2b3ce12199c3c`.

## Esito e collegamenti

- [Apple TestFlight](https://appstoreconnect.apple.com/apps/6821140326/testflight/ios).
- [Recupero e verifica finale: SUCCESS](https://github.com/gianpaolobol/fungo-italia/actions/runs/40389796201), job121807481240, orchestratore `ca3f0e75eb629c568fda7238b0b4a0503116ba36` sul branch audit. Checkout applicativo esatto6dfb, nessuna sostituzione del sorgente con lo SHA dell'orchestratore.
- [Produttore originale EAS](https://github.com/gianpaolobol/fungo-italia/actions/runs/40380720179/job/121789031798): build/firma/gate prima dell'invio success; workflow failure perché il tentativo EAS in coda è stato intenzionalmente annullato. Non rinominato successo.
- [Submission EAS: CANCELED](https://expo.dev/accounts/gianpaolobol/projects/fungo-italia-/submissions/24c5a181-4984-4d4e-8807-cc9b1b21340f). Creato19:25:10, cancellazione letta19:47:46 UTC prima del caricamento diretto. L'invio altool è riuscito19:50:17; stessa IPA originale EAS verificata per hash, plist e sorgente incorporato. Delivery UUID uguale all'ID Apple build.

## Verifiche sullo stesso sorgente

| Controllo | Risultato | Ricevuta |
|---|---|---|
| Atlante e gate beta del titolare | PASS | [40380720195](https://github.com/gianpaolobol/fungo-italia/actions/runs/40380720195) |
| Web condiviso | PASS | [40380720157](https://github.com/gianpaolobol/fungo-italia/actions/runs/40380720157) |
| Source,273test,TypeScript,rigenerazione,export iOS,WebKit/Chromium/smoke | PASS | [source121775866782](https://github.com/gianpaolobol/fungo-italia/actions/runs/40380720179/job/121775866782) |
| StoreKit nativo acquisto/rimborso/scadenza | PASS | [40380720323](https://github.com/gianpaolobol/fungo-italia/actions/runs/40380720323) |
| Acquisti UI iPhone/iPad, riapertura/ripristino/rimborso/scadenza | PASS | [40380720277](https://github.com/gianpaolobol/fungo-italia/actions/runs/40380720277) |
| Demo iPhone/iPad | PASS | [40380720294](https://github.com/gianpaolobol/fungo-italia/actions/runs/40380720294) |
| Pipeline Android | PASS | [40380720325](https://github.com/gianpaolobol/fungo-italia/actions/runs/40380720325) |

Test specifico del riquadro: rosso prima della correzione (hook di controllo remoto montato su nativo), verde dopo; verifica rendering nullo e zero controllo remoto per tutti gli stati con/senza dettagli su iOS/Android, preservando azioni e dettagli web. Revisione tecnica separata senza blocchi. Suite locale273/273,0fallimenti/skip; stesso totale riconfermato in CI. Il probe diagnostico opzionale preesistente di avvio entitlement rimane escluso dalla suite UI standard; nessuna prova obbligatoria è stata saltata.

Schermate native del sorgente esatto esaminate: assenza del riquadro nella schermata iPhone Aree con intestazione visibile. Artefatto UI `Native-App-Store-screenshots` ID12678439965, ZIP SHA-256 `17ba546cb6a4dbeadffac10e7c1906e1e78623017a1a80564700898d73a6a6e1`.

## Recupero del trasporto

I preflight ausiliari40388028589/40388398000 hanno rilevato le opzioni diverse di altool26.40.1;40388907031/40389381778 hanno rilevato che list-providers non accetta API key. Tutti si sono fermati prima di cancellare EAS. L'ultimo percorso usa le opzioni rilevate dal runtime e prova autenticazione tramite JWT generato dal caricatore, mascherato e accettato da Apple per l'app esatta. Poi richiede CANCELED per la sola submission autorizzata, recupera gli artefatti originali e ricontrolla source/quorum/scienza/platea prima dell'upload. Dieci prove offline su identità, cancellazione terminale e attesa di almeno180secondi prima dell'eventuale interruzione del client GitHub superate; revisione tecnica degli adeguamenti senza blocchi. Il client originale ha chiuso autonomamente dopo la cancellazione EAS e ha conservato l'IPA; nessuna interruzione GitHub aggiuntiva è stata necessaria.

File conservati:

- [consolidated-testflight.json](consolidated-testflight.json): ricevuta Apple integrale, IN_BETA_TESTING e unico gruppo.
- [consolidated-build.json](consolidated-build.json): provenienza del binario e recupero annotato.
- [internal-beta-science.json](internal-beta-science.json): dati immutati e veri esiti strict.
- [eas-cancellation.json](eas-cancellation.json): cancellazione esatta confermata prima dell'upload.
- [apple-upload.log](apple-upload.log): ricevuta altool senza JWT o chiavi private.
- [native-test-results.log](native-test-results.log) e [verification.json](verification.json): risultati nativi e riepilogo verifiche.

Artefatto finale `Native-banner-TestFlight-recovery-proof` ID12684730020, ZIP SHA-256 `e10cc567aa67d7d797bb37c91467abfdfde96ef7801e44dfb406e27f612a7d46`,90giorni. IPA originale `Consolidated-signed-IPA` ID12682715564, ZIP SHA-256 `59ecb9eae222be4c3b92fa5171fc0d8b53b9b374c28307e935ce1a9a77a2b026`,7giorni. Le ricevute qui versionate rimangono oltre la scadenza degli artefatti.

## Revisione scientifica

867file invariati, digest `79d2514801e544dbdcfecbe140ff6aab909e5e1da51b0d4d2e49cf4a56553499`. La dichiarazione del titolare consente la sola beta interna;148revisioni indipendenti restano pendenti,143triadi strutturali,147sporate e147giudizi/148. Nessuna certificazione da questi test. [Fascicolo corrente per l'admin](../../reviews/independent-review-20261026-current/README.md):218unità e2398decisioni ancora PENDING, invio e acquisizione privata esclusivi dell'admin; due revisori distinti per i pacchetti critici. Nessuna UI revisori aggiunta agli utenti. `appStoreReady=false`, nessuna pubblicazione App Store o promozione web pubblica. Le raccomandazioni Expo Doctor già documentate restano aperte, non nascoste o rinominate PASS.
