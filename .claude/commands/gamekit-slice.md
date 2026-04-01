---
description: Move the active GameKit task into specification and delegate FeatureSpec authoring.
argument-hint: <feature-id>
allowed-tools: Bash(node .claude-gamekit/core/scripts/tasks/set-stage.mjs:*),Read,Write,Edit,MultiEdit,Glob,Grep,Task
---

Set the task stage first:

!`node .claude-gamekit/core/scripts/tasks/set-stage.mjs active spec gamekit-feature-analyst active`

Then act as `main-orchestrator`:

1. Read `.claude-gamekit/project/artifacts/tasks/active-task.json`.
2. Delegate the spec work to `gamekit-feature-analyst`.
3. Ensure `.claude-gamekit/project/docs/planning/features/$ARGUMENTS.md` contains scope, dependencies, acceptance criteria, asset needs, and test notes.
4. If the spec is stable, point the user to `/gamekit-dispatch active`.
