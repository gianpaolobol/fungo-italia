import photoData from '../src/data/exam-bank.json';
import catalog from '../src/data/catalog.json';
import groups from '../src/data/groups.json';
import {buildCurriculumBank} from './study-curriculum-bank.mjs';
import {agaricusOnly} from './demo-policy.mjs';
import {bankSignature,examUnits} from './study-exam.mjs';
import type {ExamCase} from '../web/public/exam-core';
export const photoBank=photoData as unknown as ExamCase[];
export const studyBank:ExamCase[]=[...photoBank,...buildCurriculumBank(catalog,groups,photoBank)];
export const studyBankRevision=bankSignature(studyBank);
export const compatibleStudyRevisions=[bankSignature(photoBank),'3821490181'];
export const demoBank=agaricusOnly(photoBank);
export const demoUnits=examUnits(demoBank);
export const demoBankRevision=bankSignature(demoBank);
// Existing annual-only demo used the older photo ordering. Its four cases survive.
export const compatibleDemoRevisions=['3491070309'];
export const studyUnits=examUnits(studyBank,[...catalog,...groups]);

export const studyBankCoverage={minimum:{total:catalog.length,photo:photoBank.length,theory:studyBank.filter(c=>c.questionKind==='profile'&&c.scope==='minimum').length},extended:{total:groups.length,theory:studyBank.filter(c=>c.scope==='extended').length}};

// Every navigable atlas card must be represented by a documented photo or theory case.
const atlasIds=[...catalog,...groups].map(t=>t.id);
const caseIds=studyBank.map(c=>c.id);
if(new Set(atlasIds).size!==atlasIds.length||new Set(caseIds).size!==caseIds.length||atlasIds.length!==caseIds.length||atlasIds.some(id=>!caseIds.includes(id)))throw Error('Atlante e banca di esame non allineati: schede mancanti, duplicate o inattese');
