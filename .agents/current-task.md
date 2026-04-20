# Current Task: ship-construction

## Task ID
ship-construction

## Name
Ship construction system

## Description
Add ship construction to production system. When SHIP slider > 0, accumulate BC toward current ship design. When complete, spawn ship at planet. Reference design/economy/ship-costs.md if it exists.

## Key References
- `src/game/systems/shipDesign.ts` — calculateDesignCost() for ship costs
- `src/game/systems/production.ts` — existing production system
- `src/game/state.ts` — GameState, Planet, Fleet types
- `design/economy/slider-mathematics.md` — SHIP slider allocation

## Output
- `src/game/systems/shipConstruction.ts`
- `src/game/actions/ship.ts`

## Acceptance Criteria
1. SHIP slider allocates production to shipyard (use existing SHIP allocation from production)
2. Progress accumulates across turns (carry over fractional BC)
3. Ship spawns when cost met (create ship entity)
4. Ship added to planet's local fleet (or create new fleet if none exists)
5. Unit tests pass — no DOM imports in src/game/

## Implementation Notes
- Each planet should track: `currentDesignId`, `shipyardProgress` (BC accumulated)
- When `shipyardProgress >= designCost`, spawn ship and reset progress (with overflow carry-over)
- Need a `Ship` interface in state.ts if it doesn't exist:
  ```typescript
  interface Ship {
    id: string;
    designId: string;
    hp: number;
    maxHp: number;
  }
  ```
- Need to add ships to Fleet. Fleet should have `ships: Ship[]`
- Wire into turn processing: after production calculates SHIP BC, add to shipyardProgress

## Tests Required
Create `test/game/systems/shipConstruction.test.ts`:
- Accumulates BC from SHIP allocation across turns
- Spawns ship when progress >= cost
- Overflow carries to next ship
- Ship has correct HP based on design
- Ship added to planet's fleet
- No ship spawned if no design selected
- Multiple ships if enough production

## Output on Completion
Update `workflow-state.json`:
```json
{
  "state": "TESTING",
  "current_task": "ship-construction",
  "worker_output": {
    "files_created": ["src/game/systems/shipConstruction.ts", "src/game/actions/ship.ts", "test/game/systems/shipConstruction.test.ts"],
    "files_modified": ["src/game/state.ts"],
    "tests_added": ["test/game/systems/shipConstruction.test.ts"],
    "summary": "..."
  }
}
```
