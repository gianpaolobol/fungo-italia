export type StudyState={schemaVersion:1;profile:{name:string;startedAt:string|null};exam:{session:any;history:any[]}};
export type StoragePort={getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<unknown>};
export const studyKey:string;export const demoStudyKey:string;export const legacyTrainingKey:string;
export function createStudyStore(storage:StoragePort,options?:{demo?:boolean}):{load:()=>Promise<StudyState>;subscribe:(fn:(state:StudyState)=>void)=>()=>void;setName:(name:string)=>Promise<StudyState>;start:(now?:string)=>Promise<StudyState>;saveExam:(exam:StudyState['exam'])=>Promise<StudyState>};
export function createStudyExamWriter(store:ReturnType<typeof createStudyStore>):{hydrate:()=>Promise<StudyState>;start:()=>Promise<StudyState>;saveExam:(exam:StudyState['exam'])=>Promise<StudyState>};
