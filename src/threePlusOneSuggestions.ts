import {StudyTaxon} from '../components/Studio';
export type CharacterSuggestion={taxonId:string;scientificName:string;characters:[string,string,string];confirmation:string;source:'atlas';};
function clean(value:unknown){return typeof value==='string'?value.trim():'';}
function normalize(value:unknown){return clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it');}
function namesOf(taxon:StudyTaxon):string[]{
 const anyTaxon=taxon as any;
 const values=new Set<string>();
 function add(value:unknown){const text=clean(value);if(text)values.add(text);}
 function addMany(value:unknown){if(Array.isArray(value))value.forEach(add);}
 add(taxon.scientificName);
 addMany(taxon.commonNames);
 addMany(anyTaxon.aliases);
 addMany(anyTaxon.currentAcceptedNames);
 addMany(anyTaxon.currentGenera);
 addMany(anyTaxon.sourceGenera);
 if(Array.isArray(anyTaxon.commercialization?.members))anyTaxon.commercialization.members.forEach((m:any)=>add(m?.scientificName));
 if(Array.isArray(anyTaxon.relatedIds))anyTaxon.relatedIds.forEach((id:unknown)=>clean(id).split(/[-_]+/).forEach(add));
 return [...values];
}
function score(taxon:StudyTaxon,query:string){
 const q=normalize(query);let best=0;
 for(const name of namesOf(taxon)){
  const n=normalize(name);if(!n)continue;
  if(n===q)best=Math.max(best,100);
  else if(n.startsWith(q))best=Math.max(best,90);
  else if(n.split(/[^a-z0-9]+/).some(part=>part.startsWith(q)))best=Math.max(best,80);
  else if(n.includes(q))best=Math.max(best,50);
 }
 return best;
}
export function suggestionsFromAtlas(taxa:StudyTaxon[],query:string,limit=25):CharacterSuggestion[]{
 const q=query.trim();
 if(normalize(q).length<2)return [];
 return taxa.map((taxon,index)=>({taxon,index,score:score(taxon,q)}))
  .filter(item=>item.score>0)
  .sort((a,b)=>b.score-a.score||a.taxon.scientificName.localeCompare(b.taxon.scientificName,'it')||a.index-b.index)
  .slice(0,limit)
  .map(({taxon})=>{
   const chars=(taxon.characters||[]).map(c=>typeof c==='string'?c:clean((c as any)?.text||c)).filter(Boolean);
   const confirmation=clean((taxon as any).diagnosticNote)||clean((taxon as any).summary)||'Confermare con i caratteri di approfondimento della scheda.';
   return {taxonId:taxon.id,scientificName:taxon.scientificName,characters:[chars[0]||'',chars[1]||'',chars[2]||''],confirmation,source:'atlas' as const};
  });
}
export const __test__={namesOf,normalize,score};
