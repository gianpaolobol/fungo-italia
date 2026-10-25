import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readReviewedMatrix} from './reviewed-matrix.mjs';
import {applyReviewedCurriculum} from './reviewed-curriculum.mjs';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const input=async()=>({records:[...await read('src/data/catalog.json'),...await read('src/data/groups.json')],matrix:await readReviewedMatrix(),profiles:await read('src/data/study-profiles.json'),scope:await read('src/data/curriculum-scope.json'),objectives:await read('legacy/web/data/taxonomic-objectives.json')});
test('web boundary reviews only214 historical units and preserves4 curriculum-only groups',async()=>{
 const d=await input(),extra=d.records.filter(t=>d.scope.units.some(u=>u.id===t.id&&u.completionCard)),before=structuredClone(extra);
 const result=applyReviewedCurriculum(d.records,d.matrix,d.profiles,d.scope,d.objectives);
 assert.equal(d.records.length,218);assert.equal(extra.length,4);assert.deepEqual(extra,before);assert.equal(result.version,d.matrix.matrixVersion);
});
test('web boundary rejects missing, extra or unsupported curriculum-only units',async()=>{
 const d=await input();assert.throws(()=>applyReviewedCurriculum(d.records.slice(1),d.matrix,d.profiles,d.scope,d.objectives));
 const records=structuredClone(d.records);records.push({...records[0],id:'outside-program'});assert.throws(()=>applyReviewedCurriculum(records,d.matrix,d.profiles,d.scope,d.objectives));
 const changed=structuredClone(d.records);changed.find(t=>d.scope.units.some(u=>u.id===t.id&&u.completionCard)).characters=['Unreviewed character'];
 assert.throws(()=>applyReviewedCurriculum(changed,d.matrix,d.profiles,d.scope,d.objectives));
});
