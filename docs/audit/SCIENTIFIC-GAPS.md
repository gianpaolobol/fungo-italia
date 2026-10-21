# Lacune scientifiche per taxon e campo — 21/10/2026

Dati analizzati: `src/data/catalog.json` (148 unità: 99 specie, 37 gruppi di specie, 8 sezioni, 2 sottosezioni, 1 sottogenere, 1 genere) e `src/data/groups.json` (66 schede di genere o gruppo operativo), su `main` @ `6aa6848`.

> **Nessun campo è `VERIFICATO`.** Il repository non contiene alcuna revisione micologica indipendente: il gate di rilascio conta 0 schede revisionate su 148. Le anomalie seguenti vanno confermate o respinte da un micologo qualificato. Nessuna correzione è stata applicata.

## Legenda degli stati

| Codice | Stato della missione | Criterio applicato in modo meccanico sul record |
|---|---|---|
| DOC | `DOCUMENTATO_NON_REVISIONATO` | Il campo ha un valore e almeno una fonte con `fields` pertinente |
| DOC* | `DOCUMENTATO_NON_REVISIONATO` (rango esteso) | Sporata documentata per una specie di esempio o per il genere, non per l'unità stessa |
| DA_VER | `DA_VERIFICARE` | Valore presente ma senza fonte puntuale nel record, oppure nome segnalato |
| CONFL | `CONFLITTUALE` | Fonti o campi della stessa scheda in contrasto |
| MANCANTE | `MANCANTE` | Campo vuoto |

## Conteggi per campo (148 unità)

| Campo | DOC | DOC* | DA_VER | CONFL | MANCANTE |
|---|---|---|---|---|---|
| Nome | 145 | 0 | 3 | 0 | 0 |
| 3+1 | 14 | 0 | 134 | 0 | 0 |
| Habitat | 28 | 0 | 2 | 0 | 118 |
| Odore | 148 | 0 | 0 | 0 | 0 |
| Sporata | 93 | 52 | 0 | 1 | 2 |
| Commest. | 5 | 0 | 141 | 1 | 1 |
| Sindrome | 35 | 0 | 5 | 0 | 0 |
| Sosia | 42 | 0 | 3 | 0 | 103 |

**Cosa dicono i numeri**
- **Caratteri 3+1**: soltanto 14 unità su 148 hanno una fonte puntuale (`fields: characters`). Il cuore didattico dell'app non è tracciabile campo per campo.
- **Commestibilità**: 141 su 148 senza fonte puntuale nel record. La “Guida ragionata 2021” (`S2-…`) viene usata dal generatore, ma l'interfaccia nasconde le fonti `S1-`/`S2-` (`components/Studio.tsx`, funzione `Content`), quindi l'utente non vede da dove viene il giudizio alimentare.
- **Sosia**: 103 su 148 senza confronti, fra cui 4 mortali (*A. virosa*, *A. verna/vidua*, *C. orellanus*, *G. esculenta*), 20 tossiche e 42 a “commestibilità libera”.
- **Habitat**: 118 su 148 vuoti. Lo schema non prevede la **stagionalità**, che compare solo a volte nel testo del carattere +1.
- **Nomi comuni**: 125 su 148 vuoti (non conteggiati in tabella).
- **Sindromi**: 40 schede con sindrome, coerenti con le categorie tossico/mortale. Le latenze sono scritte in modo diverso per la stessa sindrome: falloidea “generalmente” e “di solito” 6–12 h; muscarinica “Breve latenza” e “15 minuti–3 ore”; gastrointestinale con 4 diciture. Conviene normalizzarle su `src/data/toxicology-syndromes.json`.

## Anomalie nominate

