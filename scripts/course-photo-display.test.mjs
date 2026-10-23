import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const element=(type,props,key)=>({type,props:props||{},key});
const nodes=tree=>!tree||typeof tree!=='object'?[]:Array.isArray(tree)?tree.flatMap(nodes):[tree,...nodes(tree.props?.children)];
const text=tree=>!tree?'':typeof tree==='string'?tree:Array.isArray(tree)?tree.map(text).join(''):text(tree.props?.children);
function component(file,{states=[],assets={},modules={}}={}){
 let cursor=0,values=[...states];
 const react={useState(initial){const i=cursor++;if(!(i in values))values[i]=initial;return [values[i],v=>values[i]=typeof v==='function'?v(values[i]):v];},useMemo:fn=>fn(),useRef:v=>({current:v}),useEffect:()=>{}};
 const Image=Object.assign(()=>{}, {resolveAssetSource:()=>({width:100,height:100})});
 const native={Image,StyleSheet:{create:v=>v},...Object.fromEntries(['Linking','Modal','Pressable','ScrollView','Text','TextInput','View'].map(n=>[n,n]))};
 const imports={react,'react-native':native,'react-native-safe-area-context':{SafeAreaProvider:'SafeAreaProvider',SafeAreaView:'SafeAreaView'},'react/jsx-runtime':{jsx:element,jsxs:element,Fragment:'Fragment'},'../src/data/reference-image-assets':{referenceImageAssets:assets},...modules};
 const js=ts.transpileModule(readFileSync(new URL('../components/'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const output={exports:{}};new Function('require','module','exports',js)(name=>{assert(name in imports,'Unexpected import '+name);return imports[name];},output,output.exports);
 return props=>{cursor=0;return output.exports.default(props);};
}
const photo={src:'course.jpg',view:'collection',alt:'Esercitazione del corso: Agaricus crocodilinus',credit:'Determinazione docente · messaggio 786',subjectTaxon:'Agaricus crocodilinus',relationship:'genus-example',identificationEligible:false};
test('course-only gallery remains separate from the three reference views and opens attribution',()=>{
 const render=component('ReferencePhotos.tsx',{assets:{'course.jpg':1}}),props={taxon:{scientificName:'Agaricus',courseImages:[photo]}};
 let tree=render(props);
 assert(text(tree).includes('Fotografie delle esercitazioni del corso'));
 assert.equal(nodes(tree).filter(n=>n.props.accessibilityLabel?.startsWith('Ingrandisci vista ')).length,0);
 assert.equal(nodes(tree).filter(n=>n.type==='Text'&&text(n)==='Vista non disponibile').length,3);
 const open=nodes(tree).find(n=>n.props.accessibilityLabel==='Apri fotografia del corso: '+photo.subjectTaxon);assert(open);open.props.onPress();
 tree=render(props);
 assert(text(tree).includes(photo.credit));assert(text(tree).includes('Esercitazione del corso'));
 assert.equal(nodes(tree).find(n=>n.type==='Modal').props.visible,true);
});
function exam(current,feedback=null){
 const session={queue:[current.id],phase:'initial',first:[],round:0,mode:'training',feedback,draft:{name:'',category:'',choices:{}}};
 return component('PhotoExam.tsx',{states:[session,[],false,true,false,'',{name:'',category:'',choices:{},assisted:false},null],assets:{'triad.jpg':1,'course.jpg':2},modules:{'../lib/studyRuntime':{},'../lib/study-store.mjs':{createStudyExamWriter:()=>({})},'../lib/study-exam.mjs':{},'../lib/studyBank':{studyBank:[current],photoBank:[current],demoBank:[]},'../src/data/catalog.json':[],'../web/public/exam-core':{detailQuestions:()=>[],suggestNames:()=>[],foodLabels:{toxic:'Tossico'},foodColors:{toxic:'#fff'}}}})({});
}
const current={id:'case',name:'Agaricus test',category:'toxic',acceptedNames:['Agaricus test'],photos:[{src:'triad.jpg'}],coursePhotos:[{...photo,relationship:'species-match',identificationEligible:true}],questionKind:'photo'};
test('photo exam shows course collections without revealing identification or attribution before correction',()=>{
 const tree=exam(current);assert.equal(nodes(tree).filter(n=>n.props.accessibilityLabel==='Fotografia del corso 1').length,1);
 assert.equal(nodes(tree).filter(n=>n.props.accessibilityLabel==='Vista fotografica 1 del fungo da identificare').length,1);
 assert(!text(tree).includes(photo.subjectTaxon));assert(!text(tree).includes(photo.credit));
});
test('theory cases and corrected photo cases display course provenance',()=>{
 for(const tree of [exam({...current,questionKind:'profile'}),exam(current,{answer:{name:'',category:''},grade:{passed:false,name:false,category:false,details:[],danger:false}})]){
  assert(text(tree).includes(photo.subjectTaxon));assert(text(tree).includes(photo.credit));
 }
});
