import {computeProgress} from './study-progress.mjs';
export function progressTimeline({units,evidence,bankRevision,now=Date.now(),maxPoints=8}){
 const valid=evidence.filter(e=>e.bankRevision===bankRevision&&e.firstAttempt&&Number.isFinite(Date.parse(e.at))&&Date.parse(e.at)<=now).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
 const sessions=new Map();for(const e of valid)sessions.set(e.sessionId,e.at);
 const endpoints=[...sessions].sort((a,b)=>Date.parse(a[1])-Date.parse(b[1]));const limit=Math.max(2,Math.min(30,Math.floor(maxPoints)||8));
 const selected=endpoints.length<=limit?endpoints:Array.from({length:limit},(_,i)=>endpoints[Math.round(i*(endpoints.length-1)/(limit-1))]);
 return selected.map(([sessionId,at])=>{const p=computeProgress({units,evidence:valid,bankRevision,now:Date.parse(at)}).minimum;return {sessionId,at,score:p.score,coverage:p.coveragePercent};});
}
export function mushroomFill(score){const percent=Number.isFinite(score)?Math.max(0,Math.min(100,score)):0;return {percent,stem:percent,cap:percent};}
export function preparationStatus(p){
 if(p.score===null)return {title:'Da valutare',detail:'Inizia lo studio: le prime risposte formeranno la tua stima.',tone:'neutral'};
 if(p.criticalOpen>0)return {title:'Errori critici da ripassare',detail:'Consolida questi argomenti con nuove risposte autonome e distanziate.',tone:'attention'};
 if(p.consolidated)return {title:'Percorso consolidato',detail:'Continua a ripassare e verifica la stabilità con nuove simulazioni.',tone:'positive'};
 if(p.score<40)return {title:'Stai costruendo le basi',detail:'Studia le schede e affronta gli argomenti ancora da verificare.',tone:'neutral'};
 if(p.score<70)return {title:'Preparazione in crescita',detail:'Alterna nuovi argomenti e ripasso delle lacune.',tone:'neutral'};
 return {title:'Consolida la preparazione',detail:'Ripassa a distanza e completa simulazioni autonome per una stima più solida.',tone:'positive'};
}
