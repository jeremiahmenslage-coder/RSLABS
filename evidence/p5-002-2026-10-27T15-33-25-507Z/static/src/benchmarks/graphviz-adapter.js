// Benchmark-only established directed layout candidate, Graphviz dot 2.42.4.
// DO NOT import this in the browser: dot is a local executable, not static web JS.
import {spawnSync} from 'node:child_process';
const POINTS_PER_INCH=72;
export function graphvizDotPositions(doc,{width=236,height=108}={}){
 const lines=['digraph G {','graph [rankdir=LR, nodesep=0.72, ranksep=1.25, splines=polyline, outputorder=edgesfirst];',
   `node [shape=box, fixedsize=true, width=${(width/72).toFixed(4)}, height=${(height/72).toFixed(4)}, margin=0];`];
 for(const n of doc.roadmap.nodes)lines.push(`"${n.id}" [label=""];`);
 for(const e of doc.roadmap.edges)lines.push(`"${e.sourceId}" -> "${e.targetId}";`);
 lines.push('}');
 const out=spawnSync('dot',['-Tplain'],{input:lines.join('\n'),encoding:'utf8',maxBuffer:32*1024*1024,timeout:45000});
 if(out.error||out.status!==0)throw new Error(`Graphviz dot failed: ${out.error?.message||out.stderr}`);
 const positions=new Map(),linesOut=out.stdout.split('\n');
 const graph=linesOut.find(s=>s.startsWith('graph '));
 const tokens=graph.split(/\s+/),graphHeight=Number(tokens[3])*POINTS_PER_INCH;
 for(const line of linesOut){if(!line.startsWith('node '))continue;
   const pieces=line.split(/\s+/),id=pieces[1].replace(/^"|"$/g,''),x=Number(pieces[2])*POINTS_PER_INCH,y=Number(pieces[3])*POINTS_PER_INCH;
   const w=Number(pieces[4])*POINTS_PER_INCH,h=Number(pieces[5])*POINTS_PER_INCH;
   positions.set(id,{x:Math.round(x-w/2),y:Math.round(graphHeight-y-h/2)});
 }
 if(positions.size!==doc.roadmap.nodes.length)throw new Error(`dot emitted ${positions.size} nodes for ${doc.roadmap.nodes.length}`);
 return {positions,tool:'Graphviz dot',routing:'dot emits route splines, NOT integrated into POC SVG renderer'};
}
