# OSRS Ironman Progression Planner — AI Engineering Brief

**Status:** Product scope approved; **Phase 0 is the only authorized phase**.  
**Audience:** AI engineering agent acting as lead engineer, UX designer, architect, and QA owner.  
**Companion document:** `OSRS_Ironman_Progression_Planner_CEO_Playbook.md` (management/approval guide).  
**Authoritative instruction:** Follow this brief as the baseline requirements. Report material conflicts and obtain product-owner approval for scope/architecture changes. Do not silently reinterpret requirements.

---

# A. Engagement and execution contract

## A1. Role and operating method

You are responsible for delivering a **maintainable, tested, local-first static web application** through small, functional, independently verifiable phases. The product owner is not an engineer. You own technical selection, implementation, testing, setup documentation, and honest status reporting; the owner owns product direction and phase acceptance.

**Do not attempt a one-shot complete build. Begin Phase 0 only.**

At the end of each phase:

1. Stop implementing new-phase features.
2. Provide a runnable demonstration and clear reproduction steps.
3. Report each acceptance criterion as **Passed / Failed / Not run**, with evidence and environment.
4. Disclose unresolved issues and their severity.
5. Identify the current Git checkpoint/tag or a recoverable source archive.
6. Update required project documents.
7. Request explicit authorization before proceeding.

Do not claim tests were run unless you executed them. Do not label screenshots as proof of interactive functionality. Do not skip current-phase bug fixes to start the next phase.

**Priority order:** data integrity → required functionality → regressions → usable UX → visual polish → optional enhancements.

## A2. Required phase-end report format

```markdown
# Phase N — Delivery Report
- Goal:
- Build/run instructions and current commit:
- Implemented capabilities:
- Demonstration steps:
- Acceptance checks (Pass / Fail / Not run + evidence):
- Automated tests executed and results:
- Manual/browser tests executed and results:
- Known issues (P0 / P1 / P2 / P3):
- Data/schema/architecture changes:
- Scope deviations or proposed decisions:
- Updated documents:
- Next phase scope:
- Approval requested: Yes (do not proceed automatically)
```

**Severity:** P0 = data loss, corruption, app failure, or unsafe behavior; P1 = required user workflow broken; P2 = noncritical defect with workaround; P3 = cosmetic or future enhancement. P0/P1 block phase acceptance. Owner decides whether P2 may be deferred.

## A3. Engineering change control

May decide without approval: file naming, module organization, small implementation details, routine dependency versions, tests, accessibility fixes, and repairs needed to meet already approved requirements.

Must request approval: changing delivery architecture (e.g., migrating to React or adding a server), removing a promised capability, replacing local-only storage with a cloud service, adding user accounts, changing the underlying user-facing product behavior, major project scope increase, or accepting known data-loss risks.

For such decisions give: problem, at least two viable options when practical, tradeoffs, data and migration impact, and recommendation. Record the decision in `DECISIONS.md`.

---

# B. Product definition

## B1. Vision

Build an **OSRS Ironman Progression Planner** for a solo Old School RuneScape Ironman player.

The user builds a visual map of skills, quests, items, boss encounters, diaries, prayers, activities, and custom milestones, manually connecting these into their own progression plan. The product shows **what goals connect to what**, **what has been completed**, and **what is unblocked based on user-defined hard requirements**.

This is **not** a complete game knowledge engine, automatic dependency generator, quest guide, or live account progress importer.

## B2. Locked decisions

