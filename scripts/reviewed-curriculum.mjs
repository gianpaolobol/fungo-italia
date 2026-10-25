import assert from 'node:assert/strict';
import {applyReviewedMatrix} from './reviewed-matrix.mjs';
import {applyCurriculumScope,curriculumCompletionCards} from './curriculum-scope.mjs';
export function applyReviewedCurriculum(records,matrix,profiles,scope,objectives){
 // Validate the full atlas before selecting the historical scientific-review boundary.
 applyCurriculumScope(structuredClone(records),scope,objectives);
 const completions=curriculumCompletionCards(scope,objectives),completionIds=new Set(completions.map(t=>t.id));
 for(const card of completions)assert.deepEqual(records.find(t=>t.id===card.id),card,'Curriculum-only group acquired unsupported scientific data');
 assert(matrix.taxa.every(t=>!completionIds.has(t.id)),'Curriculum-only group entered historical review');
 assert.equal(records.length,matrix.taxa.length+completions.length,'Unaccounted curriculum units');
 return applyReviewedMatrix(records.filter(t=>!completionIds.has(t.id)),matrix,profiles);
}
