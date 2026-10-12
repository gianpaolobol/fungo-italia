import test from 'node:test';
import assert from 'node:assert/strict';
import {gradeResponse} from '../web/public/exam-core.js';

test('species name remains correct when only edibility is wrong',()=>{
 const marasmius={
  id:'case-marasmius-oreades',
  name:'Marasmius oreades',
  acceptedNames:['Marasmius oreades'],
  category:'conditional',
  detailKind:null,
  photos:[],
  sources:[]
 };
 const grade=gradeResponse(marasmius,{name:'Marasmius oreades',category:'free',choices:{}},[marasmius]);
 assert.equal(grade.name,true);
 assert.equal(grade.category,false);
 assert.equal(grade.passed,false);
});

test('species name grading is case and spacing tolerant',()=>{
 const marasmius={
  id:'case-marasmius-oreades',
  name:'Marasmius oreades',
  acceptedNames:['Marasmius oreades'],
  category:'conditional',
  detailKind:null,
  photos:[],
  sources:[]
 };
 const grade=gradeResponse(marasmius,{name:'  marasmius   oreades  ',category:'conditional',choices:{}},[marasmius]);
 assert.equal(grade.name,true);
 assert.equal(grade.category,true);
 assert.equal(grade.passed,true);
});
