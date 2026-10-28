import {BackupSession,MAX_BACKUP_BYTES,PORTABILITY_WARNING} from '../storage/backup.js';
const $=id=>document.getElementById(id);
function download(text){
 const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
 const link=document.createElement('a');link.href=url;link.download=`ironman-roadmap-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
export function wireBackup({current,replace,notice,lock}){
 const session=new BackupSession(),dialog=$('import-preview');let busy=false;
 const update=()=>{$('replace-import').disabled=busy||!session.canReplace(current())||!$('backup-retained').checked;};
 const doExport=()=>{try{download(session.export(current()));notice('Backup download requested. Verify the JSON file is saved before replacing your roadmap.');update();}catch(error){session.exported=null;notice(`Export failed: ${error.message}`,'error');update();}};
 $('export-roadmap').addEventListener('click',doExport);$('export-before-import').addEventListener('click',doExport);
 $('import-roadmap').addEventListener('click',()=>{$('import-file').value='';$('import-file').click();});
 $('import-file').addEventListener('change',async()=>{
  const file=$('import-file').files[0];if(!file)return;
  try{
   session.cancel();if(file.size>MAX_BACKUP_BYTES)throw Error('Backup exceeds the 64 MiB safety limit.');
   const p=session.prepare(await file.text());
   $('import-summary').textContent=`Replace with “${p.title}”: schema ${p.document.schemaVersion}, ${p.nodes} goals, ${p.edges} relationships, ${p.groups} groups. All goal data, IDs, manual statuses, positions and preferences will be retained. ${p.unknownIcons} goal(s) have unresolved icon/catalog references.`;
   $('import-warning').textContent=PORTABILITY_WARNING;$('import-error').textContent='';$('backup-retained').checked=false;update();dialog.showModal();
  }catch(error){session.cancel();notice(`Import rejected: ${error.message}`,'error');}
 });
 function cancel(){if(busy)return;session.cancel();dialog.close();notice('Import canceled. Active roadmap unchanged.');}
 $('cancel-import').addEventListener('click',cancel);dialog.addEventListener('cancel',e=>{e.preventDefault();cancel();});
 $('backup-retained').addEventListener('change',update);
 $('replace-import').addEventListener('click',async()=>{
  try{
   if(!$('backup-retained').checked)throw Error('Verify your backup is saved first.');
   const candidate=session.replacement(current());
   if(!window.confirm('Replace the ENTIRE active roadmap with this preview? Unsaved editor drafts will be discarded. Confirm only after keeping the exported backup.'))return;
   busy=true;lock(true);update();$('cancel-import').disabled=true;$('export-before-import').disabled=true;
   await replace(candidate);session.cancel();dialog.close();notice('Imported roadmap committed to this browser. Previous roadmap is in your exported backup and session Undo.');
  }catch(error){$('import-error').textContent=`Import not applied: ${error.message}. Active roadmap and last committed copy were preserved.`;}
  finally{busy=false;lock(false);$('cancel-import').disabled=false;$('export-before-import').disabled=false;update();}
 });
}
