# Atlante micologico versionato, Obiettivi e mappa resiliente

**Data:** 17 settembre 2026  
**Stato:** approvato  
**Progetto:** Fungo Italia — beta nazionale

## 1. Scopo

La beta deve evolvere da un catalogo misto, nel quale schede tassonomiche e obiettivi formativi sono presentati insieme, a un archivio micologico nazionale aggiornabile e storicizzato.

Il nuovo sistema deve:

- separare l'Atlante dagli Obiettivi formativi;
- rappresentare tutti i taxa esplicitamente citati nei livelli minimo, auspicabile e approfondimento della fonte approvata;
- conservare il rango effettivamente sostenuto dalla fonte, senza inventare precisione a livello di specie;
- ordinare l'Atlante secondo un criterio sistematico, iniziando dagli Agaricales;
- associare nomi scientifici, comuni e regionali, commestibilità, caratteri diagnostici, odore, ecologia, distribuzione, fonti e immagini;
- permettere cambi nomenclaturali e trasferimenti tra generi o famiglie senza perdere osservazioni, fotografie o cronologia;
- consentire all'admin fondatore di modificare e pubblicare direttamente ogni scheda durante la beta;
- predisporre il futuro flusso a doppia revisione per tassonomia, commestibilità, tossicità e confusioni pericolose;
- rendere la mappa visibile e utile anche quando la base cartografica o WebGL non sono disponibili.

## 2. Fonti e autorità

### 2.1 Fonti didattiche e alimentari

- **Obiettivi tassonomici nella formazione dei micologi**: determina taxa, rango e livello didattico richiesto.
- **Guida ragionata alla commestibilità dei funghi** della Regione Piemonte: determina categoria di commestibilità, trattamenti e avvertenze alimentari.

Le sintesi dell'applicazione devono essere originali e concise; i documenti non vengono riprodotti integralmente.

### 2.2 Nomenclatura e gerarchia

- **Species Fungorum** è il riferimento primario per nome accettato e gerarchia corrente.
- **Index Fungorum** e **MycoBank** forniscono riscontri nomenclaturali, autori, pubblicazioni e identificatori.
- Il nome presente nella fonte didattica viene conservato separatamente come `sourceName`.
- Nessun servizio esterno modifica automaticamente il catalogo pubblicato.
- In caso di conflitto, il sistema registra le alternative e l'admin sceglie il trattamento pubblicato, indicando fonte e motivazione.

## 3. Architettura scelta

Si adotta un archivio normalizzato e versionato. Il taxon possiede un identificatore interno permanente che non coincide con il nome scientifico. Le informazioni mutabili sono conservate come asserzioni e revisioni collegate a tale identificatore.

Le principali entità sono:

- `Taxon`: identità permanente e rango;
- `TaxonName`: nome accettato, sinonimo, combinazione precedente o nome usato dalla fonte;
- `TaxonPlacement`: collocazione gerarchica valida in un intervallo temporale;
- `TrainingObjective`: livello minimo, auspicabile o approfondimento;
- `EdibilityAssessment`: categoria, trattamento, avvertenze e fonte;
- `DiagnosticProfile`: caratteri macroscopici, odore, sapore e confusioni;
- `EcologyProfile`: habitat, substrato, nutrizione, ospiti, fenologia, quota e distribuzione;
- `MediaAsset`: immagine, attribuzione, licenza, provenienza e stato editoriale;
- `CatalogRevision`: autore, data, motivazione, fonte e differenze della modifica;
- `CatalogRelease`: versione pubblicata e rapporto di copertura.

Le osservazioni, le previsioni territoriali e le fotografie devono riferirsi a `taxonId`, non al nome corrente.

## 4. Navigazione

L'ordine principale è:

1. `Cerca`
2. `Atlante`
3. `Obiettivi`
4. `Metodo`

### 4.1 Cerca

Mantiene mappa, aree aggregate, meteo, pressione anonima e taxa compatibili con area, stagione ed ecologia.

### 4.2 Atlante

Mostra soltanto taxa e schede micologiche. Le intestazioni generiche da Agaricus a Verpa non vengono più aggiunte automaticamente come schede dell'Atlante.

### 4.3 Obiettivi

Accoglie l'attuale inventario delle intestazioni della fonte, da Agaricus a Verpa, con:

- rango richiesto;
- testo sintetico del livello minimo;
- livello auspicabile;
- approfondimento;
- taxa citati, collegati alle relative schede dell'Atlante;
- pagina della fonte.

### 4.4 Metodo

Spiega fonti, revisione, limiti previsionali, privacy, sicurezza alimentare e differenza tra identificazione indicativa e determinazione micologica.

## 5. Perimetro e ordinamento dell'Atlante

