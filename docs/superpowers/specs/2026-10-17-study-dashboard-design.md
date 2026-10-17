# Fungo Italia — Dashboard e percorso di studio
Data: 17 ottobre 2026. Destinazione proposta: prossimo aggiornamento, versione da assegnare.
Stato: progetto funzionale approvato in conversazione; specifica tecnica proposta da revisionare prima dell'implementazione.
Branch: design/study-dashboard-v1-1. Nessuna modifica al binario inviato ad Apple.

## Obiettivo e decisioni confermate
Trasformare lo storico esistente in un percorso personale che mostra progressi, lacune e prossimo allenamento.
Download gratuito. Base permanente: 9,99 EUR una tantum in Italia. Completo: ulteriori 9,99 EUR/anno con rinnovo automatico.
Base include tutte le schede degli obiettivi minimi, una sessione completa con correzioni e Dashboard essenziale.
Completo include anche obiettivi auspicabili e approfondimenti, sessioni illimitate, selezione adattiva e report dettagliati.
Nome facoltativo inserito dall'utente una sola volta, modificabile e conservato sul dispositivo. Nessun accesso Apple introdotto per il saluto e nessuna lettura del nome del telefono.
Saluto iniziale “Ciao”; dopo inserimento “Ciao, <nome>”.
Pulsante “Inizia lo studio” prima dell'avvio effettivo; “Riprendi lo studio” successivamente. Aprire la Dashboard o inserire il nome non avvia il percorso.

## Base esistente verificata
components/PhotoExam.tsx; web/public/exam-core.js ed exam-ui.js; storico documentato in docs/PHOTO-EXAM-TRAINING.md.
Sessioni iniziali di 15 specie, suggerimenti dopo tre lettere, correzione per dimensione, ripetizione di tutti gli errori.
Primo tentativo immutabile, checkpoint, firma della banca e archivio locale fungo-italia:photo-training:v2.
Acquisti: components/SubscriptionGate.tsx, hooks/useSubscription.ts, lib/subscriptionPolicy.ts e modulo Swift fungo-subscription.
Oggi il modello verificato è anteprima gratuita e abbonamento annuale; non esiste ancora un acquisto Base permanente.
Lo storico esistente non è sincronizzato fra dispositivi.

## Accessi e migrazione commerciale
- Gratuito: anteprima di cinque schede già prevista, aree e Dashboard vuota con spiegazione del percorso.
- Base verificata da Apple: schede minime, una prima sessione, riepilogo e risultati sempre consultabili.
- Annuale attivo verificato da Apple: accesso completo, anche per gli abbonati della versione precedente senza imporre acquisto Base.
- Base più annuale: 19,98 EUR nel primo anno, 9,99 EUR ai rinnovi; prezzi effettivi sempre forniti da StoreKit.
- Annuale scaduto: restano storico, nome e progressi; resta Base soltanto se acquistata. Scadenza non concede automaticamente un diritto permanente.
- Rimborso/revoca Base: revocare i relativi accessi senza cancellare lo storico. Annuale attivo continua a concedere il proprio accesso.
- Gli utenti annuali esistenti conservano le prestazioni acquistate per la durata del diritto attivo. Mai richiedere Base per ripristinare un annuale valido.
- Nuovo prodotto Base come acquisto non consumabile; identificatore da verificare contro i prodotti Apple esistenti prima di crearlo. Riutilizzare il prodotto annuale verificato se compatibile.
- Interfaccia commerciale principale: anteprima → Base → estensione annuale. Il verificatore deve comunque riconoscere un annuale valido senza Base.
- Reinstallazione e ripristino recuperano acquisti; non devono essere dichiarati capaci di recuperare lo storico locale in assenza di backup.
- Nessuna modifica ai prezzi, ai prodotti o alle condizioni pubbliche durante questa fase di progettazione. Android e web non ricevono nuovi blocchi commerciali in questo intervento iOS.