| Area | Requirement |
|---|---|
| Views | Interactive graph + synchronized task board |
| State ownership | Single authoritative roadmap; no duplicated per-view records |
| Platform | Structured modular HTML/CSS/JavaScript project, statically deployable |
| Nodes | Any supported game category or custom milestone |
| Creation | Double-click empty canvas → **detailed editor sidebar**; catalog selection OR manual entry |
| Connections | Drag handles OR select two nodes and use Connect action |
| Edge semantics | Hard, soft, preferred progression |
| Layout | User drags freely; Optimize Layout explicitly reorganizes |
| Shapes | Arbitrary directed graph with convergence, divergence, reusable nodes |
| Grouping | One-level expandable **visual** grouping over a flat node graph |
| Completion | Independent manual status and optional current/target counters |
| Readiness | Derive from hard prerequisites entered by user; never auto-complete |
| Completed nodes | Reusable, may be shown/dimmed/hidden/collapsed |
| Browsing | Focus and Highlight on upstream/downstream/both |
| Density | Compact and detailed node display |
| Icons | Authentic OSRS imagery; auto-selected with override; fallback always works |
| Catalog | As broad as reliably sourced, with coverage/gap report |
| Theme | OSRS-inspired dark/stone/gold cues, clean modern UX |
| Mobile | View/search/inspect/update progress, not full editing |
| Persistence | Local autosave and versioned JSON backup/import |
| Startup | Reopen last-used graph or board view |
| Networking | No required backend or live runtime API |

## B3. Out of scope for v1

- Group Ironman collaboration, accounts, role assignments, or shared bank tracking
- Authentication, user profiles, hosted database, cloud synchronization
- RuneLite/game-account connections or automated player progress import
- Automatic OSRS prerequisites or machine-generated progression plans
- Full game knowledge/reference database beyond catalog names/categories/icons
- Monetary features or public social/community infrastructure
- Conflict-aware cloud or JSON merge resolution
- Complete graph-editing functionality on phones
- Recursive group nesting

Use extensible schema boundaries where prudent, but **do not implement these prematurely**.

---

# C. Product behavior and domain rules

## C1. Node categories and fields

Minimum categories:

`quest`, `skill`, `item`, `boss`, `diary`, `prayer`, `activity`, `custom`.

An individual player **node instance** has stable ID, label, category, optional catalog ID, optional icon override, notes, manual status, optional numeric progress, 2-D canvas position, optional visual group ID, and creation/update timestamps.

A catalog entry is **reference data**, not the player's goal record. Two manually created goals may intentionally reference the same catalog entry but have independent IDs and progress. Conversely, an existing goal may be reused by connecting it to many destinations, with one underlying instance and one completion status.

**Manual statuses:** `not_started`, `in_progress`, `completed`.

**Optional counters:** `current` and `target`. Validate finite nonnegative numbers and sensible targets. Counters may be displayed as a fraction/percentage but **must not automatically mark a node completed**. Do not infer status from its current/target values.

**Deletion:** Confirmation before destructive deletion; deleting a node removes its incident edges only, not unrelated descendants. Provide undo when feasible. Deleting a visual group should default to ungrouping its nodes rather than deleting them all; make the effect explicit.

## C2. Connection types and direction

A directed edge from `A → B` means **A precedes or supports B** according to the chosen edge type.

| Kind | Meaning | Readiness effect | Presentation |
|---|---|---|---|
| `hard` | Must be complete before B is unblocked | Yes | Solid red + label/icon |
| `soft` | Recommended preparation for B | No | Dashed amber + label/icon |
| `order` | Player's intended order of work | No | Blue + label/icon |

Do not conflate all arrows with hard prerequisites. Color must not be the sole type indicator.

Require stable edge IDs; validate that source and destination IDs exist, and reject self-edges. Default design assumption for v1: **at most one directed edge per ordered pair**; if a user wants a different meaning, edit the edge type. Surface this assumption during Phase 0 for owner approval if material.

**Hard prerequisite cycles:** Reject changes that introduce a directed cycle among the `hard` edges. Non-hard cycles may be present but must not crash traversal, layout, or focus logic. All traversals must track visited nodes to avoid infinite loops.

## C3. Readiness algorithm

Readiness is a **computed display property**, not persisted manual completion state.

For any node not manually completed:

- If **all** incoming `hard` nodes are manually completed, show **Ready / Unblocked**.
- If **one or more** incoming `hard` nodes are incomplete, show **Blocked**, optionally including a count of remaining requirements.
- Incoming `soft` and `order` edges never block.
- Nodes with no incoming hard edges are **Unblocked** in the user's modeled graph, not necessarily accessible in real OSRS.
- Nodes manually marked completed display **Completed** as primary state, regardless of prerequisite inconsistencies.

Display a clear qualification where relevant: **“Based on prerequisites you've added.”** Never assert that the player meets every real in-game requirement.

