# OSRS Ironman Progression Planner — CEO / Product Owner Playbook

**Document owner:** Product owner (you)  
**Companion document:** `OSRS_Ironman_Progression_Planner_AI_Engineering_Brief.md`  
**Project status:** Requirements agreed; engineering has **not** been authorized to build beyond Phase 0.  
**Document purpose:** Give the product owner a practical operating manual for directing an AI engineering agent, reviewing real progress, managing scope, and avoiding a fragile one-shot build.

---

## 1. The project in plain English

Build a **solo Old School RuneScape (OSRS) Ironman progression planner** with a modern, OSRS-inspired interface. Its main screen is an editable, visual map of the goals you care about. A synchronized task board lets you act on those goals day to day.

You decide which quests, skills, items, unlocks, bosses, and activities matter. You connect them manually to illustrate **required prerequisites**, **recommended preparations**, or **your preferred progression order**. The app helps visualize those relationships, keeps your progress, and marks goals as ready or blocked *based only on the prerequisites you entered*.

**The product is not an automatic RuneScape guide.** The first release does not need to discover game requirements for you, connect to your RuneLite account, or sync with other players.

### The three user questions it must answer

1. **What am I working toward?**
2. **What leads into this goal, and what does it lead to?**
3. **What can I work on next based on my roadmap?**

### Concrete progression examples

**Converging graph:**

```text
52 Sailing → Troubled Tortugans → Belle's Folly ───────────────┐
                                                                ├→ Perilous Moons
Barrows armor ──────┐                                          │
                     ├→ Berserker ring ─────────────────────────┘
Crystal shield ─────┘
```

**Long-term preferred progression:**

```text
Perilous Moons → Royal Titans → Tombs of Amascut → Dragon Warhammer → Chambers of Xeric
                                     │                                  │
                                     ├─ Obtain Osmumten's fang          └─ Obtain Dexterous prayer scroll / Rigour
                                     └─ Obtain Lightbearer
```

These examples are **user-created planning paths**, not assertions that all links are real in-game prerequisites. The ToA raid-clearing milestone and its two item drops have **independent completion statuses**.

---

## 2. Locked product decisions

| Product decision | Approved approach |
|---|---|
| Initial audience | Solo Ironman; Group Ironman features deferred |
| Delivery | Modular HTML/CSS/JavaScript **static web application** |
| Views | Interactive progression graph **and** synchronized task board |
| Opening screen | Reopen whichever view was used last |
| Node types | Quests, skills, items, bosses, diaries, prayers, activities, custom milestones |
| Node creation | Double-click canvas to open a **detailed sidebar**; use catalog or custom entry |
| Connections | Draw using handles **or** connect two selected nodes |
| Connection types | Hard prerequisite, soft prerequisite, preferred progression order |
| Graph shape | Converging and diverging; one goal may feed multiple branches |
| Positioning | Drag nodes manually, then click **Optimize Layout** when desired |
| Objectives | Flat underlying graph with expandable **visual** groups |
| Goal completion | Manually set Not Started / In Progress / Completed |
| Optional tracking | Current/target progress counters; no automatic completion |
| Readiness | Calculated from completed **hard** prerequisites only |
| Completed goals | Reusable; show, dim, hide, or collapse without deleting |
| Exploration | Focus and Highlight modes |
| Display density | Compact and detailed node modes |
| Catalog | Broad OSRS content; authentic icons, automatic selection, manual overrides |
| Aesthetic | Recognizable OSRS imagery and visual language with modern usability |
| Desktop | Full editing |
| Mobile | View, inspect, search, and update completion/progress; full editor not required |
| Storage | Local browser persistence, autosave, versioned JSON export/import |
| Internet | No live service needed for core runtime once assets are bundled |

**Important local-storage limitation:** Progress stored on one computer is **not automatically synced** to your phone. To move it, export a backup and import it on the other device. Browser data can also be cleared, so backups matter.

---

## 3. Your job versus the AI engineer's job

### You own

- **Product intent:** Does the software solve your actual planning problem?
- **Priority and scope:** What belongs in v1 versus later?
- **User acceptance:** Does the feature work when *you* try it?
- **Approvals:** Whether the agent may proceed to the next phase.
- **Tradeoff decisions:** Approve material changes to schedule, scope, data safety, visual direction, or architecture.

### The AI engineer owns

- Selecting and validating libraries and implementation patterns.
- Writing maintainable source code and automated tests.
- Running and reporting tests honestly.
- Creating runnable builds and setup instructions.
- Fixing defects before claiming a phase is done.
- Maintaining Git checkpoints, technical documentation, and an accurate handoff file.
- Raising meaningful risks early instead of hiding or working around them silently.

You **do not** need to review every line of code. You **do** need to use the running app, check the required workflows, and demand evidence of tests and working checkpoints.

