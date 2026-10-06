import assert from 'node:assert/strict';
import {buildVisualReviewQueue,isThreePlusOneComplete} from '../src/visualReviewQueue.ts';
const item=buildVisualReviewQueue([{id:'specimen',assetIds:['photo1','photo2']}])[0];
assert.equal(item.confidence,'unknown');assert.equal(isThreePlusOneComplete(item),false);
const filled={...item,taxonCandidate:'Amanita sp.',characters:['Lamelle libere','Volva osservata','Anello osservato'],confirmation:'Sporata documentata'};
assert.equal(isThreePlusOneComplete(filled),true);assert.equal(filled.confidence,'unknown');
for(const field of ['taxonCandidate','confirmation'])assert.equal(isThreePlusOneComplete({...filled,[field]:'  '}),false);
assert.equal(isThreePlusOneComplete({...filled,characters:['   ',filled.characters[1],filled.characters[2]]}),false);
console.log('Draft completeness does not assign confidence; empty evidence stays incomplete.');
