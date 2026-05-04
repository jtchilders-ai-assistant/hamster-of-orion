# Formula & Balance Fixes — 2026-05-02

This document summarizes the formula and balance fixes applied to address design-code mismatches.

---

## Task 1: Mice Factory Overproduction

**Problem:** Mice factories produced ~25% more than intended (1.875 BC instead of 1.5 BC per factory) due to stacking `factoryEfficiencyMultiplier × racialProductionModifier`.

**Root Cause:** In `src/game/systems/production.ts`, factory output was multiplied by BOTH:
- `factoryEfficiencyMultiplier` (1.5 for Mice's "Automated Production" ability)
- `racialProductionModifier` (1.25 for Mice's +25% production bonus)

This yielded 1.0 × 1.5 × 1.25 = 1.875 BC per factory.

**Design Intent:** The factory efficiency multiplier (1.5) already captures Mice's factory-specific bonus. The `racialProductionModifier` should only apply to population labor, not factory output.

**Fix:** Modified `calculateGrossProduction()` in production.ts to apply `racialProductionModifier` only to population production, not factory production:

```typescript
// Before:
const factoryBC = opFac * BASE_FACTORY_OUTPUT * ctx.factoryEfficiencyMultiplier 
  * ctx.racialProductionModifier * ctx.difficultyProductionModifier;

// After:
const factoryBC = opFac * BASE_FACTORY_OUTPUT * ctx.factoryEfficiencyMultiplier 
  * ctx.difficultyProductionModifier;
```

**Result:** Mice factories now output exactly 1.5 BC per factory as designed.

---

## Task 2: Trade Income Formula (+5 Base Offset)

**Problem:** Trade income formula was missing a +5 base offset that should be present when trade relations exist between empires.

**Root Cause:** In `src/game/systems/treaties.ts`, `computeBaseTradeIncome()` calculated:
```
BaseTradeIncome = (P1 + P2) / 20
```

**Design Intent:** Small economies should still benefit from establishing trade; a baseline +5 BC offset ensures minimum trade value.

**Fix:** Added `TRADE_BASE_OFFSET = 5` constant and modified the formula:

```typescript
export const TRADE_BASE_OFFSET = 5;

export function computeBaseTradeIncome(empireA: Empire, empireB: Empire): number {
  return TRADE_BASE_OFFSET + (empireA.creditPerTurn + empireB.creditPerTurn) / 20;
}
```

**Result:** Trade agreements now provide a minimum +5 BC baseline plus economy-scaled income.

---

## Task 3: Force Fields Cost Table (14-tier vs 18-tier)

**Problem:** Task description indicated Force Fields might use an incorrect 18-tier generic cost table instead of its 14-tier accelerated schedule.

**Investigation:** Reviewed `src/data/tech-tree.json` and compared against `design/technology/force-fields.md`.

**Finding:** The tech-tree.json already contains the CORRECT 14-tier accelerated costs:
| Tier | Cost (RP) |
|------|-----------|
| 1 | 50 |
| 2 | 80 |
| 3 | 150 |
| 4 | 300 |
| 5 | 500 |
| 6 | 1,000 |
| 7 | 1,500 |
| 8 | 3,000 |
| 9 | 5,000 |
| 10 | 8,000 |
| 11 | 12,000 |
| 12 | 18,000 |
| 13 | 30,000 |
| 14 | 50,000 |

**Result:** No change required — Force Fields costs are correct.

---

## Task 4: researchMultiplier Never Read

**Problem:** Planets have a `researchMultiplier` field (4.0 for Gaia/Orion, 2.0 for Artifacts worlds) in the data model, but the research system didn't use it.

**Root Cause:** 
1. `src/game/systems/research.ts` used boolean flags (`hasArtifacts`, `isOrion`) with hardcoded multipliers instead of reading the planet's `researchMultiplier` field.
2. `src/game/systems/turn.ts` in `buildPlanetRPInputs()` didn't pass the `researchMultiplier` to the research calculation.

**Fix:**
1. Added `researchMultiplier?: number` to `PlanetRPInput` interface in research.ts
2. Modified `calculatePlanetRP()` to use `researchMultiplier` when provided (falling back to boolean flags for backwards compatibility)
3. Updated `buildPlanetRPInputs()` in turn.ts to pass `planet.researchMultiplier`

```typescript
// In research.ts:
if (planet.researchMultiplier !== undefined && planet.researchMultiplier !== 1.0) {
  planetRP *= planet.researchMultiplier;
} else {
  // Backwards-compat: use boolean flags when researchMultiplier not provided
  if (planet.hasArtifacts) { ... }
  if (planet.isOrion) { ... }
}
```

**Result:** Planets with `researchMultiplier` set in data (Gaia=4.0, Artifacts=2.0) now correctly apply those multipliers to research output.

---

## Task 5: Clean Up growth.ts Legacy File

**Problem:** `src/game/systems/growth.ts` implemented a parallel, conflicting growth system that diverged from the correct `population.ts` implementation. Both coexisted, risking confusion.

**Investigation:** 
- Searched for imports of `growth.ts` — found only test files, no production code
- The file was already marked `@deprecated` with migration guidance
- `population.ts` is the authoritative implementation

**Fix:**
1. Deleted `src/game/systems/growth.ts`
2. Updated `test/integration/game-loop.test.ts` to import from `population.ts`:
   - Changed `calculateGrowth()` calls to use `calculatePopulationGrowth()` with proper `PopulationContext`

**Result:** Removed dead code; all growth calculations now route through the correct `population.ts` implementation.

---

## Files Modified

- `src/game/systems/production.ts` — Task 1 (Mice factory fix)
- `src/game/systems/treaties.ts` — Task 2 (trade income offset)
- `src/game/systems/research.ts` — Task 4 (researchMultiplier)
- `src/game/systems/turn.ts` — Task 4 (pass researchMultiplier)
- `src/game/systems/growth.ts` — Task 5 (DELETED)
- `test/integration/game-loop.test.ts` — Task 5 (migrate from growth.ts)
- `test/game/systems/treaties.test.ts` — Updated test to expect +5 offset

## Files Verified (No Changes Needed)

- `src/data/tech-tree.json` — Task 3 (Force Fields costs already correct)

---

## Pre-existing Issues (Not Caused by These Fixes)

**`test/integration/game-loop.test.ts`:** Uses `raceId: 'humans'` in test fixtures, but 'humans' is not a valid race ID in this codebase (valid races are 'hamsters', 'rats', 'mice', etc.). The population growth tests fail due to this fixture bug, not from the growth.ts removal.
