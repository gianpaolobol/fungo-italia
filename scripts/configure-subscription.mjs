import {createAppleApi} from './app-store-connect.mjs';
const api=await createAppleApi(),APP='6821140326';
const must=(r,label)=>{if(!r.ok)throw Error(label+' '+r.status+' '+JSON.stringify({codes:r.codes,details:r.details,sources:r.sources}));return r;};
let groups=must(await api('/v1/apps/'+APP+'/subscriptionGroups'),'groups').data;
let group=groups.find(g=>g.attributes.referenceName==='Fungo Italia Premium');
if(!group)group=must(await api('/v1/subscriptionGroups',{method:'POST',body:{data:{type:'subscriptionGroups',attributes:{referenceName:'Fungo Italia Premium'},relationships:{app:{data:{type:'apps',id:APP}}}}}}),'create group').data;
let subscriptions=must(await api('/v1/subscriptionGroups/'+group.id+'/subscriptions'),'subscriptions').data;
let subscription=subscriptions.find(s=>s.attributes.productId==='it.fungoitalia.premium.annual');
if(!subscription)subscription=must(await api('/v1/subscriptions',{method:'POST',body:{data:{type:'subscriptions',attributes:{name:'Fungo Italia annuale',productId:'it.fungoitalia.premium.annual',subscriptionPeriod:'ONE_YEAR',groupLevel:1,familySharable:false,reviewNote:'Annual access to the complete mycology atlas and photographic exercises. Free preview: all Agaricus educational profiles and repeatable Agaricus training. StoreKit 2 purchase, restore and verified entitlements. No free trial.'},relationships:{group:{data:{type:'subscriptionGroups',id:group.id}}}}}}),'create subscription').data;


async function all(path){let rows=[];for(let page=0;path&&page<30;page++){const r=must(await api(path),'list');rows.push(...r.data);path=r.links?.next?new URL(r.links.next).pathname+new URL(r.links.next).search:null;}if(path)throw Error('Pagination incomplete');return rows;}
const groupLoc=await all('/v1/subscriptionGroups/'+group.id+'/subscriptionGroupLocalizations');
if(!groupLoc.some(l=>l.attributes.locale==='it'))must(await api('/v1/subscriptionGroupLocalizations',{method:'POST',body:{data:{type:'subscriptionGroupLocalizations',attributes:{name:'Fungo Italia Premium',locale:'it'},relationships:{subscriptionGroup:{data:{type:'subscriptionGroups',id:group.id}}}}}}),'group localization');
const loc=await all('/v1/subscriptions/'+subscription.id+'/subscriptionLocalizations');
if(!loc.some(l=>l.attributes.locale==='it'))must(await api('/v1/subscriptionLocalizations',{method:'POST',body:{data:{type:'subscriptionLocalizations',attributes:{name:'Fungo Italia annuale',description:'Atlante completo, esami e aggiornamenti inclusi.',locale:'it'},relationships:{subscription:{data:{type:'subscriptions',id:subscription.id}}}}}}),'subscription localization');
const territories=await all('/v1/territories?limit=200');
let availability=await api('/v1/subscriptions/'+subscription.id+'/subscriptionAvailability');
if(availability.status===404)availability=await api('/v1/subscriptionAvailabilities',{method:'POST',body:{data:{type:'subscriptionAvailabilities',attributes:{availableInNewTerritories:true},relationships:{subscription:{data:{type:'subscriptions',id:subscription.id}},availableTerritories:{data:territories.map(t=>({type:'territories',id:t.id}))}}}}});
must(availability,'subscription availability');
console.log('ANNUAL_AVAILABILITY '+JSON.stringify(availability));

const italy=must(await api('/v1/subscriptions/'+subscription.id+'/pricePoints?filter[territory]=ITA&include=territory&limit=200'),'price points').data.find(p=>p.attributes.customerPrice==='19.99');
if(!italy)throw Error('Exact EUR19.99 annual price missing');
const eq=await all('/v1/subscriptionPricePoints/'+italy.id+'/equalizations?include=territory&limit=200');
const points=[italy,...eq.filter(p=>p.relationships?.territory?.data?.id!=='ITA')];
const existing=await all('/v1/subscriptions/'+subscription.id+'/prices?include=subscriptionPricePoint,territory&limit=200');
const seen=new Set();
for(const p of points){const t=p.relationships?.territory?.data?.id;if(!t||seen.has(t))continue;seen.add(t);
 if(existing.some(e=>e.relationships?.territory?.data?.id===t&&e.relationships?.subscriptionPricePoint?.data?.id===p.id))continue;
 must(await api('/v1/subscriptionPrices',{method:'POST',body:{data:{type:'subscriptionPrices',attributes:{preserveCurrentPrice:true},relationships:{subscription:{data:{type:'subscriptions',id:subscription.id}},subscriptionPricePoint:{data:{type:'subscriptionPricePoints',id:p.id}}}}}}),'price '+t);
}
console.log('ANNUAL_PRICES_SAVED '+JSON.stringify({italy:'19.99 EUR / ONE_YEAR',territories:seen.size}));
must(await api('/v1/subscriptions/'+subscription.id,{method:'PATCH',body:{data:{type:'subscriptions',id:subscription.id,attributes:{reviewNote:'Single ONE_YEAR annual subscription, EUR19.99 in Italy. Free demo includes all Agaricus profiles and repeatable Agaricus training. Full atlas, all exams and Areas require annual access. No permanent Base purchase. No account required.'}}}}),'update subscription review notes');
const freePoints=must(await api('/v1/apps/'+APP+'/appPricePoints?filter[territory]=ITA&limit=200'),'app prices').data;
const free=freePoints.find(p=>Number(p.attributes.customerPrice)===0);if(!free)throw Error('Free download price point missing');
must(await api('/v1/appPriceSchedules',{method:'POST',body:{data:{type:'appPriceSchedules',relationships:{app:{data:{type:'apps',id:APP}},baseTerritory:{data:{type:'territories',id:'ITA'}},manualPrices:{data:[{type:'appPrices',id:'${freeDownload}'}]}}},included:[{type:'appPrices',id:'${freeDownload}',attributes:{startDate:null,endDate:null},relationships:{appPricePoint:{data:{type:'appPricePoints',id:free.id}}}}]}}),'free download');
console.log('FREE_DOWNLOAD_SAVED');
console.log('ANNUAL_VERIFICATION '+JSON.stringify({subscription:await api('/v1/subscriptions/'+subscription.id),localizations:await api('/v1/subscriptions/'+subscription.id+'/subscriptionLocalizations'),prices:await api('/v1/subscriptions/'+subscription.id+'/prices?include=subscriptionPricePoint,territory&limit=200'),appPrices:await api('/v1/appPriceSchedules/'+APP+'/manualPrices?include=appPricePoint,territory&limit=200')}));
