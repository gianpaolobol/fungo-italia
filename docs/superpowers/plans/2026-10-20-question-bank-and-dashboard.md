# Banca domande e Dashboard percentuale — completamento richiesto

Il titolare ha richiesto il completamento della banca e la rifinitura del fungo già implementato, per comprendere avanzamento e preparazione nel tempo. Si prosegue sul ramo isolato del prossimo aggiornamento, senza modificare la revisione1.0.

## Scelte di attuazione
- Conservare gli89casi fotografici e tutti i requisiti fotografici, nomenclaturali e alimentari già presenti.
- Aggiungere casi di ripasso teorico per le59schede minime senza caso e le66schede aggiuntive. Domande esclusivamente sui testi già presenti nei campi caratteri, habitat, sporata e odore. Correttezza riferita esplicitamente alla scheda; alternative tratte da altre schede, non dichiarazioni micologiche inventate.
- Risposte, limiti dei gruppi ed esempi conservati integralmente. Ogni domanda porta IDscheda, campo canonico, hash del testo e riferimenti esterni quando già associati a quel campo. Il materiale interno non diventa una fonte indipendentemente revisionata.
- Non attribuire riconoscimento fotografico o conoscenza della commestibilità alle risposte teoriche. I125casi nuovi contengono328domande. Copertura delle schede e copertura fotografica sono dichiarate separatamente.
- Base: una sessione di15casi minimi, con quota atomica, pausa e ripasso. Percorso aggiuntivo escluso. Annuale: banca completa, sessioni illimitate e selezione adattiva. Nessun nuovo accesso Android/web.
- Riprendere i checkpoint fotografici precedenti soltanto dopo validazione sul vecchio banco esatto. Normalizzare l'evidenza della vecchia firma nota solo perché i casi fotografici restano invariati; altre revisioni rimangono archiviate e non qualificano la stima.
- La simulazione conserva15casi fotografici senza aiuti; i casi teorici entrano nell’allenamento. La stabilità richiede copertura e ripassi distanziati almeno all’80%, tre simulazioni autonome stabili, assenza di errori critici e indice almeno85. Checklist e stato usano gli stessi predicati.
- Fungo con riempimento continuo0–100 e numero centrale, testo equivalente per accessibilità, stato didattico prioritario per errori critici; nessuna probabilità di superamento inventata.
- Pulsante principale subito visibile. Due indicatori: preparazione dimostrata e copertura. Grafico cronologico ricostruito con lo stesso algoritmo e la banca attuale; specificare questo ricalcolo. Non inventare snapshot precedentemente non registrati.
- Dettagli e storico espandibili senza dipendere dalla validità dell'annuale; confronto solo fra prove autonome compatibili anche per composizione foto/teoria.

## Verifiche
Test RED→GREEN per copertura completa, integrità delle risposte canoniche, assenza di giudizi alimentari inventati, prova teorica senza falsa evidenza fotografica, selezione Base, migrazione, andamento temporale, riempimento fungo e priorità errori. TypeScript e export iOS. Revisione indipendente. Verifica visiva dei componenti reali via react-native-web a320/375/768px (sostituto parziale del controllo layout, non di iOS, VoiceOver o dispositivo fisico).

## Gate della distribuzione
Il precedente test nativo StoreKit sul commit f622962 è riuscito; UIiPhone su quel commit è fallita durante la verifica iniziale dei diritti. Il test deve passare senza aggirare StoreKit; log e recupero mediante il pulsante reale di aggiornamento aiutano a distinguere inizializzazione del simulatore e difetti applicativi. Rimangono separati configurazione prodotto Base, verifica operatore Apple, binario firmato e prova TestFlight.
