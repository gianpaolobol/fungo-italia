import fs from 'node:fs';
const sha=process.env.SOURCE_BUILD_COMMIT;
if(!/^[a-f0-9]{40}$/.test(sha||''))throw Error('Exact beta source missing');
const files=['subscription-storekit-tests.yml','study-dashboard-validation.yml','subscription-storekit-ui.yml'];
async function get(file){
 const response=await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/actions/workflows/${file}/runs?head_sha=${sha}&per_page=30`,{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('Evidence query failed '+response.status);
 return (await response.json()).workflow_runs.filter(r=>r.head_sha===sha&&['push','workflow_dispatch'].includes(r.event)).sort((a,b)=>b.id-a.id)[0];
}
let runs;
for(let attempt=0;attempt<90;attempt++){
 runs=await Promise.all(files.map(get));
 for(let i=0;i<2;i++)if(runs[i]?.status==='completed'&&runs[i].conclusion!=='success')throw Error(`Required ${files[i]} failed: ${runs[i].id}`);
 if(runs.every(r=>r?.status==='completed'))break;
 if(attempt===89)throw Error('Exact-source verification still pending; upload refused');
 console.log('Waiting for exact-source native, dashboard and full UI evidence');
 await new Promise(resolve=>setTimeout(resolve,20000));
}
if(!['success','failure'].includes(runs[2].conclusion))throw Error('UI verification incomplete');
const ui=runs[2].conclusion==='success';
fs.appendFileSync(process.env.GITHUB_ENV,`VERIFIED_NATIVE_STOREKIT_RUN=${runs[0].id}\nVERIFIED_STOREKIT_RUN=${runs[2].id}\nSTOREKIT_UI_VERIFIED=${ui}\n`);
console.log('STUDY_BETA_EVIDENCE '+JSON.stringify(runs.map((r,i)=>({workflow:files[i],id:r.id,sha:r.head_sha,conclusion:r.conclusion}))));
if(!ui)console.log('TESTFLIGHT DIAGNOSTIC CANDIDATE ONLY: native tests passed, full simulator UI failed. App Store production approval remains closed.');
