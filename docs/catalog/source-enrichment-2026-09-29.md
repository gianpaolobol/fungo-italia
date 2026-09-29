# Source enrichment audit — 29 settembre 2026

## Obiettivo

Integrare le nove nuove fonti fornite dall'utente nel corpus scientifico di Fungo Italia, senza degradare la Scientific Baseline 1.0 e senza trattare copie/estratti come evidenze indipendenti.

## Fonti registrate

1. **I funghi della Campania** — Roca, Capano, Marziano. Fonte regionale ad alta utilità per morfologia, habitat, ecologia e confondibilità.
2. **Funghi spontanei del Veneto – Riconoscimento e commercializzazione**, II ed. 2012 — Nicola Sitta. Fonte istituzionale ad alta utilità per riconoscimento pratico, specie commercializzate e confondibilità.
3. **Guida ai funghi – 1ª parte** — registrata come estratto/copia della fonte Veneto; non aumenta il peso dell'evidenza.
4. **Mostra Micologica Laconi 2009 – schede A.M.I.N.T.** — buona fonte descrittiva per macrocaratteri e confronti; safety e nomenclatura storiche non vengono assunte senza controllo.
5. **Il mondo dei funghi – appunti di micologia** — Tieri & Tieri. Fonte didattica generale, utile soprattutto per ecologia e morfologia di base.
6. **Atlante illustrato dei Funghi del Parco – 845 specie** — Padovan/Ubaldi. Fonte di alta utilità, ma il PDF è una copia di una fonte già presente nel corpus e non viene contato come evidenza indipendente.
7. **Manuale del cercatore di funghi**, Regione Lombardia, 2015 — fonte istituzionale utile per sicurezza, ecologia e riconoscimento di base.
8. **Manuale base per corso formativo di micologia**, Regione Calabria / Confederazione Micologica Calabrese — fonte istituzionale/formativa ad alta utilità per habitat mediterranei, morfologia e specie commerciali/tossiche.
9. **La raccolta dei funghi tra passione, rispetto per l'ambiente e sicurezza** — Regione Campania / Gruppo Micologico Campano — buona fonte per didattica, morfologia, ecologia e tossicologia.

I record includono SHA-256 dei file per mantenere la provenienza riproducibile.

## Politica di utilizzo

- Il livello **3+1** usa soltanto caratteri macroscopici/ecologici verificabili sul campo.
- Un carattere di una singola specie non viene generalizzato a una sezione o a un gruppo senza supporto esplicito.
- Le fonti divulgative o storiche non sovrascrivono da sole tassonomia corrente, commestibilità o tossicità.
- Le copie o gli estratti della stessa opera sono registrati per tracciabilità ma non contano come conferme indipendenti.

## Profili 3+1 migliorati in questo passaggio

### Agaricus bisporus
Fonte: *I funghi della Campania*, scheda p. 92.
Rafforzati cappello, evoluzione delle lamelle, anello/carne e habitat su terreni molto ricchi o concimati.

### Cyclocybe cylindracea
Fonte: scheda A.M.I.N.T. *Agrocybe aegerita* (= *A. cylindracea*), pp. 10–11.
Rafforzati evoluzione cromatica del cappello, lamelle, anello e substrati lignicoli.

### Amanita gemmata
Fonte: scheda A.M.I.N.T., pp. 17–18.
Rafforzata la variabilità del velo pileico, la volva circoncisa e la natura fugace dell'anello.

### Galerina marginata group
Fonte: *I funghi della Campania*, p. 166.
Precisati igrofania/bicolore, lamelle, residui velari e crescita lignicola.

### Lentinula edodes
Fonte: *Funghi spontanei del Veneto*, sezione Shii-take, p. 14.
Sostituiti elementi meno necessari con cappello bruno squamuloso, lamelle bianche adnate-uncinate e gambo coriaceo.

### Volvariella volvacea
Fonti: *I funghi della Campania*, pp. 272–274; *Funghi spontanei del Veneto*, pp. 13–14.
Precisati cappello fibrilloso, lamelle rosa a maturità, grande volva, assenza di anello e habitat termofilo/coltivato.

### Stropharia rugosoannulata
Fonte: *Funghi spontanei del Veneto*, p. 14.
Aggiunto un safety check separato dalla determinazione per raccolte spontanee su compost/pacciamature in siti potenzialmente contaminati.

## Candidati ad alto valore per il prossimo passaggio

Le nuove fonti contengono materiale utile anche per: Agaricus sez. Xanthodermatei, sez. Arvenses, Amanita ovoidea e Vaginatae, Entoloma hirtipes, Hygrocybe conica s.l., Lepiota subincarnata, Leucoagaricus leucothites s.l., Aspropaxillus giganteus, Lactarius sez. Deliciosi e L. tesquorum, Hericium spp., Albatrellus ovinus e Scutiger pes-caprae.

Questi taxa non vengono modificati automaticamente in questo commit: richiedono confronto puntuale con il profilo già auditato e, per i gruppi s.l., verifica che i caratteri siano davvero condivisi al rango didattico usato.
