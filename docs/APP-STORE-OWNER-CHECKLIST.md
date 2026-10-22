# Fungo Italia — prerequisiti Apple verificati il 22 ottobre 2026

**NON PRONTA PER PUBBLICAZIONE.** [Report e prove esatte](IOS-RELEASE-AUDIT-2026-10-22.md).

## Stato commerciale letto nel portale

Download gratuito; unico abbonamento `it.fungoitalia.premium.annual`,annuale. Il prezzo corrente per nuovi abbonati in Italia è **19,99 €**, letto in Subscriptions → Fungo Italia Premium → Fungo Italia annuale → Current Pricing for New Subscribers → Europe → Italy. Nessun prezzo è stato modificato durante l'audit. Non usare il primo record ITA della risposta API come prova del prezzo effettivo: possono esserci più periodi.

Accordi Free Apps e Paid Apps: **Active**. Dati fiscali e conto di pagamento: **Active**. Questi stati sono stati letti; non sono stati accettati nuovi contratti né modificati dati bancari.

## Blocchi che richiedono il titolare e revisori

1. **DSA Rejected** per27 territori. In [Business](https://appstoreconnect.apple.com/business), completare Compliance → Digital Services Act con lo stato trader/non-trader effettivo e le prove eventualmente richieste. L'agente non ha inventato né trasmesso una nuova dichiarazione.
2. **Privacy:** [pagina attuale](https://appstoreconnect.apple.com/apps/6821140326/distribution/privacy). Il titolare ha approvato espressamente la classificazione dell’ID Expo collegato all’installazione. Pubblicati e riletti Device ID, Crash Data, Other Diagnostic Data e Other Data Types: funzionalità dell’app, collegati al dispositivo, nessun tracking. Il riepilogo non mostra più contatti, pagamenti o posizione né avvisi di setup incompleto. Dettagli e fonti nel report del22 ottobre.
3. **Revisione scientifica indipendente:**148schede bloccate e zero revisioni attestate dal gate. Completare fonti puntuali,verifica dei contenuti e diritti immagini con un revisore qualificato. Nessun test software certifica queste approvazioni.

## Condizioni tecniche da completare prima della nuova review

- Portare la funzione Foto nel flusso applicativo con PR dedicata e test,oppure mantenere esplicito il requisito non soddisfatto.
- Portare a termine la pipeline diagnostica dello SHA esatto e verificare ricevute firmate,processing Apple e gruppo tester. Non confondere la precedente1.1.0(16) con un nuovo candidato.
- Soddisfare gate editoriali e tutti i controlli obbligatori sullo SHA definitivo,poi usare un percorso **production** qualificato,con firma e verifica del sorgente nel binario.
- Verificare acquisto sandbox,ripristino,riapertura e conservazione dati sul dispositivo fisico del titolare. I test locali StoreKit su iPhone/iPad simulati sono riusciti su main; non attestano da soli il flusso sandbox TestFlight.
- Aggiornare screenshot e metadati autentici del candidato. Nessuna immagine pubblica con prezzi; screenshot paywall soltanto nel materiale privato del prodotto.
- La versione App Store1.0 è ancora REJECTED e seleziona build 9. Gruppo/prodotto annuale sono nella bozza Ready for Review,non approvati. Includere app,gruppo e prodotto nella stessa nuova submission quando la release sarà idonea. Non inviare prima di avere chiuso i blocchi.

L'app può essere distribuita internamente a fini diagnostici secondo la pipeline autorizzata; questo non costituisce approvazione per la vendita o idoneità alla pubblicazione.
