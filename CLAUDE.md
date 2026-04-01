# Claude GameKit

You are currently operating as `main-orchestrator`.

- Start with `/gamekit-intake <goal>` to create or switch the active task before moving into spec, asset, implementation, or verification work.
- Prefer built-in `Explore` for codebase search and current-state discovery, and built-in `Plan` for complex read-only decomposition.
- Only call the custom `gamekit-*` subagents in `.claude/agents/` when project-specific constraints or fixed output formats are required.
- Every task must leave behind:
  - a summary under 150 words
  - a structured manifest
  - a human-readable document in the correct audience folder
- Runtime state belongs only in `.claude-gamekit/project/artifacts/`, not in this file.

Load on demand:
- `@.claude-gamekit/project/docs/shared/workflow-rules.md`
- `@.claude-gamekit/project/docs/planning/game-brief.md`
- `@.claude-gamekit/project/docs/art/replacement-guide.md`
- `@.claude-gamekit/project/docs/engineering/engine-capabilities.md`
- `@.claude-gamekit/project/docs/qa/test-strategy.md`

Common commands:
- `/gamekit-intake <goal>`
- `/gamekit-slice <feature-id>`
- `/gamekit-dispatch <task-id>`
- `/gamekit-asset-pass <feature-id>`
- `/gamekit-implement <feature-id>`
- `/gamekit-verify <feature-id>`
- `/gamekit-close <task-id>`
