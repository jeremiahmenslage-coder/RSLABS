# Product specification — scope baseline and Phase 1 delivery

Source of authority: operational baseline `docs/ENGINEERING_BRIEF.md`, later explicit Owner decisions in `DECISIONS.md`, and current status in `docs/agents/CURRENT_PHASE_GATE.md`. The identical founding brief is archival. **Do not treat the spike as changing approved product scope.**

## v1 must deliver (later phases)

A local-first, static HTML/CSS/JavaScript solo OSRS Ironman roadmap planner with one state store and two synchronized views: interactive directed graph and task board. Graph goals may be skill, quest, item, boss, diary, prayer, activity, or custom. A node has its own manual status (`not_started`, `in_progress`, `completed`) and optional progress (`current`, `target`); reused instances are never automatically duplicated. User-defined `hard` incoming edges alone determine display readiness; `soft` preparation and `order` only indicate a relationship. Neither prerequisites nor group membership automatically complete nodes.

Desktop editor: double-click empty canvas opens detailed creation sidebar; catalog/manual node entry; drag/create/edit/delete with undo/redo; two connection mechanisms and unambiguous source → target direction. Manual positions persist until user invokes Optimize Layout. One-level collapsible **visual-only** groups; external links remain inspectable and no fabricated dependencies are persisted. Focus/highlight, compact/detailed, completed visibility modes, zoom/pan/fit/search. Mobile inspection/search/manual progress updating without full editing.

Local structured autosave (Phase 1), JSON versioned backup/import and recovery (Phase 2); broad legally sourced reference catalog and authentic permitted assets with fallback (Phase 5); performance/accessibility and release hardening (Phase 6). No required runtime backend or API.

## Explicit v1 exclusions

No group collaboration, player accounts, hosted DB or sync, RuneLite importer, automatic dependency engine, full game encyclopedia, monetary/social features, JSON smart merge, recursive grouping or complete mobile editing.

## Historical Phase 0 implementation (before Phase 1)

Exact F1 graph specimen (seven nodes, six arcs); icons from custom created artwork; typed edges with handles, drags, in-memory inspector editing, compact/detailed, group projection, zoom/pan, and Optimize Layout. These demonstrate feasibility only. No persistence, catalog, task board, production UI or full editor is implied.

## Non-negotiable semantic guardrails

A → B represents sequence/support per chosen edge type. One ordered pair has at most one typed edge; ADR-004 and the later owner-clarification section record ratification. Reject hard cycles, allow soft/order cycles with visited-safe traversal. Readiness is computed across complete canonical graph including hidden members, not written as completion status. All game dependencies shown in F1 are *user-supplied planning examples*, not verified real-game requirements.


## 2026-10-25 owner clarifications (Phase 0, locked)

- Product remains a local, single-player, **private personal noncommercial** planner, not a product for publication/distribution/monetization. Privacy intent does **not** confer rights to Jagex artwork.
- Owner wants authentic OSRS icons *where lawful*. Use original art **as a fallback**, not as a permanent substitute without review. No unlicensed sprite archives may be bundled in a transferable package.
- Only one typed directed relationship per ordered pair (`hard | soft | order`), editable; reverse directed pair distinct unless hard-cycle conflict.
- Collapsed visual groups summarize original external link **counts** and offer expand; no fabricated group→outside semantic link.
- HTML/SVG rendering approach ratified as feasible for small graphs, with swappable layout and **no** claim that existing simple layout scales. Complex layout acceptance in Phase 3, performance in Phase 6.
- Allowlisted local PNG/WebP support is feasible in Phase 0. Actual user-driven import, durable asset storage, JSON backup portability and full catalog matching remain in their authorized future phases.

---

## Phase 1 authorization and delivered boundary (2026-10-25)

Historical delivery records report Phase 0 acceptance and Phase 1 authorization. The inspected `docs/PHASE1_AUTHORIZATION.md` is conditional on sending/approval; independent activation evidence was not established in migration. Current direct Owner status is Phase 1 delivered, pending acceptance; Phase 2 not authorized. The editor now starts with an empty user roadmap, supports double-click draft/create/cancel, title/category/notes/local test icon editing, safe node/edge deletion, both directed connection methods, one typed edge per ordered pair, hard-only DAG rejection, drag/pan/zoom/fit/basic optimize, undo/redo (session only), real IndexedDB browser-origin storage adapter, prompt saves and visible error/retry state. A fresh optional copy of the exact Phase 0 seven-node/six-edge fixture is available through **Load original demo…** and does not become a permanent default roadmap. Existing compact/detailed display and equipment-group visual summary remain.

No Phase 2 status/readiness computation/counters/JSON backup/import, Phase 3 production-scale layout/focus, Phase 4 task board, Phase 5 OSRS art/catalog ingestion/upload, Phase 6 mobile/release/performance work was started. Original placeholder imagery remains; authentic OSRS artwork is desired only where lawful. The editor accepts only bundled original test-icon identifiers at this stage. `public/user-icons/` plus an explicit manifest is a future private build path, not an automated read of the owner's disk. A transferable backup must include custom icon bytes or a validated companion package **when** user uploads are implemented.

**Acceptance evidence condition:** test status is reported by `TEST_REPORT.md`; no claim of real HTTP-loaded Chromium IndexedDB recovery is made. Owner-run normal-browser refresh/save-failure demonstration remains required to ratify the Phase 1 gate.
