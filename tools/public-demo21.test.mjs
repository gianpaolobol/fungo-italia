import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {authorizePublicDemo,preparePublicDemo,verifyPublishedFiles} from './public-demo21.mjs';
import * as policy from './public-demo21.mjs';
const receipt=JSON.parse(await readFile(new URL('../docs/evidence/native-banner-20261026/consolidated-testflight.json',import.meta.url)));
const authorization=JSON.parse(await readFile(new URL('../revisione/owner-public-demo21-20261026.json',import.meta.url)));
const copy=x=>structuredClone(x),hash=b=>createHash('sha256').update(b).digest('hex');
test('owner explicitly authorizes only the frozen public demo while old science and App Store remain blocked',()=>{
 const before=JSON.stringify(receipt),r=authorizePublicDemo(receipt,authorization);
 assert.equal(r.scope,'public-demo-beta');assert.equal(r.certified,false);assert.equal(r.independentReviewComplete,false);assert.equal(r.appStoreReady,false);assert.equal(r.authorizationSha256,'e7460fb4dc1f579e6f7ca849a87a12f260087ed6f467d7503a808bddfa3a3aea');
 assert.equal(JSON.stringify(receipt),before);assert.equal(receipt.scientificReview.publicWebAllowed,false);
});
test('missing, edited or broadened distribution authorizations fail closed',()=>{
 for(const value of [null,{},...['sourceCommit','scope','confirmation','appStoreReady','independentReviewComplete','publicURL'].map(key=>({...authorization,[key]:'changed'}))])assert.throws(()=>authorizePublicDemo(receipt,value));
});
test('all pinned native, scientific, build and audience identities are mandatory',()=>{
 for(const key of ['sourceCommit','version','buildNumber','iconSha256','webContentHash','ipaSha256','appleBuildId','appId','bundleId','producerRunId','betaDetailId','betaStateVerifiedAt']){
  const r=copy(receipt);delete r[key];assert.throws(()=>authorizePublicDemo(r,authorization),key);
 }
 for(const patch of [{appStoreReady:true},{testFlightOnly:false},{nativeStorekitVerified:false},{storekitUIVerified:false},{internalBuildState:'READY_FOR_BETA_TESTING'},{processingState:'PROCESSING'},{internalGroupIds:[...receipt.internalGroupIds,'another-group']}])assert.throws(()=>authorizePublicDemo({...receipt,...patch},authorization));
 for(const mutate of [r=>r.scientificReview.ownerReview.contentDigest='a'.repeat(64),r=>r.scientificReview.ownerReview.fileCount=868,r=>r.scientificReview.publicWebAllowed=true,r=>r.scientificReview.strictChecks.toxicology.report.errors.push('structural error')]){const r=copy(receipt);mutate(r);assert.throws(()=>authorizePublicDemo(r,authorization));}
});
test('every native proof must be an actual successful exact-source run',()=>{
 for(const key of ['native','ui','demo'])for(const patch of [{verified:false},{conclusion:'failure'},{conclusion:'cancelled'},{id:1},{sourceCommit:'f'.repeat(40)},{path:'.github/workflows/other.yml'}]){const r=copy(receipt);Object.assign(r.evidence[key],patch);assert.throws(()=>authorizePublicDemo(r,authorization));}
});
test('candidate validation is mandatory even for the real owner authorization',async()=>{
 await assert.rejects(preparePublicDemo({dir:'/does-not-exist',receipt,authorization,iconPath:'assets/icon.png'}));
});
async function fixture(){
 const dir=await mkdtemp(join(tmpdir(),'public-demo-files-')),files={'index.html':'<p>demo</p>','icon.png':'icon','sw.js':'worker'};
 const manifest={schemaVersion:1,sourceCommit:receipt.sourceCommit,files:Object.entries(files).map(([path,bytes])=>({path,bytes:Buffer.byteLength(bytes),sha256:hash(bytes)}))};
 const metadata={'build.json':JSON.stringify({sourceCommit:receipt.sourceCommit}),'file-manifest.json':JSON.stringify(manifest)};
 for(const [p,b] of Object.entries({...files,...metadata}))await writeFile(join(dir,p),b);
 const release={sourceCommit:receipt.sourceCommit,version:'1.1.0',buildNumber:'21'};
 const published={...files,...metadata,'release.json':JSON.stringify(release)};
 return {dir,release,published};
}
test('published verification reads uncached metadata and every file and rejects corruption',async()=>{
 const f=await fixture();try{
  const calls=[];const fetcher=async(url,options)=>{calls.push(new URL(url).pathname);assert.equal(options.cache,'no-store');assert(new URL(url).searchParams.has('releaseProof'));const bytes=f.published[new URL(url).pathname.split('/').pop()];return {ok:true,redirected:false,url:String(url),arrayBuffer:async()=>Buffer.from(bytes)};};
  await verifyPublishedFiles({baseURL:authorization.publicURL,dir:f.dir,release:f.release,fetcher});assert.equal(calls.length,6);
  f.published['icon.png']='corrupted';await assert.rejects(verifyPublishedFiles({baseURL:authorization.publicURL,dir:f.dir,release:f.release,fetcher}),/integrity/i);
  f.published['release.json']='{}';await assert.rejects(verifyPublishedFiles({baseURL:authorization.publicURL,dir:f.dir,release:f.release,fetcher}),/receipt/i);
 }finally{await rm(f.dir,{recursive:true,force:true});}
});
test('a different public origin or path is rejected before sending any request',async()=>{
 for(const baseURL of ['http://gianpaolobol.github.io/fungo-italia/','https://other.example/fungo-italia/','https://gianpaolobol.github.io/other/'])await assert.rejects(verifyPublishedFiles({baseURL,dir:'unused',release:receipt,fetcher:()=>{throw Error('Must not fetch');}}),/origin|URL/i);
});
test('full public verification is bounded to eight concurrent file reads',async()=>{
 const f=await fixture();try{
  const manifest=JSON.parse(f.published['file-manifest.json']);
  for(let i=0;i<20;i++){const name='file-'+i+'.txt',bytes='value-'+i;f.published[name]=bytes;manifest.files.push({path:name,bytes:bytes.length,sha256:hash(bytes)});await writeFile(join(f.dir,name),bytes);}
  f.published['file-manifest.json']=JSON.stringify(manifest);await writeFile(join(f.dir,'file-manifest.json'),f.published['file-manifest.json']);
  let active=0,maximum=0,total=0;
  const fetcher=async url=>{active++;maximum=Math.max(maximum,active);total++;await new Promise(done=>setTimeout(done,2));const bytes=f.published[new URL(url).pathname.split('/').pop()];active--;return{ok:true,redirected:false,url:String(url),arrayBuffer:async()=>Buffer.from(bytes)};};
  await verifyPublishedFiles({baseURL:authorization.publicURL,dir:f.dir,release:f.release,fetcher});assert(maximum<=8);assert.equal(total,26);
 }finally{await rm(f.dir,{recursive:true,force:true});}
});
test('redirected public responses are rejected even when their bytes match',async()=>{
 const f=await fixture();try{
  const fetcher=async(url,options)=>({ok:true,redirected:true,url:'https://other.example/'+new URL(url).pathname.split('/').pop(),arrayBuffer:async()=>Buffer.from(f.published[new URL(url).pathname.split('/').pop()])});
  await assert.rejects(verifyPublishedFiles({baseURL:authorization.publicURL,dir:f.dir,release:f.release,fetcher}),/redirect|origin/i);
 }finally{await rm(f.dir,{recursive:true,force:true});}
});
test('artifact identity and full ZIP digest must match the original producer',()=>{
 const metadata={id:12677552815,name:'Paired-web-candidate',expired:false,digest:'sha256:2852c1eed7ca098633e6ebcb1fe45f056f9c341425d88620b42967d0f07114bd',size_in_bytes:433834669,workflow_run:{id:40380720179,head_sha:receipt.sourceCommit,head_branch:'main'}};
 assert.doesNotThrow(()=>policy.validateArtifactMetadata(metadata,authorization));
 for(const patch of [{id:1},{name:'replacement'},{expired:true},{digest:'sha256:'+'a'.repeat(64)},{workflow_run:{...metadata.workflow_run,head_sha:'f'.repeat(40)}},{workflow_run:{...metadata.workflow_run,id:1}}])assert.throws(()=>policy.validateArtifactMetadata({...metadata,...patch},authorization));
});
