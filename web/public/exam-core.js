// Deterministic grading is deliberately limited to explicit scientific names and food categories.
export const foodLabels={free:'libera',conditional:'condizionata',discouraged:'sconsigliato','no-food-value':'privo di valore',inedible:'non commestibile',toxic:'tossico',deadly:'tossico mortale'};
export const normalizeName=value=>String(value||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
const documentedCompoundSynonyms={
 'Collybia phyllophila':['Clitocybe cerussata','Clitocybe phyllophila'],
 'Cortinarius rubellus':['Cortinarius orellanoides','Cortinarius speciosissimus'],
 'Cortinarius caperatus':['Rozites caperatus'],
 'Lepiota subincarnata':['Lepiota josserandii'],
 'Rubroboletus satanas':['Boletus satanas'],
 'Suillellus luridus':['Boletus luridus']
};
const binomial=value=>typeof value==='string'&&/^[A-Z][a-z]+ [a-z][a-z-]+$/.test(value);
const viewOrder={lateral:0,top:1,underside:2};
function examPhotos(t,names){
 const matching=(t.referenceImages||[]).filter(p=>p.src?.startsWith('images/')&&names.some(n=>normalizeName(n)===normalizeName(p.subjectTaxon)));
 const unique=[];
 for(const photo of matching)if(!unique.some(old=>old.src===photo.src))unique.push(photo);
 if(unique.length<3)return [];
 return unique.sort((a,b)=>(viewOrder[a.view]??9)-(viewOrder[b.view]??9)||a.src.localeCompare(b.src)).slice(0,3);
}
export function buildExamBank(taxa,profiles={records:[]}){
 const genera=new Set([...taxa.flatMap(t=>[t.scientificName,...(t.currentAcceptedNames||[])]).map(n=>n.split(' ')[0]),'Agaricus','Agrocybe','Amanita','Boletus','Clitocybe','Collybia','Cortinarius','Rozites','Lyophyllum','Albatrellus','Polyporus']);
 return taxa.flatMap(t=>{
  const food=t.studyProfile?.edibility;
  if(t.rank!=='species'||!binomial(t.scientificName)||!foodLabels[food?.category])return [];
  const names=[...new Set([t.scientificName,...(t.aliases||[]),...(t.currentAcceptedNames||[]),...((t.aliases||[]).some(a=>a.includes('('))?(documentedCompoundSynonyms[t.scientificName]||[]):[])].filter(n=>binomial(n)&&genera.has(n.split(' ')[0])&&!(t.commonNames||[]).includes(n)))];
  const photos=examPhotos(t,names);
  const foodEvidence=profiles.records?.find(r=>r.scientificName===t.scientificName)?.evidence?.some(e=>e.sourceId==='S2-guida-ragionata-commestibilita-2021'&&e.fields?.includes('edibility'));
  if(!photos.length||(!foodEvidence&&!t.sources?.some(s=>s.fields?.includes('edibility'))))return [];
  const detailKind=food.category==='conditional'?'preparation':['toxic','deadly'].includes(food.category)?'toxicology':null;
  if(detailKind==='preparation'&&!food.precautions?.length)return [];
  if(detailKind==='toxicology'&&(!food.syndrome?.label||!food.syndrome?.latency||!food.syndrome?.severity||!t.sources.some(s=>s.fields?.includes('syndrome'))))return [];
  return [{id:t.id,name:t.scientificName,acceptedNames:names,photos:photos.map(p=>({src:p.src,view:p.view,credit:p.credit||'',subjectTaxon:p.subjectTaxon,sourceUrl:p.sourceUrl,licenseUrl:p.licenseUrl})),category:food.category,detailKind,preparation:food.precautions||[],syndrome:food.syndrome||null,characters:t.characters||[],differentiatingCharacter:t.differentiatingCharacter||'',diagnosticNote:t.diagnosticNote||'',sources:t.sources.filter(s=>s.fields?.some(f=>['edibility','precautions','syndrome','characters'].includes(f)))}];
 });
}
function shuffle(values,rng){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(rng()*(i+1))));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function selectCases(bank,count=15,rng=Math.random){
 if(new Set(bank.map(c=>c.id)).size!==bank.length||bank.length<count)throw Error('Servono almeno '+count+' casi distinti documentati.');
 const pool=shuffle(bank,rng),selected=[];
 if(count>=15)for(const [category,n] of [['conditional',3],['toxic',3],['deadly',2],['free',3]])selected.push(...pool.filter(c=>c.category===category).slice(0,n));
 selected.push(...pool.filter(c=>!selected.some(s=>s.id===c.id)).slice(0,count-selected.length));
 return shuffle(selected,rng);
}
export function gradeAnswer(c,answer={}){
 const category=answer.category===c.category;
 const edible=['free','conditional'].includes(answer.category);
 return {name:c.acceptedNames.some(n=>normalizeName(n)===normalizeName(answer.name)),category,detail:null,danger:edible&&(!['free','conditional'].includes(c.category)||(c.category==='conditional'&&answer.category==='free'))};
}
export function restoreSession(raw,bank){
 try{
  const s=JSON.parse(raw),ids=new Set(bank.map(c=>c.id));
  if(s?.version!==1||!['exam','training'].includes(s.mode)||!Array.isArray(s.ids)||s.ids.length!==15||new Set(s.ids).size!==15||!s.ids.every(id=>ids.has(id))||!Number.isInteger(s.index)||s.index<0||s.index>=15||typeof s.complete!=='boolean'||!Array.isArray(s.answers)||s.answers.length>15)return null;
  if(!s.answers.every(a=>a===null||(a&&typeof a.name==='string'&&a.name.length<=200&&typeof a.detail==='string'&&a.detail.length<=5000&&(typeof a.category==='string'&&(a.category===''||Object.hasOwn(foodLabels,a.category)))&&(a.revealed===undefined||typeof a.revealed==='boolean')&&[undefined,null,'correct','partial','wrong'].includes(a.selfRating))))return null;
  if(Array.from({length:s.index},(_,i)=>s.answers[i]).some(a=>!a||(s.mode==='training'&&a.revealed!==true)))return null;
  if(s.complete&&(!s.answers.length||s.answers.length!==15||s.answers.some(a=>!a)))return null;
  return s;
 }catch{return null;}
}

