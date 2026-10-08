import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {applyApprovedExternalStudyEvidence} from './approved-external-study-evidence.mjs';
const dataset=JSON.parse(readFileSync('src/data/external-study-evidence-candidates.json','utf8'));
const records=dataset.records.map(r=>({scientificName:r.scientificName,studyProfile:{edibility:{label:'preserved',precautions:[]}},sources:[]}));
const applied=applyApprovedExternalStudyEvidence(records,dataset);
assert.ok(applied.length<=14);
assert.ok(!applied.includes('Lactarius volemus s.l.'));
assert.ok(applied.length>0);
assert.ok(!applied.includes('Amanita virosa'));
for(const name of applied){
 const r=records.find(x=>x.scientificName===name);
 assert.ok(r.studyProfile.odor);
 assert.ok(r.sources.some(s=>s.fields.includes('odor')&&s.url.startsWith('https://')));
 assert.equal(r.studyProfile.edibility.label,'preserved');
}
assert.ok(!records.find(x=>x.scientificName==='Amanita virosa').studyProfile.odor);
const unresolved={version:1,records:[{scientificName:'Test group',odor:'sample',sporePrint:{label:'white'},sources:[{url:'https://example.org',fields:['odor','sporePrint'],locator:'page 1'}],administratorReview:{status:'approved',date:'2026-10-09'},reviewStatus:'candidate-taxonomic-scope-check-required'}]};
const sample=[{scientificName:'Test group',studyProfile:{},sources:[]}];
assert.deepEqual(applyApprovedExternalStudyEvidence(sample,unresolved),[]);
assert.equal(sample[0].studyProfile.odor,undefined);
console.log('External evidence gate: approved records applied, unresolved taxonomic scope held');
