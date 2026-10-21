import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createAppleApi} from './app-store-connect.mjs';
const api=await createAppleApi(),APP='6821140326',VERSION='f3a1168b-ada0-4e69-abc9-e66ee9718d81';
const config=JSON.parse(await readFile('store/it-IT.json','utf8'));
if(config.appId!==APP||config.subscription?.customerPrice!=='19.99'||config.subscription?.productId!=='it.fungoitalia.premium.annual'||!config.description.includes('Agaricus'))throw Error('Unexpected recovery policy');
async function must(path,options){const r=await api(path,options);if(!r.ok)throw Error(path+' '+r.status+' '+JSON.stringify({codes:r.codes,details:r.details}));if(r.links?.next)throw Error('Incomplete response '+path);return r;}
const version=(await must('/v1/appStoreVersions/'+VERSION)).data;
if(version.attributes.versionString!=='1.0'||!['REJECTED','METADATA_REJECTED','PREPARE_FOR_SUBMISSION'].includes(version.attributes.appStoreState))throw Error('Only rejected initial version may be corrected');
const locs=await must('/v1/appStoreVersions/'+VERSION+'/appStoreVersionLocalizations');
const loc=locs.data.find(l=>l.attributes.locale==='it');if(!loc)throw Error('Missing Italian localization');
for(const [field,max] of [['description',4000],['keywords',100],['promotionalText',170]])if(typeof config[field]!=='string'||config[field].length>max)throw Error('Invalid '+field);
async function patch(type,id,attributes){return must('/v1/'+type+'/'+id,{method:'PATCH',body:{data:{type,id,attributes}}});}
await patch('appStoreVersionLocalizations',loc.id,Object.fromEntries(['description','keywords','promotionalText','supportUrl','marketingUrl'].map(k=>[k,config[k]])));
const review=(await must('/v1/appStoreVersions/'+VERSION+'/appStoreReviewDetail')).data;
await patch('appStoreReviewDetails',review.id,{notes:config.reviewNotes,demoAccountRequired:false,demoAccountName:null,demoAccountPassword:null});
const verify=(await must('/v1/appStoreVersionLocalizations/'+loc.id)).data;
if(verify.attributes.description!==config.description)throw Error('Listing readback mismatch');
const groups=await must('/v1/apps/'+APP+'/subscriptionGroups');
const inventory={checkedAt:new Date().toISOString(),appVersion:version.attributes.versionString,metadataUpdated:true,subscriptionVersions:await must('/v1/subscriptions/6823502997/versions'),groupVersions:[],submissionItems:await must('/v1/reviewSubmissions/126bebb5-1470-4347-9e04-5f95e0391cab/items?include=appStoreVersion,subscriptionVersion,subscriptionGroupVersion'),reviewSubmitted:false};
for(const g of groups.data)inventory.groupVersions.push({group:g.id,versions:await must('/v1/subscriptionGroups/'+g.id+'/versions')});
await mkdir('store-evidence',{recursive:true});await writeFile('store-evidence/review-recovery-metadata.json',JSON.stringify(inventory,null,2));console.log('REVIEW_RECOVERY_METADATA '+JSON.stringify(inventory));
