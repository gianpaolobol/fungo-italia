# Promozione iOS production: controlli e limiti

Stato del 22 ottobre 2026: **produzione bloccata**, non ancora qualificata end to end. La build diagnostica e la relativa ricevuta restano distinte dalla produzione.

## Prima di una build production

`Store production build` è manuale e richiede main corrente. Dopo rigenerazione, TypeScript e test Node, `scripts/production-preflight.mjs` esegue i veri gate scientifici strict e verifica tramite GitHub quattro esecuzioni completate con successo sullo stesso SHA:

- StoreKit nativo, interfaccia acquisti iPhone/iPad e demo: evento push su main;
- scientific generator: evento push o workflow_dispatch su main, dove il job strict è obbligatorio.

I tre workflow nativi e quello scientifico vengono eseguiti su ogni push main, compresi aggiornamenti documentali: nessun commit artificiale è necessario per ottenere prove dello SHA corrente. Le esecuzioni PR non sostituiscono le prove main. Risultati mancanti, pendenti, cancellati, falliti o di un altro SHA bloccano il preflight. Main viene riletto prima di accettare le prove.

Il workflow production usa il profilo EAS `production`, senza auto-submit, attende il risultato EAS e conserva ricevuta dei gate e metadati della build. La concorrenza con la pipeline diagnostica è serializzata per la durata del job. La ricevuta del preflight mantiene `appStoreReady:false`: attesta soltanto i controlli di sorgente.

## Dopo la build: ancora obbligatorio

1. Leggere ID EAS, stato finale, versione, build number, profilo/canale production e commit.
2. Scaricare il binario originale, registrare SHA-256 e verificare firma, bundle ID, team Apple, provisioning, versione e sorgente Expo incorporato. Non usare una build precedente o diagnostica.
3. Verificare l’audience interna autorizzata, poi trasmettere quel preciso binario a TestFlight. Il percorso storico con Build ID hardcoded non è più utilizzabile.
4. Confermare processing Apple VALID, gruppo tester previsto e stato effettivo di disponibilità. Un upload o il solo VALID non sono sufficienti.
5. Verificare funzioni distribuite, acquisto/ripristino reali nel sandbox Apple, privacy, DSA, abbonamento, metadati e screenshot. Conservare prove e riferimenti del binario.
6. Preparare App Review soltanto quando tutti i gate risultano soddisfatti. Nessun passaggio di questa PR invia una release pubblica.

La promozione production dopo la build non è ancora automatizzata e verificata. Non rinominare una ricevuta diagnostica né modificarne i flag per dichiararla pronta.

## Percorsi storici

`store-submit-ios.yml` rifiuta il precedente invio di un ID hardcoded; `ios-launch-fix.yml` rifiuta l’auto-submit privo di prove; `ios-layout-update.yml` rifiuta il vecchio OTA production. `ios-photo-filter.yml` rifiuta la distribuzione dedicata alla funzione Foto rinviata. I controlli Apple e il codice applicativo non sono stati rimossi.

La pipeline `Paired web and diagnostic TestFlight` mantiene profilo/canale e flag diagnostici originari. Nessun trigger è duplicato.

## Blocchi attuali

148 schede ancora bloccate dal gate scientifico, zero revisioni indipendenti attestate e lacune puntuali di contenuto/provenienza; DSA Rejected nel portale Apple. Il titolare deve fornire lo stato trader/non-trader effettivo e la revisione indipendente deve essere realmente completata. Nessuna approvazione viene inventata dal software.

Il caricamento e l’analisi delle foto personali sono rinviati per decisione esplicita del titolare: conservarne codice e test senza accesso dall’app. Questo rinvio non blocca la release corrente.
