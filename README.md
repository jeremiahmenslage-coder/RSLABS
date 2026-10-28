# OSRS Ironman Progression Planner — P5-005 review package

Owner-approved P5-005 adds responsive selected-set dragging, simpler directed routes, immediate undoable deletion and strict structured-skill title validation. The P5-004 picker/reference/icon-pack foundation is retained; broad dictionary expansion remains deferred. Phase 5 acceptance remains pending; Phase 6, in-app dictionary authoring and later-phase work remain unauthorized.

## Run

From C:\Users\Jeremiah\OneDrive\Desktop\OSRSLABS\Phase1\osrs-phase1-editor run npm run dev and open http://127.0.0.1:4173/ at the existing browser origin for your saved roadmap. No npm install. Export JSON regularly; source files do not back up browser IndexedDB. Preserve dist: use only new separate build output. Exact evidence/build URL and consolidated Owner walkthrough: HANDOFF.md / TEST_REPORT.md.

## Goal picker and editing

Double-click empty canvas: “What are you working toward?” Choose Skill, Quest, Item, Boss, Diary, Activity or Custom. Skill has all 24 skills (including Prayer/Sailing) and an explicitly entered whole-number level 1–99; 70 Prayer is generated from its skill and level. No default level is supplied. Diary selects one of 12 regions and four tiers, for example Lumbridge & Draynor — Hard. Quest/Item/Boss/Activity search names and aliases only within that category, with partial-list/no-results explanations. Not listed? Create custom goal stays visible in each reference flow. Custom accepts a manual title. Preview before Create; status is manual and More details optional. Back/category changes retain entered inputs; changing a search clears stale selected results. Cancel/Escape creates nothing. More details transfers input/reference/structured skill and intended position at zoom/pan.

New structured Skill goals use skill/level editors with generated title/category; notes/status remain editable. Existing freeform Skill goals remain freeform. Existing Prayer-category goals remain editable/filterable/importable; no standalone Prayer option for new goals and no prayer-unlock replacement. Quick editing, Board explicit status controls, right-click/Shift+F10, shared Undo/Redo, canonical hard-only readiness and independent completion remain intact. Counters and individual-image controls remain hidden. Inspector Cancel discards its unsaved form and closes; panel toggle only hides/reopens and preserves drafts.

Click empty canvas clears temporary selection; dragging pans; Shift-drag selects full visible cards. Source then actual Shift-click destination or port dragging creates typed connections. Optimize is explicit/undoable; positions do not change from status/dictionary/category updates. Graph/Board share canonical IDs/history; search/filtering in Board is separate from reference discovery. Save status/Retry remain visible. Imports preview, require current export and explicit replacement confirmation. Failed saves/replacements preserve the last committed copy; Retry before reload of unsaved work.

## Reference/art packs and data

Approved additive schema-1 extension: optional skillGoal {format:1,skillId,targetLevel}, validated integer level 1–99, separate from archived hidden counters. No storage/origin migration or bulk rewrite. Existing freeform Skill and legacy Prayer goals are not parsed/converted; Prayer is omitted only from new category choices and remains a selectable Skill. Older builds lack structured editing/validation; preserve JSON/package before rollback.

178 local text records: complete bounded 24 skills/48 diary combinations; partial 32 quests/30 items/24 bosses/20 activities. Dictionary updates never rewrite existing goal names/statuses/notes/references. Repeated selections are independent goals. Preparation/check commands and current-source/coverage limits: catalog/reference-packs/README.md.

Category artwork remains the default across Graph/Board/editors. Five genuine pinned symbols retained; Inventory and Achievement Diary remain disclosed genuine-art gaps with original fallback until Owner supplies suitable files. Custom uses a neutral original marker. No global mixed-category or individual-icon picker. Existing catalog records, individual artwork, references/overrides, provenance and notices remain in place; saved individual refs/overrides stay inactive, exact hidden counters preserved. Owner PNG/WebP input/manifest/sample/check instructions: catalog/icon-packs/README.md. No files automatically deleted, no runtime CDN/API or new dependency installed. Local decoding uses existing development Playwright/Chrome.

Owner reports Jagex permission for private-planner third-party sourcing/local bundling; Owner-provided, not independently verified, no broader distribution rights. Applicable notices remain retained. Read docs/SKILL_GOAL_CONTRACT.md for compatibility/recovery. Historical README preserved at evidence/p5-004-preflight-2026-10-27/README.md-before.


## P5-005 movement, connections and deletion

Shift-drag selects full visible cards. Drag any selected card to move that explicit set together by a common offset; selection stays after movement. Single-click still selects/pairs normally; Shift-click destination and both connection methods remain available. One finished drag is one history/save operation. Escape or pointer cancellation restores original cards/routes with no commit. Hidden group members/descendants never move implicitly. Expensive routing is deferred to release; previews update incident lines at most once per animation frame.

Connections have no arrowheads. They leave source right and enter destination left, including backward links/cycles. Type styling/labels and generous hit targets remain; hover/focus/selection emphasizes lines. Source → Destination readouts expose direction. Bounded short routes intentionally permit crossings; no crossing-free guarantee. Labels/routes remain derived presentation, no semantic edges fabricated.

Delete while Graph canvas/card/connection owns focus removes the selected goals and incident edges, or the selected connection. Text fields/contenteditable and open modal editors are guarded; Board focus does not invoke Graph deletion. Context menus, selected-goal More toolbar and detailed Delete buttons provide explicit alternatives. Individual/selected deletions no longer ask confirmation: count feedback offers Undo; unrelated descendants stay, invalid representatives clear. Explicit deletion discards the affected object form; unrelated dirty inspector drafts remain. Reset/import/group-wide safeguards stay.

Structured Skill title must exactly match skillGoal metadata on load/import; contradictory snapshots reject without rewriting data. Legacy freeform Skill/Prayer goals remain unchanged. Contract details: docs/SKILL_GOAL_CONTRACT.md. Performance, source/coverage limits, exact current evidence/build URL and walkthrough are in current HANDOFF.md and evidence/p5-005-preflight-2026-10-27/PERFORMANCE.md.
