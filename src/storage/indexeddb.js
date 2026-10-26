import {checked} from '../model/actions.js';
export const DB_NAME='osrs-ironman-roadmap';
export const DB_VERSION=1;
const STORE='documents';const KEY='active';
export function openDatabase(indexedDB=globalThis.indexedDB){
 if(!indexedDB) return Promise.reject(Error('IndexedDB unavailable. Open from a local HTTP origin.'));
 return new Promise((resolve,reject)=>{let settled=false;const r=indexedDB.open(DB_NAME,DB_VERSION);
 r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE);};
 r.onsuccess=()=>{settled=true;resolve(r.result);};r.onerror=()=>{settled=true;reject(r.error||Error('Cannot open IndexedDB'));};r.onblocked=()=>{if(!settled)reject(Error('Database upgrade blocked. Close other tabs.'));};
 });
}
export function readDocument(db){return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readonly');const r=t.objectStore(STORE).get(KEY);r.onsuccess=()=>resolve(r.result??null);r.onerror=()=>reject(r.error||Error('Read failed'));t.onabort=()=>reject(t.error||Error('Read aborted'));});}
export function writeDocument(db,document){checked(document);const snapshot=structuredClone(document);
 return new Promise((resolve,reject)=>{let t;try{t=db.transaction(STORE,'readwrite');t.objectStore(STORE).put(snapshot,KEY);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error||Error('Save transaction failed'));t.onabort=()=>reject(t.error||Error('Save transaction aborted'));}catch(err){reject(err);}});
}
export function readValidated(saved){if(saved===null)return null;
 if(typeof saved!=='object'||Array.isArray(saved))throw Error('Saved data is not a valid object. No changes were made.');
 if(saved.schemaVersion!==1)throw Error(`Unsupported saved schema ${String(saved.schemaVersion)}. Existing data preserved; no automatic reset.`);
 return checked(saved);
}
export class SaveCoordinator {
 constructor({write,onStatus,delay=280}){this.write=write;this.onStatus=onStatus;this.delay=delay;this.timer=null;this.busy=false;this.queued=null;this.revision=0;this.savedRevision=0;this.failed=false;this.waiters=[];this.status('idle');}
 status(state,details=''){this.state=state;this.onStatus?.(state,details);}
 enqueue(snapshot,{immediate=false}={}){this.revision++;this.queued={revision:this.revision,document:structuredClone(snapshot)};this.failed=false;this.status('pending');clearTimeout(this.timer);if(immediate)this.flush();else this.timer=setTimeout(()=>this.flush(),this.delay);}
 async flush(){clearTimeout(this.timer);this.timer=null;if(this.busy||!this.queued)return;
 const job=this.queued;this.queued=null;this.busy=true;this.status('saving');try{
  await this.write(job.document);this.savedRevision=job.revision;this.failed=false;this.busy=false;
  if(this.queued){this.status('pending');return this.flush();}
  this.status('saved');this.settle();
 }catch(error){this.failed=true;this.busy=false; // Retain the newest uncommitted snapshot in memory only; no false Saved.
  if(!this.queued||this.queued.revision<job.revision)this.queued=job;
  this.status('failed',error?.message||String(error));this.settle(error);
 }}
 retry(){if(this.queued){this.failed=false;this.status('pending');return this.flush();}return Promise.resolve();}
 settle(error){for(const {resolve,reject} of this.waiters.splice(0)){if(error)reject(error);else resolve();}}
 whenSettled(){if(this.failed)return Promise.reject(Error('Save failed'));if(!this.busy&&!this.queued)return this.failed?Promise.reject(Error('Save failed')):Promise.resolve();return new Promise((resolve,reject)=>this.waiters.push({resolve,reject}));}
}
