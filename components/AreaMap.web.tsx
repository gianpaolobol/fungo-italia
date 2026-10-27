import React,{useEffect,useRef} from 'react';
import {mountWebAreaMap} from '../lib/area-map-web.mjs';
import type {AreaMapProps} from './AreaMap.types';
export function WebView({areas,onMessage,onError}:AreaMapProps){
 const element=useRef<HTMLDivElement>(null),callbacks=useRef({onMessage,onError});callbacks.current={onMessage,onError};
 useEffect(()=>{
  const abort=new AbortController();let closed=false,dispose:(()=>void)|undefined;
  if(!element.current)return;
  void mountWebAreaMap(element.current,areas,message=>{if(!closed)callbacks.current.onMessage?.({nativeEvent:{data:JSON.stringify(message)}} as never);},{signal:abort.signal})
   .then(cleanup=>{if(closed)cleanup();else dispose=cleanup;})
   .catch(()=>{if(!closed)callbacks.current.onError?.({} as never);});
  return()=>{closed=true;abort.abort();dispose?.();};
 },[areas]);
 return <div ref={element} role="region" aria-label="Mappa delle aree" style={{width:'100%',height:'100%',isolation:'isolate'}}/>;
}
