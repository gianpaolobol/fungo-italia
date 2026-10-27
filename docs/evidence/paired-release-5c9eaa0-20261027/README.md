# Fungo Italia — Web e TestFlight1.1.0(23) allineati

**Allineamento effettivo verificato il27ottobre2026, ore09:23 Europe/Rome.** Le prove comprendono ricevuta Apple aggiornata, ogni file servito e aggiornamento della vera PWA pubblica22→23 in Chromium e WebKit, riprendendo i profili originali precedenti al deploy. Demo didattica non certificata; nessuna pubblicazione App Store definitiva.

| Campo | Informazione verificata |
|---|---|
| Commit applicativo | `5c9eaa03b678b6c97429975af61834fb919e2156` |
| Versione iOS | **1.1.0(23)** |
| TestFlight | **VALID / IN_BETA_TESTING**, solo gruppo interno del titolare `f642807c-e4b2-43d4-a32a-d9fd087fdfe3`; live readback27ottobre07:22:43.471Z |
| Apple build ID | `2f00918f-55b1-47f5-96f0-d6b9e2757e96` |
| Produttore originale | [40437151113](https://github.com/gianpaolobol/fungo-italia/actions/runs/40437151113), push/main sullo SHA applicativo esatto |
| Web | [Fungo Italia](https://gianpaolobol.github.io/fungo-italia/), stesso SHA/versione/build;1652file verificati dal dominio alle07:23:14.530Z |
| Distribuzione effettiva | [40465563726](https://github.com/gianpaolobol/fungo-italia/actions/runs/40465563726): deploy e filePASS, primo collaudoPWAFAIL, negativo conservato |
| Verifica finale | [40466560358](https://github.com/gianpaolobol/fungo-italia/actions/runs/40466560358) **SUCCESS**, nessuna ridistribuzione/downgrade; entrambe le PWA passate alle07:23:25.529Z |
| Consenso pubblico | «Procedi»,27ottobre2026 Europe/Rome con precisionegiorno, distinto per questo sorgente23; digest `9961d2fd16b12a778e1500a6d30679aa2b4c0f421e3b152add1b54547a0679c7` |
| Revisione scientifica | Zero revisioni indipendenti; contenuto867file invariato,0errori tossicologici strutturali. Sola attestazione del titolare per beta interna; autorizzazione pubblica è distribuzione della demo, non certificazione |
| App Store / destinatari | `appStoreReady=false`; nessuna pubblicazione definitiva, invito, tester esterno o ampliamento del gruppo |

## Controlli obbligatori

| Controllo | Esito e limite |
|---|---|
| Rigenerazione deterministica catalogo | PASS, nessun drift |
| Integrità scientifica e tossicologica |867file/digest invariati,0errori strutturali. Strict scientifico e tossicologico restano **exit1/exit1**,148schede bloccate,0revisioni indipendenti |
| Node |305PASS/0fail/0skip sul sorgente applicativo;69PASS/0fail nei gate del verificatore finale |
| TypeScript |PASS |
| Build web |PASS, riutilizzato solo ZIP originale12704747838;1652payload+2metadati, nessuna ricompilazione per la promozione |
| Chromium / WebKit |65/65PASS ciascuno sul sorgente; collaudo finale vero dominio con Chromium151.0.7922.34/WebKit26.5, runtimeQA1.62.0 |
| iPhone / iPad |Demo e acquisti gratuito/acquistatoPASS nei simulatori iOS26.2/Xcode26.6 |
| StoreKit nativo |Acquisto verificato/rimborso/scadenzaPASS; [40437151124](https://github.com/gianpaolobol/fungo-italia/actions/runs/40437151124) |
| UI acquisti/ripristino |Due test funzionali per famigliaPASS,0fallimenti; riapertura/ripristino/rimborso/scadenza conservati. [40437151127](https://github.com/gianpaolobol/fungo-italia/actions/runs/40437151127) |
| Demo |iPhone/iPadPASS; [40437151271](https://github.com/gianpaolobol/fungo-italia/actions/runs/40437151271) |
| Sonda startup opt-in |1skip diagnostico preesistente per famiglia nelle suite UI normali; eseguita separatamente baseline/without-updates,1PASS0fail ciascuna. Non sostituisce gli acquisti |
| Asset |630immagini verificate, metadati/associazioni/integritàdatiPASS; nessun nuovo taxon o fotografia |
| Versione/provenienza |IPA originale scaricato/hash/firma/bundle/versione/build/source incorporato/dirtyfalse e nuovo codiceUA nel vero bytecode verificati |
| Aree native |71macroaree/20regioni, Toscana6→Abruzzo0→Tutte6, Amiata/habitat, rilancio71, quattro tab, nessun paywall: gratuito e acquistato su entrambe le famiglie |
| Aree web pubblico23 |71/20, Toscana6, Amiata1, habitatFaggeta/Castagneto/Querceto, navigazione quattro tab e nessuna apertura AbbonamentoPASS nei due browser |
| OSM pubblico23 |Due PNG originali ispezionate: vera geografia Amiata/AbbadiaSanSalvatore,1marcatore dopo filtro;6tessereHTTP200 per motore, nessun requestfailure/alert/riprova, viewport completo |
| PWA22→23 |Profili originali precedenti al deploy ripresi senza modificare cache/dati; nuovo documento/JS/worker e `method=manual-update` per entrambi; nessun ricaricamento aggiuntivo usato |
| Conservazione dati |Note/preferiti/ripresaStudio/sessioneesame/bozza/storicopreservati; ripresa esame dalla UI con rispostaAgaricus conservata |
| Offline reale |Rete origine pubblica disconnessa, sonda browser indipendente fallita come richiesto; nuovo documento200 dal serviceworker, stessa sessione/storico e note/preferitiPASS in entrambi |
| Rollback |Archivio22 completo con ricevuta conservato90giorni; nessuna cancellazione dati o downgrade pubblico eseguiti. Rollback funzionale richiede nuova coppia qualificata secondo runbook |

I quattro PNG nativi originali del produttore e i due PNG web preliminari restano nel fascicolo. Non si dichiara un aggiornamento osservato su iPhone/iPad fisici, né un recuperoRiprova nativo non esercitato. Dashboard, Studio, Esame, feedback distinto identificazione/commestibilità, StoreKit e chiavi/schema dati non cambiano con questa correzione. Analisi/caricamento foto resta bloccato nello stato autorizzato.

## Catena di integrità

| Oggetto | SHA-256 |
|---|---|
| IPA originale firmato | `141d0a676b9eb3ba64ce6c6ee3b06474378180ea58ea0d6d09b274710b5e1481` |
| Vero bytecode main.jsbundle | `d9adc132b038b6b00d76a2ce700f7fba10b22f644806df8701d6abe40ca53e43` |
| Contenuto web originale e servito | `9d5d3d39048a44addaee7fdb95a948e276392d42151bdf9377827709162e1e84` |
| ZIP candidato originale12704747838 | `771bcc10691c1fef99b04231cc5f25e90297fa81663e3ecab37ffe787684a5e9` |
| Manifest web | `ce0d32b984dd01acb36a7bafbbb144d283e2ed0a5d9fa92260671352fe3a731f` |
| Icona | `77274660b0a1a450d19c4c4d895ac49274663696e8cb6d40ffef6488131e35f9` |
| Contenuto867file scientifici | `79d2514801e544dbdcfecbe140ff6aab909e5e1da51b0d4d2e49cf4a56553499` |
| Ricevuta finale ZIP12716119255 | `c8a5b3c7bfe359479d32276fa2fed7706c9237c265c8265342e70e8679716def` |
| Profili originali prima del deploy12716616989 | `046b360ce4f8bec3afb3fe61ab2b5569547682335847ff230826488fe51f1568` |
| Archivio22 per recupero12716383659 | `061687535148a8be4b43ae2685e9ce894e9852f289d22e128c3610672db9765a` |

Firma originale verificata in CI con codesign deep/strict, TeamBX9MDXAHKG/bundleit.fungoitalia.app. IPA219677893byte. TrasportoApplealtool, non OTA. Lo SHA di main dopo i metadati non è un nuovo sorgente applicativo: il guard originale confronta tutte le modifiche dopo5c9 e ammette solo documentazione/autorizzazioni/QA. Prima del rapporto finale:3commit/33file ammessi, zero modifiche applicative.

## Primo negativo, recupero e problemi residui

Il primo run ha aggiornato il worker a23 ma mantenuto il documentoJS22 dopo il click; errore esatto e artefatto sono in [negativo](public23-upgrade-negative.md) e [diagnostica originale](public/first-chromium-upgrade-failure.json). Il run restaFAILURE. Non è stato cancellato né sostituito da un semplice verde.

A differenza del precedente episodio22, qui i profili originali erano archiviati **prima** del deploy e sono stati ripresi esattamente dall’artifact12716616989 dopo controllo ZIP/produttore/cattura/tempi/estrazione. [Provenienza recupero](public/profile-recovery-provenance.json). Il collaudo ora attende il controller effettivo prima della verifica del documento e può registrare esplicitamente un eventuale ricaricamento di recupero. **In entrambi i risultati finali tale ricaricamento non è stato necessario:** manual-update, nuovo documento, exactJS23, dati/offline/mappaPASS. Il primo intermittente comportamento non viene descritto come difetto applicativo definitivamente corretto; rimane coperto dal controllo rigoroso e registrato nello storico.

Nessun job tecnico obbligatorio della coppia resta pendente. Rimangono esclusi dal completamento della demo: certificazione scientifica indipendente/AppStore e attestazione di un upgrade su telefono fisico. Per futuro rollback seguire [runbook](../../PAIRED-RELEASE-RUNBOOK.md), senza distruggere dati e senza ripristinare unilateralmente un vecchio web sopra un nuovo iOS.

## Ricevute e schermate

[Stato finale](status.json) · [Ricevuta Apple originale](consolidated-testflight.json) · [Ispezione IPA](ipa-inspection.json) · [Manifest](web-file-manifest.json) · [Apple live finale](public/paired-demo-native-proof.json) · [Tutti i file serviti](public/paired-demo-verification.json) · [Upgrade finale](public/upgrade-report.json) · [Metadati pubblici](public/release.json) · [Indice SHA dei file pubblici di prova](public/evidence-files.json).

[Mappa Chromium del vero dominio](public/chromium-actual-public-map.png) · [Mappa WebKit del vero dominio](public/webkit-actual-public-map.png) · [Offline Chromium](public/chromium-verified.png) · [Offline WebKit](public/webkit-verified.png).

Il [checkpoint precedente al consenso](pre-publication-checkpoint.md) rimane storico; i suoi campi pending/nonpubblicato non descrivono lo stato finale. Nessun token/chiave, profilo browser o dato reale utente è pubblicato nel repository: nei report solo progressi sintetici di prova.
