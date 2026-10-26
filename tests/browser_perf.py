"""Reproducible non-release Phase 0 stress probe using Chromium inline harness."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
import shutil
from browser_phase0 import harness

def main():
    html,js=harness()
    with sync_playwright() as p:
        exe=shutil.which('chromium') or shutil.which('google-chrome')
        browser=p.chromium.launch(**({'executable_path':exe} if exe else {}),headless=True,args=['--no-sandbox'])
        page=browser.new_page(viewport={'width':1440,'height':850})
        page.set_content(html);page.add_script_tag(content=js)
        result=page.evaluate('''() => {
            const template=data.roadmap.nodes[0];
            data.roadmap.nodes=Array.from({length:250},(_,i)=>({...template,id:'bench_'+i,title:'Test Goal '+i,groupId:null,position:{x:(i%20)*280,y:Math.floor(i/20)*150}}));
            data.roadmap.groups=[];
            const pairs=[];
            for(let i=0;i<249;i++)pairs.push([i,i+1]);
            for(let i=0;i<151;i++)pairs.push([i,Math.min(249,i+4)]);
            data.roadmap.edges=pairs.map(([s,t],i)=>({id:'bench_edge_'+i,sourceId:'bench_'+s,targetId:'bench_'+t,kind:i%3?'order':'hard'}));
            const t=performance.now();render();const initialDomRenderMs=performance.now()-t;
            const nodes=document.querySelectorAll('.node-card').length,edges=document.querySelectorAll('g.edge').length;
            const layoutStart=performance.now();applyPositions(data,optimizePositions(data,'detailed'));const layoutMs=performance.now()-layoutStart;
            const t2=performance.now();render();const postLayoutRenderMs=performance.now()-t2;
            return {nodes,edges,initialDomRenderMs:+initialDomRenderMs.toFixed(2),layoutMs:+layoutMs.toFixed(2),postLayoutRenderMs:+postLayoutRenderMs.toFixed(2),viewport:'1440x850',browser:navigator.userAgent};
        }''')
        browser.close()
    target=Path(__file__).resolve().parents[1]/'evidence/browser_perf.json'
    target.parent.mkdir(exist_ok=True)
    target.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))

if __name__=='__main__':main()
