# Current Task: combat-ui

## Task ID
combat-ui

## Name
Tactical combat UI

## Type
ui

## Description
Combat screen with hex grid, ship positions, firing. Auto-resolve button + manual controls.

## Output
src/ui/screens/CombatScreen.ts

## Acceptance Criteria
- Hex grid renders
- Ships displayed at positions
- Auto-resolve button runs combat to completion
- Shows combat log/results
- Return to galaxy map after combat

## Dependencies (all done)
- combat-engine ✓

## Reference Files
- src/game/systems/combat.ts (the combat engine to call)
- src/ui/screens/ (other screen examples for patterns)
- design/ships/combat-algorithm.md
