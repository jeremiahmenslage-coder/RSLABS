// Phase 3 real-HTTP tests against a separate static build, never a personal browser profile.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {newFixture} from '../src/fixture.js';
import {raidFixture} from './fixtures/phase3.mjs';
import {layoutMetrics} from '../src/layout/metrics.js';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const root=resolve(import.meta.dirname,'..'),out=join(root,'evidence',`phase3-${new Date().toISOString().replace(/[:.]/g,'-')}`),build=join(out,'static');await mkdir(out);
const origin='http://127.0.0.1:4173',url=`${origin}/${relative(root,build).replaceAll('\\','/')}/`;
const results=[],measurements=[],errors=[],external=[];let browser,context,page,server,accept=true;
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function files(path){const entries=await readdir(path,{withFileTypes:true});const result=[];for(const e of entries)if(e.isDirectory())result.push(...await files(join(path,e.name)));else result.push(join(path,e.name));return result;}
async function hashes(path){const result={};for(const file of await files(path))result[relative(path,file)]=hash(await readFile(file));return result;}
const preservedDist=await hashes(join(root,'dist'));
const check=async(name,fn)=>{try{await fn();results.push({name,result:'Pass'});console.log(`PASS ${name}`);}catch(error){results.push({name,result:'Fail',error:error.stack});throw error;}};
async function reveal(selector){const target=page.locator(selector);for(const detail of await target.locator('xpath=ancestor::details').all()){if(!await detail.getAttribute('open').then(v=>v!==null))await detail.locator(':scope > summary').click();}return target;}
const snapshot=()=>page.evaluate(()=>window.__phase1.snapshot());
const saved=()=>page.waitForFunction(()=>window.__phase1?.saveState()==='saved'&&!document.querySelector('.app').inert);
const selected=async id=>{const card=page.locator(`[data-node-id="${id}"]`);await card.focus();await card.press('Enter');await card.press('Shift+F10');await page.locator('#cursor-dialog').getByRole('menuitem',{name:'Open details',exact:true}).click();};
const exportFile=async(button='#export-roadmap')=>{const event=page.waitForEvent('download');await page.locator(button).click();const file=await event;assert.equal(await file.failure(),null);const text=await readFile(await file.path(),'utf8');await file.saveAs(join(out,`backup-${results.length}-${Date.now()}.json`));return JSON.parse(text);};
const replace=async doc=>{const event=page.waitForEvent('filechooser');await page.locator('#import-roadmap').click();await (await event).setFiles({name:'test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(doc))});await page.locator('#import-preview').waitFor({state:'visible'});await exportFile('#export-before-import');await page.locator('#backup-retained').check();await page.locator('#replace-import').click();await page.locator('#import-preview').waitFor({state:'hidden'});await saved();};
const optimize=async()=>{await page.locator('#optimize').click();await saved();};
const positions=d=>d.roadmap.nodes.map(n=>[n.id,n.position]);
const semantic=d=>({...d.roadmap,nodes:d.roadmap.nodes.map(({position,...n})=>n)});
async function measure(name,stage){const doc=await snapshot(),routes=new Map(await page.evaluate(()=>window.__phase3.routes()));const metrics=layoutMetrics(doc,routes);measurements.push({name,stage,density:doc.preferences.nodeDensity,...metrics});return metrics;}
try{
 await check('separate static build succeeds, refuses overwrite, and preserves original dist',async()=>{
  const built=spawnSync(process.execPath,['scripts/build.mjs',relative(root,build)],{cwd:root,encoding:'utf8',windowsHide:true});await writeFile(join(out,'build.txt'),built.stdout+built.stderr);assert.equal(built.status,0);
  const again=spawnSync(process.execPath,['scripts/build.mjs',relative(root,build)],{cwd:root,encoding:'utf8',windowsHide:true});assert.notEqual(again.status,0);await writeFile(join(out,'build-overwrite-rejected.txt'),again.stdout+again.stderr);
  assert.deepEqual(await hashes(join(root,'dist')),preservedDist);
  for(const file of await files(join(root,'src')))assert.equal(hash(await readFile(file)),hash(await readFile(join(build,relative(root,file)))));
 });
 let existing=false;try{existing=(await fetch(origin)).ok;}catch{}
 if(!existing){server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,stdio:['ignore','pipe','pipe'],windowsHide:true});await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error('Cannot start source server on unchanged origin');})]);}
 assert.equal(await (await fetch(url)).text(),await readFile(join(build,'index.html'),'utf8'),'Server must serve the separate build from this checkout.');
 browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});context=await browser.newContext({viewport:{width:1500,height:1050},acceptDownloads:true});page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>accept?d.accept():d.dismiss());page.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});
 await page.goto(url);await page.waitForFunction(()=>window.__phase1?.snapshot());
 for(const [name,factory] of [['seven',newFixture],['raid',raidFixture]])for(const density of ['compact','detailed'])await check(`${name} ${density}: actual local ELK optimization, ports, dimensions, overlap measurements`,async()=>{
  const d=factory();d.preferences.nodeDensity=density;await replace(d);const before=await snapshot();await optimize();const after=await snapshot();assert.deepEqual(semantic(after),semantic(before));assert.notDeepEqual(positions(after),positions(before));
  const m=await measure(name,'optimized ELK routes');assert.deepEqual(m.cardOverlaps,[]);assert.deepEqual(m.nodeIntersections,[]);assert.deepEqual(m.labelNodeOverlaps,[]);assert.deepEqual(m.labelOverlaps,[]);
  const sizes=await page.evaluate(()=>{const z=window.__phase1.viewport().zoom;return [...document.querySelectorAll('.node-card')].map(n=>({w:n.getBoundingClientRect().width/z,h:n.getBoundingClientRect().height/z}));});
  for(const size of sizes){assert.ok(Math.abs(size.w-(density==='compact'?176:236))<.1);assert.ok(Math.abs(size.h-(density==='compact'?76:108))<.1);}
  await page.screenshot({path:join(out,`${name}-${density}-overview.png`),fullPage:true});await page.reload();await saved();assert.deepEqual(await snapshot(),after);const reload=await measure(name,'reloaded routing at saved positions');assert.deepEqual(reload.cardOverlaps,[]);assert.deepEqual(reload.nodeIntersections,[]);
 });
 await check('create/edit visual group, independent ToA/Fang/Lightbearer, representative and original boundary inspector',async()=>{
  const d=raidFixture();d.roadmap.groups=d.roadmap.groups.filter(g=>g.id!=='toa-group');for(const n of d.roadmap.nodes)if(n.groupId==='toa-group')n.groupId=null;
  d.roadmap.nodes.find(n=>n.id==='toa').status='completed';d.roadmap.nodes.find(n=>n.id==='toa').progress={current:1,target:1};d.roadmap.nodes.find(n=>n.id==='fang').status='in_progress';d.roadmap.nodes.find(n=>n.id==='fang').progress={current:2,target:10};
  await replace(d);await optimize();const before=await snapshot();await page.locator('#new-group').click();await page.locator('#group-title').fill('Canceled draft');await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.deepEqual(await snapshot(),before);
  await page.locator('#new-group').click();await page.locator('#group-title').fill('ToA route');
  for(const id of ['toa','fang','lightbearer'])await page.locator(`[data-group-member][value="${id}"]`).check();await page.locator('#group-representative').selectOption('toa');await page.locator('#save-group').click();await saved();
  const after=await snapshot();assert.deepEqual(positions(after),positions(before));assert.deepEqual(after.roadmap.edges,before.roadmap.edges);for(const id of ['toa','fang','lightbearer']){const a=after.roadmap.nodes.find(n=>n.id===id),b=before.roadmap.nodes.find(n=>n.id===id);assert.equal(a.status,b.status);assert.deepEqual(a.progress,b.progress);}
  const group=after.roadmap.groups.at(-1);await page.locator('#group-title').fill('Unsaved group draft');accept=false;await page.getByRole('button',{name:'Collapse group',exact:true}).click();accept=true;assert.equal((await snapshot()).roadmap.groups.at(-1).collapsed,false);assert.equal(await page.locator('#group-title').inputValue(),'Unsaved group draft');
  await page.locator('#group-title').fill('Independent ToA goals');await page.locator('#save-group').click();await saved();
  await page.getByRole('button',{name:'Collapse group',exact:true}).click();await saved();assert.equal(await page.locator('[data-node-id="toa"]').count(),0);
  const summary=page.locator(`[data-summary-kind="group"][data-summary-id="${group.id}"]`);assert.match(await summary.textContent(),/Representative: Clear Tombs of Amascut · Completed/);
  await summary.getByRole('button',{name:'Inspect links',exact:true}).click();const text=await page.locator('#boundary-list').textContent();assert.match(text,/Incoming · Required prerequisite · 70 Prayer → Clear Tombs of Amascut/);assert.match(text,/Outgoing · Preferred order/);
  await page.screenshot({path:join(out,'boundary-inspection.png'),fullPage:true});await page.locator('#boundary-close').click();
  await (await reveal('#navigation-root')).selectOption('toa');await (await reveal('#navigation-direction')).selectOption('upstream');await (await reveal('#focus')).click();await saved();await summary.getByRole('button',{name:'Inspect links',exact:true}).click();
  assert.doesNotMatch(await page.locator('#boundary-list').textContent(),/→ Obtain Osmumten|→ Obtain Lightbearer/);await page.locator('#boundary-close').click();await (await reveal('#reset-view')).click();await saved();
  await optimize();assert.deepEqual((await measure('collapsed ToA','optimized summaries')).cardOverlaps,[]);await page.screenshot({path:join(out,'collapsed-group.png'),fullPage:true});
  await summary.getByRole('button',{name:'Expand group',exact:true}).click();await saved();assert.equal((await snapshot()).roadmap.nodes.find(n=>n.id==='fang').status,'in_progress');
 });
 await check('group deletion defaults to ungroup; coherent undo/redo retains nodes and edges',async()=>{
  const group=(await snapshot()).roadmap.groups.at(-1);await page.locator('#group-picker').selectOption(group.id);await page.locator('#edit-group').click();const before=await snapshot();
  await page.getByRole('button',{name:'Delete group (ungroup members)…',exact:true}).click();await saved();const after=await snapshot();assert.equal(after.roadmap.nodes.length,before.roadmap.nodes.length);assert.deepEqual(after.roadmap.edges,before.roadmap.edges);assert.equal(after.roadmap.nodes.find(n=>n.id==='toa').groupId,null);
  await page.locator('#undo').click();await saved();assert.deepEqual(await snapshot(),before);await page.locator('#redo').click();await saved();assert.deepEqual(await snapshot(),after);await page.locator('#undo').click();await saved();
 });
 await check('completed visibility, expandable summaries, and hidden hard prerequisites preserve positions/state',async()=>{
  await selected('prayer');await page.locator('#goal-status').selectOption('completed');await page.locator('#save-goal').click();await saved();await selected('barrows');await page.locator('#goal-status').selectOption('completed');await page.locator('#save-goal').click();await saved();const before=await snapshot();
  for(const mode of ['dim','hide','collapse']){await (await reveal('#completed-visibility')).selectOption(mode);await saved();assert.deepEqual(semantic(await snapshot()),semantic(before));assert.deepEqual(positions(await snapshot()),positions(before));assert.equal(await page.locator('[data-node-id="ring"]').getAttribute('data-readiness'),'Ready');
   if(mode==='dim')assert.ok(await page.locator('[data-node-id="prayer"]').evaluate(n=>n.classList.contains('node-dimmed')));
   if(mode==='hide')assert.equal(await page.locator('[data-node-id="prayer"]').count(),0);
   if(mode==='collapse'){const summary=page.locator('[data-summary-kind="completed"]').first();await summary.getByRole('button',{name:'Expand completed branch',exact:true}).click();await saved();assert.deepEqual(positions(await snapshot()),positions(before));}
  }
  await (await reveal('#reset-view')).click();await saved();assert.equal(await page.locator('[data-node-id="prayer"]').count(),1);assert.deepEqual(positions(await snapshot()),positions(before));
 });
 await check('Focus and Highlight all directions terminate across cycles, reset and preserve positions',async()=>{
  const before=await snapshot();await (await reveal('#navigation-root')).selectOption('toa');
  for(const direction of ['upstream','downstream','both']){await (await reveal('#navigation-direction')).selectOption(direction);await (await reveal('#focus')).click();await saved();assert.equal(await page.locator('[data-node-id="island"]').count(),0);assert.deepEqual(positions(await snapshot()),positions(before));await (await reveal('#highlight')).click();await saved();assert.equal(await page.locator('[data-node-id="island"]').count(),1);assert.ok(await page.locator('[data-node-id="island"]').evaluate(n=>n.classList.contains('node-muted')));}
  await (await reveal('#exit-navigation')).click();await saved();assert.equal(await page.locator('.node-muted').count(),0);assert.deepEqual(semantic(await snapshot()),semantic(before));assert.deepEqual(positions(await snapshot()),positions(before));
  await (await reveal('#navigation-direction')).selectOption('upstream');await (await reveal('#focus')).click();await page.locator('#fit').click();await saved();await page.screenshot({path:join(out,'focus-upstream.png'),fullPage:true});
  await (await reveal('#reset-view')).click();await saved();
 });
 await check('navigation, visibility, groups and all semantic data survive reload and JSON roundtrip',async()=>{
  await (await reveal('#navigation-root')).selectOption('toa');await (await reveal('#navigation-direction')).selectOption('downstream');await (await reveal('#highlight')).click();await (await reveal('#completed-visibility')).selectOption('dim');await saved();
  const before=await snapshot(),backup=await exportFile();assert.deepEqual(backup,before);await page.reload();await saved();assert.deepEqual(await snapshot(),before);
  await (await reveal('#reset-view')).click();await saved();await replace(backup);assert.deepEqual(await snapshot(),backup);assert.equal(await page.locator('#completed-visibility').inputValue(),'dim');assert.equal(await page.locator('#navigation-direction').inputValue(),'downstream');
 });
 await check('Optimize undo/redo, manual movement after layout and reload persistence',async()=>{
  await replace(newFixture());const before=await snapshot();await optimize();const optimized=await snapshot();await page.locator('#undo').click();await saved();assert.deepEqual(positions(await snapshot()),positions(before));await page.locator('#redo').click();await saved();assert.deepEqual(positions(await snapshot()),positions(optimized));
  const box=await page.locator('[data-node-id="sailing"] .node-body').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+25,box.y+box.height/2+40,{steps:4});await page.mouse.up();await saved();const moved=await snapshot();assert.notDeepEqual(positions(moved),positions(optimized));assert.deepEqual(moved.roadmap.edges,optimized.roadmap.edges);
  await page.locator('#undo').click();await saved();assert.deepEqual(positions(await snapshot()),positions(optimized));await page.locator('#redo').click();await saved();assert.deepEqual(positions(await snapshot()),positions(moved));await page.reload();await saved();assert.deepEqual(await snapshot(),moved);
 });
 await check('static output has no external runtime requests or unhandled errors; original dist unchanged',async()=>{assert.deepEqual(external,[]);assert.deepEqual(errors,[]);assert.deepEqual(await hashes(join(root,'dist')),preservedDist);});
}catch(error){console.error(error);process.exitCode=1;try{await page?.screenshot({path:join(out,'failure.png'),fullPage:true});}catch{}}
finally{
 await writeFile(join(out,'results.json'),JSON.stringify({date:new Date().toISOString(),environment:{node:process.version,platform:process.platform,browser:browser?.version(),origin,url,storage:'disposable nonpersistent context; real IndexedDB'},results,errors,external},null,2));
 await writeFile(join(out,'layout-metrics.json'),JSON.stringify(measurements,null,2));console.log(`Evidence: ${out}`);await context?.close();await browser?.close();if(server&&!server.killed)server.kill();
}
