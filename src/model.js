export const EDGE_KINDS = Object.freeze(['hard','soft','order']);
export const STATUSES = Object.freeze(['not_started','in_progress','completed']);
export const CATEGORIES = Object.freeze(['quest','skill','item','boss','diary','prayer','activity','custom']);
export function graphSignature(data){
  // Content signature excludes positions, density and grouping presentation.
  return JSON.stringify({nodes:data.roadmap.nodes.map(n=>n.id).sort(),
    edges:data.roadmap.edges.map(e=>[e.id,e.sourceId,e.targetId,e.kind].join('|')).sort()});
}
export function validateRoadmap(doc){
  const errors=[];
  if(doc?.schemaVersion!==1||!doc.roadmap) return ['Unsupported schema/roadmap'];
  const {nodes,edges,groups}=doc.roadmap;
  if(!Array.isArray(nodes)||!Array.isArray(edges)||!Array.isArray(groups)) return ['Missing collections'];
  if(!doc.roadmap.id||typeof doc.roadmap.id!=='string'||typeof doc.roadmap.title!=='string')errors.push('Invalid roadmap identity');
  if(nodes.length>10000||edges.length>50000||groups.length>1000)return ['Roadmap exceeds safety limits'];
  if(!doc.preferences||!['graph','board'].includes(doc.preferences.lastView)||!['compact','detailed'].includes(doc.preferences.nodeDensity)||!['show','dim','hide','collapse'].includes(doc.preferences.completedVisibility))errors.push('Invalid display preferences');
  const viewport=doc.preferences?.viewport;
  if(!viewport||![viewport.x,viewport.y,viewport.zoom].every(Number.isFinite)||viewport.zoom<0.1||viewport.zoom>5)errors.push('Invalid viewport preferences');
  const nodeIds=new Set(), edgeIds=new Set(), groupIds=new Set();
  for(const g of groups){
    if(typeof g?.id!=='string'||!g.id||groupIds.has(g.id)) errors.push('Duplicate/invalid group ID');
    if(typeof g.title!=='string'||!g.title.trim()||typeof g.collapsed!=='boolean')errors.push('Invalid group presentation');
    groupIds.add(g.id);
  }
  for(const n of nodes){
    if(typeof n?.id!=='string'||!n.id||nodeIds.has(n.id)) errors.push('Duplicate/invalid node ID');
    nodeIds.add(n.id);
    if(!CATEGORIES.includes(n.category)) errors.push(`Category invalid: ${n.id}`);
    if(!STATUSES.includes(n.status)) errors.push(`Status invalid: ${n.id}`);
    if(typeof n.title!=='string'||!n.title.trim()||n.title.length>150) errors.push(`Title invalid: ${n.id}`);
    if(typeof n.notes!=='string'||n.notes.length>5000)errors.push(`Notes invalid: ${n.id}`);
    if(n.catalogRef!==null&&typeof n.catalogRef!=='string')errors.push(`Catalog reference invalid: ${n.id}`);
    if(n.iconOverride!==null&&(typeof n.iconOverride!=='string'||n.iconOverride.length>256))errors.push(`Icon reference invalid: ${n.id}`);
    if(!Number.isFinite(Date.parse(n.createdAt))||!Number.isFinite(Date.parse(n.updatedAt)))errors.push(`Timestamp invalid: ${n.id}`);
    if(!Number.isFinite(n.position?.x)||!Number.isFinite(n.position?.y)) errors.push(`Position invalid: ${n.id}`);
    if(n.groupId&&!groupIds.has(n.groupId)) errors.push(`Group missing: ${n.id}`);
    if(n.progress !== null && !(Number.isFinite(n.progress?.current)&&Number.isFinite(n.progress?.target)&&n.progress.current>=0&&n.progress.target>0)) errors.push(`Progress invalid: ${n.id}`);
  }
  for(const g of groups) if(g.representativeNodeId){
    const rep=nodes.find(n=>n.id===g.representativeNodeId);
    if(!rep) errors.push(`Representative missing: ${g.id}`);
    else if(rep.groupId!==g.id) errors.push(`Representative outside group: ${g.id}`);
  }
  const pairs=new Set();
  for(const e of edges){
    if(typeof e?.id!=='string'||!e.id||edgeIds.has(e.id)) errors.push(`Duplicate/invalid edge ID: ${e.id}`);
    edgeIds.add(e.id);
    if(!nodeIds.has(e.sourceId)||!nodeIds.has(e.targetId)) errors.push(`Dangling edge: ${e.id}`);
    if(e.sourceId===e.targetId) errors.push(`Self edge: ${e.id}`);
    if(!EDGE_KINDS.includes(e.kind)) errors.push(`Invalid edge type: ${e.id}`);
    const pair=`${e.sourceId}->${e.targetId}`;
    if(pairs.has(pair)) errors.push(`Duplicate ordered pair: ${pair}`);
    pairs.add(pair);
  }
  if(hardCycle(edges)) errors.push('Hard prerequisite cycle');
  return errors;
}
export function hardCycle(edges){
  // Kahn topological pass avoids recursion limits on long user-defined hard chains.
  const outgoing=new Map(), incoming=new Map();
  for(const edge of edges){if(edge.kind!=='hard')continue;
    if(!outgoing.has(edge.sourceId))outgoing.set(edge.sourceId,[]);
    outgoing.get(edge.sourceId).push(edge.targetId);
    incoming.set(edge.targetId,(incoming.get(edge.targetId)||0)+1);
    if(!incoming.has(edge.sourceId))incoming.set(edge.sourceId,0);
  }
  const queue=[...incoming.keys()].filter(id=>incoming.get(id)===0);
  let count=0;
  for(let i=0;i<queue.length;i++){
    const id=queue[i];count++;
    for(const child of outgoing.get(id)||[]){incoming.set(child,incoming.get(child)-1);if(incoming.get(child)===0)queue.push(child);}
  }
  return count!==incoming.size;
}
export function tryAddEdge(doc, sourceId, targetId, kind){
  let suffix=1;
  while(doc.roadmap.edges.some(e=>e.id===`spike_${suffix}`)) suffix++;
  const edge={id:`spike_${suffix}`,sourceId,targetId,kind};
  const candidate=structuredClone(doc);
  candidate.roadmap.edges.push(edge);
  const errors=validateRoadmap(candidate);
  if(errors.length) return {ok:false,error:errors.join('; ')};
  doc.roadmap.edges.push(edge);
  return {ok:true,edge};
}
export function tryChangeKind(doc,edgeId,kind){
  const copy=structuredClone(doc), edge=copy.roadmap.edges.find(e=>e.id===edgeId);
  if(!edge) return {ok:false,error:'Edge missing'};
  edge.kind=kind;
  const errors=validateRoadmap(copy);
  if(errors.length) return {ok:false,error:errors.join('; ')};
  doc.roadmap.edges.find(e=>e.id===edgeId).kind=kind;
  return {ok:true};
}
