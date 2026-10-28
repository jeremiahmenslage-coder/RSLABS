import {newFixture} from '../../src/fixture.js';
export function raidFixture(){
 const d=newFixture();d.roadmap.title='Illustrative branching raid roadmap (not verified OSRS requirements)';
 for(const [id,title,category] of [['titans','Royal Titans','boss'],['toa','Clear Tombs of Amascut','boss'],['fang',"Obtain Osmumten’s fang",'item'],['lightbearer','Obtain Lightbearer','item'],['dwh','Dragon Warhammer','item'],['cox','Chambers of Xeric','boss'],['rigour','Dexterous scroll / Rigour','prayer'],['prayer','70 Prayer','prayer'],['island','Disconnected personal goal','custom']]){
  d.roadmap.nodes.push({...structuredClone(d.roadmap.nodes[0]),id,title,category,catalogRef:null,groupId:null,position:{x:80,y:80},notes:'Disposable test fixture; relationships are illustrative player choices only.'});
 }
 const arcs=[['moons','titans','order'],['titans','toa','order'],['toa','dwh','order'],['dwh','cox','order'],['toa','fang','soft'],['toa','lightbearer','soft'],['cox','rigour','order'],['prayer','toa','hard'],['prayer','cox','hard'],['rigour','titans','soft']];
 d.roadmap.edges.push(...arcs.map(([sourceId,targetId,kind],i)=>({id:`raid${i}`,sourceId,targetId,kind})));
 d.roadmap.groups.push({id:'toa-group',title:'ToA and independent drops',representativeNodeId:'toa',collapsed:false});
 for(const n of d.roadmap.nodes)if(['toa','fang','lightbearer'].includes(n.id))n.groupId='toa-group';
 return d;
}
