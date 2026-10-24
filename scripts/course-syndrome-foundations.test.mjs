import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {internalFoundations} from './atlas-content.mjs';
const read=name=>JSON.parse(readFileSync('src/data/'+name+'.json','utf8'));
const foundations=read('course-syndrome-foundations'), registry=read('course-sources');
const internal=read('internal-foundations'),catalog=read('catalog'),groups=read('groups'),bank=read('exam-bank');
assert.equal(foundations.documents.length,8);
assert.equal(new Set(foundations.documents.map(d=>d.sourceId)).size,8);
assert.deepEqual(foundations.syndromes.map(s=>s.id).sort(),['falloidea','orellanica','giromitrica','paxillica','rabdomiolitica','encefalica','muscarinica','panterinica','coprinica','psicotropa','gastrointestinale','emolitica','norleucinica','acromelalgica','szechwan'].sort());
for(const d of foundations.documents){
 assert.match(d.fileHashSha256,/^[a-f0-9]{64}$/);
 assert.equal(d.independentReviewStatus,'not-attested');
 assert.equal(d.ownerCertification.status,'certified-course-source-by-project-owner');
 assert.equal(d.rights.originalPublished,false);
 assert.ok(registry.documents.some(s=>s.sourceId===d.sourceId));
 assert.ok(internal.documents.some(s=>s.sourceId===d.sourceId&&s.role==='toxicology-reference'));
}
for(const s of foundations.syndromes){
 assert.ok(s.sourceIds.every(id=>foundations.documents.some(d=>d.sourceId===id)));
 assert.equal(s.allowAutomaticQuizClaims,false);
 assert.equal(s.curriculumEffect,'none');
 assert.equal(s.reviewStatus,'source-mapped-not-independently-reviewed');
}
assert.equal(catalog.length,148);assert.equal(groups.length,66);
assert.equal(internal.curriculum.requiredMinimumUnits,148);
assert.equal(internal.scientificStatus.independentReviewComplete,false);
assert.equal(internal.rules.ownerCertificationIsNotIndependentReview,true);
const synthesis=id=>foundations.syndromes.find(s=>s.id===id).editorialSynthesis;
assert.match(synthesis('rabdomiolitica').latency,/24–72.*ultimo pasto/);
assert.match(synthesis('norleucinica').severity,/anche grave.*dialisi/);
assert.match(synthesis('norleucinica').severity,/Non classificare come normalmente benigna/);
assert.ok(foundations.externalReferences.some(s=>s.sourceId==='EXT-TOX-KIRCHMAIR-2012'));
const profile=name=>catalog.find(t=>t.scientificName===name).studyProfile.edibility;
assert.deepEqual(profile('Tricholoma equestre').syndrome.latency,synthesis('rabdomiolitica').latency);
assert.deepEqual(profile('Amanita proxima').syndrome.latency,synthesis('norleucinica').latency);
assert.match(profile('Mycena sez. Purae').syndrome.label,/gastrointestinale.*incostante/);
assert.match(profile('Cortinarius sottogenere Dermocybe').syndrome.label,/non orellanic/);
for(const name of ['Coprinus comatus','Auricularia auricula-judae']){
 assert.ok(!profile(name).syndrome?.references?.some(r=>r.sourceId?.startsWith('COURSE-TOX-')));
}
const sourceIds=new Set(foundations.documents.map(d=>d.sourceId));
assert.ok(catalog.filter(t=>t.sources.some(s=>sourceIds.has(s.sourceId))).length>=20);
// Additional toxicology foundations cannot become the curriculum authority.
const original=internal.documents.filter(d=>['curriculum','edibility-reference'].includes(d.role));
assert.equal(internalFoundations(original,foundations.documents).curriculum.objectiveSourceId,'S1-obiettivi-tassonomici-v4-2026-06-09');
assert.equal(internalFoundations(original).documents.length,2);
console.log(JSON.stringify({images:8,syndromes:15,catalog:catalog.length,groups:groups.length,examCases:bank.length,independentReview:false}));
