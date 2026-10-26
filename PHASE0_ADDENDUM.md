# Phase 0 Addendum — Owner feedback closure and phase-gate request

**Date:** 2026-10-25 (owner local) / 2026-10-26 UTC (engineer environment)  
**Checkpoint:** `OSRS_Phase0_Addendum_v0.0.2_Source.zip` (lean verified source/test archive; `MANIFEST.sha256`)  
**Status:** Phase 0 engineering follow-ups complete. **Recommend YES to explicit Phase 1 authorization; NO implementation of Phase 1 has started.** Product owner retains approval authority.

## 1. Decisions incorporated

The owner ratified exactly one `hard | soft | order` edge per directed ordered pair (type editable, reverse direction distinct subject to hard-cycle check); collapsed groups count actual boundary links and have an Expand action without creating false graph edges; the native HTML/SVG renderer remains the viable small-graph candidate with a replaceable layout adapter. Product use is **private, personal and noncommercial**. Authentic OSRS imagery is desired *where lawfully sourced and used*; original art is the fallback, not a forced permanent replacement. Personal use alone does not grant a Jagex IP license. See ADR-002, ADR-004–006, ADR-008–009 and `PRODUCT_SPEC.md`.

## 2. Feedback findings F0-02–F0-06

| ID | Disposition and evidence | Remaining risk |
|---|---|---|
| F0-02 layout scalability | **Benchmark completed**: current custom layered layout vs **Graphviz `dot` 2.42.4** on 7/6, 110/127 and 250/400. Zero card overlaps, unchanged semantic graph across all six runs. Full 250/400 chain cannot fit legibly under either. Results in `evidence/layout-benchmark.json`. | **OPEN:** Graphviz CLI is a comparator, not browser runtime; ELK.js browser integration and actual route-quality validation belong to Phase 3, performance to Phase 6. |
| F0-03 PNG/WebP and asset system | **Completed narrow spike:** original local PNG and WebP decode in Chromium; fixed test override changes displayed icon only; a 404 is replaced by original SVG placeholder; immutable catalog separated from player node records; bundled `dist/` asset HTTP paths respond 200 with valid MIME, no remote runtime asset server. Logs in `evidence/addendum-browser-output.txt` and `addendum-static-smoke.txt`. | **OPEN (future phase):** actual file-picker import, IndexedDB blobs and portable backups not implemented; clearly specified in architecture. |
| F0-04 browser smoke evidence | **Documented accurately:** owner states prior README demonstration worked as expected; owner browser name/version and URL **not provided**. Engineer's Chromium direct HTTP navigation still reports `ERR_BLOCKED_BY_ADMINISTRATOR`. Real Chromium DOM/image decoding and pointer tests run through intercept-backed inline test harness, **not HTTP browser E2E**. | **OPEN test environment gap**. Normal-browser checklist in `README.md`; require conventional HTTP E2E when feasible in Phase 1. |
| F0-05 ADR ratifications | **Closed:** ADR-004 single edge and ADR-005 count/expand summaries now explicitly `OWNER RATIFIED`; related validator/projection regression checks remain. | No owner choice remains for these two. |
| F0-06 assets and rights | **Clarified:** private/noncommercial, authentic where lawful, original fallback. Only original tests assets included. Catalog/source registry carries source ID, permission status, attribution and packaging flags. Manual folder build and future browser file-select/backup policy documented. | **OPEN rights/packaging:** Jagex fan policy §6.1.3 restricts software/apps involving Jagex Property. No permission to bundle game art inferred; resolve rights separately before catalog/assets ship. This does not block unrelated editor development. |

F0-01 remains owner-provisionally accepted for small-graph rendering. F0-07 (edge-label overlap, dense fit) remains P2 for Phase 3/6; F0-08 (no full editor, persistence, board, catalog) is expected phase scope, not a Phase 0 defect.

## 3. Local raster icon technical result

