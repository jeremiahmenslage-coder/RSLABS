# Current migration handoff — 2026-10-26

Owner authorized backup, local Git setup, and documentation/instruction cleanup only; see ADR-014 in `DECISIONS.md`. Current gate: Phase 1 delivered pending acceptance; Phase 2 not authorized. Root `AGENTS.md` is installed, role files remain in `docs/agents/`, and staged migration originals moved from `src/` to `docs/migration/`. No application code, tests, browser data, historical evidence or checkpoints were altered.

Original delivery is preserved in local Git commit `2b232bcc999c1b56496766943be795a01ed10033` and the verified workspace ZIP described in `docs/history/CHECKPOINTS.md`. The historical handoff below reports prior authorization; its conditional activation evidence was not independently established by migration. Current decisions supersede historical start orders. See `docs/TESTING.md` for legacy harness limitations. Two role chats have not been created or behavior-validated. Next development task: Owner-guided Phase 1 browser acceptance review; no fixes or Phase 2 are commissioned.

---

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


## Migration validation and next handoff

Post-cleanup Node checks passed 34/34 on Windows Node 24.22.1; original protected files and relocated kit originals match the verified backup. See TEST_REPORT.md for scope and limitations. No browser acceptance was performed. Git contains a baseline commit and a separate documentation/configuration maintenance commit; use git log/status to obtain current refs rather than treating this handoff as the live Git state. No remote or external publication was configured.
