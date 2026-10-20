export type StudyState={schemaVersion:1;profile:{name:string;startedAt:string|null};baseSessionId:string|null;baseExam?:{session:any;history:any[]}|null;exam:{session:any;history:any[]}};
export type StoragePort={getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<unknown>};
export const studyKey:string;export const legacyTrainingKey:string;
export function createStudyStore(storage:StoragePort):{load:()=>Promise<StudyState>;subscribe:(fn:(state:StudyState)=>void)=>()=>void;setName:(name:string)=>Promise<StudyState>;start:(now?:string)=>Promise<StudyState>;saveExam:(exam:StudyState['exam'],options?:{limited?:boolean})=>Promise<StudyState>};
