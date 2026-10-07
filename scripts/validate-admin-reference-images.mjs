import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateAdminReferenceImages} from './admin-reference-images.mjs';
import {sanitizeJpeg,jpegDimensions} from '../web/public/photo-core.js';
const read=async name=>JSON.parse(await readFile('src/data/'+name+'.json','utf8'));
const [catalog,groups,manifest]=await Promise.all(['catalog','groups','admin-reference-images'].map(read));
validateAdminReferenceImages(manifest,[...catalog,...groups]);
for(const image of manifest.images){
 const bytes=new Uint8Array(await readFile('web/public/'+image.src));
 const clean=sanitizeJpeg(bytes),dimensions=jpegDimensions(bytes);
 if(bytes.length!==image.byteLength||bytes.length!==clean.length||bytes.some((n,i)=>n!==clean[i])||dimensions.width!==image.width||dimensions.height!==image.height||createHash('sha256').update(bytes).digest('hex')!==image.sha256)throw Error('Administrator photograph integrity or metadata removal failed: '+image.src);
}
console.log(JSON.stringify({administratorPhotos:manifest.images.length,metadataRemoved:true,rightsDeclared:true,independentIdentificationInferred:false}));
