# Fungo Italia — TestFlight 1.1.0 (23), candidato web corrispondente

**Stato: parzialmente completato.** La nuova build è realmente disponibile su TestFlight interno. Il candidato web dello stesso sorgente è verificato ma non è ancora pubblicato: occorre il consenso distinto per la demo23 e poi il collaudo del vero dominio/PWA. La precedente conferma della22 non viene estesa.

| Campo | Prova |
|---|---|
| Commit applicativo | `5c9eaa03b678b6c97429975af61834fb919e2156` |
| Versione iOS | **1.1.0 (23)** |
| TestFlight | **VALID / IN_BETA_TESTING**, verificato da Apple alle **2026-10-27T03:05:35.349Z** |
| Apple build ID | `2f00918f-55b1-47f5-96f0-d6b9e2757e96` |
| Destinatari | Solo gruppo interno del titolare `f642807c-e4b2-43d4-a32a-d9fd087fdfe3`; nessun ampliamento |
| Produttore | [40437151113](https://github.com/gianpaolobol/fungo-italia/actions/runs/40437151113), source e beta SUCCESS |
| Web effettivamente servito | [Fungo Italia](https://gianpaolobol.github.io/fungo-italia/): letture HTTPS reali di build.json/release.json confermano ancora **1.1.0(22)**, `fab2b3eb5724b92b74ad3ed0e76ad2094ea2fd03` |
| Web candidato23 | Originale del medesimo produttore e SHA5c9, non ricostruito per la promozione; **non pubblicato** |
| Revisione scientifica | 867file immutati, zero revisioni indipendenti e zero errori tossicologici strutturali; soli collaudo/attestazione del titolare per beta interna |
| App Store | Nessuna pubblicazione definitiva autorizzata o eseguita; appStoreReady=false |

## Correzione e confini

La lista Aree rimane gratuita nel sorgente comune:71macroaree/20regioni, habitat, ricerca e filtri, senza apertura involontaria di Abbonamento. Il renderer web usa ora Leaflet1.9.4 già locale, con SRI esatta e Referer generato dal browser. Nessun JavaScript remoto nel documento principale, nessun permesso iframe allentato, nessuna identità browser contraffatta. La WebView nativa aggiunge nome/versione/contatto reali all’UA della piattaforma.

La causa esatta del precedente403 nel browser cloud non viene presentata come dimostrata. Il difetto del Referer nullo dell’iframe opaco è riprodotto nel ricevitore HTTP privato; i nuovi due browser e le quattro mappe native mostrano cartografia geografica reale, senza raster403. La verifica del nuovo sorgente sul vero dominio resta successiva all’autorizzazione e al deploy.

Dashboard, Studio, Esame, feedback separato identificazione/commestibilità, dataset, fotografie, modello annuale e controlli StoreKit non sono modificati. La funzione «Controlla e analizza foto selezionate» resta nello stato autorizzato, non riattivata nell’app. Web pubblico rimane demo; non si inventa un acquisto StoreKit web. Su iOS sono provati entrambi gli stati gratuito/acquistato. I nomi/versioni non sostituiscono gli hash o le ricevute.

## Controlli obbligatori

| Controllo | Esito reale |
|---|---|
| Rigenerazione deterministica catalogo/dati | PASS, nessun drift dei file scientifici |
| Integrità scientifica/tossicologica | Contenuto79d251... invariato;0errori strutturali. Entrambi i gate strict restano **exit1**, non certificati o resi verdi |
| Node | **305 PASS,0fail,0skip** nel produttore main |
| TypeScript | PASS; verifica qualificata sequenziale dopo rigenerazione |
| Build web | PASS, **1652file applicativi +2metadati** nell’archivio originale |
| Chromium | **65 PASS**, più smoke app condivisa, offline, mappa e ricevitore Referer reale |
| WebKit | **65 PASS**, più gli stessi smoke; runtime QA fissato1.62.0 |
| iPhone nativo | Demo e acquisti/free+paid PASS,0fallimenti |
| iPad nativo | Demo e acquisti/free+paid PASS,0fallimenti |
| StoreKit nativo | Acquisto verificato/rimborso/scadenza PASS |
| UI acquisto/ripristino | Due test funzionali per famiglia PASS; riapertura, ripristino, rimborso e scadenza mantenuti |
| Sonda startup opt-in | Nelle suite normali1skip diagnostico preesistente per famiglia; **eseguita separatamente** in baseline e without-updates,1PASS/0fail per modo. Osservazione diagnostica, non sostituto della prova acquisti |
| Asset/fotografie |630file immagine verificati, associazioni/metadata e dati mobili PASS |
| Versione/provenienza | IPA originale scaricato: SHA, bundleID, versione/build, sorgente incorporato/dirtyfalse e nuova identificazione nel vero bytecode verificati |
| Aree |71,20regioni, Toscana6, intersezione Abruzzo0, ricerca Amiata1/habitat, rilancio71, navigazione e assenza paywall PASS nei percorsi eseguiti |
| Geografia OSM | Due PNG del produttore web e quattro PNG nativi main ispezionati: cartografia reale e punti. Nessun Riprova necessario nei quattro casi nativi; **recupero non dichiarato esercitato** |
| Dati utente | Nessuna modifica di schema/chiavi; test storage/backup/offline e rilancio passati. **Upgrade pubblico22→23 e conservazione dati della nuova distribuzione ancora da eseguire** |
| Service worker/PWA pubblica23 | **PENDING** consenso/deploy, nessun successo presunto dai soli Actions |
| Verifica iPhone/iPad | Simulatori iOS26.2, Xcode26.6. Non viene dichiarato un aggiornamento osservato su dispositivo fisico |
| Rollback | Archiviazione/verifica byte e policy unit test presenti; prima del deploy si deve archiviare la22 e conservare i profili/dati. Nessun rollback della23 pubblica è stato eseguito |

Tutti gli otto workflow main associati a5c9 sono SUCCESS. I tre quorum di firma sono [StoreKit40437151124](https://github.com/gianpaolobol/fungo-italia/actions/runs/40437151124), [acquisti40437151127](https://github.com/gianpaolobol/fungo-italia/actions/runs/40437151127), [demo40437151271](https://github.com/gianpaolobol/fungo-italia/actions/runs/40437151271), tutti push/main sullo SHA esatto. La promozione pubblica ordinaria e il relativo smoke restano skipped perché independent_ready=false: il gate non è disattivato e la nuova demo non è ancora autorizzata.

## Integrità originale

| Oggetto | SHA-256 / identificativo |
|---|---|
| IPA firmato originale | `141d0a676b9eb3ba64ce6c6ee3b06474378180ea58ea0d6d09b274710b5e1481` |
| Bytecode effettivo main.jsbundle | `d9adc132b038b6b00d76a2ce700f7fba10b22f644806df8701d6abe40ca53e43` |
| Contenuto web originale | `9d5d3d39048a44addaee7fdb95a948e276392d42151bdf9377827709162e1e84` |
| ZIP web originale12704747838 | `771bcc10691c1fef99b04231cc5f25e90297fa81663e3ecab37ffe787684a5e9` |
| Manifest web originale | `ce0d32b984dd01acb36a7bafbbb144d283e2ed0a5d9fa92260671352fe3a731f` |
| Icona sorgente | `77274660b0a1a450d19c4c4d895ac49274663696e8cb6d40ffef6488131e35f9` |
| Manifest867scientifico | `79d2514801e544dbdcfecbe140ff6aab909e5e1da51b0d4d2e49cf4a56553499` |
| Attestazione titolare | `d649ab6720c043097f021d791b0703102675c55cff2888b93c37b784214225f5` |
| ZIP ricevute Apple/native12707345692 | `0ee25c32a8d05c3c4f0a7c127e66e2753200a23eebe46456bde15c67b7061292` |
| ZIP IPA12706338271 | `37ce3ef42fbce9a4d50541c63b393f178afba35d543d1d8ef337028dea8ed84c` |
| ZIP UI main12705099465 | `3f52c55ec373eb00892aff77b05d812b730f67bfc5526dd608d1ca60d45c5226` |

Firma verificata in CI con codesign --verify --deep --strict, TeamIdentifier **BX9MDXAHKG**, bundle **it.fungoitalia.app**. Il download indipendente combacia con quel medesimo IPA; Info.plist e app.config incorporato sono letti dal vero pacchetto. La stringa nuova FungoItalia/ e la proprietà applicationNameForUserAgent sono presenti nel vero bytecode. Trasporto Apple altool del medesimo originale alle03:01:26.538Z; nessuna submission EAS avviata o aggiornamento OTA usato come prova.

## Ricevute e storico

[Stato strutturato](status.json), [ricevuta Apple originale](consolidated-testflight.json), [prova firmata originale](consolidated-build.json), [ispezione indipendente IPA](ipa-inspection.json), [firma](native-signature.txt), [manifest web originale](web-file-manifest.json), [prova scientifica originale](internal-beta-science.json). Le PNG e i relativi JSON conservano byte/provenienza del produttore effettivo, non della sola anteprima PR.

La PR127 era preliminare: merge sintetico540d302... e albero identico a5c9, non ricevuta finale. Le ricevute main appena indicate la sostituiscono per la nuova distribuzione. I fallimenti iniziali del fixture Chromium e l’installazione APT anormalmente lenta/cancellata restano registrati nel fascicolo osm-map-identification-20261027 e nella PR. Solo quel job è stato ripetuto sul medesimo sorgente, poi65PASS; nessuna verifica allentata per ottenere verde. La storia della22, compresi profili iniziali persi e replay esplicitamente etichettato, rimane nel relativo fascicolo e non è riscritta come continuità reale recuperata.

## Passaggio restante e limite dell’autorizzazione

Il file [autorizzazione specifica23](../../../revisione/public-demo-authorizations/5c9eaa03b678b6c97429975af61834fb919e2156.json) è **pending**, conferma vuota e data approvazione nulla. Il consenso22 non viene riusato. Dopo la distinta conferma effettiva si potrà registrare il digest approvato e promuovere soltanto l’originale12704747838, rileggendo prima Apple/audience, archiviando la22 e verificando poi file serviti, source/SW, vero nuovo documento e dati/offline in Chromium/WebKit. Il protocollo non autorizza App Store, revisione scientifica fittizia o nuovi tester.

Non ci sono errori tecnici irrisolti nei job richiesti della23. L’impedimento attuale è l’autorizzazione pubblica ancora mancante; deploy e collaudo remoto non devono essere dichiarati conclusi finché non avvengono.

## Schermate originali del sorgente5c9

[Mappa web Chromium](browser/unified-map-chromium.png) · [Mappa web WebKit](browser/unified-map-webkit.png) · [iPhone gratuito](native/iphone-free-map.png) · [iPhone acquistato](native/iphone-paid-map.png) · [iPad gratuito](native/ipad-free-map.png) · [iPad acquistato](native/ipad-paid-map.png). Il banner22 nelle PNG web è il confronto con l’indice TestFlight remoto letto prima della disponibilità23; le PNG sono prove CI del candidato5c9 e non immagini di una distribuzione pubblica23.

Il codice di policy originale5c9 è stato eseguito anche sui documenti reali: rifiuta il nuovo record23 pending nonostante digest corretto e ricevuta Apple valida; rifiuta l’autorizzazione22 approvata quando presentata alla vera ricevuta23. Nessun consenso viene presunto.
