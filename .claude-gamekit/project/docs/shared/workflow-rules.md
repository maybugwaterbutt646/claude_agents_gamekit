# Workflow Rules

- Human-readable project knowledge lives under `.claude-gamekit/project/docs/`.
- Structured runtime state lives under `.claude-gamekit/project/artifacts/`.
- The main session remains the only orchestrator. Subagents do not coordinate directly with each other.
- Prefer parallel subagent dispatch only when `write_scope` does not overlap.
- Every stage must leave both a short summary and a structured artifact.

## Directory Ownership

- Planning: `gamekit-feature-analyst`
- Art catalog: `gamekit-placeholder-artist`
- Asset ABI: `gamekit-tech-art-contracts`
- Engineering notes: `gamekit-gameplay-engineer` and engine integrators
- QA docs and verification: `gamekit-qa-verifier`

## Required Evidence

- Active task pointer: `.claude-gamekit/project/artifacts/tasks/active-task.json`
- Handoffs: `.claude-gamekit/project/artifacts/handoffs/`
- Work items: `.claude-gamekit/project/artifacts/work-items/`
- Verification: `.claude-gamekit/project/artifacts/verification/`
- QA reports: `.claude-gamekit/project/docs/qa/reports/`
