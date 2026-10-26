"""Actual Chromium DOM/gesture tests using the identical app JS assembled inline.
The container's Chromium blocks all http/file navigations by administrator policy.
Therefore this is an honest INLINE BROWSER HARNESS, not a deployed-page E2E pass.
"""
from pathlib import Path
import re
import unittest
import shutil
from urllib.parse import urlparse, unquote
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
EVIDENCE=ROOT/'evidence'

def harness():
    html=(ROOT/'index.html').read_text()
    html=re.sub(r'<link[^>]*rel="stylesheet"[^>]*>', '', html)
    html=html.replace('<script type="module" src="./src/main.js"></script>','')
    html=html.replace('</head>', '<base href="http://phase0-assets.invalid/"><style>'+(ROOT/'src/style.css').read_text()+'</style></head>')
    files=['fixture.js','model.js','projection.js','layout.js','icons.js','catalog/reference.js','assets/resolve.js','main.js']
    js='\n'.join(re.sub(r'(?m)^import .*?;\s*$', '',re.sub(r'(?m)^export ', '',(ROOT/'src'/f).read_text())) for f in files)
    return html,js

class BrowserSpike(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        EVIDENCE.mkdir(exist_ok=True)
        cls.pw=sync_playwright().start()
        exe=shutil.which('chromium') or shutil.which('google-chrome')
        cls.browser=cls.pw.chromium.launch(**({'executable_path':exe} if exe else {}),headless=True,args=['--no-sandbox'])
    @classmethod
    def tearDownClass(cls):
        cls.browser.close();cls.pw.stop()

    def setUp(self):
        self.page=self.browser.new_page(viewport={'width':1440,'height':850},device_scale_factor=1)
        self.page.set_default_timeout(3000)
        self.errors=[]
        self.page.on('pageerror',lambda e:self.errors.append(str(e)))
        def local_asset_route(route):
            path=unquote(urlparse(route.request.url).path).lstrip('/')
            candidate=(ROOT/path).resolve()
            allowed=(ROOT/'public/icons').resolve()
            if not candidate.is_relative_to(allowed) or not candidate.is_file():
                route.fulfill(status=404,body='Not found')
            else:
                ext=candidate.suffix
                route.fulfill(status=200,body=candidate.read_bytes(),content_type={'.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[ext])
        self.page.route('**/public/icons/*',local_asset_route)
        html,js=harness()
        self.page.set_content(html)
        self.page.add_script_tag(content=js)
        self.page.wait_for_timeout(40)

    def tearDown(self):
        self.assertEqual(self.errors,[],f'Browser JS errors: {self.errors}')
        self.page.close()

    def snap(self):
        return self.page.evaluate('window.__phase0.snapshot()')

    def drag_handle(self,source,target):
        a=self.page.locator(f'[data-node-id="{source}"] .out-port').bounding_box()
        b=self.page.locator(f'[data-node-id="{target}"] .in-port').bounding_box()
        self.page.mouse.move(a['x']+a['width']/2,a['y']+a['height']/2)
        self.page.mouse.down()
        self.page.mouse.move(b['x']+b['width']/2,b['y']+b['height']/2,steps=12)
        self.page.mouse.up()

    def test_01_fixture_rendered_and_pixel_icons_loaded(self):
        self.assertEqual(self.page.locator('.node-card').count(),7)
        self.assertEqual(self.page.locator('g.edge').count(),6)
        self.assertEqual(self.page.locator('.edge-label').count(),6)
        self.assertEqual(self.page.locator('img.node-icon').evaluate_all('(els)=>els.filter(e=>e.complete&&e.naturalWidth>0).length'),7)
        self.assertEqual(self.page.locator('.node-card').all_text_contents()[0].find('52 Sailing')>=0,True)
        self.page.screenshot(path=str(EVIDENCE/'initial.png'))

    def test_02_node_drag_and_inspector_edit(self):
        old=next(n for n in self.snap()['roadmap']['nodes'] if n['id']=='sailing')['position']
        box=self.page.locator('[data-node-id="sailing"] .node-body').bounding_box()
        x=box['x']+box['width']/2;y=box['y']+box['height']/2
        signature=self.page.evaluate('window.__phase0.signature()')
        self.page.mouse.move(x,y);self.page.mouse.down();self.page.mouse.move(x+75,y+50,steps=10);self.page.mouse.up()
        new=next(n for n in self.snap()['roadmap']['nodes'] if n['id']=='sailing')['position']
        self.assertNotEqual(old,new)
        self.assertEqual(self.page.evaluate('window.__phase0.signature()'),signature)
        self.page.locator('[data-node-id="sailing"]').click()
        self.page.locator('#edit-title').fill('52 Sailing (edited)')
        self.page.locator('#apply-title').click()
        self.assertEqual(next(n for n in self.snap()['roadmap']['nodes'] if n['id']=='sailing')['title'],'52 Sailing (edited)')

    def test_03_handle_connection_and_edge_type_edit(self):
        self.drag_handle('sailing','barrows')
        self.assertEqual(len(self.snap()['roadmap']['edges']),7,self.page.locator('#status').text_content())
        self.assertEqual(self.page.locator('#edge-kind').count(),1)
        self.page.locator('#edge-kind').select_option('soft')
        self.page.locator('#apply-edge').click()
        self.assertEqual(self.snap()['roadmap']['edges'][-1]['kind'],'soft')
        self.drag_handle('sailing','barrows')
        self.assertEqual(len(self.snap()['roadmap']['edges']),7)
        self.assertIn('rejected',self.page.locator('#status').text_content())

    def test_04_layout_data_integrity_density_and_group_projection(self):
        before=self.page.evaluate('window.__phase0.signature()')
        self.page.locator('#optimize').click()
        self.assertEqual(self.page.evaluate('window.__phase0.signature()'),before)
        self.assertEqual(self.page.locator('.node-card').count(),7)
        self.page.screenshot(path=str(EVIDENCE/'optimized.png'))
        self.page.locator('#density').click()
        self.assertEqual(self.page.evaluate('window.__phase0.density()'),'compact')
        self.assertEqual(self.page.locator('.node-card.compact').count(),7)
        self.page.locator('#collapse').click()
        self.assertEqual(self.page.locator('.node-card').count(),4)
        self.assertEqual(self.page.locator('g.edge').count(),3)
        self.assertEqual(self.page.locator('.group-summary').count(),1)
        self.assertEqual(self.page.locator('#canonical-count').text_content(),'6')
        self.assertEqual(self.page.evaluate('window.__phase0.signature()'),before)
        self.page.screenshot(path=str(EVIDENCE/'collapsed.png'))
        self.page.locator('.group-summary button').click()
        self.assertEqual(self.page.locator('g.edge').count(),6)
        self.assertEqual(self.page.evaluate('window.__phase0.signature()'),before)

    def test_05_edge_click_hitbox_and_type_options(self):
        self.page.locator('#optimize').click()
        self.page.locator('[data-edge-id="e1"] .edge-label').click(force=True)
        self.assertEqual(self.page.locator('#edge-kind').input_value(),'order')
        self.assertEqual(self.page.locator('#edge-kind option').count(),3)

    def test_06_canvas_pan_and_wheel_zoom_preserve_graph(self):
        before=self.page.evaluate('window.__phase0.signature()')
        pane=self.page.locator('#viewport').bounding_box()
        px=pane['x']+pane['width']*.5;py=pane['y']+pane['height']*.88
        initial=self.page.evaluate('window.__phase0.viewport()')
        self.page.mouse.move(px,py);self.page.mouse.down()
        self.page.mouse.move(px+55,py+32,steps=6);self.page.mouse.up()
        moved=self.page.evaluate('window.__phase0.viewport()')
        self.assertNotEqual((initial['tx'],initial['ty']),(moved['tx'],moved['ty']))
        self.page.mouse.wheel(0,-260)
        self.page.wait_for_timeout(80)
        after=self.page.evaluate('window.__phase0.viewport()')
        self.assertNotEqual(after['zoom'],moved['zoom'])
        self.assertEqual(before,self.page.evaluate('window.__phase0.signature()'))

    def test_07_reset_canonical_fixture(self):
        self.drag_handle('sailing','barrows')
        self.assertEqual(len(self.snap()['roadmap']['edges']),7)
        self.page.locator('#reset').click()
        self.assertEqual(len(self.snap()['roadmap']['edges']),6)
        self.assertEqual(self.page.locator('g.edge').count(),6)
        self.assertEqual(self.page.locator('#canonical-count').text_content(),'6')

    def test_08_png_webp_override_and_broken_image_fallback(self):
        self.page.wait_for_function('''() => [...document.querySelectorAll('img.node-icon')].every(e=>e.complete&&e.naturalWidth>0)''')
        sailing=self.page.locator('[data-node-id="sailing"] img.node-icon')
        ring=self.page.locator('[data-node-id="ring"] img.node-icon')
        self.assertIn('sample-sail.png',sailing.get_attribute('src'))
        self.assertIn('sample-ring.webp',ring.get_attribute('src'))
        self.assertEqual(sailing.evaluate('(e)=>e.naturalWidth'),64)
        self.assertEqual(ring.evaluate('(e)=>e.naturalWidth'),64)
        before=self.snap()
        self.page.locator('[data-node-id="sailing"]').click()
        self.page.locator('#test-icon-ref').select_option('test:alternate-png')
        self.page.locator('#apply-test-icon').click()
        self.assertIn('sample-alternate.png',sailing.get_attribute('src'))
        self.assertEqual(self.snap()['roadmap']['edges'],before['roadmap']['edges'])
        self.assertEqual([n['position'] for n in self.snap()['roadmap']['nodes']],[n['position'] for n in before['roadmap']['nodes']])
        self.assertEqual([n['id'] for n in self.snap()['roadmap']['nodes']],[n['id'] for n in before['roadmap']['nodes']])
        self.page.locator('#test-icon-ref').select_option('test:missing')
        self.page.locator('#apply-test-icon').click()
        self.page.wait_for_function('''() => document.querySelector('[data-node-id="sailing"] img.node-icon').dataset.fallbackApplied==='true' ''')
        self.assertTrue(sailing.get_attribute('src').startswith('data:image/svg+xml,'))
        self.assertEqual(sailing.evaluate('(e)=>e.naturalWidth'),64)
        self.assertEqual(self.page.locator('.node-card').count(),7)
        self.assertEqual(self.page.locator('g.edge').count(),6)
        self.assertEqual(self.snap()['roadmap']['edges'],before['roadmap']['edges'])
        self.page.screenshot(path=str(EVIDENCE/'asset-spike-fallback.png'))

if __name__=='__main__':
    unittest.main(verbosity=2)
