> **Snapshot storico:** audit di main `6aa6848`, precedente al consolidamento. Il modello vigente è download gratuito, demo Agaricus (7 schede catalogo + 1 genere e test ripetibile di 4 casi), unico annuale completo a 19,99 €. Le proposte Base + annuale sono superate. Per stato corrente, selezione e prove vedere [BRANCH-SELECTION-2026-10-21.md](BRANCH-SELECTION-2026-10-21.md). Le ipotesi StoreKit non sono cause dimostrate. Esiste autorizzazione del titolare in `docs/reference-image-permission.md`: la catena dei diritti non è stata verificata indipendentemente; non equivale a un accertamento di uso non autorizzato. La ricerca per prefisso è un contratto testato; substring è una proposta, non una correzione. I conteggi delle fonti esportate non dimostrano l'assenza nei registri canonici. I test completi sono già eseguiti anche da `store-build.yml`.

# Audit delle immagini e dei diritti — 21/10/2026

Perimetro: tutte le `referenceImages` di `src/data/catalog.json` (148 schede) e `src/data/groups.json` (66 schede); file in `web/public/images/reference/`; mappatura in `src/data/reference-image-assets.ts`; uso in `components/ReferencePhotos.tsx` e `components/PhotoExam.tsx`.

> Questo non è un parere legale. Le classi di licenza sono ricavate da `licenseUrl` e `credit`. La corrispondenza fra foto e taxon è stata verificata **solo sui metadati** (`subjectTaxon`), non guardando le fotografie: una revisione visiva delle 630 immagini resta da fare.

## Risultati generali

| Misura | Valore |
|---|---|
| Riferimenti fotografici | 630 (schede 435, gruppi 195) |
| File su disco / file unici per SHA-256 | 630 / 502 (128 duplicati identici fra genere e specie, 34,6 MB) |
| Peso totale | 160 MB, tutti inclusi nel bundle nativo tramite `require` |
| File mancanti | 0 |
| Viste mancanti | 12: *Phlegmacium variiforme* e *Entoloma saundersii* senza foto; *Ramaria formosa*, *R. pallida*, *R. botrytis* e gruppo *Ramaria*, *Morchella*, *Verpa* senza una vista |
| Lato corto < 400 px | 51 (es. *Amanita caesarea* “sotto” 192 px; *Polyporus umbellatus* “fianco” 209 px) |
| Triadi con foto di fonti diverse (corso + esterna) | 36 schede: le tre viste ritraggono esemplari diversi |
| `subjectTaxon` diverso dal nome della scheda | 107 riferimenti (in gran parte legittimi: specie esempio di un gruppo) |

## Classi di diritti

| Classe | Riferimenti | Stato proposto | Motivo |
|---|---|---|---|
| Ritagli da dispense e PDF di corso (`credit` “Fonte: …, p. N”, nessuna `licenseUrl`) | **379** | **NON PUBBLICABILE** in un'app commerciale finché mancano liberatorie scritte degli autori | Spesso “attribuzione individuale non specificata”; l'unica autorizzazione registrata (`docs/reference-image-permission.md`) è una dichiarazione del titolare dell'app, non dei fotografi titolari dei diritti |
| CC BY 4.0 | 219 | AUTORIZZATA con obblighi | Richiede un'attribuzione visibile; i ritagli sono opere derivate da indicare (“ritaglio”) |
| CC BY-SA | 22 | AUTORIZZATA con obblighi | Il ritaglio va rilasciato con la stessa licenza; compatibile con app a pagamento, ma l'obbligo va dichiarato |
| CC0 | 3 | AUTORIZZATA | — |
| `licenseUrl` non standard (fws.gov: 4; balearica.uib.cat: 3) | 7 | INCERTA | Pagina di licenza non CC: verificare i termini (le opere di dipendenti federali USA sono di norma di pubblico dominio, ma va confermato per singola foto) |

**Per scheda**: 104 su 148 schede hanno almeno un'immagine non pubblicabile; 41 hanno solo immagini CC; 1 ha immagini con licenza incerta; 2 non hanno immagini. Gruppi: 48 su 66 non pubblicabili.

**Documenti di origine delle immagini da corso** (numero di riferimenti): N. Sitta, *Tricholomataceae* (92); N. Sitta, *Micotossicologia Amiata* (44); N. Sitta, *Genere Amanita* (41); N. Sitta, *Il genere Tricholoma* (41); E. Suriano, *Primaverili* (31); N. Sitta, *Boletales* (24 + 19); E. Suriano, *Inquadramento Agaricus* (19); D. Palumbo, *Boletacee Lagonegro* (19); A. Missanelli (13); *Cortinarius 2026 — Baselga di Piné* (12); M. Floriani, *Il genere Russula* (9); C. Perini (9); N. Sitta, *Boletus s. str.* (6). Nei crediti compaiono come fotografi anche L. A. Parra, M. Faraoni, Angelini, Golzio, De Ruvo, Marcacci. Ognuno di loro, o chi ne detiene i diritti, deve concedere per iscritto l'uso commerciale, il ritaglio e la ridistribuzione nel repository pubblico.

## Problemi

