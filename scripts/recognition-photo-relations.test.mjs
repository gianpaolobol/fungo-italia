import test from 'node:test';
import assert from 'node:assert/strict';
import {candidatePhotoRelation} from './recognition-photo-relations.mjs';
const photo=(subjectTaxon)=>({src:'images/reference/example.jpg',credit:'Accredito originale',subjectTaxon});
test('exact taxon photo matches',()=>assert.deepEqual(candidatePhotoRelation({scientificName:'Amanita phalloides'},photo('Amanita phalloides')),{match:true,reason:'exact-label'}));
test('explicit accepted name matches',()=>assert.deepEqual(candidatePhotoRelation({scientificName:'Cortinarius rubellus',currentAcceptedNames:['Cortinarius orellanoides']},photo('Cortinarius orellanoides')),{match:true,reason:'explicit-accepted-name'}));
test('genus alone does not certify membership',()=>assert.deepEqual(candidatePhotoRelation({scientificName:'Galerina marginata group'},photo('Galerina marginata')),{match:false,reason:'needs-explicit-membership-evidence'}));
test('missing credit blocks use',()=>assert.equal(candidatePhotoRelation({scientificName:'Amanita phalloides'},{...photo('Amanita phalloides'),credit:''}).match,false));
test('different genus blocks use',()=>assert.equal(candidatePhotoRelation({scientificName:'Amanita phalloides'},photo('Galerina marginata')).match,false));
