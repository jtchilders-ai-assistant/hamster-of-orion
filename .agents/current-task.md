# Current Task: Fleet movement UI on galaxy map

**ID**: fleet-movement-ui
**Type**: ui
**Output**: src/ui/screens/GalaxyScreen.ts (fleet controls)

## Description
Add fleet movement controls to galaxy map. Click fleet to select, click destination star to issue move order. Show movement range, ETA, and path. Fleets in transit should render between stars.

## Design Documents (MUST READ)
- `design/ui-ux/wireframes/galaxy-map.md` — layout, fleet rendering, click interactions
- `design/ui-ux/wireframes/fleet-management.md` — fleet selection, movement orders
- `design/ships/movement.md` — movement range calculation, ETA formulas, warp speed

## Acceptance Criteria
1. Click fleet icon to select it
2. Selected fleet shows movement range circle
3. Click destination star to issue move order
4. Path line shows route to destination
5. ETA displayed in turns
6. Fleets in transit render along path
7. Cancel movement button works

## Dependencies
- None (first task of Phase 4B)
