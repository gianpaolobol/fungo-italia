# Dati dell’atlante

I riferimenti fondanti sono conservati una sola volta in `src/data/internal-foundations.json`: documento degli obiettivi tassonomici per inclusione, rango e struttura didattica; Guida ragionata alla commestibilità per valutazioni alimentari. Sono riferimenti interni, esclusi dalla biblioteca pubblica e dalle fonti visualizzate nelle schede.

Ogni unità conserva un collegamento interno al documento degli obiettivi e alla pagina pertinente. Gli identificatori restano stabili per non perdere preferiti e bozze. Le fonti esterne mantengono i riferimenti puntuali e l’ambito del contenuto supportato.

Il generatore elimina riepiloghi amministrativi ripetitivi, fonti di audit autoreferenziali, copie bibliografiche sovrapposte, valori null e nomi identici già presenti. Lo stato scientifico e il vincolo di evidenza per valutazioni alimentari sono centralizzati. Non sono attestati né una revisione micologica indipendente né giudizi alimentari pubblicati: la pulizia non modifica questi stati.

Restano i tre caratteri e il differenziante, nomi e sinonimi, rango, relazioni didattiche, habitat, confronti, 15 limiti diagnostici e 4 controlli specifici sul campo. I documenti e i checksum dell’esportazione storica servono alla ricostruzione verificabile dei dati; non fanno parte dell’interfaccia.

Le verifiche CI controllano rigenerazione, integrità dei collegamenti fondanti, assenza di audit nel dataset attivo, esclusione dei due riferimenti dall’esportazione web e conservazione dei controlli specifici.
