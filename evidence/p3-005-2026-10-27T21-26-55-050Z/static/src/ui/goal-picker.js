import {referencePack} from '../catalog/owner-reference.js';
import {searchReferences} from '../catalog/reference-pack.js';
import {NEW_CATEGORIES,DIARY_REGIONS,DIARY_TIERS,skillTitle,diaryTitle} from '../goal-rules.js';
import {skillGoalFields} from './skill-goal.js';
import {categoryIconPreview} from './category-icon.js';
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
export function goalPicker(form,ui){
 const category=ui.field(form,'Category','picker-category','','text',[['','Choose category…'],...NEW_CATEGORIES.map(c=>[c,c.charAt(0).toUpperCase()+c.slice(1)])]),panes=el('div'),preview=el('p');preview.id='picker-preview-title';preview.setAttribute('role','status');const states=new Map();form.append(panes,preview);categoryIconPreview(form,category);
 const status=ui.field(form,'Manual status','cursor-status','not_started','text',[['not_started','Not Started'],['in_progress','In Progress'],['completed','Completed']]);
 function state(c){if(states.has(c))return states.get(c);const pane=el('section');pane.dataset.pickerPane=c;panes.append(pane);let read;
  const back=ui.button('Back to categories',()=>{category.value='';update();category.focus();},'picker-back-'+c);pane.append(back);
  if(c==='custom'){const title=ui.field(pane,'Title','cursor-title','');title.maxLength=150;read=()=>({title:title.value.trim(),category:c,catalogRef:null});}
  else if(c==='skill'){const fields=skillGoalFields(pane,'picker');read=()=>{const skillGoal=fields.read();return {title:skillTitle(skillGoal),category:c,catalogRef:skillGoal.skillId,skillGoal};};}
  else if(c==='diary'){const region=ui.field(pane,'Diary region','picker-region','','text',[['','Select region…'],...DIARY_REGIONS.map(r=>[r,r])]),tier=ui.field(pane,'Diary tier','picker-tier','','text',[['','Select tier…'],...DIARY_TIERS.map(t=>[t,t])]);read=()=>{const title=diaryTitle(region.value,tier.value),entry=referencePack.entries.find(e=>e.category==='diary'&&e.region===region.value&&e.tier===tier.value);if(!entry)throw Error('Diary reference unavailable; create a custom goal.');return {title,category:c,catalogRef:entry.id};};}
  else {let selected=null;const query=ui.field(pane,'Search '+c+' names or aliases','picker-search-'+c,'','search'),results=el('div'),chosen=el('p');results.className='catalog-results';results.id='picker-results-'+c;pane.append(el('p','Partial reference list — not all game content.'),results,chosen);
   function search(){const entries=searchReferences(referencePack.entries,c,query.value);results.replaceChildren(el('p',entries.length?`${entries.length} matches${entries.length>20?' — showing first 20; narrow search':''}`:'No matches. Create a custom goal below.'));for(const entry of entries.slice(0,20)){const b=ui.button(entry.name,()=>{selected=entry;chosen.textContent='Selected: '+entry.name;updatePreview();});b.dataset.referenceId=entry.id;results.append(b);}}query.addEventListener('input',search);search();read=()=>{if(!selected)throw Error('Select a reference or create a custom goal.');return {title:selected.name,category:c,catalogRef:selected.id};};}
  if(c!=='custom'){const custom=ui.button('Not listed? Create custom goal',()=>{category.value='custom';update();form.querySelector('#cursor-title').focus();});custom.dataset.createCustom='true';pane.append(custom);}
  const value={pane,read};states.set(c,value);return value;
 }
 function read(){if(!NEW_CATEGORIES.includes(category.value))throw Error('Choose a category.');const fields=state(category.value).read();if(!fields.title)throw Error('Title is required.');return {...fields,status:status.value};}
 function updatePreview(){try{preview.textContent='Goal preview: '+read().title;}catch{preview.textContent='Goal preview: complete the selection above.';}ui.place();}
 function update(){for(const s of states.values())s.pane.hidden=true;if(category.value)state(category.value).pane.hidden=false;updatePreview();}
 category.addEventListener('change',update);form.addEventListener('input',updatePreview);form.addEventListener('change',updatePreview);update();return {read};
}
