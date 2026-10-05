import {AtlasPhotoLink,canPublishPhoto} from './atlasPhotoLink';
import {PrivateObservation,toPublicObservation} from './photoObservations';
import {ReviewDecision,validateReview} from './threePlusOneReview';
import {assertNoPreciseLocationInPublicExport} from './privateLocationPolicy';

export type ApprovedAtlasObservation={observation:ReturnType<typeof toPublicObservation>;photos:AtlasPhotoLink[];review:ReviewDecision};
export function approveForAtlas(privateObservation:PrivateObservation,review:ReviewDecision,photos:AtlasPhotoLink[]):ApprovedAtlasObservation{
 const checked=validateReview(review);if(!checked.valid)throw Error('Revisione 3+1 incompleta: '+checked.errors.join(', '));
 const approved=photos.filter(p=>canPublishPhoto(p,true)&&p.taxonId===review.taxonId&&p.observationId===privateObservation.id);
 if(!approved.length)throw Error('Nessuna fotografia approvata per la scheda');
 const result={observation:toPublicObservation(privateObservation,review.taxonId),photos:approved,review};
 assertNoPreciseLocationInPublicExport(result);
 return result;
}
