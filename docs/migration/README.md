# Installed migration configuration — 2026-10-26

Owner authorization is recorded exactly in ADR-014 of [DECISIONS.md](../../DECISIONS.md). The approved work covers backup, local Git setup and documentation/instruction cleanup. Phase 1 remains delivered pending acceptance; Phase 2 is not authorized.

## What is installed

- Application root: Phase1/osrs-phase1-editor. Open this folder as the Codex project, rather than its parent OSRSLABS or src.
- Root [AGENTS.md](../../AGENTS.md) provides shared governance. [CEO](../agents/AI_CEO_INSTRUCTIONS.md) and [Engineer](../agents/AI_ENGINEER_INSTRUCTIONS.md) role files stay separate and must be explicitly read for the assigned role.
- [Current gate](../agents/CURRENT_PHASE_GATE.md) summarizes status; DECISIONS.md holds decision evidence.
- Existing runtime modules, tests, assets, server, persistence origin, schema and delivered build remain unchanged. No files were discarded.
- Local Git baseline and backup details: [checkpoint inventory](../history/CHECKPOINTS.md).

## Two main chats

When the Owner chooses to start them, use AI CEO — OSRS and AI Engineer — OSRS from this application folder, pasting the corresponding prompt from docs/agents. These chats have not been created by configuration installation and have not demonstrated role behavior yet. Use one application-code writer at a time. Exchange written artifacts through the Owner unless cross-chat messaging is explicitly authorized. Optional custom subagent files remain staged and inactive; they do not create the main chats or enforce permissions.

After initial onboarding, use the current gate and authorized task instead of repeating first-start audits. Direct Owner instructions can serve as bounded tickets. Phase 1 acceptance, application remediation, test-harness repairs, push/deploy and Phase 2 are separate decisions.

## Preserved migration kit

The following files were moved byte-for-byte from src to this folder:

| Original working-copy location | Preserved location |
|---|---|
| src/PROPOSED_AGENTS.md | docs/migration/PROPOSED_AGENTS.md |
| src/README_START_HERE.md | docs/migration/README_START_HERE.md |
| src/MANIFEST.json | docs/migration/MANIFEST.json |

README_START_HERE.md is the original staged guide, not current installation status. PROPOSED_AGENTS.md is the original proposal, not active root instructions. MANIFEST.json records original kit paths/hashes; it is intentionally unchanged and will not match role files after authorized reconciliation. Use the baseline commit/ZIP to verify the original kit. The current installed guide is this README.

## Remaining maintenance proposals

No deletions, benchmark relocation, runtime refactoring, Python/Playwright installation, browser-test repair or new features were performed. Legacy tests and build side effects are classified in [TESTING.md](../TESTING.md). Historical reports and evidence remain preserved; future evidence-writing validation should use an agreed safe output or separate checkout.
