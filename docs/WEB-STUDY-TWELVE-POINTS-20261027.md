# Dodici interventi web — 27 ottobre 2026

Stato: implementazione nel ramo `feat/web-study-twelve-points-20261027`, PR128. Nessun merge main, deploy, OTA, build o invio iPhone per questo lotto. Non è una consegna pubblicata. La baseline pubblica/TestFlight resta23.

## Perimetro e risultati

| Punto | Implementazione | Evidenza / limite |
|---|---|---|
| 1 | 218 schede minime; livelli successivi aggiungono42 moduli auspicabili e34 di approfondimento | S1, colonne testuali esatte di `taxonomic-objectives.json`, solo genitore già ammesso. Nessun taxon nuovo o riclassificato; i conteggi distinguono schede/moduli. |
| 2 | Solo Ciao senza nome disponibile; nome già salvato mantenuto | Nessuna richiesta nome o accesso al proprietario del telefono. |
| 3 | Linea temporale con date e scala0–100, salite e discese | Punti reali dal modello progressi; descrizione accessibile di ogni data/valore. |
| 4 | Nuove sessioni fotografiche casuali; storico evita corrette immediatamente ripetute quando esistono alternative; zoom1–4x | Foto ingrandite in modal con comandi e scorrimento. |
| 5 | Solo fianco/sopra/sotto nello studio | Fotografie del corso e metadati conservati, galleria aggiuntiva rimossa dalla scheda. Slot privi di foto non completati artificialmente. |
| 6 | Eliminate le due linee del fungo | Forma e indicatore di progresso conservati. |
| 7 | Fungo verde pieno con moneta e fessura | Nessun puntino bianco; nessuna modifica ai diritti di abbonamento. |
| 8 | Esiti per scheda e ripasso solo delle errate; due prime risposte autonome perfette in sessioni diverse | Un errore successivo azzera la sequenza di apprendimento; ripassi nella stessa sessione non contano come seconda prova. |
| 9 | Algoritmo descritto sotto | Copertura, apprendimento scheda e indice di preparazione restano misure distinte. |
| 10 | Esame teorico separato,821 quesiti a scelta chiusa; fotografico15 casi con foto | PR120 è audit/riconciliazione, non la nuova UI. Recuperati476 quesiti reali;18 fondamenti e76 moduli documentati completano la banca con teoria dei casi fotografici e79 quesiti sulle indicazioni commerciali già presenti nelle schede. Nuovo contenuto non attestato scientificamente. |
| 11 | Pallini da colori documentati, anche chiari, composti o variabili | Testo originale e contorno conservati. Nessun colore inventato per dato assente/indeterminato. |
| 12 | Radio selezionato nero su opzione mortale | Categoria mortale resta rossa; stato aria-checked esplicito, collaudato in Chromium e WebKit, anche non selezionato e cambio opzione. |

## Algoritmo e parere

Per15 casi fotografici, se i bacini contengono abbastanza casi, la selezione prende8 errori,4 ripassi maturi e3 nuove schede. I posti non disponibili vengono riempiti dagli altri bacini. Gli errori critici suggeriti dal modello hanno precedenza fra le errate; l'ordine finale è sempre mescolato. Le corrette nell'ultima sessione e quelle non ancora mature vengono usate soltanto se mancano alternative. Gli errori possono tornare subito: è intenzionale. I ripassi delle corrette maturano dopo1,3,7,14,30giorni in base alle prime risposte autonome perfette; non è una garanzia di memoria clinicamente validata. Nella piccola demo4casi la ripetizione è inevitabile e dichiarata.

Appresa significa almeno due prime risposte completamente corrette senza suggerimenti, in sessioni distinte. I tentativi correttivi della stessa sessione non incrementano il conteggio. L'errore successivo lo azzera; una scheda appresa resta riproponibile.

Questo modello è preferibile alla ripetizione dell'intera prova: concentra il lavoro sulle lacune conservando novità e richiamo delle corrette. Il conteggio delle schede apprese va letto separatamente dall'indice di preparazione, che include copertura, decadimento e simulazioni. Le percentuali non attestano abilitazione o idoneità al consumo.

La teoria usa archivio/versione separati e selezione casuale adattiva: almeno un quesito per argomento nei test misti, poi priorità a errori, quesiti nuovi e corretti. Le opzioni sono mescolate stabilmente per sessione mantenendo ID e soluzioni. Le risposte teoriche alimentano soltanto le relative competenze; mai un riconoscimento fotografico non svolto. I821 quesiti comprendono395 micologia,253 tossicologia,4 legislazione,6 figura professionale,82 commercio,5 microscopia e76 obiettivi curricolari. Sono una banca didattica iniziale, non una simulazione di distribuzione ministeriale dei quesiti.

