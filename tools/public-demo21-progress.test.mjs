import {test} from 'node:test';
import assert from 'node:assert/strict';
import {progressFixture,assertBrowserProgress} from './public-demo21-progress.mjs';
const state=()=>({note:'keep-existing-notes',study:{version:1,favoriteIds:['minimum-card-objective-agaricus--01--agaricus-sez-xanthodermatei'],resumeId:'minimum-card-objective-agaricus--01--agaricus-sez-xanthodermatei'},notes:structuredClone(progressFixture.notes)});
test('real note drafts, preferences and resume state survive together',()=>assert.doesNotThrow(()=>assertBrowserProgress(state())));
test('wiping the real notes key must fail even when the unrelated marker survives',()=>{
 for(const notes of [null,{version:1,drafts:[]}])assert.throws(()=>assertBrowserProgress({...state(),notes}));
 const changed=state();changed.notes.drafts[0].notes='lost';assert.throws(()=>assertBrowserProgress(changed));
});
