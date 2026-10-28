// Bounded generation rules, separate from mutable reference packs and roadmap instances.
export const SKILL_NAMES=Object.freeze(['Attack','Strength','Defence','Ranged','Prayer','Magic','Runecraft','Construction','Hitpoints','Agility','Herblore','Thieving','Crafting','Fletching','Slayer','Hunter','Mining','Smithing','Fishing','Cooking','Firemaking','Woodcutting','Farming','Sailing']);
export const SKILLS=Object.freeze(SKILL_NAMES.map(name=>Object.freeze({id:'osrs:skill:'+name.toLowerCase(),name})));
export const DIARY_REGIONS=Object.freeze(['Ardougne','Desert','Falador','Fremennik','Kandarin','Karamja','Kourend & Kebos','Lumbridge & Draynor','Morytania','Varrock','Western Provinces','Wilderness']);
export const DIARY_TIERS=Object.freeze(['Easy','Medium','Hard','Elite']);
export const NEW_CATEGORIES=Object.freeze(['skill','quest','item','boss','diary','activity','custom']);
export function validSkillGoal(value){return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).sort().join(',')==='format,skillId,targetLevel'&&value.format===1&&SKILLS.some(s=>s.id===value.skillId)&&Number.isInteger(value.targetLevel)&&value.targetLevel>=1&&value.targetLevel<=99;}
export function skillTitle(value){if(!validSkillGoal(value))throw Error('Select a skill and an explicit whole-number target level from 1 to 99.');return `${value.targetLevel} ${SKILLS.find(s=>s.id===value.skillId).name}`;}
export function diaryTitle(region,tier){if(!DIARY_REGIONS.includes(region)||!DIARY_TIERS.includes(tier))throw Error('Select a diary region and tier.');return `${region} — ${tier}`;}
