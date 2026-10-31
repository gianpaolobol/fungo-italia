# Pilota corsi — incremento isolato 1

Stato: codice della fondazione, non funzionalità docente-studente già disponibile.
Ramo: `feat/teacher-student-pilot-free-20261031`, base `83fe6948`.
Specifica approvata: `docs/superpowers/specs/2026-10-31-free-pilot-approved.md`.

## Cosa esiste

- `continuity/monitor.mjs`: lettura reale della sentinella PostgreSQL, timeout,
  classificazione errori, stato e avvisi; non basta HTTP 200 o un ping Auth.
- `continuity/worker.mjs`: cron esterno, persistenza KV fuori da Supabase, avvisi
  Brevo senza dati studenti, stato privato, modalità watchdog separata.
- `database/001-foundation.sql`: corsi, iscrizioni con ID distinto a ogni ingresso,
  gruppi, metadata dei PDF e condivisioni dinamiche, quarantena, revoche e RLS.
  Nessun client può inserire iscrizioni o promuovere file a pronti. Il ruolo anon
  legge soltanto una riga tecnica; non accede allo schema corsi.
- `client.mjs`: contratto di lettura v1 per app e pannello futuri, senza dipendenze
  native, storage globale, identità telefono o modifiche ai diritti premium.
- `readiness.mjs`: verifica la completezza delle evidenze operative; NON certifica
  la veridicità di dichiarazioni compilate a mano. Un revisore deve leggere le prove.

Non esistono ancora nell'incremento: onboarding/inviti, upload e scanner attivi,
consegna privata dei byte da B2, pannello/editor, runner/correzione remoti e push.
Le tabelle non bastano a dichiarare questi flussi implementati o collaudati.

## Task bloccante: P0-CONTINUITY

NON RISOLTO. Nessun deployment o cron è attivo. Nessuna email è stata inviata.
La qualificazione richiede almeno otto giorni reali, avvisi ricevuti, guasto e
recupero, ripristino DB/file, quote gratuite verificate. Conservare i dati delle
prove e le ricevute in ambiente privato, usando nel repo soltanto riferimenti
privi di credenziali o identità studenti. L'esempio JSON parte correttamente rosso.

Una richiesta ogni sei ore riduce il rischio; Supabase può comunque sospendere
progetti Free con attività insufficiente. L'email settimanale non è un keepalive.

## Preparazione dei servizi — solo ambiente dedicato gratuito

1. Inventariare account/quote già esistenti. NON usare progetto, token, database,
   canali Expo, bucket o destinatari delle beta correnti.
2. Verificare Supabase Free, B2 gratuito e percorso Cloudflare privato, Workers/KV
   Free e Brevo Free. Lo spazio di versioni/backup conta nelle quote condivise.
   Nessun piano a consumo o carta viene attivato implicitamente da questo codice.
3. Sul nuovo progetto applicare SOLO `001-foundation.sql`, non `fixture.sql` o test.
   Esporre in PostgREST `pilot` e `pilot_health`, MAI `pilot_private`. Verificare
   che richieste anon a corsi/materiali falliscano e la sentinella risponda con
   `[{"id":1,"schema_version":1}]` usando `Accept-Profile: pilot_health`.
4. Questa versione del monitor usa la chiave anon JWT legacy del progetto
   dedicato, sia come apikey sia come Bearer. Non usa service-role, password DB o
   chiave di firma. Non sostituirla con una nuova `sb_publishable_` senza adattare
   e collaudare gli header: non è un token JWT utilizzabile come Bearer.
5. Copiare `continuity/wrangler.example.toml` in configurazione privata. Collegare
   KV Free dedicato e impostare i segreti da dashboard/CLI senza stamparli:
   `STATUS_TOKEN`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `BREVO_API_KEY`, `MAIL_FROM`,
   `MAIL_TO`. Casella destinataria del titolare verificata, mittente autenticato.
6. Verificare richieste e invii controllati; poi `ENABLED=true`,
   `NOTICES_ENABLED=true`, cron `17 */6 * * *` UTC. Verificare esecuzione effettiva,
   non solo salvataggio del cron. Controlli dopo due fallimenti consecutivi:
   allarme dopo circa 6–12 ore, ripristino al primo successo successivo.
7. Secondo Worker/KV separato in modalità `watchdog`, cron `47 */6 * * *`, con
   `WATCH_URL` dell'endpoint `/status` del monitor e suo `WATCH_TOKEN`. Il watchdog
   usa un proprio STATUS_TOKEN e le proprie configurazioni email. Un controllo
   esterno a Cloudflare o presidio manuale verifica entrambi: due Worker sullo
   stesso provider non eliminano un guasto comune di Cloudflare.
