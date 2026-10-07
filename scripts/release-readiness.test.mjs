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
    {sourceId: 'S-test', fields: ['habitat'], supportedClaim: 'habitat documented'},
  ],
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
  assert.equal(report.totals.independentlyReviewed, 1);
}

{
  const incomplete = {
    ...completeTaxon,
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
    'missing-reference-views:top,underside',
    'independent-review-not-attested',
  ]);
  const markdown = formatReleaseReadiness(report);
  assert.match(markdown, /Amanita muscaria/);
  assert.match(markdown, /missing-reference-views:top,underside/);
}

console.log('release-readiness tests passed');
