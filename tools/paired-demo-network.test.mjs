import test from 'node:test';import assert from 'node:assert/strict';import net from 'node:net';
import {createNetworkGate,isAllowedTunnelTarget,tunnelDestination} from './paired-demo-network.mjs';
async function tunnel(url,target){
 const proxy=new URL(url),socket=net.connect(Number(proxy.port),proxy.hostname);await new Promise((ok,bad)=>{socket.once('connect',ok);socket.once('error',bad);});
 const response=new Promise((ok,bad)=>{socket.once('data',b=>ok(b.toString()));socket.once('error',bad);});socket.write('CONNECT '+target+' HTTP/1.1\r\nHost: '+target+'\r\n\r\n');return {socket,response:await response};
}
test('network gate cuts real connections, rejects fresh access and restores the same allowed endpoint',async()=>{
 const server=net.createServer(s=>s.pipe(s));await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const port=server.address().port,gate=await createNetworkGate({host:'127.0.0.1',port});
 try{
  const first=await tunnel(gate.url,'127.0.0.1:'+port);assert.match(first.response,/200 Connection Established/);
  const echo=new Promise(ok=>first.socket.once('data',b=>ok(b.toString())));first.socket.write('real-data');assert.equal(await echo,'real-data');
  const closed=new Promise(ok=>first.socket.once('close',ok));gate.block();await closed;
  const blocked=await tunnel(gate.url,'127.0.0.1:'+port);assert.match(blocked.response,/503/);blocked.socket.destroy();
  gate.allow();const again=await tunnel(gate.url,'127.0.0.1:'+port);assert.match(again.response,/200 Connection Established/);again.socket.destroy();
  const denied=await tunnel(gate.url,'example.com:443');assert.match(denied.response,/403/);denied.socket.destroy();
 }finally{await gate.close();await new Promise(ok=>server.close(ok));}
});

test('replay gate forwards only the exact private origin and application path and cuts real HTTP access',async()=>{
 const {default:http}=await import('node:http');const server=http.createServer((_q,r)=>r.end('actual-private-bytes'));await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const origin='http://127.0.0.1:'+server.address().port,gate=await createNetworkGate({localOrigin:origin});
 const request=target=>new Promise((ok,bad)=>{http.get(gate.url,{path:target,agent:false},r=>{let body='';r.on('data',b=>body+=b);r.on('end',()=>ok({status:r.statusCode,body}));}).on('error',bad);});
 try{assert.deepEqual(await request(origin+'/fungo-italia/'),{status:200,body:'actual-private-bytes'});assert.equal((await request(origin+'/outside')).status,403);assert.equal((await request('http://localhost:'+server.address().port+'/fungo-italia/')).status,403);assert.equal((await request('http://example.com/fungo-italia/')).status,403);gate.block();assert.equal((await request(origin+'/fungo-italia/')).status,503);gate.allow();assert.equal((await request(origin+'/fungo-italia/')).status,200);}finally{await gate.close();server.closeAllConnections();await new Promise(ok=>server.close(ok));}
 await assert.rejects(createNetworkGate({localOrigin:'http://example.com'}));
});

test('isolated replay cuts only its real application origin while independent metadata tunnel remains available',async()=>{
 const{default:http}=await import('node:http');const app=http.createServer((_q,r)=>r.end('private-app')),metadata=net.createServer(s=>s.pipe(s));await Promise.all([new Promise(ok=>app.listen(0,'127.0.0.1',ok)),new Promise(ok=>metadata.listen(0,'127.0.0.1',ok))]);const origin='http://127.0.0.1:'+app.address().port,port=metadata.address().port,gate=await createNetworkGate({localOrigin:origin,host:'127.0.0.1',port});
 const status=()=>new Promise((ok,bad)=>http.get(gate.url,{path:origin+'/fungo-italia/',agent:false},r=>{r.resume();r.on('end',()=>ok(r.statusCode));}).on('error',bad));
 try{assert.equal(await status(),200);gate.blockLocal();assert.equal(await status(),503);const live=await tunnel(gate.url,'127.0.0.1:'+port);assert.match(live.response,/200 Connection Established/);const echo=new Promise(ok=>live.socket.once('data',b=>ok(b.toString())));live.socket.write('independent-metadata');assert.equal(await echo,'independent-metadata');live.socket.destroy();gate.allow();assert.equal(await status(),200);}finally{await gate.close();app.closeAllConnections();await Promise.all([new Promise(ok=>app.close(ok)),new Promise(ok=>metadata.close(ok))]);}
});

test('public map tunnel permits only the explicit OSM HTTPS authority, retaining the original origin restriction',()=>{
 assert.deepEqual(tunnelDestination('tile.openstreetmap.org:443',{allowMapTiles:true}),{host:'tile.openstreetmap.org',port:443});assert.deepEqual(tunnelDestination('127.0.0.1:12345',{host:'127.0.0.1',port:12345}),{host:'127.0.0.1',port:12345});assert.equal(tunnelDestination('example.com:443',{allowMapTiles:true}),null);assert(isAllowedTunnelTarget('gianpaolobol.github.io:443'));assert(!isAllowedTunnelTarget('tile.openstreetmap.org:443'));assert(isAllowedTunnelTarget('tile.openstreetmap.org:443',{allowMapTiles:true}));for(const target of ['tile.openstreetmap.org:80','tile.openstreetmap.org:443/path','tile.openstreetmap.org.evil.example:443','user@tile.openstreetmap.org:443','example.com:443','TILE.OPENSTREETMAP.ORG:443'])assert(!isAllowedTunnelTarget(target,{allowMapTiles:true}));assert(!isAllowedTunnelTarget('tile.openstreetmap.org:443',{allowMapTiles:'true'}));
});
