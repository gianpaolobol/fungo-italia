"use client";
import {useEffect,useState} from "react";
import {prepareOfflineReader} from "@/lib/offline-registration";
export function OfflineStatus(){
 const[offline,setOffline]=useState(false);
 useEffect(()=>{const update=()=>setOffline(!navigator.onLine);const initial=window.setTimeout(update,0);window.addEventListener("online",update);window.addEventListener("offline",update);void prepareOfflineReader().catch(()=>{});return()=>{window.clearTimeout(initial);window.removeEventListener("online",update);window.removeEventListener("offline",update);};},[]);
 if(!offline)return null;
 return <div role="status" className="border-b border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">Sei offline. Meteo e contributi richiedono connessione. <a className="font-bold underline" href="/offline-reader.html">Apri le schede salvate</a></div>;
}
