import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as jsx from 'react/jsx-runtime';

function load(platform,status){
 let checks=0;
 const host=tag=>({children})=>React.createElement(tag,null,children);
 const imports={react:React,'react/jsx-runtime':jsx,'react-native':{Platform:{OS:platform},StyleSheet:{create:x=>x},View:host('div'),Text:host('span'),Pressable:host('button')},'../hooks/useReleaseAlignment':{__esModule:true,default:()=>{checks++;return {status,localVersion:'1.1.0',release:{version:'1.1.0',buildNumber:'19'},refresh:async()=>{}};}},'../lib/release-alignment.mjs':{prepareWebUpdate:async()=>{}}};
 const source=ts.transpileModule(readFileSync(new URL('../components/ReleaseStatus.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const output={exports:{}};
 new Function('require','module','exports',source)(name=>{assert(name in imports,'Unexpected module '+name);return imports[name];},output,output.exports);
 return {render:details=>renderToStaticMarkup(React.createElement(output.exports.default,{details})),checks:()=>checks};
}
test('native app never shows stale public TestFlight status or starts its remote check',()=>{
 for(const platform of ['ios','android'])for(const status of ['checking','aligned','unknown','update-available'])for(const details of [false,true]){
  const component=load(platform,status);
  assert.equal(component.render(details),'',platform+' '+status+' details='+details);
  assert.equal(component.checks(),0,'Native must not start the public release check');
 }
});
test('web retains its visible update action and optional version details',()=>{
 const component=load('web','update-available');
 assert.match(component.render(false),/Aggiorna anteprima/);
 assert.match(component.render(true),/Verifica versione/);
 const aligned=load('web','aligned');assert.equal(aligned.render(false),'');assert.match(aligned.render(true),/Versione 1.1.0/);
});
