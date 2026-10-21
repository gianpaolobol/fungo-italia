import type {ExamCase} from '../web/public/exam-core';
export type CurriculumTaxon={id:string;scientificName:string;characters?:string[];habitat?:string[];studyProfile?:{sporePrint?:{label?:string};odor?:string};sources?:{sourceId:string;fields?:string[]}[]};
export function buildCurriculumBank(minimum:CurriculumTaxon[],extended:CurriculumTaxon[],photo:ExamCase[]):ExamCase[];
