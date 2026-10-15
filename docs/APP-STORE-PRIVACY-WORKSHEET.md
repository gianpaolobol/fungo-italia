# Privacy App Store — Fungo Italia
15 ottobre 2026. Il titolare conferma che il questionario Apple non è ancora compilato. Non è stato modificato via API: questa funzione non è disponibile nell'API pubblica utilizzata.

Aprire https://appstoreconnect.apple.com/apps/6821140326/appPrivacy e scegliere “Inizia”. L'informativa è https://gianpaolobol.github.io/fungo-italia/privacy.html ; contatto approvato: gianpaolo.franceschini@gmail.com.

## Flussi verificati
- Preferiti, progresso e storico degli esami: sul dispositivo.
- Foto dell'atlante: asset inclusi. L'app nativa attuale non espone importazione Foto o modifica amministrativa.
- Mappe online: richieste a servizi cartografici esterni; non risulta accesso alla posizione GPS.
- Aggiornamenti Expo: EAS-Client-ID, piattaforma, runtime, ID degli aggiornamenti; dopo errori di avvio può essere inviato Expo-Fatal-Error. Le richieste di rete espongono l'indirizzo IP al fornitore.
- Non risultano SDK pubblicitari, account utente o acquisti in-app. Il pagamento dell'app è gestito da Apple.

Non selezionare automaticamente “Dati non raccolti”. Il questionario riguarda anche i partner e richiede di verificare l'effettiva conservazione/uso dei dati secondo le loro policy.

## Risposte da completare nel portale
Per gli identificativi tecnici conservati dal servizio aggiornamenti: **Identificatori → ID dispositivo**, finalità **Funzionalità dell'app**; non usati per tracciamento pubblicitario.
Per i dati di errore conservati dal servizio: **Diagnostica → Dati sugli arresti anomali / Altri dati diagnostici**, finalità **Funzionalità dell'app**; non usati per tracciamento pubblicitario.
L'associazione allo stesso identificatore di installazione va considerata nella risposta sul collegamento dei dati: Apple include anche il collegamento al dispositivo, non soltanto a un account nominativo. Non dichiarare anonimizzazione o separazione dell'identità senza verificarla.
Per eventuali log IP trattenuti dai fornitori, verificare la tipologia applicabile (altri dati / posizione approssimativa se viene effettivamente ricavata e conservata) e la finalità reale. La semplice assenza di permessi GPS non dimostra assenza di trattamento di rete.
Non dichiarare foto, contatti o dati finanziari raccolti dall'app solo perché l'utente possiede una libreria Foto, può scrivere all'assistenza esterna o paga Apple: distinguere i flussi effettivi.

Salvare e pubblicare il questionario dopo il controllo delle risposte. Nessuna password Apple, chiave, dato bancario o fiscale va inserito in questo documento.

Riferimenti:
- https://developer.apple.com/app-store/app-privacy-details/
- https://expo.dev/privacy
- https://github.com/expo/expo/blob/main/packages/expo-updates/ios/EXUpdates/AppLoader/FileDownloader.swift

## Riferimento del fornitore verificato il 15 ottobre 2026

La policy ufficiale Expo dichiara che, per EAS Update, può raccogliere sistema operativo del dispositivo e token casuali per determinare se è stato scaricato un aggiornamento; descrive inoltre dati di rete (IP), errori e metriche tecniche, con conservazione per il tempo necessario alle finalità del servizio. L'API Apple per `appDataUsages`, interrogata con la credenziale autorizzata, risponde 404 `PATH_ERROR`: il questionario resta un passaggio nel portale.

Schema prudente per la verifica nel portale: **ID dispositivo**, **dati sugli arresti anomali/altri dati diagnostici** e, per i log IP trattenuti, **altri tipi di dati**. Finalità: **Funzionalità dell'app**. Nessun impiego pubblicitario o tracciamento è implementato nell'app. Le richieste e la diagnostica possono essere associate alla stessa installazione: non dichiararle anonime solo perché non esiste un account nominativo. Controllare la corrispondenza con le definizioni Apple prima di pubblicare le risposte.
