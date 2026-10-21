export function dashboardModel(input:{profile:{name:string;startedAt:string|null};progress:{score:number|null;confidence?:string}}):{greeting:string;cta:string;stage:number;scoreLabel:string};
export function visibleSessions<T>(history:T[],expanded?:boolean):T[];

import type {TrainingSummary} from '../web/public/exam-core';
import type {Progress} from './study-progress.mjs';
export function sessionTrend(history:TrainingSummary[],signature:string,mode?:'training'|'simulation',count?:number):{latest:number|null;previous:number|null;best:number|null;total:number;delta:number|null};
export function priorityGaps(gaps:Progress['gaps'],taxa:{id:string;scientificName?:string;name?:string}[]):(Progress['gaps'][number]&{name:string})[];
