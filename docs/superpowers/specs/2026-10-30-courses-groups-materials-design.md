# Fungo Italia — Corsi, gruppi, test e materiali PDF

Data: 30 ottobre 2026. Stato: progetto funzionale proposto; approccio confermato dal titolare, documento completo da approvare prima dell'implementazione. Nessuna funzione descritta qui è dichiarata già disponibile.

## Obiettivo e richieste confermate

Consentire a docenti micologi abilitati di gestire corsi e gruppi di studenti, preparare test fotografici e condividere materiali di studio PDF, con accesso riservato ai destinatari. Lo studente riceve una notifica e ritrova quanto assegnato nell'app. Il docente lavora dal telefono nell'app Fungo Italia e da computer/tablet in un pannello web dedicato e ottimizzato. Lo stesso account e gli stessi dati funzionano su tutte le interfacce.

Il titolare ha confermato:
- area docente nell'app e pannello web dedicato, entrambi sincronizzati;
- gruppi creati dal docente e identificazione degli allievi tramite email;
- scelta per ciascun caso fotografico tra richiesta del solo genere o di genere e specie;
- assegnazione di test soltanto agli studenti selezionati;
- caricamento di PDF, archiviazione come materiale di studio e consultazione da parte degli studenti dei gruppi destinatari.

Non sono stati approvati prezzi, nuovi abbonamenti per corsi, un fornitore backend, un calendario di rilascio o un ampliamento del catalogo scientifico. Le scelte indicate come proposta tecnica sotto sono decisioni dell'autore da verificare nell'approvazione di questo documento.

## Contesto attuale e limiti

Repository: gianpaolobol/fungo-italia. Ricognizione documentale su main 83fe69483c344905765ed75ed456aad4c1b72918. La beta su invito ha lavoro separato su sorgente f16ddf79390d725a090f914c2b4d80757f5d2798; questo documento non sostituisce ricevute e verifiche delle build.

L'app usa Expo 58, React Native e navigazione personalizzata in App.tsx. Esistono esame fotografico, esame teorico, storico e progressi locali. lib/study-exam.mjs riusa web/public/exam-core.js: sarà una base da valutare, non una garanzia di compatibilità con correzione remota e tassonomia per campo. L'accesso beta e StoreKit sono diritti distinti dall'iscrizione a un corso.

I manifest letti non attestano un sistema già completo di account docente/studenti, corsi, archivio privato dei PDF o notifiche remote. Il portale inviti esistente va inventariato prima di scegliere se estenderne l'infrastruttura: un codice beta non dimostra da solo l'identità email di uno studente.

Il perimetro curricolare di AGENTS.md resta vincolante: i test fotografici devono riferirsi a unità ammesse nell'atlante, rispettandone il rango. Il docente non amplia il catalogo caricando una foto. I PDF restano materiali del corso attribuiti all'autore, non fonti fondanti o contenuti validati automaticamente dell'atlante. Eventuali programmi tassonomici diversi richiedono una futura decisione esplicita del titolare.

## Approcci valutati e scelta

1. App docente e pannello web collegati allo stesso servizio: scelta confermata dal titolare. Consente una creazione guidata sul telefono, lavoro esteso su computer e tablet, dati e autorizzazioni unici. Richiede due interfacce da mantenere.
2. Solo pannello web adattabile: meno interfacce, ma minore integrazione nell'app. Non è l'approccio scelto.

Si riusano logica, validazione e contratti dati quando appropriato; non si impone la stessa disposizione visiva a tutti gli schermi. Il pannello web è un client: GitHub Pages non conserva dati privati o credenziali.

## Ruoli, identità e corsi

Proposta:
- amministratore Fungo Italia: abilita/revoca il ruolo docente e gestisce segnalazioni; nessuna autoabilitazione docente;
- docente: crea i propri corsi, gruppi, bozze, materiali, assegnazioni e correzioni;
- studente: accetta gli inviti, consulta materiali, svolge prove e vede solo i propri risultati rilasciati;
- un account può avere entrambi i ruoli in corsi diversi. Prima versione senza co-docenti o trasferimenti di proprietà; eventuali abilitazioni aggiuntive sono amministrative.