Readiness must use the complete underlying graph, including hidden, collapsed, filtered, or offscreen nodes. **No status propagation:** finishing A may update B's readiness, but never B's manual completion status.

## C4. Expandable objectives and visual grouping

Internally the graph is **flat**. Visual groups are UI presentation containers, not automatic dependencies or completion rules.

Minimum v1 grouping rules:

- One level of groups; each node has at most one primary `groupId`.
- Groups can contain any related node instances, including catalog-backed objectives.
- A group can collapse to a clear summary displaying its name, icon, node count, and completion summary if useful.
- Collapsed members retain IDs, state, and all graph edges.
- An independent milestone may be the group's **representative node**, e.g., a ToA-clear milestone representing a ToA group; it keeps its own manual status and is not duplicated on screen.
- Obtaining Fang or Lightbearer never automatically completes ToA; clearing ToA never automatically completes the drops.
- Group membership alone never establishes a `hard`, `soft`, or `order` relationship.
- Cross-group edges must remain inspectable without creating false semantic edges between group containers.

If rendering group projections is technically complex, use explicitly labeled summarized link indicators and a clear **expand to inspect connections** interaction. Never turn a collapsed visualization shortcut into a stored edge.

## C5. Completed-node handling and performance

Support four visibility modes:

1. Show all
2. Dim completed
3. Hide completed
4. Collapse completed branches into clearly labeled summary placeholders

All modes preserve every node and edge in persisted state. Hidden nodes still satisfy dependent hard requirements when completed.

**Do not fabricate direct prerequisites** when a hidden or collapsed completed node sits between visible nodes. Any temporary visual connection must be distinguished from an actual relationship and never written back as a new edge.

Performance approaches in priority order: narrow render scope, collapse content, cache unaffected layouts, incremental updates, lazy/deferred image rendering; add virtualization or complex rendering architecture only when tests show it is needed.

## C6. Focus/Highlight and navigation

- **Focus:** isolate selected node and connected ancestors, descendants, or both; provide a way to exit Focus.
- **Highlight:** preserve full graph, visually emphasize selected node and relevant paths; unrelated nodes recede.
- Choose upstream/downstream/both, with all connection types recognized unless filtered by the user.
- Preserve scroll/zoom and manual node positions as reasonably possible when switching views.
- Support zoom, pan, fit-to-view, and find/search.
- Distinguish selected node, hovered node, complete status, and readiness without relying exclusively on color.

## C7. Editor and graph interactions

**Desktop creation:** Double-click *empty canvas* → detailed right sidebar opens → choose catalog entry or custom goal → edit required fields → Save places node at intended clicked graph coordinates. Cancel must not create an orphan node.

**Existing node:** Selecting a node opens its full editing context, without accidentally creating another node. Save/cancel should be predictable and must not silently discard changes.

**Connection methods:** (a) drag from source handle to target handle, then choose type; (b) select two nodes and invoke Connect, with explicit source/target ordering and type. Allow editing/removing edges. Avoid accidental connections while dragging nodes.

**Layout:** Manually arranged positions remain until user requests Optimize Layout. Optimize should organize complex connected components, support disconnected islands, avoid overlapping node boxes, reduce edge crossings, and account for compact/detailed sizes and collapsed groups. Afterward the user can drag nodes freely. Avoid global re-layout on every drag, edit, completion, or filter event.

**Undo/redo:** Support critical graph edits beginning in Phase 1. Document which operations are undoable; restore consistent persisted graph state. Undo history need not survive browser reload unless deliberately chosen.

## C8. Task board

Task board is a *view* of the same node objects; no separate task database.

Group into Not Started / In Progress / Completed, with relevant filters (category, readiness, group, text search). Edits to status or counters in either view immediately reflect in the other. Catalog changes must not modify user-created nodes.

The last-used view and reasonable display preferences persist over reloads.

## C9. Mobile

Mobile browsers must support seeing goal lists/graph, opening node details, pan/zoom or useful alternative navigation, text search, updating manual status, and changing counters. Full drag/connect/node creation is not required on mobile. Provide touch-friendly targets and avoid inaccessible hover-only functionality.

