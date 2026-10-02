import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const objectives = JSON.parse(
  await readFile(resolve(root, "data/taxonomic-objectives.json"), "utf8"),
);

const nonGenera = new Set([
  "Altre", "Altri", "Cantharelloidi", "Clavarioidi", "Collybioidi",
  "Conoscenza", "Determinazione", "Funghi", "Gasteroidi", "Inclusi",
  "Lepiotoidi", "Marasmioidi", "Non", "Per", "Pezizaceae",
]);

const knownGenera = new Set();
for (const row of objectives) {
  for (const match of row.scientificName.matchAll(/\b[A-Z][a-z]{2,}\b/g)) {
    if (!nonGenera.has(match[0])) knownGenera.add(match[0]);
  }
}

const orderForIndex = (index) => {
  if (index <= 60 || [101, 102, 106].includes(index)) return "Agaricales";
  if (index <= 62) return "Russulales";
  if (index <= 88 || [103, 104, 105].includes(index)) return "Boletales";
  if ([89, 91, 94].includes(index)) return "Cantharellales";
  if ([90, 92, 93, 96].includes(index)) return "Gomphales";
  if ([95, 97].includes(index)) return "Polyporales";
  if (index === 98) return "Thelephorales";
  if (index === 99) return "Phallales";
  if (index === 100) return "Geastrales";
  if (index === 107) return "Auriculariales";
  if (index === 108 || index === 110) return "Dacrymycetales";
  if ([109, 111].includes(index)) return "Tremellales";
  if (index === 112) return "Helotiales";
  if (index === 113 || index === 118) return "Leotiales";
  if (index === 114) return "Hypocreales";
  if (index === 115) return "Geoglossales";
  if ([116, 117].includes(index)) return "Pezizales";
  if (index === 119 || index === 123) return "Pezizales";
  if (index === 120 || index === 121) return "Pezizales";
  return "Helotiales";
};

const slug = (value) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

function rowGenera(row) {
  return [...row.scientificName.matchAll(/\b[A-Z][a-z]{2,}\b/g)]
    .map((match) => match[0])
    .filter((name) => knownGenera.has(name));
}

function nearestGenus(text, offset, initial, genera) {
  const candidates = genera.filter((genus) => genus.startsWith(initial));
  if (candidates.length === 1) return candidates[0];
  const before = text.slice(0, offset);
  const mentioned = candidates
    .map((genus) => ({ genus, index: before.lastIndexOf(genus) }))
    .sort((a, b) => b.index - a.index);
  return mentioned[0]?.index >= 0 ? mentioned[0].genus : candidates[0];
}

function inferEdibility(text, occurrence) {
  const normalized = text.toLocaleLowerCase("it");
  const rules = [
    ["commestibile-dopo-trattamento", /(commestibil\w*[^.;:]{0,90}(condizionat|cottura completa|prebollitura)|condizionat\w*[^.;:]{0,90}commestibil)/g],
    ["tossico", /(tossic\w*|mortali|sindrome falloidea|sindrome panterinica|nefrotossic\w*)/g],
    ["non-commestibile", /(non commestibil\w*|prudenzialmente non commestibil\w*)/g],
    ["sconsigliato", /sconsigliat\w*/g],
    ["commestibile", /(?<!non )commestibil\w*/g],
  ];
  const matches = [];
  for (const [value, pattern,] of rules) {
    for (const match of normalized.matchAll(pattern)) {
      const delta = (match.index ?? 0) - occurrence;
      if (delta < -70 || delta > 240) continue;
      matches.push({
        value,
        distance: delta >= 0 ? delta : Math.abs(delta) * 1.6,
        specificity: match[0].length,
      });
    }
  }
  matches.sort((a, b) => a.distance - b.distance || b.specificity - a.specificity);
  return matches[0]?.value ?? "non-valutato";
}

const byName = new Map();

