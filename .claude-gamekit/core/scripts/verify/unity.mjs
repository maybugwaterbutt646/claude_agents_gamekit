export function planUnityVerification(capability, workspaceFound) {
  const checks = ["static_audit", ...capability.ci_required.slice(0, 2)];

  if (!workspaceFound) {
    return {
      result: capability.local_run === "conditional" ? "ci_required" : "blocked",
      blocked_reason: "No Unity project markers were found in the current workspace.",
      checks_run: ["static_audit", "contract_validation"]
    };
  }

  return {
    result: capability.local_run === "available" ? "blocked" : "ci_required",
    blocked_reason: "Unity verification needs Editor or CI execution beyond this template scaffold.",
    checks_run: checks
  };
}