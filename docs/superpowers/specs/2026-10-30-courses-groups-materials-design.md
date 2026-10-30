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
- un account può avere entrambi i ruoli in corsi diversi. Prima versione con un responsabile docente per corso; modello dati con ruoli riferiti al corso, senza confondere proprietà del contenuto e autorizzazione. Co-docenti e assistenti potranno essere abilitati in seguito con permessi espliciti; la relativa interfaccia non è requisito del primo pilot.

Account con identificativo stabile e email verificata tramite collegamento monouso o codice breve. L'email non deve coincidere con l'account Apple/Play. Nessun accesso al numero telefonico o all'identità del proprietario del telefono. Ogni installazione autenticata registra separatamente il proprio token push, rinnovabile/revocabile, senza usarlo come identità.

Invito corso distinto dal codice beta: accettazione con account che dimostra il possesso della mail invitata. Email errate non ottengono accesso. Inviti a scadenza, reinvio controllato, revoca e limiti contro abusi. Nessun elenco reale di studenti nel repository pubblico.

Ogni corso contiene più gruppi; uno studente può appartenere a più gruppi. Inserimento singolo e importazione CSV con anteprima, deduplicazione e riepilogo prima dell'invio. Un docente non vede indirizzi o gruppi di altri docenti. Gli studenti non vedono le email degli altri iscritti.

## Flussi docente e studente

Sul telefono il docente crea una bozza, aggiunge immagini dalla galleria (scatto diretto rinviabile), imposta richiesta e soluzioni, verifica l'anteprima, sceglie gruppi e pubblica. Dal pannello web può caricare più immagini, riordinarle e lavorare su una panoramica. Tablet: interfaccia tattile con spazio per anteprima e dettagli. Le funzioni essenziali, compresi gruppi e PDF, sono presenti su tutti i dispositivi.

Le bozze hanno salvataggio automatico dopo conferma del server, con stato visibile. Versione del record e controllo concorrenza impediscono che due dispositivi si sovrascrivano in silenzio: in caso di conflitto si propone ricaricamento o copia della bozza.

Lo studente trova una sezione "I miei corsi", con corso, "Test assegnati" e "Materiali di studio". Distinguere nuovo, consultato, da svolgere, inviato e corretto; consultato non significa studiato o appreso. Un avviso porta alla risorsa solo dopo autenticazione e verifica dell'accesso.

## Gruppi e assegnazioni

Proposta rivista dopo analisi tecnica: distinguere biblioteca e prove.
- PDF: biblioteca collegata ai gruppi selezionati, con accesso dinamico. Un nuovo iscritto vede anche il materiale già condiviso con il suo gruppo; non riceve una raffica di vecchie notifiche, ma un riepilogo dei materiali disponibili.
- Test: alla pubblicazione si salva l'elenco dei destinatari ottenuto dai gruppi selezionati. Nessuna assegnazione retroattiva automatica: il docente usa "Assegna anche ai nuovi iscritti". Questo evita che un nuovo studente riceva una prova già chiusa.
- Studenti presenti in più gruppi ricevono una sola assegnazione o voce di biblioteca. Conservare gruppi origine e destinatari iniziali per audit senza trasformarli nell'unica fonte di autorizzazione.

Questa distinzione sostituisce la precedente proposta di destinatari congelati anche per tutti i PDF. È una raccomandazione dell'autore, da confermare nell'approvazione del progetto rivisto.

Gli inviti pendenti possono essere destinatari in attesa, vincolati all'email invitata e riscattabili soltanto dopo verifica. Il server li collega all'account senza riassegnarli se cambia il testo di un'email.

La rimozione di uno studente da un gruppo revoca gli accessi ottenuti soltanto tramite quel gruppo; se resta destinatario attraverso un altro gruppo selezionato, mantiene l'accesso. Per i test l'elenco iniziale dei destinatari è immutabile come audit, ma lo stato di autorizzazione e revoca è dinamico. Per i PDF si conservano lo storico delle condivisioni e delle appartenenze, mentre l'accesso dipende dai gruppi attualmente autorizzati. Ogni richiesta API verifica lo stato corrente. Revoca esplicita dell'assegnazione o uscita dal corso prevalgono su tutti i gruppi. Risultati già inviati rimangono nell'archivio del corso secondo la politica di conservazione, senza accesso attivo al materiale.

