# Current Task: colonization

## Task ID
colonization

## Name
Colony ship and colonization

## Description
Colony ship special: when fleet with colony ship reaches uncolonized habitable planet, option to colonize. Colony ship consumed, planet becomes colony.

## Key References
- `src/game/systems/fleet.ts` — fleet movement
- `src/game/state.ts` — Planet, Colony interfaces
- `src/data/components.json` — colony_ship component

## Output
`src/game/systems/colonization.ts`

## Acceptance Criteria
1. Colony Ship is special component type (already in components.json as 'colony_base')
2. Fleet arriving at uncolonized planet with colony ship → colonize option triggers
3. Colonizing consumes the colony ship (removes it from fleet)
4. New colony has starting population (10) and factories (0)
5. Planet added to empire (ownerId set)
6. Unit tests pass — no DOM imports

## Colonization Logic
```typescript
function canColonize(fleet: Fleet, planet: Planet, state: GameState): boolean {
  // Fleet must be at planet's system
  // Planet must be uncolonized (ownerId === null)
  // Planet must be habitable (not gas_giant, dead, etc.)
  // Fleet must have a ship with colony_base component
  return ...;
}

function colonize(fleetId: FleetId, planetId: PlanetId, state: GameState): GameState {
  // Find colony ship in fleet
  // Remove colony ship from fleet
  // Create colony on planet
  // Set planet.ownerId
  // Initialize population, factories
  return ...;
}
```

## Starting Colony Stats
- Population: 10 (or race starting pop from races.json)
- Factories: 0
- Pollution: 0
- Morale: 'content'
- Production sliders: balanced (20/20/20/20/20)

## Tests Required
Create `test/game/systems/colonization.test.ts`:
- canColonize returns true when all conditions met
- canColonize returns false if no colony ship
- canColonize returns false if planet already colonized
- canColonize returns false if planet is gas giant
- colonize sets planet ownerId
- colonize removes colony ship from fleet
- colonize initializes population and factories
- colonize handles fleet with only colony ship (fleet removed)

## Output on Completion
Update `workflow-state.json`:
```json
{
  "state": "TESTING",
  "current_task": "colonization",
  "worker_output": {
    "files_created": ["src/game/systems/colonization.ts", "test/game/systems/colonization.test.ts"],
    "files_modified": [],
    "tests_added": ["test/game/systems/colonization.test.ts"],
    "summary": "..."
  }
}
```
