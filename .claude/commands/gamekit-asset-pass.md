---
description: Run the placeholder asset and Asset ABI pass for the active feature.
argument-hint: <feature-id>
allowed-tools: Bash(node .claude-gamekit/core/scripts/tasks/set-stage.mjs:*),Read,Write,Edit,MultiEdit,Glob,Grep,Task
---

Set the task stage first:

!`node .claude-gamekit/core/scripts/tasks/set-stage.mjs active asset-pass gamekit-placeholder-artist active`

Then act as `main-orchestrator`:

1. Delegate placeholder work to `gamekit-placeholder-artist`.
2. Delegate ABI and replacement work to `gamekit-tech-art-contracts`.
3. Update `.claude-gamekit/project/docs/art/asset-catalog.md`, `.claude-gamekit/project/docs/art/replacement-guide.md`, and any needed `.claude-gamekit/project/artifacts/assets/*.json` contracts.
4. If both are ready, point the user to `/gamekit-implement <feature-id>`.
