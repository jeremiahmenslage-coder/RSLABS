# OSRS Ironman Progression Planner — Phase 0 Engineering Feedback

**From:** Product Owner / CEO  
**To:** AI Engineering  
**Date:** 2026-10-25  
**Review type:** Phase 0 documentation review and product-owner feedback  
**Decision:** **Phase 0 conditional acceptance of the demonstrated renderer; overall phase gate remains OPEN pending a narrow Phase 0 addendum. Phase 1 is NOT YET AUTHORIZED.**

## 1. Executive direction

The product owner reports successfully using the Phase 0 demo by following the README; the graph looks correct and its available interactions behaved as expected. This is positive evidence for the small-graph proof of concept.

The delivered reports support feasibility of native HTML goal cards with SVG relationships, drag/connect interactions, typed connections, compact/detailed nodes, group projection, and optimization of the **seven-node / six-edge** example. These findings are *provisional*: the reviewer had the documentation, `index.html`, `package.json`, and manifest, but **not the source modules, test files, scripts, screenshots, or compiled build**, and therefore could not independently rerun the reported tests or inspect the implementation.

**Do not rewrite the application, start full node creation, implement persistence, or advance into Phase 1 as a response to this review.** Close the targeted Phase 0 items below, issue an addendum with evidence, and request an explicit next-phase approval.

## 2. Findings and disposition

| ID | Finding | Evidence / current state | Required treatment |
|---|---|---|---|
| F0-01 | Small-graph rendering and interaction feasibility | Engineering reports 11/11 Node tests, 7/7 inline Chromium tests; owner reports README walkthrough successful | **Accept provisionally**. Preserve tested approach and record the owner browser smoke, including browser and URL used if known. |
| F0-02 | Current automatic layout does not scale in one stress scenario | Gate review reports ~91,134px horizontal span on chain-heavy 250-node/400-edge fixture | **Architecture risk requiring Phase 0 decision and narrow benchmark.** Do not treat current in-house layout as approved production layout. |
| F0-03 | Local PNG/WebP icon mechanism not explicitly proven | Spike renders original inline SVG placeholders; no evidence of imported local raster icons, catalog separation, override, or fallback failure handling | **Complete a limited Phase 0 asset feasibility spike** as specified in §4. Full catalog is Phase 5. |
| F0-04 | Normal HTTP-served browser test | Engineering environment blocked direct browser URL testing; owner says the README demo worked | **Record owner smoke as user-reported evidence**, do not retroactively reclassify engineer's blocked test as an automated pass. |
| F0-05 | Owner decisions pending | `DECISIONS.md` ADR-004 / ADR-005 | **Ratified in §3.** Update the decision log and schema proposal. |
| F0-06 | Authentic OSRS assets and licensing | Current project uses original SVGs; rights to copied game art not established | **Clarify product intent and provide a rights-aware local import architecture.** Do not make unresolved commercial/distribution rights a blocker to unrelated core development. |
| F0-07 | P2 visualization concerns | Manual-position edge-label overlap; dense fit-to-screen readability | **Track and address under Phase 3 / Phase 6 unless a basic interaction becomes unusable earlier.** |
| F0-08 | Full Phase 1+ workflows absent | No node creation, durable autosave, JSON backup, task board, comprehensive catalog | **Expected by phase plan; not Phase 0 defects.** |

## 3. Product-owner decisions — approved defaults

These are decisions for the engineering team to record; they do **not** authorize starting the next development phase.

1. **One edge per ordered source → destination pair.** The edge has exactly one current type: `hard`, `soft`, or `order`. Users may change that type. Parallel types for the same directed pair are excluded from v1. Reverse-direction edges are distinct, subject to hard-cycle validation.
2. **Collapsed-group boundary summary is acceptable for v1.** Show the number of external relationships and provide an obvious way to expand and inspect originals. Do not fabricate a direct prerequisite between a group summary and an external node. Direction/type breakdown is a later Phase 3 improvement.
3. **Retain the HTML/SVG renderer as the current feasible candidate**, but keep graph layout behind a swappable adapter. Do not declare the current simple layered algorithm suitable for large graphs.
4. **Personal, local, noncommercial use only.** See §4 for asset requirements and rights safeguards.

If engineering discovers an important contradiction with these choices, present the conflict before changing the schema.

## 4. Mandatory clarification: personal-use OSRS images and asset architecture

### Intended use

