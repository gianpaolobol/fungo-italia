import {clusterByTime} from '../src/photoObservations.ts';
import assert from 'node:assert/strict';
import {buildVisualReviewQueue,isThreePlusOneComplete,decodeVisualReviewQueue,createVisualReviewStore,retryPendingVisualReviews} from '../src/visualReviewQueue.ts';
const item=buildVisualReviewQueue([{id:'specimen',assetIds:['photo1','photo2']}])[0];
assert.equal(item.confidence,'unknown');assert.equal(isThreePlusOneComplete(item),false);
const filled={...item,taxonCandidate:'Amanita sp.',characters:['Lamelle libere','Volva osservata','Anello osservato'],confirmation:'Sporata documentata'};
assert.equal(isThreePlusOneComplete(filled),true);assert.equal(filled.confidence,'unknown');
for(const field of ['taxonCandidate','confirmation'])assert.equal(isThreePlusOneComplete({...filled,[field]:'  '}),false);
assert.equal(isThreePlusOneComplete({...filled,characters:['   ',filled.characters[1],filled.characters[2]]}),false);
console.log('Draft completeness does not assign confidence; empty evidence stays incomplete.');

assert.deepEqual(decodeVisualReviewQueue(null).queue,[]);
assert.deepEqual(decodeVisualReviewQueue(JSON.stringify({version:1,queue:[item]})).queue,[item]);
assert.throws(()=>decodeVisualReviewQueue('{broken'));
assert.throws(()=>decodeVisualReviewQueue(JSON.stringify({version:2,queue:[item]})));
assert.throws(()=>decodeVisualReviewQueue(JSON.stringify({version:1,queue:[{...item,characters:['only one']}]})));
assert.throws(()=>decodeVisualReviewQueue(JSON.stringify({version:1,queue:[{...item,status:'scientifically-approved'}]})));

let raw=JSON.stringify({version:1,queue:[item]}),fail=false;
const store=createVisualReviewStore({getItem:async()=>raw,setItem:async(_key,value)=>{await new Promise(r=>setTimeout(r,5));if(fail)throw Error('Storage full');raw=value;}});
const added=buildVisualReviewQueue([{id:'second',assetIds:['content://photos/2']}])[0];
await Promise.all([store.merge([added]),store.save(filled)]);
let saved=await store.read();assert.equal(saved.queue.length,2);assert.equal(saved.queue[0].taxonCandidate,'Amanita sp.');
await Promise.all([store.save({...filled,confirmation:'Aggiornata'}),store.merge([added])]);
saved=await store.read();assert.equal(saved.queue.length,2);assert.equal(saved.queue[0].confirmation,'Aggiornata');
fail=true;await assert.rejects(store.save({...filled,taxonCandidate:'Bozza in memoria'}));assert.equal((await store.read()).queue[0].confirmation,'Aggiornata');
fail=false;await store.save({...filled,taxonCandidate:'Bozza recuperata'});assert.equal((await store.read()).queue[0].taxonCandidate,'Bozza recuperata');
raw='{corrupt-original';await assert.rejects(store.merge([added]));assert.equal(raw,'{corrupt-original');
console.log('Shared photo/review transactions preserve additions and edits, recover after failures and never overwrite corrupt storage.');

const newer={...added,taxonCandidate:'Nuova modifica durante il recupero'};
const pending=new Map([[filled.observationId,filled],[added.observationId,added]]),retried=[];
await retryPendingVisualReviews(pending,async snapshot=>{retried.push(snapshot);if(snapshot.observationId===filled.observationId)pending.set(added.observationId,newer);});
assert.equal(retried[1].taxonCandidate,newer.taxonCandidate);
console.log('Retry reads each pending draft at execution time and cannot overwrite a newer edit with a stale snapshot.');

const grouped=clusterByTime([{id:'dated-1',creationTime:1700000000000},{id:'dated-2',creationTime:1700000001000},{id:'undated-1',creationTime:null},{id:'undated-2',creationTime:null}]);
assert.deepEqual(grouped.map(group=>group.map(asset=>asset.id)),[['dated-1','dated-2'],['undated-1'],['undated-2']]);
assert.equal(grouped.flat().length,4,'No authorized asset may be discarded solely because capture time is missing');
console.log('Undated gallery assets remain separate observations instead of disappearing from the review queue.');
