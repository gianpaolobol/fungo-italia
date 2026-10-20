import photoData from '../src/data/exam-bank.json';
import catalog from '../src/data/catalog.json';
import groups from '../src/data/groups.json';
import {buildCurriculumBank} from './study-curriculum-bank.mjs';
import {bankSignature,examUnits} from './study-exam.mjs';
import type {ExamCase} from '../web/public/exam-core';
export const photoBank=photoData as unknown as ExamCase[];
export const studyBank:ExamCase[]=[...photoBank,...buildCurriculumBank(catalog,groups,photoBank)];
export const studyBankRevision=bankSignature(studyBank);
export const compatibleStudyRevisions=[bankSignature(photoBank)];
export const studyUnits=examUnits(studyBank,[...catalog,...groups]);

export const studyBankCoverage={minimum:{total:catalog.length,photo:photoBank.length,theory:studyBank.filter(c=>c.questionKind==='profile'&&c.scope==='minimum').length},extended:{total:groups.length,theory:studyBank.filter(c=>c.scope==='extended').length}};
