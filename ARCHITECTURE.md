# Current P5-005 targeted remediation — 2026-10-27

ADR-028 authorizes measured cheap/coalesced incident-edge previews, explicit selected-set movement and exact cancellation, bounded short settled right-out/left-in routes without arrowheads, immediate undoable individual/selected deletion and strict structured Skill-title consistency. No schema/storage/dependency migration, worker/backend or general rewrite. Frame callbacks are identity-guarded/canceled. Existing simple-route cache preserves unrelated paths where clear; SVG groups are patched instead of rebuilt during previews. New moveNodes/deleteGoals reuse validated history/autosave; representative/navigation references clear safely. Explicit deletion affects saved objects and discards their own editor form; unrelated dirty forms remain. Keyboard Delete is restricted to graph-owned non-editor focus with modal guards. Reset/import safeguards remain.

Owner accepted short-path/crossing tradeoff: crossings can remain, rather than imposing large detours. Actual before/after timing/quality: evidence/p5-005-preflight-2026-10-27/PERFORMANCE.md. Original pathfinder remains in routing.js as an inactive historical comparison function; active simple-routing.js has bounded candidates. No worker needed on measured fixtures; larger-scale/occluded manual graphs remain limits. Reference packs/Custom escape and inactive individual art preserved; broad dictionary expansion deferred. Phase 5 pending independent/CEO/Owner acceptance; Phase 6 unauthorized. Historical documentation below retains dates/attribution.

---

# Current P5-004 scope and contract — 2026-10-27

Owner-approved P5-004 adds category-first creation, bounded Owner reference packs and local category-icon pack preparation. Phase 5 acceptance remains pending; Phase 6, in-app dictionary authoring and later-phase work remain unauthorized.

Approved additive schema-1 extension: optional skillGoal {format:1,skillId,targetLevel}, validated integer level 1–99, separate from archived hidden counters. No storage/origin migration or bulk rewrite. Existing freeform Skill and legacy Prayer goals are not parsed/converted; Prayer is omitted only from new category choices and remains a selectable Skill. Older builds lack structured editing/validation; preserve JSON/package before rollback.

Category-first creation uses src/ui/goal-picker.js, separate bounded generation rules, static generated reference pack and shared existing actions/history/autosave. Local icon packs reuse scripts/prepare-category-icons.mjs, immutable content-addressed files and one atomic mapping/report activation module. No runtime API/CDN/backend/new library. Archived records/art/tooling/notices remain in place; no individual matching/picker. Source/pack coverage and instructions: catalog/reference-packs/README.md, catalog/icon-packs/README.md and docs/SKILL_GOAL_CONTRACT.md. Existing Player refs/overrides/counters remain intact; category defaults control presentation. Historical scopes below are superseded only where this ticket changes behavior.

---

# Current P5-003 supersession — 2026-10-27

P5-003 is the current authorized mode: manual title/category/manual-status creation and optional More details. Active catalog discovery/selection and individual-icon controls are removed. Category artwork controls Graph/Board/editor presentation; saved catalog references, individual overrides and hidden counters remain stored but inactive. Inspector Cancel discards the form and closes; panel hiding preserves drafts. Phase 5 acceptance pending; Phase 6 and text-only dictionary implementation NOT AUTHORIZED.

Owner reports Jagex permission covering third-party artwork sourcing and local bundling for this private planner. Owner-provided, not independently verified; no broader distribution rights implied. Applicable source notices remain retained.

Category-only resolver overlays presentation without rewriting canonical data. Omitted iconOverride edits now preserve the existing value; inspector and quick paths retain inactive data explicitly. Five genuine symbols, Inventory/Diary gaps and neutral custom are documented in catalog/CATEGORY_MODE.md. No dependencies/migration/storage/origin/architecture change. Historical specifications and delivery statements below retain their original dates/attribution and are superseded where this mode differs.

---

# Implementation architecture and versioned data contract

**Current scope:** Phase 1 and Phase 2 Owner-accepted; Phase 2 static build was not verified. Phase 3 authorized within P3-001 (ADR-017), delivered for CEO review / Owner acceptance. Phase 4 is not authorized. Historical implementation/evidence below retains its original limitations; current results are in `TEST_REPORT.md`.

## Phase 3 additions — P3-001

### P3-003 cursor/context follow-up

