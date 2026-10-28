import fs from 'node:fs';
for(const file of ['phase2','phase3','bulk','cursor']){const p=`tests/browser_${file}.mjs`;let s=fs.readFileSync(p,'utf8');
 s=s.replace('await saved();};','await saved();};');
 if(file==='phase3')s=s.replace("await card.press('Enter');};","await card.press('Enter');await card.press('Shift+F10');await page.locator('#cursor-dialog').getByRole('menuitem',{name:'Open details',exact:true}).click();};").replace('Incoming · HARD','Incoming · Required prerequisite').replace('Outgoing · ORDER','Outgoing · Preferred order');
 if(file==='cursor')s=s.replace("async function rightEmpty(){const p=await emptyPoint();", "async function rightEmpty(){if(await page.locator('#details-panel').isVisible())await page.locator('#inspector-toggle').click();const p=await emptyPoint();").replace("return {x:r.x+r.width-25,y:r.y+r.height-30};","return {x:Math.floor(r.x+r.width-25),y:Math.floor(r.y+r.height-30)};");
 fs.writeFileSync(p,s);
}
