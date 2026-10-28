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
const $=id=>document.getElementById(id),notice=(message,kind='info')=>{$('status').textContent=message;$('status').dataset.kind=kind;};
let store,db,saver,selected=null,pair=[],gesture=null,inspector,graph,organization,bootBlocked=false,failNextWrite=false,importApplying=false,importLocked=false;
const current=()=>store.current;
function updateButtons(){$('undo').disabled=!store.undoStack.length;$('redo').disabled=!store.redoStack.length;$('connect-selected').disabled=pair.length!==2;
 $('selection-readout').textContent=pair.length===2?`${title(pair[0])} → ${title(pair[1])}`:pair.length===1?`Source: ${title(pair[0])} · Shift-click destination`:'Click source, then Shift-click destination';
 const g=current().roadmap.groups.find(g=>g.id===$('group-picker').value)??current().roadmap.groups[0];$('collapse').disabled=!g;$('collapse').textContent=g?.collapsed?'⊞ Expand selected group':'⊟ Collapse selected group';$('density').textContent=current().preferences.nodeDensity==='detailed'?'▤ Compact nodes':'▣ Detailed nodes';}
function title(id){return current().roadmap.nodes.find(n=>n.id===id)?.title||'Unknown';}
function refresh({inspectorRefresh=false}={}){graph.setDocument(current(),{selected,pair});$('node-count').textContent=current().roadmap.nodes.length;$('edge-count').textContent=current().roadmap.edges.length;
 $('roadmap-title').textContent=current().roadmap.title;organization?.update();updateButtons();
 if(inspectorRefresh){if(selected?.type==='node')inspector.node(current(),selected.id);else if(selected?.type==='edge')inspector.edge(current(),selected.id);else if(selected?.type==='group')inspector.group(current(),selected.id);else inspector.reset();}}
function setSaveState(state,details=''){$('save-state').dataset.state=state;$('save-state').textContent={idle:'Ready (no edits yet)',pending:'Unsaved changes · pending',saving:'Saving to IndexedDB…',saved:'Saved to this browser',failed:'SAVE FAILED — changes only in memory',unavailable:'STORAGE UNAVAILABLE'}[state]||state;
 if(state==='import_failed')$('save-state').textContent='IMPORT FAILED — active roadmap unchanged';
 $('retry-save').hidden=state!=='failed';if(state==='failed')notice(`Autosave failed: ${details}. Last committed copy is preserved. Retry before reloading.`, 'error');}
function commit(transform,{immediate=true,refreshInspector=true}={}){try{const changed=store.command(transform);if(changed){if(refreshInspector)refresh({inspectorRefresh:true});if(immediate)saver.flush();notice('Roadmap updated. Autosave queued.');}return changed;}catch(error){notice(`Action rejected: ${error.message}`,'error');throw error;}}
function safely(fn,errorTarget){try{return fn();}catch(error){if(errorTarget)errorTarget.textContent=error.message;else notice(error.message,'error');return false;}}
function onNode(id,shift){if(!shift&&selected?.type==='node'&&selected.id===id&&inspector.mode==='node')return;
 if(!inspector.confirmLeave())return; if(shift){if(pair.length===0)pair=[id];else if(pair.length===1&&pair[0]!==id)pair=[pair[0],id];else if(pair.length===2&&pair[0]!==id)pair=[pair[0],id];else notice('Choose two different nodes for a connection.');}
 else pair=[id];selected={type:'node',id};refresh();inspector.node(current(),id);}
function onEdge(id){if(!inspector.confirmLeave())return;selected={type:'edge',id};pair=[];refresh();inspector.edge(current(),id);}
function openGroup(id){if(!inspector.confirmLeave())return;selected=id?{type:'group',id}:null;pair=[];refresh();inspector.group(current(),id);}
function persistViewport(){if(!store||bootBlocked||importLocked)return;store.pref(d=>displayPreference(d,p=>{p.viewport=graph.getViewport();}));}
function enterNewGoal(position){if(!store||bootBlocked||!inspector.confirmLeave())return;selected=null;pair=[];refresh();inspector.node(current(),null,{x:Math.round(position.x),y:Math.round(position.y)});notice('Create goal: Save commits; Cancel makes no changes.');}
function dragStart(e,id){if(gesture)return;const node=current().roadmap.nodes.find(n=>n.id===id);if(!node)return;gesture={type:'node',id,startX:e.clientX,startY:e.clientY,original:{...node.position},preview:{...node.position},shiftKey:e.shiftKey};}
function linkStart(e,id){if(!inspector.confirmLeave())return;gesture={type:'link',sourceId:id,startX:e.clientX,startY:e.clientY};graph.gestureFrom({x:e.clientX,y:e.clientY},e.clientX,e.clientY);notice(`Creating directed connection from ${title(id)}. Release on destination's left ● handle.`);}
function panStart(e){gesture={type:'pan',startX:e.clientX,startY:e.clientY,x:graph.tx,y:graph.ty};}
window.addEventListener('pointermove',e=>{if(!gesture||!graph)return;const g=gesture;if(g.type==='node'){
 g.preview={x:Math.round(g.original.x+(e.clientX-g.startX)/graph.zoom),y:Math.round(g.original.y+(e.clientY-g.startY)/graph.zoom)};graph.previewPosition(g.id,g.preview);
 }else if(g.type==='pan'){graph.tx=g.x+e.clientX-g.startX;graph.ty=g.y+e.clientY-g.startY;graph.transform();}else if(g.type==='link'){graph.gestureFrom({x:g.startX,y:g.startY},e.clientX,e.clientY);}});
