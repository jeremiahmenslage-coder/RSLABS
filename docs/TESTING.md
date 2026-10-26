# Test inventory and command side effects

Run commands from the application root, not OSRSLABS. Node 20+ is required; this Windows machine reports Node 24.22.1. There are no npm dependencies, so no package install is needed for Node checks or the application. Python/Playwright and Graphviz are separate optional development tools.

| Command | Classification | Side effects / limitations |
|---|---|---|
| node --test tests/assets.test.mjs tests/graph.test.mjs tests/indexeddb.test.mjs tests/phase1.test.mjs | Current regression suite, also exposed as npm test | 34 model/assets/state/mock-storage checks; no project-file writes observed in reviewed tests. Not real browser IndexedDB. |
| node tests/performance_spike.mjs | Synthetic layout/model probe | Console measurements only; not release performance acceptance. |
| npm run dev | Current source server | Uses 127.0.0.1:4173; opening the app can access that browser origin's IndexedDB. |
| npm run preview | Existing dist server | Serves the preserved build without rebuilding it. |
| npm run build | Static build | Deletes and recreates dist; obtain task authorization before regenerating a preserved build. |
| python tests/static_phase1_smoke.py | Current HTTP smoke | Rebuilds dist, starts/stops a local server, checks 11 responses; not browser E2E. |
| python tests/static_asset_check.py | Earlier HTTP asset smoke | Reads existing dist, starts/stops a local server; still useful for byte/MIME/404 checks. Does not rebuild first. |
| python tests/browser_phase1.py | Current inline DOM interactions | Requires Playwright; hardcodes /usr/bin/chromium, so Windows setup repair is pending. Uses mocked IndexedDB and overwrites evidence/phase1-editor-chromium-inline.png. |
| node scripts/benchmark-layout.mjs | Optional Graphviz comparison | Requires dot executable; overwrites evidence/layout-benchmark.json. Benchmark modules stay in src pending separate relocation approval. |
| python tests/browser_phase0.py | Legacy; incompatible with current Phase 1 | Old concatenated harness omits Phase 1 modules and expects window.__phase0 and removed controls; writes historical-style screenshots. Preserve, do not use as current coverage. |
| python tests/browser_perf.py | Legacy; incompatible with current Phase 1 | Depends on browser_phase0 harness and old globals; writes evidence/browser_perf.json. |

The Windows python command resolved to an unusable WindowsApps alias during audit; no Python or browser tools were installed. Do not treat earlier Linux sandbox navigation restrictions as proof of restrictions on this Windows machine.

## Acceptance and evidence protection

The seven-node/six-edge README walkthrough is the primary Phase 1 acceptance scenario, including both connection methods, mutation undo/redo, saved positions/types/notes, failed-save/last-known-good/retry, and invalid connection rejection. The founding five-node scenario remains baseline coverage. Use isolated disposable test data; do not reset or overwrite an existing personal roadmap. Preserve the application's origin, storage identifiers and schema.

Original evidence is historical. For future authorized test runs use a separate checkout or explicitly agreed output location so scripts do not overwrite delivered evidence. Test-harness repairs, dependencies and application fixes require separate authorization. Phase acceptance remains the Owner's decision; Phase 2 requires its own authorization.
