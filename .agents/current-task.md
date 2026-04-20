# Task: Turn Processing Integration

## ID
`turn-integration`

## Description
Integrate turn processing into the game loop. When the player finishes their turn, transition to the AI phase where AI civilizations take their turns, then return to the player.

## Acceptance Criteria
- Turn button triggers turn processing sequence
- Player phase complete → AI phase begins
- All AI civilizations process turns sequentially
- Turn summary screen shows what happened during AI phase
- Game state correctly saved/resumed between turns
- No crashes or state corruption during turn transition

## Implementation Plan
1. Add turn processor module (`src/game/turn-processor.ts`) that orchestrates turn phases
2. Integrate with existing combat-engine, ai-basic, and colonization systems
3. Add turn summary UI component
4. Wire up "End Turn" button in fleet-ui or main game screen
5. Add game state save/load between turns
6. Integration tests covering full turn cycle

## Dependencies (all done)
- ✅ combat-engine
- ✅ ai-basic
- ✅ colonization

## Technical Notes
- Turn processing should be a deterministic sequence: player phase → AI phase → end-of-turn cleanup
- AI phases should be independent and parallelizable (each AI processes separately)
- Need to handle cases where a turn has no actions (idle turn)
- Combat resolution from combat-engine should be integrated into turn processing
- Colonization orders from colonization module should auto-process during player turn
