# Fungo Italia — migrazione della beta su Floot

Data: 23 settembre 2026

## Obiettivo

Portare la beta privata di Fungo Italia dall'attuale runtime OpenAI Sites/Cloudflare a Floot, mantenendo invariata per quanto possibile l'esperienza utente e le funzioni già validate, così da poter pubblicare, aggiornare e collaudare l'app senza dipendere dai crediti di Work.

La migrazione non deve modificare il modello didattico dell'Atlante, la profondità informativa progressiva, la struttura dei 214 documenti di ricerca, né le regole di sicurezza scientifica già applicate alla beta privata.

## Stato sorgente

Repository: `gianpaolobol/fungo-italia`

Branch sorgente stabile: `main`

La beta privata risulta completata, con:
- 66 schede genere/gruppo;
- 148 schede Minimo;
- 214 documenti di ricerca;
- navigazione progressiva genere/gruppo -> specie/gruppi;
- filtri server-side;
- QA responsive;
- gate di sicurezza che non espone come fatti pubblici i claim ancora `reviewNeeded`;
- smoke Chromium sui viewport 320x568, 375x812, 768x1024 e 1440x900.

## Vincoli

1. Nessuna regressione funzionale intenzionale rispetto alla beta privata già completata.
2. Nessuna pubblicazione automatica di claim scientifici non revisionati.
3. Le funzioni oggi dipendenti dall'autenticazione ChatGPT Sites devono essere sostituite con autenticazione Floot.
4. Le funzioni oggi dipendenti da Cloudflare D1 devono essere migrate a Postgres gestito da Floot.
5. Le funzioni oggi dipendenti da R2 devono essere migrate allo storage gestito da Floot.
6. Le API Next.js devono essere convertite in endpoint Floot compatibili.
7. L'app deve restare utilizzabile da mobile, tablet e desktop.
8. Il progetto originale GitHub rimane la fonte storica e il riferimento per confronto funzionale.

## Architettura di destinazione

### Frontend

L'interfaccia viene ricostruita in React 19 all'interno del modello Floot.

Le superfici principali da mantenere sono:
- home/esplorazione;
- Atlante;
- ricerca e filtri;
- scheda genere/gruppo;
- scheda taxon Minimo;
- mappa e aree;
- segnalazioni;
- area amministrativa/revisione, nei limiti della beta privata.

La navigazione deve preservare:
- query;
- filtri;
- profondità didattica;
- contesto di ritorno tra gruppo e taxon figlio.

### Autenticazione

L'attuale dipendenza dagli header:
- `oai-authenticated-user-id`;
- `oai-authenticated-user-email`;
- `oai-authenticated-user-full-name`;

e dai percorsi:
- `/signin-with-chatgpt`;
- `/signout-with-chatgpt`;

viene rimossa.

Floot Auth diventa il sistema di autenticazione della beta.

Requisiti:
- accesso autenticato alla beta;
- identificazione stabile dell'utente;
- email disponibile per il bootstrap dei curatori;
- logout funzionante;
- nessun privilegio editoriale assegnato automaticamente al di fuori della configurazione prevista.

### Database

Cloudflare D1 viene sostituito da Postgres gestito da Floot.

La migrazione deve conservare semanticamente le entità già presenti nello schema applicativo, incluse:
- utenti;
- osservazioni/segnalazioni;
- proposte;
- revisioni;
- ruoli/grant;
- dati necessari al catalogo e al workflow editoriale.

I nomi SQL di tabelle e colonne saranno in `snake_case`.

### Storage

R2 viene sostituito con Floot Storage.

Da migrare:
- immagini caricate dagli utenti;
- eventuali media associati a osservazioni;
- asset dinamici che non fanno parte del bundle statico.

Gli asset statici dell'interfaccia possono essere inclusi nel progetto Floot quando compatibile.

### API / backend

Le route Next.js sotto `app/api/**` vengono convertite in endpoint Floot GET/POST.

Aree funzionali da preservare:
- catalogo;
- forecast;
- media;
- observations;
- admin.

Le logiche condivise vengono spostate in helper backend riutilizzabili per evitare duplicazione tra endpoint.

### Catalogo e sicurezza scientifica

