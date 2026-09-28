export type MinimumFieldDiagnosticStatus =
  | "field_high_confidence"
  | "field_high_confidence_when_typical"
  | "field_high_confidence_when_host_known"
  | "field_high_confidence_when_young"
  | "field_high_confidence_at_source_rank"
  | "field_confirmatory"
  | "microscopy_required_for_fine_id"
  | "dna_confirmatory"
  | "defined_morphogroup_s1"
  | "defined_set_s1";

export interface MinimumFieldProfile {
  characters: readonly [string, string, string];
  plusOne: string;
  diagnosticStatus: MinimumFieldDiagnosticStatus;
  diagnosticNote?: string;
  safetyCheck?: string;
}

const p = (
  characters: readonly [string, string, string],
  plusOne: string,
  diagnosticStatus: MinimumFieldDiagnosticStatus = "field_high_confidence",
  options: { diagnosticNote?: string; safetyCheck?: string } = {},
): MinimumFieldProfile => ({
  characters,
  plusOne,
  diagnosticStatus,
  ...options,
});

/**
 * Scientific Baseline 1.0 — audit completed 2026-09-28.
 *
 * The three primary characters and +1 are intentionally field-verifiable:
 * morphology, colour/bruise changes, odour, texture, substrate, host and phenology.
 * Reagents, microscopy, DNA and taste are excluded from the base 3+1.
 * Fine-resolution limits are expressed by diagnosticStatus/diagnosticNote rather
 * than by weakening the field characters.
 */