export const trainingKey='fungo-italia:photo-training:v2';
export const trainingHistoryKey='fungo-italia:photo-training-history:v2';
export const foodColors={free:'#9ecb91',conditional:'#d8ebc2',discouraged:'#ffe680','no-food-value':'#ffffff',inedible:'#eeeeee',toxic:'#f49a45',deadly:'#eb5757'};
export function suggestNames(bank,value){
 const q=normalizeName(value);if(q.length<3)return [];
 return [...new Set(bank.flatMap(c=>c.acceptedNames||[c.scientificName]).filter(n=>typeof n==='string'&&normalizeName(n).startsWith(q)))].sort((a,b)=>a.localeCompare(b,'it'));
}
function orderedOptions(values,seed){
 const options=[...new Set(values.filter(Boolean))].map((label,i)=>({id:String(i),label}));
 let n=0;for(const ch of seed)n=(Math.imul(n,31)+ch.charCodeAt(0))>>>0;
 return options.sort((a,b)=>((Math.imul(Number(a.id)+1,2654435761)^n)>>>0)-((Math.imul(Number(b.id)+1,2654435761)^n)>>>0));
}
function syndromeFamily(label){return /gastrointestinale|morganica/i.test(label)?'gastrointestinal':normalizeName(label);}
function latencyClass(value){return /^(?:generalmente )?breve\b/i.test(value)?'short':/^lunga\b/i.test(value)?'long':'variable';}
function distinctDistractor(c,b,field){
 if(!b.syndrome||syndromeFamily(c.syndrome.label)===syndromeFamily(b.syndrome.label))return false;
 if(field==='label')return true;
 if(field==='latency')return ['short','long'].includes(latencyClass(c.syndrome.latency))&&['short','long'].includes(latencyClass(b.syndrome.latency))&&latencyClass(c.syndrome.latency)!==latencyClass(b.syndrome.latency);
 // Generic symptoms can overlap. Only a characteristic, explicitly named profile
 // from a different syndrome family can be an alternative to the documented profile.
 return /amatossin|ibotenic|muscimol|orellanin|acromel|poliporic|giromitrin|psilocibin|norleucin|colinergic/i.test(b.syndrome.severity);
}
export function detailQuestions(c,bank){
 if(c.questionKind==='profile')return c.questions||[];
 if(c.detailKind==='preparation'){
  const correct=[...new Set(c.preparation)],options=orderedOptions([...correct,'Nessuna delle precauzioni elencate è necessaria.'],c.id);
  return [{id:'preparation',title:'Preparazione: seleziona tutte le precauzioni richieste dalla scheda',multiple:true,options,correct:options.filter(o=>correct.includes(o.label)).map(o=>o.id)}];
 }
 if(c.detailKind!=='toxicology'||!c.syndrome)return [];
 return [['label','Sindrome'],['latency','Latenza'],['severity','Manifestazioni e gravità']].map(([field,title])=>{
  const value=c.syndrome[field];
  const alternatives=bank.filter(b=>distinctDistractor(c,b,field)).map(b=>b.syndrome[field]);
  // Ask for the documented wording, not a judgment that alternative clinical wording is false.
  const options=orderedOptions([value,...[...new Set(alternatives)].filter(v=>v&&v!==value).slice(0,3),'Non so / non risposto'],c.id+field);
  return {id:field,title:title+' — secondo la scheda dell’atlante',multiple:false,options,correct:options.filter(o=>o.label===value).map(o=>o.id)};
 });
}
export function gradeResponse(c,answer={},bank=[]){
 const base=c.questionKind==='profile'?{name:true,category:true,detail:null,danger:false,profile:true}:gradeAnswer(c,answer),details=detailQuestions(c,bank).map(q=>{
  const selected=answer.choices?.[q.id]||[];
  return {id:q.id,title:q.title,correct:Array.isArray(selected)&&new Set(selected).size===selected.length&&selected.length===q.correct.length&&q.correct.every(id=>selected.includes(id))};
 });
 return {...base,detail:details.every(d=>d.correct),details,passed:base.name&&base.category&&details.every(d=>d.correct)};
}
export function bankSignature(bank){let h=2166136261;for(const ch of 'questions-v2.1:'+JSON.stringify(bank))h=Math.imul(h^ch.charCodeAt(0),16777619);return String(h>>>0);}
export function startTraining(bank,rng=Math.random,count=15){
 if(!Number.isInteger(count)||count<1||count>15)throw Error('Numero di casi non valido');
 const ids=selectCases(bank,count,rng).map(c=>c.id);
 return {version:2,id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),startedAt:new Date().toISOString(),signature:bankSignature(bank),ids,queue:[...ids],pending:[],phase:'initial',round:0,first:[],attempts:[],feedback:null,draft:{name:'',category:'',choices:{},assisted:false},completedAt:null};
}
export function submitTraining(state,answer,bank){
 if(state.feedback||state.phase==='complete')return state;
 const c=bank.find(c=>c.id===state.queue[0]);if(!c)throw Error('Caso non disponibile');
 const safe={name:String(answer.name||'').slice(0,200),category:String(answer.category||''),choices:JSON.parse(JSON.stringify(answer.choices||{})),assisted:answer.assisted===true};
 const result={caseId:c.id,caseName:c.name,answer:safe,grade:gradeResponse(c,safe,bank),at:new Date().toISOString(),round:state.round};
 return {...state,attempts:[...state.attempts,result],first:state.phase==='initial'?[...state.first,result]:state.first,feedback:result};
}
export function advanceTraining(state){
 if(!state.feedback)return state;
 let queue=state.queue.slice(1),pending=state.feedback.grade.passed?state.pending:[...state.pending,state.queue[0]],phase=state.phase,round=state.round;
 if(!queue.length){queue=pending;pending=[];if(queue.length){phase='retry';round++;}else phase='complete';}
 return {...state,queue,pending,phase,round,feedback:null,draft:{name:'',category:'',choices:{},assisted:false},completedAt:phase==='complete'?new Date().toISOString():null};
}
export function trainingSummary(s){
 const rows=s.first,photos=rows.filter(r=>!r.grade.profile),theory=rows.filter(r=>r.grade.profile);
 return {mode:s.mode||'training',id:s.id,startedAt:s.startedAt,completedAt:s.completedAt,signature:s.signature,total:rows.length,correct:rows.filter(r=>r.grade.passed).length,names:photos.filter(r=>r.grade.name).length,namesTotal:photos.length,categories:photos.filter(r=>r.grade.category).length,categoriesTotal:photos.length,theoryTotal:theory.length,theoryCorrect:theory.filter(r=>r.grade.passed).length,details:rows.filter(r=>r.grade.detail).length,preparationTotal:rows.filter(r=>r.grade.details.some(d=>d.id==='preparation')).length,preparationCorrect:rows.filter(r=>r.grade.details.some(d=>d.id==='preparation')&&r.grade.detail).length,toxicologyTotal:rows.filter(r=>r.grade.details.some(d=>d.id==='label')).length,toxicologyCorrect:rows.filter(r=>r.grade.details.some(d=>d.id==='label')&&r.grade.detail).length,danger:rows.filter(r=>r.grade.danger).length,assisted:rows.filter(r=>r.answer.assisted).length,retries:s.attempts.length-rows.length,errors:rows.filter(r=>!r.grade.passed).map(r=>({id:r.caseId,name:r.caseName,nameError:!r.grade.profile&&!r.grade.name,categoryError:!r.grade.profile&&!r.grade.category,detailErrors:r.grade.details.filter(d=>!d.correct).map(d=>d.title),danger:r.grade.danger})),attempts:s.attempts};
}
export function restoreTraining(raw,bank,count=15){
 if(!Number.isInteger(count)||count<1||count>15)return null;
 try{
  const s=JSON.parse(raw),ids=new Set(bank.map(c=>c.id));
  if(s?.version!==2||s.signature!==bankSignature(bank)||typeof s.id!=='string'||typeof s.startedAt!=='string'||!['initial','retry','complete'].includes(s.phase)||!Number.isInteger(s.round)||s.round<0||!Array.isArray(s.ids)||s.ids.length!==count||new Set(s.ids).size!==count||!s.ids.every(id=>ids.has(id)))return null;
  for(const key of ['queue','pending'])if(!Array.isArray(s[key])||new Set(s[key]).size!==s[key].length||!s[key].every(id=>s.ids.includes(id)))return null;
  if(s.queue.some(id=>s.pending.includes(id))||s.phase==='complete'&&(s.queue.length||s.pending.length)||s.phase!=='complete'&&!s.queue.length)return null;
  if(!Array.isArray(s.first)||s.first.length>count||!Array.isArray(s.attempts)||s.attempts.length>10000||!s.first.every(r=>s.ids.includes(r.caseId))||new Set(s.first.map(r=>r.caseId)).size!==s.first.length)return null;
  const validAnswer=a=>a&&typeof a.name==='string'&&a.name.length<=200&&typeof a.category==='string'&&(a.category===''||Object.hasOwn(foodLabels,a.category))&&a.choices&&typeof a.choices==='object'&&!Array.isArray(a.choices)&&Object.values(a.choices).every(v=>Array.isArray(v)&&v.length<=100&&v.every(x=>typeof x==='string'));
  const validRow=r=>r&&s.ids.includes(r.caseId)&&validAnswer(r.answer)&&r.grade&&typeof r.grade.passed==='boolean'&&Array.isArray(r.grade.details);
  if(!validAnswer(s.draft)||!s.attempts.every(validRow)||!s.first.every(validRow)||s.feedback&&(!validRow(s.feedback)||s.feedback.caseId!==s.queue[0]))return null;
  if(s.phase!=='initial'&&s.first.length!==count)return null;
  return s;
 }catch{return null;}
}
