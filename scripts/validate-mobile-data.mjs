import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const catalog=JSON.parse(await readFile('src/data/catalog.json','utf8'));
const groups=JSON.parse(await readFile('src/data/groups.json','utf8'));
assert.equal(groups.length,66);
assert.equal(new Set([...catalog,...groups].map(t=>t.id)).size,214);
const areas=JSON.parse(await readFile('src/data/areas.json','utf8'));
assert.equal(catalog.length,148);
assert.equal(new Set(catalog.map(t=>t.id)).size,148);
assert(catalog.every(t=>t.characters.length===3&&t.sources.length&&t.independentReviewStatus==='not-attested'));
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
