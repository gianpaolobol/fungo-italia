# Pubblicazione TestFlight del percorso di studio

La versione 1.1.0 usa il profilo EAS `study-beta` e il canale `study-dashboard`. Il workflow `study-testflight.yml` carica soltanto su TestFlight e non seleziona una versione App Store. La ricevuta registra SHA sorgente, hash IPA, esito UI e prove native.

Il caricamento richiede verifiche native StoreKit e Dashboard riuscite sullo stesso SHA. Una prova UI fallita permette solo una beta diagnostica esplicitamente marcata `testFlightOnly`; non apre la pubblicazione App Store. Un esito annullato o incompleto non è una verifica.

Per rilanciare su un commit che modifica solo documentazione o automazioni, avviare prima i workflow **Verify native StoreKit subscriptions**, **Verify StoreKit purchase interface** e **Validate study dashboard** sullo stesso commit, poi **Publish study dashboard to TestFlight**. Il gate accetta prove avviate da push o manualmente e rifiuta prove di un altro SHA. Non è sufficiente rilanciare vecchi job su uno SHA precedente.

Prima di dichiarare la beta disponibile, verificare nello stato Apple: build `VALID`, versione e numero corretti, gruppi interni effettivamente assegnati. L’assenza di gruppi non equivale a disponibilità per tester. Registrare anche lo stato della versione App Store 1.0 senza modificarla.

Il prodotto Base permanente è `it.fungoitalia.base.lifetime` (Apple ID 6825025102), prezzo italiano 9,99 €. La configurazione dei metadati non invia l’acquisto in revisione; lo screenshot autentico della schermata acquisti è stato caricato il 20/10/2026, stato `COMPLETE`; il prodotto è `READY_TO_SUBMIT` e non è stato inviato in revisione. Questo stato dei metadati non attesta il successo del flusso di acquisto.


## Beta diagnostica con accessore nativo già collaudato

`study-baseline-testflight.yml` ripristina l’accessore verificato e conserva il run nativo39454153800 / sorgentea07d8b7a come prova esplicita. Il gate confronta tutti gli input nativi della prova con quelli del nuovo candidato; normalizza soltanto le versioni marketing1.0.0/1.1.0 e i filtri di attivazione del workflow, mantenendo esatti codice, dipendenze, identità del bundle, test, fixture, ambiente e comandi. Test mirati verificano che modifiche al bundle, alle dipendenze, ai comandi o al codice Swift non risultino equivalenti.

Dashboard ed export devono passare sullo SHA del candidato. L’interfaccia completa resta non certificata e la ricevuta conserva il precedente run UI fallito39467202425 e la sua sorgente1465acec senza presentarli come una prova superata del nuovo candidato. Quando esiste una prova nativa fresca sullo SHA del candidato, la pipeline ne attende il completamento e richiede successo. Un fallimento, un annullamento, un timeout o una prova ancora in corso bloccano l’upload anche se una prova precedente aveva input equivalenti. Il vecchio esperimento di query puntuale viene annullato prima del suo upload. Questa procedura produce solo una beta diagnostica TestFlight, senza selezione o invio App Store.
