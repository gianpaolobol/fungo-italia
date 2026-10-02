"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
type Observation={id:string;description:string;observedAt:string;status:string;scientificName:string|null;photoCount:number;reviewNotes?:string|null;acceptedScientificName?:string|null;photos?:{id:string;url:string}[]};
const labels:Record<string,string>={pending:"In attesa di verifica",reviewed:"Determinazione documentata",needsEvidence:"Servono altri elementi",rejected:"Non confermata"};
export default function ObservationHistory(){
 const [rows,setRows]=useState<Observation[]>([]),[error,setError]=useState(""),[loading,setLoading]=useState(true),[attempt,setAttempt]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>{setRows([]);setLoading(true);setError("");},0);
  fetch("/api/observations",{signal:controller.signal,cache:"no-store"}).then(async response=>{
   const data=await response.json() as {error?:string;observations?:Observation[]};
   if(controller.signal.aborted)return;
   if(!response.ok||!Array.isArray(data.observations))throw new Error(data.error||"Storico non disponibile.");
   setRows(data.observations);
  }).catch((reason:unknown)=>{if(!controller.signal.aborted){setRows([]);setError(reason instanceof Error?reason.message:"Connessione interrotta.");}}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return()=>{window.clearTimeout(timeout);controller.abort();};
 },[attempt]);
 return <main className="mx-auto max-w-3xl p-5 sm:p-8"><Link href="/" className="inline-block py-3 font-bold text-green-800">← Catalogo e mappa</Link><h1 className="text-3xl font-black">Le mie osservazioni</h1><p className="mt-3">Segnalazioni personali e stato della verifica. Il taxon proposto resta un’ipotesi; una determinazione non autorizza il consumo.</p><Link href="/observations/new" className="my-5 inline-block rounded-xl bg-green-900 px-5 py-3 font-bold text-white">Nuova osservazione</Link>{loading&&<p role="status">Caricamento dello storico…</p>}{error&&<div role="alert"><p>{error}</p><button onClick={()=>setAttempt(n=>n+1)} className="mt-3 rounded-xl border px-5 py-3">Riprova</button></div>}{!loading&&!error&&rows.length===0&&<p>Non hai ancora inviato osservazioni. Registra habitat, caratteri osservati e fotografie del tuo prossimo ritrovamento.</p>}<div className="space-y-4">{rows.map(row=><article key={row.id} className="rounded-2xl border p-5"><p className="text-sm">{row.observedAt} · {labels[row.status]||row.status}</p><h2 className="mt-2 text-lg font-bold">{row.scientificName?"Ipotesi: "+row.scientificName:"Taxon non determinato"}</h2><p className="mt-3 whitespace-pre-wrap break-words">{row.description}</p>{row.acceptedScientificName&&<p className="mt-3 font-bold">Determinazione documentata: {row.acceptedScientificName}</p>}{row.reviewNotes&&<p className="mt-3 whitespace-pre-wrap">Riscontro del revisore: {row.reviewNotes}</p>}<p className="mt-3 break-all text-sm">{row.photoCount} fotografie conservate · ID {row.id}</p><div className="mt-3 flex flex-wrap gap-3">{row.photos?.map(photo=><a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" className="rounded-xl border px-4 py-3">Apri fotografia</a>)}</div></article>)}</div>{!loading&&rows.length===200&&<p className="mt-5">Sono mostrate le 200 osservazioni più recenti.</p>}</main>;
}
