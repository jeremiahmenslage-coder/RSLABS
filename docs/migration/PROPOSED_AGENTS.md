# OSRS Ironman Progression Planner — shared repository instructions (proposed)

> STAGED ONLY. Reconcile with the real repository's existing root `AGENTS.md` before installing. The human product Owner must authorize integration.

## Project contract

Maintain the approved, local-first, statically deployable **OSRS Ironman Progression Planner**, with a single roadmap state shown through an editable graph and synchronized task board. Use the latest explicit Owner-approved product decisions and the two original founding briefs under `docs/founding/` where no later decision supersedes them. Requirements are not proof of implementation.

Nonnegotiable domain invariants: goal status is manual; the `hard`, `soft`, and `order` directed edges are distinct; **only hard predecessors** block computed readiness; no completion propagation; flat graph with one-level visual grouping; hiding/collapsing does not change semantic edges, saved status, or prerequisite logic. Protect browser persistence, graph IDs/references, and versioned JSON recovery. Do not invent game prerequisites or treat sample graph paths as verified OSRS requirements.

## Authority and phase gate

Human Owner → AI CEO / Project Lead → AI Engineer. The Owner alone accepts numbered phases, authorizes the next phase, and approves material scope/architecture/data-risk changes. The CEO scopes and reviews; the Engineer implements authorized tasks and supplies evidence. Neither AI may self-approve a phase.

**Latest Owner-stated checkpoint, 2026-10-26:** working Phase 1 copy **delivered for review**; acceptance not yet established; **Phase 2 is not authorized**. See `docs/agents/CURRENT_PHASE_GATE.md` for the current documented gate. Historic instructions to 'execute Phase 0' are a baseline history, not permission to restart it. If records disagree, pause and surface the contradiction; do not infer permission from silence, a build, or a CEO recommendation.

## Repository-first practice

Inspect relevant existing files, tests, Git status, and Owner changes before suggesting edits. Prefer small modular diffs; do not rebuild an existing feature from scratch or overwrite uncommitted changes. Keep application code, user data, and credentials safe. No external push, merge into a protected branch, deployment, destructive reset, secret changes, new integrations or architecture changes without appropriate specific authorization.

Record what is **requested / authorized / implemented / tested / Owner-accepted** separately. Execute test commands only when appropriate to the task and available permissions; describe environment and results honestly. Screenshots and build success do not prove working buttons, persistence, or browser flows. P0 (data loss/app failure) and P1 (required workflow broken) block phase acceptance. Regression test every affected approved workflow.

## Context and role guidance

For CEO work explicitly read `docs/agents/AI_CEO_INSTRUCTIONS.md`; for engineering read `docs/agents/AI_ENGINEER_INSTRUCTIONS.md`. Also consult the relevant work ticket, current gate, and task-related repo files. These role files do **not** auto-load just because they exist. For task-specific facts use current `README.md`, `PRODUCT_SPEC.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `TEST_REPORT.md`, `HANDOFF.md` where present; do not load every document on every task. Separate Codex threads/worktrees do not automatically share conversation context or uncommitted edits.

## Delivery evidence

Each reviewable delivery reports exact checkout/commit, changed files, demo steps, actual unit/integration/browser checks as Pass/Fail/Not run, known defects P0–P3, data impact, updated docs, and explicit next approval required. Keep the human Owner's final decisions traceable.
