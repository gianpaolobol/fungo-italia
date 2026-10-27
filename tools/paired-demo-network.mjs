import http from 'node:http';import net from 'node:net';
import assert from 'node:assert/strict';
// Test-only TCP link gate: HTTPS remains end-to-end, with normal certificate validation.
export async function createNetworkGate({host='gianpaolobol.github.io',port=443,localOrigin}={}){
 if(localOrigin){const u=new URL(localOrigin);assert(u.protocol==='http:'&&u.hostname==='127.0.0.1'&&u.port&&u.pathname==='/'&&!u.username&&!u.password&&!u.search&&!u.hash&&u.origin===localOrigin,'Only exact private replay origin permitted');}
 let enabled=true,localEnabled=true;const sockets=new Set(),localSockets=new Set();
 const track=s=>{sockets.add(s);s.on('close',()=>sockets.delete(s));s.on('error',()=>s.destroy());return s;};
 const server=http.createServer((req,res)=>{
  let target;try{target=new URL(req.url);}catch{res.writeHead(403);res.end();return;}
  if(!localOrigin||target.origin!==localOrigin||!target.pathname.startsWith('/fungo-italia/')||target.username||target.password||!['GET','HEAD'].includes(req.method)){res.writeHead(403);res.end();return;}
  if(!enabled||!localEnabled){res.writeHead(503);res.end();return;}
  if(!localSockets.has(req.socket)){localSockets.add(req.socket);req.socket.once('close',()=>localSockets.delete(req.socket));}
  const upstream=http.request(target,{method:req.method,agent:false,headers:{...req.headers,host:target.host}},response=>{res.writeHead(response.statusCode,response.headers);response.pipe(res);});
  upstream.on('socket',socket=>{track(socket);localSockets.add(socket);socket.once('close',()=>localSockets.delete(socket));});upstream.on('error',()=>{if(!res.headersSent)res.writeHead(502);res.end();});req.on('aborted',()=>upstream.destroy());res.on('close',()=>upstream.destroy());upstream.end();
 });
 server.on('connection',track);
 server.on('connect',(req,client,head)=>{
  if(req.url!==host+':'+port){client.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');return;}
  if(!enabled){client.end('HTTP/1.1 503 Network Disabled\r\nConnection: close\r\n\r\n');return;}
  const upstream=track(net.connect(port,host));
  client.on('close',()=>upstream.destroy());upstream.on('close',()=>client.destroy());
  upstream.once('connect',()=>{if(!enabled){client.destroy();upstream.destroy();return;}client.write('HTTP/1.1 200 Connection Established\r\n\r\n');if(head.length)upstream.write(head);upstream.pipe(client);client.pipe(upstream);});
 });
 await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok);});
 const destroy=()=>{for(const socket of [...sockets])socket.destroy();};
 return {url:'http://127.0.0.1:'+server.address().port,block(){enabled=false;destroy();},blockLocal(){assert(localOrigin,'Private origin required');localEnabled=false;for(const socket of [...localSockets])socket.destroy();},allow(){enabled=true;localEnabled=true;},async close(){enabled=false;destroy();await new Promise((ok,bad)=>server.close(e=>e?bad(e):ok()));}};
}
