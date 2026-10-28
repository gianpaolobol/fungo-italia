# Beta Android completa gestita dal titolare

Stato: requisiti funzionali confermati dal titolare il 28 ottobre 2026; esecuzione autorizzata dal titolare («procedi come deciso»), revisione tecnica e verifiche in corso. Nessuna nuova beta completa pubblicata.

## Intento e baseline

Consentire al titolare di invitare collaudatori che possano consultare tutte le schede e tutti i test dell'app, gratuitamente e per 90 giorni, con revoca individuale e possibilità di aggiungere altri tester. Non cambiare i contenuti scientifici né trasformare una beta in una certificazione.

La build Google Play 1.1.0(3), sorgente 025ba72314925f2b531b85422c6e30bd82e74c04, è stata pubblicata nel canale interno 4700709243566842351. È tuttora demo Agaricus. La lista autorizzata contiene il primo collaudatore nominato dal titolare; l'email di adesione al test è stata inviata. Non riportare email o segreti dei tester nel repository pubblico.

Il codice nativo concede oggi accesso completo solo da `billing.active` in `App.tsx`. Non esiste ancora un servizio beta o un account Fungo Italia nell'app. Il verificatore Play in `server/play-billing/` non è distribuito. GitHub Pages è statico. Il progetto Floot storico ha modifiche non pubblicate e non è la versione corrente: non pubblicarlo o collegarlo implicitamente per ottenere questo servizio.

## Approcci

1. Solo canale Play: distribuisce gli aggiornamenti, ma non realizza scadenza e revoca dell'accesso dentro copie installate. Inadeguato al requisito.
2. Build integralmente sbloccata con sola data locale: semplice ma non revocabile individualmente e aggirabile cambiando l'orologio. Escluso.
3. Diritto beta sul server, distinto dall'abbonamento: scelto nel confronto funzionale con il titolare; richiede un servizio HTTPS persistente e pannello amministrativo. Nessun servizio a pagamento o nuovo accesso infrastrutturale è autorizzato implicitamente.

## Regole utente

- Beta Android completa: tutte le schede e tutti gli esercizi già inclusi nel catalogo ammesso, ai livelli previsti. Nessun contenuto scientifico aggiunto.
- Durata 90 × 24 ore dal primo riscatto riuscito dell'invito, calcolata sul server in UTC. Decorrenza adottata per non consumare i 90 giorni prima che il tester attivi l’invito. Inviti sostitutivi conservano la scadenza originale.
- Il titolare può invitare, vedere stato e scadenza, prorogare, revocare singolarmente e chiudere tutte le beta. Un invito non conferisce alcun ruolo amministrativo.
- Una revoca invalida subito sul server il diritto beta e tutte le sue sessioni; non basta rimuovere l'email dalla lista Play.
- Il client ricontrolla all'apertura, al ritorno in primo piano e ogni 60 secondi mentre è attivo. Senza verifica online valida resta disponibile solo la demo. Un diritto valido ricevuto prima della revoca dura al massimo fino al termine dei suoi 60 secondi: non promettere revoca istantanea su un dispositivo offline.
- Non interrompere una risposta d'esame con perdita dei dati: conservare immediatamente la bozza; dopo il blocco non permettere nuovi casi completi. Le bozze potranno essere riprese con un nuovo diritto valido.
- Dopo scadenza/revoca si torna alla demo Agaricus. Preferiti, storico, note e progressi restano integri, inclusi gli ID temporaneamente nascosti.
- Nessun addebito o acquisto automatico alla scadenza. Il futuro abbonamento a 19,99 €/anno richiede un acquisto Google Play separato e verificato. Un abbonamento realmente attivo resta valido anche dopo la revoca della sola beta.
- Google Play membership e accesso beta sono due passaggi distinti. Il pannello prepara l'email con entrambi i collegamenti; non promette di aggiornare le liste Play tramite API non disponibili. La prima versione documenta l'assegnazione della lista in Console.

## Identità e confini di fiducia

Scelta tecnica proposta: invito personale ad alta entropia, consegnato all'email inserita dall'amministratore, riscattabile una sola volta. Evita introdurre OAuth Google non configurato. Il possesso dell'invito dimostra l'accesso al messaggio, non un'identità Google verificata. Il codice non deve concedere accesso digitando soltanto un'email; non confondere appartenenza alla lista Play con autenticazione server.

Gli inviti hanno segreto casuale di almeno 256 bit, sono conservati solo come hash sul server, scadono dopo 7 giorni se non riscattati e non compaiono in query string o log. I token in un frammento deep-link devono essere rimossi dalla navigazione dopo il riscatto; prevedere inserimento manuale se il collegamento non apre l'app. Il reinvio sostituisce il segreto non ancora riscattato; la riattivazione di una beta revocata richiede un nuovo invito esplicito.

Riscatto atomico e sessione opaca casuale salvata nel keystore Android mediante Expo SecureStore; sul server solo hash. Scadenza assoluta e stato della concessione riletti a ogni controllo; nessun token beta indipendente dalle revoche salvato come premium. Reinstallazione o cambio telefono richiedono un nuovo invito del titolare nella prima versione. Non promettere sincronizzazione dello storico fra telefoni.

