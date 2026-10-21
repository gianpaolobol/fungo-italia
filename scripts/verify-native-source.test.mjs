import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {verifyNativeSource} from './verify-native-source.mjs';
test('signed app source is read from the actual Expo resource; absent, dirty or wrong builds fail',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'native-source-')),sourceCommit='a'.repeat(40),version='1.1.0';
 try{
  await assert.rejects(()=>verifyNativeSource(root,sourceCommit,version));
  const dir=path.join(root,'Payload/Fungo.app/EXConstants.bundle');await mkdir(dir,{recursive:true});
  const write=release=>writeFile(path.join(dir,'app.config'),JSON.stringify({version,extra:{release}}));
  await write({sourceCommit,version,dirty:false});assert.equal((await verifyNativeSource(root,sourceCommit,version)).sourceCommit,sourceCommit);
  await write({sourceCommit,version,dirty:true});await assert.rejects(()=>verifyNativeSource(root,sourceCommit,version));
  await write({sourceCommit:'b'.repeat(40),version,dirty:false});await assert.rejects(()=>verifyNativeSource(root,sourceCommit,version));
 }finally{await rm(root,{recursive:true,force:true});}
});