Invito, iscrizione al corso, autorizzazione al materiale e diritto all'atlante sono controlli distinti. Proposta: il materiale e i test assegnati sono utilizzabili dagli iscritti autorizzati anche senza abbonamento all'atlante, senza sbloccare schede premium. Il modello commerciale resta da definire prima di una distribuzione commerciale.

## Test fotografici

Una prova comprende titolo, istruzioni, casi ordinati, modalità allenamento/esame, disponibilità, scadenza e tentativi. Ogni caso ha una o più fotografie dello stesso soggetto e richiede:
- solo genere: valutazione del solo campo genere;
- genere e specie: due campi e due esiti separati; un genere corretto resta riconosciuto se la specie è sbagliata.

Il docente inserisce la soluzione, eventuali sinonimi ammessi e spiegazione. Collegamento obbligatorio all'unità ammessa e controllo di coerenza del rango; una scheda solo di genere non autorizza una specie autonoma. Punteggio proposto: un punto per campo richiesto, con risultato anche per caso. Normalizzare spazi/maiuscole; nessuna tolleranza tassonomica inventata. Correzioni manuali motivate e tracciate.

Proposta iniziale: allenamento con esito immediato; esame con soluzioni rilasciate dal docente dopo la chiusura. In esame niente autocompletamento suggerito; in allenamento attivabile. Massimo un tentativo in esame per impostazione iniziale, modificabile prima della pubblicazione. Date conservate in UTC e mostrate nel fuso locale.

Una prova pubblicata ha una versione immutabile; modifiche sostanziali creano una nuova versione. Ogni tentativo registra versione, risposte originali, esiti e revisioni. Le soluzioni non sono scaricate anticipatamente dal client d'esame. Correzione e orologio di scadenza autorevoli sul server. Prima versione: esame online, bozza risposte locale e sincronizzata; interruzione rete segnalata, invio idempotente e nessuna dichiarazione di consegna finché il server non conferma. Scadenza con tolleranza esplicita configurata, non decisa dall'orologio del telefono. Allenamento offline e controlli avanzati anti-copia rinviati.

## Biblioteca dei PDF

Il docente carica un PDF, aggiunge titolo, descrizione, autore/provenienza e categoria facoltativa, quindi lo assegna a uno o più gruppi. Può ordinare i materiali in un solo livello di argomenti del corso; cartelle annidate sono rinviate. Bozze e archivio docente restano privati finché non pubblicati. Archivio docente distinto dalla biblioteca visibile agli studenti.

Lo studente apre il PDF dalla biblioteca del corso, con zoom, pagine e ripresa dell'ultima pagina su account. Il materiale resta reperibile dopo la notifica. Apertura e progresso di lettura, se rilevati e comunicati, non certificano apprendimento.

Proposte tecniche iniziali: limite 50 MB per PDF, caricamento con avanzamento e ritentativo, verifica firma e tipo reale del file, scansione prima della disponibilità; file cifrati/non leggibili o non conformi rifiutati. Quote complessive per corso/docente da fissare dopo l'inventario del servizio. File in archivio oggetti privato, identificativi non prevedibili e URL temporanei emessi solo dopo autorizzazione. Nessuna email o elenco utenti nel percorso del file.

Per la prima versione consultazione online e nessuna funzione esplicita di download/offline. Ciò non impedisce screenshot o copie ottenibili dal dispositivo: non promettere protezione assoluta. Una futura modalità offline richiede regole su scadenza locale e revoche non immediatamente applicabili.

Una nuova versione del PDF non sovrascrive silenziosamente il documento originale: conserva versione e data, mostra l'aggiornamento e preserva i riferimenti dai test. Il docente può ritirare un documento; la rimozione blocca l'emissione di nuove autorizzazioni alla lettura, conservando solo i metadati necessari all'audit. Eventuali URL temporanei già emessi restano validi fino alla breve scadenza fissata nel piano; una revoca immediata anche di questi richiederebbe controlli a ogni richiesta di consegna. Materiali privi di autorizzazione d'uso non vengono pubblicati. Nessuna elaborazione AI o generazione automatica di quesiti dai PDF nella prima versione.

## Servizio condiviso e modello dati

Servono autenticazione, API con autorizzazioni, database relazionale, archivio privato di file e coda notifiche. Scelta del fornitore e riuso del portale inviti demandati all'inventario tecnico successivo; niente nuovi account, costi o credenziali in questa fase.

Entità minime: User; DeviceRegistration; TeacherRole; Course; CourseMembership; Group; GroupMembership; CourseInvitation; Assessment e AssessmentVersion; Question con immagini e AnswerKey separata; Material e MaterialVersion; AssessmentAssignment con gruppi origine e destinatari; MaterialShare con gruppi autorizzati e storico; Attempt e Response; GradeRevision; Notification e DeliveryAttempt; AuditEvent.

