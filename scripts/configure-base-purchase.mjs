// Configure only the approved new Base product; never submit or edit an app version.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createAppleApi} from './app-store-connect.mjs';
const config=JSON.parse(await readFile('store/next-release/it-IT.json','utf8')),base=config.basePurchase;
if(config.appId!=='6821140326'||base.productId!=='it.fungoitalia.base.lifetime'||base.type!=='NON_CONSUMABLE'||base.customerPrice!=='9.99'||base.baseTerritory!=='ITA')throw Error('Unexpected authorized Base configuration');
const api=await createAppleApi();
const must=(r,label)=>{if(!r.ok)throw Error(label+' '+r.status+' '+JSON.stringify({codes:r.codes,details:r.details,sources:r.sources}));return r;};
async function all(path){const rows=[];for(let n=0;path&&n<30;n++){const r=must(await api(path),'list');rows.push(...r.data);if(r.links?.next){const u=new URL(r.links.next);if(u.origin!=='https://api.appstoreconnect.apple.com')throw Error('Unexpected pagination');path=u.pathname+u.search;}else path=null;}if(path)throw Error('Incomplete pagination');return rows;}
let products=await all('/v1/apps/'+config.appId+'/inAppPurchasesV2?limit=200'),product=products.find(p=>p.attributes.productId===base.productId);
if(!product)product=must(await api('/v2/inAppPurchases',{method:'POST',body:{data:{type:'inAppPurchases',attributes:{name:base.displayName,productId:base.productId,inAppPurchaseType:base.type,reviewNote:'One-time permanent Base access: all minimum-objective study profiles and one resumable 15-case training session. Additional annual access is separate. No free trial. Intended for the next 1.1 release; do not attach to the current 1.0 review.'},relationships:{app:{data:{type:'apps',id:config.appId}}}}}}),'create approved Base').data;
if(product.attributes.inAppPurchaseType!==base.type)throw Error('Existing Base has an unexpected purchase type');
let versions=await all('/v2/inAppPurchases/'+product.id+'/versions?limit=50');
let version=versions.find(v=>v.attributes.state==='PREPARE_FOR_SUBMISSION');
if(!version&&!versions.length)version=must(await api('/v1/inAppPurchaseVersions',{method:'POST',body:{data:{type:'inAppPurchaseVersions',relationships:{inAppPurchase:{data:{type:'inAppPurchases',id:product.id}}}}}}),'create Base metadata draft').data;
if(version){
 const loc=await all('/v1/inAppPurchaseVersions/'+version.id+'/localizations?limit=50');
 if(!loc.some(l=>l.attributes.locale==='it'))must(await api('/v2/inAppPurchaseLocalizations',{method:'POST',body:{data:{type:'inAppPurchaseLocalizations',attributes:{locale:'it',name:base.displayName,description:base.description},relationships:{version:{data:{type:'inAppPurchaseVersions',id:version.id}}}}}}),'Italian Base localization');
}
let schedule=await api('/v2/inAppPurchases/'+product.id+'/iapPriceSchedule');
if(schedule.status===404){
 const points=await all('/v2/inAppPurchases/'+product.id+'/pricePoints?filter[territory]=ITA&limit=200');
 const point=points.find(p=>p.attributes.customerPrice==='9.99');if(!point)throw Error('Exact EUR9.99 Base price unavailable');
 schedule=await api('/v1/inAppPurchasePriceSchedules',{method:'POST',body:{data:{type:'inAppPurchasePriceSchedules',relationships:{inAppPurchase:{data:{type:'inAppPurchases',id:product.id}},baseTerritory:{data:{type:'territories',id:'ITA'}},manualPrices:{data:[{type:'inAppPurchasePrices',id:'${basePrice}'}]}}},included:[{type:'inAppPurchasePrices',id:'${basePrice}',attributes:{startDate:null,endDate:null},relationships:{inAppPurchaseV2:{data:{type:'inAppPurchases',id:product.id}},inAppPurchasePricePoint:{data:{type:'inAppPurchasePricePoints',id:point.id}}}}]}});
}
must(schedule,'Base price schedule');
const prices=must(await api('/v1/inAppPurchasePriceSchedules/'+schedule.data.id+'/manualPrices?filter[territory]=ITA&include=inAppPurchasePricePoint&limit=200'),'Base price readback');
const current=prices.data.find(p=>!p.attributes.endDate),point=prices.included?.find(p=>p.id===current?.relationships.inAppPurchasePricePoint?.data?.id);
if(point?.attributes.customerPrice!=='9.99')throw Error('Existing Base price differs from approved EUR9.99; no overwrite performed');
let availability=await api('/v2/inAppPurchases/'+product.id+'/inAppPurchaseAvailability');
if(availability.status===404){const territories=await all('/v1/territories?limit=200');availability=await api('/v1/inAppPurchaseAvailabilities',{method:'POST',body:{data:{type:'inAppPurchaseAvailabilities',attributes:{availableInNewTerritories:true},relationships:{inAppPurchase:{data:{type:'inAppPurchases',id:product.id}},availableTerritories:{data:territories.map(t=>({type:'territories',id:t.id}))}}}}});}
must(availability,'Base availability');
const final=must(await api('/v2/inAppPurchases/'+product.id),'Base readback').data;
const report={id:product.id,productId:base.productId,type:final.attributes.inAppPurchaseType,state:final.attributes.state,italyPrice:point.attributes.customerPrice,versionId:version?.id,reviewSubmitted:false,checkedAt:new Date().toISOString()};
await mkdir('store-evidence',{recursive:true});await writeFile('store-evidence/base-purchase.json',JSON.stringify(report,null,2)+'\n');console.log('BASE_PURCHASE_CONFIGURED '+JSON.stringify(report));
