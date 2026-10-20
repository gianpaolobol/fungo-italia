// Fresh exact-candidate tests must complete successfully before they supersede prior evidence.
import fs from 'node:fs';
import {awaitSuccessfulFreshNative} from './fresh-native-evidence.mjs';
const url='https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY+'/actions/workflows/subscription-storekit-tests.yml/runs?head_sha='+process.env.GITHUB_SHA+'&per_page=20';
const run=await awaitSuccessfulFreshNative({sha:process.env.GITHUB_SHA,readRuns:async()=>{
 const r=await fetch(url,{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error('Fresh candidate native evidence query failed '+r.status);
 return (await r.json()).workflow_runs;
},onWait:run=>console.log('Waiting for fresh exact-candidate native run '+run.id+'; pending runs never override failure evidence')});
const path=process.env.RUNNER_TEMP+'/study-native-evidence.json',evidence=JSON.parse(fs.readFileSync(path));
evidence.freshCandidateNativeRun=run?{id:run.id,source:run.head_sha,status:run.status,conclusion:run.conclusion}:null;
fs.writeFileSync(path,JSON.stringify(evidence,null,2)+'\n');console.log('FRESH_CANDIDATE_NATIVE_CHECK '+JSON.stringify(evidence.freshCandidateNativeRun));
