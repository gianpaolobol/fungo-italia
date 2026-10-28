# Beta Android completa — stato e procedura

## Stato reale del 28 ottobre 2026

Implementati e verificati localmente servizio concessioni/API, pannello proprietario, controller Android con SecureStore e integrazione dell'accesso completo. 358 test Node passati e TypeScript passato, dati rigenerati senza drift. Revisione separata: corretti tre difetti importanti con riproduzione RED→GREEN (date nel pannello e due condizioni di ciclo vita). Il pannello è stato provato attraverso il suo vero JavaScript servito con un adattatore DOM di test, non su un telefono.

Non sono ancora verificati: login amministratore sul servizio pubblicato, confine di autenticazione hosted, concorrenza/backup del vero D1, accessibilità API dai telefoni, nuova compilazione nativa, installazione Play e revoca su dispositivo. La nuova beta completa non è ancora distribuita. Google Play conserva la build1.1.0(3), demo Agaricus.

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
