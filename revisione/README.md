# Revisione micologica condivisa di Fungo Italia

[Scarica la matrice Excel](https://github.com/gianpaolobol/fungo-italia/raw/refs/heads/main/revisione/matrice.xlsx)

[Apri il file su GitHub](https://github.com/gianpaolobol/fungo-italia/blob/main/revisione/matrice.xlsx) · [Cronologia dell’Excel](https://github.com/gianpaolobol/fungo-italia/commits/main/revisione/matrice.xlsx) · [Dati confrontabili](matrice.json) · [Cronologia dei dati](https://github.com/gianpaolobol/fungo-italia/commits/main/revisione/matrice.json)

## Documento di partenza

Edizione `FI-REV-20261009-v1`, estratta dalla beta pubblicata al commit `693b5dbe5171ec0e3a171102b8586bba096a37aa`, build `2cf64e37fcd5274566db`.

La matrice comprende tutte le 214 schede, nell’ordine della vista “Tutte” dell’atlante: 148 voci del catalogo minimo, poi 66 generi e gruppi didattici. Non tutte le colonne rappresentano una singola specie. Le 41 righe includono dati, campi da integrare e metadati di revisione.

I dati attuali sono riprodotti per essere verificati. Nessuna approvazione micologica indipendente è attribuita automaticamente. I campi separati per preparazione non sono stati dedotti dal testo: il testo completo delle precauzioni resta disponibile nella matrice. La guida ragionata alla commestibilità 2021 è il riferimento alimentare attuale.

## Come revisionare

1. Scaricare `matrice.xlsx` dalla versione corrente su `main`. Annotare il commit di partenza.
2. Modificare il foglio **Matrice** e conservare **Originale** invariato. Non cambiare gli identificativi stabili delle schede o i codici campo.
3. Nel foglio **Revisioni**, aggiungere una riga per ogni campo controllato o corretto, indicando fonte e pagina, motivazione, esito, nome, qualifica, data e firma o riferimento al verbale firmato. Una revisione parziale deve specificare i campi approvati.
4. Inviare una pull request con l’Excel aggiornato e gli eventuali verbali destinati alla condivisione. Nel titolo indicare taxa e ambito, ad esempio “Revisione Amanita: sporata e odore”. Chi non ha accesso in scrittura può usare un fork oppure restituire il file al responsabile, che registrerà il contributo dichiarando chi lo ha inviato.
5. Aggiornare nello stesso contributo `matrice.json`, riportando gli stessi valori dell’Excel e il nuovo SHA-256 del file. Il file JSON è una rappresentazione testuale della matrice: consente di vedere le differenze campo per campo su GitHub. La conversione e il controllo di coerenza devono essere effettuati dal responsabile prima di integrare il contributo. Al momento non sono automatizzati.
6. Il responsabile confronta la proposta con la versione corrente, riconcilia eventuali contributi paralleli e integra la pull request approvata. Una proposta non approvata resta una proposta.

GitHub non è un editor collaborativo di celle Excel. Le modifiche al file locale compaiono nella cronologia soltanto dopo l’invio e il commit. Conserva le versioni dell’Excel, ma le sue differenze binarie non spiegano quali celle siano cambiate: per questo si affianca il JSON.

## Autori, approvazioni e firme

Commit e pull request identificano l’account GitHub che ha inviato o registrato una modifica. Se il responsabile carica il file per conto di un micologo, l’autore del commit può essere il responsabile: il nome del revisore va dichiarato nel registro e nella pull request.

L’account GitHub non certifica la qualifica professionale. Il nome digitato in Excel non costituisce una firma digitale verificata. Un verbale firmato deve identificare la versione della matrice, gli ID delle schede e i codici campo approvati. Non pubblicare dati personali estranei alla revisione.

Le informazioni di un genere o gruppo non devono essere estese automaticamente a tutte le specie. Un’approvazione della fonte non equivale all’approvazione di tutte le affermazioni ricavate dalla fonte.

## Ripristinare una revisione

La cronologia dei file permette di recuperare ogni versione registrata. Per annullare una revisione integrata, creare una nuova pull request che ripristini i valori precedenti, conservando la storia. Registrare il motivo e il riferimento alla revisione superata. Evitare riscritture della cronologia e force push.

Il branch `backup/main-pre-beta-publish-20261009` è escluso da questo flusso e non deve essere modificato.

## Collegamento all’atlante

**Stato attuale:** questi file sono pubblicati per la revisione e non alimentano automaticamente l’app. I dati dell’atlante continuano a essere costruiti dalla pipeline esistente.

Il flusso da implementare per la sincronizzazione è:

1. Controllo automatico Excel–JSON, identificativi e versione di partenza.
2. Confronto per `ID scheda + codice campo`, verifica delle approvazioni e gestione esplicita dei conflitti.
3. Conversione delle sole revisioni approvate nei dati del catalogo, conservando fonti e metadati del revisore.
4. Validazione, test e build collegata al commit della matrice.
5. Pubblicazione GitHub Pages e aggiornamento della PWA tramite il suo sistema di versionamento.

L’app deve usare l’ultima revisione approvata su `main`. Le proposte in lavorazione non devono diventare dati pubblicati. La nuova versione sarà disponibile dopo build e distribuzione, non a ogni battitura nel file Excel. La sincronizzazione deve preservare il funzionamento offline e permettere un ripristino riproducibile.

## File

- `matrice.xlsx`: documento revisionabile, con Matrice, Revisioni, Fonti, Istruzioni e Originale.
- `matrice.json`: snapshot testuale di tutti i valori della Matrice, con definizioni dei campi, ordine, ID stabili, commit di origine e hash dell’Excel. Le fonti dettagliate e il registro delle revisioni sono conservati nell’Excel.

La coerenza di Excel e JSON è stata verificata per l’edizione iniziale. Le edizioni successive devono mantenere entrambi allineati.

## Integrazione ISPRA — 9 ottobre 2026

Edizione `FI-REV-20261009-v2-ISPRA`: 53 riscontri puntuali, 44 celle integrate in 13 schede; tutte le 214 schede conservate nello stesso ordine.

- `Riscontri` documenta affermazioni, pagine stampate/PDF, valori precedenti, decisioni e limiti.
- `Copertura ISPRA` censisce le 214 schede: le menzioni lessicali includono bibliografie, indici e didascalie e non costituiscono conferme scientifiche.
- `riscontri-ispra.json` registra i due PDF forniti, URL ufficiali, hash SHA-256, copertura e decisioni per campo. I PDF sono collegati dalle fonti, senza duplicare immagini nel repository.

La Guida ragionata alla commestibilità 2021 resta prioritaria per commestibilità, tossicità e preparazione. Nessuna categoria alimentare o sindrome è stata cambiata. Cinque campi di preparazione riprendono precauzioni della Guida già registrate nella versione precedente. Una sola fonte può integrare una lacuna con provenienza esplicita. I due volumi ISPRA appartengono alla stessa serie editoriale: ripetizioni e citazioni dello stesso riferimento non costituiscono fonti indipendenti. La concordanza non equivale a certezza o approvazione micologica.

Conflitto conservato: ISPRA 188/2019 p.169 (PDF179) descrive la sporata di Gyromitra esculenta bianca, mentre la fonte precedente la descrive crema/giallo-camoscio. Il valore precedente resta in Matrice con nota di conflitto. Nessuna estensione automatica della specie nominale a complessi, generi o gruppi.

Originale conserva integralmente la matrice V1. Nessuna firma o approvazione professionale è stata attribuita. Excel e JSON sono stati confrontati su tutti gli 8774 valori della Matrice; il collegamento automatico all’app resta da implementare.
