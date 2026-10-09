# Revisione bibliografica e test fotografico — 9 ottobre 2026

Questo controllo documentale non costituisce una revisione indipendente firmata da un micologo. Lo stato di revisione indipendente del catalogo resta pendente.

## Osservazioni e correzioni

- Le categorie alimentari conservano l’evidenza puntuale della Guida ragionata 2021. Fotografie e fonti morfologiche non conferiscono commestibilità.
- Tutte le 38 unità del minimo classificate tossiche o mortali hanno sindrome, latenza e gravità strutturate: integrate le 20 voci mancanti. Fonti e pagine esaminate restano in `toxicology-syndromes.json`.
- Mycena sez. Purae: quadro gastrointestinale incostante secondo la Guida; l’attribuzione automatica di sindrome muscarinica o psicotropa è discutibile.
- Dermocybe: tossicità gastrointestinale e/o sospetta nefrotossicità non orellanica. I dati sperimentali non diventano una casistica clinica umana confermata.
- Entoloma vernum/hirtipes e Hypholoma fasciculare: mantenuti gli esordi tardivi e i diversi limiti delle conferme cliniche. Una gastroenterite fungina non ha necessariamente latenza breve.
- Hapalopilus rutilans: quadro da acido poliporico e carattere di conferma viola al KOH; il reagente non è un carattere osservabile in foto. Fonte morfologica: AUSL Bologna, p. stampata 134, PDF 133.
- Lepiota elaiophylla: evidenziato l’avviso documentato sulle amatossine. L’assenza di una valutazione nella Guida non viene interpretata come sicurezza alimentare.
- Sono visualizzati tutti i limiti diagnostici riconosciuti, compresi rango didattico e necessità di conferma specialistica.
- Le schede mostrano anche latenza e manifestazioni/gravità, oltre al nome della sindrome.

Le principali fonti aggiunte sono la Guida 2021 e l’Atlante dei funghi velenosi AUSL Bologna. Sono distinti dati specifici del taxon e descrizioni generali della sindrome. Due sporate rimangono non documentate: Scutiger pes-caprae e Ramaria pallida; nessun colore viene inventato.

## Test fotografico

89 casi iniziali: 34 liberi, 8 condizionati, 21 tossici, 7 mortali, 9 sconsigliati e 10 non commestibili. Ammesse soltanto specie con binomio, fotografia esplicitamente attribuita al taxon, categoria documentata e soluzione completa per le parti richieste. Gruppi, schede miste e fotografie senza soggetto verificato restano nell’atlante, fuori dal test automatico.

Ogni sessione estrae 15 casi distinti; quando disponibili include almeno tre condizionati, tre tossici, due mortali e tre liberi. Il nome e i crediti non sono mostrati prima della correzione. Le viste mantengono il ritaglio disponibile senza ulteriore taglio; viene spiegato che alcune derivano dalla stessa fotografia originale.

- Allenamento: confronto dopo ciascuna risposta.
- Simulazione: confronto dopo tutte le 15 risposte, con possibilità di tornare alla precedente.
- Nome e categoria: correzione automatica. Maiuscole e spazi sono normalizzati; soltanto sinonimi scientifici documentati sono ammessi. Non sono accettati automaticamente nomi volgari, abbreviazioni o semplici somiglianze ortografiche.
- Preparazione: risposta libera confrontata con tutte le condizioni documentate nel profilo alimentare. Nessuna bollitura o durata universale.
- Tossicologia: risposta libera confrontata con sindrome, latenza, manifestazioni, organi e gravità. La griglia conserva le incertezze della fonte.
- Spiegazioni: autovalutazione distinta, completa/parziale/da ripassare; nessuna correzione semantica automatica simulata.
- Risultati: identificazione, categoria, preparazione e tossicologia separate. I giudizi di consumo per categorie che non lo consentono e la scelta “libera” per un condizionato sono segnalati come errori alimentari pericolosi. Una categoria corretta non certifica una preparazione sicura.
- Sessione e ultima correzione: locali al dispositivo, formato validato e invalidazione quando cambiano soluzioni o foto. Errori di memoria vengono segnalati. Nessun invio delle risposte. Il pulsante “Scarica foto della sessione” prepara le immagini dei 15 casi scelti: il download va completato con connessione prima di studiare offline.

Resta necessario studiare esemplari reali, base del gambo, contesto ecologico e caratteri non visibili in fotografia. Non viene attribuita una soglia ufficiale di promozione. Il ripasso testuale esistente rimane disponibile.

## Verifica e rilascio

Controlli Node su dati, evidenze, soggetti fotografici, sinonimi, sessione e correzione. Build PWA comprendente i nuovi moduli nell’hash e nella cache offline. Il workflow Pages verifica prima del deploy anche WebKit a 320 px: simulazione completa, ripresa locale, ingrandimento, autovalutazione separata, avvio offline e regressioni iOS. Pubblicazione su main; nessuna modifica al ramo `backup/main-pre-beta-publish-20261009`.
