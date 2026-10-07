const text=value=>typeof value==='string'&&!!value.trim();
const https=value=>{try{const u=new URL(value);return text(value)&&u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
const fail=message=>{throw Error('Invalid commercialization data: '+message);};
export function validateCommercialization(dataset){
 if(dataset?.version!==1||dataset.product!=='fresh'||!/^\d{4}-\d{2}-\d{2}$/.test(dataset.reviewedAt)||!text(dataset.context)||!text(dataset.conditions)||!Array.isArray(dataset.sources)||!Array.isArray(dataset.rules)||!Array.isArray(dataset.cards)||!Array.isArray(dataset.bans))fail('schema');
 const sources=new Map();
 for(const s of dataset.sources){if(!text(s.id)||sources.has(s.id)||!text(s.title)||!https(s.url)||!['national','regional','taxonomy'].includes(s.scope)||(s.scope==='regional'&&!text(s.region)))fail('source');sources.set(s.id,s);}
 const keys=new Set();
 for(const r of dataset.rules){
  const source=sources.get(r.sourceId),key=r.scientificName+'|'+(r.region||'Italia');
  if(!text(r.scientificName)||!Array.isArray(r.aliases)||!r.aliases.every(text)||keys.has(key)||!['national','regional'].includes(r.scope)||!source||source.scope!==r.scope||(r.scope==='regional'&&(!text(r.region)||r.region!==source.region))||(r.scope==='national'&&r.region!==undefined)||(r.taxonomySourceId!==undefined&&sources.get(r.taxonomySourceId)?.scope!=='taxonomy'))fail('rule');
  keys.add(key);
 }
 if(new Set(dataset.bans.map(b=>b.scientificName)).size!==dataset.bans.length)fail('duplicate ban');
 for(const b of dataset.bans)if(!text(b.scientificName)||!text(b.label)||sources.get(b.sourceId)?.scope!=='national')fail('ban');
 if(!dataset.bans.some(b=>b.scientificName==='Tricholoma equestre'&&b.sourceId==='OM2002-EQUESTRE'))fail('missing equestre override');
 const names=new Set([...dataset.rules.map(r=>r.scientificName),...dataset.bans.map(b=>b.scientificName)]),cards=new Set();
 for(const c of dataset.cards){if(!text(c.scientificName)||cards.has(c.scientificName)||typeof c.wholeCard!=='boolean'||!Array.isArray(c.members)||!c.members.length||new Set(c.members).size!==c.members.length||c.members.some(n=>!names.has(n))||(c.wholeCard&&(c.members.length!==1||c.members[0]!==c.scientificName)))fail('card mapping');cards.add(c.scientificName);}
 return dataset;
}
export function applyCommercialization(taxa,dataset){
 validateCommercialization(dataset);
 const sources=new Map(dataset.sources.map(s=>[s.id,s])),maps=new Map(dataset.cards.map(c=>[c.scientificName,c])),byId=new Map(taxa.map(t=>[t.id,t]));
 for(const t of taxa){
  delete t.commercialization;
  const mapping=maps.get(t.scientificName);
  const names=new Set(mapping?.members||[]);
  if(t.kind==='teaching-group')for(const id of t.relatedIds||[])for(const name of maps.get(byId.get(id)?.scientificName)?.members||[])names.add(name);
  if(!names.size)continue;
  const wholeCard=!!mapping?.wholeCard&&t.rank==='species'&&t.kind!=='teaching-group';
  const members=[...names].map(scientificName=>{
   const ban=dataset.bans.find(b=>b.scientificName===scientificName);
   if(ban)return {scientificName,status:'banned',label:ban.label,regions:[],sources:[sources.get(ban.sourceId)]};
   const rules=dataset.rules.filter(r=>r.scientificName===scientificName),national=rules.find(r=>r.scope==='national');
   const applicable=national?[national]:rules.filter(r=>r.scope==='regional');
   return {scientificName,status:national?'national':'regional',label:national?'Specie commerciabile in Italia':'Specie commerciabile in '+applicable.map(r=>r.region).join(', '),regions:applicable.filter(r=>r.scope==='regional').map(r=>r.region),sources:applicable.flatMap(r=>[sources.get(r.sourceId),...(r.taxonomySourceId?[sources.get(r.taxonomySourceId)]:[])])};
  });
  t.commercialization={product:'fresh',wholeCard,reviewedAt:dataset.reviewedAt,context:dataset.context,conditions:dataset.conditions,members};
 }
 return taxa;
}