Local storage is per browser/origin. Mobile and desktop cannot be assumed synchronized. Offer explicit backup transfer guidance.

---

# D. Technical architecture and data integrity

## D1. Platform constraints

Deliver **HTML/CSS/JavaScript as a modular static application**. Vite + vanilla JS/ES modules is a reasonable baseline; it may use a build tool and development server. It need not run by double-clicking a `file://` HTML file, and should not depend on file-URL browser storage semantics.

Graph tech candidates include Cytoscape.js and ELK.js; alternative JS graph libraries are acceptable **only after an early feasibility demonstration**. Do not choose a library based on a screenshot alone. Confirm rich node labels/icons, interaction hitboxes/handles, connection styling, grouping, and auto-layout work together.

Avoid React by default; if a React-based graph ecosystem is substantially more suitable, present a justified change request in Phase 0 and wait for owner approval. A React static build is technically possible, but it changes the preferred implementation stack.

Production build must be deployable to static hosting with relative/correct asset paths. No required backend or online runtime API calls. Bundled modules and game assets must work without third-party CDNs at runtime. Hosting an initial page still normally requires network access; do not promise a true offline-installable PWA without implementing and testing it.

## D2. One state store; separate layers

Use clear module boundaries:

1. **Domain/model:** nodes, edges, groups, validation, migrations
2. **Graph logic:** hard dependency DAG validation, readiness, traversal, derived graph projection
3. **State/actions:** single source of truth, mutations, undo/redo, persistence coordination
4. **Graph rendering/editor:** canvas, custom nodes, connections, viewport, layout adapter
5. **Task board/UI:** independent presentations reading the shared store
6. **Catalog:** normalized reference data and asset resolution
7. **Storage:** IndexedDB or equivalent structured browser storage, preferences, backup import/export
8. **Test fixtures/utilities:** deterministic sample graphs and generated large test data

Store user state separately from immutable/bundled reference catalog assets.

### Example project organization (adapt as needed)

```text
osrs-ironman-planner/
  package.json
  index.html
  public/
    assets/osrs/
    catalog/
  scripts/
    import-catalog.*
  src/
    main.js
    model/
    graph/
    state/
    storage/
    catalog/
    ui/
    styles/
  tests/
    unit/
    integration/
    e2e/
  README.md
  PRODUCT_SPEC.md
  ARCHITECTURE.md
  DECISIONS.md
  CHANGELOG.md
  TEST_REPORT.md
  HANDOFF.md
```

## D3. Data contract (illustrative, refine and version in Phase 0)

```json
{
  "schemaVersion": 1,
  "roadmap": {
    "id": "roadmap_1",
    "title": "Solo Ironman Progression",
    "nodes": [
      {
        "id": "node_toa_clear",
        "catalogRef": null,
        "title": "Clear Tombs of Amascut",
        "category": "boss",
        "status": "completed",
        "progress": null,
        "notes": "Independent of receiving desired drops",
        "iconOverride": null,
        "position": { "x": 200, "y": 100 },
        "groupId": "group_toa",
        "createdAt": "2026-10-25T00:00:00.000Z",
        "updatedAt": "2026-10-25T00:00:00.000Z"
      }
    ],
    "edges": [
      {
        "id": "edge_1",
        "sourceId": "node_a",
        "targetId": "node_b",
        "kind": "order"
      }
    ],
    "groups": [
      {
        "id": "group_toa",
        "title": "Tombs of Amascut",
        "representativeNodeId": "node_toa_clear",
        "collapsed": false
      }
    ]
  },
  "preferences": {
    "lastView": "graph",
    "nodeDensity": "compact",
    "completedVisibility": "show"
  }
}
```

**Important:** The example above illustrates shape only; IDs in one array must reference real nodes in actual saved data. Define and enforce referential integrity in the final schema. Avoid duplicating group membership lists and `groupId` as competing sources of truth. The canonical contract, migration rules, and schema tests belong in `ARCHITECTURE.md`.

Use a stable schema version. Define migrations when the persisted format changes; failure to migrate must not silently erase old data. Validate required fields, ID uniqueness, edge references, finite coordinates, progress validity, category/status/edge enums, and group representative references.

## D4. Persistence, imports, and recovery

