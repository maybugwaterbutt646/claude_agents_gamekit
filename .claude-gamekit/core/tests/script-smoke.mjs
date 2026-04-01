import assert from "node:assert/strict";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import { readJson } from "../scripts/lib/common.mjs";
import { createIsolatedWorkspace, destroyIsolatedWorkspace, parseJsonOutput, runToolkitScript } from "./smoke-utils.mjs";

const ENGINES = ["unity", "godot", "web", "wechat-minigame"];

function workspacePath(workspaceRoot, ...segments) {
  return path.join(workspaceRoot, ...segments);
}

export async function runScriptSmoke() {
  const workspaceRoot = await createIsolatedWorkspace();

  try {
    const templateValidation = runToolkitScript("validate/validate-template.mjs", { workspaceRoot });
    assert.equal(templateValidation.status, 0, templateValidation.stderr);
    assert.match(templateValidation.stdout, /Template validation passed\./);

    const promptBlocked = runToolkitScript("gates/prompt-guard.mjs", {
      workspaceRoot,
      stdin: JSON.stringify({ prompt: "please implement this gameplay feature" })
    });
    assert.equal(promptBlocked.status, 0, promptBlocked.stderr);
    assert.equal(parseJsonOutput(promptBlocked.stdout, "prompt-guard block").decision, "block");

    const intake = runToolkitScript("tasks/intake.mjs", {
      workspaceRoot,
      args: ["Example clean template smoke"]
    });
    assert.equal(intake.status, 0, intake.stderr);
    const intakeResult = parseJsonOutput(intake.stdout, "intake");
    assert.equal(intakeResult.task_id, "task-example-clean-template-smoke");

    const activePointerAfterIntake = await readJson(
      workspacePath(workspaceRoot, ".claude-gamekit", "project", "artifacts", "tasks", "active-task.json")
    );
    assert.equal(activePointerAfterIntake.active_task_id, intakeResult.task_id);

    const promptContext = runToolkitScript("gates/prompt-guard.mjs", {
      workspaceRoot,
      stdin: JSON.stringify({ prompt: "describe the current active task" })
    });
    assert.equal(promptContext.status, 0, promptContext.stderr);
    const promptContextJson = parseJsonOutput(promptContext.stdout, "prompt-guard context");
    assert.match(promptContextJson.hookSpecificOutput.additionalContext, /Active task:/);
    assert.match(promptContextJson.hookSpecificOutput.additionalContext, /task-example-clean-template-smoke/);

    const taskPreflight = runToolkitScript("gates/task-preflight.mjs", {
      workspaceRoot,
      stdin: JSON.stringify({ tool_input: { command: "/gamekit-dispatch active" } })
    });
    assert.equal(taskPreflight.status, 0, taskPreflight.stderr);
    assert.match(parseJsonOutput(taskPreflight.stdout, "task-preflight").systemMessage, /Active task is task-example-clean-template-smoke/);

    const dispatch = runToolkitScript("tasks/dispatch.mjs", {
      workspaceRoot,
      args: ["active"]
    });
    assert.equal(dispatch.status, 0, dispatch.stderr);
    const dispatchResult = parseJsonOutput(dispatch.stdout, "dispatch");
    assert.equal(dispatchResult.task_id, intakeResult.task_id);
    assert.equal(dispatchResult.batch, "content");
    assert.ok(dispatchResult.work_items.length >= 4);

    const workItems = await readJson(
      workspacePath(workspaceRoot, ".claude-gamekit", "project", "artifacts", "work-items", `${intakeResult.task_id}-qa-design.json`)
    );
    assert.equal(workItems.agent, "gamekit-qa-verifier");

    const toolGuardBlocked = runToolkitScript("gates/tool-guard.mjs", {
      workspaceRoot,
      stdin: JSON.stringify({
        tool_name: "Bash",
        tool_input: { command: "git reset --hard" }
      })
    });
    assert.equal(toolGuardBlocked.status, 0, toolGuardBlocked.stderr);
    assert.equal(
      parseJsonOutput(toolGuardBlocked.stdout, "tool-guard block").hookSpecificOutput.permissionDecision,
      "deny"
    );

    const toolGuardAllowed = runToolkitScript("gates/tool-guard.mjs", {
      workspaceRoot,
      stdin: JSON.stringify({
        tool_name: "Write",
        tool_input: {
          file_path: workspacePath(
            workspaceRoot,
            ".claude-gamekit",
            "project",
            "docs",
            "planning",
            "features",
            "smoke-note.md"
          )
        }
      })
    });
    assert.equal(toolGuardAllowed.status, 0, toolGuardAllowed.stderr);

    const subagentStop = runToolkitScript("gates/subagent-stop.mjs", {
      workspaceRoot,
      stdin: JSON.stringify({
        tool_input: {
          message: "gamekit-placeholder-artist needs to update the asset catalog"
        }
      })
    });
    assert.equal(subagentStop.status, 0, subagentStop.stderr);
    assert.equal(subagentStop.stderr.trim(), "");

    const stopGuardBlocked = runToolkitScript("gates/stop-guard.mjs", {
      workspaceRoot,
      stdin: JSON.stringify({})
    });
    assert.equal(stopGuardBlocked.status, 0, stopGuardBlocked.stderr);
    assert.equal(parseJsonOutput(stopGuardBlocked.stdout, "stop-guard block").decision, "block");

    const handoff = runToolkitScript("tasks/handoff.mjs", {
      workspaceRoot,
      args: [
        "gamekit-feature-analyst",
        "gamekit-qa-verifier",
        "--summary",
        "Feature slice ready for QA design.",
        "--work",
        "smoke-handoff"
      ]
    });
    assert.equal(handoff.status, 0, handoff.stderr);
    const handoffResult = parseJsonOutput(handoff.stdout, "handoff");
    assert.match(handoffResult.handoff, /task-example-clean-template-smoke-smoke-handoff\.json$/);

    const setStage = runToolkitScript("tasks/set-stage.mjs", {
      workspaceRoot,
      args: ["active", "verification", "gamekit-qa-verifier", "active"]
    });
    assert.equal(setStage.status, 0, setStage.stderr);
    const setStageResult = parseJsonOutput(setStage.stdout, "set-stage");
    assert.equal(setStageResult.stage, "verification");
    assert.equal(setStageResult.owner, "gamekit-qa-verifier");

    const reportPath = workspacePath(
      workspaceRoot,
      ".claude-gamekit",
      "project",
      "docs",
      "qa",
      "reports",
      `${intakeResult.task_id}.md`
    );
    await mkdir(path.dirname(reportPath), { recursive: true });
    await writeFile(reportPath, "# QA Report\n\nSmoke verification for the clean template.\n");

    for (const engine of ENGINES) {
      const verify = runToolkitScript("verify/run.mjs", {
        workspaceRoot,
        args: ["--task", "active", "--engine", engine]
      });
      assert.equal(verify.status, 0, verify.stderr);
      const verifyResult = parseJsonOutput(verify.stdout, `verify/${engine}`);
      assert.equal(verifyResult.artifact, `.claude-gamekit/project/artifacts/verification/${intakeResult.task_id}-${engine}.json`);
      assert.ok(["blocked", "ci_required"].includes(verifyResult.result));
      const artifact = await readJson(
        workspacePath(
          workspaceRoot,
          ".claude-gamekit",
          "project",
          "artifacts",
          "verification",
          `${intakeResult.task_id}-${engine}.json`
        )
      );
      assert.equal(artifact.task_id, intakeResult.task_id);
      assert.equal(artifact.engine, engine);
    }

    const postWriteAudit = runToolkitScript("gates/post-write-audit.mjs", {
      workspaceRoot,
      stdin: JSON.stringify({
        tool_input: {
          file_path: reportPath
        }
      })
    });
    assert.equal(postWriteAudit.status, 0, postWriteAudit.stderr);
    const auditJson = parseJsonOutput(postWriteAudit.stdout, "post-write-audit");
    assert.match(auditJson.hookSpecificOutput.additionalContext, /human-facing doc was updated/);

    const stopGuardAllowed = runToolkitScript("gates/stop-guard.mjs", {
      workspaceRoot,
      stdin: JSON.stringify({})
    });
    assert.equal(stopGuardAllowed.status, 0, stopGuardAllowed.stderr);
    assert.equal(stopGuardAllowed.stdout.trim(), "");

    const close = runToolkitScript("tasks/close.mjs", {
      workspaceRoot,
      args: ["active"]
    });
    assert.equal(close.status, 0, close.stderr);
    const closeResult = parseJsonOutput(close.stdout, "close");
    assert.equal(closeResult.status, "done");

    const activePointerAfterClose = await readJson(
      workspacePath(workspaceRoot, ".claude-gamekit", "project", "artifacts", "tasks", "active-task.json")
    );
    assert.equal(activePointerAfterClose.active_task_id, null);
  } finally {
    await destroyIsolatedWorkspace(workspaceRoot);
  }
}
