import {readiness,STATUSES} from './model.js';
export const DEFAULT_BOARD_FILTERS=Object.freeze({query:'',category:'',readiness:'',group:''});
export function boardFilters(doc){return {...DEFAULT_BOARD_FILTERS,...doc.preferences.boardFilters};}
export function boardProjection(doc){
 const filters=boardFilters(doc),states=readiness(doc),query=filters.query.trim().toLocaleLowerCase();
 const goals=doc.roadmap.nodes.filter(n=>(!query||n.title.toLocaleLowerCase().includes(query))&&(!filters.category||n.category===filters.category)&&(!filters.readiness||states.get(n.id)===filters.readiness)&&(!filters.group||(filters.group==='ungrouped'?n.groupId===null:filters.group===`group:${n.groupId}`)));
 return {goals,states,columns:Object.fromEntries(STATUSES.map(status=>[status,goals.filter(n=>n.status===status)])),total:doc.roadmap.nodes.length};
}
