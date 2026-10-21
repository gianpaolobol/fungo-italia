# Handoff corrente

## Consolidamento annuale/demo — 21 ottobre 2026

Decisione corrente: download gratuito; tutte le schede Agaricus (7 minime + 1 genere) e test4casi ripetibile; unico abbonamento completo a19,99€/anno. Nessun Base permanente. Dashboard a fungo e storico/ripasso integrati da107 con adattamento demo/annuale; icona106 e audit111 qualificato. Inventario168branch e motivazioni in [audit/BRANCH-SELECTION-2026-10-21.md](audit/BRANCH-SELECTION-2026-10-21.md).

Apple:1.0(9) respinta per prezzi negli screenshot e prodotti non inviati. Correzioni di listing/prezzo/screenshot applicate dalla recovery112; annuale e gruppo aggiunti a nuova bozza, senza appversion aggiornata. Non risottomessa. Build13 TestFlight appartiene al vecchio modello e non prova il consolidamento.

Verifiche locali del consolidamento:153test Node riusciti, TypeScript riuscito, esportazione iOS riuscita; rigenerazione src/data senza drift, YAML/shell dei34workflow validi. Revisione indipendente ha trovato e fatto correggere la perdita dello storico dopo errore transitorio di lettura; nuova prova dedicata. Il gate scientifico strict resta bloccato per revisione indipendente/fonti mancanti. Questi esiti non attestano esecuzione UI nativa.

Prove del nuovo candidato: riferirsi esclusivamente ai run sullo SHA consolidato. `consolidated-testflight.yml` produce soltanto beta diagnostica su canale isolato, richiede demo riuscita e prove native/UI completate; eventuali fallimenti billing sono riportati e non equivalgono a readiness App Store. Upload e selezione App Store/OTA produzione non partono più automaticamente dal pushmain. Nessuna revisione scientifica indipendente attestata.

Aggiornamento prove del candidato `38a7a85`: Android, demo iPhone/iPad e ciclo StoreKit nativo acquisto/rimborso/scadenza riusciti. UI acquisti fallita su entrambe le famiglie: il prodotto19,99€ viene caricato ma la lettura iniziale degli entitlement non termina; nessuna transazione di test avviata. Replica del solo test annuale su iPad (run39641922252) riproduce il blocco: non attribuirlo alla precedente demo senza altre evidenze. Beta diagnostica, non pronta per App Review.

Correzione del solo controllo CI dei destinatari: il GET `/v1/builds/{id}/betaGroups` restituisce403; usare `/v1/builds/{id}?include=betaGroups` e validare ID del build, tipo/ID dell'unico gruppo, completezza della relazione e assenza di tester individuali. Test di integrazione con risposta403 riprodotta prima della correzione e casi di assegnazioni ampliate/incomplete rifiutati; suite completa155test riusciti. Revisione indipendente senza P0/P1 e conferma autenticata del nuovo GET con HTTP200 e relazione completa sul build13 storico (run39646393017). Nessun cambiamento al codice eseguito dall'app in questa correzione: il binario del candidato resta costruito dal sorgente38a7a85. L'esito dell'upload e i numeri del nuovo build vanno letti dalla ricevuta firmata e da Apple, non dedotti dal build13 storico.

---

## Handoff precedente (storico superato)

# Handoff completo — Fungo Italia

**Fotografia di main: 21 ottobre 2026.** Fonti lette: `package.json`, `app.json`, `app.config.js`, `eas.json`, `App.tsx`, componenti nativi, `scripts/prepare-mobile-data.mjs`, JSON generati, README e registri Apple. L'audit dovrà ricontrollare HEAD e CI. **Nessun test è stato eseguito per questa PR documentale.**

## Stato verificato
| Ambito | Stato | Evidenza / limiti |
|---|---|---|
| Atlante iOS/Android | Implementato | `App.tsx`, `components/Studio.tsx`; visualizzazione, ricerca, preferiti, ripresa |
| Fotografie | Implementato parzialmente | `components/ReferencePhotos.tsx`; copertura triadi 143/148, identità/licenze da verificare |
| Esame 15 casi | Implementato, da ri-auditare | `components/PhotoExam.tsx`, `web/public/exam-core.js`, `src/data/exam-bank.json`; suggerimenti dopo 3 lettere, ripetizioni, correzione per campo, storico locale |
| Aree e habitat | Implementato con limiti | `components/Areas.tsx`: 71 macroaree, ricerca, mappa Leaflet/OSM online; parametri non sono osservazioni |
| iOS acquisti | Parziale/rischioso | Solo abbonamento annuale StoreKit; test UI iPhone/iPad non stabilmente verdi al 16/10 |
| Android acquisti | Non presente nel codice letto | `App.tsx` concede accesso completo alle piattaforme diverse da iOS |
| Dashboard fungo/progresso | Non presente nelle schermate principali lette | Requisito prodotto da implementare/testare, non dichiarare esistente |
| Login Apple/profilo utente | Non presente nel flusso nativo letto | Personalizzazione futura; preferiti ed esami sono locali |
| Base permanente 9,99 € | Non presente nel billing letto | Requisito successivo: download gratuito + Base a 9,99 € una tantum + Completo a 9,99 €/anno aggiuntivi |
| Web/PWA | Documentato come operativo | `legacy/web/`, `web/public/`, GitHub Pages; stato live da ricontrollare |
| Certificazione scientifica indipendente | Non attestata | `app.json` segnala `pending-independent-review` |