- Implement **basic autosave in Phase 1**, not at the end of the project.
- Use IndexedDB or a justified equivalent for structured data. Small UI preferences may use localStorage.
- Debounce high-frequency changes such as dragging; on explicit save actions, persist promptly.
- Surface save/persistence errors visibly; never display “Saved” until confirmed.
- Persist all nodes, edges, groups, positions, status/counters, and relevant view preferences.
- Export JSON in Phase 2 with format version, structured roadmap, and recoverable attributes.
- Import JSON with schema validation and a preview of nodes/edges/groups and source version. Confirm **replace existing roadmap**; create a backup before destructive replacement when practical.
- v1 does **not** require smart merging between JSON files.
- On import failure or interrupted migration, leave the last working user state intact.
- Provide clear backup reminders and instructions for browser changes and cross-device transfers.

Never infer persisted data is safe merely because the UI appears to work. Add automated round-trip tests and browser refresh tests.

## D5. Catalog and asset sourcing

Target a broad searchable library of OSRS names, categories, and authentic icons, while **not treating comprehensive coverage as all-or-nothing**.

Sources may include verified OSRS Wiki data and appropriately licensed community datasets. The RuneScape Wiki real-time prices/item mapping can help with tradeable items but does **not** cover all quests, bosses, or untradeable content. Build source-specific import adapters and normalize to a stable local catalog format.

Required catalog record:

- Stable source-qualified ID
- Display name
- Category
- Bundled icon path if permitted
- Source identifier/URL and attribution metadata
- Optional future metadata extension slot

Keep original OSRS icon pixel art recognizable; do not substitute unrelated stock imagery. The default icon can be overridden with another available catalog asset. Missing icons get a consistent OSRS-inspired fallback rather than broken image glyphs.

Build a repeatable import/update script. Produce a coverage report with record counts by category, missing icon counts, import failures, and known gaps. Do not invent entries, quest/item IDs, or fake complete coverage.

**Legal/redistribution checkpoint:** Before shipping bundled content, verify current Jagex fan-content policies, source licenses, attribution, and any restrictions on copying or redistribution. If an asset cannot be lawfully bundled, omit it, use an allowed placeholder, document the gap, and keep the editor usable. Treat initial delivery as noncommercial until separately assessed.

No runtime scraping requirement. Catalog updates must not overwrite users' nodes or completion states.

## D6. Design system

Build a consistent OSRS-modern hybrid UI:

- Charcoal/stone surfaces; subtle parchment/metal accents
- Restrained RuneScape gold and purposeful status colors
- Authentic pixel/inventory icons
- Clear modern typography and density
- Visually active navigation state
- Predictable primary/secondary/destructive actions
- Visible keyboard focus, selected/hover/disabled/loading/error states
- Labels/patterns accompanying connection colors
- Readable canvas at common desktop sizes
- Touch-friendly mobile inspection and task updates

Do not create placeholder buttons. Either implement the action or remove/disable it with an honest explanation. Avoid decorative assets unrelated to OSRS.

---

# E. Phased delivery plan (mandatory gates)

Each phase must end with a working build, relevant regression tests, updated documentation, and an explicit stop for owner approval. Later-phase requirements should inform architecture but must not be prematurely implemented.

## PHASE 0 — Architecture and technical feasibility (**START HERE**) 

**Objective:** Prove that the project is feasible with an appropriate static frontend graph stack and lock the initial architectural decisions.

**Build only a thin, runnable proof of concept:**

- Construct the exact convergence sample in Section F.
- Render several custom icon-bearing nodes and visibly typed edges.
- Demonstrate node dragging and one viable edge creation mechanism.
- Demonstrate Optimize Layout on the converging sample.
- Test feasibility of detailed/compact representations and collapsible grouping with the chosen library or a documented spike.
- Assess whether node handles, edge editing, label hitboxes, and layout can coexist.
- Check ability to create a static production build.

**Documentation/deliverables:**

- Feasibility assessment and tested library/version choices
- Working proof-of-concept source and run instructions
- Recommended module architecture and proposed schema
- Small consistent design-system sample
- Risk register with likelihood/impact/mitigation
- Testing strategy (unit, integration, browser)
- Product ambiguities requiring owner decision; avoid trivial questions
- Revised plan if spike discovers constraints