## Definizione della sessione Base
Una sessione di 15 casi nuovi con checkpoint e tutti i successivi giri di correzione degli errori. Ripresa dopo chiusura o crash non consuma un'altra sessione.
La sessione risulta utilizzata alla prima risposta valutata e salvata; da quel momento è riprendibile, non rigenerabile per cambiare le domande.
Disponibile anche in modalità allenamento; nessun riavvio gratuito illimitato della stessa prova.
Ogni risposta e consumo della sessione devono essere salvati atomicamente prima di avanzare.
La prima implementazione senza account conserva quota e checkpoint localmente: non garantisce un limite globale fra dispositivi o dopo cancellazione dei dati. Questo limite deve essere dichiarato nella revisione del progetto; non introdurre fingerprinting o identità occulte.
Se si richiede un limite rigoroso per acquisto su tutti i dispositivi, occorre un progetto separato di sincronizzazione con server.

## Dashboard e fungo
Riepilogo disponibile anche dopo scadenza: saluto, pulsante principale, progresso, risultati recenti e prossime attività consentite.
Nome assente o vuoto: “Ciao”. Nome presente: stringa normalizzata e renderizzata come testo, con lunghezza limitata; mai interpretata come markup.
Fungo illustrato in cinque stadi (micelio, primordio, giovane, sviluppo, maturo) e numero testuale equivalente.
Percentuale primaria riferita al programma minimo; percentuale estesa separata per il programma completo.
La crescita segue il punteggio attuale; un record storico separato conserva il miglior risultato. Nessun avanzamento per acquisti o solo tempo nell'app.
Non far sembrare “non studiato” un argomento bloccato commercialmente nel denominatore del minimo.
Con pochi risultati mostrare “Stima iniziale”; prima delle risposte “Preparazione da valutare”.
Supportare testo ingrandito, VoiceOver, movimento ridotto e iPhone 13 mini; nessun dato affidato al solo colore.

## Competenze e indice proposto
Unità valutata: specie/taxon stabile × dimensione (riconoscimento, commestibilità, preparazione, tossicologia).
Le dimensioni non pertinenti o prive di risposte documentate non entrano nel denominatore; non generare contenuti micologici mancanti.
Punteggio di progetto:
S = 0,40 A + 0,25 C + 0,20 R + 0,15 E, componenti da 0 a 100.
A: media dei primi tentativi recenti per unità, poi media fra unità; evitare che la ripetizione di una sola specie domini il risultato.
C: frazione delle unità pertinenti del programma con almeno una prova indipendente; leggere una scheda viene misurato separatamente come copertura dello studio.
R: frazione delle unità dimostrate corrette senza aiuto in almeno due sessioni distanziate di almeno 48 ore.
E: media delle ultime tre simulazioni compatibili senza aiuti; assenza di simulazioni vale evidenza mancante, non successo.
Una correzione immediata non aggiorna A o R; primo risultato conservato.
Suggerimento usato: registrazione esplicita; non qualifica una prova autonoma per R.
Finestra iniziale proposta per A: ultimi cinque primi tentativi indipendenti per unità della banca corrente. Parametri versionati, da calibrare nella beta.
Attendibilità proposta: provvisoria fino ad almeno tre sessioni e 30 unità distinte del minimo valutate. Non mostrare probabilità di superamento dell'esame.
Etichetta “Preparazione consolidata” solo se S ≥ 85, copertura minima ≥ 80%, tre simulazioni ≥ 80 e nessun errore critico aperto. Sono soglie didattiche interne, non ufficiali.
Errore critico: classificazione come commestibile di un taxon documentato velenoso/mortale, o omissione documentata critica. Correzione immediata non basta; richiedere due prove autonome successive distanziate di almeno 48 ore.
Mostrare numero e natura degli errori critici anche quando la percentuale è elevata. Indice mai presentato come certificazione di consumo o riconoscimento sul campo.

