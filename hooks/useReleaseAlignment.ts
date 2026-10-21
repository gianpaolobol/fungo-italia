import {useCallback,useEffect,useRef,useState} from 'react';
import {AppState,Platform} from 'react-native';
import Constants from 'expo-constants';
import {checkRelease,type AlignmentResult,type LocalRelease} from '../lib/release-alignment.mjs';
export default function useReleaseAlignment(){
 const local=useRef<LocalRelease>(Constants.expoConfig?.extra?.release??{}).current;
 const [result,setResult]=useState<Omit<AlignmentResult,'status'>&{status:AlignmentResult['status']|'checking'}>({status:'checking',release:null});
 const mounted=useRef(false),generation=useRef(0);
 const refresh=useCallback(async()=>{
  const id=++generation.current;
  if(mounted.current)setResult({status:'checking',release:null});
  const next=await checkRelease(local);
  if(mounted.current&&id===generation.current)setResult(next);
 },[local]);
 useEffect(()=>{
  mounted.current=true;void refresh();
  const listener=AppState.addEventListener('change',state=>{if(state==='active')void refresh();});
  const online=()=>{void refresh();};
  const offline=()=>{++generation.current;setResult({status:'unknown',release:null});};
  if(Platform.OS==='web'&&typeof window!=='undefined'){window.addEventListener('online',online);window.addEventListener('offline',offline);}
  return()=>{mounted.current=false;++generation.current;listener.remove();if(Platform.OS==='web'&&typeof window!=='undefined'){window.removeEventListener('online',online);window.removeEventListener('offline',offline);}};
 },[refresh]);
 return {...result,localVersion:local.version??Constants.expoConfig?.version??'non disponibile',refresh};
}
