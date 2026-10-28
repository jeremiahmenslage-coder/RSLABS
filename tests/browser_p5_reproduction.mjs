// P4-001: separate static output, real HTTP/IndexedDB, actual mouse modifiers and contextual controls.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {mkdir,readdir,readFile,writeFile} from 'node:fs/promises';
import {join,resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {cursorFixture} from './fixtures/cursor.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const root=resolve(import.meta.dirname,'..'),out=join(root,'evidence',`p5-reproduction-${new Date().toISOString().replace(/[:.]/g,'-')}`),build=join(out,'static');await mkdir(out);
const origin='http://127.0.0.1:4173',url=`${origin}/${relative(root,build).replaceAll('\\','/')}/`;
const results=[],errors=[],external=[];let browser,context,page,server,accept=true;
const hash=b=>createHash('sha256').update(b).digest('hex');
async function hashes(dir){const map={};async function walk(p){for(const e of await readdir(p,{withFileTypes:true})){const f=join(p,e.name);if(e.isDirectory())await walk(f);else map[relative(dir,f)]=hash(await readFile(f));}}await walk(dir);return map;}
const dist=await hashes(join(root,'dist'));
const check=async(name,fn)=>{try{await fn();results.push({name,result:'Pass'});console.log(`PASS ${name}`);}catch(error){results.push({name,result:'Fail',error:error.stack});throw error;}};
async function reveal(selector){const target=page.locator(selector);for(const detail of await target.locator('xpath=ancestor::details').all()){if(!await detail.getAttribute('open').then(v=>v!==null))await detail.locator(':scope > summary').click();}return target;}
const snapshot=()=>page.evaluate(()=>window.__phase1.snapshot());
const saved=()=>page.waitForFunction(()=>window.__phase1?.saveState()==='saved'&&!document.querySelector('.app').inert);
const card=id=>page.locator(`[data-node-id="${id}"]`),body=id=>card(id).locator('.node-body');
const item=label=>page.locator('#cursor-dialog').getByRole('menuitem',{name:label,exact:true});
const positions=d=>d.roadmap.nodes.map(n=>[n.id,n.position]);
const selection=()=>page.locator('[data-region-selected]').evaluateAll(nodes=>nodes.map(n=>n.dataset.nodeId));
async function exportFile(button='#export-roadmap'){const event=page.waitForEvent('download');await page.locator(button).click();const file=await event;assert.equal(await file.failure(),null);const text=await readFile(await file.path(),'utf8');await file.saveAs(join(out,`backup-${results.length}-${Date.now()}.json`));return JSON.parse(text);}
async function replace(doc){const event=page.waitForEvent('filechooser');await page.locator('#import-roadmap').click();await (await event).setFiles({name:'cursor-test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(doc))});await page.locator('#import-preview').waitFor({state:'visible'});await exportFile('#export-before-import');await page.locator('#backup-retained').check();await page.locator('#replace-import').click();await page.locator('#import-preview').waitFor({state:'hidden'});await saved();}
async function rightGoal(id){await body(id).click({button:'right'});await page.locator('#cursor-dialog').waitFor({state:'visible'});}
async function rightEdge(id){await page.locator(`[data-edge-id="${id}"] .edge-label`).click({button:'right'});await page.locator('#cursor-dialog').waitFor({state:'visible'});}
async function emptyPoint(){const r=await page.locator('#viewport').boundingBox();return {x:Math.floor(r.x+r.width-25),y:Math.floor(r.y+20)};}
async function rightEmpty(){if(await page.locator('#details-panel').isVisible())await page.locator('#inspector-toggle').click();const p=await emptyPoint();await page.mouse.click(p.x,p.y,{button:'right'});return p;}
async function createPoint(x=440,y=460){const r=await page.locator('#viewport').boundingBox(),p={x:Math.floor(r.x+x),y:Math.floor(r.y+y)};const expected=await page.evaluate(p=>{const r=document.getElementById('viewport').getBoundingClientRect(),v=window.__phase1.viewport(),vp=document.getElementById('viewport');return {x:Math.round((p.x-r.left+vp.scrollLeft-v.x)/v.zoom),y:Math.round((p.y-r.top+vp.scrollTop-v.y)/v.zoom)};},p);await page.mouse.dblclick(p.x,p.y);return {p,expected};}
async function choosePair(a,b){await body(a).click();await body(b).click({modifiers:['Shift']});assert.deepEqual(await page.evaluate(()=>window.__phase1.paired()),[a,b]);await page.locator('#connect-selected').click();}
async function port(a,b){const x=await card(a).locator('.out-port').boundingBox(),y=await card(b).locator('.in-port').boundingBox();await page.mouse.move(x.x+x.width/2,x.y+x.height/2);await page.mouse.down();await page.mouse.move(y.x+y.width/2,y.y+y.height/2,{steps:8});await page.mouse.up();}
async function regionPair(){const a=await card('a').boundingBox(),b=await card('b').boundingBox();await page.mouse.move(a.x-8,a.y-8);await page.keyboard.down('Shift');await page.mouse.down();await page.mouse.move(b.x+b.width+8,b.y+b.height+8,{steps:6});await page.mouse.up();await page.keyboard.up('Shift');assert.deepEqual(await selection(),['a','b']);}
async function bounded(){const r=await page.locator('#cursor-dialog').boundingBox(),size=page.viewportSize();assert.ok(r.x>=7&&r.y>=7&&r.x+r.width<=size.width-7&&r.y+r.height<=size.height-7,JSON.stringify(r));}
async function rename(id,title){await rightGoal(id);await item('Rename…').click();await page.locator('#cursor-title').fill(title);await page.locator('#cursor-title').press('Enter');await saved();}
try{
 await check('new static build matches source/vendor and preserves dist',async()=>{const result=spawnSync(process.execPath,['scripts/build.mjs',relative(root,build)],{cwd:root,encoding:'utf8',windowsHide:true});await writeFile(join(out,'build.txt'),result.stdout+result.stderr);assert.equal(result.status,0);assert.deepEqual(await hashes(join(root,'src')),await hashes(join(build,'src')));assert.deepEqual(await hashes(join(root,'dist')),dist);});
 let existing=false;try{existing=(await fetch(origin)).ok;}catch{}
 if(!existing){server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,stdio:['ignore','pipe','pipe'],windowsHide:true});await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error('Cannot start unchanged origin');})]);}
 assert.equal(await (await fetch(url)).text(),await readFile(join(build,'index.html'),'utf8'));browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});context=await browser.newContext({viewport:{width:1500,height:1050},acceptDownloads:true});page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>accept?d.accept():d.dismiss());page.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});await page.goto(url);await page.waitForFunction(()=>window.__phase1?.snapshot());await saved();



 const observed={};await replace(cursorFixture());await card('a').focus();await page.keyboard.press('Shift+F10');await item('Open details').click();await page.locator('#goal-target').fill('');await page.locator('#goal-target').press('ArrowUp');observed.targetArrow={value:await page.locator('#goal-target').inputValue(),min:await page.locator('#goal-target').getAttribute('min'),step:await page.locator('#goal-target').getAttribute('step')};await page.locator('#cancel-editor').click();await page.locator('#inspector-toggle').click();
 const d=cursorFixture();d.roadmap.groups.push({id:'null',title:'Literal null group',collapsed:false,representativeNodeId:null});d.roadmap.nodes[0].groupId='null';d.roadmap.groups[0].representativeNodeId=null;await replace(d);await page.locator('#view-board').click();await saved();await page.locator('#board-group').selectOption('group:null');await saved();observed.groupNull=await page.locator('[data-board-goal-id]').evaluateAll(ns=>ns.map(n=>n.dataset.boardGoalId));await page.locator('#board-clear').click();await saved();
 await page.locator('[data-board-goal-id="a"]').getByRole('button',{name:'More details',exact:true}).click();await page.locator('#goal-notes').fill('UNSAVED Board to Graph notes');let prompts=0;const listener=()=>prompts++;page.on('dialog',listener);await page.locator('#inspector-toggle').click();await page.locator('#view-graph').click();await saved();await page.locator('#inspector-toggle').click();observed.drafts={prompts,notes:await page.locator('#goal-notes').inputValue()};page.off('dialog',listener);await writeFile(join(out,'observations.json'),JSON.stringify(observed,null,2));console.log(observed);
}catch(error){console.error(error);process.exitCode=1;try{await page?.screenshot({path:join(out,'failure.png'),fullPage:true});}catch{}}
finally{await writeFile(join(out,'results.json'),JSON.stringify({date:new Date().toISOString(),environment:{node:process.version,platform:process.platform,browser:browser?.version(),origin,url,storage:'fresh disposable context; real IndexedDB'},results,errors,external},null,2));console.log(`Evidence: ${out}`);await context?.close();await browser?.close();if(server&&!server.killed)server.kill();}
