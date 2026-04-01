# .claude-gamekit Core

`.claude-gamekit` is a plug-in toolkit for Claude Code game projects. It is designed to sit next to an existing Unity, Godot, web, or WeChat Mini Game repository without taking over the host project's own `scripts/`, `docs/`, or `tests/` folders.

## What This Toolkit Is For

Use this toolkit when you want a Claude Code workflow that can:

- Split work into small, reviewable feature slices.
- Keep planning, assets, engineering, and QA separated.
- Preserve replaceable placeholder assets through a stable Asset ABI.
- Validate work through scripted smoke tests and structured artifacts.
- Stay usable even when the model has limited context.

## Architecture

The repository is split into three layers:

- `CLAUDE.md` at the host project root is a thin entry file.
- `.claude/` holds Claude Code project agents, commands, and settings.
- `.claude-gamekit/` holds the toolkit itself.

Inside `.claude-gamekit/`:

- `core/` contains reusable toolkit logic, schemas, engine adapters, and tests.
- `project/` contains project-specific docs and runtime artifacts.

This separation keeps the template reusable. The toolkit remains portable, while the host project keeps its own code and asset layout.

## Directory Layout

```text
CLAUDE.md
.claude/
  agents/
  commands/
  settings.json
.claude-gamekit/
  core/
    engines/
    scripts/
    schemas/
    templates/
    tests/
    README.md
    README.zh-CN.md
  project/
    docs/
    artifacts/
```

## Agents

The toolkit uses a star topology. The main session acts as `gamekit-main-orchestrator`, and all subagents report back to it.

Core project agents:

- `gamekit-main-orchestrator`
- `gamekit-feature-analyst`
- `gamekit-placeholder-artist`
- `gamekit-tech-art-contracts`
- `gamekit-gameplay-engineer`
- `gamekit-qa-verifier`
- `gamekit-research-scout`
- `gamekit-unity-integrator`
- `gamekit-godot-integrator`
- `gamekit-web-integrator`
- `gamekit-wechat-integrator`

Built-in Claude Code agents still matter:

- `Explore` for codebase discovery.
- `Plan` for complex read-only decomposition.

## Commands

The toolkit exposes namespaced slash commands:

- `/gamekit-intake <goal>`
- `/gamekit-slice <feature-id>`
- `/gamekit-dispatch <task-id>`
- `/gamekit-asset-pass <feature-id>`
- `/gamekit-implement <feature-id>`
- `/gamekit-verify <feature-id>`
- `/gamekit-close <task-id>`

Typical flow:

1. Start with `/gamekit-intake` to create or switch the active task.
2. Use `/gamekit-slice` to turn the goal into a FeatureSpec.
3. Use `/gamekit-dispatch` to fan work out to multiple subagents.
4. Use `/gamekit-asset-pass` when placeholders and Asset ABI contracts are needed.
5. Use `/gamekit-implement` for the gameplay and engine integration work.
6. Use `/gamekit-verify` to produce verification evidence.
7. Use `/gamekit-close` only after handoffs and verification exist.

## Workflow Rules

- Planning docs live under `.claude-gamekit/project/docs/planning/`.
- Art docs live under `.claude-gamekit/project/docs/art/`.
- Engineering notes live under `.claude-gamekit/project/docs/engineering/`.
- QA cases and reports live under `.claude-gamekit/project/docs/qa/`.
- Runtime state lives under `.claude-gamekit/project/artifacts/`.

The toolkit keeps human-readable docs and machine-readable artifacts separate. That makes it easier to reuse the template across projects and easier for weak-context models to continue work later.

## Why Star Topology

The main session is the only coordinator. Subagents do not negotiate with each other directly.

This design has a few practical benefits:

- It prevents context drift across multiple agent conversations.
- It keeps responsibility boundaries clear.
- It makes handoffs explicit and reviewable.
- It works better for low-context models because each agent gets a narrow task and a small input set.

## Why Asset ABI Exists

Placeholder assets are only useful if later human art can replace them safely. The Asset ABI captures the contract that gameplay code relies on:

- pivot rules
- scale rules
- socket definitions
- material slots
- collision rules
- prefab or node shape

With that contract in place, gameplay code can depend on the interface instead of hardcoding temporary placeholder names. That is the main reason the template stays maintainable after the first graybox pass.

## Validation

Run these commands from the host project root:

```powershell
npm --prefix .claude-gamekit/core run validate
npm --prefix .claude-gamekit/core run test
node .claude-gamekit/core/scripts/verify/run.mjs --task active
```

What they do:

- `validate` checks the template structure, required files, schemas, and agent frontmatter.
- `test` runs the Node test suite for agent contracts and template rules.
- `verify/run.mjs` produces structured verification output for the active task and selected engine.

The toolkit also includes smoke coverage for the executable scripts under `.claude-gamekit/core/scripts/`. The goal is not to prove every host project build can succeed inside the template repo. The goal is to prove the toolkit entrypoints, guards, and planners stay runnable and consistent.

## Installing Into Another Repo

Copy these three entries into the host project root:

- `CLAUDE.md`
- `.claude/`
- `.claude-gamekit/`

If the host project already has `.claude/settings.json`, merge the toolkit hooks into the existing file instead of overwriting unrelated settings. Keep the `gamekit-*` command and agent filenames unchanged to avoid collisions.

Do not rename the host project`s own `scripts/`, `docs/`, `tests/`, or engine-specific folders. The toolkit is built to live beside them, not replace them.

## Keeping The Template Clean

The template should remain a skeleton, not a demo project.

Keep it clean by following these rules:

- Do not pre-seed active tasks in `project/artifacts/tasks/`.
- Keep `project/docs/*/features/`, `cases/`, and `reports/` empty unless you are working on a real slice.
- Keep placeholder catalogs generic.
- Keep capability artifacts minimal and schema-valid.
- Put reusable examples into `core/tests/fixtures/`, not into project runtime state.

If you need to test a real slice, create it through `/gamekit-intake` and let the workflow generate task state deliberately.

## Script Smoke Tests

The toolkit scripts are meant to be runnable from a clean shell. The test suite exercises the core entrypoints in isolated temporary workspaces so the real repository state is not modified.

Coverage is focused on:

- task intake and activation
- task dispatch and handoff generation
- stage updates
- verification planning
- guard hooks for prompt, tool use, and stop behavior
- template validation

This smoke coverage is important because the toolkit is distributed as a copyable template. If a script stops working, the failure should be caught by the toolkit itself before it is copied into another repo.

## Design Notes

The toolkit keeps a strict split between:

- human docs under `project/docs/`
- structured state under `project/artifacts/`
- reusable logic under `core/`

That split is what keeps the template portable across engines and projects. Unity gets a first-class adapter, but Godot, web, and WeChat Mini Game reuse the same workflow contracts.

## Related Files

- `CLAUDE.md`
- `.claude/settings.json`
- `.claude/agents/*.md`
- `.claude/commands/*.md`
- `.claude-gamekit/core/scripts/`
- `.claude-gamekit/core/schemas/`
- `.claude-gamekit/project/docs/`
- `.claude-gamekit/project/artifacts/`