## Dati: conteggi reali da `src/data/catalog.json`
- **148** unità tassonomico-didattiche (comprendono sezioni e gruppi, non 148 specie biologiche), **66** schede gruppi/generi (`groups.json`), **71** macroaree (`areas.json`).
- `studyProfile.odor`: **148/148** non vuoti; `sporePrint.label`: **146/148**; `edibility.label`: **147/148**; triade `lateral/top/underside`: **143/148**; nomi comuni non vuoti: **23/148**.
- Questi contano solo la **presenza**, non verificano puntualità delle fonti, verità biologica, differenze tassonomiche, completezza fotografica reale, sicurezza del testo o diritto d'uso.
- Catena di provenienza: `legacy/web/artifacts/floot-readiness/` + manifest SHA-256 → `scripts/prepare-data.mjs` → `scripts/prepare-mobile-data.mjs` → `src/data/*.json`; integrazioni in `scripts/study-profiles.mjs`, `scripts/course-literature.mjs`, `scripts/approved-external-study-evidence.mjs`, `scripts/toxicology-syndromes.mjs`, `scripts/reviewed-matrix.mjs`, `scripts/admin-reference-images.mjs`, `scripts/commercialization.mjs`.
- Priorità fonti scientifiche concordate: `ambbresadola.it`, `funghiitaliani.it/micologia/indice.html`, `cmcalore.it`, `funghimagazine.it`, `micoponte.it`, `fungietnaturae.it`, `fungart.it`, `cultura.ilfilo.net`; sono piste editoriali, **non** garanzia che ogni campo le citi. La guida ragionata alla commestibilità prevale nelle decisioni editoriali, previa verifica puntuale.
- Separare dati di genere/specie e righe di gruppi, non inventare valori. Ricontare eventuali `reviewStatus` e `sources[].fields` specifici in report macchina.

## Immagini e diritti
- Metadati: `catalog.json`/`groups.json` → `referenceImages[]`; mappatura nel codice `src/data/reference-image-assets`; immagini referenziate sotto `images/reference/` nella distribuzione web e negli asset generati.
- Esistono crediti a materiale di corso e PDF, con esempi di autori multipli senza attribuzione individuale: un credito descrittivo **non è una licenza** né prova del permesso di ritaglio/redistribuzione commerciale.
- Audit asset per asset: file fisico, SHA, taxon soggetto, vista, URL pagina originale, autore, licenza esplicita, obbligo di attribuzione, eventuale autorizzazione scritta, data e reviewer. Sospendere le immagini non dimostrabili, specialmente ritagli da dispense/PDF e immagini che raffigurano un taxon diverso dall'etichetta della scheda.
- `resizeMode="cover"` nelle miniature di `components/ReferencePhotos.tsx`; esame `PhotoExam.tsx` usa `contain`: controllare distorsione, bande e perdita di dettagli diagnostici; vista integrale accessibile.

## Decisioni e motivazioni
1. Expo/React Native con dati preparati localmente: uso offline del materiale didattico e singolo catalogo generato; prezzo: pipeline complessa e rischio di divergenza web/native.
2. `3+1` didattico: stimolare discriminazione morfologica, non certificare identificazione/edibilità.
3. Strati `minimum/desirable/deep` e gruppi: progressione dello studio; verificare che la selezione filtri davvero i contenuti con il livello atteso.
4. Quiz 15 casi e ripetizione errori: apprendimento tramite richiamo e feedback; verificare banca sufficiente e copertura tossicologica.
5. Preferiti, ripresa e storico su AsyncStorage: funzionamento senza account; contro: perdita o assenza di sincronizzazione tra dispositivi.
6. Aree aggregate e OSM: riduzione rischio privacy/fungaie puntuali; niente previsione di raccolta.
7. Gate StoreKit da entitlement verificato, non flag locale: prevenire sblocco improprio. Non introdurre fallback insicuri.
8. Prezzi concordati successivamente col titolare: download gratuito, **Base permanente €9,99**, **Completo ulteriori €9,99/anno**; non già implementati. Le condizioni su altri store e acquisti precedenti richiedono una proposta di migrazione esplicita.

