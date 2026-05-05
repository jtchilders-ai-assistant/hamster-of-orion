# Current Task: fix-52 — Trade Design Doc Fixes (COMPLETED)

**ID**: fix-52 | **Severity**: medium | **Source**: design/diplomacy/trade.md

## Summary

Implemented trade disruption mechanics from design/diplomacy/trade.md:

1. **Pirates & Space Monsters affecting trade routes with 20-50% income reduction**
   - Added `hasActivePiracyEvent()` to check for active piracy events
   - Added `calculatePiracyTradeMultiplier()` returning 0.50-0.80 based on severity
   - Added `hasSpaceMonsterDisruption()` to check for monsters in empire systems
   - Added `calculateMonsterTradeMultiplier()` returning 0.0 when monsters block routes
   - Added `calculateTradeDisruptionMultiplier()` combining both effects

2. **Trade Sanctions as Council action**
   - Added `TradeSanction` interface to state.ts
   - Added `sanctions: TradeSanction[]` to HighCouncil interface
   - Added `isUnderSanctions()`, `getSanction()` for checking sanction status
   - Added `calculateSanctionTradeMultiplier()` returning 0.50 for sanctioned empires
   - Added `wouldViolateSanctions()` to check if trading would violate sanctions
   - Added `imposeSanctions()`, `liftSanctions()` for Council actions
   - Added `applySanctionViolationPenalty()` applying -30 relations to all races

3. **Full integration**
   - Added `computeTradeIncomeWithDisruption()` combining all effects with base trade income

## Files Modified

- `src/game/state.ts` - Added TradeSanction interface, updated HighCouncil
- `src/game/constants.ts` - Added piracy, monster, and sanction constants
- `src/game/systems/treaties.ts` - Added trade disruption and sanctions functions
- `test/game/systems/tradeDisruption.test.ts` - 38 comprehensive tests

## Test Results

All 38 tests pass:
- Piracy Trade Disruption (design/diplomacy/trade.md §Pirates)
- Space Monster Trade Disruption (design/diplomacy/trade.md §Space Monsters)
- Combined Trade Disruption
- Trade Sanctions (design/diplomacy/trade.md §Trade Sanctions)
- computeTradeIncomeWithDisruption