| ID | Gr. | Unità | Campo | Evidenza | Proposta (da confermare con il revisore) |
|---|---|---|---|---|---|
| SCI-01 | **P0** | *Lepiota elaiophylla* | commestibilità | `studyProfile.edibility` assente; l'app mostra il badge grigio “non documentata”. La `diagnosticNote` della scheda cita α- e β-amanitina e un potenziale quadro falloideo (AUSL Bologna 2023, p. 206) | Categoria tossicologica con fonte puntuale. Fino ad allora, l'interfaccia tratta i dati mancanti come “potenzialmente pericoloso” |
| SCI-02 | **P0** | *Tricholoma equestre* | commestibilità | “Sconsigliato” insieme a “Sindrome rabdomiolitica… potenzialmente grave o mortale” e al divieto italiano di raccolta, consumo e commercio citato nelle precauzioni | “Tossico” (o una categoria “Vietato”), mantenendo la nota sul divieto |
| SCI-03 | **P0** | Tutte | avvertenza | L'app nativa non ha avvertenze vicino ai badge di commestibilità; il testo “non autorizzano il consumo” compare solo nel tab Esame | Riga fissa sotto il badge e schermata al primo avvio, con l'indicazione degli Ispettorati micologici ASL |
| SCI-04 | **P0** | 141 unità | commestibilità, fonti | Vedi conteggi | Mostrare per ogni giudizio la fonte e la pagina della Guida; per i dati interni, almeno “Fonte: Guida ragionata 2021, p. N” |
| SCI-05 | P1 | *Amanita rubescens* | sosia | `lookalikes: []`. Il confronto con *A. pantherina* è la coppia più importante del genere e compare solo nel +1 di *A. pantherina* | Aggiungere i sosia reciproci *A. pantherina* e *A. excelsa/spissa* |
| SCI-06 | P1 | *A. virosa*, *A. verna/vidua*, *C. orellanus*, *G. esculenta* | sosia | Nessun confronto per 4 specie mortali | *A. virosa/verna*: Agaricus bianchi, *Leucoagaricus leucothites*, *A. ovoidea*. *C. orellanus*: Cortinarius commestibili, *Chroogomphus*. *G. esculenta*: *Morchella*, *Verpa*, *Helvella* |
| SCI-07 | P1 | *Entoloma sinuatum*, *Hypholoma fasciculare*, *Tricholoma pardinum*, *Omphalotus* (ok), *Chlorophyllum molybdites* | sosia | Nessun sosia per alcune delle tossiche più coinvolte nelle intossicazioni (eccetto *Omphalotus*) | *E. sinuatum*: *Clitocybe nebularis*, *Lyophyllum decastes*, *Calocybe gambosa*, *Clitopilus prunulus*. *H. fasciculare*: *Armillaria*, *Kuehneromyces*. *T. pardinum*: *T. terreum* e gruppo |
| SCI-08 | P1 | *Lactarius porniniae* | nome | Le tre foto hanno `subjectTaxon` “Lactarius porninsis”, l'epiteto usato in letteratura (Rolland). “porniniae” sembra una variante ortografica errata | Verificare su Index Fungorum e MycoBank; se confermato, rinominare tenendo l'alias |
| SCI-09 | P1 | *Gyromitra esculenta* | sporata | Conflitto già annotato: ISPRA 188/2019 indica sporata bianca, la fonte registrata crema/giallo-camoscio | Decisione del revisore; nel frattempo mostrare entrambe le versioni |
| SCI-10 | P1 | *Amanita gemmata* | commestibilità | “Non commestibile”; diverse guide italiane la trattano come tossica (acido ibotenico variabile fra popolazioni) | Decisione del revisore |
| SCI-11 | P1 | Copertura del programma | completezza | Il catalogo contiene **solo obiettivi minimi** (148/148 `minimum-card-*`). Le specie di riferimento di generi presenti come schede di gruppo (*Armillaria mellea* s.l., *Paxillus involutus*, *Inocybe erubescens*, *Morchella* spp., *Leccinum* spp., *Russula* commestibili, *Tuber* assente) non hanno schede di specie | Pianificare gli obiettivi auspicabili, a partire dalle specie coinvolte in sindromi gravi (paxillica, muscarinica da *Inocybe*, sindrome da *Morchella*) |
| SCI-12 | P2 | *Amanita pantherina* | commestibilità | “Tossico”; alcune guide italiane: “potenzialmente mortale” | Decisione del revisore |
| SCI-13 | P2 | *Chlorophyllum molybdites* | sindrome | “Sindrome morganica”: denominazione poco diffusa | Verificare il termine nelle fonti italiane; altrimenti “gastrointestinale a tossicità costante” |
| SCI-14 | P2 | *Paralepistopsis amoenolens* | latenza | “L'intervallo preciso non è stabilito dalla fonte” | Integrare con una fonte tossicologica (acromelalgia a esordio tardivo) |
| SCI-15 | P2 | *Clitocybe dealbata / Collybia rivulosa* | sindrome | Latenza e gravità generiche (“Breve latenza”) rispetto a *Collybia phyllophila*, che ha la stessa sindrome | Allineare al profilo muscarinico condiviso |
| SCI-16 | P2 | *Mycena* sez. *Purae* | nome/rango | La scheda include *M. pelianthina*, che non appartiene a *Purae* (la nota lo ammette) | Rinominare l'unità didattica o separarla |
| SCI-17 | P2 | *Coprinus atramentarius* s.l. | nome | Nome storico come titolo; quello corrente (*Coprinopsis atramentaria*) è solo `acceptedName` | Titolo con il nome corrente e il sinonimo sotto, coerente con le altre schede |
| SCI-18 | P2 | *Scutiger pes-caprae*, *Ramaria pallida* | sporata | Mancante | Integrare con fonte |
| SCI-19 | P2 | 52 unità | sporata | Sporata del genere o di una specie esempio (“non estesa automaticamente”) | Va bene come scelta prudente; nell'interfaccia rendere visibile il rango del dato (“dato del genere”) |
| SCI-20 | P2 | Scala alimentare | coerenza | Il dataset usa `free, conditional, discouraged, inedible, toxic, deadly, mixed`. La scala della missione (*Libera, Condizionata, Sconsigliato, Privo di valore, Tossico, Tossico mortale*) non prevede “Non commestibile” (17 unità), mentre l'app offre anche “privo di valore”, che nessuna scheda usa | Decidere un'unica scala. Se “Privo di valore” = “Non commestibile”, unificarle; se no, assegnare le 17 unità |
| SCI-21 | P2 | Foto non rappresentative | identità | *Pleurotus ostreatus*: solo ceppo coltivato PH11. *P. cornucopiae/citrinopileatus*: tre foto di *P. citrinopileatus*. *Lactarius* sez. *Deliciosi*: gruppo nordamericano | Vedi `IMAGE-LICENSE-AUDIT.md` |

