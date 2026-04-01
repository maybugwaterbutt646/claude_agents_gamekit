export function planGodotVerification(capability, workspaceFound) {
  if (!workspaceFound) {
    return {
      result: "blocked",
      blocked_reason: "No Godot project markers were found in the current workspace.",
      checks_run: ["static_audit"]
    };
  }

  return {
    result: capability.headless_run === "available" ? "blocked" : "ci_required",
    blocked_reason: "Godot verification scaffold is ready, but a concrete project and scene entrypoint are required.",
    checks_run: ["static_audit", ...capability.ci_required]
  };
}