# Tech Tree, Black Hole Generator & Design Doc Fixes

**Date:** 2026-05-02  
**Reviewer:** Wesley Crusher (AI Assistant)

---

## Summary

This document summarizes the fixes made for tech tree and design doc issues.

---

## Task 1: Black Hole Generator Implementation

### Status: ✅ IMPLEMENTED

### Analysis
The Black Hole Generator was **already present** in `src/data/components.json` with correct data:
```json
{
  "id": "black_hole_generator",
  "techLevel": 43,
  "category": "special",
  "size": 100,
  "cost": 250,
  "effect": {
    "stackDestructionMin": 0.25,
    "stackDestructionMax": 1.0,
    "destructionPenaltyPerShieldClass": 0.02,
    "cooldownTurns": 3,
    "requiresShipClass": ["huge"]
  }
}
```

However, the **combat system** did not implement its effect.

### Changes Made
**File: `src/game/systems/combat.ts`**

1. Added to `CombatShip` interface:
   - `hasBlackHoleGenerator?: boolean` - Whether ship has this system
   - `blackHoleGeneratorCooldown?: number` - Cooldown turns remaining
   - `blackHoleGeneratorPenaltyPerShield?: number` - Penalty per shield class

2. Added `activateBlackHoleGenerator()` function implementing the design spec:
   - Roll 1d4 × 25% = base destruction percentage (25%, 50%, 75%, or 100%)
   - Reduces by 2% per average enemy shield class
   - Destroys that percentage of enemy ships (randomly selected)
   - Sets 3-turn cooldown

3. Integrated into `shipActs()`:
   - Activates before normal weapons
   - Only usable on Huge-class hulls
   - If activated and destroys ships, ends ship's action (no additional attacks)

### Note
The design doc `design/ships/special-systems.md` has a simplified description ("Instant kill one ship, once per battle") that differs from the detailed spec in `design/technology/force-fields.md`. The implementation follows the authoritative force-fields.md spec.

---

## Task 2: Death Ray Not Ignoring Shields

### Status: ✅ FIXED

### Analysis
The Death Ray component in `components.json` has `ignoresShields: true`:
```json
{
  "id": "death_ray",
  "effect": {
    "damageMin": 200,
    "damageMax": 1000,
    "ignoresShields": true,
    ...
  }
}
```

But the combat code did not check this flag in `applyDamage()`.

### Changes Made
**File: `src/game/systems/combat.ts`**

1. Added `ignoresShields?: boolean` to `WeaponInstance` interface:
   ```typescript
   /** Ignores shields (e.g., Death Ray) — bypasses shield absorption entirely */
   ignoresShields?: boolean;
   ```

2. Modified `applyDamage()` function to check for `ignoresShields`:
   ```typescript
   // ignoresShields (e.g., Death Ray): skip shield absorption entirely
   if (!weapon.ignoresShields && target.shieldClass > 0 && remaining > 0) {
     // ... shield absorption logic
   }
   ```

Now weapons with `ignoresShields: true` deal full damage directly to hull, bypassing shields.

---

## Task 3: Techs Per Tier (5-7 in design vs 3 in code)

### Status: ⚠️ NO ACTION NEEDED

### Analysis
The task stated "The design says 5-7 techs per tier. Implementation only has 3."

After reviewing:
- `design/technology/TECH_OVERVIEW.md` says "roughly 8-10 tiers per field" and "2-3 options per level per field"
- No design doc specifies "5-7 techs per tier"
- The actual tech counts per tier vary by field:
  - Some tiers have 1-2 techs (speciality tiers)
  - Some have 3-6 techs (standard tiers)
  - This matches the MOO1 design of offering 2-3 random choices per tier

### Conclusion
The implementation matches the design spec. No changes needed.

---

## Task 4: Force Fields Tech Tree Depth (15 vs 14)

### Status: ⚠️ NO ACTION NEEDED

### Analysis
The task stated "Force Fields has 15 techs in data vs 14 in design. The extra tier 15 entry is 'super_deflector' which is undocumented."

After reviewing:
- `src/data/tech-tree.json` has Force Fields with **14 tiers** (matching design)
- There is **no "super_deflector"** entry in the tech tree
- Total Force Fields techs: 28 (across 14 tiers)
- Matches `design/technology/force-fields.md` exactly

### Conclusion
The task was based on incorrect information. No changes needed.

---

## Task 5: Planet Type Enum (22 vs 23 entries)

### Status: ⚠️ NO ACTION NEEDED

### Analysis
The task stated "Planet type enum has 22 entries vs design's 23. One is missing."

After reviewing:
- `design/planets/planet-types.md` lists 14 environment types:
  - Hostile (6): radiated, toxic, inferno, dead, tundra, barren
  - Standard (7): minimal, desert, steppe, arid, ocean, jungle, terran
  - Legendary (1): gaia
- `src/game/state.ts` PlanetType enum has 15 types:
  - All 14 from design + `gas_giant` (for non-habitable planets)

### Conclusion
Code has all design-specified types plus `gas_giant` for system completeness. No changes needed.

---

## Task 6: Design Doc Inconsistency (Chameleons)

### Status: ✅ FIXED

### Analysis
In `design/species/chameleons.md`:
- Listed "Stealth Suit (ground infiltration)" as starting tech
- But `src/data/races.json` correctly lists `cloaking_device`

### Changes Made
**File: `design/species/chameleons.md`**

Changed:
```markdown
### Starting Technologies
- Hyper-X Rockets (fast, stealthy scouts)
- ECM Jammer Mark I
- Stealth Suit (ground infiltration)
- Battle Scanner (intelligence gathering)
```

To:
```markdown
### Starting Technologies
- Hyper-X Rockets (fast, stealthy scouts)
- ECM Jammer Mark I
- Cloaking Device (ship stealth)
- Battle Scanner (intelligence gathering)
```

This aligns with `races.json` which has: `['hyper_x_rockets', 'ecm_jammer_1', 'cloaking_device', 'battle_scanner']`

---

## Files Modified

1. `src/game/systems/combat.ts`
   - Added `ignoresShields` support to `WeaponInstance`
   - Added `applyDamage()` check for `ignoresShields`
   - Added `CombatShip` fields for Black Hole Generator
   - Added `activateBlackHoleGenerator()` function
   - Integrated Black Hole Generator into `shipActs()`

2. `design/species/chameleons.md`
   - Corrected "Stealth Suit" → "Cloaking Device" in starting technologies

---

## Tasks Not Requiring Changes

- **Task 3**: Tech counts per tier match design spec (2-3 options per tier)
- **Task 4**: Force Fields has 14 tiers as specified; no "super_deflector" exists
- **Task 5**: All planet types from design are present in code

---

*Generated by Wesley Crusher (AI Assistant)*
