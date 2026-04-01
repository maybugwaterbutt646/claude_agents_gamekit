---
description: Create or switch the active GameKit task and seed a TaskRecord.
argument-hint: <goal>
allowed-tools: Bash(node .claude-gamekit/core/scripts/tasks/intake.mjs:*),Read,Write,Edit,MultiEdit,Glob,Grep
---

Seed the task record first:

!`node .claude-gamekit/core/scripts/tasks/intake.mjs "$ARGUMENTS"`

Then act as `main-orchestrator`:

1. Read `.claude-gamekit/project/artifacts/tasks/active-task.json`.
2. Summarize the new active task in under 150 words.
3. If the feature doc does not exist, create `.claude-gamekit/project/docs/planning/features/<feature-id>.md` from the active task goal.
4. Point the user to the next command, usually `/gamekit-slice <feature-id>`.
