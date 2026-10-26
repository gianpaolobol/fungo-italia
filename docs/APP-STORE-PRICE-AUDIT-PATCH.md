> Documento storico della patch locale preparata su6408292. Recuperata nel ciclo master del26ottobre2026 e integrata nella baseline20c42bab7ec7c448072ebe50a9966eadb9ff6c75, con due ulteriori regressioni sui dati malformati (21/21 prezzi,235/235 suite completa). Nessuna modifica ai prezzi Apple. Lo stato corrente e l’esito del successivo audit sono da consultare in [MASTER_PROJECT_STATUS.md](MASTER_PROJECT_STATUS.md). Le affermazioni «nessun push» sotto descrivono la consegna originaria.

# Patch del controllo prezzi Apple — 26 ottobre 2026

Base: `64082923baf64885d5577895edaa95021e034d52`. Patch locale, non pubblicata né eseguita contro Apple. Nessun token o dato autenticato usato nei test.

## Problema e correzione

Il controllo precedente selezionava il primo record ITA della prima pagina e il relativo punto prezzo, senza interpretare date o preservazione. Il nuovo lettore GET, con API iniettata, segue tutti i `links.next` della raccolta dei prezzi e ricongiunge i punti prezzo inclusi anche su pagine diverse. Deduplica risorse identiche; segnala conflitti, totali incoerenti, pagine malformate o mancanti. Accetta solo link allo stesso endpoint Apple: non inoltra credenziali verso altre origini o risorse. Un ciclo o il limite difensivo di 1000 pagine produce un risultato incompleto, mai un prezzo dichiarato certo. Non modifica l'enumerazione dei gruppi/prodotti o altre raccolte dell'audit.

## Contratto del rapporto

`italyPricing` contiene `asOf`, `effectiveDate`, `timeZone`, `complete`, `pages`, `configuredPrices`, `status`, `current`, `scheduled`, `preserved`, `historical`, `plans` e `issues`. I record conservano ID, ID punto prezzo, decorrenza, flag preservazione, piano e importo decimale come stringa. `complete` descrive la paginazione, mentre `status` descrive la determinabilità del corrente. Incompletezza o anomalie dei dati possono lasciare visibili i record osservati, ma questi non sono un elenco completo verificato.

- Territorio ITA, valuta EUR. Politica calendariale esplicita Europe/Rome, ricavata dall'istante di osservazione. Non è un'asserzione sull'ora di propagazione Apple.
- `startDate:null` è baseline. `startDate` omessa o invalida, compresi giorni inesistenti, è un errore.
- Piani UPFRONT/MONTHLY separati. Piano assente o sconosciuto è indeterminato; non viene dedotto dalla durata annuale del prodotto.
- Per ogni piano, tra i record standard non preservati, una decorrenza precedente alla data osservata sostituisce le precedenti. Le successive restano programmate. Record standard con decorrenza identica confliggenti non vengono risolti scegliendo l'ordine o il prezzo atteso.
- Il giorno di un cambio standard il corrente resta `null` (`TRANSITION_DATE`): Apple espone una data, non un istante di attivazione verificabile. La transizione non viene anticipata alla mezzanotte UTC.
- I record preservati, anche futuri, restano in `preserved`, con la propria data. Non vengono promossi al prezzo standard e non dimostrano l'esistenza di clienti che li pagano. Il rapporto non determina il prezzo del singolo rinnovo, i consensi, le offerte o la distribuzione dei clienti tra coorti.
- Il campo storico `italyPrice` deriva solo da `current.customerPrice` per un unico piano risolto; altrimenti è `null`, mai un importo arbitrario o zero implicito. `italyPricing.interpretation=configured-schedule-only` e `subscriberPriceStatus=not-determinable-from-price-schedule` delimitano il significato del dato.

Tra le cause esplicite di indeterminatezza: richieste fallite, paginazione incompleta, totali incoerenti, territorio assente, punto prezzo assente o territorialmente incoerente, data/importo/flag/piano invalidi, più prezzi candidati, soli prezzi futuri o preservati, più piani. `plans` consente comunque di ispezionare i singoli piani risolti. Nessun dato viene confrontato con 19,99 € per forzare un esito desiderato.

## Verifica riproducibile

Richiesto Node >=24.3.0, usato 24.22.1. Per installare le dipendenze senza hook di preparazione: `npm ci --ignore-scripts`.

```sh
node --test scripts/app-store-prices.test.mjs
node --test scripts/*.test.mjs
node --check scripts/app-store-connect.mjs
node --check scripts/app-store-prices.mjs
git diff --check
```

Risultati: 19/19 test dedicati; 231/231 test della suite Node; sintassi/whitespace superati. Casi: ITA solo nella seconda pagina, inclusi tra pagine, inversione ordine di record e pagine, aumenti e riduzioni, baseline, cambio odierno, confine UTC/Italia, preservazione presente/futura, piani multipli, conflitti, dati mancanti/invalidi, errori HTTP/trasporto, cicli/link estranei, totali e duplicati. Le prove usano esclusivamente fixture sintetiche e la funzione di lettura esportata dallo stesso modulo usato dall'audit; non creano credenziali né chiamano Apple.

La prima esecuzione completa senza `node_modules` falliva in `course-photo-display.test.mjs`, nel test autolinking iOS, in `public-photo-access.test.mjs` e `subscription-late-product.test.mjs` per dipendenze mancanti. Dopo installazione da lockfile la suite completa è passata. Non sono stati eseguiti build mobile, test nativi, gate scientifico o nuovi audit Apple: restano estranei a questa patch.

## Applicazione e limiti

Applicare su una copia pulita della base indicata con `git apply --check FungoItalia_Prezzi_Apple.patch`, quindi `git apply FungoItalia_Prezzi_Apple.patch`. La consegna include i sorgenti modificati e i log. Nessuna modifica a prodotti/prezzi, testi commerciali, workflow, verifiche StoreKit o gate di rilascio.

Non effettuato push: il workflow esistente `app-store-status.yml` si attiva su main quando cambia lo script e avvierebbe un nuovo audit autenticato. Questa consegna non ne provoca l'esecuzione. Un futuro audit autorizzato sarà necessario per riconciliare il rapporto storico 9,99 € con i 19,99 € configurati; anche un calendario risolto non dimostra da solo disponibilità commerciale o prezzo del singolo cliente.

## Riferimenti primari consultati (documentazione pubblica)

- https://developer.apple.com/documentation/appstoreconnectapi/get-v1-subscriptions-_id_-prices
- https://developer.apple.com/documentation/appstoreconnectapi/subscriptionprice/attributes-data.dictionary
- https://developer.apple.com/help/app-store-connect/manage-subscriptions/manage-pricing-for-auto-renewable-subscriptions/

La documentazione è usata per lo schema e i limiti del calendario, non per attestare lo stato dell'account Fungo Italia.
