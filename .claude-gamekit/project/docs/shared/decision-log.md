# Decision Log

- Keep placeholder authoring and Asset ABI authoring split between `gamekit-placeholder-artist` and `gamekit-tech-art-contracts`.
- Keep runtime state in `.claude-gamekit/project/artifacts/`, not in `CLAUDE.md`.
- Prefer parallel subagent batches only when write scopes are disjoint.
- Use Unity as the first full adapter. Other engines reuse the same contracts and workflow.
