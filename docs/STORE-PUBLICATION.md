# Fungo Italia — pubblicazione App Store e Google Play

## Obiettivo

Pubblicare la versione nativa di Fungo Italia su App Store e Google Play, mantenendo il nome, gli ID `it.fungoitalia.app` e la matrice alimentare con Guida prevalente. La beta web resta operativa. Il backup `backup/main-pre-beta-publish-20261009` non va modificato.

## Verifiche del 9 ottobre 2026

- Progetto Expo esistente: `gianpaolobol/fungo-italia-`, ID `b65af584-739f-4ef0-8fe5-6c0ba692c088`. Collegamento GitHub–Expo funzionante nel workflow iPhone.
- La produzione EAS prevede iOS e Android App Bundle. Non sono ancora state inviate build agli store nell’ambito di questa preparazione.
- Ultimo tentativo iPhone: workflow 37970339369, job 113955036110. Validazione del codice riuscita; nessun team Apple trovato nel contesto Expo e nessuna credenziale ad-hoc utilizzabile. Questo non dimostra che l’iscrizione Apple Developer sia assente o inattiva. La distribuzione store richiede proprie credenziali di firma e un record App Store Connect.
- Autenticazione Expo non presente nella sessione CLI locale; non copiare segreti da GitHub né inserire chiavi nei file del repository.
- Account Google Play Console: da verificare con il proprietario.
- La versione nativa include ora i badge alimentari, le sindromi documentate e una sezione Esame con 15 casi fotografici estratti dalla matrice aggiornata. Usa lo stesso motore di selezione e valutazione della PWA; le spiegazioni restano soggette a revisione del docente. Il controllo su dispositivi reali della build firmata resta da eseguire. La sezione 3+1 mantiene le osservazioni personali. Non dichiarare una completa equivalenza di tutte le funzioni con la PWA.
- Il controllo di certificazione scientifica non attesta una revisione micologica indipendente. Non dichiarare l’app certificata o adatta a decidere il consumo; le informazioni alimentari sono attribuite alla Guida, senza certificazioni inventate.

## Scheda store proposta — bozza

**Nome:** Fungo Italia

**Sottotitolo Apple:** Atlante e studio micologico

**Descrizione breve Google:** Atlante micologico italiano: schede, fotografie e strumenti di studio.

**Descrizione estesa:**

Fungo Italia è un atlante e uno strumento di studio dedicato alla micologia. Consulta le schede per nome scientifico, nome comune o sinonimo, confronta fotografie e caratteri diagnostici e organizza il ripasso con i preferiti.

Le schede riportano, quando documentati, odore, sporata, habitat, confronti e indicazioni alimentari. Per la commestibilità il riferimento prevalente è la Guida ragionata alla commestibilità dei funghi. Generi e gruppi non ricevono automaticamente il giudizio di una singola specie.

Conserva sul dispositivo note e osservazioni personali. Le fotografie e i testi mantengono i riferimenti alle fonti disponibili nell’app.

Fungo Italia è uno strumento didattico: le immagini e i caratteri di studio non attestano l’identificazione di un esemplare e non autorizzano il consumo. Per il controllo dei funghi destinati all’alimentazione rivolgersi a un ispettorato micologico.

**Categoria proposta:** Istruzione / Education.

**Esame fotografico:** aggiungere alla descrizione soltanto dopo l’effettivo allineamento della versione nativa e la verifica della build. Non usare screenshot PWA come prova di una funzione assente nella build inviata.

## Materiali da completare prima dell’invio

1. Parità delle funzioni native sopra indicate, build firmate iOS/Android e controllo su dispositivi reali.
2. Record App Store Connect e Play Console, contatti di supporto e URL di privacy funzionanti.
3. Informativa ricavata dai flussi reali: libreria Foto e note locali, eventuali esportazioni o condivisioni, mappe e relativi servizi di rete. Le dichiarazioni App Privacy e Data safety devono corrispondere alla build effettiva; non dichiarare automaticamente assenza di raccolta dati.
4. Screenshot ricavati dalla build nativa, icona e grafica Google Play, questionari di età e contenuti, diritti su testi e immagini, dichiarazioni del titolare.
5. Prima distribuzione TestFlight e canale di test Google Play. Per gli account personali Google soggetti al requisito, almeno 12 tester iscritti continuativamente per 14 giorni prima della richiesta di accesso alla produzione; verificarne l’applicabilità nell’account.
6. Invio alla revisione dei due store. La pubblicazione dipende dall’approvazione dello store; la build o l’upload non equivalgono alla pubblicazione.

## Verifica tecnica della preparazione

Il 9 ottobre 2026: 62 test superati, controllo TypeScript superato e generazione dei bundle Hermes iOS/Android riuscita. Questi controlli non equivalgono a una compilazione nativa firmata né a una prova fisica sul dispositivo.

Il workflow manuale `Store production build` (`.github/workflows/store-build.yml`) permette di avviare una build `production` per Android, iOS o entrambi dopo aver configurato la firma in Expo. Non invia automaticamente la build agli store. Prezzo, territori e pubblicazione finale restano da definire dal titolare.

## Configurazione di invio

Il profilo EAS `production` serve per build destinate agli store. La prima configurazione Apple richiede il collegamento del team del proprietario e delle credenziali di distribuzione. EAS Submit per Android richiede il collegamento a Play Console e credenziali del servizio di invio, con l’eventuale prima operazione manuale richiesta dal flusso corrente. Non salvare chiavi Apple o JSON di account di servizio nel repository.

Riferimenti ufficiali:

- https://docs.expo.dev/build/setup/
- https://docs.expo.dev/deploy/submit-to-app-stores/
- https://docs.expo.dev/submit/android/
- https://developer.apple.com/app-store/review/guidelines/
- https://support.google.com/googleplay/android-developer/answer/14151465

Questa scheda è preparatoria; nessuna domanda di revisione degli store è stata inviata.
