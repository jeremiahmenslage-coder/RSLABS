import {categoryIconPreview} from './category-icon.js';
import {RELATIONSHIP_LABELS} from './labels.js';
import {CATEGORIES,EDGE_KINDS,STATUSES,STATUS_LABELS,readiness} from '../model.js';
const el=(tag,text,cls)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x;};
const field=(labelText,input)=>{const label=el('label',labelText,'form-label');label.htmlFor=input.id;return [label,input];};
const input=(id,value,type='text')=>{const x=el(type==='textarea'?'textarea':'input');x.id=id;x.className='text-field';if(type!=='textarea')x.type='text';x.value=value??'';return x;};
const select=(id,items,value)=>{const x=el('select');x.id=id;x.className='text-field';for(const [key,label] of items){const opt=el('option',label);opt.value=key;x.append(opt);}x.value=value||items[0]?.[0];return x;};
const btn=(text,fn,cls='')=>{const b=el('button',text,cls);b.type='button';b.addEventListener('click',fn);return b;};
export class Inspector {
 constructor(root,api){this.root=root;this.api=api;this.mode='empty';this.draft=null;this.baseline='';}
 currentFields(){const get=id=>this.root.querySelector('#'+id)?.value;
  if(this.mode==='node'||this.mode==='create')return [get('goal-title'),get('goal-category'),get('goal-notes'),get('goal-status')];
  if(this.mode==='edge')return [get('edge-kind')];
  if(this.mode==='connect')return [get('link-source'),get('link-target'),get('link-kind')];return [];
 }
 track(){this.baseline=JSON.stringify(this.fields());}
 fields(){if(this.mode==='group')return [this.root.querySelector('#group-title')?.value,this.root.querySelector('#group-representative')?.value,[...this.root.querySelectorAll('[data-group-member]:checked')].map(x=>x.value)];return this.currentFields();}
 hasUnsaved(){return this.mode!=='empty'&&JSON.stringify(this.fields())!==this.baseline;}
 confirmLeave(){return !this.hasUnsaved()||window.confirm('Discard unsaved edits in the right-side editor?');}
 reset(){this.mode='empty';this.draft=null;this.baseline='';this.root.replaceChildren(el('h2','Nothing selected'),el('p','Double-click empty canvas to create a goal. Select a goal or connection, then open details; double-click for quick editing.'));}
 node(doc,id,position=null,draft=null){const existing=doc.roadmap.nodes.find(n=>n.id===id);this.mode=existing?'node':'create';this.draft={id,position};const n={...(existing||{title:'',category:'custom',notes:'',iconOverride:null}),...draft};
 this.root.replaceChildren(el('h2',existing?'Edit goal':'Create goal'),el('p',existing?'Changes are saved only when you select Save.':'Cancel will not create an orphan goal.'));
 const title=input('goal-title',n.title);title.maxLength=150;const category=select('goal-category',CATEGORIES.map(x=>[x,x.charAt(0).toUpperCase()+x.slice(1)]),n.category);const notes=input('goal-notes',n.notes,'textarea');notes.rows=5;notes.maxLength=5000;
 const status=select('goal-status',STATUSES.map(key=>[key,STATUS_LABELS[key]]),n.status||'not_started');
 const error=el('p','','form-error');error.id='editor-error';error.setAttribute('role','alert');
 const save=btn('Save goal',()=>this.api.saveNode(existing?.id||null,{title:title.value,category:category.value,notes:notes.value,iconOverride:n.iconOverride??null,status:status.value,
 progress:n.progress??null,catalogRef:n.catalogRef??null},position,error),'primary');save.id='save-goal';const cancel=btn('Cancel',()=>this.api.cancel());cancel.id='cancel-editor';
 this.root.append(...field('Goal title',title),...field('Category',category),...field('Notes',notes),...field('Manual status',status),
 el('p',existing?`Readiness: ${readiness(doc).get(id)}. Based on prerequisites you’ve added.`:'Based on prerequisites you’ve added.'),
 error,save,cancel);
 categoryIconPreview(this.root,category);
 if(existing)this.root.append(btn('Delete goal…',()=>this.api.deleteNode(existing.id),'danger'),el('div',`Node ID: ${existing.id}`,'inspector-detail'));
 else title.focus();this.track();if(draft)this.baseline='transferred-unsaved-draft';
 }
 edge(doc,id,draft=null){const edge=doc.roadmap.edges.find(e=>e.id===id);if(!edge)return this.reset();const byId=new Map(doc.roadmap.nodes.map(n=>[n.id,n.title]));this.mode='edge';this.draft={id};const kind=select('edge-kind',EDGE_KINDS.map(k=>[k,RELATIONSHIP_LABELS[k]]),draft?.kind??edge.kind);
 const error=el('p','','form-error');error.setAttribute('role','alert');this.root.replaceChildren(el('h2','Edit connection'),el('p',`${byId.get(edge.sourceId)} → ${byId.get(edge.targetId)}`),...field('Relationship type',kind),error,btn('Save connection',()=>this.api.editEdge(id,kind.value,error),'primary'),btn('Delete connection…',()=>this.api.deleteEdge(id),'danger'),btn('Cancel',()=>this.api.cancel()),el('div',`Edge ID: ${edge.id}`,'inspector-detail'));this.track();if(draft)this.baseline='transferred-unsaved-draft';
 }
 connect(doc,sourceId,targetId,draft=null){const ns=doc.roadmap.nodes.map(n=>[n.id,n.title]);this.mode='connect';this.draft={sourceId,targetId};const source=select('link-source',ns,sourceId),target=select('link-target',ns,targetId),kind=select('link-kind',EDGE_KINDS.map(k=>[k,RELATIONSHIP_LABELS[k]]),draft?.kind??'order');const error=el('p','','form-error');error.setAttribute('role','alert');
 this.root.replaceChildren(el('h2','Create connection'),el('p','First node = source (outgoing). Second node = destination (incoming).'),...field('Source (from)',source),...field('Destination (to)',target),...field('Relationship type',kind),error,btn('Create directed connection',()=>this.api.connect(source.value,target.value,kind.value,error),'primary'),btn('Cancel',()=>this.api.cancel()));this.track();if(draft)this.baseline='transferred-unsaved-draft';
 }
 error(node,message){node.textContent=message;}
 group(doc,id=null,draft=null){
  const existing=doc.roadmap.groups.find(g=>g.id===id);if(id&&!existing)return this.reset();this.mode='group';this.draft={id};
  const title=input('group-title',draft?.title??existing?.title??'');title.maxLength=150;
  const members=el('fieldset');members.id='group-members';members.append(el('legend','Members (one visual group per goal)'));
  const representative=select('group-representative',[['','No representative']],existing?.representativeNodeId??'');
  const update=()=>{const prior=representative.value,ids=new Set([...members.querySelectorAll('input:checked')].map(x=>x.value));representative.replaceChildren();for(const [id,title] of [['','No representative'],...doc.roadmap.nodes.filter(n=>ids.has(n.id)).map(n=>[n.id,n.title])]){const option=el('option',title);option.value=id;representative.append(option);}representative.value=ids.has(prior)?prior:'';};
  for(const n of doc.roadmap.nodes){const label=el('label',undefined,'member-choice'),box=el('input');box.type='checkbox';box.value=n.id;box.dataset.groupMember='true';box.checked=!!existing&&n.groupId===existing.id;box.addEventListener('change',update);label.append(box,document.createTextNode(`${n.title}${n.groupId&&n.groupId!==id?' (moves from another group)':''}`));members.append(label);}
  update();representative.value=existing?.representativeNodeId??'';
  const error=el('p','','form-error');error.id='group-error';error.setAttribute('role','alert');
  const save=btn('Save group',()=>this.api.saveGroup(id,{title:title.value,memberIds:[...members.querySelectorAll('input:checked')].map(x=>x.value),representativeNodeId:representative.value||null},error),'primary');save.id='save-group';
  this.root.replaceChildren(el('h2',existing?'Edit visual group':'Create visual group'),el('p','Grouping never changes goal identities, manual status, relationships or positions.'),...field('Group name',title),members,...field('Independent representative milestone',representative),error,save,btn('Cancel',()=>this.api.cancel()));
  if(existing)this.root.append(btn(existing.collapsed?'Expand group':'Collapse group',()=>this.api.toggleGroup(id)),btn('Inspect original boundary connections',()=>this.api.inspectGroup(id)),btn('Delete group (ungroup members)…',()=>this.api.deleteGroup(id),'danger'));
  this.track();if(draft)this.baseline='transferred-unsaved-draft';
 }
}
