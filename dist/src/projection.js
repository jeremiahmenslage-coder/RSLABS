// Only a view projection: never materializes synthetic semantic edges.
export function projectGraph(doc){
  const hidden=new Set(), summaries=[];
  for(const group of doc.roadmap.groups.filter(g=>g.collapsed)){
    const members=doc.roadmap.nodes.filter(n=>n.groupId===group.id);
    for(const member of members) hidden.add(member.id);
    const ids=new Set(members.map(n=>n.id));
    const boundary=doc.roadmap.edges.filter(e=>ids.has(e.sourceId)!==ids.has(e.targetId));
    summaries.push({id:group.id,title:group.title,nodeCount:members.length,externalCount:boundary.length,
      // Summary location derived, no canonical position mutation.
      position:members.length?{x:Math.min(...members.map(n=>n.position.x)),y:Math.min(...members.map(n=>n.position.y))}:{x:0,y:0}});
  }
  return {nodes:doc.roadmap.nodes.filter(n=>!hidden.has(n.id)),
    edges:doc.roadmap.edges.filter(e=>!hidden.has(e.sourceId)&&!hidden.has(e.targetId)),
    summaries, hidden};
}
