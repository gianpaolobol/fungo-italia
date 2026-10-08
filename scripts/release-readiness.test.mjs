import assert from 'node:assert/strict';
import {buildReleaseReadinessReport, formatReleaseReadiness} from './release-readiness.mjs';

const completeTaxon = {
  id: 'boletus-edulis',
  scientificName: 'Boletus edulis',
  rank: 'species',
  characters: ['cappello bruno', 'tubuli bianchi poi gialli', 'reticolo chiaro sul gambo'],
  differentiatingCharacter: 'non ha pori rossi né carne virante al blu',
  habitat: ['boschi di latifoglie e conifere'],
  lookalikes: ['Tylopilus felleus'],
  sources: [
    {sourceId: 'S-test', fields: ['habitat', 'odor', 'sporePrint', 'edibility'], supportedClaim: 'habitat documented'},
  ],
  studyProfile: {odor: 'odore documentato', sporePrint: {label: 'sporata documentata'}, edibility: {label: 'valutazione documentata'}},
  independentReviewStatus: 'reviewed',
  referenceImages: [
    {view: 'lateral', src: 'images/reference/test-lateral.jpg', alt: 'laterale', credit: 'tester'},
    {view: 'top', src: 'images/reference/test-top.jpg', alt: 'sopra', credit: 'tester'},
    {view: 'underside', src: 'images/reference/test-underside.jpg', alt: 'sotto', credit: 'tester'},
  ],
};

{
  const report = buildReleaseReadinessReport([completeTaxon], [], {checkedAt: '2026-10-08T00:00:00.000Z'});
  assert.equal(report.releaseReady, true);
  assert.equal(report.totals.releaseReady, 1);
  assert.equal(report.totals.blocked, 0);
  assert.equal(report.totals.imageComplete, 1);
  assert.equal(report.totals.odorPresent, 1);
  assert.equal(report.totals.sporePrintPresent, 1);
  assert.equal(report.totals.edibilityPresent, 1);
  assert.deepEqual(report.profileRows[0].fields, {odor:true, sporePrint:true, edibility:true});
  assert.equal(report.totals.independentlyReviewed, 1);
}

{
  const incomplete = {
    ...completeTaxon,
    studyProfile: {},
    id: 'amanita-muscaria',
    scientificName: 'Amanita muscaria',
    habitat: [],
    lookalikes: [],
    sources: [],
    independentReviewStatus: 'not-attested',
    referenceImages: [completeTaxon.referenceImages[0]],
  };
  const report = buildReleaseReadinessReport([completeTaxon, incomplete], [], {checkedAt: '2026-10-08T00:00:00.000Z'});
  assert.equal(report.releaseReady, false);
  assert.equal(report.totals.blocked, 1);
  assert.deepEqual(report.blockers[0].gaps, [
    'missing-habitat',
    'missing-lookalikes',
    'missing-sources',
    'habitat-without-pointwise-evidence',
    'missing-odor',
    'missing-spore-print',
    'missing-edibility',
    'missing-reference-views:top,underside',
    'independent-review-not-attested',
  ]);
  const markdown = formatReleaseReadiness(report);
  assert.match(markdown, /Amanita muscaria/);
  assert.match(markdown, /missing-reference-views:top,underside/);
}

console.log('release-readiness tests passed');

{
  const noStudy = {...completeTaxon, studyProfile: {}};
  const report = buildReleaseReadinessReport([noStudy]);
  assert.equal(report.releaseReady, false);
  assert.equal(report.totals.odorPresent, 0);
  assert.equal(report.totals.sporePrintPresent, 0);
  assert.equal(report.totals.edibilityPresent, 0);
  assert.deepEqual(report.profileRows[0].fields, {odor:false, sporePrint:false, edibility:false});
  assert.ok(report.blockers[0].gaps.includes('missing-odor'));
  assert.ok(report.blockers[0].gaps.includes('missing-spore-print'));
  assert.ok(report.blockers[0].gaps.includes('missing-edibility'));
}
{
  const unsupported = {...completeTaxon, sources: [{fields: ['habitat']}]};
  const gaps = buildReleaseReadinessReport([unsupported]).blockers[0].gaps;
  assert.ok(gaps.includes('odor-without-pointwise-evidence'));
  assert.ok(gaps.includes('spore-print-without-pointwise-evidence'));
  assert.ok(gaps.includes('edibility-without-pointwise-evidence'));
}
