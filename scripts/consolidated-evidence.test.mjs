import test from 'node:test';
import assert from 'node:assert/strict';
import {candidateReceipt} from './consolidated-evidence.mjs';
const sha='a'.repeat(40),run=(file,conclusion='success')=>({id:1,head_sha:sha,path:'.github/workflows/'+file,event:'push',head_branch:'main',status:'completed',conclusion});
const proofs=()=>({sha,native:run('subscription-storekit-tests.yml'),ui:run('subscription-storekit-ui.yml'),demo:run('agaricus-demo-ui.yml')});
test('successful native, purchase UI and demo proofs authorize only an internal diagnostic receipt',()=>{
 const r=candidateReceipt(proofs());
 assert.equal(r.nativeStorekitVerified,true);assert.equal(r.storekitUIVerified,true);
 assert.equal(r.testFlightOnly,true);assert.equal(r.diagnosticOnly,true);assert.equal(r.appStoreReady,false);
});
for(const proof of ['native','ui','demo'])for(const conclusion of ['failure','timed_out','cancelled','skipped','neutral','action_required',null]){
 test(`${proof} ${conclusion} cannot authorize signing or TestFlight`,()=>{
  const p=proofs();p[proof].conclusion=conclusion;
  assert.throws(()=>candidateReceipt(p));
 });
}
test('every mandatory proof rejects stale source, missing, running and non-main executions',()=>{
 for(const proof of ['native','ui','demo'])for(const mutate of [
  p=>p[proof].head_sha='b'.repeat(40),p=>p[proof]=undefined,
  p=>p[proof].status='in_progress',p=>p[proof].head_branch='other',
  p=>p[proof].event='pull_request',p=>p[proof].path='.github/workflows/unrelated.yml'
 ]){const p=proofs();mutate(p);assert.throws(()=>candidateReceipt(p));}
});

test('owner beta receipt binds the actual science decision without independent approval claims',async()=>{
 const {verifyOwnerBetaScience}=await import('./internal-beta-science.mjs');
 const {ownerCandidateReceipt}=await import('./consolidated-evidence.mjs');
 let science;
 try{science=await verifyOwnerBetaScience(sha);}catch(error){assert.match(error.message,/Reviewed scientific content changed/);assert.equal(error.scienceReport.betaAllowed,false);assert.throws(()=>ownerCandidateReceipt(proofs(),error.scienceReport));return;}

 const r=ownerCandidateReceipt(proofs(),science);
 assert.equal(r.scientificReview.ownerReview.reviewType,'owner-review');
 assert.equal(r.scientificReview.independentReleaseReady,false);
 assert.equal(r.appStoreReady,false);
 for(const mutate of [s=>s.sourceCommit='b'.repeat(40),s=>s.ownerGroupId='other',s=>s.appStoreReady=true,s=>s.ownerReview.declarationSha256='b'.repeat(64)]){
  const changed=structuredClone(science);mutate(changed);assert.throws(()=>ownerCandidateReceipt(proofs(),changed));
 }
 assert.throws(()=>ownerCandidateReceipt(proofs(),undefined));
});
