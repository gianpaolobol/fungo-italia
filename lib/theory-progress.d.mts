import type {Unit,Evidence} from './study-progress.mjs';import type {TheoryCase} from './theory-bank.mjs';import type {DetailQuestion} from '../web/public/exam-core';
export function addTheoryUnits(existing:Unit[],bank:TheoryCase[],photos:Set<string>):Unit[];
export function theoryEvidence(history:any[],bank:TheoryCase[],theoryRevision:string,studyRevision:string,photos:Set<string>):Evidence[];
export function orderQuestionOptions(q:DetailQuestion,sessionId:string):DetailQuestion['options'];
