# Beta iOS completa su invito — requisiti del titolare

Il 29 ottobre 2026 il titolare richiede beta completa iOS per 90 giorni e sincronizzazione degli inviti Android con l'accesso Google Play. La build iOS 24 usa soltanto StoreKit: la demo Agaricus disabilita intenzionalmente la teoria. Un invito TestFlight non concede un diritto applicativo.

## Decisione tecnica

Riutilizzare il controller, il servizio e il pannello della beta Android PR131. Abilitare iOS soltanto con endpoint HTTPS e opzione esplicita compilata nel profilo `ios-managed-beta`. Un invito monouso verificato dal server concede 90 giorni dalla prima attivazione; scadenza, revoca e assenza di verifica online riportano alla demo. Un abbonamento Apple valido resta indipendente. Nessun flag locale premium. Web e profili iOS ordinari restano invariati.

Il servizio conserva già la durata, i token hash, la revoca e le concessioni; non creare un secondo database né rigenerare gli inviti esistenti. Il codice sessione resta in SecureStore. Il portachiavi iOS può sopravvivere alla reinstallazione: la scadenza dipende sempre dal server e la reinstallazione non riparte da 90 giorni. Progressi, bozze e preferiti non vengono cancellati dalla revoca.

Allo sblocco sono disponibili tutte le schede e i due esami; in demo il pulsante teoria deve spiegare il requisito e portare all'accesso, invece di ignorare il tocco. Il profilo beta non equivale a pubblicazione: prima di distribuzione occorrono gate nativi, StoreKit, accesso completo/revoca e prova su iPhone/iPad sullo SHA esatto. Nessuna modifica di contenuti scientifici, attestazioni, App Store o platee esistenti.

## Android: limite da risolvere

L'API Google Play non gestisce le liste di email individuali. Il gruppo gestito via API richiede Cloud Identity/Workspace e dominio verificato. Il titolare non li ha e ha chiesto di rimandare il dominio Stampa3DBologna. L'invio automatico della sola email non risolve questo requisito. Conservare questo blocco senza dichiarare sincronizzazione attiva, senza robot con password, senza un gruppo pubblico e senza iscrizione autonoma aggiuntiva.

## Alternative considerate

- Sblocco locale di tutte le build TestFlight: escluso, nessuna revoca individuale verificata.
- Acquisto sandbox come condizione per ogni tester: non soddisfa invito di 90 giorni.
- Servizio beta esistente con configurazione iOS esplicita: scelta dell'implementatore per preservare durata, revoca e StoreKit.

## Verifica

Prove Node server/controller e React montato: invito valido/errato, 90 giorni, foreground offline, revoca entro 60 secondi, storico conservato, teoria accessibile dopo invito, StoreKit indipendente, web/iOS produzione esclusi. TypeScript e suite completa. Compilazione e prove native restano necessarie e vanno riportate separatamente.

## Addendum del titolare: nessun pulsante demo nativo

Rimuovere in iOS e Android i pulsanti demo gratuita/anteprima gratuita da Studio e Accesso. Conservare apertura atlante per accesso completo verificato e comportamento web. Implementato con cinque test montati RED→GREEN; suite finale 373 PASS, TypeScript PASS. Revisione indipendente completata; corretto lo spazio JSX non valido nel footer nativo. Nessuna build distribuita.
