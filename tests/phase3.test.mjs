import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {newFixture} from '../src/fixture.js';
import {raidFixture} from './fixtures/phase3.mjs';
import {saveGroup,deleteGroup,groupBoundary} from '../src/model/groups.js';
import {withPositions,toggleGroup,editNode,deleteNode,checked} from '../src/model/actions.js';
import {readiness,validateRoadmap} from '../src/model.js';
import {projectGraph} from '../src/projection.js';
import {connectedScope} from '../src/navigation.js';
import {optimizeGraph,layoutKey} from '../src/layout/elk.js';
import {layoutMetrics} from '../src/layout/metrics.js';
import {routeAtPositions} from '../src/layout/routing.js';
import {RoadmapStore} from '../src/state/store.js';
import {exportRoadmap,previewImport} from '../src/storage/backup.js';
import {readValidated} from '../src/storage/indexeddb.js';
const semantic=d=>({...d,preferences:undefined,roadmap:{...d.roadmap,nodes:d.roadmap.nodes.map(({position,...n})=>n)}});
test('group create/edit/delete and reassignment retain independent identities/status/counters/positions',()=>{
 let d=raidFixture();const toa=d.roadmap.nodes.find(n=>n.id==='toa');toa.status='completed';toa.progress={current:1,target:1};
 const fang=d.roadmap.nodes.find(n=>n.id==='fang');fang.status='in_progress';fang.progress={current:2,target:50};
 const before=structuredClone(d),members=['toa','fang','lightbearer'];d=saveGroup(d,'toa-group',{title:'ToA route',memberIds:members,representativeNodeId:'toa'});
 assert.deepEqual(d.roadmap.nodes,before.roadmap.nodes);assert.deepEqual(d.roadmap.edges,before.roadmap.edges);
 d=toggleGroup(d,'toa-group');const summary=projectGraph(d).summaries.find(s=>s.id==='toa-group');assert.deepEqual(new Set(summary.members),new Set(members));assert.equal(summary.completedCount,1);
 assert.deepEqual(summary.boundary,groupBoundary(d,members));assert.equal(projectGraph(d).nodes.some(n=>n.id==='toa'),false);
 d=saveGroup(d,null,{title:'Reassigned',memberIds:['toa'],representativeNodeId:'toa'});assert.equal(d.roadmap.groups.find(g=>g.id==='toa-group').representativeNodeId,null);
 d=deleteGroup(d,d.roadmap.groups.at(-1).id);assert.equal(d.roadmap.nodes.find(n=>n.id==='toa').groupId,null);assert.equal(d.roadmap.nodes.find(n=>n.id==='toa').status,'completed');assert.deepEqual(d.roadmap.edges,before.roadmap.edges);
 assert.throws(()=>saveGroup(d,null,{title:'X',memberIds:['toa'],representativeNodeId:'fang'}));assert.throws(()=>saveGroup(d,null,{title:'X',memberIds:['missing']}));assert.throws(()=>saveGroup(d,null,{title:'',memberIds:[]}));
});
test('grouping/layout/move history undo/redo restores exact snapshots',async()=>{
 const start=raidFixture(),s=new RoadmapStore(start);s.command(d=>saveGroup(d,'toa-group',{title:'Edited',memberIds:['toa','fang','lightbearer'],representativeNodeId:'fang'}));s.command(d=>toggleGroup(d,'toa-group'));
 const result=await optimizeGraph(s.current);s.command(d=>withPositions(d,result.positions));const end=structuredClone(s.current);
 for(let i=0;i<3;i++)s.undo();assert.deepEqual(s.current,start);for(let i=0;i<3;i++)s.redo();assert.deepEqual(s.current,end);
});
test('show/dim/hide/collapse/expand retain semantics and hard-only readiness',()=>{
 const d=raidFixture();for(const id of ['barrows','prayer','sailing','tortugans'])d.roadmap.nodes.find(n=>n.id===id).status='completed';
 const before=structuredClone(d.roadmap),ready=[...readiness(d)];
 for(const mode of ['show','dim','hide','collapse']){d.preferences.completedVisibility=mode;const p=projectGraph(d);
  if(mode==='hide')assert.ok(p.nodes.every(n=>n.status!=='completed'));
  if(mode==='dim')assert.equal(p.dimmed.size,4);
  if(mode==='collapse'){const summary=p.summaries.find(s=>s.kind==='completed'&&s.members.includes('sailing'));assert.ok(summary.members.includes('tortugans'));d.preferences.expandedCompleted=[summary.id];assert.ok(projectGraph(d).nodes.some(n=>n.id==='sailing'));}
  assert.deepEqual(d.roadmap,before);assert.deepEqual([...readiness(d)],ready);
 }
 assert.equal(readiness(d).get('ring'),'Ready');assert.equal(readiness(d).get('toa'),'Ready');
});
test('Focus and Highlight traverse cycles by direction across all edge types without sibling flood-fill',()=>{
 const d=raidFixture(),before=structuredClone(d.roadmap);const upstream=connectedScope(d,'toa','upstream'),downstream=connectedScope(d,'toa','downstream');
 assert.ok(upstream.has('prayer'));assert.ok(downstream.has('fang'));assert.ok(downstream.has('titans'));assert.equal(downstream.has('island'),false);
 assert.equal(upstream.has('fang'),false);
 assert.deepEqual(connectedScope(d,'toa','both'),new Set([...upstream,...downstream]));
 d.preferences.navigation={mode:'focus',rootId:'toa',direction:'upstream'};assert.equal(projectGraph(d).nodes.some(n=>n.id==='island'),false);
 d.preferences.navigation.mode='highlight';const p=projectGraph(d);assert.equal(p.nodes.length,d.roadmap.nodes.length);assert.ok(p.highlighted.has('prayer'));assert.deepEqual(d.roadmap,before);
});
test('100 completed goals collapse into a branch summary; hidden prerequisites still satisfy readiness',()=>{
 const d=newFixture(),base=d.roadmap.nodes[0];d.roadmap.nodes=[];d.roadmap.edges=[];d.roadmap.groups=[];
 for(let i=0;i<100;i++){d.roadmap.nodes.push({...base,id:`done${i}`,status:'completed',groupId:null,position:{x:i*250,y:0}});if(i)d.roadmap.edges.push({id:`e${i}`,sourceId:`done${i-1}`,targetId:`done${i}`,kind:'order'});}
 d.roadmap.nodes.push({...base,id:'next',status:'not_started',groupId:null});d.roadmap.edges.push({id:'prereq',sourceId:'done99',targetId:'next',kind:'hard'});
 checked(d);for(const mode of ['hide','collapse']){d.preferences.completedVisibility=mode;const p=projectGraph(d);assert.equal(p.nodes.length,1);assert.equal(readiness(d).get('next'),'Ready');if(mode==='collapse')assert.equal(p.summaries[0].nodeCount,100);}
});
test('old schema-1 loads without migration; preferences roundtrip and invalid roots reject',()=>{
 const old=newFixture();assert.deepEqual(readValidated(old),old);const d=raidFixture();d.preferences.navigation={mode:'highlight',rootId:'toa',direction:'upstream'};d.preferences.expandedCompleted=['prayer'];d.preferences.completedVisibility='collapse';
 assert.deepEqual(previewImport(exportRoadmap(d)).document,d);assert.deepEqual(readValidated(structuredClone(d)),d);
 const deleted=deleteNode(d,'toa');assert.equal(deleted.preferences.navigation.mode,'none');assert.deepEqual(validateRoadmap(deleted),[]);
 for(const nav of [null,{mode:'focus',direction:'both',rootId:'missing'},{mode:'wat',direction:'both',rootId:null}])assert.throws(()=>previewImport(JSON.stringify({...d,preferences:{...d.preferences,navigation:nav}})));
});
for(const [name,fixture] of [['seven',newFixture],['raid',raidFixture]])for(const density of ['compact','detailed'])test(`ELK ${name} ${density}: port routes, no card/label collisions; reload routing preserves positions`,async()=>{
 const d=fixture();d.preferences.nodeDensity=density;const before=structuredClone(d),result=await optimizeGraph(d),optimized=withPositions(d,result.positions),metrics=layoutMetrics(optimized,result.routes);
 assert.deepEqual(d,before);assert.deepEqual(semantic(d),semantic(optimized));assert.equal(result.routes.size,projectGraph(d).edges.length);
 assert.deepEqual(metrics.cardOverlaps,[]);assert.deepEqual(metrics.nodeIntersections,[]);assert.deepEqual(metrics.labelNodeOverlaps,[]);assert.deepEqual(metrics.labelOverlaps,[]);
 for(const edge of projectGraph(optimized).edges){const route=result.routes.get(edge.id),source=optimized.roadmap.nodes.find(n=>n.id===edge.sourceId),target=optimized.roadmap.nodes.find(n=>n.id===edge.targetId),width=density==='compact'?176:236;
  assert.ok(Math.abs(route.points[0].x-source.position.x-width)<=8);assert.ok(Math.abs(route.points.at(-1).x-target.position.x)<=8);
 }
 const p=projectGraph(optimized),routed=routeAtPositions(optimized,p);assert.deepEqual(layoutMetrics(optimized,routed).nodeIntersections,[]);assert.deepEqual(semantic(optimized),semantic(d));
});
test('collapsed group and completed summaries pack without overlap; hidden member offsets retained',async()=>{
 let d=raidFixture();const first=await optimizeGraph(d);d=withPositions(d,first.positions);d=toggleGroup(d,'toa-group');d.roadmap.nodes.find(n=>n.id==='sailing').status='completed';d.preferences.completedVisibility='collapse';
 const old=structuredClone(d),result=await optimizeGraph(d),next=withPositions(d,result.positions);assert.deepEqual(layoutMetrics(next,result.routes).cardOverlaps,[]);assert.deepEqual(semantic(next),semantic(old));
 const members=['toa','fang','lightbearer'];for(const id of members){const a=old.roadmap.nodes.find(n=>n.id===id),b=next.roadmap.nodes.find(n=>n.id===id),anchorA=old.roadmap.nodes.find(n=>n.id==='toa'),anchorB=next.roadmap.nodes.find(n=>n.id==='toa');assert.equal(b.position.x-anchorB.position.x,a.position.x-anchorA.position.x);assert.equal(b.position.y-anchorB.position.y,a.position.y-anchorA.position.y);}
 assert.deepEqual(next.roadmap.edges,old.roadmap.edges);assert.notEqual(layoutKey(old),layoutKey(next));
});
test('replaceable layout adapter failures never mutate input',async()=>{
 const d=raidFixture(),before=structuredClone(d);await assert.rejects(optimizeGraph(d,{engine:{layout:async()=>{throw Error('adapter unavailable');}}}),/unavailable/);assert.deepEqual(d,before);
});
test('vendored ELK includes the upstream license locally',async()=>{
 const license=await readFile(new URL('../src/vendor/elkjs/LICENSE.md',import.meta.url),'utf8');assert.match(license,/Eclipse Public License/);
});