The application is exclusively for the owner's **private, personal, noncommercial** use. The owner does not intend to publish, distribute, monetize, or give access to other users.

The owner **does want authentic OSRS item, quest, skill, and boss icons** in the final visual experience, where they can be lawfully obtained and used. Original art is acceptable as a fallback, **not a permanent product-design replacement by default**.

Personal use does **not** automatically grant copyright or trademark permission. Document the unresolved legal constraints accurately. Do not claim that personal use categorically legalizes copied Jagex artwork or software use.

### Required architecture

- Build a **local-first icon system** that supports original placeholder artwork and *user-provided* PNG/WebP assets; SVG support is useful but not a substitute for PNG/WebP.
- Support a way to import custom files through an explicit user action and a documented way to include a locally supplied asset folder in the static project/build. A browser should **not** be assumed able to read arbitrary local disk paths without user selection or permission.
- Separate the reference catalog (IDs, labels, categories, source metadata, default icon references) from saved roadmap nodes and their statuses.
- Automatically choose a catalog icon when available and allow a manual override later in Phase 5.
- Provide a reliable placeholder when an icon is missing, unreadable, or unavailable. Missing assets must never crash the graph.
- Do not automatically bundle or redistribute an unlicensed OSRS sprite archive, bulk-scrape against source terms, or remove attribution requirements.
- Track original source, license/permission status, attribution (if applicable), and whether each asset may be bundled, linked, or supplied only by the user.
- Avoid automatically injecting user-supplied HTML/SVG/scripts into application markup; validate asset formats and limit file size/count.
- Plan for portability: document how custom imported images will survive reload and how Phase 2 JSON backup/restore will preserve images or explicitly describe a companion asset package. An exported roadmap must not silently lose its icons.

### Narrow Phase 0 asset proof (do now; not a full catalog)

Using **original, test, or otherwise appropriately licensed** images, demonstrate:

1. A node successfully displays a **local PNG** icon and another displays a **local WebP** icon.
2. Changing an icon reference or test override updates its display without altering node IDs, edges, or layout semantics.
3. A missing/broken icon gracefully falls back to an original placeholder.
4. Catalog metadata and player-owned node data remain logically separate.
5. A static build can locate bundled local test assets without a runtime network dependency.
6. Record how browser file selection and asset persistence will work in later phases; implementation of the full import UI or persistent icon blobs is **not** required in Phase 0.

**Phase boundaries:** Minimal icon-rendering and asset-resolution *feasibility* in Phase 0; usable custom-icon support can grow with the editor; comprehensive source imports, catalog search, and OSRS asset matching belong to **Phase 5**. Do not import or redistribute Jagex-owned game sprites as part of this spike without verified permission.

### Release vs engineering risk

Track licensing as a **rights/asset-packaging decision** for future catalog/content distribution. It is **not** an authorization to infringe, and it should **not** freeze otherwise independent editor, layout, and persistence development. If permission for particular art cannot be established, support user-provided assets and use placeholders in anything that is delivered or shared.

## 5. Required targeted Phase 0 follow-up: layout feasibility

The current proof of concept passes layout checks for the seven-node example, but the reported 250-node chain case is too wide to be useful for ordinary navigation. Engineering must decide whether the proposed layout-adapter architecture can reasonably support v1.

Produce a **small, time-boxed benchmark and recommendation**, not Phase 3 feature implementation:

1. Compare the current layout against **ELK.js or one other established suitable directed graph layout candidate** through the existing adapter concept (or provide a persuasive technical reason a direct benchmark cannot yet be run).
2. Use three documented fixture shapes: (a) the exact seven-node convergence sample; (b) a more representative 75–150-node roadmap with independent branches, convergence, and disconnected components; and (c) the 250-node/400-edge chain-heavy stress case already exposed by engineering.
3. Record card overlaps, oversized horizontal/vertical span, edge routing/readability limitations, semantic preservation, test environment, and observed time. Do not reduce the analysis to a single execution-time number.
4. Explain which problems are inherent to very long paths versus failures of the particular algorithm. Offer navigation/collapse solutions where even a good layered layout cannot make every node legible simultaneously.
5. Recommend one approach for Phase 1 development that **does not lock the project into an unusable large-graph layout**. Record when final complex layout quality will be accepted (Phase 3/6).

