import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const root=process.cwd(),dir='evidence/p5-002-preflight-2026-10-27/';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
const before=JSON.parse(fs.readFileSync(dir+'starting-files.json'));
const base=new Map(before.map(f=>[path.relative(root,f.path).replaceAll('\\','/'),f.hash]));
const files=[];function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())walk(f);else files.push(f.replaceAll('\\','/'));}}
for(const d of ['src','tests','scripts','dist','public','catalog'])walk(d);
for(const p of base.keys())if(!files.includes(p))files.push(p);
const changed=[],added=[];
for(const f of files){assert(fs.existsSync(f),'Missing original '+f);const after=hash(f),old=base.get(f);if(old&&old!==after)changed.push({path:f,before:old,after});else if(!old)added.push({path:f,after});}
for(const [f,h]of base)if(f.startsWith('dist/')||f.startsWith('src/vendor/')||['src/storage/indexeddb.js','src/storage/backup.js','src/store.js','src/catalog/generated.js'].includes(f))assert.equal(hash(f),h,'Protected change '+f);
for(const n of ['HANDOFF.md','TEST_REPORT.md'])assert(fs.readFileSync(n,'utf8').endsWith(fs.readFileSync(dir+n+'-before','utf8')),'Historical suffix changed '+n);
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),branch=execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim();
assert.equal(execFileSync('git',['diff','--cached','--name-only'],{encoding:'utf8'}).trim(),'');
assert.equal(commit,'604d4d6d21fcd0030286acb400087cb14388e8f7');assert.equal(branch,'main');
const result={date:new Date().toISOString(),checkout:root,branch,commit,baseline:'starting-files.json',changed,added,checks:{distUnchanged:true,vendorUnchanged:true,storageUnchanged:true,referenceCatalogUnchanged:true,historicalHandoffAndTestSuffixUnchanged:true,indexEmpty:true},evidence:['p5-002-2026-10-27T15-45-40-716Z','p3-005-2026-10-27T15-39-48-598Z','p3-002-2026-10-27T15-39-49-072Z','phase3-2026-10-27T15-39-49-499Z'],evidenceNote:'New timestamped evidence plus preflight scripts/raw pinned source cache/logs are additional files, excluded from source inventory. Every prior baseline file remains present.'};
fs.writeFileSync(dir+'delivery-manifest.json',JSON.stringify(result,null,2));
fs.writeFileSync(dir+'changed-files.md','# P5-002 incremental file inventory\n\nRelative to pre-ticket hashes, preserving previous uncommitted work. Exact hashes: delivery-manifest.json. New evidence/cache files are additional review artifacts.\n\nChanged existing files:\n\n'+changed.map(x=>'- '+x.path).join('\n')+'\n\nNew source/assets/test files:\n\n'+added.map(x=>'- '+x.path).join('\n')+'\n');
console.log(JSON.stringify({changed:changed.map(x=>x.path),added:added.length,checks:result.checks},null,2));
