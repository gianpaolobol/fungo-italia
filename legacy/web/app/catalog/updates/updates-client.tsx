"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {PublishedCatalogUpdates,type PublishedCatalogUpdate} from "@/components/published-catalog-updates";
export function CatalogUpdatesClient(){
 const[updates,setUpdates]=useState<PublishedCatalogUpdate[]>([]),[status,setStatus]=useState("loading"),[attempt,setAttempt]=useState(0);
 useEffect(()=>{const controller=new AbortController();fetch("/api/catalog",{signal:controller.signal,cache:"no-store"}).then(async response=>{const payload=await response.json() as {publishedUpdates?:PublishedCatalogUpdate[];status?:string};if(!response.ok||payload.status!=="live"||!Array.isArray(payload.publishedUpdates))throw Error("unavailable");if(!controller.signal.aborted){setUpdates(payload.publishedUpdates);setStatus("ready");}}).catch(()=>{if(!controller.signal.aborted)setStatus("error");});return()=>controller.abort();},[attempt]);
 return <main className="mx-auto max-w-4xl p-4 sm:p-8"><Link href="/" className="inline-flex min-h-11 items-center font-bold text-green-900">← Catalogo e mappa</Link><h1 className="text-3xl font-black">Contributi pubblicati nel catalogo</h1>{status==="loading"&&<p role="status">Caricamento…</p>}{status==="error"&&<div role="alert"><p>Archivio non disponibile. I contributi pubblicati non sono stati caricati.</p><button className="my-3 min-h-11 rounded-xl border px-4" onClick={()=>{setStatus("loading");setAttempt(value=>value+1);}}>Riprova</button></div>}{status==="ready"&&!updates.length&&<p className="mt-5">Non ci sono ancora contributi pubblicati. Le proposte in revisione non sono incluse.</p>}<PublishedCatalogUpdates updates={updates}/></main>;
}
