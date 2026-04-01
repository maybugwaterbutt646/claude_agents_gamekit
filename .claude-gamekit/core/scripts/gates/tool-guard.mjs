import path from "node:path";
import { PROJECT_ROOT, loadActivePointer, printJson, readStdinJson } from "../lib/common.mjs";

const payload = await readStdinJson();
const pointer = await loadActivePointer();
const activeTaskId = pointer.active_task_id;
const toolName = payload.tool_name || "";
const toolInput = payload.tool_input || {};

function deny(reason) {
  printJson({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason
    }
  });
}

if (!activeTaskId) {
  if (toolName === "Bash") {
    const command = toolInput.command || "";
    const allowlisted = [
      ".claude-gamekit/core/scripts/tasks/intake.mjs",
      ".claude-gamekit/core/scripts/validate/",
      "npm --prefix .claude-gamekit/core run validate",
      "npm --prefix .claude-gamekit/core run test"
    ].some((marker) => command.includes(marker));

    if (allowlisted) {
      process.exit(0);
    }
  }

  deny("No active task is set. Only intake and read-only validation commands may mutate project state without an active task.");
  process.exit(0);
}

if (["Write", "Edit", "MultiEdit"].includes(toolName)) {
  const candidatePath = toolInput.file_path || toolInput.path || "";
  if (candidatePath) {
    const absolute = path.resolve(candidatePath);
    const relative = path.relative(PROJECT_ROOT, absolute);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      deny(`Refusing to modify a path outside the project root: ${candidatePath}`);
      process.exit(0);
    }
  }
}

if (toolName === "Bash") {
  const command = (toolInput.command || "").toLowerCase();
  const dangerous = ["rm -rf", "del /s", "git reset --hard", "format c:"];
  if (dangerous.some((marker) => command.includes(marker))) {
    deny("Refusing to run a destructive shell command from the template workflow.");
    process.exit(0);
  }
}
