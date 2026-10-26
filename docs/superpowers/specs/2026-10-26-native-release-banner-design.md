# Avviso TestFlight e revisione indipendente

Mandato del titolare: rimuovere la scritta mostrata nello screenshot e procedere con la revisione indipendente. Esecuzione autonoma già richiesta.

La build nativa20 confronta lo SHA con release.json pubblico ancora riferito alla19. Il confronto di sola disuguaglianza non è un ordinamento delle build e non dimostra un aggiornamento. La beta del titolare non può promuovere il web pubblico: aggiornare quel sito per tacitare l'avviso violerebbe il perimetro autorizzato.

Scelta implementativa: il componente di allineamento è esclusivo del web; su iOS/Android non monta il controllo remoto e non rende il riquadro, neppure nel dettaglio abbonamento. La piattaforma TestFlight gestisce i propri aggiornamenti. Il controllo web e il suo aggiornamento manuale restano operativi. Non vengono modificati gate di rilascio, sicurezza, StoreKit o dati scientifici. Test sul rendering nativo e sulla conservazione del controllo web, TypeScript, rigenerazione, suite script, CI obbligatorie sullo SHA nuovo e nuova build interna.

Revisione indipendente: aggiornare il fascicolo documentale allo snapshot effettivo, con SHA/hash, lacune e modulo vuoto per decisioni per unità e campo. La scelta del revisore, il canale privato e l'acquisizione della risposta rimangono esclusivi dell'admin. Nessuna attestazione simulata, nessuna UI revisori nell'app e nessun invio autonomo. La certificazione effettiva resta dipendente da valutazione reale di un micologo qualificato e riconciliazione dei rilievi.
