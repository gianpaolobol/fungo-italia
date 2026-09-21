export interface MinimumGenusProfile {
  terminology: string[];
  morphology: string[];
  ecology: string;
}

const profiles: Record<string, MinimumGenusProfile> = {
  Agaricus: {
    terminology: ["Lamelle libere", "Sporata bruno-cioccolata", "Anello presente, volva assente"],
    morphology: ["Cappello carnoso; lamelle da rosate a bruno scuro con la maturazione.", "Gambo centrale con anello; base priva di volva. Odore e reazioni cromatiche sono spesso decisivi."],
    ecology: "Prevalentemente saprotrofi di prati, pascoli, parchi, lettiere e suoli ricchi di sostanza organica.",
  },
  Albatrellus: {
    terminology: ["Imenoforo a pori", "Poliporo terrestre stipitato", "Carne carnosa"],
    morphology: ["Basidiomi terrestri con cappello e gambo; superficie inferiore a piccoli pori.", "Carne soda, non legnosa, con tubuli saldati al contesto."],
    ecology: "Specie terrestri di bosco, generalmente ectomicorriziche, spesso associate a conifere.",
  },
  Amanita: {
    terminology: ["Lamelle libere", "Velo universale", "Velo parziale", "Volva o residui volvari"],
    morphology: ["Lamelle in genere bianche e libere; sporata bianca.", "Residui del velo universale alla base o sul cappello e, in molte specie, anello sul gambo."],
    ecology: "Genere prevalentemente ectomicorrizico con latifoglie e conifere; alcune linee oggi separate, come Saproamanita, hanno ecologia diversa.",
  },
  Auricularia: {
    terminology: ["Basidioma gelatinoso", "Forma auricolare", "Imenoforo liscio"],
    morphology: ["Corpi fruttiferi elastico-gelatinosi, spesso a forma di orecchio o coppa irregolare.", "Superficie fertile liscia o finemente venata, senza lamelle o pori."],
    ecology: "Saprotrofi o deboli parassiti lignicoli su rami, tronchi e legno morto di latifoglie.",
  },
  Boletus: {
    terminology: ["Tubuli e pori", "Imenoforo separabile", "Boleto carnoso"],
    morphology: ["Imenoforo formato da tubuli che terminano in pori, facilmente separabile dalla carne del cappello.", "Gambo pieno e carnoso, talvolta reticolato; eventuali viraggi e colori dei pori sono diagnostici."],
    ecology: "Ectomicorrizici di boschi di latifoglie e conifere, con associazioni arboree variabili secondo il taxon.",
  },
  Caloboletus: {
    terminology: ["Pori gialli", "Viraggio al blu", "Sapore amaro"],
    morphology: ["Boleti robusti con pori gialli e carne che può virare al blu al taglio o alla pressione.", "Gambo spesso colorato o reticolato; il sapore amaro è frequente e diagnostico."],
    ecology: "Ectomicorrizici in boschi di latifoglie e conifere, spesso su suoli calcarei o neutri.",
  },
  Calocybe: {
    terminology: ["Lamelle chiare", "Sporata bianca", "Carne compatta"],
    morphology: ["Agarico carnoso con lamelle chiare e sporata bianca.", "Cappello e gambo robusti; odore farinoso marcato in C. gambosa."],
    ecology: "Saprotrofi terrestri; C. gambosa è tipica di prati, margini erbosi, siepi e radure, soprattutto in primavera.",
  },
  Cantharellus: {
    terminology: ["Pliche imeniali", "Falso imenoforo lamellare", "Carne compatta"],
    morphology: ["Sotto il cappello presenta pliche o vene ottuse, ramificate e decorrenti, non vere lamelle separabili.", "Cappello e gambo continui, carne compatta e spesso odore fruttato."],
    ecology: "Ectomicorrizici di boschi di latifoglie e conifere, su suolo, spesso in gruppi.",
  },
  Chlorophyllum: {
    terminology: ["Lepiotoide", "Lamelle libere", "Anello", "Cappello squamoso"],
    morphology: ["Basidiomi medio-grandi con cappello squamoso, lamelle libere e anello sul gambo.", "Sporata bianca o verdastra secondo la specie; base priva di volva."],
    ecology: "Saprotrofi di prati, giardini, parchi, lettiere, compost e suoli ricchi.",
  },
  Clitocybe: {
    terminology: ["Lamelle decorrenti", "Habitus clitociboide", "Sporata chiara"],
    morphology: ["Cappello spesso piano-depresso o imbutiforme, con lamelle più o meno decorrenti.", "Gambo centrale senza volva; colore, odore, igrofaneità e sporata sono utili alla diagnosi."],
    ecology: "Prevalentemente saprotrofi della lettiera e dell'humus in boschi, prati e ambienti erbosi.",
  },
  Clitopilus: {
    terminology: ["Lamelle decorrenti", "Sporata rosa", "Odore farinoso"],
    morphology: ["Cappello biancastro o grigiastro, lamelle decorrenti che maturando assumono tonalità rosate.", "Sporata rosa; in C. prunulus è tipico l'odore farinaceo."],
    ecology: "Terrestri in boschi e radure; spesso associati a suoli ricchi di humus.",
  },
  Collybia: {
    terminology: ["Habitus collybioide", "Gambo tenace", "Sporata chiara"],
    morphology: ["Basidiomi generalmente slanciati con cappello sottile e gambo tenace o fibroso.", "Lamelle chiare; molti taxa storicamente inclusi in Collybia sono oggi distribuiti in generi differenti."],
    ecology: "Prevalentemente saprotrofi della lettiera, di residui vegetali e del legno in bosco.",
  },
  Coprinus: {
    terminology: ["Coprinoide", "Lamelle annerenti", "Deliquescenza", "Sporata nera"],
    morphology: ["Cappello inizialmente chiuso o campanulato; lamelle che scuriscono fino al nero.", "In molti taxa le lamelle e il cappello deliquescono o collassano rapidamente con la maturazione."],
    ecology: "Saprotrofi di suoli ricchi, legno, ceppaie, letame, compost e ambienti antropizzati.",
  },
  Cortinarius: {
    terminology: ["Cortina", "Sporata ruggine", "Ectomicorriza"],
    morphology: ["Nei giovani esemplari una cortina filamentosa collega margine del cappello e gambo.", "Lamelle da chiare a ruggine con la maturazione; sporata bruno-ruggine. Colori, odori e reazioni macrochimiche sono importanti."],
    ecology: "Genere ectomicorrizico molto ampio, legato a latifoglie e conifere in numerosi tipi di bosco.",
  },
  Craterellus: {
    terminology: ["Imenoforo liscio o venato", "Forma imbutiforme", "Carne sottile"],
    morphology: ["Basidiomi a tromba o imbuto, spesso con gambo cavo o attenuato.", "Superficie fertile liscia, rugosa o venata, senza vere lamelle."],
    ecology: "Ectomicorrizici terrestri di boschi di latifoglie e conifere, spesso gregari.",
  },
  Cyclocybe: {
    terminology: ["Lignicolo cespitoso", "Anello", "Sporata bruna"],
    morphology: ["Basidiomi carnosi spesso riuniti in cespi sul legno, con lamelle da chiare a brune.", "Gambo con anello evidente e sporata bruna."],
    ecology: "Saprotrofo e talvolta debole parassita su tronchi, ceppaie e radici di latifoglie.",
  },
  Echinoderma: {
    terminology: ["Lepiotoide", "Cappello verrucoso-squamoso", "Lamelle libere"],
    morphology: ["Cappello ricoperto da squame o verruche evidenti; lamelle chiare e libere.", "Gambo con zona anulare o anello, sporata bianca."],
    ecology: "Saprotrofi della lettiera e dell'humus in boschi, siepi, parchi e ambienti ricchi di residui vegetali.",
  },
  Entoloma: {
    terminology: ["Sporata rosa", "Spore angolose", "Lamelle rosate a maturità"],
    morphology: ["Lamelle che maturando assumono toni rosati per la sporata.", "Spore tipicamente angolose; habitus molto variabile, da robusto a esile."],
    ecology: "Ecologia molto varia: specie terrestri di bosco, prato e margine, con linee saprotrofe e altre associate alle piante.",
  },
  Fistulina: {
    terminology: ["Poliporo carnoso", "Tubuli separati", "Basidioma linguiforme"],
    morphology: ["Basidioma rosso-bruno, carnoso e spesso a forma di lingua o mensola.", "Tubuli distinti e non saldati tra loro, carattere insolito fra i polipori."],
    ecology: "Parassita e saprotrofo soprattutto su querce e castagno, alla base o sul tronco.",
  },
  Flammulina: {
    terminology: ["Lignicolo cespitoso", "Cappello viscido", "Gambo vellutato"],
    morphology: ["Cappello giallo-arancio o bruno, spesso viscido; lamelle chiare.", "Gambo senza anello, con base progressivamente bruno-scura e vellutata."],
    ecology: "Saprotrofi o deboli parassiti su legno di latifoglie, spesso fruttificanti nella stagione fredda.",
  },
  Galerina: {
    terminology: ["Piccolo agarico bruno", "Sporata ruggine-bruna", "Lignicolo o muscicolo"],
    morphology: ["Basidiomi piccoli o medi, spesso bruno-ocracei e igrofani.", "Lamelle e sporata bruno-ruggine; alcuni taxa presentano anello o zona anulare."],
    ecology: "Saprotrofi su legno, lettiera, muschi e torbiere; molte specie sono minute e difficili.",
  },
  Gomphus: {
    terminology: ["Basidioma clavato o vasiforme", "Imenoforo rugoso", "Carne compatta"],
    morphology: ["Basidioma massiccio, spesso a vaso o tromba irregolare.", "Superficie fertile esterna rugosa o plicata, senza vere lamelle."],
    ecology: "Terrestre e generalmente ectomicorrizico in boschi montani, soprattutto con conifere.",
  },
  Grifola: {
    terminology: ["Poliporo ramificato", "Rosetta di fronde", "Pori bianchi"],
    morphology: ["Grande basidioma composto da numerosi cappelli sovrapposti e ramificati da una base comune.", "Imenoforo a piccoli pori chiari; tessuto carnoso da giovane."],
    ecology: "Parassita e saprotrofo alla base o sulle radici di latifoglie, soprattutto querce e castagno.",
  },
  Gyromitra: {
    terminology: ["Ascomicete", "Mitra cerebriforme", "Ascoma stipitato"],
    morphology: ["Ascoma con cappello irregolarmente lobato o cerebriforme, saldato al gambo in modo variabile.", "Superficie fertile esterna; assenza di lamelle, pori o aculei."],
    ecology: "Terrestre, spesso primaverile, in boschi di conifere o misti e su terreni disturbati; ecologia trofica non uniforme.",
  },
  Gyroporus: {
    terminology: ["Boleto", "Gambo cavernoso", "Carne fragile"],
    morphology: ["Imenoforo a tubuli e pori; carne relativamente fragile.", "Gambo tipicamente cavo o suddiviso internamente in cavità, carattere molto utile."],
    ecology: "Ectomicorrizici terrestri di boschi di latifoglie e conifere.",
  },
  Hapalopilus: {
    terminology: ["Poliporo lignicolo", "Pori minuti", "Reazione violetta in KOH"],
    morphology: ["Piccoli basidiomi a mensola, da ocra a cannella, con imenoforo poroide.", "La reazione violacea con basi forti è un carattere diagnostico classico del gruppo."],
    ecology: "Saprotrofo lignicolo su rami e tronchi morti di latifoglie.",
  },
  Hericium: {
    terminology: ["Imenoforo ad aculei", "Lignicolo", "Basidioma bianco"],
    morphology: ["Basidiomi bianchi o crema formati da masse ramificate o compatte con lunghi aculei penduli.", "Assenza di cappello e lamelle nel senso tradizionale."],
    ecology: "Saprotrofi o deboli parassiti su tronchi, ferite e legno morto di latifoglie.",
  },
  Hydnum: {
    terminology: ["Imenoforo ad aculei", "Carne fragile", "Ectomicorriza"],
    morphology: ["Cappello carnoso con superficie inferiore ricoperta da aculei facilmente separabili.", "Gambo centrale o eccentrico; colori dal bianco-crema all'arancio."],
    ecology: "Ectomicorrizici terrestri di boschi di latifoglie e conifere.",
  },
  Hygrocybe: {
    terminology: ["Lamelle ceracee", "Colori vivaci", "Waxy cap"],
    morphology: ["Basidiomi spesso piccoli o medi, vivacemente colorati, con lamelle spesse e ceracee.", "Cappello talvolta viscido; alcuni gruppi anneriscono vistosamente."],
    ecology: "Tipiche di prati permanenti, pascoli e radure poco fertilizzati; relazioni trofiche complesse e non riconducibili a semplice saprotrofia.",
  },
  Hygrophoropsis: {
    terminology: ["Lamelle vere fitte e forcate", "Habitus cantarelloide", "Colore arancio"],
    morphology: ["Cappello depresso o imbutiforme, arancio, con lamelle sottili, fitte, forcate e decorrenti.", "Le lamelle vere la distinguono dai Cantharellus, che possiedono pliche ottuse."],
    ecology: "Saprotrofo su lettiera, residui legnosi e suoli acidi, soprattutto in boschi di conifere.",
  },
  Hygrophorus: {
    terminology: ["Lamelle ceracee", "Ectomicorriza", "Sporata bianca"],
    morphology: ["Basidiomi carnosi con lamelle spesse, ceracee e spesso decorrenti.", "Cappello asciutto o viscido; sporata bianca."],
    ecology: "Ectomicorrizici strettamente legati a boschi di latifoglie o conifere, spesso con preferenze di ospite.",
  },
  Hypholoma: {
    terminology: ["Lignicolo cespitoso", "Sporata porpora-bruna", "Lamelle scurenti"],
    morphology: ["Basidiomi in cespi su legno, con cappello giallo, arancio o mattone secondo la specie.", "Lamelle da chiare a verdastre o grigie, poi scure; sporata porpora-bruna."],
    ecology: "Saprotrofi su ceppaie, tronchi, radici e legno interrato.",
  },
  Imleria: {
    terminology: ["Boleto", "Pori giallo-oliva", "Viraggio azzurro"],
    morphology: ["Cappello bruno spesso viscido con umidità; imenoforo a pori gialli poi olivastri.", "Pori e carne possono virare al blu alla pressione o al taglio."],
    ecology: "Ectomicorrizica in boschi di conifere e latifoglie, spesso su suoli acidi.",
  },
  Kuehneromyces: {
    terminology: ["Lignicolo cespitoso", "Cappello igrofano", "Anello", "Sporata bruna"],
    morphology: ["Basidiomi cespitosi su legno con cappello marcatamente igrofano.", "Gambo con anello; lamelle e sporata brune a maturità."],
    ecology: "Saprotrofo su ceppaie e tronchi di latifoglie, più raramente conifere.",
  },
  Lactarius: {
    terminology: ["Latice", "Carne fragile", "Ectomicorriza"],
    morphology: ["Carne e lamelle fragili che, se lese, emettono latice di colore e viraggio variabili.", "Sporata chiara; cappello spesso depresso con maturità."],
    ecology: "Ectomicorrizici di latifoglie e conifere, con numerose associazioni specifiche di ospite.",
  },
  Laetiporus: {
    terminology: ["Poliporo a mensole", "Colori giallo-arancio", "Carne succulenta da giovane"],
    morphology: ["Grandi mensole sovrapposte di colore giallo zolfo e arancio.", "Imenoforo a pori; carne tenera da giovane, poi più fibrosa."],
    ecology: "Parassita e saprotrofo lignicolo su latifoglie e, in alcune linee, conifere.",
  },
  Lentinula: {
    terminology: ["Lignicolo", "Lamelle", "Carne tenace"],
    morphology: ["Cappello bruno squamuloso, lamelle chiare e gambo centrale o eccentrico.", "Carne relativamente tenace, adattata alla crescita su legno."],
    ecology: "Saprotrofo lignicolo su legno di latifoglie; L. edodes è ampiamente coltivata.",
  },
  Lepiota: {
    terminology: ["Lepiotoide", "Lamelle libere", "Sporata bianca", "Anello"],
    morphology: ["Basidiomi piccoli o medi con cappello squamoso, lamelle bianche libere e gambo con anello o zona anulare.", "Base priva di volva; dimensioni, decorazione del cappello e microscopia sono spesso decisive."],
    ecology: "Saprotrofi di humus, lettiera, parchi, giardini e suoli ricchi di sostanza organica.",
  },
  Lepista: {
    terminology: ["Sporata rosato-crema", "Lamelle fitte", "Habitus robusto"],
    morphology: ["Agarici carnosi con lamelle fitte, da adnate a decorrenti, e sporata chiara con tonalità rosate.", "Colori spesso lilla, bruni o aranciati secondo il taxon."],
    ecology: "Saprotrofi della lettiera, di humus ricco e di prati, spesso in gruppi o cerchi.",
  },
  Leucoagaricus: {
    terminology: ["Lepiotoide", "Lamelle libere", "Sporata bianca", "Anello"],
    morphology: ["Cappello da liscio a finemente squamoso, lamelle bianche libere e anello sul gambo.", "Base senza volva; carne e superfici possono mostrare viraggi."],
    ecology: "Saprotrofi di lettiera, parchi, giardini, serre, compost e suoli ricchi.",
  },
  Leucopaxillus: {
    terminology: ["Agarico robusto", "Sporata bianca", "Lamelle adnate-decurrenti"],
    morphology: ["Basidiomi robusti e carnosi, spesso grandi, con lamelle fitte da adnate a decorrenti.", "Carne tenace; sporata bianca e trama lamellare particolare."],
    ecology: "Prevalentemente saprotrofi della lettiera e dell'humus in boschi e radure.",
  },
  Lyophyllum: {
    terminology: ["Sporata bianca", "Crescita cespitosa frequente", "Carne tenace"],
    morphology: ["Agarici bianchi, grigi o bruni, spesso in cespi compatti.", "Lamelle chiare; alcuni gruppi anneriscono alla manipolazione."],
    ecology: "Ecologia eterogenea; molte specie sono saprotrofe terrestri, in suoli ricchi, boschi e aree disturbate.",
  },
  Macrolepiota: {
    terminology: ["Grande lepiotoide", "Anello mobile", "Gambo decorato", "Lamelle libere"],
    morphology: ["Cappello grande, squamoso, con umbone; lamelle bianche libere.", "Gambo slanciato spesso con disegno a pelle di serpente e anello spesso, generalmente mobile."],
    ecology: "Saprotrofi di prati, pascoli, margini, radure e boschi aperti.",
  },
  Marasmius: {
    terminology: ["Basidioma reviviscente", "Gambo tenace", "Sporata bianca"],
    morphology: ["Piccoli agarici con gambo sottile e tenace; molti recuperano consistenza dopo reidratazione.", "Lamelle spesso spaziate e cappello sottile."],
    ecology: "Saprotrofi di lettiera, foglie, aghi, residui erbacei e prati.",
  },
  Meripilus: {
    terminology: ["Grande poliporo a rosetta", "Pori bianchi", "Annerimento"],
    morphology: ["Grande basidioma composto da molte fronde sovrapposte da una base comune.", "Superfici e carne tendono ad annerire alla manipolazione o con l'età."],
    ecology: "Parassita radicale e saprotrofo alla base di latifoglie mature, in particolare faggio.",
  },
  Mycena: {
    terminology: ["Piccolo agarico", "Cappello conico-campanulato", "Sporata bianca"],
    morphology: ["Basidiomi minuti o piccoli, fragili, con cappello spesso conico o campanulato e margine striato.", "Gambo esile; odori, latice, colori e caratteri microscopici sono spesso diagnostici."],
    ecology: "Prevalentemente saprotrofi su lettiera, legno, corteccia, muschi e residui vegetali.",
  },
  Omphalotus: {
    terminology: ["Lignicolo cespitoso", "Lamelle vere decorrenti", "Colore arancio"],
    morphology: ["Basidiomi arancio o arancio-bruni, spesso in grossi cespi su legno o radici.", "Lamelle vere, sottili e fortemente decorrenti; carne fibrosa."],
    ecology: "Saprotrofo e parassita su ceppaie, radici e legno di latifoglie, spesso apparentemente terrestre per legno interrato.",
  },
  Panaeolus: {
    terminology: ["Lamelle marezzate", "Sporata nera", "Praticolo-coprofilo"],
    morphology: ["Piccoli agarici con lamelle che maturano in modo disomogeneo producendo un aspetto marezzato.", "Sporata nera; cappello spesso campanulato e igrofano."],
    ecology: "Saprotrofi di prati concimati, pascoli, letame e suoli ricchi di nutrienti.",
  },
  Pleurotus: {
    terminology: ["Gambo laterale o assente", "Lamelle decorrenti", "Lignicolo"],
    morphology: ["Cappelli a ventaglio o conchiglia, spesso sovrapposti in cespi.", "Lamelle chiare e decorrenti; gambo laterale, eccentrico o molto ridotto."],
    ecology: "Saprotrofi e deboli parassiti su legno di latifoglie e, per alcuni taxa, altri substrati vegetali.",
  },
  Polyporus: {
    terminology: ["Poliporo stipitato", "Imenoforo a pori", "Lignicolo"],
    morphology: ["Basidiomi con cappello e gambo, superficie inferiore poroide.", "Carne da carnosa a tenace; dimensione e forma dei pori sono caratteri utili."],
    ecology: "Saprotrofi o parassiti su legno, ceppaie, rami e radici di latifoglie.",
  },
  Ramaria: {
    terminology: ["Clavarioide ramificato", "Rami coralloidi", "Imenoforo esterno"],
    morphology: ["Basidiomi eretti, molto ramificati, simili a coralli, con tronco basale e numerosi rami.", "Colore dei rami, viraggi, consistenza e forma delle estremità sono importanti."],
    ecology: "Genere ecologicamente eterogeneo; molte specie terrestri di bosco sono ectomicorriziche, altre linee possono avere diversa ecologia.",
  },
  Russula: {
    terminology: ["Carne cassante", "Assenza di latice", "Sporata da bianca a ocra", "Ectomicorriza"],
    morphology: ["Carne e lamelle fragili per la presenza di sferocisti; nessun latice alla rottura.", "Colore del cappello, sapore, sporata e reazioni chimiche sono caratteri diagnostici."],
    ecology: "Ectomicorriziche di latifoglie e conifere, con numerose preferenze di ospite e suolo.",
  },
  Sarcodon: {
    terminology: ["Imenoforo ad aculei", "Carne tenace", "Ectomicorriza"],
    morphology: ["Cappello carnoso o coriaceo con superficie inferiore ad aculei.", "Colori, squame del cappello, odore e viraggi della carne sono utili alla determinazione."],
    ecology: "Ectomicorrizici terrestri di boschi, spesso con conifere e suoli poveri o acidi.",
  },
  Sarcosphaera: {
    terminology: ["Ascomicete a coppa", "Ascoma inizialmente ipogeo", "Toni violetti"],
    morphology: ["Ascoma globoso e chiuso da giovane, poi aperto a coppa o stella irregolare.", "Superficie interna fertile da lilla-violetta a brunastra; esterno più pallido."],
    ecology: "Terrestre in boschi, spesso su suoli calcarei e in associazione con conifere.",
  },
  Scutiger: {
    terminology: ["Poliporo terrestre stipitato", "Imenoforo a pori", "Carne carnosa"],
    morphology: ["Basidioma terrestre con cappello e gambo ben sviluppati, imenoforo inferiore a pori.", "Carne soda ma non legnosa; cappello spesso irregolare."],
    ecology: "Terrestre e generalmente ectomicorrizico in boschi montani.",
  },
  Stropharia: {
    terminology: ["Sporata porpora-bruna", "Anello frequente", "Cappello spesso viscido"],
    morphology: ["Agarici medio-grandi con lamelle che scuriscono al viola-bruno.", "Gambo spesso con anello; cappello talvolta viscido e con residui di velo."],
    ecology: "Saprotrofi di suoli ricchi, lettiera, legno, residui vegetali e materiale organico.",
  },
  Suillus: {
    terminology: ["Boleto", "Cappello viscido", "Pori", "Ectomicorriza con conifere"],
    morphology: ["Boleti con cappello spesso viscido o glutinoso e imenoforo a pori.", "Gambo con o senza anello e spesso con granulazioni o punteggiature ghiandolari."],
    ecology: "Ectomicorrizici quasi esclusivamente di conifere, spesso con forte specificità per il genere o la specie ospite.",
  },
  Tricholoma: {
    terminology: ["Lamelle smarginate", "Sporata bianca", "Ectomicorriza"],
    morphology: ["Agarici carnosi con lamelle chiare, tipicamente smarginate o uncinate al gambo.", "Gambo senza volva; odore, sapore, colori, fibrille e viraggi sono spesso decisivi."],
    ecology: "Ectomicorrizici di latifoglie e conifere, spesso con preferenze di ospite e suolo.",
  },
  Tylopilus: {
    terminology: ["Boleto", "Pori rosati", "Sporata rosa-bruna", "Sapore amaro frequente"],
    morphology: ["Boleti con pori inizialmente pallidi che tendono al rosa con la maturazione.", "Gambo spesso reticolato; in T. felleus il sapore fortemente amaro è diagnostico."],
    ecology: "Ectomicorrizici in boschi di conifere e latifoglie.",
  },
  Volvariella: {
    terminology: ["Volva", "Lamelle libere", "Sporata rosa", "Anello assente"],
    morphology: ["Lamelle libere che diventano rosate con la maturazione; sporata rosa.", "Gambo privo di anello ma inserito in una volva membranosa alla base."],
    ecology: "Saprotrofi di suoli ricchi, residui vegetali, compost, paglia e ambienti antropizzati.",
  },
  Volvopluteus: {
    terminology: ["Volva", "Lamelle libere", "Sporata rosa", "Anello assente"],
    morphology: ["Basidiomi con cappello spesso viscido, lamelle libere da bianche a rosa e sporata rosa.", "Gambo senza anello, con volva evidente alla base."],
    ecology: "Saprotrofi di prati, campi, aiuole, compost e suoli ricchi di materiale organico.",
  },
};

