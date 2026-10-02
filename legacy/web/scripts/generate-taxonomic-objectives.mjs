import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const objectivesPath = process.argv[2];
const guidePath = process.argv[3];

if (!objectivesPath || !guidePath) {
  throw new Error("Uso: node scripts/generate-taxonomic-objectives.mjs <obiettivi.txt> <guida.txt>");
}

const [objectivesText, guideText] = await Promise.all([
  readFile(resolve(objectivesPath), "utf8"),
  readFile(resolve(guidePath), "utf8"),
]);

const lines = objectivesText.split("\n");
const firstTaxon = lines.findIndex((line) => line.replace(/^\f/, "").trim() === "Agaricus");
const lastTaxon = lines.findIndex((line) => line.replace(/^\f/, "").trim() === "Verpa");

function isHeadingCandidate(index) {
  if (index < firstTaxon || index > lastTaxon) return false;
  const raw = lines[index].replace(/^\f/, "");
  const value = raw.trim();
  if (!value || /^\s/.test(raw) || value === value.toUpperCase()) return false;
  if (/^(Minimo|Auspicabile|Approfondimenti|Determinazione|Per |Nel |Le |Gli |Al |La |I |Ove )/.test(value)) return false;
  return /(?:Minimo|Auspicabile):/.test(lines.slice(index + 1, index + 8).join(" "));
}

const candidateIndexes = [];
for (let index = firstTaxon; index <= lastTaxon; index += 1) {
  if (isHeadingCandidate(index)) candidateIndexes.push(index);
}

const headings = [];
for (const index of candidateIndexes) {
  const previous = headings.at(-1);
  if (previous && index === previous.lastLine + 1) {
    previous.raw += ` ${lines[index].replace(/^\f/, "").trim()}`;
    previous.lastLine = index;
  } else {
    headings.push({ raw: lines[index].replace(/^\f/, "").trim(), firstLine: index, lastLine: index });
  }
}

function compact(value) {
  return value
    .replace(/\f/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:)])/g, "$1")
    .trim();
}

function objective(block, label, nextLabels) {
  const escapedNext = nextLabels.join("|");
  const match = block.match(new RegExp(`${label}:\\s*([\\s\\S]*?)(?=${escapedNext}:|$)`));
  return match ? compact(match[1]) : null;
}

function pdfPageForLine(lineIndex) {
  return lines.slice(0, lineIndex + 1).reduce((page, line) => page + (line.match(/\f/g)?.length ?? 0), 1);
}

const guidePages = guideText.split("\f");
const guidePageOverrides = new Map([
  ["Collybioidi e Marasmioidi", 45],
  ["Lentinus s.l.", 66],
  ["Lepiotoidi:", 67],
  ["Boletus s. str.", 103],
  ["Boletus ex sez. Luridi", 106],
  ["Xerocomus s.l.", 118],
  ["Hydnaceae s.l.", 122],
  ["Polyporaceae s.l.", 123],
  ["Geoglossaceae", 141],
  ["Pezizaceae s.l.", 150],
]);
function guidePageForHeading(rawHeading) {
  const override = [...guidePageOverrides].find(([prefix]) => rawHeading.startsWith(prefix));
  if (override) return override[1];
  const token = rawHeading.match(/[A-ZÀ-Ý][A-Za-zÀ-ÿ-]+/)?.[0];
  if (!token) return null;
  for (let index = 25; index < guidePages.length; index += 1) {
    const pageLines = guidePages[index].split("\n").map((line) => line.trim());
    if (pageLines.some((line) => line === token || line.startsWith(`${token} (`) || line.startsWith(`${token} +`))) {
      return index + 1;
    }
  }
  return null;
}

function inferRank(name) {
  if (/aceae/i.test(name)) return "family";
  if (/sez\.|section/i.test(name)) return "section";
  if (/grupp|s\.l\.|s\. str\.|inclus/i.test(name)) return "operationalGroup";
  return "genus";
}

function slug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

const records = headings.map((heading, index) => {
  const nextLine = headings[index + 1]?.firstLine ?? lastTaxon + 20;
  const block = lines.slice(heading.lastLine + 1, nextLine).join("\n");
  return {
    id: `objective-${slug(heading.raw)}`,
    commonName: heading.raw,
    scientificName: heading.raw,
    rank: inferRank(heading.raw),
    edibility: "mixed",
    objectives: {
      minimum: objective(block, "Minimo", ["Auspicabile", "Approfondimenti"]),
      desirable: objective(block, "Auspicabile", ["Approfondimenti"]),
      advanced: objective(block, "Approfondimenti", []),
    },
    sources: {
      minimumObjectives: {
        title: "Obiettivi tassonomici nella formazione dei micologi",
        page: pdfPageForLine(heading.firstLine),
      },
      edibilityGuide: {
        title: "Guida ragionata alla commestibilità dei funghi",
        page: guidePageForHeading(heading.raw),
      },
    },
  };
});

const destination = resolve(projectRoot, "data/taxonomic-objectives.json");
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, `${JSON.stringify(records, null, 2)}\n`);
console.log(`Generati ${records.length} taxa in ${destination}`);
