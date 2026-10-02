# Sezione Schede — specifica funzionale e scientifica

Stato: design approvato per implementazione
Data: 2026-09-30
Vincolo: la sezione Schede NON modifica struttura, dati o comportamento dell’Atlante esistente. Consuma e rappresenta i dati dell’Atlante come superficie sintetica coordinata.

## 1. Struttura della pagina

La navigazione principale aggiunge una voce **Schede** accanto ad Atlante.

La pagina Schede è una libreria visuale derivata dal catalogo dell’Atlante e presenta:
- barra di ricerca per nome comune, nome scientifico, sinonimi;
- filtri coerenti con Atlante: rango tassonomico, commestibilità, genere/gruppo;
- ordinamento tassonomico coerente con `atlasTaxa`;
- griglia di anteprime sintetiche;
- apertura di una scheda completa sintetica;
- azione **Apri nell’Atlante** che porta alla voce/gruppo di origine.

La vista dettaglio mantiene l’impostazione grafica approvata dal riferimento "Fungo del pane — Albatrellus ovinus":
1. intestazione con nome comune e scientifico;
2. classificazione tassonomica compatta;
3. immagine naturalistica principale;
4. due dettagli ingranditi diagnostici;
5. fascia inferiore a cinque moduli: Habitat, Stagione, Commestibilità, Sporata, Caratteri chiave;
6. collegamento esplicito alla scheda completa Atlante.

Su mobile i cinque moduli diventano una griglia/scorrimento leggibile senza ridurre il testo sotto la soglia di leggibilità.

## 2. Campi fissi

Ogni Scheda sintetica è una proiezione di un record Atlante e non un secondo catalogo indipendente.

Campi obbligatori:
- `atlasId`: identificatore della voce Atlante;
- `rank`: species, speciesGroup, section, subsection, genus, subgenus, operationalGroup, ecc.;
- `commonName`;
- `scientificName`;
- `acceptedName` quando disponibile;
- classificazione: kingdom, division, className, order, family;
- `parentScientificName`;
- `primaryImage`;
- `detailImages[0..2]`;
- `habitatSummary`;
- `seasonSummary`;
- `edibilityCategory`;
- `edibilityNote`;
- `diagnosticCharacters`: esattamente 3 caratteri principali;
- `differentiatingCharacter`: eventuale +1 differenziante;
- `sporePrint`: rappresentazione cromatica standardizzata;
- `atlasTarget`: destinazione Atlante;
- `representativeTaxon`: opzionale, per schede di gruppo/sezione/genere;
- `sourceStatus` / `reviewStatus`.

Per i ranghi superiori alla specie, i campi descrittivi devono riferirsi al gruppo come tale. Non si generalizzano caratteri di una singola specie a un intero gruppo. Quando l’immagine usa una specie rappresentativa, la didascalia deve dichiararlo esplicitamente.

## 3. Regole grafiche uniformi

Formato:
- fondo avorio chiaro;
- verde bosco come colore strutturale;
- serif editoriale per nome/titolo e sans leggibile per UI;
- bordi sottili e costanti;
- nessun effetto fotografico o layout diverso da scheda a scheda.

Immagine principale:
- resa naturalistica coerente, non icona astratta;
- uno o più esemplari per mostrare stadi utili;
- habitat presente ma contenuto: solo base ecologica significativa, senza scena forestale profonda;
- inquadratura che renda leggibili imenoforo, gambo, margine e portamento quando diagnostici;
- niente elementi decorativi che oscurino caratteri.

Dettagli diagnostici:
- massimo 2–3 crop/ingrandimenti;
- mostrano solo caratteri realmente diagnostici della voce;
- stessa posizione e diametro su tutte le schede.

Sporata:
- componente grafico fisso, non semplice nome del colore;
- forma visiva tipo impronta/rosone su fondo neutro;
- colore derivato da una palette scientifica controllata;
- accessibilità: il valore testuale resta disponibile come aria-label/tooltip, ma la superficie principale mostra il colore;
- per taxa/gruppi con sporata variabile: visualizzazione a intervallo/palette multipla, mai un unico colore falsamente preciso;
- valore `unknown` o `not-applicable` quando la fonte non consente una rappresentazione corretta.

