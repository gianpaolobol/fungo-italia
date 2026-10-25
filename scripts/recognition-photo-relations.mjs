// Safe taxon-to-photo association for collective atlas learning units.
// This is a candidate relationship only: it never changes the underlying
// subjectTaxon or promotes a photo to independently reviewed status.
const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
const genusOf=s=>String(s||'').split(/\s+/)[0];
export function candidatePhotoRelation(unit,photo){
 const label=normalize(unit.scientificName),subject=normalize(photo?.subjectTaxon);
 if(!subject||!photo?.src?.startsWith('images/')||!photo.credit)return {match:false,reason:'missing-provenance'};
 if(label===subject)return {match:true,reason:'exact-label'};
 // No genus-only fallback: a matching genus cannot establish group membership.
 const explicit=[...(unit.currentAcceptedNames||[]),...(unit.aliases||[])].map(normalize);
 if(explicit.includes(subject))return {match:true,reason:'explicit-accepted-name'};
 // A textual group label is insufficient to prove species membership.
 return {match:false,reason:genusOf(label)===genusOf(subject)?'needs-explicit-membership-evidence':'different-taxon'};
}
export function photoRelationReport(units){
 return units.map(unit=>({id:unit.id,name:unit.scientificName,photos:(unit.referenceImages||[]).map(photo=>({src:photo.src,subjectTaxon:photo.subjectTaxon,...candidatePhotoRelation(unit,photo)}))}));
}
