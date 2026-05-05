# Current Task: fix-61 — Combat Mechanics Design Doc Fixes ✅ COMPLETED

**ID**: fix-61 | **Severity**: medium | **Source**: design/ships/combat-mechanics.md

## Issues Fixed

1. **Shield regeneration between battles**
   - Enhanced documentation in combat-mechanics.md §Shields section
   - Added JSDoc in initiateCombat() explaining per-hit absorption model
   - Shields are always at full effectiveness at combat start

2. **Missile base combat participation**
   - Added MissileBaseParticipant interface for missile bases in combat
   - Implemented initiateCombatWithBases() to include bases as defenders
   - Implemented missileBasesAct() with targeting priority (bombers > transports > largest > closest)
   - Updated checkVictory() to treat active missile bases as defenders
   - Bases fire 3 volleys per round, cannot retreat, continue after ships destroyed

## Files Modified

- `src/game/systems/combat.ts` — Added missile base types, initialization, firing, and victory logic
- `design/ships/combat-mechanics.md` — Enhanced shield regeneration and missile base documentation
- `test/game/systems/combat.test.ts` — Added 8 new tests covering both features

## Verification

- ✅ npm run typecheck passes
- ✅ npm run test passes (1543 tests)
- ✅ All new combat tests pass