const aliasProfiles: Record<string, string> = {
  Leucoagaricus: "Leucoagaricus",
  Kuehneromyces: "Kuehneromyces",
  Echinoderma: "Echinoderma",
  Macrolepiota: "Macrolepiota",
};

export function genusFromSourceLabel(label: string) {
  return label.match(/^([A-Z][A-Za-z-]+)/)?.[1] ?? "";
}

export function profileForSourceLabel(label: string): MinimumGenusProfile {
  const genus = genusFromSourceLabel(label);
  const key = aliasProfiles[genus] ?? genus;
  const profile = profiles[key];
  if (profile) return profile;
  return {
    terminology: ["Caratteri macroscopici del taxon"],
    morphology: ["Valutare forma del basidioma, imenoforo, gambo, veli, colori, odori e reazioni macroscopiche pertinenti al gruppo."],
    ecology: "Ecologia da interpretare nel contesto del gruppo tassonomico e dell'habitat di rinvenimento.",
  };
}

export type DraftConfusion = {
  with: string;
  context: string;
  discriminatingCharacters: string[];
  risk: "low" | "moderate" | "high" | "deadly";
};

const confusions: Array<[RegExp, DraftConfusion[]]> = [
  [/^Amanita (phalloides|verna|virosa)\b/i, [{
    with: "Amanita commestibili e giovani esemplari di altri generi",
    context: "Gli esemplari giovani o scoloriti possono perdere caratteri cromatici evidenti; l'errore può avere conseguenze mortali.",
    discriminatingCharacters: ["Verificare sempre la base del gambo e la presenza della volva.", "Controllare lamelle e sporata, tipicamente bianche nelle Amanita del gruppo falloideo."],
    risk: "deadly",
  }]],
  [/^Amanita (pantherina|muscaria)\b/i, [{
    with: "Amanita rubescens e altre Amanita con verruche sul cappello",
    context: "Residui del velo, colore del cappello e anello possono sovrapporsi tra specie.",
    discriminatingCharacters: ["Osservare margine dell'anello, base bulbosa e disposizione dei residui volvari.", "Verificare eventuali arrossamenti della carne e del gambo."],
    risk: "high",
  }]],
  [/^Galerina marginata/i, [{
    with: "Kuehneromyces mutabilis e altri piccoli lignicoli cespitosi",
    context: "Specie lignicole brune possono apparire molto simili sul campo.",
    discriminatingCharacters: ["Valutare con attenzione gambo, velo/anello e superficie sotto l'anello.", "Confermare sporata e caratteri microscopici quando il quadro macroscopico non è univoco."],
    risk: "deadly",
  }]],
  [/^Lepiota (subincarnata|brunneoincarnata|elaiophylla)/i, [{
    with: "Piccole lepiotoidi e giovani Macrolepiota/Chlorophyllum",
    context: "Le piccole Lepiota tossiche non devono essere assimilate alle grandi mazze di tamburo.",
    discriminatingCharacters: ["Considerare dimensioni ridotte e struttura del cappello.", "Verificare anello, decorazione del gambo e assenza dei caratteri tipici delle Macrolepiota mature."],
    risk: "deadly",
  }]],
  [/^Cortinarius (orellanus|orellanoides)/i, [{
    with: "Altri Cortinarius e agarici bruno-aranciati di bosco",
    context: "Colori e habitus possono sovrapporsi a specie considerate meno pericolose.",
    discriminatingCharacters: ["Ricercare residui di cortina e sporata bruno-ruggine.", "Valutare combinazione di colore, forma, habitat e caratteri microscopici; non basarsi su un singolo tratto."],
    risk: "deadly",
  }]],
  [/^Omphalotus olearius/i, [{
    with: "Cantharellus spp.",
    context: "Colore arancio e portamento imbutiforme possono indurre a confusione.",
    discriminatingCharacters: ["Omphalotus ha vere lamelle sottili e fitte; Cantharellus presenta pliche ottuse.", "Omphalotus cresce tipicamente cespitoso su legno o radici, anche interrati."],
    risk: "high",
  }]],
  [/^Hygrophoropsis aurantiaca/i, [{
    with: "Cantharellus spp.",
    context: "Il colore arancio e la forma a imbuto ricordano i cantarelli.",
    discriminatingCharacters: ["Hygrophoropsis possiede vere lamelle fitte e forcate.", "Cantharellus presenta pliche carnose e ottuse, continue con la carne."],
    risk: "moderate",
  }]],
  [/^Boletus \(Rubroboletus\) satanas|^Boletus pulchrotinctus/i, [{
    with: "Boleti a pori rossi commestibili dopo trattamento",
    context: "Colori dei pori e viraggi possono sovrapporsi tra più boleti del gruppo Luridi.",
    discriminatingCharacters: ["Valutare colore del cappello, reticolo del gambo e distribuzione dei toni rossi.", "Osservare intensità e sede del viraggio al blu su carne e pori."],
    risk: "high",
  }]],
  [/^Gyromitra esculenta/i, [{
    with: "Morchella spp. e altri ascomiceti primaverili",
    context: "Entrambi possono comparire in primavera e avere cappello fortemente irregolare.",
    discriminatingCharacters: ["Gyromitra ha mitra cerebriforme a lobi irregolari; Morchella presenta alveoli organizzati.", "Osservare il rapporto tra cappello e gambo e la struttura interna dell'ascoma."],
    risk: "deadly",
  }]],
];

export function draftConfusionsForSourceLabel(label: string): DraftConfusion[] {
  return confusions.flatMap(([pattern, items]) => pattern.test(label) ? items : []);
}