**Acceptance:** Exact sample has correct directed edges; dragging works; visual distinctions work; layout does not silently change graph data; chosen approach demonstrates or credibly validates rich-node editing and grouping; developer can run the app from documented instructions.

**STOP. Request approval before Phase 1.**

## PHASE 1 — Core editor and durable saving

**Objective:** The first usable graph-editing application, with reliable local saving.

**Implement:**

- Application shell, canvas, navigation placeholders only where truthful
- Node editor sidebar opened from empty-canvas double-click
- Manual/custom node creation, editing, deletion
- Canvas pan, zoom, fit, select, drag
- Both methods of creating directed connections; edit/delete edges
- Clear source/target direction and edge type selection in editor
- Undo/redo for main graph mutations
- Local autosave and browser-refresh restore
- Lightweight reusable UI controls and helpful empty states

**Acceptance scenario:** Create five nodes, create multiple incoming/outgoing edges using both methods, move/edit/delete elements, undo/redo, refresh, and recover the surviving graph at saved positions with the right edge types. No silent failures or data loss. Test interaction at browser level, not just unit level.

**STOP. Request approval before Phase 2.**

## PHASE 2 — Progression logic and JSON recovery

**Objective:** Turn the editor into a genuine account progression tool.

**Implement:**

- Three typed relationships with correct readiness semantics
- Manual statuses and optional counters
- Readiness/blocked indicators and explanatory copy
- Reusable node behavior across multiple downstream paths
- Hard-cycle rejection, duplicate/self-edge validation
- Independent completion for raid clears and item goals
- Versioned JSON export, validated import with confirmation
- Import/recovery safety handling and associated tests

**Acceptance scenarios:**

- A goal with two hard prerequisites is blocked until **both** are complete.
- Soft/order edges alone never block readiness.
- Completing a node does not complete downstream nodes.
- One 70 Prayer node feeds several branches and affects their readiness correctly.
- Hard-cycle creation is rejected without corrupting state.
- Export/import round-trips the full available schema; invalid input preserves existing state.

**STOP. Request approval before Phase 3.**

## PHASE 3 — Readable advanced graph organization

**Objective:** Scale from a few tasks to a useful complex roadmap.

**Implement:**

- Reliable Optimize Layout
- Compact and detailed node appearance
- One-level visual groups and collapse/expand
- Independent representative milestone and child completion
- Show/dim/hide/collapse completed progression
- Focus and Highlight modes (upstream/downstream/both)
- Preserved relationships/readiness under filtering
- Helpful graph controls and layout cache boundaries

**Acceptance scenarios:**

- The converging sample and long raid chain lay out legibly.
- A collapsed ToA group does not merge or overwrite Fang and Lightbearer statuses.
- Hiding finished prerequisites does not change calculated readiness.
- Collapsing/hiding never writes fake new graph relationships.
- Manually moving a node remains possible after auto-layout.
- Switching compact/detail modes does not create collisions that persist after optimization.

**STOP. Request approval before Phase 4.**

## PHASE 4 — Task board and daily-use navigation

**Objective:** Support regular planning and completion tracking without requiring canvas editing.

**Implement:**

- Synchronized board: Not Started / In Progress / Completed
- Search/filter by name, type, readiness, and group
- Updates to manual statuses and optional counters
- Navigation state and last-used view restoration
- Polished empty, loading, validation, and failure states

**Acceptance:** Updates in board immediately appear in graph and vice versa; one underlying node; view choice survives refresh; completed goals remain searchable; no nonfunctional navigation entries.

**STOP. Request approval before Phase 5.**

## PHASE 5 — OSRS reference catalog and visual design

**Objective:** Bring in authentic OSRS content and finish the chosen visual identity.

**Implement:**

- Repeatable, documented game catalog importer(s)
- Broad collection of items, quests, bosses, skills, prayers, diaries, and activities where legally/reliably available
- Catalog search and category filtering inside node editor
- Automatic matching of default icons; user-selectable overrides
- Locally bundled and optimized icons, missing-image fallback
- Attribution/license documentation and coverage/gaps report
- Unified OSRS-inspired styling across canvas, editor, board, and dialogs

