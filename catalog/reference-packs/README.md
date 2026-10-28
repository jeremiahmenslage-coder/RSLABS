# Owner text reference packs — P5-004

`osrs-v1.json` is a format-1, version `1.0.0` local reference pack, generated once from the preserved factual catalog, then maintained by the Owner as text. It contains stable source-qualified IDs, canonical names, category-specific aliases and optional source/provenance fields. No descriptions, automatic game prerequisites, requirements, account data or completion are imported.

Rules are separate in `src/goal-rules.js`; saved instances are separate in the roadmap. Selecting a record snapshots its title/reference into a fresh goal ID. Updating packs never rewrites existing goal names, notes, statuses, progress, positions, relationships or references. Legacy catalog/individual art remain in place, inactive; no global mixed-category or individual-image picker returns.

## Coverage and current-source checks (2026-10-27)

| Category | Entries | Coverage |
|---|---:|---|
| Skill | 24 | Complete bounded skill list, including Prayer and Sailing |
| Diary | 48 | All 12 regions × Easy/Medium/Hard/Elite |
| Quest | 32 | Partial curated list |
| Item | 30 | Partial curated list |
| Boss | 24 | Partial curated list |
| Activity/minigame | 20 | Partial curated list |

178 entries reused from `catalog/reference-source.json`, omitting standalone Prayer unlock entries from active discovery. New-goal categories omit Prayer; existing Prayer-category goals remain valid/editable/importable and filterable. Prayer is a Skill. The dictionary makes no comprehensive-content or per-entry live-link-audit claim.

Current-source index checks: [Skills](https://oldschool.runescape.wiki/w/Skills), [Sailing release announcement reproduced from Jagex](https://oldschool.runescape.wiki/w/Update:Sailing_is_OUT_TODAY!), [Jagex Sailing announcement](https://www.jagex.com/news/set-sail-in-old-school-runescape-with-first-new-skill-sailing-to-land-in-the-beloved-mmo-coming-november-19th), [Achievement Diary](https://oldschool.runescape.wiki/w/Achievement_Diary). Search-index results supported 24 skills/Sailing and 12 diary regions; direct Wiki fetch was denied by robots and was not bypassed. Names/links remain manually curated facts, not scraped article content or a live runtime API. Bounded rules/list completeness checked locally; no newest-game catalog certification beyond these bounded lists.

## Repeatable preparation

1. Edit/copy the project-local JSON pack; increment `version`, keep existing IDs stable, and supply source-qualified IDs such as `owner:item:my-reference` for Owner additions. Alias strings are searchable only within their category. Diary entries must each have `region` and `tier`. All bounded skills/diary combinations are required exactly once.
2. Run `node scripts/import-catalog.mjs --pack catalog/reference-packs/osrs-v1.json` from the checkout. It validates the entire candidate before generating `src/catalog/owner-reference.js`, writes a candidate file then atomically renames the one activation module. Coverage JSON is printed for review. Invalid input leaves the previous module untouched. A failed activation may leave an unused `.candidate-*` artifact; no cleanup/deletion is automatic.
3. Run the same command with `--check` to verify reproducibility without changing generated output. No dependencies/network/browser data required.

Invalid headers/versions, malformed names/aliases/URLs, duplicate/invalid IDs, wrong skill identities and incomplete/duplicate diary combinations reject. Existing original `node scripts/import-catalog.mjs catalog/reference-source.json --check` remains available for archival validation. No in-app dictionary authoring is implemented.
