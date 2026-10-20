export const algorithmVersion=1;
const DAY=86400000;
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
function spaced(rows){const unique=[...new Map(rows.map(r=>[r.sessionId,r])).values()].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));return unique.length>1&&Date.parse(unique.at(-1).at)-Date.parse(unique[0].at)>=2*DAY;}
export function computeProgress({units,evidence,bankRevision,now=Date.now()}){
 const valid=evidence.filter(r=>r.bankRevision===bankRevision&&r.firstAttempt===true&&Number.isFinite(Date.parse(r.at))&&Date.parse(r.at)<=now).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
 function scope(eligible){
  const ids=new Set(eligible.map(u=>u.id));const rows=valid.filter(r=>ids.has(r.unitId));
  let correct=0,covered=0,retained=0,criticalOpen=0;const gaps=[];
  for(const u of eligible){const rr=[...new Map(rows.filter(r=>r.unitId===u.id).map(r=>[r.sessionId,r])).values()];if(rr.length)covered++;
   const recent=rr.slice(-5);correct+=mean(recent.map(r=>r.correct?100:0));
   const lastError=rr.findLastIndex(r=>!r.correct);if(spaced(rr.slice(lastError+1).filter(r=>r.correct&&!r.hinted)))retained++;
   const critical=rr.findLastIndex(r=>r.critical&&!r.correct);const open=critical>=0&&!spaced(rr.slice(Math.max(critical,lastError)+1).filter(r=>r.correct&&!r.hinted));if(open)criticalOpen++;
   if(!rr.length||recent.some(r=>!r.correct)||open)gaps.push({unitId:u.id,taxonId:u.taxonId,dimension:u.dimension,critical:open,errors:recent.filter(r=>!r.correct).length,unseen:!rr.length});
  }
  const A=eligible.length?correct/eligible.length:0,C=eligible.length?100*covered/eligible.length:0,R=eligible.length?100*retained/eligible.length:0;
  const simulations=new Map();for(const r of rows.filter(r=>r.mode==='simulation'&&!r.hinted&&r.sessionComplete)){const old=simulations.get(r.sessionId)||[];old.push(r);simulations.set(r.sessionId,old);}
  const exams=[...simulations.values()].slice(-3).map(rr=>mean(rr.map(r=>r.correct?100:0))),E=mean(exams);
  const sessions=new Set(rows.map(r=>r.sessionId)).size;
  const score=rows.length?Math.round(.4*A+.25*C+.2*R+.15*E):null;
  return {score,A,C,R,E,confidence:sessions>=3&&covered>=30?'supported':'initial',criticalOpen,covered,total:eligible.length,gaps,consolidated:score!==null&&score>=85&&C>=80&&exams.length===3&&exams.every(x=>x>=80)&&criticalOpen===0,algorithmVersion};
 }
 return {minimum:scope(units.filter(u=>u.applicable&&u.scope==='minimum')),extended:scope(units.filter(u=>u.applicable))};
}
