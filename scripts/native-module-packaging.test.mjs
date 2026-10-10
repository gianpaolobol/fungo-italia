import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
test('EAS archive keeps local native module sources while excluding generated native projects',()=>{
 for(const file of readdirSync('modules/fungo-photo-filter/ios')){
  const result=spawnSync('git',['check-ignore','--no-index','modules/fungo-photo-filter/ios/'+file],{encoding:'utf8'});
  assert.equal(result.status,1,'Native module must be uploaded: '+result.stdout);
 }
 for(const path of ['ios/Podfile','android/build.gradle'])assert.equal(spawnSync('git',['check-ignore','--no-index',path]).status,0);
});
