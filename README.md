# OSRS Ironman Progression Planner — Phase 1 Editor

**Phase 1 only.** This is a locally hosted, browser-origin IndexedDB roadmap editor for a single private, noncommercial player. It starts with **your own empty roadmap**, not the canonical sample. Optional **Load original demo…** replaces the active roadmap with a copy of the original seven-node/six-edge fixture. Demo relationships are player-defined examples, **not verified game prerequisites**. No Jagex artwork is included.

## Windows quick start (Chrome or Edge)

1. Extract the Phase 1 ZIP to a **new folder**, separate from `v0.0.1` / `v0.0.2`.
2. Install **Node.js 20+** if necessary. In the extracted `osrs-phase1-editor` folder, open Windows **Command Prompt**: click the Explorer address bar, type `cmd`, Enter.
3. Run `npm install` (no runtime dependencies), then **`npm run dev`**. **Keep this terminal window open.** Alternatively double-click `START_WINDOWS.cmd` in this folder, which keeps the window open if the server exits unexpectedly.
4. Open **http://127.0.0.1:4173/** exactly (not `file://`, not the old folder, and do not alternate between `localhost` and `127.0.0.1`). IndexedDB is scoped to this **browser + origin**.
5. The page should read **LOCAL-FIRST GOAL EDITOR · PHASE 1**. If an older demo appears, press **Ctrl+Shift+R** and verify the terminal's current folder.
6. Stop the server with **Ctrl+C** in its Command Prompt window. The roadmap remains in that browser's IndexedDB unless browser/site data is cleared.

**If the URL does not connect:** `npm run dev` should stay active without returning to the prompt. Try `START_WINDOWS.cmd` / Command Prompt instead of Git Bash. Check port 4173 in a second Command Prompt with `netstat -ano | findstr :4173`; use `taskkill /PID <actual-number> /F` to stop an old stale process. Never terminate a process until verifying its PID. Rerun the current server, then hard-refresh. If you use a different hostname, port or browser profile, you will see **different local data**.

## Editor controls

- **Create:** double-click truly empty canvas space. A **right-side Goal & Connection Editor** opens. Choose title, category, notes and optional **bundled test icon**. Click **Save goal** or **Cancel** (Cancel never makes a node). If the right panel is hidden behind a small window, maximize your browser.
- **Edit:** left-click a card, edit fields in the right panel and **Save goal**. Unsaved edits require confirmation before switching context. The full catalog is **not** implemented.
- **Move / pan / zoom:** drag the body of a node to move it, drag empty canvas to pan, use the mouse wheel to zoom; **Fit graph** recenters. **Optimize layout** performs the proven simple small-graph layout; it is not production-ready for complex giant chains.
- **Connect, method A:** drag from the **right + output port** to another node's **left ● input port**; select `hard`, `soft`, or `order` in the right panel, then **Create directed connection**. Dragging a card itself does not connect it.
- **Connect, method B:** click the intended **source** card, hold **Shift** and click the **destination** card, click **Connect selected nodes** on the left, check the two explicit endpoints, select the kind and confirm. A connection may carry only **one** kind per ordered source → destination pair; reverse direction counts separately but hard cycles are rejected.
- **Edit/delete edges:** click an edge's type badge/line; change type or **Delete connection…** (with confirmation). Click a goal to **Delete goal…** (confirmation); only incident links are removed, not downstream goals.
- **Undo/redo:** use left buttons or Ctrl+Z / Ctrl+Y (not while editing a text input). Includes node/edge creation, edits, deletion, move and Optimize Layout. **History does not survive page reload.** Saved graph state does.
- **Density/groups:** compact and detailed modes work. The optional demo equipment group can collapse to a summary; stored links are never replaced by fake group edges. No full group creation UI in Phase 1.

## Phase 1 owner acceptance walkthrough (normal app)

