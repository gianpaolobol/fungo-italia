export const studyKey='fungo-italia:study-dashboard:v1';
export const legacyTrainingKey='fungo-italia:photo-training:v2';
export function createStudyStore(storage){
 let state,loading,queue=Promise.resolve();const listeners=new Set();
 const copy=v=>JSON.parse(JSON.stringify(v));
 async function read(){
  if(state)return copy(state);
  const raw=await storage.getItem(studyKey);
  if(raw){const v=JSON.parse(raw);if(v?.schemaVersion!==1||typeof v.profile?.name!=='string'||!(v.profile.startedAt===null||typeof v.profile.startedAt==='string')||!(v.baseSessionId===null||typeof v.baseSessionId==='string')||!Array.isArray(v.exam?.history))throw Error('Archivio studio non leggibile. I dati sono conservati.');state=v;}
  else {const old=await storage.getItem(legacyTrainingKey),exam=old?JSON.parse(old):{session:null,history:[]};if(!Array.isArray(exam?.history))throw Error('Storico precedente non leggibile');state={schemaVersion:1,profile:{name:'',startedAt:null},baseSessionId:null,baseExam:null,exam};}
  return copy(state);
 }
 async function load(){if(state)return copy(state);if(!loading)loading=read().finally(()=>{loading=undefined;});return copy(await loading);}
 function update(fn){const next=queue.catch(()=>{}).then(async()=>{const current=await load(),value=fn(current);await storage.setItem(studyKey,JSON.stringify(value));state=value;for(const listener of listeners)listener(copy(value));return copy(value);});queue=next;return next;}
 return {load,subscribe(fn){listeners.add(fn);return()=>{listeners.delete(fn);};},setName(name){return update(s=>({...s,profile:{...s.profile,name:[...String(name).trim()].slice(0,60).join('')}}));},start(now=new Date().toISOString()){return update(s=>{if(!Number.isFinite(Date.parse(now)))throw Error('Data non valida');return {...s,profile:{...s.profile,startedAt:s.profile.startedAt||now}};});},saveExam(exam,{limited=false}={}){return update(s=>{const id=exam.session?.id;if(!id||!Array.isArray(exam.session?.attempts)||!Array.isArray(exam.history))throw Error('Sessione non valida');if(limited&&s.baseSessionId&&s.baseSessionId!==id)throw Error('La sessione inclusa nella Base è già stata utilizzata.');const claimed=limited&&exam.session.attempts.length>0;return {...s,baseSessionId:claimed?(s.baseSessionId||id):s.baseSessionId,baseExam:limited?copy(exam):(s.baseExam??null),exam:copy(exam)};});}};
}