`src/ui/cursor.js` owns a bounded transient modal cursor dialog, quick forms and contextual menus. Double-click creation and port release carry actual client anchors into the dialog; the two-goal connection control uses its button bounds. Client-to-world inversion accounts for viewport scrolling plus pan/zoom, and wheel anchoring uses the same offsets. The viewport-delegated context target prioritizes explicit selected goal IDs, then a singleton goal/edge/group, then completed summary or empty canvas. Opening menus clears transient gestures without writing canonical state or refreshing inspector fields. Keyboard Context Menu/Shift+F10, menu arrows/Home/End, form Enter, native Escape cancellation, window clamping/resize and identifier-based focus return share this surface. SVG edges are keyboard-focusable. Background gestures are temporarily inert while a dialog is open; no gesture handlers are replaced with context-specific data writers.

Cursor form drafts stay outside the document. `Inspector.node/group/connect` accept optional transferred draft fields/type, populate the form, and mark that draft unsaved. The shared commit/transfer bridge validates first and asks before replacing dirty inspector fields. Declining leaves the cursor and inspector drafts intact; Cancel creates no node/edge/history. More details closes the cursor and focuses/scrolls the relevant inspector field into view. Quick rename/counters reuse `editNode`, group rename uses `saveGroup` with canonical members/representative, and context status uses explicit singleton `bulkAction`. `wireBulk.preview` accepts an optional explicit ID scope: selected menus remain selection-bound, while single-goal grouping is reviewed as one target without silently adopting the region selection.

`reverseEdge` in `src/model/actions.js` swaps endpoints only inside `mutate`'s cloned document; shared full validation rejects duplicate/self/hard-cycle issues before `RoadmapStore.command`. Existing ID/type/attributes and unrelated records are preserved. Edge deletion retains confirmation. All edits use existing history/autosave; no direct persistence calls, schema changes, dependency changes, migrations, layout or completion propagation. Storage, routing/layout engines and canonical hard-only readiness remain unchanged. ADR-019 records scope and review gate. Detailed-inspector regression tests explicitly take More details; new cursor tests cover direct forms and real mouse modifiers.

### P3-002 selection follow-up

`src/selection.js` contains containment/selection-pruning helpers. Main pointer handling chooses region selection only for Shift-down on empty canvas; ordinary canvas pan and node/port gestures retain their paths. The selection rectangle is clamped to the viewport and uses an SVG overlay. Application hit-testing reads actual rendered card border boxes, including zoom/pan/scroll, and excludes partially enclosed cards, summaries and unrendered/hidden goals. Pointer cancellation/Escape clears the region gesture; zoom cancels an in-progress rectangle. Region selection is a transient explicit-ID list, separate from single inspector selection and the two-goal connection pair. Projection changes prune hidden IDs; they never expand selection. Reload/import resets it. No schema/storage changes or layout changes.

`src/model/bulk.js` validates the complete explicit ID list and produces one detached validated document for status, create-group, add-to-group or ungroup. No graph traversal or expansion into hidden group members. Status updates preserve counters and all unrelated goals; group actions preserve states/positions/edges, retain old/target unselected members and clear representative references invalidated by membership moves. Existing `RoadmapStore.command`/history/autosave handles one effective operation; no-op changes create no history entry. Storage/schema/database IDs and routing/layout code are unchanged.

`src/ui/bulk.js` provides the count/toolbar and a modal action review listing exact titles/IDs, action and count; group creation requires a name. Its frozen document/selection are rechecked at Apply. Validation occurs before prompting to leave a dirty inspector. Cancel or declining draft discard changes no document/history/draft; successful Apply uses the existing commit path. Temporary selection/rectangle never enter the document or exported JSON. Existing single-card clicks and port links clear bulk selection as they enter the existing connection/editor workflows. Inspector group editing remains intact. ADR-018 records authorization; no new dependencies or migrations.

### P3-001 organization architecture

`src/layout/elk.js` is the replaceable async position/routing adapter. Its pinned local ELK.js 0.12.0 bundle uses fixed west/east ports, layered RIGHT direction, orthogonal routing, label dimensions, one-level expanded layout containers, and disconnected component packing. User IDs map to safe internal layout IDs. Returned local container coordinates are converted to world coordinates. Only `withPositions` writes to canonical state; routes are transient. Collapsed group/completed summaries are independent layout boxes; their hidden members are translated by the box delta, preserving relative offsets. No synthetic boundary edges enter persistence or the SVG view. Original boundary relations remain separately inspectable.

