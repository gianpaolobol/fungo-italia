# Prova della fixture Apple per iOS27

Applicazione fissata al sorgente f16ddf79390d725a090f914c2b4d80757f5d2798, stesso candidato IPA27 già compilato/verificato; nessuna nuova build EAS, nessun submit o revisione scientifica.

Il gate invito iPad originale40967909459/job123776992134 ha compilato ma è fallito in4.430secondi con errore «unknown» prima del primo app.launch. Non dimostra un errore nel controllo di accesso. La nuova prova distingue con log di fase la creazione della sessione StoreKit dal successivo acquisto; registra dominio/codice NSError senza dati account o ricevute.

Ipotesi da verificare, non fix causale già attestato: avviare e attendere l’app prima di creare l’acquisto locale può dare alla fixture un contesto attivo. Il runner controlla il productID reale, termina l’avvio di preparazione e conserva i due avvii a freddo che attendono la notifica del vero entitlement attivo prima di richiedere demo/codice vuoto disabilitato/assenza di acquisto-ripristino alternativo.

Checkout app f16 immutato, runner distinto copiato solo nel progetto nativo generato ios/OperationTests. Il generatore originale è riusato con sola modifica del riferimento al file Swift del target UI; fixture Annual.storekit canonica invariata. Ricevuta separa sorgente app/operazione e hash del runner/fixture. Non rinomina il precedente fallimento e non attesta l’IPA già presente come nativamente qualificata prima dell’esito.

YAML, Bash e JS incorporato validati; revisione tecnica senza blocker. Ruby/Xcode eseguibili solo nel runner Mac: successo della prova non ancora attestato.
