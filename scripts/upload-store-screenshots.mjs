import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createAppleApi} from './app-store-connect.mjs';
const APP='6821140326';
const manifest=JSON.parse(await readFile('store/screenshots/manifest.json','utf8'));
if(!/^[a-f0-9]{40}$/.test(manifest.sourceCommit)||manifest.images?.length!==6)throw Error('Invalid screenshot provenance manifest');
const api=await createAppleApi();
const must=(r,operation)=>{if(!r.ok)throw Error(operation+' HTTP '+r.status+' '+(r.codes||[]).join(',')+' '+(r.details||[]).join(';'));return r;};
const versions=must(await api('/v1/apps/'+APP+'/appStoreVersions?filter[platform]=IOS'),'Read app version');
const version=versions.data.find(v=>v.attributes.appStoreState==='PREPARE_FOR_SUBMISSION');
if(!version)throw Error('No editable initial version; refusing screenshot changes');
const loc=must(await api('/v1/appStoreVersions/'+version.id+'/appStoreVersionLocalizations'),'Read localizations').data.find(l=>l.attributes.locale==='it');
if(!loc)throw Error('Italian listing missing');
let sets=must(await api('/v1/appStoreVersionLocalizations/'+loc.id+'/appScreenshotSets'),'Read screenshot sets').data;
const results=[];
for(const family of ['iphone','ipad']){
 const displayType=family==='iphone'?'APP_IPHONE_67':'APP_IPAD_PRO_3GEN_129';
 let set=sets.find(s=>s.attributes.screenshotDisplayType===displayType);
 if(!set)set=must(await api('/v1/appScreenshotSets',{method:'POST',body:{data:{type:'appScreenshotSets',attributes:{screenshotDisplayType:displayType},relationships:{appStoreVersionLocalization:{data:{type:'appStoreVersionLocalizations',id:loc.id}}}}}}),'Create '+family+' screenshot set').data;
 let existing=must(await api('/v1/appScreenshotSets/'+set.id+'/appScreenshots'),'Read screenshots').data;
 const selected=[];
 for(const image of manifest.images.filter(i=>i.family===family).sort((a,b)=>a.path.localeCompare(b.path))){
  if(!/^store\/screenshots\/(iphone|ipad)\/0[123]-(studio|aree|esame)\.png$/.test(image.path))throw Error('Unexpected screenshot path');
  const bytes=await readFile(image.path);
  if(bytes.length!==image.byteLength||createHash('sha256').update(bytes).digest('hex')!==image.sha256||bytes.toString('hex',0,8)!=='89504e470d0a1a0a')throw Error('Screenshot content mismatch');
  if(bytes[24]!==8||bytes[25]!==2)throw Error('App Store screenshots must be opaque RGB PNGs');
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  if(width!==image.width||height!==image.height||(family==='iphone'&&(width!==1320||height!==2868))||(family==='ipad'&&(width!==2064||height!==2752)))throw Error('Screenshot dimensions mismatch');
  const fileName='fungo-italia-native-'+manifest.sourceCommit.slice(0,8)+'-'+family+'-'+image.path.split('/').at(-1);
  let screenshot=existing.find(s=>s.attributes.fileName===fileName&&s.attributes.assetDeliveryState?.state==='COMPLETE');
  if(!screenshot){
   const reservation=must(await api('/v1/appScreenshots',{method:'POST',body:{data:{type:'appScreenshots',attributes:{fileName,fileSize:bytes.length},relationships:{appScreenshotSet:{data:{type:'appScreenshotSets',id:set.id}}}}}}),'Reserve screenshot');
   screenshot=reservation.data;
   const operations=screenshot.attributes.uploadOperations;
   if(!Array.isArray(operations)||!operations.length)throw Error('Apple upload operations missing');
   for(const op of operations){
    const url=new URL(op.url);if(url.protocol!=='https:'||op.method!=='PUT'||!Number.isInteger(op.offset)||!Number.isInteger(op.length)||op.offset<0||op.length<1||op.offset+op.length>bytes.length)throw Error('Invalid Apple upload operation');
    const headers=Object.fromEntries((op.requestHeaders||[]).map(h=>[h.name,h.value]));
    // Only the returned upload headers are sent. Never forward the App Store JWT.
    const upload=await fetch(url,{method:'PUT',headers,body:bytes.subarray(op.offset,op.offset+op.length),redirect:'error',signal:AbortSignal.timeout(90000)});
    if(!upload.ok)throw Error('Apple image transfer rejected HTTP '+upload.status);
   }
   must(await api('/v1/appScreenshots/'+screenshot.id,{method:'PATCH',body:{data:{type:'appScreenshots',id:screenshot.id,attributes:{uploaded:true,sourceFileChecksum:createHash('md5').update(bytes).digest('hex')}}}}),'Commit screenshot');
   for(let attempt=0;attempt<24;attempt++){
    screenshot=must(await api('/v1/appScreenshots/'+screenshot.id),'Verify screenshot').data;
    const state=screenshot.attributes.assetDeliveryState?.state;
    if(state==='COMPLETE')break;
    if(state==='FAILED')throw Error('Apple rejected screenshot processing: '+JSON.stringify(screenshot.attributes.assetDeliveryState.errors||[]));
    if(attempt===23)throw Error('Screenshot processing still pending');
    await new Promise(resolve=>setTimeout(resolve,5000));
   }
  }
  selected.push({type:'appScreenshots',id:screenshot.id});results.push({id:screenshot.id,family,fileName,state:screenshot.attributes.assetDeliveryState?.state});
  console.log('APPLE_SCREENSHOT_VERIFIED '+JSON.stringify(results.at(-1)));
 }
 // Replace only prior screenshots managed by this pipeline, after all new images are COMPLETE.
 const obsolete=existing.filter(s=>s.attributes.fileName?.startsWith('fungo-italia-native-')&&!selected.some(x=>x.id===s.id));
 for(const old of obsolete){must(await api('/v1/appScreenshots/'+old.id,{method:'DELETE'}),'Remove obsolete managed screenshot');console.log('APPLE_OLD_MANAGED_SCREENSHOT_REMOVED '+old.id);}
 const retained=existing.filter(s=>!selected.some(x=>x.id===s.id)&&!obsolete.some(x=>x.id===s.id)).map(s=>({type:'appScreenshots',id:s.id}));
 must(await api('/v1/appScreenshotSets/'+set.id+'/relationships/appScreenshots',{method:'PATCH',body:{data:[...selected,...retained]}}),'Order screenshots');
}
await mkdir('store-evidence',{recursive:true});await writeFile('store-evidence/screenshot-upload.json',JSON.stringify({appId:APP,versionId:version.id,sourceCommit:manifest.sourceCommit,images:results},null,2)+'\n');
console.log('APPLE_SCREENSHOTS_COMPLETE '+results.length);