## Sessioni adattive e simulazioni
Allenamento: feedback immediato, suggerimenti e ripasso, con distribuzione obiettivo 50% lacune, 30% ripasso dovuto, 20% nuove unità/poca evidenza.
Su 15 casi: 8 lacune, 4 ripassi, 3 nuove unità quando disponibili; redistribuire i posti mancanti senza duplicare specie nel giro iniziale.
Priorità: errori critici aperti, errori ricorrenti e ripassi scaduti. Inserire varietà di generi e difficoltà con selezione riproducibile nei test.
Ripasso proposto dopo 1, 3, 7, 14 e 30 giorni, avanzando solo dopo successo autonomo; dopo errore tornare al primo intervallo.
Gli errori rientrano nei giri di correzione già previsti.
Simulazione: programma definito, niente suggerimenti o correzione durante la prova, report finale; distribuzione bilanciata indipendente dal selettore adattivo.
Non presentare questa modalità come replica ufficiale dell'esame di Lagonegro in assenza di programma verificato.

## Dati, componenti e confini
Separare archivio/migrazioni, calcolo competenze puro, selettore puro, accessi StoreKit e UI Dashboard.
Registrare ID sessione/domanda/taxon, revisione banca, modalità, primo tentativo, aiuti, valutazioni per dimensione e timestamp.
Conservare snapshot e versione dell'algoritmo per spiegare cambiamenti dei punteggi.
Importare solo risultati compatibili già valutati; mantenere vecchi risultati come archivio senza inventare dettagli assenti.
Salvare nome e stato del percorso separatamente dalla banca; nessuna raccolta remota introdotta per questi dati.
Gestire salvataggi falliti senza avanzare; modifiche dell'orologio non devono produrre date o percentuali non valide.
StoreKit decide i diritti; i dati didattici non possono concedere premium. Gestire acquisto annullato, pendente, errore, ripristino, rimborso e scadenza.
Nessun salvataggio di chiavi Apple o dati fiscali nel repository.

## Ordine d'intervento
1. Verificare snapshot del codice e prodotti Apple; acquisire baseline dei test attuali e completare la specifica commerciale.
2. Archivio versionato e migrazione dello storico, con backup e prova di ripresa.
3. Calcolatore delle competenze, errori critici, attendibilità e selettore.
4. Dashboard e integrazione del percorso con navigazione, etichette e accessibilità.
5. Base non consumabile e matrice degli accessi, preservando gli annuali esistenti.
6. Report, testi commerciali, privacy e screenshot allineati.
7. Beta TestFlight separata, verifica iPhone/iPad e invio successivo ad Apple.
Niente aggiornamento OTA che modifichi il comportamento della versione in revisione.

## Accettazione e verifica
- Prime risposte, ripetizioni e suggerimenti producono risultati coerenti e spiegabili; nessun incremento artificiale da correzioni ripetute.
- Stesso storico e stessa versione algoritmo producono stesso punteggio.
- Copertura, dimensioni non pertinenti, nessuna evidenza, banca modificata e date limite testate.
- Ripresa/crash/doppio invio non duplicano risultati né consumano sessioni extra.
- Migrazione conserva risultati e favoriti; niente dipendenza del ripristino acquisti dal nome.
- Matrice gratuito/Base/annuale/entrambi, legacy annuale, rimborso, scadenza e reinstallazione verificata.
- Flussi reali StoreKit su iPhone e iPad, compreso Ripristina acquisti esplicito. I fallimenti StoreKit già noti devono essere risolti prima di pubblicare.
- Test TypeScript, unitari pertinenti, esportazione nativa e regressioni web esistenti.
- Verifica visiva su iPhone 13 mini, testo grande, VoiceOver e movimento ridotto.
- Prezzi e promesse Store identici agli accessi effettivi.

## Fuori ambito
Sincronizzazione server e quota globale, account obbligatori, classifiche social, dati del proprietario del telefono, certificazione professionale e modifiche della release attualmente inviata.
