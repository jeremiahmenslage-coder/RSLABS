# Risk register — Phase 1 delivery (2026-10-25)

Severity: P0 = actual data loss/unopenable/unsafe; P1 = required workflow broken; P2 = noncritical with workaround; P3 = polish. **Risks here describe possible future failure; they are not claims of confirmed P0/P1 defects.**

| ID | Risk/evidence | Likelihood | Impact | Target mitigation/gate |
|---|---|---|---|---|
| P1-R1 | **Real browser-origin IndexedDB refresh/recovery not executed in engineering sandbox** (`ERR_BLOCKED_BY_ADMINISTRATOR`), despite 34/34 Node and 15/15 browser inline mock tests (historical delivery report) | High (test restriction) | High for acceptance confidence | Owner executes README normal Chrome/Edge same-origin steps including reload and injected failure; report exact version/URL before gate approval |
| P1-R2 | User can close tab after a write failure while unsaved changes are in volatile memory | Medium | High | Prominent SAVE FAILED, Retry action, no false Saved; last committed snapshot retained. Document that failed uncommitted edits cannot survive reload; Phase 2 backup/export controls |
| P1-R3 | All data is per browser profile and exact origin; browser clearing data/hostname change can appear to lose work | Medium | High | Stable `127.0.0.1:4173` instructions, explicit warning; Phase 2 portable backup with integrity/import preview |
| P1-R4 | Browser quota/transaction abort, schema corruption or unsupported future schema | Medium | High | Transaction completion controls status; abort retains last good; version validator refuses to replace an unreadable snapshot; browser-origin fault tests pending unrestricted access |
| P1-R5 | Whole-document writes and full DOM/SVG redraw may struggle with large roadmaps | Medium | Medium/High | Phase 3/6 real browser profiling, incremental updates/virtualization only after evidence; current small-graph-only layout warning |
| P1-R6 | Measured 250/400 chain width ~91,370px (simple), ~81,413px (Graphviz); ELK browser integration not demonstrated | High | High at scale | Phase 3 replaceable ELK-style layout, navigation/collapse and routed-edge tests; Phase 6 performance gate; no Phase 1 redesign |
| P1-R7 | OSRS/Jagex sprite license and permission remain unresolved despite strictly private, noncommercial intent | High | High for future imagery | Do not bundle game art; original PNG/WebP/SVG tests only, provenance/attribution+rights flags, verified allowed icons or user-supplied asset paths in future phases |
| P1-R8 | Future private user image uploads could be malformed or excessive; Phase 2 backup could omit image bytes | Medium | High | File-picker/blob workflow **not implemented**; later MIME+magic+decode/dimensions/quota checks and asset-byte-inclusive or companion-package backup |
| P1-R9 | Manually positioned edge badges and lines can overlap nodes and dense zoom-out harms legibility | High | Medium (P2) | Phase 3 smart routing, scoped navigation, readability; Phase 6 layout/viewport profiling |
| P1-R10 | Browser/OS accessibility differences and narrow-screen right inspector | Medium | Medium | Current buttons have labels and keyboard focus; Phase 6 cross-browser/mobile/a11y testing, owner desktop Chrome/Edge smoke now |
| P1-R11 | User may mistake demonstration arrows for actual OSRS game requirements | Medium | Medium | Repeated explicit copy: links are player-defined, not official prereqs; no readiness/status propagation |

**Current QA disposition:** 0 confirmed P0/P1 from tests executed. **Not-run critical confidence item:** normal HTTP-loaded browser IndexedDB close/reopen and failure recovery; recommend HOLD final phase acceptance pending owner's walkthrough. Unrestricted Chrome failure should be treated as a P1/P0 defect and fixed before acceptance rather than deferred.
