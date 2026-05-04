# Difficulty Scaling Implementation Summary

**Date:** 2026-04-29  
**Issue:** Difficulty is accepted at game start but never applied — all difficulty levels behave identically.  
**Design Reference:** `design/game-mechanics/difficulty.md`

---

## Changes Made

### 1. Updated DifficultyLevel Type (`src/game/state.ts`)

**Line 18**  
Changed difficulty level enum to match design doc (5 levels + custom):

```typescript
// Before:
export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'impossible' | 'custom';

// After:
export type DifficultyLevel = 'simple' | 'easy' | 'average' | 'hard' | 'impossible' | 'custom';
```

---

### 2. Created Difficulty System (`src/game/systems/difficulty.ts`)

**New file — 390 lines**  
Created comprehensive difficulty constants and accessor functions:

- `DifficultyModifiers` interface defining all multipliers
- `DIFFICULTY_MODIFIERS` lookup table for all 5 difficulty levels
- Accessor functions:
  - `getDifficultyModifiers(difficulty)` — get all modifiers for a level
  - `getProductionMultiplier(difficulty, isPlayer)` — production output multiplier
  - `getResearchCostMultiplier(difficulty, isPlayer)` — tech cost multiplier  
  - `getCombatAttackModifier(difficulty, isPlayer)` — combat attack modifier
  - `getCombatDefenseModifier(difficulty, isPlayer)` — combat defense modifier
  - `getGroundCombatModifier(difficulty, isPlayer)` — ground combat modifier
  - `getGrowthMultiplier(difficulty, isPlayer)` — population growth multiplier
  - `getMaintenanceMultiplier(difficulty, isPlayer)` — ship maintenance multiplier
  - `getEventFrequencyMultiplier(difficulty)` — event occurrence rate
  - `getEventNegativeBias(difficulty)` — bias toward negative events
  - `getMonsterStrengthMultiplier(difficulty)` — space monster stat multiplier
  - `getSpySuccessModifier(difficulty, isPlayer)` — espionage success modifier
  - `getSpyCostMultiplier(difficulty, isPlayer)` — spy training cost multiplier

---

### 3. Updated Production System (`src/game/systems/production.ts`)

**Lines 4-5 (imports)**  
Added imports for DifficultyLevel and difficulty functions.

**Lines 27-29 (ProductionContext)**  
Added `difficultyProductionModifier: number` to ProductionContext interface.

**Lines 60-61 (DEFAULT_PRODUCTION_CONTEXT)**  
Added default `difficultyProductionModifier: 1.0`.

**Lines 63-77 (new function)**  
Added `applyDifficultyToContext()` helper to create context with difficulty applied.

**Lines 115-120 (calculateGrossProduction)**  
Modified factory and population output calculations to multiply by `ctx.difficultyProductionModifier`.

---

### 4. Updated Combat System (`src/game/systems/combat.ts`)

**Lines 13-14 (imports)**  
Added imports for DifficultyLevel and difficulty combat modifiers.

**Line 113 (CombatShip interface)**  
Added `isPlayer?: boolean` field to identify player-owned ships.

**Lines 147-149 (CombatState interface)**  
Added `difficulty?: DifficultyLevel` field to combat state.

**Lines 302-349 (calcHitChanceVs)**  
Updated hit chance calculation to accept optional `difficulty` parameter and apply attack/defense modifiers from difficulty system.

**Line 575 (shipActs)**  
Updated to pass `combat.difficulty` to `calcHitChanceVs()`.

**Lines 763-783 (autoResolveCombat)**  
Added optional `difficulty` parameter and applies it to combat state.

---

### 5. Updated Events System (`src/game/systems/events.ts`)

**Lines 16-17 (imports)**  
Added imports for DifficultyLevel and event frequency/bias functions.

**Lines 55-64 (DIFFICULTY_EVENT_MULTIPLIER)**  
Updated legacy multiplier map to include `simple` and `average` levels.

**Lines 170-171 (rollRandomEvents)**  
Changed to use `getEventFrequencyMultiplier()` from difficulty system.

---

### 6. Updated Turn Processing (`src/game/systems/turn.ts`)

**Lines 42-46 (imports)**  
Added `applyDifficultyToContext` and `getGrowthMultiplier` imports.

**Lines 93-99 (buildProductionContext)**  
Updated function signature to accept difficulty parameter and apply difficulty modifiers.

**Lines 143, 240 (function calls)**  
Updated all calls to `buildProductionContext()` to pass `state.difficulty`.

---