Tutti i record condivisi hanno corso/proprietario e ID stabili. Gli invii usano chiavi idempotenti; gli upload incompleti vengono ripuliti. Le API verificano ruolo, corso, destinatario, validità e revoche a ogni richiesta; conoscere un ID o un URL della notifica non concede diritti. Le email servono per l'invito; le relazioni operative usano ID account. Soluzioni e file privati non entrano nel bundle pubblico dell'app.

## Notifiche

Alla pubblicazione il server salva prima l'assegnazione del test o la condivisione del materiale con i gruppi, poi accoda un messaggio push soltanto ai dispositivi degli account attualmente destinatari. Per i PDF, i futuri membri autorizzati trovano la biblioteca condivisa senza ricevere tutti gli avvisi passati. Per account non ancora attivati resta l'invito email e l'assegnazione in attesa. Registrare errori, ritentativi limitati, token non validi e deduplicazione; logout scollega il dispositivo prima che cambi utente.

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
- PDF consultabile senza aver ricevuto la push; ritiro e revoca impediscono nuove autorizzazioni e nuovi URL; verificata la scadenza degli URL già emessi;
- assegnazione a gruppi sovrapposti senza duplicati; variazioni di iscrizione applicano la politica definita;
- prova solo genere non richiede specie; prova genere/specie produce valutazioni separate;
- soluzioni d'esame non esposte prima del rilascio; invio ripetuto non duplica il tentativo;
- bozza iniziata sul telefono ripresa dal computer; conflitti segnalati;
- interruzione upload/rete non produce un falso stato di completamento;
- iOS/Android/tablet/web collaudati, diritti beta/StoreKit e storico locale preservati.

Questo documento non autorizza pubblicazione commerciale, ampliamento platea TestFlight, modifiche al catalogo o nuovi invii email reali. Stato finale di questa consegna: documentato; implementazione non iniziata. Dopo approvazione del documento: piano tecnico e realizzazione in ramo separato, senza sostituire la correzione beta attualmente aperta.

## Controllo di pianificabilità

Revisione tecnica del documento eseguita il 30 ottobre 2026 da un revisore distinto: nessuna domanda bloccante per preparare il piano. Fornitore, quote complessive e conservazione restano esplicitamente rinviati all'inventario o alla preparazione del pilot. La revisione non approva contenuti scientifici né attesta un'implementazione.


## Analisi di integrazione e miglioramenti — 30 ottobre 2026

### Esito

Funzione realizzabile come modulo corsi aggiunto all'app, con un servizio condiviso e pannello web docente. Non è una piccola modifica al solo esame locale. Le parti che richiedono più attenzione sono identità e autorizzazioni, trattamento dei file, correzione server e continuità delle consegne. La scelta iniziale app + pannello resta valida; questa analisi non avvia l'implementazione.

Ricognizione: codice app f16ddf79390d725a090f914c2b4d80757f5d2798 letto con git show; documento della proposta ee94f9769b57751b3e35bd30019d9b69b3e48716. Portale accessi esistente identificato tramite Sites come attivo, versione 1. In questa analisi non sono stati ottenuti sorgente del backend, schema dati, servizio email, disponibilità di archivio oggetti e coda o limiti di runtime del portale: il riuso del suo backend non è provato. Non sono stati letti elenchi studenti né eseguiti invii o modifiche al servizio.

### Riscontri nel codice e conseguenze

| Riscontro verificato | Conseguenza per il progetto |
| --- | --- |
| App.tsx usa tab personalizzate e resolveAccess per beta/StoreKit | Aggiungere un ingresso corsi circoscritto, senza riscrivere tutta la navigazione o cambiare fullAccess. La collocazione finale dell'ingresso va verificata con un prototipo di usabilità. |
| components/PhotoExam.tsx usa banca locale, immagini da referenceImageAssets, count 4/15 e correzione immediata | Non basta passare una banca remota al componente esistente. Occorre un runner delle prove assegnate, che possa riusare elementi visivi ma non esponga soluzioni o dipenda dall'atlante completo. |
| web/public/exam-core.js valuta acceptedNames come nome unico più commestibilità; startTraining limita a 15 | Servono contratto dei quesiti con campi separati genere/specie e valutazione dedicata. Non togliere limiti o alterare i vecchi test per adattarli ai corsi. |
| lib/study-store.mjs usa chiavi locali globali, separate solo per demo | Dati corso in uno spazio distinto per account e corso, cancellati/scollegati al logout. Conservare lo storico personale locale senza attribuirlo automaticamente a chi accede. |
| Il codice beta usa già SecureStore e richieste API | Riusare il modello di separazione tra servizio e interfaccia, non il token beta come sessione identità né la sua politica di rinnovo come autenticazione docente. |
| Il manifest app comprende react-native-webview ma non un lettore PDF dedicato, document picker o push | WebView da sola non dimostra supporto PDF uniforme. Selezione file, lettore e notifiche sono integrazioni distinte da qualificare; nuove capacità native richiedono nuove build. |

