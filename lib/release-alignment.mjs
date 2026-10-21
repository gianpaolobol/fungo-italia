export const RELEASE_URL='https://gianpaolobol.github.io/fungo-italia/release.json';
const sha=/^[a-f0-9]{40}$/,hash=/^[a-f0-9]{64}$/,uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const matches=(pattern,value)=>typeof value==='string'&&pattern.test(value);
const version=value=>typeof value==='string'&&/^\d+\.\d+(?:\.\d+)?$/.test(value);
export function validateRelease(value){
 if(!value||Array.isArray(value)||typeof value!=='object'||value.schemaVersion!==1||
 !matches(sha,value.sourceCommit)||!version(value.version)||!matches(/^[1-9]\d*$/,value.buildNumber)||
 !matches(hash,value.iconSha256)||!matches(hash,value.webContentHash)||!matches(uuid,value.appleBuildId)||
 value.processingState!=='VALID'||!['IN_BETA_TESTING','READY_FOR_BETA_TESTING'].includes(value.internalBuildState)||
 value.testFlightOnly!==true||typeof value.diagnosticOnly!=='boolean')return null;
 return value;
}
export function compareRelease(local,value){
 const release=validateRelease(value);
 if(!release||!local||local.dirty!==false||!matches(sha,local.sourceCommit)||!version(local.version))return {status:'unknown',release:null};
 if(local.sourceCommit===release.sourceCommit&&local.version!==release.version)return {status:'unknown',release:null};
 return {status:local.sourceCommit===release.sourceCommit?'aligned':'update-available',release};
}
export async function checkRelease(local,{fetcher=globalThis.fetch,timeoutMs=7000}={}){
 const controller=new AbortController();let timer;
 try{
  const request=(async()=>{
   const response=await fetcher(RELEASE_URL,{cache:'no-store',signal:controller.signal});
   if(!response.ok)throw Error('Release unavailable');
   return compareRelease(local,await response.json());
  })();
  return await Promise.race([request,new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('Release timeout'));},timeoutMs);})]);
 }catch{return {status:'unknown',release:null};}
 finally{clearTimeout(timer);}
}
// Called only after the user chooses to update. The caller owns any reload.
export async function prepareWebUpdate(serviceWorker,timeoutMs=12000){
 let timer,finished=false,removeListener=()=>{};
 try{
  await Promise.race([(async()=>{
   const registration=await serviceWorker.getRegistration();
   if(finished||!registration)throw Error('Offline support unavailable');
   await registration.update();
   if(finished)throw Error('Update timeout');
   const worker=registration.waiting??registration.installing??registration.active;
   if(!worker)throw Error('No active offline version');
   if(worker.state==='activated')return;
   await new Promise((resolve,reject)=>{
    const changed=()=>{if(worker.state==='activated')resolve();else if(worker.state==='redundant')reject(Error('Update unavailable'));};
    worker.addEventListener('statechange',changed);
    removeListener=()=>worker.removeEventListener('statechange',changed);
    worker.postMessage({type:'ACTIVATE_UPDATE'});changed();
   });
  })(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Update timeout')),timeoutMs);})]);
 }finally{finished=true;clearTimeout(timer);removeListener();}
}
