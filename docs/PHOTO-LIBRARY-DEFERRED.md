# Caricamento e analisi Foto: funzionalità rinviata

Decisione esplicita del titolare del 22 ottobre 2026: conservare il codice e portarlo nelle versioni successive, mantenendo per ora caricamento e analisi delle fotografie **non accessibili dall’app**. Questa decisione sostituisce il precedente requisito di rendere raggiungibile PhotoLibrary prima della pubblicazione.

## Stato richiesto

- `App.tsx` non importa né monta `PhotoLibrary`; nessun pulsante, tab o deep link deve aprire il flusso Foto.
- La navigazione resta Percorso, Studio, Esame, Aree, con accesso all’abbonamento dal fungo in alto a destra.
- Non chiedere accesso alla libreria Foto nel normale utilizzo dell’app.
- Le fotografie già incluse nell’atlante e l’esame fotografico restano disponibili secondo i rispettivi diritti di accesso: il rinvio riguarda le fotografie personali da caricare o analizzare.
- La funzione rinviata non blocca questa release. Restano obbligatori gli altri gate tecnici, scientifici e Apple.

## Codice da conservare

| Percorso | Responsabilità |
|---|---|
| `components/PhotoLibrary.tsx` | Interfaccia di analisi locale, accesso limitato, pausa e ripresa, revisione dei lotti |
| `modules/fungo-photo-filter/` | Modulo iOS Photos e Apple Vision; miniature locali, niente download iCloud per analizzare |
| `src/localPhotoClassifier.ts` | Collegamento JavaScript al modulo nativo |
| `src/photoScan.ts` | Lotto massimo 20, una classificazione alla volta, checkpoint e manifest stabile |
| `src/reviewStorage.ts`, `src/visualReviewQueue.ts` | Persistenza e coda delle osservazioni, da mantenere senza cancellare bozze |
| `components/ThreePlusOneReview.tsx`, `components/ObservationPhotos.tsx` | Componenti correlati al ripasso delle osservazioni personali, anch’essi non montati dal flusso corrente |
| `scripts/photo-scan.test.mjs` | Regressioni lotti, pausa, ripresa, errori, persistenza e conferma |
| `scripts/photo-library-access.test.mjs` | Verifica del rinvio su App.tsx reale e sui quattro tab |
| `scripts/vision-photo-smoke.swift` | Prova separata del classificatore Apple Vision |

Conservare inoltre configurazione Expo/autolinking e dipendenze necessarie. Il fatto che il modulo nativo sia incluso non rende raggiungibile la funzione e non dimostra una validazione del flusso completo. Non avviare i vecchi workflow manuali di build/auto-submit Foto come scorciatoia per la produzione.

## Condizioni per una futura riattivazione

1. Nuova richiesta esplicita del titolare; PR dedicata, senza riattivazione automatica tramite aggiornamenti o flag remoti.
2. Ingresso e ritorno definiti nel flusso esistente, senza sostituire i quattro tab.
3. Prove iPhone e iPad con permesso negato, accesso limitato e accesso completo rifiutato; nessuna richiesta prima del gesto esplicito.
4. Verifica lotti massimi 20, pausa/background, ripresa dopo riavvio, errore di salvataggio, fotografie non disponibili localmente e conservazione di bozze/dati precedenti.
5. Verifica che non vengano inviati fotografie o coordinate; il filtro cerca possibili funghi e non determina specie o commestibilità.
6. Riconciliazione di privacy, descrizione App Store, schermate e note di revisione con il comportamento realmente distribuito.
7. Nuove prove obbligatorie sul commit definitivo e nuovo binario se richiesto dalle modifiche native.

Nessuna approvazione scientifica o disponibilità production viene attestata da questo documento.
