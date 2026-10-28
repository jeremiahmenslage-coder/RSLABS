import {STATUSES} from '../model.js';
import {makeId,mutate} from './actions.js';
// Explicit IDs are the complete scope. No traversal, projection expansion or propagation.
export function bulkAction(doc,ids,action){
 if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length)throw Error('Select distinct existing goals first.');
 const known=new Set(doc.roadmap.nodes.map(n=>n.id));if(ids.some(id=>!known.has(id)))throw Error('A selected goal no longer exists.');
 const selected=new Set(ids);
 if(action.kind==='status'){
  if(!STATUSES.includes(action.status))throw Error('Choose a valid manual status.');
  const now=new Date().toISOString();return mutate(doc,d=>{for(const n of d.roadmap.nodes)if(selected.has(n.id)&&n.status!==action.status){n.status=action.status;n.updatedAt=now;}});
 }
 if(!['create_group','add_to_group','ungroup'].includes(action.kind))throw Error('Unknown bulk action.');
 let groupId=null;
 if(action.kind==='create_group'){
  if(typeof action.title!=='string'||!action.title.trim()||action.title.length>150)throw Error('Group name is required (maximum 150 characters).');
  groupId=makeId('group');
 }else if(action.kind==='add_to_group'){
  if(!doc.roadmap.groups.some(g=>g.id===action.groupId))throw Error('Choose an existing group.');groupId=action.groupId;
 }
 return mutate(doc,d=>{
  if(action.kind==='create_group')d.roadmap.groups.push({id:groupId,title:action.title.trim(),representativeNodeId:null,collapsed:false});
  for(const n of d.roadmap.nodes)if(selected.has(n.id))n.groupId=groupId;
  // Only invalidated representative references are cleared; goals retain their own state.
  for(const g of d.roadmap.groups)if(g.representativeNodeId&&!d.roadmap.nodes.some(n=>n.id===g.representativeNodeId&&n.groupId===g.id))g.representativeNodeId=null;
 });
}
