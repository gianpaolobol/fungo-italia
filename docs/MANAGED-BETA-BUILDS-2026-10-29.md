# Build beta gestite — 29 ottobre 2026

Sorgente compilato: `c524b695d51c5e21eb488c564089c0206dd5caad`, ramo `feat/managed-beta-build-20261029`, PR133 sopra PR132. Nessuna modifica a main. La distinta scientifica esistente consente soltanto la beta interna del titolare; `independentReleaseReady=false` e `appStoreReady=false`.

## Binari

- iOS1.1.0(25): EAS `5e4a1bf3-cb88-44af-a642-f9982532e619`, **FINISHED**. [Build EAS](https://expo.dev/accounts/gianpaolobol/projects/fungo-italia-/builds/5e4a1bf3-cb88-44af-a642-f9982532e619). IPA scaricata; SHA256 `a4bcc701bd2d0dafff0ed0d175a7792cf0696326090075e7f103a3a31de053dc`. Verificati nel file: bundleID `it.fungoitalia.app`, versione/build, sorgente c524b69, dirty=false, betaIOS=true, endpoint HTTPS del portale, canale `ios-managed-beta`. EAS attesta la compilazione firmata; non è un controllo codesign su macOS locale.
- Android1.1.0(6): EAS `396bcba9-1be4-41b6-9d39-12e4b7feaa4f`, **FINISHED**. AAB scaricato; SHA256 `d6b008b2dd778b540ce6b248ef1a9b28d483351d3ea068a29dfe2c8ad17bdb3c`. Verificati sorgente c524b69 e dirty=false nella configurazione incorporata, endpoint corretto e opzione iOS assente. [Build EAS](https://expo.dev/accounts/gianpaolobol/projects/fungo-italia-/builds/396bcba9-1be4-41b6-9d39-12e4b7feaa4f). Chiave Android remota esistente selezionata; nessuna nuova chiave attestata.

[Workflow delle build private](https://github.com/gianpaolobol/fungo-italia/actions/runs/40943558381): controllo sorgente e servizio beta PASS. Nessun auto-submit, upload Apple/Play o OTA.

## Prove sullo stesso SHA

- Locale: 373 Node PASS, zero fallimenti/skip; TypeScript PASS, prepare:data senza drift. YAML/shell/Python validi e revisione tecnica del delta senza rilievi bloccanti.
- [Android40943327515](https://github.com/gianpaolobol/fungo-italia/actions/runs/40943327515): qualifica, APK/AAB diagnostici e smoke emulatore35 PASS; avvio offline, ricerca Agaricus, preferiti conservati, aree, test limitato e assenza dei pulsanti demo verificati. Beta-smoke live e seconda firma del workflow diagnostico SKIPPED: non presentarli come prove complete. Il binario diagnostico non è quello da caricare su Play.
- [StoreKit40943327350](https://github.com/gianpaolobol/fungo-italia/actions/runs/40943327350): PASS, test nativo reale acquisto verificato/rimborso/scadenza, zero errori.
- [UI acquisti40943327845](https://github.com/gianpaolobol/fungo-italia/actions/runs/40943327845): iPhone e iPad PASS. Due test effettivi per dispositivo, inclusi Agaricus/mappa e ciclo acquisto/ripristino/rimborso/scadenza; il probe diagnostico dedicato è saltato intenzionalmente (1 skip).
- [Demo separata40943327699](https://github.com/gianpaolobol/fungo-italia/actions/runs/40943327699): prima esecuzione iPad PASS, iPhone FAILURE alla mappa online, dopo il singolo recupero previsto dal test. Screenshot: cartografia bianca, errore cartografia, elenco/filtri disponibili. La stessa funzione testAFreeAgaricusDemoWithoutPurchase è passata su iPhone nella UI acquisti; componenti mappa invariati rispetto a main. Non è dimostrata una causa certa del caricamento remoto. Una sola ripetizione del job iPhone sul medesimo SHA è in corso, senza cambiare codice, timeout o criteri. Conservare anche l’esito negativo originale.

## Consegna

Nessuna nuova disponibilità TestFlight o Google Play attestata. Prima di distribuire: verificare esito finale del controllo demo ripetuto e ricevute effettive; qualificare l’attivazione beta su binario compatibile e verificare la platea autorizzata. Non riutilizzare ricevute delle build24/5.

I pulsanti demo gratuita sono assenti nel sorgente iOS/Android; l’accesso completo richiede ancora abbonamento o invito verificato. L’invito TestFlight da solo non conferisce il completo. Il portale non è stato ripubblicato e la sincronizzazione email→autorizzazione Play resta bloccata dall’identità Google gestita/dominio verificato mancanti. `stampa3dbologna.com` resta rinviato.
