export function coverageInventory(minimum,extended,bank){
 const ids=new Set(bank.map(c=>c.id));
 const summarize=taxa=>({total:taxa.length,ready:taxa.filter(t=>ids.has(t.id)).length,photographic:bank.filter(c=>c.questionKind!=='profile'&&taxa.some(t=>t.id===c.id)).length,theoretical:bank.filter(c=>c.questionKind==='profile'&&taxa.some(t=>t.id===c.id)).length});
 const missing=[...minimum.map(t=>({...t,scope:'minimum'})),...extended.map(t=>({...t,scope:'extended'}))].filter(t=>!ids.has(t.id)).map(t=>({id:t.id,name:t.scientificName,rank:t.rank||'teaching-group',scope:t.scope,action:t.rank==='species'&&/^[A-Z][a-z]+ [a-z][a-z-]+$/.test(t.scientificName)?'documented-species-case':'group-question'}));
 return {minimum:summarize(minimum),extended:summarize(extended),missing};
}
