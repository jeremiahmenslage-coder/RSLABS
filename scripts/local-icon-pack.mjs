import fs from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';
import {inspectPng} from './prepare-artwork.mjs';import {categoryArtwork} from '../src/assets/categories.js';
const hash=b=>createHash('sha256').update(b).digest('hex');
export function inspectLocalAsset(bytes,type){
 let info;if(type==='image/png')info=inspectPng(bytes);else{
  if(type!=='image/webp'||bytes.length<20||bytes.length>131072||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'||bytes.readUInt32LE(4)+8!==bytes.length)throw Error('Invalid PNG/WebP signature or size');
  let width,height;for(let p=12;p+8<=bytes.length;){const tag=bytes.toString('ascii',p,p+4),size=bytes.readUInt32LE(p+4),start=p+8;if(start+size>bytes.length)throw Error('Malformed WebP chunk');
   if(tag==='VP8X'&&size>=10){width=1+bytes.readUIntLE(start+4,3);height=1+bytes.readUIntLE(start+7,3);break;}
   if(tag==='VP8L'&&size>=5&&bytes[start]===0x2f){const bits=bytes.readUInt32LE(start+1);width=1+(bits&0x3fff);height=1+((bits>>>14)&0x3fff);break;}
   if(tag==='VP8 '&&size>=10&&bytes.subarray(start+3,start+6).equals(Buffer.from([157,1,42]))){width=bytes.readUInt16LE(start+6)&0x3fff;height=bytes.readUInt16LE(start+8)&0x3fff;break;}
   p=start+size+(size%2);
  }info={width,height,bytes:bytes.length,sha256:hash(bytes)};
 }
 if(!Number.isInteger(info.width)||!Number.isInteger(info.height)||info.width<1||info.width>256||info.height<1||info.height>256)throw Error('Image dimensions must be 1–256 pixels');return info;
}
export async function decodeLocalImages(images){
 const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});let context;
 try{context=await browser.newContext();const page=await context.newPage();return await page.evaluate(async images=>{const result=[];for(const a of images){const image=new Image();image.src='data:'+a.type+';base64,'+a.base64;await image.decode();if(!image.naturalWidth||image.naturalWidth>256||!image.naturalHeight||image.naturalHeight>256)throw Error('Image dimensions must be 1–256 pixels');result.push({width:image.naturalWidth,height:image.naturalHeight});}return result;},images);}finally{await context?.close();await browser.close();}
}
export async function prepareLocalIconPack(manifestPath,{check=false,output='src/assets/owner-categories.js',decode=decodeLocalImages}={}){
 const workspace=await fs.realpath(process.cwd()),file=await fs.realpath(manifestPath),root=path.dirname(file),inside=(base,target)=>{const rel=path.relative(base,target);return !!rel&&!rel.startsWith('..')&&!path.isAbsolute(rel);};
 if(!inside(workspace,file))throw Error('Icon pack must be inside the project');
 const manifest=JSON.parse(await fs.readFile(file,'utf8'));
 if(manifest?.format!==1||typeof manifest.id!=='string'||!/^owner:icons:[a-z0-9-]+$/.test(manifest.id)||typeof manifest.version!=='string'||!/^\d+\.\d+\.\d+$/.test(manifest.version)||!Array.isArray(manifest.assets)||manifest.assets.length<1||manifest.assets.length>64||!manifest.categories||typeof manifest.categories!=='object'||Array.isArray(manifest.categories))throw Error('Invalid local icon pack header');
 const ids=new Set(),assets=[];for(const a of manifest.assets){
  if(!a||typeof a.id!=='string'||!/^owner:icon:[a-z0-9-]+$/.test(a.id)||ids.has(a.id)||typeof a.file!=='string'||a.file.includes('\\')||a.file.split('/').some(x=>!x||x==='..'||x==='.')||path.isAbsolute(a.file)||a.file.includes(':')||!['image/png','image/webp'].includes(a.mediaType)||!a.file.toLowerCase().endsWith(a.mediaType==='image/png'?'.png':'.webp'))throw Error('Invalid/duplicate asset ID, file path or format');
  for(const key of ['provenance','attribution','permission'])if(typeof a[key]!=='string'||!a[key].trim()||a[key].length>2000)throw Error('Missing asset '+key);
  const source=await fs.realpath(path.resolve(root,a.file)),stat=await fs.stat(source);if(!inside(root,source)||!stat.isFile())throw Error('Asset path escapes input folder');if(stat.size>131072)throw Error('Icon exceeds 128 KiB');const bytes=await fs.readFile(source),info=inspectLocalAsset(bytes,a.mediaType);ids.add(a.id);assets.push({...a,...info,bytesData:bytes});
 }
 const categories=Object.keys(manifest.categories);if(!categories.length||categories.some(c=>!['skill','quest','item','boss','diary','prayer','activity','custom'].includes(c)||!ids.has(manifest.categories[c])))throw Error('Invalid/missing category mapping');
 const decoded=await decode(assets.map(a=>({type:a.mediaType,base64:a.bytesData.toString('base64')})));if(decoded.length!==assets.length)throw Error('Incomplete image decode');decoded.forEach((size,i)=>{if(!Number.isInteger(size.width)||!Number.isInteger(size.height)||size.width<1||size.height<1||size.width>256||size.height>256)throw Error('Invalid decoded dimensions');Object.assign(assets[i],size);});
 const digest=hash(JSON.stringify(manifest)+assets.map(a=>a.sha256).join('')),folder='public/icon-packs/'+manifest.id.split(':').at(-1)+'-'+digest.slice(0,16),mapping={};
 for(const c of categories){const a=assets.find(a=>a.id===manifest.categories[c]);mapping[c]={assetId:a.id,src:`./${folder}/${a.id.split(':').at(-1)}.${a.mediaType==='image/png'?'png':'webp'}`,label:({item:'Inventory',diary:'Achievement Diary'})[c]??c};}
 const report={format:1,pack:manifest.id,version:manifest.version,permissionAttribution:'Owner-supplied records; not independently verified; no broader distribution rights implied',assets:assets.map(({bytesData,...a})=>a),coverage:Object.fromEntries(['skill','quest','item','boss','diary','activity','custom'].map(c=>[c,mapping[c]?'Owner local pack':categoryArtwork[c]?'pinned category symbol':c==='custom'?'neutral original':'missing genuine symbol; original fallback']))};
 const text='// Generated by scripts/prepare-category-icons.mjs --pack; validated local files only.\nexport const ownerCategoryArtwork=Object.freeze('+JSON.stringify(mapping,null,2)+');\nexport const ownerIconPackReport='+JSON.stringify(report,null,2)+';\n',target=path.resolve(output);if(!inside(workspace,target))throw Error('Output must stay inside checkout');
 async function containedAncestor(directory){let current=path.resolve(directory);for(;;){try{const real=await fs.realpath(current);if(real!==workspace&&!inside(workspace,real))throw Error('Output ancestor escapes project');return;}catch(error){if(error.code!=='ENOENT')throw error;const parent=path.dirname(current);if(parent===current)throw Error('Output parent unavailable');current=parent;}}}
 await containedAncestor(path.dirname(target));await containedAncestor(folder);
 // Validate every source/decode/mapping and every existing destination before writing anything.
 for(const a of assets){const dest=path.join(folder,a.id.split(':').at(-1)+(a.mediaType==='image/png'?'.png':'.webp'));a.destination=dest;try{if(!(await fs.readFile(dest)).equals(a.bytesData))throw Error('Refuse differing bundled asset: '+dest);}catch(error){if(error.code!=='ENOENT')throw error;}}
 if(check){if(await fs.readFile(target,'utf8')!==text)throw Error('Owner icon mapping differs');for(const a of assets)if(hash(await fs.readFile(a.destination))!==a.sha256)throw Error('Bundled image differs');}
 else{await fs.mkdir(folder,{recursive:true});for(const a of assets)try{await fs.writeFile(a.destination,a.bytesData,{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;if(!(await fs.readFile(a.destination)).equals(a.bytesData))throw Error('Refuse differing bundled asset: '+a.destination);}const staged=target+'.candidate-'+process.pid+'-'+Date.now();await fs.writeFile(staged,text,{flag:'wx'});await fs.rename(staged,target);}
 return report;
}
