export type Photo={id:string;creationTime:number|null};
export type Classification={supported:boolean;predictions:{label:string;score:number}[];reason?:string;uri?:string};
export type Decision='candidate'|'other'|'uncertain';
export type PhotoResult=Photo&Classification&{decision:Decision};
export type PhotoScan={version:1;sessionId?:string;offset:number;total:number;complete:boolean;batchNumber:number;lastBatch:PhotoResult[]};
export const scanKey='fungo-italia:local-photo-scan:v1';
export function createScan():PhotoScan{return {version:1,sessionId:Date.now().toString(36)+Math.random().toString(36).slice(2),offset:0,total:0,complete:false,batchNumber:1,lastBatch:[]};}
export function decodeScan(raw:string|null):PhotoScan{
 if(!raw)return createScan();const s=JSON.parse(raw);
 if(s.version!==1||!Number.isSafeInteger(s.offset)||s.offset<0||s.total!==s.offset||!Number.isSafeInteger(s.batchNumber)||s.batchNumber<1||typeof s.complete!=='boolean'||!Array.isArray(s.lastBatch)||s.lastBatch.length>20||s.lastBatch.some((p:PhotoResult)=>typeof p.id!=='string'||!['candidate','other','uncertain'].includes(p.decision)||!Array.isArray(p.predictions)))throw Error('Checkpoint non valido');return s;
}
export function decidePhoto(r:Classification):Decision{
 if(!r.supported)return 'uncertain';
 const fungal=Math.max(0,...r.predictions.filter(p=>/mushroom|fungus|fungi/i.test(p.label)).map(p=>p.score));
 const other=Math.max(0,...r.predictions.filter(p=>!/mushroom|fungus|fungi/i.test(p.label)).map(p=>p.score));
 if(fungal>=.72&&fungal>=other+.22)return 'candidate';
 if(other>=.75||fungal<.25)return 'other';
 return 'uncertain';
}
export async function runPhotoBatch(start:PhotoScan,deps:{query:(offset:number)=>Promise<Photo[]>;classify:(photo:Photo)=>Promise<Classification>;save:(state:PhotoScan)=>Promise<void>;stopped:()=>boolean}):Promise<PhotoScan>{
 let state:PhotoScan={...start,lastBatch:[...start.lastBatch]};if(state.complete)return state;
 // A full batch must be reviewed/archived before the caller opens the next one.
 if(state.lastBatch.length>=20)return state;
 const assets=await deps.query(state.offset),remaining=20-state.lastBatch.length;
 for(const asset of assets.slice(0,remaining)){
  if(deps.stopped())break;
  let result:Classification;try{result=await deps.classify(asset);}catch{result={supported:false,predictions:[],reason:'Foto non analizzabile sul dispositivo'};}
  const next:PhotoScan={...state,offset:state.offset+1,total:state.total+1,lastBatch:[...state.lastBatch,{...asset,...result,decision:decidePhoto(result)}]};
  await deps.save(next);state=next;
 }
 if(!deps.stopped()&&assets.length<remaining){const next={...state,complete:true};await deps.save(next);state=next;}
 return state;
}
export function decodeManifest(raw:string):Photo[]{
 const items=JSON.parse(raw);if(!Array.isArray(items)||items.length>100000||items.some(p=>typeof p.id!=='string'||!(p.creationTime===null||Number.isFinite(p.creationTime))))throw Error('Elenco foto non valido');return items;
}
export function observationsForPhotos(photos:Photo[]){return photos.map(p=>({id:'photo:'+p.id,assetIds:[p.id],capturedAt:p.creationTime,preciseLocation:null,appleCandidate:null,verificationStatus:'unreviewed' as const}));}
