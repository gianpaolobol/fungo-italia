import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

// Exercise the real shell entrypoint; replace only macOS tools unavailable on Linux.
function run({installed=false, pinned=false, latest=false, old=false, version, target}={}) {
  const dir=mkdtempSync(join(tmpdir(),'fungo-runtime-'));
  try {
    const runtime=version=>JSON.stringify({runtimes:[{version,isAvailable:true,identifier:'com.apple.CoreSimulator.SimRuntime.iOS-'+version.replaceAll('.','-')}]});
    writeFileSync(join(dir,'initial.json'),runtime(version || (installed?'26.6':'26.5')));
    writeFileSync(join(dir,'downloaded.json'),runtime(old?'26.5':'26.6'));
    writeFileSync(join(dir,'xcrun'),'#!/bin/bash\nif test -f "$RUNNER_TEMP/imported"; then cat "$RUNNER_TEMP/downloaded.json"; else cat "$RUNNER_TEMP/initial.json"; fi\n',{mode:0o755});
    writeFileSync(join(dir,'xcodebuild'),`#!/bin/bash
echo "$*" >> "$RUNNER_TEMP/calls"
if test "$1" = -version; then echo 'Xcode fixture'; exit 0; fi
if test "$1" = -importPlatform; then touch "$RUNNER_TEMP/imported"; exit 0; fi
if [[ "$*" == *-buildVersion* ]]; then
  test "$PINNED" = 1 || exit 1
else
  test "$LATEST" = 1 || exit 1
fi
while test "$#" -gt 0; do
  if test "$1" = -exportPath; then mkdir -p "$2"; touch "$2/runtime.dmg"; break; fi
  shift
done
`,{mode:0o755});
    const result=spawnSync('bash',[resolve('scripts/prepare-storekit-runtime.sh')],{cwd:dir,encoding:'utf8',env:{...process.env,PATH:dir+':'+process.env.PATH,RUNNER_TEMP:dir,GITHUB_ENV:join(dir,'env'),PINNED:pinned?'1':'0',LATEST:latest?'1':'0',STOREKIT_RUNTIME_VERSION:target||'26.6'}});
    return {...result,env:existsSync(join(dir,'env'))?readFileSync(join(dir,'env'),'utf8'):'',calls:existsSync(join(dir,'calls'))?readFileSync(join(dir,'calls'),'utf8'):'',evidence:existsSync(join(dir,'store-evidence/runtime-selection.log'))};
  } finally {rmSync(dir,{recursive:true,force:true});}
}
test('uses an already installed fixed runtime without downloading',()=>{
  const r=run({installed:true});assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.env,/iOS-26-6/);assert.doesNotMatch(r.calls,/-downloadPlatform/);
});
test('imports the explicitly requested runtime',()=>{
  const r=run({pinned:true});assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.env,/iOS-26-6/);
});
test('recovers an unavailable version alias through the Xcode default download',()=>{
  const r=run({latest:true});assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.env,/iOS-26-6/);assert.match(r.calls,/-downloadPlatform iOS -exportPath/);
});
test('rejects an older runtime returned by the default download',()=>{
  const r=run({latest:true,old:true});assert.notEqual(r.status,0);assert.equal(r.env,'');assert.match(r.stdout,/::error::/);
});
test('preserves explicit diagnostic failure when neither download works',()=>{
  const r=run();assert.notEqual(r.status,0);assert.equal(r.env,'');assert.match(r.stdout,/::error::/);assert.equal(r.evidence,true);
});

test('uses the explicitly selected installed iOS 27.0 without downloading',()=>{
  const r=run({version:'27.0',target:'27.0'});assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.env,/iOS-27-0/);assert.doesNotMatch(r.calls,/-downloadPlatform/);
});
test('rejects unqualified runtime version overrides',()=>{
  const r=run({version:'26.5',target:'26.5'});assert.notEqual(r.status,0);assert.equal(r.env,'');assert.doesNotMatch(r.calls,/-downloadPlatform/);
});
test('does not substitute 26.6 for an explicit iOS 27.0 qualification',()=>{
  const r=run({version:'26.6',target:'27.0'});assert.notEqual(r.status,0);assert.equal(r.env,'');
});