| ID | Gr. | Problema | Evidenza | Soluzione | Accettazione |
|---|---|---|---|---|---|
| IMG-01 | **P0** | 379 immagini senza licenza degli autori in un'app a pagamento e in un repository pubblico | Vedi sopra | (a) Liberatoria scritta con modello unico per autore (uso commerciale, ritaglio, repository pubblico, durata, revoca), registrata in `src/data/reference-image-evidence.json`; (b) in alternativa, sostituzione con CC0/CC BY; (c) intanto, flag `publishable:false` che esclude gli asset dal bundle di produzione | Gate: 0 asset con `publishable!==true` nel bundle di produzione |
| IMG-02 | **P0** | Il repository pubblico ridistribuisce già le 379 immagini e i ritagli | `web/public/images/reference/` su GitHub e GitHub Pages | Valutare un repository privato per gli asset, oppure la rimozione finché le liberatorie non arrivano | Decisione del titolare messa per iscritto |
| IMG-03 | P1 | Nell'esame le foto CC BY appaiono senza attribuzione | `components/PhotoExam.tsx` (nessun `credit` mostrato) | Mostrare autore e licenza nel feedback dopo ogni risposta | Revisione UI |
| IMG-04 | P1 | Triadi composte da esemplari e fonti diverse in 36 schede, anche quando i soggetti hanno nomi diversi (es. *T. equestre* “s.l.” + “T. equestre”) | Inventario sotto | Preferire triadi dello stesso esemplare; se non possibile, indicarlo nella didascalia | Ogni triade ha `specimenId` comune, oppure un'etichetta “esemplari diversi” |
| IMG-05 | P1 | Soggetti non rappresentativi | *Pleurotus ostreatus*: coltivato PH11; *Pleurotus cornucopiae / citrinopileatus*: 3 foto di *P. citrinopileatus*; *Lactarius* sez. *Deliciosi*: “deliciosus group (North America)”; *Agaricus* sez. *Sanguinolenti*: *A. benesii* + *A. sylvaticus* | Sostituire con esemplari spontanei europei | Revisione micologica visiva |
| IMG-06 | P1 | 51 immagini sotto i 400 px: i caratteri diagnostici non si leggono con lo zoom (fino a 400% nel visore) | Elenco nell'inventario (⚠︎) | Sostituire o riprendere da originali in alta risoluzione | Minimo 800 px sul lato corto |
| IMG-07 | P2 | 34,6 MB di duplicati e 160 MB di bundle | Hash identici fra genere e specie (128 file) | Deduplicare per hash nella mappatura `reference-image-assets.ts`; ricomprimere | Bundle ridotto di almeno il 20% |
| IMG-08 | P2 | Miniature con `resizeMode="cover"`: volva, anello e base possono essere tagliati | `components/ReferencePhotos.tsx` | `contain` con fondo neutro, oppure un punto focale per immagine | Revisione visiva |
| IMG-09 | P2 | I metadati non registrano autore, data, revisore e licenza come campi strutturati per le immagini da corso | Solo `credit` in testo libero | Schema: `author`, `license`, `permissionId`, `reviewedBy`, `reviewedAt`, `specimenId` | `validate-reference-images.mjs` esteso a questi campi |

**Funzionamento offline**: tutte le immagini sono incluse nel bundle (`require`), quindi l'atlante e l'esame funzionano offline. La mappa delle Aree e i link alle fonti no.

## Inventario per taxon

Formato delle celle: classe di licenza e lato corto in px (⚠︎ < 400 px). Classi: CORSO = ritaglio da dispensa, BY / BY-SA / CC0 = Creative Commons, IGNOTA / USFWS? = licenza da verificare. “Stato peggiore”: NON-PUB = non pubblicabile senza liberatoria, AUT* = autorizzata con obblighi di attribuzione, INC = incerta.

