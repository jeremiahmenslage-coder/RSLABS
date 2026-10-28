import {cardSize,SUMMARY_SIZE,boxesOverlap} from '../geometry.js';
import {segmentHitsBox} from './metrics.js';
const pathLength=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
function orthogonal(start,end,boxes,occupied){
 const xs=[...new Set([start.x,end.x,...boxes.flatMap(b=>[b.x-8,b.x+b.w+8]),...occupied.filter(s=>s.a.x===s.b.x).flatMap(s=>[s.a.x-10,s.a.x+10])])].sort((a,b)=>a-b);
 const ys=[...new Set([start.y,end.y,...boxes.flatMap(b=>[b.y-8,b.y+b.h+8]),...occupied.filter(s=>s.a.y===s.b.y).flatMap(s=>[s.a.y-10,s.a.y+10])])].sort((a,b)=>a-b);
 const inside=p=>boxes.some(b=>p.x>b.x&&p.x<b.x+b.w&&p.y>b.y&&p.y<b.y+b.h);
 const source={i:xs.indexOf(start.x),j:ys.indexOf(start.y),dir:0,g:0,p:start,prior:null};
 const open=[source],best=new Map();let attempts=0;
 while(open.length&&attempts++<50000){
  let index=0;for(let k=1;k<open.length;k++)if(open[k].g+pathLength(open[k].p,end)<open[index].g+pathLength(open[index].p,end))index=k;
  const at=open.splice(index,1)[0],key=`${at.i},${at.j},${at.dir}`;if((best.get(key)??Infinity)<at.g)continue;
  if(at.p.x===end.x&&at.p.y===end.y){const points=[];for(let n=at;n;n=n.prior)points.push(n.p);return points.reverse();}
  for(const [di,dj,dir] of [[1,0,1],[-1,0,1],[0,1,2],[0,-1,2]]){
   const i=at.i+di,j=at.j+dj;if(i<0||i>=xs.length||j<0||j>=ys.length)continue;
   const p={x:xs[i],y:ys[j]};if(inside(p)||boxes.some(b=>segmentHitsBox(at.p,p,b)))continue;
   const conflict=occupied.reduce((cost,s)=>{
    if(at.p.x===p.x&&s.a.x===s.b.x&&p.x===s.a.x&&Math.min(Math.max(p.y,at.p.y),Math.max(s.a.y,s.b.y))>Math.max(Math.min(p.y,at.p.y),Math.min(s.a.y,s.b.y)))return cost+50000;
    if(at.p.y===p.y&&s.a.y===s.b.y&&p.y===s.a.y&&Math.min(Math.max(p.x,at.p.x),Math.max(s.a.x,s.b.x))>Math.max(Math.min(p.x,at.p.x),Math.min(s.a.x,s.b.x)))return cost+50000;
    const h=at.p.y===p.y?{a:at.p,b:p}:s,v=at.p.x===p.x?{a:at.p,b:p}:s;
    return cost+(h.a.y===h.b.y&&v.a.x===v.b.x&&v.a.x>=Math.min(h.a.x,h.b.x)&&v.a.x<=Math.max(h.a.x,h.b.x)&&h.a.y>=Math.min(v.a.y,v.b.y)&&h.a.y<=Math.max(v.a.y,v.b.y)?10000:0);
   },0);
   const g=at.g+pathLength(at.p,p)+(at.dir&&at.dir!==dir?35:0)+conflict,key=`${i},${j},${dir}`;
   if(g>=(best.get(key)??Infinity))continue;best.set(key,g);open.push({i,j,dir,g,p,prior:at});
  }
 }
 // Arbitrarily overlapping manually placed cards may have no unobstructed route.
 return [start,{x:(start.x+end.x)/2,y:start.y},{x:(start.x+end.x)/2,y:end.y},end];
}
function simplify(points){return points.filter((p,i)=>i===0||i===points.length-1||!((points[i-1].x===p.x&&p.x===points[i+1].x)||(points[i-1].y===p.y&&p.y===points[i+1].y)));}
export function routeAtPositions(doc,projection){
 const size=cardSize(doc.preferences.nodeDensity),nodes=new Map(projection.nodes.map(n=>[n.id,n]));
 const boxes=[...projection.nodes.map(n=>({...n.position,...size})),...projection.summaries.map(s=>({...s.position,...SUMMARY_SIZE}))];
 const obstacles=boxes.map(b=>({x:b.x-16,y:b.y-16,w:b.w+32,h:b.h+32})),routes=new Map(),labels=[],occupied=[];
 const offsets=(nodeId,side)=>{const edges=projection.edges.filter(e=>e[side]===nodeId).sort((a,b)=>{const other=side==='sourceId'?'targetId':'sourceId';return nodes.get(a[other]).position.y-nodes.get(b[other]).position.y||a.id.localeCompare(b.id);});return new Map(edges.map((e,i)=>[e.id,edges.length===1?0:-10+i*20/(edges.length-1)]));};
 const exits=new Map([...nodes.keys()].map(id=>[id,offsets(id,'sourceId')])),entries=new Map([...nodes.keys()].map(id=>[id,offsets(id,'targetId')]));
 const reserved=projection.edges.flatMap(e=>{const a=nodes.get(e.sourceId),b=nodes.get(e.targetId),y=a.position.y+size.h/2+exits.get(e.sourceId).get(e.id),ty=b.position.y+size.h/2+entries.get(e.targetId).get(e.id);return [{id:e.id,a:{x:a.position.x+size.w+4,y},b:{x:a.position.x+size.w+32,y}},{id:e.id,a:{x:b.position.x-32,y:ty},b:{x:b.position.x-4,y:ty}}];});
 for(const e of projection.edges){
  const a=nodes.get(e.sourceId),b=nodes.get(e.targetId),start={x:a.position.x+size.w+4,y:a.position.y+size.h/2+exits.get(e.sourceId).get(e.id)},end={x:b.position.x-4,y:b.position.y+size.h/2+entries.get(e.targetId).get(e.id)};
  const exit={x:start.x+28,y:start.y},entry={x:end.x-28,y:end.y};
  const points=simplify([start,...orthogonal(exit,entry,obstacles,[...occupied,...reserved.filter(s=>s.id!==e.id)]),end]);
  routes.set(e.id,{points,label:null});
  for(let i=1;i<points.length;i++)occupied.push({a:points[i-1],b:points[i]});
 }
 const segments=[...routes].flatMap(([id,route])=>route.points.slice(1).map((b,i)=>({id,a:route.points[i],b})));
 for(const [id,route] of routes){
  const {points}=route,start=points[0],end=points.at(-1);
  const candidates=[];
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i];
   if(a.y===b.y&&Math.abs(a.x-b.x)>=74)for(const ratio of [.5,.3,.7])for(const dy of [-19,19,-40,40])candidates.push({x:a.x+(b.x-a.x)*ratio,y:a.y+dy});
   if(a.x===b.x&&Math.abs(a.y-b.y)>=34)for(const dx of [-40,40])candidates.push({x:a.x+dx,y:(a.y+b.y)/2});
  }
  const label=candidates.find(p=>{const box={x:p.x-33,y:p.y-14,w:66,h:28};return ![...boxes,...labels].some(b=>boxesOverlap(box,b))&&!segments.some(s=>s.id!==id&&segmentHitsBox(s.a,s.b,box));})??{x:(start.x+end.x)/2,y:(start.y+end.y)/2-19};
  labels.push({x:label.x-33,y:label.y-14,w:66,h:28});route.label=label;
 }
 return routes;
}
