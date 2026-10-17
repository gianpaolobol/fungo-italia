import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateOwnerAssignment} from './testflight-owner-gate.mjs';
const appId='6821140326',buildId='f15030a5-6079-4077-a09c-369431bd3547',groupId='f642807c-e4b2-43d4-a32a-d9fd087fdfe3';
function fixture(){return {
 app:{id:appId,attributes:{bundleId:'it.fungoitalia.app'}},
 build:{id:buildId,attributes:{version:'11',processingState:'VALID',expired:false},relationships:{app:{data:{id:appId}}}},
 detail:{internalBuildState:'READY_FOR_BETA_TESTING'},
 group:{id:groupId,attributes:{name:'Proprietario — prova iPhone',isInternalGroup:true},relationships:{app:{data:{id:appId}}}},
 members:{data:[{id:'52fcf5f3-a3a1-42ea-93b7-869f8ef850a6',attributes:{email:'owner@example.test'}}]},
 users:{data:[{id:'5698d1b1-d3be-4031-b11c-2d82203f274c',attributes:{username:'owner@example.test',roles:['ACCOUNT_HOLDER','ADMIN']}}]}
};}
test('allows only the valid diagnostic build for the single existing account holder',()=>assert.deepEqual(validateOwnerAssignment(fixture()),{appId,buildId,groupId}));
test('rejects an invalid or different binary',()=>{for(const change of [{processingState:'PROCESSING'},{version:'7'},{expired:true}]){const p=fixture();Object.assign(p.build.attributes,change);assert.throws(()=>validateOwnerAssignment(p));}});
test('rejects another app or an external group',()=>{const p=fixture();p.group.attributes.isInternalGroup=false;assert.throws(()=>validateOwnerAssignment(p));const q=fixture();q.build.relationships.app.data.id='another-app';assert.throws(()=>validateOwnerAssignment(q));});
test('rejects expanded or paginated tester audiences',()=>{const p=fixture();p.members.data.push({id:'other',attributes:{email:'other@example.test'}});assert.throws(()=>validateOwnerAssignment(p));const q=fixture();q.members.links={next:'next-page'};assert.throws(()=>validateOwnerAssignment(q));});
test('requires exact tester-account identity and the account holder role',()=>{const p=fixture();p.users.data[0].attributes.username='another@example.test';assert.throws(()=>validateOwnerAssignment(p));const q=fixture();q.users.data[0].attributes.roles=['ADMIN'];assert.throws(()=>validateOwnerAssignment(q));});
test('requires the confirmed internal tester identity',()=>{const p=fixture();p.members.data[0].id='other';assert.throws(()=>validateOwnerAssignment(p));});
