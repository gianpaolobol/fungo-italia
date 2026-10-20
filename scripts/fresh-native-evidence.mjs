export async function awaitSuccessfulFreshNative({readRuns,sha,attempts=90,pause=ms=>new Promise(resolve=>setTimeout(resolve,ms)),onWait=()=>{}}){
 for(let attempt=0;attempt<attempts;attempt++){
  const rows=await readRuns();if(!Array.isArray(rows))throw Error('Invalid fresh native evidence response');
  const run=rows.filter(r=>r.head_sha===sha).sort((a,b)=>b.id-a.id)[0];
  if(!run)return null;
  if(run.status==='completed'){
   if(run.conclusion!=='success')throw Error('Fresh candidate native test did not pass: '+run.id+' '+run.conclusion);
   return run;
  }
  if(attempt===attempts-1)throw Error('Fresh exact-candidate native tests are still pending; upload refused');
  onWait(run);await pause(20000);
 }
 throw Error('No fresh native verification attempts configured');
}