**Exit condition:** The team has a documented, defensible layout strategy with a replaceable adapter and evidence it can reasonably mature to v1. A fully polished 250/400 graph is **not** required in Phase 0.

## 6. Phase 0 completion requirements and requested addendum

Send a short **`PHASE0_ADDENDUM.md`** that includes:

- Clear resolution of F0-02 through F0-06, or explicitly named remaining risks.
- Asset-resolution demo outcomes: PNG, WebP, missing-image fallback, offline local references, and catalog/node separation.
- Layout candidate comparison, recommendation, and performance/quality caveats.
- Updated `DECISIONS.md`, `RISK_REGISTER.md`, `ARCHITECTURE.md`, `TEST_REPORT.md`, `HANDOFF.md`, and any relevant spec references.
- Tests actually executed, pass/fail/not-run, evidence paths, and reproducible commands. Do not invent results.
- A recoverable checkpoint (Git tag or lean source archive).
- Explicit yes/no recommendation: **ready to authorize Phase 1?**

The owner has reported that the README walkthrough works in their environment. Document this as **owner-reported manual verification**, not as your own E2E automated pass. If needed, supply a brief repeatable normal-browser smoke checklist.

**No new-node feature is required in Phase 0.** The detailed creation sidebar, user-created nodes, select-two connection mode, undo/redo, and IndexedDB autosave are Phase 1 deliverables.

## 7. Phase 1 scope, once separately authorized

For clarity, **do not start these items yet**. The approved future Phase 1 focuses on:

- Double-click blank canvas → detailed creation sidebar; create custom node at correct world coordinates.
- Edit, move, delete, and undo/redo node/edge operations.
- Both connect mechanisms: handle-to-handle and select-two, with type and direction control.
- IndexedDB (or justified equivalent) autosave, visible Saved/Saving/Error states, refresh recovery, and storage-failure safety.
- Safe persistence of positions, edge kinds, statuses where applicable, and visual settings within approved schema.
- Regression tests using a normal HTTP-served browser where feasible, plus documented environment limitations.

Phase 2 implements readiness/counters and versioned JSON import/export; Phase 3 advanced layout and grouping UX; Phase 4 synchronized task board; Phase 5 comprehensive OSRS catalog and imagery; Phase 6 performance, mobile, release QA. Do not change these boundaries without owner approval.

## 8. Evidence available to this reviewer and limits

Reviewed actual uploaded files: `ARCHITECTURE.md`, `CHANGELOG.md`, `DECISIONS.md`, `DESIGN_SYSTEM.md`, `GATE_REVIEW.md`, `HANDOFF.md`, `PHASE0_DELIVERY_REPORT.md`, `PRODUCT_SPEC.md`, `README.md`, `RISK_REGISTER.md`, `TEST_REPORT.md`, `TEST_STRATEGY.md`, `index.html`, `package.json`, `package-lock.json`, `.gitignore`, and `MANIFEST.sha256`.

The manifest identifies files under `src/`, `tests/`, `scripts/`, `public/icons/`, `dist/`, `evidence/`, and `docs/` that were **not transferred**. Of the 59 listed manifest entries, **15 available files matched their SHA-256 hashes; 44 were absent** from the reviewed upload. This is an **incomplete transfer**, not evidence that files are missing or corrupt in engineering's original project.

As a result, this review **cannot independently certify code quality, replay tests, verify screenshots, or inspect the actual feature implementation**. The recommendation relies on engineering's clearly labeled test report plus the product owner's report of successful live use. A full independent code audit would require a lean source/test bundle; for this product-level gate review, the Markdown package is enough to issue concrete directions.

### If a lean review bundle is requested later

Include only source (`src/`), tests (`tests/`), dev/build scripts (`scripts/`), minimal local test icons (`public/icons/`), package metadata, and updated Markdown docs. Exclude `node_modules/`, duplicated `dist/`, archived checkpoints, and large screenshot/video collections unless specifically requested.

---

## 9. Engineering response and approval rule

Respond in this order:

1. State that the owner decisions and personal-use asset clarification were incorporated into project documentation.
2. Complete the two focused Phase 0 validations: raster-icon/local asset resolution and layout strategy.
3. Submit `PHASE0_ADDENDUM.md` with evidence and any unresolved blockers.
4. **STOP. Request explicit product-owner authorization to begin Phase 1.**

No silence-as-consent, no automatic phase transition, and no assumption that a successful proof of concept means the entire v1 architecture is production-ready.
