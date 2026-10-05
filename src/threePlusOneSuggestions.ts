import {StudyTaxon} from '../components/Studio';
export type CharacterSuggestion={taxonId:string;scientificName:string;characters:[string,string,string];confirmation:string;source:'atlas';};
function clean(value:unknown){return typeof value==='string'?value.trim():'';}
export function suggestionsFromAtlas(taxa:StudyTaxon[],query:string,limit=8):CharacterSuggestion[]{
 const q=query.trim().toLocaleLowerCase('it');
 if(q.length<2)return [];
 return taxa.filter(t=>[t.scientificName,...(t.commonNames||[])].some(n=>n.toLocaleLowerCase('it').includes(q))).slice(0,limit).map(t=>{
  const chars=(t.characters||[]).map(c=>typeof c==='string'?c:clean((c as any)?.text||c)).filter(Boolean);
  const confirmation=clean((t as any).diagnosticNote)||clean((t as any).summary)||'Confermare con i caratteri di approfondimento della scheda.';
  return {taxonId:t.id,scientificName:t.scientificName,characters:[chars[0]||'',chars[1]||'',chars[2]||''],confirmation,source:'atlas' as const};
 });
}
