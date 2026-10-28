import {useEffect,useMemo,useReducer} from 'react';
import {AppState,Platform} from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import {createBetaController} from '../lib/beta-controller.mjs';
const key='fungo-italia:beta:v1';
function configuredEndpoint(){
 if(Platform.OS!=='android')return null;
 const value=Constants.expoConfig?.extra?.betaServiceUrl;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==='/'?u.origin:null;}catch{return null;}
}
export default function useBetaAccess(){
 const [,render]=useReducer(n=>n+1,0);
 const endpoint=useMemo(configuredEndpoint,[]);
 const controller=useMemo(()=>createBetaController({enabled:!!endpoint,onChange:render,
  storage:{get:()=>SecureStore.getItemAsync(key),set:token=>SecureStore.setItemAsync(key,token),clear:()=>SecureStore.deleteItemAsync(key)},
  request:async(path,body,token)=>{
   if(!endpoint)throw Error('Beta non configurata');
   const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),10000);
   try{const r=await fetch(endpoint+path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body),signal:abort.signal,cache:'no-store'});const raw=await r.text();if(!r.ok||raw.length>16384)throw Error('Beta non verificabile');return JSON.parse(raw);}finally{clearTimeout(timer);}
  },
 }),[endpoint]);
 useEffect(()=>{void controller.start();const listener=AppState.addEventListener('change',state=>{if(state==='active')void controller.foreground();else controller.background();});return()=>{listener.remove();controller.stop();};},[controller]);
 return{...controller.state(),configured:!!endpoint,redeem:controller.redeem,refresh:controller.refresh,logout:controller.logout};
}
