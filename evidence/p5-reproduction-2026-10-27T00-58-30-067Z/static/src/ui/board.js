import {CATEGORIES,STATUSES,STATUS_LABELS} from '../model.js';
import {boardFilters,boardProjection,DEFAULT_BOARD_FILTERS} from '../board.js';
const $=id=>document.getElementById(id),el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
function option(value,label){const n=el('option',label);n.value=value;return n;}
export function wireBoard({current,preference,edit,details,setStatus}){
 const controls={query:$('board-search'),category:$('board-category'),readiness:$('board-readiness'),group:$('board-group')};
 controls.category.append(...CATEGORIES.map(c=>option(c,c)));let signature='';
 function change(){const filters=Object.fromEntries(Object.entries(controls).map(([key,input])=>[key,input.value]));preference(p=>{p.boardFilters=filters;});}
 controls.query.addEventListener('input',change);for(const key of ['category','readiness','group'])controls[key].addEventListener('change',change);
 $('board-clear').addEventListener('click',()=>preference(p=>{p.boardFilters={...DEFAULT_BOARD_FILTERS};}));
 function update(){
  const doc=current(),filters=boardFilters(doc),projection=boardProjection(doc),groups=JSON.stringify(doc.roadmap.groups.map(g=>[g.id,g.title]));
  if(controls.group.dataset.groups!==groups){controls.group.replaceChildren(option('','All groups'),option('ungrouped','Ungrouped'),...doc.roadmap.groups.map(g=>option(`group:${g.id}`,g.title)));controls.group.dataset.groups=groups;}
  for(const prior of controls.group.querySelectorAll('[data-unavailable]'))prior.remove();
  if(filters.group&&![...controls.group.options].some(o=>o.value===filters.group)){const missing=option(filters.group,'Unavailable group — clear filter');missing.dataset.unavailable='true';controls.group.append(missing);}
  for(const [key,input] of Object.entries(controls))if(input.value!==filters[key])input.value=filters[key];
  $('board-results').textContent=`${projection.goals.length} of ${projection.total} goals. Based on prerequisites you’ve added.`;
  $('board-empty').hidden=projection.total>0;$('board-no-results').hidden=projection.total===0||projection.goals.length>0;
  const next=JSON.stringify([projection.goals, [...projection.states],doc.roadmap.groups]);if(next===signature)return;signature=next;
  const columns=$('board-columns');columns.replaceChildren();
  for(const status of STATUSES){const column=el('section');column.className='board-column';column.dataset.status=status;column.setAttribute('aria-label',STATUS_LABELS[status]);column.append(el('h2',`${STATUS_LABELS[status]} (${projection.columns[status].length})`));
   if(!projection.columns[status].length){const empty=el('p','No matching goals in this column.');empty.className='meta-note';column.append(empty);}
   for(const goal of projection.columns[status]){const card=el('article');card.className='board-card';card.dataset.boardGoalId=goal.id;const title=el('button',goal.title);title.className='board-title';title.type='button';title.setAttribute('aria-label',`Quick edit ${goal.title}`);title.addEventListener('click',()=>{const r=title.getBoundingClientRect();edit(goal.id,{x:r.left,y:r.bottom},title);});card.append(title,el('p',`${goal.category} · ${projection.states.get(goal.id)}`));card.dataset.readiness=projection.states.get(goal.id);
    const group=doc.roadmap.groups.find(g=>g.id===goal.groupId);if(group)card.append(el('p',`Group: ${group.title}`));if(goal.progress)card.append(el('p',`Counter: ${goal.progress.current} / ${goal.progress.target}`));
    const label=el('label','Manual status'),select=el('select');select.setAttribute('aria-label',`Manual status for ${goal.title}`);select.append(...STATUSES.map(s=>option(s,STATUS_LABELS[s])));select.value=goal.status;select.addEventListener('change',()=>{try{setStatus(goal.id,select.value);}finally{select.value=current().roadmap.nodes.find(n=>n.id===goal.id)?.status??goal.status;}});label.append(select);card.append(label);
    const more=el('button','More details');more.type='button';more.addEventListener('click',()=>details(goal.id));card.append(more);column.append(card);
   }columns.append(column);
  }
 }
 return {update};
}
