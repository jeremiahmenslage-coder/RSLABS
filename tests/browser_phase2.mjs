// Real HTTP/IndexedDB checks in a fresh, disposable browser context. Never opens a personal profile.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {newFixture} from '../src/fixture.js';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const root=resolve(import.meta.dirname,'..'),out=join(root,'evidence',`phase2-${new Date().toISOString().replace(/[:.]/g,'-')}`);
await mkdir(out,{recursive:true});
const results=[],errors=[];let browser,server,context,page,accept=true;
const check=async(name,fn)=>{try{await fn();results.push({name,result:'Pass'});console.log(`PASS ${name}`);}catch(error){results.push({name,result:'Fail',error:error.stack});throw error;}};
async function reveal(selector){const target=page.locator(selector);for(const detail of await target.locator('xpath=ancestor::details').all()){if(!await detail.getAttribute('open').then(v=>v!==null))await detail.locator(':scope > summary').click();}return target;}
const snapshot=()=>page.evaluate(()=>window.__phase1.snapshot());
const saved=()=>page.waitForFunction(()=>window.__phase1.saveState()==='saved');
const selectNode=async id=>{const n=page.locator(`[data-node-id="${id}"]`);await n.focus();await n.press('Enter');await n.press('Shift+F10');await page.locator('#cursor-dialog').getByRole('menuitem',{name:'Open details',exact:true}).click();};
const edit=async(id,fields)=>{await selectNode(id);for(const [key,value] of Object.entries(fields)){const field=page.locator(`#goal-${key}`);if(key==='status')await field.selectOption(value);else await field.fill(String(value));}await page.locator('#save-goal').click();await saved();};
const exported=async(button='#export-roadmap')=>{const event=page.waitForEvent('download');await page.locator(button).click();const file=await event;assert.equal(await file.failure(),null);const text=await readFile(await file.path(),'utf8');await file.saveAs(join(out,`backup-${results.length}-${Date.now()}.json`));return JSON.parse(text);};
const preview=async doc=>{const event=page.waitForEvent('filechooser');await page.locator('#import-roadmap').click();const chooser=await event;await chooser.setFiles({name:'disposable.json',mimeType:'application/json',buffer:Buffer.from(typeof doc==='string'?doc:JSON.stringify(doc))});};
const replace=async doc=>{await preview(doc);await page.locator('#import-preview').waitFor({state:'visible'});await exported('#export-before-import');await page.locator('#backup-retained').check();await page.locator('#replace-import').click();await page.locator('#import-preview').waitFor({state:'hidden'});await saved();};
try{
 let existing=false;try{existing=(await fetch('http://127.0.0.1:4173/')).ok;}catch{}
 if(existing){
  for(const path of ['index.html','src/main.js','src/model.js','src/ui/inspector.js','src/ui/graph.js','src/ui/backup.js','src/storage/backup.js','src/storage/indexeddb.js','src/model/actions.js','src/style.css']){
   assert.equal(await (await fetch(`http://127.0.0.1:4173/${path}`)).text(),await readFile(join(root,path),'utf8'),`Existing server differs from checkout: ${path}`);
  }
  console.log('Reusing existing origin after verifying served source matches this checkout.');
 }else{
  server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,stdio:['ignore','pipe','pipe'],windowsHide:true});
  await Promise.race([once(server.stdout,'data'),once(server,'exit').then(([code])=>{throw Error(`Server did not start (${code}); ensure port 4173 is free.`);})]);
 }
 browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
 context=await browser.newContext({viewport:{width:1500,height:1050},acceptDownloads:true});page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',dialog=>accept?dialog.accept():dialog.dismiss());
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.__phase1?.snapshot());
 await check('fresh context starts empty; create Cancel leaves no orphan',async()=>{
  assert.equal((await snapshot()).roadmap.nodes.length,0);const box=await page.locator('#viewport').boundingBox();await page.mouse.dblclick(box.x+80,box.y+130);await page.locator('#cursor-details').click();
  await page.locator('#goal-title').fill('Canceled');await page.locator('#cancel-editor').click();assert.equal((await snapshot()).roadmap.nodes.length,0);
  await page.mouse.dblclick(box.x+80,box.y+130);await page.locator('#cursor-details').click();await page.locator('#goal-title').fill('Original saved goal');await page.locator('#save-goal').click();await saved();
 });
 await check('import preview requires current export; Cancel and Escape preserve active state',async()=>{
  const before=await snapshot();const event=page.waitForEvent('filechooser');await page.locator('#import-roadmap').click();await (await event).setFiles([]);assert.deepEqual(await snapshot(),before);
  await preview(newFixture());assert.equal(await page.locator('#replace-import').isEnabled(),false);await page.screenshot({path:join(out,'import-preview.png'),fullPage:true});
  await page.locator('#cancel-import').click();assert.deepEqual(await snapshot(),before);
  await preview(newFixture());await page.keyboard.press('Escape');assert.deepEqual(await snapshot(),before);
 });
 let fixture=newFixture();fixture.roadmap.edges.find(e=>e.id==='e4').kind='hard';fixture.roadmap.edges.push({id:'branch',sourceId:'barrows',targetId:'sailing',kind:'hard'});
 fixture.roadmap.nodes[0].iconOverride='unavailable:retained';fixture.preferences.viewport={x:30,y:20,zoom:.7};
 await check('explicit replacement confirmation cancellation preserves active state',async()=>{
  const before=await snapshot();await preview(fixture);await exported('#export-before-import');await page.locator('#backup-retained').check();accept=false;
  await page.locator('#replace-import').click();accept=true;assert.deepEqual(await snapshot(),before);assert.equal(await page.locator('#import-preview').isVisible(),true);await page.locator('#cancel-import').click();
 });
 await check('valid import commits full schema; preserves unknown icon with fallback and warning',async()=>{
  await preview(fixture);assert.match(await page.locator('#import-warning').textContent(),/references only/);await exported('#export-before-import');await page.locator('#backup-retained').check();await page.locator('#replace-import').click();await page.locator('#import-preview').waitFor({state:'hidden'});await saved();
  assert.deepEqual(await snapshot(),fixture);assert.match(await page.locator('[data-node-id="sailing"] img').getAttribute('src'),/^data:image/);
 });
 await check('multiple hard predecessors and reused goal update without completion propagation',async()=>{
  assert.equal(await page.locator('[data-node-id="ring"]').getAttribute('data-readiness'),'Blocked');
  await edit('barrows',{status:'completed'});assert.equal(await page.locator('[data-node-id="ring"]').getAttribute('data-readiness'),'Blocked');assert.equal(await page.locator('[data-node-id="sailing"]').getAttribute('data-readiness'),'Ready');
  await edit('crystal',{status:'completed'});assert.equal(await page.locator('[data-node-id="ring"]').getAttribute('data-readiness'),'Ready');
  assert.equal((await snapshot()).roadmap.nodes.find(n=>n.id==='ring').status,'not_started');assert.equal((await snapshot()).roadmap.nodes.length,7);
 });
 await check('manual status and counters (zero and above target), validation, undo/redo and reload',async()=>{
  await edit('ring',{status:'in_progress',current:0,target:10});await selectNode('ring');assert.equal(await page.locator('#goal-current').inputValue(),'0');
  await page.locator('#goal-current').fill('12');await page.locator('#save-goal').click();await saved();let d=await snapshot();assert.equal(d.roadmap.nodes.find(n=>n.id==='ring').status,'in_progress');assert.equal(await page.locator('[data-node-id="moons"]').getAttribute('data-readiness'),'Blocked');await page.screenshot({path:join(out,'progression-editor.png'),fullPage:true});
  await page.locator('#goal-target').fill('0');await page.locator('#save-goal').click();assert.match(await page.locator('#editor-error').textContent(),/target/);assert.deepEqual(await snapshot(),d);await page.locator('#cancel-editor').click();
  await page.locator('#undo').click();assert.equal((await snapshot()).roadmap.nodes.find(n=>n.id==='ring').progress.current,0);await page.locator('#redo').click();await saved();
  d=await snapshot();await page.reload();await saved();assert.deepEqual(await snapshot(),d);assert.equal(await page.locator('#undo').isEnabled(),false);
 });
 await check('completed override, soft/order advisory and collapsed canonical readiness',async()=>{
  assert.equal(await page.locator('[data-node-id="tortugans"]').getAttribute('data-readiness'),'Ready');assert.equal(await page.locator('[data-node-id="belle"]').getAttribute('data-readiness'),'Ready');
  await edit('moons',{status:'completed'});assert.equal(await page.locator('[data-node-id="moons"]').getAttribute('data-readiness'),'Completed');
  await edit('barrows',{status:'not_started'});await page.locator('#collapse').click();assert.equal(await page.locator('[data-node-id="ring"]').count(),0);
  assert.equal(await page.locator('[data-node-id="sailing"]').getAttribute('data-readiness'),'Blocked');assert.equal(await page.locator('[data-node-id="moons"]').getAttribute('data-readiness'),'Completed');
  await page.locator('#collapse').click();assert.equal(await page.locator('[data-node-id="ring"]').getAttribute('data-readiness'),'Blocked');
 });
 await check('complete browser download/import/export roundtrip with undo/redo replacement',async()=>{
  const before=await snapshot(),backup=await exported();assert.deepEqual(backup,before);await page.locator('#new-roadmap').click();await saved();assert.equal((await snapshot()).roadmap.nodes.length,0);
  await replace(backup);assert.deepEqual(await snapshot(),backup);await page.locator('#undo').click();assert.equal((await snapshot()).roadmap.nodes.length,0);await page.locator('#redo').click();await saved();assert.deepEqual(await exported(),backup);
 });
 await check('malformed/version/references/cycle/null-record imports rejected without mutation',async()=>{
  const before=await snapshot();const invalid=['{bad', {...before,schemaVersion:999}];
  for(const change of [d=>d.roadmap.nodes.push(null),d=>d.roadmap.edges[0].targetId='missing',d=>d.roadmap.nodes[0].groupId='broken',d=>d.roadmap.edges.push({id:'cycle',sourceId:'ring',targetId:'barrows',kind:'hard'})]){const d=structuredClone(before);change(d);invalid.push(d);}
  for(const bad of invalid){await preview(bad);await page.waitForFunction(()=>document.getElementById('status').textContent.startsWith('Import rejected:'));assert.deepEqual(await snapshot(),before);assert.equal(await page.locator('#import-preview').isVisible(),false);}
 });
 await check('failed import write keeps both active and committed roadmap; retry requires confirmation',async()=>{
  const before=await snapshot(),next=structuredClone(before);next.roadmap.title='Replacement after retry';await (await reveal('#test-fail-save')).click();
  await preview(next);await exported('#export-before-import');await page.locator('#backup-retained').check();await page.locator('#replace-import').click();
  await page.waitForFunction(()=>document.getElementById('import-error').textContent.includes('Import not applied'));
  assert.deepEqual(await snapshot(),before);assert.match(await page.locator('#save-state').textContent(),/IMPORT FAILED/);
  const disk=await page.evaluate(async()=>{const m=await import('/src/storage/indexeddb.js');const db=await m.openDatabase();try{return await m.readDocument(db);}finally{db.close();}});assert.deepEqual(disk,before);
  await page.locator('#replace-import').click();await page.locator('#import-preview').waitFor({state:'hidden'});await saved();assert.deepEqual(await snapshot(),next);
 });
 await check('real IndexedDB aborted transaction preserves previously committed copy',async()=>{
  const before=await snapshot();const result=await page.evaluate(async()=>{
   const m=await import('/src/storage/indexeddb.js'),db=await m.openDatabase(),original=await m.readDocument(db),candidate=structuredClone(original);candidate.roadmap.title='Must never commit';
   const transaction=db.transaction.bind(db);db.transaction=(...args)=>{const tx=transaction(...args);if(args[1]==='readwrite'){const objectStore=tx.objectStore.bind(tx);tx.objectStore=(...names)=>{const store=objectStore(...names),put=store.put.bind(store);store.put=(...values)=>{const request=put(...values);tx.abort();return request;};return store;};}return tx;};
   let rejected=false;try{await m.writeDocument(db,candidate);}catch{rejected=true;}const recovered=await m.readDocument(db);db.close();return {rejected,recovered};
  });assert.equal(result.rejected,true);assert.deepEqual(result.recovered,before);
 });
 await check('Phase 1 notes/icon edits, dirty draft protection, move, zoom, Optimize, density',async()=>{
  await edit('sailing',{notes:'phase2 regression'});assert.equal((await snapshot()).roadmap.nodes[0].iconOverride,'unavailable:retained');
  await selectNode('sailing');await page.locator('#goal-notes').fill('unsaved');accept=false;await selectNode('tortugans');accept=true;await page.keyboard.press('Escape');assert.equal(await page.locator('#goal-notes').inputValue(),'unsaved');await page.locator('#cancel-editor').click();
  await page.locator('#fit').click();let before=await snapshot();const body=await page.locator('[data-node-id="sailing"] .node-body').boundingBox();await page.mouse.move(body.x+30,body.y+30);await page.mouse.down();await page.mouse.move(body.x+60,body.y+60,{steps:5});await page.mouse.up();await saved();assert.notDeepEqual((await snapshot()).roadmap.nodes[0].position,before.roadmap.nodes[0].position);
  const box=await page.locator('#viewport').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.wheel(0,-200);await saved();
  before=await snapshot();await page.locator('#optimize').click();await saved();assert.deepEqual((await snapshot()).roadmap.edges,before.roadmap.edges);
  await page.locator('#density').click();assert.equal(await page.locator('[data-node-id="sailing"] .node-subtitle').textContent(),'Blocked');await page.locator('#density').click();
 });
 await check('Phase 1 both connection methods, validation, edge edit/delete, node deletion undo/redo',async()=>{
  await page.locator('#fit').click();await selectNode('sailing');const dest=page.locator('[data-node-id="belle"]');await dest.focus();await dest.press('Shift+Enter');await page.locator('#connect-selected').click();await page.locator('#cursor-details').click();await page.locator('#link-kind').selectOption('soft');await page.getByRole('button',{name:'Create directed connection',exact:true}).click();await saved();
  const edge=(await snapshot()).roadmap.edges.at(-1);await page.locator('#edge-kind').selectOption('order');await page.getByRole('button',{name:'Save connection',exact:true}).click();await saved();
  await page.getByRole('button',{name:'Delete connection…',exact:true}).click();await saved();assert.equal((await snapshot()).roadmap.edges.some(e=>e.id===edge.id),false);
  const a=await page.locator('[data-node-id="sailing"] .out-port').boundingBox(),b=await page.locator('[data-node-id="belle"] .in-port').boundingBox();await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});await page.mouse.up();await page.locator('#cursor-details').click();await page.locator('#link-kind').selectOption('hard');await page.getByRole('button',{name:'Create directed connection',exact:true}).click();await saved();
  const count=(await snapshot()).roadmap.edges.length;await selectNode('sailing');await dest.focus();await dest.press('Shift+Enter');await page.locator('#connect-selected').click();await page.locator('#cursor-details').click();await page.getByRole('button',{name:'Create directed connection',exact:true}).click();assert.match(await page.locator('#inspector .form-error').textContent(),/Duplicate/);assert.equal((await snapshot()).roadmap.edges.length,count);await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await selectNode('ring');const source=page.locator('[data-node-id="barrows"]');await source.focus();await source.press('Shift+Enter');await page.locator('#connect-selected').click();await page.locator('#cursor-details').click();
  await page.locator('#link-kind').selectOption('hard');await page.getByRole('button',{name:'Create directed connection',exact:true}).click();assert.match(await page.locator('#inspector .form-error').textContent(),/cycle/);
  await page.locator('#link-target').selectOption('ring');await page.getByRole('button',{name:'Create directed connection',exact:true}).click();assert.match(await page.locator('#inspector .form-error').textContent(),/Self edge/);assert.equal((await snapshot()).roadmap.edges.length,count);await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await selectNode('belle');await page.getByRole('button',{name:'Delete goal…',exact:true}).click();await saved();assert.equal((await snapshot()).roadmap.nodes.length,6);await page.locator('#undo').click();assert.equal((await snapshot()).roadmap.nodes.length,7);await page.locator('#redo').click();await saved();assert.equal((await snapshot()).roadmap.nodes.length,6);
 });
 await check('Phase 1 failed autosave recovery and Retry with real origin reload',async()=>{
  const id='sailing';await selectNode(id);const old=(await snapshot()).roadmap.nodes.find(n=>n.id===id).notes;await (await reveal('#test-fail-save')).click();await page.locator('#goal-notes').fill('not durable');await page.locator('#save-goal').click();await page.waitForFunction(()=>window.__phase1.saveState()==='failed');await page.reload();await saved();assert.equal((await snapshot()).roadmap.nodes.find(n=>n.id===id).notes,old);
  await selectNode(id);await (await reveal('#test-fail-save')).click();await page.locator('#goal-notes').fill('retry durable');await page.locator('#save-goal').click();await page.waitForFunction(()=>window.__phase1.saveState()==='failed');await page.locator('#retry-save').click();await saved();await page.reload();await saved();assert.equal((await snapshot()).roadmap.nodes.find(n=>n.id===id).notes,'retry durable');
 });
 await check('no unhandled browser exceptions',async()=>assert.deepEqual(errors,[]));
 await page.screenshot({path:join(out,'phase2.png'),fullPage:true});
}catch(error){console.error(error);process.exitCode=1;try{await page?.screenshot({path:join(out,'failure.png'),fullPage:true});}catch{}}
finally{
 const report={date:new Date().toISOString(),environment:{node:process.version,platform:process.platform,browser:browser?browser.version():null,origin:'http://127.0.0.1:4173/',storage:'fresh nonpersistent browser context; real IndexedDB'},results,errors};
 await writeFile(join(out,'results.json'),JSON.stringify(report,null,2));console.log(`Evidence: ${out}`);
 await context?.close();await browser?.close();if(server&&!server.killed)server.kill();
}
