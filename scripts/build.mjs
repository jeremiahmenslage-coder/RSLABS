import {cp,mkdir,rm,readFile} from 'node:fs/promises';
import {join} from 'node:path';
const root=process.cwd(), target=join(root,'dist');
await rm(target,{recursive:true,force:true});await mkdir(target,{recursive:true});
for(const item of ['index.html','src','public']) await cp(join(root,item),join(target,item),{recursive:true});
const html=await readFile(join(target,'index.html'),'utf8');
if(/https?:\/\//i.test(html)||!html.includes('./src/main.js'))throw Error('Unexpected runtime network reference');
console.log('Static dist created (no external dependencies): dist/');
