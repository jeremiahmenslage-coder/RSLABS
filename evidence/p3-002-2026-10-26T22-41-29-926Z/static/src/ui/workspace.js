// Panel visibility and width are temporary UI state, independent of the roadmap.
export function wireWorkspace({prepare}){
 const panel=document.getElementById('details-panel'),toggle=document.getElementById('inspector-toggle'),handle=document.getElementById('panel-resize');
 const place=()=>{if(!panel.hidden)toggle.style.right=`${panel.getBoundingClientRect().width}px`;};
 window.addEventListener('resize',place);
 const show=()=>{panel.hidden=false;toggle.setAttribute('aria-expanded','true');toggle.textContent='› Close details';place();};
 const close=()=>{panel.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.textContent='‹ Open details';toggle.style.right='0';toggle.focus({preventScroll:true});};
 toggle.addEventListener('click',()=>{if(panel.hidden){prepare();show();}else close();});
 let start=null;handle.addEventListener('pointerdown',e=>{e.preventDefault();start={x:e.clientX,width:panel.getBoundingClientRect().width};handle.setPointerCapture(e.pointerId);});
 handle.addEventListener('pointermove',e=>{if(!start)return;panel.style.width=`${Math.min(innerWidth-140,Math.max(280,start.width+start.x-e.clientX))}px`;place();});
 handle.addEventListener('pointerup',()=>start=null);handle.addEventListener('pointercancel',()=>start=null);
 handle.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();panel.style.width=`${Math.min(innerWidth-140,Math.max(280,panel.getBoundingClientRect().width+(e.key==='ArrowLeft'?20:-20)))}px`;place();});
 return {open:show,close,isOpen:()=>!panel.hidden};
}
