import {curriculumItemsForLevel} from './curriculum-levels.mjs';
const normalize=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it').trim();
export function atlasSearchText(t){
 const geastrum=t.id==='minimum-group-card-geastraceae-astraeus'?['Geastrum','Geastraceae','Astraeus']:[];
 return normalize([t.scientificName,...(t.commonNames??[]),...(t.aliases??[]),...(t.currentAcceptedNames??[]),...(t.currentGenera??[]),...geastrum].join(' '));
}
export function searchAtlas(taxa,query,{level='minimum',onlyFavorites=false,favoriteIds=[]}={}){
 return curriculumItemsForLevel(taxa,level).filter(t=>(!onlyFavorites||favoriteIds.includes(t.id))&&atlasSearchText(t).includes(normalize(query)));
}
