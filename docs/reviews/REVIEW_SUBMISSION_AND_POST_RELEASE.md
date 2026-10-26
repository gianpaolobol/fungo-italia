# Invio, acquisizione e gestione delle revisioni scientifiche

## Invio del fascicolo

Condividere il [fascicolo](INDEPENDENT_MICOLOGIST_REVIEW_DOSSIER_20261026.md) e un link al **commit esatto** del catalogo con ciascun revisore. Il revisore apre una [richiesta di revisione](https://github.com/gianpaolobol/fungo-italia/issues/new?template=revisione-micologica.yml) e indica le schede esaminate, fonte S1/S2, bibliografia, immagini, giudizio e modifiche. In alternativa invia un documento firmato attraverso un canale privato concordato; conservare l'originale protetto e registrare in GitHub soltanto riferimento, hash SHA-256, decisioni e prove non riservate.

## Acquisizione controllata

1. Verificare competenza e identità del revisore tramite un riscontro indipendente; un'autodichiarazione in issue non basta.
2. Confrontare SHA e ID con la versione effettivamente consultata. Per ogni taxon compilare una decisione separata.
3. Se richiesta integrazione o rifiutata, aprire un issue correttivo associato all'ID; nessun PASS.
4. Correggere i dati **sorgente**, rigenerare catalogo, test/esami e documentazione e far riesaminare i contenuti modificati.
5. Archiviare originale e hash dell'attestazione, data, identità verificata, decisione e SHA. Non esporre contatti personali non pubblici, firme o materiali riservati.
6. Solo un processo di acquisizione autenticato e verificato può applicare stati `reviewed`/`attested`; il template Issue NON li scrive nel catalogo.

## Dopo TestFlight/App Store

Ogni modifica scientifica successiva alla validazione production genera una nuova versione sorgente e una nuova matrice di impatto. Le attestazioni preesistenti restano immutabili e legate allo SHA esaminato; una correzione materiale di caratteri, diagnosi, tossicità, commestibilità, fonti o fotografie invalida la corrispondente attestazione **per il nuovo contenuto**, finché il revisore non conferma nuovamente. Le revisioni non modificate possono essere riutilizzate soltanto con confronto dei dati e tracciabilità delle evidenze.

Per correzioni urgenti su sicurezza o tossicità: aprire incidente prioritario, valutare immediatamente disattivazione dell'affermazione rischiosa nel prodotto e procedere a distribuzione correttiva secondo la policy di sicurezza, senza presentare una modifica non attestata come certificata.

## Gate obbligatori

S1 determina il perimetro. S2 prevale per la commestibilità. Nessuna issue aperta, approvazione del proprietario, fonte bibliografica o Apple VALID vale come attestazione professionale. La release resta subordinata a verifiche scientifiche, tossicologiche, immagini/diritti, integrità del catalogo, esami, StoreKit iPhone/iPad e prova effettiva TestFlight sullo stesso SHA.

**Stato iniziale:** nessuna attestazione professionale acquisita; release non certificata.
