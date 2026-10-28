import test from 'node:test';
import assert from 'node:assert/strict';
import {newFixture} from '../src/fixture.js';
import {raidFixture} from './fixtures/phase3.mjs';
import {enclosedGoals,selectionRect,visibleSelection} from '../src/selection.js';
import {projectGraph} from '../src/projection.js';
import {bulkAction} from '../src/model/bulk.js';
import {RoadmapStore} from '../src/state/store.js';
import {SaveCoordinator,readValidated} from '../src/storage/indexeddb.js';
import {previewImport,exportRoadmap} from '../src/storage/backup.js';
test('region containment selects complete card bounds, including reverse drags and density differences',()=>{
 const nodes=[{id:'a',position:{x:10,y:20}},{id:'b',position:{x:250,y:20}},{id:'partial',position:{x:400,y:30}}];
 assert.deepEqual(enclosedGoals(nodes,'detailed',selectionRect({x:0,y:0},{x:486,y:128})),['a','b']);
 assert.deepEqual(enclosedGoals(nodes,'detailed',selectionRect({x:486,y:128},{x:0,y:0})),['a','b']);
 assert.deepEqual(enclosedGoals(nodes,'detailed',{x:11,y:20,w:235,h:108}),[]);
 assert.deepEqual(enclosedGoals(nodes,'compact',{x:10,y:20,w:176,h:76}),['a']);
 assert.deepEqual(enclosedGoals(nodes,'detailed',{x:10,y:20,w:176,h:76}),[]);
});
test('projection scope excludes collapsed/hidden goals and summaries; selection is pruned without implicit additions',()=>{
 const d=raidFixture();d.roadmap.groups.find(g=>g.id==='toa-group').collapsed=true;d.roadmap.nodes.find(n=>n.id==='prayer').status='completed';d.preferences.completedVisibility='hide';
 const p=projectGraph(d),ids=enclosedGoals(p.nodes,'detailed',{x:-1000,y:-1000,w:10000,h:10000});
 for(const id of ['toa','fang','lightbearer','prayer'])assert.equal(ids.includes(id),false);
 assert.deepEqual(visibleSelection(['toa','sailing','sailing','prayer'],p.nodes),['sailing']);
 d.preferences.navigation={mode:'focus',rootId:'island',direction:'both'};assert.deepEqual(enclosedGoals(projectGraph(d).nodes,'detailed',{x:-1000,y:-1000,w:10000,h:10000}),['island']);
});
test('bulk status changes exactly selected IDs without counters, positions or completion propagation',()=>{
 const d=raidFixture();d.roadmap.nodes.find(n=>n.id==='toa').progress={current:200,target:1};const before=structuredClone(d),ids=['toa','prayer'];
 const next=bulkAction(d,ids,{kind:'status',status:'completed'});assert.deepEqual(d,before);assert.deepEqual(next.roadmap.edges,d.roadmap.edges);assert.deepEqual(next.roadmap.groups,d.roadmap.groups);assert.deepEqual(next.preferences,d.preferences);
 for(const n of next.roadmap.nodes){const old=d.roadmap.nodes.find(x=>x.id===n.id);if(ids.includes(n.id)){assert.equal(n.status,'completed');assert.deepEqual(n.progress,old.progress);assert.deepEqual(n.position,old.position);assert.equal(n.groupId,old.groupId);}else assert.deepEqual(n,old);}
 for(const status of ['not_started','in_progress','completed'])assert.equal(bulkAction(d,['toa'],{kind:'status',status}).roadmap.nodes.find(n=>n.id==='toa').status,status);
 assert.equal(next.roadmap.nodes.find(n=>n.id==='fang').status,'not_started');
});
test('create group uses only explicit members and preserves other group members and independent state',()=>{
 const d=raidFixture(),before=structuredClone(d);const next=bulkAction(d,['toa','fang'],{kind:'create_group',title:' Selected goals '});const group=next.roadmap.groups.at(-1);
 assert.equal(group.title,'Selected goals');assert.equal(group.representativeNodeId,null);assert.equal(group.collapsed,false);
 assert.deepEqual(next.roadmap.nodes.filter(n=>n.groupId===group.id).map(n=>n.id),['toa','fang']);assert.equal(next.roadmap.nodes.find(n=>n.id==='lightbearer').groupId,'toa-group');
 assert.equal(next.roadmap.groups.find(g=>g.id==='toa-group').representativeNodeId,null);assert.deepEqual(next.roadmap.edges,d.roadmap.edges);assert.deepEqual(d,before);
 for(const n of next.roadmap.nodes){const old=d.roadmap.nodes.find(x=>x.id===n.id);assert.deepEqual({...n,groupId:old.groupId},old);}
});
test('add and ungroup preserve target members, collapse state, and valid representatives',()=>{
 const d=raidFixture();d.roadmap.groups[0].representativeNodeId='ring';d.roadmap.groups[0].collapsed=true;
 const next=bulkAction(d,['toa','fang'],{kind:'add_to_group',groupId:'loadout'});
 assert.equal(next.roadmap.groups[0].collapsed,true);assert.equal(next.roadmap.groups[0].representativeNodeId,'ring');assert.equal(next.roadmap.groups[1].representativeNodeId,null);
 assert.equal(next.roadmap.nodes.filter(n=>n.groupId==='loadout').length,5);assert.equal(next.roadmap.nodes.find(n=>n.id==='lightbearer').groupId,'toa-group');
 const ungrouped=bulkAction(next,['ring','toa'],{kind:'ungroup'});assert.equal(ungrouped.roadmap.groups[0].representativeNodeId,null);assert.equal(ungrouped.roadmap.nodes.find(n=>n.id==='fang').groupId,'loadout');assert.equal(ungrouped.roadmap.nodes.find(n=>n.id==='toa').groupId,null);
 assert.deepEqual(ungrouped.roadmap.edges,d.roadmap.edges);
});
test('invalid bulk action rejects atomically without modifying roadmap',()=>{
 const d=newFixture(),before=structuredClone(d);
 for(const [ids,action] of [[[],{kind:'ungroup'}],[['sailing','sailing'],{kind:'ungroup'}],[['missing'],{kind:'status',status:'completed'}],[['sailing'],{kind:'status',status:'auto'}],[['sailing'],{kind:'add_to_group',groupId:'missing'}],[['sailing'],{kind:'create_group',title:''}],[['sailing'],{kind:'create_group',title:'a'.repeat(151)}],[['sailing'],{kind:'unknown'}]])assert.throws(()=>bulkAction(d,ids,action));
 assert.deepEqual(d,before);
});
test('each bulk action adds a single history step; no-op adds none; roundtrip/reload retains all data',()=>{
 const original=raidFixture(),store=new RoadmapStore(original);const actions=[{kind:'create_group',title:'Bulk group'},{kind:'status',status:'completed'},{kind:'add_to_group',groupId:'loadout'},{kind:'ungroup'}];
 for(const action of actions){const length=store.undoStack.length;store.command(d=>bulkAction(d,['toa','fang'],action));assert.equal(store.undoStack.length,length+1);}
 const final=structuredClone(store.current);for(let i=0;i<4;i++)store.undo();assert.deepEqual(store.current,original);for(let i=0;i<4;i++)store.redo();assert.deepEqual(store.current,final);
 assert.deepEqual(previewImport(exportRoadmap(final)).document,final);assert.deepEqual(readValidated(JSON.parse(JSON.stringify(final))),final);
 assert.equal(store.command(d=>bulkAction(d,['toa','fang'],{kind:'status',status:'completed'})),false);assert.equal(store.undoStack.length,4);
});
test('failed bulk autosave preserves committed roadmap; Retry writes exactly the selected change',async()=>{
 const original=raidFixture();let durable=structuredClone(original),fail=true;
 const saver=new SaveCoordinator({write:async d=>{if(fail)throw Error('test quota');durable=structuredClone(d);}}),store=new RoadmapStore(original);
 store.subscribe(d=>saver.enqueue(d,{immediate:true}));store.command(d=>bulkAction(d,['toa','fang'],{kind:'status',status:'in_progress'}));
 await assert.rejects(saver.whenSettled());assert.deepEqual(durable,original);assert.equal(saver.state,'failed');
 fail=false;await saver.retry();await saver.whenSettled();assert.deepEqual(durable,store.current);assert.equal(durable.roadmap.nodes.find(n=>n.id==='lightbearer').status,'not_started');
});
