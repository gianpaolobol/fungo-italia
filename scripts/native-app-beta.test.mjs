import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {create,act} from 'react-test-renderer';
import * as betaPolicy from '../lib/beta-access.mjs';
import * as betaController from '../lib/beta-controller.mjs';
import * as demoPolicy from '../lib/demo-policy.mjs';
import * as preferences from '../lib/study-preferences.mjs';
import * as curriculum from '../lib/curriculum-levels.mjs';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),require=createRequire(import.meta.url);
const text=node=>Array.isArray(node)?node.map(text).join(''):typeof node==='string'?node:(node?.children??[]).map(text).join('');
function harness(platform,{full=false,configured=true,subscriptionActive=false,initialURL=null}={}){
 const native=Object.fromEntries(['ActivityIndicator','Image','Pressable','ScrollView','Text','TextInput','View'].map(n=>[n,n]));
 native.Platform={OS:platform};native.StyleSheet={create:x=>x};native.Linking={getInitialURL:async()=>initialURL,addEventListener:()=>({remove(){}}),openURL:async()=>{}};
 const noop=async()=>{};const billing={active:subscriptionActive,product:null,purchaseReady:false,checking:false,busy:false,error:'',supported:true,expiresAt:null,purchase:noop,restore:noop,refresh:noop};
 const beta={configured,active:full,checking:false,busy:false,error:'',expiresAt:full?'2027-01-27T12:00:00Z':null,redeem:noop,refresh:noop,logout:noop};
 const memory=new Map(),storage={getItem:async key=>memory.get(key)??null,setItem:async(key,value)=>{memory.set(key,value);}};
 const screen=name=>()=>React.createElement('View',{'testID':name});
 const stubs={
  'react-native':native,'@react-native-async-storage/async-storage':storage,'expo-status-bar':{StatusBar:screen('status')},
  'react-native-safe-area-context':{SafeAreaProvider:'View',SafeAreaView:'View'},
  './hooks/useSubscription':{default:()=>billing},'./hooks/useBetaAccess':{default:()=>beta},'./hooks/useStudy':{default:()=>({startStudy:async()=>true,nextTraining:{taxonIds:[]}})},
  './components/StudyDashboard':{default:screen('dashboard')},'./components/Studio':{default:screen('studio')},'./components/Areas':{default:screen('areas')},
  './components/ReleaseStatus':{default:()=>React.createElement('Text',null,'Versione fixture')},
  './components/MushroomAccess':{default:p=>React.createElement('Pressable',{testID:'open-access',onPress:p.onPress},React.createElement('Text',null,'Accesso'))},
  './PhotoExam':{default:screen('photo')},'./TheoryExam':{default:screen('theory')},
  './lib/beta-controller.mjs':betaController,'./lib/beta-access.mjs':betaPolicy,'./lib/demo-policy.mjs':demoPolicy,'./lib/study-preferences.mjs':preferences,'./lib/curriculum-levels.mjs':curriculum,
 };
 for(const value of Object.values(stubs))if(value&&'default' in value)value.__esModule=true;
 const cache=new Map();
 function load(file){if(cache.has(file))return cache.get(file).exports;const output={exports:{}};cache.set(file,output);
  const js=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  new Function('require','module','exports',js)(name=>{
   if(name in stubs)return stubs[name];if(!name.startsWith('.'))return require(name);
   const target=path.resolve(path.dirname(file),name);if(name.endsWith('.json'))return require(target);if(name.endsWith('.png'))return 1;
   for(const suffix of ['', '.tsx','.ts'])if(existsSync(target+suffix))return load(target+suffix);
   throw Error('Unexpected App import '+name);
  },output,output.exports);return output.exports;
 }
 return {App:load(path.join(root,'App.tsx')).default,beta,billing};
}
async function mount(t,platform,options){const h=harness(platform,options);let view;await act(async()=>{view=create(React.createElement(h.App));});t.after(async()=>{await act(async()=>view.unmount());});return view;}
async function press(view,id){await act(async()=>view.root.find(n=>n.type==='Pressable'&&n.props.testID===id).props.onPress());}
function freeButtons(view){return view.root.findAll(n=>n.type==='Pressable'&&/demo gratuita|anteprima gratuita|test.*gratuit/i.test(text(n)));}
for(const platform of ['ios','android']){
 test(platform+': native app offers no free-demo button on study or access screens',async t=>{
  const view=await mount(t,platform,{full:false});await press(view,'tab-studio');assert.equal(freeButtons(view).length,0,'study must have no demo CTA');
  await press(view,'open-access');assert.equal(freeButtons(view).length,0,'access must have no free-preview CTA');
 });
 test(platform+': active beta access renders a valid native tree and full examination',async t=>{
  const view=await mount(t,platform,{full:true});await press(view,'open-access');
  const invalid=[];function visit(node,inText=false){if(typeof node==='string'){if(!inText&&node.length)invalid.push(node);return;}if(!node)return;const next=inText||node.type==='Text';for(const child of node.children??[])visit(child,next);}
  visit(view.toJSON());assert.deepEqual(invalid,[],'native text must be wrapped in Text');
  assert.equal(view.root.findAll(n=>n.type==='Pressable'&&text(n)==='Apri l’atlante').length,1,'verified beta opens the full atlas');
  await press(view,'tab-esame');const theory=view.root.findAll(n=>n.type==='Pressable'&&text(n)==='Esame teorico')[0];assert.ok(theory);await act(async()=>theory.props.onPress());assert.equal(view.root.findAll(n=>n.type==='View'&&n.props.testID==='theory').length,1);
 });
}
test('web retains its existing free-preview navigation',async t=>{const view=await mount(t,'web',{full:false,configured:false});await press(view,'open-access');assert.equal(freeButtons(view).length,2);});

