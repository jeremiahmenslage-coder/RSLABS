import fs from 'node:fs';
import {extractPngExports} from '../../scripts/prepare-artwork.mjs';
const data=extractPngExports(fs.readFileSync('evidence/p5-002-preflight-2026-10-27/Dava96-src_generated_category-icons.ts','utf8'));
for(const name of ['combat','combatIcon','skillsIcon','prayer','prayerIcon','questStartIcon','minigameMapIcon'])fs.writeFileSync('evidence/p5-003-preflight-2026-10-27/'+name+'.png',data.get(name));