Entra nell'Atlante ogni famiglia, genere, sezione, gruppo, aggregato o specie esplicitamente trattato dalla fonte nei livelli minimo, auspicabile o approfondimento.

Regole:

- una specie esplicitamente nominata diventa una scheda autonoma;
- un gruppo o una sezione resta tale se la fonte non richiede separazione a livello specifico;
- abbreviazioni come `A. phalloides` vengono risolte nel contesto del genere della sezione sorgente;
- espressioni discorsive o esempi non tassonomici non generano schede;
- sinonimi e combinazioni precedenti non generano duplicati;
- ogni riga estratta conserva pagina, frammento sorgente e stato di revisione.

L'ordinamento pubblico segue:

1. regno;
2. divisione;
3. classe;
4. ordine, con Agaricales visualizzato per primo;
5. famiglia;
6. genere;
7. rango infragenerico o gruppo;
8. specie;
9. nome scientifico.

Dopo Agaricales vengono presentati gli altri ordini dei Basidiomycota e quindi gli Ascomycota. La chiave di ordinamento è editoriale e modificabile senza alterare la classificazione scientifica.

## 6. Scheda micologica

Ogni scheda può mostrare, quando il rango e le fonti lo permettono:

- nome scientifico accettato con autori;
- nome volgare nazionale;
- nomi regionali con ambito geografico;
- sinonimi, combinazioni precedenti e nome usato nella fonte;
- gerarchia sistematica completa;
- rango e livello didattico;
- categoria di commestibilità;
- trattamenti obbligatori e avvertenze;
- cappello, imenoforo, gambo, velo, carne, sporata e altri caratteri macroscopici;
- odore caratteristico e sapore soltanto quando la fonte ne ammette un uso diagnostico sicuro;
- habitat, substrato e strategia trofica;
- essenze associate e relazioni micorriziche;
- periodo di crescita, quota e distribuzione italiana;
- taxa confondibili e differenze diagnostiche;
- avvertenze sulle confusioni pericolose;
- galleria fotografica;
- fonti puntuali;
- cronologia nomenclaturale ed editoriale.

La scheda non attribuisce automaticamente alla singola specie la commestibilità di un genere o gruppo eterogeneo. In tali casi mostra `stati diversi nel gruppo` oppure `non valutato`, con spiegazione.

## 7. Immagini e gallerie

### 7.1 Acquisizione iniziale

Le immagini vengono ricercate approfonditamente per ogni taxon in archivi che espongono licenza e attribuzione verificabili. Le fonti prioritarie sono Wikimedia Commons e iNaturalist; altri archivi possono essere usati soltanto se consentono il riuso previsto.

La ricerca deve privilegiare:

- corrispondenza con il nome accettato e i sinonimi;
- identificazione comunitaria o curatoriale affidabile;
- provenienza europea o italiana quando utile;
- immagini che documentano caratteri differenti;
- risoluzione sufficiente;
- licenze compatibili con visualizzazione e conservazione dei metadati.

La presenza del nome su un archivio esterno non costituisce da sola verifica micologica.

### 7.2 Metadati obbligatori

Ogni `MediaAsset` conserva:

- URL dell'immagine e URL della pagina originale;
- autore;
- licenza e relativo URL;
- archivio sorgente e identificatore esterno;
- taxon attribuito dalla fonte;
- taxon associato nell'Atlante;
- didascalia e carattere rappresentato;
- località generica, se pubblicabile;
- stato `candidate`, `verified`, `hidden` o `removed`;
- ordinamento e indicazione di immagine principale;
- autore e data della verifica.

Una scheda priva di immagini affidabili viene pubblicata con `Galleria in preparazione` e non con fotografie dubbie o generate artificialmente.

### 7.3 Gestione admin

L'admin può aggiungere, correggere, verificare, riordinare, sostituire, nascondere e rimuovere immagini. La rimozione editoriale non cancella la cronologia della revisione.

## 8. Versionamento tassonomico

Un cambio di nome o collocazione crea una nuova revisione:

- il nome precedente rimane interrogabile come sinonimo o combinazione precedente;
- la precedente gerarchia conserva il proprio intervallo di validità;
- fotografie, osservazioni e previsioni restano collegate allo stesso `taxonId`;
- la modifica registra fonte, motivazione, autore e data;
- la ricerca trova il taxon sia tramite il nome corrente sia tramite quelli storici.

Fusioni o separazioni tassonomiche non vengono simulate con una semplice rinomina. Sono rappresentate da relazioni `mergedInto`, `splitFrom` o `replacedBy`, sottoposte a decisione editoriale.

## 9. Flusso editoriale e permessi

### 9.1 Beta

L'utente proprietario è `founderAdmin` e può pubblicare direttamente:

- nuovi taxa;
- modifiche tassonomiche;
- valutazioni di commestibilità;
- descrizioni ed ecologia;
- nomi comuni e regionali;
- immagini e relativi metadati.

