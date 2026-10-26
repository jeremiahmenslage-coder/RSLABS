# OSRS Ironman Progression Planner — Phase 0 Approval & Phase 1 Authorization

**From:** Product Owner  
**To:** AI Engineering  
**Status:** Proposed authorization. Effective when the product owner sends/approves this document.  
**Scope:** Approve Phase 0, implement **Phase 1 only**, then stop for review.  
**References:** `PRODUCT_SPEC.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `PHASE0_ADDENDUM.md`, `TEST_REPORT.md`, `TEST_STRATEGY.md`, `HANDOFF.md`, and the original AI Engineering Brief.

## 1. Product owner decision

I accept the **Phase 0 feasibility spike and follow-up addendum**, limited to the capabilities actually demonstrated. I completed the README demo and the visual functionality worked as expected. The documented local PNG/WebP, missing-icon fallback, and layout benchmark follow-ups adequately resolve the narrow Phase 0 questions.

**You are authorized to begin Phase 1 only.** Do not start Phase 2–6 or expand the feature list without explicit approval. This approval **does not** mean that the current small-graph layout is suitable for a production-size roadmap; that authentic OSRS imagery is licensed; or that persistent editor, catalog, backups, or task board are already implemented.

Engineering-reported verification in the addendum: 14/14 Node tests, 8/8 Chromium inline DOM/interaction tests, production build and 8 HTTP asset checks passed, 6/6 layout benchmark integrity cases passed. Conventional Chromium HTTP-page E2E remains unavailable in your restricted environment. Do not upgrade that result to “passed.”

## 2. Phase 1 objective

Deliver **the first usable, reliable, local-first roadmap editor**. At the end of Phase 1, I must be able to construct and edit my own graph, close/reopen the application, and recover the same graph and positions.

### Mandatory deliverables

1. **Create nodes:** Double-click truly empty desktop canvas space to open a detailed **right-side node editor**; support Save and Cancel, clear field validation, and place the new node at the intended canvas position. Support **manual/custom nodes** without requiring the comprehensive OSRS catalog. Preserve the existing sample as optional demonstration data, not the user's permanent roadmap.
2. **Edit nodes:** Select any node to edit its title, type/category, notes, and any existing icon reference; persist changes. Node categories must match the product specification. Do not implement the Phase 2 status/readiness engine merely to make the Phase 1 editor work.
3. **Delete nodes and edges safely:** Confirm destructive node deletion, remove only its incident edges, and make supported operations undoable. Edge deletion must be discoverable.
4. **Create connections in both approved ways:** (a) drag from output handle to input handle; (b) select two nodes and choose **Connect**, with unambiguous source and destination. Let the user assign or edit exactly one edge type (`hard`, `soft`, `order`) per directed ordered pair. Retain duplicate/self-edge rejection and hard-cycle protection; editing an edge type must revalidate the result.
5. **Drag and organize:** Keep drag, zoom, pan, Fit, manual node coordinates, and working basic Optimize Layout. The existing optimizer may remain **small-graph only** in Phase 1, with that limitation visible/documented. Do **not** redesign it as a large-graph solver now. Optimization must never rewrite semantic links.
6. **Persist locally:** Implement one authoritative state and reliable browser-origin **IndexedDB autosaving** for nodes, edges, node positions, and relevant current display preferences. Show pending/saved/failed states honestly; a failed write must not claim Saved. Preserve a last-known-good state, validate input, and recover safely on refresh. Debounce high-frequency drag saves without losing the final coordinate. Use a stable local URL, not `file://`.
7. **Undo/redo:** Support at minimum node/edge create, edit, delete, move, and explicit Optimize Layout changes, with coherent history after consecutive edits. Explain reload behavior of undo history. No silent state corruption.
8. **Retain Phase 0 working behavior:** Existing OSRS-planning demo graph, typed arrows, rich HTML cards, local-original icon resolution/fallback, compact/detailed visuals, and collapse/expand POC must not regress. Group management and full advanced filtering are not Phase 1 requirements unless already implemented.
9. **Modular, maintainable implementation:** Follow the architecture's model/state/render/storage boundaries. Avoid putting all commands and browser persistence into one monolithic UI file. Use versioned schema and migration strategy from the outset.

### Explicit Phase 1 exclusions

Do **not** implement complete readiness calculations, manual completion counter workflows, JSON backup import/export, task board, large-graph production layout, Focus/Highlight, full OSRS catalog, game-asset scraping, group collaboration, or mobile graph authoring as part of Phase 1. These are already allocated to later phases. Do not reinterpret “new node creation” as a request for automatic OSRS dependency knowledge.

## 3. Personal-use OSRS asset policy — retain for all phases

The application is for my **private, personal, noncommercial use only**. I do not intend to distribute, publish, monetize, or grant access to others. I want authentic OSRS item, quest, skill, and boss icons **where their use is lawful**. Original placeholders are a fallback, not a permanent substitute chosen without discussion.

