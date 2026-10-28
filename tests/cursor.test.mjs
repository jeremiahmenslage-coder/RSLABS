import test from 'node:test';
import assert from 'node:assert/strict';
import {newFixture} from '../src/fixture.js';
import {reverseEdge,editNode} from '../src/model/actions.js';
import {RoadmapStore} from '../src/state/store.js';
import {exportRoadmap,previewImport} from '../src/storage/backup.js';
import {readValidated} from '../src/storage/indexeddb.js';
import {cursorPosition,contextTarget} from '../src/ui/cursor.js';
test('reverse keeps ID/type/other data and leaves input unchanged',()=>{
 const d=newFixture(),before=structuredClone(d),next=reverseEdge(d,'e1');assert.deepEqual(d,before);
 assert.deepEqual(next.roadmap.edges[0],{...d.roadmap.edges[0],sourceId:'tortugans',targetId:'sailing'});assert.deepEqual(next.roadmap.nodes,d.roadmap.nodes);assert.deepEqual(next.preferences,d.preferences);assert.deepEqual(next.roadmap.groups,d.roadmap.groups);assert.deepEqual(next.roadmap.edges.slice(1),d.roadmap.edges.slice(1));
});
test('reverse rejects duplicate ordered pair without modifying original',()=>{
 const d=newFixture();d.roadmap.edges.push({id:'reverse-pair',sourceId:'tortugans',targetId:'sailing',kind:'soft'});const before=structuredClone(d);assert.throws(()=>reverseEdge(d,'e1'),/Duplicate/);assert.deepEqual(d,before);
});
test('reverse rejects a newly formed hard cycle atomically',()=>{
 const d=newFixture();d.roadmap.edges=[{id:'ab',sourceId:'sailing',targetId:'tortugans',kind:'hard'},{id:'ac',sourceId:'sailing',targetId:'belle',kind:'hard'},{id:'cb',sourceId:'belle',targetId:'tortugans',kind:'hard'}];const before=structuredClone(d);assert.throws(()=>reverseEdge(d,'ab'),/cycle/);assert.deepEqual(d,before);
});
test('reverse rejects missing and invalid self-edge documents without mutation',()=>{
 const d=newFixture();assert.throws(()=>reverseEdge(d,'missing'),/no longer exists/);d.roadmap.edges[0].targetId='sailing';const before=structuredClone(d);assert.throws(()=>reverseEdge(d,'e1'),/Self edge/);assert.deepEqual(d,before);
});
test('reverse/rename/counters are undoable and roundtrip without completion inference',()=>{
 const original=newFixture(),s=new RoadmapStore(original);s.command(d=>reverseEdge(d,'e1'));s.command(d=>editNode(d,'sailing',{...d.roadmap.nodes[0],title:'Renamed',progress:{current:90,target:52}}));const after=structuredClone(s.current);assert.equal(after.roadmap.nodes[0].status,'not_started');
 s.undo();s.undo();assert.deepEqual(s.current,original);s.redo();s.redo();assert.deepEqual(s.current,after);assert.deepEqual(previewImport(exportRoadmap(after)).document,after);assert.deepEqual(readValidated(JSON.parse(JSON.stringify(after))),after);
});
test('cursor placement clamps panels to visible window edges',()=>{
 assert.deepEqual(cursorPosition({x:1495,y:1048},{w:340,h:300},{w:1500,h:1050}),{x:1152,y:742});assert.deepEqual(cursorPosition({x:-30,y:-20},{w:300,h:200},{w:1500,h:1050}),{x:8,y:8});assert.deepEqual(cursorPosition({x:400,y:200},{w:300,h:200},{w:1500,h:1050}),{x:408,y:208});
});
test('context target distinguishes explicit selection, outside singleton, edges and groups',()=>{
 const ids=['a','b'],goal=id=>({closest:selector=>selector==='[data-node-id]'?{dataset:{nodeId:id}}:null});
 assert.deepEqual(contextTarget(goal('a'),ids),{kind:'selection',ids:['a','b']});assert.deepEqual(contextTarget(goal('c'),ids),{kind:'goal',id:'c'});assert.deepEqual(ids,['a','b']);
 const edge={closest:selector=>selector==='[data-edge-id]'?{dataset:{edgeId:'ab'}}:null};assert.deepEqual(contextTarget(edge,ids),{kind:'edge',id:'ab'});
 const group={closest:selector=>selector==='[data-group-id],[data-summary-kind="group"]'?{dataset:{groupId:'g'}}:null};assert.deepEqual(contextTarget(group,ids),{kind:'group',id:'g'});assert.deepEqual(contextTarget({closest:()=>null},ids),{kind:'canvas'});
});
