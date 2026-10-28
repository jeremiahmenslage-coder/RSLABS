import fs from 'node:fs';import {deflateSync} from 'node:zlib';
const crc=b=>{let c=0xffffffff;for(const x of b){c^=x;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;};
const chunk=(name,data)=>{const t=Buffer.from(name),n=Buffer.alloc(4),c=Buffer.alloc(4);n.writeUInt32BE(data.length);c.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([n,t,data,c]);};
const header=Buffer.alloc(13);header.writeUInt32BE(32,0);header.writeUInt32BE(32,4);header[8]=8;header[9]=6;const rows=[];
for(let y=0;y<32;y++){const row=Buffer.alloc(129);for(let x=0;x<32;x++){const mark=Math.abs(x-15.5)+Math.abs(y-15.5)<11;row.set(mark?[213,197,154,255]:[43,52,59,255],1+x*4);}rows.push(row);}
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(Buffer.concat(rows))),chunk('IEND',Buffer.alloc(0))]);
fs.mkdirSync('catalog/icon-packs/sample-v1/icons',{recursive:true});fs.writeFileSync('catalog/icon-packs/sample-v1/icons/neutral.png',png);
fs.writeFileSync('catalog/icon-packs/sample-v1/manifest.json',JSON.stringify({format:1,id:'owner:icons:sample-v1',version:'1.0.0',assets:[{id:'owner:icon:neutral-v1',file:'icons/neutral.png',mediaType:'image/png',provenance:'Project-original diamond authored for P5-004 sample pack, no Jagex artwork',attribution:'OSRS Ironman Progression Planner project-original sample',permission:'Original project asset; local private sample use'}],categories:{custom:'owner:icon:neutral-v1'}},null,2)+'\n');
