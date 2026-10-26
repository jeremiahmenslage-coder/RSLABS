# Phase 1 executed QA report — 2026-10-25

## Environment

Linux x86_64 sandbox; Node **22.16.0**; Chromium `/usr/bin/chromium` (headless Playwright Python); Python **3.13**; local Node HTTP server bound to `127.0.0.1`. Browser policy blocks direct navigation to HTTP, file, data, and intercepted localhost URLs (`net::ERR_BLOCKED_BY_ADMINISTRATOR`) even though the host HTTP server responds normally. No unrestricted Windows Chrome/Edge could be automated from this environment.

## Actual executed results

| Check | Result | Evidence / command |
|---|---|---|
| Phase 0 regression + Phase 1 model/actions/state + IndexedDB mock transaction tests | **PASS 34/34** | `npm test`; `evidence/phase1-node-test-output.txt` |
| Chromium DOM interactions exercising actual forms, pointer gestures, mode/group toggling, simulated failed save with a **mock IndexedDB** | **PASS 15/15** | `python tests/browser_phase1.py`; `evidence/phase1-browser-output.json`, `evidence/phase1-editor-chromium-inline.png` |
| Static build | **PASS** | `npm run build`; `dist/`, `evidence/phase1-build-output.txt` |
| HTTP server static content, JS/CSS modules, PNG/WebP and nonexistent 404 | **PASS 11/11** | `python tests/static_phase1_smoke.py`; `evidence/phase1-static-http-output.json` |
| Conventional browser navigation to `http://127.0.0.1:4173/` | **NOT RUN successfully — environment blocked** | Navigation attempted; `ERR_BLOCKED_BY_ADMINISTRATOR` (host HTTP responds 200). Not labeled as passed. |
| **Real Chromium-origin IndexedDB write/reload/recovery** | **NOT RUN** | Browsing under HTTP origin impossible in engineering environment; Node IDB *mock* and Chromium inline IDB *mock* are **not substitutes** |
| Real browser-origin quota failure / multiple tab race | **NOT RUN** | Engineered injected failure and transaction-abort mock tested; owner/restricted environment follow-up needed |
| Firefox, Safari, mobile/responsive end-to-end | **NOT RUN** | Deferred supported platform claims; Phase 6 cross-browser/mobile checks |
| Owner normal-browser Phase 1 acceptance walkthrough | **NOT RUN by engineering** | README detailed 9-step owner-run checklist; request actual version/origin and results |
| Phase 0 250/400 layout comparator | **CARRIED FORWARD** | Previous measured simple/Graphviz bounds; no new Phase 3 layout implementation |

## Coverage details

**Node tests:** 14 inherited Phase 0 + 17 new Phase 1 editor/state/SaveCoordinator + 3 mocked IndexedDB transaction tests = 34. Validate schema, unique pairs, hard cycles, group projection, canonical F1 six links, standalone new roadmap, CRUD, undo/redo/branch invalidation, positions, icon references, invalid/future schema handling, serialized writes and delayed queue, transactional simulated abort, last-known-good and retry.

**Chromium interaction suite:** Starts with no nodes; Cancel without orphan; zoom-aware world-coordinate create/undo; empty-canvas create seven; inspector title/notes; unsaved-edit discard confirmation; select-two connection; port-to-port connection; edge edit/delete/undo; duplicate/self/hard-cycle rejection; drag/undo/redo; Optimize/undo preserving signatures; visible simulated save failure with fake durable store and Retry; node delete undo/incident edge restoration; optional demo/group/density/new empty. This runs **real Chromium DOM events and pointer movements**, but the **DOM is loaded with `set_content`, JS as data-URL ES modules, and an in-memory IndexedDB shim**. This does **not** prove persistent browser-origin writes or browser navigation compatibility. Original icon decoding is covered by prior Phase 0 visual spike and current HTTP byte checks, not by this inline test harness.

**Defects found and fixed during Phase 1:** Shift-click destination was dropped by pointer handler (fixed); hidden Retry surfaced because general button `display:block` overrode `[hidden]` (fixed); unsaved editor fields could be reset by context-switch (added confirmation). After these fixes, the full reported suites are green.

## Owner gate check — must execute before approval

Follow README under a real **Chrome/Edge** URL `http://127.0.0.1:4173/`: create canonical seven names and six pairs; use both connection methods; edit/delete/undo/redo; drag three cards/Optimize/move again; wait for **Saved** and refresh; compare IDs, kinds, notes and last positions; inject simulated write failure, confirm **SAVE FAILED**, verify previous committed record recovers if reloaded without retry, then retry successfully and recover updated record. Record exact **browser version**, URL, OS, Pass/Fail, and any observed console errors. Do not accept Phase 1 if true in-browser loss/recovery or a required edit workflow fails.

## Known test limitations vs defects

The policy-blocked browser navigation is **not** evidence that the application is broken. It is also **not** evidence that persistence works under real browser storage. No known confirmed P0/P1 from executed tests; the unresolved browser integration evidence requires explicit review and should prevent **unconditional** gate acceptance.
