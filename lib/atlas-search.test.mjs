import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {searchAtlas} from './atlas-search.mjs';
const groups=JSON.parse(await readFile('src/data/groups.json','utf8'));
const catalog=JSON.parse(await readFile('src/data/catalog.json','utf8'));
const taxa=[...catalog,...groups];
for(const [query,expected] of [['Limacella','Limacella (inclusi Limacellopsis, Zhuliangomyces)'],['Paxillus','Paxillus'],['Geastrum','Geastraceae + Astraeus']]){
 const rows=searchAtlas(taxa,query,{level:'minimum'});
 assert(rows.some(t=>t.scientificName===expected),query+' not discoverable among minimum objectives');
}
assert(!taxa.some(t=>t.scientificName==='Tapinella'),'Tapinella must not be added without S1 approval');
console.log('Minimum-objective genus search verified: Limacella, Paxillus, Geastrum.');
