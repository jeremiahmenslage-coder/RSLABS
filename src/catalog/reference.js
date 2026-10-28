// Separate immutable Phase 0 reference metadata, NEVER the player's roadmap goals.
// Only synthetic/original illustrations: no game sprite ingestion or redistribution.
import {gameCatalog} from './generated.js';
const entries = [
  ['sailing','52 Sailing','skill','test:sail-png'],
  ['tortugans','Troubled Tortugans','quest','test:scroll-svg'],
  ['belle',"Belle's Folly",'quest','test:scroll-svg'],
  ['barrows','Barrows armor','item','test:armor-svg'],
  ['crystal','Crystal shield','item','test:shield-svg'],
  ['ring','Berserker ring','item','test:ring-webp'],
  ['moons','Perilous Moons','boss','test:moon-svg'],
];
export const referenceCatalog = Object.freeze({...Object.fromEntries(gameCatalog.map(record=>[record.id,record])),...Object.fromEntries(entries.map(([key,title,category,defaultIconAssetId]) => {
  const id=`demo:${key}`;
  return [id,Object.freeze({id,title,category,defaultIconAssetId,
    sourceId:'phase0:synthetic',sourceUrl:null,sourceAttribution:'Original Phase 0 test art',
    permissionStatus:'original_art',packaging:'bundle_allowed',license:'created_for_this_spike'})];
}))});
