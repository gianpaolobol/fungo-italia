import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),eas=require('../eas.json');
test('store production is signed for store distribution, with unique remote build versions',()=>{
 assert.equal(eas.build.production.distribution,'store');
 assert.equal(eas.build.production.android.buildType,'app-bundle');
 assert.equal(eas.build.production.autoIncrement,true);
 assert.equal(eas.cli.appVersionSource,'remote');
});
test('EAS controls the channel; production never hardcodes the preview update header',()=>{
 const old=process.env.EXPO_PROJECT_ID;process.env.EXPO_PROJECT_ID='b65af584-739f-4ef0-8fe5-6c0ba692c088';
 try{const config=require('../app.config.js')();assert.equal(config.updates.requestHeaders,undefined);assert.equal(config.ios.bundleIdentifier,'it.fungoitalia.app');assert.equal(config.android.package,'it.fungoitalia.app');}
 finally{if(old===undefined)delete process.env.EXPO_PROJECT_ID;else process.env.EXPO_PROJECT_ID=old;}
});
