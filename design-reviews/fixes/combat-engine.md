# Combat Engine Fixes — 2026-04-29

## Summary

Fixed the combat engine (`src/game/systems/combat.ts`) to align with MOO1-faithful mechanics per `design/ships/combat-algorithm.md` and `design/ships/combat-mechanics.md`.

---

## 1. Hit-Chance Multiplier — FIXED

### Issue
Code used `× 5` per level of advantage; design spec requires `× 10`.

### Change
**File:** `src/game/systems/combat.ts`  
**Function:** `calcHitChanceVs()` (lines ~160-210)

**Old formula:**
```typescript
const base = 50 + differential * 5;
```

**New formula (per combat-algorithm.md Section 9):**
```typescript
let hitChance = 50 + differential * 10;
```

**Design spec quote:**
> `Hit_Chance = 50 + (Effective_Attacker_Level - Effective_Defender_Level) × 10`

---

## 2. Missing Modifiers — IMPLEMENTED

### Range Modifiers
Added `rangeModifier()` function (lines ~125-137):

| Range Bracket | Hexes | Modifier |
|---------------|-------|----------|
| Point Blank | 1 | +10% |
| Close | 2-4 | +0% |
| Medium | 5-8 | -5% |
| Long | 9-15 | -10% |
| Very Long | 16+ | -20% |

### Size Modifiers
Added `sizeModifier()` function (lines ~110-122):

```
Size_Modifier = (target_size_class - 1) × 5%
```

| Hull Size | Class | Modifier |
|-----------|-------|----------|
| Small | 1 | +0% |
| Medium | 2 | +5% |
| Large | 3 | +10% |
| Huge | 4 | +15% |

### Scanner Bonus
Scanner bonuses (+1 for Battle Scanner, etc.) are now expected to be included in `attackRating` when ships are created. The `calcHitChanceVs()` function uses the full `attackRating` with the ×10 multiplier.

### Cloaking Device
Added dynamic cloaking check in `calcHitChanceVs()`:
- If `target.cloaked === true`, applies -50% hit chance (+5 defense levels × 10 = 50)
- Note: This is for dynamically-cloaked ships; static cloak bonus should be in `defenseRating`

---

## 3. Weapon Effects — IMPLEMENTED

### New `WeaponInstance` Properties Added
- `chainTargets?: number` — Chain lightning arc count
- `killsCrew?: boolean` — Kills crew on hit
- `crewKillPercent?: number` — Crew kill percentage (default 0.01 = 1%)
- `overflowDamage?: boolean` — Excess damage carries to next ship
- `doubleShieldDamage?: boolean` — Double damage to shields
- `percentDamage?: number` — Percent-based HP damage
- `instantKillSmall?: boolean` — Instant kill small ships
- `noRangePenalty?: boolean` — No damage range penalty

### `applyWeaponEffects()` — NEW FUNCTION (lines ~255-320)

Handles post-damage weapon effects:

1. **Instant Kill Small** — Destroys Small hull ships outright
2. **Crew Kills** — Reduces crew by `crewKillPercent` (default 1%) per hit
3. **Chain Lightning** — Arcs to up to N adjacent enemies (within 2 hexes) at 50% damage

### Percent Damage Weapons
Handled in `shipActs()` — Ion Stream Projector, etc. deal damage as a percentage of current HP.

---

## 4. Special Systems — IMPLEMENTED

### Warp Dissipator
Added check in `attemptRetreat()` (lines ~380-390):
- If any enemy has `hasWarpDissipator === true`, retreat is blocked
- Logs: `"retreat BLOCKED by enemy Warp Dissipator!"`

### High Energy Focus
Added in `calcHitChanceVs()` and `shipActs()`:
- First shot gets +10% hit chance (+1 level)
- After first hit, `highEnergyFocusUsed` is set to true
- Logs: `"High Energy Focus EXPENDED"`

### Sub-Space Teleporter
Added `useTeleporter()` function (lines ~415-440):
- Teleports ship to destination hex
- Checks for occupied hexes
- Returns false if destination is blocked

### Cloaking Device
Added `cloaked?: boolean` property to `CombatShip`:
- If true, applies +5 effective defense levels (-50% to attacker hit chance)
- Note: Firing should decloak (not implemented here — handled by game state)

---