`src/geometry.js` defines actual compact 176×76 / detailed 236×108 / summary 284×208 boxes and group padding. Graph card inline dimensions match these constants. Group frames derive from visible member positions. `src/layout/routing.js` reconstructs orthogonal routes at unchanged saved positions after reload or manual geometry changes, using obstacle-aware axis routing and separate label placement. Cached ELK geometry survives non-geometric edits; no model/action triggers automatic ELK layout. Routing can still share trunks and has two measured raid crossings after reload. Route/label metrics are in `src/layout/metrics.js`; measurement is not production-scale acceptance. The old `src/layout.js` is retained as the historical fallback/comparator for legacy tests/benchmarks, not the Optimize UI path.

`src/model/groups.js` validates group title, existing members, optional member representative, reassignment and default ungroup deletion through immutable commands. No status/counter coupling. Group edits/collapse, node movement and Optimize participate in existing Undo/Redo. `src/navigation.js` uses visited-safe traversal for all edge types; Both is upstream union downstream. `src/projection.js` applies Focus scope, completed visibility and visual grouping without changing canonical nodes/edges. Highlight fades unrelated projected nodes/edges/summaries. Completed collapse forms connected components of completed nodes with explicit Expand actions. Summary boundary inspection lists original edge kind, direction, IDs and titles.

`src/ui/organization.js` controls navigation, visibility and the original-boundary dialog; `Inspector.group` provides group editing. These view operations preserve canonical positions and manual status/counters. Navigation/visibility are saved preferences rather than graph commands. Optional schema-1 extensions: `preferences.navigation={mode:'none'|'focus'|'highlight',direction:'upstream'|'downstream'|'both',rootId:null|string}` and `preferences.expandedCompleted:string[]` (completed-component anchor IDs). When absent they default safely; when present they validate enums/references/uniqueness. Deleting a navigation root exits scope, and deleting a completed anchor removes its expansion preference. No migration or schema/database bump; full existing export/import retains the extensions. `osrs-ironman-roadmap` / `documents` / `active` and the HTTP origin remain unchanged.

The local ELK bundle is 1,609,707 bytes, unmodified, with upstream license/README, project notice and SHA-256 inventory under `src/vendor/elkjs/`. Declared license EPL-2.0 OR GPL-3.0-or-later; EPL-2.0 selected. No installed npm dependency, CDN, backend, external runtime service, renderer replacement or image integration. Layout runs through the bundled fallback worker/main-thread implementation; Phase 6 performance hardening is not claimed. `scripts/build.mjs` now accepts a new in-checkout output directory and refuses existing targets, enabling static validation without touching preserved `dist/`. Default legacy build behavior is unchanged and was not invoked.

The sections below preserve the Phase 2 and Phase 1 baseline descriptions; Phase 3 additions above supersede their future-phase statements.

## Phase 2 additions — P2-001

`readiness(document)` in `src/model.js` makes a derived map from the complete canonical graph: any incomplete incoming hard source blocks an incomplete target; a manually Completed target always displays Completed. Soft/order edges, counters, positions and collapsed projections never determine completion. `nodeDetails` validates manual status and optional finite counters, preserving prior values for callers that omit progression fields. Inspector drafts commit through existing commands/history/autosave; no second progression state is persisted.

`src/storage/backup.js` validates full schema-version-1 JSON and creates preview metadata; `BackupSession` binds replacement permission to the exact exported current snapshot. The full document is serialized without changing IDs or stripping fields. Both export/import enforce 64 MiB limits, alongside existing collection limits. Missing semantic references, unsupported versions, duplicate IDs/pairs, invalid fields and hard cycles reject before state changes. Existing unknown icon references remain opaque strings with fallback and can be retained through edits; no imported reference is fetched as a URL. JSON contains references only, no asset bytes; the UI states the portability limit.

`src/ui/backup.js` handles file selection, downloads, a modal preview, a saved-backup acknowledgment and explicit replacement confirmation. Background editing/shortcuts are blocked during preview/replacement. `SaveCoordinator.replaceDurably` first drains pending autosaves, then transactionally writes the validated candidate **before** applying the store replacement. A failed candidate write leaves active state/history untouched and reports Import Failed; it does not queue the candidate as a normal autosave retry. A failed preceding autosave blocks replacement. On success, the store replacement is undoable but does not enqueue a redundant write. Imported viewport preferences are applied exactly. Browser download completion cannot prove the user retained a file, so the app requires explicit acknowledgment.

