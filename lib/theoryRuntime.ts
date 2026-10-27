import AsyncStorage from '@react-native-async-storage/async-storage';import type {TrainingSummary} from '../web/public/exam-core';
export const theoryStorageKey='fungo-italia:theory-exam:v1';
const listeners=new Set<(history:TrainingSummary[])=>void>();
export function publishTheoryHistory(history:TrainingSummary[]){for(const f of listeners)f(history);}
export function subscribeTheoryHistory(f:(history:TrainingSummary[])=>void){listeners.add(f);return()=>{listeners.delete(f);};}
export async function readTheoryHistory():Promise<TrainingSummary[]>{const raw=await AsyncStorage.getItem(theoryStorageKey);if(!raw)return [];const d=JSON.parse(raw);if(d.version!==1||!Array.isArray(d.history)||!d.history.every((h:TrainingSummary)=>h&&typeof h.id==='string'&&Array.isArray(h.attempts)))throw Error('Storico teorico non leggibile');return d.history;}
