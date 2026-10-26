import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateCandidate,confirmBetaState} from '../scripts/release-parity.mjs';
import {validateRelease} from '../lib/release-alignment.mjs';
import {verifyOwnerBetaScience,assertOwnerScienceReceipt} from '../scripts/internal-beta-science.mjs';
import {candidateReceipt} from '../scripts/consolidated-evidence.mjs';
import {preflightAudience,ownerGroup} from '../scripts/consolidated-beta-audience.mjs';
import {createAppleApi} from '../scripts/app-store-connect.mjs';
const AUTH_DIGEST='e7460fb4dc1f579e6f7ca849a87a12f260087ed6f467d7503a808bddfa3a3aea';
const SOURCE='6dfb92656ec94485d94aecba72543930c2759d17';
const PUBLIC_URL='https://gianpaolobol.github.io/fungo-italia/';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const requireThat=(ok,message)=>{if(!ok)throw Error(message);};
const safePath=p=>typeof p==='string'&&p.length>0&&!/[\\:%?#\x00-\x1f]/.test(p)&&p.split('/').every(p=>p&&p!=='.'&&p!=='..');
export function authorizePublicDemo(receipt,authorization){
 requireThat(authorization&&hash(JSON.stringify(authorization))===AUTH_DIGEST,'Missing or changed pinned public demo authorization');
 requireThat(authorization.type==='owner-distribution-authorization'&&authorization.scope==='public-demo-beta'&&authorization.owner.role==='owner'&&authorization.confirmation==='confermo'&&authorization.sourceCommit===SOURCE&&authorization.publicURL===PUBLIC_URL,'Wrong public demo scope');
 requireThat(authorization.certified===false&&authorization.independentReviewComplete===false&&authorization.appStoreReady===false&&authorization.externalTestFlightAllowed===false,'Public demo cannot authorize certification, App Store or external TestFlight');
 for(const key of ['sourceCommit','version','buildNumber','webContentHash','iconSha256','ipaSha256','appleBuildId'])requireThat(receipt?.[key]===authorization[key],'Frozen native/web identity differs: '+key);
 requireThat(receipt.appId==='6821140326'&&receipt.bundleId==='it.fungoitalia.app'&&receipt.testFlightOnly===true&&receipt.diagnosticOnly===true&&receipt.appStoreReady===false,'Unexpected native release scope');
 requireThat(receipt.producerRunId===String(authorization.candidateProducerRunId),'Signed IPA producer differs');
 requireThat(receipt.processingState==='VALID'&&receipt.internalBuildState==='IN_BETA_TESTING'&&receipt.betaDetailId===receipt.appleBuildId&&typeof receipt.betaStateVerifiedAt==='string'&&Number.isFinite(Date.parse(receipt.betaStateVerifiedAt)),'Actual Apple availability missing');
 requireThat(Array.isArray(receipt.internalGroupIds)&&receipt.internalGroupIds.length===1&&receipt.internalGroupIds[0]===ownerGroup,'Native beta audience changed');
 const science=receipt.scientificReview;assertOwnerScienceReceipt(receipt,science);
 requireThat(science.ownerReview.contentDigest===authorization.scientificContentDigest&&science.ownerReview.fileCount===authorization.scientificFileCount&&science.ownerReview.declarationSha256===authorization.ownerReviewDeclarationSha256,'Owner-reviewed scientific snapshot changed');
 requireThat(Array.isArray(science.strictChecks?.toxicology?.report?.errors)&&science.strictChecks.toxicology.report.errors.length===0,'Structural toxicology errors block public demo');
 requireThat(receipt.nativeStorekitVerified===true&&receipt.storekitUIVerified===true,'Mandatory purchase proofs missing');
 const paths={native:'subscription-storekit-tests.yml',ui:'subscription-storekit-ui.yml',demo:'agaricus-demo-ui.yml'};
 for(const[key,path]of Object.entries(paths)){const p=receipt.evidence?.[key];requireThat(p?.id===authorization.nativeProofRunIds[key]&&p.sourceCommit===SOURCE&&p.path==='.github/workflows/'+path&&p.verified===true&&p.conclusion==='success','Mandatory exact-source proof missing: '+key);}
 return {scope:'public-demo-beta',certified:false,independentReviewComplete:false,appStoreReady:false,authorizationSha256:AUTH_DIGEST,authorizedSource:SOURCE,pairedTestFlightBuild:'21',authorizedOn:authorization.declaredOn};
}
export function validateArtifactMetadata(metadata,authorization){
 requireThat(authorization&&hash(JSON.stringify(authorization))===AUTH_DIGEST,'Missing pinned artifact authorization');
 requireThat(metadata?.id===authorization.candidateArtifactId&&metadata.name==='Paired-web-candidate'&&metadata.expired===false,'Original artifact identity unavailable');
 requireThat(metadata.digest==='sha256:'+authorization.candidateArtifactSha256,'Original artifact ZIP digest differs');
 requireThat(metadata.workflow_run?.id===authorization.candidateProducerRunId&&metadata.workflow_run.head_sha===SOURCE&&metadata.workflow_run.head_branch==='main','Original artifact source differs');
 requireThat(Number.isSafeInteger(metadata.size_in_bytes)&&metadata.size_in_bytes>0&&metadata.size_in_bytes<1024*1024*1024,'Unexpected artifact size');
}
async function downloadCandidate(dir,authorization){
 requireThat(resolve(dir)===resolve('dist-ios')&&process.env.RUNNER_TEMP?.startsWith('/'),'Isolated candidate directory required');
 const endpoint='https://api.github.com/repos/gianpaolobol/fungo-italia/actions/artifacts/'+authorization.candidateArtifactId;
 const headers={Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json'};
 const response=await fetch(endpoint,{headers,signal:AbortSignal.timeout(45000)});requireThat(response.ok,'Original artifact lookup failed');const metadata=await response.json();validateArtifactMetadata(metadata,authorization);
 const archive=await fetch(endpoint+'/zip',{headers,signal:AbortSignal.timeout(300000)});requireThat(archive.ok,'Original artifact download failed');const bytes=Buffer.from(await archive.arrayBuffer());
 requireThat(bytes.length===metadata.size_in_bytes&&hash(bytes)===authorization.candidateArtifactSha256,'Downloaded ZIP bytes differ from approved artifact');
 await mkdir(dir,{recursive:true});requireThat((await readdir(dir)).length===0,'Candidate directory must be empty');
 const zip=join(process.env.RUNNER_TEMP,'original-public-demo21.zip');await writeFile(zip,bytes,{mode:0o600});execFileSync('unzip',['-q',zip,'-d',resolve(dir)],{stdio:'inherit'});
 console.log('Original artifact ID, producer and full ZIP SHA-256 verified before extraction');
}
export async function preparePublicDemo({dir,receipt,authorization,iconPath}){
 const webDistribution=authorizePublicDemo(receipt,authorization);
 const {build}=await validateCandidate({dir,expectedSha:SOURCE,iconPath});
 for(const key of ['sourceCommit','version','iconSha256','webContentHash'])requireThat(build[key]===receipt[key],'Native/web identity mismatch: '+key);
 const release={schemaVersion:1,...Object.fromEntries(['sourceCommit','version','buildNumber','iconSha256','webContentHash','appleBuildId','processingState','internalBuildState','betaDetailId','betaStateVerifiedAt','diagnosticOnly','testFlightOnly','ipaSha256','producerRunId','nativeStorekitVerified','storekitUIVerified','appStoreReady','evidence','internalGroupIds'].map(key=>[key,receipt[key]])),webDistribution};
 requireThat(validateRelease(release),'Unconfirmed native release');return release;
}
export async function verifyPublishedFiles({baseURL,dir,release,fetcher=fetch}){
 requireThat(baseURL===PUBLIC_URL,'Unexpected public origin or URL');
 const base=new URL(baseURL);
 async function get(path){
  requireThat(safePath(path),'Unsafe published file path');const url=new URL(path,base);url.searchParams.set('releaseProof',release.sourceCommit+'-'+Date.now());
  const response=await fetcher(url,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(30000)});requireThat(response.ok,'Published file unavailable: '+path);requireThat(response.redirected===false&&response.url===url.href,'Published response redirected or changed origin');return Buffer.from(await response.arrayBuffer());
 }
 requireThat(JSON.stringify(JSON.parse((await get('release.json')).toString()))===JSON.stringify(release),'Published receipt differs from authorized native receipt');
 for(const file of ['build.json','file-manifest.json'])requireThat(hash(await get(file))===hash(await readFile(join(dir,file))),'Published metadata integrity mismatch: '+file);
 const manifest=await json(join(dir,'file-manifest.json'));
 let cursor=0,failure;
 await Promise.all(Array.from({length:Math.min(8,manifest.files.length)},async()=>{
  while(!failure&&cursor<manifest.files.length){const file=manifest.files[cursor++];try{const bytes=await get(file.path);requireThat(bytes.length===file.bytes&&hash(bytes)===file.sha256,'Published file integrity mismatch: '+file.path);}catch(error){failure??=error;}}
 }));
 if(failure)throw failure;
 return {sourceCommit:release.sourceCommit,version:release.version,buildNumber:release.buildNumber,iconSha256:release.iconSha256,webContentHash:release.webContentHash,url:baseURL,filesVerified:manifest.files.length,verifiedAt:new Date().toISOString(),certified:false,appStoreReady:false};
}
async function verifyProofs(receipt,authorization){
 authorizePublicDemo(receipt,authorization);
 const science=await verifyOwnerBetaScience(SOURCE);assert.deepEqual(science,receipt.scientificReview,'Scientific snapshot or diagnostics changed');
 async function gh(path){const r=await fetch('https://api.github.com/repos/gianpaolobol/fungo-italia'+path,{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(45000)});requireThat(r.ok,'GitHub proof unavailable: '+r.status);return r.json();}
 requireThat(process.env.GITHUB_REPOSITORY==='gianpaolobol/fungo-italia','Unexpected publisher repository');
 requireThat((await gh('/git/ref/heads/main')).object.sha===process.env.GITHUB_SHA,'Publisher main advanced; refuse stale deployment');
 const diff=await gh('/compare/'+SOURCE+'...'+process.env.GITHUB_SHA);
 requireThat(diff.base_commit?.sha===SOURCE&&diff.total_commits<=100&&Array.isArray(diff.files)&&diff.files.length<300,'Incomplete publisher/source comparison');
 const allowed=p=>p.startsWith('docs/')||/^tools\/public-demo21(?:[-.][A-Za-z0-9.-]+)?\.mjs$/.test(p)||p==='revisione/owner-public-demo21-20261026.json'||p==='.github/workflows/publish-public-demo21.yml';
 requireThat(diff.files.every(f=>allowed(f.filename)&&(!f.previous_filename||allowed(f.previous_filename))),'Application source changed after the verified native build');
 const ids=authorization.nativeProofRunIds;
 const runs=await Promise.all([ids.native,ids.ui,ids.demo].map(id=>gh('/actions/runs/'+id)));
 assert.deepEqual(receipt.evidence,candidateReceipt({sha:SOURCE,native:runs[0],ui:runs[1],demo:runs[2]}).evidence);
 const sourceJob=await gh('/actions/jobs/121775866782');requireThat(sourceJob.run_id===authorization.candidateProducerRunId&&sourceJob.name==='source'&&sourceJob.conclusion==='success','Original source/web tests did not pass');
 const run=await gh('/actions/runs/'+authorization.candidateProducerRunId);requireThat(run.head_sha===SOURCE&&run.head_branch==='main'&&run.event==='push'&&run.path==='.github/workflows/consolidated-testflight.yml','Wrong candidate producer');
 const recovery=await gh('/actions/runs/40389796201');requireThat(recovery.conclusion==='success'&&recovery.head_sha==='ca3f0e75eb629c568fda7238b0b4a0503116ba36','Native distribution recovery is not confirmed');
 const api=await createAppleApi();await preflightAudience(api);
 const app=await api('/v1/apps/6821140326');requireThat(app.ok&&app.data?.attributes?.bundleId===receipt.bundleId,'Apple app identity changed');
 const build=await api('/v1/builds/'+receipt.appleBuildId+'?include=betaGroups,preReleaseVersion');
 const linkage=build.data?.relationships?.betaGroups,groups=linkage?.data;
 requireThat(build.ok&&build.data?.id===authorization.appleBuildId&&build.data.attributes.version==='21'&&build.data.attributes.processingState==='VALID'&&build.data.attributes.expired===false,'Apple build is not available');
 requireThat(build.included?.some(v=>v.type==='preReleaseVersions'&&v.id===build.data.relationships.preReleaseVersion?.data?.id&&v.attributes.version==='1.1.0'),'Apple version identity changed');
 requireThat(Array.isArray(groups)&&groups.length===1&&groups[0].type==='betaGroups'&&groups[0].id===ownerGroup&&!linkage.links?.next&&(linkage.meta?.paging?.total===undefined||linkage.meta.paging.total===1),'Apple native audience broadened');
 const individuals=await api('/v1/builds/'+receipt.appleBuildId+'/individualTesters?limit=200');requireThat(individuals.ok&&!individuals.links?.next&&Array.isArray(individuals.data)&&individuals.data.length===0,'Unexpected native individual testers');
 const fresh=await confirmBetaState(receipt,api);
 return {sourceCommit:SOURCE,buildNumber:'21',appleBuildId:receipt.appleBuildId,internalBuildState:fresh.internalBuildState,internalGroupIds:groups.map(g=>g.id),verifiedAt:fresh.betaStateVerifiedAt,ownerAuthorizationSha256:AUTH_DIGEST};
}
async function main(){
 const [command,dir='dist-ios',receiptPath='docs/evidence/native-banner-20261026/consolidated-testflight.json']=process.argv.slice(2);
 requireThat(['artifact','promote','published'].includes(command),'Usage: public-demo21.mjs artifact|promote|published [candidate] [receipt]');
 const receipt=await json(receiptPath),authorization=await json('revisione/owner-public-demo21-20261026.json');
 if(command==='artifact'){authorizePublicDemo(receipt,authorization);await downloadCandidate(dir,authorization);return;}
 const release=await preparePublicDemo({dir,receipt,authorization,iconPath:resolve('assets/icon.png')});
 const native=await verifyProofs(receipt,authorization);
 if(process.env.RUNNER_TEMP)await writeFile(join(process.env.RUNNER_TEMP,'public-demo21-native-proof.json'),JSON.stringify(native,null,2)+'\n');
 if(command==='promote'){await writeFile(join(dir,'release.json'),JSON.stringify(release,null,2)+'\n');console.log('AUTHORIZED_PUBLIC_DEMO '+JSON.stringify(release));return;}
 const report=await verifyPublishedFiles({baseURL:PUBLIC_URL,dir,release});
 if(process.env.RUNNER_TEMP)await writeFile(join(process.env.RUNNER_TEMP,'public-demo21-verification.json'),JSON.stringify(report,null,2)+'\n');
 console.log('PUBLIC_DEMO21_VERIFIED '+JSON.stringify(report));
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)await main();
