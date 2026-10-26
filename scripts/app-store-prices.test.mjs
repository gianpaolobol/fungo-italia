import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as asc from './app-store-connect.mjs';

const asOf='2026-10-26T12:00:00Z';
const path='/v1/subscriptions/sub/prices?include=subscriptionPricePoint,territory&limit=200';
function row(id,price,startDate=null,preserved=false,territory='ITA',planType='UPFRONT'){
 return {data:{type:'subscriptionPrices',id,attributes:{startDate,preserved,planType},relationships:{territory:{data:{type:'territories',id:territory}},subscriptionPricePoint:{data:{type:'subscriptionPricePoints',id:'point-'+id}}}},point:{type:'subscriptionPricePoints',id:'point-'+id,attributes:{customerPrice:price},relationships:{territory:{data:{type:'territories',id:territory}}}}};
}
function page(rows,next=null){return {ok:true,data:rows.map(r=>r.data),included:rows.map(r=>r.point),links:{next}};}
async function inspect(pages){
 assert.equal(typeof asc.readSubscriptionPrices,'function','offline price reader must be exported');
 return asc.readSubscriptionPrices(async p=>{assert.ok(Object.hasOwn(pages,p),'Unexpected GET '+p);return pages[p];},'sub',{asOf});
}
const inspectRows=rows=>inspect({[path]:page(rows)});
test('reads Italy only on a later page and joins included points across pages',async()=>{
 const italy=row('it','19.99');const first=page([row('us','9.99',null,false,'USA')], 'https://api.appstoreconnect.apple.com/v1/subscriptions/sub/prices?cursor=two');
 first.included.push(italy.point);const second=page([italy]);second.included=[];
 const r=await inspect({[path]:first,'/v1/subscriptions/sub/prices?cursor=two':second});
 assert.equal(r.current.customerPrice,'19.99');assert.equal(r.pages,2);assert.equal(r.configuredPrices,2);assert.equal(r.complete,true);
});
test('record and page order cannot select a preserved or future price',async()=>{
 const rows=[row('old','9.99',null,true),row('current','19.99','2026-09-01'),row('next','24.99','2026-11-01')];
 const a=await inspectRows(rows),b=await inspectRows([...rows].reverse());assert.deepEqual(a,b);
 assert.equal(a.current.customerPrice,'19.99');assert.equal(a.scheduled[0].customerPrice,'24.99');assert.equal(a.preserved[0].customerPrice,'9.99');
});
test('latest non-preserved date supersedes a baseline and supports decreases',async()=>{
 const r=await inspectRows([row('base','19.99'),row('reduced','9.99','2026-10-01')]);assert.equal(r.current.customerPrice,'9.99');assert.equal(r.historical[0].customerPrice,'19.99');
});
test('date of transition is explicitly indeterminate; future alone is not current',async()=>{
 const r=await inspectRows([row('base','9.99'),row('today','19.99','2026-10-26')]);assert.equal(r.current,null);assert.ok(r.issues.some(i=>i.code==='TRANSITION_DATE'));
 const f=await inspectRows([row('future','19.99','2026-11-01')]);assert.equal(f.current,null);assert.equal(f.scheduled.length,1);
});
test('Italy calendar date is used even before UTC midnight',async()=>{
 const r=await asc.readSubscriptionPrices(async()=>page([row('today','19.99','2026-10-27')]),'sub',{asOf:'2026-10-26T23:30:00Z'});
 assert.equal(r.effectiveDate,'2026-10-27');assert.equal(r.current,null);assert.ok(r.issues.some(i=>i.code==='TRANSITION_DATE'));
});
test('multiple plans remain separate rather than producing a single price',async()=>{
 const r=await inspectRows([row('upfront','19.99'),row('monthly','2.99',null,false,'ITA','MONTHLY')]);assert.equal(r.current,null);assert.equal(r.plans.length,2);assert.ok(r.plans.every(p=>p.current));
});
test('same-date competing prices are not resolved by order',async()=>{
 const rows=[row('a','9.99'),row('b','19.99')];const a=await inspectRows(rows),b=await inspectRows([...rows].reverse());assert.deepEqual(a,b);assert.equal(a.current,null);assert.ok(a.issues.some(i=>i.code==='CONFLICTING_CURRENT_PRICES'));
});
test('only preserved prices do not establish a new-subscriber price',async()=>{const r=await inspectRows([row('old','9.99',null,true)]);assert.equal(r.current,null);assert.equal(r.preserved.length,1);});
test('missing dates, preserved flags, points, invalid dates and wrong point territory are explicit',async()=>{
 for(const mutate of [r=>delete r.data.attributes.startDate,r=>r.data.attributes.startDate='2026-02-30',r=>delete r.data.attributes.preserved,r=>r.point=null,r=>r.point.relationships.territory.data.id='USA',r=>r.point.attributes.customerPrice='bad',r=>r.data.attributes.planType='UNKNOWN']){
  const r=row('bad','19.99');mutate(r);const p=page([]);p.data=[r.data];p.included=r.point?[r.point]:[];
  const result=await inspect({[path]:p});assert.equal(result.current,null);assert.ok(result.issues.length>0);
 }
});
test('missing Italy is not zero and unknown territory prevents certainty',async()=>{
 const r=await inspectRows([row('us','9.99',null,false,'USA')]);assert.equal(r.current,null);assert.ok(r.issues.some(i=>i.code==='NO_TERRITORY_PRICES'));
 const broken=row('missing','9.99');delete broken.data.relationships.territory;
 const b=await inspectRows([broken,row('good','19.99')]);assert.equal(b.current,null);
});
test('failed or malformed later pages never leave an apparently current price',async()=>{
 for(const second of [{ok:false,status:403},{ok:true,data:null},{ok:true,data:[],included:[],meta:{paging:{total:3}}}]){
  const r=await inspect({[path]:page([row('it','19.99')],'/v1/subscriptions/sub/prices?cursor=two'),'/v1/subscriptions/sub/prices?cursor=two':second});
  assert.equal(r.current,null);assert.equal(r.complete,false);assert.ok(r.issues.length>0);
 }
});
test('loops, foreign origins and different endpoints stop pagination without requesting them',async()=>{
 for(const next of [path,'https://example.com/v1/subscriptions/sub/prices','/v1/apps/other']){
  const r=await inspect({[path]:page([row('it','19.99')],next)});assert.equal(r.complete,false);assert.equal(r.current,null);
 }
});
test('transport failure and conflicting duplicate IDs are indeterminate',async()=>{
 const r=await asc.readSubscriptionPrices(async()=>{throw Error('offline');},'sub',{asOf});assert.equal(r.current,null);assert.equal(r.complete,false);
 const a=row('same','19.99'),b=row('same','9.99');const d=await inspectRows([a,b]);assert.equal(d.current,null);assert.ok(d.issues.some(i=>i.code==='CONFLICTING_RESOURCE'));
});
test('duplicate resources across pages are deduplicated',async()=>{
 const it=row('it','19.99');const r=await inspect({[path]:page([it],'/v1/subscriptions/sub/prices?cursor=two'),'/v1/subscriptions/sub/prices?cursor=two':page([it])});assert.equal(r.configuredPrices,1);assert.equal(r.current.customerPrice,'19.99');
});
test('an increase moves from scheduled to current after its transition date',async()=>{
 const p=page([row('base','9.99'),row('increase','19.99','2026-11-01')]);
 const before=await asc.readSubscriptionPrices(async()=>p,'sub',{asOf});
 const after=await asc.readSubscriptionPrices(async()=>p,'sub',{asOf:'2026-11-02T12:00:00Z'});
 assert.equal(before.current.customerPrice,'9.99');assert.equal(before.scheduled[0].customerPrice,'19.99');
 assert.equal(after.current.customerPrice,'19.99');assert.equal(after.scheduled.length,0);
 assert.equal(after.subscriberPriceStatus,'not-determinable-from-price-schedule');
});
test('splitting records into differently ordered pages leaves the same price interpretation',async()=>{
 const a=row('base','9.99'),b=row('current','19.99','2026-09-01'),c=row('future','24.99','2026-11-01');
 const first=await inspect({[path]:page([a,b],'/v1/subscriptions/sub/prices?cursor=two'),'/v1/subscriptions/sub/prices?cursor=two':page([c])});
 const second=await inspect({[path]:page([c],'/v1/subscriptions/sub/prices?cursor=two'),'/v1/subscriptions/sub/prices?cursor=two':page([b,a])});
 assert.deepEqual(first,second);
});
test('future preservation is visible but never becomes the standard price',async()=>{
 const r=await inspectRows([row('current','19.99'),row('cohort','9.99','2026-11-01',true)]);
 assert.equal(r.current.customerPrice,'19.99');assert.equal(r.preserved[0].startDate,'2026-11-01');assert.equal(r.scheduled.length,0);
});
test('explicit null baseline and a zero price are retained without numeric coercion',async()=>{
 const r=await inspectRows([row('free','0.00')]);assert.equal(r.current.customerPrice,'0.00');assert.equal(r.current.startDate,null);
});
test('invalid observation timestamps are rejected without an API call',async()=>{
 await assert.rejects(asc.readSubscriptionPrices(()=>{assert.fail('No request expected');},'sub',{asOf:'bad'}),/Invalid price observation/);
});
test('non-string dates remain indeterminate in either record order without crashing',async()=>{
 for(const date of [23,{},[],false]){
  const rows=[row('good','19.99'),row('bad','9.99',date)];
  for(const ordered of [rows,[...rows].reverse()]){const result=await inspectRows(ordered);assert.equal(result.current,null);assert.ok(result.issues.some(i=>i.code==='INVALID_START_DATE'));}
 }
});
test('non-string resource IDs are rejected in either record order without crashing',async()=>{
 for(const id of [23,{},[],false,' ']){
  const rows=[row('good','19.99'),row(id,'9.99')];
  for(const ordered of [rows,[...rows].reverse()]){const result=await inspectRows(ordered);assert.equal(result.current,null);assert.ok(result.issues.some(i=>i.code==='INVALID_RESOURCE'));}
 }
});
