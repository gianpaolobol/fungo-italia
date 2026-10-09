import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {applyReviewedMatrix,readReviewedMatrix} from './reviewed-matrix.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../src/data/'+name+'.json',import.meta.url)));
const profiles=read('study-profiles');
const matrix=await readReviewedMatrix();
const records=()=>[...read('catalog'),...read('groups')];
test('matrix import preserves guide categories and imports the documented ISPRA fields',()=>{
 const rows=records();applyReviewedMatrix(rows,matrix,profiles);
 for(const row of matrix.taxa){const t=rows.find(t=>t.id===row.id);assert.equal(t.studyProfile.odor,row.values.odor);}
 const helvella=rows.find(t=>t.scientificName==='Helvella');assert.equal(helvella.characters.length,3);assert.match(helvella.differentiatingCharacter,/singola specie/);
 const procera=rows.find(t=>t.scientificName==='Macrolepiota procera s.l.');assert.equal(procera.studyProfile.edibility.category,'free');assert.match(procera.studyProfile.edibility.precautions.join(' '),/non una prescrizione generale/);
 assert.equal(rows.filter(t=>t.studyProfile.edibility?.category).length,147);
});
test('an alternative source or matrix edit cannot override the founding guide',()=>{
 const corrupt=structuredClone(matrix);const nebularis=corrupt.taxa.find(t=>t.scientificName==='Clitocybe nebularis');nebularis.values['edibility.category']='libera';
 assert.throws(()=>applyReviewedMatrix(records(),corrupt,profiles),/Guida/);
 const policy=structuredClone(matrix);policy.edibilityPolicy.otherSourcesMayOverride=true;
 assert.throws(()=>applyReviewedMatrix(records(),policy,profiles),/prevalente/);
});
test('groups and the unmentioned species do not inherit edibility',()=>{
 const rows=records();applyReviewedMatrix(rows,matrix,profiles);
 for(const t of rows.filter(t=>t.kind==='teaching-group'||t.scientificName==='Lepiota elaiophylla'))assert.equal(t.studyProfile.edibility,undefined);
});
