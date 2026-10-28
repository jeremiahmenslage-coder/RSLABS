# P5-004 current scoped reference discovery

Owner-approved P5-004 adds category-first creation, bounded Owner reference packs and local category-icon pack preparation. Phase 5 acceptance remains pending; Phase 6, in-app dictionary authoring and later-phase work remain unauthorized.

The original individual catalog/artwork below remains inactive/deprecated. A separate versioned text reference pack reuses its factual records (excluding standalone Prayer unlocks), with bounded skill/diary rules and category-scoped discovery. Current preparation/coverage: reference-packs/README.md. Local Owner icon pack input/preparation: icon-packs/README.md. Saved instances remain separate and are never synchronized from dictionary updates. Individual art controls/matching remain inactive.

---

# Current P5-003 mode — catalog/individual artwork inactive/deprecated

P5-003 is the current authorized mode: manual title/category/manual-status creation and optional More details. Active catalog discovery/selection and individual-icon controls are removed. Category artwork controls Graph/Board/editor presentation; saved catalog references, individual overrides and hidden counters remain stored but inactive. Inspector Cancel discards the form and closes; panel hiding preserves drafts. Phase 5 acceptance pending; Phase 6 and text-only dictionary implementation NOT AUTHORIZED.

All existing catalog records, 94 individual-art PNGs, preparation tooling, provenance and notices remain at their original paths for compatibility/recovery; historical assessment below retains its attribution. Do not use individual matches as active defaults. New category-only preparation: node scripts/prepare-category-icons.mjs --check (offline pinned cache). See category-artwork-manifest.json: five genuine category symbols, two gaps, neutral custom. Owner reports Jagex permission covering third-party artwork sourcing and local bundling for this private planner. Owner-provided, not independently verified; no broader distribution rights implied. Applicable source notices remain retained.

---

# Local reference catalog and pinned artwork

207 factual name/category/reference-link records remain separate from user goals: 24 skills, 32 quests, 30 items, 24 bosses, 29 prayers, 48 diary tiers and 20 activities. Seven legacy demo references remain preserved and excluded from search. No automatic prerequisites, statistics or completion are imported. This is a curated subset/snapshot, not complete/newest-game coverage or a live per-entry link audit.

## Reference data

reference-source.json is the input; node scripts/import-catalog.mjs regenerates src/catalog/generated.js. node scripts/import-catalog.mjs catalog/reference-source.json --check verifies reproducibility. The tool is offline, validates IDs/categories/URLs/duplicates and never reads a player's roadmap. Factual names/links were manually curated; no Wiki descriptions, tables, game stats or requirements were copied. Original source-review history is preserved in evidence.

## Artwork and permissions

See [ARTWORK.md](ARTWORK.md), [selection](artwork-selection.json), [asset/match manifest](artwork-manifest.json) and [original fallback manifest](asset-manifest.json). P5-002 adds 94 pinned authentic PNGs (60,053 bytes): 90 identity-specific catalog matches and 117 disclosed category-level markers across 207 references. The generic markers are not unique quest/boss/diary/activity illustrations. All seven original symbols, old test references and original missing-image fallback remain available. Explicit manual overrides have priority.

Owner reports Jagex permission for third-party icon sourcing/bundling in this private local planner. It is Owner-provided, not independently verified; no broader distribution rights are implied. Applicable source notices are bundled verbatim under public/notices/artwork. Dava96 declares CC BY-NC-SA 3.0; osrsbox includes GPL-3.0 source notice and Jagex/Wiki exceptions. No upstream code/package was installed or executed, and no whole-planner license change is made.

node scripts/prepare-artwork.mjs --check verifies cached pinned inputs, PNGs, generated defaults, metadata and notices. See ARTWORK.md for fresh-cache --fetch and update instructions/limits. Public runtime has no CDN/API dependency. Catalog/art changes only alter default presentation; goal IDs, player edits, manual statuses, hidden progress, positions, groups, relationships, saved overrides and JSON remain untouched.
