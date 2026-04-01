# .claude-gamekit Core

`.claude-gamekit` 是给 Claude Code 游戏项目用的可插拔工具包。它的设计目标是和现有的 Unity、Godot、Web、微信小游戏仓库并排存在，而不是接管宿主项目自己的 `scripts/`、`docs/` 或 `tests/` 目录。

## 这个工具包解决什么问题

如果你想让 Claude Code 具备一套稳定的游戏开发工作流，这个模板主要解决这些问题：

- 把需求拆成可审查的小切片。
- 把策划、美术、研发、测试分开处理。
- 用稳定的 Asset ABI 让占位资源可以安全替换。
- 用脚本化 smoke test 和结构化产物做验证。
- 在上下文很少的情况下也能继续推进工作。

## 架构

仓库分成三层：

- 宿主项目根目录的 `CLAUDE.md` 只做最薄的入口。
- `.claude/` 放 Claude Code 的 agents、commands 和 settings。
- `.claude-gamekit/` 放工具包本体。

其中 `.claude-gamekit/` 内部再分两层：

- `core/` 放可复用逻辑、schema、引擎适配器和测试。
- `project/` 放当前项目的文档和运行态产物。

这样做的好处是模板可以重复复制，而宿主项目自己的代码和资源布局不会被打乱。

## 目录结构

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

这个工具包采用星型拓扑。主会话负责总控，所有 subagent 都只向主会话汇报，不直接互聊。

核心项目 agents：

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

另外两个内置能力也会被优先使用：

- `Explore` 用于代码库搜索和现状梳理。
- `Plan` 用于复杂只读拆解。

## Commands

工具包提供这些命名空间化命令：

- `/gamekit-intake <goal>`
- `/gamekit-slice <feature-id>`
- `/gamekit-dispatch <task-id>`
- `/gamekit-asset-pass <feature-id>`
- `/gamekit-implement <feature-id>`
- `/gamekit-verify <feature-id>`
- `/gamekit-close <task-id>`

推荐流程：

1. 先用 `/gamekit-intake` 创建或切换活动任务。
2. 再用 `/gamekit-slice` 把目标变成 FeatureSpec。
3. 用 `/gamekit-dispatch` 把工作扇出给多个子智能体。
4. 需要占位资源和替换契约时，用 `/gamekit-asset-pass`。
5. 研发和引擎接线用 `/gamekit-implement`。
6. 用 `/gamekit-verify` 产出验证证据。
7. 只有在交接物和验证结果齐全后，才用 `/gamekit-close`。

## 工作流规则

- 策划文档放在 `.claude-gamekit/project/docs/planning/`。
- 美术文档放在 `.claude-gamekit/project/docs/art/`。
- 研发说明放在 `.claude-gamekit/project/docs/engineering/`。
- 测试用例和测试报告放在 `.claude-gamekit/project/docs/qa/`。
- 运行态数据放在 `.claude-gamekit/project/artifacts/`。

这个工具包把“给人看的文档”和“给机器读的产物”分开。这样更方便跨项目复用，也更适合低上下文模型继续接手。

## 为什么要星型拓扑

主会话是唯一协调者，subagent 之间不直接协商。

这样设计有几个实际好处：

- 避免多个 agent 互相拉扯，导致上下文污染。
- 职责边界清晰，容易审查。
- 交接物必须显式落盘，方便追踪。
- 对上下文较少的模型更友好，因为每个 agent 只处理一个很窄的任务。

## 为什么要 Asset ABI

占位资源只有在“后续人类美术可以安全替换”的前提下才有价值。Asset ABI 记录的就是研发依赖的契约：

- pivot 规则
- scale 规则
- socket 定义
- material slots
- collision 规则
- prefab 或 node 结构

有了这个契约，研发代码就可以依赖接口，而不是硬编码临时占位资源名称。这样模板在第一次 graybox 之后仍然可维护。

## 验证

请在宿主项目根目录运行：

```powershell
npm --prefix .claude-gamekit/core run validate
npm --prefix .claude-gamekit/core run test
node .claude-gamekit/core/scripts/verify/run.mjs --task active
```

这些命令的作用是：

- `validate` 检查模板结构、必需文件、schema 和 agent frontmatter。
- `test` 运行 Node 测试，验证 agent 合同和模板规则。
- `verify/run.mjs` 为当前活动任务和指定引擎生成结构化验证结果。

工具包还包含对 `.claude-gamekit/core/scripts/` 下可执行脚本的 smoke test。重点不是证明宿主项目一定能构建成功，而是证明工具包自己的入口、守卫和规划脚本始终可运行。

## 如何安装到其他仓库

把这三个入口复制到宿主项目根目录：

- `CLAUDE.md`
- `.claude/`
- `.claude-gamekit/`

如果宿主项目已经有 `.claude/settings.json`，就把工具包需要的 hooks 合并进去，不要覆盖原有设置。`gamekit-*` 的命令名和 agent 文件名也不要改，这样才能避免冲突。

不要重命名宿主项目自己的 `scripts/`、`docs/`、`tests/` 或引擎目录。这个工具包是并排存在的，不是来替代宿主项目目录结构的。

## 如何保持模板纯净

这个模板应该保持成骨架，而不是演示项目。

保持纯净的方法：

- 不要在 `project/artifacts/tasks/` 里预置活动任务。
- `project/docs/*/features/`、`cases/`、`reports/` 目录如果没有真实切片，就保持空目录。
- 占位资源目录只保留通用模板，不放具体项目示例。
- 能力矩阵保持最小但合法，不要写死某个 demo 的实现细节。
- 可复用的样例放到 `core/tests/fixtures/`，不要放进 project 运行态。

如果你真的要测试一个功能切片，就通过 `/gamekit-intake` 新建任务，让工作流主动生成它。

## 脚本 Smoke Test

这个工具包要求脚本在干净环境里也能跑通。测试会在隔离的临时工作区里执行 core 入口，避免修改真实仓库状态。

覆盖重点包括：

- 任务 intake 和激活
- 任务派发和 handoff
- 阶段切换
- 验证规划
- prompt、tool use 和 stop 相关守卫
- 模板结构校验

这类 smoke test 很重要，因为这个工具包本身就是可复制模板。如果脚本坏了，应该先被工具包自己的测试发现，而不是复制到别的仓库后才发现。

## 设计逻辑

工具包严格分成三类内容：

- `project/docs/` 里放给人看的项目知识
- `project/artifacts/` 里放结构化状态
- `core/` 里放可复用逻辑

这个分层是模板能够跨引擎、跨项目复用的基础。Unity 先做一套完整适配器，Godot、Web 和微信小游戏都复用同一套工作流契约。

## 相关文件

- `CLAUDE.md`
- `.claude/settings.json`
- `.claude/agents/*.md`
- `.claude/commands/*.md`
- `.claude-gamekit/core/scripts/`
- `.claude-gamekit/core/schemas/`
- `.claude-gamekit/project/docs/`
- `.claude-gamekit/project/artifacts/`

