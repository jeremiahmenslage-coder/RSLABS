# Phase 1 engineering handoff — v0.1.0-phase1

**Status:** Phase 0 approved, **Phase 1 expressly authorized and implemented**, Phase 2 **NOT authorized and NOT started**. Recommend **HOLD final Phase 1 acceptance pending normal browser-origin IndexedDB save/reopen/failure owner check** because unrestricted browser navigation is unavailable in engineering sandbox. No known P0/P1 defect in tests actually run.

## Working behavior and source

One immutable-through-actions canonical state store, version-1 schema, node/edge CRUD with right-side forms, empty-canvas double-click, Cancel, both typed connection methods, hard-cycle/duplicate/self-edge rejection, undo/redo (bounded, lost on reload), drag/zoom/pan/Fit/simple Optimize, optional seven-node/6-edge demo and visual equipment group, compact/detailed cards and local original PNG/WebP fallback, IndexedDB transaction-ack autosaving with pending/saving/saved/failed/retry, manual failed-write injection. Complete source ZIP plus manifest and static build; see `README.md` for Windows Command Prompt launch/owner acceptance test.

### Architecture interfaces for future engineers

- `src/model.js` validates schema and hard DAG; `src/model/actions.js` returns validated **new documents** for every graph mutation, and contains no rendering/storage access.
- `src/state/store.js` alone owns current snapshot/history and emits changes.
- `src/storage/indexeddb.js` wraps `documents/active` read/write and serializes writes via `SaveCoordinator`; only DB transaction completion signals Saved. No data-reset on corruption.
- `src/ui/graph.js` displays projection/temporary drag location; `src/ui/inspector.js` owns draft/editor form; `src/main.js` orchestrates.
- `src/fixture.js` demo only; `src/catalog/reference.js` separated from user nodes; `src/assets/resolve.js` allowlisted test icons/placeholder; `src/layout.js` swappable, no production-scale claim.
- Do not import game assets without provenance/permission. User-file-picker/blob workflow **not authorized** as part of Phase 1 scope.

## Executed tests

`npm test`: **34/34 passed** (including inherited Phase 0 14). `python tests/browser_phase1.py`: **15/15 passed** real Chromium DOM/gestures with **mock IndexedDB**. `python tests/static_phase1_smoke.py`: **11/11 passed** real HTTP module and asset checks. `npm run build`: passed. Host is Linux Node 22, headless Chromium. **Direct HTTP-loaded Chromium E2E and real-origin IndexedDB integration NOT RUN** due `ERR_BLOCKED_BY_ADMINISTRATOR`; explicit owner-run README steps are pending. No fabricated test pass. Report/details: `TEST_REPORT.md`, `evidence/phase1-*`.

## Known limits / risks

- **Gate evidence:** real Windows browser-origin reload/last good save is unverified and mandatory before owner signs off; any actual bug requires Phase 1 repair.
- No JSON backup in Phase 1: local browser-origin state can be lost if browser data cleared. Warn before irreplaceable usage. Phase 2 export/import must be independently authorized.
- The one-pass small graph layout cannot handle 250/400 chain legibly (~91k px); Phase 3 layout navigation/ELK candidate, Phase 6 profile, no premature new solver.
- P2 overlapping labels/dense fit, Phase 3. Browser a11y/mobile testing Phase 6. Authentic icons rights unresolved, user-provided PNG/WebP import and full catalog Phase 5 unless separately approved; no unlicensed sprites in archive.

## Suggested Phase 2 plan (NOT authorized)

Add and test readiness from user-defined incoming hard prerequisites only, status/manual counters without status propagation, shareable reused nodes, hard-cycle invariants; implement versioned JSON export/import with preview, corrupt-file/no-overwrite and round-trip tests, including complete custom asset bytes if such uploads are ever permitted (otherwise explicit nonportable limits). Carry forward Phase 1 tests and owner scenario. **STOP and request explicit Phase 2 authorization.**
