export const STUDY_PREFERENCES_KEY:string;
export function readStudyPreferences(storage:{getItem(key:string):Promise<string|null>},legacyWeb?:boolean):Promise<string|null>;
