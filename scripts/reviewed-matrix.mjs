import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const guide='S2-guida-ragionata-commestibilita-2021';
const approvedHash='c4c06a5eda1c4ed3c29c0d4c4e2f67efeb72f0b0e7dc93706003b1f81578af55';
const labels={free:'libera',conditional:'condizionata',discouraged:'sconsigliato','no-food-value':'privo di valore',inedible:'non commestibile',toxic:'tossico',deadly:'tossico mortale',mixed:'variabile: consulta le singole specie'};
const lines=v=>String(v||'').split('\n').map(s=>s.trim()).filter(Boolean);
const documented=v=>typeof v==='string'&&v.trim()&&!/^Non documentat[oa]$/.test(v);
export async function readReviewedMatrix(){
 const bytes=await readFile(new URL('../revisione/matrice.json',import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),approvedHash,'Matrice modificata: integrare soltanto una versione autorizzata');
 const matrix=JSON.parse(bytes);matrix.integrationEvidence=JSON.parse(await readFile(new URL('../revisione/riscontri-ispra.json',import.meta.url),'utf8'));
 assert.equal(matrix.integrationEvidence.version,matrix.matrixVersion);
 return matrix;
}
export function applyReviewedMatrix(records,matrix,profiles){
 assert(matrix.edibilityPolicy?.authoritativeSourceId===guide&&matrix.edibilityPolicy.otherSourcesMayOverride===false,'La Guida deve essere prevalente');
 assert.equal(records.length,214);assert.equal(matrix.taxa.length,214);
 const taxa=new Map(records.map(t=>[t.id,t]));assert.equal(taxa.size,214);
 assert.equal(new Set(matrix.taxa.map(t=>t.id)).size,214);
 const foodProfiles=new Map(profiles.records.map(t=>[t.scientificName,t]));
 const registry=new Map(matrix.sourceRegistry.map(s=>[s.sourceId,s]));
 // Validate every judgment before mutating the catalog; external concordance never overrides the guide.
 for(const row of matrix.taxa){
  const taxon=taxa.get(row.id);assert(taxon&&taxon.scientificName===row.scientificName,'Identità della matrice non coerente');
  const p=foodProfiles.get(row.scientificName),food=p?.profile.edibility;
  if(food){
   assert(p.evidence.some(e=>e.sourceId===guide&&e.fields.includes('edibility')),'Giudizio privo di Guida');
   assert.equal(row.values['edibility.category'],labels[food.category],'Categoria difforme dalla Guida: '+row.scientificName);
   assert.equal(row.values['edibility.label'],food.label,'Giudizio difforme dalla Guida');
  }else assert.equal(row.values['edibility.category'],taxon.kind==='teaching-group'?'Consulta le singole specie':'non documentata','Non inferire un giudizio assente dalla Guida');
 }
 for(const row of matrix.taxa){
  const t=taxa.get(row.id),v=row.values;
  t.studyProfile??={};
  if(documented(v.odor))t.studyProfile.odor=v.odor;
  if(documented(v['sporePrint.label']))t.studyProfile.sporePrint={...t.studyProfile.sporePrint,label:v['sporePrint.label']};
  const chars=[v['characters.0'],v['characters.1'],v['characters.2']];
  if(chars.every(documented))t.characters=chars;
  if(documented(v.differentiatingCharacter))t.differentiatingCharacter=v.differentiatingCharacter;
  if(documented(v.habitat))t.habitat=lines(v.habitat);
  const food=foodProfiles.get(row.scientificName)?.profile.edibility;
  if(food){
   t.studyProfile.edibility={...t.studyProfile.edibility,category:food.category,label:food.label,precautions:lines(v['edibility.precautions']).filter(s=>!/^Nessuna precauzione/.test(s))};
   if(row.scientificName==='Macrolepiota procera s.l.')t.studyProfile.edibility.precautions=t.studyProfile.edibility.precautions.map(s=>s.includes('prescrizione svizzera')?v['review.preparation.cottura']:s);
  }else delete t.studyProfile.edibility;
  const note=v['review.notes']||'';
  if(note.includes('CONFLITTO SPORATA:')){
   const conflict=note.split('\n').find(s=>s.startsWith('CONFLITTO SPORATA:'));
   if(!t.diagnosticNote?.includes(conflict))t.diagnosticNote=[t.diagnosticNote,conflict].filter(Boolean).join('\n');
  }
  for(const a of matrix.integrationEvidence?.assertions||[]){
   if(a.taxonId!==t.id||a.sourceId===guide)continue;
   const source=registry.get(a.sourceId);assert(source,'Fonte della matrice non registrata');
   const citation={sourceId:source.sourceId,title:source.title,authors:[source.authors],url:source.url,location:`p. ${a.printedPage} (PDF ${a.pdfPage})`,fields:[a.field],supportedClaim:a.claim,notes:a.scope+'; '+a.decision,reviewStatus:'bibliographic-review-not-professional-approval'};
   if(!t.sources.some(s=>s.sourceId===citation.sourceId&&s.location===citation.location&&s.supportedClaim===citation.supportedClaim))t.sources.push(citation);
  }
 }
 return {version:matrix.matrixVersion,sha256:approvedHash,edibilityAuthority:'Guida ragionata alla commestibilità dei funghi (2021)',edibilityAuthorityISBN:'979-12-200-9297-5'};
}
