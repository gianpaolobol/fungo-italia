import type {Training,TrainingAnswer,TrainingSummary,ExamCase} from '../web/public/exam-core';import type {Unit,Evidence} from './study-progress.mjs';
export function startStudyExam(bank:ExamCase[],options?:{mode?:'training'|'simulation';taxonIds?:string[];minimumOnly?:boolean}):Training;
export function submitStudyAnswer(state:Training,answer:TrainingAnswer,bank:ExamCase[]):Training;
export function historyEvidence(history:TrainingSummary[],options?:{bankRevision?:string;compatibleRevisions?:string[]}):Evidence[];
export function examUnits(bank:ExamCase[],extraTaxa?:{id:string;kind?:string}[]):Unit[];
export function bankSignature(bank:ExamCase[]):string;

export function restoreStudyExam(raw:string,bank:ExamCase[],legacyBank?:ExamCase[],options?:{minimumOnly?:boolean}):Training|null;