## Matrice di verifica delle 148 unità

Ordine: dati mancanti, poi mortali, tossiche e le altre. Colonna “In esame”: presenza in `src/data/exam-bank.json` versionato.

| # | Unità | Rango | Commestibilità (dato) | Nome | 3+1 | Habitat | Odore | Sporata | Commest. | Sindrome | Sosia | Foto | In esame | Anomalia |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Lepiota elaiophylla | species | — | DOC | DA_VER | DOC | DOC | DOC | MANCANTE | — | MANCANTE | OK | no | P0 · Commestibilità assente ma la nota diagnostica cita α/β-amanitina (AUSL Bologna 2023, p. 206): la scheda mostra “non documentata”. |
| 2 | Amanita phalloides | species | Tossico potenzialmente mortale | DOC | DOC | DOC | DOC | DOC | DA_VER | DOC | DOC | OK | sì |  |
| 3 | Amanita verna / Amanita vidua | species | Tossico potenzialmente mortale | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | MANCANTE | OK | no | P1 · Nessun sosia; habitat vuoto; esclusa dall’esame. |
| 4 | Amanita virosa | species | Tossico potenzialmente mortale | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | MANCANTE | OK | sì | P1 · Nessun sosia per una specie mortale (Agaricus bianchi, Leucoagaricus, A. verna). |
| 5 | Amanita proxima | species | Tossico potenzialmente mortale | DOC | DA_VER | DOC | DOC | DOC | DA_VER | DOC | DOC | OK | sì |  |
| 6 | Cortinarius orellanus | species | Tossico potenzialmente mortale | DOC | DA_VER | DOC | DOC | DOC | DOC | DOC | MANCANTE | OK | sì | P1 · Nessun sosia per una specie mortale. |
| 7 | Cortinarius rubellus | species | Tossico potenzialmente mortale | DOC | DA_VER | DOC | DOC | DOC | DOC | DOC | DOC | OK | no | P1 · Esclusa dall’esame per stringa subjectTaxon delle foto non corrispondente. |
| 8 | Galerina marginata group | speciesGroup | Tossico potenzialmente mortale | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | DOC | DOC | OK | no |  |
| 9 | Lepiota subincarnata | species | Tossico potenzialmente mortale | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | DOC | OK | sì |  |
| 10 | Lepiota brunneoincarnata | species | Tossico potenzialmente mortale | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | DOC | OK | sì |  |
| 11 | Gyromitra esculenta | species | Tossico potenzialmente mortale | DOC | DOC | DOC | DOC | CONFL | DOC | DOC | MANCANTE | OK | sì | P1 · Sporata in conflitto fra fonti (ISPRA 188/2019 bianca vs fonte registrata crema/giallo-camoscio); sosia (Morchella) assenti. |
| 12 | Agaricus sez. Xanthodermatei | section | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | DOC | DOC | OK | no |  |
| 13 | Agaricus bresadolanus | species | Tossico | DOC | DOC | DOC | DOC | DOC* | DA_VER | DOC | MANCANTE | OK | sì |  |
| 14 | Amanita pantherina | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | DOC | OK | sì | P2 · Classificata “Tossico”: alcune guide italiane la indicano potenzialmente mortale. Da confermare. |
| 15 | Amanita muscaria | species | Tossico | DOC | DA_VER | DA_VER | DOC | DOC | DA_VER | DOC | DOC | OK | sì |  |
| 16 | Collybia phyllophila | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | MANCANTE | OK | sì |  |
| 17 | Clitocybe dealbata / Collybia rivulosa | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | DOC | DOC | OK | no | P2 · Latenza/gravità generiche rispetto a Collybia phyllophila (stessa sindrome); esclusa dall’esame. |
| 18 | Paralepistopsis amoenolens | species | Tossico | DOC | DA_VER | DOC | DOC | DOC | DA_VER | DA_VER | MANCANTE | OK | sì | P2 · Latenza non indicata (acromelalgia: esordio tipicamente ritardato di giorni) — completare con fonte. |
| 19 | Cortinarius sottogenere Dermocybe | subgenus | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | DA_VER | DOC | OK | no |  |
| 20 | Entoloma sinuatum | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | MANCANTE | OK | sì | P1 · Nessun sosia (Clitocybe nebularis, Lyophyllum, Calocybe gambosa, Clitopilus): è tra le cause più frequenti di intossicazione. |
| 21 | Entoloma rhodopolium s.l. | speciesGroup | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | DOC | MANCANTE | OK | no |  |
| 22 | Entoloma hirtipes | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | MANCANTE | OK | sì |  |
| 23 | Entoloma vernum | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | MANCANTE | OK | sì |  |
| 24 | Hygrocybe conica s.l. | speciesGroup | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | DA_VER | MANCANTE | OK | no |  |
| 25 | Hypholoma fasciculare | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | MANCANTE | OK | sì | P1 · Nessun sosia (Armillaria, Kuehneromyces, H. lateritium). |
| 26 | Chlorophyllum molybdites | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | MANCANTE | OK | sì | P2 · Etichetta “Sindrome morganica” poco diffusa: verificare la denominazione nelle fonti italiane. |
| 27 | Mycena sez. Purae | section | Tossico | DA_VER | DA_VER | MANCANTE | DOC | DOC* | DA_VER | DA_VER | MANCANTE | OK | no | P2 · La scheda include M. pelianthina, che nella sistematica moderna non appartiene a Purae (la nota lo ammette). |
| 28 | Omphalotus olearius | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | DOC | OK | sì |  |
| 29 | Panaeolus cyanescens | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | MANCANTE | OK | sì |  |
| 30 | Tricholoma pardinum | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | MANCANTE | OK | sì |  |
| 31 | Tricholoma filamentosum | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | MANCANTE | OK | sì |  |
| 32 | Tricholoma josserandii | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | MANCANTE | OK | sì |  |
| 33 | Russula Foetentinae | subsection | Tossico | DOC | DOC | MANCANTE | DOC | DOC* | DA_VER | DA_VER | MANCANTE | OK | no |  |
| 34 | Rubroboletus satanas | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | DA_VER | OK | sì |  |
| 35 | Rubroboletus pulchrotinctus | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | MANCANTE | OK | sì |  |
| 36 | Caloboletus radicans | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | MANCANTE | OK | sì |  |
| 37 | Hapalopilus rutilans | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | DOC | OK | sì |  |
| 38 | Ramaria formosa | species | Tossico | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | DOC | MANCANTE | PARZ | sì |  |
| 39 | Ramaria pallida | species | Tossico | DOC | DA_VER | MANCANTE | DOC | MANCANTE | DA_VER | DOC | MANCANTE | PARZ | sì | P2 · Sporata mancante; vista “sotto” mancante. |
| 40 | Agaricus sez. Arvenses | section | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | DOC | OK | no |  |
| 41 | Agaricus sez. Sanguinolenti | section | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 42 | Agaricus campestris | species | Commestibilità libera | DOC | DA_VER | DA_VER | DOC | DOC* | DA_VER | — | DA_VER | OK | sì |  |
| 43 | Agaricus bitorquis | species | Commestibilità libera | DOC | DA_VER | DOC | DOC | DOC* | DA_VER | — | DOC | OK | sì |  |
| 44 | Agaricus bisporus | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 45 | Cyclocybe cylindracea | species | Commestibilità condizionata | DOC | DA_VER | DOC | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 46 | Amanita ovoidea | species | Non commestibile | DOC | DA_VER | DOC | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 47 | Amanita caesarea | species | Commestibilità libera | DOC | DOC | DOC | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 48 | Amanita gemmata | species | Non commestibile | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | DOC | OK | sì | P1 · “Non commestibile”: molte guide italiane la trattano come tossica (sindrome panterinica in alcune popolazioni). Da far decidere al revisore. |
| 49 | Amanita citrina | species | Non commestibile | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 50 | Amanita porphyria | species | Non commestibile | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 51 | Amanita excelsa s.l. (incl. A. spissa, A. franchetii) | speciesGroup | Non commestibile | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | DOC | OK | no |  |
| 52 | Amanita strobiliformis | species | Sconsigliato | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 53 | Saproamanita vittadinii | species | Sconsigliato | DOC | DA_VER | DOC | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 54 | Amanita rubescens | species | Commestibilità condizionata | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì | P1 · Nessun sosia: manca il confronto obbligato con Amanita pantherina (presente solo nel +1 di A. pantherina). |
| 55 | Amanita sez. Vaginatae | section | Commestibilità condizionata | DOC | DOC | MANCANTE | DOC | DOC* | DA_VER | — | DOC | OK | no |  |
| 56 | Calocybe gambosa | species | Commestibilità libera | DOC | DA_VER | DOC | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 57 | Clitocybe nebularis | species | Sconsigliato | DOC | DOC | DOC | DOC | DOC | DOC | — | MANCANTE | OK | sì |  |
| 58 | Infundibulicybe geotropa | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 59 | Clitocybe gibba s.l. | speciesGroup | Commestibilità condizionata | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 60 | Clitopilus prunulus s.l. | speciesGroup | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | no |  |
| 61 | Rhodocollybia maculata | species | Non commestibile | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 62 | Gymnopus fusipes | species | Sconsigliato | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 63 | Marasmius oreades | species | Commestibilità libera | DOC | DA_VER | DOC | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 64 | Coprinus atramentarius s.l. | speciesGroup | Non commestibile | DA_VER | DA_VER | MANCANTE | DOC | DOC* | DA_VER | DOC | MANCANTE | OK | no | P2 · Nome di scheda storico; il nome corrente Coprinopsis atramentaria compare solo come acceptedName. |
| 65 | Coprinus comatus | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 66 | Cortinarius praestans | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 67 | Cortinarius cumatilis | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | sì |  |
| 68 | Phlegmacium variiforme | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | MANCANTE | no |  |
| 69 | Cortinarius caperatus | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 70 | Entoloma clypeatum s.l. | speciesGroup | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | no |  |
| 71 | Entoloma saundersii | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | MANCANTE | no |  |
| 72 | Flammulina velutipes s.l. | speciesGroup | Commestibilità libera | DOC | DOC | DOC | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 73 | Hygrocybe punicea | species | Commestibilità libera | DOC | DOC | DOC | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 74 | Hygrophorus marzuolus | species | Commestibilità libera | DOC | DOC | DOC | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 75 | Hygrophorus russula | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 76 | Hygrophorus penarioides | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 77 | Hypholoma lateritium | species | Non commestibile | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 78 | Lentinula edodes | species | Commestibilità condizionata | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 79 | Lepiota cristata | species | Non commestibile | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 80 | Echinoderma asperum s.l. | speciesGroup | Non commestibile | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 81 | Leucoagaricus leucothites s.l. | speciesGroup | Sconsigliato | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 82 | Chlorophyllum rhacodes s.l. | speciesGroup | Sconsigliato | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 83 | Macrolepiota procera s.l. | speciesGroup | Commestibilità libera | DOC | DOC | DOC | DOC | DOC* | DA_VER | — | DOC | OK | no |  |
| 84 | Lepista nuda s.l. | speciesGroup | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 85 | Lepista flaccida s.l. | speciesGroup | Commestibilità condizionata | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 86 | Leucopaxillus giganteus s.l. | speciesGroup | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 87 | Leucopaxillus gentianeus | species | Non commestibile | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 88 | Lyophyllum decastes s.l. | speciesGroup | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | DOC | OK | no |  |
| 89 | Lyophyllum specie annerenti | speciesGroup | Commestibilità variabile: consulta le singole specie | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 90 | Leucocybe connata | species | Sconsigliato | DOC | DA_VER | DOC | DOC | DOC | DA_VER | — | DOC | OK | no |  |
| 91 | Kuehneromyces mutabilis | species | Commestibilità libera | DOC | DA_VER | DOC | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 92 | Pleurotus eryngii s.l. | speciesGroup | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 93 | Pleurotus ostreatus | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | no | P2 · Foto di ceppo coltivato (PH11): morfologia non rappresentativa degli esemplari spontanei. |
| 94 | Pleurotus cornucopiae / Pleurotus citrinopileatus | species | Commestibilità variabile: consulta le singole specie | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no | P2 · Tutte e tre le foto ritraggono P. citrinopileatus, nessuna P. cornucopiae. |
| 95 | Stropharia rugosoannulata | species | Commestibilità condizionata | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 96 | Tricholoma equestre | species | Sconsigliato | DOC | DA_VER | MANCANTE | DOC | DOC | CONFL | DOC | DOC | OK | sì | P0 · Categoria “Sconsigliato” incoerente con sindrome rabdomiolitica potenzialmente mortale e divieto italiano citato nella stessa scheda. |
| 97 | Tricholoma portentosum | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 98 | Tricholoma terreum | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 99 | Tricholoma saponaceum s.l. | speciesGroup | Non commestibile | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | DOC | OK | no |  |
| 100 | Tricholoma columbetta | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 101 | Tricholoma album s.l. (incl. T. stiparophyllum, T. lascivum e altri) | speciesGroup | Non commestibile | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | DOC | OK | no |  |
| 102 | Tricholoma gruppo T. terreum (T. scalpturatum, T. orirubens, T. squarrulosum e altre) | speciesGroup | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 103 | Tricholoma gruppo Virgati (T. virgatum, T. sciodes, T. bresadolanum) | speciesGroup | Non commestibile | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 104 | Tricholoma sejunctum | species | Sconsigliato | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 105 | Tricholoma sulphureum | species | Non commestibile | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 106 | Tricholoma sez. Genuina (= gruppo Albobrunnei) | section | Commestibilità variabile: consulta le singole specie | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | no |  |
| 107 | Tricholoma acerbum s.l. | speciesGroup | Commestibilità condizionata | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 108 | Volvopluteus gloiocephalus | species | Sconsigliato | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 109 | Volvariella volvacea | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 110 | Lactarius sez. Deliciosi | section | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | DA_VER | OK | no | P2 · Foto di “Lactarius deliciosus group (North America)”: taxa nordamericani diversi da quelli italiani. |
| 111 | Lactarius porniniae | species | Commestibilità libera | DA_VER | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | no | P1 · Epiteto da verificare: le foto e la letteratura usano “Lactarius porninsis”; possibile errore ortografico del nome della scheda. |
| 112 | Lactarius volemus s.l. | speciesGroup | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 113 | Lactarius tesquorum | species | Commestibilità condizionata | DOC | DA_VER | DOC | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 114 | Russula Compactae Nigricantinae | subsection | Non commestibile | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 115 | Russula Compactae Lactarioides (= gruppo R. delica) | speciesGroup | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 116 | Boletus edulis s.l. | speciesGroup | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | DOC | OK | no |  |
| 117 | Boletus sez. Luridi | section | Commestibilità variabile: consulta le singole specie | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 118 | Boletus (Neoboletus) erythropus s.l. | speciesGroup | Commestibilità condizionata | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 119 | Suillellus luridus | species | Commestibilità condizionata | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 120 | Boletus queletii e specie vicine/intermedie | speciesGroup | Commestibilità condizionata | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 121 | Caloboletus calopus | species | Sconsigliato | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 122 | Gyroporus cyanescens | species | Commestibilità condizionata | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 123 | Gyroporus castaneus s.l. | speciesGroup | Commestibilità condizionata | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 124 | Hygrophoropsis aurantiaca | species | Sconsigliato | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 125 | Imleria badia | species | Commestibilità condizionata | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 126 | Suillus luteus | species | Commestibilità libera | DOC | DA_VER | DOC | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 127 | Suillus granulatus | species | Commestibilità libera | DOC | DA_VER | DOC | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 128 | Tylopilus felleus | species | Non commestibile | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 129 | Cantharellus cibarius complex | speciesGroup | Commestibilità libera | DOC | DOC | DOC | DOC | DOC* | DA_VER | — | DOC | OK | no |  |
| 130 | Craterellus lutescens | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 131 | Craterellus tubaeformis | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 132 | Craterellus cornucopioides | species | Commestibilità libera | DOC | DOC | DOC | DOC | DOC | DOC | — | MANCANTE | OK | sì |  |
| 133 | Gomphus clavatus | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 134 | Hydnum spp. / H. repandum s.l. (incl. gruppo H. rufescens) | speciesGroup | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 135 | Hericium spp. | genus | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 136 | Sarcodon imbricatus s.l. (incl. S. squamosus) | speciesGroup | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 137 | Laetiporus sulphureus s.l. | speciesGroup | Commestibilità condizionata | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 138 | Albatrellopsis confluens | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 139 | Albatrellus ovinus s.l. (incl. A. subrubescens, A. citrinus) | speciesGroup | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |
| 140 | Scutiger pes-caprae | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | MANCANTE | DA_VER | — | MANCANTE | OK | sì | P2 · Sporata mancante. |
| 141 | Fistulina hepatica | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 142 | Grifola frondosa | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 143 | Polyporus umbellatus | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 144 | Meripilus giganteus | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 145 | Cerioporus squamosus | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | DOC | OK | sì |  |
| 146 | Ramaria botrytis s.l. | speciesGroup | Commestibilità libera | DOC | DOC | DOC | DOC | DOC | DA_VER | — | MANCANTE | PARZ | no |  |
| 147 | Auricularia auricula-judae | species | Commestibilità libera | DOC | DA_VER | MANCANTE | DOC | DOC | DA_VER | — | MANCANTE | OK | sì |  |
| 148 | Sarcosphaera coronaria s.l. | speciesGroup | Sconsigliato | DOC | DA_VER | MANCANTE | DOC | DOC* | DA_VER | — | MANCANTE | OK | no |  |