### Miglioramenti di utilità e semplicità

1. **Poche operazioni visibili.** Flusso docente: crea gruppo, prepara contenuto, anteprima, assegna. Mostrare prima le scelte necessarie; scadenze particolari e impostazioni aggiuntive possono stare nei dettagli. Lo studente vede cosa studiare e cosa consegnare, senza dover conoscere la struttura del servizio.
2. **Stesso servizio, due presentazioni.** Condividere contratti dati e regole; conservare schermate native sul telefono e pannello web adattato a computer/tablet. Non richiedere una nuova navigazione generale o una migrazione di tutto il progetto a un altro framework.
3. **Contenuti preparati una volta.** Archivio del docente con immagini e PDF riutilizzabili nelle proprie prove e corsi. Duplicazione delle bozze prima di modificare una prova pubblicata. Niente condivisione globale automatica tra docenti.
4. **Argomenti al posto di cartelle annidate.** Nel pilot usare un solo livello di argomenti, titoli ricercabili e filtro per tipo. Il modello precedente parlava genericamente di cartelle: gerarchie complesse non sono necessarie per avere una biblioteca ordinata.
5. **Collegamento fra studio e prova.** Consentire al docente di allegare riferimenti a uno o più PDF/pagine nella spiegazione rilasciata dopo il test; collegamento con controllo dell'accesso. Non trasformare automaticamente il PDF in domande.
6. **Nessuna configurazione ripetuta dello studente.** Un invito al corso e una verifica email; il server associa gruppi, materiali e prove. Codice di accesso account e codice beta hanno scopi e testi chiaramente distinti.
7. **Correzioni utili senza automatismi fragili.** Risultati separati per genere/specie, commento del docente, filtro dei casi più sbagliati e ripetizione degli errori dopo il rilascio delle soluzioni. Pesi personalizzati, classifiche e modelli statistici avanzati rinviati.

### Questioni didattiche da risolvere nel contratto

Genere e specie non vanno ricavati sempre dividendo una stringa al primo spazio: occorre rispettare rango, gruppi e sinonimi documentati. Per la specie usare un binomio valido; nell'interfaccia può essere richiesto il solo epiteto dopo il campo genere, ma la valutazione deve ricostruire una combinazione tassonomica ammessa.

I sinonimi sono combinazioni complete approvate, non due elenchi indipendenti da mescolare. Esempio: accettare due binomi documentati non autorizza un terzo binomio ottenuto incrociando il genere del primo con l'epiteto del secondo. Contratto e correzione devono preservare questa relazione; un genere corretto conserva il suo punto mentre una combinazione di specie non valida è segnalata.

La specie non deve diventare obbligatoria quando il docente richiede soltanto il genere. La commestibilità non è obbligatoria nelle prove nuove per effetto del vecchio motore. L'eventuale aggiunta di commestibilità o teoria docente è un'estensione successiva.

Preparare immagini prive di suggerimenti involontari: nomi dei file, EXIF, etichette HTML, testi accessibili e crediti possono rivelare la soluzione. Conservare attribuzione e provenienza nel registro docente; esporre al candidato riferimenti neutri prima della correzione senza violare gli obblighi di attribuzione. Se una licenza richiede un'attribuzione che rivela la risposta, il docente deve scegliere altra immagine o accettare esplicitamente quel limite: non sopprimere crediti dovuti. Nessuna promessa di segretezza per quesiti già presenti nell'atlante.

Proposta per il pilot: 1–15 casi, coerente con l'uso attuale e sufficiente a collaudare il flusso; il nuovo contratto non deve codificare il numero 15 come vincolo strutturale. Limite iniziale, punteggio e tentativi sono politiche esplicite della prima versione, non limitazioni ricavate dal vecchio componente.

### PDF e immagini: scegliere dopo una prova tecnica circoscritta

