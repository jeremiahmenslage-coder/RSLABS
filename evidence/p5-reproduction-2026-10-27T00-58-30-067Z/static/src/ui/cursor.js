import {configureProgressInput} from '../progress-input.js';
import {CATEGORIES,EDGE_KINDS,STATUSES,STATUS_LABELS} from '../model.js';
import {createNode,editNode,connect,editEdge,editConnection,reverseEdge,deleteEdge} from '../model/actions.js';
import {saveGroup} from '../model/groups.js';
import {bulkAction} from '../model/bulk.js';
import {RELATIONSHIP_LABELS,RELATIONSHIP_HELP} from './labels.js';
const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
export function cursorPosition(anchor,size,viewport){return {x:Math.max(8,Math.min(anchor.x+8,viewport.w-size.w-8)),y:Math.max(8,Math.min(anchor.y+8,viewport.h-size.h-8))};}
export function contextTarget(target,selection){
 const goal=target.closest('[data-node-id]');if(goal)return selection.includes(goal.dataset.nodeId)?{kind:'selection',ids:[...selection]}:{kind:'goal',id:goal.dataset.nodeId};
 const edge=target.closest('[data-edge-id]');if(edge)return {kind:'edge',id:edge.dataset.edgeId};
 const group=target.closest('[data-group-id],[data-summary-kind="group"]');if(group)return {kind:'group',id:group.dataset.groupId??group.dataset.summaryId};
 const summary=target.closest('[data-summary-kind="completed"]');if(summary)return {kind:'completed',id:summary.dataset.summaryId};
 return {kind:'canvas'};
}
export class CursorUI {
 constructor(viewport,api){
  this.viewport=viewport;this.api=api;this.dialog=document.getElementById('cursor-dialog');this.anchor={x:0,y:0};this.returnTo=()=>viewport;this.menuMode=false;
  this.dialog.addEventListener('cancel',event=>{event.preventDefault();this.dismiss();});
  this.dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const fields=[...this.dialog.querySelectorAll('input,select,button,summary,[tabindex="0"]')].filter(n=>!n.disabled&&n.getClientRects().length);const index=fields.indexOf(document.activeElement);if(event.shiftKey&&index<=0){event.preventDefault();fields.at(-1)?.focus();}else if(!event.shiftKey&&(index===fields.length-1||index<0)){event.preventDefault();fields[0]?.focus();}});
  this.dialog.addEventListener('keydown',event=>{if(!this.menuMode||!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;event.preventDefault();const items=[...this.dialog.querySelectorAll('[role="menuitem"]')],at=items.indexOf(document.activeElement);const index=event.key==='Home'?0:event.key==='End'?items.length-1:(at+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;items[index]?.focus();});
  new ResizeObserver(()=>{if(this.dialog.open)this.place();}).observe(this.dialog);window.addEventListener('resize',()=>{if(this.dialog.open)this.place();});
  viewport.addEventListener('contextmenu',event=>{event.preventDefault();if(this.dialog.open||document.querySelector('dialog[open]'))return;this.openContext(event.target,{x:event.clientX,y:event.clientY});});
  viewport.addEventListener('keydown',event=>{if(event.key!=='ContextMenu'&&!(event.shiftKey&&event.key==='F10'))return;event.preventDefault();event.stopPropagation();const r=event.target.getBoundingClientRect();this.openContext(event.target,{x:r.left+r.width/2,y:r.top+Math.min(r.height,40)});});
 }
 current(){return this.api.current();}
 goal(id){const n=this.current().roadmap.nodes.find(n=>n.id===id);if(!n)throw Error('Goal no longer exists.');return n;}
 edge(id){const e=this.current().roadmap.edges.find(e=>e.id===id);if(!e)throw Error('Connection no longer exists.');return e;}
 remember(target){const goal=target.closest?.('[data-node-id]'),edge=target.closest?.('[data-edge-id]'),group=target.closest?.('[data-group-id],[data-summary-kind="group"]');
  const board=target.closest?.('[data-board-goal-id]');if(board){const id=board.dataset.boardGoalId;this.returnTo=()=>[...document.querySelectorAll('[data-board-goal-id]')].find(n=>n.dataset.boardGoalId===id)?.querySelector('.board-title')??document.getElementById('board-search');return;}
  const resolve=(selector,field,id)=>()=>[...this.viewport.querySelectorAll(selector)].find(n=>n.dataset[field]===id)??this.viewport;
  this.returnTo=goal?resolve('[data-node-id]','nodeId',goal.dataset.nodeId):edge?resolve('[data-edge-id]','edgeId',edge.dataset.edgeId):group?()=>[...this.viewport.querySelectorAll('.group-heading,[data-summary-kind="group"] button')].find(n=>(n.closest('[data-group-id],[data-summary-kind="group"]').dataset.groupId??n.closest('[data-summary-kind="group"]').dataset.summaryId)===(group.dataset.groupId??group.dataset.summaryId))??this.viewport:()=>target.isConnected&&target.focus?target:this.viewport;
 }
 place(){const r=this.dialog.getBoundingClientRect(),p=cursorPosition(this.anchor,{w:r.width,h:r.height},{w:innerWidth,h:innerHeight});this.dialog.style.left=`${p.x}px`;this.dialog.style.top=`${p.y}px`;}
 open(title,anchor,target=this.viewport){
  if(this.dialog.open&&!this.menuMode&&this.dirty()&&!window.confirm('Discard unsaved quick editor input?'))return false;
  this.anchor=anchor;this.remember(target);this.dialog.replaceChildren();const heading=el('h2',title);heading.id='cursor-heading';this.dialog.append(heading);this.error=el('p','');this.error.id='cursor-error';this.error.className='form-error';this.error.setAttribute('role','alert');this.menuMode=false;
  if(!this.dialog.open)this.dialog.showModal();this.place();return true;
 }
 dirty(){return this.baseline!==this.values();}
 values(){return JSON.stringify([...this.dialog.querySelectorAll('input,select')].map(n=>n.value));}
 dismiss(){this.close();}
 close(restore=true){this.dialog.close();this.menuMode=false;if(restore)this.returnTo()?.focus({preventScroll:true});}
 guard(fn){try{for(const n of this.dialog.querySelectorAll('[aria-invalid]'))n.removeAttribute('aria-invalid');fn();}catch(error){this.error.textContent=error.message;const key=/counter|current|target/i.test(error.message)?'current':/title|name/i.test(error.message)?'title':/category/i.test(error.message)?'category':/status/i.test(error.message)?'status':'kind';const field=this.dialog.querySelector(`#cursor-${key}`);if(field){field.closest('details')?.setAttribute('open','');field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby','cursor-error');field.after(this.error);field.focus({preventScroll:true});}this.place();}}
 button(label,fn,id){const b=el('button',label);b.type='button';if(id)b.id=id;b.addEventListener('click',()=>this.guard(fn));return b;}
 field(form,label,id,value,type='text',options=null){
  const input=el(options?'select':'input');input.id=id;if(options)for(const [key,text] of options){const option=el('option',text);option.value=key;input.append(option);}else input.type=type;input.value=value??'';input.className='text-field';
  const caption=el('label',label);caption.htmlFor=id;caption.className='form-label';form.append(caption,input);return input;
 }
 form(title,anchor,target,build,submit,details){
  if(!this.open(title,anchor,target))return;const form=el('form');form.noValidate=true;const values=build(form),row=el('div');row.className='cursor-actions';
  const primary=el('button',title==='Create goal here'?'Create goal':title==='Create directed connection'?'Create connection':'Save changes');primary.type='submit';primary.id='cursor-submit';row.append(primary,this.button('Cancel',()=>this.close(),'cursor-cancel'));
  if(details)row.append(this.button('More details',()=>{const focus=this.api.details(details.kind,details.payload(values));if(focus){this.close(false);focus.focus();}},'cursor-details'));
  form.append(this.error,row);form.addEventListener('submit',event=>{event.preventDefault();this.guard(()=>{if(submit(values)!==null)this.close();});});this.dialog.append(form);this.baseline=this.values();this.place();form.querySelector('input,select,button')?.focus({preventScroll:true});
 }
 run(transform){return this.api.run(transform);}
 progressFields(form,n){
  const status=this.field(form,'Manual status','cursor-status',n.status??'not_started','text',STATUSES.map(k=>[k,STATUS_LABELS[k]]));
  const current=this.field(form,'Current (optional)','cursor-current',n.progress?.current??'','number'),target=this.field(form,'Target (optional)','cursor-target',n.progress?.target??'','number');
  configureProgressInput(current);configureProgressInput(target,{target:true});form.append(el('p','Leave both counters blank to remove them. Counters never change completion.'));return {status,current,target};
 }
 goalFields(form,n,{creation=false}={}){
  const title=this.field(form,'Title','cursor-title',n.title??''),category=this.field(form,'Category','cursor-category',n.category??'custom','text',CATEGORIES.map(x=>[x,x]));title.maxLength=150;
  let progress=form;if(creation){const disclosure=el('details');disclosure.append(el('summary','Progress (optional)'));form.append(disclosure);progress=disclosure;}
  return {title,category,...this.progressFields(progress,n)};
 }
 goalValues(fields){return {title:fields.title.value,category:fields.category.value,status:fields.status.value,progress:fields.current.value===''&&fields.target.value===''?null:{current:fields.current.value===''?NaN:Number(fields.current.value),target:fields.target.value===''?NaN:Number(fields.target.value)}};}
 create(position,anchor,target=this.viewport){
  this.form('Create goal here',anchor,target,form=>this.goalFields(form,{},{creation:true}),
   fields=>{const result=this.run(d=>createNode(d,{...this.goalValues(fields),notes:'',iconOverride:null},position));if(result!==null)this.api.created(this.current().roadmap.nodes.at(-1).id);return result;},
   {kind:'create',payload:fields=>({position,fields:this.goalValues(fields)})});
  this.dialog.querySelector('#cursor-title').maxLength=150;
 }
 connection(sourceId,targetId,anchor,target=this.viewport){
  const source=this.goal(sourceId),destination=this.goal(targetId);
  this.form('Create directed connection',anchor,target,form=>{form.append(el('p',`${source.title} → ${destination.title}`),el('small',`${sourceId} → ${targetId}`),el('p',RELATIONSHIP_HELP));return {kind:this.field(form,'Relationship type','cursor-kind','order','text',EDGE_KINDS.map(k=>[k,RELATIONSHIP_LABELS[k]]))};},
   fields=>{const result=this.run(d=>connect(d,sourceId,targetId,fields.kind.value));if(result!==null)this.api.connected(this.current().roadmap.edges.at(-1).id);return result;},
   {kind:'connect',payload:fields=>({sourceId,targetId,kind:fields.kind.value})});
 }
 editGoal(id,mode='all',anchor=this.anchor,target=this.returnTo()){const n=this.goal(id);
  if(mode==='all'){this.form('Edit goal',anchor,target,form=>this.goalFields(form,n),fields=>this.run(d=>editNode(d,id,{...d.roadmap.nodes.find(n=>n.id===id),...this.goalValues(fields)})),{kind:'goal',payload:fields=>({id,fields:this.goalValues(fields)})});return;}
  this.form(mode==='rename'?'Rename goal':'Edit manual counters',anchor,target,form=>{
   if(mode==='rename'){const title=this.field(form,'Title','cursor-title',n.title);title.maxLength=150;return {title};}
   form.append(el('p','Counters never change manual completion. Leave both blank to remove them.'));
   const current=this.field(form,'Current','cursor-current',n.progress?.current??'','number'),target=this.field(form,'Target','cursor-target',n.progress?.target??'','number');for(const input of [current,target]){input.min='0';input.step='any';}return {current,target};
  },fields=>this.run(d=>editNode(d,id,{...d.roadmap.nodes.find(n=>n.id===id),...(mode==='rename'?{title:fields.title.value}:{progress:fields.current.value===''&&fields.target.value===''?null:{current:fields.current.value===''?NaN:Number(fields.current.value),target:fields.target.value===''?NaN:Number(fields.target.value)}})})),{kind:'goal',payload:fields=>({id,fields:mode==='rename'?{title:fields.title.value}:{progress:fields.current.value===''&&fields.target.value===''?null:{current:fields.current.value===''?NaN:Number(fields.current.value),target:fields.target.value===''?NaN:Number(fields.target.value)}}})});
 }
 editConnection(id,anchor,target=this.viewport){const edge=this.edge(id);
  this.form('Edit connection',anchor,target,form=>{
   form.append(el('p',`${this.goal(edge.sourceId).title} → ${this.goal(edge.targetId).title}`),el('small',`${edge.sourceId} → ${edge.targetId}`),el('p',RELATIONSHIP_HELP));
   const kind=this.field(form,'Relationship type','cursor-kind',edge.kind,'text',EDGE_KINDS.map(k=>[k,RELATIONSHIP_LABELS[k]]));
   form.append(this.button('Reverse direction',()=>{if(this.run(d=>{const original=d.roadmap.edges.find(e=>e.id===id);if(!original)throw Error('Connection no longer exists.');return editConnection(d,id,{kind:kind.value,sourceId:original.targetId,targetId:original.sourceId});})!==null)this.close();},'cursor-reverse'),this.button('Delete connection…',()=>{if(window.confirm('Delete this directed connection? You can undo.'))if(this.run(d=>deleteEdge(d,id))!==null)this.close();},'cursor-delete'));
   return {kind};
  },fields=>this.run(d=>editEdge(d,id,fields.kind.value)),{kind:'edge',payload:fields=>({id,fields:{kind:fields.kind.value}})});
 }
 renameGroup(id){const group=this.current().roadmap.groups.find(g=>g.id===id);if(!group)throw Error('Group no longer exists.');
  this.form('Rename visual group',this.anchor,this.returnTo(),form=>({title:this.field(form,'Group name','cursor-title',group.title)}),fields=>this.run(d=>{const g=d.roadmap.groups.find(g=>g.id===id);if(!g)throw Error('Group no longer exists.');return saveGroup(d,id,{title:fields.title.value,memberIds:d.roadmap.nodes.filter(n=>n.groupId===id).map(n=>n.id),representativeNodeId:g.representativeNodeId});}),{kind:'group',payload:fields=>({id,fields:{title:fields.title.value}})});
 }
 details(kind,payload){const focus=this.api.details(kind,payload);if(focus){this.close(false);focus.focus();}}
 showBulk(action,ids,selectionBound){this.close(false);this.api.bulk(action,{ids,selectionBound});}
 openContext(target,anchor){
  const context=contextTarget(target,this.api.selection());this.api.beforeMenu();
  const title=context.kind==='selection'?`Selection: ${context.ids.length} selected goals`:context.kind==='goal'?`Goal: ${this.goal(context.id).title} (single goal)`:context.kind==='edge'?'Connection (single connection)':context.kind==='group'?'Visual group':context.kind==='completed'?'Completed branch summary':'Empty canvas';
  this.open(title,anchor,target);this.menuMode=true;const menu=el('div');menu.setAttribute('role','menu');
  const add=(label,fn)=>{const b=this.button(label,fn);b.setAttribute('role','menuitem');menu.append(b);};
  const command=transform=>{if(this.run(transform)!==null)this.close();};
  const groupActions=(ids,bound)=>{add('Create group…',()=>this.showBulk({kind:'create_group'},ids,bound));for(const group of this.current().roadmap.groups)add(`Add to group: ${group.title}…`,()=>this.showBulk({kind:'add_to_group',groupId:group.id},ids,bound));add('Ungroup…',()=>this.showBulk({kind:'ungroup'},ids,bound));};
  if(context.kind==='goal'){
   for(const status of STATUSES)add(`Set status: ${STATUS_LABELS[status]}`,()=>command(d=>bulkAction(d,[context.id],{kind:'status',status})));
   add('Rename…',()=>this.editGoal(context.id,'rename'));add('Edit counters…',()=>this.editGoal(context.id,'counters'));groupActions([context.id],false);
   for(const direction of ['upstream','downstream','both'])add(`Focus ${direction}`,()=>{this.api.focus(context.id,direction);this.close();});add('Open details',()=>this.details('goal',{id:context.id}));
  }else if(context.kind==='selection'){
   for(const status of STATUSES)add(`Set ${context.ids.length} goals: ${STATUS_LABELS[status]}…`,()=>this.showBulk({kind:'status',status},context.ids,true));groupActions(context.ids,true);
  }else if(context.kind==='edge'){
   const edge=this.edge(context.id);menu.append(el('p',`${this.goal(edge.sourceId).title} → ${this.goal(edge.targetId).title}`));
   for(const kind of EDGE_KINDS)add(`Change type: ${RELATIONSHIP_LABELS[kind]}`,()=>command(d=>editEdge(d,context.id,kind)));
   add('Reverse direction',()=>command(d=>reverseEdge(d,context.id)));
   add('Delete connection…',()=>{if(window.confirm(`Delete connection ${this.goal(edge.sourceId).title} → ${this.goal(edge.targetId).title}?`))command(d=>deleteEdge(d,context.id));});add('Open details',()=>this.details('edge',{id:context.id}));
  }else if(context.kind==='group'){
   const group=this.current().roadmap.groups.find(g=>g.id===context.id);add('Rename group…',()=>this.renameGroup(context.id));add(group.collapsed?'Expand group':'Collapse group',()=>command(d=>this.api.toggleGroup(d,context.id)));add('Open details',()=>this.details('group',{id:context.id}));
  }else if(context.kind==='completed')add('Expand completed branch',()=>{this.api.expandCompleted(context.id);this.close();});
  else add('Create goal here…',()=>this.create(this.api.canvasPosition(anchor),anchor,this.viewport));
  if(['canvas','completed'].includes(context.kind)){add('Fit graph',()=>{this.api.fit();this.close();});add('Reset focus',()=>{this.api.resetFocus();this.close();});}
  menu.append(this.button('Close menu',()=>this.close(),'cursor-cancel'));this.dialog.append(menu,this.error);this.place();menu.querySelector('[role="menuitem"]')?.focus({preventScroll:true});
 }
}
