---
description: Generate WorkItemRecord files and prepare safe parallel subagent dispatch.
argument-hint: <task-id|active>
allowed-tools: Bash(node .claude-gamekit/core/scripts/tasks/dispatch.mjs:*),Read,Glob,Grep,Task
---

Create the work item batch first:

!`node .claude-gamekit/core/scripts/tasks/dispatch.mjs "$ARGUMENTS"`

Then act as `main-orchestrator`:

1. Read `.claude-gamekit/project/artifacts/work-items/`.
2. Group work items by non-overlapping `write_scope`.
3. Prefer parallel dispatch for up to four write-safe subagents in the same batch.
4. If any `write_scope` overlaps, fall back to serial execution and explain why.
