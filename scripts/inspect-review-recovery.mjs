import {mkdir,writeFile} from 'node:fs/promises';
import {createAppleApi} from './app-store-connect.mjs';
const api=await createAppleApi();
async function get(path){const r=await api(path);if(!r.ok)throw Error(path+' '+r.status+' '+JSON.stringify({codes:r.codes,details:r.details}));if(r.links?.next)throw Error('Pagination required: '+path);return r;}
const versions=await get('/v1/apps/6821140326/appStoreVersions?filter[platform]=IOS&limit=20');
const builds=await get('/v1/builds?filter[app]=6821140326&sort=-uploadedDate&include=preReleaseVersion&limit=100');
const sub=await get('/v1/subscriptions/6823502997');
const subshot=await get('/v1/subscriptions/6823502997/appStoreReviewScreenshot');
const submissions=await get('/v1/apps/6821140326/reviewSubmissions?limit=50');
const report={checkedAt:new Date().toISOString(),sourceCommit:process.env.GITHUB_SHA,versions:[],builds:builds.data.map(b=>({id:b.id,...b.attributes,marketingVersion:builds.included?.find(i=>i.id===b.relationships?.preReleaseVersion?.data?.id)?.attributes.version})),subscription:{id:sub.data.id,attributes:sub.data.attributes,relationships:sub.data.relationships},subscriptionScreenshot:subshot.data,submissions:submissions.data};
for(const v of versions.data){const build=await get('/v1/appStoreVersions/'+v.id+'/build');const locs=await get('/v1/appStoreVersions/'+v.id+'/appStoreVersionLocalizations');const row={id:v.id,attributes:v.attributes,selectedBuild:build.data?.id??null,localizations:[]};for(const l of locs.data){const sets=await get('/v1/appStoreVersionLocalizations/'+l.id+'/appScreenshotSets?include=appScreenshots&limit=200');row.localizations.push({id:l.id,locale:l.attributes.locale,sets:sets.data,images:sets.included});}report.versions.push(row);}
await mkdir('store-evidence',{recursive:true});await writeFile('store-evidence/review-recovery-inspection.json',JSON.stringify(report,null,2));
console.log('REVIEW_RECOVERY_INSPECTION '+JSON.stringify(report));
