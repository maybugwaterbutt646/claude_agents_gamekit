import {
  loadTask,
  nowIso,
  portableJoin,
  relativeToProjectRoot,
  saveTask,
  saveWorkItem,
  workItemPath
} from "../lib/common.mjs";

function getArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function inferBatch(task) {
  if (task.stage === "verification") {
    return "verification";
  }
  if (task.stage === "implementation" || task.stage === "integration") {
    return "implementation";
  }
  return "content";
}

function engineIntegrator(engine) {
  switch (engine) {
    case "unity":
      return "gamekit-unity-integrator";
    case "godot":
      return "gamekit-godot-integrator";
    case "web":
      return "gamekit-web-integrator";
    case "wechat-minigame":
      return "gamekit-wechat-integrator";
    default:
      return "gamekit-unity-integrator";
  }
}

function contentBatch(task) {
  const featureDoc = portableJoin(".claude-gamekit", "project", "docs", "planning", "features", `${task.feature_id}.md`);
  const featureCases = portableJoin(".claude-gamekit", "project", "docs", "qa", "cases", `${task.feature_id}.md`);
  return [
    {
      work_id: `${task.task_id}-qa-design`,
      task_id: task.task_id,
      agent: "gamekit-qa-verifier",
      goal: `Turn acceptance criteria for ${task.feature_id} into executable QA cases before implementation starts.`,
      write_scope: [
        portableJoin(".claude-gamekit", "project", "docs", "qa"),
        portableJoin(".claude-gamekit", "project", "artifacts", "verification")
      ],
      read_scope: [featureDoc],
      depends_on: [],
      outputs: [featureCases],
      status: "pending"
    },
    {
      work_id: `${task.task_id}-placeholder-assets`,
      task_id: task.task_id,
      agent: "gamekit-placeholder-artist",
      goal: `Update the placeholder asset catalog for ${task.feature_id} using modular graybox resources.`,
      write_scope: [portableJoin(".claude-gamekit", "project", "docs", "art", "asset-catalog.md")],
      read_scope: [featureDoc],
      depends_on: [],
      outputs: [portableJoin(".claude-gamekit", "project", "docs", "art", "asset-catalog.md")],
      status: "pending"
    },
    {
      work_id: `${task.task_id}-asset-contracts`,
      task_id: task.task_id,
      agent: "gamekit-tech-art-contracts",
      goal: `Define Asset ABI contracts and replacement guidance for ${task.feature_id}.`,
      write_scope: [
        portableJoin(".claude-gamekit", "project", "docs", "art", "replacement-guide.md"),
        portableJoin(".claude-gamekit", "project", "artifacts", "assets")
      ],
      read_scope: [featureDoc],
      depends_on: [],
      outputs: [
        portableJoin(".claude-gamekit", "project", "docs", "art", "replacement-guide.md"),
        portableJoin(".claude-gamekit", "project", "artifacts", "assets")
      ],
      status: "pending"
    },
    {
      work_id: `${task.task_id}-${task.engine}-integration-prep`,
      task_id: task.task_id,
      agent: engineIntegrator(task.engine),
      goal: `Prepare ${task.engine} integration notes and capability updates for ${task.feature_id}.`,
      write_scope: [
        portableJoin(".claude-gamekit", "project", "docs", "engineering"),
        portableJoin(".claude-gamekit", "project", "artifacts", "capabilities")
      ],
      read_scope: [featureDoc],
      depends_on: [],
      outputs: [
        portableJoin(".claude-gamekit", "project", "docs", "engineering", "features", `${task.feature_id}.md`),
        portableJoin(".claude-gamekit", "project", "artifacts", "capabilities", `${task.engine}.json`)
      ],
      status: "pending"
    }
  ];
}

