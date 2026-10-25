import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
const api=await import('./curriculum-scope.mjs').catch(()=>({}));
const objectives=JSON.parse(await readFile('legacy/web/data/taxonomic-objectives.json','utf8'));
const readScope=async()=>JSON.parse(await readFile('src/data/curriculum-scope.json','utf8'));
test('explicit nominal allowlist restores 218 minimum units without admitting a genus species',async()=>{
 assert.equal(typeof api.applyCurriculumScope,'function');
 const scope=await readScope();assert.equal(scope.units.length,218);
 const records=scope.units.map(u=>({id:u.id,scientificName:u.scientificName,rank:u.rank,sources:[]}));
 api.applyCurriculumScope(records,scope,objectives);
 assert(records.every(r=>r.curriculum.level==='minimum'&&r.curriculum.objectiveId));
 assert.throws(()=>api.applyCurriculumScope([...records,{id:'agaricus-augustus',scientificName:'Agaricus augustus',rank:'species'}],scope,objectives),/curriculum/i);
 assert.throws(()=>api.applyCurriculumScope(records.slice(1),scope,objectives),/missing/i);
 for(const [field,value] of [['scientificName','Agaricus augustus'],['rank','species']]){
  const bad=structuredClone(records);bad[0][field]=value;assert.throws(()=>api.applyCurriculumScope(bad,scope,objectives),/mismatch/i);
 }
 const bad=structuredClone(records);bad[0].curriculum.level='desirable';assert.throws(()=>api.applyCurriculumScope(bad,scope,objectives),/level/i);
 const altered=structuredClone(scope);altered.units[0].sourcePage=21;assert.throws(()=>api.applyCurriculumScope(records,altered,objectives),/page/i);
 for(const name of ['Armillaria','Inocybe'])assert.equal(records.find(r=>r.scientificName.startsWith(name)).deepMorphologyRequired,true);
});
test('four source-bound completion groups contain objectives and no invented scientific evidence',async()=>{
 assert.equal(typeof api.curriculumCompletionCards,'function');
 const scope=await readScope(),cards=api.curriculumCompletionCards(scope,objectives);
 assert.equal(cards.length,4);
 assert.deepEqual(cards.map(c=>c.scientificName),['Clathraceae e Phallaceae','Geastraceae + Astraeus','Lycoperdaceae','Pezizaceae s.l. (funghi epigei a coppa o disco)']);
 assert(cards.every(c=>c.curriculumObjective&&c.curriculum.sourcePage>0&&c.curriculum.level==='minimum'));
 for(const c of cards){for(const key of ['characters','habitat','lookalikes','sources','currentGenera','relatedIds'])assert.deepEqual(c[key],[]);for(const key of ['studyProfile','referenceImages','courseImages','commercialization'])assert.equal(c[key],undefined);}
 assert.throws(()=>api.curriculumCompletionCards(scope,objectives.filter(o=>o.id!==cards[0].curriculum.objectiveId)),/objective/i);
});
test('cleaning preserves explicit curriculum level and objective binding',async()=>{
 const {cleanAtlasRecord}=await import('./atlas-content.mjs');
 const curriculum={documentId:'S1-obiettivi-tassonomici-v4-2026-06-09',sourcePage:4,level:'minimum',objectiveId:'objective-agaricus'};
 assert.deepEqual(cleanAtlasRecord({id:'x',curriculum,sources:[{sourceId:curriculum.documentId,location:'p. 4'}]}).curriculum,curriculum);
});
