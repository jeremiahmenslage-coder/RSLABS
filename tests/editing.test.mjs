import test from 'node:test';
import assert from 'node:assert/strict';
import {cursorFixture} from './fixtures/cursor.mjs';
import {editConnection,editEdge} from '../src/model/actions.js';
import {RoadmapStore} from '../src/state/store.js';
import {exportRoadmap,previewImport} from '../src/storage/backup.js';
const fixture=()=>{const d=cursorFixture();d.roadmap.edges=[{id:'ab',sourceId:'a',targetId:'b',kind:'order'},{id:'bc',sourceId:'b',targetId:'c',kind:'hard'},{id:'ca',sourceId:'c',targetId:'a',kind:'hard'}];return d;};
test('combined edit validates final type/endpoints without rejecting the intermediate hard cycle',()=>{
 const d=fixture(),before=structuredClone(d);assert.throws(()=>editEdge(d,'ab','hard'),/cycle/);
 const next=editConnection(d,'ab',{kind:'hard',sourceId:'b',targetId:'a'});assert.deepEqual(next.roadmap.edges[0],{id:'ab',sourceId:'b',targetId:'a',kind:'hard'});assert.deepEqual(d,before);assert.deepEqual(next.roadmap.nodes,d.roadmap.nodes);assert.deepEqual(next.roadmap.edges.slice(1),d.roadmap.edges.slice(1));assert.deepEqual(next.preferences,d.preferences);
});
test('combined edit rejects final cycles, duplicate pairs and invalid references without mutation/history changes',()=>{
 for(const changes of [{kind:'hard',sourceId:'a',targetId:'b'},{kind:'soft',sourceId:'b',targetId:'c'},{sourceId:'missing'},{sourceId:'b',targetId:'b'},{kind:'invalid'}]){
  const d=fixture(),before=structuredClone(d),s=new RoadmapStore(d);assert.throws(()=>s.command(doc=>editConnection(doc,'ab',changes)));assert.deepEqual(d,before);assert.deepEqual(s.current,before);assert.equal(s.undoStack.length,0);assert.equal(s.redoStack.length,0);
 }
});
test('combined success is one history step and preserves JSON recovery and independent goal state',()=>{
 const d=fixture(),s=new RoadmapStore(d);s.command(doc=>editConnection(doc,'ab',{kind:'hard',sourceId:'b',targetId:'a'}));const after=structuredClone(s.current);assert.equal(s.undoStack.length,1);s.undo();assert.deepEqual(s.current,d);s.redo();assert.deepEqual(s.current,after);assert.deepEqual(previewImport(exportRoadmap(after)).document,after);assert.deepEqual(after.roadmap.nodes,d.roadmap.nodes);
});