Caricare un PDF e leggerlo sono problemi diversi. Expo DocumentPicker offre selezione documenti su Android, iOS e web; la sua presenza non è un motore di rendering PDF. Per il lettore confrontare:
- lettore web basato su PDF.js ospitato dal servizio e riutilizzato nella WebView, con costo di memoria, compatibilità e accessibilità da provare;
- lettore nativo dedicato su mobile, con maggiore integrazione ma nuova dipendenza e qualifica Expo/React Native;
- apertura nel lettore di sistema come eventuale ripiego dichiarato: meno controllo su ripresa pagina e copia del file, quindi non equivalente al requisito di consultazione dentro l'app.

Raccomandazione: prima di scegliere, breve verifica tecnica successivamente autorizzata su iPhone, iPad e Android con PDF testuali, scansioni pesanti e file vicini al limite. Non è stata eseguita in questa analisi. Non usare visualizzatori online di terze parti che richiedano rendere pubblici i file privati. Compatibilità, ricerca del testo e accessibilità dei PDF scansionati non vanno promesse senza verifica; OCR rinviato.

Proporre limite 50 MB come tetto iniziale da validare, non valore già garantito. Anteprima dimensione e avviso per documenti pesanti; upload binario diretto all'archivio privato tramite autorizzazione temporanea, evitando di caricare interi file in JSON/base64 o nella memoria dell'API. Verificare upload interrotti, lettura parziale, scadenza dei link durante la consultazione e ripulitura. Scanner e quarantena sono requisiti del percorso file prima di aprire il pilot.

Per fotografie prevedere conversione dei formati del telefono e ridimensionamento conservando i caratteri diagnostici, senza alterazioni generative. Usare il selettore di sistema per evitare una richiesta generale di accesso alla libreria quando non necessaria. Prestazioni e dimensioni vanno misurate su telefoni reali.

Un URL firmato già emesso può restare utilizzabile fino alla scadenza: il ritiro non revoca magicamente i byte già scaricati. Per revoca più stretta servono controlli anche alla consegna dei file, URL brevi e assenza di cache condivise, con costo da valutare. Il docente vede la revoca come cessazione dei nuovi accessi autorizzati; non come cancellazione delle copie ricevute.

### Modello di gruppi, account e inviti più robusto

La biblioteca dinamica riduce il lavoro per l'ingresso tardivo degli studenti; gli esami mantengono destinatari definiti. Una rimozione e una successiva reiscrizione non devono riattivare silenziosamente un vecchio esame: la nuova iscrizione ha un'identità distinta e serve una riassegnazione esplicita. La biblioteca dinamica torna invece accessibile con la nuova iscrizione valida. Appartenenze multiple e revoche esplicite hanno test dedicati.

Prima di inviare il docente vede numero di studenti attivi, inviti pendenti e gruppi selezionati. Usare due azioni distinte: pubblicare/assegnare un contenuto e reinviare un avviso; un ritentativo non crea duplicati. Per il pilot bastano input email multiplo e CSV semplice; niente integrazioni con rubriche o Google Groups.

Email normalizzata con regola documentata del fornitore identità, senza eliminare punti o suffissi per ipotizzare equivalenze Gmail. Cambio email richiede verifica e non trasferisce inviti di altri account. Accesso con codice temporaneo più collegamento opzionale riduce la dipendenza dai link che aprono il browser sbagliato; scelta finale dopo inventario dell'autenticazione esistente. Nessuna nuova email è stata inviata in questa analisi.

Un responsabile per corso nel pilot semplifica l'interfaccia, ma membership e ruoli devono poter distinguere in futuro responsabile, docente e assistente. In un corso gli utenti autorizzati vedranno solo dati necessari al proprio ruolo. L'estensione a più istituti richiederà un'organizzazione proprietaria: prevedere un punto di estensione, senza costruire subito una piattaforma istituzionale completa.

### Affidabilità, protezione dei dati e notifiche

Per esami: salvare bozza locale separata per account e tentativo, sincronizzare con stato chiaro; un solo dispositivo scrivente per tentativo, con eventuale passaggio esplicito all'altro. Il docente può lavorare su più dispositivi, ma le modifiche concorrenti della stessa bozza richiedono controllo di versione. Una scadenza mancata non diventa consegna valida perché il telefono era offline; deve esistere una regola didattica e un eventuale intervento docente registrato.

