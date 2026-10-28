import {STATUS_LABELS} from '../model.js';
const $=id=>document.getElementById(id);
export function wireBulk({current,selection,apply,clear,notice}){
 const dialog=$('bulk-preview');let pending=null;
 function update(){
  const count=selection().length;$('bulk-toolbar').hidden=!count;$('bulk-count').textContent=`${count} goal${count===1?'':'s'} selected`;
  for(const id of ['bulk-set-status','bulk-create-group','bulk-ungroup','bulk-clear','bulk-delete'])$(id).disabled=!count;
  const select=$('bulk-group'),prior=select.value,entries=current().roadmap.groups.map(g=>[g.id,g.title]),signature=JSON.stringify(entries);
  if(select.dataset.signature!==signature){select.replaceChildren();for(const [id,title] of entries){const opt=document.createElement('option');opt.value=id;opt.textContent=title;select.append(opt);}select.dataset.signature=signature;if(entries.some(([id])=>id===prior))select.value=prior;}
  $('bulk-add-group').disabled=!count||!entries.length;
 }
 function preview(action,{ids:scope=selection(),selectionBound=true}={}){
  const ids=[...scope];if(!ids.length)return;
  const doc=current(),group=doc.roadmap.groups.find(g=>g.id===action.groupId);
  const description=action.kind==='status'?`Set manual status to ${STATUS_LABELS[action.status]}`:action.kind==='create_group'?'Create a new visual group from selection':action.kind==='add_to_group'?`Add selection to group “${group?.title??'Unknown'}”`:'Ungroup selection';
  const displayDescription=description.replaceAll('selection',selectionBound?'selection':'target goal');
  pending={ids,action,baseline:JSON.stringify(doc),description:displayDescription,selectionBound};
  $('bulk-summary').textContent=`${displayDescription} — ${ids.length} ${selectionBound?'selected':'target'} goal${ids.length===1?'':'s'}. Only the goals listed below will be affected.`;
  $('bulk-ids').replaceChildren();for(const id of ids){const item=document.createElement('li');item.textContent=`${doc.roadmap.nodes.find(n=>n.id===id).title} · ${id}`;$('bulk-ids').append(item);}
  $('bulk-name-field').hidden=action.kind!=='create_group';$('bulk-group-title').value='';$('bulk-error').textContent='';dialog.showModal();
  if(action.kind==='create_group')$('bulk-group-title').focus();else $('bulk-apply').focus();
 }
 $('bulk-set-status').addEventListener('click',()=>preview({kind:'status',status:$('bulk-status').value}));
 $('bulk-create-group').addEventListener('click',()=>preview({kind:'create_group'}));
 $('bulk-add-group').addEventListener('click',()=>preview({kind:'add_to_group',groupId:$('bulk-group').value}));
 $('bulk-ungroup').addEventListener('click',()=>preview({kind:'ungroup'}));$('bulk-clear').addEventListener('click',clear);
 function cancel(){pending=null;dialog.close();notice('Bulk action canceled. Roadmap and editor draft unchanged.');}
 $('bulk-cancel').addEventListener('click',cancel);dialog.addEventListener('cancel',e=>{e.preventDefault();cancel();});
 $('bulk-apply').addEventListener('click',()=>{
  if(!pending)return;
  try{
   if(JSON.stringify(current())!==pending.baseline||(pending.selectionBound&&JSON.stringify(selection())!==JSON.stringify(pending.ids)))throw Error('Roadmap or selection changed. Cancel and review the action again.');
   const action={...pending.action};if(action.kind==='create_group')action.title=$('bulk-group-title').value;
   const result=apply(pending.ids,action);if(result===null)return; // Editor discard declined; no state/draft changes.
   const {description,ids}=pending;pending=null;dialog.close();notice(result?`${description}: ${ids.length} explicit goals. Autosave running.`:'Selected goals already match this action; no changes needed.');
  }catch(error){$('bulk-error').textContent=error.message;}
 });
 return {update,preview};
}
