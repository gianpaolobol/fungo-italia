import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {validateCandidate,createRelease,verifyPublished,confirmBetaState} from './release-parity.mjs';
const sha='a'.repeat(40),hash=value=>createHash('sha256').update(value).digest('hex');
const owner='f642807c-e4b2-43d4-a32a-d9fd087fdfe3';
async function fixture(fn){
 const dir=await mkdtemp(join(tmpdir(),'fungo-parity-'));
 const files=[{path:'icon.png',sha256:hash('icon'),bytes:4},{path:'index.html',sha256:hash('app'),bytes:3},{path:'sw.js',sha256:hash('worker'),bytes:6}];
 const webContentHash=hash(JSON.stringify(files.filter(f=>f.path!=='sw.js')));
 const build={schemaVersion:1,sourceCommit:sha,version:'1.1.0',iconSha256:hash('icon'),webContentHash};
 const manifest={schemaVersion:1,sourceCommit:sha,webContentHash,files};
 await Promise.all([writeFile(join(dir,'icon.png'),'icon'),writeFile(join(dir,'index.html'),'app'),writeFile(join(dir,'sw.js'),'worker'),writeFile(join(dir,'build.json'),JSON.stringify(build)),writeFile(join(dir,'file-manifest.json'),JSON.stringify(manifest))]);
 const evidence=Object.fromEntries([['native','subscription-storekit-tests.yml'],['ui','subscription-storekit-ui.yml'],['demo','agaricus-demo-ui.yml']].map(([key,path],i)=>[key,{id:i+1,path:'.github/workflows/'+path,sourceCommit:sha,conclusion:key==='ui'?'failure':'success',verified:key!=='ui'}]));
 const receipt={...build,appId:'6821140326',bundleId:'it.fungoitalia.app',buildNumber:'17',producerRunId:'123',ipaSha256:hash('ipa'),appleBuildId:'12345678-abcd-abcd-abcd-123456789abc',processingState:'VALID',internalBuildState:'IN_BETA_TESTING',betaDetailId:'beta-detail-id',betaStateVerifiedAt:'2026-10-21T12:00:00.000Z',internalGroupIds:[owner],testFlightOnly:true,diagnosticOnly:true,appStoreReady:false,nativeStorekitVerified:true,storekitUIVerified:false,evidence};
 try{await fn({dir,build,manifest,receipt});}finally{await rm(dir,{recursive:true,force:true});}
}
test('promotion pairs exact bytes and actual beta receipt while preserving failed purchase proof',()=>fixture(async({dir,receipt})=>{
 const release=await createRelease({dir,receipt,expectedSha:sha,iconPath:join(dir,'icon.png')});
 assert.equal(release.storekitUIVerified,false);assert.equal(release.evidence.ui.conclusion,'failure');assert.equal(release.appleBuildId,receipt.appleBuildId);assert.equal(release.ipaSha256,receipt.ipaSha256);
}));
test('candidate rejects mutated bytes, unlisted files, symlinks and missing entries',async()=>{
 for(const mode of ['bytes','extra','link','missing'])await fixture(async({dir})=>{
  if(mode==='bytes')await writeFile(join(dir,'index.html'),'bad');
  if(mode==='extra')await writeFile(join(dir,'extra'),'unlisted');
  if(mode==='link'){await rm(join(dir,'index.html'));await symlink(join(dir,'icon.png'),join(dir,'index.html'));}
  if(mode==='missing')await rm(join(dir,'sw.js'));
  await assert.rejects(validateCandidate({dir,expectedSha:sha,iconPath:join(dir,'icon.png')}));
 });
});
test('manifest cannot escape artifact or duplicate a path or omit service-worker integrity',async()=>{
 for(const path of ['../escape','/tmp/escape','https://example.test/x','a\\b','a/../b','icon.png'])await fixture(async({dir,manifest})=>{
  manifest.files[1].path=path;await writeFile(join(dir,'file-manifest.json'),JSON.stringify(manifest));
  await assert.rejects(validateCandidate({dir,expectedSha:sha,iconPath:join(dir,'icon.png')}));
 });
});
test('promotion refuses cross-source, icon, content, unprocessed, absent proof and invented success receipts',async()=>{
 for(const mutate of [r=>r.sourceCommit='b'.repeat(40),r=>r.iconSha256='b'.repeat(64),r=>r.webContentHash='b'.repeat(64),r=>r.processingState='PROCESSING',r=>r.internalBuildState='PROCESSING',r=>r.internalGroupIds.push('other'),r=>r.evidence.demo.verified=false,r=>r.evidence.ui.sourceCommit='b'.repeat(40),r=>r.storekitUIVerified=true,r=>delete r.ipaSha256,r=>delete r.producerRunId,r=>delete r.betaDetailId,r=>delete r.betaStateVerifiedAt])await fixture(async({dir,receipt})=>{
  mutate(receipt);await assert.rejects(createRelease({dir,receipt,expectedSha:sha,iconPath:join(dir,'icon.png')}));
 });
});
test('live beta state is read from Apple and rejects pending or malformed responses',async()=>{
 for(const state of ['IN_BETA_TESTING','READY_FOR_BETA_TESTING','PROCESSING']){
  const receipt={appleBuildId:'build-id'};const api=async path=>{assert.equal(path,'/v1/builds/build-id/buildBetaDetail');return {ok:true,data:{type:'buildBetaDetails',id:'detail',attributes:{internalBuildState:state}}};};
  if(state!=='IN_BETA_TESTING')await assert.rejects(confirmBetaState(receipt,api));else assert.equal((await confirmBetaState(receipt,api)).internalBuildState,state);
 }
 for(const data of [null,{type:'builds',id:'wrong',attributes:{internalBuildState:'IN_BETA_TESTING'}},{type:'buildBetaDetails',attributes:{internalBuildState:'IN_BETA_TESTING'}}])await assert.rejects(confirmBetaState({appleBuildId:'build-id'},async()=>({ok:true,data})));
});
test('published verification fetches uncached bytes, compares release receipt and rejects corrupted deployment',()=>fixture(async({dir,receipt})=>{
 const release=await createRelease({dir,receipt,expectedSha:sha,iconPath:join(dir,'icon.png')});await writeFile(join(dir,'release.json'),JSON.stringify(release));
 let corrupt=false;
 const fetcher=async(url,options)=>{assert.equal(options.cache,'no-store');const path=new URL(url).pathname.split('/').pop();let bytes=await readFile(join(dir,path));if(corrupt&&path==='icon.png')bytes=Buffer.from('wrong');return new Response(bytes);};
 await verifyPublished({baseURL:'https://example.test/app/',dir,receipt,expectedSha:sha,iconPath:join(dir,'icon.png'),fetcher});
 corrupt=true;await assert.rejects(verifyPublished({baseURL:'https://example.test/app/',dir,receipt,expectedSha:sha,iconPath:join(dir,'icon.png'),fetcher}));
}));
test('published full-byte verification uses at most eight concurrent requests and checks every file',()=>fixture(async({dir,receipt,manifest,build})=>{
 for(let i=0;i<20;i++){
  const path=`asset-${i}.bin`,bytes=Buffer.from('asset '+i);
  await writeFile(join(dir,path),bytes);manifest.files.push({path,sha256:hash(bytes),bytes:bytes.length});
 }
 manifest.files.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
 build.webContentHash=manifest.webContentHash=receipt.webContentHash=hash(JSON.stringify(manifest.files.filter(file=>file.path!=='sw.js')));
 await writeFile(join(dir,'build.json'),JSON.stringify(build));await writeFile(join(dir,'file-manifest.json'),JSON.stringify(manifest));
 const release=await createRelease({dir,receipt,expectedSha:sha,iconPath:join(dir,'icon.png')});await writeFile(join(dir,'release.json'),JSON.stringify(release));
 let active=0,peak=0;const seen=[];
 const fetcher=async(url)=>{
  active++;peak=Math.max(peak,active);
  try{await new Promise(done=>setTimeout(done,3));const path=new URL(url).pathname.split('/').pop();seen.push(path);return new Response(await readFile(join(dir,path)));}
  finally{active--;}
 };
 await verifyPublished({baseURL:'https://example.test/app/',dir,receipt,expectedSha:sha,iconPath:join(dir,'icon.png'),fetcher});
 assert.ok(peak>1,'full verification must parallelize large published artifacts');assert.ok(peak<=8,'bounded request pressure');
 assert.deepEqual(seen.sort(),[...manifest.files.map(file=>file.path),'release.json','build.json','file-manifest.json'].sort());
}));

test('owner review receipt cannot promote content to public web',()=>fixture(async({dir,receipt})=>{
 receipt.scientificReview={approvalScope:'owner-internal-testflight',independentReleaseReady:false,publicWebAllowed:false};
 await assert.rejects(createRelease({dir,receipt,expectedSha:sha,iconPath:join(dir,'icon.png')}));
}));