**Acceptance:** Create a goal from a real catalog result, verify its identity/icon, edit it independently, create another instance of same catalog record without shared completion, override an icon, handle missing assets gracefully, and prove a catalog update preserves all user data. Document coverage rather than claiming all OSRS content exists.

**STOP. Request approval before Phase 6.**

## PHASE 6 — Release hardening and production delivery

**Objective:** Deliver a stable usable v1 and a project that another engineer can maintain.

**Implement/verify:**

- Mobile graph viewing/search/status/counter interactions
- Browser/accessibility/responsive checks
- Storage errors, import failures, migration failure handling
- Complete functional regression suite
- Large graph fixture: **at least 250 nodes and 400 edges** with diverse branches, groups, and statuses
- Profiling and targeted performance fixes based on evidence
- Static production build and deployment steps
- Up-to-date source docs and final handoff

**Report metrics with device/browser context**, including initial render time, pan/zoom responsiveness, optimize-layout time, filtering behavior, and memory observations. Do **not** invent performance thresholds or claim perfect responsiveness without measurement; recommend measurable release bounds based on Phase 0/6 evidence and owner approval.

**Release gate:** No outstanding P0/P1; required end-to-end scenarios pass; saved state round-trips and survives refresh; static build works; mobile core controls work; known limitations are listed; owner accepts release.

**STOP. Obtain v1 release approval.**

---

# F. Canonical examples and end-to-end tests

These examples were supplied by the product owner. **Do not reinterpret them as verified OSRS game dependencies.** Use user-selected `hard`/`soft`/`order` types appropriate to each test; order links can be used when testing only progression layout.

## F1. Exact converging and diverging sample

```text
52 Sailing → Troubled Tortugans → Belle's Folly ──────────┐
                                                           ├→ Perilous Moons
Barrows armor ────────┐                                    │
                       ├→ Berserker ring ──────────────────┘
Crystal shield ───────┘
```

This is the **exact directed structure**: 

1. 52 Sailing → Troubled Tortugans
2. Troubled Tortugans → Belle's Folly
3. Barrows armor → Berserker ring
4. Crystal shield → Berserker ring
5. Berserker ring → Perilous Moons
6. Belle's Folly → Perilous Moons

The editor must also support **divergence**, such as connecting Perilous Moons to several later goals.

## F2. Extended progression

```text
Perilous Moons → Royal Titans → Tombs of Amascut → Dragon Warhammer → Chambers of Xeric
```

Separately represent:

- **Obtain Osmumten's fang** (independent goal)
- **Obtain Lightbearer** (independent goal)
- **Clear Tombs of Amascut** (independent milestone)
- **Obtain Dexterous prayer scroll / unlock Rigour** (CoX-related objective)

A ToA visual group can expand/collapse these goals, but their completion states are not coupled. Player-defined preferred order should not be recast as a hard in-game prerequisite.

## F3. Reuse and readiness

A single **70 Prayer** node connects to multiple goals. Completing it should change any affected **computed readiness** consistently, with only one underlying node instance. A different intentionally duplicated “70 Prayer” node, if separately created, remains its own record.

## F4. Completed content and focus

Create 100 completed nodes and several incomplete branches. Hide/collapse the completed nodes. The displayed graph must remain understandable and incomplete nodes must still see completed prerequisites as satisfied. Focus on a selected raid goal and restore full graph without mutating data.

## F5. Data recovery

1. Create a graph with groups, mixed edges, notes, statuses, counters, and positions.
2. Export JSON.
3. Import into a fresh storage context.
4. Validate equality of supported serialized data except documented generated metadata.
5. Attempt malformed/missing/invalid-ID JSON and prove previous data is untouched.

## F6. Behavior and regression test inventory

At minimum verify:

