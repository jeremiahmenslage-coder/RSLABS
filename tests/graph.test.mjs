import test from 'node:test';
import assert from 'node:assert/strict';
import {newFixture,EXPECTED_PAIRS} from '../src/fixture.js';
import {validateRoadmap,graphSignature,hardCycle,tryAddEdge,tryChangeKind} from '../src/model.js';
import {projectGraph} from '../src/projection.js';
import {optimizePositions,applyPositions,overlaps} from '../src/layout.js';

test('F1 exact seven goal names and SIX directed pairs',()=>{
 const doc=newFixture(),ns=doc.roadmap.nodes,es=doc.roadmap.edges;
 assert.deepEqual(ns.map(n=>n.title),['52 Sailing','Troubled Tortugans',"Belle's Folly",'Barrows armor','Crystal shield','Berserker ring','Perilous Moons']);
 assert.equal(ns.length,7);assert.equal(es.length,6);
 assert.deepEqual(es.map(e=>[e.sourceId,e.targetId]),EXPECTED_PAIRS);
 assert.equal(new Set(es.map(e=>e.id)).size,6);
 assert.deepEqual(validateRoadmap(doc),[]);
});
test('all three visibly typed edge semantics exist',()=>{
 assert.deepEqual(new Set(newFixture().roadmap.edges.map(e=>e.kind)),new Set(['hard','soft','order']));
});
test('invalid endpoints, self-edge, duplicate ordered pair cannot be added',()=>{
 const doc=newFixture(),before=graphSignature(doc);
 for(const [a,b] of [['sailing','sailing'],['missing','sailing'],['sailing','tortugans']]){
  assert.equal(tryAddEdge(doc,a,b,'order').ok,false);
  assert.equal(graphSignature(doc),before);
 }
});
test('hard cycles reject while soft/order cycles are permitted',()=>{
 const doc=newFixture();
 assert.equal(tryAddEdge(doc,'moons','barrows','hard').ok,false);
 assert.equal(tryAddEdge(doc,'moons','barrows','soft').ok,true);
 assert.equal(hardCycle(doc.roadmap.edges),false);
 assert.deepEqual(validateRoadmap(doc),[]);
 const before=graphSignature(doc);
 assert.equal(tryChangeKind(doc,doc.roadmap.edges.at(-1).id,'hard').ok,false);
 assert.equal(graphSignature(doc),before);
});
test('layout changes only positions, not schema edges and names',()=>{
 for(const density of ['compact','detailed']){
  const doc=newFixture(),before=graphSignature(doc),original=JSON.stringify(doc.roadmap.nodes.map(n=>n.position));
  applyPositions(doc,optimizePositions(doc,density));
  assert.notEqual(JSON.stringify(doc.roadmap.nodes.map(n=>n.position)),original);
  assert.equal(graphSignature(doc),before);
  assert.deepEqual(overlaps(doc,density),[]);
  assert.deepEqual(validateRoadmap(doc),[]);
 }
});
test('optimized six edges run left to right on exact acyclic fixture',()=>{
 const doc=newFixture();applyPositions(doc,optimizePositions(doc));
 const byId=new Map(doc.roadmap.nodes.map(n=>[n.id,n]));
 for(const e of doc.roadmap.edges) assert.ok(byId.get(e.targetId).position.x>byId.get(e.sourceId).position.x,`${e.id} not left to right`);
});
test('group collapse is presentation only and never fabricates graph links',()=>{
 const doc=newFixture(),sig=graphSignature(doc);
 doc.roadmap.groups[0].collapsed=true;
 const p=projectGraph(doc);
 assert.equal(p.summaries.length,1);assert.equal(p.summaries[0].nodeCount,3);
 assert.equal(p.summaries[0].externalCount,1);
 assert.equal(p.nodes.length,4);assert.equal(p.edges.length,3);
 assert.equal(doc.roadmap.edges.length,6);assert.equal(graphSignature(doc),sig);
 assert.equal(p.edges.every(e=>doc.roadmap.edges.some(stored=>e.id===stored.id)),true);
});
test('new outgoing edge demonstrates arbitrary divergence without cloning nodes',()=>{
 const doc=newFixture();const out=tryAddEdge(doc,'moons','sailing','order');
 assert.equal(out.ok,true);assert.equal(doc.roadmap.nodes.length,7);assert.equal(doc.roadmap.edges.length,7);
 assert.deepEqual(validateRoadmap(doc),[]);
});
test('missing group representative and corrupt coordinates rejected',()=>{
 const a=newFixture();a.roadmap.groups[0].representativeNodeId='nonexistent';
 assert.match(validateRoadmap(a).join(' '),/Representative missing/);
 const b=newFixture();b.roadmap.nodes[0].position.x=Infinity;
 assert.match(validateRoadmap(b).join(' '),/Position invalid/);
});
test('catalog references are stable and separate from roadmap goals',()=>{
 const doc=newFixture();assert.ok(doc.roadmap.nodes.every(n=>n.catalogRef===`demo:${n.id}`&&n.iconOverride===null));
});

test('visual representative must refer to an actual member, not another group',()=>{
 const d=newFixture();d.roadmap.groups[0].representativeNodeId='sailing';
 assert.match(validateRoadmap(d).join(' '),/Representative outside group/);
});
