import test from 'node:test';import assert from 'node:assert/strict';
import {cursorFixture} from './fixtures/cursor.mjs';
import {boardProjection,boardFilters,DEFAULT_BOARD_FILTERS} from '../src/board.js';
import {editNode,displayPreference} from '../src/model/actions.js';
import {validateRoadmap} from '../src/model.js';
import {exportRoadmap,previewImport} from '../src/storage/backup.js';
import {RoadmapStore} from '../src/state/store.js';
test('board columns retain canonical IDs, completed goals and independent manual status/counters',()=>{
 const d=cursorFixture(),before=structuredClone(d),p=boardProjection(d);assert.deepEqual(p.columns.not_started.map(n=>n.id),['a','c']);assert.deepEqual(p.columns.in_progress.map(n=>n.id),['b']);assert.deepEqual(p.columns.completed.map(n=>n.id),['d']);assert.equal(p.columns.not_started[0],d.roadmap.nodes[0]);assert.deepEqual(d,before);
 const next=editNode(d,'a',{...d.roadmap.nodes[0],progress:{current:30,target:10}});assert.equal(boardProjection(next).columns.not_started[0].id,'a');assert.equal(next.roadmap.nodes[1].status,'in_progress');assert.deepEqual(next.roadmap.edges,d.roadmap.edges);
});
test('combined filters intersect without mutating roadmap or hiding canonical hard blockers',()=>{
 const d=cursorFixture();d.preferences.boardFilters={query:' GOAL B ',category:'custom',readiness:'Blocked',group:'group:g'};d.preferences.completedVisibility='hide';d.preferences.navigation={mode:'focus',direction:'upstream',rootId:'d'};d.roadmap.groups[0].collapsed=true;const before=structuredClone(d),p=boardProjection(d);assert.deepEqual(p.goals.map(n=>n.id),['b']);assert.equal(p.states.get('b'),'Blocked');assert.deepEqual(d,before);
 d.preferences.boardFilters.query='Goal d';assert.equal(boardProjection(d).goals.length,0);d.preferences.boardFilters={...DEFAULT_BOARD_FILTERS,query:'goal D'};assert.deepEqual(boardProjection(d).goals.map(n=>n.id),['d']);
});
test('old schema1 defaults, empty/no-results and missing/ungrouped filters are safe pure projections',()=>{
 const d=cursorFixture();assert.deepEqual(boardFilters(d),DEFAULT_BOARD_FILTERS);for(const [group,ids] of [['ungrouped',['c','d']],['group:missing',[]]]){d.preferences.boardFilters={...DEFAULT_BOARD_FILTERS,group};assert.deepEqual(boardProjection(d).goals.map(n=>n.id),ids);}d.roadmap.nodes=[];d.roadmap.edges=[];d.roadmap.groups=[];assert.equal(boardProjection(d).total,0);
});
test('optional board preferences validate, preserve unknown icon refs and roundtrip without conversion',()=>{
 const d=cursorFixture();d.preferences.lastView='board';d.preferences.boardFilters={query:'a',category:'custom',readiness:'Ready',group:'group:g'};d.roadmap.nodes[0].iconOverride='unknown:portable';assert.deepEqual(validateRoadmap(d),[]);assert.deepEqual(previewImport(exportRoadmap(d)).document,d);assert.equal(d.schemaVersion,1);
 for(const filters of [null,[],{}, {...d.preferences.boardFilters,query:4},{...d.preferences.boardFilters,query:'x'.repeat(151)},{...d.preferences.boardFilters,category:'bad'},{...d.preferences.boardFilters,readiness:'bad'},{...d.preferences.boardFilters,group:'g'}]){const bad=structuredClone(d);bad.preferences.boardFilters=filters;assert.ok(validateRoadmap(bad).includes('Invalid board filters'));assert.throws(()=>previewImport(JSON.stringify(bad)),/board filters/);}
});
test('shared actions/history and view/filter preferences never alter graph geometry or relationships',()=>{
 const d=cursorFixture(),s=new RoadmapStore(d);s.pref(doc=>displayPreference(doc,p=>{p.lastView='board';p.boardFilters={...DEFAULT_BOARD_FILTERS,query:'Goal'};}));s.command(doc=>editNode(doc,'b',{...doc.roadmap.nodes[1],status:'completed',progress:{current:7,target:8}}));const after=structuredClone(s.current);assert.equal(boardProjection(after).states.get('b'),'Completed');assert.deepEqual(after.roadmap.nodes.map(n=>n.position),d.roadmap.nodes.map(n=>n.position));assert.deepEqual(after.roadmap.edges,d.roadmap.edges);s.undo();assert.equal(s.current.roadmap.nodes[1].status,'in_progress');s.redo();assert.deepEqual(s.current,after);
});