for(const platform of ['ios','android'])test(platform+': an existing subscription cannot bypass invitation redemption or revocation',async t=>{
 const h=harness(platform,{subscriptionActive:true});let view;
 await act(async()=>{view=create(React.createElement(h.App));});t.after(async()=>{await act(async()=>view.unmount());});
 await press(view,'tab-esame');
 assert.ok(text(view.toJSON()).includes('Esame teorico · completo'),'without an invitation only the restricted exam is available');
 assert.ok(text(view.toJSON()).includes('Richiede accesso completo. Tocca Esame teorico'),'Apple or Play subscription alone cannot unlock a managed beta');
 await press(view,'open-access');
 assert.equal(view.root.findAll(n=>n.type==='TextInput'&&n.props.testID==='beta-invite-code').length,1);
 assert.ok(!/Abbonati|Ripristina acquisti|Abbonamento attivo|Gestisci abbonamento/.test(text(view.toJSON())),'invitation-only screen must not offer a purchase or subscription bypass');
 await act(async()=>{h.beta.active=true;h.beta.expiresAt='2027-01-27T12:00:00Z';view.update(React.createElement(h.App));});
 await press(view,'tab-esame');assert.ok(!text(view.toJSON()).includes('Esame teorico · completo'),'verified invitation unlocks the complete exam');
 await act(async()=>{h.beta.active=false;h.beta.expiresAt=null;view.update(React.createElement(h.App));});
 assert.ok(text(view.toJSON()).includes('Esame teorico · completo'),'revocation closes full access even while subscription remains active');
});
test('ordinary iOS subscription access still opens the complete exam',async t=>{
 const view=await mount(t,'ios',{configured:false,subscriptionActive:true});await press(view,'tab-esame');assert.ok(!text(view.toJSON()).includes('Esame teorico · completo'));
 await press(view,'open-access');assert.ok(text(view.toJSON()).includes('Abbonamento attivo'));
});

for(const platform of ['ios','android'])test(platform+': an invitation link opens code entry without automatically redeeming it',async t=>{
 const h=harness(platform,{initialURL:'fungoitalia://beta#'+'a'.repeat(43)});let calls=0,view;h.beta.redeem=async()=>{calls++;};
 await act(async()=>{view=create(React.createElement(h.App));});t.after(async()=>{await act(async()=>view.unmount());});
 assert.equal(view.root.findAll(n=>n.type==='TextInput'&&n.props.testID==='beta-invite-code').length,1,'the invitation opens its code-entry screen');
 assert.equal(calls,0,'only a manual activation can redeem the email code');
});
