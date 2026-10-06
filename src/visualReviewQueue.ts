export type VisualReviewItem={
 observationId:string;
 assetIds:string[];
 roles:('overview'|'cap'|'hymenophore'|'stipe-base'|'section-habitat')[];
 status:'queued'|'reviewing'|'done'|'needs-more-evidence';
 taxonCandidate:string|null;
 confidence:'unknown'|'low'|'medium'|'high';
 characters:[string|null,string|null,string|null];
 confirmation:string|null;
 notes:string[];
};
export function buildVisualReviewQueue(observations:{id:string;assetIds:string[]}[],max=100):VisualReviewItem[]{
 return observations.filter(o=>o.assetIds.length>0).slice(0,max).map(o=>({
  observationId:o.id,
  assetIds:o.assetIds.slice(0,8),
  roles:['overview','cap','hymenophore','stipe-base','section-habitat'],
  status:'queued',
  taxonCandidate:null,
  confidence:'unknown',
  characters:[null,null,null],
  confirmation:null,
  notes:[o.assetIds.length<2?'Un solo scatto: determinazione fotografica potenzialmente insufficiente.':'']
   .filter(Boolean)
 }));
}
export function isThreePlusOneComplete(item:VisualReviewItem){
 return item.characters.length===3&&item.characters.every(v=>typeof v==='string'&&v.trim().length>0)&&typeof item.confirmation==='string'&&item.confirmation.trim().length>0&&typeof item.taxonCandidate==='string'&&item.taxonCandidate.trim().length>0;
}

export function decodeVisualReviewQueue(raw:string|null):{version:1;queue:VisualReviewItem[]}{
 const value:unknown=raw?JSON.parse(raw):{version:1,queue:[]};
 if(!value||typeof value!=='object')throw Error('Formato coda non valido');
 const parsed=value as {version?:unknown;queue?:unknown};
 const statuses=['queued','reviewing','done','needs-more-evidence'],confidences=['unknown','low','medium','high'],roles=['overview','cap','hymenophore','stipe-base','section-habitat'];
 if(parsed.version!==1||!Array.isArray(parsed.queue)||!parsed.queue.every((x:any)=>x&&typeof x.observationId==='string'&&x.observationId.trim()&&Array.isArray(x.assetIds)&&x.assetIds.every((id:unknown)=>typeof id==='string'&&id.length>0)&&Array.isArray(x.roles)&&x.roles.every((v:unknown)=>typeof v==='string'&&roles.includes(v))&&statuses.includes(x.status)&&confidences.includes(x.confidence)&&Array.isArray(x.characters)&&x.characters.length===3&&x.characters.every((v:unknown)=>v===null||typeof v==='string')&&Array.isArray(x.notes)&&x.notes.every((n:unknown)=>typeof n==='string')&&(x.confirmation===null||typeof x.confirmation==='string')&&(x.taxonCandidate===null||typeof x.taxonCandidate==='string')))throw Error('Coda esistente non leggibile: nessuna sovrascrittura.');
 return {version:1,queue:parsed.queue as VisualReviewItem[]};
}
