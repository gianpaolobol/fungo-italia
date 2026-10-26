import http from 'node:http';import net from 'node:net';
// Test-only TCP link gate: HTTPS remains end-to-end, with normal certificate validation.
export async function createNetworkGate({host='gianpaolobol.github.io',port=443}={}){
 let enabled=true;const sockets=new Set();
 const track=s=>{sockets.add(s);s.on('close',()=>sockets.delete(s));s.on('error',()=>s.destroy());return s;};
 const server=http.createServer((_req,res)=>{res.writeHead(403);res.end();});
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
 return {url:'http://127.0.0.1:'+server.address().port,block(){enabled=false;destroy();},allow(){enabled=true;},async close(){enabled=false;destroy();await new Promise((ok,bad)=>server.close(e=>e?bad(e):ok()));}};
}
