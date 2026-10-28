// Deterministic layered layout for Phase 0 feasibility only; not production ELK.
// Cycles in soft/order edges are legal: trim back-edges in the *layout* ordering only.
export function optimizePositions(doc, density='detailed') {
  const nodes=doc.roadmap.nodes, edges=doc.roadmap.edges;
  const byId=new Map(nodes.map(n=>[n.id,n]));
  const outgoing=new Map(nodes.map(n=>[n.id,[]]));
  for(const e of edges) outgoing.get(e.sourceId)?.push(e.targetId);
  const state=new Map(), dagEdges=[];
  function walk(id){
    state.set(id,1);
    for(const dest of outgoing.get(id)||[]){
      if(state.get(dest)===1) continue; // presentation cycle, no domain changes
      dagEdges.push([id,dest]);
      if(!state.has(dest)) walk(dest);
    }
    state.set(id,2);
  }
  for(const n of nodes) if(!state.has(n.id)) walk(n.id);
  const incoming=new Map(nodes.map(n=>[n.id,[]]));
  for(const [a,b] of dagEdges) incoming.get(b).push(a);
  const rank=new Map(), active=new Set();
  function getRank(id){
    if(rank.has(id)) return rank.get(id);
    if(active.has(id)) return 0;
    active.add(id);
    let r=0;
    for(const p of incoming.get(id)||[]) r=Math.max(r,getRank(p)+1);
    active.delete(id); rank.set(id,r); return r;
  }
  nodes.forEach(n=>getRank(n.id));
  const layers=new Map();
  for(const n of nodes){const r=rank.get(n.id);if(!layers.has(r))layers.set(r,[]);layers.get(r).push(n);}
  const width=density==='compact'?176:236, height=density==='compact'?62:108;
  const colGap=density==='compact'?110:130, rowGap=density==='compact'?56:52;
  const placed=new Map(), result=new Map();
  for(const r of [...layers.keys()].sort((a,b)=>a-b)){
    const layer=layers.get(r);
    layer.sort((a,b)=>{
      const bary=(n)=>{const p=incoming.get(n.id)||[];const vals=p.filter(x=>placed.has(x)).map(x=>placed.get(x));
        return vals.length?vals.reduce((x,y)=>x+y,0)/vals.length:n.position.y;};
      return bary(a)-bary(b)||a.id.localeCompare(b.id);
    });
    layer.forEach((n,i)=>{
      const y=90+i*(height+rowGap), x=80+r*(width+colGap);
      result.set(n.id,{x,y}); placed.set(n.id,y);
    });
  }
  return result;
}
export function applyPositions(doc,positions){
  for(const n of doc.roadmap.nodes){
    const p=positions.get(n.id);
    if(p) n.position={...p};
  }
}
export function overlaps(doc,density='detailed'){
  const w=density==='compact'?176:236,h=density==='compact'?62:108;
  const ns=doc.roadmap.nodes, pairs=[];
  for(let i=0;i<ns.length;i++) for(let j=i+1;j<ns.length;j++){
    const a=ns[i],b=ns[j];
    if(a.position.x<b.position.x+w&&a.position.x+w>b.position.x&&a.position.y<b.position.y+h&&a.position.y+h>b.position.y) pairs.push([a.id,b.id]);
  }
  return pairs;
}
