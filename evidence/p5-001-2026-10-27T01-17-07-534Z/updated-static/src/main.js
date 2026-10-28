import {wireBoard} from './ui/board.js';
import {newFixture} from './fixture.js';
import {graphSignature} from './model.js';
import {optimizeGraph,layoutKey} from './layout/elk.js';
import {emptyRoadmap,createNode,editNode,deleteNode,moveNode,connect,editEdge,deleteEdge,withPositions,toggleGroup,displayPreference} from './model/actions.js';
import {RoadmapStore} from './state/store.js';
import {openDatabase,readDocument,writeDocument,readValidated,SaveCoordinator} from './storage/indexeddb.js';
import {GraphView} from './ui/graph.js';
import {Inspector} from './ui/inspector.js';
import {wireBackup} from './ui/backup.js';
import {saveGroup,deleteGroup} from './model/groups.js';
import {wireOrganization} from './ui/organization.js';
import {projectGraph} from './projection.js';
import {enclosedCards,selectionRect,visibleSelection} from './selection.js';
import {bulkAction} from './model/bulk.js';
import {wireBulk} from './ui/bulk.js';
import {wireWorkspace} from './ui/workspace.js';
import {CursorUI} from './ui/cursor.js';
const $=id=>document.getElementById(id),notice=(message,kind='info')=>{$('status').textContent=message;$('status').dataset.kind=kind;};
let store,db,saver,selected=null,pair=[],regionSelection=[],gesture=null,inspector,graph,organization,bulk,cursor,workspace,board,bootBlocked=false,failNextWrite=false,importApplying=false,importLocked=false;
const current=()=>store.current;
function updateButtons(){const validPair=pair.length===2&&pair[0]!==pair[1]&&pair.every(id=>current().roadmap.nodes.some(n=>n.id===id));$('undo').disabled=!store.undoStack.length;$('redo').disabled=!store.redoStack.length;$('connect-selected').disabled=!validPair;$('connect-selected').hidden=!validPair||current().preferences.lastView==='board';$('selection-readout').hidden=current().preferences.lastView==='board';
 $('selection-readout').textContent=pair.length===2?`${title(pair[0])} → ${title(pair[1])}`:pair.length===1?`Source: ${title(pair[0])} · Shift-click destination`:'Click source, then Shift-click destination';
 const g=current().roadmap.groups.find(g=>g.id===$('group-picker').value)??current().roadmap.groups[0];$('collapse').disabled=!g;$('collapse').textContent=g?.collapsed?'⊞ Expand selected group':'⊟ Collapse selected group';$('density').textContent=current().preferences.nodeDensity==='detailed'?'▤ Compact nodes':'▣ Detailed nodes';}
function title(id){return current().roadmap.nodes.find(n=>n.id===id)?.title||'Unknown';}
function refresh({inspectorRefresh=false}={}){regionSelection=visibleSelection(regionSelection,projectGraph(current()).nodes);graph.setDocument(current(),{selected,pair,regionSelection});$('node-count').textContent=current().roadmap.nodes.length;$('edge-count').textContent=current().roadmap.edges.length;
 $('roadmap-title').textContent=current().roadmap.title;organization?.update();bulk?.update();updateButtons();updateView();
 $('empty-guidance').hidden=current().roadmap.nodes.length>0;
 if(inspectorRefresh&&!inspector.hasUnsaved()){const id=inspector.draft?.id;if(inspector.mode==='node'&&current().roadmap.nodes.some(n=>n.id===id))inspector.node(current(),id);else if(inspector.mode==='edge')inspector.edge(current(),id);else if(inspector.mode==='group')inspector.group(current(),id);else if(!['create','connect'].includes(inspector.mode))inspector.reset();}}
