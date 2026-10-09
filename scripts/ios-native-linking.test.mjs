import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

test('iOS autolinking compiles Expo modules together to prevent prebuilt ABI skew',()=>{
 const result=JSON.parse(execFileSync(process.execPath,['node_modules/expo-modules-autolinking/bin/expo-modules-autolinking','resolve','--platform','apple','--json'],{encoding:'utf8'}));
 assert.deepEqual(result.configuration?.buildFromSource,['.*']);
 for(const name of ['expo-media-library','expo-modules-core'])assert.ok(result.modules.some(m=>m.packageName===name),name+' must remain linked');
});
