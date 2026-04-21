# Current Task: Colonization flow UI

**ID**: colonization-ui
**Type**: ui
**Output**: src/ui/screens/GalaxyScreen.ts (colonization)

## Description
Add colonization UI flow. Colony ships in orbit at uncolonized habitable planets show 'Colonize' button. Clicking triggers colonization and opens planet management.

## Design Documents (MUST READ)
- design/planets/colonization.md — **FILE NOT FOUND** (see note below)
- design/ui-ux/wireframes/galaxy-map.md — Info panel State 3 (Uncolonized Planet) shows "Requires: Colony Ship"
- design/planets/planet-types.md — Colonization requirements: standard environments need colony ship, hostile environments need Controlled [Environment] tech

**NOTE**: The primary design doc `design/planets/colonization.md` does not exist. Use the following sources for colonization mechanics:
1. **galaxy-map.md** State 3: Shows uncolonized planet panel with "Requires: Colony Ship"
2. **planet-types.md**: Standard environments colonizable from game start; hostile require Planetology tech
3. **Acceptance criteria below** define the UI requirements

## Acceptance Criteria
1. Colony ship at uncolonized planet shows Colonize button
2. Colonize button triggers colonization action
3. New colony appears on map with empire color
4. Planet management screen opens after colonization
5. Colony ship is consumed
6. Cannot colonize hostile planets without tech

## Dependencies
- None (no blocking dependencies)

## Implementation Notes
- The Colonize button should appear in the info panel when:
  - A colony ship belonging to the player is orbiting a star
  - The star has an uncolonized habitable planet
  - The player has the required tech for hostile environments (if applicable)
- On click: consume the colony ship, create a new colony, update the map rendering, and navigate to planet management screen
- Check planet environment type and player's Planetology tech for hostile planet colonization
