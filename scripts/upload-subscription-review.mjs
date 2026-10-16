import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createAppleApi} from './app-store-connect.mjs';
const manifest=JSON.parse(await readFile('store/screenshots/manifest.json','utf8'));
const product='it.fungoitalia.premium.annual',subscriptionId='6823502997';
if(manifest.billingProduct!==product||manifest.subscriptionReviewImage!=='store/screenshots/iphone/03-esame.png')throw Error('Reviewed annual paywall capture required');
const image=manifest.images.find(i=>i.path===manifest.subscriptionReviewImage);
if(!image)throw Error('Review image missing');
const bytes=await readFile(image.path);
if(createHash('sha256').update(bytes).digest('hex')!==image.sha256||bytes[25]!==2)throw Error('Review image mismatch');
const api=await createAppleApi();
const must=(r,label)=>{if(!r.ok)throw Error(label+' '+r.status+' '+JSON.stringify({codes:r.codes,details:r.details}));return r;};
const sub=must(await api('/v1/subscriptions/'+subscriptionId),'subscription').data;
if(sub.attributes.productId!==product||sub.attributes.subscriptionPeriod!=='ONE_YEAR')throw Error('Unexpected subscription');
const fileName='fungo-italia-annual-paywall-'+manifest.sourceCommit.slice(0,8)+'.png';
let current=await api('/v1/subscriptions/'+subscriptionId+'/appStoreReviewScreenshot');
let screenshot=current.ok?current.data:null;
if(screenshot?.attributes.fileName!==fileName||screenshot?.attributes.assetDeliveryState?.state!=='COMPLETE'){
 if(screenshot)must(await api('/v1/subscriptionAppStoreReviewScreenshots/'+screenshot.id,{method:'DELETE'}),'replace review screenshot');
 screenshot=must(await api('/v1/subscriptionAppStoreReviewScreenshots',{method:'POST',body:{data:{type:'subscriptionAppStoreReviewScreenshots',attributes:{fileName,fileSize:bytes.length},relationships:{subscription:{data:{type:'subscriptions',id:subscriptionId}}}}}}),'reserve review screenshot').data;
 const operations=screenshot.attributes.uploadOperations;
 if(!Array.isArray(operations)||!operations.length)throw Error('Missing upload operations');
 for(const op of operations){
  const url=new URL(op.url);
  if(url.protocol!=='https:'||op.method!=='PUT'||!Number.isInteger(op.offset)||!Number.isInteger(op.length)||op.offset<0||op.length<1||op.offset+op.length>bytes.length)throw Error('Invalid upload operation');
  const r=await fetch(url,{method:'PUT',headers:Object.fromEntries((op.requestHeaders||[]).map(h=>[h.name,h.value])),body:bytes.subarray(op.offset,op.offset+op.length),redirect:'error',signal:AbortSignal.timeout(90000)});
  if(!r.ok)throw Error('Review screenshot transfer failed HTTP '+r.status);
 }
 must(await api('/v1/subscriptionAppStoreReviewScreenshots/'+screenshot.id,{method:'PATCH',body:{data:{type:'subscriptionAppStoreReviewScreenshots',id:screenshot.id,attributes:{uploaded:true,sourceFileChecksum:createHash('md5').update(bytes).digest('hex')}}}}),'commit review screenshot');
 for(let i=0;i<24;i++){
  screenshot=must(await api('/v1/subscriptionAppStoreReviewScreenshots/'+screenshot.id),'verify review screenshot').data;
  const state=screenshot.attributes.assetDeliveryState?.state;
  if(state==='COMPLETE')break;
  if(state==='FAILED'||i===23)throw Error('Review screenshot processing '+state);
  await new Promise(r=>setTimeout(r,5000));
 }
}
console.log('SUBSCRIPTION_REVIEW_SCREENSHOT_COMPLETE '+JSON.stringify({id:screenshot.id,fileName,state:screenshot.attributes.assetDeliveryState?.state}));
console.log('SUBSCRIPTION_FINAL_STATE '+JSON.stringify(must(await api('/v1/subscriptions/'+subscriptionId),'readback subscription').data));