| Tipo | Unità | Fianco | Sopra | Sotto | Stato peggiore | Note |
|---|---|---|---|---|---|---|
| Scheda | Agaricus sez. Xanthodermatei | CORSO 1280px | CORSO 715px | CORSO 1066px | NON-PUB |  |
| Scheda | Agaricus bresadolanus | CC0 651px | CORSO 1387px | CORSO 1233px | NON-PUB | triade da fonti diverse |
| Scheda | Agaricus sez. Arvenses | CORSO 1280px | CORSO 1467px | CORSO 1123px | NON-PUB | soggetto: Agaricus arvensis s.l. |
| Scheda | Agaricus sez. Sanguinolenti | CORSO 854px | CORSO 1163px | CORSO 1395px | NON-PUB | soggetti: Agaricus benesii; Agaricus sylvaticus |
| Scheda | Agaricus campestris | CORSO 1281px | CORSO 1419px | CORSO 1422px | NON-PUB |  |
| Scheda | Agaricus bitorquis | CORSO 1200px | BY 708px | BY 1200px | NON-PUB | triade da fonti diverse |
| Scheda | Agaricus bisporus | BY 1200px | CORSO 1362px | BY 1200px | NON-PUB | triade da fonti diverse |
| Scheda | Cyclocybe cylindracea | CORSO 1200px | CORSO 1181px | BY 946px | NON-PUB | triade da fonti diverse |
| Scheda | Amanita phalloides | CORSO 1067px | CORSO 1543px | CORSO 1444px | NON-PUB |  |
| Scheda | Amanita verna / Amanita vidua | CORSO 1200px | CORSO 1173px | CORSO 1200px | NON-PUB | soggetto: Amanita verna |
| Scheda | Amanita virosa | CORSO 1067px | CORSO 1216px | CORSO 1064px | NON-PUB |  |
| Scheda | Amanita proxima | CORSO 1115px | CORSO 1478px | CORSO 1574px | NON-PUB |  |
| Scheda | Amanita ovoidea | CORSO 1067px | BY 1200px | BY 1230px | NON-PUB | triade da fonti diverse |
| Scheda | Amanita pantherina | CORSO 1067px | CORSO 1067px | BY 816px | NON-PUB | triade da fonti diverse |
| Scheda | Amanita muscaria | CORSO 1067px | BY 880px | BY 928px | NON-PUB | triade da fonti diverse |
| Scheda | Amanita caesarea | CORSO 1199px | CORSO 1110px | BY 192px ⚠︎ | NON-PUB | triade da fonti diverse |
| Scheda | Amanita gemmata | CORSO 1064px | CORSO 945px | CORSO 1010px | NON-PUB |  |
| Scheda | Amanita citrina | CORSO 1067px | CORSO 1119px | CORSO 1335px | NON-PUB |  |
| Scheda | Amanita porphyria | BY 1200px | CORSO 1024px | CORSO 1200px | NON-PUB | triade da fonti diverse |
| Scheda | Amanita excelsa s.l. (incl. A. spissa, A. franchetii) | CORSO 1064px | CORSO 1508px | CORSO 1200px | NON-PUB | soggetti: Amanita excelsa (= A. spissa); Amanita franchetii |
| Scheda | Amanita strobiliformis | CORSO 1067px | CORSO 1262px | CORSO 1194px | NON-PUB |  |
| Scheda | Saproamanita vittadinii | BY 684px | CORSO 1200px | CORSO 1387px | NON-PUB | triade da fonti diverse; soggetti: Amanita vittadinii; Saproamanita vittadinii |
| Scheda | Amanita rubescens | CORSO 1067px | CORSO 1067px | CORSO 1067px | NON-PUB |  |
| Scheda | Amanita sez. Vaginatae | CORSO 1067px | CORSO 980px | CORSO 1212px | NON-PUB | soggetto: Amanita vaginata s.l. |
| Scheda | Calocybe gambosa | CORSO 1346px | CORSO 1170px | CORSO 1396px | NON-PUB |  |
| Scheda | Collybia phyllophila | BY 1120px | BY-SA 544px | BY-SA 464px | AUT* | triade da fonti diverse; soggetti: Clitocybe phyllophila; Collybia phyllophila |
| Scheda | Clitocybe dealbata / Collybia rivulosa | CORSO 1067px | CORSO 1067px | CORSO 1009px | NON-PUB | soggetto: Clitocybe dealbata |
| Scheda | Clitocybe nebularis | CORSO 1372px | CORSO 1200px | CORSO 1396px | NON-PUB |  |
| Scheda | Infundibulicybe geotropa | CORSO 1200px | CORSO 918px | BY 304px ⚠︎ | NON-PUB | triade da fonti diverse |
| Scheda | Paralepistopsis amoenolens | CORSO 1199px | CORSO 1458px | CORSO 1440px | NON-PUB |  |
| Scheda | Clitocybe gibba s.l. | BY 384px ⚠︎ | CORSO 1262px | CORSO 1262px | NON-PUB | triade da fonti diverse; soggetti: Infundibulicybe gibba; Infundibulicybe gibba s.l. |
| Scheda | Clitopilus prunulus s.l. | BY 551px | BY 690px | BY-SA 538px | AUT* | triade da fonti diverse; soggetto: Clitopilus prunulus |
| Scheda | Rhodocollybia maculata | CORSO 1067px | CORSO 1458px | CORSO 1199px | NON-PUB |  |
| Scheda | Gymnopus fusipes | CORSO 1067px | CORSO 1398px | CORSO 1246px | NON-PUB |  |
| Scheda | Marasmius oreades | CORSO 911px | CORSO 1272px | CORSO 1534px | NON-PUB |  |
| Scheda | Coprinus atramentarius s.l. | CORSO 1200px | BY 1200px | BY 804px | NON-PUB | triade da fonti diverse; soggetto: Coprinopsis atramentaria |
| Scheda | Coprinus comatus | CORSO 1200px | BY 264px ⚠︎ | BY 1199px | NON-PUB | triade da fonti diverse |
| Scheda | Cortinarius orellanus | CORSO 1199px | CORSO 886px | CORSO 1424px | NON-PUB |  |
| Scheda | Cortinarius rubellus | CORSO 1067px | CORSO 1275px | CORSO 1431px | NON-PUB | soggetto: Cortinarius orellanoides (= C. speciosissimus, C. rubellus) |
| Scheda | Cortinarius sottogenere Dermocybe | CORSO 1592px | CORSO 756px | CORSO 1514px | NON-PUB | soggetti: Cortinarius croceus; Cortinarius sanguineus s.l.; Cortinarius uliginosus |
| Scheda | Cortinarius praestans | BY 1113px | BY 372px ⚠︎ | BY 448px | AUT* |  |
| Scheda | Cortinarius cumatilis | CORSO 1594px | CORSO 1226px | CORSO 1437px | NON-PUB |  |
| Scheda | Phlegmacium variiforme | — | — | — | — |  |
| Scheda | Cortinarius caperatus | CORSO 1598px | CORSO 996px | CORSO 1092px | NON-PUB |  |
| Scheda | Entoloma sinuatum | BY 455px | BY 244px ⚠︎ | BY-SA 739px | AUT* | triade da fonti diverse |
| Scheda | Entoloma rhodopolium s.l. | BY 400px | BY 781px | BY 619px | AUT* | soggetto: Entoloma rhodopolium |
| Scheda | Entoloma hirtipes | BY 652px | BY 658px | BY 658px | AUT* |  |
| Scheda | Entoloma vernum | BY 553px | BY 294px ⚠︎ | BY 671px | AUT* |  |
| Scheda | Entoloma clypeatum s.l. | BY 276px ⚠︎ | BY 173px ⚠︎ | BY 451px | AUT* | soggetto: Entoloma clypeatum |
| Scheda | Entoloma saundersii | — | — | — | — |  |
| Scheda | Flammulina velutipes s.l. | CORSO 1078px | CORSO 1392px | CORSO 1516px | NON-PUB | soggetto: Flammulina velutipes |
| Scheda | Galerina marginata group | BY 386px ⚠︎ | CORSO 1200px | CORSO 1120px | NON-PUB | triade da fonti diverse; soggetto: Galerina marginata |
| Scheda | Hygrocybe conica s.l. | BY 363px ⚠︎ | BY 512px | BY 602px | AUT* | soggetto: Hygrocybe conica |
| Scheda | Hygrocybe punicea | BY 536px | BY 295px ⚠︎ | BY 325px ⚠︎ | AUT* |  |
| Scheda | Hygrophorus marzuolus | CORSO 1129px | CORSO 690px | CORSO 1220px | NON-PUB |  |
| Scheda | Hygrophorus russula | CORSO 1201px | CORSO 1454px | CORSO 1200px | NON-PUB |  |
| Scheda | Hygrophorus penarioides | BY 267px ⚠︎ | BY-SA 887px | BY-SA 800px | AUT* | triade da fonti diverse |
| Scheda | Hypholoma fasciculare | BY 1068px | BY 921px | BY 378px ⚠︎ | AUT* |  |
| Scheda | Hypholoma lateritium | CORSO 1067px | CORSO 1415px | CORSO 1248px | NON-PUB |  |
| Scheda | Lentinula edodes | CORSO 1284px | CORSO 1391px | BY 490px | NON-PUB | triade da fonti diverse |
| Scheda | Lepiota subincarnata | CORSO 1067px | CORSO 1327px | CORSO 1347px | NON-PUB |  |
| Scheda | Lepiota brunneoincarnata | CORSO 1260px | CORSO 1041px | CORSO 1452px | NON-PUB |  |
| Scheda | Lepiota cristata | BY 1200px | BY 444px | BY 1408px | AUT* |  |
| Scheda | Lepiota elaiophylla | BY 515px | BY 288px ⚠︎ | BY 545px | AUT* |  |
| Scheda | Chlorophyllum molybdites | BY 584px | BY 575px | BY 457px | AUT* |  |
| Scheda | Echinoderma asperum s.l. | BY-SA 495px | BY-SA 298px ⚠︎ | BY-SA 367px ⚠︎ | AUT* | soggetto: Echinoderma asperum |
| Scheda | Leucoagaricus leucothites s.l. | BY 648px | BY 744px | BY 984px | AUT* | soggetto: Leucocoprinus leucothites |
| Scheda | Chlorophyllum rhacodes s.l. | CORSO 1200px | CORSO 1431px | CORSO 1590px | NON-PUB | soggetto: Chlorophyllum brunneum |
| Scheda | Macrolepiota procera s.l. | CORSO 1103px | BY-SA 912px | BY 366px ⚠︎ | NON-PUB | triade da fonti diverse; soggetto: Macrolepiota procera |
| Scheda | Lepista nuda s.l. | CORSO 1165px | CORSO 824px | CORSO 770px | NON-PUB | soggetto: Lepista nuda |
| Scheda | Lepista flaccida s.l. | CORSO 1064px | CORSO 756px | CORSO 1310px | NON-PUB | soggetto: Lepista flaccida |
| Scheda | Leucopaxillus giganteus s.l. | CORSO 1077px | CORSO 1330px | CORSO 1398px | NON-PUB | soggetto: Leucopaxillus giganteus |
| Scheda | Leucopaxillus gentianeus | CORSO 1088px | CORSO 1529px | CORSO 1129px | NON-PUB |  |
| Scheda | Lyophyllum decastes s.l. | CORSO 1067px | CORSO 1319px | CORSO 1246px | NON-PUB |  |
| Scheda | Lyophyllum specie annerenti | CORSO 1053px | CORSO 1434px | CORSO 1215px | NON-PUB | soggetto: Lyophyllum rhopalopodium |
| Scheda | Leucocybe connata | CORSO 1066px | CORSO 1345px | CORSO 1321px | NON-PUB | soggetto: Leucocybe connata (Lyophyllum connatum) |
| Scheda | Mycena sez. Purae | CORSO 1323px | CORSO 1103px | CORSO 1250px | NON-PUB | soggetto: Mycena pura |
| Scheda | Omphalotus olearius | CORSO 1246px | CORSO 1146px | CORSO 1246px | NON-PUB |  |
| Scheda | Panaeolus cyanescens | BY 567px | BY 567px | BY 495px | AUT* |  |
| Scheda | Kuehneromyces mutabilis | CORSO 852px | BY 1067px | BY 965px | NON-PUB | triade da fonti diverse |
| Scheda | Pleurotus eryngii s.l. | CORSO 1200px | CORSO 737px | BY-SA 538px | NON-PUB | triade da fonti diverse; soggetti: Pleurotus eryngii; Pleurotus eryngii s.l.; Pleurotus eryngii var. ferulae |
| Scheda | Pleurotus ostreatus | BY 481px | BY 480px | BY 480px | AUT* | soggetto: Pleurotus ostreatus (coltivato, ceppo PH11) |
| Scheda | Pleurotus cornucopiae / Pleurotus citrinopileatus | CORSO 1200px | CORSO 1085px | CORSO 951px | NON-PUB | soggetto: Pleurotus citrinopileatus |
| Scheda | Stropharia rugosoannulata | BY 295px ⚠︎ | BY 1600px | BY 1200px | AUT* |  |
| Scheda | Tricholoma pardinum | CORSO 1067px | CORSO 1067px | CORSO 1062px | NON-PUB |  |
| Scheda | Tricholoma filamentosum | BY 257px ⚠︎ | BY 355px ⚠︎ | BY 355px ⚠︎ | AUT* |  |
| Scheda | Tricholoma josserandii | CORSO 1418px | CORSO 1266px | CORSO 1214px | NON-PUB |  |
| Scheda | Tricholoma equestre | CC0 892px | CORSO 1467px | CORSO 903px | NON-PUB | triade da fonti diverse; soggetti: Tricholoma equestre; Tricholoma equestre s.l. |
| Scheda | Tricholoma portentosum | CORSO 1068px | CORSO 1198px | CORSO 1131px | NON-PUB |  |
| Scheda | Tricholoma terreum | BY 646px | CORSO 1491px | CORSO 1325px | NON-PUB | triade da fonti diverse |
| Scheda | Tricholoma saponaceum s.l. | CORSO 1067px | CORSO 1200px | CORSO 1082px | NON-PUB |  |
| Scheda | Tricholoma columbetta | CORSO 841px | CORSO 1172px | CORSO 965px | NON-PUB |  |
| Scheda | Tricholoma album s.l. (incl. T. stiparophyllum, T. lascivum e altri) | CORSO 1067px | CORSO 1280px | CORSO 1152px | NON-PUB | soggetto: Tricholoma gruppo album |
| Scheda | Tricholoma gruppo T. terreum (T. scalpturatum, T. orirubens, T. squarr | CORSO 1067px | CORSO 1297px | CORSO 1005px | NON-PUB | soggetto: Tricholoma scalpturatum |
| Scheda | Tricholoma gruppo Virgati (T. virgatum, T. sciodes, T. bresadolanum) | CORSO 1033px | CORSO 1389px | CORSO 1063px | NON-PUB | soggetti: Tricholoma bresadolanum; Tricholoma sciodes |
| Scheda | Tricholoma sejunctum | BY 693px | CORSO 1398px | CORSO 1253px | NON-PUB | triade da fonti diverse |
| Scheda | Tricholoma sulphureum | CORSO 1202px | CORSO 1206px | CORSO 1374px | NON-PUB |  |
| Scheda | Tricholoma sez. Genuina (= gruppo Albobrunnei) | BY 416px | CORSO 1081px | CORSO 1060px | NON-PUB | triade da fonti diverse; soggetti: Tricholoma gruppo Albobrunnei; Tricholoma imbricatum |
| Scheda | Tricholoma acerbum s.l. | CORSO 1021px | CORSO 1543px | CORSO 1068px | NON-PUB |  |
| Scheda | Volvopluteus gloiocephalus | BY 709px | BY 873px | BY 888px | AUT* |  |
| Scheda | Volvariella volvacea | BY 540px | BY 684px | CC0 656px | AUT* | triade da fonti diverse |
| Scheda | Lactarius sez. Deliciosi | BY 341px ⚠︎ | BY 501px | BY 622px | AUT* | soggetto: Lactarius deliciosus group (North America) |
| Scheda | Lactarius porniniae | BY-SA 438px | BY-SA 415px | BY-SA 752px | AUT* | soggetto: Lactarius porninsis |
| Scheda | Lactarius volemus s.l. | BY 801px | BY 596px | BY 982px | AUT* | soggetto: Lactifluus volemus |
| Scheda | Lactarius tesquorum | BY 429px | BY 246px ⚠︎ | BY-SA 1200px | AUT* | triade da fonti diverse |
| Scheda | Russula Foetentinae | BY-SA 1067px | CORSO 891px | CORSO 1336px | NON-PUB | triade da fonti diverse; soggetti: Russula foetens; Russula laurocerasi |
| Scheda | Russula Compactae Nigricantinae | CORSO 538px | CORSO 1120px | CORSO 977px | NON-PUB | soggetti: Russula adusta; Russula nigricans |
| Scheda | Russula Compactae Lactarioides (= gruppo R. delica) | BY 864px | CORSO 747px | CORSO 822px | NON-PUB | triade da fonti diverse; soggetti: Russula chloroides; Russula delica |
| Scheda | Boletus edulis s.l. | CORSO 1066px | CORSO 1444px | CORSO 1511px | NON-PUB | soggetto: Boletus edulis |
| Scheda | Boletus sez. Luridi | CORSO 1055px | CORSO 1257px | CORSO 1200px | NON-PUB | soggetto: Suillellus luridus |
| Scheda | Rubroboletus satanas | CORSO 1067px | CORSO 1379px | BY 584px | NON-PUB | triade da fonti diverse |
| Scheda | Rubroboletus pulchrotinctus | CORSO 1330px | BY 321px ⚠︎ | BY 255px ⚠︎ | NON-PUB | triade da fonti diverse |
| Scheda | Boletus (Neoboletus) erythropus s.l. | CORSO 1070px | CORSO 1472px | CORSO 1411px | NON-PUB | soggetto: Neoboletus erythropus s.l. |
| Scheda | Suillellus luridus | CORSO 1055px | CORSO 1257px | CORSO 1200px | NON-PUB |  |
| Scheda | Boletus queletii e specie vicine/intermedie | CORSO 1537px | CORSO 1331px | CORSO 958px | NON-PUB | soggetto: Suillellus queletii |
| Scheda | Caloboletus radicans | BY 1336px | CORSO 1373px | BY 792px | NON-PUB | triade da fonti diverse |
| Scheda | Caloboletus calopus | CORSO 1200px | BY 613px | BY 816px | NON-PUB | triade da fonti diverse |
| Scheda | Gyroporus cyanescens | BY 584px | CORSO 1439px | CORSO 1040px | NON-PUB | triade da fonti diverse |
| Scheda | Gyroporus castaneus s.l. | CORSO 973px | CORSO 1410px | CORSO 1169px | NON-PUB | soggetto: Gyroporus castaneus |
| Scheda | Hygrophoropsis aurantiaca | USFWS? 896px | USFWS? 608px | BY 826px | INC | triade da fonti diverse |
| Scheda | Imleria badia | CORSO 1037px | CORSO 1342px | CORSO 1438px | NON-PUB |  |
| Scheda | Suillus luteus | CORSO 1318px | CORSO 1153px | CORSO 1269px | NON-PUB |  |
| Scheda | Suillus granulatus | CORSO 1155px | CORSO 1246px | CORSO 1390px | NON-PUB |  |
| Scheda | Tylopilus felleus | CORSO 1230px | CORSO 1140px | CORSO 1446px | NON-PUB |  |
| Scheda | Cantharellus cibarius complex | CORSO 1066px | CORSO 1596px | CORSO 1321px | NON-PUB | soggetto: Cantharellus cibarius |
| Scheda | Craterellus lutescens | BY 457px | BY 457px | BY 457px | AUT* |  |
| Scheda | Craterellus tubaeformis | BY 600px | BY 1200px | BY 564px | AUT* |  |
| Scheda | Craterellus cornucopioides | BY 1067px | BY 971px | BY 1067px | AUT* |  |
| Scheda | Gomphus clavatus | BY-SA 1137px | BY 746px | BY 756px | AUT* | triade da fonti diverse |
| Scheda | Hydnum spp. / H. repandum s.l. (incl. gruppo H. rufescens) | CORSO 1227px | CORSO 1530px | CORSO 1200px | NON-PUB | soggetto: Hydnum repandum |
| Scheda | Hericium spp. | BY 736px | BY 704px | BY 1020px | AUT* | soggetti: Hericium coralloides; Hericium erinaceus |
| Scheda | Sarcodon imbricatus s.l. (incl. S. squamosus) | BY 389px ⚠︎ | BY 355px ⚠︎ | BY 403px | AUT* | soggetto: Sarcodon imbricatus |
| Scheda | Hapalopilus rutilans | BY 438px | CORSO 1012px | BY 283px ⚠︎ | NON-PUB | triade da fonti diverse |
| Scheda | Laetiporus sulphureus s.l. | CORSO 693px | CORSO 1064px | BY 1467px | NON-PUB | triade da fonti diverse; soggetti: Laetiporus sulphureus; Laetiporus sulphureus s.l. |
| Scheda | Albatrellopsis confluens | BY 718px | BY 832px | BY 696px | AUT* | soggetto: Albatrellus confluens |
| Scheda | Albatrellus ovinus s.l. (incl. A. subrubescens, A. citrinus) | CORSO 1066px | CORSO 1367px | CORSO 1336px | NON-PUB | soggetto: Albatrellus subrubescens |
| Scheda | Scutiger pes-caprae | BY 1240px | BY 306px ⚠︎ | BY 216px ⚠︎ | AUT* |  |
| Scheda | Fistulina hepatica | BY 1200px | BY 1200px | BY 1200px | AUT* |  |
| Scheda | Grifola frondosa | BY 672px | BY 1200px | BY 396px ⚠︎ | AUT* |  |
| Scheda | Polyporus umbellatus | BY 159px ⚠︎ | BY 984px | BY 436px | AUT* |  |
| Scheda | Meripilus giganteus | BY 1200px | BY 1200px | BY 269px ⚠︎ | AUT* |  |
| Scheda | Cerioporus squamosus | CORSO 917px | CORSO 854px | CORSO 1045px | NON-PUB |  |
| Scheda | Ramaria formosa | CORSO 1200px | BY 686px | — | NON-PUB | triade da fonti diverse |
| Scheda | Ramaria pallida | BY 1200px | BY 1052px | — | AUT* |  |
| Scheda | Ramaria botrytis s.l. | BY 1091px | BY 872px | — | AUT* | soggetto: Ramaria botrytis coll. |
| Scheda | Auricularia auricula-judae | CORSO 1229px | BY 1125px | BY 1283px | NON-PUB | triade da fonti diverse |
| Scheda | Gyromitra esculenta | CORSO 949px | BY 528px | BY 656px | NON-PUB | triade da fonti diverse |
| Scheda | Sarcosphaera coronaria s.l. | BY 720px | CORSO 1200px | BY 480px | NON-PUB | triade da fonti diverse; soggetto: Sarcosphaera coronaria |
| Genere/gruppo | Agaricus | CORSO 1281px | CORSO 1419px | CORSO 1422px | NON-PUB | soggetto: Agaricus campestris |
| Genere/gruppo | Agrocybe + Cyclocybe | CORSO 1200px | CORSO 1181px | BY 946px | NON-PUB | triade da fonti diverse; soggetto: Cyclocybe cylindracea |
| Genere/gruppo | Amanita | CORSO 1067px | CORSO 1067px | CORSO 1067px | NON-PUB | soggetto: Amanita rubescens |
| Genere/gruppo | Armillaria + Desarmillaria | CORSO 1064px | CORSO 1323px | CORSO 1250px | NON-PUB | soggetti: Armillaria mellea; Armillaria ostoyae |
| Genere/gruppo | Calocybe | CORSO 1346px | CORSO 1170px | CORSO 1396px | NON-PUB | soggetto: Calocybe gambosa |
| Genere/gruppo | Clitocybe s.l. (inclusi Ampulloclitocybe, Atractosporocybe, Bonomyces, | CORSO 1372px | CORSO 1200px | CORSO 1396px | NON-PUB | soggetto: Clitocybe nebularis |
| Genere/gruppo | Clitopilus | BY 551px | BY 690px | BY-SA 538px | AUT* | triade da fonti diverse; soggetto: Clitopilus prunulus |
| Genere/gruppo | Collybioidi e Marasmioidi (Collybia s.l. inclusi Dendrocollybia, Gymno | CORSO 911px | CORSO 1272px | CORSO 1534px | NON-PUB | soggetto: Marasmius oreades |
| Genere/gruppo | Coprinus s.l. (inclusi Coprinellus, Coprinopsis, Narcissea, Parasola,  | CORSO 1200px | BY 1200px | BY 804px | NON-PUB | triade da fonti diverse; soggetto: Coprinopsis atramentaria |
| Genere/gruppo | Cortinarius | CORSO 1598px | CORSO 996px | CORSO 1092px | NON-PUB | soggetto: Cortinarius caperatus |
| Genere/gruppo | Entoloma | BY 652px | BY 658px | BY 658px | AUT* | soggetto: Entoloma hirtipes |
| Genere/gruppo | Flammulina | CORSO 1078px | CORSO 1392px | CORSO 1516px | NON-PUB | soggetto: Flammulina velutipes |
| Genere/gruppo | Galerina | BY 386px ⚠︎ | CORSO 1200px | CORSO 1120px | NON-PUB | triade da fonti diverse; soggetto: Galerina marginata |
| Genere/gruppo | Hebeloma | BY 1200px | BY 1015px | BY 1200px | AUT* | soggetti: Hebeloma incarnatulum; Hebeloma mesophaeum |
| Genere/gruppo | Hygrocybe (inclusi Gliophorus, Gloioxanthomyces, Neohygrocybe, Porpolo | BY 536px | BY 295px ⚠︎ | BY 325px ⚠︎ | AUT* | soggetto: Hygrocybe punicea |
| Genere/gruppo | Hygrophorus + Cuphophyllus | CORSO 1129px | CORSO 690px | CORSO 1220px | NON-PUB | soggetto: Hygrophorus marzuolus |
| Genere/gruppo | Hypholoma | CORSO 1067px | CORSO 1415px | CORSO 1248px | NON-PUB | soggetto: Hypholoma lateritium |
| Genere/gruppo | Inocybe s.l. (inclusi Mallocybe, Inosperma, Pseudosperma) | CORSO 1067px | CORSO 1590px | CORSO 1252px | NON-PUB | soggetto: Inocybe rimosa |
| Genere/gruppo | Laccaria | CORSO 1323px | CORSO 1492px | CORSO 1396px | NON-PUB | soggetto: Laccaria amethystina |
| Genere/gruppo | Lentinula | CORSO 1284px | CORSO 1391px | BY 490px | NON-PUB | triade da fonti diverse; soggetto: Lentinula edodes |
| Genere/gruppo | Lepiotoidi: Lepiota (inclusi Chamaemyces, Cystolepiota, Pulverolepiota | CORSO 1260px | CORSO 1041px | CORSO 1452px | NON-PUB | soggetto: Lepiota brunneoincarnata |
| Genere/gruppo | Lepista | CORSO 1165px | CORSO 824px | CORSO 770px | NON-PUB | soggetto: Lepista nuda |
| Genere/gruppo | Leucopaxillus (inclusi Aspropaxillus, Pseudoclitopilus, Pogonoloma p.p | CORSO 1077px | CORSO 1330px | CORSO 1398px | NON-PUB | soggetto: Leucopaxillus giganteus |
| Genere/gruppo | Limacella (inclusi Limacellopsis, Zhuliangomyces) | IGNOTA 650px | IGNOTA 480px | IGNOTA 592px | INC | soggetto: Limacella furnacea |
| Genere/gruppo | Lyophyllum (inclusi Leucocybe p.p., Myochromella, Sagaranella, Sphagnu | CORSO 1067px | CORSO 1319px | CORSO 1246px | NON-PUB | soggetto: Lyophyllum decastes s.l. |
| Genere/gruppo | Melanoleuca | CORSO 1064px | CORSO 1346px | CORSO 1346px | NON-PUB | soggetto: Melanoleuca cognata |
| Genere/gruppo | Mycena | CORSO 1323px | CORSO 1103px | CORSO 1250px | NON-PUB | soggetto: Mycena pura |
| Genere/gruppo | Omphalotus | CORSO 1246px | CORSO 1146px | CORSO 1246px | NON-PUB | soggetto: Omphalotus olearius |
| Genere/gruppo | Panaeolus (inclusi Copelandia, Panaeolina) | BY 567px | BY 567px | BY 495px | AUT* | soggetto: Panaeolus cyanescens |
| Genere/gruppo | Pholiota + Kuehneromyces (inclusi Flammula, Hemipholiota, Pyrrhulomyce | CORSO 852px | BY 1067px | BY 965px | NON-PUB | triade da fonti diverse; soggetto: Kuehneromyces mutabilis |
| Genere/gruppo | Pleurotus (inclusi altri generi pleurotoidi, sebbene anche distanti da | CORSO 1200px | CORSO 1085px | CORSO 951px | NON-PUB | soggetto: Pleurotus citrinopileatus |
| Genere/gruppo | Pluteus | BY 491px | BY 425px | BY 383px ⚠︎ | AUT* | soggetti: Pluteus cervinus; Pluteus conformis |
| Genere/gruppo | Psathyrella s.l. (inclusi Britzelmayria, Candolleomyces, Cystoagaricus | BY 538px | BY-SA 427px | BY-SA 469px | AUT* | triade da fonti diverse; soggetti: Psathyrella candolleana; Psathyrella squarrosa |
| Genere/gruppo | Psilocybe s.l. (incluso Deconica) | BY 293px ⚠︎ | BY 224px ⚠︎ | BY 438px | AUT* | soggetto: Psilocybe striata |
| Genere/gruppo | Stropharia s.l. (inclusi Hemistropharia, Leratiomyces, Protostropharia | BY 1200px | BY 288px ⚠︎ | BY 1200px | AUT* | soggetto: Stropharia aeruginosa |
| Genere/gruppo | Tricholoma | CORSO 1067px | CORSO 1200px | CORSO 1082px | NON-PUB | soggetto: Tricholoma saponaceum s.l. |
| Genere/gruppo | Volvariella + Volvopluteus | BY 540px | BY 684px | BY 888px | AUT* | soggetti: Volvariella volvacea; Volvopluteus gloiocephalus |
| Genere/gruppo | Lactarius (incluso Lactifluus) | BY 341px ⚠︎ | BY 501px | BY 622px | AUT* | soggetto: Lactarius deliciosus group (North America) |
| Genere/gruppo | Russula | BY-SA 1067px | CORSO 747px | CORSO 822px | NON-PUB | triade da fonti diverse; soggetti: Russula chloroides; Russula delica; Russula laurocerasi |
| Genere/gruppo | Boletus s. str. | CORSO 1066px | CORSO 1444px | CORSO 1511px | NON-PUB | soggetto: Boletus edulis |
| Genere/gruppo | Butyriboletus | CORSO 1123px | CORSO 1334px | CORSO 1174px | NON-PUB | soggetti: Butyriboletus appendiculatus; Butyriboletus fechtneri; Butyriboletus regius |
| Genere/gruppo | Caloboletus | CORSO 1200px | CORSO 1373px | BY 824px | NON-PUB | triade da fonti diverse; soggetti: Caloboletus calopus; Caloboletus radicans |
| Genere/gruppo | Chroogomphus | BY 306px ⚠︎ | BY 488px | BY 278px ⚠︎ | AUT* | soggetti: Chroogomphus pakistanicus; Chroogomphus rutilus |
| Genere/gruppo | Gomphidius | BY 738px | BY 653px | BY 696px | AUT* | soggetto: Gomphidius glutinosus |
| Genere/gruppo | Gyroporus | CORSO 973px | CORSO 1410px | CORSO 1169px | NON-PUB | soggetto: Gyroporus castaneus |
| Genere/gruppo | Hemileccinum | CORSO 1319px | CORSO 1279px | CORSO 1067px | NON-PUB | soggetti: Hemileccinum depilatum; Hemileccinum impolitum |
| Genere/gruppo | Hygrophoropsis | USFWS? 896px | USFWS? 608px | BY 826px | INC | triade da fonti diverse; soggetto: Hygrophoropsis aurantiaca |
| Genere/gruppo | Imleria | CORSO 1037px | CORSO 1342px | CORSO 1438px | NON-PUB | soggetto: Imleria badia |
| Genere/gruppo | Leccinellum | CORSO 1110px | CORSO 1199px | CORSO 1439px | NON-PUB | soggetti: Leccinellum corsicum; Leccinellum crocipodium |
| Genere/gruppo | Leccinum | CORSO 1395px | CORSO 780px | CORSO 1195px | NON-PUB | soggetto: Leccinum duriusculum |
| Genere/gruppo | Paxillus | CORSO 1067px | CORSO 1501px | CORSO 1525px | NON-PUB | soggetto: Paxillus involutus s.l. |
| Genere/gruppo | Suillus (incluso Boletinus) | CORSO 1155px | CORSO 1246px | CORSO 1390px | NON-PUB | soggetto: Suillus granulatus |
| Genere/gruppo | Tylopilus | CORSO 1230px | CORSO 1140px | CORSO 1446px | NON-PUB | soggetto: Tylopilus felleus |
| Genere/gruppo | Xerocomus s.l. (inclusi Alessioporus, Hortiboletus, Pseudoboletus, Pul | CORSO 1066px | CORSO 1392px | CORSO 1273px | NON-PUB | soggetti: Xerocomus ferrugineus; Xerocomus pruinatus; Xerocomus subtomentosus |
| Genere/gruppo | Cantharellus | CORSO 1066px | CORSO 1596px | CORSO 1321px | NON-PUB | soggetto: Cantharellus cibarius |
| Genere/gruppo | Craterellus | BY 457px | BY 457px | BY 457px | AUT* | soggetto: Craterellus lutescens |
| Genere/gruppo | Gomphus | BY-SA 1137px | BY 746px | BY 756px | AUT* | triade da fonti diverse; soggetto: Gomphus clavatus |
| Genere/gruppo | Ramaria | CORSO 1200px | BY 299px ⚠︎ | — | NON-PUB | triade da fonti diverse; soggetti: Ramaria formosa; Ramaria luteoliparva |
| Genere/gruppo | Pisolithus | BY 392px ⚠︎ | BY 523px | BY 391px ⚠︎ | AUT* | soggetto: Pisolithus albus |
| Genere/gruppo | Scleroderma | BY 276px ⚠︎ | CORSO 1502px | BY 362px ⚠︎ | NON-PUB | triade da fonti diverse; soggetti: Scleroderma citrinum; Scleroderma spp.; Scleroderma verrucosum |
| Genere/gruppo | Auricularia | CORSO 1229px | BY 1125px | BY 1283px | NON-PUB | triade da fonti diverse; soggetto: Auricularia auricula-judae |
| Genere/gruppo | Gyromitra (incluso Discina) | CORSO 949px | BY 528px | BY 656px | NON-PUB | triade da fonti diverse; soggetto: Gyromitra esculenta |
| Genere/gruppo | Helvella | CORSO 1201px | BY 311px ⚠︎ | BY 438px | NON-PUB | triade da fonti diverse; soggetti: Helvella orentitomentosa; Helvella spadicea |
| Genere/gruppo | Morchella | CORSO 1363px | BY 505px | — | NON-PUB | triade da fonti diverse; soggetti: Morchella esculenta; Morchella esculenta s.l. |
| Genere/gruppo | Sarcosphaera | BY 720px | CORSO 1202px | BY 480px | NON-PUB | triade da fonti diverse; soggetti: Sarcosphaera coronaria; Sarcosphaera sp. |
| Genere/gruppo | Verpa | CORSO 1200px | BY 400px | — | NON-PUB | triade da fonti diverse; soggetti: Verpa bohemica; Verpa conica |
