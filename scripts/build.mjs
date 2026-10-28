import {cp,mkdir,rm,readFile} from 'node:fs/promises';
import {join,resolve,relative,isAbsolute} from 'node:path';
const root=process.cwd(),explicit=process.argv[2],target=resolve(root,explicit||'dist');
if(explicit){
 const path=relative(root,target);if(!path||path.startsWith('..')||isAbsolute(path))throw Error('Separate build output must be a new directory inside this checkout.');
 await mkdir(target); // Refuse existing targets; never delete/replace evidence or preserved dist.
}else{await rm(target,{recursive:true,force:true});await mkdir(target,{recursive:true});}
for(const item of ['index.html','src','public']) await cp(join(root,item),join(target,item),{recursive:true});
const html=await readFile(join(target,'index.html'),'utf8');
if(/https?:\/\//i.test(html)||!html.includes('./src/main.js'))throw Error('Unexpected runtime network reference');
console.log(`Static output created (local assets and vendored ELK.js): ${target}`);
