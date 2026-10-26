# Phase 1 — delivered build acceptance review (NOT an implementation ticket)

**Current gate:** Phase 1 delivered; not yet accepted; Phase 2 NOT authorized.

## First pass — read-only repo audit

Confirm (and report unknown when inaccessible): correct repo root; branch/commit/tag; `git status`; existing `AGENTS.md` and role files; actual npm scripts; architecture modules; current README and handoff; test inventory; whether phase1 branch/source matches the copy the Owner received. Do **not** alter source, initialize Git, install dependencies or change any file during this pass.

## Primary walkthrough — later Phase 1 delivery contract

Use README.md, section "Phase 1 owner acceptance walkthrough (normal app)", together with docs/PHASE1_AUTHORIZATION.md §4. Create the exact seven nodes and six directed connections, use both connection methods and mixed edge kinds, move three nodes, edit/delete/undo/redo, optimize then move again, and verify saved IDs/fields/positions after refresh. Exercise failed-save feedback, last-known-good recovery, retry, duplicate/self-edge and hard-cycle rejection.

Use an isolated browser profile with disposable test data; New empty roadmap and Load demo replace active data. Do not clear the Owner's site data. The application URL/origin and database schema must stay unchanged. No acceptance is claimed by this checklist.

## Founding baseline walkthrough — five-node scenario

1. Open the exact delivered application via the verified run instructions.
2. Double-click empty canvas: detailed editor opens; cancel creates no ghost node; save creates a custom node in the expected position.
3. Create **five nodes** and edit at least one; labels/details survive.
4. Connect them with multiple incoming and outgoing **directed** edges using **both** methods: handle drag and selecting two nodes + Connect.
5. Set/change edge type and direction, edit an existing edge, delete an edge; distinguish visible edge types.
6. Drag nodes, pan, zoom, fit-to-view and select/edit without accidentally creating a connection.
7. Delete a node and confirm incident edges go while unrelated nodes/edges remain.
8. Undo and redo main graph mutations; verify consistent restored state, including edge types and positions.
9. Refresh/reopen app; nodes, surviving edges, positions and types must persist from autosave.
10. Observe any persistence failure/error state; app must not falsely announce a successful save.
11. Recheck an existing earlier Phase 0 path, especially the exact six-edge converging fixture if it remains testable, to detect regressions.

A passing unit test or static build is **insufficient** for the actual browser controls. Owner personally verifies required workflows; actual test report must distinguish automation from human steps.

## Review output (CEO or Engineer)

| Check | Pass / Fail / Not run | Reproduction/evidence | Severity if failed |
|---|---|---|---|
| Existing repo checkpoint and runnable startup |  |  |  |
| Create/edit/cancel/delete nodes |  |  |  |
| Both edge creation methods; type/direction; edit/delete |  |  |  |
| Drag/pan/zoom/fit/select |  |  |  |
| Undo/redo |  |  |  |
| Autosave; refresh and restored position/type |  |  |  |
| Regression: previously working Phase 0 interaction |  |  |  |

P0/P1 blocks acceptance. Owner decides explicit deferral of P2, if any. Do not begin Phase 2. A Phase 1 bug fix requires a separately authorized scoped remediation ticket; if one is issued, add regression coverage and redeliver Phase 1 for review.
