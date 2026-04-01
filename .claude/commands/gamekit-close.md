---
description: Close an active GameKit task after handoff and verification evidence are present.
argument-hint: <task-id>
allowed-tools: Bash(node .claude-gamekit/core/scripts/tasks/close.mjs:*),Read,Glob,Grep
---

Close the task only after evidence is complete:

!`node .claude-gamekit/core/scripts/tasks/close.mjs "$ARGUMENTS"`
