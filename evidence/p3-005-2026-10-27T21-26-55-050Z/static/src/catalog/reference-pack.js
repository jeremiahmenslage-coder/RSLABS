import {NEW_CATEGORIES,SKILLS,DIARY_REGIONS,DIARY_TIERS} from '../goal-rules.js';
export function validateReferencePack(input){
 if(input?.format!==1||typeof input.id!=='string'||!/^owner:reference:[a-z0-9-]+$/.test(input.id)||!/^\d+\.\d+\.\d+$/.test(input.version)||!Array.isArray(input.entries)||input.entries.length>10000)throw Error('Invalid reference pack header/version');
 const ids=new Set();for(const e of input.entries){
  if(!e||typeof e.id!=='string'||!/^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/.test(e.id)||ids.has(e.id)||!NEW_CATEGORIES.includes(e.category)||e.category==='custom'||typeof e.name!=='string'||!e.name.trim()||e.name.length>150||!Array.isArray(e.aliases)||e.aliases.some(a=>typeof a!=='string'||!a.trim()||a.length>150)||new Set(e.aliases.map(a=>a.toLowerCase())).size!==e.aliases.length)throw Error('Invalid/duplicate reference entry');
  if(e.sourceUrl!==undefined&&(typeof e.sourceUrl!=='string'||!/^https:\/\//.test(e.sourceUrl)))throw Error('Invalid provenance URL');
  if(e.provenance!==undefined&&(typeof e.provenance!=='string'||e.provenance.length>1000))throw Error('Invalid provenance');
  if(e.category==='skill'&&!SKILLS.some(s=>s.id===e.id&&s.name===e.name))throw Error('Invalid skill identity');
  if(e.category==='diary'&&(!DIARY_REGIONS.includes(e.region)||!DIARY_TIERS.includes(e.tier)))throw Error('Invalid diary entry');ids.add(e.id);
 }
 if(input.entries.filter(e=>e.category==='skill').length!==SKILLS.length||SKILLS.some(s=>!ids.has(s.id)))throw Error('Reference pack requires all 24 skills');
 for(const region of DIARY_REGIONS)for(const tier of DIARY_TIERS)if(input.entries.filter(e=>e.category==='diary'&&e.region===region&&e.tier===tier).length!==1)throw Error('Reference pack requires every unique diary region/tier');
 return input;
}
export function referenceCoverage(pack){return Object.fromEntries(NEW_CATEGORIES.filter(c=>c!=='custom').map(category=>[category,{entries:pack.entries.filter(e=>e.category===category).length,coverage:['skill','diary'].includes(category)?'complete bounded list':'partial curated list'}]));}
export function searchReferences(entries,category,query=''){const q=query.trim().toLowerCase();return entries.filter(e=>e.category===category&&[e.name,...e.aliases].some(name=>name.toLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id));}
