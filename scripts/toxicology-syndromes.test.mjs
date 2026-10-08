import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {applyToxicologySyndromes} from './toxicology-syndromes.mjs';
const data=JSON.parse(readFileSync('src/data/toxicology-syndromes.json','utf8'));
assert.ok(data.records.length>=20, 'Expected at least 20 sourced syndrome mappings');
const records=data.records.map(r=>({scientificName:r.scientificName,studyProfile:{edibility:{label:'Tossica',precautions:[]}},sources:[]}));
applyToxicologySyndromes(records,data);
for(const r of records){
 assert.ok(r.studyProfile.edibility.syndrome.label);
 assert.ok(r.sources.some(s=>s.fields.includes('syndrome')&&s.url.startsWith('https://')));
}
assert.throws(()=>applyToxicologySyndromes([{scientificName:data.records[0].scientificName,studyProfile:{edibility:{label:'Commestibile',precautions:[]}}}],{version:1,records:[data.records[0]]}),/documented toxic/);
assert.throws(()=>applyToxicologySyndromes(records,{version:1,records:[data.records[0],data.records[0]]}),/Invalid syndrome evidence/);
console.log('toxicology-syndromes tests passed');
