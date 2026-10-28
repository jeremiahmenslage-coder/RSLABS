import {projectGraph} from '../projection.js';
import {cardSize,SUMMARY_SIZE} from '../geometry.js';
let engine;
export async function elkEngine(){if(!engine){const module=await import('../vendor/elkjs/elk.bundled.js');engine=new (module.default??globalThis.ELK)();}return engine;}
export const layoutKey=doc=>JSON.stringify({density:doc.preferences.nodeDensity,visibility:doc.preferences.completedVisibility,navigation:doc.preferences.navigation,expanded:doc.preferences.expandedCompleted,
 nodes:doc.roadmap.nodes.map(n=>[n.id,n.position,n.groupId,n.status]),groups:doc.roadmap.groups,edges:doc.roadmap.edges});
export function layoutInput(doc){
 const projection=projectGraph(doc),size=cardSize(doc.preferences.nodeDensity),ids=new Map(projection.nodes.map((n,i)=>[n.id,`n${i}`]));
 const node=n=>{const id=ids.get(n.id);return {id,width:size.w,height:size.h,layoutOptions:{'elk.portConstraints':'FIXED_POS'},ports:[
  {id:`${id}:in`,x:-2,y:size.h/2-2,width:4,height:4,layoutOptions:{'elk.port.side':'WEST'}},
  {id:`${id}:out`,x:size.w-2,y:size.h/2-2,width:4,height:4,layoutOptions:{'elk.port.side':'EAST'}}]};};
 const children=projection.nodes.filter(n=>!n.groupId).map(node);
 for(const [i,g] of doc.roadmap.groups.entries()){
  const members=projection.nodes.filter(n=>n.groupId===g.id);if(members.length)children.push({id:`g${i}`,layoutOptions:{'elk.padding':'[top=44,left=28,bottom=28,right=28]'},children:members.map(node)});
 }
 for(const [i,s] of projection.summaries.entries())children.push({id:`s${i}`,width:SUMMARY_SIZE.w,height:SUMMARY_SIZE.h});
 const edges=projection.edges.map((e,i)=>({id:`e${i}`,sources:[`${ids.get(e.sourceId)}:out`],targets:[`${ids.get(e.targetId)}:in`],labels:[{id:`label${i}`,text:e.kind.toUpperCase(),width:66,height:28}]}));
 return {input:{id:'root',layoutOptions:{'elk.algorithm':'layered','elk.direction':'RIGHT','elk.edgeRouting':'ORTHOGONAL','elk.hierarchyHandling':'INCLUDE_CHILDREN',
  'elk.spacing.nodeNode':'80','elk.layered.spacing.nodeNodeBetweenLayers':'70','elk.spacing.componentComponent':'100','elk.layered.spacing.edgeNodeBetweenLayers':'36',
  'elk.spacing.edgeNode':'30','elk.spacing.edgeEdge':'20','elk.layered.nodePlacement.strategy':'BRANDES_KOEPF','elk.separateConnectedComponents':'true','elk.randomSeed':'1'},children,edges},projection,ids};
}
export async function optimizeGraph(doc,{engine:adapter}={}){
 const {input,projection,ids}=layoutInput(doc),elk=adapter??await elkEngine(),result=await elk.layout(input);
 const boxes=new Map(),positions=new Map(),routes=new Map();
 function visit(g,ox=0,oy=0){for(const n of g.children??[]){const x=ox+n.x,y=oy+n.y;boxes.set(n.id,{x,y,w:n.width,h:n.height});visit(n,x,y);}}
 visit(result);
 for(const n of projection.nodes){const p=boxes.get(ids.get(n.id));if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))throw Error('Layout returned invalid coordinates.');positions.set(n.id,{x:p.x,y:p.y});}
 for(const [i,s] of projection.summaries.entries()){
  const p=boxes.get(`s${i}`);for(const id of s.members){const n=doc.roadmap.nodes.find(n=>n.id===id);positions.set(id,{x:n.position.x+p.x-s.position.x,y:n.position.y+p.y-s.position.y});}
 }
 for(const [i,e] of projection.edges.entries()){
  const laid=(result.edges??[]).find(edge=>edge.id===`e${i}`),section=laid?.sections?.[0];
  if(section){const offset=boxes.get(laid.container)??{x:0,y:0};const points=[section.startPoint,...section.bendPoints??[],section.endPoint].map(p=>({x:p.x+offset.x,y:p.y+offset.y}));routes.set(e.id,{points,label:laid.labels?.[0]?{x:laid.labels[0].x+33+offset.x,y:laid.labels[0].y+14+offset.y}:null});}
 }
 return {positions,routes,projection,input,result};
}
