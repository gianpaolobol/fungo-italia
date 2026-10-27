import {readTheoryHistory,subscribeTheoryHistory} from '../lib/theoryRuntime';
import {theoryEvidence} from '../lib/theory-progress.mjs';
import {theoryBank,theoryRevision,photoIds} from '../lib/studyBank';
import type {TrainingSummary} from '../web/public/exam-core';
import {useEffect,useMemo,useState} from 'react';import {AppState} from 'react-native';
import {studyStore,demoStudyStore} from '../lib/studyRuntime';import type {StudyState} from '../lib/study-store.mjs';
import {sessionTrend,priorityGaps} from '../lib/study-dashboard-model.mjs';
import {progressTimeline} from '../lib/study-timeline.mjs';
import {computeProgress} from '../lib/study-progress.mjs';import {selectTraining} from '../lib/study-scheduler.mjs';
import {examUnits,historyEvidence} from '../lib/study-exam.mjs';
import {studyBank as bank,studyBankRevision,compatibleStudyRevisions,combinedStudyUnits as units,studyBankCoverage,demoBank,demoUnits,demoBankRevision,compatibleDemoRevisions} from '../lib/studyBank';import catalog from '../src/data/catalog.json';import groups from '../src/data/groups.json';

export default function useStudy({demo=false}:{demo?:boolean}={}){const store=demo?demoStudyStore:studyStore,activeBank=demo?demoBank:bank,revision=demo?demoBankRevision:studyBankRevision,activeUnits=demo?demoUnits:units;const [fullState,setFullState]=useState<StudyState|null>(null);const [loaded,setLoaded]=useState<{demo:boolean;state:StudyState}|null>(null),[storageError,setError]=useState(''),[now,setNow]=useState(Date.now());const state=loaded?.demo===demo?loaded.state:null;
 useEffect(()=>{let live=true;void store.load().then(s=>{if(live)setLoaded({demo,state:s});}).catch(()=>{if(live)setError('Progressi non leggibili. I dati originali non saranno sovrascritti.');});const unsub=store.subscribe(s=>{if(live){setLoaded({demo,state:s});setNow(Date.now());}});const app=AppState.addEventListener('change',s=>{if(s==='active')setNow(Date.now());});const timer=setInterval(()=>setNow(Date.now()),60000);return()=>{live=false;unsub();app.remove();clearInterval(timer);};},[store]);
 useEffect(()=>{let live=true;void studyStore.load().then(s=>{if(live)setFullState(s);}).catch(()=>{if(live)setError('Storico completo non leggibile. I dati originali sono conservati.');});const unsubscribe=studyStore.subscribe(s=>{if(live)setFullState(s);});return()=>{live=false;unsubscribe();};},[]);
 const [theoryHistory,setTheoryHistory]=useState<TrainingSummary[]>([]),[theoryReady,setTheoryReady]=useState(false),[theoryError,setTheoryError]=useState('');
 useEffect(()=>{let live=true;const refresh=()=>{void readTheoryHistory().then(h=>{if(live){setTheoryHistory(h);setTheoryReady(true);setTheoryError('');}}).catch(()=>{if(live)setTheoryError('Storico teorico non leggibile. I dati originali sono conservati.');});};refresh();const unsub=subscribeTheoryHistory(h=>{if(live){setTheoryHistory(h);setTheoryReady(true);setNow(Date.now());}});const app=AppState.addEventListener('change',s=>{if(s==='active')refresh();});return()=>{live=false;unsub();app.remove();};},[]);
 const history=state?.exam.history||[],historyKey=history.map(h=>[h?.id,h?.signature,h?.attempts?.length,h?.completedAt].join(':')).join('|');
 const theoryKey=theoryHistory.map(h=>h.id+':'+h.attempts.length+':'+h.completedAt).join('|');
 const evidence=useMemo(()=>[...historyEvidence(history,{bankRevision:revision,compatibleRevisions:demo?compatibleDemoRevisions:compatibleStudyRevisions,bank:activeBank}),...(!demo?theoryEvidence(theoryHistory,theoryBank,theoryRevision,revision,photoIds):[])],[historyKey,theoryKey,demo]);const progress=useMemo(()=>computeProgress({units:activeUnits,evidence,bankRevision:revision,now}),[evidence,now,demo]);
 const timeline=useMemo(()=>progressTimeline({units:activeUnits,evidence,bankRevision:revision,now}),[evidence,now,demo]);
 const nextTraining=useMemo(()=>selectTraining({units:examUnits(activeBank),evidence,bankRevision:revision,now,seed:Math.floor(now/86400000),count:demo?4:15}),[evidence,now,demo]);
 async function action(fn:()=>Promise<unknown>){try{await fn();setError('');return true;}catch{setError('Salvataggio non riuscito: verifica lo spazio e riprova.');return false;}}
 return {ready:!!state&&(demo||theoryReady),profile:state?.profile||{name:'',startedAt:null},progress,timeline,demo,archivedSessions:demo?fullState?.exam.history||[]:[],bankCoverage:demo?{minimum:{total:7,photo:4,theory:0},extended:{total:1,theory:0}}:studyBankCoverage,gaps:priorityGaps(progress.minimum.gaps,[...catalog,...groups]),trend:sessionTrend(state?.exam.history||[],revision,'training',demo?4:15),simulationTrend:sessionTrend(state?.exam.history||[],revision,'simulation',demo?4:15),recentSessions:state?.exam.history||[],storageError:storageError||(!demo?theoryError:''),nextTraining,startStudy:()=>action(()=>store.start()),setName:(name:string)=>action(()=>store.setName(name))};
}
