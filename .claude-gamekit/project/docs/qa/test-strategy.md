# Test Strategy

1. `gamekit-feature-analyst` writes acceptance criteria during spec.
2. `gamekit-qa-verifier` turns acceptance criteria into `TestCaseSpec` before implementation.
3. `gamekit-gameplay-engineer` adds white-box checks or smoke coverage during implementation when practical.
4. `gamekit-qa-verifier` captures black-box, integration, and regression evidence after implementation.

Required outputs:

- `.claude-gamekit/project/docs/qa/cases/<feature-id>.md`
- `.claude-gamekit/project/docs/qa/reports/<task-id>.md`
- `.claude-gamekit/project/artifacts/verification/<task-id>-<engine>.json`
