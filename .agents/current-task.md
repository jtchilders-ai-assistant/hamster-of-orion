# Task: Fix Turn Integration — Wiring & Compilation

## ID
`turn-fix-compile`

## Context
Previous worker created `TurnSummary.ts` and `Commander.tsx` but they have compilation errors:
1. Commander.tsx: `--jsx` not set (no actual JSX syntax — should be `.ts`)
2. Commander.tsx: passes `HTMLElement` to `new App(store)` — App expects `Store<GameState>`
3. Commander.tsx: calls `this.app.getState()` and `this.app.dispatch()` — App has NO public methods
4. TurnSummary.ts: imports `TurnResult` from `turn-processor` — that module doesn't exist
5. main.ts: creates Commander with `new Commander(container)` but Commander needs the Store

The **core turn flow already works**: CommandBar NEXT TURN button → `nextTurn()` action → `turnReducer` → `processTurn(state)`. This needs to stay working.

## What Needs to Be Fixed

### 1. Rename Commander.tsx → Commander.ts
The file uses `document.createElement`, not JSX. Rename it and fix imports.

### 2. Fix Commander.ts
- Constructor should accept `Store<GameState>` (from main.ts)
- Create App internally for screen rendering (App takes Store too)
- Use store directly for `getState()` and `dispatch()`
- Remove unused imports (Store is needed, ScreenType is not, renderTurnSummary is unused)
- Keep the keyboard shortcut (Enter/Space = turn) and turn summary overlay

### 3. Fix TurnSummary.ts
- Remove import of `TurnResult` from `turn-processor`
- Define `TurnResult` interface inline (or in a shared types file)
- TurnSummary doesn't need TurnResult if Commander handles the summary display itself

### 4. Update main.ts
- Pass the store to Commander: `new Commander(document.getElementById('app')!, store)`
- Commander stores it and uses it for getState/dispatch

### 5. Verify compilation
- `npx tsc --noEmit` should pass with zero errors
- All existing functionality preserved (screens, command bar, turn processing)

## Technical Notes
- **No new files** unless absolutely necessary
- **No DOM in src/game/** — Commander.ts and TurnSummary.ts are in src/ui/ which is fine
- **No `any` types**
- Commander.ts needs to expose `getState()` and `dispatch()` for Commander's own use
- The TurnSummary component in src/ui/components/TurnSummary.ts can be simplified or integrated into Commander since Commander already builds its own summary UI

## Acceptance Criteria
- `npx tsc --noEmit` passes with zero errors
- Commander accepts Store<GameState> in constructor
- Turn processing still works via CommandBar NEXT TURN button
- Turn summary overlay still appears after processing a turn
- All existing screens and navigation still work