export const auditedMinimumFieldProfiles: Readonly<Record<string, MinimumFieldProfile>> = {
  "Agaricus sez. Xanthodermatei": p(
    ["Lamelle libere, da pallide o rosa nel giovane a bruno-cioccolato a maturità.", "Ingiallimento rapido e vivo, soprattutto alla base del gambo quando lesa.", "Odore fenolico, d'inchiostro o disinfettante, più netto alla base del gambo."],
    "Anello presente e volva assente: quadro da Agaricus, da separare dagli Arvenses per odore e sede dell'ingiallimento.",
  ),
  "Agaricus bresadolanus": p(
    ["Cappello biancastro o grigio-bruno, spesso fibrilloso-squamuloso verso il centro.", "Gambo con base nettamente bulbosa e spesso con cordoni o residui miceliari robusti.", "Carne che può arrossare o brunire lentamente nelle zone lese, senza forte ingiallimento fenolico."],
    "Crescita terricola in parchi, prati e margini alberati, spesso in gruppi.",
  ),
  "Agaricus sez. Arvenses": p(
    ["Superfici che ingialliscono alla pressione, in genere senza il giallo violento concentrato alla base tipico degli Xanthodermatei.", "Odore netto di anice o mandorla.", "Anello ampio e sviluppato, spesso doppio, con pagina inferiore a disegno dentato o a ruota."],
    "Lamelle libere da pallide/rosa a bruno scuro con la maturazione.",
    "field_high_confidence_at_source_rank",
  ),
  "Agaricus sez. Sanguinolenti": p(
    ["Carne che arrossa al taglio, da rosa a rosso-vinoso o bruno-rossastro.", "Superfici che possono arrossare o brunire alla manipolazione.", "Odore fungino o debole, non tipicamente anisato e non fenolico."],
    "Anello superiore generalmente semplice; utile come morfogruppo degli Agaricus arrossanti richiesto da S1.",
    "defined_morphogroup_s1",
    { diagnosticNote: "La sezione filogenetica moderna non è sempre delimitabile con i soli macrocaratteri." },
  ),
  "Agaricus campestris": p(
    ["Cappello bianco, liscio o finemente fibrilloso-squamuloso, spesso appiattito a maturità.", "Lamelle libere rosa vivo nel giovane, poi bruno-cioccolato.", "Gambo relativamente corto con anello sottile e fragile, senza volva."],
    "Carne bianca con lieve rosatura, soprattutto presso le lamelle; specie tipica di prati e pascoli.",
  ),
  "Agaricus bitorquis": p(
    ["Basidioma robusto, spesso semi-interrato, con cappello bianco-crema molto carnoso.", "Gambo corto e massiccio con caratteristico doppio anello o due zone anulari.", "Lamelle libere rosa poi bruno-cioccolato, senza volva."],
    "Frequente su terreni compatti e disturbati, bordi stradali e aree calpestate.",
  ),
  "Agaricus bisporus": p(
    ["Cappello carnoso bianco-crema o bruno, spesso con squame brune verso il centro.", "Lamelle libere da rosa pallido a bruno-cioccolato.", "Anello mediano persistente, semplice o pseudo-doppio, con lieve arrossamento della carne e assenza di odore fenolico."],
    "Portamento robusto e basso, frequente in terreni ricchi e coltivazioni; nessun forte ingiallimento fenolico.",
    "field_confirmatory",
    { diagnosticNote: "In raccolte spontanee o atipiche la determinazione specifica fine va confermata con caratteri microscopici." },
  ),
  "Cyclocybe cylindracea": p(
    ["Crescita lignicola in cespi compatti su tronchi, ceppaie o radici di latifoglie.", "Cappello bruno-miele, più chiaro verso il margine, spesso screpolato con il secco.", "Gambo fibroso con anello ampio; lamelle chiare poi bruno-tabacco."],
    "Carne soda con odore fungino gradevole; tipica su pioppi, salici e altre latifoglie.",
  ),
  "Amanita phalloides": p(
    ["Cappello verde-oliva, giallo-oliva o talvolta quasi bianco, percorso da fibrille radiali più scure.", "Lamelle bianche libere e grande anello membranoso alto sul gambo.", "Base del gambo con volva bianca ampia, membranosa e sacciforme."],
    "Gambo spesso con zebrature o marezzature olivastre; base sempre da estrarre integra.",
  ),
  "Amanita verna (inclusa A. vidua)": p(
    ["Basidioma interamente bianco con lamelle bianche libere.", "Gambo relativamente liscio con anello membranoso completo e volva bianca sacciforme.", "Cappello liscio, bianco, da emisferico a piano, senza verruche persistenti."],
    "Fenologia soprattutto primaverile e inizio estate, spesso con latifoglie.",
    "defined_set_s1",
    { diagnosticNote: "S1 include A. vidua; la separazione verna/vidua può richiedere caratteri specialistici." },
  ),
  "Amanita virosa": p(
    ["Cappello bianco spesso conico-campanulato o irregolarmente convesso.", "Gambo bianco nettamente lanoso-fioccoso o squamuloso.", "Anello sottile, fragile o lacerato, con volva bianca sacciforme alla base."],
    "Prevalentemente estivo-autunnale in boschi umidi montani di conifere o misti.",
    "field_high_confidence_when_typical",
  ),
  "Amanita proxima": p(
    ["Basidioma grande e biancastro con cappello carnoso e margine non striato.", "Anello bianco membranoso, spesso persistente.", "Volva alla base nettamente arancio-rossastra o fulvastra, in forte contrasto con il gambo chiaro."],
    "Specie termofila mediterranea su suoli calcarei, spesso con querce e conifere.",
  ),
  "Amanita ovoidea": p(
    ["Grande cappello bianco-avorio, carnoso, con margine spesso appendicolato da residui cremosi del velo.", "Gambo massiccio con anello fragile, cremoso-farinoso, spesso lacerato.", "Volva bianca sacciforme, talvolta con minute granulazioni giallastre, mai arancio-rossa come in A. proxima."],
    "Specie termofila mediterranea, spesso su terreno calcareo.",
  ),
  "Amanita pantherina": p(
    ["Cappello bruno con numerose verruche bianche regolari e margine nettamente striato.", "Anello bianco non striato nella pagina superiore.", "Bulbo basale con volva aderente a più cercini o collaretti concentrici."],
    "Carne bianca immutabile, senza arrossamento; utile contro A. rubescens.",
  ),
  "Amanita muscaria": p(
    ["Cappello rosso o rosso-arancio con verruche bianche, talvolta dilavate.", "Lamelle bianche e anello ampio pendulo.", "Base bulbosa con residui volvari bianchi disposti in verruche o cercini."],
    "Gambo e lamelle restano bianchi; margine del cappello spesso striato negli adulti.",
  ),
  "Amanita caesarea": p(
    ["Cappello arancio-rosso, liscio, con margine fortemente striato.", "Lamelle, gambo e anello di colore giallo vivo.", "Grande volva bianca membranosa e sacciforme alla base."],
    "Nello stadio chiuso la sezione longitudinale mostra già strutture interne gialle.",
  ),
  "Amanita gemmata": p(
    ["Cappello giallo-ocra con margine striato e placche bianche appiattite del velo.", "Base bulbosa con residui volvari aderenti e margine superiore netto o canalicolato.", "Anello molto fragile, spesso scomparso negli esemplari adulti."],
    "Frequente con conifere, soprattutto Pinus, su suoli sabbiosi o acidi.",
    "field_high_confidence_when_typical",
    { diagnosticNote: "Forme atipiche vanno confrontate con A. gioiosa, A. eliae e taxa affini." },
  ),
  "Amanita citrina": p(
    ["Cappello giallo-citrino, giallo-verde pallido o quasi bianco con placche verrucose chiare.", "Odore caratteristico di patata cruda o rafano.", "Base del gambo con grosso bulbo marginato e volva aderente, non sacciforme."],
    "Anello membranoso giallastro o biancastro; lamelle bianche.",
  ),
  "Amanita porphyria": p(
    ["Cappello grigio-bruno o porpora-grigiastro, liscio o con pochi residui velari.", "Gambo biancastro-grigiastro con anello sottile e bulboso alla base.", "Volva aderente sul bulbo, non ampia e sacciforme."],
    "Odore spesso rafanoide; tipica di conifere su suoli acidi.",
  ),
  "Amanita excelsa s.l. (incl. A. spissa, A. franchetii)": p(
    ["Amanite robuste con cappello grigio-bruno o brunastro e residui del velo grigi, talvolta giallastri nelle entità incluse.", "Gambo robusto con anello superiore striato.", "Base ingrossata ma priva di una volva libera e sacciforme."],
    "Carne non arrossante: utile separazione dal gruppo A. rubescens.",
    "field_high_confidence_at_source_rank",
  ),
  "Amanita strobiliformis": p(
    ["Grande cappello bianco-grigiastro ricoperto da grosse verruche piramidali o placche farinose.", "Gambo massiccio bianco con anello ampio, fragile e farinoso.", "Base bulbosa con residui volvari verrucosi, non in sacco libero."],
    "Specie termofila, spesso con latifoglie su terreni calcarei.",
  ),
  "Amanita vittadinii": p(
    ["Cappello bianco-crema ricoperto da squame o verruche piramidali persistenti.", "Gambo bianco fortemente squamoso sotto l'anello, con aspetto armillato.", "Anello membranoso ben sviluppato; base senza tipica volva sacciforme."],
    "Ecologia prevalentemente praticola o in ambienti aperti, insolita per una Amanita.",
  ),
  "Amanita rubescens": p(
    ["Carne e superfici che arrossano nettamente alla lesione, soprattutto base del gambo e zone larvate.", "Cappello bruno-rossastro con verruche grigiastre, mai bianco puro su rosso vivo.", "Anello ampio con pagina superiore striata."],
    "Bulbo basale senza volva sacciforme; assenza dei cercini netti di A. pantherina.",
  ),
  "Amanita sez. Vaginatae": p(
    ["Assenza completa di anello sul gambo.", "Margine del cappello fortemente e lungamente striato.", "Gambo slanciato, non nettamente bulboso, inserito in una volva basale sviluppata."],
    "Carne fragile e lamelle bianche; riconoscimento corretto al rango di sezione.",
    "field_high_confidence_at_source_rank",
  ),
  "Calocybe gambosa": p(
    ["Basidioma robusto bianco-crema con cappello carnoso.", "Lamelle bianche-crema molto fitte, smarginate o sinuose.", "Odore intenso di farina fresca o pasta."],
    "Fruttificazione tipicamente primaverile in prati, siepi, margini e cerchi.",
  ),
  "Clitocybe cerussata (= C. phyllophila)": p(
    ["Cappello bianco-crema con superficie sericea o pruinosa.", "Lamelle bianche-crema da adnate a subdecorrenti.", "Gambo bianco fibrilloso con micelio bianco evidente alla base."],
    "Crescita sulla lettiera boschiva; trattare didatticamente come parte delle Clitocybe bianche.",
    "defined_morphogroup_s1",
  ),
  "Clitocybe dealbata (= C. rivulosa)": p(
    ["Piccolo cappello biancastro, opaco o pruinoso, presto depresso.", "Lamelle ravvicinate, bianche, adnate o decorrenti.", "Gambo corto e fibrilloso con feltro miceliare basale."],
    "Tipica di prati, radure e bordi erbosi, spesso in archi o cerchi.",
    "defined_set_s1",
  ),
  "Clitocybe nebularis": p(
    ["Grande cappello grigio o grigio-bruno, spesso con pruina superficiale.", "Lamelle bianco-crema fitte, adnate o brevemente decorrenti e separabili dalla carne.", "Gambo robusto con base clavata e abbondante micelio bianco."],
    "Odore forte, dolciastro-farinaceo fino a sgradevole negli esemplari maturi.",
  ),
  "Clitocybe geotropa": p(
    ["Grande cappello crema-beige imbutiforme.", "Umbone centrale persistente anche nel fondo dell'imbuto.", "Lamelle bianche-crema fortemente decorrenti."],
    "Gambo alto e robusto; spesso in grandi archi o cerchi.",
  ),
  "Clitocybe amoenolens": p(
    ["Cappello carnoso beige-ocra o arancio pallido con margine inizialmente involuto.", "Lamelle molto fitte e decorrenti.", "Gambo corto con tomento miceliare bianco alla base."],
    "Odore aromatico-floreale intenso; specie tipicamente mediterranea.",
  ),
  "Clitocybe gibba s.l.": p(
    ["Cappello sottile beige-rosato o ocra, presto profondamente imbutiforme.", "Lamelle bianche strette e nettamente decorrenti.", "Gambo pallido, snello e fibroso."],
    "Carne sottile e crescita sulla lettiera boschiva.",
    "field_high_confidence_at_source_rank",
  ),
  "Clitopilus prunulus s.l.": p(
    ["Cappello biancastro-grigiastro opaco o finemente vellutato, spesso irregolare.", "Lamelle fortemente decorrenti da bianche a rosa-carne.", "Carne fragile e friabile con gambo corto spesso eccentrico."],
    "Odore molto forte di farina fresca o pasta.",
    "field_high_confidence_at_source_rank",
  ),
  "Collybia maculata": p(
    ["Cappello crema-bianco che sviluppa tipiche macchie ruggine o rosso-brune con l'età.", "Lamelle molto fitte, chiare, anch'esse macchiantesi di ruggine.", "Gambo tenace bianco, longitudinalmente striato e spesso radicante."],
    "Tipica di lettiera di conifere o legno molto degradato.",
  ),
  "Collybia fusipes": p(
    ["Crescita in cespi compatti alla base o sulle radici di querce e altre latifoglie.", "Gambo fusiforme, scanalato e spesso contorto, assottigliato alle due estremità e radicante.", "Cappello rosso-bruno con lamelle chiare che possono macchiarsi di ruggine."],
    "Assenza di anello; consistenza tenace.",
  ),
  "Marasmius oreades": p(
    ["Cappello ocra-beige con piccolo umbone, igrofano.", "Lamelle molto distanti, pallide e non decorrenti.", "Gambo sottile ma eccezionalmente tenace, elastico e flessibile."],
    "Cresce in prati in file, archi e tipici cerchi delle streghe.",
  ),
  "Coprinus atramentarius s.l.": p(
    ["Cappello grigio-bruno da ovoide a campanulato, radialmente solcato.", "Lamelle fittissime da pallide a rosate/grigie, poi nere e deliquescenti.", "Crescita in gruppi o cespi da legno interrato e radici."],
    "Gambo pallido con zona velare o pseudoanulare bassa e fugace.",
    "field_high_confidence_at_source_rank",
  ),
  "Coprinus comatus": p(
    ["Cappello lungo cilindrico-ovoidale, bianco e fortemente squamoso-lanoso.", "Lamelle libere da bianche a rosa e infine nere, con deliquescenza.", "Gambo lungo, bianco e cavo con piccolo anello mobile o fugace."],
    "Tipico di prati e terreni disturbati; spesso isolato o in gruppi non fascicolati.",
  ),
  "Cortinarius orellanus": p(
    ["Cappello asciutto, opaco-fibrilloso, rame-bruno o arancio-ruggine, con umbone largo non appuntito.", "Lamelle relativamente spaziate, giallo-arancio poi ruggine.", "Gambo giallo-ocra fibrilloso, senza evidenti fasce anulari persistenti."],
    "Soprattutto sotto latifoglie, in particolare Quercus, in ambienti caldi.",
  ),
  "Cortinarius orellanoides (= C. rubellus, C. speciosissimus)": p(
    ["Cappello ruggine-bruno nettamente conico e appuntito, spesso a profilo di pagoda.", "Gambo con tipiche fasce o zig-zag giallastri del velo.", "Lamelle giallo-arancio poi bruno-ruggine."],
    "Tipico soprattutto di conifere e ambienti muscosi.",
  ),
  "Cortinarius sottogenere Dermocybe": p(
    ["Lamelle dei giovani intensamente gialle, arancioni, rosse o verde-oliva prima della maturazione rugginosa.", "Cappello asciutto o quasi, sericeo-fibrilloso e spesso vivacemente pigmentato.", "Gambo asciutto con cortina almeno nel giovane, spesso con colori giallo-arancio-rossi."],
    "Basidiomi in genere piccoli-medi e non glutinosi; riconoscimento al rango di sottogenere.",
    "field_high_confidence_at_source_rank",
  ),
  "Cortinarius praestans": p(
    ["Basidioma eccezionalmente grande e robusto.", "Cappello viscido bruno-fulvo con tonalità violacee e margine spesso radialmente rugoso.", "Lamelle giovani pallide, biancastre o violetto-grigiastre, poi ruggine."],
    "Gambo massiccio bianco-violetto, clavato ma non con bulbo marginato.",
  ),
  "Cortinarius cumatilis": p(
    ["Cappello viscido blu-violetto o grigio-violetto.", "Lamelle giovani nettamente bianche, poi color ruggine.", "Gambo robusto bianco con base bulbosa ma non nettamente marginata."],
    "Frequente in boschi di conifere.",
  ),
  "Cortinarius variiformis": p(
    ["Cappello liscio e viscido, da ocra-giallastro a arancio-bruno.", "Lamelle giovani con persistenti tonalità lilla o violetto-blu.", "Gambo clavato con fasce o squame del velo biancastre-giallastre."],
    "Nel concetto moderno s.str. è soprattutto mediterraneo con Cistus, spesso su substrati silicei.",
    "field_high_confidence_when_host_known",
  ),
  "Cortinarius caperatus (= Rozites caperatus)": p(
    ["Cappello asciutto giallo-ocra, molto rugoso, con pruina bianco-argentea nel giovane.", "Lamelle paglierine poi ocra-ruggine.", "Gambo con vero anello membranoso ben sviluppato, spesso doppio o striato."],
    "Tipico di boschi umidi di conifere e brughiere montane.",
  ),
  "Entoloma sinuatum": p(
    ["Grande basidioma robusto con cappello avorio o grigio pallido.", "Lamelle smarginate, crema-giallastre nel giovane e poi nettamente rosa-salmone.", "Gambo spesso, bianco, pieno e privo di anello."],
    "Odore forte di farina, talvolta sgradevole negli esemplari maturi.",
  ),
  "Entoloma rhodopolium s.l.": p(
    ["Cappello pallido grigio-bruno o giallo-bruno, fortemente igrofano e spesso striato per trasparenza.", "Lamelle chiare che maturando diventano rosa.", "Gambo bianco relativamente fragile, spesso con tomento bianco alla base."],
    "Odore nitroso, clorato o saponaceo variabile; profilo riferito al complesso s.l.",
    "field_high_confidence_at_source_rank",
  ),
  "Entoloma hirtipes": p(
    ["Cappello sottile bruno scuro o olivastro, conico-campanulato e umbonato, fortemente igrofano.", "Lamelle da pallide a rosa-brune con la maturazione.", "Gambo molto slanciato con fibrille longitudinali evidenti."],
    "Odore peculiare ma variabile, da pesce/cetriolo a farinaceo-rancido.",
  ),
  "Entoloma vernum": p(
    ["Cappello bruno o grigio-bruno scuro, conico-piramidale con umbone acuto persistente.", "Lamelle inizialmente pallide o grigiastre, poi rosa-grigiastre.", "Gambo lungo e sottile, brunastro e fibrilloso-striato longitudinalmente, con micelio bianco alla base."],
    "Fruttificazione molto precoce in primavera, spesso in ambienti con conifere.",
    "field_confirmatory",
    { diagnosticNote: "La separazione da alcuni Entoloma primaverili richiede spesso microscopia." },
  ),
  "Entoloma clypeatum s.l.": p(
    ["Cappello grigio-bruno igrofano con ampio umbone a scudo e margine spesso ondulato.", "Lamelle bianche-grigie poi rosa-salmone.", "Gambo robusto pallido e fibrilloso."],
    "Fruttificazione primaverile strettamente associata a Rosaceae legnose.",
    "field_high_confidence_at_source_rank",
  ),
  "Entoloma saundersii": p(
    ["Cappello argenteo-grigio o grigio-bruno, sericeo-fibrilloso e spesso con lucentezza metallica.", "Lamelle da pallide a rosa con la maturazione.", "Gambo pallido, spesso contorto, longitudinalmente fibrilloso."],
    "Fruttificazione molto precoce, da fine inverno a primavera, tipicamente presso Ulmus.",
  ),
  "Flammulina velutipes s.l.": p(
    ["Cappello giallo-arancio o bruno-arancio, liscio e nettamente viscido con umidità.", "Lamelle bianco-crema relativamente chiare.", "Gambo tenace senza anello, progressivamente bruno scuro fino a nero e vellutato nella parte inferiore."],
    "Lignicola e tipicamente tardo-autunnale/invernale.",
    "field_high_confidence_at_source_rank",
  ),
  "Galerina marginata group": p(
    ["Piccolo cappello ambra-bruno o bruno-rossastro, fortemente igrofano e spesso striato per trasparenza al margine.", "Lamelle ocra poi bruno-ruggine.", "Gambo esile con piccolo anello o zona anulare fugace, sotto prevalentemente fibrilloso."],
    "Lignicola su conifere e latifoglie; profilo riferito al gruppo G. marginata.",
    "field_high_confidence_at_source_rank",
    { diagnosticNote: "In caso di dubbio con Kuehneromyces la determinazione professionale richiede conferma fine." },
  ),
  "Hygrocybe conica s.l.": p(
    ["Cappello nettamente conico o conico-campanulato, giallo-arancio-rosso.", "Lamelle spesse e ceracee, libere o strettamente attaccate.", "Gambo slanciato giallo-aranciato, spesso fibrilloso."],
    "Basidioma che annerisce nettamente per manipolazione, lesione o invecchiamento.",
    "field_high_confidence_at_source_rank",
  ),
  "Hygrocybe punicea": p(
    ["Grande cappello rosso sangue o cremisi, liscio e leggermente untuoso-viscido.", "Lamelle molto spesse e ceracee, relativamente spaziate, giallo-arancio.", "Gambo robusto, asciutto, fortemente fibrilloso-striato, rosso-arancio con base giallo-biancastra."],
    "Taglia nettamente grande per il genere; tipica di prati permanenti poco fertilizzati.",
  ),
  "Hygrophorus marzuolus": p(
    ["Cappello molto carnoso e irregolare, biancastro da giovane poi grigio-piombo fino a bruno-nerastro.", "Lamelle spesse e ceracee, bianche poi grigiastre, adnate o subdecorrenti.", "Gambo corto e grosso, bianco poi grigiastro."],
    "Fruttificazione invernale-primaverile molto precoce, spesso parzialmente interrata.",
  ),
  "Hygrophorus russula": p(
    ["Cappello robusto bianco-rosato con fitte fibrille o macchie rosso-vinose/porpora.", "Lamelle relativamente fitte per un Hygrophorus, bianche poi macchiate di rosso-vinoso.", "Gambo pieno e robusto, bianco con striature o macchie vinose."],
    "Associato soprattutto a querce e altre latifoglie, frequentemente in ambiente mediterraneo.",
  ),
  "Hygrophorus penarioides": p(
    ["Basidioma grande e robusto, bianco-avorio.", "Cappello convesso con ampio umbone e margine inizialmente involuto.", "Gambo grosso, bianco e nettamente attenuato verso la base, con apice finemente fioccoso."],
    "Associazione con Quercus: criterio di campo fondamentale rispetto al vicino H. penarius associato a Fagus.",
    "field_high_confidence_when_host_known",
    { diagnosticNote: "Per separazione assoluta da H. penarius può essere necessaria conferma molecolare." },
  ),
  "Hypholoma fasciculare": p(
    ["Crescita in cespi molto numerosi su legno o radici interrate.", "Cappello giallo-zolfo con centro più aranciato o brunastro.", "Lamelle gialle nel giovane, poi tipicamente giallo-verdi/olivastre e infine scure."],
    "Gambo giallo più brunastro in basso, con velo o zona anulare effimera.",
  ),
  "Hypholoma lateritium": p(
    ["Cappello con centro nettamente rosso-mattone o rosso-arancio e margine più giallastro.", "Lamelle giallastre poi grigie e grigio-olivastre, meno vivamente verdastre di H. fasciculare.", "Gambo giallo-ocraceo in alto e bruno-rossastro verso la base, con debole zona cortinale."],
    "Cespitoso su legno marcescente, soprattutto di latifoglie.",
  ),
  "Lentinula edodes": p(
    ["Cappello bruno-ocraceo o bruno scuro, carnoso, spesso con squamule o verruche biancastre.", "Lamelle bianche-crema non decorrenti, fitte, che possono macchiarsi di bruno se lesionate.", "Gambo centrale o eccentrico, corto e fibroso-tenace, con residui di velo o anello fugace."],
    "Lignicolo su latifoglie e molto frequentemente coltivato.",
  ),
  "Lepiota subincarnata (= L. josserandii)": p(
    ["Piccolo cappello bianco-carnicino con squamule rosa-incarnato o rosa-brunastre più unite al centro.", "Lamelle libere, fitte, biancastre-crema.", "Gambo sottile rosato/carnicino con residui velari fibrilloso-fioccosi e base bruno-rossastro-vinosa."],
    "Frequente in prati, radure, parchi e giardini.",
    "field_confirmatory",
    { diagnosticNote: "Per separazione specifica fine da piccole Lepiota affini è spesso utile la microscopia." },
  ),
  "Lepiota brunneoincarnata": p(
    ["Cappello crema-carnicino con disco scuro e squame concentriche bruno-rossastre o vinose.", "Lamelle libere, fitte e bianche-crema.", "Gambo biancastro in alto e ricoperto inferiormente da squamule bruno-vinose, con zona anulare fugace."],
    "Frequente in prati, aiuole, margini e ambienti antropizzati.",
    "field_high_confidence_when_typical",
  ),
  "Lepiota cristata": p(
    ["Piccolo cappello con disco centrale bruno-rossastro e squamule brune su fondo bianco-crema.", "Lamelle libere, fitte e bianche-crema.", "Odore forte, penetrante e sgradevole, tipicamente gommoso o simile a Scleroderma."],
    "Gambo chiaro, talvolta con tonalità rosa-lilacine in basso; anello sottile e fugace.",
    "field_high_confidence_when_typical",
  ),
  "Lepiota elaiophylla": p(
    ["Cappello molto piccolo, con centro bruno e squamette brune su fondo giallastro.", "Lamelle nettamente giallo-citrine fino a giallo-verdastre.", "Gambo giallo-citrino superiormente e grigio-ocra inferiormente, con fiocchi sotto la zona anulare."],
    "Caratteristica di serre, terricci e vasi da fiori.",
    "field_high_confidence_when_typical",
    { diagnosticNote: "Fuori dall'habitat artificiale tipico confrontare specie affini e confermare se necessario." },
  ),
  "Chlorophyllum molybdites": p(
    ["Grande lepiotoide con cappello bianco e grosse squame beige-brunastre.", "Lamelle libere inizialmente bianche, poi grigio-verdi fino a verdi a maturità.", "Gambo robusto e liscio, senza disegno a pelle di serpente, con grande anello."],
    "Specie di prati, parchi e giardini in climi caldi; sporata verde come conferma avanzata.",
  ),
  "Echinoderma asperum s.l.": p(
    ["Cappello ricoperto da vistose verruche o squame piramidali erette bruno-ocracee.", "Lamelle libere, fitte e bianche, spesso con biforcazioni o anastomosi.", "Grande anello membranoso-cotonoso e gambo squamoso sotto l'anello."],
    "Odore pungente, terroso-gommoso, spesso simile a quello di Lepiota cristata.",
    "field_high_confidence_at_source_rank",
  ),
  "Leucoagaricus leucothites s.l.": p(
    ["Cappello bianco-avorio, liscio e sericeo, privo di grosse squame.", "Lamelle libere molto fitte, bianche poi spesso debolmente rosa-carne.", "Gambo bianco con anello sottile e base semplicemente ingrossata, senza volva."],
    "Tipico di prati, parchi e bordi stradali; la base deve essere osservata integra.",
    "field_high_confidence_when_typical",
    { safetyCheck: "Escludere obbligatoriamente Amanita bianche: base integra, assenza reale di volva e controllo di esemplari maturi." },
  ),
  "Chlorophyllum rhacodes s.l.": p(
    ["Grande cappello con grosse squame brune su fondo biancastro.", "Carne e superfici che al taglio o contusione virano rapidamente arancio, poi rosso-vinoso o bruno.", "Gambo relativamente liscio, senza disegno a pelle di serpente, con anello spesso generalmente mobile."],
    "Base del gambo ingrossata; profilo riferito al gruppo s.l.",
    "field_high_confidence_at_source_rank",
  ),
  "Macrolepiota procera s.l.": p(
    ["Basidioma molto grande e slanciato, cappello pallido con grandi squame brune e umbone centrale scuro.", "Gambo alto con evidente disegno bruno a pelle di serpente.", "Grande anello doppio, spesso e mobile sul gambo."],
    "Carne sostanzialmente bianca, senza rapido viraggio arancio-rosso del gruppo rhacodes.",
    "field_high_confidence_at_source_rank",
  ),
  "Lepista nuda s.l.": p(
    ["Giovane basidioma con cappello, lamelle e gambo lilla-violetti, colori che sbiadiscono con l'età.", "Lamelle fitte da adnate a sinuate, senza cortina.", "Gambo solido e fibroso, spesso clavato alla base, senza anello."],
    "Fruttificazione tardo-autunnale/invernale su lettiera e residui organici.",
    "field_high_confidence_at_source_rank",
  ),
  "Lepista flaccida s.l.": p(
    ["Cappello ocra-arancio o fulvo, igrofano, presto depresso-imbutiforme.", "Lamelle sottili, molto fitte e profondamente decorrenti.", "Gambo corto e fibrilloso, più pallido del cappello, con base tomentosa."],
    "Crescita gregaria o cespitosa in archi sulla lettiera, soprattutto sotto conifere.",
    "field_high_confidence_at_source_rank",
  ),
  "Leucopaxillus giganteus s.l.": p(
    ["Cappello enorme, bianco-crema, da convesso a piano e infine profondamente imbutiforme.", "Lamelle bianche-avorio molto fitte e nettamente decorrenti.", "Gambo corto e robusto rispetto al diametro del cappello."],
    "Grandi gruppi, archi o cerchi in prati, radure e margini.",
    "field_high_confidence_at_source_rank",
  ),
  "Leucopaxillus gentianeus": p(
    ["Cappello asciutto, opaco-feltrato, uniformemente bruno-camoscio o bruno-rossastro.", "Lamelle molto fitte e bianchissime, facilmente separabili dalla carne del cappello.", "Gambo bianco, pieno e robusto, con abbondante feltro miceliare bianco alla base."],
    "Crescita gregaria in file, archi o cerchi, soprattutto in coniferete.",
  ),
  "Lyophyllum decastes s.l.": p(
    ["Crescita in grandi cespi compatti con numerosi gambi confluenti alla base.", "Cappelli lisci, irregolari o lobati, da grigi a grigio-bruni.", "Lamelle chiare e fitte che non anneriscono vistosamente alla pressione."],
    "Frequente su terreni disturbati, sentieri, margini e aree erbose.",
    "field_high_confidence_at_source_rank",
  ),
  "Lyophyllum specie annerenti": p(
    ["Portamento tricolomatoide con cappello grigio-bruno, spesso igrofano.", "Lamelle pallide o grigiastre che dopo contusione virano progressivamente al grigio scuro o nero.", "Gambo e carne che anneriscono anch'essi per lesione o invecchiamento."],
    "L'annerimento può essere lento: osservare anche dopo alcuni minuti.",
    "field_high_confidence_at_source_rank",
  ),
  "Lyophyllum connatum": p(
    ["Basidiomi completamente bianchi con cappello liscio e asciutto.", "Lamelle bianche molto fitte, adnate o appena decorrenti.", "Crescita in cespi con basi dei gambi saldate o connesse."],
    "Saprotrofo su terreno disturbato ricco di lettiera; esemplari isolati richiedono maggiore cautela.",
    "field_high_confidence_when_typical",
  ),
  "Mycena sez. Purae": p(
    ["Portamento mycenoide: cappello conico-campanulato e gambo esile e fragile.", "Tonalità frequenti lilla, violette, rosa o porporine.", "Odore nettamente rafanoide, soprattutto dopo manipolazione."],
    "Nel defined set S1, M. pelianthina si distingue per il filo lamellare bruno-porpora o viola-nerastro.",
    "defined_set_s1",
    { diagnosticNote: "Denominazione S1 mantenuta; M. pelianthina non appartiene alla subsect. Purae nella sistematica moderna." },
  ),
  "Omphalotus olearius": p(
    ["Basidioma giallo-arancio o arancio-rossastro.", "Vere lamelle sottili, fitte e fortemente decorrenti, non pliche ottuse.", "Crescita lignicola e spesso fortemente cespitosa alla base di olivi o altre latifoglie."],
    "Gambo spesso eccentrico e carne fibrosa-tenace.",
  ),
  "Panaeolus cyanescens": p(
    ["Piccolo cappello bianco-grigiastro da emisferico a campanulato.", "Lamelle tipicamente marezzate grigio-nere per maturazione disomogenea delle spore.", "Viraggio blu o blu-verde rapido e marcato alla lesione, soprattutto sul gambo."],
    "Gambo molto esile, pallido e privo di vero anello; frequente su letame o prati fortemente concimati.",
    "field_high_confidence_when_typical",
    { diagnosticNote: "Tra Panaeolus bluescenti atipici la specie fine può richiedere microscopia." },
  ),
  "Kuehneromyces mutabilis": p(
    ["Cappello fortemente igrofano e spesso bicolore, con centro che schiarisce asciugando e margine più scuro da umido.", "Gambo nettamente chiaro e quasi liscio sopra l'anello, bruno-scuro e squamoso sotto.", "Anello membranoso ben evidente negli esemplari giovani."],
    "Grandi cespi su ceppaie e legno, soprattutto di latifoglie.",
    "field_high_confidence_when_typical",
    { safetyCheck: "Escludere Galerina marginata group: in caso di dubbio su gambo/anello o campione incompleto non chiudere la determinazione sul solo macro." },
  ),
  "Pleurotus eryngii s.l.": p(
    ["Cappello molto carnoso beige-bruno e relativamente spesso.", "Lamelle bianche-crema nettamente decorrenti.", "Gambo robusto, centrale o eccentrico, molto più sviluppato rispetto a molti altri Pleurotus."],
    "Sviluppo apparentemente terricolo ma associato a radici o basi di Apiaceae, soprattutto Eryngium e Ferula.",
    "field_high_confidence_at_source_rank",
  ),
  "Pleurotus ostreatus": p(
    ["Cappello a conchiglia o ventaglio, grigio, grigio-blu o bruno-grigiastro.", "Lamelle chiare, fitte e fortemente decorrenti.", "Gambo laterale o eccentrico molto corto, talvolta quasi assente, con carpofori sovrapposti."],
    "Lignicolo soprattutto su latifoglie, spesso nella stagione fredda.",
  ),
  "Pleurotus cornucopiae (incluso P. citrinopileatus)": p(
    ["Crescita lignicola in gruppi con portamento pleurotoide.", "Gambo ben sviluppato, spesso ramificato o fuso alla base.", "Lamelle fortemente decorrenti e ramificate fino quasi al substrato."],
    "Colore orientativo nel defined set: P. cornucopiae pallido-crema/ocraceo, P. citrinopileatus giallo limone vivo.",
    "defined_set_s1",
  ),
  "Stropharia rugosoannulata": p(
    ["Grande cappello inizialmente rosso-vinoso o bordeaux, poi scolorente al bruno-beige.", "Grande anello pendulo con faccia inferiore rugosa o radialmente scanalata.", "Lamelle grigie nel giovane poi porpora-brune a maturità."],
    "Tipica di cippato, pacciamature e residui legnosi, con robusti rizomorfi bianchi alla base.",
  ),
  "Tricholoma pardinum": p(
    ["Grande cappello grigio con grosse squame scure concentriche fortemente contrastanti su fondo biancastro.", "Lamelle bianche-paglierine, spesse e smarginate.", "Gambo robusto biancastro, spesso molto ingrossato alla base."],
    "Associato soprattutto a Fagus e Abies su suoli calcarei.",
  ),
  "Tricholoma filamentosum": p(
    ["Cappello grigio radialmente fibrilloso-squamuloso con poco contrasto fra squame e fondo.", "Lamelle bianco-paglia che possono brunire alla lesione.", "Gambo chiaro, fibrilloso, spesso leggermente clavato."],
    "Prevalentemente associato a latifoglie come Fagus, Quercus e Castanea.",
  ),
  "Tricholoma josserandii": p(
    ["Cappello grigio-topo relativamente liscio e poco squamoso.", "Lamelle bianche-crema smarginate.", "Gambo chiaro che tende ad assottigliarsi verso la base."],
    "Odore caratteristico di cimice, Lactarius quietus o olio di lino dopo sezionamento.",
  ),
  "Tricholoma equestre": p(
    ["Cappello giallo limone poi giallo-bruno/miele, viscido e lucido da umido, con fini squamule brune aderenti.", "Lamelle nettamente gialle e smarginate.", "Gambo giallo-paglierino o giallo vivo, privo di anello."],
    "Micorriza tipica con Pinus su suoli poveri e sabbiosi.",
    "field_high_confidence_when_host_known",
  ),
  "Tricholoma portentosum": p(
    ["Cappello grigio scuro con fibrille radiali nerastre, lucido-viscido.", "Lamelle inizialmente chiare che acquistano tonalità giallo-limone.", "Gambo bianco che tende al giallo, soprattutto nelle zone lesionate."],
    "Odore farinaceo più evidente dopo il taglio; prevalentemente con conifere.",
  ),
  "Tricholoma terreum": p(
    ["Cappello grigio-cenere fino a grigio-nerastro, asciutto e densamente feltrato/tomentoso.", "Lamelle bianche-grigiastre smarginate, senza evidenti viraggi rossi.", "Carne bianca con odore molto debole, non nettamente farinaceo."],
    "Frequente con Pinus, spesso su terreni sabbiosi, limosi o disturbati.",
  ),
  "Tricholoma saponaceum s.l.": p(
    ["Cappello molto variabile ma spesso grigio-verde o olivastro.", "Odore caratteristico di sapone neutro.", "Carne e soprattutto base del gambo che lentamente assumono tonalità rosate o salmone dopo lesione."],
    "Lamelle piuttosto spesse e spaziate, bianche-crema o olivastre.",
    "field_high_confidence_at_source_rank",
  ),
  "Tricholoma columbetta": p(
    ["Cappello completamente bianco-crema, radialmente sericeo-fibrilloso e lucente.", "Lamelle bianche-crema smarginate.", "Gambo bianco spesso con macchie verde-bluastre, brunastre o rosate verso la base."],
    "Tipico di boschi di latifoglie.",
  ),
  "Tricholoma album s.l. (incl. T. stiparophyllum, T. lascivum e altri)": p(
    ["Basidiomi bianchi o crema, con cappello liscio o debolmente vellutato.", "Lamelle bianche-paglierine smarginate.", "Odori forti e peculiari: miele/rafanoide oppure rancido-nauseante secondo il taxon."],
    "L'albero simbionte orienta il gruppo: Quercus verso album, Betula verso stiparophyllum, Fagus verso lascivum.",
    "field_high_confidence_at_source_rank",
  ),
  "Tricholoma gruppo T. terreum (T. scalpturatum, T. orirubens, T. squarrulosum e altre)": p(
    ["Cappelli grigi, grigio-bruni o nerastri, fibrillosi o squamulosi.", "Lamelle chiare e smarginate.", "Gambi chiari senza vero anello."],
    "Viraggi orientano: scalpturatum tende al giallo; orirubens può arrossare e ha micelio basale giallo; squarrulosum ha squamule nerastre anche sul gambo.",
    "field_high_confidence_at_source_rank",
  ),
  "Tricholoma gruppo Virgati (T. virgatum, T. sciodes, T. bresadolanum)": p(
    ["Cappelli grigi, da argentei a scuri, radialmente fibrillosi e spesso conici o umbonati.", "Lamelle bianche-grigiastre smarginate.", "Gambi pallidi o grigi, fibrosi e privi di vero anello."],
    "Forma del cappello e ospite orientano: conifere/Betula verso virgatum, Fagus verso sciodes, Quercus e gambo squamoso verso bresadolanum.",
    "field_high_confidence_at_source_rank",
  ),
  "Tricholoma sejunctum": p(
    ["Cappello giallo-verde, verde oliva o senape, leggermente viscido, con forti fibrille radiali più scure.", "Lamelle larghe, bianche o appena giallastre, smarginate e relativamente spaziate.", "Gambo bianco in alto con sfumature oliva/senape inferiormente, spesso attenuato verso la base."],
    "Micorrizico soprattutto con latifoglie su suoli calcarei o argillosi.",
    "field_high_confidence_when_host_known",
  ),
  "Tricholoma sulphureum": p(
    ["Cappello, lamelle, gambo e buona parte della carne nei toni giallo-zolfo.", "Lamelle spesse, larghe e relativamente distanziate, giallo-zolfo o giallo-limone.", "Odore fortissimo, chimico e nauseante, di gas o catrame."],
    "Micelio basale spesso giallo; il morfotipo classico è macroscopicamente molto caratteristico.",
    "field_high_confidence_when_typical",
    { diagnosticNote: "Le linee criptiche interne al complesso possono richiedere risoluzione molecolare." },
  ),
  "Tricholoma sez. Genuina (= gruppo Albobrunnei)": p(
    ["Cappelli giallo-bruni, arancio-bruni, rosa-bruni o rosso-bruni, spesso viscosi o fibrilloso-squamulosi.", "Lamelle generalmente bianche o crema e smarginate, in contrasto con il cappello bruno.", "Gambo fibroso, spesso chiaro superiormente e più bruno o fibrilloso inferiormente."],
    "Morfogruppo ectomicorrizico S1: l'ospite è molto utile per orientare le singole specie.",
    "defined_morphogroup_s1",
  ),
  "Tricholoma acerbum s.l.": p(
    ["Grande cappello crema-ocra, massiccio, con margine a lungo involuto e vistosamente costolato o scanalato.", "Lamelle crema-giallastre molto fitte.", "Gambo robusto e chiaro."],
    "Specie termofile soprattutto con Quercus e Castanea su suoli calcarei.",
    "field_high_confidence_at_source_rank",
  ),
  "Volvopluteus gloiocephalus": p(
    ["Grande cappello bianco-grigiastro con centro più scuro, fortemente viscido da umido.", "Lamelle libere, inizialmente bianche poi rosa-salmone.", "Grande volva membranosa sacciforme alla base e assenza di anello."],
    "Frequente su terreni disturbati, campi, compost e prati ricchi.",
  ),
  "Volvariella volvacea": p(
    ["Cappello grigio o grigio-bruno, ovale-campanulato nel giovane e poi espanso, sericeo-fibrilloso.", "Lamelle completamente libere, pallide nel giovane e rosa/rosa-brunastre a maturità.", "Grande volva membranosa sacciforme alla base e completa assenza di anello."],
    "Saprotrofa termofila su paglia e residui vegetali in decomposizione; largamente coltivata.",
    "field_high_confidence_when_typical",
    { safetyCheck: "Allo stadio chiuso non attribuire la specie dalla sola superficie esterna: escludere obbligatoriamente Amanita volvate con esame esperto dell'esemplare integro." },
  ),
  "Lactarius sez. Deliciosi": p(
    ["Latice arancio, rosso o vinoso.", "Frequenti inverdimenti di latice e superfici con lesione o invecchiamento.", "Cappello spesso zonato e gambo frequentemente scrobicolato."],
    "Forte specificità ecologica con conifere come Pinus, Picea o Abies.",
    "field_high_confidence_at_source_rank",
  ),
  "Lactarius porniniae": p(
    ["Cappello arancio o arancio-rossastro, leggermente viscido con umidità.", "Latice bianco, abbondante e sostanzialmente immutabile.", "Odore fruttato-aromatico, spesso ricordante la buccia d'arancia."],
    "Associazione praticamente esclusiva con Larix.",
  ),
  "Lactarius volemus s.l.": p(
    ["Cappello asciutto e vellutato, arancio-bruno o albicocca.", "Latice bianco eccezionalmente abbondante che seccando macchia di bruno.", "Lamelle crema che bruniscono fortemente alla manipolazione."],
    "Odore caratteristico di pesce o crostacei, più evidente negli esemplari maturi.",
    "field_high_confidence_at_source_rank",
  ),
  "Lactarius tesquorum": p(
    ["Cappello crema-carnicino o giallo-ocraceo con superficie feltrato-lanosa.", "Latice bianco.", "Margine nettamente pubescente-lanoso, soprattutto nel giovane."],
    "Specie mediterranea associata a Cistus.",
  ),
  "Russula Foetentinae": p(
    ["Cappello giallo-bruno o ocra, frequentemente molto viscido o glutinoso.", "Margine nettamente tubercolato-striato o scanalato.", "Odore forte e sgradevole, fetido, ureico o clorato."],
    "Lamelle spesso macchiantesi di bruno e talvolta essudanti goccioline nei giovani.",
    "field_high_confidence_at_source_rank",
  ),
  "Russula Compactae Nigricantinae": p(
    ["Basidiomi robusti inizialmente biancastri o grigiastri, progressivamente più scuri.", "Carne e superfici che dopo lesione arrossano e/o anneriscono fino al nero.", "Lamelle bianche-crema che partecipano al viraggio, senza emissione di latice."],
    "Nel morfotipo R. nigricans le lamelle sono particolarmente spesse e distanti, ma non generalizzare questo tratto a tutto il gruppo.",
    "field_high_confidence_at_source_rank",
  ),
  "Russula Compactae Lactarioides (= gruppo R. delica)": p(
    ["Grande cappello bianco-crema, carnoso, spesso sporco di terra e presto depresso-imbutiforme.", "Gambo corto e massiccio.", "Lamelle chiare, da adnate a decorrenti, con completa assenza di latice nonostante l'aspetto lattarioide."],
    "Frequente sviluppo parzialmente interrato.",
    "field_high_confidence_at_source_rank",
  ),
  "Boletus edulis s.l.": p(
    ["Pori inizialmente bianchi, poi gialli e infine verde-oliva.", "Carne bianca e sostanzialmente immutabile, senza viraggio blu.", "Gambo almeno in parte reticolato."],
    "Assenza di pori rossi e di viraggi azzurri; profilo riferito al gruppo dei porcini.",
    "field_high_confidence_at_source_rank",
  ),
  "Boletus sez. Luridi": p(
    ["Imenoforo con pori frequentemente arancio-rossi o rossi almeno a maturità.", "Carne gialla che vira al blu alla sezione o alla pressione.", "Gambo robusto giallo-rosso decorato, secondo il taxon, da reticolo oppure punteggiature."],
    "Morfogruppo S1 dei boleti a pori colorati e carne bluescente.",
    "defined_morphogroup_s1",
  ),
  "Boletus (Rubroboletus) satanas": p(
    ["Grande cappello molto pallido, bianco-grigiastro o crema.", "Pori presto arancio-rossi fino a rosso carminio, bluescenti alla pressione.", "Gambo eccezionalmente tozzo o obeso, giallo in alto e rosa-rosso/porpora inferiormente, con reticolo."],
    "Specie termofila di latifoglie, soprattutto querce, spesso su terreno calcareo.",
  ),
  "Boletus pulchrotinctus": p(
    ["Cappello pallido biancastro, beige o ocra chiaro con caratteristica fascia rosa, rosa-violetta o lilla al margine.", "Pori gialli poi giallo-arancio, rapidamente bluescenti alla pressione.", "Gambo massiccio giallastro con frequenti tonalità rosa mediane e fine reticolo soprattutto in alto."],
    "Termofilo con latifoglie, soprattutto Quercus, su terreno calcareo.",
    "field_high_confidence_when_typical",
  ),
  "Boletus (Neoboletus) erythropus s.l.": p(
    ["Cappello bruno scuro, asciutto e vellutato.", "Pori arancio-rossi o rosso scuro che virano immediatamente al blu.", "Gambo giallo-arancio fittamente punteggiato di rosso, senza reticolo."],
    "Carne gialla con viraggio al blu molto rapido e intenso.",
    "field_high_confidence_at_source_rank",
  ),
  "Boletus (Suillellus) luridus": p(
    ["Cappello bruno-olivastro molto variabile.", "Pori arancio-rossi o rosso-mattone con forte viraggio blu.", "Gambo giallo-arancio con vistoso reticolo rosso a maglie grandi e allungate."],
    "Carne gialla spesso con zona subimeniale rossastra e rapido azzurramento.",
  ),
  "Boletus queletii e specie vicine/intermedie": p(
    ["Cappello nei toni ocra-arancio, bruno-arancio o rossastri.", "Pori da giallo-arancio a rossi, fortemente bluescenti.", "Gambo privo di reticolo e decorato da minute punteggiature o granulazioni rosse."],
    "Base del gambo e carne basale tipicamente rosso-vinose; gruppo didattico S1.",
    "field_high_confidence_at_source_rank",
  ),
  "Caloboletus radicans": p(
    ["Cappello molto pallido, bianco-grigiastro o crema.", "Pori giallo-limone che virano intensamente al blu.", "Gambo giallastro, senza evidenti tonalità rosse, spesso attenuato o radicante alla base."],
    "Carne giallo-pallida che azzurra rapidamente al taglio.",
  ),
  "Caloboletus calopus": p(
    ["Cappello beige-grigiastro o camoscio, pallido.", "Pori gialli che virano al blu.", "Gambo fortemente contrastato: giallo in alto e rosso-rosa nella parte inferiore, con evidente reticolo."],
    "Carne che azzurra al taglio.",
  ),
  "Gyroporus cyanescens": p(
    ["Basidioma pallido crema-paglierino con cappello asciutto.", "Gambo fragile, internamente cavernoso o cavo.", "Carne e superfici lesionate con viraggio rapidissimo azzurro-blu intenso."],
    "Gambo privo di reticolo: la coppia gambo cavo + forte azzurramento è altamente diagnostica.",
  ),
  "Gyroporus castaneus s.l.": p(
    ["Cappello castagna o cannella, asciutto.", "Pori inizialmente bianchi-crema e sostanzialmente immutabili.", "Gambo internamente cavernoso o cavo."],
    "Carne bianca che non azzurra, in contrasto con G. cyanescens.",
    "field_high_confidence_at_source_rank",
  ),
  "Hygrophoropsis aurantiaca": p(
    ["Cappello arancio, sottile, depresso o imbutiforme.", "Vere lamelle sottili, fitte, ripetutamente forcate e profondamente decorrenti.", "Carne relativamente sottile e soffice, non compatta come nei Cantharellus."],
    "Gambo arancio, spesso più brunastro alla base, senza anello.",
  ),
  "Imleria badia": p(
    ["Cappello liscio bruno-baio, spesso viscido con umidità.", "Pori gialli poi olivastri, relativamente grandi o angolosi, che azzurrano alla pressione.", "Gambo giallo-brunastro con fibrille brune, senza reticolo."],
    "Carne biancastra-giallastra con azzurramento soprattutto sopra i tubuli.",
  ),
  "Suillus luteus": p(
    ["Cappello bruno-nocciola o bruno scuro con cuticola fortemente glutinosa e separabile.", "Pori gialli.", "Evidente anello membranoso sul gambo, residuo del velo parziale."],
    "Micorrizico con Pinus.",
  ),
  "Suillus granulatus": p(
    ["Cappello giallo-bruno o ruggine, viscido, con cuticola separabile.", "Pori gialli che nei giovani secernono goccioline biancastre o lattiginose.", "Gambo privo di anello e ornato da piccoli granuli o puntini ghiandolari."],
    "Micorrizico con pini, soprattutto specie a due aghi.",
  ),
  "Tylopilus felleus": p(
    ["Pori inizialmente bianchi che con la maturazione diventano chiaramente rosa.", "Gambo robusto con reticolo bruno grossolano e molto evidente.", "Carne bianca sostanzialmente non virante al blu."],
    "Cappello bruno-ocraceo dall'aspetto porcinoide; contrasto netto con i pori rosati maturi.",
  ),
  "Cantharellus cibarius complex": p(
    ["Imenoforo formato da pliche ottuse, carnose, forcate e decorrenti, non vere lamelle.", "Basidioma generalmente giallo o giallo-arancio, con cappello e gambo continui.", "Gambo pieno e carne compatta."],
    "Odore frequentemente fruttato o di albicocca; profilo riferito al complesso.",
    "field_high_confidence_at_source_rank",
  ),
  "Craterellus lutescens": p(
    ["Cappello sottile bruno-arancio, presto imbutiforme e perforato.", "Gambo cavo, giallo vivo o arancio-giallo.", "Imenoforo quasi liscio o appena rugoso, giallo-aranciato o rosato."],
    "Carne molto sottile ed elastica; pliche molto meno sviluppate che in C. tubaeformis.",
  ),
  "Craterellus tubaeformis": p(
    ["Cappello grigio-bruno o bruno, imbutiforme e perforato.", "Gambo giallo-ocraceo e cavo.", "Imenoforo con pieghe grigio-giallastre ben rilevate, forcate e anastomizzate, decorrenti."],
    "Frequente tra muschi e lettiera di conifere.",
  ),
  "Craterellus cornucopioides": p(
    ["Basidioma completamente a tromba o cornucopia, cavo fino alla base.", "Colori grigio-cenere, bruno-nerastri o neri.", "Superficie fertile esterna liscia o debolmente rugosa, senza vere pliche sviluppate."],
    "Carne molto sottile e membranacea.",
  ),
  "Gomphus clavatus": p(
    ["Basidiomi robusti, claviformi o vasiformi, spesso fusi e plurilobati.", "Giovani con marcate tonalità lilla-violetto, poi più ocracee.", "Imenoforo esterno rugoso, venoso-reticolato, grigio-violetto e decorrente."],
    "Prevalentemente in boschi maturi di Abies, Picea o Fagus.",
  ),
  "Hydnum spp. / H. repandum s.l. (incl. gruppo H. rufescens)": p(
    ["Imenoforo costituito da aculei fragili, non lamelle o pori.", "Cappello carnoso irregolare, bianco-crema, giallastro o arancio pallido.", "Carne compatta e cassante, senza latice."],
    "Gambo spesso eccentrico; profilo volutamente al rango Hydnum spp./gruppo S1.",
    "field_high_confidence_at_source_rank",
  ),
  "Hericium spp.": p(
    ["Basidioma bianco o crema e lignicolo.", "Imenoforo formato da lunghi aculei penduli.", "Forma globosa oppure fortemente ramificata, priva di vere lamelle o pori."],
    "Architettura orienta le specie: erinaceus globoso; coralloides/alpestre ramificati.",
    "field_high_confidence_at_source_rank",
  ),
  "Sarcodon imbricatus s.l. (incl. S. squamosus)": p(
    ["Grande cappello bruno con grosse squame imbricate e rialzate.", "Imenoforo ad aculei grigio-bruni.", "Gambo robusto e carne tenace."],
    "Ospite orientativo: S. imbricatus soprattutto Picea, S. squamosus soprattutto Pinus.",
    "field_high_confidence_at_source_rank",
  ),
  "Hapalopilus rutilans": p(
    ["Piccolo poliporo a mensola sessile, semicircolare o reniforme, relativamente sottile.", "Colore molto uniforme cannella, ocra-cannella o bruno-cannella su cappello e imenoforo.", "Carne fresca morbida e spugnosa; pori piccoli da rotondi ad angolosi."],
    "Cresce su rami e tronchi morti di latifoglie, frequentemente querce.",
    "field_high_confidence_when_typical",
  ),
  "Laetiporus sulphureus s.l.": p(
    ["Grandi mensole sovrapposte giallo-arancio.", "Superficie inferiore con piccoli pori giallo-zolfo.", "Carne giovane succosa e tenera, poi fragile o coriacea."],
    "Crescita direttamente sul legno; profilo riferito al complesso s.l.",
    "field_high_confidence_at_source_rank",
  ),
  "Albatrellus confluens": p(
    ["Più cappelli carnosi frequentemente confluenti e saldati, irregolari o lobati.", "Superficie rosa-ocra o arancio-salmone.", "Piccoli pori crema decorrenti su gambi corti e spesso fusi."],
    "Terrestre in boschi di conifere.",
  ),
  "Albatrellus ovinus s.l. (incl. A. subrubescens, A. citrinus)": p(
    ["Polipori terrestri stipitati e carnosi.", "Cappelli pallidi, bianco-crema o grigiastri.", "Piccoli pori bianchi-crema o giallastri."],
    "Conifere e viraggi orientano i taxa del defined group: citrinus tende a ingiallire; subrubescens è più legato a Pinus.",
    "field_high_confidence_at_source_rank",
  ),
  "Scutiger pes-caprae": p(
    ["Cappello bruno, reniforme o a ventaglio, nettamente squamoso.", "Grandi pori crema-giallastri, angolosi e decorrenti.", "Gambo robusto ed eccentrico o laterale."],
    "Crescita terrestre.",
  ),
  "Fistulina hepatica": p(
    ["Basidioma rosso carnoso a forma di lingua o fegato.", "Imenoforo formato da tubuli individualmente separati.", "Carne rossa e marezzata che al taglio può emettere succo rossastro."],
    "Cresce soprattutto su quercia e castagno.",
  ),
  "Grifola frondosa": p(
    ["Grande rosetta composta da moltissime piccole fronde o cappelli grigio-bruni.", "Ramificazione da una base comune.", "Superficie inferiore a pori bianchi-crema decorrenti."],
    "Non annerisce vistosamente alla contusione, a differenza di Meripilus giganteus.",
  ),
  "Polyporus umbellatus": p(
    ["Enorme struttura ramificata con decine o centinaia di piccoli cappelli.", "Ogni cappellino è tondeggiante o ombelicato e possiede un piccolo gambo.", "Pori bianchi decorrenti sui rami."],
    "Sviluppo da un grande sclerozio sotterraneo.",
  ),
  "Meripilus giganteus": p(
    ["Gigantesca rosetta di grandi cappelli a ventaglio bruno-chiari.", "Piccoli pori bianchi.", "Pori e carne che diventano rapidamente bruno-neri o neri alla contusione."],
    "Cresce alla base o sulle radici di grandi latifoglie, soprattutto faggio.",
  ),
  "Polyporus squamosus": p(
    ["Enorme cappello reniforme o a ventaglio, crema-ocra con grosse squame brune concentriche.", "Pori grandi e angolosi, decorrenti.", "Gambo corto eccentrico o laterale con base bruno-nera."],
    "Lignicolo su latifoglie.",
  ),
  "Ramaria formosa": p(
    ["Base e tronco principali biancastri, massicci e carnosi.", "Rami giovani nettamente rosa-salmone o arancio-salmone.", "Apici giovani giallo-limone o giallo vivo."],
    "Rami principali grossi e relativamente paralleli/eretti; la tricoloria è più affidabile nei giovani freschi.",
    "field_high_confidence_when_young",
    { diagnosticNote: "Negli esemplari maturi o scoloriti i colori convergono verso toni ocra e la specie fine richiede maggiore cautela." },
  ),
  "Ramaria pallida": p(
    ["Basidioma medio-grande, massiccio e molto ramificato, con tronco basale biancastro.", "Colorazione generale molto pallida: bianco-crema, grigio-beige o crema-ocraceo.", "Nei giovani compaiono tenui sfumature rosa-lilacine soprattutto verso gli apici."],
    "Carne biancastra e sostanzialmente immutabile; riconoscimento più forte nei giovani tipici.",
    "field_high_confidence_when_young",
    { diagnosticNote: "Negli esemplari vecchi i toni ocracei riducono la capacità discriminante del solo macro." },
  ),
  "Ramaria botrytis s.l.": p(
    ["Basidioma molto compatto a cavolfiore, originato da un grosso tronco bianco.", "Rami corti, robusti, pallidi e molto fitti.", "Apici giovani rosa, rosso-vinosi o porpora."],
    "Prevalentemente in boschi di latifoglie; profilo volutamente s.l.",
    "field_high_confidence_at_source_rank",
  ),
  "Auricularia auricula-judae": p(
    ["Basidioma auricolare o cupuliforme, sessile o brevemente stipitato, irregolarmente ripiegato.", "Consistenza gelatinosa-elastica da fresco, cartacea da secco ma capace di reidratarsi.", "Colore bruno-rossastro o bruno-grigiastro, con superficie esterna finemente tomentosa e faccia imeniale interna più liscia."],
    "Lignicola su latifoglie, frequentemente Sambucus.",
    "field_high_confidence_when_typical",
    { diagnosticNote: "Morfotipi molto scuri e densamente pelosi su Quercus cerris richiedono confronto con A. cerrina e, se necessario, microscopia." },
  ),
  "Gyromitra esculenta": p(
    ["Mitra cerebriforme con grosse circonvoluzioni irregolari.", "Colore castano o rosso-bruno.", "Gambo pallido, internamente cavo e lacunoso, con cappello saldato irregolarmente."],
    "Fruttificazione primaverile, spesso con conifere su suoli sabbiosi o disturbati.",
  ),
  "Sarcosphaera coronaria s.l.": p(
    ["Ascoma giovane globoso o appiattito, cavo e spesso semipogeo.", "Con la crescita si apre in una profonda coppa che si lacera in grossi lembi triangolari a corona o stella.", "Superficie fertile interna lilla-violetta o porpora, esterno molto più pallido."],
    "Primaverile su suoli calcarei; il rango s.l. evita di forzare la separazione delle specie occidentali criptiche.",
    "field_high_confidence_at_source_rank",
  ),
};

