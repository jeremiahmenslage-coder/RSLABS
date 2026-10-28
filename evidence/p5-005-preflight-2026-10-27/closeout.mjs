import fs from 'node:fs';const dir='evidence/p5-005-preflight-2026-10-27/';
let s=fs.readFileSync(dir+'deliver.mjs','utf8');const names={
 'p5-005-2026-10-28T00-16-41-209Z':'p5-005-2026-10-28T00-25-08-906Z',
 'p5-004-2026-10-28T00-16-41-606Z':'p5-004-2026-10-28T00-25-46-972Z',
 'p3-005-2026-10-28T00-16-42-109Z':'p3-005-2026-10-28T00-25-46-982Z',
 'p3-002-2026-10-28T00-16-43-126Z':'p3-002-2026-10-28T00-25-46-977Z',
 'phase3-2026-10-28T00-16-42-597Z':'phase3-2026-10-28T00-25-47-406Z'};
for(const [a,b]of Object.entries(names))s=s.replaceAll(a,b);
s=s.replace('to about 4.1/3.3 ms','to about 4.3/3.3 ms').replace('after under 10 ms','after about 10 ms').replace('~315–335ms→3–4ms','~315–335ms→3–5ms').replace('~248–281ms→under10ms','~248–281ms→about10ms').replace('No stale background router result exists; stale RAF callbacks are canceled/guarded.','No stale background router result exists; stale RAF callbacks are canceled/guarded. History/menu interruptions cancel active preview first; actual Ctrl+Z during a held drag is regression-tested.');fs.writeFileSync(dir+'deliver.mjs',s);
let perf=fs.readFileSync(dir+'performance-report.mjs','utf8').replace('p5-005-after-review-2026-10-28T00-17-23-911Z','p5-005-after-final-package-2026-10-28T00-26-28-176Z').replace('p5-005-high-degree-review-2026-10-28T00-17-26-840Z','p5-005-high-degree-final-package-2026-10-28T00-26-31-055Z');fs.writeFileSync(dir+'performance-report.mjs',perf);
for(const [file,pattern]of [['DECISIONS.md',/\nP5-005 engineering outcome:[^\n]*\n/],['docs/agents/CURRENT_PHASE_GATE.md',/\n\n## P5-005 delivery checkpoint — 2026-10-27 local\n\nMeasured[^\n]*\n/],['docs/TESTING.md',/\nP5-005 final:[^\n]*\n/]])fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace(pattern,''));
