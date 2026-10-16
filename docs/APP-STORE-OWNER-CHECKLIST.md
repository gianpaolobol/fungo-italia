# Fungo Italia — ultimi passaggi nel portale Apple

Configurazione richiesta: download gratuito; abbonamento annuale a rinnovo automatico **9,99 € in Italia**, con prezzi locali negli altri territori. Questo documento non attesta l’approvazione o la pubblicazione.

## 1. Privacy dell’app
Apri https://appstoreconnect.apple.com/apps/6821140326/appPrivacy .
Compila il questionario usando i [riscontri tecnici](APP-STORE-PRIVACY-WORKSHEET.md), salva e premi **Pubblica**. Il questionario era ancora vuoto secondo l’ultima conferma del titolare. Le API collegate a questa sessione non lo leggono e non lo modificano.

Non scegliere automaticamente “nessun dato raccolto”: occorre considerare gli aggiornamenti Expo e i relativi dati tecnici secondo le definizioni Apple. Gli acquisti StoreKit vengono verificati sul dispositivo; lo sviluppatore non riceve le ricevute su un proprio server.

## 2. Dichiarazione DSA
Apri App Store Connect → **Business → Agreements → Compliance → Digital Services Act**.
Scegli lo stato che corrisponde effettivamente alla tua attività e completa i recapiti e le verifiche eventualmente richiesti. La lettura Apple del 16 ottobre segnala **TRADER_STATUS_NOT_PROVIDED** nei territori UE. La dichiarazione può essere completata da Account Holder o Admin; la scelta dello stato legale non può essere inventata dall’assistente.

[Guida ufficiale Apple](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements).

## 3. Accordo per vendite e abbonamenti
In **Business → Agreements**, verifica che **Paid Apps** risulti **Active**, con le informazioni fiscali e bancarie richieste completate. Serve anche quando il download dell’app è gratuito ma contiene acquisti. L’eventuale accettazione dell’accordo richiede l’Account Holder.

Questa sessione non ha verificato lo stato dell’accordo. `CANNOT_SELL` su un’app non pubblicata non dimostra, da solo, un contratto mancante. Non condividere password Apple, codici di verifica o dati bancari nella chat.

[Guida ufficiale Apple](https://developer.apple.com/help/app-store-connect/manage-agreements/sign-and-update-agreements/).

## 4. Prima revisione dell’abbonamento insieme all’app
Solo dopo la verifica tecnica del nuovo binario e il completamento dei punti precedenti:
- In Fungo Italia → **Monetization → Subscriptions**, aggiungi alla revisione il prodotto **Fungo Italia annuale** e il relativo gruppo.
- Nella stessa bozza di invio includi la versione **1.0**, con il nuovo binario verificato che contiene StoreKit; la vecchia build **7** non contiene gli acquisti.
- Controlla che app, gruppo e abbonamento siano nella medesima submission, poi invia alla revisione.

Il primo abbonamento deve essere inviato con un binario tramite il portale; l’automazione API per sottoscrizioni successive non sostituisce questo passaggio iniziale.

[Guida ufficiale Apple](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase/).

Lo stato **READY_TO_SUBMIT** del prodotto significa pronto per l’invio, non approvato o già acquistabile. Anche una build disponibile su TestFlight non è pubblicazione sull’App Store. Il [registro tecnico](APP-STORE-SUBSCRIPTION-2026-10-16.md) distingue configurazione, prove eseguite e limiti ancora aperti.