No migration: document schema and IndexedDB versions stay 1, database `osrs-ironman-roadmap`, store `documents`, key `active`, origin `http://127.0.0.1:4173/`. Phase 1 already stored the status/counter fields. Static ES modules/local assets remain dependency-free. No task board, layout replacement, image uploads or server/cloud runtime was introduced. The remaining sections describe the original Phase 1 baseline; Phase 2 additions above and current test results supersede their future-phase statements.

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


## P3-004 transient workspace surfaces

src/ui/workspace.js owns only overlay visibility/width and resizing; no roadmap preference/schema additions. Hiding details retains DOM/baseline/draft, and explicit transfers guard replacement. Selection in main.js is independent of inspector context. GraphView updates selection classes in place for identical documents, keeping native pointer targets alive across double-clicks; actual data changes still render normally. CursorUI reuses validated actions/history/autosave and bounds a single modal form with Tab wrapping and explicit cancel/transfer/commit resolution. The region toolbar floats over the canvas so clearing selection at a port start cannot change release coordinates. src/ui/labels.js maps internal edge kinds to approved display labels without modifying relationships or routing geometry. Storage, model, projection, layout and vendor modules are unchanged by P3-004.


## Phase 4 canonical Board projection

src/board.js filters canonical nodes and partitions by manual status, reusing full-document readiness. No projection records enter persistence. src/ui/board.js owns filter controls and transient DOM; main.js uses existing bulkAction/editNode and quick inspector transfer for edits. No separate board store/order exists. Existing preferences.lastView toggles retained Graph/Board surfaces without Fit or layout. Optional validated preferences.boardFilters stores query/category/readiness/group; absent defaults empty, schema 1/database/key/origin unchanged, no migration. Full-document backups already retain these fields. A missing group filter remains inspectable and clearable. Undo/Redo retains current lastView/Board filters while applying the existing roadmap snapshot history. Inspector DOM/draft persists across switches; quick modal input blocks background switching until explicitly resolved. Shared save strip/retry/backup stay outside view surfaces. Cursor focus can resolve a canonical Board goal or fall back to Board search when filters remove it. Existing storage/router/layout/store modules remain unchanged.


## P5-001 implementation within the existing architecture

Catalog input/tool/generated immutable metadata are separate from schema-1 user goals. Existing catalogRef/iconOverride fields carry identity/overrides; editNode preserves existing reference/progress when omitted. No catalog update writes into roadmap data. Seven original geometric local assets and fallback resolve through the existing asset module; source attribution is available offline and on explicit external reference links.

CursorUI adds a status-only form using the existing single-ID bulk action. Graph status buttons isolate/capture pointer/key events. Full/rename forms and inspector omit numeric controls; hidden values stay in canonical actions/backups. progress-input.js retains corrected whole-step behavior for regression/recovery only, not an exposed UI. Board string-null filtering checks membership !== null before comparing IDs. Existing inspector draft-preservation behavior was retained and regression-tested with the clarified Owner sequence.

Reconstructed orthogonal routing retains canonical positions, uses separate lanes inside existing handles, and penalizes crossings/shared spans against routed edges and reserved terminal stubs. Labels can fit alongside short edges. Optimize now retains the same derived router used on reload/manual movement, rather than overwriting it with raw ELK sections. ELK remains the locally bundled position optimizer; no new library/architecture/schema is introduced. All route geometry is transient and never creates semantic connections. Arbitrary overlapping/non-planar/pathological inputs can still require fallback; production hardening remains Phase 6.


## P5-002 current supersession — 2026-10-27

ADR-025 implements the Owner replacement ticket: pinned local artwork defaults overlay the existing catalog by stable ID, manual overrides/legacy/fallback retain priority, and user goals are never rewritten by catalog updates. No migration/storage/dependency/architecture change. Catalog-first creation has an adjacent direct custom title/category path, safe switching and optional details. Inspector Cancel resets form/closes; mere hiding preserves drafts. Graph status shortcut is removed; status remains in quick/details/Board editing. Hidden counter data and all canonical invariants remain preserved. Source/pins/permissions/coverage: catalog/ARTWORK.md. Owner-reported Jagex private-local permission is not independently verified or broad distribution permission. Actual validation/limits: current HANDOFF.md and TEST_REPORT.md. Phase 5 awaits independent/CEO/Owner review; Phase 6 unauthorized. Historical requirements/deliveries above retain their dates and attribution.