## Dati e distribuzione

Conservati ID canonici, salvataggi, preferiti e storico esistente. Nuovo archivio teorico `fungo-italia:theory-exam:v1`; i vecchi risultati rimangono nel loro archivio, mappati alle competenze compatibili. Gli errori di lettura bloccano la scrittura: nessun reset automatico. Le bozze di risposta teorica sono persistite prima di avanzare.

La web ordinaria mantiene la demo Agaricus: il browser non dispone di un entitlement StoreKit valido. Il fixture CI esercita i componenti completi dichiarandosi TEST HARNESS, non attribuisce acquisti e non va distribuito come app. Non è stato creato uno sblocco premium locale per aggirare questo limite.

Il publisher corrente è abbinato a TestFlight e il push main attiverebbe build native. Per il nuovo lotto occorre un percorso web-only distinto; nessuna ricevuta Apple23 può attestare il nuovo sorgente. Le autorizzazioni alla pubblicazione web dell'incarico non sono convertite in attestazioni di revisione scientifica.

Il controllo reale `node scripts/internal-beta-science.mjs` rifiuta la banca aggiunta: `Reviewed scientific content changed`. La dichiarazione26/10 e il consenso pubblico23 sono riferiti a snapshot diversi. Gate strict e dichiarazioni restano intatti. Una promozione pubblica con gate scientifici falliti contraddirebbe AGENTS e i documenti fondanti richiesti dal titolare. Mancano la revisione del nuovo contenuto e le prove di upgrade PWA del nuovo candidato; nessuna pubblicazione può essere dichiarata verificata.

## Prove

Locali: TypeScript PASS;300 test Node PASS,0fail,0skip. Download browser locale fallito (ZIP troncato), non dichiarato positivo. Il workflow `web-study-review.yml` costruisce il vero export web e un fixture separato non distribuibile, poi esegue Chromium/WebKit; i primi negativi rimangono nelle esecuzioni Actions. Run40473274095 SUCCESS su d8d750665409fe5e4c5042fc7a5a5f8a0e250d10: Chromium e WebKit PASS,22 file di prove, ZIP artifact12719453380 verificato SHA256 b5557904fb63f3a822fca0426ba1a3226d0330952d636d3c6cb788447acd90b5. Schermate realmente ispezionate: livelli, tre viste, grafico, saluto, zoom, radio selezionato/cambio opzione, ripasso di un solo errore, teoria. La prima qualifica precede i79 quesiti commerciali e il contratto web-only aggiunti nel seguito. È un harness dei componenti, non una verifica di acquisti né pubblicazione. La qualifica tecnica non è una revisione scientifica.

## Preparazione web-only successiva alla prima qualifica

Ricevuta web-only schema2 distinta dalle ricevute Apple: stato web-current, aggiornamento iPhone esplicitamente in attesa. Test negativo/positivo impedisce di dichiarare nuovo allineamento TestFlight o attribuire una build Apple al sorgente web. Il vecchio schema1 abbinato conserva tutte le verifiche precedenti. Il componente ReleaseStatus usa messaggi distinti. La ricevuta schema2 non viene prodotta finché la distribuzione non è qualificata; nessun file release pubblico è stato scritto.

`web/study-release-preflight.mjs` conserva i report reali, il digest scientifico e i18 nuovi quesiti non indipendentemente revisionati, con published=false e nativeBuildAllowed=false. Non esegue deploy né modifica le approvazioni. Il workflow soltanto web conserva anche un pacchetto di revisione dei componenti riservato agli accessi GitHub consentiti, mai pubblicato su Pages e privo di diritti StoreKit. La qualifica del sorgente finale dopo queste integrazioni resta da registrare.

Il run40474739331 ha realmente eseguito i componenti del checkout2847fca7, ma l'ispezione del preflight ha rilevato GITHUB_SHA del merge virtuale PR129c3235. Quella qualifica funzionale resta reale; il candidato ha metadati sorgente non corretti e NON è distribuibile. Corretto il workflow: gli export e il preflight ricevono lo SHA di git rev-parse HEAD; il preflight rifiuta una fonte diversa dal checkout. Nessuna pubblicazione effettuata e nessuna prova precedente rinominata come qualifica del nuovo candidato.
