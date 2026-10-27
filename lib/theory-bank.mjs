import {buildCurriculumBank} from './study-curriculum-bank.mjs';
import {detailQuestions,foodLabels} from '../web/public/exam-core.js';
export const theoryTopics={legislation:'Legislazione',profession:'Figura del micologo',commerce:'Commercializzazione',toxicology:'Tossicità e sindromi',microscopy:'Microscopia',mycology:'Micologia',curriculum:'Obiettivi formativi'};
export function buildTheoryBank(catalog,groups,photoBank,foundations=[],modules=[]){
 const cases=buildCurriculumBank(catalog,groups,photoBank);
 const result=[];
 const add=(taxonId,name,q,topic)=>result.push({id:'theory:'+taxonId+':'+q.id,taxonId,name,topic,questionKind:'profile',scope:'minimum',category:'',detailKind:'curriculum',acceptedNames:[],photos:[],preparation:[],syndrome:null,questions:[q]});
 for(const c of cases)for(const q of c.questions)add(c.id,c.name,q,['edibility','preparation','syndrome'].includes(q.id)?'toxicology':'mycology');
 for(const c of photoBank){
  add(c.id,c.name,{id:'edibility',title:'Quale giudizio alimentare è riportato per '+c.name+'?',multiple:false,options:Object.entries(foodLabels).map(([id,label])=>({id,label})),correct:[c.category]},'toxicology');
  for(const q of detailQuestions(c,photoBank))add(c.id,c.name,q,'toxicology');
 }
 for(const q of foundations)add(q.id,theoryTopics[q.topic],q,q.topic);
 const allModules=modules.filter(m=>m.curriculumObjective);
 for(const m of allModules){const other=allModules.filter(x=>x.id!==m.id&&x.curriculumObjective!==m.curriculumObjective).slice(0,3);add(m.id,m.scientificName,{id:'objective',title:'Quale obiettivo '+(m.curriculum.level==='desirable'?'auspicabile':'di approfondimento')+' riguarda '+m.scientificName+'?',multiple:false,options:[{id:'correct',label:m.curriculumObjective},...other.map(x=>({id:x.id,label:x.curriculumObjective}))],correct:['correct'],provenance:{sourceIds:[m.curriculum.documentId],sourcePages:[m.curriculum.sourcePage]}},'curriculum');result.at(-1).scope='extended';}
 return result;
}
export function selectTheorySession(bank,history,count=15,rng=Math.random,topic='all'){
 const pool=bank.filter(c=>topic==='all'||c.topic===topic),seen=new Map();
 for(const h of history)for(const a of h.attempts||[])if(a.round===0)seen.set(a.caseId,a.grade?.passed===true);
 const shuffled=pool.map(c=>({id:c.id,tie:rng(),priority:seen.get(c.id)===false?0:!seen.has(c.id)?1:2})).sort((a,b)=>a.priority-b.priority||a.tie-b.tie);
 // Mixed sessions always include each available subject before filling adaptive slots.
 const ids=[];if(topic==='all')for(const t of Object.keys(theoryTopics)){const c=shuffled.find(c=>pool.find(p=>p.id===c.id)?.topic===t);if(c&&ids.length<count)ids.push(c.id);}
 for(const c of shuffled)if(ids.length<count&&!ids.includes(c.id))ids.push(c.id);
 for(let i=ids.length-1;i>0;i--){const j=Math.min(i,Math.floor(rng()*(i+1)));[ids[i],ids[j]]=[ids[j],ids[i]];}
 return ids;
}
