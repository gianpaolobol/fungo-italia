const TOKEN=/^[A-Za-z0-9_-]{43}$/;
export function inviteTokenFromUrl(url){const m=typeof url==='string'?/^fungoitalia:\/\/beta\/?#([A-Za-z0-9_-]{43})$/.exec(url):null;return m?.[1]??null;}
export function createBetaController({enabled,request,storage,monotonic=()=>performance.now(),schedule=setTimeout,cancel=clearTimeout,onChange=()=>{}}){
 let value={active:false,checking:false,busy:false,expiresAt:null,error:''},session=null,generation=0,authGeneration=0,loadGeneration=0,redeeming=false,stopped=false,visible=true,deadline=0,refreshTimer,expiryTimer,writeQueue=Promise.resolve();
 const emit=patch=>{value={...value,...patch};if(!stopped)onChange();};
 const timers=()=>{cancel(refreshTimer);cancel(expiryTimer);};
 const invalidate=()=>{deadline=0;cancel(expiryTimer);emit({active:false,expiresAt:null});};
 const write=token=>{writeQueue=writeQueue.catch(()=>{}).then(()=>token?storage.set(token):storage.clear());return writeQueue;};
 async function timely(promise){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=schedule(()=>reject(Error('timeout')),10000);})]);}finally{cancel(timer);}}
 function arm(){
  timers();if(stopped||!visible||!session)return;
  if(value.active)expiryTimer=schedule(()=>{invalidate();},Math.max(0,deadline-monotonic()));
  refreshTimer=schedule(()=>{void api.refresh();},value.active?45000:60000);
 }
 function apply(data,started){
  const server=Date.parse(data?.serverNow),expiry=Date.parse(data?.expiresAt),age=data?.maxAgeSeconds;
  const remaining=Math.min(60000,age*1000,expiry-server)-(monotonic()-started);
  if(data?.active===true&&typeof data?.grantId==='string'&&Number.isFinite(server)&&Number.isFinite(expiry)&&Number.isFinite(age)&&age>0&&age<=60&&remaining>0){deadline=monotonic()+remaining;emit({active:true,expiresAt:data.expiresAt,error:''});}
  else{invalidate();emit({error:data?.active===true?'Verifica beta non valida. Riprova.':'Beta non attiva, scaduta o revocata.'});}
 }
 const api={
  state(){return{...value,active:value.active&&visible&&!stopped&&monotonic()<deadline};},
  async start(){stopped=false;visible=true;if(!enabled)return;const load=++loadGeneration,auth=authGeneration;try{const token=await storage.get();if(load!==loadGeneration||auth!==authGeneration||stopped)return;session=typeof token==='string'&&TOKEN.test(token)?token:null;if(session&&visible)await api.refresh();}catch{if(load===loadGeneration&&auth===authGeneration&&!stopped)emit({error:'Credenziale beta non leggibile. Riprova.'});}},
  async redeem(token){
   if(!enabled||stopped||redeeming)return;redeeming=true;const auth=++authGeneration,run=++generation,started=monotonic();timers();invalidate();emit({busy:true,checking:true,error:''});
   try{
    const data=await timely(request('/beta/redeem',{inviteToken:token},null));
    if(auth!==authGeneration)return;
    if(!TOKEN.test(data?.sessionToken??''))throw Error('invalid');
    const current=data.sessionToken;await write(current);
    if(auth!==authGeneration){if(await storage.get()===current)await write(null);return;}
    session=current;if(!stopped&&visible){if(run===generation)apply(data,started);else await api.refresh();}
   }catch{if(run===generation&&!stopped){invalidate();emit({error:'Attivazione non completata. Verifica rete e invito; se è già stato usato, richiedine uno nuovo.'});}}
   finally{redeeming=false;if(auth===authGeneration&&!stopped){emit({busy:false,...(run===generation?{checking:false}:{})});arm();}}
  },
  async refresh(){
   if(!enabled||stopped||!visible||!session)return;const run=++generation,started=monotonic(),token=session;emit({checking:true});
   try{const data=await timely(request('/beta/check',{},token));if(run===generation&&!stopped&&visible)apply(data,started);}
   catch{if(run===generation&&!stopped){invalidate();emit({error:'Beta non verificabile. La demo resta disponibile; riconnettiti e riprova.'});}}
   finally{if(run===generation&&!stopped){emit({checking:false,busy:false});arm();}}
  },
  background(){visible=false;++generation;timers();invalidate();emit({checking:false,busy:redeeming});},
  async foreground(){visible=true;++generation;invalidate();emit({busy:redeeming,checking:false});await api.refresh();},
  async logout(){const token=session;++authGeneration;++loadGeneration;++generation;session=null;timers();invalidate();emit({busy:false,checking:false,error:''});try{await write(null);}catch{emit({error:'Rimozione della credenziale non riuscita. Riprova.'});}if(token)void timely(request('/beta/logout',{},token)).catch(()=>{});},
  stop(){stopped=true;++loadGeneration;++generation;timers();invalidate();},
 };
 return api;
}