## Schede di genere e gruppo (`groups.json`)

66 schede `teaching-group`, senza commestibilità propria (l'interfaccia mostra “Consulta le singole specie”, scelta corretta). Lacune: `characters` compilati solo in 11 su 66; `differentiatingCharacter` in 2 su 66. **22 schede di genere o gruppo non hanno alcuna scheda di specie collegata**: *Armillaria + Desarmillaria*, *Hebeloma*, *Inocybe* s.l., *Laccaria*, *Limacella*, *Melanoleuca*, *Pluteus*, *Psathyrella* s.l., *Psilocybe* s.l., *Butyriboletus*, *Chroogomphus*, *Gomphidius*, *Hemileccinum*, *Leccinellum*, *Leccinum*, *Paxillus*, *Xerocomus* s.l., *Pisolithus*, *Scleroderma*, *Helvella*, *Morchella*, *Verpa*. Per un esame da micologo sono prioritari *Armillaria*, *Inocybe*, *Paxillus*, *Morchella* e *Leccinum*.

## Metodo e limiti

Gli stati sono assegnati da uno script che legge `sources[].fields`, i valori e le note; le anomalie nominate vengono dalla lettura manuale delle schede tossiche e mortali e dal confronto interno dei dati. Non sono state consultate fonti esterne (il container non accede ai siti delle fonti). Nessuna fonte è stata inventata: le proposte nominano solo fonti già citate nel repository o indicano il tipo di fonte da reperire.
