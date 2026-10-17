import {mkdir,writeFile} from 'node:fs/promises';
import {createAppleApi} from './app-store-connect.mjs';
import {validateOwnerAssignment} from './testflight-owner-gate.mjs';
const appId='6821140326',buildId='f15030a5-6079-4077-a09c-369431bd3547',groupId='f642807c-e4b2-43d4-a32a-d9fd087fdfe3';
const api=await createAppleApi();
async function get(path){const r=await api(path);if(!r.ok)throw Error('Apple preflight failed: '+r.status+' '+(r.codes||[]).join(','));return r;}
const [app,build,detail,group,members,users,before]=await Promise.all([
 get('/v1/apps/'+appId),get('/v1/builds/'+buildId+'?include=app'),get('/v1/builds/'+buildId+'/buildBetaDetail'),
 get('/v1/betaGroups/'+groupId+'?include=app'),get('/v1/betaGroups/'+groupId+'/betaTesters?limit=200'),
 get('/v1/users?limit=200'),get('/v1/betaGroups/'+groupId+'/builds?limit=200')
]);
const target=validateOwnerAssignment({app:app.data,build:build.data,detail:detail.data.attributes,group:group.data,members,users});
if(before.links?.next)throw Error('Group build list is incomplete');
const alreadyAssigned=before.data.some(b=>b.id===target.buildId);
let status='already-assigned';
if(!alreadyAssigned){
 const result=await api('/v1/betaGroups/'+target.groupId+'/relationships/builds',{method:'POST',body:{data:[{type:'builds',id:target.buildId}]}});
 if(!result.ok)throw Error('Apple build assignment rejected: '+result.status+' '+(result.codes||[]).join(',')+' '+(result.details||[]).join('; '));
 status='assigned';
}
const after=await get('/v1/betaGroups/'+target.groupId+'/builds?limit=200');
if(!after.data.some(b=>b.id===target.buildId))throw Error('Assignment was not confirmed by Apple readback');
const receipt={checkedAt:new Date().toISOString(),...target,status,accountHolderVerified:true,existingTesterCount:1,externalGroupChanged:false,appStoreSelectionChanged:false,diagnosticOnly:true,versions:after.data.map(b=>b.attributes.version)};
await mkdir('store-evidence',{recursive:true});
await writeFile('store-evidence/owner-testflight-assignment.json',JSON.stringify(receipt,null,2)+'\n');
console.log('OWNER_TESTFLIGHT_ASSIGNMENT '+JSON.stringify(receipt));
