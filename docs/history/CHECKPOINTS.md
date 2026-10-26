# Checkpoint and historical evidence inventory — 2026-10-26

## Verified pre-maintenance backup

- [Workspace ZIP](../../../../_backups/osrslabs-before-migration-2026-10-26-102428.zip)
- [Per-file SHA-256 inventory](../../../../_backups/osrslabs-before-migration-2026-10-26-102428.json)
- ZIP SHA-256: 82d816caf72819545bdea46cac0c8c40ba59d4e712b2c2059cb28a4a38f7a2ba
- 230 files from Phase0, Phase1 and agentDONOTREAD were copied and each archive entry verified against the original hash and size. Restricted-folder contents were copied for preservation, not interpreted as instructions.
- This backup is on the same computer; it is a recoverable local copy, not an independent off-device backup. It contains project files, not browser-profile/IndexedDB data.
- Recover into a separate folder and compare before replacing any working files. Preserve this original backup and manifests unchanged.

## Local Git baseline

Repository: Phase1/osrs-phase1-editor; branch: main. Baseline commit: 2b232bcc999c1b56496766943be795a01ed10033. It captures all 110 original Phase 1 working-copy files, including delivered dist and staged migration documents. No remote is configured by migration. Later documentation commits do not establish acceptance.

Future generated dist is ignored in the current index; the delivered directory remains on disk and in the baseline commit/ZIP. Original MANIFEST.sha256 remains a historical delivery manifest, not a checksum of subsequently edited living documents. The baseline may use Git text normalization; the ZIP is the byte-exact original recovery source.

## Historical checkpoint health

| Location from OSRSLABS | Package version | Manifest verification before maintenance |
|---|---|---|
| Phase0/osrs-phase0.0-spike | 0.0.1-phase0 | 59 listed files present and matching; 80 files total. Preserve as complete relative to its manifest. |
| Phase0/osrs-phase0.1-spike | 0.0.2-phase0 | 19 of 54 listed files missing; present listed files match. 36 files total. Preserve as incomplete; never silently reconstruct it. |
| Phase1/osrs-phase1-editor | 0.1.0-phase1 | All 93 original manifest entries present and matching before maintenance; 110 files total. |

The 19 missing Phase 0.1 manifest paths are: PHASE0_ADDENDUM.md; docs/PHASE0_OWNER_FEEDBACK.md; evidence/addendum-browser-output.txt; evidence/addendum-build-output.txt; evidence/addendum-node-test-output.txt; evidence/addendum-static-smoke.txt; evidence/asset-spike-fallback.png; evidence/layout-benchmark-console.txt; evidence/layout-benchmark.json; public/icons/sample-alternate.png; public/icons/sample-ring.webp; public/icons/sample-sail.png; scripts/benchmark-layout.mjs; src/assets/resolve.js; src/benchmarks/fixtures.js; src/benchmarks/graphviz-adapter.js; src/catalog/reference.js; tests/assets.test.mjs; tests/static_asset_check.py.

## Historical evidence reference mapping

Historical Phase 0 reports retained in Phase 1 use paths relative to their original delivery. Resolve the following against the complete [Phase 0.0 evidence folder](../../../../Phase0/osrs-phase0.0-spike/evidence/), not the Phase 1 evidence directory:

| Preserved report | Historical evidence |
|---|---|
| GATE_REVIEW.md and DESIGN_SYSTEM.md | optimized.png |
| PHASE0_DELIVERY_REPORT.md | initial.png |
| PHASE0_ADDENDUM.md | addendum-browser-output.txt, addendum-node-test-output.txt, asset-spike-fallback.png, addendum-build-output.txt, addendum-static-smoke.txt |

These paths identify historical records, not newly executed Phase 1 checks. Original reports were preserved instead of rewriting their historical evidence. The two founding engineering brief copies are byte-identical in the original kit; docs/ENGINEERING_BRIEF.md is the operational reference and docs/founding is archival.
