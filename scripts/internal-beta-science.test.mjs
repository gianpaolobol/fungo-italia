import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {ownerBetaDecision,manifestDigest} from './internal-beta-science.mjs';
const digest=x=>createHash('sha256').update(x).digest('hex');
const sourceCommit='a'.repeat(40);
function fixture(){
 const files=[{path:'src/data/catalog.json',bytes:2,sha256:digest('[]')}];
 const deferredGaps=[{id:'unit',gaps:['independent-review-not-attested','missing-spore-print']}];
 const readiness={schemaVersion:1,scope:'catalog',totals:{checked:148,independentlyReviewed:0,blocked:148},blockers:deferredGaps,releaseReady:false};
 const toxicology={errors:[],warnings:['unit: toxicology evidence not independently reviewed'],releaseBlocked:true};
 const attestation={schemaVersion:1,reviewType:'owner-review',reviewer:{name:'Gian Paolo Franceschini',role:'owner'},declaredOn:'2026-10-26',declaration:'per ora attesto io come revisione e mi riservo di inviare ad altri revisori successivamente',approvalScope:'owner-internal-testflight',ownerGroupId:'f642807c-e4b2-43d4-a32a-d9fd087fdfe3',independentReviewComplete:false,appStoreReady:false,publicWebAllowed:false,externalTestersAllowed:false,files,contentDigest:manifestDigest(files),deferredGaps,toxicologyWarnings:toxicology.warnings};
 const data={attestation,files,readiness,toxicology,sourceCommit};
 return {data,options:{expectedAttestationDigest:digest(JSON.stringify(attestation))}};
}
function repin(f){f.options.expectedAttestationDigest=digest(JSON.stringify(f.data.attestation));return f;}
test('real owner declaration permits only internal beta and preserves incomplete independent science',()=>{
 const f=fixture(),before=structuredClone(f.data),r=ownerBetaDecision(f.data,f.options);
 assert.equal(r.betaAllowed,true);assert.equal(r.appStoreReady,false);assert.equal(r.independentReleaseReady,false);
 assert.equal(r.sourceCommit,sourceCommit);assert.equal(r.ownerReview.reviewType,'owner-review');assert.equal(r.ownerReview.independentReviewComplete,false);
 assert.deepEqual(f.data,before,'never mutate data or scientific approval');
});
test('missing, changed or self-upgraded declarations fail closed',()=>{
 for(const mutate of [f=>f.data.attestation=null,f=>f.data.attestation.declaration='changed',f=>f.data.attestation.independentReviewComplete=true,f=>f.data.attestation.reviewType='independent-review']){
  const f=fixture();mutate(f);assert.throws(()=>ownerBetaDecision(f.data,f.options));
 }
});
test('owner-only scope cannot authorize public web, external testing, App Store or another group',()=>{
 for(const mutate of [a=>a.approvalScope='production',a=>a.appStoreReady=true,a=>a.publicWebAllowed=true,a=>a.externalTestersAllowed=true,a=>a.ownerGroupId='other',a=>a.reviewer.role='independent-mycologist']){
  const f=fixture();mutate(f.data.attestation);repin(f);assert.throws(()=>ownerBetaDecision(f.data,f.options));
 }
});
test('changed, removed or added scientific bytes require a new declaration',()=>{
 for(const mutate of [f=>f.data.files[0].sha256='b'.repeat(64),f=>f.data.files=[],f=>f.data.files.push({path:'src/data/extra.json',sha256:digest('{}'),bytes:2})]){
  const f=fixture();mutate(f);assert.throws(()=>ownerBetaDecision(f.data,f.options));
 }
});
test('additional gaps, missing gap records and structural toxicology errors stay blocking',()=>{
 for(const mutate of [f=>f.data.readiness.blockers[0].gaps.push('habitat-without-pointwise-evidence'),f=>f.data.readiness.blockers=[],f=>f.data.toxicology.errors=['incomplete syndrome evidence'],f=>f.data.toxicology.warnings.push('new pending mapping'),f=>f.data.readiness.totals.checked=147]){
  const f=fixture();mutate(f);assert.throws(()=>ownerBetaDecision(f.data,f.options));
 }
});
test('invalid manifest paths, digests, duplicate entries and source identities are rejected',()=>{
 const entry={path:'src/data/catalog.json',bytes:2,sha256:digest('[]')};
 for(const files of [[{...entry,path:'../secret'}],[{...entry,sha256:'bad'}],[entry,entry],[{...entry,bytes:-1}]])assert.throws(()=>manifestDigest(files));
 const f=fixture();f.data.sourceCommit='main';assert.throws(()=>ownerBetaDecision(f.data,f.options));
});

