# Collaudo acquisti: stato e prova su dispositivo

La beta diagnostica è **1.1.0 (13)**. Il binario deriva dal commit `976702381e32d66893d8922e1a85e7a3300eceb3`, SHA256 IPA `33dd8d39eee73739b34a177d9ddc0d907e2ac43526baff2048547d1490bf6978`. I successivi commit diagnostici non sono una nuova build dell'app.

## Esiti verificati

- Controlli sorgente/Dashboard: 153 test, TypeScript ed export iOS riusciti.
- Prova nativa originale: run 39474292310, 2 test riusciti. Nuova regressione di avvio senza acquisti: run 39505471948, 3 test riusciti complessivamente. Gli 88,055 secondi misurano l'intero test di avvio, non la singola query.
- UI sul sorgente esatto della build 13: run 39474292167 fallito prima dell'acquisto Base. La query nativa `Transaction.currentEntitlements` entra senza restituire lo stato entro il flusso di test.
- Caricamento prodotti prima degli accessi: breve prova riuscita, ma run completo 39507145608 fallito su iPhone e iPad. Non è una correzione dimostrata; nessuna modifica di questo tipo applicata al prodotto.
- Preinstallazione: run 39510885513 fallito su entrambe le famiglie. XCTest reinstalla comunque l'app dopo la configurazione della sessione; il controllo non isola l'effetto della reinstallazione.
- Modalità `UseDestinationArtifacts`: run 39513407690 rifiutato da xcodebuild perché richiede un dispositivo iOS fisico. Nessun collaudo UI dell'app eseguito in questa modalità.
- Runtime alternativo iOS 26.1: run 39516723202 fermato perché non disponibile per il download. Anche il runtime 26.6 non risultava scaricabile; nessuna prova dell'app eseguita sul 26.1.

Il catalogo locale è stato confermato tramite prezzi distintivi e binding XcodeTest. I log del servizio mostrano risposte HTTP 200 seguite da sincronizzazione fallita per dati mancanti; il solo codice HTTP non attesta una risposta utilizzabile. L'avviso di account assente compare anche nel test nativo riuscito e non dimostra che sia necessario cambiare account.

**Non è stata stabilita una correzione di produzione. La UI degli acquisti resta non verificata.** Il branch non va presentato come pronto per App Store 1.1. La revisione App Store 1.0 resta separata.

## Prova richiesta su iPhone fisico

1. Aprire TestFlight e installare **Fungo Italia 1.1.0 (13)**. Annotare modello e versione iOS.
2. Aprire **Abbonamento**. Verificare che i prezzi si carichino e che sia possibile acquistare Base. Completare il foglio di prova Apple e verificare lo stato **Base acquistata** e l'accesso alle schede minime.
3. Attivare l'annuale e verificare **Abbonamento attivo**, schede complete e sessioni aggiuntive.
4. Chiudere e riaprire l'app; verificare gli accessi. Usare **Ripristina acquisti** e verificare nuovamente lo stato.
5. Riportare il primo punto che non riesce, il messaggio esatto e una schermata senza dati personali. Non cambiare password per questa prova.

Gli acquisti nella versione TestFlight avvengono nell'ambiente sandbox Apple senza addebiti: https://developer.apple.com/videos/play/wwdc2023/10142/ . Per rimborsi, scadenze e rinnovi controllati servirà un successivo collaudo sandbox guidato; il semplice acquisto riuscito non certifica questi scenari.

## Criterio di chiusura

Registrare esiti reali dei flussi UI Base, annuale, riapertura, ripristino, annullamento ed errori; completare i casi di scadenza/rimborso. Conservare `storekitUIVerified: false` finché il collaudo completo non è superato. Un test nativo riuscito non sostituisce il percorso visibile all'utente. Non generare una nuova IPA per soli cambi diagnostici o documentali.