Anche la pubblicazione diretta genera una revisione immutabile e una nuova versione del catalogo. Fonte e motivazione sono obbligatorie per modifiche tassonomiche, alimentari o tossicologiche.

### 9.2 Versione definitiva

Il modello supporta l'attivazione di doppia approvazione per:

- tassonomia;
- commestibilità;
- tossicità;
- confusioni ad alto rischio.

Almeno un revisore deve essere diverso dall'autore. Le modifiche ordinarie possono restare soggette a una sola approvazione competente.

## 10. Mappa resiliente

Il difetto attuale deriva da due condizioni concorrenti:

- la base raster standard di OpenStreetMap può rifiutare o degradare le richieste;
- un errore iniziale della base viene trattato come errore fatale e copre l'intera mappa.

La nuova mappa deve:

- usare una base OSM adatta all'uso applicativo e sostituibile mediante configurazione;
- mantenere visibili aree aggregate e controlli anche se la base non carica;
- distinguere errori di inizializzazione, errori del worker ed errori delle singole risorse;
- non trasformare l'errore di una tessera in errore dell'intera mappa;
- offrire un fallback non-WebGL con sagoma dell'Italia e aree selezionabili;
- mantenere l'elenco aree sempre disponibile;
- mostrare un messaggio diagnostico comprensibile e un comando `Riprova`;
- preservare attribuzioni e privacy.

La base primaria proposta è OpenFreeMap con dati OpenStreetMap. Il fallback leggero non sostituisce la mappa principale, ma garantisce selezione e lettura delle aree sui dispositivi incompatibili.

## 11. Esperienza responsive

La larghezza di riferimento minima è 320 px. Su iPhone 13 mini:

- il menu principale deve scorrere o adattarsi senza uscire dallo schermo;
- mappa ed elenco hanno un selettore esplicito;
- le schede non hanno larghezza minima superiore al viewport;
- la galleria si apre a pieno schermo;
- testi scientifici e nomi lunghi vanno a capo;
- pulsanti e controlli mantengono un'area tattile adeguata;
- nessun contenuto produce scorrimento orizzontale della pagina.

## 12. Importazione e qualità dei dati

La pipeline di importazione produce inventari distinti per:

- intestazioni degli Obiettivi;
- taxa atomici citati;
- sinonimi e nomi storici;
- valutazioni di commestibilità;
- candidati fotografici.

Ogni record passa negli stati `extracted`, `resolved`, `reviewRequired`, `blocked` e `published`. Una release non può essere dichiarata completa se esistono righe della fonte non contabilizzate; possono restare `blocked` soltanto con motivazione esplicita.

## 13. Errori e degradazione controllata

- Fonte tassonomica non raggiungibile: si usa l'ultima versione verificata, senza aggiornamenti automatici.
- Immagine remota non disponibile: si mostra il placeholder e si conserva la pagina sorgente.
- Licenza mancante o incompatibile: immagine esclusa.
- Taxon ambiguo: record in revisione, non pubblicato come specie certa.
- Dati meteorologici mancanti: previsione degradata e motivata.
- Base cartografica assente: fallback delle aree, mai pagina vuota.
- Modifica admin non valida: nessuna pubblicazione parziale; la revisione precedente rimane attiva.

## 14. Criteri di accettazione

La beta è accettabile quando:

1. il menu mostra `Cerca`, `Atlante`, `Obiettivi`, `Metodo` nell'ordine richiesto;
2. l'Atlante non contiene più le 124 intestazioni generiche create per gli Obiettivi;
3. Obiettivi contiene tutte le intestazioni della fonte e i tre livelli disponibili;
4. ogni taxon esplicitamente citato è risolto, bloccato con motivazione o pubblicato;
5. l'Atlante è ordinato sistematicamente con Agaricales per primo;
6. ogni scheda pubblicata mostra rango, livello, commestibilità e fonti senza falsa precisione;
7. nomi precedenti e sinonimi trovano la scheda corrente;
8. almeno una ricerca fotografica documentata esiste per ogni taxon;
9. ogni immagine visibile possiede autore, licenza e fonte;
10. l'admin fondatore può modificare e pubblicare tutte le parti della scheda;
11. ogni pubblicazione crea una revisione consultabile e reversibile;
12. la mappa mostra le aree anche quando la base cartografica fallisce;
13. l'interfaccia non produce overflow orizzontale a 320 px;
14. test automatici, controllo tipi e build di produzione terminano senza errori.

## 15. Confini della beta

La beta non pretende di sostituire la determinazione da parte di un micologo, non garantisce la presenza di una specie in un'area e non autorizza il consumo. Il riconoscimento fotografico resta indicativo. Le schede incomplete sono dichiarate tali e possono essere migliorate progressivamente dall'admin.
