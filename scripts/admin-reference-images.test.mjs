import {test} from 'node:test';
import assert from 'node:assert/strict';
import {applyAdminReferenceImages,validateAdminReferenceImages} from './admin-reference-images.mjs';
const sha='a'.repeat(64),asset={taxonId:'taxon-1',scientificName:'Amanita caesarea',view:'top',src:'images/reference/admin-'+sha+'.jpg',sha256:sha,byteLength:300,width:100,height:100,subjectTaxon:'Amanita caesarea',attribution:'Gianpaolo',source:{kind:'user-provided'},rights:{license:'rights-reserved',publicationScope:'fungo-italia-authorized',authorization:{method:'uploader-declaration',recordedAt:'2026-10-07T12:00:00.000Z'}},editedBy:'gianpaolobol',updatedAt:'2026-10-07T12:00:00.000Z'};
test('administrator replacement changes only one view without inventing scientific review',()=>{
 const taxon={id:'taxon-1',scientificName:'Amanita caesarea',studyProfile:{edibility:{label:'Preserved'}},referenceImages:[{view:'lateral',src:'images/reference/lateral.jpg'},{view:'top',src:'images/reference/top.jpg'},{view:'underside',src:'images/reference/under.jpg'}]};
 const old=structuredClone(taxon);
 applyAdminReferenceImages([taxon],{version:1,images:[asset]});
 assert.equal(taxon.referenceImages.length,3);assert.deepEqual(taxon.studyProfile,old.studyProfile);
 assert.deepEqual(taxon.referenceImages.find(p=>p.view==='lateral'),old.referenceImages[0]);
 assert.deepEqual(taxon.referenceImages.find(p=>p.view==='underside'),old.referenceImages[2]);
 assert.equal(taxon.referenceImages.find(p=>p.view==='top').src,asset.src);
 assert.match(taxon.referenceImages.find(p=>p.view==='top').credit,/amministratore/);
});
test('replacement can fill a missing view and remains idempotent',()=>{const rows=[{id:'taxon-1',scientificName:'Amanita caesarea'}],m={version:1,images:[asset]};applyAdminReferenceImages(rows,m);applyAdminReferenceImages(rows,m);assert.equal(rows[0].referenceImages.length,1);});
test('wrong target, duplicate slot, oversized upload, unconfirmed rights and arbitrary path are rejected',()=>{
 const rows=[{id:'taxon-1',scientificName:'Amanita caesarea'}];
 for(const mutate of [m=>m.images[0].scientificName='Amanita phalloides',m=>m.images.push(m.images[0]),m=>m.images[0].byteLength=512*1024+1,m=>m.images[0].rights.license='CC0',m=>m.images[0].src='../../app.js',m=>m.images[0].editedBy='outsider']){const m=structuredClone({version:1,images:[asset]});mutate(m);assert.throws(()=>validateAdminReferenceImages(m,rows));}
});
