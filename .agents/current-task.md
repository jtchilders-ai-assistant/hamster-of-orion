# Current Task: galaxy-generation

## Task ID
galaxy-generation

## Name
Galaxy generation system

## Description
Implement galaxy generation per design/galaxy/generation-algorithm.md

## Primary Output
`src/game/generators/galaxy.ts`

## Dependencies (all done)
- game-state-types ✅

## Acceptance Criteria
- Generates stars with correct distribution
- Assigns planets with environment types
- Places homeworlds for all races
- Unit tests pass

## Key Design Files to Read
- design/galaxy/generation-algorithm.md
- design/galaxy/star-systems.md
- design/galaxy/map-generation.md
- src/game/state.ts (for types)
- src/game/initialState.ts (for reference)

## Notes
- No DOM imports in src/game/
- No `any` types
- All logic must be pure functions (no side effects)
- Write unit tests alongside implementation
