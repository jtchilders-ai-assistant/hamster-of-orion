# Combat & Weapon Systems Deep Dive - Implementation Summary

**Date:** 2026-05-02  
**File:** `src/game/systems/combat.ts`

---

## Task 1: Missile Interception System ✅

### Design Spec (from `weapons-complete.md`)
- Point defense systems (beam weapons, Anti-Missile Rockets) can intercept incoming missiles
- Anti-Missile Rockets: 40% base interception chance, minus 1% per missile tech level
- Beam weapons: 10% interception chance per attack per round
- Interception happens before missiles impact

### Implementation

**New Types:**
```typescript
interface MissileInFlight {
  id: string;
  sourceShipId: string;
  targetShipId: string;
  weapon: WeaponInstance;
  damage: number;
  techLevel?: number;
  remainingFuel: number;
  side: CombatSide;
}
```

**New Fields on CombatState:**
- `missilesInFlight: MissileInFlight[]` — tracks missiles in transit

**New Functions:**
- `calculateInterceptionChance()` — calculates total point defense capability
- `attemptMissileInterception()` — rolls for interception
- `processMissilePhase()` — handles all missiles each round
- `launchMissile()` — API to launch missiles from ships

**Combat Flow Changes:**
- `processRound()` now calls `processMissilePhase()` after ship actions
- Missiles travel for up to 2 turns before expiring (per MOO1 fuel rules)
- ECM reduces missile hit chance: `-ecmRating × 5%`
- Maneuver rating also reduces missile hit chance: `-defenseRating × 2%`

---

## Task 2: Overflow Damage (Overkill) ✅

### Design Spec (from `weapons-complete.md`, `combat-algorithm.md`)
- Graviton Beam and Tachyon Beam have `overflow_damage` special
- Excess damage beyond what kills a ship carries over to next ship of same design in stack
- Shields apply normally to overflow target

### Implementation

**WeaponInstance already had:**
- `overflowDamage?: boolean`

**New Functions:**
- `getStackMates()` — finds ships of same design for overflow
- `applyOverflowDamage()` — applies excess damage to next weakest ship

**Logic:**
```typescript
// In applyWeaponEffects():
if (weapon.overflowDamage && target.hp <= 0) {
  const overkill = Math.abs(Math.min(0, target.hp));
  // Find next weakest ship of same design
  // Apply overflow damage with normal shield absorption
  // Chain if necessary
}
```

---

## Task 3: Crew Kill Mechanic ✅

### Design Spec (from `weapons-complete.md`, `combat-algorithm.md`)
- Neutron Blaster (1% crew kill), Plasma weapons kill crew instead of hull damage
- `killsCrew: true` on weapons with `crewKillPercent` (default 1%)
- Ship at 0 crew is DESTROYED regardless of hull HP

### Implementation

**CombatShip already had:**
- `crewCurrent?: number`
- `crewMax?: number`

**New Function:**
- `checkCrewDeath()` — destroys ship if crew reaches 0

**Crew Kill Flow:**
1. Weapon hits and deals damage
2. If `weapon.killsCrew`, calculate `crewKilled = max(1, floor(crewMax × crewKillPercent))`
3. Reduce `crewCurrent`
4. Call `applyCrewLossPenalties()` for status effects
5. Call `checkCrewDeath()` — if `crewCurrent <= 0` AND `hp > 0`, set `hp = 0`

**Status Effects (documented, partial implementation):**
- 0% crew: Ship is adrift (cannot act) — **IMPLEMENTED**
- ≤25% crew: Skeleton crew (-20% accuracy, 50% weapon failure) — **STUB**
- ≤50% crew: Undermanned (-10% accuracy) — **STUB**

---

## Task 4: Displacement Device ✅

### Design Spec (from `components-complete.md`)
- Tech Level 45 special system
- 33% chance to avoid any hit (passive)
- Can be activated to remove ship from combat for 1 round

### Implementation

**New Fields on CombatShip:**
```typescript
hasDisplacementDevice?: boolean;
displaced?: boolean;
displacementReturnRound?: number;
```

**New Functions:**
- `checkDisplacementDevice()` — 33% passive dodge on hit (called before damage)
- `activateDisplacementDevice()` — active use to remove ship for 1 round
- `processDisplacementReturns()` — returns displaced ships at round start

**Displacement Flow:**
- **Passive:** Before applying damage, roll 1-100. If ≤33, attack is avoided.
- **Active:** Ship sets `displaced=true`, `displacementReturnRound=round+1`
- Displaced ships cannot be targeted or act
- At start of next round, ship returns via `processDisplacementReturns()`

**Target Selection Changes:**
- `selectTarget()` now filters out displaced ships
- Initiative sorting excludes displaced ships

---

## Task 5: Range & Size Modifiers ✅

### Design Spec (from `combat-mechanics.md`, `combat-algorithm.md`)

**Range Modifiers:**
| Range | Distance | Modifier |
|-------|----------|----------|
| Point Blank | 1 hex | +10% |
| Close | 2-4 hexes | +0% |
| Medium | 5-8 hexes | -5% |
| Long | 9-15 hexes | -10% |
| Very Long | 16+ hexes | -20% |

**Size Modifiers:**
| Hull Size | Class | Modifier |
|-----------|-------|----------|
| Small | 1 | +0% |
| Medium | 2 | +5% |
| Large | 3 | +10% |
| Huge | 4 | +15% |

Formula: `(size_class - 1) × 5%`

### Implementation

**Functions:**
- `rangeModifier(distance)` — returns hit chance modifier based on hex distance
- `sizeModifier(targetSize)` — returns hit chance modifier based on target hull size
- `hexDistance(a, b)` — calculates hex distance; returns 3 (close range) if positions undefined

**Integration in `calcHitChanceVs()`:**
```typescript
// Range modifier
const distance = hexDistance(attacker.position, target.position);
hitChance += rangeModifier(distance);

// Size modifier (larger targets easier to hit)
hitChance += sizeModifier(target.hullSize);
```

---

## Additional Changes

### Combat State Initialization
- `initiateCombat()` now initializes `missilesInFlight: []`

### Combat Round Flow (Updated)
```
1. processDisplacementReturns() — displaced ships reappear
2. sortByInitiative() — excludes displaced ships
3. for each ship: shipActs()
   - Check crew death (adrift check)
   - Fire weapons with Displacement Device dodge check
   - Apply damage, overflow, crew kills
4. processMissilePhase() — missiles travel and impact
5. checkVictory()
```

### Exported Functions (New)
- `activateDisplacementDevice(ship, state)` — for manual combat use
- `launchMissile(attacker, weapon, target, state)` — for missile-based weapons
- `selectNextWeakestShip(enemies)` — utility for overflow/targeting

---

## Test Results

All 33 existing combat tests pass after implementation.

```
✓ test/game/systems/combat.test.ts (33 tests) 14ms
```

---

## Notes

1. **Hit Chance Formula:** Uses ×5 per level (per original task spec), not ×10 (MOO1 canonical). This matches existing tests.

2. **Missile Phase:** Currently missiles resolve on the round after launch (simulating travel time). Full hex-grid missile tracking deferred.

3. **Crew Penalties:** Skeleton crew and undermanned penalties are stubbed for future implementation.

4. **MIRV Missiles:** Scatter Pack warheads (5/7/10 MIRVs) not yet implemented — would need special handling in missile launch.

5. **Torpedo Cooldowns:** Every-other-turn firing for torpedoes not yet implemented in auto-resolve.
