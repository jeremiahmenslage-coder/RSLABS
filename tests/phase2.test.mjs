import test from 'node:test';
import assert from 'node:assert/strict';
import {newFixture} from '../src/fixture.js';
import {readiness,validateRoadmap} from '../src/model.js';
import {editNode,toggleGroup,connect} from '../src/model/actions.js';
import {RoadmapStore} from '../src/state/store.js';
import {BackupSession,exportRoadmap,previewImport} from '../src/storage/backup.js';
import {SaveCoordinator,readValidated} from '../src/storage/indexeddb.js';
import {resolveNodeIcon} from '../src/assets/resolve.js';
const edit=(d,id,fields)=>editNode(d,id,{...d.roadmap.nodes.find(n=>n.id===id),...fields});
test('soft/order predecessors never block regardless of completion or counters',()=>{
 let d=newFixture();d=edit(d,'sailing',{progress:{current:0,target:52}});
 assert.equal(readiness(d).get('tortugans'),'Ready');assert.equal(readiness(d).get('belle'),'Ready');
 d=edit(d,'sailing',{status:'completed'});assert.equal(d.roadmap.nodes.find(n=>n.id==='tortugans').status,'not_started');
});
test('multiple hard prerequisites, completed override, independent branches and counters',()=>{
 let d=newFixture();d.roadmap.edges.find(e=>e.id==='e4').kind='hard';
 assert.equal(readiness(d).get('ring'),'Blocked');assert.equal(readiness(d).get('tortugans'),'Ready');assert.equal(readiness(d).get('belle'),'Ready');
 d=edit(d,'barrows',{status:'completed'});assert.equal(readiness(d).get('ring'),'Blocked');
 d=edit(d,'crystal',{status:'completed'});assert.equal(readiness(d).get('ring'),'Ready');
 d=edit(d,'ring',{progress:{current:110,target:100},status:'in_progress'});
 assert.equal(d.roadmap.nodes.find(n=>n.id==='ring').status,'in_progress');assert.equal(readiness(d).get('moons'),'Blocked');
 d=edit(d,'moons',{status:'completed'});assert.equal(readiness(d).get('moons'),'Completed');assert.equal(d.roadmap.nodes.find(n=>n.id==='ring').status,'in_progress');
 d=edit(d,'crystal',{status:'not_started'});assert.equal(readiness(d).get('moons'),'Completed');
});
test('one reused goal feeds branches with no duplicated state or completion propagation',()=>{
 let d=newFixture();d=connect(d,'barrows','sailing','hard');const count=d.roadmap.nodes.length;
 assert.equal(readiness(d).get('ring'),'Blocked');assert.equal(readiness(d).get('sailing'),'Blocked');
 d=edit(d,'barrows',{status:'completed'});assert.equal(readiness(d).get('ring'),'Ready');assert.equal(readiness(d).get('sailing'),'Ready');
 assert.equal(d.roadmap.nodes.length,count);assert.equal(d.roadmap.nodes.find(n=>n.id==='sailing').status,'not_started');
});
test('collapsed and offscreen nodes remain canonical prerequisites',()=>{
 let d=newFixture();d=edit(d,'barrows',{status:'in_progress'});const before=[...readiness(d)];
 d=toggleGroup(d,'loadout');d.roadmap.nodes.find(n=>n.id==='barrows').position={x:100000,y:-100000};
 assert.deepEqual([...readiness(d)],before);assert.equal(readiness(d).get('ring'),'Blocked');
});
test('manual progression edits undo/redo and reload with stable Phase 1 IDs',()=>{
 const original=newFixture(),s=new RoadmapStore(original);s.command(d=>edit(d,'sailing',{status:'in_progress',progress:{current:0,target:52}}));
 const updated=structuredClone(s.current);s.undo();assert.deepEqual(s.current,original);s.redo();assert.deepEqual(s.current,updated);
 assert.deepEqual(readValidated(JSON.parse(JSON.stringify(s.current))),updated);assert.deepEqual(s.current.roadmap.nodes.map(n=>n.id),original.roadmap.nodes.map(n=>n.id));
});
test('invalid counters/status rejected without mutating source; counters can be removed',()=>{
 const d=newFixture(),before=structuredClone(d);
 for(const fields of [{status:'auto'},{progress:{current:-1,target:10}},{progress:{current:0,target:0}},{progress:{current:1,target:Infinity}},{progress:{target:20}}])assert.throws(()=>edit(d,'sailing',fields));
 assert.deepEqual(d,before);const next=edit(edit(d,'sailing',{progress:{current:0,target:52}}),'sailing',{progress:null});assert.equal(next.roadmap.nodes[0].progress,null);
});
test('complete schema roundtrip preserves every field and unknown icon references',()=>{
 let d=newFixture();d=edit(d,'barrows',{status:'completed',progress:{current:7,target:6}});d=toggleGroup(d,'loadout');
 d.preferences.viewport={x:12,y:27,zoom:1.2};d.preferences.nodeDensity='compact';d.roadmap.nodes[0].iconOverride='external:retained';
 const parsed=previewImport(exportRoadmap(d));assert.deepEqual(parsed.document,d);assert.ok(parsed.unknownIcons>0);
 assert.equal(resolveNodeIcon(parsed.document.roadmap.nodes[0]).source,'pinned_category_asset'); // Unknown individual refs stay preserved but inactive in P5-003.
 assert.equal(edit(parsed.document,'sailing',{notes:'still editable'}).roadmap.nodes[0].iconOverride,'external:retained');
 for(const ref of ['auto','','__keep_existing','https://example.invalid/icon.png']){const copy=structuredClone(d);copy.roadmap.nodes[0].iconOverride=ref;assert.equal(edit(previewImport(exportRoadmap(copy)).document,'sailing',{notes:'keep exact ref'}).roadmap.nodes[0].iconOverride,ref);}
});
test('malformed/unsupported/broken references/duplicates/hard cycles reject detached copies',()=>{
 const source=newFixture(),before=structuredClone(source);assert.throws(()=>previewImport('{bad'));
 const variants=[null,[],{}, {...source,schemaVersion:2}];
 for(const change of [d=>d.roadmap.nodes.push(null),d=>d.roadmap.edges.push(null),d=>d.roadmap.groups.push(null),d=>d.roadmap.edges[0].sourceId='missing',d=>d.roadmap.nodes[0].groupId='missing',d=>d.roadmap.groups[0].representativeNodeId='missing',d=>d.roadmap.nodes[1].id='sailing',d=>d.roadmap.edges.push({id:'cycle',sourceId:'ring',targetId:'barrows',kind:'hard'})]){const d=structuredClone(source);change(d);variants.push(d);}
 for(const bad of variants)assert.throws(()=>previewImport(JSON.stringify(bad)));
 assert.deepEqual(source,before);
});
test('backup prerequisite tracks exact current content; cancel clears preview',()=>{
 const d=newFixture(),session=new BackupSession();session.prepare(exportRoadmap(d));assert.equal(session.canReplace(d),false);assert.throws(()=>session.replacement(d));
 session.export(d);assert.equal(session.canReplace(d),true);assert.deepEqual(session.replacement(d),d);
 const changed=edit(d,'sailing',{status:'completed'});assert.equal(session.canReplace(changed),false);
 session.cancel();assert.equal(session.canReplace(d),false);assert.deepEqual(validateRoadmap(d),[]);
});
test('durable replacement waits for pending saves then applies exactly after successful write',async()=>{
 const d=newFixture(),candidate=edit(d,'sailing',{status:'completed'});let disk=structuredClone(d),active=d;const order=[];
 const saver=new SaveCoordinator({write:async doc=>{await new Promise(r=>setTimeout(r,2));disk=structuredClone(doc);order.push('write');}});
 saver.enqueue(d);await saver.replaceDurably(candidate,doc=>{assert.deepEqual(disk,candidate);active=doc;order.push('apply');});
 assert.deepEqual(order,['write','write','apply']);assert.deepEqual(active,candidate);assert.equal(saver.state,'saved');
});
test('failed replacement preserves active and committed roadmap and does not queue candidate for retry',async()=>{
 const d=newFixture(),candidate=edit(d,'sailing',{status:'completed'});let active=d,disk=structuredClone(d),fail=true;
 const saver=new SaveCoordinator({write:async doc=>{if(fail)throw Error('quota');disk=structuredClone(doc);}});
 await assert.rejects(saver.replaceDurably(candidate,doc=>active=doc),/quota/);assert.equal(saver.state,'import_failed');assert.deepEqual(active,d);assert.deepEqual(disk,d);assert.equal(saver.queued,null);
 fail=false;await saver.replaceDurably(candidate,doc=>active=doc);assert.deepEqual(active,candidate);assert.deepEqual(disk,candidate);
});
test('failed pending autosave blocks replacement instead of discarding unsaved state',async()=>{
 const d=newFixture();let applied=false,writes=0;
 const saver=new SaveCoordinator({write:async()=>{writes++;throw Error('disk full');}});saver.enqueue(d);
 await assert.rejects(saver.replaceDurably(d,()=>applied=true));assert.equal(applied,false);assert.equal(writes,1);assert.equal(saver.state,'failed');
});
