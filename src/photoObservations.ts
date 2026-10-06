export type PrivateObservation={
 id:string;
 assetIds:string[];
 capturedAt:number|null;
 preciseLocation:{latitude:number;longitude:number}|null;
 appleCandidate?:string|null;
 verificationStatus:'unreviewed'|'candidate'|'verified'|'uncertain';
};
export type PublicObservation={
 id:string;
 capturedDate:string|null;
 areaPublic:string|null;
 taxonId:string|null;
 verificationStatus:PrivateObservation['verificationStatus'];
};
const DAY=86400000;
export function clusterByTime<T extends {id:string;creationTime:number|null}>(assets:T[],gapMs=3*60*1000){
 const undated=assets.filter(a=>a.creationTime===null||!Number.isFinite(a.creationTime));
 const ordered=[...assets].filter(a=>a.creationTime!==null&&Number.isFinite(a.creationTime)).sort((a,b)=>(a.creationTime||0)-(b.creationTime||0));
 const groups:T[][]=[];
 for(const asset of ordered){
  const last=groups.at(-1),previous=last?.at(-1);
  if(!last||!previous||!previous.creationTime||!asset.creationTime||asset.creationTime-previous.creationTime>gapMs)groups.push([asset]);
  else last.push(asset);
 }
 return [...groups,...undated.map(asset=>[asset])];
}
export function generalizeLocation(location:{latitude:number;longitude:number}|null){
 if(!location)return null;
 // ~5–6 km grid in Italy: sufficient for public discovery, deliberately unsuitable as a picking point.
 return `${Math.round(location.latitude*20)/20},${Math.round(location.longitude*20)/20}`;
}
export function toPublicObservation(value:PrivateObservation,taxonId:string|null=null):PublicObservation{
 return {id:value.id,capturedDate:value.capturedAt?new Date(value.capturedAt).toISOString().slice(0,10):null,areaPublic:generalizeLocation(value.preciseLocation),taxonId,verificationStatus:value.verificationStatus};
}
export function makeObservationId(assetIds:string[],capturedAt:number|null){
 return 'obs-'+(capturedAt?Math.floor(capturedAt/DAY):'undated')+'-'+assetIds[0].replace(/[^a-zA-Z0-9_-]/g,'').slice(-18);
}
