// Phase 0 synthetic measurement only; not application feature nor release benchmark.
import {performance} from 'node:perf_hooks';
import assert from 'node:assert/strict';
import {newFixture} from '../src/fixture.js';
import {optimizePositions,applyPositions,overlaps} from '../src/layout.js';
import {validateRoadmap,graphSignature} from '../src/model.js';
import {projectGraph} from '../src/projection.js';
const d=newFixture();d.roadmap.nodes=[];d.roadmap.edges=[];d.roadmap.groups=[];
for(let i=0;i<250;i++) d.roadmap.nodes.push({id:`goal_${i}`,title:`Goal ${i}`,category:'custom',catalogRef:null,iconOverride:null,
  notes:'',status:'not_started',progress:null,groupId:null,position:{x:(i%20)*180,y:Math.floor(i/20)*120},
  createdAt:'2026-10-25T00:00:00Z',updatedAt:'2026-10-25T00:00:00Z'});
const pairs=new Set();
for(let i=0;i<249;i++)pairs.add(`${i},${i+1}`);
for(let i=0;i<151;i++)pairs.add(`${i},${Math.min(249,i+4)}`);
for(const pair of pairs){const [a,b]=pair.split(',').map(Number);d.roadmap.edges.push({id:`edge_${a}_${b}`,sourceId:`goal_${a}`,targetId:`goal_${b}`,kind:iKind(a)});}
function iKind(i){return i%6===0?'hard':i%3===0?'soft':'order';}
assert.equal(d.roadmap.nodes.length,250);assert.equal(d.roadmap.edges.length,400);
assert.deepEqual(validateRoadmap(d),[]);
const signature=graphSignature(d);
const t0=performance.now();
applyPositions(d,optimizePositions(d,'detailed'));
const layout=performance.now()-t0;
const t1=performance.now();
const collisions=overlaps(d,'detailed');const projected=projectGraph(d);
const scan=performance.now()-t1;
assert.deepEqual(collisions,[]);
assert.equal(projected.edges.length,400);
assert.equal(signature,graphSignature(d));
const horizontalSpan=Math.max(...d.roadmap.nodes.map(n=>n.position.x))-Math.min(...d.roadmap.nodes.map(n=>n.position.x));
console.log(JSON.stringify({fixture:'250 nodes / 400 edges',nodeVersion:process.version,layoutMs:+layout.toFixed(3),collisionProjectionScanMs:+scan.toFixed(3),collisions:collisions.length,horizontalSpanPx:horizontalSpan,semanticMutation:false}));
