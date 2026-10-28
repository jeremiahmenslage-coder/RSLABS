# P5-005 measured performance and route quality

Windows, Node v24.22.1, Chrome 155.0.8059.85, viewport 1600×1120, unchanged HTTP origin 127.0.0.1:4173, disposable real IndexedDB. Before and after primary runs use the same 12-prerequisite fixture and measurement code: three direct routing samples and three 18-pointer-step drags per density, no CPU throttling. Before replays a fresh copy of the preserved original source; historical build is unchanged. Runs were sequential with no other browser regression suites running. Timing is local headless measurement, not production-scale acceptance.

14 goals, 15 directed edges, 12 incoming hard prerequisites plus permitted soft/order cycle; synthetic illustrative Song of the Elves equivalent, not verified game requirements. Additional after-only high-degree fixture: 26 goals, 27 edges, 24 hard predecessors plus same permitted cycle.

All values ms. Preview is actual GraphView preview-method duration; pointer handler captures synchronous event work. Frame samples are observed requestAnimationFrame intervals during active drags, including browser/harness scheduling. Release is synchronous pointer-up duration (including canonical update/settled routing/DOM). Long tasks are observed browser long-task entries over 50 ms; they measure main-thread blocking, not network. Max is reported, not only averages.

| Run | Density | Router median | Preview p95 / max | Pointer max | Frame p95 / max | Release max | Long tasks |
|---|---|---:|---:|---:|---:|---:|---:|
| before | compact | 314.80 | 361.80 / 580.80 | 580.90 | 347.30 / 576.40 | 248.30 | 57 |
| before | detailed | 335.20 | 331.20 / 364.00 | 364.00 | 319.50 / 361.20 | 281.40 | 57 |
| after | compact | 4.30 | 0.40 / 0.70 | 0.10 | 7.00 / 7.10 | 8.80 | 0 |
| after | detailed | 3.30 | 0.40 / 0.40 | 0.10 | 7.00 / 27.90 | 8.40 | 0 |
| highDegree | compact | 12.00 | 0.50 / 0.70 | 0.10 | 13.90 / 20.70 | 21.50 | 0 |
| highDegree | detailed | 12.40 | 0.40 / 0.60 | 0.10 | 7.10 / 34.80 | 20.30 | 0 |

Raw samples and exact environment: evidence/p5-005-before-calibrated-2026-10-27T23-56-42-766Z/measurements.json; evidence/p5-005-after-final-package-2026-10-28T00-26-28-176Z/measurements.json; evidence/p5-005-high-degree-final-package-2026-10-28T00-26-31-055Z/measurements.json. No universal 60 fps claim: high-degree release and occasional frame intervals still exceed a 16.7 ms frame. No long task observed after remediation on these fixtures; synchronous settled routing is retained, no worker/background architecture is introduced. Pending frame callbacks are canceled and identity-guarded so older drag previews cannot overwrite new geometry. Larger graphs remain a Phase 6 limit.

## Route quality on identical coordinates

Deterministic Node geometry comparison using original router copied in the before static build vs current router, same Node environment, and identical positions. Raid uses the same local ELK output for both; this is geometric quality, separate from Chrome timing above. Counts include permitted crossings; crossing avoidance no longer has an unlimited-detour priority.

| Fixture | Density | Mode | Total Manhattan length | Crossings | Shared segments | Card/line intersections | Label/card | Label/label | Label/edge |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| many | compact | before | 15025 | 27 | 0 | 0 | 0 | 0 | 0 |
| many | compact | after | 11308 | 34 | 0 | 0 | 0 | 0 | 0 |
| raid | compact | before | 8907 | 0 | 0 | 0 | 0 | 0 | 0 |
| raid | compact | after | 8243 | 4 | 0 | 0 | 0 | 0 | 0 |
| many | detailed | before | 17985 | 36 | 0 | 0 | 0 | 0 | 0 |
| many | detailed | after | 10582 | 35 | 0 | 0 | 0 | 0 | 0 |
| raid | detailed | before | 10119 | 0 | 0 | 0 | 0 | 0 | 0 |
| raid | detailed | after | 9271 | 4 | 0 | 0 | 0 | 0 | 0 |

Many-prerequisite total route length is about 25% shorter compact and 41% shorter detailed; raid about 7–8% shorter. Compact crossings increase (27→34); raid crossings increase (0→4). These are disclosed tradeoffs under the authorized short-route policy, not a claim of crossing-free layout. Measured final fixtures have no shared segments, card intersections or label collisions. Overlapping manual cards or other arbitrary graphs may still have occlusions/overlaps; hover/selection emphasis, right-out/left-in ports, typed styling and explicit Source → Destination readouts provide tracing. No goal positions/semantic endpoints are changed by routing. Geometry details: route-quality.json.
