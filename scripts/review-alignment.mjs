import {createAppleApi} from './app-store-connect.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const api=await createAppleApi();
const report={checkedAt:new Date().toISOString(),appId:'6821140326',submissions:[]};
const result=await api('/v1/apps/6821140326/reviewSubmissions?limit=50');
report.listStatus=result.status;report.listCodes=result.codes||[];
for(const submission of result.data||[]){const items=await api('/v1/reviewSubmissions/'+encodeURIComponent(submission.id)+'/items?limit=50&include=appStoreVersion,subscriptionVersion,subscriptionGroupVersion');for(const item of items.data||[]){for(const relation of Object.values(item.relationships||{})){if(relation.data||!relation.links?.self)continue;const url=new URL(relation.links.self);if(url.origin!=='https://api.appstoreconnect.apple.com')throw Error('Unexpected related origin');const linked=await api(url.pathname+url.search);if(linked.ok)relation.data=linked.data;}}report.submissions.push({id:submission.id,state:submission.attributes?.state,submittedDate:submission.attributes?.submittedDate,itemStatus:items.status,itemCodes:items.codes||[],itemDetails:items.details||[],included:(items.included||[]).map(v=>({type:v.type,id:v.id})),items:(items.data||[]).map(i=>({id:i.id,state:i.attributes?.state,resources:Object.fromEntries(Object.entries(i.relationships||{}).filter(([,r])=>r.data).map(([name,r])=>[name,r.data]))}))});}
await mkdir('store-evidence',{recursive:true});await writeFile('store-evidence/review-alignment.json',JSON.stringify(report,null,2));console.log('REVIEW_ALIGNMENT '+JSON.stringify(report));
