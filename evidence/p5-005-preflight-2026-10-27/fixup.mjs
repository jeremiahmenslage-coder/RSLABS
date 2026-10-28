import fs from 'node:fs';
let s=fs.readFileSync('src/main.js','utf8');s=s.replace("if(regionSelection.includes(id)&&!shift){selected={type:'node',id};pair=[];refresh();return;}regionSelection=[];if(shift)","regionSelection=[];if(shift)");fs.writeFileSync('src/main.js',s);
for(const f of ['src/main.js','src/ui/graph.js','src/ui/inspector.js','DECISIONS.md'])fs.writeFileSync(f,fs.readFileSync(f,'utf8').trimEnd()+'\n');
const f='docs/agents/CURRENT_PHASE_GATE.md';s=fs.readFileSync(f,'utf8');const at=s.indexOf('## P5-005 authorized remediation');if(at>=0)s=s.slice(0,at).trimEnd()+'\n\n'+s.slice(at).replaceAll('\r\n','\n').trimEnd()+'\n';fs.writeFileSync(f,s);
