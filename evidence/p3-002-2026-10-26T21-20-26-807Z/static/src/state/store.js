import {checked} from '../model/actions.js';
const clone=v=>structuredClone(v);
export class RoadmapStore {
 constructor(snapshot){this.current=checked(clone(snapshot));this.undoStack=[];this.redoStack=[];this.listeners=new Set();this.revision=0;}
 subscribe(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
 emit(reason){for(const fn of this.listeners)fn(this.current,reason);}
 command(transform){const next=checked(transform(this.current));if(JSON.stringify(next)===JSON.stringify(this.current))return false;
   this.undoStack.push(clone(this.current));if(this.undoStack.length>80)this.undoStack.shift();this.redoStack=[];this.current=next;this.revision++;this.emit('change');return true;}
 replace(next){this.command(()=>checked(clone(next)));}
 pref(transform){const next=checked(transform(this.current));if(JSON.stringify(next)===JSON.stringify(this.current))return false;this.current=next;this.revision++;this.emit('preference');return true;}
 undo(){if(!this.undoStack.length)return false;this.redoStack.push(clone(this.current));this.current=this.undoStack.pop();this.revision++;this.emit('change');return true;}
 redo(){if(!this.redoStack.length)return false;this.undoStack.push(clone(this.current));this.current=this.redoStack.pop();this.revision++;this.emit('change');return true;}
}
