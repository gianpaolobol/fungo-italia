import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import React from 'react';
import {create,act} from 'react-test-renderer';

// Real React mount/effects and production components/storage logic. Only native
// host views and the AsyncStorage transport are replaced; no entitlement is granted.
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const native=Object.fromEntries(['ActivityIndicator','Image','Modal','Pressable','ScrollView','Text','TextInput','View'].map(n=>[n,n]));
native.StyleSheet={create:x=>x};native.Linking={openURL:async()=>{}};
const modules=new Map();
for(const file of ['lib/study-store.mjs','lib/study-exam.mjs','lib/session-selection.mjs','lib/study-curriculum-bank.mjs','lib/demo-policy.mjs','lib/theory-bank.mjs','lib/curriculum-levels.mjs','lib/theory-progress.mjs','web/public/exam-core.js'])modules.set(path.join(root,file),await import('../'+file));
const studyKey='fungo-italia:study-dashboard:v1',theoryKey='fungo-italia:theory-exam:v1';
function harness(){
 const values=new Map([[studyKey,JSON.stringify({schemaVersion:1,profile:{name:'Beta QA',startedAt:null},exam:{session:null,history:[]}})]]),pending=[];let heldKey=null;
 const storage={getItem:async key=>values.get(key)??null,setItem:async(key,value)=>{if(key===heldKey)await new Promise(resolve=>pending.push(resolve));values.set(key,value);}};
 const cache=new Map(),require=createRequire(import.meta.url);
 function load(file){
  if(cache.has(file))return cache.get(file).exports;
  const output={exports:{}};cache.set(file,output);
  const js=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  new Function('require','module','exports',js)(name=>{
   if(name==='react-native')return native;if(name==='@react-native-async-storage/async-storage')return storage;
   if(!name.startsWith('.'))return require(name);
   const target=path.resolve(path.dirname(file),name);
   if(target===path.join(root,'src/data/reference-image-assets'))return {referenceImageAssets:{}};
   for(const suffix of ['', '.js','.mjs'])if(modules.has(target+suffix))return modules.get(target+suffix);
   if(name.endsWith('.json'))return require(target);
   for(const suffix of ['', '.tsx','.ts'])if(existsSync(target+suffix)&&!target.endsWith('.json'))return load(target+suffix);
   throw Error('Unexpected component import '+name);
  },output,output.exports);
  return output.exports;
 }
 return {ExamHub:load(path.join(root,'components/ExamHub.tsx')).default,values,pending,hold(key){heldKey=key;},release(){heldKey=null;for(const resolve of pending.splice(0))resolve();}};
}
function text(node){return typeof node==='string'?node:(node?.children??[]).map(text).join('');}
async function press(view,label){const button=view.root.findAll(n=>n.type==='Pressable'&&text(n)===label)[0];assert.ok(button,'control '+label);assert.equal(!!button.props.disabled,false,'enabled '+label);await act(async()=>{button.props.onPress();});}
const mount=(h,demo)=>React.createElement(h.ExamHub,{key:demo?'agaricus':'full',demo});

test('mounted photo exam preserves pending draft and history through full → demo → full',async t=>{
 const h=harness();let view;await act(async()=>{view=create(mount(h,false));});t.after(async()=>{h.release();await act(async()=>view.unmount());});
 await press(view,'Inizia 15 casi');await press(view,'Invia risposta');await press(view,'Continua');
 const before=JSON.parse(h.values.get(studyKey));assert.equal(before.exam.history.length,1);
 h.hold(studyKey);await act(async()=>{view.root.findByType('TextInput').props.onChangeText('bozza beta conservata');});assert.equal(h.pending.length,1);
 await act(async()=>view.update(mount(h,true)));assert.ok(text(view.root).includes('Test Agaricus gratuito'));assert.equal(view.root.findAll(n=>n.type==='TextInput').length,0);
 await act(async()=>view.update(mount(h,false)));await act(async()=>h.release());await press(view,'Riprendi sessione');
 assert.equal(view.root.findByType('TextInput').props.value,'bozza beta conservata');const after=JSON.parse(h.values.get(studyKey));assert.deepEqual(after.exam.history,before.exam.history);assert.deepEqual(after.profile,before.profile);
});

test('mounted theory exam awaits pending draft before rehydration after beta interruption',async t=>{
 const h=harness();let view;await act(async()=>{view=create(mount(h,false));});t.after(async()=>{h.release();await act(async()=>view.unmount());});
 await press(view,'Esame teorico');await press(view,'Inizia test teorico');await press(view,'Invia risposta teorica');await press(view,'Continua teoria');
 const before=JSON.parse(h.values.get(theoryKey));assert.equal(before.history.length,1);const option=view.root.findAll(n=>n.type==='Pressable'&&['radio','checkbox'].includes(n.props.accessibilityRole))[0];assert.ok(option);
 h.hold(theoryKey);await act(async()=>option.props.onPress());assert.equal(h.pending.length,1);
 await act(async()=>view.update(mount(h,true)));assert.ok(text(view.root).includes('Test Agaricus gratuito'));assert.ok(text(view.root).includes('Esame teorico · completo'));
 await act(async()=>view.update(mount(h,false)));await press(view,'Esame teorico');await act(async()=>h.release());await press(view,'Riprendi test teorico');
 const selected=view.root.findAll(n=>n.type==='Pressable'&&['radio','checkbox'].includes(n.props.accessibilityRole)&&n.props.accessibilityState?.checked);assert.equal(selected.length,1,'pending choice restored on remount');const after=JSON.parse(h.values.get(theoryKey));assert.deepEqual(after.history,before.history);assert.notDeepEqual(after.session.draft.choices,{});
});

test('demo theory button explains full access and opens the access screen without showing questions',async t=>{
 const h=harness();let view,requests=0;
 await act(async()=>{view=create(React.createElement(h.ExamHub,{demo:true,onAccess:()=>requests++}));});
 t.after(async()=>{await act(async()=>view.unmount());});
 assert.ok(text(view.root).includes('Esame teorico'));
 const button=view.root.findAll(n=>n.type==='Pressable'&&text(n).startsWith('Esame teorico'))[0];
 assert.ok(button);assert.equal(!!button.props.disabled,false,'theory action should explain access instead of silently ignoring taps');
 await act(async()=>button.props.onPress());assert.equal(requests,1);
 assert.ok(text(view.root).includes('Richiede accesso completo'));
 assert.equal(view.root.findAll(n=>n.type==='Text'&&text(n)==='Scegli l’argomento').length,0);
});

test('verified full access opens theory and starts a real session',async t=>{
 const h=harness();let view;
 await act(async()=>{view=create(mount(h,false));});t.after(async()=>{await act(async()=>view.unmount());});
 await press(view,'Esame teorico');await press(view,'Inizia test teorico');
 assert.ok(text(view.root).includes('Invia risposta teorica'));
 assert.equal(JSON.parse(h.values.get(theoryKey)).session.ids.length,15);
});
