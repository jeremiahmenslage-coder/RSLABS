# Project documentation index

Current gate: [CURRENT_PHASE_GATE.md](agents/CURRENT_PHASE_GATE.md). Phase 1 is delivered pending acceptance; Phase 2 is not authorized.

## Daily references

- [Application setup and owner walkthrough](../README.md)
- [Shared repository instructions](../AGENTS.md)
- [CEO role](agents/AI_CEO_INSTRUCTIONS.md) and [Engineer role](agents/AI_ENGINEER_INSTRUCTIONS.md)
- [CEO onboarding prompt](agents/CEO_START_PROMPT.md) and [Engineer onboarding prompt](agents/ENGINEER_START_PROMPT.md)
- [Phase 1 review](agents/PHASE_1_REVIEW.md)
- [Product specification](../PRODUCT_SPEC.md), [architecture](../ARCHITECTURE.md), [design sample](../DESIGN_SYSTEM.md)
- [Decision history](../DECISIONS.md), [handoff](../HANDOFF.md), [changelog](../CHANGELOG.md)
- [Future feature ideas and deferred options](FUTURE_FEATURES.md) (ideas only; not implementation authorization)
- [Testing commands and limitations](TESTING.md), [strategy](../TEST_STRATEGY.md), [executed reports](../TEST_REPORT.md), [risks](../RISK_REGISTER.md)
- [Migration setup](migration/README.md) and [checkpoint/evidence inventory](history/CHECKPOINTS.md)

## Authority and historical context

Explicit human Owner decisions take precedence over historical phase-start orders. DECISIONS.md records decision evidence; CURRENT_PHASE_GATE.md summarizes the current gate. Neither an implementation report nor green tests establish Owner acceptance.

[ENGINEERING_BRIEF.md](ENGINEERING_BRIEF.md) is the operational founding baseline. Its [identical founding copy](founding/OSRS_Ironman_Progression_Planner_AI_Engineering_Brief.md) and [CEO playbook](founding/OSRS_Ironman_Progression_Planner_CEO_Playbook.md) are preserved originals; do not maintain competing edits or execute their obsolete Phase 0 start orders. [Phase 0 feedback](PHASE0_OWNER_FEEDBACK.md), [conditional Phase 1 authorization](PHASE1_AUTHORIZATION.md), and root historical phase reports remain preserved. Missing historical evidence paths are mapped in the checkpoint inventory.

Templates under ../templates/ are reusable forms. The approval-ledger template is not a second live ledger. Optional agent TOMLs remain inactive examples. Root living documents retain their established paths to avoid unnecessary reference churn.