Pubblicazione e creazione degli avvisi devono essere transazionali, con una coda di lavoro affidabile o tabella outbox. Prima di un ritentativo push verificare ancora destinatario e revoche. Un successo del fornitore non equivale a lettura. Usare avvisi generici quando possibile, perché messaggi già inviati possono arrivare dopo una revoca. Il contenuto del test resta protetto all'apertura.

Account web e mobile condividono identità, non necessariamente formato della sessione: memoria protetta per credenziali native, sessioni web progettate per il browser e protezione delle richieste. Logout, scadenza, revoca docente e cambio utente devono scollegare dati e token push anche dopo una reinstallazione; SecureStore può avere comportamenti diversi su iOS/Android, quindi la disinstallazione non è un metodo di revoca.

Prevedere paginazione elenchi, ricerca, caricamento solo del corso aperto e operazioni batch limitate. Non montare tutte le prove e tutti i PDF come contenuti nascosti insieme ai tab attuali. API versionate e attivazione del modulo corsi controllata sul server permettono di mantenere utilizzabili le vecchie build. L'interruzione del servizio corsi non deve impedire consultazione locale già autorizzata o navigazione di base.

### Prima versione raccomandata e ciò che si può rinviare

Prima versione utile, su tutte le interfacce confermate:
- abilitazione docente amministrativa, account studenti e inviti verificati;
- corsi, gruppi e appartenenze, input email/CSV con anteprima;
- PDF in biblioteca per gruppi, titoli e argomenti semplici;
- editor fotografico guidato, genere/genere+specie, bozze e anteprima;
- assegnazione, svolgimento online, correzione, commento e stato consegne;
- notifiche mirate e centro avvisi in-app;
- controlli di accesso, versioni, salvataggi, limiti file, backup e recupero collaudati.

Rinviabili: cartelle annidate, scatto da fotocamera integrata, OCR, generazione AI, video/chat/videolezioni, statistiche avanzate, più docenti per corso nell'interfaccia, esami offline, anti-copia invasivo, programmi tassonomici esterni e nuova monetizzazione.

Prima fetta da costruire e provare in ambiente di collaudo: docente crea gruppo, studente accetta invito, riceve un PDF e lo consulta; utente estraneo viene respinto. Seconda fetta: un test di due immagini con richieste diverse, consegna e correzione, senza rivelare la soluzione. Poi completare notifiche e pilot su dispositivi reali. Ogni fetta verifica insieme app, pannello e servizio, invece di costruire per mesi prima tutta una sola interfaccia.

### Costi, rischi e decisioni ancora aperte

Nessuna stima in euro o data di completamento è sostenuta dai dati raccolti. Le voci da misurare sono numero studenti/docenti attivi, volume file, traffico PDF/immagini, email di accesso, operazioni di database, scansione file, backup e build native. Il traffico dei documenti può pesare più dello spazio: un PDF da 20 MB letto integralmente da 100 allievi produce circa 2 GB di trasferimento per una lettura ciascuno, prima delle ottimizzazioni.

Prima dell'implementazione: inventario backend portale e scelta di riuso o servizio distinto con account condivisi; verifica compatibilità delle nuove librerie; contratto quesiti e autorizzazioni. Prima del pilot reale: informativa, conservazione, limiti e budget, responsabilità sui materiali, gestione segnalazioni e criteri di chiusura del corso. Questi punti non sono stati approvati per inferenza.

### Evidenza e limiti della valutazione

Analisi documentale e del codice, non prova di funzionamento della nuova funzione. Nessun codice applicativo scritto, dipendenza installata, database modificato o build distribuita per questo lavoro. Non è un audit legale o una certificazione di sicurezza. Il precedente controllo di pianificabilità non attestava assenza di tutte le migliorie; i riscontri di questa sezione rendono più preciso il progetto.

Riferimenti tecnici primari consultati:
- https://docs.expo.dev/versions/latest/sdk/document-picker/
- https://docs.expo.dev/versions/latest/sdk/securestore/
- https://docs.expo.dev/develop/authentication/
- https://docs.expo.dev/push-notifications/sending-notifications/
- https://mozilla.github.io/pdf.js/getting_started/

I riferimenti latest sono stati consultati il 30 ottobre 2026; le versioni effettive vanno fissate nel piano tecnico e provate con Expo 58/React Native 0.88-rc.

Revisione distinta della versione ampliata: nessuna domanda bloccante da rivolgere al titolare. Uniformati i criteri su revoca/URL temporanei, destinatari dei test distinti dalle condivisioni PDF e organizzazione a un livello di argomenti. Esito documentale, non collaudo applicativo.
