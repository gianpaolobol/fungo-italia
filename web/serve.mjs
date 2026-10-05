import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist-ios');
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png'};
let navigationFail=false;
http.createServer(async(req,res)=>{try{let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(!name.startsWith('/fungo-italia/')){res.writeHead(404);res.end();return;}name=name.slice('/fungo-italia/'.length)||'index.html';if(name==='__test/fault'){navigationFail=new URL(req.url,'http://localhost').searchParams.get('status')==='503';res.writeHead(200);res.end('ok');return;}if(navigationFail&&name==='index.html'){res.writeHead(503,{'Content-Type':'text/html'});res.end('temporary hosting failure');return;}const file=path.resolve(root,name);if(!file.startsWith(root+path.sep))throw Error('Invalid path');const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(body);}catch{res.writeHead(404);res.end();}}).listen(4173,'127.0.0.1');
