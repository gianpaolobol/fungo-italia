import {useEffect,useMemo,useState} from 'react';import {AppState} from 'react-native';
import {studyStore} from '../lib/studyRuntime';import type {StudyState} from '../lib/study-store.mjs';
import {sessionTrend,priorityGaps} from '../lib/study-dashboard-model.mjs';
import {progressTimeline} from '../lib/study-timeline.mjs';
import {computeProgress} from '../lib/study-progress.mjs';import {selectTraining} from '../lib/study-scheduler.mjs';
import {examUnits,historyEvidence,bankSignature} from '../lib/study-exam.mjs';
import {studyBank as bank,studyBankRevision,compatibleStudyRevisions,studyUnits as units,studyBankCoverage} from '../lib/studyBank';import catalog from '../src/data/catalog.json';import groups from '../src/data/groups.json';

export default function useStudy(){const [state,setState]=useState<StudyState|null>(null),[storageError,setError]=useState(''),[now,setNow]=useState(Date.now());
 useEffect(()=>{let live=true;void studyStore.load().then(s=>{if(live)setState(s);}).catch(()=>{if(live)setError('Progressi non leggibili. I dati originali non saranno sovrascritti.');});const unsub=studyStore.subscribe(s=>{setState(s);setNow(Date.now());});const app=AppState.addEventListener('change',s=>{if(s==='active')setNow(Date.now());});const timer=setInterval(()=>setNow(Date.now()),60000);return()=>{live=false;unsub();app.remove();clearInterval(timer);};},[]);
 const history=state?.exam.history||[],historyKey=history.map(h=>[h?.id,h?.signature,h?.attempts?.length,h?.completedAt].join(':')).join('|');
 const evidence=useMemo(()=>historyEvidence(history,{bankRevision:studyBankRevision,compatibleRevisions:compatibleStudyRevisions}),[historyKey]);const progress=useMemo(()=>computeProgress({units,evidence,bankRevision:studyBankRevision,now}),[evidence,now]);
 const timeline=useMemo(()=>progressTimeline({units,evidence,bankRevision:studyBankRevision,now}),[evidence,now]);
 const nextTraining=useMemo(()=>selectTraining({units:examUnits(bank),evidence,bankRevision:studyBankRevision,now,seed:Math.floor(now/86400000)}),[evidence,now]);
 async function action(fn:()=>Promise<unknown>){try{await fn();setError('');return true;}catch{setError('Salvataggio non riuscito: verifica lo spazio e riprova.');return false;}}
 return {ready:!!state,profile:state?.profile||{name:'',startedAt:null},progress,timeline,bankCoverage:studyBankCoverage,gaps:priorityGaps(progress.minimum.gaps,[...catalog,...groups]),trend:sessionTrend(state?.exam.history||[],studyBankRevision),simulationTrend:sessionTrend(state?.exam.history||[],studyBankRevision,'simulation'),recentSessions:state?.exam.history||[],storageError,nextTraining,startStudy:()=>action(()=>studyStore.start()),setName:(name:string)=>action(()=>studyStore.setName(name))};
}
