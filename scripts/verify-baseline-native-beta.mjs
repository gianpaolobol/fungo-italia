import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {normalizeNativeInput} from './native-evidence-equivalence.mjs';
const base='https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY,sha=process.env.GITHUB_SHA;
const proofSha='a07d8b7a1249e96fdb6aa19a4a55fc1319611b62',proofRun=39454153800,uiRun=39467202425,uiSha='1465acecd24bd104e63f46b49868f5ac9f73d484';
async function request(path,method='GET'){
 const r=await fetch(base+path,{method,headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error('GitHub verification request failed '+r.status+' '+path);
 return [202,204].includes(r.status)?null:r.json();
}
// Stop only the explicitly superseded experiment, never another release run.
const superseded=await request('/actions/runs/39467202247');
if(superseded.head_sha!==uiSha||superseded.path!=='.github/workflows/study-testflight.yml')throw Error('Unexpected superseded run identity');
if(superseded.status!=='completed'){await request('/actions/runs/39467202247/cancel','POST');console.log('Superseded direct-query experiment cancelled before its upload');}
const native=await request('/actions/runs/'+proofRun),ui=await request('/actions/runs/'+uiRun);
if(native.head_sha!==proofSha||native.conclusion!=='success'||native.path!=='.github/workflows/subscription-storekit-tests.yml')throw Error('Successful native evidence identity mismatch');
if(ui.head_sha!==uiSha||ui.conclusion!=='failure'||ui.path!=='.github/workflows/subscription-storekit-ui.yml')throw Error('Known simulator UI failure evidence mismatch');
const explicit=['package.json','package-lock.json','app.json','app.config.js','App.tsx','hooks/useSubscription.ts','lib/subscriptionPolicy.ts','tests/storekit/AnnualStoreKitTests.swift','tests/storekit/Annual.storekit','scripts/clean-storekit-test-host.rb','scripts/prepare-storekit-runtime.sh','scripts/add-storekit-tests.rb','.github/workflows/subscription-storekit-tests.yml'];
const special=new Set(['package.json','package-lock.json','app.json','.github/workflows/subscription-storekit-tests.yml']);
async function inputs(commit){
 const tree=await request('/git/trees/'+commit+'?recursive=1');if(tree.truncated)throw Error('Incomplete native source tree');
 const files=tree.tree.filter(f=>f.type==='blob'&&(explicit.includes(f.path)||f.path.startsWith('modules/fungo-subscription/')));
 for(const path of explicit)if(!files.some(f=>f.path===path))throw Error('Native input missing '+path);
 const entries=await Promise.all(files.map(async f=>{
  if(f.mode!=='100644')throw Error('Unexpected native input mode');
  if(!special.has(f.path))return [f.path,f.mode,'git-blob:'+f.sha];
  const blob=await request('/git/blobs/'+f.sha);if(blob.encoding!=='base64')throw Error('Unexpected native blob encoding');
  const text=Buffer.from(blob.content,'base64').toString('utf8');
  return [f.path,f.mode,'normalized-sha256:'+createHash('sha256').update(normalizeNativeInput(f.path,text)).digest('hex')];
 }));return entries.sort((a,b)=>a[0].localeCompare(b[0]));
}
const [tested,candidate]=await Promise.all([inputs(proofSha),inputs(sha)]);
if(JSON.stringify(tested)!==JSON.stringify(candidate))throw Error('The candidate native runtime/test inputs differ from the passed evidence');
const config=JSON.parse(fs.readFileSync('app.json','utf8'));
if(config.expo.version!=='1.1.0')throw Error('Expected isolated study1.1.0 beta');
let dashboard;
for(let attempt=0;attempt<60;attempt++){
 const r=await request('/actions/workflows/study-dashboard-validation.yml/runs?head_sha='+sha+'&per_page=20');
 dashboard=r.workflow_runs.find(r=>r.head_sha===sha&&['push','workflow_dispatch'].includes(r.event));
 if(dashboard?.status==='completed'){if(dashboard.conclusion!=='success')throw Error('Candidate Dashboard validation failed');break;}
 if(attempt===59)throw Error('Candidate Dashboard validation is not complete');
 await new Promise(resolve=>setTimeout(resolve,10000));
}
const evidence={kind:'native-runtime-input-equivalence',candidateSource:sha,nativeRunId:proofRun,nativeProofSource:proofSha,normalizedFields:['app.expo.version','package.version','lock.version','lock.packages[empty].version','native workflow trigger filters only'],nativeInputsDigest:createHash('sha256').update(JSON.stringify(candidate)).digest('hex'),nativeInputs:candidate,dashboardRunId:dashboard.id,knownFailedUIRunId:uiRun,knownFailedUISource:uiSha,storekitUIVerified:false,uiScope:'Prior failed simulator run; current candidate full-app UI is not certified',testFlightOnly:true,createdAt:new Date().toISOString()};
fs.writeFileSync(process.env.RUNNER_TEMP+'/study-native-evidence.json',JSON.stringify(evidence,null,2)+'\n');
console.log('VERIFIED_BASELINE_NATIVE_EVIDENCE '+JSON.stringify(evidence));
