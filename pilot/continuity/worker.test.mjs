import test from 'node:test';
import assert from 'node:assert/strict';
import {runScheduled, serveStatus, monitorWorker} from './worker.mjs';

const start=Date.parse('2026-11-01T00:00:00Z');
function setup(){
  const values=new Map();const calls=[];
  const env={ENABLED:'true',MODE:'database',STATUS_TOKEN:'x'.repeat(40),
    SUPABASE_URL:'https://pilotexample.supabase.co',SUPABASE_ANON_KEY:'anon',
    BREVO_API_KEY:'mail-key',MAIL_FROM:'monitor@example.org',MAIL_TO:'owner@example.org',NOTICES_ENABLED:'true',
    STATE:{async get(k){return values.get(k)||null;},async put(k,v){values.set(k,JSON.parse(v));}}};
  let healthy=true,mailError=false;
  const fetcher=async(url,options)=>{
    calls.push({url,options});
    if(url.startsWith(env.SUPABASE_URL))return healthy?Response.json([{id:1,schema_version:1}]):new Response('internal-secret',{status:503});
    assert.equal(url,'https://api.brevo.com/v3/smtp/email');
    return mailError?new Response('provider-secret',{status:503}):Response.json({messageId:'receipt-test'},{status:201});
  };
  return {env,values,calls,fetcher,setHealthy(v){healthy=v;},setMailError(v){mailError=v;}};
}
test('scheduled run persists real DB success outside Supabase; status is private and no-cache',async()=>{
  const h=setup();await runScheduled(h.env,start,h.fetcher);
  const unauthorized=await serveStatus(new Request('https://monitor.test/status'),h.env,start+1);
  assert.equal(unauthorized.status,401);
  const res=await serveStatus(new Request('https://monitor.test/status',{headers:{Authorization:'Bearer '+h.env.STATUS_TOKEN}}),h.env,start+1);
  assert.equal(res.status,200);assert.equal(res.headers.get('Cache-Control'),'no-store');
  assert.equal((await res.json()).healthy,true);
  assert.equal(h.calls.length,1);
});
test('DB outage rejects scheduler execution, sends one notice after two failures, then recovery',async()=>{
  const h=setup();h.setHealthy(false);
  await assert.rejects(runScheduled(h.env,start,h.fetcher),/database_unavailable/);
  await assert.rejects(runScheduled(h.env,start+21600000,h.fetcher),/database_unavailable/);
  await assert.rejects(runScheduled(h.env,start+21600000,h.fetcher));
  assert.equal(h.calls.filter(c=>c.url.includes('brevo')).length,1);
  h.setHealthy(true);await runScheduled(h.env,start+43200000,h.fetcher);
  assert.equal(h.calls.filter(c=>c.url.includes('brevo')).length,2);
  assert.equal(JSON.stringify(h.values.get('database')).includes('internal-secret'),false);
});
test('ambiguous email failure is visible and is not immediately retried',async()=>{
  const h=setup();h.setHealthy(false);h.setMailError(true);
  await assert.rejects(runScheduled(h.env,start,h.fetcher));
  await assert.rejects(runScheduled(h.env,start+21600000,h.fetcher));
  assert.equal(h.values.get('database').delivery.status,'failed_or_unknown');
  await assert.rejects(runScheduled(h.env,start+43200000,h.fetcher));
  assert.equal(h.calls.filter(c=>c.url.includes('brevo')).length,1);
});
test('weekly email uses real observations and never claims suspension is impossible',async()=>{
  const h=setup();await runScheduled(h.env,start,h.fetcher);await runScheduled(h.env,start+7*86400000,h.fetcher);
  const body=JSON.parse(h.calls.at(-1).options.body);
  assert.equal(body.to[0].email,'owner@example.org');
  assert.match(body.textContent,/nessuna garanzia/i);
  assert.equal(h.values.get('database').delivery.status,'accepted');
});
test('missing storage or notices config fails before DB request; disabled scheduler is inert',async()=>{
  const h=setup();
  await assert.rejects(runScheduled({...h.env,STATE:null},start,h.fetcher));
  await assert.rejects(runScheduled({...h.env,MAIL_TO:''},start,h.fetcher));
  await runScheduled({...h.env,ENABLED:'false'},start,h.fetcher);
  assert.equal(h.calls.length,0);
});
test('stale scheduler and failed email are exposed independently from database health',async()=>{
  const h=setup();await runScheduled(h.env,start,h.fetcher);
  const req=new Request('https://monitor.test/status',{headers:{Authorization:'Bearer '+h.env.STATUS_TOKEN}});
  assert.equal((await serveStatus(req,h.env,start+15*3600000)).status,503);
});
test('persistence failure does not send a notice or report a successful run',async()=>{
  const h=setup();h.setHealthy(false);
  h.env.STATE.put=async()=>{throw Error('storage unavailable');};
  await assert.rejects(runScheduled(h.env,start,h.fetcher));
  assert.equal(h.calls.filter(c=>c.url.includes('brevo')).length,0);
});
test('watchdog detects an unavailable monitor without depending on Supabase',async()=>{
  const h=setup();h.env.MODE='watchdog';h.env.WATCH_URL='https://pilot-monitor.example.workers.dev/status';h.env.WATCH_TOKEN='y'.repeat(40);
  const f=async(url,opts)=>url===h.env.WATCH_URL?new Response('',{status:503}):h.fetcher(url,opts);
  await assert.rejects(runScheduled(h.env,start,f),/monitor_unavailable/);
  await assert.rejects(runScheduled(h.env,start+21600000,f));
  assert.equal(h.calls.filter(c=>c.url.includes('supabase')).length,0);
  assert.equal(h.calls.filter(c=>c.url.includes('brevo')).length,1);
});
test('public HTTP cannot trigger probes, emails or reveal environment',async()=>{
  const h=setup();
  assert.equal((await monitorWorker.fetch(new Request('https://monitor.test/run',{method:'POST'}),h.env)).status,404);
  assert.equal(h.calls.length,0);
});
test('duplicate scheduled event cannot hide previously failed weekly notice',async()=>{
  const h=setup();await runScheduled(h.env,start,h.fetcher);h.setMailError(true);
  const weekly=start+7*86400000;
  await assert.rejects(runScheduled(h.env,weekly,h.fetcher),/notice_delivery_unconfirmed/);
  await assert.rejects(runScheduled(h.env,weekly,h.fetcher),/notice_delivery_unconfirmed/);
  assert.equal(h.calls.filter(c=>c.url.includes('brevo')).length,1);
});
