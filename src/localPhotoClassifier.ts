import {requireOptionalNativeModule} from 'expo-modules-core';
import {Classification,Photo} from './photoScan';
const native=requireOptionalNativeModule<{classifyAsset:(id:string)=>Promise<Classification>;createSnapshot:()=>Promise<Photo[]>}>('FungoPhotoFilter');
export const photoClassifierAvailable=!!native;
export async function classifyLocalPhoto(id:string):Promise<Classification>{
 if(!native)return {supported:false,predictions:[],reason:'Serve la nuova build iOS'};
 return native.classifyAsset(id);
}

export async function createPhotoSnapshot():Promise<Photo[]>{if(!native)throw Error("Serve la nuova build iOS");return native.createSnapshot();}
