export function coverageInventory(minimum,extended,bank){
 const all=[...minimum,...extended],minimumIds=new Set(minimum.map(t=>t.id)),scope=t=>t.curriculum?.level?(t.curriculum.level==='minimum'?'minimum':'extended'):minimumIds.has(t.id)?'minimum':'extended';
 const ids=new Set(bank.map(c=>c.id));
 const summarize=taxa=>({total:taxa.length,ready:taxa.filter(t=>ids.has(t.id)).length,photographic:bank.filter(c=>c.questionKind!=='profile'&&taxa.some(t=>t.id===c.id)).length,theoretical:bank.filter(c=>c.questionKind==='profile'&&taxa.some(t=>t.id===c.id)).length});
 const missing=all.map(t=>({...t,scope:scope(t)})).filter(t=>!ids.has(t.id)).map(t=>({id:t.id,name:t.scientificName,rank:t.rank||'teaching-group',scope:t.scope,action:t.rank==='species'&&/^[A-Z][a-z]+ [a-z][a-z-]+$/.test(t.scientificName)?'documented-species-case':'group-question'}));
 return {minimum:summarize(all.filter(t=>scope(t)==='minimum')),extended:summarize(all.filter(t=>scope(t)==='extended')),missing};
}