function updateView(){const isBoard=current().preferences.lastView==='board';$('graph-surface').hidden=isBoard;$('board-surface').hidden=!isBoard;for(const el of document.querySelectorAll('[data-graph-only]'))el.hidden=isBoard;if(isBoard)$('bulk-toolbar').hidden=true;$('view-graph').setAttribute('aria-pressed',String(!isBoard));$('view-board').setAttribute('aria-pressed',String(isBoard));$('view-title').textContent=isBoard?'Daily task board':'Editable progression';board?.update();}
function setSaveState(state,details=''){$('save-state').dataset.state=state;$('save-state').textContent={idle:'Ready (no edits yet)',pending:'Unsaved changes · pending',saving:'Saving to IndexedDB…',saved:'Saved to this browser',failed:'SAVE FAILED — changes only in memory',unavailable:'STORAGE UNAVAILABLE'}[state]||state;
 if(state==='import_failed')$('save-state').textContent='IMPORT FAILED — active roadmap unchanged';
 $('retry-save').hidden=state!=='failed';if(state==='failed')notice(`Autosave failed: ${details}. Last committed copy is preserved. Retry before reloading.`, 'error');}
function commit(transform,{immediate=true,refreshInspector=true}={}){try{const changed=store.command(transform);if(changed){if(refreshInspector)refresh({inspectorRefresh:true});if(immediate)saver.flush();notice('Roadmap updated. Autosave queued.');}return changed;}catch(error){notice(`Action rejected: ${error.message}`,'error');throw error;}}
function safely(fn,errorTarget){try{return fn();}catch(error){if(errorTarget)errorTarget.textContent=error.message;else notice(error.message,'error');return false;}}
function resolveEditorDiscard(){if(!inspector.confirmLeave())return false;if(inspector.hasUnsaved())inspector.reset();return true;}
function onNode(id,shift){
 regionSelection=[];if(shift){if(!pair.length)pair=[id];else if(pair[0]!==id)pair=[pair[0],id];}else pair=[id];selected={type:"node",id};refresh();
}
function onEdge(id){regionSelection=[];selected={type:"edge",id};pair=[];refresh();}
function openGroup(id){if(!inspector.confirmLeave())return;selected=id?{type:"group",id}:null;pair=[];refresh();inspector.group(current(),id);workspace.open();}
function persistViewport(){if(!store||bootBlocked||importLocked)return;store.pref(d=>displayPreference(d,p=>{p.viewport=graph.getViewport();}));}
function enterNewGoal(position,anchor){if(!store||bootBlocked||!cursor)return;cursor.create({x:Math.round(position.x),y:Math.round(position.y)},anchor??{x:innerWidth/2,y:innerHeight/2});}
function dragStart(e,id){if(gesture)return;const node=current().roadmap.nodes.find(n=>n.id===id);if(!node)return;gesture={type:'node',id,startX:e.clientX,startY:e.clientY,original:{...node.position},preview:{...node.position},shiftKey:e.shiftKey};}
function linkStart(e,id){regionSelection=[];refresh();gesture={type:'link',sourceId:id,startX:e.clientX,startY:e.clientY};graph.gestureFrom({x:e.clientX,y:e.clientY},e.clientX,e.clientY);notice(`Creating directed connection from ${title(id)}. Release on destination's left ● handle.`);}
function regionPoint(e){const r=$('viewport').getBoundingClientRect();return {x:Math.max(r.left,Math.min(r.right,e.clientX)),y:Math.max(r.top,Math.min(r.bottom,e.clientY))};}
function clearSelection(){regionSelection=[];selected=null;pair=[];if(gesture?.type==='region')gesture=null;graph.clearGesture();refresh();notice('Selection cleared. Editor drafts are unchanged.');}
function panStart(e){if(gesture||importLocked||!store)return;
 if(e.shiftKey){e.preventDefault();const point=regionPoint(e);gesture={type:'region',start:point,end:point};$('viewport').setPointerCapture(e.pointerId);graph.selectionFrom(point,point);return;}
 gesture={type:'pan',startX:e.clientX,startY:e.clientY,x:graph.tx,y:graph.ty};}
window.addEventListener('pointermove',e=>{if(!gesture||!graph)return;const g=gesture;if(g.type==='node'){
 g.preview={x:Math.round(g.original.x+(e.clientX-g.startX)/graph.zoom),y:Math.round(g.original.y+(e.clientY-g.startY)/graph.zoom)};graph.previewPosition(g.id,g.preview);
 }else if(g.type==='pan'){graph.tx=g.x+e.clientX-g.startX;graph.ty=g.y+e.clientY-g.startY;graph.transform();}else if(g.type==='link'){graph.gestureFrom({x:g.startX,y:g.startY},e.clientX,e.clientY);}else if(g.type==='region'){g.end=regionPoint(e);graph.selectionFrom(g.start,g.end);}});
