import {createHash} from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import {readFile,lstat,writeFile,mkdir,appendFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {ownerGroup} from './consolidated-beta-audience.mjs';
const declarationPath='revisione/owner-internal-beta-review-20261026.json';
const expectedDeclarationDigest='d649ab6720c043097f021d791b0703102675c55cff2888b93c37b784214225f5';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const requireThat=(ok,message)=>{if(!ok)throw Error(message);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const scopes=['src/data','legacy/web/data','web/public/images/reference','web/public/images/course-chat','lib/curriculum-exam-bank.mjs','web/public/exam-core.js'];
export function manifestDigest(files){
 requireThat(Array.isArray(files)&&files.length>0,'Missing reviewed scientific file manifest');
 const paths=new Set();
 for(const f of files){
  requireThat(typeof f.path==='string'&&f.path.split('/').every(p=>p&&p!=='.'&&p!=='..')&&!/[\\:%?#\x00-\x1f]/.test(f.path)&&!paths.has(f.path),'Unsafe or duplicate scientific file');paths.add(f.path);
  requireThat(/^[a-f0-9]{64}$/.test(f.sha256??'')&&Number.isSafeInteger(f.bytes)&&f.bytes>=0,'Invalid scientific file digest');
 }
 return hash(JSON.stringify([...files].sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0)));
}
export function normalizedGaps(readiness){
 requireThat(Array.isArray(readiness?.blockers),'Missing scientific gap report');
 return readiness.blockers.map(r=>{requireThat(typeof r.id==='string'&&Array.isArray(r.gaps)&&r.gaps.every(g=>typeof g==='string'),'Invalid scientific gap entry');return {id:r.id,gaps:[...r.gaps].sort()};}).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
}
export function ownerBetaDecision({attestation,files,readiness,toxicology,sourceCommit},{expectedAttestationDigest=expectedDeclarationDigest}={}){
 requireThat(/^[a-f0-9]{40}$/.test(sourceCommit??''),'Exact source SHA required');
 requireThat(attestation&&hash(JSON.stringify(attestation))===expectedAttestationDigest,'Missing or changed pinned owner declaration');
 requireThat(attestation.schemaVersion===1&&attestation.reviewType==='owner-review'&&attestation.reviewer?.name==='Gian Paolo Franceschini'&&attestation.reviewer?.role==='owner'&&attestation.declaredOn==='2026-10-26'&&typeof attestation.declaration==='string'&&attestation.declaration.trim(),'Owner declaration identity invalid');
 requireThat(attestation.approvalScope==='owner-internal-testflight'&&attestation.ownerGroupId===ownerGroup&&attestation.independentReviewComplete===false&&attestation.appStoreReady===false&&attestation.publicWebAllowed===false&&attestation.externalTestersAllowed===false,'Owner declaration cannot authorize independent or public release');
 requireThat(manifestDigest(files)===attestation.contentDigest&&manifestDigest(attestation.files)===attestation.contentDigest,'Reviewed scientific content changed');
 requireThat(readiness?.schemaVersion===1&&readiness.scope==='catalog'&&readiness.totals?.checked===148&&readiness.totals.independentlyReviewed===0&&readiness.totals.blocked===148&&readiness.releaseReady===false,'Scientific report differs from the owner-reviewed snapshot');
 requireThat(same(normalizedGaps(readiness),attestation.deferredGaps),'Scientific gaps differ from the owner-reviewed snapshot');
 requireThat(Array.isArray(toxicology?.errors)&&toxicology.errors.length===0&&Array.isArray(toxicology.warnings),'Structural toxicology errors block internal beta');
 requireThat(same([...toxicology.warnings].sort(),attestation.toxicologyWarnings),'Toxicology warnings differ from the owner-reviewed snapshot');
 return {schemaVersion:1,sourceCommit,betaAllowed:true,approvalScope:'owner-internal-testflight',ownerGroupId:ownerGroup,independentReleaseReady:false,appStoreReady:false,publicWebAllowed:false,ownerReview:{reviewType:'owner-review',reviewer:attestation.reviewer,declaredOn:attestation.declaredOn,declarationSha256:expectedAttestationDigest,contentDigest:attestation.contentDigest,fileCount:files.length,independentReviewComplete:false},scientificTotals:readiness.totals,deferredGaps:attestation.deferredGaps,toxicologyWarnings:attestation.toxicologyWarnings};
}
export async function snapshotScientificContent(){
 const paths=execFileSync('git',['ls-files','-z','--',...scopes],{encoding:'utf8'}).split('\0').filter(Boolean).sort();
 const files=[];
 for(const path of paths){const stat=await lstat(path);requireThat(stat.isFile()&&!stat.isSymbolicLink(),'Scientific source must be a regular file: '+path);const bytes=await readFile(path);files.push({path,bytes:bytes.length,sha256:hash(bytes)});}
 manifestDigest(files);return files;
}
export function runStrictScienceReports(){
 function run(script,args){
  const r=spawnSync(process.execPath,[script,...args],{encoding:'utf8',maxBuffer:10*1024*1024});
  requireThat(!r.error&&[0,1].includes(r.status),'Scientific validator failed to execute: '+script);
  let report;try{report=JSON.parse(r.stdout);}catch{throw Error('Scientific validator returned invalid JSON: '+script);}
  return {exitCode:r.status,report};
 }
 const readiness=run('scripts/release-readiness.mjs',['--strict','--json']);
 const toxicology=run('scripts/audit-toxicology-release.mjs',['--strict']);
 requireThat(readiness.exitCode===(readiness.report.releaseReady?0:1),'Scientific strict exit/report mismatch');
 requireThat(toxicology.exitCode===(toxicology.report.releaseBlocked?1:0),'Toxicology strict exit/report mismatch');
 return {readiness,toxicology};
}
export async function verifyOwnerBetaScience(sourceCommit){
 let strict;
 try{
  const attestation=JSON.parse(await readFile(declarationPath,'utf8'));
  const files=await snapshotScientificContent();strict=runStrictScienceReports();
  // Observation time is not part of the scientific-content identity.
  delete strict.readiness.report.checkedAt;
  if(files.some(f=>f.path==='src/data/theory-foundations.json')){
   const {verifyConfirmedStudyBeta}=await import('./study-beta-science.mjs');
   return await verifyConfirmedStudyBeta({files,strictChecks:strict,sourceCommit});
  }
  return {...ownerBetaDecision({attestation,files,readiness:strict.readiness.report,toxicology:strict.toxicology.report,sourceCommit}),strictChecks:strict};
 }catch(error){
  error.scienceReport={schemaVersion:1,sourceCommit,betaAllowed:false,appStoreReady:false,independentReleaseReady:false,strictChecks:strict??null,error:error.message};
  throw error;
 }
}
export function assertOwnerScienceReceipt(receipt,report){
 requireThat(report?.betaAllowed===true&&report.approvalScope==='owner-internal-testflight'&&report.sourceCommit===receipt?.sourceCommit&&report.ownerGroupId===ownerGroup&&report.appStoreReady===false&&report.independentReleaseReady===false&&report.publicWebAllowed===false&&report.ownerReview?.independentReviewComplete===false,'Invalid or cross-source owner beta science proof');
 const pinned=report.ownerReview.declarationSha256;
 const study=pinned==='32037af4686796d56070f6257f0afa446437f145212c3f77827c6e9562a4c1b1'&&report.ownerReview.contentDigest==='85efde0ea64d6f3896637d3e1002c3c2586effbcef918f6fa375d1e8d0cae8df'&&report.ownerReview.fileCount===868&&report.ownerReview.publishedWebSource==='a227c1f20d3e8f5d731c7b61f73babc1cee4635c';
 requireThat(pinned===expectedDeclarationDigest||study,'Unpinned owner receipt');
 requireThat(receipt.testFlightOnly===true&&receipt.diagnosticOnly===true&&receipt.appStoreReady===false,'Owner science cannot widen release scope');
}
async function main(){
 const source=process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const out=resolve(process.env.RUNNER_TEMP||'/tmp','internal-beta-science.json');
 async function save(report){await mkdir(dirname(out),{recursive:true});await writeFile(out,JSON.stringify(report,null,2)+'\n');}
 let report;
 try{
  report=await verifyOwnerBetaScience(source);
  if(process.argv.includes('--verify-receipt')){
   const receipt=JSON.parse(await readFile(process.env.RUNNER_TEMP+'/consolidated-build.json','utf8'));
   assertOwnerScienceReceipt(receipt,report);
   requireThat(same(receipt.scientificReview,report),'Signed candidate science proof differs from current verified content');
  }
  await save(report);
  if(process.env.GITHUB_OUTPUT)await appendFile(process.env.GITHUB_OUTPUT,'independent_ready=false\n');
  console.log('OWNER_INTERNAL_BETA_SCIENCE '+JSON.stringify({...report,strictChecks:{readiness:{exitCode:report.strictChecks.readiness.exitCode},toxicology:{exitCode:report.strictChecks.toxicology.exitCode}}}));
 }catch(error){
  const failed={...(error.scienceReport??report??{}),schemaVersion:1,sourceCommit:source,betaAllowed:false,appStoreReady:false,independentReleaseReady:false,error:error.message};
  await save(failed);
  console.error('OWNER_INTERNAL_BETA_REJECTED '+JSON.stringify(failed));
  throw error;
 }
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)main().catch(error=>{console.error(error);process.exitCode=1;});