Phase 0 module boundary: `src/catalog/reference.js` immutable source-qualified catalog entries → `src/assets/resolve.js` vetted icon asset registry / priority resolution → `src/main.js` `<img>` created via DOM, with `error` handler that loads original inline SVG once. The fixture's `node.catalogRef` points to catalog metadata; `node.iconOverride` is the sole optional player-owned test override. No user-supplied HTML or arbitrary file path is accepted.

- `52 Sailing`: `demo:sailing` catalog default `test:sail-png` → `./public/icons/sample-sail.png`, actual Chromium naturalWidth **64**.
- `Berserker ring`: `demo:ring` catalog default `test:ring-webp` → `./public/icons/sample-ring.webp`, Chromium naturalWidth **64**.
- Selected Sailing → Apply test icon `test:alternate-png` loads alternate PNG; node IDs, all edge records and position arrays remain equal to baseline.
- Override `test:missing` leads to HTTP-like test route 404 → original data-URI SVG; fallback `naturalWidth = 64`; no JS errors and 7 cards/6 links remain.
- `npm run build` copies raster images to `dist/public/icons/`; independent local HTTP requests verify PNG/WebP response MIME and byte equality. No live third-party service/CDN/scraping used. **Normal web serving to the browser is still required**; this is not an installed/offline PWA.
- Later phases: explicit user file chooser for validated PNG/WebP; persist decoded-safe blobs with `user:<opaque-id>` in IndexedDB, and make Phase 2 JSON export embed referenced assets or require an explicit verified companion package. No misleading roadmap-only “full backup.” Documented private `public/user-icons/` workflow supports assets supplied locally in a static project but has **no automatic directory discovery or import UI now**.

## 4. Layout benchmark and recommendation

**Environment:** Linux x64, Node.js v22.16.0, Graphviz `dot` 2.42.4; single measured execution per shape/algorithm, including Graphviz process startup. Detailed node rectangles 236×108 CSS-pixel-equivalent; spans include node boxes. Each fixture is valid under the current validator. `fitZoomAt1440x900` is a geometry-only estimate, not an actual usability/interaction metric. No device FPS, DOM memory or viewport label readability is claimed.

| Fixture | Custom JS: width × height, ms | Graphviz dot: width × height, ms | Box overlaps / semantic invariants |
|---|---|---|---|
| Exact 7 nodes / 6 edges | 1,334 × 428 px; 0.42 ms | 1,214 × 428 px; 8.04 ms | 0 / preserved (both) |
| 110 nodes / 127 edges, 5 disconnected components with branches/convergence | 3,896 × 2,348 px; 7.61 ms | 3,496 × 3,263 px; 10.98 ms | 0 / preserved (both) |
| Chain-heavy 250 nodes / 400 edges | 91,370 × 108 px; 0.89 ms | 81,413 × 507 px; 35.45 ms | 0 / preserved (both) |

**Interpretation:** The 249-edge chain imposes a path length that makes a flat horizontal all-nodes-detailed layout inherently enormous; even the established layered engine cannot make the entire chain readable at fit-to-view. The custom algorithm exacerbates widths and does not route around cards/labels. Graphviz has a mature port/spline routing engine but **its routed splines were not bound to the demo's SVG renderer**, and Graphviz CLI is not suitable as a dependency of a static browser-only app. On the 110-node roadmap, `dot` reduces width but increases height and therefore has a smaller estimated fit zoom: it is not categorically better in every metric. Neither result proves edge crossing/label UX quality or pan FPS. These are not polished large-graph acceptance tests.

