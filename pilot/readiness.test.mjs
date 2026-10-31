import test from 'node:test';
import assert from 'node:assert/strict';
import {assessQualification} from './readiness.mjs';
const start=Date.parse('2026-11-01T00:00:00Z'),end=start+8*86400000;
function evidence(){return {version:1,environment:'pilot-only',billingLimitEur:0,
  noAutomaticUpgrade:true,freeQuotaVerified:true,independentWatchdog:true,
  dedicatedDatabase:true,realDatabaseRead:true,receivedOutageAlert:true,receivedRecoveryAlert:true,
  weeklySummaryReceived:true,restoreTestPassed:true,privateFileAccessTestPassed:true,
  startedAt:start,observations:Array.from({length:33},(_,i)=>({at:start+i*21600000,ok:true})),
  checkedAt:end,reference:'private-evidence-location'};}
test('empty qualification cannot close continuity task',()=>{
  assert.equal(assessQualification({},end).ready,false);
  assert.equal(assessQualification(null,end).ready,false);
});
test('eight days of actual observations plus operational proofs may qualify continuity only',()=>{
  assert.deepEqual(assessQualification(evidence(),end),{ready:true,blockers:[]});
});
test('claims cannot replace missing days, stale scheduler or missing notification/restore proof',()=>{
  for(const patch of [
    {observations:[{at:end,ok:true}]},{receivedOutageAlert:false},{restoreTestPassed:false},
    {billingLimitEur:1},{noAutomaticUpgrade:false},{realDatabaseRead:false},
    {checkedAt:end+1},{observations:[{at:start,ok:true},{at:end,ok:true}]},
    {observations:[...evidence().observations,{at:end+1,ok:true}]},
    {observations:evidence().observations.slice().reverse()},
    {startedAt:start+1},{reference:''},{environment:'production'},
  ])assert.equal(assessQualification({...evidence(),...patch},end).ready,false,JSON.stringify(patch));
  assert.equal(assessQualification(evidence(),end+16*3600000).ready,false);
});
test('failed observations keep the task open until a clean qualifying window is collected',()=>{
  const e=evidence();e.observations[10].ok=false;assert.equal(assessQualification(e,end).ready,false);
});
