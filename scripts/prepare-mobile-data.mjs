import {applyApprovedExternalStudyEvidence} from './approved-external-study-evidence.mjs';
import {buildExamBank} from '../web/public/exam-core.js';
import {applyReviewedMatrix,readReviewedMatrix} from './reviewed-matrix.mjs';
import {applyToxicologySyndromes} from './toxicology-syndromes.mjs';
import {applyAdminReferenceImages} from './admin-reference-images.mjs';
import {applyCommercialization} from './commercialization.mjs';
import {applyStudyProfiles,applyReferenceImages} from './study-profiles.mjs';
import {applyCourseLiterature} from './course-literature.mjs';
import {cleanAtlasRecord,internalFoundations} from './atlas-content.mjs';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const input='legacy/web/artifacts/floot-readiness',output='src/data';
const manifest=JSON.parse(await readFile(join(input,'manifest.json'),'utf8'));
async function read(name){const expected=manifest.files.find(f=>f.name===name);if(!expected)throw Error('Missing manifest entry '+name);const bytes=await readFile(join(input,name));if(bytes.length!==expected.bytes||createHash('sha256').update(bytes).digest('hex')!==expected.sha256)throw Error('Checksum mismatch '+name);return JSON.parse(bytes.toString('utf8'));}
const [taxa,meta,baseline,evidence,sourceRecords,areas]=await Promise.all(['study-atlas-taxa.json','catalog-data.json','scientific-baseline.json','field-profile-evidence.json','catalog-sources.json','areas.json'].map(read));
if(taxa.length!==148||meta.minimumCards.length!==148||baseline.independentReviewComplete!==false)throw Error('Invalid canonical baseline');
const units=new Map(meta.minimumCards.map(u=>[u.cardId,u])),sources=new Map(sourceRecords.map(s=>[s.sourceId,s]));
const unique=v=>[...new Set(v.filter(x=>typeof x==='string'&&x.trim()))];
if(units.size!==148||sources.size!==sourceRecords.length||baseline.total!==148||new Set(areas.map(a=>a.id)).size!==areas.length)throw Error('Duplicate or inconsistent source data');
const supplementaryBytes=await readFile(join(output,'supplementary-literature.json'),'utf8');
const supplementary=JSON.parse(supplementaryBytes);
if(supplementary.version!==1||!Array.isArray(supplementary.records))throw Error('Invalid supplementary literature');
const supplements=new Map(supplementary.records.map(e=>[e.scientificName,e]));
if(supplements.size!==supplementary.records.length||supplementary.records.some(e=>!taxa.some(t=>t.scientificName===e.scientificName)||!['commonNames','habitat','lookalikes'].every(field=>Array.isArray(e[field])&&e[field].every(v=>typeof v==='string'&&v.trim()))||!Array.isArray(e.sources)||e.sources.some(s=>s.reviewScope!=='supplementary-literature'||!/^https:\/\//.test(s.url))))throw Error('Invalid supplementary field references');
const catalog=taxa.map(t=>{
 const extra=supplements.get(t.scientificName)??{commonNames:[],habitat:[],lookalikes:[],sources:[]};
 const unit=units.get(t.id),p=baseline.profiles[t.sourceName];
 if(!unit||unit.rank!==t.rank||t.sourceName!==unit.sourceLabel||!Number.isInteger(unit.sourcePage)||unit.sourcePage<1||t.scientificName!==unit.displayName||!p||!Array.isArray(p.characters)||p.characters.length!==3||!p.characters.every(c=>typeof c==='string'&&c.trim())||!p.plusOne||p.reviewScope!=='internal'||p.independentReviewStatus!=='not-attested')throw Error('Invalid concept/provenance '+t.id);
 if(JSON.stringify(t.diagnosticCharacters)!==JSON.stringify(p.characters))throw Error('Character mismatch '+t.id);
 const internalId='evidence-field-profile-'+unit.learningUnitId;
 const linked=evidence.filter(e=>e.evidenceId===internalId||e.evidenceId.startsWith('evidence-field-profile-source-'+unit.learningUnitId+'-'));
 if(!linked.some(e=>e.evidenceId===internalId))throw Error('Missing internal evidence '+t.id);
 const s1=sources.get('S1-obiettivi-tassonomici-v4-2026-06-09');if(!s1)throw Error('Missing curriculum source');
 const refs=[{sourceId:s1.sourceId,reviewScope:'course-objective',title:s1.title,location:'p. '+unit.sourcePage,url:s1.url,supportedClaim:'Inclusione e rango dell’obiettivo didattico; non prova di morfologia o commestibilità.'},...linked.map(e=>{const s=sources.get(e.sourceId);if(!s||!e.sourceLocation)throw Error('Missing registered evidence '+e.evidenceId);return {sourceId:s.sourceId,evidenceId:e.evidenceId,title:s.title,authors:s.authors,location:e.sourceLocation,url:s.url,supportedClaim:e.claimSummary,notes:e.notes,reviewStatus:e.reviewStatus};})];
 return {id:t.id,scientificName:t.scientificName,commonNames:unique([t.commonName,...(t.regionalNames??[]).map(r=>typeof r==='string'?r:r.name),...extra.commonNames]).filter(n=>n!==t.scientificName),characters:p.characters,lookalikes:extra.lookalikes,lookalikesStatus:extra.lookalikes.length?'literature-pointers':'not-exported',habitat:unique([...(t.ecology??[]),...extra.habitat]),sources:[...refs,...extra.sources],rank:unit.rank,currentAcceptedNames:unit.currentAcceptedNames,diagnosticStatus:p.diagnosticStatus,diagnosticNote:p.diagnosticNote??null,safetyCheck:p.safetyCheck??null,safetyNote:t.safetyNote,reviewStatus:p.reviewStatus,aliases:unit.rank==='species'?(t.aliases??[]):[],sourceLabel:unit.sourceLabel,learningUnitId:unit.learningUnitId,deepMorphologyRequired:unit.deepMorphologyRequired,acceptedName:t.acceptedName,sourceName:t.sourceName,authorship:t.authorship,division:t.division,className:t.className,order:t.order,family:t.family,externalIds:t.externalIds,differentiatingCharacter:p.plusOne,reviewScope:'internal',independentReviewStatus:'not-attested',edibility:t.edibility,publishedDatabaseChangesIncluded:false};
});
if(new Set(catalog.map(t=>t.id)).size!==148)throw Error('Duplicate canonical IDs');
const teachingGroups=meta.genusCards.map(g=>({id:g.cardId,scientificName:g.displayTitle,commonNames:[],rank:g.sourceRank,kind:'teaching-group',characters:[],lookalikes:[],lookalikesStatus:'not-exported',habitat:[],aliases:[],currentAcceptedNames:[],currentGenera:g.currentGenera,sourceGenera:g.sourceGenera,sourceLabel:g.sourceLabel,relatedIds:g.minimumChildCardIds,sources:[{sourceId:'S1-obiettivi-tassonomici-v4-2026-06-09',reviewScope:'course-objective',title:sources.get('S1-obiettivi-tassonomici-v4-2026-06-09').title,location:'p. '+g.sourcePage,supportedClaim:'Obiettivo didattico e collegamento delle unità minime; non prova di commestibilità.'}],reviewScope:'internal',independentReviewStatus:'not-attested'}));
if(teachingGroups.length!==66||new Set(teachingGroups.map(g=>g.id)).size!==66||teachingGroups.some(g=>g.relatedIds.some(id=>!units.has(id))))throw Error('Invalid teaching groups');
const courseRegistry=JSON.parse(await readFile(join(output,'course-sources.json'),'utf8'));
const courseLiterature=JSON.parse(await readFile(join(output,'course-literature.json'),'utf8'));
applyCourseLiterature([...catalog,...teachingGroups],courseLiterature,courseRegistry);
const studyProfiles=JSON.parse(await readFile(join(output,'study-profiles.json'),'utf8'));
const referenceImages=JSON.parse(await readFile(join(output,'reference-images.json'),'utf8'));
applyStudyProfiles([...catalog,...teachingGroups],studyProfiles,courseRegistry);
applyToxicologySyndromes([...catalog,...teachingGroups],JSON.parse(await readFile(join(output,'toxicology-syndromes.json'),'utf8')));
applyApprovedExternalStudyEvidence([...catalog,...teachingGroups],JSON.parse(await readFile(join('src/data','external-study-evidence-candidates.json'),'utf8')));
applyReferenceImages([...catalog,...teachingGroups],referenceImages);
const adminImages=JSON.parse(await readFile(join(output,'admin-reference-images.json'),'utf8'));
applyAdminReferenceImages([...catalog,...teachingGroups],adminImages);
applyCommercialization([...catalog,...teachingGroups],JSON.parse(await readFile(join(output,'commercialization.json'),'utf8')));
applyReviewedMatrix([...catalog,...teachingGroups],await readReviewedMatrix(),studyProfiles);
const nativeExamBank=buildExamBank(catalog,studyProfiles);
if(nativeExamBank.length<15)throw Error('Insufficient native exam cases');
await writeFile(join(output,'exam-bank.json'),JSON.stringify(nativeExamBank,null,2)+'\n');
const mobileAreas=areas.map(a=>{if(!Array.isArray(a.center)||a.center.length!==2||!a.center.every(Number.isFinite)||Math.abs(a.center[0])>90||Math.abs(a.center[1])>180)throw Error('Invalid [latitude,longitude] '+a.id);return {...a,coordinateOrder:'latitude-longitude',signalProvenance:a.signalProvenance??'heuristic',verifiedSignals:a.signalProvenance==='measured'?a.verifiedSignals:0,delayedVisitors:a.signalProvenance==='measured'?a.delayedVisitors:0};});

const areaLiterature=JSON.parse(await readFile(join(output,'area-literature.json'),'utf8'));
if(areaLiterature.version!==1||!Array.isArray(areaLiterature.records)||new Set(areaLiterature.records.map(record=>record.id)).size!==areaLiterature.records.length)throw Error('Invalid area literature');
for(const record of areaLiterature.records){
 const area=mobileAreas.find(area=>area.id===record.id);
 if(!area||!Array.isArray(record.evidenceSources)||record.evidenceSources.some(source=>typeof source.label!=='string'||!source.label.trim()||source.kind!=='regional-authority'||typeof source.url!=='string'||!/^https:\/\//.test(source.url)))throw Error('Invalid regional area reference '+record.id);
 const existing=area.evidenceSources||[];
 area.evidenceSources=[...existing,...record.evidenceSources.filter(source=>!existing.some(old=>old.url===source.url))];
}

await mkdir(output,{recursive:true});
await Promise.all([writeFile(join(output,'internal-foundations.json'),JSON.stringify(internalFoundations(sourceRecords),null,2)+'\n'),writeFile(join(output,'groups.json'),JSON.stringify(teachingGroups.map(cleanAtlasRecord),null,2)+'\n'),writeFile(join(output,'catalog.json'),JSON.stringify(catalog.map(cleanAtlasRecord),null,2)+'\n'),writeFile(join(output,'areas.json'),JSON.stringify(mobileAreas,null,2)+'\n'),writeFile(join(output,'provenance.json'),JSON.stringify({schemaVersion:1,legacySnapshotCommit:'e3b9ca01bd43ec87d3630ab954c45229b2ba15e1',sourceExportCommit:manifest.commit??null,canonicalUnits:148,areas:mobileAreas.length,independentReviewComplete:false,pendingScientificClaims:manifest.pendingScientificClaims,supplementaryLiterature:{file:'supplementary-literature.json',sha256:createHash('sha256').update(supplementaryBytes).digest('hex'),reviewStatus:supplementary.reviewStatus},sourceFileChecksums:manifest.files},null,2)+'\n')]);
console.log(JSON.stringify({canonicalUnits:catalog.length,areas:mobileAreas.length,independentReviewComplete:false}));

const imageAssetModule="import type {ImageSourcePropType} from 'react-native';\nexport const referenceImageAssets:Record<string,ImageSourcePropType>={\n"+[...new Set([...referenceImages.images,...adminImages.images].map(image=>image.src))].map(src=>JSON.stringify(src)+':require('+JSON.stringify('../../web/public/'+src)+'),').join('\n')+'\n};\n';
await writeFile(join(output,'reference-image-assets.ts'),imageAssetModule);
