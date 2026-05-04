# Orion Fix, researchMultiplier, and Legacy Cleanup

**Date:** 2026-04-29  
**Reviewer:** AI Assistant (subagent)

---

## Summary

This document summarizes fixes for high-severity issues found during design review:
1. Orion system spawning with wrong environment and population
2. `researchMultiplier` never applied to research output
3. Legacy code conflicts between `growth.ts` and `population.ts`
4. Deprecated functions producing incorrect results
5. Building overflow BC discarded

---

## 1. Orion Environment Fix

**File:** `src/game/generators/galaxy.ts`  
**Lines:** ~429-445 (placeOrion function)

**Problem:**
- Orion spawned with `environment: 'gaia'` but should be `'dead'`
- `basePop` was 100 but should be 150
- Gaia should never spawn naturally (only via terraforming)

**Fix Applied:**
```typescript
best.planet = {
  environment: 'dead',      // was 'gaia'
  size: 'huge',
  basePop: 150,             // was 100
  resources: 'ultra_rich',
  researchMultiplier: 4.0,
  hasGuardian: true,
  // ...
};
```

**References:**
- `design/planets/generation-tables.md` §10.2 Forced Overrides
- `design/planets/generation-tables.md` §10.3 Gaia Worlds ("cannot spawn naturally")

---

## 2. researchMultiplier Applied

**File:** `src/game/systems/production.ts`  
**Lines:** ~316-321 (allocateSliders function)

**Problem:**
- `planet.researchMultiplier` (4.0 for Orion, 2.0 for Artifacts) was never read
- All planets generated the same RP regardless of special status

**Fix Applied:**
```typescript
const baseRP = scientists * 1.0 * ctx.racialResearchModifier;
// Apply planet-specific research multiplier (Orion=4.0, Artifacts=2.0, default=1.0)
const researchMultiplier = planet.researchMultiplier ?? 1.0;
const techRP = baseRP * researchMultiplier;
```

**Impact:**
- Orion colonies now generate 4× research points
- Artifacts worlds now generate 2× research points
- Standard planets default to 1.0× (no change)

---

## 3. Deprecated Functions Removed

**File:** `src/game/systems/production.ts`  
**Lines:** ~742-775 (section header with removal notice)

### 3a. `distributeProduction()` — REMOVED

**Problem:** Incorrectly included TECH in net production allocation. TECH doesn't consume BC—it diverts population from labor. This caused incorrect BC splits.

**Replacement:** `allocateSliders(planet, netProduction, ctx)` which:
- Correctly handles TECH as population diversion
- Splits only SHIP/DEF/IND/ECO across net production

### 3b. `calculateMaxFactories()` — REMOVED

**Problem:** Returned `floor(population)`, ignoring Robotic Controls level. This is only correct for RC II (2:1 ratio) early game. Later techs (RC III through RC VII) allow 3-7 factories per pop.

**Replacement:** Use `planet.maxPopulation * ctx.roboticControlsLevel`.

**Test File Update:**
- `test/game/systems/production.test.ts` updated to use `allocateSliders()` instead of `distributeProduction()`

---

## 4. growth.ts Deprecated

**File:** `src/game/systems/growth.ts`  
**Lines:** 1-57 (entire file marked deprecated)

**Problem:** Implements a parallel, simpler growth system that conflicts with the authoritative `population.ts`. The `growth.ts` version:
- Ignores environment growth modifiers (radiated=0.1×, gaia=1.0×)
- Ignores racial growth modifiers (Rabbits=2.0×, Hermit Crabs=0.5×)
- Ignores terraforming/cloning tech bonuses
- Ignores food/starvation mechanics
- Uses simple morale enum instead of numeric 0-100 scale

**Decision:** File marked deprecated with comprehensive JSDoc comments explaining:
1. Why it's wrong
2. What to use instead (`calculatePopulationGrowth()` from `population.ts`)
3. Migration path for existing code

**Dependencies Found:**
- `src/game/systems/turn.ts` imports `calculateGrowth` from `growth.ts` (line 20)
- Used in `processGrowth()` function (lines 191+)

**Recommendation:** Future task should update `turn.ts` to use `calculatePopulationGrowth()` from `population.ts` with proper empire context.

---

## 5. Building Overflow BC Fixed

**File:** `src/game/systems/buildings.ts`  
**Lines:** ~340-405 (accumulateBuildingProgress function)

**Problem:** Overflow BC (when building completes mid-turn) was calculated but discarded with `void overflow`.

**Fix Applied:**
1. Changed return type from `GameState` to `AccumulateBuildingResult`:
   ```typescript
   export interface AccumulateBuildingResult {
     state: GameState;
     overflow: number;
   }
   ```

2. Fixed overflow calculation:
   ```typescript
   const overflow = newCostRemaining === 0
     ? Math.max(0, defBc - activeItem.costRemaining)
     : 0;
   ```

3. Updated `processAllBuildingConstruction()` to return overflow grouped by empire:
   ```typescript
   export interface ProcessAllBuildingsResult {
     state: GameState;
     overflowByEmpire: Record<string, number>;
   }
   ```

**Impact:** Callers can now add overflow BC to Empire Reserves properly.

---

## Assumptions Made

1. **Orion environment choice:** Used 'dead' because:
   - Generation tables say Gaia never spawns naturally
   - Special planets table shows Orion as challenging (Guardian-defended)
   - 'dead' with basePop=150 matches the Huge size spec

2. **researchMultiplier application point:** Applied after base RP calculation, before empire-level aggregation. This matches the design spec showing it as a per-planet multiplier.

3. **growth.ts not removed:** Kept for backwards compatibility since `turn.ts` depends on it. Marked deprecated so future work can migrate to `population.ts`.

4. **Building overflow destination:** Returns to caller (turn system) to add to Empire Reserve. Did not add reserve directly since building system shouldn't know about empire state structure.

---

## Files Changed

| File | Changes |
|------|---------|
| `src/game/generators/galaxy.ts` | Fixed Orion environment ('dead') and basePop (150) |
| `src/game/systems/production.ts` | Applied researchMultiplier; removed deprecated functions |
| `src/game/systems/growth.ts` | Added deprecation notice |
| `src/game/systems/buildings.ts` | Fixed overflow BC return |
| `test/game/systems/production.test.ts` | Updated to use modern API |

---

## Testing Recommendations

1. Run existing test suite to verify nothing broke
2. Add test for Orion generation: verify environment='dead', basePop=150
3. Add test for researchMultiplier: verify Orion=4×, Artifacts=2×, normal=1×
4. Add integration test for building overflow → reserve contribution

---

## Test Results

**All tests related to these changes pass:**
- `test/game/systems/production.test.ts` (3 tests) ✅
- `test/game/systems/buildings.test.ts` (29 tests) ✅
- `test/game/generators/galaxy.test.ts` (37 tests) ✅

**Pre-existing failures (not related to these changes):**
- `combat.test.ts`: `calcHitChanceVs` returning NaN (6 failures)
- `game-loop.test.ts`: Unknown raceId "humans" (30 failures)
- `difficulty.ts`: `playerProduction` undefined (various turnSummary tests)
