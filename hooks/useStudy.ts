import {useEffect,useMemo,useState} from 'react';import {AppState} from 'react-native';
import {studyStore} from '../lib/studyRuntime';import type {StudyState} from '../lib/study-store.mjs';
import {computeProgress} from '../lib/study-progress.mjs';import {selectTraining} from '../lib/study-scheduler.mjs';
import {examUnits,historyEvidence,bankSignature} from '../lib/study-exam.mjs';
import type {ExamCase} from '../web/public/exam-core';import bankData from '../src/data/exam-bank.json';import catalog from '../src/data/catalog.json';import groups from '../src/data/groups.json';
const bank=bankData as unknown as ExamCase[],units=examUnits(bank,[...catalog,...groups]);
export default function useStudy(){const [state,setState]=useState<StudyState|null>(null),[storageError,setError]=useState(''),[now,setNow]=useState(Date.now());
 useEffect(()=>{let live=true;void studyStore.load().then(s=>{if(live)setState(s);}).catch(()=>{if(live)setError('Progressi non leggibili. I dati originali non saranno sovrascritti.');});const unsub=studyStore.subscribe(s=>{setState(s);setNow(Date.now());});const app=AppState.addEventListener('change',s=>{if(s==='active')setNow(Date.now());});const timer=setInterval(()=>setNow(Date.now()),60000);return()=>{live=false;unsub();app.remove();clearInterval(timer);};},[]);
 const evidence=useMemo(()=>historyEvidence(state?.exam.history||[]),[state]);const progress=useMemo(()=>computeProgress({units,evidence,bankRevision:bankSignature(bank),now}),[evidence,now]);
 const nextTraining=useMemo(()=>selectTraining({units:examUnits(bank),evidence,bankRevision:bankSignature(bank),now,seed:Math.floor(now/86400000)}),[evidence,now]);
 async function action(fn:()=>Promise<unknown>){try{await fn();setError('');return true;}catch{setError('Salvataggio non riuscito: verifica lo spazio e riprova.');return false;}}
 return {ready:!!state,profile:state?.profile||{name:'',startedAt:null},progress,recentSessions:state?.exam.history||[],storageError,nextTraining,startStudy:()=>action(()=>studyStore.start()),setName:(name:string)=>action(()=>studyStore.setName(name))};
}
