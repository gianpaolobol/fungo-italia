import test from "node:test";
import assert from "node:assert/strict";
import { studyAtlasTaxa } from "./study-atlas-catalog.ts";
import { minimumCards } from "./minimum-cards.ts";
test("study catalogue preserves all 148 canonical identities and prescribed ranks",()=> {
 assert.equal(studyAtlasTaxa.length,148);
 assert.equal(new Set(studyAtlasTaxa.map(taxon=>taxon.id)).size,148);
 for(const card of minimumCards){const taxon=studyAtlasTaxa.find(t=>t.id===card.cardId);assert.ok(taxon);assert.equal(taxon.rank,card.rank);assert.equal(taxon.sourceName,card.sourceLabel);}
});
test("study catalogue excludes parser artefacts and unpublished safety assessments",()=> {
 const names=studyAtlasTaxa.map(t=>t.scientificName);
 for(const name of ["Boletus presenti","Armillaria come","Boletus sez","Leccinum tutte"])assert.ok(!names.includes(name));
 for(const taxon of studyAtlasTaxa){assert.equal(taxon.edibility,"non-valutato");assert.match(taxon.safetyNote,/approvazione micologica indipendente/);}
});
test("group learning units do not inherit a single member's classification",()=> {
 for(const taxon of studyAtlasTaxa.filter(t=>t.rank!=="species")){assert.equal(taxon.family,null);assert.equal(taxon.division,"Non documentata");}
});
