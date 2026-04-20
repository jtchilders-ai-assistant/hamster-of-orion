# Current Task: ship-designer-logic

## Task ID
ship-designer-logic

## Name
Ship designer game logic

## Description
Implement ship design validation and cost calculation in src/game/. Reference design/ships/ship-design.md. Validate hull space, calculate costs, check tech requirements.

## Key References
- `design/ships/ship-design.md` — ship design spec, hull sizes, space formulas
- `src/data/components.json` — all ship components with size, cost, techLevel
- `src/game/types/shipComponents.ts` — component type definitions
- `src/game/state.ts` — ShipDesign type (if exists, or add it)

## Output
`src/game/systems/shipDesign.ts`

## Acceptance Criteria
1. `validateDesign(design: ShipDesign, techs: TechId[]): ValidationResult` — checks hull space limits
2. `calculateDesignCost(design: ShipDesign): number` — returns BC cost
3. `checkTechRequirements(design: ShipDesign, techs: TechId[]): boolean` — validates all components unlocked
4. No DOM imports in src/game/
5. Unit tests pass (test/game/systems/shipDesign.test.ts)

## Hull Sizes (from MOO1)
| Hull | Base Space | Base Cost |
|------|------------|-----------|
| Small | 25 | 6 |
| Medium | 100 | 36 |
| Large | 400 | 200 |
| Huge | 1600 | 1200 |

## Implementation Notes
- Import components from `src/data/components.json`
- Import types from `src/game/types/shipComponents.ts`
- If `ShipDesign` type doesn't exist in state.ts, add it:
  ```typescript
  interface ShipDesign {
    id: string;
    name: string;
    hullSize: 'small' | 'medium' | 'large' | 'huge';
    components: string[];  // component IDs from components.json
    autoRepair?: boolean;
    // computed fields:
    totalSpace: number;
    totalCost: number;
  }
  ```
- Consider miniaturization: components may be smaller based on tech level
- Use the component size and cost from components.json

## Tests Required
Create `test/game/systems/shipDesign.test.ts`:
- validateDesign returns valid for design within space limit
- validateDesign returns invalid with error for over-space design
- calculateDesignCost sums component costs + hull base cost
- checkTechRequirements returns true when all component techs unlocked
- checkTechRequirements returns false when missing required tech
- Edge cases: empty design, single component, max components

## Output on Completion
Update `workflow-state.json`:
```json
{
  "state": "TESTING",
  "current_task": "ship-designer-logic",
  "worker_output": {
    "files_created": ["src/game/systems/shipDesign.ts", "test/game/systems/shipDesign.test.ts"],
    "files_modified": ["src/game/state.ts"],
    "tests_added": ["test/game/systems/shipDesign.test.ts"],
    "summary": "..."
  }
}
```
