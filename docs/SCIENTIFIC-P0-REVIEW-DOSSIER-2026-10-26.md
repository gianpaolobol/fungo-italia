# Fungo Italia — dossier P0 di verifica scientifica

Fonte: `src/data/catalog.json` al commit `c72fe8cf35eb16c9f2fb9f5329346d0be950a867`. Registro di triage **non** equivalente ad approvazione micologica. Ambito: sole unità del documento fondante S1 già presenti nell'atlante. **Non aggiungere nuovi taxa**.

| Unità ammessa | Habitat | Sosia | Fonte S2 della commestibilità | Viste registrate | Revisione indipendente |
|---|---|---|---|---|---|
| Amanita phalloides | Presente; verificare | Presente; verificare | p. 31 | lateral, top, underside | Non attestata |
| Amanita virosa | Mancante | Mancante | p. 31 | lateral, underside, top | Non attestata |
| Cortinarius orellanus | Presente; verificare | Mancante | p. 48 | lateral, top, underside | Non attestata |
| Entoloma sinuatum | Mancante | Mancante | p. 53 | underside, top, lateral | Non attestata |
| Galerina marginata group | Mancante | Presente; verificare | p. 56 | top, underside, lateral | Non attestata |
| Gyromitra esculenta | Presente; verificare | Mancante | p. 142 | lateral, top, underside | Non attestata |

## Evidenze da ispezionare, senza promozione automatica

### Amanita phalloides
- ID: `minimum-card-objective-amanita--01--amanita-phalloides`.
- Habitat: ISPRA 158/2017, p. 49: Boschi di latifoglie, più raramente conifere; periodo indicato agosto–novembre..
- Confronti: Amanita caesarea: confronto bibliografico riferito allo stadio di uovo. / Amanita caesarea negli ovoli chiusi: il solo involucro esterno non consente un’identificazione affidabile. / Russule verdi: confrontare struttura della carne e presenza di volva e anello; esaminare anche la base integra..
- Riferimenti già indicizzati per habitat/confronti:
  - Sitta micotossicologia Amiata 1.10.25.pdf, p. 9; ambito: lookalikes; https://drive.google.com/file/d/1gIqusMIlu44WM8IQFf23kNIhIv4HsVaK/view
  - Sitta micotossicologia Amiata 1.10.25.pdf, p. 5; ambito: lookalikes; https://drive.google.com/file/d/1gIqusMIlu44WM8IQFf23kNIhIv4HsVaK/view
  - Funghi comuni. Caratteristiche principali, sosia e aspetti tossicologici, p. 49 (PDF 52); ambito: habitat; https://www.isprambiente.gov.it/files2017/pubblicazioni/manuali-linee-guida/MLG_158_2017.pdf

### Amanita virosa
- ID: `minimum-card-objective-amanita--03--amanita-virosa`.
- Habitat: non valorizzato.
- Confronti: non valorizzati.
- Riferimenti già indicizzati per habitat/confronti:
  - Nessuna evidenza puntuale registrata per questi campi.

### Cortinarius orellanus
- ID: `minimum-card-objective-cortinarius--01--cortinarius-orellanus`.
- Habitat: Boschi di latifoglie..
- Confronti: non valorizzati.
- Riferimenti già indicizzati per habitat/confronti:
  - Cortinarius 2026 - Baselga di Piné 09-26.pdf, p. 36; ambito: habitat; https://drive.google.com/file/d/1ok-z5Wsxf0CwQ7gCy7Ne4YqK1NpmLeqH/view

### Entoloma sinuatum
- ID: `minimum-card-objective-entoloma--01--entoloma-sinuatum`.
- Habitat: non valorizzato.
- Confronti: non valorizzati.
- Riferimenti già indicizzati per habitat/confronti:
  - Nessuna evidenza puntuale registrata per questi campi.

### Galerina marginata group
- ID: `minimum-card-objective-galerina--01--galerina-marginata-group`.
- Habitat: non valorizzato.
- Confronti: Kuehneromyces mutabilis: controllare ogni esemplare, anche all’interno dello stesso cespo..
- Riferimenti già indicizzati per habitat/confronti:
  - PRIMAVERILI (2).pdf, Diapositiva «Kuehneromyces mutabilis»; ambito: lookalikes; https://drive.google.com/file/d/1598gJqWSZ_Ylop0wmmm1tKfhlLttlrIm/view

### Gyromitra esculenta
- ID: `minimum-card-objective-gyromitra-incluso-discina--01--gyromitra-esculenta`.
- Habitat: ISPRA 158/2017, p. 149: Terreni acidi sotto conifere, anche disturbati o bruciati; fruttificazione primaverile..
- Confronti: non valorizzati.
- Riferimenti già indicizzati per habitat/confronti:
  - Funghi comuni. Caratteristiche principali, sosia e aspetti tossicologici, p. 149 (PDF 152); ambito: habitat; https://www.isprambiente.gov.it/files2017/pubblicazioni/manuali-linee-guida/MLG_158_2017.pdf

## Azioni di validazione obbligatorie

1. Aprire la fonte originale per ogni affermazione e controllare taxon/rango, contesto e pagina; compilare soltanto dati supportati e compatibili con S1.
2. Per tossicità e commestibilità consultare S2 alla pagina indicizzata; la presenza di una pagina è un riferimento, **non** una conferma dell'interpretazione.
3. Per ogni immagine controllare taxon, parte anatomica, autore, licenza e permesso di redistribuzione; le tre viste registrate non provano i diritti.
4. Raccogliere verbale di revisione indipendente reale (nome e qualifica, data, ambito, esito). Solo dopo integrare il campo di attestazione, senza autocertificazione del software.
5. Rigenerare i dati, confrontare il registro prima/dopo, lanciare `node scripts/release-readiness.mjs --strict` e i test CI obbligatori. Mantenere il gate attivo.
