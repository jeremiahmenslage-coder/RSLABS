# Phase 1 — Implementation architecture and versioned data contract

**Historical delivery scope:** reports describe Phase 0 approval and Phase 1 authorization on 2026-10-25; migration did not independently establish the conditional authorization document's activation. Current Owner status is recorded in `docs/agents/CURRENT_PHASE_GATE.md`: Phase 1 delivered, pending acceptance; Phase 2 not authorized. Implementation described below is Phase 1 local-first editing.

## Current executable stack and boundaries

Static HTML/CSS/vanilla ES modules, **no runtime npm dependency** or CDN. Native HTML node cards and inspector controls, SVG directed edges/arrowheads/19px hit paths, world-coordinate CSS transform for zoom/pan. Native `src/ui/graph.js` wraps painting and hit-testing; `src/ui/inspector.js` owns the detailed edit forms and source/destination controls. `src/main.js` orchestrates pointer events and application actions but never directly writes IndexedDB or acts as a second canonical store.

| Layer | Files | Responsibilities |
|---|---|---|
| Canonical model | `src/model.js`, `src/model/actions.js` | Versioned schema/constraints, immutable copy-validate mutations, node/edge CRUD, hard-only DAG validation (nonrecursive Kahn), atomic proposed coordinate updates |
| Store and history | `src/state/store.js` | Single authoritative snapshot, undo/redo snapshots bounded to 80 commands, non-undo preference changes, event subscription |
| Browser storage | `src/storage/indexeddb.js` | Open schema/database, read/validate, transactional whole-document write, serialize writes, debounce, last-known-good state, retry/error messaging |
| Graph/render/UI | `src/ui/graph.js`, `src/ui/inspector.js`, `src/main.js`, `src/style.css` | HTML/SVG cards, icon loading and fallback, port/click/keyboard interactions, typed connection inspector, editing confirmation, browser viewport, save indicators |
| Graph projection and layout | `src/projection.js`, `src/layout.js` | Collapsed group summaries without synthetic semantic edges; replaceable pure position-only layout adapter (small-graph fallback) |
| Reference assets | `src/catalog/reference.js`, `src/assets/resolve.js`, `src/icons.js`, `public/icons/` | Immutable reference metadata, same-origin original-art PNG/WebP/SVG test references, one-shot SVG fallback on broken image; not persisted as duplicated node data |
| Deterministic fixtures/tests | `src/fixture.js`, `tests/`, `scripts/` | Approved 7/6 example, Phase 0 regressions, state/storage tests, Chromium inline DOM suite, static server and production-copy build |

### Authoritative data flow

`Inspector input / graph gesture -> validated model action -> RoadmapStore.command(...) -> one new canonical snapshot -> redraw -> SaveCoordinator.enqueue(snapshot) -> IndexedDB transaction success => "Saved".` Editor fields are draft-only until Save, so Cancel makes no orphan. Node drag changes **only a temporary visual preview** during pointermove; one validated coordinate command is committed on pointerup, followed by a prompt save. Optimize emits new coordinates only and is undoable. Layout never touches IDs, edge kinds/endpoints or manual status. The canvas is not independently persisted; it renders the one store.

## Storage contract (`schemaVersion: 1`)

Top-level:

```json
{
  "schemaVersion": 1,
  "roadmap": {"id": "roadmap_<opaque>", "title": "My Ironman Roadmap", "nodes": [], "edges": [], "groups": []},
  "preferences": {"lastView":"graph", "nodeDensity":"detailed", "completedVisibility":"show", "viewport":{"x":0,"y":0,"zoom":1}}
}
```

A canonical **node**: `{id,title,category,catalogRef,iconOverride,notes,status,progress,position:{x,y},groupId,createdAt,updatedAt}`. Phase 1 creation uses stable generated IDs, allowed categories `quest|skill|item|boss|diary|prayer|activity|custom`, `catalogRef:null`, status `not_started` (not a Phase 1 editable completion engine), `progress:null`, `groupId:null`, ISO timestamps. The bundled demo retains its demo catalog refs and one optional original visual group. **Edge**: `{id,sourceId,targetId,kind}` where `kind=hard|soft|order`. **Group**: `{id,title,representativeNodeId,collapsed}`, with node `groupId` as the only membership source.

