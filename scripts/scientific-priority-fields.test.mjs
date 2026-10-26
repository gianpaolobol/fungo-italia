import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>JSON.parse(readFileSync('src/data/'+name+'.json','utf8'));
const supplements=read('supplementary-literature'),catalog=read('catalog'),scope=read('curriculum-scope');
const targets=[['Cortinarius orellanus','lookalikes','cortinarius-orellanus'],['Galerina marginata group','habitat','galerina-marginata'],['Gyromitra esculenta','lookalikes','gyromitra-esculenta'],['Amanita pantherina','habitat','amanita-pantherina'],['Amanita gemmata','habitat','amanita-gemmata'],['Lepiota brunneoincarnata','habitat','lepiota-brunneoincarnata']];
test('priority evidence reaches only the existing S1 units and supports the exact generated field',()=>{
 for(const [name,field,slug] of targets){
  const card=catalog.find(x=>x.scientificName===name),unit=scope.units.find(x=>x.id===card?.id),entry=supplements.records.find(x=>x.scientificName===name);
  assert.ok(unit&&entry,'Missing scoped supplement '+name);assert.equal(card.rank,unit.rank);assert.equal(card.curriculum.sourcePage,unit.sourcePage);
  const sources=entry.sources.filter(s=>s.sourceId==='SUPPLEMENT-FIELD-'+slug.toUpperCase()+'-20261026');
  assert.equal(sources.length,1,name);const source=sources[0];assert.deepEqual(source.fields,[field]);assert.equal(source.url,'https://www.first-nature.com/fungi/'+slug+'.php');assert.ok(source.location);assert.ok(source.supportedClaim);assert.equal(source.consultedAt,'2026-10-26');assert.equal(source.reviewStatus,'source-consulted-pending-independent-review');
  assert.ok(entry[field].length>0);for(const value of entry[field])assert.ok(card[field].includes(value));
  assert.ok(card.sources.some(s=>s.sourceId===source.sourceId&&s.fields.includes(field)));
 }
});
test('nominal Galerina habitat retains the group limitation and comparisons do not create targets',()=>{
 const card=catalog.find(x=>x.scientificName==='Galerina marginata group');
 assert.ok(card.habitat.some(x=>x.startsWith('Per il taxon nominale Galerina marginata:')&&x.includes('non generalizzabile')));
 assert.equal(catalog.filter(x=>x.scientificName==='Galerina marginata').length,0);
 const gyro=catalog.find(x=>x.scientificName==='Gyromitra esculenta');assert.ok(gyro.lookalikes.some(x=>x.startsWith('Helvella crispa:')&&x.includes('cavità longitudinali')));
 const orellanus=catalog.find(x=>x.scientificName==='Cortinarius orellanus');assert.ok(orellanus.lookalikes.some(x=>x.startsWith('Cortinarius rubellus:')&&x.includes('disegno giallastro')));
});
