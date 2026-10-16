# Fungo Italia — abbonamento annuale, 16 ottobre 2026

La richiesta del titolare sostituisce la vendita una tantum a 9,99 € documentata il 15 ottobre.

## Configurazione Apple verificata
- App 6821140326, bundle `it.fungoitalia.app`; download gratuito, prezzo Apple riletto 0.0.
- Gruppo 22483824, Fungo Italia Premium.
- Prodotto `it.fungoitalia.premium.annual`, subscription ID 6823502997.
- Durata **ONE_YEAR**, rinnovo automatico; nessuna prova gratuita o offerta introduttiva.
- Italia **9,99 EUR / anno**; 175 prezzi territoriali equivalenti e 175 territori disponibili, nuovi territori abilitati.
- Localizzazioni italiane di gruppo e prodotto salvate.
- Sei screenshot nativi (tre iPhone, tre iPad) verificati visivamente e acquisiti dal codice annuale; elaborazione Apple **COMPLETE**.
- Screenshot del paywall per App Review: **COMPLETE**. Stato del prodotto riletto **READY_TO_SUBMIT** il 16 ottobre alle 11:56 UTC.
- Evidenza immagini e stato: https://github.com/gianpaolobol/fungo-italia/actions/runs/38871890407 .
- Il simulatore della prima acquisizione usa lo storefront USA e mostra il relativo prezzo Apple di $8.99; il prezzo italiano verificato resta €9.99. Nessun prezzo è stato sovrascritto nelle immagini.

## App e abbonamento
Su iOS/iPadOS: cinque schede e Aree disponibili nell’anteprima; accesso a tutte le schede ed Esame con abbonamento attivo. Preferiti e progressi restano sul dispositivo anche quando le schede escono dall’anteprima. Android e web mantengono l’accesso preesistente.

StoreKit 2 tramite modulo Expo locale. Acquisto e ripristino interrogano Apple. L’accesso usa transazioni verificate, non revocate e con scadenza futura; viene ricontrollato al ritorno in primo piano, su aggiornamenti StoreKit e alla scadenza. Nessun flag premium persistito, nessun identificativo di transazione esposto a JavaScript e nessun server dello sviluppatore che riceve ricevute.

Prezzo localizzato Apple, durata, rinnovo, ripristino, gestione dell’abbonamento, privacy e EULA sono presenti nel paywall e nella scheda App Store. Assistenza e privacy usano il recapito approvato dal titolare.

## Verifica tecnica
- Compilazione Release iOS e navigazione/acquisizione nativa su iPhone e iPad superate: https://github.com/gianpaolobol/fungo-italia/actions/runs/38866436691 .
- TypeScript e test della policy di accesso superati nelle preparazioni native.
- Test integrato StoreKit della funzione di accesso superato due volte: acquisto verificato, rimborso e scadenza; un test reale, zero errori. Primo passaggio in 206 secondi: https://github.com/gianpaolobol/fungo-italia/actions/runs/38874957310 . Dopo la pulizia del provider Expo duplicato nel solo target unitario, nuova prova superata in 270,923 secondi: https://github.com/gianpaolobol/fungo-italia/actions/runs/38882138907 .
- Un'esecuzione UI iPhone ha superato il ciclo completo in 254,654 secondi, compresi acquisto dall'interfaccia, riapertura, esame premium, rimborso, secondo acquisto, disdetta del rinnovo senza perdita anticipata di accesso e scadenza. Lo stesso run non è complessivamente riuscito perché la prova iPad è fallita: https://github.com/gianpaolobol/fungo-italia/actions/runs/38878214557 . Non viene attestata una prova UI del tasto esplicito Ripristina acquisti.
- Nella successiva esecuzione isolata, iPad ha completato l'acquisto verificato ma non l'accesso all'esame dopo la riapertura; iPhone è rimasto in attesa di purchase. Entrambe le prove sono fallite: https://github.com/gianpaolobol/fungo-italia/actions/runs/38882754510 .
- Corretto un difetto concreto: il timeout UI scartava definitivamente risposte StoreKit tardive. Ora una risposta verificata viene applicata anche dopo il timeout se appartiene ancora alla generazione corrente; revoche, nuove verifiche e smontaggio invalidano le risposte precedenti, e la scadenza viene ricontrollata al momento dell'applicazione. La causa specifica del precedente fallimento iPad non viene ancora attribuita a questo difetto.
- Il run UI c14bff45 è fallito: iPhone ha acquistato ma la verifica dopo la riapertura non è terminata entro il limite, mentre iPad è rimasto in attesa dell’acquisto: https://github.com/gianpaolobol/fungo-italia/actions/runs/38888893682 . Sullo stesso codice il test nativo è passato in 39,845 secondi: https://github.com/gianpaolobol/fungo-italia/actions/runs/38888893431 .
- Il runtime 26.5 presenta un difetto di StoreKit Test. Il download 26.6 non è disponibile nel catalogo del runner; è stato installato il runtime Apple **18.6 (22G86)**. Le prove confermano il prezzo locale italiano della fixture. La fixture resta confinata ai target XCTest e non entra nell'app distribuita.
- La correzione web che impedisce ai messaggi di stato di intercettare i tap è stata verificata. Tutti i **65 test PWA** sono passati sulla revisione 1bacf13c: https://github.com/gianpaolobol/fungo-italia/actions/runs/38900517361 .
- Pipeline Android, APK e prova nell'emulatore superate sulla revisione 8f35c9af: https://github.com/gianpaolobol/fungo-italia/actions/runs/38882754465 .
- La build Apple (7) non contiene gli acquisti. Nessun nuovo binario annuale è ancora attestato. Il percorso di produzione richiede il successo UI di entrambi i dispositivi e il più recente test nativo corrispondente agli stessi input di billing, dipendenze e configurazione Expo. Un percorso distinto può compilare e caricare un candidato diagnostico TestFlight dopo un fallimento UI soltanto se il test nativo corrispondente è superato: non seleziona il candidato per App Store e non dichiara risolto il fallimento UI.
- L'associazione automatica alla versione 1.0 controlla numero reale del binario firmato, hash, sorgente e prova StoreKit; attende lo stato Apple VALID.
- Aggiornamenti iOS di produzione subordinati alla pipeline nativa, al confronto delle sorgenti di billing con l'ultima prova StoreKit UI riuscita e al runtime fingerprint. Una conclusione verde con pubblicazione saltata non attesta un aggiornamento OTA.

