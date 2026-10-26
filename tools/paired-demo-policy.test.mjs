import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as policy from './paired-demo-policy.mjs';
const original=JSON.parse(await readFile(new URL('../docs/evidence/native-banner-20261026/consolidated-testflight.json',import.meta.url)));
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
function fixture(){
 const receipt=structuredClone(original),source='b'.repeat(40);
 receipt.sourceCommit=receipt.scientificReview.sourceCommit=source;receipt.buildNumber='22';
 for(const proof of Object.values(receipt.evidence))proof.sourceCommit=source;
 const authorization={schemaVersion:1,type:'owner-distribution-authorization',scope:'public-demo-beta',status:'approved',owner:{name:'Gian Paolo Franceschini',role:'owner'},confirmation:'Autorizzo questa specifica demo pubblica',approvedAt:'2026-10-26T21:00:00Z',publicURL:'https://gianpaolobol.github.io/fungo-italia/',certified:false,independentReviewComplete:false,appStoreReady:false,externalTestFlightAllowed:false,sourceCommit:source,version:receipt.version,buildNumber:receipt.buildNumber,webContentHash:receipt.webContentHash,iconSha256:receipt.iconSha256,ipaSha256:receipt.ipaSha256,appleBuildId:receipt.appleBuildId,candidateProducerRunId:Number(receipt.producerRunId),candidateArtifactId:123,candidateArtifactSha256:'c'.repeat(64),nativeProofRunIds:Object.fromEntries(Object.entries(receipt.evidence).map(([k,v])=>[k,v.id])),scientificContentDigest:receipt.scientificReview.ownerReview.contentDigest,scientificFileCount:867,ownerReviewDeclarationSha256:receipt.scientificReview.ownerReview.declarationSha256};
 return {receipt,authorization};
}
test('new public demo needs its own approved digest and exact native/scientific identity',()=>{
 const {receipt,authorization:a}=fixture(),before=JSON.stringify(receipt);
 const result=policy.authorizePairedDemo(receipt,a,hash(a));
 assert.equal(result.authorizedSource,receipt.sourceCommit);assert.equal(result.pairedTestFlightBuild,'22');assert.equal(result.certified,false);
 assert.equal(JSON.stringify(receipt),before);assert.equal(receipt.scientificReview.publicWebAllowed,false);
});
test('pending declaration, old authorization, changed digest and widened scope are rejected',async()=>{
 const {receipt,authorization:a}=fixture();
 const old=JSON.parse(await readFile(new URL('../revisione/owner-public-demo21-20261026.json',import.meta.url)));
 for(const changed of [old,{...a,status:'pending'},{...a,confirmation:null},{...a,approvedAt:null},{...a,scope:'production'},{...a,certified:true},{...a,independentReviewComplete:true},{...a,appStoreReady:true},{...a,externalTestFlightAllowed:true},{...a,publicURL:'https://other.example/'},{...a,sourceCommit:'a'.repeat(40)}])assert.throws(()=>policy.authorizePairedDemo(receipt,changed,hash(changed)));
 assert.throws(()=>policy.authorizePairedDemo(receipt,a,'d'.repeat(64)));
 assert.throws(()=>policy.authorizePairedDemo(receipt,a));
});
test('missing Apple state, changed audience and failed/cross-source purchase proofs block promotion',()=>{
 for(const mutate of [r=>r.processingState='PROCESSING',r=>r.internalBuildState='READY_FOR_BETA_TESTING',r=>r.internalGroupIds.push('other'),r=>r.ipaSha256='a'.repeat(64),r=>r.scientificReview.ownerReview.contentDigest='a'.repeat(64),r=>r.scientificReview.strictChecks.toxicology.report.errors.push('bad'),...['native','ui','demo'].flatMap(k=>[r=>r.evidence[k].conclusion='failure',r=>r.evidence[k].verified=false,r=>r.evidence[k].sourceCommit='a'.repeat(40),r=>r.evidence[k].id++])]){
  const {receipt,authorization:a}=fixture();mutate(receipt);assert.throws(()=>policy.authorizePairedDemo(receipt,a,hash(a)));
 }
});
test('original ZIP identity is mandatory before extracting a candidate',()=>{
 const {authorization:a}=fixture();const m={id:a.candidateArtifactId,name:'Paired-web-candidate',expired:false,digest:'sha256:'+a.candidateArtifactSha256,size_in_bytes:123,workflow_run:{id:a.candidateProducerRunId,head_sha:a.sourceCommit,head_branch:'main'}};
 assert.doesNotThrow(()=>policy.validatePairedArtifact(m,a));
 for(const patch of [{id:3},{expired:true},{digest:'sha256:'+'f'.repeat(64)},{workflow_run:{...m.workflow_run,head_sha:'f'.repeat(40)}},{size_in_bytes:0}])assert.throws(()=>policy.validatePairedArtifact({...m,...patch},a));
});
test('orchestrator may only add public demo tooling and documentation after the signed app source',()=>{
 const base={base_commit:{sha:'a'.repeat(40)},total_commits:2,files:[{filename:'tools/paired-demo.mjs'},{filename:'docs/MASTER_PROJECT_STATUS.md'}]};
 assert.doesNotThrow(()=>policy.assertPublisherDiff(base,'a'.repeat(40)));
 for(const filename of ['App.tsx','index.js','assets/icon.png','app.config.js','src/data/catalog.json','lib/subscriptionPolicy.ts','web/build.mjs','.github/workflows/consolidated-testflight.yml','tools/other.mjs'])assert.throws(()=>policy.assertPublisherDiff({...base,files:[{filename}]},'a'.repeat(40)));
 assert.throws(()=>policy.assertPublisherDiff({...base,files:[{filename:'docs/safe.md',previous_filename:'App.tsx'}]},'a'.repeat(40)));
 assert.throws(()=>policy.assertPublisherDiff({...base,files:Array(300).fill({filename:'docs/a.md'})},'a'.repeat(40)));
});
test('native IPA digest and actual Apple beta detail timestamp cannot be omitted',()=>{
 for(const key of ['ipaSha256','betaDetailId','betaStateVerifiedAt']){
  const {receipt,authorization:a}=fixture();delete receipt[key];delete a[key];
  assert.throws(()=>policy.authorizePairedDemo(receipt,a,hash(a)),key);
 }
});
