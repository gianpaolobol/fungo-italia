import {curriculumItemsForLevel} from './curriculum-levels.mjs';
const normalize=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it').trim();
export function atlasSearchText(t){
 const geastrum=t.id==='minimum-group-card-geastraceae-astraeus'?['Geastrum','Geastraceae','Astraeus']:[];
 return normalize([t.scientificName,...(t.commonNames??[]),...(t.aliases??[]),...(t.currentAcceptedNames??[]),...(t.currentGenera??[]),...geastrum].join(' '));
}
export function searchAtlas(taxa,query,{level='minimum',onlyFavorites=false,favoriteIds=[]}={}){
 const needle=normalize(query);
 const matches=curriculumItemsForLevel(taxa,level).filter(t=>(!onlyFavorites||favoriteIds.includes(t.id))&&atlasSearchText(t).includes(needle));
 if(!needle)return matches;
 const score=t=>{
  const name=normalize(t.scientificName);
  const first=name.split(/[\s(]/)[0];
  if(name===needle||first===needle)return 0;
  if(name.startsWith(needle))return 1;
  return 2;
 };
 return matches.map((taxon,index)=>({taxon,index,priority:score(taxon)}))
  .sort((a,b)=>a.priority-b.priority||a.index-b.index).map(row=>row.taxon);
}
