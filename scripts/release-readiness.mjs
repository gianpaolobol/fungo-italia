const REQUIRED_VIEWS = ['lateral', 'top', 'underside'];

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasFieldEvidence(taxon, fieldName) {
  return asArray(taxon.sources).some((source) => {
    if (Array.isArray(source.fields) && source.fields.includes(fieldName)) return true;
    const claim = String(source.supportedClaim ?? '').toLowerCase();
    return claim.includes(fieldName.toLowerCase());
  });
}

function imageCompleteness(taxon) {
  const images = asArray(taxon.referenceImages);
  const present = new Set(images.map((image) => image?.view).filter(Boolean));
  return {
    total: images.length,
    missingViews: REQUIRED_VIEWS.filter((view) => !present.has(view)),
    invalidImages: images.filter((image) => !isText(image?.src) || !isText(image?.alt) || !isText(image?.credit) || !REQUIRED_VIEWS.includes(image?.view)).length,
  };
}

function profileGaps(taxon) {
  const gaps = [];
  if (!isText(taxon.id)) gaps.push('missing-id');
  if (!isText(taxon.scientificName)) gaps.push('missing-scientific-name');
  if (!isText(taxon.rank)) gaps.push('missing-rank');
  if (!Array.isArray(taxon.characters) || taxon.characters.length !== 3 || !taxon.characters.every(isText)) gaps.push('missing-3-observable-characters');
  if (!isText(taxon.differentiatingCharacter)) gaps.push('missing-plus-one-differential-character');
  if (!Array.isArray(taxon.habitat) || taxon.habitat.length === 0 || !taxon.habitat.every(isText)) gaps.push('missing-habitat');
  if (!Array.isArray(taxon.lookalikes) || taxon.lookalikes.length === 0 || !taxon.lookalikes.every(isText)) gaps.push('missing-lookalikes');
  if (!Array.isArray(taxon.sources) || taxon.sources.length === 0) gaps.push('missing-sources');
  if (!hasFieldEvidence(taxon, 'habitat')) gaps.push('habitat-without-pointwise-evidence');
  const study = taxon.studyProfile ?? {};
  if (!isText(study.odor)) gaps.push('missing-odor');
  else if (!hasFieldEvidence(taxon, 'odor')) gaps.push('odor-without-pointwise-evidence');
  if (!isText(study.sporePrint?.label)) gaps.push('missing-spore-print');
  else if (!hasFieldEvidence(taxon, 'sporePrint')) gaps.push('spore-print-without-pointwise-evidence');
  if (!isText(study.edibility?.label)) gaps.push('missing-edibility');
  else if (!hasFieldEvidence(taxon, 'edibility')) gaps.push('edibility-without-pointwise-evidence');
  const images = imageCompleteness(taxon);
  if (images.missingViews.length) gaps.push('missing-reference-views:' + images.missingViews.join(','));
  if (images.invalidImages) gaps.push('invalid-reference-image-metadata');
  if (taxon.independentReviewStatus !== 'reviewed' && taxon.independentReviewStatus !== 'attested') gaps.push('independent-review-not-attested');
  return gaps;
}

