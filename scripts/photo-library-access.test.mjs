import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the real App route handlers. Only the renderer and native services
// are replaced; no subscription entitlement is synthesized by the app itself.
function appHarness(platform='ios',active=false){
 const slots=[],pending=[];let cursor=0;
 const react={createElement:(type,props,...children)=>({type,props:props??{},children:children.flat(Infinity)}),
  useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value;}];},
  useRef(value){return slots[cursor++]??={current:value};},useEffect(fn){const i=cursor++;if(!(i in slots)){slots[i]=true;pending.push(fn);}}};
 const module={exports:{}};
 const source=ts.transpileModule(fs.readFileSync('App.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText;
 const native={Platform:{OS:platform},StyleSheet:{create:x=>x},Linking:{getInitialURL:async()=>null,addEventListener:()=>({remove(){}})}};
 for(const name of ['ActivityIndicator','Image','Pressable','Text','View'])native[name]=name;
 const context={module,exports:module.exports,require(name){
  if(name==='react')return{...react,default:react};
  if(name==='react-native')return native;
  if(name==='react-native-safe-area-context')return{SafeAreaProvider:'SafeAreaProvider',SafeAreaView:'SafeAreaView'};
  if(name==='expo-status-bar')return{StatusBar:'StatusBar'};
  if(name.includes('async-storage'))return{default:{setItem:async()=>{}}};
  if(name.includes('useSubscription'))return{default:()=>({active})};
  if(name.includes('useStudy'))return{default:()=>({nextTraining:{taxonIds:[]}})};
  if(name.includes('study-preferences'))return{readStudyPreferences:async()=>null};
  if(name.includes('demo-policy'))return{agaricusOnly:x=>x};
  if(name.endsWith('.json'))return{default:[]};
  if(name.includes('components/'))return{default:name.split('/').pop()};
  if(name.endsWith('.png'))return'icon';
  throw Error(name);
 }};
 vm.runInNewContext(source,context);
 function render(){cursor=0;const tree=module.exports.default();while(pending.length)pending.shift()();return tree;}
 function nodes(tree){if(!tree||typeof tree!=='object')return[];if(tree.props?.style?.some?.(s=>s?.display==='none'))return[];return[tree,...tree.children.flatMap(nodes)];}
 function text(node){return typeof node==='string'?node:(node?.children??[]).map(text).join('');}
 return{render,nodes,button(tree,label){return nodes(tree).find(n=>n.type==='Pressable'&&text(n)===label);}};
}
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
test('deferred photo upload and analysis remain inaccessible on every platform',async()=>{
 for(const platform of ['ios','web','android'])for(const active of [false,true]){
  const h=appHarness(platform,active);h.render();await flush();let tree=h.render();
  for(const tab of ['dashboard','studio','esame','aree']){
   h.nodes(tree).find(n=>n.props.testID==='tab-'+tab).props.onPress();tree=h.render();
   assert.equal(h.button(tree,'Foto selezionate'),undefined);
   assert.equal(h.button(tree,'Controlla e analizza foto selezionate'),undefined);
   assert.ok(!h.nodes(tree).some(n=>n.type==='PhotoLibrary'));
   assert.equal(h.nodes(tree).filter(n=>n.props.accessibilityRole==='tab').length,4);
  }
 }
});