Palette logica minima:
`white | cream | pale-yellow | ochre | pink | salmon | rust | brown | purple-brown | black | variable | unknown`.
La UI mapperà questi token a valori colore versionati, evitando colori generati liberamente per ogni scheda.

Commestibilità:
- iconografia coerente ma subordinata al testo scientifico;
- categorie identiche all’Atlante;
- nessuna trasformazione di "commestibile dopo trattamento" in "buon commestibile";
- per gruppi con stati diversi: "Stati diversi nel gruppo".

## 4. Collegamento con Atlante

L’Atlante resta la fonte primaria.

Regola di risoluzione:
1. se esiste una voce specifica, Scheda -> stessa voce Atlante;
2. se il simbolo/specie non ha voce autonoma, Scheda -> gruppo/sezione/genere scientificamente corretto;
3. la scheda sintetica mostra in tal caso "Specie rappresentativa: X";
4. nessuna Scheda deve diventare un vicolo cieco;
5. nessun dato della Scheda può contraddire la voce Atlante;
6. modifiche di nomenclatura, rango o commestibilità devono propagarsi dall’Atlante, non essere mantenute a mano in due punti.

Dati condivisi:
- identità tassonomica, nomenclatura, rango, classificazione, commestibilità, fonti e stato revisione provengono dal catalogo;
- la sezione Schede aggiunge solo campi di presentazione sintetica: immagini, habitat breve, stagione breve, rappresentazione sporata, 3+1 e dettagli visuali.

## 5. Ordine di implementazione coerente con Atlante

### Lotto S0 — infrastruttura senza contenuti
- tipo `SummaryCard`;
- resolver Atlante -> Scheda;
- componente Sporata;
- componenti layout;
- test di non regressione dell’Atlante;
- nessuna modifica ai record Atlante.

### Lotto S1 — taxa commestibili già rappresentati e approvati
- popolamento iniziale con i maggiori commestibili già selezionati nelle serie visuali;
- collegamento rigoroso a voci Atlante o relativi gruppi;
- revisione scientifica di immagini e 3+1.

### Lotto S2 — tutti i taxa Minimo
- generazione delle Schede per tutte le unità tassonomiche minime;
- priorità ai taxa a riconoscimento approfondito e ai tossici importanti per confronto;
- nessuna immagine "inventata" per gruppi non rappresentabili da una singola morfologia.

### Lotto S3 — generi, sezioni, sottosezioni e gruppi
- schede di gruppo con specie rappresentative dichiarate;
- sporata variabile resa come gamma;
- caratteri del gruppo verificati come tali.

### Lotto S4 — copertura completa dell’Atlante
- una Scheda sintetica per ogni voce pubblicabile dell’Atlante;
- stato `ready | preparing | source-gap`;
- le voci senza dati sufficienti restano visibili ma marcate "in preparazione", senza riempimenti inferiti.

### Lotto S5 — qualità e pubblicazione
- audit duplicati;
- audit nomenclatura;
- audit commestibilità;
- audit sporata;
- audit immagine/caratteri;
- visual regression desktop/mobile;
- controllo link Scheda <-> Atlante.

## Criteri di accettazione

- Atlante non modificato semanticamente dalla feature.
- Ogni Scheda ha un `atlasTarget` valido.
- Ogni Scheda mostra rango e classificazione.
- Ogni Scheda mostra una sporata grafica o uno stato esplicito di variabilità/assenza dati.
- Ogni Scheda mostra 3 caratteri principali e, quando supportato, +1 differenziante.
- Immagini coerenti con i caratteri della voce, con habitat minimo uniforme.
- Nessuna duplicazione tassonomica introdotta dalla sezione.
- Nessuna classificazione alimentare più permissiva della fonte Atlante.
- Per gruppi/sezioni la specie rappresentativa è sempre dichiarata.
- Le modifiche future al catalogo possono propagarsi alle Schede senza duplicare manualmente dati scientifici.