for (const [rowIndex, row] of objectives.entries()) {
  const genera = rowGenera(row);
  for (const [levelKey, text] of Object.entries(row.objectives)) {
    if (!text) continue;
    const level = levelKey === "minimum"
      ? "minimo"
      : levelKey === "desirable"
        ? "auspicabile"
        : "approfondimento";
    const found = [];
    const occupied = [];

    for (const match of text.matchAll(/\b([A-Z][a-z]{2,})\s+([a-z][a-z-]{2,})(?:\s+(s\.?\s*(?:l|str)\.?))?/g)) {
      if (!knownGenera.has(match[1]) && !genera.includes(match[1])) continue;
      found.push({
        scientificName: `${match[1]} ${match[2]}`,
        offset: match.index,
        end: match.index + match[0].length,
      });
      occupied.push([match.index, match.index + match[0].length]);
    }

    for (const match of text.matchAll(/\b([A-Z])\.\s*([a-z][a-z-]{2,})(?:\s+(s\.?\s*(?:l|str)\.?))?/g)) {
      if (occupied.some(([start, end]) => match.index >= start && match.index < end)) continue;
      const genus = nearestGenus(text, match.index, match[1], genera);
      if (!genus) continue;
      found.push({
        scientificName: `${genus} ${match[2]}`,
        offset: match.index,
        end: match.index + match[0].length,
      });
    }

    for (const candidate of found) {
      if (/\b(?:spp|sp)\.?$/i.test(candidate.scientificName)) continue;
      const existing = byName.get(candidate.scientificName);
      const source = {
        title: row.sources.minimumObjectives.title,
        page: row.sources.minimumObjectives.page,
        kind: "obiettivi-minimi",
      };
      if (existing) {
        if (!existing.objectiveLevels.includes(level)) existing.objectiveLevels.push(level);
        if (!existing.sources.some((entry) => entry.page === source.page)) existing.sources.push(source);
        continue;
      }
      const order = orderForIndex(rowIndex);
      const division = rowIndex >= 112 ? "Ascomycota" : "Basidiomycota";
      const genus = candidate.scientificName.split(" ")[0];
      byName.set(candidate.scientificName, {
        id: `atlas-${slug(candidate.scientificName)}`,
        commonName: candidate.scientificName,
        scientificName: candidate.scientificName,
        acceptedName: candidate.scientificName,
        sourceName: candidate.scientificName,
        authorship: null,
        rank: "species",
        aliases: [],
        regionalNames: [],
        edibility: inferEdibility(text, candidate.offset),
        safetyNote: "Valutazione editoriale derivata dalla fonte approvata; verificare sempre l'intera scheda e i trattamenti indicati.",
        recognitionLevel: level,
        objectiveLevels: [level],
        kingdom: "Fungi",
        division,
        className: division === "Ascomycota" ? "Pezizomycetes" : "Agaricomycetes",
        order,
        family: null,
        parentScientificName: genus,
        diagnosticCharacters: [],
        odor: null,
        ecology: [],
        mediaStatus: "preparing",
        sources: [
          source,
          ...(row.sources.edibilityGuide.page ? [{
            title: row.sources.edibilityGuide.title,
            page: row.sources.edibilityGuide.page,
            kind: "guida-commestibilita",
          }] : []),
        ],
        externalIds: {
          speciesFungorum: null,
          indexFungorum: null,
          mycoBank: null,
        },
      });
    }
  }
}

const levelOrder = { minimo: 0, auspicabile: 1, approfondimento: 2 };
const output = [...byName.values()]
  .map((taxon) => ({
    ...taxon,
    objectiveLevels: taxon.objectiveLevels.sort((a, b) => levelOrder[a] - levelOrder[b]),
  }))
  .sort((a, b) => a.scientificName.localeCompare(b.scientificName, "it"));

await writeFile(
  resolve(root, "data/atlas-taxa.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);

console.log(`Generated ${output.length} atomic atlas taxa.`);
