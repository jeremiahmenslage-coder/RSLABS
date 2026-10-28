import {cardSize} from './geometry.js';
export function selectionRect(a,b){return {x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.abs(a.x-b.x),h:Math.abs(a.y-b.y)};}
// Call with projected goal cards only, never summaries or canonical hidden members.
export function enclosedGoals(nodes,density,rectangle){
 const {w,h}=cardSize(density);
 return enclosedCards(nodes.map(n=>({id:n.id,...n.position,w,h})),rectangle);
}
export function enclosedCards(cards,r){return cards.filter(c=>c.x>=r.x&&c.y>=r.y&&c.x+c.w<=r.x+r.w&&c.y+c.h<=r.y+r.h).map(c=>c.id);}
export function visibleSelection(ids,nodes){const visible=new Set(nodes.map(n=>n.id));return [...new Set(ids)].filter(id=>visible.has(id));}
