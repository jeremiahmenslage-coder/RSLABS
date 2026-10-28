import {makeId,mutate} from './actions.js';
export function saveGroup(doc,id,{title,memberIds,representativeNodeId=null}){
 if(typeof title!=='string'||!title.trim()||title.length>150)throw Error('Group name is required (maximum 150 characters).');
 if(!Array.isArray(memberIds)||new Set(memberIds).size!==memberIds.length||memberIds.some(id=>!doc.roadmap.nodes.some(n=>n.id===id)))throw Error('Choose existing group members.');
 if(representativeNodeId!==null&&!memberIds.includes(representativeNodeId))throw Error('Representative must be a selected member.');
 const groupId=id??makeId('group');
 return mutate(doc,d=>{
  let group=d.roadmap.groups.find(g=>g.id===groupId);
  if(id&&!group)throw Error('Group no longer exists.');
  if(!group){group={id:groupId,title:'',collapsed:false,representativeNodeId:null};d.roadmap.groups.push(group);}
  group.title=title.trim();group.representativeNodeId=representativeNodeId;
  const members=new Set(memberIds);
  for(const n of d.roadmap.nodes){if(members.has(n.id))n.groupId=groupId;else if(n.groupId===groupId)n.groupId=null;}
  for(const g of d.roadmap.groups)if(g.representativeNodeId&&!d.roadmap.nodes.some(n=>n.id===g.representativeNodeId&&n.groupId===g.id))g.representativeNodeId=null;
 });
}
export function deleteGroup(doc,id){return mutate(doc,d=>{
 if(!d.roadmap.groups.some(g=>g.id===id))throw Error('Group no longer exists.');
 d.roadmap.groups=d.roadmap.groups.filter(g=>g.id!==id);for(const n of d.roadmap.nodes)if(n.groupId===id)n.groupId=null;
});}
export function groupBoundary(doc,ids){const members=new Set(ids);return doc.roadmap.edges.filter(e=>members.has(e.sourceId)!==members.has(e.targetId));}
