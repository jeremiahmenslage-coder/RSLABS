# OSRS planner — Codex migration kit (26 October 2026)

**Purpose:** Transfer the AI CEO → AI Engineer workflow to the **existing** OSRS Ironman Progression Planner codebase without resetting the project or approving a future phase.

**CURRENT OWNER STATUS:** A working Phase 1 copy has been delivered for review. **Phase 1 has not been accepted** on the evidence available to this kit. **Phase 2 has not been authorized.** This statement supersedes the historical 'Phase 0 only' start commands found in the unchanged founding briefs, but does not manufacture proof of Phase 0 or Phase 1 acceptance.

**This is a staged migration kit, not an installed Codex setup.** It has not inspected the local repo, executed the app, or verified Git history/tests. Do not overwrite an existing repository `AGENTS.md` or other files without comparing them.

## Contents and intended placement

| Staged file | Purpose | Installation rule |
|---|---|---|
| `PROPOSED_AGENTS.md` | Shared, compact, repository-wide instructions | Compare to existing root `AGENTS.md`, then **merge** as root `AGENTS.md` only with Owner approval |
| `docs/agents/AI_CEO_INSTRUCTIONS.md` | Durable CEO role | Place in existing repo after reconciling any incumbent CEO handoff |
| `docs/agents/AI_ENGINEER_INSTRUCTIONS.md` | Durable Engineer role | Same; don't replace verified later instructions |
| `docs/agents/CURRENT_PHASE_GATE.md` | Explicit gate snapshot, evidence gaps | Update only from Owner decisions and verified repo evidence |
| `docs/agents/PHASE_1_REVIEW.md` | Read-only audit and Owner acceptance walkthrough | Reconcile with live Phase 1 build |
| `docs/agents/CEO_START_PROMPT.md` and `ENGINEER_START_PROMPT.md` | Session starting messages | Paste separately into two main Codex threads |
| `templates/ENGINEERING_TICKET.md`, `templates/DELIVERY_REPORT.md`, `templates/OWNER_APPROVAL_LEDGER.md` | Controlled handoff artifacts | Use when relevant; don't proliferate duplicate ledgers |
| `optional_codex_agents/.codex/agents/*.toml` | Optional custom Codex subagent definitions | Only after verified support and workflow review; do not assume they enforce permissions |
| `docs/founding/*.md` | Unmodified original documents | Preserve as historical baseline; their Phase 0 execution orders are stale |

## Safe setup on Windows, in order

1. Back up the **current working Phase 1 source**, any saved browser data, and existing repository instructions. Do not start from a fresh scaffold or overwrite the only working copy.
2. Open the **actual existing repository** in Codex for Windows. In a read-only thread ask for `git status --short`, `git rev-parse --show-toplevel`, `git branch --show-current`, `git log -1 --oneline`, file layout, package scripts, current `AGENTS.md`, and any phase acceptance evidence. If Git is not configured, state that fact instead of silently initializing it.
3. Compare `PROPOSED_AGENTS.md` to any existing root instructions, and compare the role files to any existing incumbent handoffs or later Owner decisions. Treat old claims as historical until verified. Stage integration separately from application code changes.
4. After **Owner approval of the instruction-file integration**, copy the reconciled files into the real repository. Preserve the existing source tree and data. Start **two named Codex conversations** from that repository: `AI CEO — OSRS` and `AI Engineer — OSRS`. Paste the corresponding start prompt into each. The threads do not automatically exchange conversation memory; exchange tickets, commits/diffs and reviews through tracked artifacts.
5. Optional: install `.codex/agents/*.toml` as project-scoped custom subagents. These can be invoked for narrow delegation but **do not replace** separate human-governed main threads or sandbox/approval settings. Use read-only review tasks for initial adoption.
6. The CEO requests a **Phase 1 acceptance audit only**. The Engineer performs read-only inspection and reports the tested/untested state. When Owner permits, run the documented build/browser acceptance checks in a safe workspace. Record results. If bugs are found, get a **Phase 1 fix ticket**; still do not start Phase 2.

## Durable workflow

**Owner → CEO:** intent, priorities, decisions, explicit approvals. **CEO → Engineer:** one bounded ticket with authorized phase, acceptance tests, non-goals and stop condition. **Engineer → CEO:** reviewable diff/commit if any, actual test evidence, reproduction/demo, risks and issues. **CEO → Owner:** clear recommendation and manual acceptance steps. **Owner:** accepts/rejects phase and separately authorizes any next phase.

When current phase is unaccepted, proposals and read-only audits are fine; changes to production application code need a scoped Owner-authorized Phase 1 remediation ticket. No Phase 2 code until a recorded Phase 2 authorization. Do not infer that accepting Phase 1 by itself commissions Phase 2.

## What this package does not know

- Actual Phase 1 ZIP/source tree, branch, commit, code/tests, or browser behavior.
- Whether Phase 0 was formally accepted and whether Phase 1 was formally approved, beyond the user's report that Phase 1 was delivered.
- Incumbent AI CEO and AI Engineer's private project instructions, decisions, and complete chat history.
- Actual presence/content of root `AGENTS.md` and current living documents.

Collect the incumbent CEO/Engineer handoff documents when available, and reconcile with direct repository evidence. Do not claim migration is complete until both Codex roles demonstrate correct behavior against the existing codebase.

## References

- Codex `AGENTS.md`: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Codex custom subagents: https://learn.chatgpt.com/docs/agent-configuration/subagents
- OpenAI iterative workflow guidance: https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex
- Lean instruction best practices: https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra
