---
description: Execute GameKit verification and capture a VerifyResult plus QA report.
argument-hint: <feature-id>
allowed-tools: Bash(node .claude-gamekit/core/scripts/tasks/set-stage.mjs:*),Bash(node .claude-gamekit/core/scripts/verify/run.mjs:*),Read,Write,Edit,MultiEdit,Glob,Grep,Bash,Task
---

Set the task stage first:

!`node .claude-gamekit/core/scripts/tasks/set-stage.mjs active verification gamekit-qa-verifier active`

Then act as `main-orchestrator`:

1. Delegate execution and reporting to `gamekit-qa-verifier`.
2. Run the structured verifier:
   !`node .claude-gamekit/core/scripts/verify/run.mjs --task active`
3. Ensure `.claude-gamekit/project/docs/qa/reports/` and `.claude-gamekit/project/artifacts/verification/` are updated.
4. Point the user to `/gamekit-close <task-id>` only after evidence is complete.
