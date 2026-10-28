import {referenceCatalog} from './reference.js';
export function searchCatalog(query='',category=''){const text=query.trim().toLocaleLowerCase();return Object.values(referenceCatalog).filter(r=>r.id.startsWith('osrs:')&&(!text||r.title.toLocaleLowerCase().includes(text))&&(!category||r.category===category));}
