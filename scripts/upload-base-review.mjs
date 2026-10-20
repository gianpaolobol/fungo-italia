import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createAppleApi} from './app-store-connect.mjs';
const manifest=JSON.parse(await readFile('store/next-release/base-review.json','utf8'));
const product='it.fungoitalia.base.lifetime',subscriptionId='6825025102';
if(manifest.appId!=='6821140326'||manifest.productId!==product||manifest.inAppPurchaseId!==subscriptionId||manifest.sourceCommit!=='1465acecd24bd104e63f46b49868f5ac9f73d484'||manifest.sourceRunId!==39467202425)throw Error('Actual next-release Base capture required');
const bytes=await readFile(manifest.path);
if(createHash('sha256').update(bytes).digest('hex')!==manifest.sha256||bytes[25]!==2)throw Error('Review image mismatch');
const api=await createAppleApi();
const must=(r,label)=>{if(!r.ok)throw Error(label+' '+r.status+' '+JSON.stringify({codes:r.codes,details:r.details}));return r;};
const sub=must(await api('/v2/inAppPurchases/'+subscriptionId),'subscription').data;
if(sub.attributes.productId!==product||sub.attributes.inAppPurchaseType!=='NON_CONSUMABLE')throw Error('Unexpected subscription');
const fileName='fungo-italia-base-paywall-'+manifest.sourceCommit.slice(0,8)+'.png';
let current=await api('/v2/inAppPurchases/'+subscriptionId+'/appStoreReviewScreenshot');
let screenshot=current.ok?current.data:null;
if(screenshot?.attributes.fileName!==fileName||screenshot?.attributes.assetDeliveryState?.state!=='COMPLETE'){
 if(screenshot)throw Error('Existing Base screenshot is different or incomplete; refusing to replace it automatically');
 screenshot=must(await api('/v1/inAppPurchaseAppStoreReviewScreenshots',{method:'POST',body:{data:{type:'inAppPurchaseAppStoreReviewScreenshots',attributes:{fileName,fileSize:bytes.length},relationships:{inAppPurchaseV2:{data:{type:'inAppPurchases',id:subscriptionId}}}}}}),'reserve review screenshot').data;
 const operations=screenshot.attributes.uploadOperations;
 if(!Array.isArray(operations)||!operations.length)throw Error('Missing upload operations');
 for(const op of operations){
  const url=new URL(op.url);
  if(url.protocol!=='https:'||op.method!=='PUT'||!Number.isInteger(op.offset)||!Number.isInteger(op.length)||op.offset<0||op.length<1||op.offset+op.length>bytes.length)throw Error('Invalid upload operation');
  const r=await fetch(url,{method:'PUT',headers:Object.fromEntries((op.requestHeaders||[]).map(h=>[h.name,h.value])),body:bytes.subarray(op.offset,op.offset+op.length),redirect:'error',signal:AbortSignal.timeout(90000)});
  if(!r.ok)throw Error('Review screenshot transfer failed HTTP '+r.status);
 }
 must(await api('/v1/inAppPurchaseAppStoreReviewScreenshots/'+screenshot.id,{method:'PATCH',body:{data:{type:'inAppPurchaseAppStoreReviewScreenshots',id:screenshot.id,attributes:{uploaded:true,sourceFileChecksum:createHash('md5').update(bytes).digest('hex')}}}}),'commit review screenshot');
 for(let i=0;i<24;i++){
  screenshot=must(await api('/v1/inAppPurchaseAppStoreReviewScreenshots/'+screenshot.id),'verify review screenshot').data;
  const state=screenshot.attributes.assetDeliveryState?.state;
  if(state==='COMPLETE')break;
  if(state==='FAILED'||i===23)throw Error('Review screenshot processing '+state);
  await new Promise(r=>setTimeout(r,5000));
 }
}
console.log('BASE_REVIEW_SCREENSHOT_COMPLETE '+JSON.stringify({id:screenshot.id,fileName,state:screenshot.attributes.assetDeliveryState?.state}));
console.log('BASE_FINAL_STATE '+JSON.stringify(must(await api('/v2/inAppPurchases/'+subscriptionId),'readback subscription').data));
