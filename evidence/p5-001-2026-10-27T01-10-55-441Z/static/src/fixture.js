// Exact seven named nodes and six directed edges from Engineering Brief F1.
// The EDGE KINDS are illustrative player choices, not verified OSRS dependencies.
const createdAt = '2026-10-25T00:00:00.000Z';
const nodesData = [
  ['sailing','52 Sailing','skill',80,80],
  ['tortugans','Troubled Tortugans','quest',360,80],
  ['belle','Belle\'s Folly','quest',630,80],
  ['barrows','Barrows armor','item',80,490],
  ['crystal','Crystal shield','item',100,700],
  ['ring','Berserker ring','item',390,560],
  ['moons','Perilous Moons','boss',960,330],
];
const edgesData = [
  ['e1','sailing','tortugans','order'],
  ['e2','tortugans','belle','soft'],
  ['e3','barrows','ring','hard'],
  ['e4','crystal','ring','order'],
  ['e5','ring','moons','hard'],
  ['e6','belle','moons','order'],
];
export function newFixture() {
  return {
    schemaVersion: 1,
    roadmap: {
      id:'phase0_fixture', title:'Canonical convergence spike',
      nodes:nodesData.map(([id,title,category,x,y])=>({
        id, title, category, catalogRef:`demo:${id}`, iconOverride:null,
        notes:'Phase 0 sample; relationships are illustrative, not verified game requirements.',
        status:'not_started', progress:null, position:{x,y},
        groupId:['barrows','crystal','ring'].includes(id)?'loadout':null,
        createdAt, updatedAt:createdAt,
      })),
      edges:edgesData.map(([id,sourceId,targetId,kind])=>({id,sourceId,targetId,kind})),
      groups:[{id:'loadout',title:'Equipment route', representativeNodeId:null, collapsed:false}],
    },
    preferences:{lastView:'graph',nodeDensity:'detailed',completedVisibility:'show',viewport:{x:0,y:0,zoom:1}},
  };
}
export const EXPECTED_PAIRS = Object.freeze([
  ['sailing','tortugans'],['tortugans','belle'],['barrows','ring'],
  ['crystal','ring'],['ring','moons'],['belle','moons'],
]);
