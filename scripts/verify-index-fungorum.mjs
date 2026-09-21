import { minimumNomenclatureMappings } from "../lib/minimum-nomenclature.ts";

const ENDPOINT =
  "https://www.indexfungorum.org/ixfwebservice/fungus.asmx/NameSearch";
const CONCURRENCY = 4;
const MAX_ATTEMPTS = 3;

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function field(block, tag) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? decodeXml(match[1]).trim() : null;
}

function normalize(value) {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

function parseRecords(xml) {
  return [...xml.matchAll(/<IndexFungorum>([\s\S]*?)<\/IndexFungorum>/g)]
    .map((match) => {
      const block = match[1];
      return {
        name: field(block, "NAME_x0020_OF_x0020_FUNGUS"),
        currentName: field(block, "CURRENT_x0020_NAME"),
        recordId: field(block, "RECORD_x0020_NUMBER"),
        currentRecordId: field(block, "CURRENT_x0020_NAME_x0020_RECORD_x0020_NUMBER"),
        status: field(block, "NAME_x0020_STATUS"),
      };
    })
    .filter((record) => record.name);
}

async function fetchName(queryName) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          SearchText: queryName,
          AnywhereInText: "false",
          MaxNumber: "50",
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return parseRecords(await response.text());
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
      }
    }
  }
  throw new Error(`${queryName}: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

const jobsByKey = new Map();
for (const mapping of minimumNomenclatureMappings) {
  for (const evidence of mapping.evidence) {
    if (evidence.source !== "index-fungorum") continue;
    if (!evidence.queryName || !evidence.expectedCurrentName) {
      throw new Error(
        `${mapping.sourceUnitId}: Index Fungorum evidence must declare queryName and expectedCurrentName`,
      );
    }
    const key = `${evidence.queryName}\u0000${evidence.expectedCurrentName}`;
    if (!jobsByKey.has(key)) {
      jobsByKey.set(key, {
        queryName: evidence.queryName,
        expectedCurrentName: evidence.expectedCurrentName,
        sourceUnitIds: [],
      });
    }
    jobsByKey.get(key).sourceUnitIds.push(mapping.sourceUnitId);
  }
}

const jobs = [...jobsByKey.values()];
const failures = [];
const resolved = [];

const statusCounts = Object.fromEntries(
  ["accepted", "sourceConcept", "definedSet", "conflict", "unresolved"].map((status) => [
    status,
    minimumNomenclatureMappings.filter((mapping) => mapping.status === status).length,
  ]),
);
const uniqueCurrentNames = new Set(
  minimumNomenclatureMappings.flatMap((mapping) => mapping.currentAcceptedNames),
);
console.log(
  `Nomenclature mapping: ${minimumNomenclatureMappings.length} records; ` +
  `accepted=${statusCounts.accepted}; sourceConcept=${statusCounts.sourceConcept}; ` +
  `definedSet=${statusCounts.definedSet}; conflict=${statusCounts.conflict}; ` +
  `unresolved=${statusCounts.unresolved}; unique current names=${uniqueCurrentNames.size}.`,
);

async function verify(job) {
  const records = await fetchName(job.queryName);
  const exact = records.filter(
    (record) => normalize(record.name).toLocaleLowerCase("en") ===
      normalize(job.queryName).toLocaleLowerCase("en"),
  );
  const expected = normalize(job.expectedCurrentName).toLocaleLowerCase("en");
  const matching = exact.find(
    (record) => normalize(record.currentName ?? "").toLocaleLowerCase("en") === expected,
  );

  if (!matching) {
    failures.push({
      ...job,
      returned: exact.map((record) => ({
        name: record.name,
        currentName: record.currentName,
        recordId: record.recordId,
        currentRecordId: record.currentRecordId,
        status: record.status,
      })),
    });
    return;
  }

  resolved.push({
    queryName: job.queryName,
    currentName: matching.currentName,
    recordId: matching.recordId,
    currentRecordId: matching.currentRecordId,
  });
}

let cursor = 0;
async function worker() {
  while (cursor < jobs.length) {
    const index = cursor;
    cursor += 1;
    await verify(jobs[index]);
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, worker));

resolved.sort((left, right) => left.queryName.localeCompare(right.queryName, "en"));
console.log(
  `Verified ${resolved.length}/${jobs.length} unique Index Fungorum current-name assertions.`,
);

if (failures.length > 0) {
  console.error("\nIndex Fungorum nomenclature mismatches:");
  for (const failure of failures) {
    console.error(
      `- ${failure.queryName} -> expected ${failure.expectedCurrentName}; returned: ${JSON.stringify(failure.returned)}; units: ${failure.sourceUnitIds.join(", ")}`,
    );
  }
  process.exit(1);
}
