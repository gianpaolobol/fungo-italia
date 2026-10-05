import {PrivateObservation} from './photoObservations';

export type CandidateEvidence={
 observationId:string;
 assetIds:string[];
 capturedAt:number|null;
 preciseLocation:{latitude:number;longitude:number}|null;
 exifSummary:Record<string,string|number|boolean|null>;
 appleCandidate:string|null;
 needsVisualReview:true;
};

function safeExif(exif:{[key:string]:any}){
 const allow=['Make','Model','LensModel','DateTimeOriginal','DateTimeDigitized','PixelXDimension','PixelYDimension','FNumber','ExposureTime','ISOSpeedRatings','FocalLength'];
 return Object.fromEntries(allow.filter(k=>exif?.[k]!==undefined).map(k=>[k,typeof exif[k]==='object'?String(exif[k]):exif[k]]));
}

/**
 * Enriches only a bounded candidate set. Precise GPS never leaves the private observation store.
 * Apple Visual Look Up labels are intentionally not inferred here: PhotoKit/Expo does not expose
 * the Photos app's private Visual Look Up result as a supported asset field.
 */
export async function enrichCandidates(observations:PrivateObservation[],maxObservations=100){
 const MediaLibrary=await import('expo-media-library');
 const selected=observations.slice(0,maxObservations),out:CandidateEvidence[]=[];
 for(const observation of selected){
  const representative=observation.assetIds[0];
  if(!representative)continue;
  const asset=new MediaLibrary.Asset(representative);
  const [location,exif]=await Promise.all([asset.getLocation(),asset.getExif()]);
  observation.preciseLocation=location;
  out.push({observationId:observation.id,assetIds:observation.assetIds,capturedAt:observation.capturedAt,preciseLocation:location,exifSummary:safeExif(exif),appleCandidate:observation.appleCandidate??null,needsVisualReview:true});
 }
 return out;
}
