import fs from 'node:fs';const edit=(file,fn)=>fs.writeFileSync(file,fn(fs.readFileSync(file,'utf8')));
edit('src/ui/cursor.js',s=>s.replace("import {configureProgressInput} from '../progress-input.js';","import {catalogPicker} from './catalog.js';")
.replace(/ progressFields\(form,n\)\{[\s\S]*? create\(position,anchor,target=this.viewport\)\{/,` goalFields(form,n,{creation=false}={}){
  const title=this.field(form,'Title','cursor-title',n.title??''),category=this.field(form,'Category','cursor-category',n.category??'custom','text',CATEGORIES.map(x=>[x,x]));title.maxLength=150;
  const status=this.field(form,'Manual status','cursor-status',n.status??'not_started','text',STATUSES.map(k=>[k,STATUS_LABELS[k]]));
  const catalogRef=creation?catalogPicker(form,{prefix:'cursor',selected:n.catalogRef,apply:record=>{if(title.value&&title.value!==record.title&&!window.confirm('Replace the entered title/category with this catalog reference?'))return false;title.value=record.title;category.value=record.category;}}):{value:n.catalogRef??''};return {title,category,status,catalogRef};
 }
 goalValues(fields){return {title:fields.title.value,category:fields.category.value,status:fields.status.value,catalogRef:fields.catalogRef.value||null};}
 status(id,anchor,target){const n=this.goal(id);this.form('Change manual status',anchor,target,form=>({status:this.field(form,'Manual status','cursor-status',n.status,'text',STATUSES.map(k=>[k,STATUS_LABELS[k]]))}),fields=>this.run(d=>bulkAction(d,[id],{kind:'status',status:fields.status.value})));}
 create(position,anchor,target=this.viewport){`)
.replace(/  this.form\(mode==='rename'\?'Rename goal'[\s\S]*?\n \}\n editConnection/,`  this.form('Rename goal',anchor,target,form=>({title:this.field(form,'Title','cursor-title',n.title)}),fields=>this.run(d=>editNode(d,id,{...d.roadmap.nodes.find(n=>n.id===id),title:fields.title.value})),{kind:'goal',payload:fields=>({id,fields:{title:fields.title.value}})});
 }
 editConnection`)
.replace("add('Edit counters…',()=>this.editGoal(context.id,'counters'));",'')
);
edit('src/ui/inspector.js',s=>s.replace("import {configureProgressInput} from '../progress-input.js';","import {catalogPicker} from './catalog.js';")
.replace(",get('goal-current'),get('goal-target')",",get('goal-catalog-ref')")
.replace(/ const current=input\('goal-current'[\s\S]*? const error=el/,` const error=el`)
.replace("progress:current.value===''&&target.value===''?null:{current:current.value===''?NaN:Number(current.value),target:target.value===''?NaN:Number(target.value)}","progress:n.progress??null,catalogRef:catalogRef?.value||n.catalogRef||null")
.replace("const save=btn('Save goal'","let catalogRef;const save=btn('Save goal'")
.replace(/ \.\.\.field\('Current counter[\s\S]*? \.\.\.field\('Icon reference/,' ...field(\'Icon reference')
.replace("(bundled local test assets only)","(original local symbols)")
.replace("if(existing){this.root.append(btn('Delete goal…'",`if(!existing)catalogRef=catalogPicker(this.root,{prefix:'goal',selected:n.catalogRef,apply:record=>{if(title.value&&title.value!==record.title&&!window.confirm('Replace the entered title/category with this catalog reference?'))return false;title.value=record.title;category.value=record.category;}});
 if(existing){this.root.append(btn('Delete goal…'`)
);
edit('src/ui/graph.js',s=>s.replace("if(this.density==='detailed')text.append(el('span','node-subtitle',`${STATUS_LABELS[n.status]}${n.progress?` · ${n.progress.current}/${n.progress.target}`:''}`));",'')
.replace("root.append(pin,body,pout);",`root.append(pin,body,pout);const statusButton=el('button','status-control',STATUS_LABELS[n.status]+' ▾');statusButton.type='button';statusButton.title='Change manual status';statusButton.setAttribute('aria-label',\`Status: \${STATUS_LABELS[n.status]}. Change status for \${n.title}\`);statusButton.addEventListener('pointerdown',e=>e.stopPropagation());statusButton.addEventListener('keydown',e=>e.stopPropagation());statusButton.addEventListener('dblclick',e=>e.stopPropagation());statusButton.addEventListener('click',e=>{e.stopPropagation();const r=statusButton.getBoundingClientRect();this.onStatus?.(n.id,{x:r.left,y:r.bottom},statusButton);});root.append(statusButton);`)
.replace("${rep.progress?` · ${rep.progress.current}/${rep.progress.target}`:''}",'')
);
edit('src/ui/board.js',s=>s.replace("if(goal.progress)card.append(el('p',`Counter: ${goal.progress.current} / ${goal.progress.target}`));",''));
edit('src/ui/labels.js',s=>s.replace(' Counters never set completion.',''));
edit('src/main.js',s=>s.replace("graph.onNodeEdit=", "graph.onStatus=(id,anchor,target)=>cursor.status(id,anchor,target);graph.onNodeEdit="));
edit('index.html',s=>s.replaceAll('PHASE 4','PHASE 5').replaceAll('Phase 4','Phase 5').replaceAll('Counters and positions stay unchanged.','Positions stay unchanged.').replaceAll(' and counters','').replaceAll('hidden group members and counters','hidden group members').replaceAll('manual statuses, counters, positions','manual statuses, positions'));
edit('src/style.css',s=>s+`\n/* Phase 5: shared parchment-and-brass palette; original category symbols only. */
:root{--brass:#dbc180;--parchment:#eee4c9;--stone:#292b28}.board-card,dialog,.node-card{border-color:#8b805e;color:var(--parchment)}dialog{background:#242922}.canvas-top button[aria-pressed="true"],#cursor-dialog #cursor-submit{background:var(--brass)}.status-control{position:absolute;right:6px;bottom:3px;z-index:6;border:1px solid #a49769;border-radius:4px;background:#30382e;color:#eee4c9;font:700 9px system-ui;padding:2px 6px;cursor:pointer}.node-body{padding-bottom:25px}.compact .node-body{padding-top:4px;padding-bottom:20px}.catalog-results{max-height:200px;overflow:auto;margin:8px 0}.catalog-results button{display:block;width:100%;text-align:left}.catalog-results p{font-size:11px}#cursor-dialog details input,#cursor-dialog details select{width:100%;padding:8px;background:#29342e;color:#eee4c9;border:1px solid #847959;margin:4px 0}dialog button,.board-card select,.board-card>button{border-color:#a49769;background:#30382e;color:#eee4c9}
`);
