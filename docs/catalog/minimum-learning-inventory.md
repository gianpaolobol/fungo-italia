# Inventario didattico minimo — checkpoint Lotto 2

## Stato

L'inventario sorgente del livello **Minimo** e ora modellato separatamente dal catalogo nomenclaturale.

- Unita didattiche minime: **148**
- Intestazioni sorgente coinvolte: **47**
- Etichette sorgente duplicate: **0**
- Vecchio target progettuale di riferimenti correnti: **141** — conservato solo per tracciabilita, non come invariante
- Mapping nomenclaturale: **148/148**
- Stato mapping: **completo, senza record unresolved o conflict**
- Casi multi-taxon correnti: **3 definedSet**
- Pubblicabilita del mapping nomenclaturale: **abilitata dal gate automatico**

Il file sorgente eseguibile e `lib/minimum-learning-source.ts`. Le invarianti e il gate sono in `lib/learning-taxonomy.ts`.

## Regola di inclusione

Le 148 unita sono i target tassonomici specifici richiesti nel testo del livello Minimo: specie, concetti *sensu lato*, gruppi, sezioni, sottosezioni, sottogeneri e gli altri target esplicitamente richiesti a risoluzione inferiore alla semplice intestazione generale.

Le intestazioni per le quali il requisito minimo e soltanto la determinazione del genere non vengono duplicate come schede-specie. Alimentano il lotto dedicato alle schede di genere.

Non diventano unita autonome:
- esempi citati solo per spiegare un rischio o una proprieta;
- frammenti di prosa catturati dal vecchio parser;
- nomi presenti soltanto come chiarimento non richiesto come target di determinazione;
- sinonimi o combinazioni precedenti quando servono solo a documentare la stessa unita didattica.

## Rango didattico

Il rango richiesto dalla fonte e vincolante. In particolare:
- `s.l.` non viene pubblicato come specie stretta;
- `sez.` resta `section`;
- `sottogenere` resta `subgenus`;
- i gruppi collettivi restano `speciesGroup` o altro rango collettivo appropriato.

La fonte del corso specifica che il livello minimo puo richiedere specie singole o collettive, sezioni e gruppi: il modello dati deve quindi poter rappresentare tutte queste risoluzioni senza forzare una determinazione a specie.

## Separazione fra inventario didattico e nomenclatura corrente

Le **148 unita didattiche** sono il contratto sorgente e non possono essere eliminate per far coincidere il catalogo con un conteggio nomenclaturale atteso.

Il precedente numero **141** era un obiettivo progettuale provvisorio non accompagnato da una riconciliazione riproducibile. La verifica completa ha mostrato che non puo essere usato come criterio di accettazione. Il sistema conserva quindi:
- tutte le 148 unita S1;
- un mapping esplicito per ciascuna unita;
- i nomi correnti verificati quando applicabili;
- i concetti S1 di gruppo/sezione quando non riducibili a una specie;
- gli insiemi definiti quando una singola formulazione S1 comprende oggi piu taxa distinti.

Tre casi sono modellati come `definedSet`, non come sinonimie:
- `Amanita verna (inclusa A. vidua)` -> `Amanita verna` + `Amanita vidua`;
- `Clitocybe dealbata (= C. rivulosa)` -> `Clitocybe dealbata` + `Collybia rivulosa`;
- `Pleurotus cornucopiae (incluso P. citrinopileatus)` -> `Pleurotus cornucopiae` + `Pleurotus citrinopileatus`.

In questo modo il testo didattico S1 resta intatto, mentre la tassonomia corrente non viene falsificata.

## Difetti del generatore storico

`scripts/generate-atlas-taxa.mjs` non e una fonte autorevole per il Lotto 2: il suo regex storico estrae binomi e li forza a `species`.

Sono gia documentati:
- frammenti spurii come `Armillaria come`, `Boletus sez`, `Ramaria colorate`;
- omissioni quando il genere moderno e fra parentesi, per esempio `Boletus (Rubroboletus) satanas`, `Boletus (Neoboletus) erythropus s.l.`, `Boletus (Suillellus) luridus`;
- perdita della risoluzione di sezioni, gruppi e concetti *sensu lato*.

L'elenco strutturato delle anomalie e in `data/minimum-learning-audit.json`.

## Gate di completamento

Per chiudere il Lotto 2 devono essere vere contemporaneamente tutte le condizioni seguenti:

1. 148/148 unita sorgente presenti.
2. Nessun artefatto di parsing.
3. Rango didattico conservato per ogni unita.
4. Mapping nomenclaturale 148/148 completato e verificato.
5. Nessun mapping `unresolved` o `conflict`; gli scostamenti S1/tassonomia corrente devono essere rappresentati come `definedSet` o concetti sorgente espliciti.
6. Nessuna unita in stato `reviewNeeded` quando si chiude la revisione scientifica del contenuto.
7. Test di inventario e nomenclatura verdi.
8. Verifica live delle asserzioni Index Fungorum verde.
9. Nessuna release pubblica generata da un catalogo che violi questi gate.

Solo dopo questo gate si passa in modo massivo alla compilazione delle schede Minimo.


## Chiusura Lotto 2B

La riconciliazione nomenclaturale del livello Minimo e considerata completa quando la CI conferma contemporaneamente:
- 148 mapping per 148 unita sorgente;
- 0 `unresolved`;
- 0 `conflict`;
- 3 `definedSet` documentati;
- verifica remota delle asserzioni di nome corrente;
- test, lint e build verdi.

Il numero dei nomi correnti unici viene riportato come metrica di copertura e non come obiettivo da forzare.
