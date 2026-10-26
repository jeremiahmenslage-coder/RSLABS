# Test strategy / acceptance ladder

## Layer 1: pure unit tests (every commit)

Use Node built-in test runner for canonical fixture names, exact six ordered pairs, type enums, uniqueness, missing/dangling IDs, self-edge rejection, group referential integrity, hard-cycle rejection and soft/order cycle tolerance. Layout returns finite positions, preserves semantic signature, ranks directed acyclic fixture, and does not produce overlapping node boxes in either density. Projection must be read-only, retain graph signature, never introduce projected semantic edges, preserve cross-group counts, and handle representative nodes.

## Layer 2: state/storage integration (Phase 1 mock coverage implemented; real-origin checks pending)

Model → action → derived graph and undo/redo transactional semantics; IndexedDB autosave success/failure reporting; debounced drag commit; recover persisted positions/edges/status across browser reload; versioned migration/backup round-trip; invalid JSON import and interrupted migration preserve last valid graph. Use isolated browser storage contexts and a stub that can fail transactions. Include property-based generated graphs for cycles/ref integrity.

## Layer 3: browser interaction tests

Phase 0: real Chromium DOM pointer events with inline HTML/CSS/JS harness (URL navigation restricted here): fixture render+icons, card drag, inspector edit, output-handle→input-handle connection, duplicate rejection, kind edit, edge-label hit test, compact/detailed, group collapse/expand with invariant graph signature, optimize layout, pan+zoom, reset. These tests are **not substitutes** for HTTP-served app smoke, multi-browser, or accessibility testing.

Phase 1: actual URL browser E2E of double-click empty canvas→editor Save/Cancel at graph coordinates; two connect mechanisms, both edge kinds/undo/delete/redo; accurate click/drag hitboxes at multiple zoom levels; refresh restoration under real browser-origin IndexedDB. Tests to run in Chrome/Firefox/WebKit on a machine permitting browser URLs.

Phase 2: readiness 0/1/2+ incoming hard; soft/order not blocking; completed wins even when prerequisites unfinished; 70 Prayer reuse; corrupted/missing data import recovery.

Phase 3: 100 hidden completed nodes, group representative independence, crossing semantics, focus upstream/downstream/both, manual positions after Optimize, clutter/readability, non-hard cycles.

Phase 4: graph↔board shared-node status/counter changes, filters and startup view persistence.

Phase 5: catalog source-qualified identity, icon override/fallback, duplicate catalog refs create distinct node instances, update preserves player nodes, source license coverage report.

Phase 6: 250+/400+ generated diverse graphs, time render/pan/zoom/layout, edge hit accuracy, memory, keyboard/touch/Safari/Firefox, offline-hosted bundles and error paths. Establish target bounds from recorded evidence and owner approval; no made-up fps threshold.

## Reproducibility and defects

- Current command inventory and side effects: `docs/TESTING.md`. `npm test` runs current Node coverage. `browser_phase0.py` and `browser_perf.py` are preserved legacy Phase 0 harnesses and are incompatible with the current Phase 1 app. Do not use them as current regression commands.
- Report Pass / Fail / Not run, exact environment, relevant fixture and screenshots *alongside* automation results.
- Any P0/P1 stops phase acceptance; P2 deferral requires owner decision; rerun full relevant suite after fixes.
- Browser admin policy in this sandbox is a known test **limitation**, not an app pass or failure. Normal hosted-page E2E remains Not run.


## Phase 0 follow-up strategy / actual evidence

Narrow additions were made as requested: asset allowlist/format signature and catalog-node separation unit tests; Chromium inline-harness tests for actual PNG and WebP decode, override and onerror fallback; static `dist/` asset HTTP GET and MIME/404 checks; three-shape layout benchmark comparing custom JS and Graphviz dot (Graphviz installed in engineer environment only). Logs recorded in `evidence/`. These checks do not replace a normal HTTP Chromium E2E. Phase 1 must add that test in a permissive environment, and Phase 3 must validate ELK.js rendered port/route geometry with same representative fixtures and grouping. No performance acceptance bound was invented from single-shot timings.

---

## Phase 1 actual strategy and execution (2026-10-25)

- Node built-in `node --test` covers old Phase 0 F1 invariants and new versioned schema, immutable create/edit/delete/move/connect operations, typed edge validation, undo/redo, layout invariance and in-memory SaveCoordinator ordering/failure tests. Three added IndexedDB *API simulator* contract tests verify atomic snapshot read/write, aborted write preservation and invalid version rejection. This is not real browser IndexedDB.
- Chromium Playwright uses `page.set_content()` on an inline document, recursively rewritten data-URL ES imports, and a **mock IndexedDB** (required because `page.goto()` is administratively blocked). It tests actual pointer coordinates/events and inspector behaviors, 15 cases; screenshots are supplementary.
- Static build smoke starts the real Node HTTP server on a separate port, requests HTML/CSS/JS/original PNG/WebP over HTTP and checks 404 semantics (11 cases). It is not HTTP **browser** E2E.
- **Outstanding owner gate:** run README scenario on actual Windows Chrome/Edge `http://127.0.0.1:4173/`, refresh and compare persistent graph/positions; induce write failure and verify no false Saved, last committed record survives restart, Retry commits. Record browser build/OS/origin; any failing mandatory action must be repaired under Phase 1.
- Phase 2/3/5/6 tests will be authored only after their separate phase authorizations. Preserve every previous applicable regression test on subsequent accepted phases.