### 7. Updated Population System (`src/game/systems/population.ts`)

**Lines 10-11 (imports)**  
Added imports for DifficultyLevel and getGrowthMultiplier.

**Line 48 (Difficulty type)**  
Changed to re-export from state.ts for consistency.

**Lines 229-233 (PopulationContext)**  
Added `difficulty?: DifficultyLevel` and `isPlayer?: boolean` fields.

**Lines 370-374 (calculatePopulationGrowth)**  
Added difficulty growth multiplier to natural growth calculation.

---

### 8. Updated NewGame Options (`src/game/actions/newGame.ts`)

**Line 30**  
Updated comment to reflect new difficulty level options.

---

## Multiplier Table (as implemented)

### Production Modifiers

| Difficulty | Player | AI |
|------------|--------|-----|
| Simple | 1.25× | 0.75× |
| Easy | 1.10× | 0.90× |
| Average | 1.00× | 1.00× |
| Hard | 0.90× | 1.25× |
| Impossible | 0.75× | 1.50× |

### Research Cost Modifiers

| Difficulty | Player | AI |
|------------|--------|-----|
| Simple | 1.00× | 1.50× |
| Easy | 1.00× | 1.25× |
| Average | 1.00× | 1.00× |
| Hard | 1.00× | 0.75× |
| Impossible | 1.00× | 0.50× |

### Combat Attack/Defense Modifiers (additive %)

| Difficulty | Player | AI |
|------------|--------|-----|
| Simple | +10% | -10% |
| Easy | +5% | -5% |
| Average | +0% | +0% |
| Hard | -5% | +5% |
| Impossible | -10% | +10% |

### Population Growth Modifiers

| Difficulty | Player | AI |
|------------|--------|-----|
| Simple | 1.25× | 0.75× |
| Easy | 1.10× | 0.90× |
| Average | 1.00× | 1.00× |
| Hard | 0.90× | 1.10× |
| Impossible | 0.75× | 1.25× |

### Event Frequency Modifiers

| Difficulty | Frequency | Negative Bias | Monster Strength |
|------------|-----------|---------------|------------------|
| Simple | 0.50× | -25% | 0.75× |
| Easy | 0.75× | -10% | 0.90× |
| Average | 1.00× | +0% | 1.00× |
| Hard | 1.25× | +10% | 1.25× |
| Impossible | 1.50× | +25% | 1.50× |

---

## Assumptions Made

1. **Rounding:** Used `Math.round()` for combat hit chance calculations to match existing patterns in the codebase.

2. **Player identification:** Added `isPlayer` flag to CombatShip and PopulationContext to determine which modifier direction to apply.

3. **Custom difficulty:** Returns Average modifiers. Full custom difficulty support (per-field overrides) is deferred to a future task.

4. **Research costs:** Player research cost is NOT modified by difficulty (per design doc §7). Only AI gets cost reduction at higher difficulties.

5. **Combat modifiers:** Applied as additive percentage points to hit chance (e.g., +10% on Simple means 50% base becomes 60%). This matches the design doc's specification of "modify hit chance."

6. **Events system:** Updated to use new difficulty accessor but kept legacy multiplier map for backward compatibility.

---

## Testing Notes

The following scenarios should be verified:

1. **Production:** Create a new game on each difficulty and compare first-turn production output for player vs AI empires.

2. **Combat:** Engage in combat with identical ships on each difficulty; verify hit rates match expected modifiers.

3. **Research:** Compare AI tech completion speed across difficulties (AI should research faster on Hard/Impossible).

4. **Population:** Track population growth rates across difficulties and verify player grows faster on Simple, slower on Impossible.

5. **Events:** Run extended games on Simple vs Impossible and verify event frequency difference.

---

## Build Status

The difficulty scaling changes compile without errors. The following pre-existing issues remain in the codebase (unrelated to this change):

- `initialState.ts` — missing `currentPhase`, `phaseOutputs` (from turn-structure refactor)
- `CombatScreen.ts` — missing `hullSize` on test CombatShip objects  
- Unused variable warnings in `main.ts`, `Commander.ts`

---

## Future Work

- [ ] Full custom difficulty implementation with per-field slider UI
- [ ] Starting conditions by difficulty (different starting pop/factories/ships)
- [ ] Guardian of Orion stats by difficulty
- [ ] AI bonus starting techs on Hard/Impossible
- [ ] Coalition probability and AI coordination at higher difficulties
- [ ] Espionage modifiers
- [ ] Diplomacy/Council modifiers