1. Launch **http://127.0.0.1:4173/**. Verify that the **save indicator** is visible. Click **New empty roadmap…** and confirm (if prompted). This replaces the *active* graph, but does not change the immutable demo fixture.
2. Double-click empty space seven times, with enough horizontal/vertical room between cards, saving each as: **52 Sailing**, **Troubled Tortugans**, **Belle's Folly**, **Barrows Armor**, **Crystal Shield**, **Berserker Ring**, **Perilous Moons**. Use categories `skill`, `quest`, `quest`, `item`, `item`, `item`, `boss` respectively.
3. Connect **52 Sailing → Troubled Tortugans → Belle's Folly → Perilous Moons**, and **Barrows Armor → Berserker Ring**, **Crystal Shield → Berserker Ring**, **Berserker Ring → Perilous Moons**. This is the **exact six-link convergence**. Use both connection methods, and select at least one link of each type; these links are your personal planner's interpretations, not official game rules.
4. Drag three different cards. Edit a title and some notes, click **Save goal**. Make a disposable eighth card, connect it to one of the goals, then delete it; verify only its own link disappears. Click **Undo** and **Redo** to prove restoration/reapplication.
5. Click **Optimize layout**; verify six canonical edges and goal contents are intact. Drag any card afterward. Wait for **Saved to this browser**.
6. Reload with Ctrl+R. Verify names, categories, notes, seven goal identities, six directed links, kinds, and the final positions (including the last drag) are restored. Undo history will correctly be empty.
7. **Failed-save test**: first wait for **Saved**. Click **Test: fail next save**, select a goal, edit its notes and Save. The indicator must show **SAVE FAILED — changes only in memory** and a **Retry failed save** button. The previously committed data was not overwritten. **Do not reload while changes remain unsaved** unless intentionally testing last-known-good recovery; click **Retry failed save**, wait for **Saved**, and reload to confirm the note update persisted. To test recovery, repeat but reload **before** Retry; the old committed note should return.
8. Attempt a duplicate directed link and a self-link: both must show a rejection in the form, with no added link. Attempt to create a two-node **hard** cycle: the second hard connection must be rejected. (A non-hard cycle may be allowed by design.)
9. Optional Phase 0 regression: click **Load original demo…**, confirm 7 original cards/6 links, and try **Collapse equipment group**, **Expand**, and compact mode. You can return to an empty user graph with **New empty roadmap…**. **This replaces the active graph**, so use the demo only after your testing work is no longer needed.

**Important:** Clearing browsing data, switching browser profiles, hostname, ports or devices can make the locally saved roadmap unavailable. There is **no portable JSON backup in Phase 1**; Phase 2 is reserved for that after owner authorization. Back up your browser profile as appropriate and do not enter irreplaceable planning data until backup/export is available.

## Source, build, tests

```sh
npm test                     # 34 Node tests (model, storage simulation, Phase 0 regression)
npm run build                # static deployable dist/ with relative assets
npm run preview              # serves dist/ at http://127.0.0.1:4173/
python tests/browser_phase1.py       # 15 Chromium inline DOM interaction tests (MOCK IndexedDB)
python tests/static_phase1_smoke.py # 11 real HTTP asset checks against dist/
```

Python browser test requires installed Playwright and a local Chromium executable at `/usr/bin/chromium` (engineering environment); owner **does not need Python** to use the app. The engineering sandbox forbids Chromium navigation to HTTP URLs (`ERR_BLOCKED_BY_ADMINISTRATOR`); the inline browser suite uses a **mock** IndexedDB and cannot prove **real-origin IndexedDB refresh recovery**. The owner checklist above is the outstanding genuine-browser test. Do not claim automated HTTP browser E2E passed.

Project layout: `src/model.js` + `src/model/actions.js` (validation/actions); `src/state/store.js` (single authoritative snapshot/history); `src/storage/indexeddb.js` (structured durable transaction and serialized saves); `src/ui/graph.js` (nodes, SVG edges, drag/zoom/pan); `src/ui/inspector.js` (detailed editing); `src/main.js` (orchestration); `src/projection.js`/`src/layout.js` (swappable view/layout); `src/assets/resolve.js` and `src/catalog/reference.js` (separate bundled test icons/catalog metadata); `tests/` (regressions); docs (`ARCHITECTURE.md`, `TEST_REPORT.md`, etc.).

## Assets and scope

This source archive includes **original** PNG, WebP and SVG test imagery only, no copied OSRS artwork. The editor exposes only allowlisted local icon references. **Do not add unlicensed Jagex assets to transferable copies.** For future private build-folder use, `public/user-icons/` and an explicit local manifest are planned extension points; **no file picker, arbitrary path import or durable blob asset storage is implemented in Phase 1**. User-provided bytes require signature/decode/quota validation first. Phase 2 portability must include custom icon bytes or a verified companion package. Full OSRS catalog/icon matching belongs to Phase 5.

**Not included:** readiness engine, completion/counters UI, JSON import/export, task board, full catalogue, performance-scale layout, Focus/Highlight, mobile editing, user file picker, cloud sync, official game dependency intelligence. See `PRODUCT_SPEC.md` and `HANDOFF.md`.
