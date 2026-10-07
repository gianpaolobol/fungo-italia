# FUNGO ITALIA — CODEX HANDOFF OPERATIVO
Data: 2026-10-08. Repository: https://github.com/gianpaolobol/fungo-italia
Questo documento è un handoff di requisiti e stato verificabile, NON la trascrizione delle sessioni Codex precedenti. Le direttive nelle conversazioni Codex non salvate nel repository non sono accessibili qui.

## Missione e principi non negoziabili
Realizzare un atlante micologico italiano scientificamente serio, utile dal principiante al micologo esperto, con profondità informativa progressiva e consultazione mobile-first. Il prodotto è gratuito in beta; web/PWA, poi Android/iOS. Distinguere sistematicamente **contenuto presente**, **fonte specifica**, **revisione indipendente**, **validazione**. Mai equiparare il metodo didattico 3+1 a una determinazione sicura o a un giudizio di commestibilità. Non generare falsi riscontri, nomi, immagini, autorizzazioni o certezze.

## Stato tecnico documentato (baseline, verificare sul branch attuale)
- Default branch main; presenti numerosi branch feat/, fix/, review/, research/ e backup/. Analizzare prima di modificare; NON scegliere il branch più recente solo dal nome.
- Ultimo commit osservato su main: 5ec59dba41a587b5e9b754d8d5a317e63dcb4109 (merge fix/admin-password-test-completion, 2026-10-07 22:05 UTC). Rileggere HEAD e PR aperte.
- README documenta 148 unità minime, 66 schede di generi/gruppi, 71 macroaree in 20 regioni; PWA pubblica https://gianpaolobol.github.io/fungo-italia/ .
- Expo 58.0.2, React 19.3.0, React Native 0.88.0-rc.3; package.json con prepare:data, typecheck, export. Conservati legacy/web e backup pre-migrazione.
- Audit 2026-10-06: 19 test web Chromium/WebKit, verifica Pages e Android emulatore; NON prova fisica iPhone. APK debug native-preview, NON distribuzione produzione. iOS nativo bloccato da credenziali/team Apple; PWA Safari utilizzabile.
- Audit scientifico 2026-10-06: 23/148 nomi comuni documentati, 3/148 habitat strutturati, 14/148 confronti bibliografici, 7/148 con almeno un riscontro esterno puntuale sui caratteri. Nessuna revisione indipendente o fotografia tassonomica di riferimento validata attestata. Conteggi soggetti a revisione dopo gli ultimi branch.
- Leggere README.md, docs/AUDIT-2026-10-06.md, docs/CONTENT-COVERAGE.md, docs/IPHONE.md, docs/ANDROID-PREVIEW.md e branch feat/admin-photo-editor, feat/admin-photo-browser-tests, feat/complete-reference-triplets, feat/external-reference-photos, feat/study-layout-oct07, review/final-630-view-delivery, fix/admin-password-test-completion. Confrontare HEAD, commit e merge, verificare effettiva integrazione.

## Requisito editoriale di rilascio: 100% schede popolate
Tutte le schede comprese nel catalogo di rilascio devono avere nomenclatura e rango tassonomico, nomi comuni verificati ove attestati, habitat, stagionalità contestualizzata, morfologia e caratteri discriminanti, metodo 3+1 (tre caratteri osservabili + uno differenziale), sosia pericolosi, fonti puntuali per affermazione e TRE fotografie autentiche diagnostiche: **fianco, sopra, sotto**. Per taxa dove la vista non è applicabile (forme resupinate ecc.) definire equivalente anatomico motivato, mai inserire immagini improprie per soddisfare un conteggio. Separare specie, gruppi, sezioni, generi e complex, senza fingere risoluzione a livello di specie. Assenze documentate devono essere trattate come blocchi alla completezza, non colmate con invenzioni.

## Immagini dal web e diritti
Ricercare immagini anche online, privilegiando fonti istituzionali, collezioni micologiche, Wikimedia Commons, GBIF/iNaturalist quando licenza e identificazione siano verificabili. Per ogni asset registrare URL sorgente, pagina originale, autore, licenza, attribuzione richiesta, taxon dichiarato, evidenza della determinazione, data acquisizione, vista anatomica, stato di revisione e versione. NON riutilizzare immagini con copyright incompatibile o licenza ignota; non fare hotlink fragile senza diritto e piano di conservazione. Non usare immagini AI come fotografie di campioni reali. Segnalare e non pubblicare immagini con identificazione incerta come certe.

