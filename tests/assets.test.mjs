import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {referenceCatalog} from '../src/catalog/reference.js';
import {iconAssets,resolveIndividualIcon as resolveNodeIcon} from '../src/assets/resolve.js';
import {newFixture} from '../src/fixture.js';
import {graphSignature} from '../src/model.js';
function node(doc,id){return doc.roadmap.nodes.find(n=>n.id===id);}
test('local PNG/WebP are decodable-format files and manifest maps to local relative paths',()=>{
 const png=readFileSync('public/icons/sample-sail.png'),webp=readFileSync('public/icons/sample-ring.webp');
 assert.equal(png.subarray(1,4).toString(),'PNG');
 assert.equal(webp.subarray(0,4).toString(),'RIFF');
 assert.equal(webp.subarray(8,12).toString(),'WEBP');
 for(const {path,mediaType} of Object.values(iconAssets)){
  assert.ok(path.startsWith('./public/icons/'));
  assert.ok(['image/png','image/webp','image/svg+xml'].includes(mediaType));
 }
});
test('inactive catalog default icon is separate from goal status and icon override',()=>{
 const d=newFixture(),s=node(d,'sailing'),r=node(d,'ring');
 assert.equal(s.catalogRef,'demo:sailing');
 assert.equal(referenceCatalog[s.catalogRef].defaultIconAssetId,'test:sail-png');
 assert.equal(resolveNodeIcon(s).src,'./public/icons/sample-sail.png');
 assert.equal(resolveNodeIcon(r).src,'./public/icons/sample-ring.webp');
 assert.equal(Object.hasOwn(referenceCatalog[s.catalogRef],'status'),false);
 s.status='completed'; assert.equal(referenceCatalog[s.catalogRef].defaultIconAssetId,'test:sail-png');
});
test('inactive demo icon override preserves IDs, typed edges, manual positions and asset fallback',()=>{
 const d=newFixture(),sig=graphSignature(d),positions=JSON.stringify(d.roadmap.nodes.map(n=>n.position));
 const s=node(d,'sailing');s.iconOverride='test:alternate-png';
 assert.equal(resolveNodeIcon(s).src,'./public/icons/sample-alternate.png');
 s.iconOverride='test:missing';assert.equal(resolveNodeIcon(s).src,'./public/icons/does-not-exist.png');
 s.iconOverride='not-registered';assert.ok(resolveNodeIcon(s).src.startsWith('data:image/svg+xml,'));
 assert.equal(graphSignature(d),sig);assert.equal(JSON.stringify(d.roadmap.nodes.map(n=>n.position)),positions);
});
