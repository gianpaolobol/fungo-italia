import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {validateAppIcon} from './generate-brand-assets.mjs';
test('native preparation preserves the valid committed app icon',async()=>{
 const path=new URL('../assets/icon.png',import.meta.url),before=await readFile(path);
 assert.deepEqual({...validateAppIcon(before),bytes:0},{width:1024,height:1024,bytes:0});
 execFileSync(process.execPath,['scripts/generate-brand-assets.mjs']);
 assert.deepEqual(await readFile(path),before);
});
test('truncated or corrupted PNGs are rejected before native prebuild',async()=>{
 const png=await readFile(new URL('../assets/icon.png',import.meta.url));
 assert.throws(()=>validateAppIcon(png.subarray(0,-20)),/Invalid committed app icon/);
 const damaged=Buffer.from(png);damaged[50]^=1;
 assert.throws(()=>validateAppIcon(damaged),/Invalid committed app icon/);
});