window.addEventListener('pointerup',e=>{if(!gesture||!store)return;const g=gesture;gesture=null;graph.clearGesture();if(g.type==='node'){
 const moved=g.preview.x!==g.original.x||g.preview.y!==g.original.y;
 if(moved){if(!inspector.confirmLeave()){refresh();return;}selected={type:'node',id:g.id};pair=[g.id];safely(()=>commit(d=>moveNode(d,g.id,g.preview)),null);refresh();inspector.node(current(),g.id);}
 else onNode(g.id,g.shiftKey);}
 else if(g.type==='pan')persistViewport();else if(g.type==='link'){
 const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.in-port')?.closest('[data-node-id]')?.dataset.nodeId;
 if(!target){notice('Connection canceled. Release over the destination’s left ● handle.');return;}
 selected=null;pair=[g.sourceId,target];refresh();inspector.connect(current(),g.sourceId,target);notice('Choose hard, soft, or order and confirm Create directed connection.');
 }});
function startInspector(){inspector=new Inspector($('inspector'),{
 saveGroup(id,fields,error){safely(()=>{commit(d=>saveGroup(d,id,fields));const groupId=id??current().roadmap.groups.at(-1).id;selected={type:'group',id:groupId};refresh({inspectorRefresh:true});},error);},
 deleteGroup(id){if(!window.confirm('Delete this visual group and ungroup its members? All goals and connections are retained.'))return;safely(()=>{commit(d=>deleteGroup(d,id));selected=null;refresh({inspectorRefresh:true});});},
 toggleGroup(id){if(inspector.confirmLeave())safely(()=>commit(d=>toggleGroup(d,id)));},inspectGroup:id=>organization.inspectGroup(id),
 saveNode(id,fields,position,error){safely(()=>{commit(d=>id?editNode(d,id,fields):createNode(d,fields,position));if(!id){const n=current().roadmap.nodes.at(-1);id=n.id;}selected={type:'node',id};pair=[id];refresh();inspector.node(current(),id);notice('Goal saved in roadmap; durable autosave running.');},error);},
 cancel(){if(selected?.type==='node'&&current().roadmap.nodes.some(n=>n.id===selected.id)){inspector.node(current(),selected.id);notice('Unsaved form changes discarded.');}else if(selected?.type==='group'){inspector.group(current(),selected.id);}else{selected=null;pair=[];refresh();inspector.reset();notice('Canceled; no node created.');}},
 deleteNode(id){const n=current().roadmap.nodes.find(n=>n.id===id);if(!n)return;if(!window.confirm(`Delete "${n.title}" and ${current().roadmap.edges.filter(e=>e.sourceId===id||e.targetId===id).length} incident connection(s)? All other goals remain.`))return;safely(()=>{commit(d=>deleteNode(d,id));selected=null;pair=[];refresh();inspector.reset();});},
 editEdge(id,kind,error){safely(()=>{commit(d=>editEdge(d,id,kind));selected={type:'edge',id};refresh();inspector.edge(current(),id);},error);},
 deleteEdge(id){if(!window.confirm('Delete this directed connection? You can undo.'))return;safely(()=>{commit(d=>deleteEdge(d,id));selected=null;pair=[];refresh();inspector.reset();});},
 connect(source,target,kind,error){safely(()=>{commit(d=>connect(d,source,target,kind));const id=current().roadmap.edges.at(-1).id;selected={type:'edge',id};pair=[];refresh();inspector.edge(current(),id);},error);}
 });}