export const AUDITED_MINIMUM_FIELD_PROFILE_TARGET = 148;
export const AUDITED_MINIMUM_FIELD_PROFILE_VERSION = "scientific-baseline-1.0";
export const AUDITED_MINIMUM_FIELD_PROFILE_DATE = "2026-09-28";
export const AUDITED_MINIMUM_FIELD_PROFILE_REVIEW_STATUS = "reviewed" as const;

export function fieldProfileForSourceLabel(sourceLabel: string) {
  return auditedMinimumFieldProfiles[sourceLabel] ?? null;
}

export function validateAuditedMinimumFieldProfiles(sourceLabels: readonly string[]) {
  const errors: string[] = [];
  const sourceSet = new Set(sourceLabels);
  const keys = Object.keys(auditedMinimumFieldProfiles);

  if (sourceLabels.length !== AUDITED_MINIMUM_FIELD_PROFILE_TARGET) {
    errors.push(`source labels ${sourceLabels.length}; expected ${AUDITED_MINIMUM_FIELD_PROFILE_TARGET}`);
  }
  if (keys.length !== AUDITED_MINIMUM_FIELD_PROFILE_TARGET) {
    errors.push(`field profiles ${keys.length}; expected ${AUDITED_MINIMUM_FIELD_PROFILE_TARGET}`);
  }

  for (const label of sourceLabels) {
    const profile = auditedMinimumFieldProfiles[label];
    if (!profile) {
      errors.push(`missing audited field profile: ${label}`);
      continue;
    }
    if (profile.characters.length !== 3) {
      errors.push(`${label}: expected exactly 3 primary field characters`);
    }
    if (!profile.plusOne.trim()) {
      errors.push(`${label}: missing +1 differentiating character`);
    }
    const baseText = [...profile.characters, profile.plusOne].join(" ").toLocaleLowerCase("it");
    if (/\bkoh\b|sch[aä]ffer|reagent|reagente|microscop|sequenzi|\bdna\b/.test(baseText)) {
      errors.push(`${label}: base 3+1 contains a non-field confirmation method`);
    }
    if (/\bassaggio\b|\bsapore\b/.test(baseText)) {
      errors.push(`${label}: base 3+1 uses taste/assaggio`);
    }
  }

  for (const key of keys) {
    if (!sourceSet.has(key)) errors.push(`orphan audited profile: ${key}`);
  }

  return { ok: errors.length === 0, profileCount: keys.length, errors };
}
