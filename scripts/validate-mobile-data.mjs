import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const catalog=JSON.parse(await readFile('src/data/catalog.json','utf8'));
const groups=JSON.parse(await readFile('src/data/groups.json','utf8'));
assert.equal(groups.length,66);
assert.equal(new Set([...catalog,...groups].map(t=>t.id)).size,214);
const areas=JSON.parse(await readFile('src/data/areas.json','utf8'));
assert.equal(catalog.length,148);
assert.equal(new Set(catalog.map(t=>t.id)).size,148);
assert(catalog.every(t=>t.characters.length===3&&t.differentiatingCharacter&&t.curriculum?.sourcePage>0));
assert.equal(new Set(areas.map(a=>a.region)).size,20);
assert.equal(areas.length,71);
const amiata=areas.find(a=>a.id==='amiata');
assert(amiata&&amiata.center[0]>42&&amiata.center[0]<44&&amiata.center[1]>10&&amiata.center[1]<13,'Amiata coordinate order must be [latitude,longitude]');
assert(areas.every(a=>Math.abs(a.center[0])<=90&&Math.abs(a.center[1])<=180));
console.log('Offline catalog integrity, scientific provenance and all 20 regions verified.');

const supplements=JSON.parse(await readFile('src/data/supplementary-literature.json','utf8'));
for(const extra of supplements.records){
 const taxon=catalog.find(t=>t.scientificName===extra.scientificName);assert(taxon,'Unknown supplementary unit');
 for(const field of ['commonNames','habitat','lookalikes'])assert(extra[field].every(value=>taxon[field].includes(value)),'Supplementary '+field+' lost on regeneration');
 assert(extra.sources.every(source=>taxon.sources.some(s=>s.sourceId===source.sourceId&&s.url===source.url&&s.reviewScope==='supplementary-literature')),'Missing field-specific references');
}
assert(catalog.find(t=>t.scientificName==='Boletus edulis s.l.').commonNames.includes('Porcini'));
console.log('Supplementary names, habitats and comparison pointers survive canonical data regeneration without changing independent review status.');

const foundations=JSON.parse(await readFile('src/data/internal-foundations.json','utf8'));
assert.deepEqual(foundations.documents.map(d=>d.sourceId),['S1-obiettivi-tassonomici-v4-2026-06-09','S2-guida-ragionata-commestibilita-2021']);
assert(foundations.documents.every(d=>d.visibility==='internal'));
assert.equal(foundations.scientificStatus.independentReviewComplete,false);
assert.equal(foundations.scientificStatus.edibilityAssessment,'not-published');
assert.equal(foundations.rules.foodClaimsRequirePointwiseGuideEvidence,true);
for(const t of [...catalog,...groups]){
 assert(t.curriculum?.documentId===foundations.curriculum.objectiveSourceId&&Number.isInteger(t.curriculum.sourcePage)&&t.curriculum.sourcePage>0,'Missing curriculum reference');
 assert(!('summary' in t)&&!('reviewStatus' in t)&&!('independentReviewStatus' in t),'Redundant generated metadata returned');
 assert(!t.sources.some(s=>/^(S1-|S2-|AUDIT-|EDITORIAL-)/.test(s.sourceId)),'Internal document in public sources');
}
assert.equal(catalog.filter(t=>t.diagnosticNote).length,15);
assert.equal(catalog.filter(t=>t.safetyCheck).length,4);
const bibliography=JSON.parse(await readFile('src/data/bibliography.json','utf8'));
assert(!bibliography.some(s=>/^(S1-|S2-|AUDIT-|EDITORIAL-)/.test(s.sourceId)));
console.log('Founding curriculum and edibility documents remain internal; useful diagnostic limits, safety checks and external references preserved.');
