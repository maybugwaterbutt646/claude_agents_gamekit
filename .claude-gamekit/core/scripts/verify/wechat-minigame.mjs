export function planWechatVerification(capability, workspaceFound) {
  if (!workspaceFound) {
    return {
      result: "ci_required",
      blocked_reason: "No WeChat Mini Game project markers were found in the current workspace.",
      checks_run: ["static_audit"]
    };
  }

  return {
    result: "ci_required",
    blocked_reason: "WeChat Mini Game verification usually depends on DevTools or CI tooling not bundled with this scaffold.",
    checks_run: ["static_audit", ...capability.ci_required]
  };
}