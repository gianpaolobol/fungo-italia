# Managed Android Beta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Beta Android completa di 90 giorni, con inviti personali, pannello del titolare e revoca individuale.

**Architecture:** Servizio Node 24 HTTPS con concessioni e sessioni persistenti in SQLite; client Expo Android con token nel keystore e controlli online. Diritto beta separato dal billing: lo sblocco complessivo è la disgiunzione di due diritti verificati, senza trasformare la beta in un acquisto.

**Tech Stack:** Expo 58/React Native esistenti, TypeScript e JavaScript ESM, Expo SecureStore compatibile con SDK58, Node24, SQLite transazionale, test Node e Android35 emulator.

**Spec:** `docs/superpowers/specs/2026-10-28-managed-android-beta-design.md`

## Global Constraints

- 90 × 24 ore dal primo riscatto; invito non attivato valido 7 giorni; tutti i tempi autorevoli sul server.
- Ricontrollo all'avvio/foreground e ogni60secondi; nessun accesso completo offline dopo la scadenza della breve verifica.
- Revoca server immediata; client entro60secondi dalla sua ultima verifica valida o al ritorno in primo piano.
- Ogni tester è invitato dal titolare; nessun amministratore ottenibile tramite registrazione pubblica.
- Token256bit minimo, hash sul server, keystore Android, no query string/log/repo contenenti segreti o email reali.
- Nessun cambiamento scientifico, iOS/StoreKit, web, OTA o pubblicazione pubblica; stessa chiave Android.
- Conservare bozza, storico, preferiti e note quando il diritto completo cessa.
- Nessun pagamento automatico; premium pagato resta distinto dalla concessione beta.
- Hosting e nuova credenziale amministrativa da autorizzare concretamente prima dell'attivazione live.

## Review Focus

1. Due riscatti simultanei dello stesso invito: uno solo riesce e concede esattamente90giorni, task1.
2. Vecchia risposta di rete dopo revoca/logout o foreground: non ripristina accesso, task3.
3. Revoca mentre si risponde a un esame: salva bozza senza concedere nuovi casi completi, task4.
4. Cambio orologio/sospensione/rete assente: non prolunga il diritto, task3.
5. Revoca beta di un abbonato reale: l'abbonamento resta valido, task4.

---

### Task1: concessioni e sessioni transazionali

**Files:** Create `server/beta/store.mjs`, `server/beta/policy.mjs`, `server/beta/store.test.mjs`.

**Interfaces:** `createBetaStore({databasePath,clock,randomBytes})`; metodi `invite({email})`, `redeem({inviteToken})`, `check({sessionToken})`, `revoke({grantId,expectedVersion})`, `extend({grantId,expiresAt,expectedVersion})`, `revokeAll()`, `list({cursor,limit})`, `logout({sessionToken})`. Risposta controllo `{active,grantId,expiresAt,serverNow,maxAgeSeconds:60}`. Nessuna email/segretoprivato nella risposta controllo. Invito restituisce il token solo una volta all'amministratore; riscatto restituisce sessionToken solo una volta.

- [ ] Scrivere casi negativi e positivi: revoca assente/attiva,90giorni esatti,7giorni invito, riscatto concorrente uno solo, token precedente dopo reinvio, proroga conflitto versione, backup/ripristino e riavvio. Eseguire `node --test server/beta/store.test.mjs` e conservare il fallimento iniziale.
- [ ] Implementare schema SQLite e transazioni; hash SHA256 dei segreti casuali; indice univoco e riscatto condizionale atomico. Clock e random iniettati solo nei test, nessuna opzione test attivabile pubblicamente.
- [ ] Ripetere i test e verificare assenza di token in DB e liste. Commit del solo servizio/test.

### Task2: HTTP e pannello del titolare

**Files:** Create `server/beta/server.mjs`, `server/beta/admin-session.mjs`, `server/beta/admin.html`, `server/beta/server.test.mjs`, `server/beta/README.md`.

**Interfaces:** `createBetaServer({store,adminCredentialHash,allowedOrigin,rateLimiter})`. API pubblica JSON POST `/beta/redeem`, `/beta/check`, `/beta/logout`; admin `/admin/login`, `/admin/logout`, `/admin/grants/list`, `/admin/grants/invite`, `/admin/grants/revoke`, `/admin/grants/extend`, `/admin/grants/revoke-all`.

- [ ] Scrivere test HTTP che rifiutano admin anonimo, sessione scaduta, origine/CSRF errati, GET mutante, corpo>4KiB, token malformato, conflitti e brute force. I messaggi di errore non rivelano se una email è invitata.
- [ ] Implementare cookie Secure/HttpOnly/SameSite e CSRF, rate limit IP e globale, timeout10s, no-store, redazione log, segreto admin richiesto da configurazione e mai auto-generato nella UI. Listener loopback dietro proxy HTTPS.
- [ ] Implementare pannello elenco/stato/scadenza, invito/reinvio con testo email copiabile e invito personale, proroga e revoca, conferma per revoca globale. Nessuna dipendenza SMTP o invio automatico non configurato. Mostrare separatamente istruzione di aggiunta alla lista Play.
- [ ] Eseguire `node --test server/beta/*.test.mjs`; verificare il pannello con sessione proprietario e accesso anonimo rifiutato. Commit.

### Task3: sessione beta Android e finestra di verifica

