import {startTraining,submitTraining,advanceTraining,bankSignature,detailQuestions,selectCases,restoreTraining} from '../web/public/exam-core.js';
export function startStudyExam(bank,{mode='training',taxonIds,count=15}={}){
 const eligible=bank.filter(c=>mode!=='simulation'||c.questionKind!=='profile');
 let state={...startTraining(eligible,Math.random,count),signature:bankSignature(bank)};
 if(taxonIds){const ids=[...new Set(taxonIds)].filter(id=>eligible.some(c=>c.id===id));if(ids.length!==count)throw Error('Servono '+count+' schede documentate per iniziare la sessione.');state={...state,ids,queue:[...ids]};}
 return {...state,mode};
}
export function submitStudyAnswer(state,answer,bank){const simulation=state.mode==='simulation';const next=submitTraining(state,simulation?{...answer,assisted:false}:answer,bank);if(!simulation)return next;if(next===state)return state;const advanced=advanceTraining({...next,pending:[]});return {...advanced,pending:[],queue:next.queue.slice(1),phase:next.queue.length===1?'complete':'initial',round:0,completedAt:next.queue.length===1?new Date().toISOString():null};}
export function historyEvidence(history,{bankRevision,compatibleRevisions=[],bank=[]}={}){const currentCases=new Map(bank.map(c=>[c.id,c]));return history.filter(h=>h&&Array.isArray(h.attempts)).flatMap(h=>h.attempts.filter(r=>r&&typeof r.caseId==='string'&&r.grade&&typeof r.grade.name==='boolean'&&typeof r.grade.category==='boolean'&&Array.isArray(r.grade.details)).flatMap(r=>{const base={taxonId:r.caseId,bankRevision:bankRevision&&compatibleRevisions.includes(h.signature)&&(!bank.length||currentCases.has(r.caseId)&&!!r.grade.profile===(currentCases.get(r.caseId).questionKind==='profile'))?bankRevision:h.signature,sessionId:h.id,at:r.at,firstAttempt:r.round===0,correct:false,hinted:r.answer?.assisted===true,mode:h.mode||'training',critical:false,sessionComplete:!!h.completedAt};if(r.grade.profile)return r.grade.details.map(d=>({...base,unitId:r.caseId+':'+d.id,correct:d.correct,critical:d.id==='edibility'&&r.grade.danger===true||d.id==='preparation'&&!d.correct}));return [{...base,unitId:r.caseId+':name',correct:r.grade.name},{...base,unitId:r.caseId+':category',correct:r.grade.category,critical:r.grade.danger===true},...(r.grade.details||[]).map(d=>({...base,unitId:r.caseId+':'+d.id,correct:d.correct,critical:d.id==='preparation'&&!d.correct}))];}));}
export function examUnits(bank,extraTaxa=[]){const rows=bank.flatMap(c=>c.questionKind==='profile'?(c.questions||[]).map(q=>({id:c.id+':'+q.id,taxonId:c.id,scope:c.scope||'minimum',dimension:q.id,applicable:true})): [{id:c.id+':name',taxonId:c.id,scope:'minimum',dimension:'name',applicable:true},{id:c.id+':category',taxonId:c.id,scope:'minimum',dimension:'category',applicable:true},...detailQuestions(c,bank).map(q=>({id:c.id+':'+q.id,taxonId:c.id,scope:'minimum',dimension:q.id,applicable:true}))]);const ids=new Set(bank.map(c=>c.id));for(const t of extraTaxa){if(ids.has(t.id))continue;rows.push({id:t.id+':name',taxonId:t.id,scope:t.curriculum?.level?(t.curriculum.level==='minimum'?'minimum':'extended'):t.kind==='teaching-group'?'extended':'minimum',dimension:'name',applicable:true,assessable:false});}return rows;}
export function restoreStudyExam(raw,bank,legacyBank=[],{count=15,compatibleRevisions=[]}={}){
 const current=restoreTraining(raw,bank,count);if(current)return current;
 const old=restoreTraining(raw,legacyBank,count);if(old)return {...old,signature:bankSignature(bank)};
 try{
  const saved=JSON.parse(raw);
  // Old photo checkpoints may resume only when every selected case remains photographic.
  if(!compatibleRevisions.includes(saved.signature)||!Array.isArray(saved.ids)||!saved.ids.every(id=>legacyBank.some(c=>c.id===id&&c.questionKind!=='profile')))return null;
  return restoreTraining(JSON.stringify({...saved,signature:bankSignature(bank)}),bank,count);
 }catch{return null;}
}
export {bankSignature};
