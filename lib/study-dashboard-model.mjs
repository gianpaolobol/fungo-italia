export function dashboardModel({profile,progress}){const value=Number.isFinite(progress.score)?Math.max(0,Math.min(100,progress.score)):null;return {greeting:profile.name?'Ciao, '+profile.name:'Ciao',cta:profile.startedAt?'Riprendi lo studio':'Inizia lo studio',stage:value===null?0:Math.min(4,Math.floor(value/20)),scoreLabel:value===null?'Preparazione da valutare':(progress.confidence==='initial'?'Stima iniziale · ':'Preparazione stimata · ')+value+'%'};}
export function visibleSessions(history,expanded=false){return (expanded?history:history.slice(-5)).slice().reverse();}

export function sessionTrend(history,signature,mode='training',count=15){
 const candidates=history.filter(h=>h.signature===signature&&(h.mode||'training')===mode&&Number.isFinite(Date.parse(h.completedAt))&&h.total===count&&Number.isInteger(h.correct)&&h.correct>=0&&h.correct<=h.total&&(h.assisted||0)===0);
 const shape=candidates.at(-1),eligible=candidates.filter(h=>(h.namesTotal??h.total)===(shape?.namesTotal??shape?.total)&&(h.theoryTotal||0)===(shape?.theoryTotal||0));
 const latest=eligible.at(-1),previous=eligible.at(-2);
 return {latest:latest?.correct??null,previous:previous?.correct??null,best:eligible.length?Math.max(...eligible.map(h=>h.correct)):null,total:count,delta:latest&&previous?latest.correct-previous.correct:null};
}
export function priorityGaps(gaps,taxa){const names=new Map(taxa.map(t=>[t.id,t.scientificName||t.name||t.id]));return gaps.slice().sort((a,b)=>Number(b.critical)-Number(a.critical)||b.errors-a.errors||Number(a.unseen)-Number(b.unseen)).slice(0,3).map(g=>({...g,name:names.get(g.taxonId)||g.taxonId}));}
