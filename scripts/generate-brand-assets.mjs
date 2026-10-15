import {readFile} from 'node:fs/promises';
import {inflateSync} from 'node:zlib';
export function validateAppIcon(png){
 const fail=message=>{throw Error('Invalid committed app icon: '+message);};
 if(!Buffer.isBuffer(png)||!png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))fail('PNG signature');
 let offset=8,width=0,height=0,ended=false;const idat=[];
 const crc32=bytes=>{let crc=0xffffffff;for(const b of bytes){crc^=b;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;};
 while(offset<png.length){
  if(offset+12>png.length)fail('truncated chunk');
  const length=png.readUInt32BE(offset),type=png.toString('ascii',offset+4,offset+8),end=offset+12+length;
  if(end>png.length||length>32*1024*1024)fail('invalid chunk length');
  if(crc32(png.subarray(offset+4,end-4))!==png.readUInt32BE(end-4))fail('chunk checksum');
  const data=png.subarray(offset+8,end-4);
  if(offset===8&&type!=='IHDR')fail('missing header');
  if(type==='IHDR'){if(length!==13||width)fail('header');width=data.readUInt32BE(0);height=data.readUInt32BE(4);if(width!==1024||height!==1024||data[8]!==8||data[9]!==2||data[10]||data[11]||data[12])fail('requires opaque 1024x1024 RGB PNG');}
  if(type==='IDAT')idat.push(data);
  if(type==='IEND'){if(length||end!==png.length)fail('end marker');ended=true;}
  offset=end;
 }
 if(!ended||!idat.length)fail('missing image data');
 let pixels;try{pixels=inflateSync(Buffer.concat(idat),{maxOutputLength:4*1024*1024});}catch{fail('compressed image data');}
 const stride=width*3+1;if(pixels.length!==height*stride)fail('pixel length');
 for(let y=0;y<height;y++)if(pixels[y*stride]>4)fail('scanline filter');
 return {width,height,bytes:png.length};
}
if(process.argv[1]?.endsWith('/generate-brand-assets.mjs')){
 const result=validateAppIcon(await readFile(new URL('../assets/icon.png',import.meta.url)));
 console.log('Committed app icon verified without overwriting: '+JSON.stringify(result));
}
