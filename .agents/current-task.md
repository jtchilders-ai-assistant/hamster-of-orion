# Current Task: integration-test

## Task Details
- **ID:** integration-test
- **Name:** Integration test: full game loop
- **Type:** test
- **Output:** test/integration/game-loop.test.ts

## Description
End-to-end test of starting game and playing turns. Write integration tests that exercise the full game loop through the game logic layer (pure functions, no DOM).

## Acceptance Criteria
1. Can start new game
2. Can click Next Turn multiple times
3. Production accumulates
4. Population grows

## Implementation Notes
- Tests should live in `test/integration/game-loop.test.ts`
- Use the store and existing systems (production, population-growth, research, turn-system)
- These are integration tests — test the full pipeline: new game → turns → verify state changes
- No DOM access — test via the game logic layer only (src/game/)
- Check `src/game/` for existing systems: store.ts, actions/, systems/
- Review `design/` docs for expected formulas and behaviors

## Dependencies (all done)
- production-system ✅
- population-growth ✅
- research-system ✅
- galaxy-map-canvas ✅

## Completion
When done, update `.agents/workflow-state.json`:
```json
{
  "state": "TESTING",
  "current_task": "integration-test",
  "worker_output": {
    "files_created": ["test/integration/game-loop.test.ts"],
    "files_modified": [],
    "tests_added": ["test/integration/game-loop.test.ts"],
    "summary": "..."
  }
}
```
