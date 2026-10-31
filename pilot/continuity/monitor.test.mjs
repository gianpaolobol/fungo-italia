import test from 'node:test';
import assert from 'node:assert/strict';
import {probeDatabase, transition, statusOf, validateConfig} from './monitor.mjs';

const now = Date.parse('2026-11-01T00:00:00Z');
const config = {supabaseUrl:'https://pilotexample.supabase.co', apiKey:'public-test-key', probeToken:'scoped-test-token'};
test('probe requires the actual sentinel row, not just HTTP 200', async () => {
  for (const body of [[], {}, [{id:2}], [{id:1, schema_version:9}], null]) {
    assert.equal((await probeDatabase(config, async()=>Response.json(body))).ok, false);
  }
  let request;
  const result=await probeDatabase(config, async(url, options)=>{
    request={url,options};return Response.json([{id:1,schema_version:1}]);
  });
  assert.deepEqual(result,{ok:true,code:'database_read_ok'});
  assert.match(request.url,/\/rest\/v1\/sentinel\?select=id%2Cschema_version&id=eq\.1&limit=1$/);
  assert.equal(request.options.headers['Accept-Profile'],'pilot_health');
  assert.equal(request.options.headers.Authorization,'Bearer scoped-test-token');
  assert.equal(request.options.redirect,'error');
});
test('probe classifies auth, pause/unavailability and timeout without echoing secrets', async()=>{
  for(const [status,code] of [[401,'database_credentials'],[403,'database_credentials'],[503,'database_unavailable'],[429,'database_rate_limit']]) {
    assert.deepEqual(await probeDatabase(config,async()=>new Response('secret',{status})),{ok:false,code});
  }
  assert.deepEqual(await probeDatabase(config,async()=>{throw new DOMException('secret','TimeoutError');}),{ok:false,code:'database_network'});
});
test('invalid or non-HTTPS project endpoint is rejected before sending credentials',()=>{
  for(const url of ['http://pilotexample.supabase.co','https://attacker.test','https://pilotexample.supabase.co/path','https://user:pass@pilotexample.supabase.co']) {
    assert.throws(()=>validateConfig({...config,supabaseUrl:url}));
  }
  assert.throws(()=>validateConfig({...config,probeToken:''}));
});
test('two consecutive failures alert once, repeated scheduled event does not count twice',()=>{
  const first=transition(null,{ok:false,code:'database_network'},now);
  assert.equal(first.notice,null);
  const duplicate=transition(first.state,{ok:false,code:'database_network'},now);
  assert.equal(duplicate.state.failures,1);
  const second=transition(first.state,{ok:false,code:'database_network'},now+21600000);
  assert.equal(second.notice.type,'outage');
  const third=transition(second.state,{ok:false,code:'database_network'},now+43200000);
  assert.equal(third.notice,null);
  assert.equal(statusOf(third.state,now+43200001).healthy,false);
});
test('recovery reports outage once and clears consecutive failures',()=>{
  let s=transition(null,{ok:false,code:'database_network'},now).state;
  s=transition(s,{ok:false,code:'database_network'},now+21600000).state;
  const recovery=transition(s,{ok:true,code:'database_read_ok'},now+43200000);
  assert.equal(recovery.notice.type,'recovery');
  assert.equal(recovery.state.failures,0);
  assert.equal(recovery.state.lastSuccessAt,now+43200000);
  assert.equal(transition(recovery.state,{ok:true,code:'database_read_ok'},now+64800000).notice,null);
});
test('weekly summary is distinct from outage alerts and contains no student data',()=>{
  const first=transition(null,{ok:true,code:'database_read_ok'},now);
  assert.equal(first.notice,null);
  const weekly=transition(first.state,{ok:true,code:'database_read_ok'},now+7*86400000);
  assert.equal(weekly.notice.type,'weekly');
  assert.deepEqual(Object.keys(weekly.notice).sort(),['id','type']);
});
test('uninitialized, future or stale external state never claims healthy',()=>{
  assert.equal(statusOf(null,now).healthy,false);
  const s=transition(null,{ok:true,code:'database_read_ok'},now).state;
  assert.equal(statusOf(s,now+1).healthy,true);
  assert.equal(statusOf(s,now+15*3600000).code,'scheduler_stale');
  assert.equal(statusOf(s,now-1).healthy,false);
});
