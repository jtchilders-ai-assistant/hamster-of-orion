# Current Task: Playable demo integration test

**ID**: playable-demo-test
**Type**: test
**Output**: test/integration/full-game.test.ts

## Description
Create end-to-end integration test that plays through a game: new game, colonize, build ships, combat, diplomacy, victory. Verifies all systems integrate correctly.

## Design Documents (MUST READ)
- `design/game-mechanics/turn-structure.md` — Turn phases, order of operations, turn counter starts at Year 2623
- `design/game-mechanics/victory-conditions.md` — Council Election (2/3 vote) and Military Conquest (eliminate all races)

## Acceptance Criteria
1. Test creates new game with 2 empires
2. Advances 50+ turns without errors
3. Player colonizes at least 3 planets
4. Player builds ships and fleet
5. Combat occurs between fleets
6. Diplomacy interactions happen
7. Game ends with victory condition

## Dependencies
- fleet-movement-ui ✓ (completed)
- combat-resolution-ui ✓ (completed)
- colonization-ui ✓ (completed)