---

## 4. Development phases and approval gates

**Operating rule:** Commission **Phase 0 only** first. The AI must stop at the end of each phase and wait for your explicit approval. A screenshot, untested code dump, or a statement that a phase is “done” is not sufficient.

| Phase | What the agent delivers | What you should personally verify |
|---|---|---|
| **0 — Architecture & feasibility** | Working small graph proof of concept, tested tech choice, data model, initial design system, risks | The exact converging example renders; dragging, typed connections, layout optimization are feasible |
| **1 — Working editor** | Create/edit/delete nodes and edges; two connection methods; autosave; undo/redo | Build five nodes, link them, move them, reload the page: they're still there |
| **2 — Progression rules & backups** | Hard/soft/order logic, statuses, counters, readiness, cycle protection, validated JSON backups | Completing a prerequisite changes readiness, not downstream completion; restore exported graph |
| **3 — Graph organization** | Auto-layout, compact/detail nodes, groups, collapsing, completed filters, Focus/Highlight | Large converging branches remain readable; hiding completed nodes doesn't break readiness |
| **4 — Task board** | Synchronized board, filters, search, last-view preferences | Update a task in one view and see the exact same status in the other |
| **5 — OSRS catalog & visual polish** | Real game catalog and assets, import/update scripts, icon matching/overrides, consistent UI | Search a real item or quest, create a node, confirm authentic icon and reliable fallback |
| **6 — Release hardening** | Mobile experience, performance, regression QA, deployment build, final docs | Use the application for a realistic session; inspect 250-node/400-edge test evidence |

### Phase gate procedure

At the end of **every** phase, require:

1. **A running build** and exact instructions to launch it.
2. **A demonstration** of every acceptance criterion for the phase.
3. **Test results**, distinguishing actual executions from planned tests.
4. **A list of known defects and limitations**, prioritized by severity.
5. **A stable Git commit/tag or equivalent recoverable checkpoint.**
6. **Updated files:** product specification, architecture decisions, changelog, test report, and handoff.
7. **A proposed next phase** with any requested changes to approved scope.

You then either approve, request changes, or reject the phase. **Do not approve a phase with unresolved critical data-loss or core-workflow bugs.**

### Essential checkpoints

- **Phase 0 is a technical spike, not permission to build the whole app.** A library that can draw nodes but cannot reliably support rich editable nodes is not an adequate foundation.
- **Phase 1 must already save reliably.** Do not defer autosave to the end.
- **Phase 2 must already export and restore safely.** You should not accumulate meaningful progression data without a backup path.
- **Phase 5's catalog can have documented gaps.** A comprehensive dataset is a goal, not permission to hold the entire product hostage to impossible 100% coverage.

---

## 5. Your acceptance checklist (reuse at every review)

Check these before approving a phase:

- [ ] I personally opened the current runnable build.
- [ ] The phase's required user workflows worked for me.
- [ ] Existing accepted functionality still works (regression check).
- [ ] New and existing data survive a browser refresh.
- [ ] Nothing important was silently lost, duplicated, or corrupted.
- [ ] The agent provided actual test results and stated unrun tests clearly.
- [ ] Any remaining issues have a severity and disposition.
- [ ] A recoverable code checkpoint exists.
- [ ] Project documents reflect the current build.
- [ ] I understand what the next phase adds and what it does **not** add.

**Approval rule:** Approve only the current phase's deliverables. Do not treat approval of a phase as permission for every later phase.

### Simple decision messages you can send

**Approve a phase:**

> I tested Phase [number] and accept its deliverables. Proceed with Phase [next number] only, following the engineering brief and existing test requirements. Do not expand scope without approval.

**Request a fix:**

> Phase [number] is not accepted yet. Reproduce and fix this issue: [steps to reproduce, expected result, actual result]. Add a regression test, rerun existing relevant tests, provide a revised build, and remain in this phase.

**Challenge a technical decision:**

> Before changing [library/architecture/feature], show me the problem, two realistic options, the impact on saved data and existing features, and your recommended approach. Do not make the change until I approve it.

---

## 6. How to report bugs effectively

Use this simple template:

```text
Phase/build:
Screen:
What I tried:
What I expected:
What actually happened:
How often it happens:
Does it affect saved data? (Yes / No / Unsure)
Screenshot or recording (if available):
```

**Severity shorthand:**

- **P0 — Stop work:** Data loss/corruption, app cannot open, untrusted/unsafe behavior.
- **P1 — Block phase approval:** A required workflow is broken, e.g., cannot add nodes, create connections, or save.
- **P2 — Fix or explicitly schedule:** Noncritical UX or layout defects with a safe workaround.
- **P3 — Backlog:** Cosmetic refinements, optional conveniences.

