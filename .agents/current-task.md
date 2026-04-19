# Current Task: race-data

## Task ID
race-data

## Name
Race data and bonuses

## Description
Implement race definitions per design/species/race-stats-complete.md

## Primary Output
`src/data/races.json` and `src/game/systems/races.ts`

## Dependencies (all done)
- game-state-types ✅

## Acceptance Criteria
- All 10 races defined with correct bonuses
- Field research bonuses implemented
- Special abilities defined

## Key Design Files to Read
- design/species/race-stats-complete.md
- design/species/race-overview.md (if it exists)
- src/game/state.ts (for Race-related types)

## Notes
- No DOM imports in src/game/
- No `any` types
- All logic must be pure functions (no side effects)
- Write unit tests for bonus calculations in src/game/systems/races.ts
- races.json should contain the static race data
- races.ts should contain logic for applying race bonuses
