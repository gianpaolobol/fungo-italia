import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,cp,readdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'dist-ios'),expoOutput=path.join(root,'dist-shared-web');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const sourceCommit=process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
if(!/^[a-f0-9]{40}$/i.test(sourceCommit))throw Error('Invalid source commit');
// Keep the existing private notes, photo import and backup tools under a stable route.
execFileSync(process.execPath,['web/build-legacy.mjs'],{cwd:root,stdio:'inherit'});
await mkdir(path.join(output,'strumenti'),{recursive:true});
const legacyHtml=(await readFile(path.join(output,'index.html'),'utf8')).replace('<head>','<head><base href="../">');
await writeFile(path.join(output,'strumenti/index.html'),legacyHtml);
for(const file of ['privacy.html','support.html','admin-photos.html','importa-foto.html','data.json']){const bytes=await readFile(path.join(output,file));await writeFile(path.join(output,'strumenti',file),file.endsWith('.html')?bytes.toString().replace('<head>','<head><base href="../">'):bytes);}
await rm(expoOutput,{recursive:true,force:true});
execFileSync('npx',['expo','export','--platform','web','--output-dir',expoOutput],{cwd:root,env:{...process.env,CI:'1',GITHUB_SHA:sourceCommit},stdio:'inherit'});
await cp(expoOutput,output,{recursive:true});
const icon=await readFile(path.join(root,'assets/icon.png')),iconSha256=sha(icon),iconName=`icon-${iconSha256.slice(0,16)}.png`;
await writeFile(path.join(output,iconName),icon);
await writeFile(path.join(output,'icon.png'),icon);
const manifest={name:'Fungo Italia',short_name:'Fungo Italia',id:'/fungo-italia/',start_url:'./',scope:'./',display:'standalone',background_color:'#f4f7f2',theme_color:'#174f2b',icons:[{src:'./'+iconName,sizes:'1024x1024',type:'image/png',purpose:'any'}]};
await writeFile(path.join(output,'manifest.webmanifest'),JSON.stringify(manifest,null,2));
// Activate only a fully cached worker built from the already-running source.
// A later release stays waiting until the user finishes the exercise and updates.
const runtime=`const SOURCE=${JSON.stringify(sourceCommit)};
function sourceOf(worker){return new Promise(resolve=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();resolve(null);},1500);channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data?.sourceCommit);};worker.postMessage({type:'SOURCE_ID'},[channel.port2]);});}
async function activateMatching(reg){const waiting=reg.waiting;try{if(waiting&&await sourceOf(waiting)===SOURCE&&waiting.state==='installed')waiting.postMessage({type:'ACTIVATE_UPDATE'});}catch{/* Worker replacement is retried on the next foreground check. */}}
if('serviceWorker'in navigator)window.addEventListener('load',()=>{navigator.serviceWorker.register('/fungo-italia/sw.js',{scope:'/fungo-italia/',updateViaCache:'none'}).then(reg=>{void activateMatching(reg);reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed')void activateMatching(reg);});});void reg.update();}).catch(()=>{});});
`;
await writeFile(path.join(output,'pwa-runtime.js'),runtime);
let html=await readFile(path.join(output,'index.html'),'utf8');
html=html.replace('</head>',`<meta name="application-name" content="Fungo Italia"><meta name="theme-color" content="#174f2b"><meta name="apple-mobile-web-app-capable" content="yes"><link rel="manifest" href="/fungo-italia/manifest.webmanifest"><link rel="apple-touch-icon" href="/fungo-italia/${iconName}"></head>`).replace('</body>','<script src="/fungo-italia/pwa-runtime.js" defer></script></body>');
await writeFile(path.join(output,'index.html'),html);
async function list(dir,prefix=''){const files=[];for(const item of await readdir(dir,{withFileTypes:true})){const name=prefix+item.name;if(item.isDirectory())files.push(...await list(path.join(dir,item.name),name+'/'));else if(item.isFile()&&!item.name.startsWith('.')&&!['build.json','file-manifest.json','release.json'].includes(name))files.push(name);}return files;}
const files=(await list(output)).filter(file=>file!=='sw.js').sort();
const entries=await Promise.all(files.map(async file=>{const bytes=await readFile(path.join(output,file));return {path:file,sha256:sha(bytes),bytes:bytes.length};}));
const webContentHash=sha(JSON.stringify(entries));
// Atomic shell cache; new HTML can never pair with the previous generation of JS.
let worker=await readFile(path.join(root,'web/public/sw.js'),'utf8');
worker="const SOURCE_COMMIT="+JSON.stringify(sourceCommit)+";\n"+worker;
worker=worker.replace("self.addEventListener('message',event=>{","self.addEventListener('message',event=>{if(event.data?.type==='SOURCE_ID'&&event.ports[0])event.ports[0].postMessage({sourceCommit:SOURCE_COMMIT});");
worker=worker.replace('__BUILD_VERSION__',webContentHash).replace(/const FILES=\[[^;]+;/,`const FILES=${JSON.stringify(files.map(file=>'./'+file))};`);
worker=worker.replace("await self.skipWaiting();",'');
worker=worker.replace("||file==='./icon.png'||file.startsWith('./vendor/')", "||file==='./icon.png'||file.startsWith('./icon-')||file.startsWith('./assets/assets/icon.')||file.startsWith('./vendor/')");
worker=worker.replace(" const path=url.pathname;", " const path=url.pathname;\n if(path===new URL('./strumenti/',scope).pathname||path===new URL('./strumenti/index.html',scope).pathname)return './strumenti/index.html';\n if(path.startsWith(new URL('./strumenti/',scope).pathname)){const name=path.split('/').pop();if(['privacy.html','support.html','admin-photos.html','importa-foto.html'].includes(name))return './strumenti/'+name;}");
worker=worker.replace("try{return await fetchFreshHtml(event.request,cache,cacheUrl);}","try{const shell=await cache.match(cacheUrl);if(shell)return shell;return await fetchFreshHtml(event.request,cache,cacheUrl);}");
// A previous page can finish its exercise after activation without a forced reload.
worker=worker.replace(".filter(key=>key.startsWith(PREFIX)&&key!==CACHE)",".filter(key=>key.startsWith(PREFIX)&&key!==CACHE).slice(0,-1)");
await writeFile(path.join(output,'sw.js'),worker);
const workerBytes=Buffer.from(worker);entries.push({path:'sw.js',sha256:sha(workerBytes),bytes:workerBytes.length});entries.sort((a,b)=>a.path.localeCompare(b.path,'en'));
// Use the same lexical ordering as the independent promotion guard.
entries.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
await writeFile(path.join(output,'file-manifest.json'),JSON.stringify({schemaVersion:1,sourceCommit,webContentHash,files:entries},null,2));
const version=JSON.parse(await readFile(path.join(root,'app.json'),'utf8')).expo.version;
await writeFile(path.join(output,'build.json'),JSON.stringify({schemaVersion:1,sourceCommit,version,iconSha256,webContentHash},null,2));
await rm(expoOutput,{recursive:true,force:true});
console.log(JSON.stringify({sourceCommit,version,iconSha256,webContentHash,files:entries.length}));