## Correzioni successive e prove correnti

Il confronto con Xcode/runtime 26.4 ha fallito durante la preparazione StoreKit Test (storefront vuoto e errore della fixture), prima di verificare il billing. I workflow usano nuovamente Xcode 26.6 e runtime 18.6: non viene attribuita la causa dei blocchi a un disallineamento SDK.

La verifica nativa del singolo prodotto annuale usa ora `Transaction.latest(for:)`, accettando soltanto una transazione verificata del prodotto annuale, non revocata, non aggiornata a un altro prodotto e con scadenza futura. Le transazioni mancanti, non verificate o scadute non concedono accesso.

Il run UI 38896477391 ha rilevato un acquisto avviato mentre la verifica iniziale di accesso era ancora pendente. Sulla revisione 1bacf13c il pulsante Acquista resta disabilitato fino alla conclusione di una verifica corrente che confermi l’assenza di accesso. Ripristino e nuova verifica restano disponibili dopo un errore. I test nativi isolano il bootstrap JavaScript nel solo runner unitario; le prove UI avviano sempre l’app completa.

Esiti della revisione 1bacf13c:
- **Test nativo superato** in 371,630 secondi, un test e zero errori, con acquisto verificato, rimborso, secondo acquisto e scadenza: https://github.com/gianpaolobol/fungo-italia/actions/runs/38900517505 . L’isolamento rimuove soltanto il bootstrap React nel runner unitario e usa la funzione Swift effettiva di produzione.
- **Prove UI iPhone e iPad fallite**: la verifica iniziale rimane pendente oltre 120 secondi; il pulsante Acquista resta disabilitato e non viene avviato un acquisto concorrente. Il prezzo locale di 9,99 € viene restituito correttamente. Non è dimostrata la causa del blocco nel processo app sotto UI test: https://github.com/gianpaolobol/fungo-italia/actions/runs/38900517531 . Il PASS unitario non sostituisce il test dell’interfaccia.
- **Pipeline Android, emulatore e aggiornamento del canale di anteprima superati**: https://github.com/gianpaolobol/fungo-italia/actions/runs/38900517647 .
- Candidato firmato TestFlight in compilazione, senza selezione App Store: https://github.com/gianpaolobol/fungo-italia/actions/runs/38904049950 . Non viene ancora attestato un caricamento o un nuovo binario valido Apple.

Le build firmate preparano esplicitamente la chiave API Apple già autorizzata in un file temporaneo con permessi 0600, soltanto dopo la creazione dell’IPA; la eliminano al termine. Nessuna chiave entra nel repository o negli artifact.

## Passaggi di pubblicazione ancora aperti
L’app resta PREPARE_FOR_SUBMISSION. Il titolare ha confermato vuoto il questionario Privacy: con gli strumenti disponibili richiede il portale Apple. Vedi [risposte tecniche preparate](APP-STORE-PRIVACY-WORKSHEET.md).

Apple richiede che il primo abbonamento e il relativo gruppo siano sottoposti insieme a una nuova versione dell’app attraverso il portale. Il riferimento API ufficiale riletto il 16 ottobre alle 08:16 UTC precisa: “Submit your first subscription together with an app binary submission through appstoreconnect.apple.com.” Le API descritte si applicano agli abbonamenti successivi. Riferimenti: https://developer.apple.com/documentation/appstoreconnectapi/submitting-subscriptions-and-subscription-groups-for-app-review e https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase/ . Nessun invio alla revisione viene attestato da questo documento.

La lettura Apple del 16 ottobre alle 08:16 UTC segnala `TRADER_STATUS_NOT_PROVIDED` nei territori UE, Italia compresa: manca la dichiarazione DSA. In **Business → Agreements → Compliance → Digital Services Act**, Account Holder o Admin devono dichiarare lo stato effettivo e completare le verifiche richieste. Non si deve scegliere “non trader” per evitare la verifica. Guida: https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements .

In **Business → Agreements** controllare inoltre che Paid Apps sia **Active**, con dati fiscali e bancari richiesti completati. L’eventuale accettazione legale richiede l’Account Holder. Contratti e dati fiscali/bancari restano non verificati dall’API usata: lo stato generico `CANNOT_SELL` di un’app non ancora pubblicata non prova, da solo, accordi mancanti.

Il gate di completezza scientifica rimane distinto dai test software. La revisione micologica indipendente è ancora pendente nelle attestazioni. Il report usa anche il catalogo pubblico, privo di alcuni metadati interni: i conteggi vanno letti insieme alla provenienza e alle evidenze conservate. Non sono state inventate attestazioni o rimosso il gate. La presentazione dell’app resta didattica e non certifica esemplari per il consumo.
