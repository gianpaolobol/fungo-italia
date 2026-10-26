import {appendFile, readFile, writeFile} from 'node:fs/promises';
import {assertOwnerScienceReceipt} from './internal-beta-science.mjs';
export function exactEvidence(run, sha, path) {
 if (!run || run.head_sha !== sha || run.path !== path || run.event !== 'push' || run.head_branch !== 'main' || run.status !== 'completed') throw Error('Missing completed exact-source proof: '+path);
 if (!['success','failure','timed_out'].includes(run.conclusion)) throw Error('Cancelled or skipped execution is not proof: '+path);
 return {id:run.id,path,sourceCommit:sha,conclusion:run.conclusion,verified:run.conclusion==='success',url:run.html_url};
}
export function candidateReceipt({sha,native,ui,demo}) {
 if(!/^[a-f0-9]{40}$/.test(sha))throw Error('Invalid source commit');
 const evidence={native:exactEvidence(native,sha,'.github/workflows/subscription-storekit-tests.yml'),ui:exactEvidence(ui,sha,'.github/workflows/subscription-storekit-ui.yml'),demo:exactEvidence(demo,sha,'.github/workflows/agaricus-demo-ui.yml')};
 if(!evidence.demo.verified)throw Error('Free demo must pass before beta upload');
 if(!evidence.native.verified)throw Error('Native StoreKit tests must pass before beta upload');
 if(!evidence.ui.verified)throw Error('StoreKit purchase UI tests must pass on iPhone and iPad before beta upload');
 return {appId:'6821140326',bundleId:'it.fungoitalia.app',productId:'it.fungoitalia.premium.annual',version:'1.1.0',sourceCommit:sha,testFlightOnly:true,diagnosticOnly:true,appStoreReady:false,nativeStorekitVerified:evidence.native.verified,storekitUIVerified:evidence.ui.verified,evidence,createdAt:new Date().toISOString()};
}
export function ownerCandidateReceipt(proofs,science){
 const receipt=candidateReceipt(proofs);
 assertOwnerScienceReceipt(receipt,science);
 return {...receipt,scientificReview:science};
}
async function main(){
 const base='https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY;
 async function get(path){const r=await fetch(base+path,{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json'}});if(!r.ok)throw Error('GitHub proof lookup failed '+r.status);return r.json();}
 const paths=['subscription-storekit-tests.yml','subscription-storekit-ui.yml','agaricus-demo-ui.yml'];
 for(let attempt=0;attempt<270;attempt++){
  const head=(await get('/git/ref/heads/main')).object.sha;if(head!==process.env.GITHUB_SHA)throw Error('Main changed; refuse stale candidate upload');
  const runs=await Promise.all(paths.map(async path=>{
   const j=await get('/actions/workflows/'+path+'/runs?branch=main&head_sha='+process.env.GITHUB_SHA+'&event=push&per_page=20');
   return j.workflow_runs.filter(r=>r.head_sha===process.env.GITHUB_SHA&&r.path==='.github/workflows/'+path).sort((a,b)=>Number(b.id)-Number(a.id))[0];
  }));
  if(runs.every(r=>r?.status==='completed')){
   const science=JSON.parse(await readFile(process.env.RUNNER_TEMP+'/internal-beta-science.json','utf8'));
   const receipt=ownerCandidateReceipt({sha:process.env.GITHUB_SHA,native:runs[0],ui:runs[1],demo:runs[2]},science);
   await writeFile(process.env.RUNNER_TEMP+'/consolidated-build.json',JSON.stringify(receipt,null,2)+'\n');
   await appendFile(process.env.GITHUB_STEP_SUMMARY,'Diagnostic TestFlight only. Native: '+receipt.evidence.native.conclusion+'; purchase UI: '+receipt.evidence.ui.conclusion+'; demo: success. No App Store selection.\n');
   console.log('CONSOLIDATED_DIAGNOSTIC_EVIDENCE '+JSON.stringify(receipt));return;
  }
  console.log('Waiting for exact-source native, UI and demo proofs (attempt '+(attempt+1)+')');await new Promise(r=>setTimeout(r,20000));
 }
 throw Error('Exact-source proofs incomplete; no beta uploaded');
}
if(process.argv[1]?.endsWith('/consolidated-evidence.mjs'))await main();
