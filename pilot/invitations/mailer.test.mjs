import test from 'node:test';
import assert from 'node:assert/strict';
import {runInvitationBatch,invitationWorker} from './mailer.mjs';
const job={id:'10000000-0000-0000-0000-000000000001',claim_id:'20000000-0000-0000-0000-000000000001',invitation_id:'30000000-0000-0000-0000-000000000001',email:'student@example.test',title:'Corso pilota'};
function setup(){
  const env={ENABLED:'true',SUPABASE_URL:'https://pilotexample.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'private-service-role',BREVO_API_KEY:'private-mail-key',MAIL_FROM:'courses@example.test',APP_ENTRY_URL:'https://courses.example.test/'};
  const calls=[];let mailFail=false,finishFail=false;
  const f=async(url,options)=>{
    calls.push({url,options});
    if(url.endsWith('/rpc/claim_invite_notices'))return Response.json([job]);
    if(url.endsWith('/rpc/authorize_invite_notice'))return Response.json(true);
    if(url.endsWith('/rpc/finish_invite_notice'))return finishFail?new Response('internal-secret',{status:503}):Response.json(true);
    assert.equal(url,'https://api.brevo.com/v3/smtp/email');
    return mailFail?new Response('provider-secret',{status:503}):Response.json({messageId:'provider-receipt'},{status:201});
  };
  return {env,calls,f,setMailFail(v){mailFail=v;},setFinishFail(v){finishFail=v;}};
}
test('mailer claims at most ten jobs and records provider acceptance without claiming delivery',async()=>{
  const h=setup();assert.deepEqual(await runInvitationBatch(h.env,h.f),{claimed:1,accepted:1,uncertain:0,cancelled:0});
  assert.deepEqual(JSON.parse(h.calls[0].options.body),{batch_limit:10});
  assert.equal(h.calls[0].options.headers['Content-Profile'],'pilot');
  const message=JSON.parse(h.calls[2].options.body);
  assert.equal(message.to[0].email,job.email);assert.match(message.textContent,/stessa email/i);
  assert.equal(message.textContent.includes('private-service-role'),false);
  assert.deepEqual(JSON.parse(h.calls[3].options.body),{job_id:job.id,claim_id:job.claim_id,accepted:true});
});
test('email rejection/ambiguous timeout is finished as uncertain and never retried within batch',async()=>{
  const h=setup();h.setMailFail(true);
  assert.deepEqual(await runInvitationBatch(h.env,h.f),{claimed:1,accepted:0,uncertain:1,cancelled:0});
  assert.equal(h.calls.filter(c=>c.url.includes('brevo')).length,1);
  assert.equal(JSON.parse(h.calls.at(-1).options.body).accepted,false);
});
test('failed persistence propagates; claimed DB jobs remain nonretryable for operator reconciliation',async()=>{
  const h=setup();h.setFinishFail(true);await assert.rejects(runInvitationBatch(h.env,h.f),/outbox_record_failed/);
  assert.equal(h.calls.filter(c=>c.url.includes('brevo')).length,1);
});
test('disabled dispatcher is inert and bad config never receives service credentials',async()=>{
  const h=setup();await runInvitationBatch({...h.env,ENABLED:'false'},h.f);assert.equal(h.calls.length,0);
  for(const url of ['http://pilotexample.supabase.co','https://attacker.test','https://pilotexample.supabase.co@attacker.test'])
    await assert.rejects(runInvitationBatch({...h.env,SUPABASE_URL:url},h.f));
  assert.equal(h.calls.length,0);
});
test('malformed or oversized DB claim result fails closed before sending',async()=>{
  const h=setup();
  for(const jobs of [[{...job,email:'bad\r\nBcc:evil@example.test'}],Array(11).fill(job),{jobs:[job]}])
    await assert.rejects(runInvitationBatch(h.env,async()=>Response.json(jobs)),/invalid_outbox_batch/);
});
test('HTTP has no dispatch endpoint',async()=>{
  const h=setup();assert.equal((await invitationWorker.fetch(new Request('https://mailer.test/run',{method:'POST'}),h.env)).status,404);
  assert.equal(h.calls.length,0);
});
test('revoked invitation between claim and send is rechecked and never emailed',async()=>{
  const h=setup();let sends=0;
  const f=async(url,options)=>{
    if(url.endsWith('/rpc/authorize_invite_notice'))return Response.json(false);
    if(url.includes('brevo'))sends++;
    return h.f(url,options);
  };
  const result=await runInvitationBatch(h.env,f);
  assert.equal(sends,0);assert.equal(result.cancelled,1);assert.equal(result.accepted,0);
});
