import assert from "node:assert/strict";
import test from "node:test";
import {catalogSearchDocuments,searchCatalog,type CatalogSearchDocument} from "./catalog-search.ts";
import type {Taxon} from "./domain.ts";
import {overlayPublishedStudySearchDocuments} from "./published-study-search.ts";
const species=catalogSearchDocuments.find(document=>document.kind==="minimumTaxon"&&document.rank==="species")!;
const group=catalogSearchDocuments.find(document=>document.kind==="minimumTaxon"&&document.rank!=="species")!;
function published(document:CatalogSearchDocument,values:Partial<Taxon>={}):Taxon{return{id:document.id,commonName:"Nome aggiornato di prova",scientificName:"Testomyces verificatus",rank:"species",aliases:["Alias storico di prova"],regionalNames:[{name:"Nome locale aggiornato",regions:["Toscana"]}],edibility:"non-valutato",safetyNote:"Nota pubblicata di prova",hosts:["Ospite documentato di prova"],...values};}
test("published names, associations and citations are searchable without rewriting source identity",()=>{
 const before=JSON.stringify(catalogSearchDocuments),taxon=published(species);
 const documents=overlayPublishedStudySearchDocuments(catalogSearchDocuments,[taxon]);
 for(const query of ["Testomyces verificatus","Nome aggiornato di prova","Alias storico di prova","Nome locale aggiornato","Ospite documentato di prova","Nota pubblicata di prova"])assert.ok(searchCatalog({query,limit:500},documents).items.some(document=>document.id===species.id),query);
 const updated=documents.find(document=>document.id===species.id)!;
 assert.equal(updated.sourceLabel,species.sourceLabel);assert.equal(updated.parentTeachingCardId,species.parentTeachingCardId);assert.equal(JSON.stringify(catalogSearchDocuments),before);
});
test("published names do not upgrade food approval or review status",()=>{
 const [document]=overlayPublishedStudySearchDocuments([species],[published(species,{edibility:"commestibile"})]);
 assert.equal(document.edibilityCategory,species.edibilityCategory);assert.equal(document.reviewStatus,species.reviewStatus);
});
test("published group labels preserve member names and documented genera",()=>{
 const [document]=overlayPublishedStudySearchDocuments([group],[published(group,{scientificName:"Inventogenus insieme documentato",rank:group.rank as Taxon["rank"]})]);
 assert.deepEqual(document.currentNames,group.currentNames);assert.deepEqual(document.genera,group.genera);
 assert.equal(document.title,"Inventogenus insieme documentato");
});
test("unknown records do not become study cards and teaching groups stay intact",()=>{
 const teaching=catalogSearchDocuments.find(document=>document.kind==="teachingGroup")!;
 const documents=overlayPublishedStudySearchDocuments(catalogSearchDocuments,[published(species,{id:"unknown"}),published(teaching)]);
 assert.equal(documents.length,catalogSearchDocuments.length);assert.deepEqual(documents.find(document=>document.id===teaching.id),teaching);
});
