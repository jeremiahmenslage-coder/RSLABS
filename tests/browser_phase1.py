"""Chromium DOM/interaction tests using intercepted inline ESM and an explicitly MOCKED IndexedDB.
NOT an HTTP-page or real browser-origin IndexedDB integration test.
"""
import base64, json, pathlib, re, time, traceback
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
PAT=re.compile(r'(from\s*[\"\'])(\.\.?/[^\"\']+)([\"\'])')
CACHE={}
def module_url(path):
 path=path.resolve()
 if path in CACHE:return CACHE[path]
 txt=path.read_text()
 def sub(match):
  dest=(path.parent/match.group(2)).resolve();return match.group(1)+module_url(dest)+match.group(3)
 txt=PAT.sub(sub,txt)
 url='data:text/javascript;base64,'+base64.b64encode(txt.encode()).decode()
 CACHE[path]=url
 return url
html=(ROOT/'index.html').read_text().replace('<script type="module" src="./src/main.js"></script>','')
css=(ROOT/'src/style.css').read_text()
FAKE_IDB='''
window.__fakeDisk = {document:null};
Object.defineProperty(window,'indexedDB',{configurable:true,value:{open:()=>{let req={result:null,error:null};setTimeout(()=>{req.result={objectStoreNames:{contains:()=>true},createObjectStore:()=>{},transaction:(name,mode)=>{
 let tx={oncomplete:null,onabort:null,onerror:null,error:null};tx.objectStore=()=>({get:()=>{const rr={result:null,error:null};setTimeout(()=>{rr.result=structuredClone(window.__fakeDisk.document);rr.onsuccess?.();},0);return rr},put:(value)=>{setTimeout(()=>{window.__fakeDisk.document=structuredClone(value);tx.oncomplete?.();},0);}});return tx;
 }};req.onsuccess?.();},0);return req;}}});
window.confirm=()=>true;
'''
def main():
 outcome=[]
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':900})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded');page.add_style_tag(content=css)
  page.evaluate(FAKE_IDB)
  url=module_url(ROOT/'src/main.js')
  page.evaluate('url => import(url)',url)
  page.wait_for_function('window.__phase1.snapshot() !== null',timeout=10000)
  def check(name,fn):
   try:fn();outcome.append((name,'PASS'))
   except Exception as exc:
    outcome.append((name,'FAIL: '+str(exc)[:260]));print('FAIL TRACE',name,traceback.format_exc()[:1200])
  def snapshot():return page.evaluate('window.__phase1.snapshot()')
  def create(label,x,y):
   vp=page.locator('#viewport').bounding_box();page.mouse.dblclick(vp['x']+x,vp['y']+y)
   page.locator('#goal-title').fill(label);page.locator('#save-goal').click()
  def click_node(node_id):
   page.locator(f'[data-node-id="{node_id}"] .node-body').click(force=True)
  def save_idle():
   page.wait_for_function('window.__phase1.saveState()==="saved"',timeout=6000)
  check('initial empty roadmap, no sample injected',lambda: (assertion(len(snapshot()['roadmap']['nodes'])==0),assertion(page.locator('#save-state').count()==1),assertion(not page.locator('#retry-save').is_visible())))
  def cancel_new():
   vp=page.locator('#viewport').bounding_box();page.mouse.dblclick(vp['x']+75,vp['y']+80)
   page.locator('#goal-title').fill('Must not exist');page.locator('#cancel-editor').click()
   assertion(len(snapshot()['roadmap']['nodes'])==0)
  check('Cancel new goal does not create an orphan',cancel_new)
  def world_coordinate_zoom():
   vp=page.locator('#viewport').bounding_box();midX=vp['x']+vp['width']/2;midY=vp['y']+vp['height']/2
   page.mouse.move(midX,midY);page.mouse.wheel(0,-450);page.wait_for_timeout(100)
   state=page.evaluate('window.__phase1.viewport()');px=vp['x']+80;py=vp['y']+120
   expected={'x':round((80-state['x'])/state['zoom']),'y':round((120-state['y'])/state['zoom'])}
   page.mouse.dblclick(px,py);page.locator('#goal-title').fill('Transform test');page.locator('#save-goal').click()
   actual=snapshot()['roadmap']['nodes'][0]['position'];assertion(actual==expected)
   page.locator('#undo').click();assertion(len(snapshot()['roadmap']['nodes'])==0)
   page.locator('#fit').click()
  check('zoom-aware new node world coordinates + undo create',world_coordinate_zoom)
  def make_nodes():
   for i,lab in enumerate(['52 Sailing','Troubled Tortugans',"Belle’s Folly",'Barrows Armor','Crystal Shield','Berserker Ring','Perilous Moons']):
    create(lab,65+int(i%3)*290,95+int(i//3)*200)
   assertion(len(snapshot()['roadmap']['nodes'])==7);save_idle()
  check('doubleclick empty canvas creates seven nodes and autosaves',make_nodes)
  def edit():
   d=snapshot();id=d['roadmap']['nodes'][0]['id'];click_node(id)
   page.locator('#goal-title').fill('52 Sailing goal');page.locator('#goal-notes').fill('custom notes');page.locator('#save-goal').click()
   n=snapshot()['roadmap']['nodes'][0];assertion(n['title']=='52 Sailing goal' and n['notes']=='custom notes')
  check('select and edit node in Inspector',edit)
  def dirty_editor_switch():
   ns=snapshot()['roadmap']['nodes'];click_node(ns[0]['id'])
   page.locator('#goal-notes').fill('UNSAVED')
   page.evaluate('window.confirm=()=>false')
   click_node(ns[1]['id'])
   assertion(page.locator('#goal-notes').input_value()=='UNSAVED')
   assertion(page.evaluate('window.__phase1.selected().id')==ns[0]['id'])
   page.evaluate('window.confirm=()=>true')
   page.locator('#cancel-editor').click()
  check('dirty edit requires confirmation before context switch',dirty_editor_switch)
  def connect_pair():
   ns=snapshot()['roadmap']['nodes'];a=ns[0]['id'];b=ns[1]['id'];
   click_node(a);page.locator(f'[data-node-id="{b}"] .node-body').click(modifiers=['Shift'],force=True)
   assertion(page.locator('#connect-selected').is_enabled());page.locator('#connect-selected').click()
   assertion(page.locator('#link-source').input_value()==a and page.locator('#link-target').input_value()==b)
   page.locator('#link-kind').select_option('hard');page.get_by_role('button',name='Create directed connection').click()
   assertion(len(snapshot()['roadmap']['edges'])==1 and snapshot()['roadmap']['edges'][0]['kind']=='hard')
  check('click source Shift-click destination + Connect',connect_pair)
  def handle_link():
   ns=snapshot()['roadmap']['nodes'];start=page.locator(f'[data-node-id="{ns[1]["id"]}"] .out-port').bounding_box();dest=page.locator(f'[data-node-id="{ns[2]["id"]}"] .in-port').bounding_box();
   page.mouse.move(start['x']+start['width']/2,start['y']+start['height']/2);page.mouse.down();page.mouse.move(dest['x']+dest['width']/2,dest['y']+dest['height']/2,steps=9);page.mouse.up()
   assertion(page.locator('#link-kind').count()==1);page.locator('#link-kind').select_option('soft');page.get_by_role('button',name='Create directed connection').click();assertion(len(snapshot()['roadmap']['edges'])==2)
  check('output handle -> input handle relationship creation',handle_link)
  def edit_delete_edge():
   edge=snapshot()['roadmap']['edges'][1];page.locator(f'[data-edge-id="{edge["id"]}"] .edge-label').click(force=True)
   page.locator('#edge-kind').select_option('order');page.get_by_role('button',name='Save connection').click()
   assertion(snapshot()['roadmap']['edges'][1]['kind']=='order')
   page.get_by_role('button',name='Delete connection…').click();assertion(len(snapshot()['roadmap']['edges'])==1)
   page.locator('#undo').click();assertion(len(snapshot()['roadmap']['edges'])==2)
  check('edge type edit, confirmed delete, undo restore',edit_delete_edge)
  (ROOT/'evidence').mkdir(exist_ok=True)
  page.screenshot(path=str(ROOT/'evidence/phase1-editor-chromium-inline.png'),full_page=True)
  def dup_cycle():
   es=snapshot()['roadmap']['edges'];a,b=es[0]['sourceId'],es[0]['targetId'];page.get_by_role('button',name='Connect selected nodes').count()
   click_node(a);page.locator(f'[data-node-id="{b}"] .node-body').click(force=True,modifiers=['Shift']);page.locator('#connect-selected').click();page.get_by_role('button',name='Create directed connection').click();assertion('Duplicate' in page.locator('.form-error').inner_text())
   page.locator('#link-source').select_option(a);page.locator('#link-target').select_option(a);page.get_by_role('button',name='Create directed connection').click();assertion('Self' in page.locator('.form-error').inner_text())
   page.locator('#link-source').select_option(b);page.locator('#link-target').select_option(a);page.locator('#link-kind').select_option('hard');page.get_by_role('button',name='Create directed connection').click();assertion('cycle' in page.locator('.form-error').inner_text().lower());assertion(len(snapshot()['roadmap']['edges'])==2)
  check('duplicate, self, hard-cycle rejection via actual UI',dup_cycle)
  def move_undo():
   ns=snapshot()['roadmap']['nodes'];nid=ns[0]['id'];before=ns[0]['position'];body=page.locator(f'[data-node-id="{nid}"] .node-body').bounding_box();x=body['x']+body['width']/2;y=body['y']+body['height']/2
   page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+60,y+34,steps=9);page.mouse.up()
   after=snapshot()['roadmap']['nodes'][0]['position'];assertion(after!=before)
   page.locator('#undo').click();assertion(snapshot()['roadmap']['nodes'][0]['position']==before)
   page.locator('#redo').click();assertion(snapshot()['roadmap']['nodes'][0]['position']==after);save_idle()
  check('drag node, undo move, redo, browser-mock autosave',move_undo)
  def layout():
   sig=lambda:[(e['id'],e['sourceId'],e['targetId'],e['kind']) for e in snapshot()['roadmap']['edges']]
   before=sig();page.locator('#optimize').click();assertion(sig()==before);page.locator('#undo').click();assertion(sig()==before)
  check('Optimize Layout preserves original semantic pairs and undo',layout)
  def fail_write():
   save_idle();last_good=page.evaluate('window.__fakeDisk.document.roadmap.nodes.length');page.locator('#test-fail-save').click()
   node=snapshot()['roadmap']['nodes'][0];click_node(node['id']);page.locator('#goal-notes').fill('unsaved failure test');page.locator('#save-goal').click()
   page.wait_for_function('window.__phase1.saveState()==="failed"',timeout=6000)
   assertion('SAVE FAILED' in page.locator('#save-state').inner_text());assertion(page.evaluate('window.__fakeDisk.document.roadmap.nodes[0].notes')!='unsaved failure test')
   page.locator('#retry-save').click();save_idle();assertion(page.evaluate('window.__fakeDisk.document.roadmap.nodes[0].notes')=='unsaved failure test')
  check('simulated write failure + no false Saved + Retry',fail_write)
  def delete_undo():
   ns=snapshot()['roadmap']['nodes'];id=ns[1]['id'];click_node(id);page.get_by_role('button',name='Delete goal…').click();assertion(len(snapshot()['roadmap']['nodes'])==6);assertion(len(snapshot()['roadmap']['edges'])==0);page.locator('#undo').click();assertion(len(snapshot()['roadmap']['nodes'])==7 and len(snapshot()['roadmap']['edges'])==2)
  check('confirm node delete removes incident edges and undo restores',delete_undo)
  def load_demo():
   page.locator('#load-demo').click();assertion(len(snapshot()['roadmap']['nodes'])==7 and len(snapshot()['roadmap']['edges'])==6);page.locator('#collapse').click();assertion(snapshot()['roadmap']['groups'][0]['collapsed']);assertion(len(snapshot()['roadmap']['edges'])==6);page.locator('#density').click();assertion(snapshot()['preferences']['nodeDensity']=='compact')
   page.locator('#new-roadmap').click();assertion(len(snapshot()['roadmap']['nodes'])==0)
  check('optional fixture, collapse semantics, density, reset to empty',load_demo)
  if errors: outcome.append(('uncaught browser errors','FAIL: '+'; '.join(errors)[:300]))
  print(json.dumps({'environment':'Chromium inline DOM via data-URL modules; mocked IndexedDB; NOT URL-loaded E2E', 'tests':[{'name':n,'result':r} for n,r in outcome],'passed':sum(r=='PASS' for _,r in outcome),'failed':sum(r!='PASS' for _,r in outcome)},indent=2))
  browser.close()
  return sum(r!='PASS' for _,r in outcome)
def assertion(condition):
 if not condition:raise AssertionError('Assertion failed')
if __name__=='__main__':raise SystemExit(main())
