export const DEFAULT_NAVIGATION=Object.freeze({mode:'none',direction:'both',rootId:null});
export function connectedScope(doc,rootId,direction='both'){
 const known=new Set(doc.roadmap.nodes.map(n=>n.id));if(!known.has(rootId))return new Set();
 const walk=reverse=>{
  const adjacency=new Map();for(const e of doc.roadmap.edges){const a=reverse?e.targetId:e.sourceId,b=reverse?e.sourceId:e.targetId;if(!adjacency.has(a))adjacency.set(a,[]);adjacency.get(a).push(b);}
  const seen=new Set([rootId]),queue=[rootId];for(let i=0;i<queue.length;i++)for(const id of adjacency.get(queue[i])??[])if(!seen.has(id)){seen.add(id);queue.push(id);}return seen;
 };
 // Both is ancestors union descendants, not an undirected flood-fill via siblings.
 const result=new Set([rootId]);if(direction!=='downstream')for(const id of walk(true))result.add(id);if(direction!=='upstream')for(const id of walk(false))result.add(id);return result;
}
