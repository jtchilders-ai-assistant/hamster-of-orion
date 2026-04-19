# Current Task: turn-system

## Task ID
turn-system

## Name
Turn processing system

## Description
Implement the turn processing loop as described in design/technical/development-roadmap.md and the data structures in design/technical/data-structures.md.

## Output
Primary output: `src/game/systems/turn.ts`

## Acceptance Criteria
- `nextTurn()` advances game state (increments turn counter, updates year)
- Calls production, growth, and research systems (stub/delegate calls are fine since those systems are pending — use no-op stubs that can be replaced)
- Unit tests pass

## What to Implement

### Turn System Architecture
Create `src/game/systems/turn.ts` with a `processTurn(state: GameState): GameState` function that:

1. Increments `state.meta.turn` by 1
2. Updates `state.meta.year` to `2500 + turn`
3. Calls (stub) production processing per planet
4. Calls (stub) population growth per planet
5. Calls (stub) research processing per empire
6. Returns the updated state

Also create a Redux-style action in `src/game/actions/turn.ts`:
- `nextTurn()` action creator returning `{ type: 'NEXT_TURN' }`
- A `turnReducer(state, action)` that calls `processTurn` when action type is `NEXT_TURN`

### Integration with Store
Wire the reducer into the store (check how existing reducers are registered in `src/game/store.ts`).

### Tests
Create `test/game/systems/turn.test.ts` with tests covering:
- `processTurn` increments turn counter
- `processTurn` correctly updates year (2500 + turn)
- Multiple consecutive turns work correctly
- Action `nextTurn()` dispatched to the store advances turn
- State is not mutated (immutability check)

## Reference Files
- `design/technical/data-structures.md` — GameState, Planet, Empire types
- `design/technical/development-roadmap.md` — Turn cycle overview
- `src/game/state.ts` — Existing type definitions
- `src/game/store.ts` — Store class and existing reducers
- `src/game/systems/races.ts` — Example of existing system implementation
- `test/game/systems/races.test.ts` — Example of existing test style

## Notes
- Keep production/growth/research as stub calls (e.g., `processProduction(state)` that returns state unchanged) — those will be implemented in subsequent tasks
- No DOM imports — pure TypeScript only
- No `any` types
- Run `npm run typecheck && npm run test` before marking complete
