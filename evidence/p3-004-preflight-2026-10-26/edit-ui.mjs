import fs from 'node:fs';
const edit=(path,fn)=>fs.writeFileSync(path,fn(fs.readFileSync(path,'utf8')));
edit('src/main.js',s=>s.replace("import {CursorUI}","import {wireWorkspace} from './ui/workspace.js';\nimport {CursorUI}")
.replace('bulk,cursor,bootBlocked','bulk,cursor,workspace,bootBlocked')
.replace("$('connect-selected').disabled=pair.length!==2;","$('connect-selected').disabled=pair.length!==2;$('connect-selected').hidden=pair.length!==2;")
.replace("if(inspectorRefresh){if(selected?.type==='node')inspector.node(current(),selected.id);else if(selected?.type==='edge')inspector.edge(current(),selected.id);else if(selected?.type==='group')inspector.group(current(),selected.id);else inspector.reset();}","$('empty-guidance').hidden=current().roadmap.nodes.length>0;\n if(inspectorRefresh&&!inspector.hasUnsaved()){const id=inspector.draft?.id;if(inspector.mode==='node'&&current().roadmap.nodes.some(n=>n.id===id))inspector.node(current(),id);else if(inspector.mode==='edge')inspector.edge(current(),id);else if(inspector.mode==='group')inspector.group(current(),id);else if(!['create','connect'].includes(inspector.mode))inspector.reset();}")
.replace(/function onNode\(id,shift\)\{[\s\S]*?function persistViewport/,'function onNode(id,shift){\n regionSelection=[];if(shift){if(!pair.length)pair=[id];else if(pair[0]!==id)pair=[pair[0],id];}else pair=[id];selected={type:"node",id};refresh();\n}\nfunction onEdge(id){regionSelection=[];selected={type:"edge",id};pair=[];refresh();}\nfunction openGroup(id){if(!inspector.confirmLeave())return;selected=id?{type:"group",id}:null;pair=[];refresh();inspector.group(current(),id);workspace.open();}\nfunction persistViewport')
.replace('function linkStart(e,id){if(!inspector.confirmLeave())return;','function linkStart(e,id){')
.replace('if(Math.abs(end.x-g.start.x)<4||Math.abs(end.y-g.start.y)<4)return;','if(Math.abs(end.x-g.start.x)<4||Math.abs(end.y-g.start.y)<4){clearSelection();return;}')
.replace("if(moved){if(!inspector.confirmLeave()){refresh();return;}regionSelection=[];selected={type:'node',id:g.id};pair=[g.id];safely(()=>commit(d=>moveNode(d,g.id,g.preview)),null);refresh();inspector.node(current(),g.id);}","if(moved){regionSelection=[];selected={type:'node',id:g.id};pair=[g.id];safely(()=>commit(d=>moveNode(d,g.id,g.preview),{refreshInspector:false}),null);refresh();}")
.replace("else if(g.type==='pan')persistViewport();","else if(g.type==='pan'){if(Math.abs(e.clientX-g.startX)<4&&Math.abs(e.clientY-g.startY)<4)clearSelection();else persistViewport();}")
.replace('function wireControls(){','function wireControls(){\n workspace=wireWorkspace({prepare(){if(inspector.hasUnsaved())return;if(selected?.type===\'node\')inspector.node(current(),selected.id);else if(selected?.type===\'edge\')inspector.edge(current(),selected.id);}});\n graph.onNodeEdit=(id,anchor,target)=>cursor.editGoal(id,\'all\',anchor,target);graph.onEdgeEdit=(id,anchor,target)=>cursor.editConnection(id,anchor,target);')
.replace("if(!inspector.confirmLeave())return null;regionSelection=[];pair=[];","if(!inspector.confirmLeave())return null;workspace.open();regionSelection=[];pair=[];")
.replace("inspector.edge(current(),payload.id);return $('edge-kind');","inspector.edge(current(),payload.id,payload.fields??null);return $('edge-kind');")
.replace("cancel(){if(selected?.type==='node'&&current().roadmap.nodes.some(n=>n.id===selected.id)){inspector.node(current(),selected.id);notice('Unsaved form changes discarded.');}else if(selected?.type==='group'){inspector.group(current(),selected.id);}","cancel(){const id=inspector.draft?.id;if(inspector.mode==='node'&&current().roadmap.nodes.some(n=>n.id===id)){inspector.node(current(),id);notice('Unsaved form changes discarded.');}else if(inspector.mode==='group'&&id){inspector.group(current(),id);}")
);
edit('src/ui/graph.js',s=>"import {RELATIONSHIP_LABELS} from './labels.js';\n"+s
.replace("root.addEventListener('keydown'", "root.addEventListener('dblclick',e=>{if(e.target.closest('.port'))return;e.stopPropagation();this.onNodeEdit?.(n.id,{x:e.clientX,y:e.clientY},root);});\n root.addEventListener('keydown'")
.replace("g.addEventListener('keydown'","g.addEventListener('dblclick',e=>{e.stopPropagation();this.onEdgeEdit?.(e.id,{x:e.clientX,y:e.clientY},g);});\n g.addEventListener('keydown'")
.replace('${e.kind}`','${RELATIONSHIP_LABELS[e.kind]}`')
.replace('txt.textContent=e.kind.toUpperCase();',"txt.textContent={hard:'Required',soft:'Recommended',order:'Order'}[e.kind];txt.setAttribute('font-size','8');const tooltip=svgNode('title');tooltip.textContent=RELATIONSHIP_LABELS[e.kind];g.append(tooltip);"));
edit('src/ui/inspector.js',s=>"import {RELATIONSHIP_LABELS} from './labels.js';\n"+s.replace("Click a goal or connection to edit it.","Select a goal or connection, then open details; double-click for quick editing.")
.replace('edge(doc,id){','edge(doc,id,draft=null){').replace("{hard:'Hard prerequisite',soft:'Soft preparation',order:'Preferred order'}[k]","RELATIONSHIP_LABELS[k]").replace('),edge.kind);', '),draft?.kind??edge.kind);').replace('[k,k.toUpperCase()]','[k,RELATIONSHIP_LABELS[k]]'));
edit('src/ui/bulk.js',s=>s.replace("const count=selection().length;","const count=selection().length;$('bulk-toolbar').hidden=!count;"));
edit('index.html',s=>s
.replace('<button id="connect-selected" disabled>','<button id="connect-selected" hidden disabled>')
.replace('<div class="rule"></div><div class="section-caption">GRAPH SCOPE</div>','<details id="view-controls"><summary>View</summary><div class="section-caption">GRAPH SCOPE</div>')
.replace('<div class="rule"></div><div class="section-caption">SAVE STATUS</div><div id="save-state" class="save-indicator" role="status" data-state="idle">Opening storage…</div><button id="retry-save" hidden>Retry failed save</button>', '</details><details id="help-controls"><summary>Help / Diagnostics</summary><h3>Controls</h3><p class="guide">Click to select. Double-click to quick edit or create. Empty click clears selection; drag pans. Shift-drag selects full cards. Shift-click pairs a destination. Escape cancels quick editors or clears selection. Right-click or Shift+F10 opens contextual actions. Open details for notes, icons and grouping. Panel resizing never moves goals.</p>')
.replace('Hard prerequisite</strong>','Required prerequisite</strong>').replace('Soft preparation</strong>','Recommended preparation</strong>')
.replace('Click an edge to change its type or delete it.</p></aside>','Double-click an edge to edit its type or direction.</p></details></aside>')
.replace('<section id="bulk-toolbar" class="bulk-toolbar"','<div class="save-strip"><div id="save-state" class="save-indicator" role="status" data-state="idle">Opening storage…</div><button id="retry-save" hidden>Retry failed save</button></div><section id="bulk-toolbar" hidden class="bulk-toolbar"')
.replace('<div class="bulk-actions"><label','<div class="bulk-actions"><details><summary>Status</summary><label')
.replace('<button id="bulk-create-group"','</details><details><summary>Group</summary><button id="bulk-create-group"')
.replace('<button id="bulk-ungroup"','</details><details><summary>More</summary><button id="bulk-ungroup"')
.replace('Ungroup…</button></div></section>','Ungroup…</button></details></div></section>')
.replace('<div class="canvas-watermark">','<div id="empty-guidance" class="empty-guidance">Start your roadmap<br><small>Double-click empty canvas or right-click → Create goal here.</small></div><div class="canvas-watermark">')
.replace('<aside class="right">','<button id="inspector-toggle" class="inspector-toggle" aria-controls="details-panel" aria-expanded="false" title="Open or close detailed inspector; preserves unsaved draft">‹ Open details</button><aside id="details-panel" class="right" hidden><div id="panel-resize" role="separator" tabindex="0" aria-label="Resize details panel" aria-orientation="vertical" title="Drag or use arrow keys to resize"></div>')
);
edit('src/style.css',s=>s+`\n/* P3-004: optional overlay details never resize or refit the graph. */
.app{grid-template-columns:250px minmax(320px,1fr)}
.right{position:fixed;right:0;top:76px;bottom:0;width:340px;max-width:calc(100vw - 60px);z-index:30;background:#20262b;box-shadow:-8px 0 20px #0006;box-sizing:border-box}
.inspector-toggle{position:fixed;right:0;top:80px;z-index:31;padding:8px;background:#33454d;color:#f0e7cd;border:1px solid #89999a;border-radius:5px;cursor:pointer}
#panel-resize{position:absolute;left:0;top:0;bottom:0;width:7px;cursor:ew-resize;background:#89999a33}#panel-resize:focus-visible{background:#9de6fa}
.save-strip{display:flex;align-items:center;gap:10px;padding:5px 12px;background:#19272b;flex:none}.save-strip .save-indicator{margin:0;flex:1;font-size:11px;padding:6px}.save-strip button{padding:7px}
.left details{margin:12px 0}.left summary,.bulk-actions summary{cursor:pointer;font-weight:700;color:#e3ce9a;padding:8px}.left details button{width:100%;padding:9px;margin:4px 0;background:#303a40;color:#eee;border:1px solid #59676b;border-radius:5px}
.bulk-actions details{position:relative}.bulk-actions details[open]{border:1px solid #64777f;padding:5px}.bulk-heading span{font-size:10px}.bulk-actions{align-items:flex-start}
.empty-guidance{position:absolute;top:40%;left:20%;right:15%;text-align:center;pointer-events:none;color:#c2bc9d;font-size:22px;line-height:1.7}.empty-guidance small{font-size:13px}
#cursor-dialog details{margin-top:10px}#cursor-dialog summary{cursor:pointer;padding:6px;color:#e3ce9a}button:focus-visible,summary:focus-visible{outline:2px solid #9de6fa;outline-offset:2px}
`);
