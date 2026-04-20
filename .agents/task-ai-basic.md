# Current Task: ai-basic

## Task ID
ai-basic

## Name
Basic AI opponent

## Description
Basic AI that manages production, builds ships, expands to nearby planets. Reference design/species/ai-archetypes.md for personality types.

## Key References
- `design/species/ai-archetypes.md` — AI personality types
- `src/game/systems/colonization.ts` — colonize()
- `src/game/systems/fleet.ts` — moveFleet()
- `src/game/state.ts` — Empire, GameState

## Output
- `src/game/ai/AIEmpire.ts`
- `src/game/ai/strategies.ts`

## Acceptance Criteria
1. AI sets production sliders (prioritize based on situation)
2. AI builds colony ships early game (expansion phase)
3. AI colonizes nearby planets (use canColonize, colonize)
4. AI builds military ships (when threatened or expanding)
5. AI sends fleets to attack if at war
6. No DOM imports in src/game/
7. Unit tests pass

## AI Decision Flow (per turn)
```typescript
function processAITurn(state: GameState, empireId: EmpireId): GameState {
  // 1. Evaluate situation (threats, expansion opportunities)
  // 2. Set production priorities per planet
  // 3. Queue ship builds
  // 4. Move fleets (expand or attack)
  // 5. Colonize if possible
  return nextState;
}
```

## Production Priority Logic
- Early game (turns 1-50): Prioritize IND and colony ships
- Mid game: Balance between SHIP, DEF, TECH
- When threatened: Maximize SHIP and DEF
- Peaceful: Prioritize TECH and ECO

## Expansion Logic
- Find nearest uncolonized habitable planets
- Send colony ships to best candidates
- Prioritize: rich > normal > poor; large > small

## Military Logic
- Build military ships when:
  - At war
  - Neighbor has larger fleet
  - Have excess production
- Attack when fleet strength > enemy + margin

## Tests Required
Create `test/game/ai/AIEmpire.test.ts`:
- AI sets production sliders appropriately
- AI builds colony ships in early game
- AI colonizes when possible
- AI builds military when threatened
- AI attacks enemy planets when at war
- No infinite loops or crashes

## Output on Completion
Update `workflow-state.json`:
```json
{
  "state": "TESTING",
  "current_task": "ai-basic",
  "worker_output": {
    "files_created": ["src/game/ai/AIEmpire.ts", "src/game/ai/strategies.ts", "test/game/ai/AIEmpire.test.ts"],
    "files_modified": [],
    "tests_added": ["test/game/ai/AIEmpire.test.ts"],
    "summary": "..."
  }
}
```
