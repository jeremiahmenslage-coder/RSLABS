// Deterministic fixture definitions + candidate comparison; wall clock is environment-specific.
import {performance} from 'node:perf_hooks';
import {writeFileSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {sample7,roadmap110,chain250} from '../src/benchmarks/fixtures.js';
import {graphvizDotPositions} from '../src/benchmarks/graphviz-adapter.js';
import {optimizePositions,applyPositions,overlaps} from '../src/layout.js';
import {graphSignature,validateRoadmap} from '../src/model.js';
function geometry(doc){const ns=doc.roadmap.nodes, xs=ns.map(n=>n.position.x),ys=ns.map(n=>n.position.y);
 return {widthPx:Math.max(...xs)-Math.min(...xs)+236,heightPx:Math.max(...ys)-Math.min(...ys)+108,
 overlaps:overlaps(doc,'detailed').length};}
const v=spawnSync('dot',['-V'],{encoding:'utf8'});const version=(v.stdout||v.stderr).trim();
const rows=[];
for(const [label,generate] of [['canonical_7_6',sample7],['roadmap_110_branches_islands',roadmap110],['stress_250_400',chain250]]){
 const fixture=generate();if(validateRoadmap(fixture).length)throw new Error(`${label}: invalid fixture: ${validateRoadmap(fixture)}`);
 const before=graphSignature(fixture),beforeOther=JSON.stringify(fixture.roadmap.nodes.map(({id,title,status,groupId,iconOverride})=>({id,title,status,groupId,iconOverride})));
 for(const algorithm of ['simple','graphviz-dot']){
  const doc=structuredClone(fixture),t=performance.now();
  const p=algorithm==='simple'?optimizePositions(doc,'detailed'):graphvizDotPositions(doc).positions;
  const ms=performance.now()-t;applyPositions(doc,p);
  const semanticsPreserved=graphSignature(doc)===before && JSON.stringify(doc.roadmap.nodes.map(({id,title,status,groupId,iconOverride})=>({id,title,status,groupId,iconOverride})))===beforeOther;
  if(!semanticsPreserved||validateRoadmap(doc).length)throw new Error(`${label}/${algorithm}: graph mutation`);
  const metrics=geometry(doc);
  rows.push({fixture:label,algorithm,nodes:doc.roadmap.nodes.length,edges:doc.roadmap.edges.length,
    layoutMs:Number(ms.toFixed(2)),...metrics,semanticsPreserved,
    fitZoomAt1440x900:Number(Math.min(1,1440/(metrics.widthPx+120),900/(metrics.heightPx+120)).toFixed(4)),
    routeIntegration:algorithm==='simple'?'simple cubic curves, not collision aware':'dot routing output not bound to SVG POC'});
 }
}
mkdirSync('evidence',{recursive:true});writeFileSync('evidence/layout-benchmark.json',JSON.stringify({node:process.version,dotVersion:version,platform:process.platform,arch:process.arch,results:rows},null,2));
console.log(JSON.stringify({dotVersion:version,results:rows},null,2));
