# Autorizzazioni del proprietario — beta a revisione primaria (2026-10-09)

## Autorizzato
1. Riconciliare e importare i 25 lotti bibliografici, **solo per i singoli campi con fonti puntuali, corrispondenza tassonomica e stato editoriale verificati**.
2. Conservare divergenze bibliografiche con attribuzione della fonte; non appiattire dati discordanti.
3. Gestire generi, sezioni, complessi e aggregati senza estendere indebitamente dati di specie.
4. Completare commestibilità e tossicologia con verifiche specifiche e nessuna inferenza di sicurezza alimentare.
5. Completare e revisionare immagini, licenze, gestione amministratore e inquadrature.
6. Correggere codice del generatore, esposizione delle fonti, test browser e coerenza sorgente → build → UI.
7. Inserire una nota informativa discreta in una sezione Informazioni → Avvertenze micologiche, **non visibile nelle pagine principali, senza banner o popup**.

## Esplicitamente NON autorizzato
- Merge del branch su main.
- Deploy o pubblicazione della beta, modifica della release pubblica.
- Attestazione automatica di revisione micologica indipendente.
- Approvazione implicita di ogni singola proposta controversa o priva di fonte adeguata.

## Nota autorizzata
«Fungo Italia è un progetto didattico e divulgativo attualmente in fase beta, con contenuti soggetti a revisione e aggiornamento. Le informazioni sulle specie, comprese quelle relative alla commestibilità, hanno esclusivamente finalità di studio e non costituiscono una certificazione di riconoscimento. L'identificazione dei funghi destinati al consumo deve essere effettuata da personale micologico qualificato, attraverso i servizi competenti.»

## Esito della prima ricognizione tecnica
- Il dataset src/data/external-study-evidence-candidates.json contiene proposte con administratorReview.status=approved, ma talvolta anche altre note di revisione ancora pendente. **Non promuovere automaticamente i conflitti**.
- scripts/approved-external-study-evidence.mjs attualmente importa i record se administratorReview.status=approved e se sono presenti fonti HTTPS/localizzatori; non controlla tutte le note di revisione secondaria.
- scripts/prepare-mobile-data.mjs e web/build.mjs applicano i dati in fasi diverse. Verificare uguaglianza dei valori e delle citazioni nel JSON generato.
- web/public/index.html espone quattro tab principali (Studio, Aree, Note, Contributi), ma non una sezione Informazioni dedicata. La nota non va inserita nella Home o nei tab principali.
- Il generatore web scrive dist-ios/data.json. Il workflow scientifico verifica anche web/public/data.json: verificare che i controlli confrontino l'artefatto corretto.
- Non attestare test PASS finché non siano eseguiti.

## Criteri di accettazione
- Report diff per taxon/campo: presente, nuovo importabile, discordante, gruppo non generalizzabile, fonte insufficiente.
- Nessuna modifica silenziosa a valori già approvati.
- Provenienza e licenza delle foto, verifica del soggetto e tre viste per scheda.
- Test del generatore, browser, payload pubblico, coerenza dataset/PWA e regression test iPhone.
- Stato beta: HOLD fino a conferma esplicita del proprietario.
