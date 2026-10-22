import {execFileSync} from 'node:child_process';
import {writeFile,appendFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const paths={native:'subscription-storekit-tests.yml',ui:'subscription-storekit-ui.yml',demo:'agaricus-demo-ui.yml',scientific:'scientific-generator-verification.yml'};
export function validateProductionProofs({sha,mainSha,runs}){
 if(!/^[a-f0-9]{40}$/.test(sha??'')||sha!==mainSha)throw Error('Production requires the current exact main source');
 const evidence={};
 for(const [key,file] of Object.entries(paths)){
  const run=runs?.[key],allowed=key==='scientific'?['push','workflow_dispatch']:['push'];
  if(!run||!Number.isSafeInteger(run.id)||run.id<=0||run.head_sha!==sha||run.head_branch!=='main'||run.path!=='.github/workflows/'+file||!allowed.includes(run.event)||run.status!=='completed'||run.conclusion!=='success')throw Error('Missing successful exact-main production proof: '+file);
  evidence[key]={id:run.id,path:run.path,sourceCommit:sha,event:run.event,conclusion:'success'};
 }
 return {schemaVersion:1,sourceCommit:sha,buildProfile:'production',appStoreReady:false,evidence};
}

async function main(){
 if(process.env.GITHUB_REF!=='refs/heads/main')throw Error('Production is restricted to main');
 // Execute the actual strict gates; never accept a hand-edited report or flag.
 execFileSync(process.execPath,['scripts/release-readiness.mjs','--strict'],{stdio:'inherit'});
 execFileSync(process.execPath,['scripts/audit-toxicology-release.mjs','--strict'],{stdio:'inherit'});
 execFileSync('git',['diff','--exit-code'],{stdio:'inherit'});
 if(!process.env.GH_TOKEN||!process.env.GITHUB_REPOSITORY||!process.env.RUNNER_TEMP)throw Error('Authenticated production proof environment required');
 const base='https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY;
 async function get(path){
  const response=await fetch(base+path,{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error('Production evidence lookup failed: HTTP '+response.status);
  return response.json();
 }
 const sha=process.env.GITHUB_SHA,runs={};
 for(const [key,file] of Object.entries(paths)){
  const result=await get('/actions/workflows/'+file+'/runs?branch=main&head_sha='+encodeURIComponent(sha)+'&per_page=20'+(key==='scientific'?'':'&event=push'));
  runs[key]=result.workflow_runs?.filter(run=>run.head_sha===sha&&run.head_branch==='main'&&run.path==='.github/workflows/'+file&&run.event!=='pull_request').sort((a,b)=>b.id-a.id)[0];
 }
 const mainSha=(await get('/git/ref/heads/main')).object?.sha;
 const receipt=validateProductionProofs({sha,mainSha,runs});
 await writeFile(process.env.RUNNER_TEMP+'/production-source-proof.json',JSON.stringify(receipt,null,2)+'\n');
 if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,'Production source gates passed for '+sha+'. Signed binary provenance, Apple processing, tester availability and App Store readiness still require verification.\n');
 console.log('PRODUCTION_SOURCE_PREFLIGHT '+JSON.stringify(receipt));
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)await main();
