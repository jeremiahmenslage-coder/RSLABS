# P5-002 consolidated engineering delivery — 2026-10-27

Owner replacement ticket is implemented for independent reviewer and CEO review before Owner Phase 5 acceptance (ADR-025). Phase 5 remains unaccepted; Phase 6 NOT AUTHORIZED. Owner reports Jagex permission for third-party sourcing/bundling in this private local planner: Owner-provided, not independently verified, no broader distribution rights implied.

Exact checkout: C:\Users\Jeremiah\OneDrive\Desktop\OSRSLABS\Phase1\osrs-phase1-editor; branch main; HEAD 604d4d6d21fcd0030286acb400087cb14388e8f7. Existing Phase 2–5/Owner edits remain unstaged/uncommitted. No staging, commits, branch changes, push or deployment. Incremental inventory/hashes: evidence/p5-002-preflight-2026-10-27/delivery-manifest.json (relative to starting-files.json, not Git HEAD).

Implemented: 94 locally bundled unchanged PNGs (60,053 bytes), explicit stable-ID mappings and pinned provenance/notices. 207 references: 90 identity-specific matches (24 skills, 30 items, 29 prayers, 7 activities), 117 generic markers (32 quests, 24 bosses, 48 diary tiers, 13 activities). Generic markers are not individual illustrations. OSRSBox pin dae12e3400add0c71465f07a334f9d8f86bebce8; Dava96 pin 16c5de73d6c57e1b47ef0606cf4b6e4ff39e82c6. Source/license/coverage/update report: catalog/ARTWORK.md and artwork-manifest.json. OSRSBox GPL source notice includes Jagex/Wiki exceptions; Dava96 declares CC BY-NC-SA 3.0. Original source notices/credits retained verbatim; no upstream code installed/executed or application relicensing. Preparation uses Node built-ins only; no new dependencies, runtime CDN or integration.

Graph status shortcut removed; visible status and quick/detailed/Board editing retained. Inspector Cancel resets the unsaved form and closes details without a data/history command; panel toggle still preserves drafts. Creation starts with catalog search beside prominent Create custom goal. Custom opens minimal title/category directly; path switching retains input and reference replacement asks before overwriting it. More details retains draft/reference/intended coordinates. Counter controls remain hidden.

Data impact: no migration/schema/storage/origin changes. New icon IDs are presentation defaults plus optional explicit overrides accepted by existing validation. Manual overrides win; legacy/unknown references and original missing-image fallback retained. Catalog updates do not rewrite user records. IDs, edits, manual statuses, hidden fractional counters, positions, groups, relationships and JSON recovery preserved. Protected dist, vendor, existing routing/storage/history code and original evidence retained. Tests used fresh disposable contexts, not personal browser data.

| Check | Actual result / evidence |
|---|---|
| npm test | Pass 93/93; evidence/p5-002-preflight-2026-10-27/node-tests-final.txt |
| node scripts/prepare-artwork.mjs --check | Pass: cached pinned source hashes, 94 PNGs, generated metadata/defaults and four verbatim source notices |
| node scripts/import-catalog.mjs catalog/reference-source.json --check | Pass; existing 207 reference records unchanged |
| node tests/browser_p5_002.mjs | Pass 13/13; evidence/p5-002-2026-10-27T15-45-40-716Z/results.json; separate static build matches final source/public bytes, all 94 PNGs decode, screenshot gallery, both creation paths/coordinates/drafts, status/keyboard/history/reload, overrides/fallback, changed-default fixture, backups and failed-save/import recovery |
| node tests/browser_editing.mjs | Pass 9/9; evidence/p3-005-2026-10-27T15-39-48-598Z/results.json; discard/history, actual pointer cancellation and atomic combined edits |
| node tests/browser_bulk.mjs | Pass 13/13; evidence/p3-002-2026-10-27T15-39-49-072Z/results.json; mouse selection/pairing, bulk groups/status/history/recovery |
| node tests/browser_phase3.mjs | Pass 12/12; evidence/phase3-2026-10-27T15-39-49-499Z/results.json; layout/group/visibility/navigation/roundtrip |
| Current browser/build total | Pass 47/47 groups; Windows, Node v24.22.1, Chrome 155.0.8059.85, HTTP 127.0.0.1:4173, real IndexedDB in disposable contexts |
| Fresh-cache --fetch through final preparation CLI; mobile/other browsers; full live catalog link audit | Not run. Assessment scripts fetched pinned inputs successfully with approved network access; final CLI cached preparation/check tested. |
| Old browser_phase5/board/cursor/workspace/phase2 runners | Not run this ticket; some creation/status assumptions superseded. Relevant shared workflows covered above; unchanged historical results retain original attribution. |

Failures retained honestly: first Node expectation still expected the original default icon; updated the one obsolete assertion, then all passed. Early P5-002 browser runs failed because native search Escape cleared the query without closing the quick dialog. Reproduced and fixed explicit Escape dismissal; final suite asserts dialog closure and passes. Failed/debug evidence remains separately preserved (15:33, 15:35 runs); no failures relabeled as passes.

Known limitations: no observed P0/P1 in executed checks. P2 content coverage gap: 117 category markers lack unique per-entry illustrations; curated catalog/snapshot is not comprehensive/current-game certification. Permission is Owner-reported only; broader redistribution not established. P3 routing limits for arbitrary overlapping/non-planar graphs and Phase 6 performance/browser/mobile hardening remain unchanged; no routing work in P5-002. Earlier Owner notes prompt after clicking a Graph goal was not reproduced by P5-001; original report/attribution remains preserved, not claimed fixed by hiding controls.

Run: npm run dev, then http://127.0.0.1:4173/ at the existing browser origin. No install. Separate verified review build: http://127.0.0.1:4173/evidence/p5-002-2026-10-27T15-45-40-716Z/static/ . Do not run the default build over preserved dist. Recheck with npm test, node scripts/prepare-artwork.mjs --check, and the browser commands above (existing Playwright module path documented in docs/TESTING.md).

Owner walkthrough (disposable data; export personal roadmap before replacement):
1. Double-click empty canvas: catalog search is first and Create custom goal is beside it. Create directly from custom title/category; switch back/search and decline replacing entered fields. Cancel/Escape makes no orphan. More details retains input/position at zoom/pan.
2. Search/create representative skill, item, prayer and activity icons; quest/boss/diary generic markers are disclosed. Create the same catalog goal twice; edit one independently. In details choose a manual icon override; reload and JSON roundtrip preserve it, with original fallback for missing icons.
3. Graph cards show manual status without a shortcut button. Double-click a goal or use keyboard/context editing; change status in quick/details/Board, Undo/Redo and switch views. Hidden numeric values remain preserved and absent from UI.
4. Edit unsaved inspector notes: panel toggle hides/reopens with draft intact. Cancel discards the form and closes; reopen to see saved values. Cancel creation makes no orphan, and Cancel changes no history. Try connection/group forms too.
5. Export/reload/preview/replace a disposable backup. Use Help / Diagnostics failure injection, verify visible failure/Retry and prior committed roadmap after failed replacement. Reset diagnostics and retry before leaving unsaved work.

Stop: independent reviewer and CEO review, then Owner Phase 5 acceptance. No Phase 6 authorization inferred.
