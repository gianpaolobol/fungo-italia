import type {Unit,Evidence} from './study-progress.mjs';
export function selectTraining(input:{units:Unit[];evidence:Evidence[];bankRevision:string;now?:number;seed?:number;count?:number}):{taxonIds:string[];reasons:Record<string,string>};
export function nextReview(input:{successStage:number;lastAttemptAt:number|string;correct:boolean;independent:boolean}):{stage:number;dueAt:string};