The AI should fix P0 and P1 issues before moving to the next phase. You decide whether a P2 can be deferred.

---

## 7. Scope control: preventing an endless project

Use three categories for new ideas:

| Category | Meaning | Your action |
|---|---|---|
| **Must fix** | Current approved capability is broken or dangerous | Keep within current phase until repaired |
| **Approved scope** | Feature explicitly listed for the current/future v1 phase | Build in its assigned phase |
| **Later/backlog** | Interesting feature not necessary for v1 | Capture the idea; don't interrupt the phase |

### Deliberately excluded from v1

- Group Ironman membership, permissions, sharing, or live collaboration
- User accounts and cloud synchronization
- RuneLite or official account integrations
- Automatic detection of OSRS prerequisites
- AI-generated progression routes
- A full gameplay reference engine
- Payments, monetization, and social features
- Complex JSON merge/conflict handling
- Full-featured graph editing on mobile

**Permitted future direction:** The data model can accommodate these additions later, but v1 should not contain speculative implementations of them.

---

## 8. Engineering risks you should watch closely

| Risk | What to ask the agent |
|---|---|
| Rich nodes vs graph library | “Show me the proof that icons, detailed labels, handles, collapsing, and auto-layout coexist reliably.” |
| Overcrowded graphs | “Show a 250-node/400-edge test and tell me what actually slowed down.” |
| Hidden completed dependencies | “Prove hidden nodes still count for readiness without adding fake visible dependencies.” |
| Confusing groups | “Prove grouping is visual; a parent raid clear is independent of obtaining its drops.” |
| Loss of progress | “What happens if storage fails, import is malformed, or the browser clears local data?” |
| Stale game images | “Where did the assets come from, how are they updated, and may we redistribute them?” |
| CSS/UI inconsistency | “Is the design system reused across graph, editor, board, dialogs, and mobile?” |
| AI regression | “Which end-to-end tests did you actually rerun after this feature?” |

**Asset/legal consideration:** Treat this as a noncommercial OSRS fan project unless separately reviewed. The agent must verify game-data provenance, asset licenses, attribution, and Jagex's current fan-content terms before packaging and publishing content. Avoid treating the entire Wiki as an unrestricted image archive.

---

## 9. Project files to expect

The AI should maintain these in the source repository:

| File | Why you care |
|---|---|
| `README.md` | How to install, run, build, and use the project |
| `PRODUCT_SPEC.md` | Current approved capabilities and v1 boundaries |
| `ARCHITECTURE.md` | How core pieces fit together; data schema |
| `DECISIONS.md` | Meaningful decisions and their tradeoffs |
| `CHANGELOG.md` | What changed in each phase |
| `TEST_REPORT.md` | Verified tests, environments, failures |
| `HANDOFF.md` | Current state so another AI engineer can take over |

At each milestone, ask the agent to update `HANDOFF.md` with setup steps, current commit, working features, unfinished items, unresolved bugs, and next-step instructions.

---

## 10. What counts as an MVP, and what counts as a v1 release?

**First usable foundation (end of Phase 1):** You can build your own simple graph and trust that it survives reloads. It isn't yet a full progression planner.

**Progression-planning MVP (end of Phase 2):** You can add hard/soft/order connections, mark completion, see readiness, and export/recover your work. It is useful even with generic/custom icons.

**Approved v1 release (end of Phase 6):** It includes advanced graph organization, synchronized task board, an extensive OSRS catalog with documented gaps, mobile viewing/progress tracking, and tested deployment.

Don't confuse these milestones. The point of phases is to deliver increasingly useful **working** software.

---

## 11. Your very next action

Give the AI engineering agent **the companion engineering brief** and say:

> You are the lead engineer for this project. Read the attached AI Engineering Brief in full. **Execute Phase 0 only.** Identify critical ambiguities and risks, validate the graph-rendering architecture with a working proof of concept using the exact sample progression, and deliver the specified Phase 0 artifacts and test results. Do not advance to Phase 1 until I expressly approve the phase gate.

When Phase 0 is delivered, evaluate the proof of concept—not just the agent's written plan—and approve only if the technology genuinely supports the desired editor.

---

## 12. Definition of project success

The project succeeds when you can reliably do the following:

1. Create your actual Ironman progression paths with branching and convergence.
2. Express three different relationship meanings without confusion.
3. Edit, organize, and complete goals without breaking other branches.
4. Hide finished content while preserving its logical contribution.
5. Use a task board and a graph interchangeably without inconsistent data.
6. Find recognizable OSRS content and icons, with a fallback for missing entries.
7. Refresh, export, and restore a roadmap without losing its structure or progress.
8. Continue development with another engineer or AI without reconstructing the project from scratch.

**Guiding rule:** Working, recoverable, understandable software beats a large feature list.
