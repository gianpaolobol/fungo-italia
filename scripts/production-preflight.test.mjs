import {test} from 'node:test';
import assert from 'node:assert/strict';

const sha='a'.repeat(40);
const paths={native:'subscription-storekit-tests.yml',ui:'subscription-storekit-ui.yml',demo:'agaricus-demo-ui.yml',scientific:'scientific-generator-verification.yml'};
const proof=()=>Object.fromEntries(Object.entries(paths).map(([key,path],i)=>[key,{id:i+1,path:'.github/workflows/'+path,head_sha:sha,head_branch:'main',event:key==='scientific'?'workflow_dispatch':'push',status:'completed',conclusion:'success'}]));
async function validator(){
 const module=await import('./production-preflight.mjs').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return{};throw error;});
 assert.equal(typeof module.validateProductionProofs,'function','Production needs an executable exact-source preflight');
 return module.validateProductionProofs;
}
test('production accepts only successful exact-main native, UI, demo and strict scientific runs',async()=>{
 const validate=await validator(),result=validate({sha,mainSha:sha,runs:proof()});
 assert.equal(result.sourceCommit,sha);
 assert.equal(result.appStoreReady,false,'Technical preflight must not certify public App Store readiness');
 assert.equal(result.buildProfile,'production');
 assert.deepEqual(Object.keys(result.evidence).sort(),['demo','native','scientific','ui']);
});
test('production refuses stale, pending, failed, cancelled and cross-source evidence',async()=>{
 const validate=await validator();
 assert.throws(()=>validate({sha,mainSha:'b'.repeat(40),runs:proof()}));
 for(const key of Object.keys(paths))for(const patch of [{status:'in_progress'},{conclusion:'failure'},{conclusion:'timed_out'},{conclusion:'cancelled'},{head_sha:'b'.repeat(40)},{head_branch:'other'},{event:'pull_request'},{path:'.github/workflows/other.yml'},{id:0}]){
  const runs=proof();Object.assign(runs[key],patch);assert.throws(()=>validate({sha,mainSha:sha,runs}),key+JSON.stringify(patch));
 }
 const runs=proof();delete runs.scientific;assert.throws(()=>validate({sha,mainSha:sha,runs}));
});
