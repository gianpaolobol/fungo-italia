# Catalogo editoriale, previsione territoriale e mappa — Addendum di progetto

**Stato:** approvato dall'utente il 16 settembre 2026  
**Specifica di base:** `docs/superpowers/specs/2026-09-16-catalogo-micologico-nazionale-design.md`  
**Prodotto:** Fungo Italia — Beta

## 1. Obiettivo

La beta deve rendere il catalogo scientifico modificabile senza perdere la provenienza dei dati e collegarlo a una mappa nazionale che mostri, per aree vaste, le condizioni favorevoli e i taxa compatibili. La previsione indica probabilità ecologica e fenologica; non certifica la presenza, l'identificazione o la commestibilità di un esemplare.

## 2. Confini della beta

La beta comprende:

- catalogo revisionato e pubblicato per versioni;
- proposte di nuovi taxa e modifiche da parte dei raccoglitori;
- inserimento diretto e revisione da parte dei micologi entro competenze assegnate;
- revisione rafforzata per tassonomia, commestibilità, tossicità e confusioni ad alto rischio;
- osservazioni fotografiche con coordinate private e pubblicazione aggregata;
- celle territoriali vaste, overlay cartografico e graduatoria dei taxa compatibili;
- acquisizione normalizzata di meteo corrente e previsto;
- punteggio spiegabile, livello di confidenza e motivazioni;
- interfaccia responsive verificata anche a 375 × 812 CSS pixel.

La beta non comprende il riconoscimento fotografico diagnostico, l'espansione automatica dei generi in specie, né un modello di machine learning addestrato su dati insufficienti.

## 3. Ruoli e competenze

I ruoli sono `collector`, `mycologist`, `scientificCurator` e `systemAdmin`.

- Il raccoglitore può creare una proposta e allegare fonti, ma non pubblicare.
- Il micologo può creare, modificare, approvare e pubblicare dati non critici soltanto nelle regioni e nei gruppi tassonomici assegnati.
- Il curatore scientifico può riconciliare nomenclatura e approvare campi critici.
- L'amministratore assegna ruoli e ambiti; non acquisisce automaticamente autorità scientifica.

Le competenze sono l'intersezione tra regioni assegnate e gruppi tassonomici assegnati. Una competenza nazionale o trasversale deve essere esplicita.

## 4. Revisioni e pubblicazione

Il record pubblicato non viene sovrascritto. Ogni intervento genera un `CatalogChangeSet` con una o più `FieldChange`, autore, motivazione, fonti, stato e decisioni di revisione.

Stati ammessi:

`draft`, `submitted`, `inReview`, `changesRequested`, `approved`, `rejected`, `published`, `superseded`.

Una modifica ordinaria richiede una decisione positiva di un micologo competente. Una modifica critica richiede anche una decisione positiva di un curatore scientifico diverso dall'autore, salvo importazione iniziale formalmente approvata e registrata.

Campi critici:

- nome scientifico accettato, rango e relazioni tassonomiche;
- categoria di commestibilità e relativo ambito;
- trattamenti alimentari;
- tossicità e sindromi;
- confusioni con rischio `high` o `deadly`.

La pubblicazione crea una nuova `CatalogRelease`, mantiene consultabile la versione precedente e accoda il ricalcolo delle celle interessate.

## 5. Modello territoriale

La visualizzazione pubblica usa celle H3 a risoluzione 6, con area media di circa 36 km². Coordinate, percorsi e orari individuali non vengono esposti. I segnali degli utenti sono pubblicabili soltanto dopo ritardo, soglia minima di aggregazione e trasformazione in fascia.

Per ogni cella sono versionati:

- geometria pubblica;
- regione, macroarea e sistemi montuosi;
- statistiche altimetriche;
- composizione di habitat e copertura arborea;
- essenze indicatrici con provenienza;
- snapshot meteorologici normalizzati;
- conteggi aggregati di osservazioni validate;
- pressione aggregata dei raccoglitori;
- punteggi per taxon e versione del modello.

