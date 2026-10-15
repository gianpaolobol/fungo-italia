import {createPrivateKey,sign} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
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
 const keys=d.account.byName.appStoreConnectApiKeysPaginated.edges.map(e=>e.node).filter(k=>k.appleTeam?.appleTeamIdentifier===TEAM);
 const selected=keys.find(k=>k.keyIdentifier==='35MS8YN74G')||(keys.length===1?keys[0]:null);
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
 async function api(path){
  if(!path.startsWith('/v1/')&&!path.startsWith('/v2/'))throw Error('Unsupported App Store path');
  const r=await fetch('https://api.appstoreconnect.apple.com'+path,{headers:{Authorization:'Bearer '+jwt,Accept:'application/json'},signal:AbortSignal.timeout(45000)});
  const j=await r.json();return r.ok?{ok:true,status:r.status,...j}:{ok:false,status:r.status,codes:(j.errors||[]).map(e=>e.code)};
 }
 const app=await api('/v1/apps/'+APP);
 if(!app.ok)throw Error('App Store access failed HTTP '+app.status+' '+app.codes.join(','));
 if(app.data.attributes.bundleId!=='it.fungoitalia.app')throw Error('Unexpected app identity');
 const report={checkedAt:new Date().toISOString(),sourceCommit:process.env.GITHUB_SHA,app:{id:APP,...app.data.attributes},versions:[],appInfos:[],builds:null,pricing:null,availability:null};
 // Only public listing data and completion flags are logged; contact values and credentials are excluded.
 delete report.app.sku;
 const [versions,infos,builds,pricing,availability]=await Promise.all([
 api('/v1/apps/'+APP+'/appStoreVersions?filter[platform]=IOS&limit=20'),
 api('/v1/apps/'+APP+'/appInfos?limit=20'),
 api('/v1/apps/'+APP+'/builds?sort=-uploadedDate&limit=10&include=preReleaseVersion'),
 api('/v1/apps/'+APP+'/appPriceSchedule?include=baseTerritory'),
 api('/v1/apps/'+APP+'/appAvailabilityV2')]);
 report.builds=builds.ok?builds.data.map(b=>({id:b.id,version:b.attributes.version,processingState:b.attributes.processingState,expired:b.attributes.expired,uploadedDate:b.attributes.uploadedDate,usesNonExemptEncryption:b.attributes.usesNonExemptEncryption,preReleaseVersion:builds.included?.find(i=>i.id===b.relationships?.preReleaseVersion?.data?.id)?.attributes.version})):builds;
 report.pricing=pricing;report.availability=availability;
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
  report.appInfos.push({id:info.id,...info.attributes,localizations:loc.ok?loc.data.map(l=>({id:l.id,...l.attributes})):loc,ageRating:age.ok?{id:age.data.id,...age.data.attributes}:age});
 }else report.appInfosError=infos;
 await mkdir('store-evidence',{recursive:true});await writeFile('store-evidence/app-store-status.json',JSON.stringify(report,null,2)+'\n');
 console.log('APP_STORE_STATUS '+JSON.stringify(report));
}
if(process.argv[1]?.endsWith('/app-store-connect.mjs'))audit().catch(e=>{console.error('APP_STORE_CHECK_FAILED',e.message);process.exitCode=1;});
