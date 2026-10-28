import {connectedScope,DEFAULT_NAVIGATION} from './navigation.js';
import {groupBoundary} from './model/groups.js';
// Derived presentation only. Edges always retain their actual canonical endpoints.
export function projectGraph(doc){
 const hidden=new Set(),summaries=[],nav=doc.preferences.navigation??DEFAULT_NAVIGATION;
 const scope=nav.mode!=='none'?connectedScope(doc,nav.rootId,nav.direction):null;
 const eligible=doc.roadmap.nodes.filter(n=>nav.mode!=='focus'||scope.has(n.id));
 const visibility=doc.preferences.completedVisibility,expanded=new Set(doc.preferences.expandedCompleted??[]);
 const visibleCandidates=eligible.filter(n=>visibility!=='hide'||n.status!=='completed');
 const summary=(kind,id,title,members,extra={})=>{
  if(!members.length)return;
  for(const n of members)hidden.add(n.id);
  const boundary=groupBoundary(doc,members.map(n=>n.id));
  summaries.push({kind,id,title,members:members.map(n=>n.id),nodeCount:members.length,externalCount:boundary.length,boundary,
   completedCount:members.filter(n=>n.status==='completed').length,
   position:{x:Math.min(...members.map(n=>n.position.x)),y:Math.min(...members.map(n=>n.position.y))},...extra});
 };
 for(const group of doc.roadmap.groups.filter(g=>g.collapsed)){
  const members=eligible.filter(n=>n.groupId===group.id);if(visibility==='hide'&&members.every(n=>n.status==='completed'))continue;
  const boundary=groupBoundary(doc,doc.roadmap.nodes.filter(n=>n.groupId===group.id).map(n=>n.id));
  summary('group',group.id,group.title,members,{representativeNodeId:group.representativeNodeId,boundary,externalCount:boundary.length});
 }
 if(visibility==='collapse'){
  const completed=visibleCandidates.filter(n=>n.status==='completed'&&!hidden.has(n.id)),pending=new Set(completed.map(n=>n.id)),byId=new Map(completed.map(n=>[n.id,n]));
  const adjacency=new Map(completed.map(n=>[n.id,[]]));
  for(const e of doc.roadmap.edges)if(pending.has(e.sourceId)&&pending.has(e.targetId)){adjacency.get(e.sourceId).push(e.targetId);adjacency.get(e.targetId).push(e.sourceId);}
  for(const n of completed){if(!pending.has(n.id))continue;const queue=[n.id];pending.delete(n.id);
   for(let i=0;i<queue.length;i++)for(const id of adjacency.get(queue[i]))if(pending.delete(id))queue.push(id);
   const id=[...queue].sort()[0];if(!expanded.has(id))summary('completed',id,'Completed branch',queue.map(id=>byId.get(id)));
  }
 }
 const nodes=visibleCandidates.filter(n=>!hidden.has(n.id)),nodeIds=new Set(nodes.map(n=>n.id));
 for(const n of doc.roadmap.nodes)if(!nodeIds.has(n.id))hidden.add(n.id);
 return {nodes,edges:doc.roadmap.edges.filter(e=>nodeIds.has(e.sourceId)&&nodeIds.has(e.targetId)),summaries,hidden,
  highlighted:nav.mode==='highlight'?scope:null,dimmed:new Set(visibility==='dim'?nodes.filter(n=>n.status==='completed').map(n=>n.id):[])};
}
