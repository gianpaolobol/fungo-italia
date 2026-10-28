# Google Play annuale — specifica esecutiva

Mandato della sessione: estendere ad Android la demo Agaricus e l'annuale da 19,99 EUR; preparare il test interno Play. Scheda Play creata, package `it.fungoitalia.app`. Non pubblicare produzione, web, iOS o OTA.

Approcci: un SDK commerciale aggiungerebbe un fornitore e un account; una verifica solo locale non offre una data di scadenza autorevole. Scelta tecnica dell'implementatore: estendere il modulo Expo esistente con Play Billing nativo e un piccolo servizio Node verificatore, separato e configurabile. Nessun costo/hosting o accesso Google aggiuntivo viene attivato implicitamente.

Contratto: prodotto `it.fungoitalia.premium.annual`, base plan `annual`, un anno rinnovabile senza offerta di prova. Prezzo letto dal Play Store; configurazione Italia 19,99 EUR nel portale dopo primo caricamento. Restano identici demo, storico locale, dati scientifici e iOS StoreKit. Nessun account condiviso Apple/Google introdotto in questo lotto.

Android legge solo acquisti posseduti da Play, ignora pending, verifica token sul server via HTTPS, riconferma acquisti tramite server e riceve scadenza autorevole. Il server legge subscriptionsv2, controlla prodotto/piano/stato/scadenza e non espone credenziali o token nei log. Nessun flag locale sblocca premium. Rinnovo cancellato conserva accesso fino a scadenza; revoca, hold, pausa e scadenza lo negano. Errori/rete negano accesso; offline premium Android rimandato, demo e storico restano offline.

Acquisti disabilitati senza endpoint HTTPS compilato e servizio disponibile. Servizio non distribuito senza credenziali/hosting autorizzati. Primo AAB di bootstrap può contenere Billing ma nessun acquisto disponibile. Firma di caricamento stabile obbligatoria; nessun AAB debug caricato. Le credenziali Android EAS devono esistere; il fallimento non va trasformato in successo. Test interni soltanto dopo gate pertinenti; produzione resta soggetta ai test Google e ai vincoli scientifici.
