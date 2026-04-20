# Current Task: fleet-ui

## Task ID
fleet-ui

## Name
Fleet management UI

## Description
Fleet screen showing all fleets, their composition, destinations. Allow selecting fleet and setting destination on galaxy map.

## Key References
- `src/game/systems/fleet.ts` — fleet movement functions
- `src/game/state.ts` — Fleet interface
- `src/ui/screens/FleetsScreen.ts` — existing stub to replace

## Output
`src/ui/screens/FleetsScreen.ts` (replace stub)

## Acceptance Criteria
1. Lists all player fleets with location (star name)
2. Shows ship counts per fleet
3. Shows destination and ETA if moving
4. Can select fleet on galaxy map (highlight fleet icon)
5. Right-click destination sends fleet (calls moveFleet)

## UI Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  FLEETS                                                          │
├──────────────────────────────────────────────────────────────────┤
│  Fleet Name       Location        Ships   Destination    ETA    │
│  ─────────────────────────────────────────────────────────────── │
│  [>] Alpha Fleet  Sol             12      --             --     │
│      Beta Fleet   Proxima         5       Alpha Centauri 3 turns│
│      Gamma Fleet  Vega            8       --             --     │
│                                                                  │
│  [Selected Fleet Details]                                        │
│  Alpha Fleet at Sol                                              │
│  Ships: 4× Scout, 6× Frigate, 2× Cruiser                        │
│                                                                  │
│  [Merge] [Split] [Scrap]                                        │
└──────────────────────────────────────────────────────────────────┘
```

## Interactions
- Click fleet row to select
- Selected fleet is highlighted on galaxy map
- Right-click star on galaxy map → move selected fleet there
- Merge button: combine selected fleet with another at same location
- Split button: select ships to move to new fleet
- Scrap button: disband fleet and remove ships

## Tests Required
This is a UI task — manual testing via browser. No automated tests required.
However, ensure:
- TypeScript compiles without errors
- No DOM leaks (event listeners cleaned up)
- Integrates with existing App routing

## Output on Completion
Update `workflow-state.json`:
```json
{
  "state": "TESTING",
  "current_task": "fleet-ui",
  "worker_output": {
    "files_created": [],
    "files_modified": ["src/ui/screens/FleetsScreen.ts"],
    "tests_added": [],
    "summary": "..."
  }
}
```
