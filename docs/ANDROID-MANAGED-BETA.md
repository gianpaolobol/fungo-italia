# Beta Android completa — stato e procedura

## Aggiornamento corrente — servizio accessibile e prove live

Il titolare ha autorizzato esplicitamente l'apertura del servizio ai telefoni. Audience Sites public, revisione accessi2; pannello e API amministrative restano autorizzati solo per la sua identità autenticata. Health anonima ready=true, whoami anonimo userId=null, pannello/admin.js/API admin anonimi403, intestazione di identità arbitraria rimossa dal dispatch, origine browser estranea403: prove HTTPS reali riuscite. Nessun bypass Sites inserito nell'app.

Prova sul vero D1: due riscatti simultanei di un invito sintetico producono un solo successo; scadenza esattamente90×24ore; controllo sessione attivo senza email/token nella risposta. Revoca dal pannello della sessione attiva e successiva check: active=false e maxAgeSeconds=0. Email tecniche example.invalid, nessun messaggio inviato. Backup/ripristino del D1 reale non provato tramite le API disponibili.

Aggiunti test con React realmente montato e componenti di produzione: esame fotografico e teorico, scrittura locale trattenuta durante completo→demo→completo, conservazione bozza e storico. Il test teorico ha riprodotto la lettura prematura della bozza (RED), corretta con coda condivisa di scritture/letture in theoryRuntime (GREEN). Suite completa360test0fail0skip e TypeScript passati localmente; dati scientifici invariati. react-test-renderer è una sola dipendenza di sviluppo e non è importato dall'app.

Corretto anche il test UI amministrativo che attendeva cinque turni dell'event loop: ora attende l'azione realmente renderizzata, verificata con rete ritardata. I due run documentali precedenti restano FAILURE storici; non attribuire loro il risultato verde del run iniziale40611495555.

Predisposta prova Android35 su APK diagnostico, servizio reale e invito tecnico monouso: attivazione, esame completo, foreground offline/demo, recupero bozza online, teoria dopo cold start e revoca dal pannello. Non ancora eseguita. Richiede un codice sintetico in FUNGO_BETA_SMOKE_INVITE nei segreti cifrati GitHub del solo repository. Il salvataggio è stato bloccato dall'approvazione automatica: manca consenso specifico a quella destinazione e accesso da workflow/collaboratori. Nessuna alternativa indiretta o token in sorgente/log. Occorre consenso esplicito del titolare prima di ritentare.

Il ramo non contiene questo codice. Il job beta-smoke viene richiesto solo con input build_store o messaggio di commit esplicito [sign managed android]; la firma dipende da qualify, smoke e beta-smoke riusciti sul medesimo SHA e da health pubblica ready=true. Questa condizione push permette l'avvio dal ramo dedicato senza portare il workflow su main. Push ordinari non firmano né distribuiscono.

Nessuna nuova AAB completa ancora firmata, caricata o consegnata a Cyrus; Google Play rimane alla demo1.1.0(3). Nessuna modifica/distribuzione iOS, web o OTA.

## Stato precedente del 28 ottobre 2026

Implementati e verificati localmente servizio concessioni/API, pannello proprietario, controller Android con SecureStore e integrazione dell'accesso completo. 358 test Node passati e TypeScript passato, dati rigenerati senza drift. Revisione separata: corretti tre difetti importanti con riproduzione RED→GREEN (date nel pannello e due condizioni di ciclo vita). Il pannello è stato provato attraverso il suo vero JavaScript servito con un adattatore DOM di test, non su un telefono.

Login amministratore sul servizio pubblicato verificato nel checkpoint finale sotto. Non sono ancora verificati: confine di autenticazione hosted, concorrenza/backup del vero D1, accessibilità API dai telefoni, nuova compilazione nativa, installazione Play e revoca su dispositivo. La nuova beta completa non è ancora distribuita. Google Play conserva la build1.1.0(3), demo Agaricus.

## Contratto funzionale

- Inviti personali via email, riscattabili una sola volta entro7giorni.
- Accesso completo90giorni dal primo riscatto; nessun rinnovo o addebito automatico.
- Il titolare può cambiare scadenza e revocare un tester o tutti. Rinvio/reinstallazione non riparte da90giorni; nuova sessione invalida quella precedente.
- Revoca immediata sul server, applicata dal client all'avvio/foreground e al massimo entro60secondi dall'ultima verifica valida durante l'uso. Senza verificaonline resta solo la demo.
- Preferiti, esami, bozze e progressi restano locali. Un abbonamento acquistato e verificato è indipendente dalla beta.

## Infrastruttura

Nuovo Site separato `appgprj_6ae143501aa48191b061cabd1d53deb6`, sorgente operativo in `/workspace/sites/fungo-italia-beta`. Nessun vecchio sito è stato ripubblicato. Le API usano D1 transazionale; `server/beta/schema.sql` è lo schema per i test Node, lo schema hosted/migrazioni sono nel repository Sites. I tre moduli store/server/admin-assets devono essere copiati byte per byte dalla sorgente qualificata prima di ogni build Sites.

