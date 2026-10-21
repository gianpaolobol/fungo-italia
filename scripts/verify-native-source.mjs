import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
export async function verifyNativeSource(directory,sourceCommit,version){
 if(!/^[a-f0-9]{40}$/.test(sourceCommit??''))throw Error('Exact source commit required');
 const configs=[];
 async function walk(dir){for(const file of await readdir(dir,{withFileTypes:true})){const name=path.join(dir,file.name);if(file.isDirectory())await walk(name);else if(file.name==='app.config'&&path.basename(dir)==='EXConstants.bundle')configs.push(name);}}
 await walk(directory);
 if(configs.length!==1)throw Error('Exactly one embedded Expo source receipt required');
 const config=JSON.parse(await readFile(configs[0],'utf8')),release=config.extra?.release;
 if(release?.sourceCommit!==sourceCommit||release?.version!==version||release?.dirty!==false||config.version!==version)throw Error('Embedded native source differs from verified web candidate');
 return release;
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){await verifyNativeSource(process.argv[2],process.env.GITHUB_SHA,process.env.BUILD_VERSION);console.log('Signed native app embeds the exact clean release source');}
