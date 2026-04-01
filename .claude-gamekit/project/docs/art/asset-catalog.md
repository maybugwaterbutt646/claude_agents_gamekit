# Asset Catalog

Use this document to track placeholder assets for the current project slice.

## Purpose

- Keep placeholder naming stable once a slice references it.
- Record enough detail for gameplay code to depend on the placeholder safely.
- Move implementation-specific replacement rules into an AssetContract artifact when needed.

## Recommended Entry Shape

| asset_id | type | purpose | placeholder_path | owner | notes |
| --- | --- | --- | --- | --- | --- |
| `<asset-id>` | `Prefab` / `Mesh` / `Material` / `Texture` / `AudioClip` / other | What the asset is used for | Relative path in the host project | Agent or human owner | Short implementation notes |

## Placeholder Rules

- Prefer graybox or primitive placeholders for early slices.
- Keep names and hierarchy stable after the first reference.
- Record pivots, sockets, materials, and collision behavior in the AssetContract artifact, not here.
- If a placeholder is temporary, mark it clearly in the notes column.

## Maintenance

- Add one row per reusable placeholder asset.
- Remove rows only when the placeholder is no longer referenced by any active feature spec.
- Avoid per-feature writeups in this document; keep feature detail in the feature spec and ABI artifacts.
