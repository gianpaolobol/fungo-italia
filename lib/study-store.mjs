export const studyKey='fungo-italia:study-dashboard:v1';
export const demoStudyKey=studyKey+':agaricus-demo';
export const legacyTrainingKey='fungo-italia:photo-training:v2';
export function createStudyStore(storage,{demo=false}={}){
 const key=demo?demoStudyKey:studyKey,legacyKey=legacyTrainingKey+(demo?':agaricus-demo':'');
 let state,loading,queue=Promise.resolve();const listeners=new Set();
 const copy=v=>JSON.parse(JSON.stringify(v));
 async function read(){
  if(state)return copy(state);
  const raw=await storage.getItem(key);
  if(raw){const v=JSON.parse(raw);if(v?.schemaVersion!==1||typeof v.profile?.name!=='string'||!(v.profile.startedAt===null||typeof v.profile.startedAt==='string')||!Array.isArray(v.exam?.history))throw Error('Archivio studio non leggibile. I dati sono conservati.');state=v;}
  else {const old=await storage.getItem(legacyKey),exam=old?JSON.parse(old):{session:null,history:[]};if(!Array.isArray(exam?.history))throw Error('Storico precedente non leggibile');state={schemaVersion:1,profile:{name:'',startedAt:null},exam};}
  return copy(state);
 }
 async function snapshot(){if(state)return copy(state);if(!loading)loading=read().finally(()=>{loading=undefined;});return copy(await loading);}
 function update(fn){const next=queue.catch(()=>{}).then(async()=>{const current=await snapshot(),value=fn(current);await storage.setItem(key,JSON.stringify(value));state=value;for(const listener of listeners)listener(copy(value));return copy(value);});queue=next;return next;}
 return {load:()=>queue.catch(()=>{}).then(snapshot),subscribe(fn){listeners.add(fn);return()=>{listeners.delete(fn);};},setName(name){return update(s=>({...s,profile:{...s.profile,name:[...String(name).trim()].slice(0,60).join('')}}));},start(now=new Date().toISOString()){return update(s=>{if(!Number.isFinite(Date.parse(now)))throw Error('Data non valida');return {...s,profile:{...s.profile,startedAt:s.profile.startedAt||now}};});},saveExam(exam){return update(s=>{if(!exam.session?.id||!Array.isArray(exam.session?.attempts)||!Array.isArray(exam.history))throw Error('Sessione non valida');return {...s,exam:copy(exam)};});}};
}
// Each exam screen must hydrate its local history before it can submit a replacement snapshot.
export function createStudyExamWriter(store){
 let hydrated=false;
 const requireHydration=()=>{if(!hydrated)throw Error('Carica lo storico prima di modificare la sessione.');};
 return {
  async hydrate(){hydrated=false;const value=await store.load();hydrated=true;return value;},
  async start(){requireHydration();return store.start();},
  async saveExam(exam){requireHydration();return store.saveExam(exam);}
 };
}
