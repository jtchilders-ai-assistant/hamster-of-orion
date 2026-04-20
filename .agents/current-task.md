# Current Task: ship-components-data

## Task ID
ship-components-data

## Name
Ship components JSON data

## Description
Create comprehensive ship components JSON from design docs. Include weapons (design/technology/weapons.md), armor/shields (force-fields.md), engines (propulsion.md), computers, and specials. Each component needs: id, name, techLevel, size, cost, and type-specific stats.

## Key References
- `design/technology/weapons.md` — weapon stats, tech levels, damage values
- `design/technology/force-fields.md` — armor and shield types and stats
- `design/technology/propulsion.md` — engine types, warp and combat speeds
- `src/game/state.ts` — existing types (ShipComponent or similar)
- `design/ships/ship-design.md` — overall ship design spec (if it exists)

## Output
`src/data/components.json`

## Acceptance Criteria
1. All weapon types from weapons.md included (with damage, range, techLevel, size, cost)
2. All armor types with HP multipliers
3. All shield classes (I-XV) with deflection values
4. All engine types with warp speed and combat speed
5. All special systems (cloaking, scanner, colony ship module, etc.)
6. Valid JSON that TypeScript can import/validate; types must match what state.ts or ship design expects

## Implementation Notes
- If `ShipComponent` type doesn't exist in `src/game/state.ts`, define it in `src/game/state.ts` or a new `src/game/types/shipComponents.ts`
- The JSON structure should match the TypeScript type exactly so it can be imported with a type assertion
- Organize by category: weapons, armor, shields, engines, specials
- Include a top-level schema: `{ version: 1, components: ShipComponent[] }`
- If design docs don't exist for a category, use canonical MOO1 values from memory (this is a Masters of Orion 1 clone)

## Tests Required
Create `test/data/components.test.ts`:
- Validate JSON loads without errors
- Assert all expected categories are present and non-empty
- Assert required fields (id, name, techLevel, size, cost) present on every component
- Assert at least one component per category (weapon, armor, shield, engine)
- Assert all techLevels are integers 1-10
- Assert no duplicate IDs

## Output on Completion
Update `workflow-state.json`:
```json
{
  "state": "TESTING",
  "current_task": "ship-components-data",
  "worker_output": {
    "files_created": ["src/data/components.json", "..."],
    "files_modified": ["..."],
    "tests_added": ["test/data/components.test.ts"],
    "summary": "..."
  }
}
```
