import type {Unit,Evidence,Progress} from './study-progress.mjs';
export type ProgressPoint={sessionId:string;at:string;score:number|null;coverage:number};
export function progressTimeline(input:{units:Unit[];evidence:Evidence[];bankRevision:string;now?:number;maxPoints?:number}):ProgressPoint[];
export function mushroomFill(score:number|null):{percent:number;stem:number;cap:number};
export function preparationStatus(progress:Pick<Progress,'score'|'criticalOpen'|'consolidated'>):{title:string;detail:string;tone:string};
