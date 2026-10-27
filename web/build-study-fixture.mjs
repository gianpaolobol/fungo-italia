import {readFile,writeFile,rm,mkdir,cp} from 'node:fs/promises';import {execFileSync} from 'node:child_process';
const original=await readFile(new URL('../index.js',import.meta.url));
try{await writeFile(new URL('../index.js',import.meta.url),"import {registerRootComponent} from 'expo';import App from './tests/study/ReviewApp';registerRootComponent(App);\n");await rm(new URL('../dist-study-review',import.meta.url),{force:true,recursive:true});execFileSync('npx',['expo','export','--platform','web','--output-dir','dist-study-review'],{stdio:'inherit',env:{...process.env,CI:'1'}});}finally{await writeFile(new URL('../index.js',import.meta.url),original);}

// An authenticated GitHub artifact for owner review, never a Pages candidate.
await rm('dist-owner-review',{recursive:true,force:true});await mkdir('dist-owner-review',{recursive:true});await cp('dist-study-review','dist-owner-review/fungo-italia',{recursive:true});
await writeFile('dist-owner-review/README.txt',`Fungo Italia — component review, NOT the published app.
No purchase or entitlement is granted. Test data stay in this local origin.
Extract this archive, open a terminal in this folder and run:
python3 -m http.server 4183 --bind 127.0.0.1
Open http://127.0.0.1:4183/fungo-italia/
Use a browser profile dedicated to this test. Full source and scientific limitations: PR128.
`);
