import fs from 'node:fs';
function update(file,fn){fs.writeFileSync(file,fn(fs.readFileSync(file,'utf8')));}
update('src/ui/cursor.js',s=>{
 s=s.replace("import {catalogPicker} from './catalog.js';","import {categoryIconPreview} from './category-icon.js';");
 const a=s.indexOf('  const catalogRef=creation?catalogPicker'),b=s.indexOf('\n }',a);
 s=s.slice(0,a)+"  categoryIconPreview(form,category);return {title,category,status,catalogRef:{value:n.catalogRef??''}};"+s.slice(b);
 const start=s.indexOf("  this.form('Create goal here',anchor,target,form=>{"),end=s.indexOf('\n   fields=>',start);
 s=s.slice(0,start)+"  this.form('Create goal here',anchor,target,form=>this.goalFields(form,{category:'custom',status:'not_started'}),"+s.slice(end);
 return s;
});
update('src/ui/inspector.js',s=>{
 s=s.replace("import {catalogPicker} from './catalog.js';","import {categoryIconPreview} from './category-icon.js';").replace("import {POC_ICON_OPTIONS} from '../assets/resolve.js';\n",'').replace("import {referenceCatalog} from '../catalog/reference.js';\n",'');
 s=s.replace(",get('goal-icon')",'').replace(",get('goal-catalog-ref')",'');
 const start=s.indexOf(' const icons='),end=s.indexOf(' const status=',start);s=s.slice(0,start)+s.slice(end);
 s=s.replace(" let catalogRef;const save=",' const save=');
 s=s.replace("iconOverride:icon.value==='__keep_existing'?n.iconOverride:icon.value==='auto'?null:icon.value",'iconOverride:n.iconOverride??null').replace("catalogRef:catalogRef?(catalogRef.value||null):(n.catalogRef??null)",'catalogRef:n.catalogRef??null');
 s=s.replace(" ...field('Icon reference (original local symbols)',icon),error,save,cancel);"," error,save,cancel);\n categoryIconPreview(this.root,category);");
 const a=s.indexOf(' if(!existing)catalogRef=catalogPicker'),b=s.indexOf('\n else title.focus()',a);
 s=s.slice(0,a)+" if(existing)this.root.append(btn('Delete goal…',()=>this.api.deleteNode(existing.id),'danger'),el('div',`Node ID: ${existing.id}`,'inspector-detail'));"+s.slice(b);
 return s;
});
update('src/ui/graph.js',s=>s.replace("icon.alt='';icon.draggable=false;","icon.alt='';icon.title=resolved.description;icon.draggable=false;"));
update('src/ui/board.js',s=>s.replace("image.alt='';image.className", "image.alt='';image.title=asset.description;image.className"));
update('index.html',s=>s.replace('Creation opens catalog search with a direct Create custom goal option.','Creation is manual: title, category and manual status; More details is optional. Category markers are shared across views; Inventory and Achievement Diary symbols are unavailable in the reviewed pinned exports and use an original fallback.').replace('Catalog sources, icon licenses and coverage gaps','Artwork sources, inactive catalog and coverage gaps').replace('Open details for notes, icons and grouping.','Open details for notes and grouping. Inspector Cancel discards the form and closes; merely hiding details preserves drafts.'));
for(const file of ['tests/assets.test.mjs','tests/artwork.test.mjs','tests/phase5.test.mjs'])update(file,s=>s.replace('iconAssets,resolveNodeIcon','iconAssets,resolveIndividualIcon as resolveNodeIcon').replace('{resolveNodeIcon}', '{resolveIndividualIcon as resolveNodeIcon}').replace("test('catalog default icon", "test('inactive catalog default icon").replace("test('demo icon override", "test('inactive demo icon override").replace("test('authentic defaults", "test('inactive authentic defaults"));
fs.appendFileSync('src/style.css','\n.category-preview{display:flex;align-items:center;gap:8px;margin:12px 0;font-size:12px;color:var(--muted,#c8c1aa)}\n');
fs.appendFileSync('DECISIONS.md',`\n\n## ADR-026: P5-003 manual creation/category markers — 2026-10-27\n\nDirect Owner ticket supersedes earlier unsent drafts and P5-002 active catalog/individual artwork UI: manual title/category/status creation, optional details; no active catalog discovery or individual-icon controls; saved references/overrides/counters retained but presentation uses category only. Archive records/assets/tooling/provenance/notices in place as inactive. Genuine Combat, Minigame, Quest, Skills, Prayer symbols are available in the previously pinned Dava96 exports; Inventory and Achievement Diary are not found in those reviewed exports, so disclose original fallbacks instead of unrelated substitutes. Custom uses a neutral original marker. No migration/dependencies/runtime APIs; dictionary and Phase 6 unauthorized. Owner-provided private-planner Jagex permission remains not independently verified with no broader distribution rights implied. Phase 5 acceptance pending; stop for independent reviewer/CEO review before Owner acceptance.\n`);
update('docs/agents/CURRENT_PHASE_GATE.md',s=>s.replace('Replacement P5-002 authorized/in progress','P5-003 authorized/in progress').replace('ADR-025. Owner-provided','ADR-026. Owner-provided').replace('P5-002 is authorized within the replacement ticket','P5-003 is authorized within the manual-creation/category-marker ticket'));
