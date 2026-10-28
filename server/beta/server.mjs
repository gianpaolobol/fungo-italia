const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const json=(status,value,extra={})=>new Response(JSON.stringify(value),{status,headers:{...headers,'Content-Type':'application/json; charset=utf-8',...extra}});
const bearer=req=>/^Bearer ([A-Za-z0-9_-]{43})$/.exec(req.headers.get('authorization')??'')?.[1]??'';
async function readBody(req){
 if(!/^application\/json(?:;|$)/i.test(req.headers.get('content-type')??''))throw{status:415};
 const reader=req.body?.getReader();if(!reader)throw{status:400};let size=0,parts=[];
 try{while(true){const{done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();throw{status:413};}parts.push(value);}}finally{reader.releaseLock();}
 const buffer=new Uint8Array(size);let offset=0;for(const part of parts){buffer.set(part,offset);offset+=part.length;}
 try{const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer));if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value;}catch{throw{status:400};}
}
export function createBetaHandler({store,origin,ownerId,assets={}}){
 return async function handle(req,identity={}){
  const url=new URL(req.url),path=url.pathname;
  try{
   if(path==='/whoami'&&req.method==='GET')return json(200,{userId:identity.userId??null,configured:!!ownerId});
   if(path==='/health'&&req.method==='GET')return json(200,{ready:!!ownerId});
   if(path==='/'&&req.method==='GET')return new Response(null,{status:302,headers:{...headers,Location:'/admin'}});
   if(assets[path]&&req.method==='GET'){
    if((path==='/admin'||path==='/admin.js')&&(!ownerId||identity.userId!==ownerId))return new Response('<!doctype html><html lang="it"><meta name="viewport" content="width=device-width"><title>Fungo Italia — accesso riservato</title><main><h1>Fungo Italia · Beta</h1><p>Pannello riservato al titolare.</p><a href="/signin-with-chatgpt?return_to=%2Fadmin" target="_top">Accedi con ChatGPT</a></main></html>',{status:403,headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});
    const asset=assets[path];return new Response(asset.body,{headers:{...headers,'Content-Type':asset.type,'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"}});
   }
   const admin=path.startsWith('/admin/grants/');
   const actions=admin?['list','invite','revoke','extend','revoke-all']:['redeem','check','logout'];
   const action=path.split('/').at(-1);
   if(!actions.includes(action)||(!admin&&!path.startsWith('/beta/')))return json(404,{error:'Non trovato'});
   if(req.method!=='POST')return json(405,{error:'Metodo non consentito'},{Allow:'POST'});
   if(admin&&(!ownerId||identity.userId!==ownerId||req.headers.get('origin')!==origin||req.headers.get('x-beta-admin')!=='1'))return json(403,{error:'Accesso non consentito'});
   // Native clients have no Origin. Browser clients must be same-origin; no CORS is enabled.
   if(!admin&&req.headers.has('origin')&&req.headers.get('origin')!==origin)return json(403,{error:'Accesso non consentito'});
   if(!await store.takeRate('global:beta-api',1000))return json(429,{error:'Servizio occupato. Riprova tra un minuto.'},{'Retry-After':'60'});
   const limit=admin?60:action==='redeem'?10:120;
   const key=(admin?'admin:'+identity.userId:'ip:'+(identity.ip??'unknown'))+':'+action;
   if(!await store.takeRate(key,limit))return json(429,{error:'Troppi tentativi. Riprova tra un minuto.'},{'Retry-After':'60'});
   const input=await readBody(req);
   try{
    let result;
    if(admin){
     if(action==='list')result=await store.list(input);
     else if(action==='invite')result=await store.invite(input);
     else if(action==='revoke-all'){if(input.confirm!=='REVOCA TUTTI')return json(400,{error:'Conferma richiesta'});result=await store.revokeAll();}
     else if(action==='revoke')result=await store.revoke(input);
     else result=await store.extend(input);
    }else if(action==='redeem')result=await store.redeem(input);
    else if(action==='check')result=await store.check({sessionToken:bearer(req)});
    else result=await store.logout({sessionToken:bearer(req)});
    return json(200,result);
   }catch(error){
    const message=error instanceof Error?error.message:'';
    if(/^(Email non valida|Paginazione non valida|Scadenza non valida|Invito non valido|Beta scaduta|Conflitto:)/.test(message))return json(message.startsWith('Conflitto')?409:400,{error:message});
    return json(503,{error:'Servizio temporaneamente non disponibile'});
   }
  }catch(error){return json([400,413,415].includes(error?.status)?error.status:503,{error:'Richiesta non disponibile'});}
 };
}
