import test from 'node:test';
import assert from 'node:assert/strict';
import {createCourseClient} from './client.mjs';
const a={accountId:'student-a',sessionId:'session-a',accessToken:'user-token-a'};
const endpoint='https://pilotexample.supabase.co';
test('client requests private course metadata using current session, never beta entitlement',async()=>{
  let seen;
  const client=createCourseClient({endpoint,publicKey:'anon',getSession:async()=>a,
    fetcher:async(url,options)=>{seen={url,options};return Response.json([{id:'course-a',title:'Corso A'}]);}});
  assert.deepEqual(await client.listCourses(),[{id:'course-a',title:'Corso A'}]);
  assert.equal(client.apiVersion,1);
  assert.equal(seen.options.headers['Accept-Profile'],'pilot');
  assert.equal(seen.options.headers.Authorization,'Bearer user-token-a');
});
test('logout or account change discards an in-flight response without writing local history',async()=>{
  let session=a,finish;
  const client=createCourseClient({endpoint,publicKey:'anon',getSession:async()=>session,
    fetcher:()=>new Promise(resolve=>{finish=resolve;})});
  const result=client.listCourses();await new Promise(resolve=>setImmediate(resolve));
  session=null;finish(Response.json([{id:'old-account-course'}]));
  await assert.rejects(result,/session_changed/);
});
test('anonymous, unauthorized and malformed responses fail closed; no local fallback',async()=>{
  let calls=0;
  const client=createCourseClient({endpoint,publicKey:'anon',getSession:async()=>null,fetcher:async()=>{calls++;}});
  await assert.rejects(client.listCourses(),/sign_in_required/);assert.equal(calls,0);
  for(const response of [new Response('',{status:403}),Response.json({error:'bad'})]) {
    const c=createCourseClient({endpoint,publicKey:'anon',getSession:async()=>a,fetcher:async()=>response});
    await assert.rejects(c.listCourses());
  }
});
test('materials query requires a UUID course and returns only public metadata columns',async()=>{
  let seen;
  const client=createCourseClient({endpoint,publicKey:'anon',getSession:async()=>a,
    fetcher:async(url)=>{seen=new URL(url);return Response.json([]);}});
  await assert.rejects(client.listMaterials('../all'),/invalid_course/);
  assert.deepEqual(await client.listMaterials('10000000-0000-0000-0000-000000000001'),[]);
  assert.equal(seen.searchParams.get('course_id'),'eq.10000000-0000-0000-0000-000000000001');
  assert.equal(seen.searchParams.get('select').includes('object_key'),false);
});
test('account change while response body is arriving discards old private metadata',async()=>{
  let session={...a},completeBody;
  const client=createCourseClient({endpoint,publicKey:'anon',getSession:async()=>session,
    fetcher:async()=>({ok:true,json:()=>new Promise(resolve=>{completeBody=resolve;})})});
  const pending=client.listCourses();await new Promise(resolve=>setImmediate(resolve));
  // Mutating the session object also cannot change the captured request identity.
  session.accountId='student-b';session.sessionId='session-b';
  completeBody([{id:'private-a',title:'A private title'}]);
  await assert.rejects(pending,/session_changed/);
});
test('v1 course/group/invitation mutations use typed RPC payloads and private schema',async()=>{
  const cid='10000000-0000-0000-0000-000000000001',gid='20000000-0000-0000-0000-000000000001',iid='30000000-0000-0000-0000-000000000001';
  const calls=[];
  const client=createCourseClient({endpoint,publicKey:'anon',getSession:async()=>a,fetcher:async(url,options)=>{
    const name=url.split('/').at(-1);calls.push({name,options});
    return Response.json(name==='invite_students'?[{id:iid,email:'student@example.test',accepted:false}]:name==='my_invitations'?[]:name.startsWith('revoke_')?null:cid);
  }});
  assert.equal(await client.createCourse('Corso'),cid);
  await client.createGroup(cid,'Gruppo A');
  assert.deepEqual(await client.inviteStudents(cid,[gid],['student@example.test']),[{id:iid,email:'student@example.test',accepted:false}]);
  assert.deepEqual(await client.listInvitations(),[]);
  await client.acceptInvitation(iid);await client.revokeInvitation(iid);await client.revokeMembership(iid);await client.resendInvitation(iid);
  assert.equal(calls.length,8);
  for(const c of calls){assert.equal(c.options.method,'POST');assert.equal(c.options.headers['Content-Profile'],'pilot');}
  assert.deepEqual(JSON.parse(calls[2].options.body),{course_id:cid,group_ids:[gid],emails:['student@example.test']});
});
test('invalid RPC IDs and oversized batches do not reach server',async()=>{
  let calls=0;const c=createCourseClient({endpoint,publicKey:'anon',getSession:async()=>a,fetcher:async()=>{calls++;return Response.json(null);}});
  await assert.rejects(c.acceptInvitation('bad'),/invalid_id/);
  await assert.rejects(c.inviteStudents('10000000-0000-0000-0000-000000000001',[],['a@example.test']),/invalid_groups/);
  await assert.rejects(c.inviteStudents('10000000-0000-0000-0000-000000000001',['20000000-0000-0000-0000-000000000001'],Array(31).fill('a@example.test')),/invalid_emails/);
  assert.equal(calls,0);
});
