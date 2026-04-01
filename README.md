# 🎮 Claude Agents GameKit

![GitHub stars](https://img.shields.io/github/stars/YHQ0601/claude_agents_gamekit?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/YHQ0601/claude_agents_gamekit?style=flat-square)
![Platforms](https://img.shields.io/badge/platforms-Unity%20%7C%20Godot%20%7C%20Web%20%7C%20WeChat-blue?style=flat-square)
![Workflow](https://img.shields.io/badge/workflow-Claude%20Code%20Multi--Agent-6f42c1?style=flat-square)

A production-minded Claude Code multi-agent template for 3D game development across Unity, Godot, Web, and WeChat Mini Games.

It is built for a specific problem: game work is noisy, engine-heavy, asset-heavy, and easy to derail with long-context chats. GameKit keeps the workflow structured by combining:

- a single orchestrating main session
- narrow subagents with explicit ownership
- clean separation between human docs and machine-readable state
- Asset ABI contracts for safe placeholder replacement
- QA-first verification and script smoke coverage

If you want Claude Code to help with real game slices instead of one-off code snippets, this template is the entry point.

## ✨ What Is This?

GameKit is a portable toolkit that drops into an existing game repository without taking over the host project's own folders.

It gives you:

- project agents under [`.claude/agents/`](./.claude/agents/)
- namespaced slash commands under [`.claude/commands/`](./.claude/commands/)
- hooks in [`.claude/settings.json`](./.claude/settings.json)
- reusable toolkit logic in [`.claude-gamekit/core/`](./.claude-gamekit/core/)
- per-project docs and artifacts in [`.claude-gamekit/project/`](./.claude-gamekit/project/)

## 🚀 Quick Start

1. Copy these into your game repository root:
   - `CLAUDE.md`
   - `.claude/`
   - `.claude-gamekit/`
2. Open Claude Code in that repository.
3. Check agents:

   ```powershell
   claude agents
   ```

4. Validate the toolkit:

   ```powershell
   npm --prefix .claude-gamekit/core run validate
   npm --prefix .claude-gamekit/core run test
   ```

5. Start a slice:

   ```text
   /gamekit-intake Third-person movement with jump and landing checks
   /gamekit-slice third-person-movement-with-jump-and-landing-checks
   /gamekit-dispatch active
   ```

## 📚 Categories

### [01. Orchestration](#01-orchestration)

The coordination layer that keeps the main session in charge.

- [gamekit-main-orchestrator](./.claude/agents/gamekit-main-orchestrator.md)
- [CLAUDE.md](./CLAUDE.md)
- [gamekit-intake](./.claude/commands/gamekit-intake.md)
- [gamekit-dispatch](./.claude/commands/gamekit-dispatch.md)
- [workflow-rules.md](./.claude-gamekit/project/docs/shared/workflow-rules.md)

### [02. Planning](#02-planning)

The layer that turns a user goal into a bounded feature slice.

- [gamekit-feature-analyst](./.claude/agents/gamekit-feature-analyst.md)
- [game-brief.md](./.claude-gamekit/project/docs/planning/game-brief.md)
- [planning/features](./.claude-gamekit/project/docs/planning/features/)
- [task-record schema](./.claude-gamekit/core/schemas/task-record.schema.json)
- [work-item schema](./.claude-gamekit/core/schemas/work-item-record.schema.json)

### [03. Assets And Asset ABI](#03-assets-and-asset-abi)

The layer that keeps placeholder speed and swap safety compatible.

- [gamekit-placeholder-artist](./.claude/agents/gamekit-placeholder-artist.md)
- [gamekit-tech-art-contracts](./.claude/agents/gamekit-tech-art-contracts.md)
- [asset-catalog.md](./.claude-gamekit/project/docs/art/asset-catalog.md)
- [replacement-guide.md](./.claude-gamekit/project/docs/art/replacement-guide.md)
- [asset-contract schema](./.claude-gamekit/core/schemas/asset-contract.schema.json)

### [04. Gameplay And Engine Adapters](#04-gameplay-and-engine-adapters)

The implementation layer for host-project code and engine-specific constraints.

- [gamekit-gameplay-engineer](./.claude/agents/gamekit-gameplay-engineer.md)
- [gamekit-unity-integrator](./.claude/agents/gamekit-unity-integrator.md)
- [gamekit-godot-integrator](./.claude/agents/gamekit-godot-integrator.md)
- [gamekit-web-integrator](./.claude/agents/gamekit-web-integrator.md)
- [gamekit-wechat-integrator](./.claude/agents/gamekit-wechat-integrator.md)
- [engine-capabilities.md](./.claude-gamekit/project/docs/engineering/engine-capabilities.md)

### [05. QA And Validation](#05-qa-and-validation)

The layer that turns "should work" into evidence.

- [gamekit-qa-verifier](./.claude/agents/gamekit-qa-verifier.md)
- [gamekit-script-validator](./.claude/agents/gamekit-script-validator.md)
- [test-strategy.md](./.claude-gamekit/project/docs/qa/test-strategy.md)
- [verify-result schema](./.claude-gamekit/core/schemas/verify-result.schema.json)
- [script-smoke.mjs](./.claude-gamekit/core/tests/script-smoke.mjs)

### [06. Release And Docs](#06-release-and-docs)

The layer that makes the template usable by other Git users.

- [gamekit-release-manager](./.claude/agents/gamekit-release-manager.md)
- [gamekit-bilingual-docs](./.claude/agents/gamekit-bilingual-docs.md)
- [core README](./.claude-gamekit/core/README.md)
- [core README.zh-CN](./.claude-gamekit/core/README.zh-CN.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)

## 01. Orchestration

GameKit uses a star topology:

- the main session coordinates
- subagents report back
- handoffs are explicit
- runtime state is written to artifacts

This is the main defense against context drift.

## 02. Planning

The planning layer exists to make tasks restartable.

Instead of relying on long chats, it writes down:

- task identity
- feature boundaries
- dependencies
- acceptance criteria
- work-item ownership

## 03. Assets And Asset ABI

This is one of the core design choices of the project.

Placeholder assets are useful only if they can be replaced safely later. GameKit solves that with Asset ABI contracts so gameplay code depends on stable interfaces instead of temporary mesh names or hierarchy details.

## 04. Gameplay And Engine Adapters

The repository keeps engine differences isolated instead of pretending they do not exist.

Unity is the first full adapter. Godot, Web, and WeChat Mini Game reuse the same workflow contracts with different engine-specific integration rules.

## 05. QA And Validation

Validation is part of the workflow, not an afterthought.

GameKit includes:

- QA-first task flow
- structured verification artifacts
- engine capability scaffolds
- smoke tests for executable toolkit scripts

## 06. Release And Docs

A reusable template should explain itself well.

That is why this repository includes:

- GitHub-friendly landing docs
- deeper core documentation
- bilingual docs
- a contribution guide
- a release-focused agent

## 🧠 Why This Design?

This repository is shaped around a few practical beliefs:

- game development needs stronger workflow boundaries than ordinary app work
- weak or low-context models perform better with narrow roles and explicit outputs
- temporary assets should not leak into permanent gameplay assumptions
- verification should degrade explicitly, not disappear
- a template should stay clean instead of shipping preloaded demo runtime state

## 🗂 Repository Structure

```text
CLAUDE.md
.claude/
.claude-gamekit/
  core/
  project/
```

- `CLAUDE.md`: thin entrypoint for Claude Code
- `.claude/`: agents, commands, settings
- `.claude-gamekit/core/`: reusable logic, schemas, engines, tests
- `.claude-gamekit/project/`: project docs and runtime artifacts

## ✅ Validation

Run from the repository root:

```powershell
npm --prefix .claude-gamekit/core run validate
npm --prefix .claude-gamekit/core run test
```

What this covers:

- template structure
- agent and command frontmatter
- schema fixtures
- command and hook script smoke execution
- verification planners for supported engines

## 📖 Docs

- [Core README](./.claude-gamekit/core/README.md)
- [Core README (Chinese)](./.claude-gamekit/core/README.zh-CN.md)
- [Contributing](./CONTRIBUTING.md)
- [Workflow Rules](./.claude-gamekit/project/docs/shared/workflow-rules.md)

## 🤝 Contributing

Contributions are welcome, especially around:

- clearer agent and command design
- stronger schema or smoke coverage
- broader engine support
- better documentation
- safer asset pipeline patterns

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## 🏷 Suggested GitHub About

Description:

`Production-minded Claude Code multi-agent template for 3D game development with orchestrated subagents, Asset ABI, QA-first workflow, and cross-engine adapters.`

Topics:

- `claude-code`
- `multi-agent`
- `ai-agents`
- `game-development`
- `gamedev`
- `unity`
- `godot`
- `webgl`
- `wechat-minigame`
- `agentic-workflow`
- `asset-pipeline`
- `qa-automation`