Constraints: unique nonempty node/edge/group IDs; title 1–150 characters; notes at most 5,000; finite numeric coordinates and zoom; allowed category/status/edge/display enums; date-valid timestamps; valid group representatives; valid endpoints; no self-edges; at most one directed edge per ordered pair; no directed cycles among **hard** edges. Non-hard cycles are permitted. Upper bounds on stored arrays (10,000 nodes, 50,000 edges, 1,000 groups) prevent accidentally loading unbounded data. HTML labels/notes are assigned using `textContent`; no arbitrary pasted markup. Existing unknown icon reference IDs are **preserved** during loading but rendered as an original placeholder, not interpreted as URLs.

**Migration strategy:** version 1 is canonical for Phase 1. IndexedDB `osrs-ironman-roadmap`, schema version 1, object store `documents`, key `active` holds one complete structured-cloned document; DB version can increase independently from roadmap `schemaVersion` when necessary. A missing record initializes an empty in-memory roadmap. An unsupported document version, invalid data or failed read **aborts initialization visibly without overwriting saved bytes**; no speculative migration or destructive fallback. A future migration must validate a clone and write it transactionally **only after** a successful conversion, with regression and failure tests. Browser-origin URL/profile determine physical storage; undo history intentionally does not persist.

### Save sequencing / failures

`SaveCoordinator` serializes writes: only one in flight; a new revision replaces the queued snapshot while the prior write finishes; success means **IndexedDB transaction.oncomplete**, not merely `put` invocation. High-frequency viewport preferences debounce for ~300 ms; node moves/explicit edits enqueue promptly. On a failed write, show prominent `SAVE FAILED`, preserve latest unsaved snapshot in memory, retain the previously committed IndexedDB record, and expose Retry. A newer edit can queue an updated revision. A reload **before** retry discards the in-memory uncommitted changes and restores the last successfully written graph. The test-only injected failure rejects a write *before* starting its transaction, letting the owner verify fail state and no false success. An aborted real transaction is separately simulated in Node tests; **genuine browser-origin failure/recovery remains unverified here** due the sandbox policy.

### Projection, viewport, icons, later architecture

Collapsed groups are rendered summaries with original external edge counts and an Expand control, **never synthetic graph edges**. `Optimize Layout` remains the small-fixture-only, replaceable layered JS adapter; 250/400 chain-heavy benchmark was ~91,370px wide, Graphviz comparator ~81,413px; both are unacceptable as production full-fit UX. ELK.js remains an **untested Phase 3 candidate**. Store node coordinates in world units, viewport `{x,y,zoom}` in preferences. Density changes do not duplicate entities or rewrite positions.

Icon resolution reads immutable `src/catalog/reference.js` and an allowlisted `src/assets/resolve.js` registry containing **original local PNG/WebP/SVG only**. Node `iconOverride` is an identifier, never an HTML snippet or arbitrary URL; missing/undecodable assets fall back to a data-URI original SVG. A future user-selected file workflow will require MIME+signature+decode/dimension/size/quota validation, opaque IDs and a separate IDB asset store, or explicit private `public/user-icons/` manifest. **Not implemented.** Phase 2 must package referenced image bytes or validated companion assets before claiming portable JSON. Rights to Jagex art are not established merely by personal/noncommercial use.

## Test/compatibility reality

Executed Node model/state/IDB-*mock* tests, Chromium inline-DOM interaction tests with a mocked browser IndexedDB, static build and actual HTTP asset delivery. Sandbox Chromium `page.goto` to `http://127.0.0.1:4173/` gives `ERR_BLOCKED_BY_ADMINISTRATOR`; a genuine origin-backed IndexedDB refresh test and full HTTP-page browser E2E **must be run on the owner's local computer before final Phase 1 approval**. Browser support candidates: current stable Chrome/Edge desktop primarily; Firefox/Safari/mobile require later verification. No installed runtime JS libraries.