window.addEventListener('pointerup',e=>{if(!gesture||!store)return;const g=gesture;gesture=null;graph.clearGesture();if(g.type==='region'){
 const end=regionPoint(e);if(Math.abs(end.x-g.start.x)<4||Math.abs(end.y-g.start.y)<4){clearSelection();return;}
 // Actual rendered border boxes already include zoom, pan and any viewport scrolling.
 const cards=[...graph.nodes.children].map(card=>{const r=card.getBoundingClientRect();return {id:card.dataset.nodeId,x:r.left,y:r.top,w:r.width,h:r.height};});
 regionSelection=enclosedCards(cards,selectionRect(g.start,end));
 selected=null;pair=[];refresh();notice(`${regionSelection.length} explicit goal(s) selected. Choose a bulk action above the canvas.`);return;
 }if(g.type==='node'){
 const moved=g.preview.x!==g.original.x||g.preview.y!==g.original.y;
 if(moved){regionSelection=[];selected={type:'node',id:g.id};pair=[g.id];safely(()=>commit(d=>moveNode(d,g.id,g.preview),{refreshInspector:false}),null);refresh();}
 else onNode(g.id,g.shiftKey);}
 else if(g.type==='pan'){if(Math.abs(e.clientX-g.startX)<4&&Math.abs(e.clientY-g.startY)<4)clearSelection();else persistViewport();}else if(g.type==='link'){
 const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.in-port')?.closest('[data-node-id]')?.dataset.nodeId;
 if(!target){notice('Connection canceled. Release over the destination’s left ● handle.');return;}
 selected=null;pair=[g.sourceId,target];refresh();cursor.connection(g.sourceId,target,{x:e.clientX,y:e.clientY},$('viewport'));notice('Review source → destination and type; Create commits, Cancel makes no connection.');
 }});
window.addEventListener('pointercancel',()=>{gesture=null;graph?.clearGesture();if(store){graph.render();refresh();}});
function startInspector(){inspector=new Inspector($('inspector'),{
 saveGroup(id,fields,error){safely(()=>{commit(d=>saveGroup(d,id,fields));const groupId=id??current().roadmap.groups.at(-1).id;selected={type:'group',id:groupId};refresh();inspector.group(current(),groupId);},error);},
 deleteGroup(id){if(!window.confirm('Delete this visual group and ungroup its members? All goals and connections are retained.'))return;safely(()=>{commit(d=>deleteGroup(d,id));selected=null;refresh({inspectorRefresh:true});});},
 toggleGroup(id){if(inspector.confirmLeave())safely(()=>commit(d=>toggleGroup(d,id)));},inspectGroup:id=>organization.inspectGroup(id),
 saveNode(id,fields,position,error){safely(()=>{commit(d=>id?editNode(d,id,fields):createNode(d,fields,position));if(!id){const n=current().roadmap.nodes.at(-1);id=n.id;}selected={type:'node',id};pair=[id];refresh();inspector.node(current(),id);notice('Goal saved in roadmap; durable autosave running.');},error);},
 cancel(){const id=inspector.draft?.id;if(inspector.mode==='node'&&current().roadmap.nodes.some(n=>n.id===id)){inspector.node(current(),id);notice('Unsaved form changes discarded.');}else if(inspector.mode==='group'&&id){inspector.group(current(),id);}else{selected=null;pair=[];refresh();inspector.reset();notice('Canceled; no node created.');}},
 deleteNode(id){const n=current().roadmap.nodes.find(n=>n.id===id);if(!n)return;if(!window.confirm(`Delete "${n.title}" and ${current().roadmap.edges.filter(e=>e.sourceId===id||e.targetId===id).length} incident connection(s)? All other goals remain.`))return;safely(()=>{commit(d=>deleteNode(d,id));selected=null;pair=[];refresh();inspector.reset();});},
 editEdge(id,kind,error){safely(()=>{commit(d=>editEdge(d,id,kind));selected={type:'edge',id};refresh();inspector.edge(current(),id);},error);},
 deleteEdge(id){if(!window.confirm('Delete this directed connection? You can undo.'))return;safely(()=>{commit(d=>deleteEdge(d,id));selected=null;pair=[];refresh();inspector.reset();});},
 connect(source,target,kind,error){safely(()=>{commit(d=>connect(d,source,target,kind));const id=current().roadmap.edges.at(-1).id;selected={type:'edge',id};pair=[];refresh();inspector.edge(current(),id);},error);}
 });}
