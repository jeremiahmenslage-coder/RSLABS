import {artworkAssets} from '../assets/artwork.js';
import {skillTitle,validSkillGoal} from '../goal-rules.js';
import {CATEGORIES, EDGE_KINDS, STATUSES, validateRoadmap} from '../model.js';
const copy=value=>structuredClone(value);
let counter=0;
export const makeId=(prefix)=>`${prefix}_${typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`${Date.now().toString(36)}_${(++counter).toString(36)}`}`;
export const emptyRoadmap=()=>({schemaVersion:1,roadmap:{id:makeId('roadmap'),title:'My Ironman Roadmap',nodes:[],edges:[],groups:[]},preferences:{lastView:'graph',nodeDensity:'detailed',completedVisibility:'show',viewport:{x:0,y:0,zoom:1}}});
export function checked(doc){const errors=validateRoadmap(doc);if(errors.length)throw Error(errors.join('; '));return doc;}
export function mutate(doc,fn){const candidate=copy(doc);fn(candidate);return checked(candidate);}
export function nodeDetails(raw,existing=null){
 const skillGoal=raw.skillGoal===undefined?existing?.skillGoal:raw.skillGoal;
 if(skillGoal!==undefined&&skillGoal!==null&&(!validSkillGoal(skillGoal)||raw.category!=='skill'))throw Error('Select a skill and an explicit whole-number target level from 1 to 99.');
 const title=skillGoal?skillTitle(skillGoal):String(raw.title??'').trim(), category=raw.category, notes=String(raw.notes??'');
 if(!title||title.length>150)throw Error('Title is required (maximum 150 characters).');
 if(!CATEGORIES.includes(category))throw Error('Choose a valid goal category.');
 if(notes.length>5000)throw Error('Notes must be 5,000 characters or fewer.');
 const iconOverride=raw.iconOverride===undefined?(existing?.iconOverride??null):raw.iconOverride;
 if(iconOverride!==null&&iconOverride!==existing?.iconOverride&&!Object.hasOwn(artworkAssets,iconOverride)&&!/^(test:(sail-png|ring-webp|alternate-png|missing|scroll-svg|armor-svg|shield-svg|moon-svg)|local:(quest|skill|item|boss|diary|prayer|activity))$/.test(iconOverride))throw Error('Choose an available local icon reference.');
 const status=raw.status??existing?.status??'not_started';
 if(!STATUSES.includes(status))throw Error('Choose a valid manual status.');
 const progress=raw.progress===undefined?(existing?.progress??null):raw.progress;
 if(progress!==null&&!(Number.isFinite(progress.current)&&progress.current>=0&&Number.isFinite(progress.target)&&progress.target>0))throw Error('Counters require a current value of zero or more and a target greater than zero.');
 const catalogRef=raw.catalogRef===undefined?(existing?.catalogRef??null):raw.catalogRef;if(catalogRef!==null&&typeof catalogRef!=='string')throw Error('Invalid catalog reference.');
 return {title,category,notes,iconOverride,status,progress,catalogRef,...(skillGoal===undefined?{}:{skillGoal})};
}
export function createNode(doc,details,position){
 const fields=nodeDetails(details);const now=new Date().toISOString();
 if(!Number.isFinite(position?.x)||!Number.isFinite(position?.y))throw Error('Invalid canvas coordinates.');
 const id=makeId('node');
 return mutate(doc,d=>{d.roadmap.nodes.push({id,...fields,position:{x:Math.round(position.x),y:Math.round(position.y)},groupId:null,createdAt:now,updatedAt:now});});
}
export function editNode(doc,id,raw){const fields=nodeDetails(raw,doc.roadmap.nodes.find(n=>n.id===id));return mutate(doc,d=>{const n=d.roadmap.nodes.find(n=>n.id===id);if(!n)throw Error('Goal no longer exists.');Object.assign(n,fields,{updatedAt:new Date().toISOString()});});}
export function deleteNode(doc,id){return mutate(doc,d=>{if(!d.roadmap.nodes.some(n=>n.id===id))throw Error('Goal no longer exists.');d.roadmap.nodes=d.roadmap.nodes.filter(n=>n.id!==id);d.roadmap.edges=d.roadmap.edges.filter(e=>e.sourceId!==id&&e.targetId!==id);for(const g of d.roadmap.groups)if(g.representativeNodeId===id)g.representativeNodeId=null;if(d.preferences.navigation?.rootId===id)d.preferences.navigation={mode:'none',direction:'both',rootId:null};if(d.preferences.expandedCompleted)d.preferences.expandedCompleted=d.preferences.expandedCompleted.filter(x=>x!==id);});}
export function moveNodes(doc,positions){const ids=Object.keys(positions);if(!ids.length||ids.some(id=>!doc.roadmap.nodes.some(n=>n.id===id)))throw Error('Choose existing goals to move.');return mutate(doc,d=>{const now=new Date().toISOString();for(const n of d.roadmap.nodes)if(Object.hasOwn(positions,n.id)){const p=positions[n.id];if(!Number.isFinite(p?.x)||!Number.isFinite(p?.y))throw Error('Invalid position.');n.position={x:p.x,y:p.y};n.updatedAt=now;}});}
export function deleteGoals(doc,ids){if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length||ids.some(id=>!doc.roadmap.nodes.some(n=>n.id===id)))throw Error('Choose distinct existing goals to delete.');const selected=new Set(ids);return mutate(doc,d=>{d.roadmap.nodes=d.roadmap.nodes.filter(n=>!selected.has(n.id));d.roadmap.edges=d.roadmap.edges.filter(e=>!selected.has(e.sourceId)&&!selected.has(e.targetId));for(const g of d.roadmap.groups)if(selected.has(g.representativeNodeId))g.representativeNodeId=null;if(selected.has(d.preferences.navigation?.rootId))d.preferences.navigation={mode:'none',rootId:null,direction:'both'};if(d.preferences.expandedCompleted)d.preferences.expandedCompleted=d.preferences.expandedCompleted.filter(id=>!selected.has(id));});}
export function moveNode(doc,id,position){return mutate(doc,d=>{const n=d.roadmap.nodes.find(n=>n.id===id);if(!n)throw Error('Goal no longer exists.');if(!Number.isFinite(position.x)||!Number.isFinite(position.y))throw Error('Invalid position.');n.position={x:Math.round(position.x),y:Math.round(position.y)};n.updatedAt=new Date().toISOString();});}
export function connect(doc,sourceId,targetId,kind){if(!EDGE_KINDS.includes(kind))throw Error('Invalid relationship type.');return mutate(doc,d=>{d.roadmap.edges.push({id:makeId('edge'),sourceId,targetId,kind});});}
export function editEdge(doc,id,kind){if(!EDGE_KINDS.includes(kind))throw Error('Invalid relationship type.');return mutate(doc,d=>{const e=d.roadmap.edges.find(e=>e.id===id);if(!e)throw Error('Connection no longer exists.');e.kind=kind;});}
export function editConnection(doc,id,changes){return mutate(doc,d=>{
 const edge=d.roadmap.edges.find(e=>e.id===id);if(!edge)throw Error('Connection no longer exists.');
 for(const key of ['kind','sourceId','targetId'])if(Object.hasOwn(changes,key))edge[key]=changes[key];
});}
export function reverseEdge(doc,id){return mutate(doc,d=>{const edge=d.roadmap.edges.find(e=>e.id===id);if(!edge)throw Error('Connection no longer exists.');[edge.sourceId,edge.targetId]=[edge.targetId,edge.sourceId];});}
export function deleteEdge(doc,id){return mutate(doc,d=>{if(!d.roadmap.edges.some(e=>e.id===id))throw Error('Connection no longer exists.');d.roadmap.edges=d.roadmap.edges.filter(e=>e.id!==id);});}
export function withPositions(doc,positions){return mutate(doc,d=>{for(const n of d.roadmap.nodes){const p=positions.get(n.id);if(p)n.position={x:p.x,y:p.y};}});}
export function toggleGroup(doc,id){return mutate(doc,d=>{const g=d.roadmap.groups.find(g=>g.id===id);if(!g)throw Error('Group missing.');g.collapsed=!g.collapsed;});}
export function displayPreference(doc,fn){return mutate(doc,d=>fn(d.preferences));}
