import {mkdir, writeFile} from 'node:fs/promises';
import {createAppleApi} from './app-store-connect.mjs';
const appId='6821140326';
const buildId='f15030a5-6079-4077-a09c-369431bd3547';
const api=await createAppleApi();
const [build,detail,assigned,groups,testers]=await Promise.all([
 api('/v1/builds/'+buildId),
 api('/v1/builds/'+buildId+'/buildBetaDetail'),
 api('/v1/builds/'+buildId+'/betaGroups?limit=200'),
 api('/v1/apps/'+appId+'/betaGroups?limit=200'),
 api('/v1/builds/'+buildId+'/individualTesters?limit=200')
]);
function failure(r){return {ok:false,status:r.status,codes:r.codes};}
function groupRows(r){return r.ok?{ok:true,groups:r.data.map(g=>({id:g.id,...g.attributes})),hasMore:!!r.links?.next}:failure(r);}
const report={checkedAt:new Date().toISOString(),appId,buildId,readOnly:true,
 build:build.ok?{ok:true,id:build.data.id,...build.data.attributes}:failure(build),
 betaDetail:detail.ok?{ok:true,...detail.data.attributes}:failure(detail),
 assignedGroups:groupRows(assigned),appGroups:groupRows(groups),
 individualTesterCount:testers.ok?{ok:true,count:testers.data.length,hasMore:!!testers.links?.next}:failure(testers)};
await mkdir('store-evidence',{recursive:true});
await writeFile('store-evidence/testflight-diagnostic-status.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(!build.ok||build.data.attributes.version!=='11')throw Error('Expected diagnostic build 11 could not be confirmed');
