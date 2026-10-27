# Fungo Italia — build 22 interna e candidato web abbinato

## Stato verificato — 27 ottobre2026

**Web e TestFlight22 distribuiti dallo stesso sorgente applicativo fab2b3eb5724b92b74ad3ed0e76ad2094ea2fd03. Incarico complessivo parziale per cartografia pubblica.**

- TestFlight1.1.0(22), Apple VALID/IN_BETA_TESTING, solo gruppo interno del titolare. Rilettura reale00:56:09.178Z.
- GitHub Pages pubblicato dal candidato originale nel run40423289727;1652file verificati nuovamente dal dominio. Quel primo run resta FAILURE al collaudo upgrade.
- Recupero40429334273/job121942912090 SUCCESS, solo verifica e nessuna nuova distribuzione: stesso IPA/candidato/consenso. Chromium151 e WebKit26.5 verificano sorgente, JS effettivo, icona, Aree71, note/preferiti/sessione/storico e vera interruzione dell'intero dominio pubblico con nuovo documento servito dal worker.
- Replay dei byte originali19→22 su unico origin privato: entrambi i browser eseguono Aggiorna anteprima, cambiano realmente documento/JS/worker, conservano integralmente gli stati, poi funzionano con origin applicativo arrestato. Metadati pubblici indipendenti rimangono raggiungibili. **Non equivale alla continuità dei profili del primo deploy, che sono persi.**
- Il vecchio runtime1.56.1/2215 riproduce nel fixture privato risposte CacheStorage null; il corretto1.62.0/2336 conserva il corpo dopo ricarica/riapertura. Nessun cache.put o riparazione artificiale applicato alla PWA. Fallimenti e ricevute precedenti conservati.
- Controllo manuale pubblico:71macroaree/20regioni, Toscana6, ricerca Amiata1, habitat e4schede PASS, nessun Abbonamento involontario. **Cartografia FAIL nel browser cloud: immagini OSM403 Access blocked/policy.** Causa esatta del403 non attestata; il test locale dell'iframe opaco rileva assenza di Referer. Nessun aggiramento, rotazione identità, cambio endpoint o allentamento sandbox. Correzione applicativa in branch separato, richiede nuova IPA e nuovo consenso sul candidato, non riusa22.

