# Current Task: save-load

## Task ID
save-load

## Task Name
Save/load system

## Description
Implement a LocalStorage-based save/load system for the full GameState. Also support export/import via JSON file download/upload.

## Output File
`src/game/persistence.ts`

## Acceptance Criteria
1. Save full GameState to localStorage (key: `hamster-of-orion-save`)
2. Load GameState from localStorage (return null if not found or parse error)
3. Export GameState as a downloadable JSON file (UI helper — can live in src/ui/)
4. Import GameState from a JSON file upload (UI helper — can live in src/ui/)

## Architecture Notes
- `src/game/persistence.ts` — pure functions: `saveGame(state: GameState): void`, `loadGame(): GameState | null`, `serializeState(state: GameState): string`, `deserializeState(json: string): GameState | null`
- UI helpers (file download/upload) go in `src/ui/persistence.ts` since they touch DOM/window
- No `any` types — use proper TypeScript
- Write unit tests for the pure functions in `src/game/persistence.ts` (mock localStorage)

## Dependencies
- game-state-types (done)

## Integration
- Wire save/load actions into the store/reducer if needed
- Optionally add SAVE_GAME / LOAD_GAME actions to the reducer
- The command bar or a dedicated menu button can trigger save/load (not required for this task — just the core persistence module)
