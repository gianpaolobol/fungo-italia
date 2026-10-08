import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {applyApprovedExternalStudyEvidence} from './approved-external-study-evidence.mjs';
const dataset=JSON.parse(readFileSync('src/data/external-study-evidence-candidates.json','utf8'));
const records=dataset.records.map(r=>({scientificName:r.scientificName,studyProfile:{edibility:{label:'preserved',precautions:[]}},sources:[]}));
const applied=applyApprovedExternalStudyEvidence(records,dataset);
assert.equal(applied.length,14);
assert.ok(!applied.includes('Amanita virosa'));
for(const name of applied){
 const r=records.find(x=>x.scientificName===name);
 assert.ok(r.studyProfile.odor);
 assert.ok(r.sources.some(s=>s.fields.includes('odor')&&s.url.startsWith('https://')));
 assert.equal(r.studyProfile.edibility.label,'preserved');
}
assert.ok(!records.find(x=>x.scientificName==='Amanita virosa').studyProfile.odor);
console.log('Administrator-approved external evidence: 14 applied, 1 held');