function wireControls(){
 organization=wireOrganization({current,openGroup,onEdge,preference:fn=>safely(()=>{store.pref(d=>displayPreference(d,fn));refresh();})});organization.update();
 $('group-picker').addEventListener('change',updateButtons);
 graph.onGroupEdit=openGroup;graph.onBoundary=summary=>organization.boundary(summary.members,summary.title);
 graph.onCompletedExpand=id=>safely(()=>{store.pref(d=>displayPreference(d,p=>{p.expandedCompleted=[...new Set([...(p.expandedCompleted??[]),id])];}));refresh();});
 wireBackup({current,notice,lock:value=>{importLocked=value;gesture=null;graph.clearGesture();document.querySelector('.app').inert=value;},replace:async candidate=>{
  await saver.replaceDurably(candidate,snapshot=>{importApplying=true;try{store.replace(snapshot);}finally{importApplying=false;}
   selected=null;pair=[];graph.setViewport(snapshot.preferences.viewport);refresh({inspectorRefresh:true});});
 }});
 $('undo').addEventListener('click',()=>{if(inspector.confirmLeave()&&store.undo()){selected=null;pair=[];refresh({inspectorRefresh:true});notice('Undo applied. Changes are being saved.');}});
 $('redo').addEventListener('click',()=>{if(inspector.confirmLeave()&&store.redo()){selected=null;pair=[];refresh({inspectorRefresh:true});notice('Redo applied. Changes are being saved.');}});
 $('new-roadmap').addEventListener('click',()=>{if(!window.confirm('Replace the active roadmap with a NEW EMPTY ROADMAP in this browser? This action is undoable until reload.'))return;
 safely(()=>{commit(()=>emptyRoadmap());selected=null;pair=[];refresh({inspectorRefresh:true});graph.fit();notice('New empty roadmap. Original demo remains available through Load demo.');});});
 $('load-demo').addEventListener('click',()=>{if(!window.confirm('Replace the active roadmap with a fresh copy of the seven-node demo? Undo is available until reload.'))return;
 safely(()=>{commit(()=>newFixture());selected=null;pair=[];refresh({inspectorRefresh:true});graph.fit();notice('Optional seven-node demonstration loaded; no automatic game prerequisites asserted.');});});
 $('optimize').addEventListener('click',async()=>{
  if(importLocked||!inspector.confirmLeave())return;const before=current(),key=layoutKey(before),signature=graphSignature(before);
  importLocked=true;gesture=null;graph.clearGesture();document.querySelector('.app').inert=true;notice('Optimizing layout with local ELK.js…');
  try{const layout=await optimizeGraph(before);if(key!==layoutKey(current()))throw Error('Roadmap changed during layout; no positions applied.');
   commit(d=>withPositions(d,layout.positions));if(signature!==graphSignature(current()))throw Error('Layout semantic preservation failure.');graph.setRoutes(layoutKey(current()),layout.routes);graph.fit();notice('Layout optimized. Only positions changed; Undo restores them. Drag any card to adjust.');
  }catch(error){notice(`Layout failed; existing positions retained: ${error.message}`,'error');}
  finally{importLocked=false;document.querySelector('.app').inert=false;persistViewport();}
 });
 $('density').addEventListener('click',()=>{safely(()=>{store.pref(d=>displayPreference(d,p=>{p.nodeDensity=p.nodeDensity==='compact'?'detailed':'compact';}));refresh();notice(`Density changed to ${current().preferences.nodeDensity}.`);});});
 $('collapse').addEventListener('click',()=>{if(!inspector.confirmLeave())return;const group=current().roadmap.groups.find(g=>g.id===$('group-picker').value)??current().roadmap.groups[0];if(group)safely(()=>{commit(d=>toggleGroup(d,group.id));selected=null;pair=[];refresh({inspectorRefresh:true});notice('Visual group toggle preserves all original edges.');});});
 $('connect-selected').addEventListener('click',()=>{if(pair.length===2&&inspector.confirmLeave())inspector.connect(current(),pair[0],pair[1]);});
 $('fit').addEventListener('click',()=>graph.fit());
 $('retry-save').addEventListener('click',()=>saver.retry());
 $('test-fail-save').addEventListener('click',()=>{failNextWrite=true;notice('Next IndexedDB write will fail intentionally. Make a change, then observe the SAVE FAILED state. Click Retry save to commit it.');});
 window.addEventListener('keydown',e=>{if(importLocked||document.querySelector('dialog[open]')||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)$('redo').click();else $('undo').click();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();$('redo').click();}});
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
  wireControls();
 }catch(error){bootBlocked=true;setSaveState('unavailable');notice(`Cannot safely open saved roadmap: ${error.message}. Data was NOT reset or overwritten.`, 'error');$('startup-error').hidden=false;$('startup-error').textContent=`Storage initialization failed: ${error.message}. Close other tabs or use the same localhost origin. No destructive reset was attempted.`;document.querySelectorAll('.left button').forEach(b=>b.disabled=true);}
}
// Exposed only for automated integrity assertions; never used as second state.
window.__phase1={snapshot:()=>store?structuredClone(current()):null,saveState:()=>saver?.state||'unavailable',selected:()=>selected,paired:()=>[...pair],viewport:()=>graph?.getViewport(),injectFailure:()=>{failNextWrite=true;},flush:()=>saver?.flush(),settled:()=>saver?.whenSettled(),undo:()=>store?.undo(),redo:()=>store?.redo()};
window.__phase3={routes:()=>graph?structuredClone([...graph.routes??[]]):[],projection:()=>store?structuredClone(projectGraphForTest()):null};
function projectGraphForTest(){return {visible:graph.projection.nodes.map(n=>n.id),summaries:graph.projection.summaries,hidden:[...graph.projection.hidden]};}
start();
