import type { Area } from "./domain.ts";

type AreaSeed = readonly [
  id: string,
  name: string,
  region: string,
  latitude: number,
  longitude: number,
  habitats: string[],
  expectedTaxa: string[],
];

const seeds: AreaSeed[] = [
  ["gran-paradiso-vda", "Gran Paradiso valdostano", "Valle d'Aosta", 45.61, 7.3, ["Abete rosso", "Larice", "Prati alpini"], ["boletus-edulis", "hygrophorus-marzuolus"]],
  ["val-dayas", "Val d'Ayas e Monte Rosa", "Valle d'Aosta", 45.82, 7.73, ["Abete rosso", "Larice", "Prati alpini"], ["boletus-edulis", "amanita-vaginatae"]],
  ["valli-cuneesi", "Valli cuneesi", "Piemonte", 44.36, 7.36, ["Faggeta", "Abete bianco", "Castagneto"], ["boletus-edulis", "russula-cyanoxantha"]],
  ["monferrato", "Monferrato boschivo", "Piemonte", 44.98, 8.35, ["Querceto", "Castagneto", "Pioppeto"], ["russula-virescens", "cyclocybe-cylindracea"]],
  ["valsesia", "Valsesia e Biellese", "Piemonte", 45.68, 8.06, ["Faggeta", "Castagneto", "Abete rosso"], ["boletus-edulis", "craterellus-cornucopioides"]],
  ["beigua", "Beigua e Appennino ligure", "Liguria", 44.43, 8.56, ["Faggeta", "Castagneto", "Pineta"], ["boletus-edulis", "lactarius-deliciosi"]],
  ["val-di-vara", "Val di Vara", "Liguria", 44.28, 9.63, ["Castagneto", "Querceto", "Faggeta"], ["boletus-edulis", "russula-vesca"]],
  ["valtellina", "Valtellina e Orobie", "Lombardia", 46.08, 9.76, ["Abete rosso", "Abete bianco", "Faggeta"], ["boletus-edulis", "hygrophorus-marzuolus"]],
  ["prealpi-bergamasche", "Prealpi bergamasche", "Lombardia", 45.88, 9.86, ["Faggeta", "Castagneto", "Abete rosso"], ["boletus-edulis", "craterellus-cornucopioides"]],
  ["oltrepo-pavese", "Oltrepò pavese", "Lombardia", 44.91, 9.18, ["Querceto", "Castagneto", "Prati"], ["russula-virescens", "agaricus-campestris-group"]],
  ["fiemme-fassa", "Fiemme e Fassa", "Trentino-Alto Adige", 46.31, 11.55, ["Abete rosso", "Larice", "Abete bianco"], ["boletus-edulis", "tricholoma-terreum-group"]],
  ["cansiglio", "Cansiglio e Alpago", "Veneto", 46.08, 12.42, ["Faggeta", "Abete bianco", "Abete rosso"], ["boletus-edulis", "hygrophorus-marzuolus"]],
  ["lessinia", "Lessinia", "Veneto", 45.61, 11.1, ["Faggeta", "Prati montani", "Carpino"], ["russula-cyanoxantha", "marasmius-oreades"]],
  ["cadore", "Cadore e Comelico", "Veneto", 46.55, 12.43, ["Abete rosso", "Larice", "Faggeta"], ["boletus-edulis", "amanita-vaginatae"]],
  ["carnia", "Carnia e Tarvisiano", "Friuli-Venezia Giulia", 46.48, 13.03, ["Abete rosso", "Abete bianco", "Faggeta"], ["boletus-edulis", "hygrophorus-marzuolus"]],
  ["carso", "Carso e Valli del Natisone", "Friuli-Venezia Giulia", 45.95, 13.52, ["Querceto", "Carpino nero", "Prati carsici"], ["russula-vesca", "agaricus-campestris-group"]],
  ["appennino-parmense", "Appennino parmense", "Emilia-Romagna", 44.49, 10.02, ["Faggeta", "Castagneto", "Abete bianco"], ["boletus-edulis", "russula-cyanoxantha"]],
  ["amiata", "Monte Amiata", "Toscana", 42.89, 11.63, ["Faggeta", "Castagneto", "Querceto"], ["boletus-edulis", "hygrophorus-russula"]],
  ["valnerina", "Valnerina e Monti Martani", "Umbria", 42.82, 12.91, ["Faggeta", "Querceto", "Prati montani"], ["boletus-edulis", "marasmius-oreades"]],
  ["monte-cucco", "Monte Cucco", "Umbria", 43.37, 12.74, ["Faggeta", "Querceto", "Prati"], ["russula-cyanoxantha", "craterellus-cornucopioides"]],
  ["sibillini-marche", "Sibillini marchigiani", "Marche", 42.91, 13.21, ["Faggeta", "Querceto", "Prati montani"], ["boletus-edulis", "marasmius-oreades"]],
  ["montefeltro", "Montefeltro e Catria", "Marche", 43.62, 12.55, ["Faggeta", "Querceto", "Castagneto"], ["boletus-edulis", "russula-vesca"]],
  ["simbruini", "Monti Simbruini", "Lazio", 41.95, 13.13, ["Faggeta", "Querceto", "Prati montani"], ["boletus-edulis", "craterellus-cornucopioides"]],
  ["gran-sasso", "Gran Sasso e Laga", "Abruzzo", 42.47, 13.47, ["Faggeta", "Querceto", "Prati montani"], ["boletus-edulis", "marasmius-oreades"]],
  ["maiella", "Maiella", "Abruzzo", 42.06, 14.05, ["Faggeta", "Pino nero", "Prati montani"], ["boletus-edulis", "lactarius-deliciosi"]],
  ["matese-molise", "Matese molisano", "Molise", 41.48, 14.4, ["Faggeta", "Querceto", "Prati"], ["boletus-edulis", "agaricus-campestris-group"]],
  ["alto-molise", "Alto Molise", "Molise", 41.79, 14.25, ["Abete bianco", "Faggeta", "Querceto"], ["boletus-edulis", "hygrophorus-marzuolus"]],
  ["matese-campano", "Matese campano", "Campania", 41.36, 14.38, ["Faggeta", "Querceto", "Prati"], ["boletus-edulis", "agaricus-campestris-group"]],
  ["monti-picentini", "Monti Picentini", "Campania", 40.78, 15.03, ["Faggeta", "Castagneto", "Querceto"], ["boletus-edulis", "russula-virescens"]],
  ["cilento-interno", "Cilento interno", "Campania", 40.29, 15.37, ["Faggeta", "Querceto", "Castagneto"], ["boletus-edulis", "russula-vesca"]],
  ["gargano", "Foresta Umbra e Gargano", "Puglia", 41.82, 15.99, ["Faggeta", "Querceto", "Pineta"], ["boletus-edulis", "lactarius-deliciosi"]],
  ["murgia", "Alta Murgia", "Puglia", 40.96, 16.39, ["Pascoli", "Querceto", "Pineta"], ["pleurotus-eryngii", "agaricus-campestris-group"]],
  ["vulture", "Vulture e Alto Bradano", "Basilicata", 40.95, 15.62, ["Faggeta", "Castagneto", "Querceto"], ["boletus-edulis", "russula-virescens"]],
  ["aspromonte", "Aspromonte", "Calabria", 38.16, 15.9, ["Faggeta", "Abete bianco", "Pino laricio"], ["boletus-edulis", "lactarius-deliciosi"]],
  ["nebrodi", "Nebrodi", "Sicilia", 37.94, 14.69, ["Faggeta", "Querceto", "Pascoli"], ["boletus-edulis", "pleurotus-eryngii"]],
  ["etna", "Etna e versanti boschivi", "Sicilia", 37.73, 15.0, ["Pineta", "Querceto", "Castagneto"], ["lactarius-deliciosi", "russula-virescens"]],
  ["limbara", "Limbara e Gallura interna", "Sardegna", 40.86, 9.12, ["Querceto", "Sughereta", "Castagneto"], ["russula-virescens", "amanita-vaginatae"]],
];

export const nationalAreas: Area[] = seeds.map((seed, index) => {
  const [id, name, region, latitude, longitude, habitat, expectedTaxa] = seed;
  return {
    id,
    name,
    region,
    center: [latitude, longitude],
    habitat,
    moisture: 62 + ((index * 7) % 25),
    temperatureFit: 66 + ((index * 5) % 23),
    seasonFit: 60 + ((index * 9) % 29),
    verifiedSignals: 35 + ((index * 4) % 31),
    delayedVisitors: (index * 3) % 17,
    lastUpdatedLabel: "dati territoriali aggregati e ritardati",
    expectedTaxa,
    reasons: [
      `Mosaico ambientale: ${habitat.slice(0, 3).join(", ")}`,
      "Valutazione su area vasta, non su punti di raccolta",
    ],
  };
});
