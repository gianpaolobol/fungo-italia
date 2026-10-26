// Read-only interpretation of configured prices; never proves storefront availability
// or the price charged to a particular existing subscriber.
const ORIGIN='https://api.appstoreconnect.apple.com';
const key=r=>`${r.type}:${r.id}`;
const canonical=value=>JSON.stringify(value,(_k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
const sort=rows=>rows.sort((a,b)=>String(a.startDate??'').localeCompare(String(b.startDate??''))||a.id.localeCompare(b.id));
function validDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}

export async function readSubscriptionPrices(api,subscriptionId,{asOf=new Date().toISOString()}={}){
 const instant=new Date(asOf);
 if(!Number.isFinite(instant.getTime()))throw Error('Invalid price observation timestamp');
 const effectiveDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(instant);
 const endpoint='/v1/subscriptions/'+encodeURIComponent(subscriptionId)+'/prices';
 const resources=new Map(),included=new Map(),visited=new Set(),issues=[];
 const issue=(code,id=null)=>issues.push({code,id});
 let next=endpoint+'?include=subscriptionPricePoint,territory&limit=200',pages=0,complete=true,total=null;
 const stop=code=>{issue(code);complete=false;};
 while(next){
  let url;try{url=new URL(next,ORIGIN);}catch{stop('INVALID_PAGINATION_LINK');break;}
  if(url.origin!==ORIGIN||url.pathname!==endpoint||url.username||url.password||url.hash){stop('UNSAFE_PAGINATION_LINK');break;}
  const path=url.pathname+url.search;
  if(visited.has(path)||pages>=1000){stop('PAGINATION_NOT_COMPLETE');break;}
  visited.add(path);
  let response;try{response=await api(path);}catch{stop('PRICE_REQUEST_FAILED');break;}
  pages++;
  if(!response?.ok){stop('PRICE_REQUEST_FAILED');break;}
  if(!Array.isArray(response.data)||(response.included!==undefined&&!Array.isArray(response.included))){stop('INVALID_PRICE_RESPONSE');break;}
  if(response.meta?.paging?.total!==undefined){
   const n=response.meta.paging.total;
   if(!Number.isInteger(n)||n<0||(total!==null&&total!==n)){stop('INCONSISTENT_PRICE_TOTAL');break;}
   total=n;
  }
  for(const [rows,map] of [[response.data,resources],[response.included||[],included]])for(const r of rows){
   if(typeof r?.type!=='string'||!r.type.trim()||typeof r.id!=='string'||!r.id.trim()){issue('INVALID_RESOURCE');continue;}
   const previous=map.get(key(r));
   if(previous&&canonical(previous)!==canonical(r))issue('CONFLICTING_RESOURCE',r.id);
   else map.set(key(r),r);
  }
  next=response.links?.next;
  if(next!==undefined&&next!==null&&typeof next!=='string'){stop('INVALID_PAGINATION_LINK');break;}
 }
 if(total!==null&&resources.size!==total)stop('PRICE_TOTAL_MISMATCH');
 const rows=[];
 for(const r of resources.values()){
  if(r.type!=='subscriptionPrices'){issue('INVALID_RESOURCE',r.id);continue;}
  const territory=r.relationships?.territory?.data;
  if(territory?.type!=='territories'||!territory.id){issue('MISSING_TERRITORY',r.id);continue;}
  if(territory.id!=='ITA')continue;
  const a=r.attributes||{},rel=r.relationships?.subscriptionPricePoint?.data;
  const point=rel?.type==='subscriptionPricePoints'?included.get(key(rel)):null;
  const pointTerritory=point?.relationships?.territory?.data;
  const customerPrice=point?.attributes?.customerPrice;
  const errors=[];
  if(!(a.startDate===null||validDate(a.startDate)))errors.push('INVALID_START_DATE');
  if(typeof a.preserved!=='boolean')errors.push('UNKNOWN_PRESERVATION');
  if(!['UPFRONT','MONTHLY'].includes(a.planType))errors.push('UNKNOWN_PLAN_TYPE');
  if(!point)errors.push('MISSING_PRICE_POINT');
  if(pointTerritory&&(pointTerritory.type!=='territories'||pointTerritory.id!=='ITA'))errors.push('PRICE_POINT_TERRITORY_MISMATCH');
  if(typeof customerPrice!=='string'||!/^\d+(\.\d+)?$/.test(customerPrice))errors.push('INVALID_CUSTOMER_PRICE');
  for(const code of errors)issue(code,r.id);
  rows.push({id:r.id,pricePointId:rel?.id||null,startDate:a.startDate??null,preserved:a.preserved??null,planType:a.planType??null,customerPrice:customerPrice??null,valid:errors.length===0});
 }
 sort(rows);
 const plans=[];
 for(const planType of [...new Set(rows.map(r=>r.planType))].sort()){
  const records=rows.filter(r=>r.planType===planType);
  const standard=records.filter(r=>r.valid&&r.preserved===false);
  const scheduled=standard.filter(r=>r.startDate!==null&&r.startDate>effectiveDate);
  // Dates have no activation time. Do not guess on the territory's transition day.
  const transition=standard.some(r=>r.startDate===effectiveDate);
  if(transition)issue('TRANSITION_DATE',planType);
  const effective=standard.filter(r=>r.startDate===null||r.startDate<effectiveDate);
  const latest=effective.at(-1)?.startDate??null;
  const candidates=effective.filter(r=>r.startDate===latest);
  let current=candidates.length===1&&!transition?candidates[0]:null;
  if(candidates.length>1)issue('CONFLICTING_CURRENT_PRICES',planType);
  if(!candidates.length)issue('NO_CURRENT_STANDARD_PRICE',planType);
  plans.push({planType,current,scheduled,preserved:records.filter(r=>r.preserved===true),historical:effective.filter(r=>r.startDate!==latest),records});
 }
 if(!rows.length)issue('NO_TERRITORY_PRICES');
 const localIssues=new Set(['TRANSITION_DATE','CONFLICTING_CURRENT_PRICES','NO_CURRENT_STANDARD_PRICE']);
 const invalid=issues.some(i=>!localIssues.has(i.code));
 if(!complete||invalid)for(const plan of plans)plan.current=null;
 if(plans.length>1)issue('MULTIPLE_BILLING_PLANS');
 issues.sort((a,b)=>a.code.localeCompare(b.code)||String(a.id||'').localeCompare(String(b.id||'')));
 const current=plans.length===1?plans[0].current:null;
 return {territory:'ITA',currency:'EUR',asOf:instant.toISOString(),effectiveDate,timeZone:'Europe/Rome',
  interpretation:'configured-schedule-only',subscriberPriceStatus:'not-determinable-from-price-schedule',
  complete,pages,configuredPrices:resources.size,status:current?'schedule-resolved':'indeterminate',current,
  scheduled:sort(plans.flatMap(p=>p.scheduled)),preserved:sort(plans.flatMap(p=>p.preserved)),historical:sort(plans.flatMap(p=>p.historical)),plans,issues};
}