function wireControls(){
 board=wireBoard({current,preference:fn=>safely(()=>store.pref(d=>displayPreference(d,fn))),edit:(id,anchor,target)=>cursor.editGoal(id,'all',anchor,target),details:id=>{const focus=cursor.api.details('goal',{id});focus?.focus();},setStatus:(id,status)=>safely(()=>{const candidate=bulkAction(current(),[id],{kind:'status',status});if(!resolveEditorDiscard())return null;return commit(()=>candidate);})});
 for(const view of ['graph','board']){const button=$('view-'+view);button.disabled=false;button.addEventListener('click',()=>{if(importLocked||current().preferences.lastView===view)return;gesture=null;graph.clearGesture();graph.render();regionSelection=[];pair=[];selected=null;store.pref(d=>displayPreference(d,p=>{p.lastView=view;}));notice(view==='board'?'Board uses the same goals and manual status. Inspector draft preserved.':'Graph restored at its saved positions and viewport. Inspector draft preserved.');});}

 workspace=wireWorkspace({prepare(){if(inspector.hasUnsaved())return;if(selected?.type==='node')inspector.node(current(),selected.id);else if(selected?.type==='edge')inspector.edge(current(),selected.id);}});
 graph.onStatus=(id,anchor,target)=>cursor.status(id,anchor,target);graph.onNodeEdit=(id,anchor,target)=>cursor.editGoal(id,'all',anchor,target);graph.onEdgeEdit=(id,anchor,target)=>cursor.editConnection(id,anchor,target);
 bulk=wireBulk({current,selection:()=>regionSelection,clear:clearSelection,notice,apply:(ids,action)=>{
  const candidate=bulkAction(current(),ids,action);if(!resolveEditorDiscard())return null;return commit(()=>candidate);
 }});bulk.update();
 graph.onBeforeViewChange=()=>{if(gesture?.type==='region'){gesture=null;graph.clearGesture();}};
 organization=wireOrganization({current,openGroup,onEdge,preference:fn=>safely(()=>{store.pref(d=>displayPreference(d,fn));refresh();})});organization.update();
 $('group-picker').addEventListener('change',updateButtons);
 graph.onGroupEdit=openGroup;graph.onBoundary=summary=>summary.kind==='group'?organization.inspectGroup(summary.id):organization.boundary(summary.members,summary.title);
 graph.onCompletedExpand=id=>safely(()=>{store.pref(d=>displayPreference(d,p=>{p.expandedCompleted=[...new Set([...(p.expandedCompleted??[]),id])];}));refresh();});
 cursor=new CursorUI($('viewport'),{
  current,selection:()=>regionSelection,toggleGroup,
  beforeMenu(){gesture=null;graph.clearGesture();refresh();},
  run:transform=>{const candidate=transform(current());if(!resolveEditorDiscard())return null;return commit(()=>candidate);},
  created(id){selected={type:'node',id};regionSelection=[];pair=[id];refresh({inspectorRefresh:true});},
  connected(id){selected={type:'edge',id};regionSelection=[];pair=[];refresh({inspectorRefresh:true});},
  details(kind,payload){
   if(!inspector.confirmLeave())return null;workspace.open();regionSelection=[];pair=[];
   if(kind==='create'){selected=null;refresh();inspector.node(current(),null,payload.position,payload.fields);return $('goal-title');}
   if(kind==='connect'){selected=null;pair=[payload.sourceId,payload.targetId];refresh();inspector.connect(current(),payload.sourceId,payload.targetId,{kind:payload.kind});return $('link-kind');}
   selected={type:kind==='goal'?'node':kind,id:payload.id};if(kind==='goal')pair=[payload.id];refresh();
   if(kind==='goal'){inspector.node(current(),payload.id,null,payload.fields??null);return $('goal-title');}
   if(kind==='edge'){inspector.edge(current(),payload.id,payload.fields??null);return $('edge-kind');}
   inspector.group(current(),payload.id,payload.fields??null);return $('group-title');
  },
  bulk:(action,options)=>bulk.preview(action,options),
  focus(id,direction){store.pref(d=>displayPreference(d,p=>{p.navigation={mode:'focus',rootId:id,direction};}));refresh();},
  fit:()=>graph.fit(),resetFocus(){store.pref(d=>displayPreference(d,p=>{p.navigation={mode:'none',direction:'both',rootId:null};}));refresh();},
  expandCompleted:id=>graph.onCompletedExpand(id),canvasPosition:point=>graph.fromClient(point.x,point.y)
 });
 wireBackup({current,notice,lock:value=>{importLocked=value;gesture=null;graph.clearGesture();document.querySelector('.app').inert=value;},replace:async candidate=>{
  if(!inspector.confirmLeave())throw Error('Replacement canceled; unsaved editor draft retained.');
  await saver.replaceDurably(candidate,snapshot=>{importApplying=true;try{store.replace(snapshot);}finally{importApplying=false;}
   inspector.reset();selected=null;pair=[];regionSelection=[];graph.setViewport(snapshot.preferences.viewport);refresh({inspectorRefresh:true});});
 }});
 function history(direction){
  if(!(direction==='undo'?store.undoStack:store.redoStack).length)return;
  const mode=inspector.mode,id=inspector.draft?.id,view=current().preferences.lastView,filters=current().preferences.boardFilters;if(!resolveEditorDiscard())return;
  if(!store[direction]())return;store.pref(d=>displayPreference(d,p=>{p.lastView=view;if(filters===undefined)delete p.boardFilters;else p.boardFilters=structuredClone(filters);}));selected=null;pair=[];
  if(mode==='node'&&current().roadmap.nodes.some(n=>n.id===id))inspector.node(current(),id);
  else if(mode==='edge'&&current().roadmap.edges.some(e=>e.id===id))inspector.edge(current(),id);
  else if(mode==='group'&&current().roadmap.groups.some(g=>g.id===id))inspector.group(current(),id);
  else inspector.reset();refresh();notice(`${direction==='undo'?'Undo':'Redo'} applied. Changes are being saved.`);
 }
 $('undo').addEventListener('click',()=>history('undo'));
 $('redo').addEventListener('click',()=>history('redo'));
 $('new-roadmap').addEventListener('click',()=>{if(!window.confirm('Replace the active roadmap with a NEW EMPTY ROADMAP in this browser? This action is undoable until reload.'))return;
 safely(()=>{regionSelection=[];commit(()=>emptyRoadmap());selected=null;pair=[];refresh({inspectorRefresh:true});graph.fit();notice('New empty roadmap. Original demo remains available through Load demo.');});});
 $('load-demo').addEventListener('click',()=>{if(!window.confirm('Replace the active roadmap with a fresh copy of the seven-node demo? Undo is available until reload.'))return;
 safely(()=>{regionSelection=[];commit(()=>newFixture());selected=null;pair=[];refresh({inspectorRefresh:true});graph.fit();notice('Optional seven-node demonstration loaded; no automatic game prerequisites asserted.');});});
 $('optimize').addEventListener('click',async()=>{
  if(importLocked||!inspector.confirmLeave())return;const before=current(),key=layoutKey(before),signature=graphSignature(before);
  importLocked=true;gesture=null;graph.clearGesture();document.querySelector('.app').inert=true;notice('Optimizing layout with local ELK.js…');
  try{const layout=await optimizeGraph(before);if(key!==layoutKey(current()))throw Error('Roadmap changed during layout; no positions applied.');
   commit(d=>withPositions(d,layout.positions));if(signature!==graphSignature(current()))throw Error('Layout semantic preservation failure.');graph.fit();notice('Layout optimized. Only positions changed; Undo restores them. Drag any card to adjust.');
  }catch(error){notice(`Layout failed; existing positions retained: ${error.message}`,'error');}
  finally{importLocked=false;document.querySelector('.app').inert=false;persistViewport();}
 });
 $('density').addEventListener('click',()=>{safely(()=>{store.pref(d=>displayPreference(d,p=>{p.nodeDensity=p.nodeDensity==='compact'?'detailed':'compact';}));refresh();notice(`Density changed to ${current().preferences.nodeDensity}.`);});});
 $('collapse').addEventListener('click',()=>{if(!inspector.confirmLeave())return;const group=current().roadmap.groups.find(g=>g.id===$('group-picker').value)??current().roadmap.groups[0];if(group)safely(()=>{commit(d=>toggleGroup(d,group.id));selected=null;pair=[];refresh({inspectorRefresh:true});notice('Visual group toggle preserves all original edges.');});});
 $('connect-selected').addEventListener('click',()=>{if(pair.length===2){const r=$('connect-selected').getBoundingClientRect();cursor.connection(pair[0],pair[1],{x:r.right,y:r.top},$('connect-selected'));}});
 $('fit').addEventListener('click',()=>graph.fit());
 $('retry-save').addEventListener('click',()=>saver.retry());
 $('test-fail-save').addEventListener('click',()=>{failNextWrite=true;notice('Next IndexedDB write will fail intentionally. Make a change, then observe the SAVE FAILED state. Click Retry save to commit it.');});
 window.addEventListener('keydown',e=>{if(importLocked||document.querySelector('dialog[open]'))return;if(e.key==='Escape'){e.preventDefault();clearSelection();return;}if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)$('redo').click();else $('undo').click();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();$('redo').click();}});
}
async function start(){const root=$('viewport');graph=new GraphView({viewport:root,world:$('world'),edges:$('edges'),nodes:$('nodes'),groups:$('groups'),gesture:$('gesture'),scale:$('scale'),onNode,onEdge,onDragStart:dragStart,onLinkStart:linkStart,onPanStart:panStart,onDblClick:enterNewGoal});
 graph.onGroup=id=>{if(inspector.confirmLeave())safely(()=>{commit(d=>toggleGroup(d,id));selected=null;pair=[];refresh({inspectorRefresh:true});});};graph.onViewport=()=>persistViewport();
 startInspector();inspector.reset();setSaveState('idle');notice('Opening IndexedDB…');
 try{db=await openDatabase();const raw=await readDocument(db);const doc=readValidated(raw)||emptyRoadmap();store=new RoadmapStore(doc);
  saver=new SaveCoordinator({write:async snapshot=>{if(failNextWrite){failNextWrite=false;throw Error('Simulated write failure (no data changed on disk)');}await writeDocument(db,snapshot);},onStatus:setSaveState,delay:300});
  store.subscribe((snapshot,reason)=>{if(!importApplying)saver.enqueue(snapshot,{immediate:reason==='change'});refresh();});
  graph.setViewport(doc.preferences.viewport||{x:0,y:0,zoom:1});refresh();
  if(!raw) {graph.fit();notice('New empty roadmap. Double-click blank space to start or load the optional demonstration.');}
  else {saver.status('saved');notice('Recovered last committed roadmap from IndexedDB.');}
  wireControls();updateView();
 }catch(error){bootBlocked=true;setSaveState('unavailable');notice(`Cannot safely open saved roadmap: ${error.message}. Data was NOT reset or overwritten.`, 'error');$('startup-error').hidden=false;$('startup-error').textContent=`Storage initialization failed: ${error.message}. Close other tabs or use the same localhost origin. No destructive reset was attempted.`;document.querySelectorAll('.left button').forEach(b=>b.disabled=true);}
}
// Exposed only for automated integrity assertions; never used as second state.
window.__phase1={snapshot:()=>store?structuredClone(current()):null,saveState:()=>saver?.state||'unavailable',selected:()=>selected,paired:()=>[...pair],viewport:()=>graph?.getViewport(),injectFailure:()=>{failNextWrite=true;},flush:()=>saver?.flush(),settled:()=>saver?.whenSettled(),undo:()=>store?.undo(),redo:()=>store?.redo()};
window.__phase3={routes:()=>graph?structuredClone([...graph.routes??[]]):[],projection:()=>store?structuredClone(projectGraphForTest()):null};
function projectGraphForTest(){return {visible:graph.projection.nodes.map(n=>n.id),summaries:graph.projection.summaries,hidden:[...graph.projection.hidden]};}
start();
