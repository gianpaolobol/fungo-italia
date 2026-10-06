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