Pannello amministrativo separato, accessibile solo tramite credenziale server del titolare, mai inclusa nell'app, nel bundle web o nel repository. Autenticazione e autorizzazione verificate per ogni operazione; protezione CSRF per sessioni cookie, cookie Secure/HttpOnly/SameSite, scadenza sessione e limitazione tentativi. Nessuna registrazione pubblica di amministratori o endpoint claim-owner. Configurazione delle nuove credenziali/accessi richiede conferma specifica al momento dell'attivazione.

## Componenti e distribuzione

- Servizio Node 24 coerente con il repository; API HTTPS beta separata dalle API acquisti Google. Persistenza transazionale SQLite su volume dedicato, singola istanza, backup e ripristino verificati. Nessuna persistenza nel filesystem effimero di un runtime serverless.
- API: `POST /beta/redeem`, `POST /beta/check`, `POST /beta/logout`; richieste JSON limitate a 4 KiB, timeout, rate limit, risposte no-store, errori senza email, codici o token.
- API admin autenticata: elenco paginato, invito/reinvio, proroga, revoca individuale e revoca globale; registro eventi minimo senza token. Tutte le mutazioni sono POST e includono versione attesa per evitare aggiornamenti persi.
- Email e segreti dei collaudatori restano nel database privato. Il repository conserva solo fixture sintetiche e conteggi.
- UI app per inserire l'invito e leggere stato/scadenza; il pannello admin non è esposto nelle normali schermate di studio.
- Diritto effettivo Android = abbonamento Google verificato O beta attiva verificata. StoreKit iOS e web restano identici. Il nuovo diritto non altera `billing.active`, non fabbrica acquisti e non abilita gli acquisti bootstrap.
- Profilo EAS Android dedicato con URL beta HTTPS, canale distinto, incremento versionCode remoto e stessa chiave di caricamento. Nessun endpoint localhost o mock in una build caricabile.
- Hosting non ancora identificato né attivato. Prima del live: scegliere una destinazione con HTTPS e volume persistente, conoscere eventuali costi, configurare credenziale amministratore e autorizzare l'esposizione dei soli endpoint necessari. Senza questi prerequisiti la build completa non va pubblicata.
- Nessuna modifica al vecchio Floot, nessun merge che attivi iOS/web/OTA. Nuova build Android solo sul canale interno con destinatari autorizzati.

## Prove richieste

Server: riscatto concorrente singolo, scadenza invito e 90 giorni esatti, revoca prima/dopo attivazione, reinvio e token precedente, errore storage/restore backup, idempotenza e concorrenza admin, accessi non autorizzati, rate limit, assenza token nei log.

Client: tutte le schede/test con beta valida senza acquisto, demo con beta assente/scaduta/revocata/offline, revoca durante uso entro finestra massima, sospensione e ritorno offline, risposte di rete fuori ordine, orologio locale manipolato, conservazione bozza e storico, distinzione beta/abbonamento attivo. Il tempo di validità locale usa tempo monotono dalla risposta server e non può estendersi col cambio dell'orologio.

Distribuzione: stessi byte qualificati in emulatori Android e AAB firmato; sorgente/versionCode/fingerprint/firma verificati, prove del servizio reale (anche revoca dal pannello) e test installazione Play con primo collaudatore. Non riutilizzare il verde della build3 come prova della nuova build. Inviare il nuovo invito solo dopo questi controlli; niente falso accesso completo sulla build3.

## Separazioni da conservare

`certified=false`, `independentReleaseReady=false`, `appStoreReady=false` rimangono invariati. L'autorizzazione del titolare al collaudo di ulteriori utenti è reale ma non costituisce una revisione indipendente. La pipeline deve documentare il pubblico e lo snapshot approvati senza estendere silenciosamente la precedente attestazione riservata al solo titolare. Le copie dei contenuti già memorizzate o fotografate non sono cancellabili tramite revoca: il controllo riguarda l'accesso attraverso l'app.

## Decisioni esecutive del 28 ottobre

- Servizio separato su Sites, progetto `appgprj_6ae143501aa48191b061cabd1d53deb6`; database persistente D1 invece di SQLite su disco di un nuovo host. La stessa policy SQL è verificata localmente con SQLite. Il vecchio sito Sites e Floot restano invariati.
- Amministrazione tramite identità ChatGPT del titolare, autorizzata dal suo user ID stabile nel nuovo Site; nessuna nuova password. `BETA_ADMIN_USER_ID` deve essere configurato dopo l'accesso reale del titolare. Finché manca, il pannello/API admin negano ogni accesso.
- Il sito nasce privato. Il passaggio dei soli servizi necessari a un'app raggiungibile dai tester richiede un cambiamento di audience esplicito: non esporre il servizio prima del controllo amministrativo e dell'approvazione concreta.
- Il pannello prepara una email completa nel programma di posta del titolare. Le capacità di collegamento Gmail nel Site non risultano disponibili: non inventare un invio automatico e non segnare l'email come inviata. Per il primo tester resta disponibile l'invio specifico autorizzato tramite connettore Gmail della sessione, dopo nuova build verificata.
- Le etichette di invito scaduto nel pannello saranno migliorabili: il server nega già il riscatto dopo 7 giorni. Nessuna concessione si rinnova da sola.