export function buildReleaseReadinessReport(catalog, groups = [], options = {}) {
  if (!Array.isArray(catalog)) throw new TypeError('catalog must be an array');
  if (!Array.isArray(groups)) throw new TypeError('groups must be an array');
  const records = options.includeGroups ? [...catalog, ...groups] : catalog;
  const profileRows = records.map((taxon) => ({
    id: taxon.id ?? null,
    scientificName: taxon.scientificName ?? null,
    rank: taxon.rank ?? null,
    gaps: profileGaps(taxon),
    imageCompleteness: imageCompleteness(taxon),
  }));
  const blockers = profileRows.filter((row) => row.gaps.length > 0);
  const editorial = {
    odorPresent: records.filter((taxon) => isText(taxon.studyProfile?.odor)).length,
    sporePrintPresent: records.filter((taxon) => isText(taxon.studyProfile?.sporePrint?.label)).length,
    edibilityPresent: records.filter((taxon) => isText(taxon.studyProfile?.edibility?.label)).length,
  };
  const imageComplete = profileRows.filter((row) => row.imageCompleteness.missingViews.length === 0 && row.imageCompleteness.invalidImages === 0).length;
  const reviewed = profileRows.filter((row) => !row.gaps.includes('independent-review-not-attested')).length;
  return {
    schemaVersion: 1,
    checkedAt: options.checkedAt ?? new Date().toISOString(),
    scope: options.includeGroups ? 'catalog+groups' : 'catalog',
    requiredViews: REQUIRED_VIEWS,
    totals: {
      catalog: catalog.length,
      groups: groups.length,
      checked: profileRows.length,
      imageComplete,
      ...editorial,
      independentlyReviewed: reviewed,
      releaseReady: profileRows.length - blockers.length,
      blocked: blockers.length,
    },
    blockers,
    releaseReady: blockers.length === 0,
  };
}

export function formatReleaseReadiness(report) {
  const lines = [];
  lines.push('# Fungo Italia release readiness');
  lines.push('');
  lines.push(`Checked at: ${report.checkedAt}`);
  lines.push(`Scope: ${report.scope}`);
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|---|---:|');
  lines.push(`| Catalog records | ${report.totals.catalog} |`);
  lines.push(`| Groups | ${report.totals.groups} |`);
  lines.push(`| Checked records | ${report.totals.checked} |`);
  lines.push(`| Complete image triplets | ${report.totals.imageComplete} |`);
  lines.push(`| Odor present | ${report.totals.odorPresent} |`);
  lines.push(`| Spore print present | ${report.totals.sporePrintPresent} |`);
  lines.push(`| Edibility present | ${report.totals.edibilityPresent} |`);
  lines.push(`| Independently reviewed | ${report.totals.independentlyReviewed} |`);
  lines.push(`| Release-ready records | ${report.totals.releaseReady} |`);
  lines.push(`| Blocked records | ${report.totals.blocked} |`);
  lines.push('');
  if (report.blockers.length) {
    lines.push('## Blockers');
    lines.push('');
    lines.push('| ID | Scientific name | Gaps |');
    lines.push('|---|---|---|');
    for (const row of report.blockers) {
      lines.push(`| ${row.id ?? ''} | ${row.scientificName ?? ''} | ${row.gaps.join('; ')} |`);
    }
  } else {
    lines.push('No blockers detected by this validator.');
  }
  lines.push('');
  return lines.join('\n');
}

async function readJson(path) {
  const {readFile} = await import('node:fs/promises');
  return JSON.parse(await readFile(path, 'utf8'));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = new Set(process.argv.slice(2));
  const catalogPath = process.env.FUNGO_CATALOG_JSON ?? 'src/data/catalog.json';
  const groupsPath = process.env.FUNGO_GROUPS_JSON ?? 'src/data/groups.json';
  const outPath = process.env.FUNGO_RELEASE_READINESS_REPORT ?? 'docs/RELEASE-READINESS.md';
  const [{writeFile, mkdir}, {dirname}] = await Promise.all([
    import('node:fs/promises'),
    import('node:path'),
  ]);
  const catalog = await readJson(catalogPath);
  const groups = await readJson(groupsPath).catch(() => []);
  const report = buildReleaseReadinessReport(catalog, groups, {includeGroups: args.has('--include-groups')});
  const markdown = formatReleaseReadiness(report);
  if (args.has('--json')) console.log(JSON.stringify(report, null, 2));
  else console.log(markdown);
  if (args.has('--write')) {
    await mkdir(dirname(outPath), {recursive: true});
    await writeFile(outPath, markdown);
  }
  if (args.has('--strict') && !report.releaseReady) process.exitCode = 1;
}