- Node create/edit/delete; cancel without ghost node
- Both edge creation methods; type selection and editing; deletion
- No self-edge, invalid IDs, duplicate edge, or hard cycle
- Branch convergence and divergence
- Dragging, pan/zoom, optimize layout, undo/redo
- Independent completion and optional counters
- Readiness with 0/1/many hard predecessors
- Reused goal affects multiple targets; no automatic downstream completion
- Hide/dim/collapse retains semantic correctness
- One-level groups and cross-group relationships survive expand/collapse
- Focus/Highlight directions and cycle-safe traversal
- Graph ↔ board synchronization
- Reload persistence, versioned import/export, invalid import safety
- Catalog lookup/override/missing asset fallback
- Last-used view and user display preferences survive refresh
- Mobile view/search/completion updates
- No visible controls that do nothing or give misleading feedback

---

# G. QA and documentation requirements

## G1. Test stack

Use appropriate automated unit tests (e.g., Vitest), integration tests for store/persistence/derived behavior, and browser end-to-end tests (e.g., Playwright). Choose compatible tools after Phase 0; do not force tooling that cannot run in your environment.

Automated tests do not replace exploratory functional review by the owner. Test actual interaction behavior. On each new phase, rerun existing relevant tests and add regression coverage for every fixed P0/P1 defect.

## G2. Accessibility, reliability, and security

- Appropriate text contrast, visible keyboard focus, labels, and touch sizes.
- Non-color cues for connection types and statuses.
- Do not inject catalog/user-provided labels or notes as unsanitized HTML.
- Treat imported JSON as untrusted data; validate and bound its size/shape.
- Avoid runtime dependencies on uncontrolled external content hosts.
- Provide fallback UI for failed asset load and persistence errors.
- Confirm before destructive replace/reset; allow cancellation.
- Keep user data local; no analytics/telemetry requiring accounts without explicit permission.
- State supported browsers and test actual desktop/mobile targets.

## G3. Living project documents

Keep these accurate and versioned:

- `README.md`: install, run, build, deploy, usage, browser support
- `PRODUCT_SPEC.md`: approved user requirements and v1 exclusions
- `ARCHITECTURE.md`: components, schema, persistence, data flow, layout/projection design
- `DECISIONS.md`: architecture decision records and tradeoffs
- `CHANGELOG.md`: user-facing and technical changes per phase
- `TEST_REPORT.md`: actual checks with environment/results
- `HANDOFF.md`: current phase, exact revision, working/nonworking features, known bugs, setup, next steps

Use Git commits/checkpoints at every accepted milestone where available. If Git is unavailable, produce versioned archives. Never overwrite the only recoverable working copy.

---

# H. Open technical items for Phase 0

Resolve these pragmatically and document the choices; ask the owner only for genuinely material tradeoffs:

1. **Graph library feasibility:** icon-rich HTML/SVG nodes, handles, labels, groups, edge routing, static deployment, accessibility.
2. **Group projection UX:** how a collapsed group shows external links without inventing dependencies.
3. **Data schema details:** ownership of group references, edge uniqueness, saved viewport/layout state, migrations.
4. **Browser targets:** proposed supported desktop/mobile versions and browser test matrix.
5. **Performance measurement:** representative graph fixture and acceptable interaction measurement approach.
6. **Catalog ingestion:** source selection, source/license verification, update cadence, and feasible v1 coverage boundaries.
7. **UI interaction edge cases:** source/target selection, double-click vs pan, undo/redo scope, delete confirmation, status editing.
8. **Autosave failures:** correct save indicator and retry strategy; retention of last-known-good data.

Do not present these as blockers when a safe default is clear. Record decisions and surface only meaningful owner-level tradeoffs.

---

# I. Initial instruction — execute now

**Execute Phase 0 only.**

1. Audit this brief for contradictions and feasibility risks.
2. Validate the graph architecture with a runnable spike using the **exact six directed edges** in Section F1.
3. Demonstrate rich node visuals, dragging, typed edges, and automatic layout, with a clear path to grouping and compact/detail mode.
4. Produce the proposed architecture, data contract, directory structure, design direction, risk register, and test plan.
5. Report the Phase 0 acceptance checks and actual executed tests.
6. Provide run instructions and a reproducible source checkpoint.
7. **Stop and request explicit product-owner approval. Do not begin Phase 1.**

**Definition of success:** Reliable, understandable, testable progression-planning software whose source and data can survive future AI-agent handoffs without starting over.
