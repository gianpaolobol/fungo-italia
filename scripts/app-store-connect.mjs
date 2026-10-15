import {createPrivateKey,sign} from 'node:crypto';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const APP='6821140326',TEAM='BX9MDXAHKG',ACCOUNT='gianpaolobol';
function mask(value){if(value)console.log('::add-mask::'+String(value).replace(/\r?\n/g,'%0A'));}
async function graph(query,variables={}){
 const r=await fetch('https://api.expo.dev/graphql',{method:'POST',headers:{Authorization:'Bearer '+process.env.EXPO_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(45000)});
 if(!r.ok)throw Error('Expo authentication failed: HTTP '+r.status);
 const j=await r.json();if(j.errors?.length||!j.data)throw Error('Expo credential access unavailable');
 return j.data;
}
async function credential(){
 if(!process.env.EXPO_TOKEN)throw Error('EXPO_TOKEN missing');
 mask(process.env.EXPO_TOKEN);
 const d=await graph('query($name:String!){account{byName(accountName:$name){appStoreConnectApiKeysPaginated(first:50){edges{node{id keyIdentifier appleTeam{appleTeamIdentifier}}}}}}}',{name:ACCOUNT});
 const keys=d.account.byName.appStoreConnectApiKeysPaginated.edges.map(e=>e.node);
 const teamKeys=keys.filter(k=>k.appleTeam?.appleTeamIdentifier===TEAM);
 const selected=keys.find(k=>k.keyIdentifier==='35MS8YN74G')||(teamKeys.length===1?teamKeys[0]:keys.length===1?keys[0]:null);
 console.log('EXPO_APPLE_KEY_METADATA '+JSON.stringify(keys.map(k=>({keyId:k.keyIdentifier,team:k.appleTeam?.appleTeamIdentifier||null}))));
 if(!selected)throw Error('No unambiguous App Store credential for the authorized Apple team');
 const out=await graph('query($id:ID!){appStoreConnectApiKey{byId(id:$id){keyIdentifier issuerIdentifier keyP8}}}',{id:selected.id});
 const key=out.appStoreConnectApiKey.byId;if(!key?.keyP8||!key.issuerIdentifier)throw Error('App Store credential is incomplete');
 mask(key.keyP8);for(const line of key.keyP8.split(/\r?\n/))mask(line);
 return key;
}
export function appleJwt(key,now=Math.floor(Date.now()/1000)){
 const b64=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
 const body=b64({alg:'ES256',kid:key.keyIdentifier,typ:'JWT'})+'.'+b64({iss:key.issuerIdentifier,iat:now,exp:now+900,aud:'appstoreconnect-v1'});
 return body+'.'+sign('sha256',Buffer.from(body),{key:createPrivateKey(key.keyP8),dsaEncoding:'ieee-p1363'}).toString('base64url');
}
export async function audit(){
 const key=await credential(),jwt=appleJwt(key);mask(jwt);key.keyP8='';
 async function api(path,{method='GET',body}={}){
  if(!path.startsWith('/v1/')&&!path.startsWith('/v2/'))throw Error('Unsupported App Store path');
  const r=await fetch('https://api.appstoreconnect.apple.com'+path,{method,headers:{Authorization:'Bearer '+jwt,Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(45000)});
  const j=r.status===204?{}:await r.json();return r.ok?{ok:true,status:r.status,...j}:{ok:false,status:r.status,codes:(j.errors||[]).map(e=>e.code),sources:(j.errors||[]).map(e=>e.source?.pointer||e.source?.parameter||''),details:(j.errors||[]).map(e=>(e.detail||'').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[redacted]').slice(0,700))};
 }
 async function availabilityResource(){
  const resource=await api('/v2/appAvailabilities/'+APP);
  if(!resource.ok)return resource;
  const related=resource.data.relationships?.territoryAvailabilities?.links?.related;
  if(!related)return {...resource,ok:false,status:422,codes:['TERRITORY_LINK_MISSING']};
  let next=related,rows=[],pages=0;
  while(next){
   const u=new URL(next);if(u.origin!=='https://api.appstoreconnect.apple.com'||++pages>20)throw Error('Unexpected availability pagination');
   const result=await api(u.pathname+u.search);if(!result.ok)return result;
   rows.push(...result.data);next=result.links?.next;
  }
  return {...resource,included:rows};
 }
 const app=await api('/v1/apps/'+APP);
 if(!app.ok)throw Error('App Store access failed HTTP '+app.status+' '+app.codes.join(','));
 if(app.data.attributes.bundleId!=='it.fungoitalia.app')throw Error('Unexpected app identity');
 const report={relatedLinks:Object.fromEntries(Object.entries(app.data.relationships||{}).map(([name,r])=>[name,r.links?.related]).filter(([,url])=>url)),checkedAt:new Date().toISOString(),sourceCommit:process.env.GITHUB_SHA,app:{id:APP,...app.data.attributes},versions:[],appInfos:[],builds:null,pricing:null,availability:null};
 // Only public listing data and completion flags are logged; contact values and credentials are excluded.
 delete report.app.sku;
 const [versions,infos,builds,pricing,availability]=await Promise.all([
 api('/v1/apps/'+APP+'/appStoreVersions?filter[platform]=IOS&limit=20'),
 api('/v1/apps/'+APP+'/appInfos?limit=20'),
 api('/v1/builds?filter[app]='+APP+'&sort=-uploadedDate&limit=10&include=preReleaseVersion'),
 api('/v1/apps/'+APP+'/appPriceSchedule?include=baseTerritory'),
 availabilityResource()]);
 report.builds=builds.ok?builds.data.map(b=>({id:b.id,version:b.attributes.version,processingState:b.attributes.processingState,expired:b.attributes.expired,uploadedDate:b.attributes.uploadedDate,usesNonExemptEncryption:b.attributes.usesNonExemptEncryption,preReleaseVersion:builds.included?.find(i=>i.id===b.relationships?.preReleaseVersion?.data?.id)?.attributes.version})):builds;
 report.pricing=pricing;report.availability=availability;
 const points=await api('/v1/apps/'+APP+'/appPricePoints?filter[territory]=ITA&limit=200&include=territory');
 report.targetPricePoint=points.ok?points.data.find(p=>Number(p.attributes.customerPrice)===9.99)||null:points;
 if(pricing.ok){report.manualPrices=await api('/v1/appPriceSchedules/'+pricing.data.id+'/manualPrices?include=appPricePoint,territory&limit=200');}
 if(versions.ok)for(const v of versions.data){
  const [localizations,review,build]=await Promise.all([api('/v1/appStoreVersions/'+v.id+'/appStoreVersionLocalizations'),api('/v1/appStoreVersions/'+v.id+'/appStoreReviewDetail'),api('/v1/appStoreVersions/'+v.id+'/build')]);
  const row={id:v.id,...v.attributes,build:build.ok?build.data?.id:null,localizations:[],reviewDetails:review.ok?{present:true,contactFirstName:!!review.data.attributes.contactFirstName,contactLastName:!!review.data.attributes.contactLastName,contactPhone:!!review.data.attributes.contactPhone,contactEmail:!!review.data.attributes.contactEmail,demoAccountRequired:review.data.attributes.demoAccountRequired,notesPresent:!!review.data.attributes.notes}:review};
  if(localizations.ok)for(const l of localizations.data){
   const screenshots=await api('/v1/appStoreVersionLocalizations/'+l.id+'/appScreenshotSets?include=appScreenshots');
   row.localizations.push({id:l.id,...l.attributes,screenshots:screenshots.ok?screenshots.data.map(s=>({id:s.id,displayType:s.attributes.screenshotDisplayType,count:s.relationships.appScreenshots?.data?.length||0})):screenshots});
  }
  report.versions.push(row);
 }else report.versionsError=versions;
 if(infos.ok)for(const info of infos.data){
  const [loc,age]=await Promise.all([api('/v1/appInfos/'+info.id+'/appInfoLocalizations'),api('/v1/appInfos/'+info.id+'/ageRatingDeclaration')]);
  report.appInfos.push({id:info.id,...info.attributes,primaryCategory:info.relationships?.primaryCategory?.data?.id||null,secondaryCategory:info.relationships?.secondaryCategory?.data?.id||null,localizations:loc.ok?loc.data.map(l=>({id:l.id,...l.attributes})):loc,ageRating:age.ok?{id:age.data.id,...age.data.attributes}:age});
 }else report.appInfosError=infos;
 if(process.argv.includes('--apply')){
  const config=JSON.parse(await readFile('store/it-IT.json','utf8'));
  if(config.appId!==APP||config.price.baseTerritory!=='ITA'||config.price.customerPrice!=='9.99')throw Error('Unexpected listing configuration');
  for(const [field,max]of [['name',30],['subtitle',30],['keywords',100],['description',4000],['promotionalText',170]])if(typeof config[field]!=='string'||config[field].length>max)throw Error('Invalid store text '+field);
  const version=report.versions.find(v=>v.appStoreState==='PREPARE_FOR_SUBMISSION'),info=report.appInfos.find(i=>i.appStoreState==='PREPARE_FOR_SUBMISSION');
  if(!version||!info)throw Error('No editable initial App Store version; refusing to overwrite another release');
  const localization=version.localizations.find(l=>l.locale==='it'),infoLoc=info.localizations.find(l=>l.locale==='it');
  if(!localization||!infoLoc)throw Error('Italian localization missing');
  const patch=async(type,id,attributes)=>{const result=await api('/v1/'+type+'/'+id,{method:'PATCH',body:{data:{type,id,attributes}}});if(!result.ok)throw Error('App Store update failed '+type+' HTTP '+result.status+' '+result.codes.join(',')+' '+result.sources.join(','));console.log('APP_STORE_UPDATED '+type+' '+Object.keys(attributes).join(','));return result;};
  await patch('appStoreVersionLocalizations',localization.id,Object.fromEntries(['description','keywords','promotionalText','supportUrl','marketingUrl'].map(k=>[k,config[k]])));
  await patch('appInfoLocalizations',infoLoc.id,{name:config.name,subtitle:config.subtitle,privacyPolicyUrl:config.privacyPolicyUrl,privacyChoicesUrl:config.privacyPolicyUrl});
  const review=await api('/v1/appStoreVersions/'+version.id+'/appStoreReviewDetail');
  if(review.ok)await patch('appStoreReviewDetails',review.data.id,{demoAccountRequired:false,demoAccountName:null,demoAccountPassword:null,notes:config.reviewNotes});
  const point=report.targetPricePoint;
  if(!point?.id||Number(point.attributes.customerPrice)!==9.99)throw Error('Exact Italian EUR9.99 Apple price point not found; price unchanged');
  const price=await api('/v1/appPriceSchedules',{method:'POST',body:{data:{type:'appPriceSchedules',relationships:{app:{data:{type:'apps',id:APP}},baseTerritory:{data:{type:'territories',id:'ITA'}},manualPrices:{data:[{type:'appPrices',id:'${italyPrice}'}]}}},included:[{type:'appPrices',id:'${italyPrice}',attributes:{startDate:null,endDate:null},relationships:{appPricePoint:{data:{type:'appPricePoints',id:point.id}}}}]}});
  if(!price.ok)throw Error('Price update failed HTTP '+price.status+' '+price.codes.join(',')+' '+price.sources.join(','));
  console.log('APP_STORE_PRICE_SAVED Italy EUR 9.99');
  report.applied={metadata:true,price:true};
 }
 if(process.argv.includes('--worldwide')){
  let current=await availabilityResource();
  if(!current.ok&&current.status===404){
   const territories=await api('/v1/territories?limit=200');if(!territories.ok||territories.links?.next)throw Error('Complete Apple territory list unavailable');
   const included=territories.data.map(t=>({type:'territoryAvailabilities',id:'${territory-'+t.id+'}',attributes:{available:true,preOrderEnabled:false},relationships:{territory:{data:{type:'territories',id:t.id}}}}));
   const result=await api('/v2/appAvailabilities',{method:'POST',body:{data:{type:'appAvailabilities',attributes:{availableInNewTerritories:true},relationships:{app:{data:{type:'apps',id:APP}},territoryAvailabilities:{data:included.map(t=>({type:t.type,id:t.id}))}}},included}});
   if(!result.ok)throw Error('Worldwide availability create failed HTTP '+result.status+' '+result.codes.join(','));
   current=await availabilityResource();
  }
  if(!current.ok)throw Error('Worldwide availability unavailable HTTP '+current.status+' '+(current.details||[]).join(';'));
  const territories=(current.included||[]).filter(t=>t.type==='territoryAvailabilities');
  if(!territories.length)throw Error('No territory availability records');
  for(const t of territories.filter(t=>!t.attributes.available)){
   const result=await api('/v1/territoryAvailabilities/'+t.id,{method:'PATCH',body:{data:{type:'territoryAvailabilities',id:t.id,attributes:{available:true}}}});
   if(!result.ok)throw Error('Territory update rejected HTTP '+result.status+' '+result.codes.join(','));
  }
  report.availability=await availabilityResource();
  const rows=report.availability.included?.filter(t=>t.type==='territoryAvailabilities')||[];
  report.worldwideVerification={selected:rows.filter(t=>t.attributes.available).length,total:rows.length};
  if(!rows.length||rows.some(t=>!t.attributes.available))throw Error('Worldwide availability not fully confirmed');
  console.log('APP_STORE_WORLDWIDE_CONFIRMED '+JSON.stringify(report.worldwideVerification));
 }
 await mkdir('store-evidence',{recursive:true});await writeFile('store-evidence/app-store-status.json',JSON.stringify(report,null,2)+'\n');
 console.log('APP_STORE_STATUS '+JSON.stringify(report));
}
if(process.argv[1]?.endsWith('/app-store-connect.mjs'))audit().catch(e=>{console.error('APP_STORE_CHECK_FAILED',e.message);process.exitCode=1;});
