import {readFile,writeFile,readdir,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateRelease} from '../lib/release-alignment.mjs';
const sha=/^[a-f0-9]{40}$/,hex=/^[a-f0-9]{64}$/;
const owner='f642807c-e4b2-43d4-a32a-d9fd087fdfe3';
const excluded=new Set(['build.json','file-manifest.json','release.json']);
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async path=>JSON.parse(await readFile(path,'utf8'));
function requireThat(condition,message){if(!condition)throw Error(message);}
function safePath(path){return typeof path==='string'&&path.length>0&&!/[\\:%?#\x00-\x1f]/.test(path)&&path.split('/').every(part=>part!==''&&part!=='.'&&part!=='..');}
async function filesIn(dir,prefix=''){
 const files=[];
 for(const name of await readdir(dir)){
  const path=prefix+name,stat=await lstat(join(dir,name));
  requireThat(!stat.isSymbolicLink(),'Symlink forbidden: '+path);
  if(stat.isDirectory())files.push(...await filesIn(join(dir,name),path+'/'));
  else {requireThat(stat.isFile(),'Non-file artifact entry: '+path);files.push(path);}
 }
 return files.sort();
}
export function contentHash(files){return digest(JSON.stringify(files.filter(f=>f.path!=='sw.js').map(({path,sha256,bytes})=>({path,sha256,bytes})).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0)));}
export async function validateCandidate({dir,expectedSha,iconPath}){
 requireThat(sha.test(expectedSha??''),'Expected exact source SHA required');
 const build=await json(join(dir,'build.json')),manifest=await json(join(dir,'file-manifest.json'));
 requireThat(build.schemaVersion===1&&manifest.schemaVersion===1,'Unknown candidate schema');
 requireThat(build.sourceCommit===expectedSha&&manifest.sourceCommit===expectedSha,'Candidate source mismatch');
 requireThat(hex.test(build.iconSha256??'')&&hex.test(build.webContentHash??'')&&typeof build.version==='string'&&/^\d+\.\d+(?:\.\d+)?$/.test(build.version),'Invalid build identity');
 requireThat(Array.isArray(manifest.files)&&manifest.files.length>0,'Missing complete file manifest');
 const seen=new Set();
 for(const file of manifest.files){
  requireThat(safePath(file.path)&&!excluded.has(file.path)&&!seen.has(file.path),'Unsafe or duplicate manifest path');seen.add(file.path);
  requireThat(hex.test(file.sha256??'')&&Number.isSafeInteger(file.bytes)&&file.bytes>=0,'Invalid file integrity entry');
 }
 const actual=(await filesIn(dir)).filter(path=>!excluded.has(path));
 requireThat(JSON.stringify(actual)===JSON.stringify([...seen].sort()),'Manifest must cover every artifact file');
 for(const file of manifest.files){
  const bytes=await readFile(join(dir,file.path));requireThat(bytes.length===file.bytes&&digest(bytes)===file.sha256,'Candidate file integrity mismatch: '+file.path);
 }
 requireThat(seen.has('index.html')&&seen.has('sw.js')&&seen.has('icon.png'),'Missing app entry, service worker or canonical icon');
 requireThat(contentHash(manifest.files)===build.webContentHash&&manifest.webContentHash===build.webContentHash,'Web content hash mismatch');
 const icon=manifest.files.find(file=>file.path==='icon.png');
 requireThat(icon.sha256===build.iconSha256&&digest(await readFile(iconPath))===build.iconSha256,'Source/web icon mismatch');
 return {build,manifest};
}
export async function createRelease({dir,receipt,expectedSha,iconPath}){
 requireThat(!receipt.scientificReview||receipt.scientificReview.independentReleaseReady===true,'Owner-reviewed internal beta cannot promote public web');
 const {build}=await validateCandidate({dir,expectedSha,iconPath});
 for(const field of ['sourceCommit','version','iconSha256','webContentHash'])requireThat(receipt[field]===build[field],'Native/web identity mismatch: '+field);
 requireThat(receipt.appId==='6821140326'&&receipt.bundleId==='it.fungoitalia.app'&&receipt.testFlightOnly===true&&receipt.diagnosticOnly===true&&receipt.appStoreReady===false,'Unexpected native release scope');
 requireThat(hex.test(receipt.ipaSha256??'')&&/^\d+$/.test(receipt.producerRunId??''),'Missing signed IPA provenance');
 requireThat(typeof receipt.betaDetailId==='string'&&receipt.betaDetailId.length>0&&typeof receipt.betaStateVerifiedAt==='string'&&Number.isFinite(Date.parse(receipt.betaStateVerifiedAt)),'Missing actual Apple beta detail receipt');
 requireThat(Array.isArray(receipt.internalGroupIds)&&receipt.internalGroupIds.length===1&&receipt.internalGroupIds[0]===owner,'Unconfirmed owner beta assignment');
 const paths={native:'subscription-storekit-tests.yml',ui:'subscription-storekit-ui.yml',demo:'agaricus-demo-ui.yml'};
 for(const [key,path] of Object.entries(paths)){
  const evidence=receipt.evidence?.[key];
  requireThat(evidence?.sourceCommit===expectedSha&&evidence.path==='.github/workflows/'+path&&Number.isSafeInteger(evidence.id)&&evidence.id>0,'Missing exact-source '+key+' proof');
  requireThat(['success','failure','timed_out'].includes(evidence.conclusion)&&evidence.verified===(evidence.conclusion==='success'),'Misreported '+key+' proof');
 }
 for(const key of ['native','ui','demo'])requireThat(receipt.evidence[key].verified===true,key+' must pass before public promotion');
 requireThat(receipt.nativeStorekitVerified===receipt.evidence.native.verified&&receipt.storekitUIVerified===receipt.evidence.ui.verified,'Proof flags differ from actual results');
 const release={schemaVersion:1,...Object.fromEntries(['sourceCommit','version','buildNumber','iconSha256','webContentHash','appleBuildId','processingState','internalBuildState','betaDetailId','betaStateVerifiedAt','diagnosticOnly','testFlightOnly','ipaSha256','producerRunId','nativeStorekitVerified','storekitUIVerified','appStoreReady','evidence','internalGroupIds'].map(key=>[key,receipt[key]]))};
 requireThat(validateRelease(release),'Apple beta is not confirmed available');
 return release;
}
export async function confirmBetaState(receipt,api){
 const response=await api('/v1/builds/'+encodeURIComponent(receipt.appleBuildId)+'/buildBetaDetail');
 requireThat(response.ok&&response.data?.type==='buildBetaDetails'&&typeof response.data.id==='string'&&response.data.attributes?.internalBuildState==='IN_BETA_TESTING','Apple internal beta availability not confirmed');
 return {...receipt,internalBuildState:response.data.attributes.internalBuildState,betaDetailId:response.data.id,betaStateVerifiedAt:new Date().toISOString()};
}
export async function verifyPublished({baseURL,dir,receipt,expectedSha,iconPath,fetcher=fetch}){
 const release=await createRelease({dir,receipt,expectedSha,iconPath});
 const base=new URL(baseURL);requireThat(base.protocol==='https:','Published URL must use HTTPS');
 async function get(path){const url=new URL(path,base);url.searchParams.set('releaseProof',expectedSha+'-'+Date.now());const response=await fetcher(url,{cache:'no-store',signal:AbortSignal.timeout(30000)});requireThat(response.ok,'Published file unavailable: '+path);return Buffer.from(await response.arrayBuffer());}
 const published=JSON.parse((await get('release.json')).toString());
 requireThat(JSON.stringify(published)===JSON.stringify(release),'Published release differs from confirmed native receipt');
 for(const metadata of ['build.json','file-manifest.json'])requireThat(digest(await get(metadata))===digest(await readFile(join(dir,metadata))),'Published metadata mismatch: '+metadata);
 const manifest=await json(join(dir,'file-manifest.json'));
 let cursor=0,failure;
 await Promise.all(Array.from({length:Math.min(8,manifest.files.length)},async()=>{
  while(!failure&&cursor<manifest.files.length){
   const file=manifest.files[cursor++];
   try{const bytes=await get(file.path);requireThat(bytes.length===file.bytes&&digest(bytes)===file.sha256,'Published integrity mismatch: '+file.path);}
   catch(error){failure??=error;}
  }
 }));
 if(failure)throw failure;
 return release;
}
async function main(){
 const [command,dir='dist-ios',receiptPath='store-evidence/consolidated-testflight.json',baseURL]=process.argv.slice(2);
 const expectedSha=process.env.GITHUB_SHA,iconPath=resolve('assets/icon.png');
 if(command==='beta-state'){
  const {createAppleApi}=await import('./app-store-connect.mjs');
  const receipt=await json(receiptPath);
  for(let attempt=0;attempt<45;attempt++){
   const api=await createAppleApi();
   try{const report=await confirmBetaState(receipt,api);await writeFile(receiptPath,JSON.stringify(report,null,2)+'\n');return;}
   catch(error){if(attempt===44)throw error;console.log('Waiting for confirmed internal TestFlight availability: '+error.message);await new Promise(done=>setTimeout(done,20000));}
  }
 }
 if(command==='candidate'){await validateCandidate({dir,expectedSha,iconPath});return;}
 const receipt=await json(receiptPath);
 if(command==='promote'){
  const release=await createRelease({dir,receipt,expectedSha,iconPath});await writeFile(join(dir,'release.json'),JSON.stringify(release,null,2)+'\n');console.log('PAIRED_RELEASE '+JSON.stringify(release));return;
 }
 if(command==='published'){await verifyPublished({baseURL,dir,receipt,expectedSha,iconPath});console.log('Published web bytes match confirmed TestFlight receipt');return;}
 throw Error('Usage: release-parity.mjs candidate|beta-state|promote|published [directory] [receipt] [baseURL]');
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)await main();
