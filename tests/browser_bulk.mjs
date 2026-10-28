// P3-002: real input gestures and bulk workflows on a fresh separate static build.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {join,resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {newFixture} from '../src/fixture.js';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const root=resolve(import.meta.dirname,'..'),out=join(root,'evidence',`p3-002-${new Date().toISOString().replace(/[:.]/g,'-')}`),build=join(out,'static');await mkdir(out);
const origin='http://127.0.0.1:4173',url=`${origin}/${relative(root,build).replaceAll('\\','/')}/`;
const results=[],errors=[],external=[];let browser,context,page,server,accept=true;
const hash=b=>createHash('sha256').update(b).digest('hex');
async function hashes(dir){const map={};async function visit(p){for(const e of await readdir(p,{withFileTypes:true})){const f=join(p,e.name);if(e.isDirectory())await visit(f);else map[relative(dir,f)]=hash(await readFile(f));}}await visit(dir);return map;}
const distBefore=await hashes(join(root,'dist'));
const check=async(name,fn)=>{try{await fn();results.push({name,result:'Pass'});console.log(`PASS ${name}`);}catch(error){results.push({name,result:'Fail',error:error.stack});throw error;}};
async function reveal(selector){const target=page.locator(selector);for(const detail of await target.locator('xpath=ancestor::details').all()){if(!await detail.getAttribute('open').then(v=>v!==null))await detail.locator(':scope > summary').click();}return target;}
const snapshot=()=>page.evaluate(()=>window.__phase1.snapshot());
const saved=()=>page.waitForFunction(()=>window.__phase1?.saveState()==='saved'&&!document.querySelector('.app').inert);
const ids=()=>page.locator('[data-region-selected="true"]').evaluateAll(nodes=>nodes.map(n=>n.dataset.nodeId));
const positions=d=>d.roadmap.nodes.map(n=>[n.id,n.position]);
const selectNode=async id=>{const n=page.locator(`[data-node-id="${id}"]`);await n.focus();await n.press('Enter');await n.press('Shift+F10');await page.locator('#cursor-dialog').getByRole('menuitem',{name:'Open details',exact:true}).click();};
async function exportFile(button='#export-roadmap'){const event=page.waitForEvent('download');await page.locator(button).click();const file=await event;assert.equal(await file.failure(),null);const text=await readFile(await file.path(),'utf8');await file.saveAs(join(out,`backup-${results.length}-${Date.now()}.json`));return JSON.parse(text);}
async function replace(doc){const event=page.waitForEvent('filechooser');await page.locator('#import-roadmap').click();await (await event).setFiles({name:'bulk-test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(doc))});await page.locator('#bulk-preview').waitFor({state:'hidden'});await page.locator('#import-preview').waitFor({state:'visible'});await exportFile('#export-before-import');await page.locator('#backup-retained').check();await page.locator('#replace-import').click();await page.locator('#import-preview').waitFor({state:'hidden'});await saved();}
function fixture(){
 const d=newFixture(),base=structuredClone(d.roadmap.nodes[0]);d.roadmap.id='p3-002-disposable';d.roadmap.title='Disposable region-selection fixture (illustrative only)';
 d.roadmap.nodes=[['a',80,80,'not_started','old'],['b',380,80,'in_progress',null],['c',80,280,'not_started','target'],['d',380,280,'completed','target'],['h',660,80,'completed','old'],['p',690,280,'in_progress',null],['offscreen',2000,2000,'not_started',null]].map(([id,x,y,status,groupId])=>({...structuredClone(base),id,title:`Goal ${id}`,status,groupId,catalogRef:null,notes:'original notes',position:{x,y},progress:{current:id==='a'?12:0,target:10}}));
 d.roadmap.groups=[{id:'old',title:'Old group',representativeNodeId:'a',collapsed:false},{id:'target',title:'Target group',representativeNodeId:'c',collapsed:false}];
 d.roadmap.edges=[{id:'ab',sourceId:'a',targetId:'b',kind:'hard'},{id:'bc',sourceId:'b',targetId:'c',kind:'hard'},{id:'hb',sourceId:'h',targetId:'b',kind:'soft'}];d.preferences.viewport={x:30,y:20,zoom:1};return d;
}
async function bounds(id){return page.locator(`[data-node-id="${id}"]`).boundingBox();}
async function region(rect,{reverse=false,screenshot=false}={}){
 const start=reverse?{x:rect.x+rect.width,y:rect.y+rect.height}:{x:rect.x,y:rect.y},end=reverse?{x:rect.x,y:rect.y}:{x:rect.x+rect.width,y:rect.y+rect.height};
 await page.mouse.move(start.x,start.y);await page.keyboard.down('Shift');await page.mouse.down();await page.mouse.move(end.x,end.y,{steps:6});
 if(screenshot)await page.screenshot({path:join(out,'selection-rectangle.png'),fullPage:true});await page.mouse.up();await page.keyboard.up('Shift');
}
async function pairRegion(options){const a=await bounds('a'),b=await bounds('b');await region({x:a.x-8,y:a.y-4,width:b.x+b.width-a.x+16,height:Math.max(a.height,b.height)+8},options);}
async function allVisibleRegion(){const box=await page.locator('#viewport').boundingBox();await region({x:box.x+3,y:box.y+3,width:box.width-6,height:box.height-6});}
async function statusPreview(status){await (await reveal('#bulk-status')).selectOption(status);await (await reveal('#bulk-set-status')).click();await page.locator('#bulk-preview').waitFor({state:'visible'});}
const apply=async()=>{await page.locator('#bulk-apply').click();await page.locator('#bulk-preview').waitFor({state:'hidden'});};
try{
 await check('separate static build succeeds without replacing preserved dist',async()=>{
  const result=spawnSync(process.execPath,['scripts/build.mjs',relative(root,build)],{cwd:root,encoding:'utf8',windowsHide:true});await writeFile(join(out,'build.txt'),result.stdout+result.stderr);assert.equal(result.status,0);assert.deepEqual(await hashes(join(root,'dist')),distBefore);assert.deepEqual(await hashes(join(root,'src')),await hashes(join(build,'src')));
 });
 let exists=false;try{exists=(await fetch(origin)).ok;}catch{}
 if(!exists){server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,stdio:['ignore','pipe','pipe'],windowsHide:true});await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error('Cannot start source server');})]);}
 assert.equal(await (await fetch(url)).text(),await readFile(join(build,'index.html'),'utf8'));
 browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});context=await browser.newContext({viewport:{width:1500,height:1050},acceptDownloads:true});page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>accept?d.accept():d.dismiss());page.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});
 await page.goto(url);await page.waitForFunction(()=>window.__phase1?.snapshot());await replace(fixture());
 await check('Shift-region draws rectangle and selects full visible cards; ordinary pan is unchanged',async()=>{
  const before=await snapshot();await pairRegion({screenshot:true});assert.deepEqual(await ids(),['a','b']);assert.match(await page.locator('#bulk-count').textContent(),/2 goals selected/);assert.deepEqual(await snapshot(),before);await page.screenshot({path:join(out,'selected-goals-toolbar.png'),fullPage:true});
  await page.keyboard.press('Escape');assert.deepEqual(await ids(),[]);assert.equal(await page.locator('#gesture rect').count(),0);
  const box=await page.locator('#viewport').boundingBox(),v=await page.evaluate(()=>window.__phase1.viewport());await page.mouse.move(box.x+600,box.y+box.height-35);await page.mouse.down();await page.mouse.move(box.x+635,box.y+box.height-60,{steps:5});await page.mouse.up();await saved();const next=await snapshot();assert.deepEqual(positions(next),positions(before));assert.equal(next.preferences.viewport.x,v.x+35);assert.equal(next.preferences.viewport.y,v.y-25);assert.deepEqual(await ids(),[]);
 });
 await check('containment at zoom/pan, reverse drag, partial exclusion and compact size',async()=>{
  let before=await snapshot();const box=await page.locator('#viewport').boundingBox(),zoom=before.preferences.viewport.zoom;await page.mouse.move(box.x+10,box.y+10);await page.mouse.wheel(0,200);await page.waitForFunction(z=>window.__phase1.viewport().zoom<z,zoom);await saved();await pairRegion({reverse:true});assert.deepEqual(await ids(),['a','b']);assert.deepEqual(positions(await snapshot()),positions(before));
  const a=await bounds('a'),b=await bounds('b');await region({x:a.x-8,y:a.y-4,width:b.x+b.width-a.x+7,height:a.height+8});assert.deepEqual(await ids(),['a']);
  await page.locator('#density').click();await saved();await pairRegion();assert.deepEqual(await ids(),['a','b']);assert.equal((await snapshot()).preferences.nodeDensity,'compact');
  await page.keyboard.press('Escape');await pairRegion();await page.keyboard.press('Escape');assert.deepEqual(await ids(),[]);
 });
 await check('status preview/cancel and single-step undo/redo affect exactly explicit IDs and preserve counters',async()=>{
  await replace(fixture());await pairRegion();const before=await snapshot();await statusPreview('completed');assert.match(await page.locator('#bulk-summary').textContent(),/2 selected goals/);assert.equal(await page.locator('#bulk-ids li').count(),2);await page.screenshot({path:join(out,'bulk-status-preview.png'),fullPage:true});await page.locator('#bulk-cancel').click();assert.deepEqual(await snapshot(),before);assert.deepEqual(await ids(),['a','b']);
  await statusPreview('completed');await apply();await saved();const next=await snapshot();for(const n of next.roadmap.nodes){const old=before.roadmap.nodes.find(x=>x.id===n.id);if(['a','b'].includes(n.id)){assert.equal(n.status,'completed');assert.deepEqual(n.progress,old.progress);assert.deepEqual(n.position,old.position);}else assert.deepEqual(n,old);}assert.deepEqual(next.roadmap.edges,before.roadmap.edges);
  await page.locator('#undo').click();await saved();assert.deepEqual(await snapshot(),before);await page.locator('#redo').click();await saved();assert.deepEqual(await snapshot(),next);
  for(const status of ['not_started','in_progress']){await statusPreview(status);await apply();await saved();assert.ok((await snapshot()).roadmap.nodes.filter(n=>['a','b'].includes(n.id)).every(n=>n.status===status));}
 });
 await check('new group cancel/validation/create, add, ungroup and representatives each use one command',async()=>{
  await replace(fixture());await pairRegion();const before=await snapshot();await (await reveal('#bulk-create-group')).click();await page.locator('#bulk-group-title').fill('Canceled group');await page.locator('#bulk-cancel').click();assert.deepEqual(await snapshot(),before);
  await (await reveal('#bulk-create-group')).click();await page.locator('#bulk-apply').click();assert.match(await page.locator('#bulk-error').textContent(),/name is required/);assert.deepEqual(await snapshot(),before);await page.locator('#bulk-group-title').fill('Region group');await apply();await saved();const created=await snapshot(),group=created.roadmap.groups.at(-1);assert.deepEqual(created.roadmap.nodes.filter(n=>n.groupId===group.id).map(n=>n.id),['a','b']);assert.equal(created.roadmap.nodes.find(n=>n.id==='h').groupId,'old');assert.equal(created.roadmap.groups.find(g=>g.id==='old').representativeNodeId,null);
  await page.locator('#undo').click();await saved();assert.deepEqual(await snapshot(),before);await page.locator('#redo').click();await saved();assert.deepEqual(await snapshot(),created);
  await (await reveal('#bulk-group')).selectOption('target');await (await reveal('#bulk-add-group')).click();assert.match(await page.locator('#bulk-summary').textContent(),/Target group.*2 selected goals/);await apply();await saved();const added=await snapshot();assert.equal(added.roadmap.groups.find(g=>g.id==='target').representativeNodeId,'c');assert.equal(added.roadmap.nodes.filter(n=>n.groupId==='target').length,4);
  await page.locator('#undo').click();await saved();assert.deepEqual(await snapshot(),created);await page.locator('#redo').click();await saved();assert.deepEqual(await snapshot(),added);
  await (await reveal('#bulk-ungroup')).click();await apply();await saved();const ungrouped=await snapshot();assert.equal(ungrouped.roadmap.nodes.find(n=>n.id==='a').groupId,null);assert.equal(ungrouped.roadmap.nodes.find(n=>n.id==='c').groupId,'target');assert.deepEqual(positions(ungrouped),positions(before));assert.deepEqual(ungrouped.roadmap.edges,before.roadmap.edges);
  await page.locator('#undo').click();await saved();assert.deepEqual(await snapshot(),added);await page.locator('#redo').click();await saved();assert.deepEqual(await snapshot(),ungrouped);
 });
 await check('cancel and declining draft discard leave data and inspector draft unchanged',async()=>{
  await replace(fixture());await selectNode('a');await page.locator('#goal-notes').fill('UNSAVED draft');await pairRegion();assert.equal(await page.locator('#goal-notes').inputValue(),'UNSAVED draft');const before=await snapshot();
  await statusPreview('completed');await page.locator('#bulk-cancel').click();assert.deepEqual(await snapshot(),before);assert.equal(await page.locator('#goal-notes').inputValue(),'UNSAVED draft');
  await statusPreview('completed');accept=false;await page.locator('#bulk-apply').click();accept=true;assert.equal(await page.locator('#bulk-preview').isVisible(),true);assert.deepEqual(await snapshot(),before);assert.equal(await page.locator('#goal-notes').inputValue(),'UNSAVED draft');await page.keyboard.press('Escape');assert.deepEqual(await snapshot(),before);
  await statusPreview('completed');await apply();await saved();assert.equal((await snapshot()).roadmap.nodes.find(n=>n.id==='a').notes,'original notes');
 });
 await check('selection/action scope under completed Hide/Collapse, Focus and collapsed groups',async()=>{
  const d=fixture();d.roadmap.nodes.find(n=>n.id==='a').status='completed';await replace(d);await pairRegion();await (await reveal('#completed-visibility')).selectOption('hide');await saved();assert.deepEqual(await ids(),['b']);await statusPreview('completed');assert.match(await page.locator('#bulk-summary').textContent(),/1 selected goal\./);await apply();await saved();assert.deepEqual(await ids(),[]);const hidden=await snapshot();for(const n of hidden.roadmap.nodes)if(n.id!=='b')assert.deepEqual(n,d.roadmap.nodes.find(x=>x.id===n.id));
  await replace(d);await pairRegion();await (await reveal('#completed-visibility')).selectOption('collapse');await saved();assert.deepEqual(await ids(),['b']);await allVisibleRegion();assert.equal((await ids()).includes('a'),false);assert.equal((await ids()).includes('h'),false);assert.equal((await ids()).includes('offscreen'),false);
  const collapsed=fixture();collapsed.roadmap.groups[0].collapsed=true;await replace(collapsed);await allVisibleRegion();const scope=await ids();assert.equal(scope.includes('a'),false);assert.equal(scope.includes('h'),false);assert.equal(scope.includes('offscreen'),false);assert.ok(scope.includes('b'));assert.equal(await page.locator('[data-summary-kind="group"][data-region-selected]').count(),0);
  await replace(fixture());await pairRegion();await (await reveal('#navigation-root')).selectOption('b');await (await reveal('#navigation-direction')).selectOption('downstream');await (await reveal('#focus')).click();await saved();assert.deepEqual(await ids(),['b']);await allVisibleRegion();assert.deepEqual(await ids(),['b','c']);const before=await snapshot();await statusPreview('completed');await apply();await saved();for(const n of (await snapshot()).roadmap.nodes)if(!['b','c'].includes(n.id))assert.deepEqual(n,before.roadmap.nodes.find(x=>x.id===n.id));
 });
 await check('adding to collapsed group prunes selected IDs and never includes existing hidden members',async()=>{
  const d=fixture();d.roadmap.groups[1].collapsed=true;await replace(d);await pairRegion();await (await reveal('#bulk-group')).selectOption('target');await (await reveal('#bulk-add-group')).click();await apply();await saved();const next=await snapshot();assert.deepEqual(await ids(),[]);for(const id of ['c','d','h','p','offscreen'])assert.deepEqual(next.roadmap.nodes.find(n=>n.id===id),d.roadmap.nodes.find(n=>n.id===id));assert.equal(next.roadmap.groups[1].representativeNodeId,'c');
 });
 await check('reload and JSON import/export preserve bulk results; selection remains transient',async()=>{
  await replace(fixture());await pairRegion();await (await reveal('#bulk-create-group')).click();await page.locator('#bulk-group-title').fill('Roundtrip group');await apply();await saved();await statusPreview('in_progress');await apply();await saved();const before=await snapshot(),backup=await exportFile();assert.deepEqual(backup,before);assert.equal(Object.hasOwn(backup,'regionSelection'),false);
  await page.reload();await saved();assert.deepEqual(await snapshot(),before);assert.deepEqual(await ids(),[]);await replace(fixture());await pairRegion();await replace(backup);assert.deepEqual(await snapshot(),backup);assert.deepEqual(await ids(),[]);
 });
 await check('failed bulk save keeps last committed copy; reload recovery and Retry retain correct IDs',async()=>{
  await replace(fixture());await pairRegion();const before=await snapshot();await (await reveal('#test-fail-save')).click();await statusPreview('completed');await apply();await page.waitForFunction(()=>window.__phase1.saveState()==='failed');await page.reload();await saved();assert.deepEqual(await snapshot(),before);assert.deepEqual(await ids(),[]);
  await pairRegion();await (await reveal('#test-fail-save')).click();await statusPreview('completed');await apply();await page.waitForFunction(()=>window.__phase1.saveState()==='failed');const inMemory=await snapshot();await page.locator('#retry-save').click();await saved();await page.reload();await saved();assert.deepEqual(await snapshot(),inMemory);
 });
 await check('Escape mid-region cancels gesture without data changes; highlighted goals remain selectable',async()=>{
  await replace(fixture());await (await reveal('#navigation-root')).selectOption('b');await (await reveal('#navigation-direction')).selectOption('downstream');await (await reveal('#highlight')).click();await saved();await pairRegion();assert.deepEqual(await ids(),['a','b']);await page.keyboard.press('Escape');const before=await snapshot(),a=await bounds('a'),b=await bounds('b');await page.keyboard.down('Shift');await page.mouse.move(a.x-8,a.y-8);await page.mouse.down();await page.mouse.move(b.x+b.width+8,b.y+b.height+8);await page.keyboard.press('Escape');await page.mouse.up();await page.keyboard.up('Shift');assert.deepEqual(await ids(),[]);assert.deepEqual(await snapshot(),before);assert.equal(await page.locator('#gesture rect').count(),0);
 });
 await check('click/Shift-click pairing, node movement, and port connection still work after region selection',async()=>{
  await replace(fixture());await pairRegion();await selectNode('a');assert.deepEqual(await ids(),[]);const target=page.locator('[data-node-id="b"]');await target.focus();await target.press('Shift+Enter');assert.deepEqual(await page.evaluate(()=>window.__phase1.paired()),['a','b']);await page.locator('#connect-selected').click();await page.locator('#cursor-cancel').click();
  await pairRegion();const before=await snapshot(),body=await page.locator('[data-node-id="b"] .node-body').boundingBox();await page.mouse.move(body.x+30,body.y+30);await page.mouse.down();await page.mouse.move(body.x+65,body.y+65,{steps:4});await page.mouse.up();await saved();assert.deepEqual(await ids(),['a','b']);assert.notDeepEqual(positions(await snapshot()),positions(before));assert.deepEqual((await snapshot()).roadmap.edges,before.roadmap.edges);
  await pairRegion();const from=await page.locator('[data-node-id="a"] .out-port').boundingBox(),to=await page.locator('[data-node-id="c"] .in-port').boundingBox();await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:8});await page.mouse.up();assert.deepEqual(await ids(),[]);await page.locator('#cursor-details').click();await page.locator('#link-kind').selectOption('order');await page.getByRole('button',{name:'Create directed connection',exact:true}).click();await saved();assert.ok((await snapshot()).roadmap.edges.some(e=>e.sourceId==='a'&&e.targetId==='c'&&e.kind==='order'));
 });
 await check('no browser exceptions/external requests; preserved dist bytes unchanged',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(await hashes(join(root,'dist')),distBefore);});
}catch(error){console.error(error);process.exitCode=1;try{await page?.screenshot({path:join(out,'failure.png'),fullPage:true});}catch{}}
finally{await writeFile(join(out,'results.json'),JSON.stringify({date:new Date().toISOString(),environment:{node:process.version,platform:process.platform,browser:browser?.version(),origin,url,storage:'fresh disposable browser context; real IndexedDB'},results,errors,external},null,2));console.log(`Evidence: ${out}`);await context?.close();await browser?.close();if(server&&!server.killed)server.kill();}
