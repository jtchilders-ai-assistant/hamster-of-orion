# Current Task: debug-hooks

## Task ID
`debug-hooks`

## Name
Debug interface for testing

## Description
Implement `window.__HAMSTER_DEBUG__` per ARCHITECTURE.md. This provides a debug interface for AI-driven browser testing and manual game state inspection.

## Output File
`src/debug.ts`

## Acceptance Criteria
1. `loadState(state)` injects test state into the store
2. `getState()` returns current game state
3. `dispatch(action)` sends actions to the store
4. Only enabled in dev mode (`import.meta.env.DEV`)

## Reference
From `design/technical/ARCHITECTURE.md`:

```typescript
// Type augmentation for window
declare global {
  interface Window {
    __HAMSTER_DEBUG__: {
      store: Store<GameState>;
      loadState: (state: GameState) => void;
      getState: () => GameState;
      dispatch: (action: Action) => void;
    };
  }
}

// In main.ts (dev mode only)
if (import.meta.env.DEV) {
  window.__HAMSTER_DEBUG__ = {
    store,
    loadState: (state) => store.dispatch({ type: 'LOAD_STATE', payload: state }),
    getState: () => store.getState(),
    dispatch: (action) => store.dispatch(action),
  };
}
```

## Implementation Notes

- Create `src/debug.ts` that exports an `initDebugHooks(store: Store<GameState>)` function
- The function should only attach `window.__HAMSTER_DEBUG__` when `import.meta.env.DEV` is true
- Add a `LOAD_STATE` action type to the root reducer so `loadState()` works
- Create test fixtures in `test/fixtures/states.ts` with `earlyGameState`, `midGameState` examples
- Write unit tests in `test/debug.test.ts` to verify the debug interface behavior

## Dependencies (all done)
- `store` ✅ — `src/game/store.ts`
- `game-state-types` ✅ — `src/game/state.ts`

## Test Command
```bash
npm run typecheck && npm run test
```

## Completion
When done, update `.agents/workflow-state.json`:
```json
{
  "state": "TESTING",
  "current_task": "debug-hooks",
  "worker_output": {
    "files_created": [...],
    "files_modified": [...],
    "tests_added": [...],
    "summary": "..."
  }
}
```