Il codice admin usa l'identità affidabile Sites (`oai-authenticated-user-id`) e la confronta con `BETA_ADMIN_USER_ID` configurato nell'ambiente runtime. Non impostare questo valore usando email, account IDs di altri Sites o ID ipotizzati. Un login effettivo del titolare sul nuovo Site deve fornire il valore stabile tramite `/whoami`. Configurazione assente = nessun amministratore.

Sito inizialmente privato: prima di permettere chiamate dai telefoni occorrono identity binding reale, approvazione dell'audience, pubblicazione verificata, test di accesso anonimo negato al pannello/API admin e test delle API beta con invito sintetico. Non inserire il bypass bearer Sites nell'app Android.

## Inviti e privacy

Il pannello prepara il messaggio con link Google Play e link personale di attivazione; il titolare lo invia dal suo programma email. `Prepara invito` non equivale a `email inviata`. Le liste tester Play devono contenere lo stesso account invitato; il pannello non dispone di una API Google autorizzata per modificarle automaticamente. Gli inviti al primo collaudatore possono essere inviati tramite il connettore Gmail esplicitamente autorizzato, solo dopo la nuova build.

Email dei tester in database privato; token invito/sessione solo hash sul server e credenziale sessione nel keystore del telefono. Non copiare email reali, codici, token o risposte private in GitHub. Il servizio beta non riceve fotografie, risposte d'esame o storico. La conservazione e cancellazione dei record amministrativi devono essere definite nella privacy prima della distribuzione estesa; il prototipo non dispone ancora di cancellazione automatica dei record.

## Build e gate

Profilo EAS `android-managed-beta`, canale isolato; stesso package `it.fungoitalia.app`, incremento versionCode remoto e stessa chiave upload. L'endpoint è HTTPS root, mai locale o mock. Acquisti bootstrap restano disabilitati.

Workflow `android-managed-beta.yml`: push del solo ramo dedicato qualifica e compila diagnostici; non invia a Play, iOS, web o OTA. La richiesta firmata è esclusivamente manuale con `build_store=true`, dopo che `/health` del servizio reale è raggiungibile senza bypass e `ready=true`. Il verde del job EAS prova solo l'accodamento: verificare EAS, AAB firmato e disponibilità Play separatamente.

Prima di consegnare: prova beta completa/revoca/scadenza/offline, preservazione bozza e storico nei veri componenti, e prova Android emulatore/dispositivo. Le fixture Node non sostituiscono queste prove. Gate scientifici e snapshot invariati; nessuna revisione indipendente attribuita.

## Checkpoint servizio privato e accesso amministratore

Servizio privato pubblicato correttamente: versione Sites1, sorgente815a798972d83ac5a61e0fad7d9e696a2a4cd6c6, deployment appgdep_6ae1473d611081918de8bdfb38a5178f. Il servizio non è stato aperto ai telefoni; BETA_ADMIN_USER_ID non impostato, nessun diritto beta reale creato.

Il browser ha raggiunto il gate ChatGPT del nuovo Site e quindi auth.openai.com/log-in. La richiesta sicura browserAuth per la scelta del metodo è scaduta senza esito; anche la verifica immediata su una nuova scheda del target è andata in timeout. Stato login sconosciuto: non assumere autenticazione riuscita o fallita, non leggere credenziali, non ripetere tentativi automaticamente. Occorre riprendere l'accesso del titolare quando il browser è disponibile, leggere il vero user ID di questo Site da /whoami e configurare l'amministratore. Nessun invio di nuovo codice a Cyrus prima del servizio operativo e della nuova build.

La PR131 è in bozza sul ramo Android precedente, senza merge. Il wrapper di lettura Actions restituisce solo run pull-request e non attesta il risultato dei run push: non chiamare verde una qualifica remota non letta. Questo aggiornamento documentale produce una nuova esecuzione push del workflow Android dedicato; la firma store resta disabilitata su push.


## Accesso amministratore riuscito — 28 ottobre 2026, 08:25 italiane

Il titolare ha scelto Google attraverso browserAuth e il browser ha raggiunto /whoami con identità reale del nuovo Site. Identità associata a BETA_ADMIN_USER_ID come segreto runtime; nessun valore privato nel repository. Deployment appgdep_6ae1a360e6d48191971e14817ab09e76 SUCCEEDED, versione1 invariata, env revision1. Accesso effettivo a /admin e lettura D1 riusciti.

Prova browser sul servizio reale: creato un solo invito tecnico example.invalid, modificata scadenza al26/01/2027 e revocato. Dopo ricaricamento la tabella restituisce Revocata e la scadenza persistente. Nessuna email inviata dal pannello; nessun nuovo invito reale a Cyrus. Questa prova non dimostra ancora il riscatto concorrente, la revoca su telefono o il confine anonimo su audience pubblica.

Il servizio rimane owner-private. Occorre consenso esplicito al cambio audience per rendere le API raggiungibili dai telefoni senza login ChatGPT; il codice mantiene il pannello limitato all'identità del titolare e richiede credenziali personali per redeem/check. Non inserire bypass Sites nel client. Restano controlli reali del confine pubblico, qualifica nativa e nuova build interna. La lettura combined status del commit8fb23974 non restituisce statuses e non prova l'esito Actions.
