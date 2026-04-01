import path from "node:path";
import { PROJECT_ROOT, printJson, readStdinJson, toPortablePath } from "../lib/common.mjs";

const payload = await readStdinJson();
const toolInput = payload.tool_input || {};
const candidatePath = toolInput.file_path || toolInput.path || "";

if (!candidatePath) {
  process.exit(0);
}

const absolute = path.resolve(candidatePath);
const relative = toPortablePath(path.relative(PROJECT_ROOT, absolute));

if (relative.startsWith(".claude-gamekit/project/docs/")) {
  printJson({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: `A human-facing doc was updated at ${relative}. Confirm whether a matching structured artifact under .claude-gamekit/project/artifacts/ also needs to be updated.`
    }
  });
}
