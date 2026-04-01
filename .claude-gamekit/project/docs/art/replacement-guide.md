# Replacement Guide

Use this guide when a placeholder asset must be replaced by a final production asset.

## Workflow

1. Locate the matching AssetContract artifact for the asset.
2. Verify that the replacement keeps the required pivot, scale, socket, material slot, and collision rules.
3. Update the implementation only after the contract is understood and approved.
4. Record any approved exception in `docs/shared/decision-log.md`.

## What to Preserve

- `pivot_rule`
- `scale_rule`
- `socket_defs`
- `material_slots`
- `collision_rule`
- `prefab_or_node_shape`

## What to Check

- The replacement still fits the intended gameplay interaction.
- The replacement does not break existing references in scenes or prefabs.
- The replacement can be swapped without renaming unrelated runtime code.
- The replacement keeps any required editor or engine verification passing.

## Notes For Artists

- This document describes process, not asset content.
- Keep placeholder-specific details in the asset catalog and the AssetContract artifact.
- If the replacement requires a contract change, update the contract first and then perform the swap.
