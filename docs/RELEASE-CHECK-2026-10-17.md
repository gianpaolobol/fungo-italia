# Fungo Italia — verifica GitHub, TestFlight e App Store del 17 ottobre 2026

## Risultato concreto

Alle **10:59 UTC** Apple ha confermato la build **1.0.0 (11)** nel gruppo interno **Proprietario — prova iPhone**, con stato **IN_BETA_TESTING**. Prima dell'intervento il gruppo conteneva solo le build 7, 5, 3 e 2: la 11, pur essendo VALID, non era distribuita a quel gruppo.

L'unico tester esistente è stato risolto confrontandone l'indirizzo, senza pubblicarlo, con il titolare dell'account App Store Connect (ACCOUNT_HOLDER e ADMIN). Non sono stati aggiunti tester, modificati gruppi esterni o selezionate build per App Store.

Evidenza e rilettura Apple: [workflow di assegnazione](https://github.com/gianpaolobol/fungo-italia/actions/runs/39026969842), artifact `Diagnostic-TestFlight-status`, ricevuta `owner-testflight-assignment.json`. L'esito non prova l'installazione sul telefono o un test di acquisto eseguito dall'utente.

## Allineamento verificato

| Elemento | Stato |
| --- | --- |
| Main | `2c077e74e43f398f25d2430ed8e202e5197d6111` |
| Binario Apple | 1.0.0 (11), `f15030a5-6079-4077-a09c-369431bd3547`, VALID |
| Sorgente del binario | `2c077e74e43f398f25d2430ed8e202e5197d6111`, ricevuta producer `38982998646` |
| Verifica nativa corrispondente | Run `38979804811`, PASS |
| UI corrispondente | Run `38980636163`, FAIL su iPhone e iPad alla verifica iniziale |
| Ricevuta di build | `storekitUIVerified:false`, `testFlightOnly:true` |
| Gruppo interno del titolare | Build 11 assegnata e riletta; un solo tester esistente |
| Gruppo esterno | Solo build 7, nessun tester; invariato |
| Versione App Store 1.0 | PREPARE_FOR_SUBMISSION, associazione ancora alla build 7 |
| Ultimo workflow OTA considerato | `38981233625`: verde, ma pubblicazione e tutti gli step successivi al gate risultano SKIPPED; nessun aggiornamento OTA attestato |

SHA-256 IPA registrato nella ricevuta: `afec718666c6bb578c781cbd7c8df57ddf732a9bd75e4c2d0fa7ddc4d94b824f`.

## StoreKit: cosa dimostrano le prove

La sostituzione di `Transaction.latest(for:)` con transazioni verificate di `currentEntitlements` è presente su main e nella build 11. Non basta però a dichiarare risolto il problema: le UI più recenti restano negative.

Il confronto diagnostico `39014174446` è fallito sia con il listener normale sia nella variante che ometteva soltanto il listener nel checkout temporaneo CI. L'ipotesi che basti rimuovere il listener non è sostenuta dall'esito. In entrambi i casi il pulsante risultava presente e raggiungibile, ma disabilitato. Le righe di avanzamento stampate dopo un'asserzione fallita non sono prove di PASS: il test e il run hanno conclusione FAIL.

Le risposte mancanti durante la sincronizzazione ricevute in storekitd restringono il problema al percorso StoreKit nel simulatore/app completa. Non provano un difetto su dispositivo fisico. Non si introducono ulteriori modifiche speculative o bypass della verifica. La build assegnata serve a raccogliere proprio il riscontro sul dispositivo reale.

## Icona

`assets/icon.png` su main e nella build 11 contiene ancora il semplice fungo precedente. L'icona approvata `fungo-italia-icon-1024.png`, con scritta leggibile, è stata recuperata e confrontata visivamente.

La [PR #106](https://github.com/gianpaolobol/fungo-italia/pull/106) contiene esclusivamente quel file, byte per byte. È un PNG RGB opaco 1024×1024; entrambi i test esistenti degli asset passano e confermano che la preparazione nativa non lo sovrascrive. Git blob: `fd2c1d6a0dc46fcb6fa00ea2dc0ae0d8c99851f3`.

La PR non è ancora su main. La build 11 non può ricevere una diversa icona con un semplice aggiornamento OTA: occorre un successivo binario firmato. Non viene attestato un aggiornamento del logo sul telefono.

## Requisiti App Store

L'audit Apple aggiornato alle 10:51 UTC conferma:

- Download gratuito; prodotto annuale `it.fungoitalia.premium.annual`, prezzo Italia **9,99 EUR**, stato **READY_TO_SUBMIT**.
- URL Privacy presente nella localizzazione italiana: `https://gianpaolobol.github.io/fungo-italia/privacy.html`.
- URL Assistenza presente, descrizione annuale e screenshot caricati.
- Italia e altri 26 territori UE riportano ancora **TRADER_STATUS_NOT_PROVIDED**.
- Il questionario Privacy non è verificabile dall'endpoint API usato, che restituisce PATH_ERROR; non viene dichiarato compilato.
- Il primo abbonamento richiede l'invio insieme al binario tramite il portale Apple. Nessun invio o approvazione è stato effettuato.
- Il portale App Store Connect richiede un nuovo accesso nel browser disponibile: controllo del questionario Privacy, dettagli DSA e accordi rimangono subordinati all'accesso del titolare. Nessuna dichiarazione o accettazione legale viene inventata.

## Gate scientifico

Il comando `node scripts/release-readiness.mjs --strict` è stato eseguito e ha restituito exit 1, per blocchi di contenuto previsti dal gate. Nel suo ambito `catalog`: 148 schede, 66 gruppi; 143 triplette fotografiche complete, odore 148, sporata 146, commestibilità 147; nessuna attestazione di revisione indipendente, 148 schede bloccate. Sono conteggi del catalogo analizzato e delle evidenze gestite da questo controllo, non un giudizio inventato sulle ulteriori fonti interne.

## Verifiche e limiti

- 6 test del controllo di assegnazione e 6 controlli esistenti di policy/configurazione/linking: PASS.
- 2 test degli asset eseguiti sui byte dell'icona approvata: PASS.
- Script Node e sintassi del workflow di assegnazione: verificati.
- Rilettura Apple dopo l'assegnazione: build 11 presente nel gruppo corretto, IN_BETA_TESTING.
- UI StoreKit, revisione scientifica, questionario Privacy, DSA e pubblicazione: **non completati o non superati**, secondo i limiti sopra indicati.

La build diagnostica non è una pubblicazione approvata e non sostituisce i controlli di rilascio.