## Debito tecnico e problemi noti
- `App.tsx`, `SubscriptionGate.tsx`, `hooks/useSubscription.ts`, `lib/subscriptionPolicy.ts`, `modules/fungo-subscription/`: gate annuale precedente; StoreKit UI talvolta si blocca/non ripristina entro deadline, test iPhone/iPad storicamente discordanti. Leggere `docs/APP-STORE-SUBSCRIPTION-2026-10-16.md`.
- `src/data/catalog.json`: due sporate, una categoria alimentare e cinque triadi incomplete; ulteriori lacune di nomi comuni/fonti; i dati possono essere generati e richiedono modifiche upstream.
- `scripts/release-readiness.mjs`: verifica metadati e alcune evidenze ma non equivale alla validazione scientifica campo per campo o licenza; rischio falsi positivi se `reviewStatus` è compilato senza audit.
- `components/PhotoExam.tsx` e `web/public/exam-core.js`: verificare autocomplete di tutte le voci al terzo carattere (inclusa `Amanita rubescens`), scoring separato di specie/commestibilità (`Marasmius oreades`), distribuzione dei 15 casi e ripetizione errori; regressioni segnalate in passato.
- `components/Studio.tsx`: rivedere progressione livelli `minimum/desirable/deep`, leggibilità e profondità dei contenuti; non confondere rank con livello curricolare.
- `components/Areas.tsx`: Leaflet da CDN in WebView con dipendenza rete, dati di aree euristici, rischi di titoli interpretati come previsioni.
- `components/ReferencePhotos.tsx`: ritaglio `cover` può nascondere caratteri, metadata autorizzazioni insufficienti.
- `App.tsx`: tab gestite localmente, nessuna route deep link strutturata; stato locali diviso fra componenti; necessità di accessibilità e recovery dati.
- `package.json`: manca script lint/test generale; React Native prerelease richiede test regressivi specifici.
- `docs/CODEX_HANDOFF.md` è storico e include conteggi superati: fonte del contesto, non verità corrente.

## Pubblicazione: rischi e prove mancanti
- Apple: alla data del registro 16/10 candidata **1.0.0 (9) VALID** ma non selezionata; versioni successive/TestFlight/review devono essere riletti da Apple, non inferiti da GitHub. Il flusso StoreKit iPhone/iPad non aveva successo ripetibile sincronizzato.
- Apple: privacy in App Store Connect, DSA UE, accordi Paid Apps e prima submission del prodotto con app; controllare `docs/APP-STORE-OWNER-CHECKLIST.md`.
- Nuovo modello acquisti richiede nuovi prodotti e policy di entitlement, migrazione utente, testi, screenshot, test sandbox e verifica Apple/Google: **non** cambiare il billing durante questo audit.
- Google Play: AAB production configurato, submit internal draft; stato approvazione/pubblicazione, Data safety, target API, test e billing da verificare sul portale.
- Diritti foto, tossicologia non revisionata, accuratezza della scheda prodotto e affermazioni offline/privacy sono rischi di review.
- Verificare GitHub Pages reale, artefatto e service worker/caching: un workflow verde non garantisce app aggiornata su Safari.

## Indicazioni per l'audit di Claude
### Ordine delle verifiche
1. **Sicurezza contenuti:** tossici/mortali, sindromi, latenze, `edibility`, avvertenze; indipendenza delle fonti e generalizzazione di genere.
2. **Foto/licenze:** tutte le `referenceImages` e asset; 5 triadi mancanti; tracciabilità dei ritagli PDF; titolarità diritti e corrispondenza soggetto.
3. **Quiz:** `src/data/exam-bank.json`, `components/PhotoExam.tsx`, `web/public/exam-core.js`; copertura, normalizzazione, 3 lettere, corretta attribuzione di errori e ripassi.
4. **Monetizzazione e release:** `App.tsx`, `components/SubscriptionGate.tsx`, `hooks/useSubscription.ts`, `lib/subscriptionPolicy.ts`, `modules/fungo-subscription/`, `eas.json` e workflow.
5. **UI/UX:** `components/Studio.tsx`, `ReferencePhotos.tsx`, `Areas.tsx`; test iPhone 13 mini/320 pt, VoiceOver, Dynamic Type, aree tap, prestazioni su dataset completo, perdita di stato.
6. **Provenienza:** `scripts/prepare-data.mjs`, `prepare-mobile-data.mjs`, `src/data/catalog.json`, `groups.json`, `areas.json`, `legacy/web/artifacts/floot-readiness/`; riproducibilità, checksum, drift fra web e mobile.

