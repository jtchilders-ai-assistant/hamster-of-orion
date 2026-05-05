# Current Task: fix-63 — Council System Fixes

**ID**: fix-63 | **Severity**: low | **Source**: src/game/systems/council.ts (diplomacy)

## Status: COMPLETED

## Issues Fixed

### 1. Bribery Factor Formula (council.md §4.4)
Added helper functions and constants for the bribery system:
- `TECH_VALUE_PER_TIER = 50` — Tech_Tier × 50
- `TECH_VALUE_NEW_BONUS = 1000` — +1000 if voter doesn't have tech
- `calculateTechBribeValue(techTier, voterHasTech)` — implements Tech_Value formula
- `calculateTotalBribeValue(bcAmount, techValues)` — sums BC + tech values
- `calculateBriberyFactor(bribeValue, voterEconomy, racialBribeModifier)` — full formula with cap

### 2. Alliance Voting (council.md §7.6)
Implemented alliance voting mechanics:
- `ALLIANCE_VOTE_LOYALTY = 0.80` — 80% chance to vote for allied candidate
- `CHAMELEON_ALLIANCE_LOYALTY = 0.50` — Chameleons only 50% loyalty
- `hasAlliance()` — checks for military_alliance treaty
- `getAllianceLoyalty()` — returns race-appropriate loyalty modifier
- Alliance check in `runAIVotes()` with deterministic pseudo-random roll

## Files Modified
- `src/game/systems/council.ts` — Added constants, helper functions, alliance voting logic
- `test/game/systems/council.test.ts` — Added 16 new tests for bribery formulas and alliance voting

## Tests Added
- calculateTechBribeValue tests (3 tests)
- calculateTotalBribeValue tests (3 tests)
- calculateBriberyFactor tests (5 tests)
- Alliance voting constant tests (2 tests)
- runAIVotes with alliances tests (3 tests)
