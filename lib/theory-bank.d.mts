import type {ExamCase} from '../web/public/exam-core';
export type TheoryCase=ExamCase&{taxonId:string;topic:string};
export const theoryTopics:Record<string,string>;
export function buildTheoryBank(catalog:any[],groups:any[],photos:ExamCase[],foundations?:any[],modules?:any[]):TheoryCase[];
export function selectTheorySession(bank:TheoryCase[],history:any[],count?:number,rng?:()=>number,topic?:string):string[];
