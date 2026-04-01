---
description: Move the active task into implementation and coordinate gameplay plus engine integration work.
argument-hint: <feature-id>
allowed-tools: Bash(node .claude-gamekit/core/scripts/tasks/set-stage.mjs:*),Read,Write,Edit,MultiEdit,Glob,Grep,Bash,Task
---

Set the task stage first:

!`node .claude-gamekit/core/scripts/tasks/set-stage.mjs active implementation gamekit-gameplay-engineer active`

Then act as `main-orchestrator`:

1. Confirm `.claude-gamekit/project/docs/qa/cases/$ARGUMENTS.md` exists before implementation continues.
2. Delegate the feature implementation to `gamekit-gameplay-engineer`.
3. Delegate platform integration to the engine-specific `gamekit-*integrator` only when its `write_scope` does not collide with gameplay edits.
4. Point the user to `/gamekit-verify <feature-id>` after the handoff artifacts are complete.
