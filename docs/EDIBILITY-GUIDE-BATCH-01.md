# Commestibilità — lotto documentato 2026-10-08

Fonte vincolante: Sitta, Davoli, Floriani, Suriano (2021), *Guida ragionata alla commestibilità dei funghi*, Regione Piemonte, https://www.regione.piemonte.it/web/sites/default/files/media/documenti/2021-09/guida_commestibilita_funghi_isbn_979-12-200-9297-5.pdf

Sono stati aggiunti a src/data/study-profiles.json cinque profili prima assenti: Hypholoma lateritium (p. 62), H. fasciculare (p. 62), Tricholoma terreum (p. 91), T. portentosum (p. 91), T. equestre (p. 88). I numeri di pagina sono quelli del PDF (1-based). Le qualificazioni sono riferite alla Guida del 2021, non a un'autorizzazione al consumo di esemplari.

L'integrazione è nel dataset sorgente: occorre eseguire npm run prepare:data per rigenerare src/data/catalog.json e web/public/data.json, quindi test e build. Nessun merge fino alla verifica di rigenerazione e regressione.

Il validatore ora espone la presenza dei tre campi per ciascun taxon. Restano numerose lacune: non usare classificazioni di genere per specie non trattate, non compilare con placeholder, non interpretare il dato bibliografico come revisione indipendente.
