import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=name=>JSON.parse(readFileSync(new URL('../src/data/'+name,import.meta.url),'utf8'));
const catalog=data('catalog.json'),groups=data('groups.json'),review=data('atlas-field-review-20261009.json');
const profile=name=>catalog.find(r=>r.scientificName===name)?.studyProfile;
test('all 214 cards have a matching review and regenerated field coverage',()=>{
 assert.equal(catalog.length,148);assert.equal(groups.length,66);assert.equal(review.records.length,214);
 assert.equal(new Set(review.records.map(r=>r.scientificName)).size,214);
 for(const card of [...catalog,...groups]){
  const row=review.records.find(r=>r.scientificName===card.scientificName);assert(row,card.scientificName);
  for(const field of ['odor','sporePrint'])assert.equal(Boolean(card.studyProfile?.[field]),row.fields[field]==='documented',card.scientificName+' '+field);
 }
 assert.deepEqual(review.records.filter(r=>r.missingFields.length).map(r=>r.scientificName).sort(),['Ramaria pallida','Scutiger pes-caprae']);
});
test('the uploaded lot remains species-scoped inside named complexes',()=>{
 assert.match(profile('Gyroporus castaneus s.l.').sporePrint.label,/non estesa/i);
 assert.match(profile('Pleurotus eryngii s.l.').odor,/nominale/);
 const terreum=catalog.find(r=>r.scientificName.startsWith('Tricholoma gruppo T. terreum'));
 assert.match(terreum.studyProfile.odor,/T\. scalpturatum/);
 assert.match(terreum.studyProfile.sporePrint.label,/non estesa/);
 assert.match(profile('Leucopaxillus gentianeus').odor,/farinaceo/i);
});
test('all newly reviewed fields have read-source evidence; no added source grants edibility',()=>{
 const integration=data('study-profiles.json'),registry=data('course-sources.json');
 const sources=new Map([...registry.documents,...registry.externalReferences].map(r=>[r.sourceId,r]));
 for(const r of integration.records)for(const e of r.evidence){
  if(!e.sourceId.startsWith('LIT-ATLAS-'))continue;
  const s=sources.get(e.sourceId);assert(s);assert.equal(s.analysisStatus,'extracted-text-reviewed');
  assert.match(s.extractedTextSha256,/^[a-f0-9]{64}$/);assert(!e.fields.includes('edibility'));
 }
 for(const genus of groups)assert.equal(genus.studyProfile?.edibility,undefined,genus.scientificName);
});
test('reported prints, gasteromycete powder and unresolved observations retain their limits',()=>{
 assert.match(profile('Lactarius porniniae').sporePrint.label,/non ottenuta/);
 assert.match(groups.find(r=>r.scientificName==='Pisolithus').studyProfile.sporePrint.label,/gleba/);
 assert.equal(profile('Scutiger pes-caprae').sporePrint,undefined);
 assert.equal(profile('Ramaria pallida').sporePrint,undefined);
 assert.match(catalog.find(r=>r.scientificName==='Lepiota elaiophylla').diagnosticNote,/amanitina/);
});
