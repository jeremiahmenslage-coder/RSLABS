// Synthetic benchmark fixtures: never imply verified OSRS game prerequisites.
import {newFixture} from '../fixture.js';
const timestamp='2026-10-25T00:00:00.000Z';
function node(id,i){return {id,title:`Goal ${i}`,category:'custom',catalogRef:null,
  iconOverride:null,notes:'',status:'not_started',progress:null,groupId:null,
  position:{x:(i%12)*260,y:Math.floor(i/12)*180},createdAt:timestamp,updatedAt:timestamp};}
function doc(nodes,links,tag){const d=newFixture();d.roadmap.id=tag;d.roadmap.nodes=nodes;d.roadmap.edges=links.map(([a,b],i)=>({id:`edge_${i}`,sourceId:a,targetId:b,kind:i%6===0?'hard':i%3===0?'soft':'order'}));d.roadmap.groups=[];return d;}
export function sample7(){return newFixture();}
export function roadmap110(){
  const sizes=[32,25,20,18,15],nodes=[],pairs=[];let start=0;
  for(let c=0;c<sizes.length;c++){
    const count=sizes[c];
    for(let i=0;i<count;i++) nodes.push(node(`c${c}_n${i}`,start+i));
    for(let i=0;i<count-1;i++){
      // Independent 3-lane progressions with periodic cross-lane convergence/divergence.
      if(i+3<count)pairs.push([`c${c}_n${i}`,`c${c}_n${i+3}`]);
      if(i%5===0&&i+5<count)pairs.push([`c${c}_n${i}`,`c${c}_n${i+5}`]);
      if(i%7===0&&i+4<count)pairs.push([`c${c}_n${i}`,`c${c}_n${i+4}`]);
    }
    start+=count;
  }
  return doc(nodes,[...new Map(pairs.map(p=>[p.join('->'),p])).values()],'benchmark_110');
}
export function chain250(){
  const nodes=Array.from({length:250},(_,i)=>node(`goal_${i}`,i)),pairs=[];
  for(let i=0;i<249;i++)pairs.push([`goal_${i}`,`goal_${i+1}`]);
  for(let i=0;i<151;i++)pairs.push([`goal_${i}`,`goal_${i+4}`]);
  return doc(nodes,pairs,'benchmark_250');
}
