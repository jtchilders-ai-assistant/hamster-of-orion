# Current Task: new-game-flow

**Task ID:** new-game-flow  
**Name:** New game setup flow  
**Type:** ui  
**Status:** pending  

## Description

Implement the new game setup wizard per `design/ui-ux/wireframes/new-game-setup.md`.

This is a 5-step linear wizard:
1. Galaxy Setup (size, opponents, difficulty, age)
2. Race Selection (from src/data/races.json — 10 races)
3. Banner/Color Selection (empire color picker)
4. Emperor Name Entry (text input)
5. Home World Name Entry → triggers galaxy generation → launches game

## Output Files

- `src/ui/screens/NewGameScreen.ts` — 5-step wizard UI
- `src/game/actions/newGame.ts` — `START_GAME` action + reducer handling
- `test/game/actions/newGame.test.ts` — unit tests for START_GAME reducer

## Acceptance Criteria

- [ ] Galaxy size selection (small/medium/large/huge)
- [ ] Race selection from races.json (show name + traits)
- [ ] Emperor name entry (max 20 chars)
- [ ] Home world name entry (max 20 chars)
- [ ] Game starts with generated galaxy (calls `generateGalaxy` from src/game/generators/galaxy.ts)

## Key Interfaces

### generateGalaxy (from src/game/generators/galaxy.ts)
```typescript
export interface GalaxyOptions {
  size: GalaxySize;       // 'small' | 'medium' | 'large' | 'huge'
  shape: GalaxyShape;     // 'spiral' | 'elliptical' | 'irregular'
  seed: number;
  playerCount: number;    // 1 + numOpponents
  empireIds?: EmpireId[]; // assigned homeworld slots
}
export function generateGalaxy(options: GalaxyOptions): GalaxyGenerationResult;
// Returns: { galaxy: Galaxy, planets: Record<PlanetId, Planet>, planetIds: PlanetId[] }
```

### START_GAME action (you must add to reducer.ts)
```typescript
// Action:
{ type: 'START_GAME', payload: NewGameOptions }

// NewGameOptions:
interface NewGameOptions {
  galaxySize: GalaxySize;
  opponents: number;           // 1-9
  difficulty: DifficultyLevel; // 'easy' | 'normal' | 'hard' | 'impossible'
  galaxyAge: 'young' | 'average' | 'old';
  raceId: string;
  empireColor: string;
  emperorName: string;
  homeworldName: string;
  seed: number;
}
```

The START_GAME reducer should:
1. Call `generateGalaxy({ size, shape: 'spiral', seed, playerCount: 1 + opponents })`
2. Build a player Empire from raceData (load from src/data/races.json)
3. Build AI empires for each opponent
4. Set the homeworld system's name/colony
5. Return a fresh GameState with galaxy + empires populated, currentScreen: 'galaxy'

### Races data (src/data/races.json)
- 10 races: hamsters, ants, mice, rats, rabbits, hermit_crabs, guinea_pigs, ferrets, budgies, chameleons
- Each has: id, name, description, homeworld.name, bonuses, specialAbilities

### App integration
The App class in src/ui/App.ts has `onStateChange()` for screen routing.
Add 'new_game' as a valid screen type and route to NewGameScreen when `state.currentScreen === 'new_game'`.

Check `src/ui/App.ts` and `src/game/state.ts` (ScreenType union) to see what changes are needed.

## Implementation Notes

- Keep NewGameScreen.ts clean DOM TypeScript — no game logic
- All game logic (building initial state) goes in `src/game/actions/newGame.ts`
- The wizard tracks step state locally (no store needed until BEGIN GAME)
- On step 5 → "BEGIN GAME": dispatch START_GAME, which transitions currentScreen to 'galaxy'
- Galaxy shape: default to 'spiral'
- For simplicity, skip step 3 (banner) or implement as a simple color picker

## Test Coverage

In `test/game/actions/newGame.test.ts`:
- `START_GAME` produces a state with `galaxy.systems.allIds.length > 0`
- Player empire exists with correct raceId
- `currentScreen === 'galaxy'`
- AI empires equal to `opponents` count

## Commands

```bash
npm run typecheck
npm run test
```

Both must pass (currently 411 tests pass — do not break any).

When done, update `.agents/workflow-state.json`:
```json
{
  "state": "TESTING",
  "current_task": "new-game-flow",
  "worker_output": {
    "files_created": ["src/ui/screens/NewGameScreen.ts", "src/game/actions/newGame.ts", "test/game/actions/newGame.test.ts"],
    "files_modified": ["src/game/reducer.ts", "src/ui/App.ts", "src/game/state.ts"],
    "summary": "..."
  }
}
```
