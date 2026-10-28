import {DEFAULT_NAVIGATION} from '../navigation.js';
import {groupBoundary} from '../model/groups.js';
import {RELATIONSHIP_LABELS} from './labels.js';
const $=id=>document.getElementById(id);
export function wireOrganization({current,preference,openGroup,onEdge}){
 const nav=()=>current().preferences.navigation??DEFAULT_NAVIGATION;
 function navigation(mode){const rootId=$('navigation-root').value;if(mode!=='none'&&!rootId)return;preference(p=>{p.navigation={mode,direction:$('navigation-direction').value,rootId:rootId||null};});}
 $('new-group').addEventListener('click',()=>openGroup(null));$('edit-group').addEventListener('click',()=>openGroup($('group-picker').value));
 $('completed-visibility').addEventListener('change',()=>preference(p=>{p.completedVisibility=$('completed-visibility').value;p.expandedCompleted=[];}));
 $('focus').addEventListener('click',()=>navigation('focus'));$('highlight').addEventListener('click',()=>navigation('highlight'));$('exit-navigation').addEventListener('click',()=>navigation('none'));
 for(const id of ['navigation-root','navigation-direction'])$(id).addEventListener('change',()=>navigation(nav().mode));
 $('reset-view').addEventListener('click',()=>preference(p=>{p.navigation={...DEFAULT_NAVIGATION};p.completedVisibility='show';p.expandedCompleted=[];}));
 $('boundary-close').addEventListener('click',()=>$('boundary-dialog').close());
 function update(){
  const doc=current(),prior=$('group-picker').value;options($('group-picker'),doc.roadmap.groups.map(g=>[g.id,g.title]),prior);
  $('edit-group').disabled=!doc.roadmap.groups.length;
  const root=nav().rootId??$('navigation-root').value;options($('navigation-root'),doc.roadmap.nodes.map(n=>[n.id,n.title]),root);
  $('navigation-direction').value=nav().direction;$('completed-visibility').value=doc.preferences.completedVisibility;
  $('focus').disabled=$('highlight').disabled=!doc.roadmap.nodes.length;
  $('view-readout').textContent=`${nav().mode==='none'?'Full scope':`${nav().mode}: ${nav().direction}`} · completed: ${doc.preferences.completedVisibility}`;
 }
 function boundary(members,title){
  const doc=current(),ids=new Set(members),byId=new Map(doc.roadmap.nodes.map(n=>[n.id,n.title])),edges=groupBoundary(doc,members);
  $('boundary-title').textContent=`Original boundary connections: ${title}`;$('boundary-list').replaceChildren();
  if(!edges.length){const item=document.createElement('li');item.textContent='No boundary connections.';$('boundary-list').append(item);}
  for(const edge of edges){const item=document.createElement('li'),button=document.createElement('button');button.textContent=`${ids.has(edge.sourceId)?'Outgoing':'Incoming'} · ${RELATIONSHIP_LABELS[edge.kind]} · ${byId.get(edge.sourceId)} → ${byId.get(edge.targetId)} · ${edge.id}`;button.title=`${edge.sourceId} → ${edge.targetId}`;button.addEventListener('click',()=>{$('boundary-dialog').close();onEdge(edge.id);});item.append(button);$('boundary-list').append(item);}
  $('boundary-dialog').showModal();
 }
 return {update,boundary,inspectGroup(id){const group=current().roadmap.groups.find(g=>g.id===id);if(group)boundary(current().roadmap.nodes.filter(n=>n.groupId===id).map(n=>n.id),group.title);}};
}
function options(select,entries,selected){const signature=JSON.stringify(entries);if(select.dataset.signature!==signature){select.replaceChildren();for(const [id,title] of entries){const option=document.createElement('option');option.value=id;option.textContent=title;select.append(option);}select.dataset.signature=signature;}if(entries.some(([id])=>id===selected))select.value=selected;}
