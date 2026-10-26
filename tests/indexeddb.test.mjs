import test from 'node:test';
import assert from 'node:assert/strict';
import {openDatabase,readDocument,writeDocument,readValidated} from '../src/storage/indexeddb.js';
import {emptyRoadmap,createNode} from '../src/model/actions.js';

// Deterministic IDB API simulator to exercise our transaction contract.
// This does NOT substitute for real Chromium-origin IndexedDB integration.
function fakeIDB(){
 let disk, fail=false;
 const db={objectStoreNames:{contains:()=>true}, createObjectStore:()=>{}, transaction(_store,mode){
  const tx={oncomplete:null,onerror:null,onabort:null,error:null};
  tx.objectStore=()=>({get(){const request={};queueMicrotask(()=>{request.result=structuredClone(disk??null);request.onsuccess?.();});return request;},
    put(snapshot){queueMicrotask(()=>{if(fail){fail=false;tx.error=Error('Simulated disk quota');tx.onabort?.();}else{disk=structuredClone(snapshot);tx.oncomplete?.();}});}});
  return tx;
 }};
 const factory={open(){const request={};queueMicrotask(()=>{request.result=db;request.onsuccess?.();});return request;}};
 return {factory,setFailure:()=>{fail=true;},getDisk:()=>structuredClone(disk)};
}
test('IDB adapter writes a complete snapshot and reads it back after reopen (mocked browser API)',async()=>{
 const fake=fakeIDB(),db=await openDatabase(fake.factory);
 assert.equal(await readDocument(db),null);
 const first=createNode(emptyRoadmap(),{title:'70 Prayer',category:'prayer',notes:'reused goal',iconOverride:null},{x:12,y:45});
 await writeDocument(db,first);const nextDb=await openDatabase(fake.factory);const recovered=readValidated(await readDocument(nextDb));
 assert.deepEqual(recovered,first);
});
test('IDB aborted write preserves last committed document (mocked transaction)',async()=>{
 const fake=fakeIDB(),db=await openDatabase(fake.factory),good=emptyRoadmap();await writeDocument(db,good);
 fake.setFailure();const next=createNode(good,{title:'test',category:'custom',notes:'',iconOverride:null},{x:1,y:1});
 await assert.rejects(writeDocument(db,next),/quota/);
 assert.deepEqual(readValidated(await readDocument(db)),good);assert.deepEqual(fake.getDisk(),good);
});
test('IDB invalid new document is rejected before transaction begins',async()=>{
 const fake=fakeIDB(),db=await openDatabase(fake.factory),good=emptyRoadmap();await writeDocument(db,good);
 const bad={...good,schemaVersion:999};assert.throws(()=>writeDocument(db,bad),/Unsupported/);
 assert.deepEqual(await readDocument(db),good);
});
