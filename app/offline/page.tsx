import {OfflineLibrary} from "@/components/offline-library";
export default function OfflinePage(){return <main className="mx-auto max-w-3xl p-4"><h1 className="text-2xl font-bold">Le tue schede sul campo</h1><OfflineLibrary taxa={[]}/><a href="/?tab=schede" className="underline">Torna all’app per scaricare le schede</a></main>;}
