# Critical Game-Breaking Fixes

**Date:** 2026-04-29
**Author:** Wesley (AI Assistant)

This document summarizes four critical game-breaking bugs that were fixed.

---

## Problem 1: Hermit Crab Colonization Without Required Ship System

### Issue
The colonization system needed to ensure that ALL races (including Hermit Crabs with `universal_adaptation`) still require a colony ship with the Colonization Module to colonize planets. The system also needed to properly handle Hermit Crabs' ability to bypass hostile environment tech requirements.

### Files Changed
- `src/game/systems/colonization.ts` (lines 15, 137-175)

### What Was Wrong
The `canColonize` function correctly checked for a colony ship (Condition 4), but the hostile environment tech check (Condition 5) didn't account for the `universal_adaptation` ability that Hermit Crabs have. This could have caused Hermit Crabs to be incorrectly blocked from colonizing hostile planets even though their race ability should bypass environment tech requirements.

### What Was Fixed
1. Added import for `hasUniversalColonization` from `raceAbilities.ts` (line 15)
2. Updated `canColonize` function to:
   - Explicitly document that colony ship requirement applies to ALL races (Condition 4 comment)
   - Added check for `universal_adaptation` ability that bypasses hostile environment tech requirements
   - Hermit Crabs with a colony ship can now colonize any non-gas-giant planet without needing Controlled Environment techs

```typescript
// Added at line 15:
import { hasUniversalColonization } from './raceAbilities';

// Updated condition 5 (lines 160-175):
// Skip hostile environment tech check for races with universal colonization
if (raceId && hasUniversalColonization(raceId)) {
  return true;
}
```

---

## Problem 2: Terraform Buildings Reachable in Non-Terraformable Environments

### Issue
Terraform buildings (Improved Terraforming +10/+20/etc.) could be purchased on planets with environments that cannot be terraformed (e.g., gas giants), and races that cannot terraform (Hermit Crabs with `cannot_terraform` ability) were able to purchase them.

### Files Changed
- `src/game/systems/buildings.ts` (lines 16-19, 23-50, 123-130)

### What Was Wrong
The `getAvailableBuildings` function didn't filter out terraforming category buildings based on:
1. Non-terraformable planet types (gas giants)
2. Race abilities that prevent terraforming (Hermit Crabs' `cannot_terraform`)

### What Was Fixed
1. Added imports for `PlanetType` and `cannotTerraform` from raceAbilities (lines 16-19)
2. Added `NON_TERRAFORMABLE_TYPES` constant defining gas_giant as non-terraformable (lines 23-35)
3. Added `canTerraformPlanet()` helper function (lines 37-50)
4. Updated `getAvailableBuildings` to check for terraforming category and filter appropriately (lines 123-130)

```typescript
// Added constant (lines 28-31):
const NON_TERRAFORMABLE_TYPES = new Set<PlanetType>([
  'gas_giant',
]);

// Added helper function (lines 37-50):
export function canTerraformPlanet(planet: Planet, raceId: string): boolean {
  if (NON_TERRAFORMABLE_TYPES.has(planet.type)) return false;
  if (cannotTerraform(raceId)) return false;
  return true;
}

// Added filter in getAvailableBuildings (lines 123-130):
if (b.category === 'terraforming') {
  if (!canTerraformPlanet(planet, empire.raceId)) {
    return false;
  }
}
```

---

## Problem 3: Grid Row Count Deviation (15×11 vs 15×15)

### Issue
The tactical combat grid was 15×11 (165 hexes) instead of the design specification's 15×15 (225 hexes), significantly shrinking the combat arena and affecting tactical options.

### Files Changed
- `src/ui/screens/CombatScreen.ts` (line 46)

### What Was Wrong
The `GRID_ROWS` constant was set to 11 instead of 15.

### What Was Fixed
Changed `GRID_ROWS` from 11 to 15:

```typescript
// Before:
const GRID_COLS = 15;
const GRID_ROWS = 11;

// After:
const GRID_COLS = 15;
const GRID_ROWS = 15;
```

This restores the full 225-hex combat grid as specified in the design.

---

## Problem 4: Missing WAIT and DONE Buttons

### Issue
Players couldn't explicitly yield their turn order (WAIT) or signal they're done with a ship (DONE) during tactical combat.

### Files Changed
- `src/ui/screens/CombatScreen.ts` (lines 420-425, 644-651, 709-712, 867-869, 926-1023)

### What Was Wrong
The combat UI only had NEXT ROUND, AUTO-RESOLVE, RETREAT, and RETURN TO MAP buttons. Players had no way to:
- WAIT: Yield a ship's turn order to act later in the initiative queue
- DONE: Mark a ship as finished for the current round

### What Was Fixed

1. **Added state tracking variables** (lines 420-425):
```typescript
// Ships that have used WAIT this round (will act at end of initiative)
private waitingShipIds: Set<string> = new Set();

// Ships that are marked DONE this round (cannot act again until next round)
private doneShipIds: Set<string> = new Set();
```

2. **Added WAIT and DONE buttons** in `buildControls()` (lines 644-651):
```typescript
// WAIT — yield ship's turn order, move to end of initiative
const waitBtn = this.makeButton('WAIT', '#2a2a3a', '#8888ff');
waitBtn.title = 'Yield selected ship\'s turn order (move to end of initiative queue)';
waitBtn.addEventListener('click', () => this.doWait());
this.controlsEl.appendChild(waitBtn);

// DONE — mark ship as finished for this round
const doneBtn = this.makeButton('DONE', '#2a3a2a', '#88cc88');
doneBtn.title = 'Mark selected ship as finished for this combat round';
doneBtn.addEventListener('click', () => this.doDone());
this.controlsEl.appendChild(doneBtn);
```

3. **Reset state on combat init** (lines 709-712):
```typescript
this.waitingShipIds.clear();
this.doneShipIds.clear();
```

4. **Reset state on new round** in `stepRound()` (lines 867-869):
```typescript
// Clear WAIT/DONE state at the start of each new round
this.waitingShipIds.clear();
this.doneShipIds.clear();
```

5. **Added handler methods** (lines 926-1023):

**doWait()**: 
- Validates ship selection and eligibility
- Adds ship to `waitingShipIds` set
- Ship will act at end of initiative order
- Logs the action

**doDone()**:
- Validates ship selection and eligibility  
- Adds ship to `doneShipIds` set
- Ship cannot act again this round
- Removes from waiting list if present
- Logs the action

Both handlers:
- Only work on attacker (player-controlled) ships
- Check ship is alive and not retreated
- Clear interaction mode and deselect after action

---

## Testing Recommendations

1. **Colonization**: Verify Hermit Crabs can colonize hostile planets with a colony ship, and that other races still need environment techs
2. **Terraforming**: Verify terraform buildings don't appear for gas giants or Hermit Crab planets
3. **Combat Grid**: Verify the grid is now 15×15 (count hexes visually)
4. **WAIT/DONE**: Test button functionality in tactical combat - verify ships can wait and be marked done

---

## Summary

| Issue | File | Lines Changed |
|-------|------|---------------|
| Hermit Crab Colonization | colonization.ts | 1 import, ~15 logic |
| Terraform on Non-Terraformable | buildings.ts | 2 imports, ~30 logic |
| Grid Size 15×11 → 15×15 | CombatScreen.ts | 1 constant |
| WAIT/DONE Buttons | CombatScreen.ts | ~100 lines total |
