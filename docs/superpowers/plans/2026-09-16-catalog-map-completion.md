# Completamento beta catalogo e mappa nazionale

## Obiettivo

Consegnare una beta verificabile che ripristini la mappa, copra l'Italia con aree aggregate, mostri i dati meteo usati dal motore e sostituisca il catalogo dimostrativo con un inventario tracciabile rispetto alle due fonti approvate.

## Vincoli non negoziabili

- Nessuna precisione tassonomica inferita: genere, sezione e gruppo restano tali quando la fonte opera a quel rango.
- Commestibilità e tossicità vengono pubblicate solo con riferimento puntuale alla Guida ragionata della Regione Piemonte.
- Coordinate e attività degli utenti restano aggregate, ritardate e anonime.
- Il riconoscimento fotografico è indicativo e non autorizza il consumo.
- L'interfaccia deve funzionare almeno da 320 px di larghezza e non deve richiedere sovrapposizioni di layer per la lettura di base.

## Fasi di implementazione

### 1. Inventario delle fonti

- Estrarre il documento degli obiettivi tassonomici mantenendo pagine e rango richiesto.
- Reperire la versione completa e ufficiale della Guida ragionata.
- Generare due inventari sorgente e una matrice di riconciliazione.
- Segnalare esplicitamente voci irrisolte, sinonimi e casi a livello di gruppo/sezione.

### 2. Catalogo dati

- Aggiungere record versionati con identificatore stabile, nomi scientifici e volgari/regionali, rango, stato editoriale ed evidenze.
- Separare dati normativi/editoriali da habitat, fenologia e indicatori ecologici.
- Rendere i record modificabili tramite proposte utente e revisione micologica rafforzata.
- Aggiungere test di completezza e integrità referenziale.

### 3. Mappa

- Correggere il worker MapLibre e impedire regressioni con un test sul pacchetto di produzione.
- Generare una copertura nazionale di celle aggregate, non riconducibili a punti o percorsi personali.
- Visualizzare sempre la base OpenStreetMap e un solo layer sintetico “Vai ora”.
- Rendere leggibili selezione e dettaglio su iPhone 13 mini e schermi equivalenti.

### 4. Meteo e previsione

- Distinguere osservazioni passate e previsione futura.
- Acquisire temperatura, umidità e precipitazioni con timestamp e fonte visibili.
- Usare richieste batch e cache per non sovraccaricare il servizio gratuito.
- Persistire snapshot e motivazioni del punteggio; degradare in modo esplicito quando il meteo non è disponibile.

### 5. Verifica e rilascio

- Eseguire test unitari, test API, build di produzione e controllo dell'asset worker.
- Verificare layout a 320, 375, 768 e desktop.
- Controllare API e mappa nell'ambiente pubblicato.
- Unire il ramo, pubblicare il sito e sincronizzare GitHub soltanto dopo le verifiche.

## Criteri di accettazione

- La mappa è visibile e il worker non produce 404.
- La beta non espone più soltanto otto aree dimostrative.
- Ogni indicazione “Vai ora” mostra dati meteo, aggiornamento e motivazione.
- Ogni categoria di commestibilità pubblicata ha una prova puntuale nella fonte approvata.
- Il rapporto di copertura distingue chiaramente completo, irrisolto e non documentato.
- Nessun contenuto esce orizzontalmente da uno schermo largo 320 px.
