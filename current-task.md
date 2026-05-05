# Current Task: fix-53 — Population Growth Design Doc Fixes (COMPLETED)

**ID**: fix-53 | **Severity**: medium | **Source**: design/economy/population-growth.md

## Summary

Implemented missing population mechanics from design/economy/population-growth.md:

1. **Population Transport System**
   - Added `COLONY_TRANSPORT_COST = 50` BC to build
   - Added `COLONY_TRANSPORT_MAINTENANCE = 1` BC/turn maintenance
   - Added `POPULATION_TRANSPORT` constant object re-exporting these values
   - `POPULATION_TRANSPORT_CAPACITY = 1` million pop per transport (already existed)

2. **Bio Weapon Max Population Reduction**
   - Added `BIO_WEAPONS` constant with full stats for all bio weapons:
     - Death Spores: TL 10, 1M/round kill rate, -10% max pop, 150 space, 100 BC
     - Doom Virus: TL 25, 2M/round kill rate, -25% max pop, 200 space, 200 BC
     - Bio Terminator: TL 33, 3M/round kill rate, -50% max pop, 250 space, 300 BC
   - Added `BioWeaponType` type for bio weapon IDs
   - Added `getBioWeaponMaxPopReduction()` helper function
   - Added `BIO_WEAPON_DIPLOMACY_PENALTY = -100`

3. **Bio Weapon Damage Processing**
   - Added `BioWeaponPlanetFields` interface for tracking damage per planet
   - Added `processBioWeaponDamage()` function implementing full damage calculation:
     - Population killed = kill rate × weapon count × combat rounds - antidote reduction
     - Max pop reduction is cumulative across attacks
     - Capped at 90% max reduction (minimum 10% of original capacity)
     - Leaves at least 1 survivor
   - Added `clearBioWeaponDamage()` for re-terraforming
   - Added `getEffectiveMaxPopulation()` accounting for bio weapon damage

## Files Modified

- `src/game/constants.ts` - Added transport cost/maintenance, bio weapon constants
- `src/game/systems/population.ts` - Added bio weapon processing functions
- `src/game/systems/turn.ts` - Fixed unused import and constant (pre-existing issue)
- `test/game/systems/population.test.ts` - Added 22 new tests for bio weapons and transports

## Test Results

All 77 population tests pass including 22 new tests:
- processBioWeaponDamage (14 tests)
- clearBioWeaponDamage (2 tests)
- getEffectiveMaxPopulation (3 tests)
- POPULATION_TRANSPORT constant (3 tests)
- BIO_WEAPONS constants (3 tests)

## Design Doc References

- design/economy/population-growth.md §7 Population Transport
- design/economy/population-growth.md §Edge Cases - Biological Weapon Damage
- design/technology/planetology.md §Biological Weapons
- design/economy/ship-costs.md §16 Transport Costs
