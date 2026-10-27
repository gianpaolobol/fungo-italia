import type {TrainingSummary,ExamCase} from '../web/public/exam-core';
export function selectPhotoSession(bank:ExamCase[],history:TrainingSummary[],count?:number,rng?:()=>number,now?:number,priorityIds?:string[]):string[];
export function cardLearning(history:TrainingSummary[]):Record<string,{perfect:number;learned:boolean;lastSession:string|null;lastCorrect?:boolean}>;
