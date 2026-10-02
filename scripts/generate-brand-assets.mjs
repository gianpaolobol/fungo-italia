import {mkdir,writeFile} from 'node:fs/promises';
import {deflateSync} from 'node:zlib';
const width=1024,height=1024,row=width*3+1,pixels=Buffer.alloc(row*height);
for(let y=0;y<height;y++)for(let x=0;x<width;x++){
 let color=[23,79,43];
 if(x>=456&&x<=568&&y>=430&&y<=750)color=[248,237,202];
 if(((x-512)/95)**2+((y-747)/32)**2<=1)color=[248,237,202];
 if(((x-512)/300)**2+((y-435)/48)**2<=1)color=[99,62,37];
 if(((x-512)/300)**2+((y-420)/205)**2<=1&&y<=435)color=[183,106,59];
 if(x>=470&&x<=554&&y>=450&&y<=742)color=[248,237,202];
 const offset=y*row+1+x*3;pixels[offset]=color[0];pixels[offset+1]=color[1];pixels[offset+2]=color[2];
}
function crc(bytes){let c=0xffffffff;for(const byte of bytes){c^=byte;for(let i=0;i<8;i++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;}return (c^0xffffffff)>>>0;}
function chunk(type,data){const name=Buffer.from(type),length=Buffer.alloc(4),checksum=Buffer.alloc(4);length.writeUInt32BE(data.length);checksum.writeUInt32BE(crc(Buffer.concat([name,data])));return Buffer.concat([length,name,data,checksum]);}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=2;
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(pixels,{level:9})),chunk('IEND',Buffer.alloc(0))]);
await mkdir('assets',{recursive:true});await writeFile('assets/icon.png',png);
console.log('Original Fungo Italia app icon generated: '+png.length+' bytes.');
