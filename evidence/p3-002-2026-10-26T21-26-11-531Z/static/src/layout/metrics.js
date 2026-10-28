import {cardSize,SUMMARY_SIZE,boxesOverlap} from '../geometry.js';
import {projectGraph} from '../projection.js';
export function segmentHitsBox(a,b,box){
 if(a.x===b.x)return a.x>box.x&&a.x<box.x+box.w&&Math.max(a.y,b.y)>box.y&&Math.min(a.y,b.y)<box.y+box.h;
 if(a.y===b.y)return a.y>box.y&&a.y<box.y+box.h&&Math.max(a.x,b.x)>box.x&&Math.min(a.x,b.x)<box.x+box.w;
 return false;
}
export function layoutMetrics(doc,routes){
 const p=projectGraph(doc),size=cardSize(doc.preferences.nodeDensity),boxes=[...p.nodes.map(n=>({id:n.id,...n.position,...size})),...p.summaries.map(s=>({id:`${s.kind}:${s.id}`,...s.position,...SUMMARY_SIZE}))];
 const overlaps=[],nodeIntersections=[],labelNodeOverlaps=[],labelOverlaps=[],crossings=[],sharedSegments=[],labelEdgeIntersections=[];const labels=[],segments=[];
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)if(boxesOverlap(boxes[i],boxes[j]))overlaps.push([boxes[i].id,boxes[j].id]);
 for(const [id,route] of routes){
  for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i];segments.push({id,a,b});for(const box of boxes)if(segmentHitsBox(a,b,box))nodeIntersections.push([id,box.id]);}
  if(route.label){const box={id,x:route.label.x-33,y:route.label.y-14,w:66,h:28};for(const node of boxes)if(boxesOverlap(box,node))labelNodeOverlaps.push([id,node.id]);for(const label of labels)if(boxesOverlap(box,label))labelOverlaps.push([id,label.id]);labels.push(box);}
 }
 for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++){
  const a=segments[i],b=segments[j];if(a.id===b.id)continue;
  if((a.a.x===a.b.x&&b.a.x===b.b.x&&a.a.x===b.a.x&&Math.min(Math.max(a.a.y,a.b.y),Math.max(b.a.y,b.b.y))-Math.max(Math.min(a.a.y,a.b.y),Math.min(b.a.y,b.b.y))>1)||
   (a.a.y===a.b.y&&b.a.y===b.b.y&&a.a.y===b.a.y&&Math.min(Math.max(a.a.x,a.b.x),Math.max(b.a.x,b.b.x))-Math.max(Math.min(a.a.x,a.b.x),Math.min(b.a.x,b.b.x))>1))sharedSegments.push([a.id,b.id]);
  const h=a.a.y===a.b.y?a:b,v=a.a.x===a.b.x?a:b;
  if(h===v||h.a.y!==h.b.y||v.a.x!==v.b.x)continue;
  if(v.a.x>Math.min(h.a.x,h.b.x)&&v.a.x<Math.max(h.a.x,h.b.x)&&h.a.y>Math.min(v.a.y,v.b.y)&&h.a.y<Math.max(v.a.y,v.b.y))crossings.push([a.id,b.id]);
 }
 const minX=Math.min(0,...boxes.map(b=>b.x)),minY=Math.min(0,...boxes.map(b=>b.y));
 for(const label of labels)for(const segment of segments)if(label.id!==segment.id&&segmentHitsBox(segment.a,segment.b,label))labelEdgeIntersections.push([label.id,segment.id]);
 return {visibleCards:boxes.length,width:Math.max(0,...boxes.map(b=>b.x+b.w))-minX,height:Math.max(0,...boxes.map(b=>b.y+b.h))-minY,cardOverlaps:overlaps,nodeIntersections,labelNodeOverlaps,labelOverlaps,crossings,sharedSegments,labelEdgeIntersections};
}
