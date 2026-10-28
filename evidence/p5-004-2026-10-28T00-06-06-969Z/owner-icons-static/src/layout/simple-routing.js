import {cardSize,SUMMARY_SIZE,boxesOverlap} from '../geometry.js';
import {segmentHitsBox} from './metrics.js';
const length=points=>points.slice(1).reduce((n,p,i)=>n+Math.abs(p.x-points[i].x)+Math.abs(p.y-points[i].y),0);
const compact=points=>points.filter((p,i)=>!i||p.x!==points[i-1].x||p.y!==points[i-1].y).filter((p,i,a)=>i<=1||i>=a.length-2||!((a[i-1].x===p.x&&p.x===a[i+1].x)||(a[i-1].y===p.y&&p.y===a[i+1].y)));
export function previewRoute(start,end){const exit={x:start.x+24,y:start.y},entry={x:end.x-24,y:end.y};const lane=Math.min(start.y,end.y)-55;const points=compact(start.x+48<end.x?[start,exit,{x:(exit.x+entry.x)/2,y:start.y},{x:(exit.x+entry.x)/2,y:end.y},entry,end]:[start,exit,{x:exit.x,y:lane},{x:entry.x,y:lane},entry,end]);return {points,label:labelFor(points)};}
function labelFor(points){let best=0,index=1;for(let i=1;i<points.length;i++){const n=Math.abs(points[i].x-points[i-1].x)+Math.abs(points[i].y-points[i-1].y);if(n>best){best=n;index=i;}}return {x:(points[index-1].x+points[index].x)/2,y:(points[index-1].y+points[index].y)/2-19};}
function hit(points,box){return points.slice(1).some((p,i)=>segmentHitsBox(points[i],p,box));}
function conflicts(points,occupied){let score=0;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];for(const s of occupied){if(a.x===b.x&&s.a.x===s.b.x&&a.x===s.a.x)score+=Math.max(0,Math.min(Math.max(a.y,b.y),Math.max(s.a.y,s.b.y))-Math.max(Math.min(a.y,b.y),Math.min(s.a.y,s.b.y)))*.2;else if(a.y===b.y&&s.a.y===s.b.y&&a.y===s.a.y)score+=Math.max(0,Math.min(Math.max(a.x,b.x),Math.max(s.a.x,s.b.x))-Math.max(Math.min(a.x,b.x),Math.min(s.a.x,s.b.x)))*.2;else{const h=a.y===b.y?{a,b}:s,v=a.x===b.x?{a,b}:s;if(h.a.y===h.b.y&&v.a.x===v.b.x&&v.a.x>Math.min(h.a.x,h.b.x)&&v.a.x<Math.max(h.a.x,h.b.x)&&h.a.y>Math.min(v.a.y,v.b.y)&&h.a.y<Math.max(v.a.y,v.b.y))score+=6;}}}return score;}
export function simpleRoutes(doc,projection,{previous=null}={}){
 const size=cardSize(doc.preferences.nodeDensity),nodes=new Map(projection.nodes.map(n=>[n.id,n])),boxes=[...projection.nodes.map(n=>({id:n.id,...n.position,...size})),...projection.summaries.map(s=>({id:s.id,...s.position,...SUMMARY_SIZE}))],routes=new Map(),occupied=[],labels=[];
 const lanes=new Map();for(const side of ['sourceId','targetId']){const byNode=new Map();for(const e of projection.edges){const ids=byNode.get(e[side])??[];ids.push(e.id);byNode.set(e[side],ids);}for(const [id,ids]of byNode){ids.sort();ids.forEach((edge,i)=>lanes.set(side+':'+edge,ids.length===1?0:-10+20*i/(ids.length-1)));}}
 for(const e of projection.edges){const a=nodes.get(e.sourceId),b=nodes.get(e.targetId);if(!a||!b)continue;const start={x:a.position.x+size.w+4,y:a.position.y+size.h/2+lanes.get('sourceId:'+e.id)},end={x:b.position.x-4,y:b.position.y+size.h/2+lanes.get('targetId:'+e.id)},exit={x:start.x+24,y:start.y},entry={x:end.x-24,y:end.y},old=previous?.get(e.id);
  if(old&&old.points[0].x===start.x&&old.points[0].y===start.y&&old.points.at(-1).x===end.x&&old.points.at(-1).y===end.y&&!boxes.some(box=>hit(old.points,box))){const labelBox={x:old.label.x-33,y:old.label.y-14,w:66,h:28};routes.set(e.id,boxes.some(box=>boxesOverlap(labelBox,box))?{points:old.points,label:{...old.label}}:old);}
  else{const candidates=[];
   if(exit.x<=entry.x){const xs=[(exit.x+entry.x)/2,exit.x,entry.x,...boxes.flatMap(r=>[r.x-20,r.x+r.w+20]).filter(x=>x>=exit.x&&x<=entry.x)].sort((x,y)=>Math.abs(x-(exit.x+entry.x)/2)-Math.abs(y-(exit.x+entry.x)/2));for(const x of [...new Set(xs)].slice(0,18))candidates.push(compact([start,exit,{x,y:start.y},{x,y:end.y},entry,end]));}
   const ys=[Math.min(a.position.y,b.position.y)-24,Math.max(a.position.y,b.position.y)+size.h+24,...boxes.flatMap(r=>[r.y-24,r.y+r.h+24])].sort((x,y)=>Math.abs(x-(start.y+end.y)/2)-Math.abs(y-(start.y+end.y)/2));
   for(const y of [...new Set(ys)].slice(0,36))candidates.push(compact([start,exit,{x:exit.x,y},{x:entry.x,y},entry,end]));
   let best=null,score=Infinity;for(const points of candidates){const n=boxes.filter(box=>hit(points,box)).length*1000000+length(points)+(points.length-2)*8+conflicts(points,occupied);if(n<score){score=n;best=points;}}
   const points=best??previewRoute(start,end).points;routes.set(e.id,{points,label:labelFor(points)});
  }
  const route=routes.get(e.id);for(let i=1;i<route.points.length;i++)occupied.push({a:route.points[i-1],b:route.points[i]});
 }
 // Labels avoid cards first; route crossings are allowed, never a reason for huge detours.
 for(const [id,route]of routes)if(previous?.get(id)===route)labels.push({x:route.label.x-33,y:route.label.y-14,w:66,h:28});
 for(const [id,route]of routes){if(previous?.get(id)===route)continue;const candidates=[];for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i];for(const ratio of [.5,.3,.7,.1,.9])for(const offset of [-19,19,-40,40,-60,60,-80,80])candidates.push({x:a.x+(b.x-a.x)*ratio+(a.x===b.x?offset:0),y:a.y+(b.y-a.y)*ratio+(a.y===b.y?offset:0)});}const label=candidates.find(p=>![...boxes,...labels].some(box=>boxesOverlap({x:p.x-33,y:p.y-14,w:66,h:28},box)))??route.label;route.label=label;labels.push({x:label.x-33,y:label.y-14,w:66,h:28});}
 return routes;
}