test('failed CLI revalidation overwrites stale success with strict diagnostics and a negative decision',async()=>{
 const {mkdtemp,writeFile,readFile,rm}=await import('node:fs/promises');
 const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const {spawnSync}=await import('node:child_process');
 const dir=await mkdtemp(join(tmpdir(),'fungo-owner-fail-'));
 try{
  await writeFile(join(dir,'internal-beta-science.json'),JSON.stringify({betaAllowed:true}));
  const r=spawnSync(process.execPath,['scripts/internal-beta-science.mjs'],{encoding:'utf8',env:{...process.env,GITHUB_SHA:sourceCommit,RUNNER_TEMP:dir,GITHUB_OUTPUT:'',FUNGO_CATALOG_JSON:'src/data/groups.json'}});
  assert.equal(r.status,1);
  const report=JSON.parse(await readFile(join(dir,'internal-beta-science.json'),'utf8'));
  assert.equal(report.betaAllowed,false);assert.equal(report.appStoreReady,false);
  assert.equal(report.strictChecks.readiness.report.totals.checked,70);
  assert.match(report.error,/snapshot|Reviewed scientific content changed/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('receipt mismatch preserves a fresh failed report instead of prior successful proof',async()=>{
 const {mkdtemp,writeFile,readFile,rm}=await import('node:fs/promises');
 const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const {spawnSync}=await import('node:child_process');
 const {verifyOwnerBetaScience}=await import('./internal-beta-science.mjs');
 const dir=await mkdtemp(join(tmpdir(),'fungo-owner-receipt-fail-'));
 try{
  let science;
  try{science=await verifyOwnerBetaScience(sourceCommit);}catch(error){
   assert.match(error.message,/Reviewed scientific content changed/);
   await writeFile(join(dir,'internal-beta-science.json'),JSON.stringify({betaAllowed:true}));
   await writeFile(join(dir,'consolidated-build.json'),JSON.stringify({sourceCommit,testFlightOnly:true,diagnosticOnly:true,appStoreReady:false,scientificReview:{betaAllowed:true}}));
   const rejected=spawnSync(process.execPath,['scripts/internal-beta-science.mjs','--verify-receipt'],{encoding:'utf8',env:{...process.env,GITHUB_SHA:sourceCommit,RUNNER_TEMP:dir,GITHUB_OUTPUT:''}});
   assert.equal(rejected.status,1);const report=JSON.parse(await readFile(join(dir,'internal-beta-science.json'),'utf8'));assert.equal(report.betaAllowed,false);assert.equal(report.appStoreReady,false);assert.equal(report.strictChecks.readiness.exitCode,1);assert.match(report.error,/Reviewed scientific content changed/);return;
  }
  await writeFile(join(dir,'internal-beta-science.json'),JSON.stringify(science));
  const receipt={sourceCommit,testFlightOnly:true,diagnosticOnly:true,appStoreReady:false,scientificReview:science};
  await writeFile(join(dir,'consolidated-build.json'),JSON.stringify(receipt));
  const good=spawnSync(process.execPath,['scripts/internal-beta-science.mjs','--verify-receipt'],{encoding:'utf8',env:{...process.env,GITHUB_SHA:sourceCommit,RUNNER_TEMP:dir,GITHUB_OUTPUT:''}});
  assert.equal(good.status,0,good.stderr);
  receipt.scientificReview={...science,scientificTotals:{}};
  await writeFile(join(dir,'consolidated-build.json'),JSON.stringify(receipt));
  const r=spawnSync(process.execPath,['scripts/internal-beta-science.mjs','--verify-receipt'],{encoding:'utf8',env:{...process.env,GITHUB_SHA:sourceCommit,RUNNER_TEMP:dir,GITHUB_OUTPUT:''}});
  assert.equal(r.status,1);
  const report=JSON.parse(await readFile(join(dir,'internal-beta-science.json'),'utf8'));
  assert.equal(report.betaAllowed,false);assert.equal(report.strictChecks.readiness.exitCode,1);
  assert.match(report.error,/differs/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