Account con identificativo stabile e email verificata tramite collegamento monouso o codice breve. L'email non deve coincidere con l'account Apple/Play. Nessun accesso al numero telefonico o all'identità del proprietario del telefono. Ogni installazione autenticata registra separatamente il proprio token push, rinnovabile/revocabile, senza usarlo come identità.

Invito corso distinto dal codice beta: accettazione con account che dimostra il possesso della mail invitata. Email errate non ottengono accesso. Inviti a scadenza, reinvio controllato, revoca e limiti contro abusi. Nessun elenco reale di studenti nel repository pubblico.

Ogni corso contiene più gruppi; uno studente può appartenere a più gruppi. Inserimento singolo e importazione CSV con anteprima, deduplicazione e riepilogo prima dell'invio. Un docente non vede indirizzi o gruppi di altri docenti. Gli studenti non vedono le email degli altri iscritti.

## Flussi docente e studente

Sul telefono il docente crea una bozza, aggiunge immagini dalla galleria (scatto diretto rinviabile), imposta richiesta e soluzioni, verifica l'anteprima, sceglie gruppi e pubblica. Dal pannello web può caricare più immagini, riordinarle e lavorare su una panoramica. Tablet: interfaccia tattile con spazio per anteprima e dettagli. Le funzioni essenziali, compresi gruppi e PDF, sono presenti su tutti i dispositivi.

Le bozze hanno salvataggio automatico dopo conferma del server, con stato visibile. Versione del record e controllo concorrenza impediscono che due dispositivi si sovrascrivano in silenzio: in caso di conflitto si propone ricaricamento o copia della bozza.

Lo studente trova una sezione "I miei corsi", con corso, "Test assegnati" e "Materiali di studio". Distinguere nuovo, consultato, da svolgere, inviato e corretto; consultato non significa studiato o appreso. Un avviso porta alla risorsa solo dopo autenticazione e verifica dell'accesso.

## Gruppi e assegnazioni

Proposta: alla pubblicazione si salva un elenco immutabile degli studenti destinatari ottenuto dai gruppi selezionati; studenti presenti in più gruppi ricevono una sola assegnazione. I gruppi di origine restano registrati. Un'aggiunta successiva a un gruppo non distribuisce retroattivamente prove e documenti: il docente usa un comando esplicito "Assegna anche ai nuovi iscritti".

Gli inviti pendenti possono essere destinatari in attesa, vincolati all'email invitata e riscattabili soltanto dopo verifica. Il server li collega all'account senza riassegnarli se cambia il testo di un'email.

La rimozione di uno studente da un gruppo revoca gli accessi ottenuti soltanto tramite quel gruppo; se resta destinatario attraverso un altro gruppo selezionato, mantiene l'accesso. L'elenco iniziale dei destinatari è immutabile come audit, ma lo stato di autorizzazione e revoca è dinamico e verificato a ogni richiesta. Revoca esplicita dell'assegnazione o uscita dal corso prevalgono su tutti i gruppi. Risultati già inviati rimangono nell'archivio del corso secondo la politica di conservazione, senza accesso attivo al materiale.

Invito, iscrizione al corso, autorizzazione al materiale e diritto all'atlante sono controlli distinti. Proposta: il materiale e i test assegnati sono utilizzabili dagli iscritti autorizzati anche senza abbonamento all'atlante, senza sbloccare schede premium. Il modello commerciale resta da definire prima di una distribuzione commerciale.

## Test fotografici

Una prova comprende titolo, istruzioni, casi ordinati, modalità allenamento/esame, disponibilità, scadenza e tentativi. Ogni caso ha una o più fotografie dello stesso soggetto e richiede:
- solo genere: valutazione del solo campo genere;
- genere e specie: due campi e due esiti separati; un genere corretto resta riconosciuto se la specie è sbagliata.