**Recommended Phase 1 approach:** keep working HTML/SVG interactions and current minimal adapter for small graphs, with no promise of large-graph optimization. Preserve a renderer-independent **async adapter interface** accepting measured node sizes and typed edges, returning positions and optional routed paths. **Target ELK.js layered in a later Phase 3 adapter** because it runs as local browser JavaScript and is designed for directed node-link graphs and ports; it was researched but **not run** here: attempted `npm view elkjs@0.12.0` failed `EAI_AGAIN` in this environment. Using an ELK bundled build must be actually tested before accepting layout quality. Plan Focus/navigation by connected component, collapse/reveal, task-board navigation, zoom/search and conditional rendering. Phase 3: label/route collisions, crossing/back-edge routing, grouping and readability. Phase 6: browser device memory and performance for at least 250/400.

## 5. Executed checks and reproduction

| Check | Result | Evidence / rerun |
|---|---|---|
| Original canonical graph/unit regression + new asset registry cases | **PASS 14/14** | `npm test` → `evidence/addendum-node-test-output.txt` |
| Actual Chromium DOM gestures, PNG/WebP decoding, override and broken fallback in inline harness | **PASS 8/8** | `python -m unittest discover -s tests -p 'browser_phase0.py' -v` → `evidence/addendum-browser-output.txt`; screenshot `evidence/asset-spike-fallback.png` is illustrative **not interaction proof** |
| Static copy production build | **PASS** | `npm run build` → `evidence/addendum-build-output.txt` |
| HTTP-served production-file GETs and expected 404 | **PASS 8 checks** | `python tests/static_asset_check.py` (after build) → `evidence/addendum-static-smoke.txt` |
| Two algorithm positions on 3 fixtures (6 cases), no overlaps, no semantic mutation | **PASS 6/6 invariants** | `node scripts/benchmark-layout.mjs` with `dot` on PATH → `evidence/layout-benchmark.json` |
| Engineer browser direct navigation to HTTP-served page | **NOT RUN successfully: blocked by administrator policy** | Prior and current `ERR_BLOCKED_BY_ADMINISTRATOR`; separate HTTP file checks cannot be reclassified as browser E2E |
| Owner's original demo walkthrough | **OWNER-REPORTED PASS**, not engineer-rerun | Owner feedback §1; browser/version/URL not supplied |
| Real permissioned personal artwork import + durable backups | **NOT RUN / outside Phase 0** | Phase 1/2/5 as scheduled |

For the reviewer: extract zip, `npm run dev`, open `http://127.0.0.1:4173/` in a normal desktop browser. Follow revised `README.md` smoke steps. `npm run build` then `npm run preview` serves static output. Node and Chromium inline tests require Node ≥20 and Python Playwright/Chromium respectively. Graphviz-only comparison requires separately installed `dot`. No npm package installation needed for the app itself.

## 6. Decisions, issues and phase gate

**P0:** none known in Phase 0 demonstration. **P1:** none known in narrow Phase 0 scope. Future acceptance risks: unverified image rights, browser-side ELK integration, user-asset quota/security/backup portability. **P2:** edge-label collision, whole-graph readability and direct-HTTP Chromium navigation evidence gap. No owner's waiver of unlicensed use or data-loss risk is requested.

**Updated files:** `PHASE0_ADDENDUM.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `RISK_REGISTER.md`, `TEST_REPORT.md`, `HANDOFF.md`, `PRODUCT_SPEC.md`, `README.md`, `CHANGELOG.md`, `TEST_STRATEGY.md`, plus focused `src/`, tests, original raster assets, benchmark fixture/scripts, evidence logs and manifest. Historical pre-feedback reports are retained as snapshots. No Phase 1 creation sidebar, select-two connections, undo, IndexedDB or full catalog implemented.

**Engineering recommendation: YES — Phase 1 can be authorized once the owner expressly approves.** Reason: small-graph renderer and raster handling genuinely operate in Chromium; a source-reproducible, position-only adapter can be replaced; established layout benchmark isolates inherent deep-chain limits; remaining large-graph quality, rights and persistence work has explicit future-phase gates. This is **not** approval that v1 layout, E2E coverage or Jagex artwork rights are complete. **STOP: request explicit owner authorization to start Phase 1.**
