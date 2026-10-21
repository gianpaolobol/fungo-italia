import test from 'node:test';
import assert from 'node:assert/strict';
import {readStudyPreferences} from '../lib/study-preferences.mjs';
function memory(entries){const calls=[],values=new Map(entries);return {calls,values,getItem:async key=>{calls.push(key);return values.get(key)??null;}};}
test('web preserves prior favorites for first shared-app launch without writing old storage',async()=>{
 const legacy=JSON.stringify({version:1,favoriteIds:['agaricus'],resumeId:'agaricus'}),store=memory([['fungo-italia:pwa:study:v1',legacy]]);
 assert.equal(await readStudyPreferences(store,true),legacy);assert.equal(store.values.size,1);
});
test('existing shared preferences take priority, native never reads legacy and read failures propagate',async()=>{
 const store=memory([['fungo-italia:study:v1','existing'],['fungo-italia:pwa:study:v1','legacy']]);
 assert.equal(await readStudyPreferences(store,true),'existing');assert.equal(store.calls.length,1);
 const native=memory([]);assert.equal(await readStudyPreferences(native,false),null);assert.deepEqual(native.calls,['fungo-italia:study:v1']);
 await assert.rejects(()=>readStudyPreferences({getItem:async()=>{throw Error('unreadable');}},true));
});