- Maintain a **separate local catalog/asset layer**, not embedded game-art data in node records.
- Allow PNG/WebP assets using safe same-origin references and original placeholders when icons are missing; preserve manual overrides.
- Preserve the architecture for **explicit user import of local PNG/WebP files** and a documented build-folder workflow (`public/user-icons/` + explicit manifest). A browser cannot silently discover arbitrary local folders.
- Before adding a user upload workflow, validate formats, byte signatures, decoded dimensions, file sizes, quotas, failure handling, and durable asset references. User-uploaded SVG/HTML/script must not become an injection path.
- **Phase sequencing:** Phase 0 validated raster rendering only. The Phase 1 file-picker/IndexedDB blob workflow described in ADR-009 is a **proposal, not a license to crowd out mandatory Phase 1 editor/persistence work**. If it can be included without jeopardizing the Phase 1 gate, present it as a separate optional scope item for owner authorization. Otherwise preserve the extension points for the asset/catalog phase.
- **Phase 2 backup requirement:** When custom icons exist, a backup claiming to be portable must include referenced image bytes or a verified explicit companion assets package. A roadmap-only JSON must not silently lose images or be described as a complete backup.
- Do not bundle unlicensed Jagex images in a transferable project archive, scrape in violation of source rules, or assert that personal use establishes a copyright/IP license. Document content provenance, attribution and permission flags. Unresolved imagery rights do **not** block unrelated graph editor development.

## 4. Phase 1 acceptance demonstration — exact owner checklist

When you submit Phase 1, give me an easy numbered walkthrough using the normal running app. It must enable me to:

1. Launch the local app using the README instructions and open the served URL.
2. Start a **new user roadmap** without accidentally modifying the demo fixture.
3. Double-click empty space and create these manually named nodes: **52 Sailing**, **Troubled Tortugans**, **Belle's Folly**, **Barrows Armor**, **Crystal Shield**, **Berserker Ring**, **Perilous Moons**.
4. Connect them in the approved converging pattern: Sailing → Tortugans → Belle's Folly → Moons; Barrows → Berserker Ring; Crystal Shield → Berserker Ring; Berserker Ring → Moons. Use both connection methods and multiple relationship types. Note: these are player-defined planning links, not asserted official OSRS prerequisites.
5. Move at least three cards, edit a card name/notes, delete a test card and its links, and use undo/redo to restore them.
6. Run Optimize Layout, then manually move a node again. Confirm connections and node contents are unchanged.
7. Reload the browser and confirm **all nodes, edges, relationship types, edited fields, and intended positions** are restored from durable browser storage.
8. Demonstrate a simulated IndexedDB write failure. Show visible failure feedback, no false success indicator, and safe last-known-good recovery.
9. Confirm duplicate/self-connections and an invalid hard-dependency cycle are rejected cleanly.

## 5. Test requirements and gate controls

- Execute unit tests for validation, state transitions, edge constraints and undo/redo.
- Execute integration tests against real browser-origin IndexedDB, including failed writes, refresh/recovery, drag-save final position and schema-version handling.
- Execute conventional **HTTP-served browser end-to-end** tests for creation, connection, edits and reload if an unrestricted browser environment is available. Your current `ERR_BLOCKED_BY_ADMINISTRATOR` environment is an acknowledged gap, **not an application failure and not a test pass**. Provide owner-run steps and clearly mark unrun checks if no suitable environment can be used.
- Preserve prior Phase 0 regression tests; disclose every test that was not run.
- For bug severity, P0 (data loss/unsafe/unopenable) and P1 (broken required workflow) **block Phase 1 approval**. P2 requires explicit deferral approval; P3 goes in the backlog.
- Do not silently change the ratified ADR-004 one-edge-per-ordered-pair rule or ADR-005 group boundary-summary rule.

## 6. Required engineering package at Phase 1 completion

Provide:

- Runnable **source checkpoint** with exact instructions (and Git commit/tag or verified full source ZIP).
- Working build and screenshots/video only as supplementary evidence, not replacement for an interactive build.
- Updated `README.md`, `PRODUCT_SPEC.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `CHANGELOG.md`, `TEST_REPORT.md`, `RISK_REGISTER.md`, `HANDOFF.md`.
- Automated/manual test matrix with **Pass / Fail / Not run**, commands, environment and real test output.
- A short list of blockers, defects, scope deviations, and any deferred Phase 2/3/5 work.
- A clear product-owner walkthrough, including the browser/origin used.
- A recommended Phase 2 plan, **without starting Phase 2**.

**STOP after Phase 1. Ask for explicit Phase 2 approval.**

## 7. Carry-forward technical risks

- The present Optimize Layout produced an approximately **91,370px-wide** 250-node chain; Graphviz's comparator was still about **81,413px**. Neither is a usable full-fit graph. Keep the replaceable layout adapter; evaluate actual browser-bundled ELK.js or equivalent and routing/navigation in Phase 3, with representative usability and Phase 6 performance testing. This is not a newly discovered Phase 1 bug.
- Original Chromium tests used an inline DOM harness; conventional URL-loaded E2E remains an evidence gap. Address it during the Phase 1 browser acceptance process.
- Icon rights and portable backups must not be conflated: local test PNG/WebP functionality has been shown; permissioned authentic OSRS art, complete catalog, real upload UI and portable asset backup have **not** been delivered.

---

**Authorization boundary:** The product owner approves the limited Phase 0 POC/addendum and authorizes **Phase 1 only upon sending this document**. All subsequent phases require separate approval.
