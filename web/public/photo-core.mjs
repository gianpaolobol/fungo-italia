export const REPOSITORY='gianpaolobol/fungo-italia';
export const BRANCH='photo-library';
export const FOLDER='photo-library';
export const MAX_BYTES=2*1024*1024;
export const MAX_BATCH=20;
const LICENSES=['rights-reserved','CC-BY-4.0','CC-BY-SA-4.0','CC0-1.0'];
export function toBase64(bytes){let text='';for(let i=0;i<bytes.length;i+=32768)text+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(text);}
export function fromBase64(text){return Uint8Array.from(atob(text.replace(/\s/g,'')),c=>c.charCodeAt(0));}
export async function digest(bytes){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');}
export function sanitizeJpeg(input){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
 if(bytes[0]!==255||bytes[1]!==216)throw Error('La conversione non ha prodotto un JPEG valido.');
 const parts=[bytes.subarray(0,2)];let offset=2,ended=false;
 while(offset<bytes.length){
  const start=offset;if(bytes[offset++]!==255)throw Error('Struttura JPEG non valida.');
  while(bytes[offset]===255)offset++;
  const marker=bytes[offset++];
  if(marker===217){parts.push(bytes.subarray(start,offset));ended=true;break;}
  if(marker===0||marker===216||marker===1||(marker>=208&&marker<=215))throw Error('Struttura JPEG non valida.');
  if(offset+2>bytes.length)throw Error('JPEG incompleto.');
  const length=(bytes[offset]<<8)|bytes[offset+1],end=offset+length;
  if(length<2||end>bytes.length)throw Error('JPEG incompleto.');
  if(marker===218){
   parts.push(bytes.subarray(start,end));let scan=end;
   while(scan<bytes.length){
    if(bytes[scan]!==255){scan++;continue;}
    let next=scan+1;while(bytes[next]===255)next++;
    if(next>=bytes.length)throw Error('JPEG incompleto.');
    if(bytes[next]===0||(bytes[next]>=208&&bytes[next]<=215)){scan=next+1;continue;}
    break;
   }
   parts.push(bytes.subarray(end,scan));offset=scan;continue;
  }
  // Preserve JFIF pixels/colour structure; remove EXIF, XMP, IPTC and comments.
  if(!((marker>=225&&marker<=239)||marker===254))parts.push(bytes.subarray(start,end));
  offset=end;
 }
 if(!ended)throw Error('JPEG incompleto.');
 const result=new Uint8Array(parts.reduce((sum,p)=>sum+p.length,0));let at=0;for(const part of parts){result.set(part,at);at+=part.length;}
 return result;
}
export function jpegDimensions(bytes){
 let at=2;
 while(at+4<bytes.length){
  if(bytes[at++]!==255)throw Error('JPEG non valido.');
  while(bytes[at]===255)at++;const marker=bytes[at++];
  if(marker===218||marker===217)break;
  const length=(bytes[at]<<8)|bytes[at+1];
  if([192,193,194].includes(marker)){return {height:(bytes[at+3]<<8)|bytes[at+4],width:(bytes[at+5]<<8)|bytes[at+6]};}
  at+=length;
 }
 throw Error('Dimensioni JPEG non documentabili.');
}
export function makeRecord({sha,width,height,attribution,authorizedAt}){
 return {id:'photo-'+sha,file:'images/'+sha+'.jpg',sha256:sha,dimensions:{width,height},importedAt:authorizedAt,
 source:{kind:'user-provided',publicName:'Foto_'+sha.slice(0,12)+'.jpg'},
 rights:{attribution,license:'rights-reserved',publicationScope:'fungo-italia-authorized',authorization:{method:'uploader-declaration',recordedAt:authorizedAt}},
 metadataPolicy:'gps-and-exif-removed',
 identification:{status:'unresolved',proposedGenus:null,proposedSpecies:null,visibleCharacters:[],missingCharacters:[],alternatives:[],references:[]}};
}
export function validateMetadata(value){
 if(!value||value.version!==1||!Array.isArray(value.photos)||value.photos.length>10000)throw Error('Indice fotografico non leggibile: nessun dato esistente sarà sovrascritto.');
 const ids=new Set();
 for(const p of value.photos){
  if(!p||!/^[a-f0-9]{64}$/.test(p.sha256)||p.id!=='photo-'+p.sha256||p.file!=='images/'+p.sha256+'.jpg'||ids.has(p.id)||p.metadataPolicy!=='gps-and-exif-removed'||!p.rights||!LICENSES.includes(p.rights.license)||typeof p.rights.attribution!=='string'||!p.rights.attribution.trim()||p.rights.publicationScope!=='fungo-italia-authorized'||!p.identification||!['unresolved','proposed','reviewed'].includes(p.identification.status))throw Error('Indice fotografico non valido: ripristino richiesto al curatore.');
  ids.add(p.id);
 }
 return value;
}
export function mergeMetadata(value,incoming){
 validateMetadata(value);validateMetadata({version:1,photos:incoming});
 const photos=[...value.photos],ids=new Set(photos.map(p=>p.id));
 for(const p of incoming)if(!ids.has(p.id)){photos.push(p);ids.add(p.id);}
 return {...value,photos};
}
export class GitHubError extends Error{constructor(status){super(status===401?'Autorizzazione GitHub scaduta o non valida.':status===403?'GitHub non consente la scrittura: verifica Contents read/write per questo repository.':status===429?'GitHub richiede una pausa: riprova tra poco.':status===0?'Connessione interrotta. Le copie restano in questa pagina; riprova senza chiuderla.':'Operazione GitHub non riuscita (HTTP '+status+').');this.status=status;}}
export function createGitHubClient(token,{fetcher=globalThis.fetch,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
 if(typeof token!=='string'||!/^github_pat_[A-Za-z0-9_]{30,}$/.test(token))throw Error('Usa un token fine-grained GitHub, limitato a fungo-italia.');
 const prefix='https://api.github.com/repos/'+REPOSITORY;
 async function api(endpoint,{method='GET',body,allow404=false,signal}={}){
  for(let attempt=0;attempt<3;attempt++){
   if(signal?.aborted)throw new DOMException('Operazione annullata','AbortError');
   const controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});
   const timeout=setTimeout(()=>controller.abort(),45000);
   let response;
   try{response=await fetcher(prefix+endpoint,{method,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal});}
   catch{if(signal?.aborted)throw new DOMException('Operazione annullata','AbortError');throw new GitHubError(0);}
   finally{clearTimeout(timeout);signal?.removeEventListener('abort',abort);}
   if(allow404&&response.status===404)return null;
   if((response.status===429||response.status>=500)&&attempt<2){await wait((attempt+1)*1200);continue;}
   if(!response.ok)throw new GitHubError(response.status);
   return response.json();
  }
 }
 async function repository(signal){const r=await api('',{signal});if(r.full_name!==REPOSITORY||typeof r.private!=='boolean'||r.permissions?.push===false)throw Error('Il collegamento non permette di scrivere nel repository Fungo Italia.');return r;}
 async function snapshot(signal){
  let ref=await api('/git/ref/heads/'+BRANCH,{allow404:true,signal});const exists=!!ref;
  if(!ref)ref=await api('/git/ref/heads/main',{signal});
  const head=ref?.object?.sha;if(!/^[a-f0-9]{40}$/.test(head||''))throw Error('Ramo GitHub non leggibile.');
  const commit=await api('/git/commits/'+head,{signal});
  if(!/^[a-f0-9]{40}$/.test(commit?.tree?.sha||''))throw Error('Albero GitHub non leggibile.');
  const file=await api('/contents/'+FOLDER+'/metadata.json?ref='+encodeURIComponent(exists?BRANCH:'main'),{allow404:true,signal});
  let metadata={version:1,photos:[]};
  if(file){
   if(file.size>8*1024*1024)throw Error('Indice troppo grande: occorre dividere la libreria in raccolte.');
   const blob=file.encoding==='base64'?file:await api('/git/blobs/'+file.sha,{signal});
   if(blob.encoding!=='base64'||typeof blob.content!=='string')throw Error('Indice fotografico non leggibile.');
   try{metadata=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(fromBase64(blob.content)));}catch{throw Error('Indice fotografico corrotto: nessun dato sarà cancellato.');}
  }
  validateMetadata(metadata);return {exists,head,tree:commit.tree.sha,metadata};
 }
 async function publishBatch(items,{signal,onStage=()=>{}}={}){
  if(!items.length||items.length>MAX_BATCH)throw Error('Seleziona da 1 a 20 fotografie per lotto.');
  const unique=new Map();
  for(const item of items){
   validateMetadata({version:1,photos:[item.record]});
   const clean=sanitizeJpeg(item.bytes),dimensions=jpegDimensions(clean);
   if(clean.length!==item.bytes.length||clean.some((byte,i)=>byte!==item.bytes[i])||clean.length>MAX_BYTES||dimensions.width!==item.record.dimensions.width||dimensions.height!==item.record.dimensions.height||dimensions.width>1600||dimensions.height>1600||await digest(clean)!==item.record.sha256)throw Error('Controllo privacy o integrità della fotografia non riuscito.');
   unique.set(item.record.id,item);
  }
  let current=await snapshot(signal);const originals=new Set(current.metadata.photos.map(p=>p.id)),blobs=new Map();
  for(let attempt=0;attempt<4;attempt++){
   const known=new Set(current.metadata.photos.map(p=>p.id)),missing=[...unique.values()].filter(item=>!known.has(item.record.id));
   if(!missing.length)return {commitSha:current.head,added:0,alreadyPresent:unique.size,url:'https://github.com/'+REPOSITORY+'/tree/'+BRANCH+'/'+FOLDER};
   let done=0;
   for(const item of missing){onStage('Caricamento '+(++done)+' di '+missing.length+' copie…');if(!blobs.has(item.record.id)){const blob=await api('/git/blobs',{method:'POST',body:{content:toBase64(item.bytes),encoding:'base64'},signal});if(!/^[a-f0-9]{40}$/.test(blob.sha||''))throw Error('Copia GitHub non verificabile.');blobs.set(item.record.id,blob.sha);}}
   const metadata=mergeMetadata(current.metadata,missing.map(item=>item.record));
   onStage('Registrazione del lotto nella libreria…');
   const tree=await api('/git/trees',{method:'POST',body:{base_tree:current.tree,tree:[...missing.map(item=>({path:FOLDER+'/'+item.record.file,mode:'100644',type:'blob',sha:blobs.get(item.record.id)})),{path:FOLDER+'/metadata.json',mode:'100644',type:'blob',content:JSON.stringify(metadata,null,2)+'\n'}]},signal});
   if(!/^[a-f0-9]{40}$/.test(tree.sha||''))throw Error('Albero GitHub non verificabile.');
   const commit=await api('/git/commits',{method:'POST',body:{message:'Importa '+missing.length+' fotografie personali — identificazione pendente',tree:tree.sha,parents:[current.head]},signal});
   if(!/^[a-f0-9]{40}$/.test(commit.sha||''))throw Error('Registrazione GitHub non verificabile.');
   try{
    const moved=current.exists?await api('/git/refs/heads/'+BRANCH,{method:'PATCH',body:{sha:commit.sha,force:false},signal}):await api('/git/refs',{method:'POST',body:{ref:'refs/heads/'+BRANCH,sha:commit.sha},signal});
    if(moved?.object?.sha!==commit.sha)throw new GitHubError(0);
    return {commitSha:commit.sha,added:[...unique.keys()].filter(id=>!originals.has(id)).length,alreadyPresent:[...unique.keys()].filter(id=>originals.has(id)).length,url:'https://github.com/'+REPOSITORY+'/tree/'+BRANCH+'/'+FOLDER};
   }catch(error){
    if(signal?.aborted)throw error;
    if(![0,409,422].includes(error.status))throw error;
    onStage('Verifica del caricamento e aggiornamento della libreria…');
    current=await snapshot(signal);
    if([...unique.keys()].every(id=>current.metadata.photos.some(p=>p.id===id)))return {commitSha:current.head,added:[...unique.keys()].filter(id=>!originals.has(id)).length,alreadyPresent:[...unique.keys()].filter(id=>originals.has(id)).length,url:'https://github.com/'+REPOSITORY+'/tree/'+BRANCH+'/'+FOLDER};
    await wait(500);
   }
  }
  throw Error('La libreria è stata modificata contemporaneamente. Riprova: le foto già registrate non saranno duplicate.');
 }
 return {repository,snapshot,publishBatch};
}
