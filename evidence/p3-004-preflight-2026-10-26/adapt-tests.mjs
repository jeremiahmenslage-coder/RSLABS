import fs from 'node:fs';
for(const file of ['phase2','phase3','bulk','cursor']){
 const p=`tests/browser_${file}.mjs`;let s=fs.readFileSync(p,'utf8');
 s=s.replace("const selectNode=async id=>{const n=page.locator(`[data-node-id=\"${id}\"]`);await n.focus();await n.press('Enter');};", "const selectNode=async id=>{const n=page.locator(`[data-node-id=\"${id}\"]`);await n.focus();await n.press('Enter');await n.press('Shift+F10');await page.locator('#cursor-dialog').getByRole('menuitem',{name:'Open details',exact:true}).click();};");
 // Expanded disclosures are an explicit alternate-access step, not a removed assertion.
 s=s.replace('const snapshot=()',`async function reveal(selector){const target=page.locator(selector);for(const detail of await target.locator('xpath=ancestor::details').all()){if(!await detail.getAttribute('open').then(v=>v!==null))await detail.locator(':scope > summary').click();}return target;}\nconst snapshot=()`);
 const ids=['test-fail-save','completed-visibility','navigation-root','navigation-direction','focus','highlight','exit-navigation','reset-view','bulk-status','bulk-set-status','bulk-create-group','bulk-group','bulk-add-group','bulk-ungroup'];
 for(const id of ids)s=s.replaceAll(`page.locator('#${id}').click()`,`(await reveal('#${id}')).click()`).replaceAll(`page.locator('#${id}').selectOption(`,`(await reveal('#${id}')).selectOption(`);
 if(file==='cursor')s=s.replace("await body('a').click();await page.locator('#goal-notes')","await rightGoal('a');await item('Open details').click();await page.locator('#goal-notes')").replace('Change type: ORDER','Change type: Preferred order');
 fs.writeFileSync(p,s);
}
