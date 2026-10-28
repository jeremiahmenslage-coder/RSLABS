# P5-003 category-only presentation

P5-003 is the current authorized mode: manual title/category/manual-status creation and optional More details. Active catalog discovery/selection and individual-icon controls are removed. Category artwork controls Graph/Board/editor presentation; saved catalog references, individual overrides and hidden counters remain stored but inactive. Inspector Cancel discards the form and closes; panel hiding preserves drafts. Phase 5 acceptance pending; Phase 6 and text-only dictionary implementation NOT AUTHORIZED.

Owner reports Jagex permission covering third-party artwork sourcing and local bundling for this private planner. Owner-provided, not independently verified; no broader distribution rights implied. Applicable source notices remain retained.

| Category | Presentation |
|---|---|
| Item | Inventory unavailable in reviewed pinned exports: neutral original fallback (gap) |
| Boss | Genuine Combat crossed-swords: Dava96 combatIcon |
| Activity, including minigames | Genuine Minigame: Dava96 minigameMapIcon |
| Quest | Genuine Quest: Dava96 questStartIcon |
| Skill | Genuine Skills: Dava96 skillsIcon |
| Prayer | Genuine Prayer: Dava96 prayer |
| Diary | Achievement Diary unavailable in reviewed pinned exports: neutral original fallback (gap) |
| Custom | Neutral original diamond marker |

The Inventory/Diary gaps are explicit; no cape, weapon or unrelated art silently substitutes. Five adopted symbols are genuine category/map/skill symbols in the source, not claimed to be a complete set of interface-tab sprites. Exact PNGs visually inspected before selection: combat (without Icon) was a ballista and deliberately rejected; combatIcon is crossed swords. No resized/recolored upstream bytes.

Source pin: Dava96/osrs-icons 16c5de73d6c57e1b47ef0606cf4b6e4ff39e82c6; same source export SHA256 and CC BY-NC-SA 3.0/Jagex/Wiki notices as P5-002. Three PNGs reused unchanged, two added (combatIcon, skillsIcon). Manifest: category-artwork-manifest.json. Original private permission/credits and source LICENSE/README copies under public/notices/artwork remain intact; no whole-planner relicensing. Original fallback diamond is authored SVG, no third-party rights claimed.

Repeat: node scripts/prepare-category-icons.mjs (or --check) from checkout root using the already preserved pinned cache at evidence/p5-002-preflight-2026-10-27/Dava96-src_generated_category-icons.ts. The tool hashes that cache against artwork-selection.json, decodes PNG data without executing upstream code, refuses changed existing PNGs and produces src/assets/categories.js and category-artwork-manifest.json. No network/dependencies. P5-002 preparation/import tooling remains unchanged/inactive and can still verify its archive. Future source/category additions require explicit review; do not repurpose individual matches.

Presentation never reads individual reference/override values. Archived resolveIndividualIcon exists for old recovery checks only; resolveNodeIcon uses category. Unknown strings survive normal editing/import/export, without attempting arbitrary URL/path loads. A failing category image switches once to the original fallback, without rewriting roadmap data. No schema/storage/origin change or user-data migration.