Il corpus minimo e i dati didattici restano basati sui dati già persistiti nel repository.

Restano validi i gate correnti:
- i contenuti `reviewNeeded` non diventano fatti pubblici;
- morfologia/ecologia vengono esposte solo quando lo stato lo consente;
- i contenuti di sicurezza più critici richiedono lo stato previsto dal workflow editoriale;
- nessuna promozione automatica ad `approved`.

## Strategia di migrazione

### Fase 1 — Inventario e baseline

- congelare il comportamento della beta sorgente;
- mappare pagine, API, schema DB, auth, storage e flussi;
- identificare le dipendenze Cloudflare/OpenAI Sites;
- definire test di equivalenza.

### Fase 2 — Progetto Floot

- creare il progetto Floot;
- configurare Postgres;
- configurare autenticazione;
- configurare storage;
- impostare metadata e struttura base.

### Fase 3 — Porting frontend

- ricostruire home ed esplorazione;
- ricostruire Atlante;
- ricostruire navigazione progressiva;
- ricostruire mappa e responsive behavior;
- mantenere lo stesso linguaggio visivo salvo adattamenti minimi richiesti dal runtime.

### Fase 4 — Porting backend

- migrare schema e dati necessari;
- convertire endpoint;
- migrare upload media;
- migrare osservazioni;
- migrare workflow editoriale.

### Fase 5 — Auth e ruoli

- sostituire ChatGPT Sites auth;
- mappare utente Floot -> utente applicativo;
- preservare bootstrap curatori;
- verificare permessi e segregazione dei ruoli.

### Fase 6 — QA

Test minimi:
- login/logout;
- caricamento home;
- apertura Atlante;
- ricerca;
- filtri;
- schede genere/gruppo;
- schede Minimo;
- cambio profondità;
- ritorno stabile;
- mappa;
- creazione segnalazione;
- upload media;
- ruoli;
- API principali;
- responsive 320, 375, 768 e 1440 px;
- assenza di overflow orizzontale;
- assenza di leak di claim `reviewNeeded`.

### Fase 7 — Pubblicazione

- pubblicare su sottodominio Floot;
- verificare il deployment reale;
- collaudo post-publish;
- solo dopo il collaudo, usare `www.fungoitalia.gt.tc` come redirect temporaneo verso la beta pubblicata, se InfinityFree lo consente.

## Non-obiettivi della migrazione

Questa migrazione non include:
- revisione scientifica dei 295 batch ancora aperti;
- ampliamento del catalogo oltre il perimetro già definito;
- redesign completo;
- dominio definitivo a pagamento;
- pubblicazione di contenuti scientifici non ancora revisionati.

## Criteri di accettazione

La migrazione è considerata completata quando:

1. la beta è pubblicata su un URL Floot raggiungibile;
2. login e logout funzionano;
3. Atlante, ricerca, filtri e schede funzionano;
4. i 214 documenti restano navigabili;
5. le 66 schede genere/gruppo e le 148 schede Minimo restano raggiungibili;
6. il flusso gruppo -> figlio -> gruppo conserva il contesto;
7. la mappa funziona;
8. almeno un flusso di segnalazione completo funziona;
9. upload media funziona;
10. i permessi editoriali sono rispettati;
11. i claim `reviewNeeded` non vengono esposti come fatti pubblici;
12. il collaudo responsive è superato sui quattro viewport di riferimento;
13. il deployment può essere aggiornato da questa conversazione tramite Floot senza dipendere da Work.

## Rollback

Il repository GitHub originale e il runtime precedente non vengono eliminati durante la migrazione.

Se la beta Floot non supera i criteri di accettazione:
- il progetto Floot resta una beta separata;
- la versione GitHub corrente rimane il riferimento;
- nessun dominio definitivo viene puntato al deployment Floot.

## Decisione

Per la fase di test, la destinazione preferita è Floot perché consente gestione autonoma da ChatGPT di:
- progetto;
- database;
- autenticazione;
- storage;
- deploy;
- aggiornamenti successivi.

Il dominio provvisorio desiderato dall'utente resta `www.fungoitalia.gt.tc`, da usare come redirect o porta d'ingresso soltanto dopo che il deployment Floot è stabile.
