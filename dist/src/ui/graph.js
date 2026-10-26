import {projectGraph} from '../projection.js';
import {resolveNodeIcon,bindImageFallback} from '../assets/resolve.js';
const el=(tag,klass,text)=>{const e=document.createElement(tag);if(klass)e.className=klass;if(text!==undefined)e.textContent=text;return e;};
const svgNode=(tag,attrs={})=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
export class GraphView {
 constructor({viewport,world,edges,nodes,groups,gesture,scale,onNode,onEdge,onDragStart,onLinkStart,onPanStart,onDblClick}){
  Object.assign(this,{viewport,world,edges,nodes,groups,gesture,scale,onNode,onEdge,onDragStart,onLinkStart,onPanStart,onDblClick});
  this.zoom=1;this.tx=0;this.ty=0;this.density='detailed';this.doc=null;this.selected=null;this.pair=[];
  viewport.addEventListener('pointerdown',e=>{if(e.button===0&&!e.target.closest('.node-card,.group-summary,.edge,button'))onPanStart(e);});
  viewport.addEventListener('dblclick',e=>{if(e.target.closest('.node-card,.group-summary,.edge,button'))return;e.preventDefault();onDblClick(this.fromClient(e.clientX,e.clientY));});
  viewport.addEventListener('wheel',e=>{e.preventDefault();const p=this.local(e.clientX,e.clientY),a=this.fromClient(e.clientX,e.clientY);this.zoom=Math.min(2.2,Math.max(.35,this.zoom*(e.deltaY>0?.90:1.10)));this.tx=p.x-a.x*this.zoom;this.ty=p.y-a.y*this.zoom;this.transform();this.onViewport?.();},{passive:false});
 }
 dimensions(){return this.density==='compact'?{w:176,h:62}:{w:236,h:108};}
 setDocument(doc,{selected=this.selected,pair=this.pair}={}){this.doc=doc;this.density=doc.preferences.nodeDensity;this.selected=selected;this.pair=pair;this.render();}
 local(x,y){const r=this.viewport.getBoundingClientRect();return{x:x-r.left,y:y-r.top};}
 fromClient(x,y){const p=this.local(x,y);return{x:(p.x-this.tx)/this.zoom,y:(p.y-this.ty)/this.zoom};}
 setViewport(v){this.tx=v.x;this.ty=v.y;this.zoom=v.zoom;this.transform();}
 getViewport(){return{x:this.tx,y:this.ty,zoom:this.zoom};}
 transform(){this.world.style.transform=`translate(${this.tx}px,${this.ty}px) scale(${this.zoom})`;this.scale.textContent=`${Math.round(this.zoom*100)}%`;}
 fit(){const p=projectGraph(this.doc),{w,h}=this.dimensions(),items=[...p.nodes.map(n=>({...n.position,w,h})),...p.summaries.map(n=>({...n.position,w:264,h:135}))];if(!items.length){this.tx=35;this.ty=35;this.zoom=1;this.transform();this.onViewport?.();return;}
 const left=Math.min(...items.map(n=>n.x))-55,top=Math.min(...items.map(n=>n.y))-65,right=Math.max(...items.map(n=>n.x+n.w))+55,bottom=Math.max(...items.map(n=>n.y+n.h))+50;
 const r=this.viewport.getBoundingClientRect();this.zoom=Math.max(.35,Math.min(1.25,Math.min(r.width/(right-left),r.height/(bottom-top))));this.tx=(r.width-(right-left)*this.zoom)/2-left*this.zoom;this.ty=(r.height-(bottom-top)*this.zoom)/2-top*this.zoom;this.transform();this.onViewport?.();}
 render(){if(!this.doc)return;const p=projectGraph(this.doc);this.nodes.replaceChildren(...p.nodes.map(n=>this.node(n)));this.drawEdges(p);this.drawGroups(p);this.transform();}
 node(n){const selected=this.selected?.type==='node'&&this.selected.id===n.id,paired=this.pair.includes(n.id);const root=el('div',`node-card ${this.density}${selected?' selected':''}${paired?' pairing':''}`);
 root.dataset.nodeId=n.id;root.style.left=`${n.position.x}px`;root.style.top=`${n.position.y}px`;root.tabIndex=0;root.setAttribute('aria-label',`${n.title}, ${n.category}`);
 const pin=el('button','port in-port','●');pin.type='button';pin.title=`Input handle for ${n.title}`;pin.setAttribute('aria-label',pin.title);
 const pout=el('button','port out-port','+');pout.type='button';pout.title=`Output handle for ${n.title}`;pout.setAttribute('aria-label',pout.title);
 const icon=el('img','node-icon');const resolved=resolveNodeIcon(n);icon.src=resolved.src;icon.dataset.assetId=resolved.assetId||'fallback';bindImageFallback(icon,resolved.fallback);icon.alt='';icon.draggable=false;
 const text=el('div','node-info');text.append(el('small','node-category',n.category.toUpperCase()),el('strong','node-title',n.title));if(this.density==='detailed')text.append(el('span','node-subtitle',n.status.replace('_',' ')+' · user-defined planning'));
 const body=el('div','node-body');body.append(icon,text);root.append(pin,body,pout);
 root.addEventListener('click',e=>{if(!e.target.closest('.port'))this.onNode(n.id,e.shiftKey);});
 root.addEventListener('keydown',e=>{if(e.target===root&&(e.key==='Enter'||e.key===' ')){e.preventDefault();this.onNode(n.id,e.shiftKey);}});
 body.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();this.onDragStart(e,n.id);});
 pin.addEventListener('pointerdown',e=>e.stopPropagation());pout.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();this.onLinkStart(e,n.id);});
 return root;}
 drawEdges(p,preview){const {w,h}=this.dimensions();this.edges.replaceChildren();const defs=svgNode('defs');for(const [name,color] of [['hard','#e07a74'],['soft','#d8b169'],['order','#79aad9']]){const marker=svgNode('marker',{id:`arrow-${name}`,viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:7,markerHeight:7,orient:'auto'});marker.append(svgNode('path',{d:'M0 0 L10 5 L0 10 Z',fill:color}));defs.append(marker);}this.edges.append(defs);
 const byId=new Map(p.nodes.map(n=>[n.id,n])),incoming=new Map();for(const e of p.edges)incoming.set(e.targetId,[...(incoming.get(e.targetId)||[]),e.id]);
 for(const e of p.edges){const a=byId.get(e.sourceId),b=byId.get(e.targetId);if(!a||!b)continue;
 const apos=preview?.id===a.id?preview.position:a.position,bpos=preview?.id===b.id?preview.position:b.position;
 const incomingIds=incoming.get(e.targetId), idx=incomingIds.indexOf(e.id),offset=(idx-(incomingIds.length-1)/2)*14;
 const x1=apos.x+w-2,y1=apos.y+h/2,x2=bpos.x+2,y2=bpos.y+h/2+offset,dx=Math.max(55,Math.min(135,Math.abs(x2-x1)*.43));
 const d=`M${x1} ${y1} C${x1+dx} ${y1} ${x2-dx} ${y2} ${x2} ${y2}`;
 const g=svgNode('g',{class:`edge ${e.kind}${this.selected?.type==='edge'&&this.selected.id===e.id?' edge-selected':''}`,'data-edge-id':e.id});
 g.append(svgNode('path',{d,class:'edge-line','marker-end':`url(#arrow-${e.kind})`}),svgNode('path',{d,class:'edge-hit'}));
 const label=svgNode('g',{class:'edge-label',transform:`translate(${(x1+x2)/2} ${(y1+y2)/2-7})`});label.append(svgNode('rect',{x:-31,y:-13,width:62,height:26,rx:7}));const txt=svgNode('text',{x:0,y:4,'text-anchor':'middle'});txt.textContent=e.kind.toUpperCase();label.append(txt);g.append(label);
 g.addEventListener('click',event=>{event.stopPropagation();this.onEdge(e.id);});this.edges.append(g);
 }}
 drawGroups(p,preview){this.groups.replaceChildren();const {w,h}=this.dimensions();for(const group of this.doc.roadmap.groups){if(group.collapsed){const summary=p.summaries.find(g=>g.id===group.id);if(!summary)continue;const div=el('div','group-summary');div.style.left=`${summary.position.x}px`;div.style.top=`${summary.position.y}px`;div.append(el('div','summary-eyebrow','COLLAPSED VISUAL GROUP'),el('strong','',summary.title),el('p','',`${summary.nodeCount} goals · ${summary.externalCount} external relationships`),el('small','', 'Original edges remain stored; expand to inspect'));const b=el('button','','Expand group');b.type='button';b.addEventListener('click',()=>this.onGroup?.(group.id));div.append(b);this.groups.append(div);}
 else {const members=this.doc.roadmap.nodes.filter(n=>n.groupId===group.id);if(!members.length)continue;const positions=members.map(n=>preview?.id===n.id?preview.position:n.position),minX=Math.min(...positions.map(p=>p.x)),minY=Math.min(...positions.map(p=>p.y)),maxX=Math.max(...positions.map(p=>p.x+w)),maxY=Math.max(...positions.map(p=>p.y+h));const frame=el('div','group-frame');frame.style.left=`${minX-22}px`;frame.style.top=`${minY-33}px`;frame.style.width=`${maxX-minX+44}px`;frame.style.height=`${maxY-minY+55}px`;frame.append(el('span','','⊞ '+group.title.toUpperCase()+' · VISUAL ONLY'));this.groups.append(frame);}}}
 previewPosition(id,position){const card=[...this.nodes.children].find(el=>el.dataset.nodeId===id);if(card){card.style.left=`${position.x}px`;card.style.top=`${position.y}px`;}const p=projectGraph(this.doc),preview={id,position};this.drawEdges(p,preview);this.drawGroups(p,preview);}
 gestureFrom(start,x,y){this.gesture.replaceChildren();const a=this.local(start.x,start.y),b=this.local(x,y);this.gesture.append(svgNode('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:'#f5c977','stroke-width':3,'stroke-dasharray':'8 5'}));}
 clearGesture(){this.gesture.replaceChildren();}
}
