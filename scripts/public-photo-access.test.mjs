import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const root=process.cwd();
function reachable(entry){
 const seen=new Set();
 function visit(file){
  if(seen.has(file))return;seen.add(file);
  const source=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
  function walk(node){
   const specifier=(ts.isImportDeclaration(node)||ts.isExportDeclaration(node))?node.moduleSpecifier:
    ts.isCallExpression(node)&&(node.expression.kind===ts.SyntaxKind.ImportKeyword||node.expression.getText(source)==='require')?node.arguments[0]:null;
   if(specifier&&ts.isStringLiteral(specifier)&&specifier.text.startsWith('.')){
    const base=path.resolve(path.dirname(file),specifier.text);
    const next=[base,...['.ts','.tsx','.mjs','.js','/index.ts','/index.tsx'].map(ext=>base+ext)].find(p=>existsSync(p)&&/\.(?:[cm]?js|tsx?)$/.test(p));
    if(next)visit(next);
   }
   ts.forEachChild(node,walk);
  }
  walk(source);
 }
 visit(path.resolve(root,entry));return seen;
}
test('public app cannot reach retained personal photo selection or analysis code, even through indirect imports',()=>{
 const publicSources=reachable('index.js');
 for(const file of ['components/PhotoLibrary.tsx','components/ObservationPhotos.tsx','src/photoScan.ts']){
  assert(existsSync(file),'Retain implementation: '+file);
  assert(!publicSources.has(path.resolve(root,file)),'Public app exposes photo workflow: '+file);
 }
 assert(existsSync('modules/fungo-photo-filter/ios/FungoPhotoFilterModule.swift'));
 assert(reachable('components/PhotoLibrary.tsx').has(path.resolve(root,'src/photoScan.ts')),'Guard must follow the retained analysis dependency');
});
