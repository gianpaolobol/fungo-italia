# Protocollo di attestazione scientifica indipendente

## Stato
**NON ATTESTATO.** La firma di un micologo qualificato non può essere sostituita da un audit software, da una ricerca bibliografica o da una dichiarazione automatica.

## Oggetto della revisione
Dataset versionato del catalogo (148 unità), profili di commestibilità dalla Guida ragionata (2021), fonti di odore e sporata, fotografie diagnostiche, sindromi tossicologiche, corrispondenza tassonomica e sinonimi.

## Fascicolo per il revisore
1. Commit SHA e checksum SHA-256 dell'esportazione esaminata.
2. Inventario delle lacune da scripts/release-readiness.mjs --json.
3. Elenco sindromi e fonti da src/data/toxicology-syndromes.json.
4. Per ciascuna scheda: nome scientifico, rango, 3+1, odore, sporata, commestibilità, sindrome, immagini, fonte, pagina e licenza.
5. Registro delle correzioni e delle divergenze tassonomiche.

## Esito firmabile solo dal revisore
- Identità e qualifica del revisore: [da acquisire]
- Organizzazione/abilitazione professionale: [da verificare]
- Versione/commit esaminato: [SHA]
- Ambito di revisione: [schede e campi specifici]
- Metodo, fonti consultate, rilievi: [documentare]
- Esito: APPROVATO / APPROVATO CON LIMITAZIONI / NON APPROVATO
- Data, firma verificabile, eventuali conflitti d'interesse: [da acquisire]

## Gate
Nessun campo independentReviewStatus va impostato a reviewed/attested prima della firma e della riconciliazione delle correzioni. Un'approvazione parziale non autorizza a certificare le altre schede. Le attestazioni GitHub riguardano solo provenienza del software, non validità micologica.
