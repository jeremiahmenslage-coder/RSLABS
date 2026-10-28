export const cardSize=density=>density==='compact'?{w:176,h:76}:{w:236,h:108};
export const SUMMARY_SIZE=Object.freeze({w:284,h:208});
export const GROUP_PADDING=Object.freeze({left:28,right:28,top:44,bottom:28});
export function boxesOverlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
