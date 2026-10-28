import {checked} from '../model/actions.js';
import {resolveNodeIcon} from '../assets/resolve.js';
export const MAX_BACKUP_BYTES=64*1024*1024;
export const PORTABILITY_WARNING='Backups contain icon references only, not image files. Unknown or unavailable icons use a fallback; keep any original asset package separately.';
export function exportRoadmap(doc){
 const text=JSON.stringify(checked(doc),null,2);
 if(new TextEncoder().encode(text).length>MAX_BACKUP_BYTES)throw Error('Roadmap exceeds the 64 MiB backup safety limit. No backup was downloaded.');
 return text;
}
export function previewImport(text){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_BACKUP_BYTES)throw Error('Backup exceeds the 64 MiB safety limit.');
 let doc;try{doc=JSON.parse(text);}catch{throw Error('Malformed JSON backup. No roadmap was changed.');}
 checked(doc);
 return {document:doc,title:doc.roadmap.title,nodes:doc.roadmap.nodes.length,edges:doc.roadmap.edges.length,groups:doc.roadmap.groups.length,
  unknownIcons:doc.roadmap.nodes.filter(n=>resolveNodeIcon(n).source==='original_fallback'&&(n.iconOverride||n.catalogRef)).length};
}
// A backup is valid for replacement only while the exact exported snapshot is current.
export class BackupSession {
 constructor(){this.exported=null;this.preview=null;}
 export(doc){const text=exportRoadmap(doc);this.exported=JSON.stringify(doc);return text;}
 prepare(text){this.preview=null;this.preview=previewImport(text);return this.preview;}
 canReplace(doc){return !!this.preview&&this.exported===JSON.stringify(doc);}
 replacement(doc){if(!this.canReplace(doc))throw Error('Export the current roadmap before replacement.');return checked(structuredClone(this.preview.document));}
 cancel(){this.preview=null;}
}
