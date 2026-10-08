# Guida ragionata — lotto 2 (8 ottobre 2026)

Fonte: Sitta, Davoli, Floriani, Suriano (2021), Regione Piemonte. URL: https://www.regione.piemonte.it/web/sites/default/files/media/documenti/2021-09/guida_commestibilita_funghi_isbn_979-12-200-9297-5.pdf

Sei taxa aggiunti al dataset sorgente src/data/study-profiles.json:
- Calocybe gambosa: commestibilità libera, pagina PDF 39.
- Clitocybe nebularis: sconsigliato, pagina PDF 24.
- Chlorophyllum rhacodes s.l.: sconsigliato, pagina PDF 24.
- Leucoagaricus leucothites s.l.: sconsigliato, pagina PDF 24.
- Coprinus atramentarius s.l.: non commestibile, pagina PDF 25 (corrispondenza di gruppo con nome usato dalla Guida da verificare tassonomicamente).
- Amanita excelsa s.l. (incl. A. spissa, A. franchetii): non commestibile, pagina PDF 33; la Guida tratta esplicitamente A. excelsa s.l. e A. franchetii.

Lotto precedente: cinque classificazioni su Hypholoma e Tricholoma; ricontrollare le pagine prima del rilascio.

Non sono attestati test automatici o rigenerazione del catalogo; eseguire npm run prepare:data, npm run test:release-readiness, typecheck, build web e controlli browser prima del merge. I campi odore/sporata restano da completare con fonti distinte. Nessun giudizio di commestibilità vale come determinazione di esemplari reali.
