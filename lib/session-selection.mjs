export function cardLearning(history){
 const state={};
 for(const h of history){const seen=new Set();for(const a of h.attempts||[]){if(a.round!==0||seen.has(a.caseId)||!a.grade)continue;seen.add(a.caseId);const old=state[a.caseId]||{perfect:0,learned:false,lastSession:null};if(old.lastSession===h.id)continue;const perfect=a.grade.passed&&!a.answer?.assisted?old.perfect+1:0;state[a.caseId]={perfect,learned:perfect>=2,lastSession:h.id,lastCorrect:!!a.grade.passed};}}
 return state;
}
export function selectPhotoSession(bank,history,count=15,rng=Math.random){
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(rng()*(i+1))));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const eligible=bank.filter(c=>c.questionKind!=='profile'&&c.photos?.length),learning=cardLearning(history);
 const last=history.filter(h=>h.completedAt).at(-1),recent=new Set((last?.attempts||[]).filter(a=>a.round===0&&a.grade?.passed).map(a=>a.caseId));
 const pools={errors:[],unseen:[],review:[],recent:[]};
 for(const c of eligible){const s=learning[c.id];pools[!s?'unseen':!s.lastCorrect?'errors':recent.has(c.id)?'recent':'review'].push(c.id);}
 for(const k of Object.keys(pools))pools[k]=shuffle(pools[k]);
 const selected=[];const take=(k,n)=>selected.push(...pools[k].splice(0,Math.max(0,n)));
 take('errors',Math.round(count*.5));take('review',Math.floor(count*.3));take('unseen',count-selected.length);
 for(const k of ['errors','review','unseen','recent'])take(k,count-selected.length);
 return shuffle(selected);
}
