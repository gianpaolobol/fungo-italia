# Audit della Guida ragionata — commestibilità e preparazione

Fonte primaria vincolante: **Sitta N., Davoli P., Floriani M., Suriano E. (2021)**, *Guida ragionata alla commestibilità dei funghi*, Regione Piemonte.
- [Guida ufficiale](https://www.regione.piemonte.it/web/sites/default/files/media/documenti/2021-09/guida_commestibilita_funghi_isbn_979-12-200-9297-5.pdf)
- [Tabella di raccordo ufficiale](https://www.regione.piemonte.it/web/sites/default/files/media/documenti/2022-08/guida_ragionata_-_tabella_di_raccordo_sintetica.pdf)

## Tassonomia normativa editoriale
I valori dell'app sono `free` (libera), `conditional` (condizionata), `discouraged` (sconsigliato), `no-food-value` (privo di valore alimentare), `inedible` (non commestibile), `toxic` (tossico), `deadly` (tossico mortale). Distinguere rigorosamente **privo di valore alimentare** da **non commestibile**. La guida usa la categoria più generale di velenoso/tossico; l'ulteriore distinzione di gravità mortale va documentata separatamente, non dedotta in automatico.

Un alimento a commestibilità **libera** richiede generalmente verifica del buono stato e, di base, cottura. La categoria **condizionata** richiede invece *specifici trattamenti obbligatori* riportati esattamente nella scheda e nelle domande d'esame. Non attribuire sicurezza alimentare senza determinazione esperta.

## Audit ripetibile
`node scripts/audit-guida-ragionata.mjs` genera `artifacts/guida-ragionata-audit.json`, non altera le schede e può segnalare:
- disallineamenti categorie e preparazioni fra banca fotografica degli esami e atlante;
- categorie non riconosciute o miste di gruppo che necessitano revisione per specie;
- condizioni di trattamento mancanti o contraddittorie;
- assenza di riferimento puntuale alla Guida nella singola scheda;
- difformità rispetto agli esempi espliciti della tabella ufficiale.

**Un confronto meccanico non è una certificazione scientifica.** La revisione di tutti i taxa richiede lettura della voce originale nella Guida, pagina/sezione, identificazione di sinonimi, decisione del micologo responsabile e documentazione dell'eventuale trattamento. Non usare il passaggio di questo script per segnare `independentReviewStatus: reviewed` o sbloccare `validate:release`.

## Protocollo di correzione
1. Per ciascun taxon, annotare voce/sinonimo e pagina esatta della Guida, categoria, istruzioni di preparazione, eventuali divieti e motivazione.
2. In caso di discordanza, prevale la Guida; se il taxon non è trattato o la corrispondenza è ambigua, mantenere lo stato **da verificare**, senza promuovere a categoria commestibile.
3. Aggiornare `src/data/catalog.json`, `src/data/groups.json` e le fonti, mantenendo categorie e precauzioni collegate alla medesima evidenza.
4. Rigenerare `src/data/exam-bank.json` attraverso la procedura dati del progetto; verificare anche gli esercizi teorici generati da `lib/study-curriculum-bank.mjs` e tutte le scelte di preparazione.
5. Testare categorie, preparazione, feedback e casi pericolosi; non correggere silenziosamente lo storico esami dell'utente, ma gestire revisioni compatibili.

**Stato di questo intervento:** inserita infrastruttura di audit su branch isolato; non ancora completata la revisione manuale di tutte le 148 schede + 66 gruppi.

## Nuova fonte autorizzata — materiali Palumbo e Suriano

Cartella Google Drive fornita dal titolare: https://drive.google.com/drive/folders/1sgmK0p5GJmgbvqpIzNi7RNJZetxy7UHQ

La cartella è accessibile e al 22/10/2026 presenta due sottocartelle:

- **Palumbo**: *funghi clitocyboidi Palumbo.pdf*; *generi lepiotoidi.pdf*.
- **Suriano**: *Trattazione delle principali specie di funghi epigei ammesse.pdf*; *SECONDA PARTE.pdf*; *Durabilità e stato di conservazione dei funghi freschi.pdf*; *Alcune integrazioni dell’allegato 1 degne di nota.pdf*.

**Uso consentito:** integrare caratteri diagnostici, denominazioni, sinonimi, habitat, confronti con specie simili, documentazione di studio e domande teoriche o fotografiche, attribuendo a ogni affermazione file, autore e pagina. Non riutilizzare fotografie nel prodotto distribuito senza verificare licenza o autorizzazione specifica: l'accesso Drive non equivale a licenza pubblica.

**Precedenza inderogabile:** la *Guida ragionata alla commestibilità dei funghi* resta il documento fondante per categoria di commestibilità e preparazioni obbligatorie. In caso di divergenze o informazioni non sovrapponibili, la scheda e il quesito alimentare rimangono da verificare; questi PDF non sovrascrivono automaticamente la classificazione fondata sulla Guida.

Per i test, copiare soltanto nozioni supportate da pagine effettivamente consultate. Non attribuire a un'intera sezione la commestibilità di una singola specie; nessuna scheda o immagine va marcata come indipendentemente revisionata per semplice presenza nella cartella.

## Regola fondante — provenienza certificata dal corso di micologia

**Decisione del titolare (22 ottobre 2026).** I materiali didattici contenuti nelle cartelle Google Drive condivise dal titolare come provenienti dal corso di micologia sono riconosciuti dal progetto come **fonti formative certificate per provenienza**, approvate per la raccolta e il popolamento dei dati dell'Atlante e delle banche d'esame. Non occorre richiedere una nuova autorizzazione del titolare o una seconda verifica generica della loro provenienza per ogni estrazione.

Questo riconoscimento riguarda la **provenienza dichiarata e l'ammissibilità editoriale** delle fonti, non equivale a revisione scientifica indipendente di ciascuna affermazione né certifica l'identificazione di esemplari o la sicurezza del consumo. Resta obbligatorio riportare nome del file, autore, pagina, tasson e affermazione pertinente, mantenendo tracciabilità e corretta interpretazione. Nessuna fonte può generare automaticamente `independentReviewStatus: reviewed` o `attested` in assenza del relativo processo attestato.

**Gerarchia fondante:** per commestibilità, divieti e condizioni di preparazione prevale la *Guida ragionata alla commestibilità dei funghi*. Gli altri documenti del corso sono fonti formative approvate per morfologia, nomenclatura, ecologia, fotografie se utilizzabili e contenuti didattici, senza sovrascrivere automaticamente la Guida. Eventuali discrepanze sono registrate e segnalate per valutazione specifica.

**Perimetro della certificazione di provenienza:** documenti effettivamente contenuti nelle cartelle Google Drive fornite dal titolare, con identificativo, percorso e versione del file tracciati. Nuovi file possono essere ammessi come materiali del corso nel medesimo perimetro, previa verifica che appartengano davvero alla cartella; link esterni riportati *dentro* i PDF non diventano automaticamente fonti certificate. La licenza delle immagini e i diritti di riutilizzo per un'app distribuita restano da accertare separatamente.