Il docente inserisce la soluzione, eventuali sinonimi ammessi e spiegazione. Collegamento obbligatorio all'unità ammessa e controllo di coerenza del rango; una scheda solo di genere non autorizza una specie autonoma. Punteggio proposto: un punto per campo richiesto, con risultato anche per caso. Normalizzare spazi/maiuscole; nessuna tolleranza tassonomica inventata. Correzioni manuali motivate e tracciate.

Proposta iniziale: allenamento con esito immediato; esame con soluzioni rilasciate dal docente dopo la chiusura. In esame niente autocompletamento suggerito; in allenamento attivabile. Massimo un tentativo in esame per impostazione iniziale, modificabile prima della pubblicazione. Date conservate in UTC e mostrate nel fuso locale.

Una prova pubblicata ha una versione immutabile; modifiche sostanziali creano una nuova versione. Ogni tentativo registra versione, risposte originali, esiti e revisioni. Le soluzioni non sono scaricate anticipatamente dal client d'esame. Correzione e orologio di scadenza autorevoli sul server. Prima versione: esame online, bozza risposte locale e sincronizzata; interruzione rete segnalata, invio idempotente e nessuna dichiarazione di consegna finché il server non conferma. Scadenza con tolleranza esplicita configurata, non decisa dall'orologio del telefono. Allenamento offline e controlli avanzati anti-copia rinviati.

## Biblioteca dei PDF

Il docente carica un PDF, aggiunge titolo, descrizione, autore/provenienza e categoria facoltativa, quindi lo assegna a uno o più gruppi. Può ordinare i materiali in cartelle o argomenti del corso. Bozze e archivio docente restano privati finché non pubblicati. Archivio docente distinto dalla biblioteca visibile agli studenti.

Lo studente apre il PDF dalla biblioteca del corso, con zoom, pagine e ripresa dell'ultima pagina su account. Il materiale resta reperibile dopo la notifica. Apertura e progresso di lettura, se rilevati e comunicati, non certificano apprendimento.

Proposte tecniche iniziali: limite 50 MB per PDF, caricamento con avanzamento e ritentativo, verifica firma e tipo reale del file, scansione prima della disponibilità; file cifrati/non leggibili o non conformi rifiutati. Quote complessive per corso/docente da fissare dopo l'inventario del servizio. File in archivio oggetti privato, identificativi non prevedibili e URL temporanei emessi solo dopo autorizzazione. Nessuna email o elenco utenti nel percorso del file.

Per la prima versione consultazione online e nessuna funzione esplicita di download/offline. Ciò non impedisce screenshot o copie ottenibili dal dispositivo: non promettere protezione assoluta. Una futura modalità offline richiede regole su scadenza locale e revoche non immediatamente applicabili.

Una nuova versione del PDF non sovrascrive silenziosamente il documento originale: conserva versione e data, mostra l'aggiornamento e preserva i riferimenti dai test. Il docente può ritirare un documento; la rimozione blocca nuove consultazioni, conservando solo i metadati necessari all'audit. Materiali privi di autorizzazione d'uso non vengono pubblicati. Nessuna elaborazione AI o generazione automatica di quesiti dai PDF nella prima versione.

## Servizio condiviso e modello dati

Servono autenticazione, API con autorizzazioni, database relazionale, archivio privato di file e coda notifiche. Scelta del fornitore e riuso del portale inviti demandati all'inventario tecnico successivo; niente nuovi account, costi o credenziali in questa fase.

Entità minime: User; DeviceRegistration; TeacherRole; Course; CourseMembership; Group; GroupMembership; CourseInvitation; Assessment e AssessmentVersion; Question con immagini e AnswerKey separata; Material e MaterialVersion; Assignment con gruppi origine e destinatari; Attempt e Response; GradeRevision; Notification e DeliveryAttempt; AuditEvent.

Tutti i record condivisi hanno corso/proprietario e ID stabili. Gli invii usano chiavi idempotenti; gli upload incompleti vengono ripuliti. Le API verificano ruolo, corso, destinatario, validità e revoche a ogni richiesta; conoscere un ID o un URL della notifica non concede diritti. Le email servono per l'invito; le relazioni operative usano ID account. Soluzioni e file privati non entrano nel bundle pubblico dell'app.

