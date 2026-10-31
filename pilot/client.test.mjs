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
