import {readSubscriptionPrices} from './app-store-prices.mjs';
export {readSubscriptionPrices};
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
export async function prepareSubmitCredentials(){
 if(!process.env.RUNNER_TEMP?.startsWith('/'))throw Error('A runner temporary directory is required');
 const config=JSON.parse(await readFile('eas.json','utf8'));
 const ios=config.submit?.production?.ios;
 if(ios?.ascAppId!==APP||ios.appleTeamId!==TEAM)throw Error('Unexpected submit app or team; no credentials written');
 const key=await credential();
 try{
  const path=process.env.RUNNER_TEMP+'/fungo-asc-submit.p8';
  await writeFile(path,key.keyP8,{mode:0o600,flag:'wx'});
  Object.assign(ios,{ascApiKeyPath:path,ascApiKeyId:key.keyIdentifier,ascApiKeyIssuerId:key.issuerIdentifier});
  await writeFile('eas.json',JSON.stringify(config,null,2)+'\n');
  console.log('Authorized App Store submit credentials prepared only in the temporary runner checkout');
 }finally{key.keyP8='';}
}
export function appleJwt(key,now=Math.floor(Date.now()/1000)){
 const b64=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
 const body=b64({alg:'ES256',kid:key.keyIdentifier,typ:'JWT'})+'.'+b64({iss:key.issuerIdentifier,iat:now,exp:now+900,aud:'appstoreconnect-v1'});
 return body+'.'+sign('sha256',Buffer.from(body),{key:createPrivateKey(key.keyP8),dsaEncoding:'ieee-p1363'}).toString('base64url');
}
export async function createAppleApi(){
 const key=await credential(),jwt=appleJwt(key);mask(jwt);key.keyP8='';
 async function api(path,{method='GET',body}={}){
  if(!path.startsWith('/v1/')&&!path.startsWith('/v2/'))throw Error('Unsupported App Store path');
  const r=await fetch('https://api.appstoreconnect.apple.com'+path,{method,headers:{Authorization:'Bearer '+jwt,Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(45000)});
  const j=r.status===204?{}:await r.json();return r.ok?{ok:true,status:r.status,...j}:{ok:false,status:r.status,codes:(j.errors||[]).map(e=>e.code),sources:(j.errors||[]).map(e=>e.source?.pointer||e.source?.parameter||''),details:(j.errors||[]).map(e=>(e.detail||'').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[redacted]').slice(0,700))};
 }
 return api;
}
export async function audit(){
 const api=await createAppleApi();
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
 api('/v1/apps/'+APP+'/appInfos?limit=20&include=primaryCategory,secondaryCategory'),
 api('/v1/builds?filter[app]='+APP+'&sort=-uploadedDate&limit=10&include=preReleaseVersion'),
 api('/v1/apps/'+APP+'/appPriceSchedule?include=baseTerritory'),
 availabilityResource()]);
 report.builds=builds.ok?builds.data.map(b=>({id:b.id,version:b.attributes.version,processingState:b.attributes.processingState,expired:b.attributes.expired,uploadedDate:b.attributes.uploadedDate,usesNonExemptEncryption:b.attributes.usesNonExemptEncryption,preReleaseVersion:builds.included?.find(i=>i.id===b.relationships?.preReleaseVersion?.data?.id)?.attributes.version})):builds;
 report.pricing=pricing;report.availability=availability;
 const points=await api('/v1/apps/'+APP+'/appPricePoints?filter[territory]=ITA&limit=200&include=territory');
 report.targetPricePoint=points.ok?points.data.find(p=>Number(p.attributes.customerPrice)===0)||null:points;
 if(pricing.ok){report.manualPrices=await api('/v1/appPriceSchedules/'+pricing.data.id+'/manualPrices?include=appPricePoint,territory&limit=200');}
 if(versions.ok)for(const v of versions.data){
  const [localizations,review,build]=await Promise.all([api('/v1/appStoreVersions/'+v.id+'/appStoreVersionLocalizations'),api('/v1/appStoreVersions/'+v.id+'/appStoreReviewDetail'),api('/v1/appStoreVersions/'+v.id+'/build')]);
  const row={id:v.id,...v.attributes,relatedLinks:Object.fromEntries(Object.entries(v.relationships||{}).map(([name,r])=>[name,r.links?.related]).filter(([,url])=>url)),build:build.ok?build.data?.id:null,localizations:[],reviewDetails:review.ok?{present:true,contactFirstName:!!review.data.attributes.contactFirstName,contactLastName:!!review.data.attributes.contactLastName,contactPhone:!!review.data.attributes.contactPhone,contactEmail:!!review.data.attributes.contactEmail,demoAccountRequired:review.data.attributes.demoAccountRequired,notesPresent:!!review.data.attributes.notes}:review};
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
  if(config.appId!==APP||config.price.baseTerritory!=='ITA'||config.price.customerPrice!=='0.00')throw Error('Unexpected listing configuration');
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
  if(!point?.id||Number(point.attributes.customerPrice)!==0)throw Error('Free Apple download price point not found; price unchanged');
  const price=await api('/v1/appPriceSchedules',{method:'POST',body:{data:{type:'appPriceSchedules',relationships:{app:{data:{type:'apps',id:APP}},baseTerritory:{data:{type:'territories',id:'ITA'}},manualPrices:{data:[{type:'appPrices',id:'${italyPrice}'}]}}},included:[{type:'appPrices',id:'${italyPrice}',attributes:{startDate:null,endDate:null},relationships:{appPricePoint:{data:{type:'appPricePoints',id:point.id}}}}]}});
  if(!price.ok)throw Error('Price update failed HTTP '+price.status+' '+price.codes.join(',')+' '+price.sources.join(','));
  console.log('APP_STORE_PRICE_SAVED Free download; subscription billed separately');
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
 if(process.argv.includes('--categories')){
  const info=report.appInfos.find(i=>i.appStoreState==='PREPARE_FOR_SUBMISSION');if(!info)throw Error('No editable app information');
  if(!info.primaryCategory||!info.secondaryCategory){
   const relationships={};if(!info.primaryCategory)relationships.primaryCategory={data:{type:'appCategories',id:'EDUCATION'}};if(!info.secondaryCategory)relationships.secondaryCategory={data:{type:'appCategories',id:'REFERENCE'}};
   const result=await api('/v1/appInfos/'+info.id,{method:'PATCH',body:{data:{type:'appInfos',id:info.id,relationships}}});
   if(!result.ok)throw Error('App category update rejected HTTP '+result.status+' '+result.codes.join(','));
   console.log('APP_STORE_CATEGORIES_SAVED Education / Reference');
  }else console.log('APP_STORE_CATEGORIES_ALREADY_PRESENT');
 }
 const groups=await api('/v1/apps/'+APP+'/subscriptionGroups');
 report.subscriptions=[];
 if(groups.ok)for(const group of groups.data){
  const groupVersions=await api('/v1/subscriptionGroups/'+group.id+'/versions');
  if(groupVersions.ok)for(const version of groupVersions.data){version.localizations=await api('/v1/subscriptionGroupVersions/'+version.id+'/localizations');}
  report.subscriptionGroupVersions||=[];report.subscriptionGroupVersions.push({groupId:group.id,...groupVersions});
  const products=await api('/v1/subscriptionGroups/'+group.id+'/subscriptions');
  if(!products.ok)continue;
  for(const product of products.data){
   const [prices,availability,screenshot]=await Promise.all([readSubscriptionPrices(api,product.id,{asOf:report.checkedAt}),api('/v1/subscriptions/'+product.id+'/subscriptionAvailability'),api('/v1/subscriptions/'+product.id+'/appStoreReviewScreenshot')]);
   const versions=await api('/v1/subscriptions/'+product.id+'/versions');
   if(versions.ok)for(const version of versions.data){version.localizations=await api('/v1/subscriptionVersions/'+version.id+'/localizations');}
   const related=availability.data?.relationships?.availableTerritories?.links?.related;
   let selected=null;if(related){const url=new URL(related);if(url.origin==='https://api.appstoreconnect.apple.com'){const r=await api(url.pathname+url.search+(url.search?'&':'?')+'limit=200');if(r.ok&&!r.links?.next)selected=r.data.length;}}
   report.subscriptions.push({id:product.id,groupId:group.id,...product.attributes,metadataVersions:versions,italyPrice:prices.current?.customerPrice??null,italyPricing:prices,configuredPrices:prices.configuredPrices,selectedTerritories:selected,availableInNewTerritories:availability.data?.attributes.availableInNewTerritories,reviewScreenshot:screenshot.ok?{id:screenshot.data?.id,fileName:screenshot.data?.attributes.fileName,state:screenshot.data?.attributes.assetDeliveryState?.state}:null});
  }
 }
 const privacyProbe=await api('/v1/appDataUsages?filter[app]='+APP);
 report.privacyQuestionnaireAccess={ok:privacyProbe.ok,status:privacyProbe.status,codes:privacyProbe.codes||[],entries:Array.isArray(privacyProbe.data)?privacyProbe.data.length:null};
 try{
  const url='https://developer.apple.com/documentation/appstoreconnectapi/submitting-subscriptions-and-subscription-groups-for-app-review.md';
  const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
  if(response.ok){const text=await response.text();report.firstSubscriptionReviewReference={url,checkedAt:new Date().toISOString(),excerpts:text.split('\n').filter(line=>/first|initial|important|binary|appstoreconnect.apple.com/i.test(line)).slice(0,8).map(line=>line.slice(0,1500))};}
 }catch{report.firstSubscriptionReviewReference={retrieved:false};}
 try{
  const response=await fetch('https://expo.dev/privacy',{signal:AbortSignal.timeout(20000)});
  if(response.ok){const html=await response.text();const plain=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');const excerpts=[];for(const match of plain.matchAll(/end.user|IP address|identifiers|retention|retain|device information/gi)){excerpts.push(plain.slice(Math.max(0,match.index-100),match.index+600));if(excerpts.length>=12)break;}report.expoPrivacyReference={url:'https://expo.dev/privacy',checkedAt:new Date().toISOString(),excerpts};}
 }catch{report.expoPrivacyReference={url:'https://expo.dev/privacy',retrieved:false};}
 await mkdir('store-evidence',{recursive:true});await writeFile('store-evidence/app-store-status.json',JSON.stringify(report,null,2)+'\n');
 console.log('APP_STORE_STATUS '+JSON.stringify(report));
}
if(process.argv[1]?.endsWith('/app-store-connect.mjs'))audit().catch(e=>{console.error('APP_STORE_CHECK_FAILED',e.message);process.exitCode=1;});
