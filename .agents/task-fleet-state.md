# Current Task: fleet-state

## Task ID
fleet-state

## Name
Fleet state and actions

## Description
Expand fleet state management. Fleets contain ships, have location, destination, ETA. Actions for move, merge, split, scrap.

## Key References
- `src/game/state.ts` — Fleet, Ship interfaces
- `src/game/systems/shipConstruction.ts` — how ships are added to fleets
- `src/game/types/shipComponents.ts` — component types for engine lookup

## Output
- `src/game/systems/fleet.ts` (expand or create)
- `src/game/actions/fleet.ts` (expand or create)

## Acceptance Criteria
1. Fleet has `ships[]`, `location`, `destination`, `eta`
2. `moveFleet(fleetId, destinationId)` sets destination and calculates ETA based on slowest ship engine speed
3. Turn processing moves fleets toward destination (reduce eta, update location when eta=0)
4. `mergeFleets(fleetId1, fleetId2)` combines two fleets at same location
5. `splitFleet(fleetId, shipIds)` divides ships into new fleet
6. Unit tests pass — no DOM imports

## Fleet State Updates
```typescript
interface Fleet {
  id: string;
  empireId: string;
  ships: Ship[];
  location: string;       // starId where fleet is stationed
  destination: string | null;  // starId if moving
  eta: number;            // turns until arrival (0 = not moving)
}
```

## Movement Logic
- ETA = distance / warpSpeed of slowest ship
- Each turn: if destination set, eta--; if eta reaches 0, location = destination, destination = null
- Distance = sqrt((x2-x1)² + (y2-y1)²) using star coordinates

## Tests Required
Create `test/game/systems/fleet.test.ts`:
- moveFleet sets destination and calculates correct ETA
- Fleet arrives at destination when ETA reaches 0
- mergeFleets combines ship lists, removes source fleet
- splitFleet creates new fleet with selected ships
- Cannot merge fleets at different locations
- Cannot move to current location
- ETA rounds up (always whole turns)

## Output on Completion
Update `workflow-state.json`:
```json
{
  "state": "TESTING",
  "current_task": "fleet-state",
  "worker_output": {
    "files_created": ["src/game/systems/fleet.ts", "src/game/actions/fleet.ts", "test/game/systems/fleet.test.ts"],
    "files_modified": ["src/game/state.ts"],
    "tests_added": ["test/game/systems/fleet.test.ts"],
    "summary": "..."
  }
}
```
