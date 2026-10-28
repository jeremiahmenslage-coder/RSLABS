import {cardSize,SUMMARY_SIZE,boxesOverlap} from '../geometry.js';
import {segmentHitsBox} from './metrics.js';
const pathLength=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
function orthogonal(start,end,boxes){
 const xs=[...new Set([start.x,end.x,...boxes.flatMap(b=>[b.x-8,b.x+b.w+8])])].sort((a,b)=>a-b);
 const ys=[...new Set([start.y,end.y,...boxes.flatMap(b=>[b.y-8,b.y+b.h+8])])].sort((a,b)=>a-b);
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
   const g=at.g+pathLength(at.p,p)+(at.dir&&at.dir!==dir?35:0),key=`${i},${j},${dir}`;
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
 const obstacles=boxes.map(b=>({x:b.x-16,y:b.y-16,w:b.w+32,h:b.h+32})),routes=new Map(),labels=[];
 for(const e of projection.edges){
  const a=nodes.get(e.sourceId),b=nodes.get(e.targetId),start={x:a.position.x+size.w+4,y:a.position.y+size.h/2},end={x:b.position.x-4,y:b.position.y+size.h/2};
  const exit={x:start.x+28,y:start.y},entry={x:end.x-28,y:end.y};
  const points=simplify([start,...orthogonal(exit,entry,obstacles),end]);
  const candidates=[];
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i];
   if(a.y===b.y&&Math.abs(a.x-b.x)>=74)for(const ratio of [.5,.3,.7])for(const dy of [-19,19,-40,40])candidates.push({x:a.x+(b.x-a.x)*ratio,y:a.y+dy});
   if(a.x===b.x&&Math.abs(a.y-b.y)>=34)for(const dx of [-40,40])candidates.push({x:a.x+dx,y:(a.y+b.y)/2});
  }
  const label=candidates.find(p=>{const box={x:p.x-33,y:p.y-14,w:66,h:28};return ![...boxes,...labels].some(b=>boxesOverlap(box,b));})??{x:(start.x+end.x)/2,y:(start.y+end.y)/2-19};
  labels.push({x:label.x-33,y:label.y-14,w:66,h:28});routes.set(e.id,{points,label});
 }
 return routes;
}
