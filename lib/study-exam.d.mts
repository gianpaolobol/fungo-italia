import type {Training,TrainingAnswer,TrainingSummary,ExamCase} from '../web/public/exam-core';import type {Unit,Evidence} from './study-progress.mjs';
export function startStudyExam(bank:ExamCase[],options?:{mode?:'training'|'simulation';taxonIds?:string[]}):Training;
export function submitStudyAnswer(state:Training,answer:TrainingAnswer,bank:ExamCase[]):Training;
export function historyEvidence(history:TrainingSummary[]):Evidence[];
export function examUnits(bank:ExamCase[],extraTaxa?:{id:string;kind?:string}[]):Unit[];
export function bankSignature(bank:ExamCase[]):string;
