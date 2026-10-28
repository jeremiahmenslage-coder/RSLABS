import {SKILLS,skillTitle} from '../goal-rules.js';
export function skillGoalFields(form,prefix,value=null){
 const label=(text,node)=>{const l=document.createElement('label');l.className='form-label';l.htmlFor=node.id;l.textContent=text;form.append(l,node);};
 const skill=document.createElement('select');skill.id=prefix+'-skill';skill.className='text-field';
 for(const s of [{id:'',name:'Select skill…'},...SKILLS]){const o=document.createElement('option');o.value=s.id;o.textContent=s.name;skill.append(o);}skill.value=value?.skillId??'';label('Skill',skill);
 const level=document.createElement('input');level.type='number';level.id=prefix+'-level';level.className='text-field';level.min='1';level.max='99';level.step='1';level.placeholder='Select target level (1–99)';level.value=value?.targetLevel??'';label('Target skill level (1–99)',level);
 const raw=()=>({format:1,skillId:skill.value,targetLevel:level.value===''?null:Number(level.value)});
 const read=()=>{const goal=raw();skillTitle(goal);return goal;};return {skill,level,raw,read};
}
