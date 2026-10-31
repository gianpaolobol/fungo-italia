const UUID=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function configOf(env){
  const url=new URL(env.SUPABASE_URL),entry=new URL(env.APP_ENTRY_URL);
  if(url.protocol!=='https:'||!/^[-a-z0-9]+\.supabase\.co$/.test(url.hostname)||url.port||url.pathname!=='/'||url.search||url.hash||url.username||url.password||
    entry.protocol!=='https:'||entry.username||entry.password||entry.hash||
    !env.SUPABASE_SERVICE_ROLE_KEY||!env.BREVO_API_KEY||!EMAIL.test(env.MAIL_FROM||''))throw Error('invitation_mail_configuration');
  return {database:url.origin,entry:entry.href};
}
async function rpc(env,base,name,body,fetcher,error){
  try{
    const response=await fetcher(`${base}/rest/v1/rpc/${name}`,{method:'POST',
      headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type':'application/json','Content-Profile':'pilot','Accept-Profile':'pilot'},
      body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw Error(error);
    return await response.json();
  }catch{throw Error(error);}
}
async function send(env,entry,job,fetcher){
  try{
    const response=await fetcher('https://api.brevo.com/v3/smtp/email',{method:'POST',
      headers:{'api-key':env.BREVO_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({sender:{name:'Fungo Italia — Corsi',email:env.MAIL_FROM},to:[{email:job.email}],
        subject:'Invito a un corso Fungo Italia',textContent:
          `Sei stato invitato al corso «${job.title}». Apri ${entry} e accedi con la stessa email che ha ricevuto questo invito. `+
          'Verifica la tua email con il codice di accesso e accetta l’invito nella sezione corsi. '+
          'Il codice di accesso account è distinto dal codice beta. Questa email non sblocca l’Atlante premium. '+
          'L’accesso dipende dalla validità dell’invito al momento dell’accettazione.'}),
      redirect:'error',signal:AbortSignal.timeout(10000)});
    if(response.status!==201)return false;
    const result=await response.json();return typeof result.messageId==='string'&&result.messageId.length>0;
  }catch{return false;}
}
export async function runInvitationBatch(env,fetcher=fetch){
  if(env.ENABLED!=='true')return {disabled:true};
  const config=configOf(env);
  const jobs=await rpc(env,config.database,'claim_invite_notices',{batch_limit:10},fetcher,'outbox_claim_failed');
  if(!Array.isArray(jobs)||jobs.length>10||jobs.some(j=>!j||!UUID.test(j.id)||!UUID.test(j.claim_id)||!UUID.test(j.invitation_id)||
    typeof j.email!=='string'||j.email.length>254||!EMAIL.test(j.email)||typeof j.title!=='string'||!j.title.trim()||j.title.length>160))throw Error('invalid_outbox_batch');
  const result={claimed:jobs.length,accepted:0,uncertain:0,cancelled:0};
  for(const job of jobs){
    const authorized=await rpc(env,config.database,'authorize_invite_notice',{
      job_id:job.id,claim_id:job.claim_id
    },fetcher,'outbox_authorization_failed');
    if(authorized===false){result.cancelled++;continue;}
    if(authorized!==true)throw Error('outbox_authorization_failed');
    const accepted=await send(env,config.entry,job,fetcher);
    const recorded=await rpc(env,config.database,'finish_invite_notice',{
      job_id:job.id,claim_id:job.claim_id,accepted
    },fetcher,'outbox_record_failed');
    if(recorded!==true)throw Error('outbox_record_failed');
    if(accepted)result.accepted++;else result.uncertain++;
  }
  return result;
}
export const invitationWorker={
  async scheduled(event,env,ctx){ctx.waitUntil(runInvitationBatch(env));},
  async fetch(){return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});}
};
export default invitationWorker;