function implementationBatch(task) {
  return [
    {
      work_id: `${task.task_id}-gameplay-impl`,
      task_id: task.task_id,
      agent: "gamekit-gameplay-engineer",
      goal: `Implement ${task.feature_id} against the approved feature spec, asset ABI, and QA cases.`,
      write_scope: [
        "<host-project-code-path>",
        portableJoin(".claude-gamekit", "project", "docs", "engineering", "features")
      ],
      read_scope: [
        portableJoin(".claude-gamekit", "project", "docs", "planning", "features", `${task.feature_id}.md`),
        portableJoin(".claude-gamekit", "project", "docs", "qa", "cases", `${task.feature_id}.md`),
        portableJoin(".claude-gamekit", "project", "artifacts", "assets")
      ],
      depends_on: [],
      outputs: ["<host-project-code-path>"],
      status: "pending"
    },
    {
      work_id: `${task.task_id}-${task.engine}-integration`,
      task_id: task.task_id,
      agent: engineIntegrator(task.engine),
      goal: `Finish ${task.engine} integration notes, platform hooks, and capability evidence for ${task.feature_id}.`,
      write_scope: [
        portableJoin(".claude-gamekit", "project", "docs", "engineering"),
        portableJoin(".claude-gamekit", "project", "artifacts", "capabilities")
      ],
      read_scope: [
        portableJoin(".claude-gamekit", "project", "docs", "planning", "features", `${task.feature_id}.md`),
        portableJoin(".claude-gamekit", "project", "artifacts", "assets")
      ],
      depends_on: [],
      outputs: [
        portableJoin(".claude-gamekit", "project", "docs", "engineering", "features", `${task.feature_id}.md`),
        portableJoin(".claude-gamekit", "project", "artifacts", "capabilities", `${task.engine}.json`)
      ],
      status: "pending"
    }
  ];
}

function verificationBatch(task) {
  return [
    {
      work_id: `${task.task_id}-verification`,
      task_id: task.task_id,
      agent: "gamekit-qa-verifier",
      goal: `Execute verification for ${task.feature_id} and collect evidence for ${task.engine}.`,
      write_scope: [
        portableJoin(".claude-gamekit", "project", "docs", "qa"),
        portableJoin(".claude-gamekit", "project", "artifacts", "verification")
      ],
      read_scope: [
        portableJoin(".claude-gamekit", "project", "docs", "planning", "features", `${task.feature_id}.md`),
        portableJoin(".claude-gamekit", "project", "docs", "qa", "cases", `${task.feature_id}.md`)
      ],
      depends_on: [],
      outputs: [
        portableJoin(".claude-gamekit", "project", "docs", "qa", "reports", `${task.task_id}.md`),
        portableJoin(".claude-gamekit", "project", "artifacts", "verification", `${task.task_id}-${task.engine}.json`)
      ],
      status: "pending"
    },
    {
      work_id: `${task.task_id}-${task.engine}-verification-evidence`,
      task_id: task.task_id,
      agent: engineIntegrator(task.engine),
      goal: `Provide ${task.engine} specific verification evidence and capability notes for ${task.feature_id}.`,
      write_scope: [
        portableJoin(".claude-gamekit", "project", "docs", "engineering"),
        portableJoin(".claude-gamekit", "project", "artifacts", "capabilities")
      ],
      read_scope: [portableJoin(".claude-gamekit", "project", "docs", "qa", "cases", `${task.feature_id}.md`)],
      depends_on: [],
      outputs: [portableJoin(".claude-gamekit", "project", "artifacts", "capabilities", `${task.engine}.json`)],
      status: "pending"
    }
  ];
}

const [, , taskRef = "active"] = process.argv;
const batch = getArg("--batch");
const task = await loadTask(taskRef);
const resolvedBatch = batch || inferBatch(task);

let workItems;
switch (resolvedBatch) {
  case "content":
    workItems = contentBatch(task);
    break;
  case "implementation":
    workItems = implementationBatch(task);
    break;
  case "verification":
    workItems = verificationBatch(task);
    break;
  default:
    process.stderr.write(`Unsupported dispatch batch: ${resolvedBatch}\n`);
    process.exit(1);
}

for (const workItem of workItems) {
  await saveWorkItem({
    ...workItem,
    created_at: nowIso(),
    updated_at: nowIso()
  });
}

task.stage = resolvedBatch === "content" ? "dispatch" : task.stage;
task.updated_at = nowIso();
await saveTask(task);

process.stdout.write(`${JSON.stringify({
  task_id: task.task_id,
  batch: resolvedBatch,
  work_items: workItems.map((item) => relativeToProjectRoot(workItemPath(item.work_id)))
}, null, 2)}\n`);
