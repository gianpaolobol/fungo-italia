import {probeDatabase,transition,statusOf} from './monitor.mjs';

function runtimeConfig(env) {
  if(!env.STATE?.get||!env.STATE?.put||!env.STATUS_TOKEN||env.STATUS_TOKEN.length<32)
    throw Error('monitor_configuration');
  if(!['database','watchdog'].includes(env.MODE))throw Error('monitor_mode');
  if(env.NOTICES_ENABLED==='true'&&(!env.BREVO_API_KEY||
     !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.MAIL_TO||'')||
     !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.MAIL_FROM||'')))throw Error('notice_configuration');
}

async function probeWatchdog(env,fetcher) {
  const url=new URL(env.WATCH_URL);
  if(url.protocol!=='https:'||!/^[-a-z0-9]+\.[-a-z0-9]+\.workers\.dev$/.test(url.hostname)||
     url.pathname!=='/status'||url.search||url.hash||url.port||url.username||url.password||env.WATCH_TOKEN?.length<32)
    throw Error('watchdog_configuration');
  try {
    const response=await fetcher(url.href,{headers:{Authorization:`Bearer ${env.WATCH_TOKEN}`},
      redirect:'error',cache:'no-store',signal:AbortSignal.timeout(10000)});
    if(!response.ok)return {ok:false,code:'monitor_unavailable'};
    const result=await response.json();
    return result.healthy===true&&result.code==='database_read_ok'
      ?{ok:true,code:'database_read_ok'}:{ok:false,code:'monitor_unavailable'};
  } catch {return {ok:false,code:'monitor_unavailable'};}
}

async function sendNotice(env,notice,state,fetcher) {
  const labels={outage:'Problema persistente',recovery:'Servizio ripristinato',weekly:'Riepilogo settimanale'};
  const payload={sender:{name:'Fungo Italia — monitor pilota',email:env.MAIL_FROM},
    to:[{email:env.MAIL_TO}],subject:`${labels[notice.type]} — ${env.MODE==='watchdog'?'monitor esterno':'corsi beta'}`,
    textContent:`${labels[notice.type]}. Ultimo controllo: ${new Date(state.lastRunAt).toISOString()}. `+
      `Ultima lettura riuscita: ${state.lastSuccessAt===null?'mai':new Date(state.lastSuccessAt).toISOString()}. `+
      `Errori consecutivi: ${state.failures}. Codice: ${state.lastCode}. `+
      'Piano gratuito: nessuna garanzia contro la sospensione. Consultare lo stato e la procedura di recupero. '+
      'Questo messaggio riguarda la disponibilità, non attesta backup, quote o consegne degli studenti.'};
  try {
    const response=await fetcher('https://api.brevo.com/v3/smtp/email',{method:'POST',
      headers:{'api-key':env.BREVO_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(payload),
      redirect:'error',signal:AbortSignal.timeout(10000)});
    if(response.status!==201)return false;
    const result=await response.json();return typeof result.messageId==='string'&&result.messageId.length>0;
  } catch {return false;}
}

export async function runScheduled(env,now,fetcher=fetch) {
  if(env.ENABLED!=='true')return {disabled:true};
  runtimeConfig(env);
  const key=env.MODE;
  const previous=await env.STATE.get(key,{type:'json'});
  if(previous?.lastRunAt>=now){
    const health=statusOf(previous,now);
    if(!health.healthy)throw Error(health.code);
    if(previous.delivery&&previous.delivery.status!=='accepted')throw Error('notice_delivery_unconfirmed');
    return health;
  }
  const probe=env.MODE==='watchdog'?await probeWatchdog(env,fetcher):await probeDatabase({
    supabaseUrl:env.SUPABASE_URL,apiKey:env.SUPABASE_ANON_KEY,probeToken:env.SUPABASE_ANON_KEY
  },fetcher);
  const {state,notice}=transition(previous,probe,now);
  const day=Math.floor(now/86400000);
  if(state.noticeDay!==day){state.noticeDay=day;state.noticeCount=0;}
  // Reserve before sending: ambiguous timeouts are not retried immediately.
  // KV is eventually consistent: this bounds normal sequential cron runs, not exactly-once delivery.
  if(notice&&env.NOTICES_ENABLED==='true') {
    if(state.noticeCount>=6)state.delivery={id:notice.id,status:'daily_limit',at:now};
    else {state.noticeCount++;state.delivery={id:notice.id,status:'sending',at:now};}
  } else if(notice)state.delivery={id:notice.id,status:'disabled',at:now};
  await env.STATE.put(key,JSON.stringify(state));
  if(notice&&state.delivery.status==='sending') {
    const accepted=await sendNotice(env,notice,state,fetcher);
    state.delivery.status=accepted?'accepted':'failed_or_unknown';
    await env.STATE.put(key,JSON.stringify(state));
  }
  if(!probe.ok)throw Error(probe.code);
  if(state.delivery&&state.delivery.status!=='accepted')throw Error('notice_delivery_unconfirmed');
  return statusOf(state,now);
}

async function tokenMatches(actual,expected) {
  // Fixed-size digest comparison avoids leaking the first differing token character.
  if(!expected||expected.length<32||!actual||actual.length>1024)return false;
  const bytes=new TextEncoder();
  const [a,b]=await Promise.all([actual,`Bearer ${expected}`].map(v=>crypto.subtle.digest('SHA-256',bytes.encode(v))));
  const aa=new Uint8Array(a),bb=new Uint8Array(b);let diff=0;
  for(let i=0;i<aa.length;i++)diff|=aa[i]^bb[i];return diff===0;
}

export async function serveStatus(request,env,now=Date.now()) {
  const headers={'Cache-Control':'no-store','Content-Type':'application/json','X-Content-Type-Options':'nosniff'};
  if(!await tokenMatches(request.headers.get('Authorization'),env.STATUS_TOKEN))
    return new Response('{"error":"unauthorized"}',{status:401,headers});
  try {
    runtimeConfig(env);
    if(env.ENABLED!=='true')return Response.json({healthy:false,code:'monitor_disabled'},{status:503,headers});
    const state=await env.STATE.get(env.MODE,{type:'json'}),health=statusOf(state,now);
    const notices=env.NOTICES_ENABLED==='true'&&(!state?.delivery||state.delivery.status==='accepted');
    const body={...health,healthy:health.healthy&&notices,noticesEnabled:env.NOTICES_ENABLED==='true',
      lastRunAt:state?.lastRunAt??null,lastSuccessAt:state?.lastSuccessAt??null,delivery:state?.delivery?.status??'none'};
    return Response.json(body,{status:body.healthy?200:503,headers});
  } catch {return Response.json({healthy:false,code:'monitor_state_unavailable'},{status:503,headers});}
}

export const monitorWorker={
  async scheduled(event,env,ctx){ctx.waitUntil(runScheduled(env,event.scheduledTime));},
  async fetch(request,env){
    if(request.method!=='GET'||new URL(request.url).pathname!=='/status')
      return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
    return serveStatus(request,env);
  }
};
export default monitorWorker;
