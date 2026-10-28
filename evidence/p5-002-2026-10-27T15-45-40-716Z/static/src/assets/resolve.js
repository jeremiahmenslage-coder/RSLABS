import {artworkAssets,artworkByCatalog} from './artwork.js';
import {referenceCatalog} from '../catalog/reference.js';
import {iconData} from '../icons.js';

// Pinned local artwork, original category symbols and preserved legacy/test assets.
// Arbitrary user disk paths/remote URLs are not accepted.
export const iconAssets=Object.freeze({
  ...artworkAssets,
  ...Object.fromEntries(['quest','skill','item','boss','diary','prayer','activity'].map(category=>[`local:${category}`,{path:`./public/icons/reference-${category}.svg`,mediaType:'image/svg+xml'}])),
  'test:sail-png':{path:'./public/icons/sample-sail.png',mediaType:'image/png'},
  'test:ring-webp':{path:'./public/icons/sample-ring.webp',mediaType:'image/webp'},
  'test:alternate-png':{path:'./public/icons/sample-alternate.png',mediaType:'image/png'},
  'test:missing':{path:'./public/icons/does-not-exist.png',mediaType:'image/png'},
  'test:scroll-svg':{path:'./public/icons/scroll.svg',mediaType:'image/svg+xml'},
  'test:armor-svg':{path:'./public/icons/armor.svg',mediaType:'image/svg+xml'},
  'test:shield-svg':{path:'./public/icons/shield.svg',mediaType:'image/svg+xml'},
  'test:moon-svg':{path:'./public/icons/moon.svg',mediaType:'image/svg+xml'},
});
export const POC_ICON_OPTIONS=Object.freeze(['auto',...Object.keys(artworkAssets),...['quest','skill','item','boss','diary','prayer','activity'].map(category=>`local:${category}`),'test:sail-png','test:ring-webp','test:alternate-png','test:missing']);
export function resolveNodeIcon(node){
  const catalog=referenceCatalog[node.catalogRef];
  const id=node.iconOverride || artworkByCatalog[node.catalogRef]?.assetId || catalog?.defaultIconAssetId || null;
  const asset=id&&Object.hasOwn(iconAssets,id)?iconAssets[id]:null;
  return {assetId:id,src:asset?.path ?? iconData.scroll,fallback:iconData.scroll,
    source:id&&asset?(id.startsWith('art:')?'pinned_authentic_asset':id.startsWith('local:')?'local_original_asset':'local_test_asset'):'original_fallback'};
}
export function bindImageFallback(img,fallback){
  img.addEventListener('error',()=>{
    if(img.dataset.fallbackApplied==='true')return; // no infinite retry
    img.dataset.fallbackApplied='true';
    img.src=fallback;
  },{once:false});
}
