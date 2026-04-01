export function planWebVerification(capability, workspaceFound) {
  if (!workspaceFound) {
    return {
      result: "blocked",
      blocked_reason: "No web package markers were found in the current workspace.",
      checks_run: ["static_audit"]
    };
  }

  return {
    result: "blocked",
    blocked_reason: "Web verification needs a concrete app entrypoint and browser smoke target.",
    checks_run: ["static_audit", ...capability.ci_required]
  };
}