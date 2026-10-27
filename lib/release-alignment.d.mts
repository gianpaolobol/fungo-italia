export type LocalRelease={sourceCommit?:string;version?:string;dirty?:boolean};
export type ConfirmedRelease={schemaVersion:1;sourceCommit:string;version:string;buildNumber:string;iconSha256:string;webContentHash:string;appleBuildId:string;processingState:'VALID';internalBuildState:'IN_BETA_TESTING'|'READY_FOR_BETA_TESTING';testFlightOnly:true;diagnosticOnly:boolean};
export type WebOnlyRelease={schemaVersion:2;distribution:'web-only';sourceCommit:string;version:string;iconSha256:string;webContentHash:string;iosUpdatePendingOwnerConfirmation:true;independentReleaseReady:true;appStoreReady:false};
export type AlignmentResult={status:'aligned'|'web-current'|'update-available'|'unknown';release:ConfirmedRelease|WebOnlyRelease|null};
export const RELEASE_URL:string;
export function validateRelease(value:unknown):ConfirmedRelease|WebOnlyRelease|null;
export function compareRelease(local:LocalRelease|null|undefined,value:unknown):AlignmentResult;
export function checkRelease(local:LocalRelease|null|undefined,options?:{fetcher?:typeof fetch;timeoutMs?:number}):Promise<AlignmentResult>;
export function prepareWebUpdate(serviceWorker:Pick<ServiceWorkerContainer,'getRegistration'>,timeoutMs?:number):Promise<void>;