8. Stato `/status`: soltanto GET autenticato con Bearer STATUS_TOKEN, no cache.
   Oltre 15 ore senza esecuzione indica errore. Restituisce solo stato tecnico,
   non configurazioni, indirizzi, dettagli dei provider o dati del corso.

## Invii, costi e affidabilità

Massimo sei avvisi giornalieri PER Worker; normalmente un riepilogo settimanale,
allarme dopo due guasti e ripristino. Riservare almeno 12 invii/giorno per entrambi
i monitor nella quota Brevo condivisa; le email di accesso hanno priorità nel
futuro servizio inviti. Nessuna ricevuta API viene descritta come email letta.

Lo stato viene scritto prima dell'invio per evitare ritentativi immediati dopo
timeout ambiguo. Se l'invio è incerto, `/status` è degradato e i log segnalano il
problema. KV ha consistenza eventuale: deduplicazione best-effort, non esattamente
una volta; niente endpoint pubblico per scatenare controlli o invii. Due cron
distinti non devono usare la stessa chiave di stato/KV. Un cron mancato non può
essere rilevato da se stesso: serve il watchdog.

I Worker non leggono ancora contatori reali di storage/email/backup: il messaggio
settimanale riporta soltanto disponibilità DB. Il controllo giornaliero delle
quote e dei backup è un task operativo ancora aperto, non uno stato fittizio.

Materiali: limite DB 20.000.000 byte per file, 1.000.000.000 per corso; contano
anche quarantena e ritirati finché presenti. Le copie B2/versioni/backup richiedono
un limite operativo separato (soglia prudente complessiva 8 GB su 10 GB gratuiti).
Il trigger DB non controlla da solo lo storage oggetti o il traffico. Scanner e
upload devono prenotare quota prima dei byte; nessun file non scansionato va reso
disponibile. Recuperare copia DB e file separatamente, registrarne checksum e
provare il ripristino su ambiente vuoto prima di allargare il pilot.

## Se Supabase sospende il progetto

1. Il monitor conserva il suo stato su KV e segnala indisponibilità; non chiama
   API di upgrade o riattivazione con privilegi amministrativi.
2. Il titolare apre il progetto dedicato in dashboard e usa Resume; verifica
   sentinella, API dei corsi, accesso file e autorizzazioni prima di riaprire prove.
3. In caso di perdita/irrecuperabilità: ripristinare backup DB e file su progetto
   dedicato, ruotare credenziali, aggiornare configurazioni dei soli corsi e
   verificare gli stessi gate. Non toccare app/abbonamenti esistenti.
4. Registrare incidente e tempi; raccogliere una nuova finestra pulita di otto
   giorni. Non dichiarare la continuità risolta perché il primo ping è tornato verde.

## Integrare nell'app che avrà ricevuto altre correzioni

Non copiare App.tsx o vecchie schermate dal ramo di progettazione. Acquisire lo SHA
app aggiornato, confrontarlo con la base, integrare selettivamente `pilot/` e
adattare il contratto v1. `createCourseClient` riceve `getSession()` asincrona con
`{accountId, sessionId, accessToken}` dal futuro gestore account; `sessionId`
cambia a logout/login, non al semplice rinnovo del token. Non è il codice beta.
Il client non memorizza credenziali; una risposta di un'altra sessione viene scartata.

Prima dell'integrazione: compilare TypeScript e verificare navigazione modificata,
demo Agaricus, diritti StoreKit/Android, storico locale byte-per-byte, corso senza
premium, logout/cambio account, iPhone/iPad/Android/web. Versionare nuove API se
cambia il contratto, mantenendo compatibilità per vecchie build. Nessun import del
modulo corsi nell'app attuale e nessuna dipendenza nativa in questo incremento.

## Verifiche

`node --test pilot/continuity/*.test.mjs pilot/*.test.mjs`

Su PostgreSQL temporaneo e VUOTO: impostare `PILOT_TEST_DATABASE_URL` e lanciare
`bash pilot/verify-postgres.sh`. La fixture crea ruoli/auth fittizi e non deve mai
puntare a dati reali. CI dedicata esegue le stesse prove senza segreti, deploy o
build Apple/Android. I test dell'app invariata non sono stati rieseguiti localmente:
il checkout è uno snapshot parziale; il commit remoto conserva l'intero albero base.

Riferimenti ufficiali consultati 31 ottobre 2026:
- https://supabase.com/docs/guides/platform/free-project-pausing
- https://supabase.com/pricing
- https://developers.cloudflare.com/workers/platform/pricing/
- https://www.backblaze.com/cloud-storage/pricing
- https://www.backblaze.com/docs/cloud-storage-deliver-private-backblaze-b2-content-through-cloudflare-cdn
- https://help.brevo.com/hc/it/articles/208580669-FAQ-Quali-sono-i-limiti-del-piano-Free