## Editor amministratore obbligatorio
Accesso autenticato con autorizzazioni server-side, non password statica esposta nel client. Per ogni scheda: visualizzare e sostituire separatamente fianco/sopra/sotto; caricare da telefono/computer oppure importare da URL lecito; crop senza perdita dell'originale, zoom, anteprima mobile, didascalia, provenienza, autore, licenza, note diagnostiche, conferma taxon/vista, bozza e pubblicazione, audit log e rollback. Gestire stato proposed/reviewed/published, versioni e conflitti di modifica. Le modifiche pubblicate devono propagarsi davvero alla PWA e alle app, con caching/versionamento. Testare autenticazione, autorizzazioni, errori API, upload, persistenza, rollback, aggiornamento offline e sicurezza. L'editor già sviluppato nei branch va verificato end-to-end, non presunto funzionante.

## Scientificità e fonti
La bibliografia generale NON prova un carattere di una singola scheda. Ogni carattere, confronto e claim deve avere riferimento specifico verificabile, con citazione puntuale/pagina quando disponibile. Fonti già fornite in conversazioni precedenti: MLG_158_2017.pdf, Promozione estesa[4656].pdf, manuale_funghi_full.pdf, Manuale-Conoscere-i-funghi.pdf, Manuale_funghi.pdf, FUNGHI-DISPENSA.pdf, Pineta_corsofunghi_Caratteri-di-riconoscimento-funghi.pdf, caratteri.pdf, Oppicelli-Funghi_In_Italia_Base_compressed.pdf. Questi file NON sono garantiti nel workspace Codex: richiederli se mancanti, non inventarne il contenuto. Esisteva una lista di 34 source_gap: recuperare l'inventario originario prima di dichiararli chiusi. Revisione da micologo qualificato per affermazioni diagnostiche e tossicologiche critiche; mai usare l'app come certificazione di commestibilità.

## UX/UI e didattica
Tre livelli progressivi (minimo, auspicabile, approfondimento) sia nella selezione dei taxa sia nella profondità della singola scheda. Schede organizzate per genere/gruppo; nome scientifico e comune, sinonimi chiaramente separati. Studio guidato 3+1 con confronti e spiegazione del perché un carattere è diagnostico. Mobile-first, iPhone 13 mini/320pt, leggibilità, accessibilità, tap targets, contrasto, tastiera, navigazione senza perdita dello stato, ricerca veloce, preferiti, ripresa studio. Layout fotografico coerente e confronti affiancati; distinguere sempre contenuto scientificamente validato da bozza o proposta. Eseguire test su device reale quando disponibile.

## Territorio, privacy, comunità
OpenStreetMap per la mappa; aree boschive e macroaree indicative, NON coordinate di fungaie certificate. Segnalazioni con foto/descrizione/coordinate da moderare; anonimizzazione, aggregazione spaziale ampia e ritardo temporale. Indicatori cercatori, recency e 'vai ora' devono esporre motivazioni e incertezza, non promettere ritrovamenti. Fonti locali per habitat, accesso e regole; normative aggiornate e distinte per territorio. Contributi scientifici documentati con moderazione, senza autopubblicazione. Backup/esportazione dei dati locali; non trasmettere coordinate o bozze senza consenso.

## Piano esecutivo Codex
1. INVENTARIO: fetch, branches, PR, CI, diff; individuare base migliore, salvare commit SHA e gap, proteggere dati e lavoro preesistente.
2. MODELLO: schema dati tassonomico, provenance per campo, 3 viste e licenze, workflow review, test invarianti.
3. CONTENUTI: compilazione documentata delle 148 unità e 66 gruppi o perimetro aggiornato verificato; batch piccoli con report quantitativi; no placeholder spacciati per contenuto.
4. FOTO: import web lecito e triade diagnostica per ogni scheda; audit licenze e determinazione; editor admin end-to-end.
5. UX: rifinitura studio progressivo e accessibilità mobile, test iPhone reale e Android.
6. TERRITORIO: verifiche delle fonti macroaree, privacy e avvertenze; non inferire produttività attuale da euristiche.
7. RELEASE: lint/typecheck/build, test browser e nativi, sicurezza, regressioni, backup, pubblicazione e verifica URL live.

## Definition of Done e comunicazione
Ogni lotto produce commit, test ripetibili, elenco file, prove, regressioni, limiti e stato dei contenuti. Non dichiarare 'tutte le schede complete' finché il validatore non attesta ogni campo e tre immagini per taxon, con licenze, attribuzione e tracciabilità. Non dichiarare 'scientificamente validato' senza revisione qualificata. Non dichiarare iOS pronto senza build firmata e test fisico. Prima di modifiche distruttive o merge complessi fare backup e proporre piano. Salvare frequentemente; non interrompere lasciando modifiche non committate.

## Prima istruzione per il nuovo agente
Leggi questo file e tutta la documentazione del repository. Confronta i branch recenti e identifica l'implementazione più avanzata. Produci un rapporto con matrice requisiti/implementato/testato/mancante e poi avvia lotti di completamento senza alterare la baseline stabile prima della verifica.