### Non modificare durante l'audit
- Nessun codice, JSON generato, manifest, permesso, prezzo, prodotto Apple, store listing, pipeline, schema o branching di distribuzione senza proposta e PR dedicata.
- Non cambiare `reviewStatus` per far passare gate; non aggiungere immagini/commestibilità artificiali; non rimuovere avvertenze sanitarie né bypassare StoreKit.
- Non eliminare `legacy/web/`: parte della catena di preparazione; non committare asset con licenza incerta.
- Evitare pubblicazione automatica o merge: consegnare rapporto con prove, severità, file:linea, riproduzione, proposta di fix e impatto.

### Domande aperte per secondo parere
- Quale modello stabile garantisce lo storico e misura **preparazione reale**, non solo percentuale di schede viste? Dashboard fungo e curva progressi basati su recupero spaziato e rischio errori?
- Qual è la tassonomia più affidabile per rank, sinonimi e gruppi senza falsi determinismi? Quali affermazioni necessitano subito di controllo indipendente?
- Come rendere legalmente sostenibile l'intero set immagini, conservando le tre viste senza falsi crediti?
- Come migrare dagli abbonamenti annuali esistenti a Base permanente + Completo annuale su entrambi gli store evitando doppie fatturazioni o perdita di accesso?
- Quali test end-to-end deterministici possono isolare i blocchi StoreKit simulatore da difetti dell'app?
- Conviene unificare web/native su un solo schema dati e motore quiz versionato con regressioni multipiattaforma?

## Priorità di prodotto per diventare riferimento di studio
1. **P0 sicurezza/editoria:** validazione micologica indipendente per campi pericolosi e copertura licenze; display esplicito dei limiti.
2. **P0 qualità didattica:** quiz affidabile e completo, livelli verificabili, banco domande senza ambiguità, ripasso adattivo e analisi errori.
3. **P1 progressi:** dashboard a fungo con significato misurabile, cronologia per genere/obiettivo, competenze e retention; evitare percentuali ingannevoli.
4. **P1 usabilità:** schede a confronto, ricerca sinonimi, accessibilità, immagini diagnostiche nitide e crop controllato, offline affidabile.
5. **P1 distribuzione:** monetizzazione coerente e flussi Apple/Google testati, migrazione diritti, recovery del profilo.
6. **P2 prestazioni e comunità:** caricamento asset progressivo, indicizzazione, contributi moderati, export/import e sincronizzazione opt-in con privacy.

## Prossimi passi: una PR per attività
1. `audit/catalog-field-coverage`: inventario automatico per campo/rango/fonte e lacune; nessun dato inventato.
2. `audit/photo-rights`: matrice asset/licenza/autore/taxon e blocco di pubblicazione per non autorizzati.
3. `audit/toxicology-critical`: lista prioritaria schede per revisore micologo, riferimenti puntuali e conflitti.
4. `test/exam-autocomplete`: test di tutte le corrispondenze al terzo carattere e `Amanita rubescens`.
5. `test/exam-scoring`: test punteggi per campo, `Marasmius oreades`, ripetizioni e salvataggio.
6. `fix/catalog-missing-fields`: colmare **solo con fonti verificate** i 2+1+5 gap censiti (lotti più piccoli se necessario).
7. `test/storekit-lifecycle`: prove ripetibili su iPhone/iPad, rinnovo, ripristino, foreground, errore e scadenza.
8. `docs/monetization-migration`: specifica completa Base €9,99 + Completo €9,99/anno, diritti preesistenti e policy Apple/Google; nessun codice.
9. `feat/study-dashboard-model`: schema e test del progresso per competenza, senza UI iniziale.
10. `feat/study-dashboard-ui`: fungo percentuale e andamento temporale su misure validate, accessibilità.
11. `test/mobile-a11y`: test 320pt, lettori schermo, font scaling e gallerie.
12. `chore/release-evidence`: matrice commit → CI → EAS → TestFlight → store, con stati verificati.

## Protocollo fra agenti
- Ogni agente aggiorna data/HEAD, file letti, PR, test realmente lanciati, risultati, blocker e prossimo owner qui.
- Claude restituisce prima una tabella P0/P1/P2 con evidenze, poi PR piccole e non distruttive.
- Non convertire richieste storiche del titolare in funzionalità «fatte» senza prova nel branch attuale.

## Ultima sessione
- Data: 2026-10-21; agente: ChatGPT; branch: `docs/handoff`.
- Fatto: revisione documentale dei tre file di coordinamento; lettura di configurazione, entrypoint, componenti, generatori e dataset; nessuna modifica al codice.
- Test eseguiti: **nessuno**. Stato PR e SHA: fare riferimento alla PR GitHub.
