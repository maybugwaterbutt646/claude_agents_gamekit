# Claude Agents GameKit

![GitHub stars](https://img.shields.io/github/stars/YHQ0601/claude_agents_gamekit?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/YHQ0601/claude_agents_gamekit?style=flat-square)
![Platforms](https://img.shields.io/badge/platforms-Unity%20%7C%20Godot%20%7C%20Web%20%7C%20WeChat-blue?style=flat-square)
![Workflow](https://img.shields.io/badge/workflow-Claude%20Code%20Multi--Agent-6f42c1?style=flat-square)

A Claude Code multi-agent template for 3D game development across Unity, Godot, web, and WeChat Mini Game projects.

This repository is built for a practical problem: most AI coding workflows break down in game projects because the work is noisy, asset-heavy, engine-specific, and too easy to derail with context sprawl. GameKit is designed to keep that under control.

- It keeps the main session as the single orchestrator.
- It pushes narrow, high-noise work into subagents.
- It separates human docs from machine-readable runtime state.
- It treats placeholder asset replacement as a first-class contract problem.
- It makes verification part of the workflow, not an afterthought.

If you want Claude Code to help with real game production work instead of isolated code snippets, this template is the starting point.

## Table Of Contents

- [Why This Exists](#why-this-exists)
- [Core Design Ideas](#core-design-ideas)
- [What Makes This Repository Different](#what-makes-this-repository-different)
- [Supported Targets](#supported-targets)
- [Categories](#categories)
- [Repository Structure](#repository-structure)
- [Included Agents](#included-agents)
- [Included Commands](#included-commands)
- [Workflow Overview](#workflow-overview)
- [Why Parallel Subagents Matter Here](#why-parallel-subagents-matter-here)
- [Validation And Script Coverage](#validation-and-script-coverage)
- [Quick Start](#quick-start)
- [Keep The Template Clean](#keep-the-template-clean)
- [Recommended For](#recommended-for)
- [FAQ](#faq)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Documentation](#documentation)
- [Suggested GitHub About](#suggested-github-about)
- [Project Character](#project-character)

## Why This Exists

Game development is a poor fit for naive agent workflows.

Compared with ordinary application code, a game slice usually includes:

- design constraints
- placeholder or graybox art
- engine-specific setup
- implementation details
- QA and manual verification evidence
- future human replacement of temporary assets

When all of that is pushed through one long chat, the result is predictable:

- context becomes bloated
- the model confuses planning with implementation
- temporary assets get hardcoded into gameplay
- verification becomes vague
- later contributors cannot tell what is authoritative

This project is designed around that failure mode.

The template assumes that even a strong model benefits from narrower roles, and that a weaker or lower-context model benefits even more. The goal is not to create as many agents as possible. The goal is to create the minimum structure needed to keep a game workflow reviewable, restartable, and replaceable.

## Core Design Ideas

### 1. The main session is the orchestrator

GameKit does not build around free-form agent swarms.

The main Claude Code session acts as `gamekit-main-orchestrator`. It owns:

- task intake
- stage transitions
- subagent dispatch
- handoff review
- final closeout

Subagents do not coordinate directly with each other. This star topology is intentional.

Why:

- it reduces context drift
- it keeps ownership obvious
- it makes handoffs explicit
- it is easier to recover from interrupted sessions
- it works better with limited-context models

### 2. Split by context pollution, not by org chart

The template does not try to recreate a full studio org chart inside Claude Code.

Instead, it isolates the kinds of work that are most likely to blow up context:

- feature slicing
- placeholder asset composition
- asset replacement contracts
- engine-specific integration
- QA case design and verification
- script and workflow validation
- release and publication

This is why the roles are narrow. It is also why built-in Claude Code agents like `Explore` and `Plan` are still used for read-only discovery instead of cloning them into custom project agents.

### 3. Human docs and runtime state must be different things

This template enforces a split between:

- human-readable knowledge in `.claude-gamekit/project/docs/`
- machine-readable state in `.claude-gamekit/project/artifacts/`
- reusable toolkit logic in `.claude-gamekit/core/`

That split matters because game workflows need both:

- docs that humans can read quickly
- structured records that agents and scripts can validate reliably

If those are mixed together, the repository becomes harder to reuse and harder to verify.

### 4. Placeholder assets are treated as contracts

One of the most expensive mistakes in AI-assisted game workflows is letting temporary assets leak into permanent gameplay code.

GameKit avoids that by treating replaceable art as an Asset ABI problem.

Each replaceable asset can be described through a contract that captures:

- pivot rules
- scale rules
- socket definitions
- material slots
- collision assumptions
- prefab or node shape

The idea is simple:

- placeholder art should unblock development
- gameplay code should depend on contracts, not on temporary mesh names
- later human artists should be able to swap assets without breaking logic

That is why `gamekit-placeholder-artist` and `gamekit-tech-art-contracts` are separate roles.

### 5. Verification is part of the pipeline

This template assumes that not every engine can be fully executed in every environment.

For example, Unity may not be available locally. That does not mean verification disappears. It means verification must degrade in a controlled, explicit way.

GameKit makes verification a first-class output through:

- QA case authoring before implementation
- structured verification artifacts
- capability matrices per engine
- CI-required or blocked states when local execution is not possible

The workflow does not treat "I could not run it" as a complete answer.

## What Makes This Repository Different

Most "AI game dev templates" stop at prompts or role descriptions.

This repository goes further:

- custom Claude Code agents are already wired
- namespaced slash commands are included
- hooks are configured
- scripts are runnable from Node
- schema validation is built in
- smoke tests cover the executable entrypoints
- the template is kept clean instead of shipping with a demo task preloaded

That combination is the point. The repository is not just a set of ideas. It is a working workflow scaffold.

## Supported Targets

The workflow is designed to be portable across:

- Unity
- Godot
- web 3D projects
- WeChat Mini Game projects

Unity is the first full adapter. The others share the same contracts and workflow shape, but may rely more on scaffolds or capability placeholders until a concrete project is attached.

## Categories

### [01. Orchestration And Workflow](#01-orchestration-and-workflow)

The coordination layer that keeps Claude Code usable in long-running game work.

- [gamekit-main-orchestrator](./.claude/agents/gamekit-main-orchestrator.md) - keeps the main session in charge
- [CLAUDE.md](./CLAUDE.md) - thin root entrypoint
- [gamekit-intake](./.claude/commands/gamekit-intake.md) - create and activate a task
- [gamekit-dispatch](./.claude/commands/gamekit-dispatch.md) - split work into parallel-safe work items
- [workflow-rules.md](./.claude-gamekit/project/docs/shared/workflow-rules.md) - ownership and evidence rules

### [02. Planning And Task Design](#02-planning-and-task-design)

The planning layer that turns a user goal into bounded, reviewable work.

- [gamekit-feature-analyst](./.claude/agents/gamekit-feature-analyst.md) - turns goals into executable slices
- [game-brief.md](./.claude-gamekit/project/docs/planning/game-brief.md) - project-level intent
- [feature specs folder](./.claude-gamekit/project/docs/planning/features/) - per-slice planning docs
- [task-record schema](./.claude-gamekit/core/schemas/task-record.schema.json) - active task structure
- [work-item schema](./.claude-gamekit/core/schemas/work-item-record.schema.json) - parallel work structure

### [03. Placeholder Assets And Asset ABI](#03-placeholder-assets-and-asset-abi)

The asset layer that keeps graybox speed and replacement safety from fighting each other.

- [gamekit-placeholder-artist](./.claude/agents/gamekit-placeholder-artist.md) - placeholder composition and naming
- [gamekit-tech-art-contracts](./.claude/agents/gamekit-tech-art-contracts.md) - replacement-safe asset contracts
- [asset-catalog.md](./.claude-gamekit/project/docs/art/asset-catalog.md) - project placeholder inventory
- [replacement-guide.md](./.claude-gamekit/project/docs/art/replacement-guide.md) - swap process for final assets
- [asset-contract schema](./.claude-gamekit/core/schemas/asset-contract.schema.json) - machine-readable Asset ABI

### [04. Gameplay And Engine Adapters](#04-gameplay-and-engine-adapters)

The implementation layer for host-project code and engine-specific integration.

- [gamekit-gameplay-engineer](./.claude/agents/gamekit-gameplay-engineer.md) - gameplay implementation against approved contracts
- [gamekit-unity-integrator](./.claude/agents/gamekit-unity-integrator.md) - Unity adapter
- [gamekit-godot-integrator](./.claude/agents/gamekit-godot-integrator.md) - Godot adapter
- [gamekit-web-integrator](./.claude/agents/gamekit-web-integrator.md) - Web adapter
- [gamekit-wechat-integrator](./.claude/agents/gamekit-wechat-integrator.md) - WeChat Mini Game adapter
- [engine-capabilities.md](./.claude-gamekit/project/docs/engineering/engine-capabilities.md) - capability overview

### [05. QA, Verification, And Script Validation](#05-qa-verification-and-script-validation)

The validation layer that keeps "it should work" from replacing real evidence.

- [gamekit-qa-verifier](./.claude/agents/gamekit-qa-verifier.md) - QA cases and verification evidence
- [gamekit-script-validator](./.claude/agents/gamekit-script-validator.md) - entrypoint and script reliability
- [test-strategy.md](./.claude-gamekit/project/docs/qa/test-strategy.md) - validation policy
- [verify-result schema](./.claude-gamekit/core/schemas/verify-result.schema.json) - structured verification output
- [script-smoke.mjs](./.claude-gamekit/core/tests/script-smoke.mjs) - isolated smoke coverage

### [06. Release, Documentation, And Adoption](#06-release-documentation-and-adoption)

The publishing layer that makes the template usable by other Git users, not just by its author.

- [gamekit-release-manager](./.claude/agents/gamekit-release-manager.md) - commit and push workflow
- [gamekit-bilingual-docs](./.claude/agents/gamekit-bilingual-docs.md) - English and Chinese docs
- [core README](./.claude-gamekit/core/README.md) - deep implementation guide
- [core README.zh-CN](./.claude-gamekit/core/README.zh-CN.md) - Chinese guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - contribution rules

## 01. Orchestration And Workflow

This repository is built around the idea that the main Claude Code session should remain the only true coordinator.

That is why the root workflow is intentionally conservative:

- the main session owns task intake
- the main session chooses when to delegate
- subagents do not negotiate directly with each other
- every stage leaves behind both docs and structured artifacts

This is the part of the design that most directly targets low-context failure. When the main thread stays in charge, the project becomes easier to pause, resume, review, and debug.

## 02. Planning And Task Design

Planning in GameKit is not open-ended ideation. It is controlled reduction.

The point of the planning layer is to take a user goal and produce:

- a bounded feature slice
- explicit acceptance criteria
- visible dependencies
- a task model that later agents can operate on without replaying the whole conversation

That is why `TaskRecord`, `WorkItemRecord`, and `FeatureSpec` all exist. They make coordination restartable.

## 03. Placeholder Assets And Asset ABI

This is one of the defining ideas of the repository.

Temporary assets are not just temporary visuals. In practice they leak into:

- sockets
- hierarchy assumptions
- colliders
- materials
- runtime references

If those assumptions are not captured explicitly, later human artists inherit brittle gameplay code. The split between placeholder authoring and Asset ABI authoring is there to keep speed and replacement safety from collapsing into each other.

## 04. Gameplay And Engine Adapters

The implementation layer deliberately separates shared workflow from engine-specific friction.

Unity, Godot, Web, and WeChat Mini Game projects all need different setup, tooling, and verification paths. Instead of pretending those differences do not exist, the template isolates them behind engine adapters while keeping the workflow contracts shared.

That is what lets this repository stay multi-engine without becoming a pile of vague agent prompts.

## 05. QA, Verification, And Script Validation

The repository assumes that validation has to be engineered, not merely described.

That is why it includes:

- QA-first workflow rules
- structured verification artifacts
- per-engine capability scaffolds
- script smoke coverage in isolated temporary workspaces

The goal is to make "this entrypoint runs" and "this task has evidence" testable claims, not social expectations.

## 06. Release, Documentation, And Adoption

A reusable template is not complete when the code works locally. It is complete when another Git user can understand what it is, why it is shaped this way, and how to adopt it without reverse-engineering the author's intent.

That is why this repository now includes:

- a homepage README built for GitHub browsing
- deeper core docs
- bilingual documentation support
- a contribution guide
- a release-focused agent

The result should feel more like a usable open-source starter than a private prompt dump.

## Repository Structure

```text
CLAUDE.md
.claude/
  agents/
  commands/
  settings.json
.claude-gamekit/
  core/
    engines/
    schemas/
    scripts/
    templates/
    tests/
    README.md
    README.zh-CN.md
  project/
    docs/
    artifacts/
```

### Root files

- `CLAUDE.md`
  - the thin repository entrypoint for Claude Code
- `.claude/`
  - project agents, slash commands, and hook configuration
- `.claude-gamekit/`
  - the portable toolkit itself

### Toolkit layers

- `.claude-gamekit/core/`
  - reusable logic, schemas, engine adapters, tests, and installable template structure
- `.claude-gamekit/project/`
  - per-project docs and runtime artifacts

The key point is that the template does not try to take over the host project's own `scripts/`, `docs/`, `tests/`, `Assets/`, or engine folders.

It lives beside them.

## Included Agents

Current project agents:

- `gamekit-main-orchestrator`
- `gamekit-feature-analyst`
- `gamekit-placeholder-artist`
- `gamekit-tech-art-contracts`
- `gamekit-gameplay-engineer`
- `gamekit-qa-verifier`
- `gamekit-research-scout`
- `gamekit-script-validator`
- `gamekit-release-manager`
- `gamekit-bilingual-docs`
- `gamekit-unity-integrator`
- `gamekit-godot-integrator`
- `gamekit-web-integrator`
- `gamekit-wechat-integrator`

Built-in Claude Code agents also matter:

- `Explore`
- `Plan`

The design principle is straightforward:

- use built-in agents for read-heavy generic work
- use custom project agents for narrow, high-value, format-constrained work

## Included Commands

The template ships with namespaced slash commands:

- `/gamekit-intake <goal>`
- `/gamekit-slice <feature-id>`
- `/gamekit-dispatch <task-id>`
- `/gamekit-asset-pass <feature-id>`
- `/gamekit-implement <feature-id>`
- `/gamekit-verify <feature-id>`
- `/gamekit-close <task-id>`

These commands make the workflow discoverable and repeatable. They are meant to reduce improvisation in long-running game tasks.

## Workflow Overview

```mermaid
flowchart TD
    A["User goal"] --> B["/gamekit-intake"]
    B --> C["TaskRecord"]
    C --> D["/gamekit-slice"]
    D --> E["FeatureSpec"]
    E --> F["/gamekit-dispatch"]
    F --> G["QA case design"]
    F --> H["Placeholder asset pass"]
    F --> I["Asset ABI contracts"]
    F --> J["Engine integration prep"]
    G --> K["/gamekit-implement"]
    H --> K
    I --> K
    J --> K
    K --> L["/gamekit-verify"]
    L --> M["VerifyResult + QA report"]
    M --> N["/gamekit-close"]
```

In practice, the workflow means:

1. intake the goal
2. turn it into a bounded feature slice
3. design QA before implementation
4. define placeholder assets and replacement contracts
5. implement against the contract
6. verify with evidence
7. close only when the record is complete

## Why Parallel Subagents Matter Here

This project is not anti-parallelism. It is anti-chaotic parallelism.

Parallel work is useful when:

- write scopes do not overlap
- outputs are clearly defined
- the main session remains the only coordinator

That is why dispatch is based on `WorkItemRecord` and `write_scope`, not on vague prompts like "you two collaborate on this".

The benefit is especially strong in game work because:

- QA, asset prep, ABI design, and engine prep often can proceed in parallel
- gameplay implementation and integration can sometimes run in parallel
- narrower scopes reduce accidental overwrite and conflicting assumptions

## Validation And Script Coverage

This repository includes real script validation, not just file presence checks.

From the repository root, run:

```powershell
npm --prefix .claude-gamekit/core run validate
npm --prefix .claude-gamekit/core run test
```

What this covers:

- template structure validation
- agent and command frontmatter validation
- schema validation of fixtures
- smoke execution of command and hook entry scripts
- verification planner execution for all supported engines

The script smoke suite runs in isolated temporary workspaces so the real repository state stays clean.

That is important for a copyable template. If the entrypoints break, the template should catch it itself before another user copies it into a fresh repo.

## Quick Start

1. Copy these three entries into your game repository root:

   - `CLAUDE.md`
   - `.claude/`
   - `.claude-gamekit/`

2. Open Claude Code in that repository.

3. Confirm the agents are visible:

   ```powershell
   claude agents
   ```

4. Validate the template:

   ```powershell
   npm --prefix .claude-gamekit/core run validate
   npm --prefix .claude-gamekit/core run test
   ```

5. Start a real slice:

   ```text
   /gamekit-intake Third-person movement with jump and landing checks
   ```

6. Continue through the workflow:

   ```text
   /gamekit-slice third-person-movement-with-jump-and-landing-checks
   /gamekit-dispatch active
   ```

## Keep The Template Clean

This repository is intentionally kept as a clean skeleton.

That means:

- no demo task is preloaded as the active task
- feature folders are empty until a real slice is created
- capability artifacts are minimal and schema-valid
- reusable examples live in `core/tests/fixtures/`, not in project runtime state

This matters for adoption. A reusable template should not force new users to clean out someone else's sample workflow before they can start.

## Recommended For

This repository is a good fit if you are:

- building 3D gameplay prototypes with Claude Code
- working across design, art, engineering, and QA in one repo
- trying to keep placeholder assets replaceable
- using Unity first but planning for engine portability
- interested in multi-agent workflows that are more disciplined than "one chat does everything"

## FAQ

### Is this only for Unity?

No. Unity is the first full adapter, because it is the most common pressure case for 3D workflows and the one most likely to suffer from "AI made it work once, but no one can safely replace the assets later." The workflow itself is engine-agnostic. Godot, web, and WeChat Mini Game support reuse the same task model, handoff model, Asset ABI idea, and verification shape.

### Why not let subagents talk to each other directly?

Because direct subagent chatter usually makes the system feel more sophisticated than it is. In practice it increases context drift, hides responsibility, and makes recovery harder after interruptions. This template chooses controllable coordination over theatrical autonomy.

### Why not put everything in one big CLAUDE.md?

Because large always-loaded instruction files become noisy fast. This template keeps the root `CLAUDE.md` thin and pushes project state into `project/artifacts/` plus audience-specific docs under `project/docs/`. That keeps the active context smaller and easier to trust.

### Why separate placeholder art from Asset ABI?

Because they solve different problems. Placeholder art is about speed. Asset ABI is about future replacement safety. If the same role owns both without discipline, gameplay code ends up depending on temporary asset names and hierarchy details.

### Can I use this with a weak or cheap model?

That is one of the reasons the template exists. The workflow is designed so lower-context models can still contribute by operating inside narrow roles with small inputs and explicit output formats.

### Does this replace normal engineering discipline?

No. It makes discipline easier to preserve. You still need review, sensible scope, engine knowledge, and production judgment. The template helps structure those things; it does not replace them.

## Roadmap

### Near Term

- Add richer root-level onboarding docs and examples for first-time adopters.
- Expand engine adapter guidance, especially for Godot and Web.
- Improve release and documentation workflows around GitHub publishing.
- Add more contract fixtures for common game slice patterns.

### Mid Term

- Add optional examples for common 3D slices without polluting the clean template state.
- Add stronger CI recipes for Unity, Godot, and browser verification.
- Add deeper capability scaffolds for Web and WeChat Mini Game verification.
- Add contribution-friendly issue templates and release notes structure.

### Longer Term

- Provide optional packaged starters for common game genres or controller patterns.
- Add broader asset pipeline contract examples for characters, props, cameras, and UI.
- Add more robust evaluation suites for agent quality, not just script execution.

## Contributing

Contributions are welcome, but they should preserve the core identity of the template.

What this project wants from contributors:

- keep the template portable
- keep the project state clean
- keep the workflow explicit
- avoid adding magic that hides state or responsibility

Before opening a change:

1. Run:

   ```powershell
   npm --prefix .claude-gamekit/core run validate
   npm --prefix .claude-gamekit/core run test
   ```

2. Make sure the template still works as a clean skeleton.
3. Avoid preloading demo tasks or project-specific state into `.claude-gamekit/project/`.
4. If you add a new agent, command, schema, or script entrypoint, also add or update:

   - validation coverage
   - test fixtures
   - smoke tests when the entrypoint is executable
   - documentation

5. Prefer changes that improve clarity, portability, and recoverability over changes that just add more agent behavior.

There is also a dedicated contributor guide here:

- [CONTRIBUTING.md](./CONTRIBUTING.md)

## Documentation

Detailed toolkit docs:

- English: [`.claude-gamekit/core/README.md`](./.claude-gamekit/core/README.md)
- Chinese: [`.claude-gamekit/core/README.zh-CN.md`](./.claude-gamekit/core/README.zh-CN.md)

Project workflow docs:

- [workflow-rules.md](./.claude-gamekit/project/docs/shared/workflow-rules.md)
- [game-brief.md](./.claude-gamekit/project/docs/planning/game-brief.md)
- [test-strategy.md](./.claude-gamekit/project/docs/qa/test-strategy.md)

## Suggested GitHub About

If you want the GitHub repository About section to match the project clearly, use:

Description:

`Claude Code multi-agent template for 3D game development across Unity, Godot, Web, and WeChat Mini Games, built for low-context workflows and safe asset replacement.`

Suggested topics:

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

## Project Character

This repository is opinionated in a specific way:

- practical over theatrical
- structured over magical
- restartable over clever
- replaceable over tightly coupled

It is built for real game workflow pressure, where docs, assets, code, and verification all have to survive handoff.

If that is your problem, this template is meant to be useful.
