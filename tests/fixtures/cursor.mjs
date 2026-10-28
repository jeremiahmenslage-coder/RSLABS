import {newFixture} from '../../src/fixture.js';
export function cursorFixture(){
 const d=newFixture(),base=d.roadmap.nodes[0];d.roadmap.id='p3-003-disposable';d.roadmap.title='Disposable cursor actions (illustrative links only)';
 d.roadmap.nodes=[['a',70,80,'not_started'],['b',390,80,'in_progress'],['c',70,320,'not_started'],['d',660,320,'completed']].map(([id,x,y,status])=>({...structuredClone(base),id,title:`Goal ${id}`,category:'custom',catalogRef:null,groupId:id==='a'||id==='b'?'g':null,status,progress:{current:0,target:10},notes:'original notes',position:{x,y}}));
 d.roadmap.groups=[{id:'g',title:'Independent goals',representativeNodeId:'a',collapsed:false}];d.roadmap.edges=[{id:'ab',sourceId:'a',targetId:'b',kind:'hard'},{id:'bc',sourceId:'b',targetId:'c',kind:'soft'}];d.preferences.viewport={x:30,y:20,zoom:1};return d;
}
