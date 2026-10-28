import {resolveNodeIcon,bindImageFallback} from '../assets/resolve.js';
export function categoryIconPreview(form,category){
 const preview=document.createElement('div');preview.className='category-preview';preview.dataset.categoryPreview='true';
 function update(){const asset=resolveNodeIcon({category:category.value}),image=document.createElement('img'),text=document.createElement('span');image.src=asset.src;image.alt='';image.className='board-icon';bindImageFallback(image,asset.fallback);text.textContent=asset.description;preview.replaceChildren(image,text);}
 category.addEventListener('change',update);form.append(preview);update();return preview;
}
