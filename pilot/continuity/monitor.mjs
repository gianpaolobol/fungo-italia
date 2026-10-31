const HOUR=3600000, DAY=24*HOUR;
export function validateConfig(config) {
  const url=new URL(config.supabaseUrl);
  if(url.protocol!=='https:'||!/^[-a-z0-9]+\.supabase\.co$/.test(url.hostname)||
     url.username||url.password||url.port||url.pathname!=='/'||url.search||url.hash||
     !config.apiKey?.trim()||!config.probeToken?.trim()) throw Error('Invalid dedicated probe configuration');
  return {...config,supabaseUrl:url.origin};
}

export async function probeDatabase(rawConfig,fetcher=fetch) {
  const config=validateConfig(rawConfig);
  const query=new URLSearchParams({select:'id,schema_version',id:'eq.1',limit:'1'});
  try {
    const response=await fetcher(`${config.supabaseUrl}/rest/v1/sentinel?${query}`,{
      headers:{apikey:config.apiKey,Authorization:`Bearer ${config.probeToken}`,'Accept-Profile':'pilot_health'},
      redirect:'error',cache:'no-store',signal:AbortSignal.timeout(10000)
    });
    if(!response.ok) return {ok:false,code:[401,403].includes(response.status)?'database_credentials':response.status===429?'database_rate_limit':'database_unavailable'};
    const rows=await response.json();
    if(!Array.isArray(rows)||rows.length!==1||rows[0].id!==1||rows[0].schema_version!==1)
      return {ok:false,code:'database_probe_invalid'};
    return {ok:true,code:'database_read_ok'};
  } catch {return {ok:false,code:'database_network'};}
}

export function transition(previous,probe,now) {
  if(!Number.isFinite(now)||now<0) throw Error('Invalid observation time');
  if(previous&&previous.lastRunAt>=now) return {state:previous,notice:null};
  const state={version:1,startedAt:now,lastRunAt:null,lastSuccessAt:null,failures:0,
    lastOutageAt:null,lastWeeklyAt:now,incident:false,...previous};
  state.lastRunAt=now;state.lastCode=probe.code;
  state.failures=probe.ok?0:Math.min(state.failures+1,1000);
  if(probe.ok)state.lastSuccessAt=now;
  let type=null;
  if(probe.ok&&state.incident){type='recovery';state.incident=false;}
  else if(!probe.ok&&state.failures>=2&&(state.lastOutageAt===null||now-state.lastOutageAt>=DAY)){
    type='outage';state.incident=true;state.lastOutageAt=now;
  } else if(probe.ok&&now-state.lastWeeklyAt>=7*DAY){type='weekly';state.lastWeeklyAt=now;}
  return {state,notice:type?{type,id:`${type}:${now}`} :null};
}

export function statusOf(state,now=Date.now()) {
  if(!state||state.version!==1||!Number.isFinite(state.lastRunAt)||state.lastRunAt>now)
    return {healthy:false,code:'monitor_uninitialized'};
  if(now-state.lastRunAt>=15*HOUR)return {healthy:false,code:'scheduler_stale'};
  if(state.failures||state.lastSuccessAt!==state.lastRunAt)return {healthy:false,code:state.lastCode||'database_unavailable'};
  return {healthy:true,code:'database_read_ok'};
}
