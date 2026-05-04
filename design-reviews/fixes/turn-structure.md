# Turn Structure Refactor — 12-Phase Implementation

## Summary

Refactored `processTurn()` in `src/game/systems/turn.ts` to implement the 12-phase turn structure specified in `design/game-mechanics/turn-structure.md`. The flat processing function has been replaced with a phase-based orchestrator that executes phases in sequence and captures per-phase outputs for the turn summary.

## Files Changed

### `src/game/state.ts`
- Added `TurnPhase` enum with all 12 phases
- Added `PhaseOutput` interface for per-phase results
- Added `TurnResult` interface for complete turn processing results
- Added `currentPhase: TurnPhase | null` to `GameState` for UI phase tracking
- Added `phaseOutputs: PhaseOutput[]` to `GameState` for turn summary display

### `src/game/systems/turn.ts`
Complete restructure:
- Added `PHASE_ORDER` constant defining the 12-phase execution sequence
- Added `PhaseProcessorResult` interface for phase outputs
- Created individual phase processor functions:
  1. `processPhaseIncomeAndMaintenance` — Collect income, pay maintenance
  2. `processPhaseProduction` — Factory output, ship construction
  3. `processPhaseResearch` — RP accumulation, tech progress
  4. `processPhasePopulationGrowth` — Population growth calculations
  5. `processPhaseDiplomacy` — Treaty evaluation, diplomatic AI (stub)
  6. `processPhaseMovement` — Fleet movement processing
  7. `processPhaseCombatResolution` — Combat detection and marking
  8. `processPhaseGroundCombatAndColonization` — Colonization, ground combat
  9. `processPhaseEvents` — Random/scripted events (stub)
  10. `processPhaseVictoryCheck` — Victory condition evaluation
  11. `processPhaseAITurn` — AI empire processing
  12. `processPhaseEndTurn` — Cleanup and finalization
- Added `PHASE_PROCESSORS` dispatch table
- Refactored `processTurn()` to iterate through phases
- Added `processTurnWithResult()` for consumers needing detailed phase outputs

### `src/game/actions/turn.ts`
- Added `SKIP_TURN_SUMMARY` and `SET_TURN_PHASE` action types
- Updated `nextTurn()` to support `{ skipSummary: true }` option
- Added `skipTurnSummary()` action creator
- Added `setTurnPhase()` action creator for UI tracking
- Updated `turnReducer()` to handle new actions and victory screen navigation

### `src/game/reducer.ts`
- Imported new action types from `actions/turn.ts`
- Updated routing to include `SKIP_TURN_SUMMARY` and `SET_TURN_PHASE`

## Phase Execution Order

Per design spec, phases execute in this order:

| # | Phase | Purpose | Events Generated |
|---|-------|---------|------------------|
| 1 | Income & Maintenance | Collect BC, pay upkeep | — |
| 2 | Production | Factories, ships, pollution | `ship_built` |
| 3 | Research | RP accumulation | `research` |
| 4 | Population Growth | Growth calculations | — |
| 5 | Diplomacy | Treaties, AI proposals | `diplomatic` (future) |
| 6 | Movement | Fleet movement | — |
| 7 | Combat Resolution | Combat detection | `combat` |
| 8 | Ground Combat & Colonization | Invasions, new colonies | `colonization` |
| 9 | Events | Random/scripted events | `random_event` (future) |
| 10 | Victory Check | Win condition evaluation | `victory` |
| 11 | AI Turn | AI empire processing | — |
| 12 | End Turn | Cleanup, finalization | — |

## Victory Check Timing

Victory conditions are now checked in Phase 10, after all gameplay actions complete but before AI processing. This ensures:
- All combat is resolved
- All colonizations complete
- All ground invasions finish
- Empire defeat states are current

## Design Decisions

### Preserved Existing Systems
The refactor creates an orchestration layer over existing systems:
- `calculateGrowth()` — unchanged
- `processPlanetProduction()` — unchanged
- `processResearchTurn()` — unchanged
- `processFleetMovement()` — unchanged
- `canColonize()` / `colonize()` — unchanged
- `processAllAITurns()` — unchanged
- `processAllShipConstruction()` — unchanged
- `checkVictoryConditions()` — unchanged

### Stub Phases
Two phases are implemented as stubs for future expansion:
- **Diplomacy (Phase 5)**: Placeholder for treaty decay, AI proposals, trade routes
- **Events (Phase 9)**: Placeholder for random events (10% chance) and scripted events

### Phase Output Structure
Each phase returns:
```typescript
interface PhaseOutput {
  phase: TurnPhase;
  summary: string;           // Human-readable description
  events: TurnEvent[];       // Events for turn summary
  metrics?: Record<string, number | string>;  // Phase-specific metrics
}
```

### State Tracking
- `currentPhase` on `GameState` allows UI to show processing progress
- `phaseOutputs` on `GameState` provides full turn data for the summary screen
- Victory state is stored directly on `GameState.victoryResult`

### Backward Compatibility
- `processTurn()` signature unchanged: `(state: GameState) => GameState`
- Existing action `NEXT_TURN` works unchanged
- Turn summary screen can be skipped with `nextTurn({ skipSummary: true })`
- All existing tests pass

## Test Coverage

All turn-related tests pass:
- `test/game/actions/turn.test.ts` (3 tests)
- `test/game/systems/turn.test.ts` (24 tests)

## Future Work

1. **Diplomacy Phase**: Implement treaty decay, AI diplomatic proposals, trade route updates
2. **Events Phase**: Implement random event system with 10% trigger chance
3. **Phase Visualization**: UI component to show current phase during turn processing
4. **Phase Metrics**: Expand metrics collection for detailed turn summary display
5. **Ground Combat**: Wire ground combat resolution into Phase 8
6. **Combat Resolution**: Integrate actual combat resolution (currently just detection)