**Files:** Create `lib/beta-policy.mjs`, `lib/beta-client.ts`, `hooks/useBetaAccess.ts`, `scripts/beta-policy.test.mjs`; Modify `package.json`, lockfile e `app.config.js`.

**Interfaces:** `useBetaAccess()` restituisce `{active,checking,expiresAt,error,redeem(token),logout(),refresh()}`; client configurato solo su Android da `extra.betaServiceUrl` HTTPS. Token nel SecureStore, mai AsyncStorage. Gli altri sistemi restituiscono inattivo senza richieste.

- [ ] Test RED per risposta tardiva dopo logout/revoca, clock rollback, scadenza90giorni, timeout, app sospesa e ritorno offline, massimo60secondi con tempo monotono, endpoint assente o HTTP, sessione persa dopo reinstallazione.
- [ ] Installare con Expo la sola dipendenza SecureStore compatibileSDK58. Implementare generation guard, rimozione privilegi al foreground prima della richiesta, deadline monotona non estendibile dagli errori, niente cache persistente del diritto attivo. Gli errori non cancellano progressi.
- [ ] Eseguire test policy e `npm run typecheck`; verificare config prod senza endpoint mock e che iOS/web non abbiano nuovo comportamento. Commit.

### Task4: accesso completo e conservazione progressi

**Files:** Create `components/BetaAccess.tsx`; Modify `App.tsx`, `components/ExamHub.tsx` e, solo se necessario per salvataggio bozza, il componente d'esame attuale; Test `scripts/beta-integration.test.mjs` e harness UI esistente.

**Interfaces:** `BetaAccess` riceve esclusivamente stato e callback del hook; `fullAccess = billing.active || beta.active` soloAndroid. Il gate acquisti continua a ricevere `billing.active`, non il diritto combinato. Percorso beta raggiungibile dalla schermata accesso, amministrazione esterna.

- [ ] Test RED: beta valida dà tutti gli ID catalogo e tutti i test; demo resta Agaricus; acquisti non attivati dalla beta; beta revocata più abbonamento attivo resta completa; chiusura beta non cancella stato; bozza esame salvata al blocco.
- [ ] Implementare UI “Beta completa” con scadenza, attivazione invito e uscita, messaggio di necessità rete; deep-link senza logging e inserimento manuale. Non modificare contenuti/sorgenti dell'atlante.
- [ ] Eseguire test, typecheck, `npm run prepare:data` e `git diff --exit-code -- src/data`. Verificare UI Chromium/WebKit pertinenti e regressioni StoreKit esistenti sullo stesso SHA quando i file condivisi sono modificati. Commit.

### Task5: servizio reale, prova amministrativa e privacy

**Files:** Create `docs/ANDROID-MANAGED-BETA.md`, configurazione deployment per l'host scelto; Modify privacy Android solo con dichiarazioni aderenti all'implementazione effettiva.

**Interfaces:** URL HTTPS stabile del servizio e pannello del titolare, SQLite persistente/backup, credenziale amministrativa inserita privatamente. Nessun dato reale nei file evidenza pubblici.

- [ ] Prima del deploy, verificare concretamente host/volume/HTTPS, costi e gestione credenziali; presentare al titolare destinazione e soli accessi nuovi necessari. Non attivare spese o ampliare permessi senza consenso specifico. Non usare il vecchio Floot come scorciatoia.
- [ ] Distribuire dopo consenso, verificare backup+restore, amministrazione autenticata e revoca end-to-end con utenza sintetica. Verificare che log/reverse proxy non registrino corpi o segreti e che storage/errore servizio non sblocchino accessi.
- [ ] Documentare email, inviti, scadenze, minimizzazione dati, finalità e conservazione effettiva; nessun invio di foto o storico al servizio beta. Commit prove redatte e runbook.

### Task6: nuova build interna e consegna ai collaudatori

**Files:** Modify `eas.json`, workflow Android dedicato e `scripts/android-smoke.py`; update handoff e master con stato effettivo.

**Interfaces:** profilo `android-managed-beta`, canaleEAS isolato, URL del servizio reale, versionCode remoto>3, firma caricamento invariata, unico canale Play interno esistente.

- [ ] Test/emulatore: attivazione completa, revoca dal pannello durante uso, offline e scadenza, reinscrizione, persistenza preferiti/storico/bozza e abbonamento separato. Gate scientifici/platea espliciti e snapshot invariato; non attribuire approvazione indipendente.
- [ ] Build EAS firmata soltanto dopo controlli dello SHA; scaricare AAB e verificare sorgente/firma/versione/endpoint, poi caricare su Play e aggiornare la release interna dopo autorizzazione al nuovo artefatto.
- [ ] Creare il vero invito personale del primo collaudatore, verificare stato nel pannello e assegnazione lista Play. Inviare email di aggiornamento solo quando la nuova build è disponibile. Aggiungere altri tester soltanto su istruzione del titolare.
- [ ] Verificare accettazione/installazione senza impersonare il destinatario. Registrare separatamente “pubblicata”, “invito inviato”, “attivata”, “collaudata sul dispositivo”. La build3 e l'email precedente restano storiche; nessun claim retroattivo.

## Esito della revisione del piano

Vincoli funzionali coperti dai task1–6; hosting e credenziale sono prerequisiti reali da risolvere al task5, non finti servizi esistenti. Nessun comportamento nuovo è attualmente implementato o distribuito. Prima dell'esecuzione, revisione del progetto e del piano secondo la procedura di pianificazione applicata in sessione.
