import {test} from 'node:test';
import assert from 'node:assert/strict';
import {suggestionsFromAtlas,__test__} from '../src/threePlusOneSuggestions.ts';
const base={id:'x',scientificName:'Amanita',commonNames:[],characters:[],lookalikes:[],habitat:[]};
const taxa=[
 {...base,id:'can-group',scientificName:'Cantharellaceae',currentGenera:['Cantharellus','Craterellus'],aliases:['cantarelli'],commercialization:{members:[{scientificName:'Cantharellus cibarius'}]}},
 {...base,id:'gom-group',scientificName:'Chroogomphus + Gomphidius',sourceGenera:['Gomphidius','Chroogomphus'],aliases:['Gomphidiaceae']},
 ...Array.from({length:12},(_,i)=>({...base,id:'can-fill-'+i,scientificName:'Candolleomyces '+i}))
];
test('normalizes accents and indexes all group names',()=>{
 assert.equal(__test__.normalize('Cantharéllus'), 'cantharellus');
 assert.ok(__test__.namesOf(taxa[0]).includes('Cantharellus'));
 assert.ok(__test__.namesOf(taxa[1]).includes('Gomphidius'));
});
test('three-letter completion finds group genera and aliases beyond the old 8 item limit',()=>{
 assert.ok(suggestionsFromAtlas(taxa,'can',25).some(x=>x.taxonId==='can-group'));
 assert.ok(suggestionsFromAtlas(taxa,'cant',25).some(x=>x.taxonId==='can-group'));
 assert.ok(suggestionsFromAtlas(taxa,'gom',25).some(x=>x.taxonId==='gom-group'));
 assert.ok(suggestionsFromAtlas(taxa,'gomph',25).some(x=>x.taxonId==='gom-group'));
});
test('prefix matches rank before generic contains matches',()=>{
 const first=suggestionsFromAtlas(taxa,'gom',25)[0];
 assert.equal(first.taxonId,'gom-group');
});