[Blocco cartografico effettivo](public-20261027/cloud-osm-policy-block.jpg), [PWA WebKit dopo interruzione reale del dominio](public-20261027/public-webkit-offline.png), [ricevute e confronto runtime](public-20261027/), [stato machine-readable e limiti](status.json), [run finale](https://github.com/gianpaolobol/fungo-italia/actions/runs/40429334273). Artifact12701019062 ZIP8e3a9dc4974cd88f81dbf285baee17749942f47fd94f9cb8aaddc7ca41c376ca; archivio19 originale12699061819 ZIPfff1345d68646fef7ec0c08b0a72819a748a18486ef509cd694f497bc09feb7f. Storico e rollback non distruttivo preservati; nessun rollback reale o Home Screen Safari fisico attestato.

Dataset867file invariato, manifest79d2514801e544dbdcfecbe140ff6aab909e5e1da51b0d4d2e49cf4a56553499. Zero revisioni indipendenti; nessuna certificazione o pubblicazione App Store, nessun tester esterno.

Le sezioni sottostanti sono checkpoint storici e non sostituiscono questo stato corrente.


## Aggiornamento pubblico22 — 27 ottobre2026

Il consenso distinto «Confermo» è registrato con digest0bfd121683127fac212c77af09f7dde3a5f5754e613eb89ffca35770f8d44b21. Il run40423289727 ha distribuito effettivamente1.1.0(22) da fab2b3eb5724b92b74ad3ed0e76ad2094ea2fd03 e verificato tutti1652file dal dominio alle00:01:28.723Z. Apple è stata riletta VALID/IN_BETA_TESTING, gruppo esclusivo del titolare. Nessun ampliamento o certificazione indipendente.

Il run resta FAILURE: nel controllo upgrade il worker nuovo controllava ancora un documento con JavaScript19. Il verificatore attendeva il worker, non necessariamente il ricaricamento effettivo. Correzione limitata a QA/workflow; applicazione firmata e autorizzazione immutate. I profili originali non erano stati archiviati e non se ne dichiara recuperata la continuità. Si conservano errore e archivio completo19 (artifact12699061819, ZIPfff1345d68646fef7ec0c08b0a72819a748a18486ef509cd694f497bc09feb7f).

Recupero previsto: replay esplicitamente etichettato degli stessi byte19→22 su unico origin loopback, più verifica distinta del vero dominio22 in Chromium/WebKit con dati/esame/offline. Modalità verification_only evita ridistribuzioni o downgrade. Profili chiusi e diagnostica negativa saranno ora conservati. Prove finali ancora pendenti: non dichiarare l'incarico concluso.


**Consegna TestFlight riuscita; allineamento pubblico ancora incompleto.** Il titolare ha approvato esplicitamente il preciso candidato pubblico della22 rispondendo «Confermo» il27 ottobre2026 (Europe/Rome, precisione giorno). La dichiarazione distinta vincola sorgente, IPA, artefatto web e ricevuta Apple; digest canonico `0bfd121683127fac212c77af09f7dde3a5f5754e613eb89ffca35770f8d44b21`. La precedente autorizzazione della21 non è riutilizzata. Pubblicazione e verifiche effettive ancora da completare.

| Campo | Evidenza effettiva |
|---|---|
| Sorgente applicativo | `fab2b3eb5724b92b74ad3ed0e76ad2094ea2fd03` |
| Versione iOS | **1.1.0 (22)** |
| Apple | `VALID`, `IN_BETA_TESTING`, verificati alle23:18:33 UTC del26/10/2026 |
| Apple build ID | `8e7fcdbb-75e9-4765-a50d-f1867910ded7` |
| Destinatari | Solo gruppo interno titolare `f642807c-e4b2-43d4-a32a-d9fd087fdfe3`; nessuna estensione esterna |
| Produttore | [40414345353](https://github.com/gianpaolobol/fungo-italia/actions/runs/40414345353), `source` e `beta` success |
| TestFlight | [App Store Connect](https://appstoreconnect.apple.com/apps/6821140326/testflight/ios) |
| Web effettivamente letto | [GitHub Pages](https://gianpaolobol.github.io/fungo-italia/), ancora1.1.0(19), SHA `279d50e842a95c6a7d8e3499806b3fd5c42996e7` |
| Nuovo web | Artefatto originale già prodotto sullo SHA della22; pubblicazione, confronto byte serviti e upgrade remoto ancora pendenti |
| Pubblicazione ordinaria | Job web correttamente saltati: readiness indipendente falsa; nessun gate disabilitato |

## Verifiche sul sorgente della22

| Controllo | Esito e prova |
|---|---|
| Rigenerazione deterministica | PASS, nessun drift del catalogo |
| Integrità scientifica/tossicologica | Snapshot867 file invariato; zero errori tossicologici strutturali. Strict indipendenti restano bloccanti, non dichiarati superati |
| Node |299 PASS,0 fallimenti,0 skip |
| TypeScript / export iOS | PASS |
| Build web e manifest | PASS,1652 file; candidato validato dal produttore |
| Chromium |65 PASS + smoke condiviso, Aree71, ricerca/regione/habitat, tessere OSM decodificate, quattro schede e riavvio offline |
| WebKit |65 PASS + stesso smoke; vera interruzione dell'origine, nuovo documento servito dal worker e dati conservati, nessun errore JS |
| iPhone / iPad demo | Entrambi PASS, [40414345397](https://github.com/gianpaolobol/fungo-italia/actions/runs/40414345397) |
| Acquisti e ripristino iPhone / iPad | Entrambi PASS, [40414345724](https://github.com/gianpaolobol/fungo-italia/actions/runs/40414345724): due casi funzionali obbligatori per dispositivo, inclusi rimborso/scadenza |
| Audit nativo Aree/mappa/filtri | PASS su iPhone/iPad, gratuito e acquistato: quattro casi complessivi,0 fallimenti; sorgente incorporato verificato e tessere OSM ispezionate, [40418678224](https://github.com/gianpaolobol/fungo-italia/actions/runs/40418678224) |
| StoreKit nativo | PASS,1 caso,0 fallimenti, [40414345899](https://github.com/gianpaolobol/fungo-italia/actions/runs/40414345899) |
| Android | Build e smoke PASS, [40414345712](https://github.com/gianpaolobol/fungo-italia/actions/runs/40414345712); pubblicazione/OTA non usati come prova iOS |
| Firma e provenienza IPA | PASS: codesign strict, teamBX9MDXAHKG, bundleit.fungoitalia.app, versione/sorgente pulito incorporati nell'app, hash IPA conservato |
| Consegna Apple | Upload altool dell'IPA EAS originale riuscito, nessuna submission EAS avviata; processing e beta effettiva verificati tramite Apple |
| Upgrade PWA pubblica / dati locali | Cattura reale precedente riuscita nei due motori; upgrade della22 e confronto dati dopo deploy ancora da eseguire |

Il test `testEntitlementStartupProbe` delle suite UI è un diagnostico preesistente opt-in:1 XCTSkip per dispositivo, dichiarato esplicitamente. Non è conteggiato fra le verifiche funzionali superate; nessun controllo obbligatorio è stato disattivato per ottenere il risultato.

La correzione PWA gestisce il rigetto della verifica automatica `reg.update()` in assenza di rete, mantenendo controller e cache. Regressione sul runtime effettivamente generato: prima1 fallimento/2 pass, dopo3 pass. Nessun errore browser filtrato. La scheda Aree usa il codice condiviso gratuito; controlli StoreKit e altre funzioni premium restano invariati. Foto personali/caricamento/analisi restano inaccessibili dall'app. Feedback identificazione e commestibilità separati e perimetro curricolare preservati.

## Integrità

| Oggetto | SHA-256 |
|---|---|
| IPA firmato originale | `d8ebaf003d190d47925f458c3dfde5743a72e885597ed615c3b5d9bbc746db67` |
| Contenuto web | `5ca1768e06f9ad824259ae764a5488928c1fa66644c778f50a1bd6adaa578e1d` |
| Icona originale | `77274660b0a1a450d19c4c4d895ac49274663696e8cb6d40ffef6488131e35f9` |
| ZIP originale web12695390804 | `ebc6f5cc4d40c87849a51fbc2c7d3bb299c6988d58a55eb1438506f351c6714d` |
| ZIP ricevuta Apple12697750330 | `6c02b49f8c203f140591e795fb17ca1ea64fd72b07222745218a7eeac3f6797a` |
| ZIP IPA12697435922 | `e62ba096fa781e1f01bd29d535a14e528b26b326d41fc9d642bdeb8bcad95488` |
| Manifest scientifico867 file | `79d2514801e544dbdcfecbe140ff6aab909e5e1da51b0d4d2e49cf4a56553499` |

Ricevute originali conservate senza riscrittura: [sorgente](source-proof.json), [Apple finale](consolidated-testflight.json), [firma](native-signature.txt). [Registro completo](status.json) con identità/digest degli artefatti e osservazione del sito.

## Audit nativo supplementare mappa e filtri

[Prima esecuzione40415217045](https://github.com/gianpaolobol/fungo-italia/actions/runs/40415217045): iPad fallisce al primo caricamento mappa gratuito, WebView vuota con messaggio di cartografia non disponibile, pulsante Riprova e sei aree conservate. Il percorso acquistato passa e la schermata mostra tessere OSM reali. Su iPhone entrambi i casi XCTest passano e le mappe sono visibili; il job viene cancellato nella chiusura dell'audit già fallito e non è usato come prova canonica. Il fallimento non è nascosto né attribuito con certezza alla rete.

La [seconda esecuzione40418678224](https://github.com/gianpaolobol/fungo-italia/actions/runs/40418678224) è **riuscita su entrambi i dispositivi**: due casi funzionali per dispositivo,0 fallimenti/skip; clean source e versione incorporati verificati. Controllati ricercaToscana=6, intersezioneAbruzzo=0, ripristinoTutte=6, WebView/attribuzione/assenza di errori, ripartenza con71 macroaree. Le quattro schermate gratuito/acquistato mostrano tessere OSM decodificate e marcatori reali; ispezione visiva completata.

In V2 il primo caricamento è riuscito in tutti e quattro i casi: `explicitRetry=false`. Il ramo Riprova predisposto nel test **non è stato esercitato**, quindi non si dichiara provato il recupero. Il fallimento iniziale V1 iPad non è riprodotto e la sua causa resta non isolata; non si presume la rete né affidabilità assoluta del primo caricamento. Nessuna modifica all'app firmata per ottenere questo risultato. [Risultati esatti e ZIP originali](native-areas-v2-results.json).

Schermate finali V2 originali: [iPhone gratuito](iphone-map-free-v2.png), [iPhone acquistato](iphone-map-paid-v2.png), [iPad gratuito](ipad-map-free-v2.png), [iPad acquistato](ipad-map-paid-v2.png).
Schermate originali: [iPhone gratuito](iphone-map-free-v1.png), [iPad acquistato](ipad-map-paid-v1.png), [iPad fallimento iniziale](ipad-map-initial-failure-v1.png), [chiusura audit precedente](audit-v1-cancelled.jpg). Hash nel registro; nessuna immagine ricostruita o modificata.

## Revisione scientifica e lavoro residuo

Revisione indipendente **pendente**,0/148 schede indipendentemente attestate. Il collaudo interno del titolare non è certificazione. La dichiarazione scientifica resta `publicWebAllowed=false`, `appStoreReady=false`; la nuova distribuzione pubblica richiede il consenso distinto sul candidato concreto, ora [approvato per questa demo beta](../../../revisione/public-demo-authorizations/fab2b3eb5724b92b74ad3ed0e76ad2094ea2fd03.json).

Resta avviare il publisher manuale già autorizzato. Devono riuscire ancora rilettura Apple, verifica ZIP/manifest, archivio integrale precedente, deploy Pages, confronto di tutti i byte serviti, attivazione reale del worker in Chromium/WebKit, conservazione di note/preferiti/sessione/storico e riavvio offline. Nessuna installazione Safari Home Screen fisica o rollback realmente eseguito è attestata da questo rapporto. Procedura di rollback abbinato e non distruttivo nel [runbook](../../PAIRED-RELEASE-RUNBOOK.md).