## 5. New CombatShip Properties

| Property | Type | Purpose |
|----------|------|---------|
| `hullSize` | `HullSize` | Size class for hit modifiers |
| `position` | `{x, y}?` | Hex position for range calculations |
| `crewCurrent` | `number?` | Current crew count |
| `crewMax` | `number?` | Maximum crew complement |
| `ecmRating` | `number?` | ECM jammer level (for missiles) |
| `cloaked` | `boolean?` | Currently cloaked |
| `hasWarpDissipator` | `boolean?` | Prevents enemy retreat |
| `hasTeleporter` | `boolean?` | Sub-space teleporter equipped |
| `hasHighEnergyFocus` | `boolean?` | High Energy Focus equipped |
| `highEnergyFocusUsed` | `boolean?` | HEF expended this combat |

---

## 6. Deferred Items (Flagged for Future Work)

### ⚠️ Missile Combat System
Missiles use different hit resolution per design spec:
- `hit_chance = 80 - (ecm_rating × 5) - (maneuver_rating × 2)`
- Point defense intercept: `intercept_chance = 10% × beam_attacks`
- **Status:** Missile-specific resolution NOT YET IMPLEMENTED. Current system treats missiles same as beams.

### ⚠️ Overflow Damage
Graviton Beam, Tachyon Beam should carry excess damage to next ship in stack.
- `overflowDamage` flag added to `WeaponInstance`
- **Status:** Flag recognized, but overflow logic NOT YET IMPLEMENTED in `applyDamage()`

### ⚠️ Hellfire Torpedo Multi-Hit
Hellfire Torpedo fires 4 × 25-damage attacks per hit, each resolved independently through shields.
- Already handled via `attacksPerRound: 4` in components.json
- **Status:** WORKS via existing multi-attack loop. Verified correct.

### ⚠️ Crew Loss Penalties
Crew ratio affects ship performance:
- ≤25% crew: Skeleton crew (-20% accuracy, 50% weapon failure, half speed)
- ≤50% crew: Undermanned (-10% accuracy, speed -1)
- 0% crew: Adrift (cannot act)
- **Status:** Adrift check implemented. Full penalty application deferred.

### ⚠️ Displacement Device
33% miss reroll (separate from hit chance) not yet implemented.
- **Status:** DEFERRED

---

## Test Verification

To verify the hit-chance fix:
```typescript
import { calcHitChanceVs, CombatShip, WeaponInstance } from './combat';

const attacker: Partial<CombatShip> = { 
  attackRating: 5, 
  experience: 'regular', 
  hullSize: 'medium',
  position: { x: 0, y: 0 }
};
const defender: Partial<CombatShip> = { 
  defenseRating: 3, 
  hullSize: 'medium',
  position: { x: 1, y: 0 }  // Adjacent (point blank)
};
const weapon: Partial<WeaponInstance> = { alwaysHits: false };

// Old: 50 + (5-3) × 5 = 60%
// New: 50 + (5-3) × 10 = 70%
//      + 5 (medium target size modifier)
//      + 10 (point blank range)
// Expected: 85%
const hitChance = calcHitChanceVs(
  attacker as CombatShip, 
  weapon as WeaponInstance, 
  defender as CombatShip
);
console.assert(hitChance === 85, `Expected 85, got ${hitChance}`);
```

### TypeScript Compilation

Verified: `npx tsc --noEmit --skipLibCheck` passes with no errors in `src/game/systems/combat.ts`.

---

## Files Changed

1. **`src/game/systems/combat.ts`**
   - Fixed hit-chance multiplier (×5 → ×10)
   - Added `HullSize` type
   - Extended `WeaponInstance` interface with weapon effect flags
   - Extended `CombatShip` interface with new properties
   - Added `hexDistance()`, `sizeModifier()`, `rangeModifier()` functions
   - Added `applyWeaponEffects()` function
   - Added `applyCrewLossPenalties()` function (stub)
   - Modified `calcHitChanceVs()` to use ×10 multiplier + modifiers
   - Modified `applyDamage()` to handle armor piercing correctly
   - Modified `shipActs()` to call `applyWeaponEffects()` and handle percent damage
   - Modified `attemptRetreat()` to check Warp Dissipator
   - Added `useTeleporter()` function

---

*Last Updated: 2026-04-29*
