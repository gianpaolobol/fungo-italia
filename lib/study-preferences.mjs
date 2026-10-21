export const STUDY_PREFERENCES_KEY='fungo-italia:study:v1';
// Same stable taxon identifiers and payload format. The original data remains
// untouched; the caller validates before persisting to the shared-app key.
export async function readStudyPreferences(storage,legacyWeb=false){
 const current=await storage.getItem(STUDY_PREFERENCES_KEY);
 return current===null&&legacyWeb?storage.getItem('fungo-italia:pwa:study:v1'):current;
}
