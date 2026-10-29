# Beta solo con codice personale

Richiesta esplicita del titolare del29/10/2026 dopo la prova della25 sul suo iPhone: nelle build beta iOS e Android lo sblocco completo deve dipendere esclusivamente dall’invito personale e dall’inserimento del codice email. L’iscrizione TestFlight/Play abilita il download, non i contenuti. Scelta già specificata dal titolare; esecuzione diretta sullo stack esistente, senza introdurre autenticazioni o dipendenze nuove.

- [x] Riprodurre con App montata il bypass tramite abbonamento precedente, su iOS/Android.
- [x] Dare precedenza esclusiva alla concessione beta verificata nelle build gestite; revoca/scadenza prevalgono sull’abbonamento.
- [x] Schermata beta con solo invito e link legali; nessun acquisto/ripristino come percorso alternativo.
- [x] I link aprono il modulo, senza riscatto automatico. Una credenziale già attivata resta verificata dal server al riavvio; non si richiede un nuovo codice a ogni apertura.
- [x] Regression suite locale e TypeScript, dati/scienza senza drift.
- [x] Preparare prova nativa iPhone/iPad con transazione annuale locale già presente; qualifiche ordinarie separate sullo stesso sorgente.
- [ ] Revisione indipendente tecnica del delta.
- [ ] Eseguire le verifiche native e compilare nuovi candidati privati.
- [ ] Solo dopo prove native/binarie sullo SHA esatto valutare distribuzione negli scope già autorizzati. Non dichiarare modificata la25 esistente.

Non vengono modificati i contenuti scientifici, l’attestazione del titolare o l’automazione email→Play. La beta resta diagnostica, senza certificazione indipendente e senza prontezza App Store. Gli inviti sono credenziali personali revocabili: la lista tester degli Store è un controllo di distribuzione distinto e non è interrogabile dall’app come identità del possessore del codice.