## Notifiche

Alla pubblicazione il server salva prima l'assegnazione, poi invia un messaggio push soltanto ai dispositivi degli account destinatari. Per account non ancora attivati resta l'invito email e l'assegnazione in attesa. Registrare errori, ritentativi limitati, token non validi e deduplicazione; logout scollega il dispositivo prima che cambi utente.

Contenuto discreto, senza soluzioni o dati di altri studenti. Il contatore e l'elenco in-app derivano dal server: una push mancante non nasconde un compito. Distinguere assegnato, avviso inoltrato al fornitore, aperto e consegnato. Non attestare lettura o consegna fisica sulla sola ricevuta push.

Da predisporre credenziali APNs/FCM e librerie compatibili con Expo 58, permessi e prove su dispositivi reali. Questa esigenza richiede nuove build native; non è una semplice modifica web/OTA.

## Privacy, responsabilità e continuità

Niente voti pubblici o graduatorie nominative. Il docente accede ai risultati del proprio corso, lo studente ai propri. Accesso amministrativo eccezionale e registrato. Prima del pilot con dati reali definire informativa, contatti del responsabile del servizio, conservazione, esportazione/cancellazione account e gestione delle copie di backup; termini temporali esatti richiedono una decisione del titolare e non sono inventati qui. La progettazione tecnica deve supportare tali operazioni.

Fotografie e PDF mantengono autore, provenienza e autorizzazioni d'uso. I contenuti del docente non diventano certificazione micologica o autorizzazione al consumo. Non alterare l'atlante e il significato dei progressi individuali esistenti.

Non importare automaticamente lo storico locale in un account condiviso: eventuale migrazione sarà esplicita e non distruttiva. Gli account e i dati di produzione non vengono usati nei test automatizzati.

## Fasi e criteri di accettazione

1. Inventario infrastruttura e modello di autorizzazione; account, ruoli, corsi e gruppi.
2. Biblioteca PDF privata, assegnazioni e consultazione.
3. Composizione e svolgimento test fotografici, correzioni e risultati.
4. Notifiche, sincronizzazione tra dispositivi e pilot controllato.

Ogni fase è collaudata prima del pilot. Verifiche indispensabili:
- studente A assegnatario può aprire; studente B non destinatario è respinto anche chiamando direttamente API/file;
- docente di altro corso non vede gruppi, PDF, soluzioni o risultati;
- invito accettabile solo con email verificata corrispondente; cambio telefono e logout senza contaminazione dei dati;
- PDF consultabile senza aver ricevuto la push; ritiro e revoca impediscono nuove aperture;
- assegnazione a gruppi sovrapposti senza duplicati; variazioni di iscrizione applicano la politica definita;
- prova solo genere non richiede specie; prova genere/specie produce valutazioni separate;
- soluzioni d'esame non esposte prima del rilascio; invio ripetuto non duplica il tentativo;
- bozza iniziata sul telefono ripresa dal computer; conflitti segnalati;
- interruzione upload/rete non produce un falso stato di completamento;
- iOS/Android/tablet/web collaudati, diritti beta/StoreKit e storico locale preservati.

Questo documento non autorizza pubblicazione commerciale, ampliamento platea TestFlight, modifiche al catalogo o nuovi invii email reali. Stato finale di questa consegna: documentato; implementazione non iniziata. Dopo approvazione del documento: piano tecnico e realizzazione in ramo separato, senza sostituire la correzione beta attualmente aperta.

## Controllo di pianificabilità

Revisione tecnica del documento eseguita il 30 ottobre 2026 da un revisore distinto: nessuna domanda bloccante per preparare il piano. Fornitore, quote complessive e conservazione restano esplicitamente rinviati all'inventario o alla preparazione del pilot. La revisione non approva contenuti scientifici né attesta un'implementazione.
