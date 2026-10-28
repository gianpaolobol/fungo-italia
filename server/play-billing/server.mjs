import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
import {verifyPurchase} from './verify.mjs';
import {createGoogleApi} from './google.mjs';
export function createBillingServer(api){
 let concurrent=0;
 const server=createServer(async(req,res)=>{
  const reply=(status,data)=>{if(!res.destroyed){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));}};
  if(concurrent>=16){reply(503,{error:'Service busy'});req.resume();return;}
  if(req.url!=='/verify'&&req.url!=='/health'){reply(404,{error:'Not found'});req.resume();return;}
  concurrent++;
  try{
   if(req.url==='/health'&&req.method==='GET'){await api.ready();reply(200,{ready:true});return;}
   if(req.url!=='/verify'||req.method!=='POST'){reply(405,{error:'Method not allowed'});req.resume();return;}
   if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']??'')){reply(415,{error:'JSON required'});req.resume();return;}
   let raw='',size=0;
   for await(const chunk of req){size+=chunk.length;if(size>16384){reply(413,{error:'Request too large'});req.destroy();return;}raw+=chunk.toString('utf8');}
   let input;try{input=JSON.parse(raw);}catch{reply(400,{error:'Invalid request'});return;}
   if(typeof input?.purchaseToken!=='string'||!input.purchaseToken||input.purchaseToken.length>8192||typeof input.nonce!=='string'||input.nonce.length<8||input.nonce.length>128){reply(400,{error:'Invalid request'});return;}
   reply(200,await verifyPurchase(input,api));
  }catch{reply(503,{error:'Verification unavailable'});}finally{concurrent--;}
 });
 server.requestTimeout=15000;server.headersTimeout=10000;
 return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const api=createGoogleApi();
 // Loopback only: deploy behind an HTTPS reverse proxy with request/IP rate limits.
 createBillingServer(api).listen(Number(process.env.PORT||8792),'127.0.0.1',()=>console.info('Play verification service listening on loopback'));
}