OpenStreetMap è la base cartografica. Il renderer è MapLibre e la sorgente cartografica è configurabile, così da non vincolare l'app ai server gratuiti OSM.

## 6. Motore spiegabile

Il motore calcola separatamente:

- `ecologicalSuitability`: habitat, substrato, essenze, quota e geografia;
- `phenologyFit`: periodo, macroarea e quota;
- `weatherFit`: temperatura, precipitazioni cumulate, umidità disponibile o proxy ed evapotraspirazione;
- `evidenceScore`: osservazioni validate, ritardate e aggregate;
- `pressurePenalty`: fascia di frequentazione recente;
- `confidence`: completezza, qualità e freschezza delle fonti.

Il risultato pubblicato contiene punteggio, classe `goNow`, `possible` o `wait`, confidenza, data di calcolo e motivazioni strutturate. Se il catalogo sostiene soltanto genere, sezione o gruppo, la previsione conserva quel livello.

La versione iniziale usa regole deterministiche verificabili. Pesi e soglie sono versionati; ogni modifica produce un nuovo `ForecastModelVersion`.

## 7. Meteo

Un adattatore `WeatherProvider` isola il fornitore esterno. La beta può utilizzare Open-Meteo, ma dati e API interne adottano un formato indipendente dal provider.

Lo snapshot normalizzato comprende almeno:

- temperatura corrente, minima e massima;
- precipitazioni cumulate nelle finestre disponibili;
- probabilità di precipitazione;
- umidità relativa quando disponibile;
- evapotraspirazione di riferimento;
- tempo di emissione e scadenza;
- coordinate e quota della cella meteorologica effettivamente usata.

Un errore del provider non azzera la previsione: il sistema conserva l'ultimo snapshot valido, ne segnala l'età e riduce la confidenza.

## 8. Esperienza utente

Desktop: elenco e mappa affiancati.  
Mobile: una sola superficie primaria alla volta, con comando `Mappa` / `Elenco`; il dettaglio si apre come pannello inferiore scorrevole e non come scheda assoluta sopra la mappa.

Vincoli responsive:

- nessuno scorrimento orizzontale tra 320 e 1.920 CSS pixel;
- verifica obbligatoria a 375 × 812;
- altezza mappa basata su `100dvh`, con fallback;
- rispetto di `env(safe-area-inset-*)`;
- testo principale almeno 16 px e controlli abituali almeno 14 px;
- target tattili almeno 44 × 44 px;
- stringhe lunghe, nomi scientifici e nomi regionali devono andare a capo;
- pannelli e griglie usano `min-width: 0` e colonne comprimibili;
- l'apertura della tastiera non deve nascondere l'input attivo.

## 9. Sicurezza e trasparenza

- Le coordinate originali sono accessibili soltanto ai revisori autorizzati.
- I log di revisione non sono modificabili dagli autori.
- Le categorie alimentari derivano esclusivamente da S2; in assenza di copertura viene mostrato `NOT_ASSESSED`.
- La mappa mostra sempre data, confidenza e motivazioni.
- Nessun punteggio autorizza raccolta, consumo o accesso a proprietà e aree protette.

## 10. Criteri di accettazione della prima beta

1. Un raccoglitore autenticato può inviare una proposta di modifica catalogo.
2. Un micologo competente può approvarla o richiedere modifiche.
3. Una modifica critica non è pubblicabile senza seconda approvazione curatoriale.
4. La cronologia di una scheda resta ricostruibile.
5. La mappa MapLibre mostra aree vaste selezionabili e nessuna coordinata privata.
6. Il dettaglio elenca taxa compatibili mantenendo il rango sostenuto dalle fonti.
7. Il punteggio espone componenti, confidenza, data e motivazioni.
8. Un errore meteo produce stato degradato leggibile, non dati inventati.
9. A 375 × 812 non esistono overflow orizzontali, testi tagliati o controlli fuori schermo.
10. Test, lint, build e controllo visuale mobile devono passare prima della pubblicazione.
