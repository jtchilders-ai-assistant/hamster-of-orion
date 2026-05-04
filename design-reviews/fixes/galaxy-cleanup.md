# Galaxy Generation, Cleanup & Undocumented Extensions

**Date:** 2026-05-02  
**Reviewer:** AI Assistant (subagent)

---

## Summary

This document covers:
1. Homeworld distance formula investigation
2. Star Gates clarification
3. Space Monsters clarification
4. Removal of duplicate/conflicting systems (growth.ts, Commander keyboard)
5. Review of undocumented extensions

---

## 1. Homeworld Min Distance Formula

### Investigation

The design spec has **two conflicting specifications**:

**Section 1.2 (JSON config block):**
```json
"min_homeworld_distance": 150  // small
"min_homeworld_distance": 175  // medium
"min_homeworld_distance": 200  // large
"min_homeworld_distance": 225  // huge
```

**Section 8.4 (formula):**
```
MinHomeworldDistance = GalaxyDiagonal × 0.25

| Size | Diagonal | Formula Result |
|------|----------|----------------|
| Small | 640 | 160 |
| Medium | 896 | 224 |
| Large | 1088 | 272 |
| Huge | 1280 | 320 |
```

### Issue

Implementing the formula caused test failures: with seed 42 and 5 players on a medium galaxy, homeworlds could not be placed with the 224-distance requirement. The formula produces distances 28-42% larger than the config values.

### Resolution

**Kept the hardcoded config values** (150/175/200/225) for these reasons:
1. They are the tested, working values
2. They appear in the authoritative JSON config block in the design spec
3. The formula values are too strict for reliable placement

Added documentation comment explaining the discrepancy:

```typescript
/**
 * NOTE: The design spec has two sets of values:
 * - Section 1.2 JSON config: 150/175/200/225 (hardcoded, what works)
 * - Section 8.4 formula: diagonal × 0.25 = 160/224/272/320 (theoretical)
 *
 * Using the config values which were tested and working.
 */
```

**Files Changed:**
- `src/game/generators/galaxy.ts` — added explanatory comment

---

## 2. Star Gates Clarification

### Task Description
> Star Gates are special systems connecting two distant stars for instant travel.
> After star placement, randomly assign some stars as Star Gate pairs.

### Finding

**Star Gates are NOT galaxy generation features.** They are:
- A **building** constructed on planets after researching "Intergalactic Star Gates" tech
- Tech Level 27 in Propulsion
- Cost: 3,000 BC per planet
- Effect: Ships can travel instantly between any colonies with Star Gates

### Evidence

From `design/galaxy/travel.md`:
```
## Star Gates (Special Technology)
**Intergalactic Star Gates** (Propulsion tech):
```

From `src/data/buildings.json`:
```json
{
  "id": "star_gate",
  "name": "Intergalactic Star Gate",
  "techRequired": "star_gates_tech",
  "cost": 3000,
  ...
}
```

### Resolution

**No changes needed.** Star Gates are already correctly implemented as buildings.
The task description appears to confuse Star Gates with a different mechanic.

---

## 3. Space Monsters Clarification

### Task Description
> Space Monsters are special systems (currently "dragon" is undocumented).
> They should spawn in deep space.

### Finding

**Space Monsters are NOT galaxy generation features.** They are:
- **Random events** that occur during gameplay (after Turn 50-100)
- Implemented via the events system, not galaxy generation
- Three types: `amoeba`, `crystal`, `dragon` (void wyrm)

### Evidence

From `design/galaxy/exploration.md`:
```
## Space Monsters (Random Events)
MOO1 has two space monsters that appear as random events after Turn 100:
- Space Amoeba
- Space Crystal
```

From `src/data/events.json`:
```json
{
  "id": "void_wyrm",
  "name": "Void Wyrm",
  "type": "monster",
  "category": "space_monsters",
  "min_turn": 100,
  ...
}
```

### Dragon Documentation

The "dragon" (Void Wyrm) IS documented in events.json:
```json
{
  "id": "void_wyrm",
  "name": "Void Wyrm",
  "description": "An ancient predator guards a treasure hoard of Ancient One technology."
}
```

### Resolution

**No changes needed.** Space Monsters are random events, not generation features.
The `hasSpaceMonster` field on StarSystem is set when a monster event targets that system.
The `MonsterType` enum in state.ts includes `'dragon'` which maps to the Void Wyrm event.

---

## 4. Duplicate/Conflicting Systems Removed

### 4.1 growth.ts → population.ts Migration

**Problem:**
- `growth.ts` was a deprecated, incorrect implementation
- `turn.ts` imported `calculateGrowth()` from `growth.ts`
- This ignored environment modifiers, racial modifiers, tech bonuses, and food mechanics

**Fix Applied:**

Updated `turn.ts` to use `calculatePopulationGrowth()` from `population.ts`:

```typescript
// Before:
import { calculateGrowth } from './growth';
const delta = calculateGrowth(planet);

// After:
import { calculatePopulationGrowth, PopulationContext } from './population';
const ctx = buildPopulationContext(empire);
const result = calculatePopulationGrowth(planet, ctx);
```

Added helper function to build `PopulationContext` from empire state:

```typescript
function buildPopulationContext(empire: Empire): PopulationContext {
  return {
    raceId: empire.raceId,
    techState: {
      terraforming_tech_level: 0,  // TODO: derive from completedTechs
      cloning_tech_level: 0,
    },
    difficulty: undefined,
    isPlayer: empire.isPlayer,
  };
}
```

**Note:** Tech level derivation is stubbed to 0 for now, matching the old behavior.
A future task should scan `empire.research.completedTechs` for terraforming/cloning techs.

**Files Changed:**
- `src/game/systems/turn.ts` — switched to population.ts

### 4.2 Commander Duplicate Keyboard Listener

**Problem:**
- `Commander.ts` and `App.ts` both bound `keydown` for Enter/Space
- This caused duplicate turn processing
- `Commander.ts` had an inline overlay that conflicted with `TurnSummaryScreen`

**Fix Applied:**

Simplified `Commander.ts` to be a thin wrapper around `App`:

```typescript
// Commander no longer has:
// - bindKeyboard() method
// - processTurn() method  
// - showTurnSummary() / hideTurnSummary() methods
// - turnSummaryEl / processingTurn fields

// App handles everything:
// - Enter/Space keyboard shortcuts
// - NEXT_TURN action dispatch
// - Navigation to TurnSummaryScreen
```

**Files Changed:**
- `src/ui/components/Commander.ts` — removed duplicate keyboard handling

---

## 5. Undocumented Extensions Review

### 5.1 Temporal Drive (tier 55 engine)

**Status: DOCUMENTED ✓**

Found in `design/technology/propulsion.md`:
```
### Tier 14 (Tech Level 55) - Ultimate Propulsion
| Temporal Drive | 55 | Speed 9, Combat 9, Maneuver 6 |
```

Found in `src/data/tech-tree.json`:
```json
{ "id": "temporal_drive_tech", "techLevel": 55 }
```

Found in `src/data/components.json`:
```json
{ "id": "temporal_drive", "techLevel": 55, "category": "engine" }
```

**No action needed.**

### 5.2 Heavy Weapon Variants

**Status: DOCUMENTED ✓**

Heavy variants (Heavy Laser, Heavy Ion Cannon, Heavy Neutron Blaster, etc.)
are documented in the weapons design docs and exist in `components.json`.
They follow MOO1's convention of having heavy versions with larger size/cost/damage.

**No action needed.**

### 5.3 Gas Giant Planet Type (weight 0)

**Status: VESTIGIAL — KEEP**

- `gas_giant` exists in `PlanetType` union
- Weight is 0 in all ENVIRONMENT_TABLES (never generates)
- Treated as uninhabitable (pop capacity = 0, can't colonize)

**Analysis:**
- MOO1 had single-planet systems, no gas giants
- MOO2 added multi-planet systems with gas giants
- This appears to be future-proofing that was never used
- Tests check for its existence in the type system
- Code handles it gracefully (weight 0 = no generation)

**Decision: Keep.** It's harmless and removing it would break type checking.

### 5.4 researchMultiplier on Planets

**Status: IMPLEMENTED ✓**

Per `design-reviews/fixes/orion-and-cleanup.md`, `researchMultiplier` was wired up:
- Orion planets: 4.0×
- Artifacts worlds: 2.0×  
- Normal planets: 1.0× (default)

Applied in `production.ts` during research point allocation.

**No action needed.**

---

## Test Results

All affected tests pass:

```
✓ test/game/generators/galaxy.test.ts (37 tests)
✓ test/game/systems/turn.test.ts (24 tests)
✓ test/game/systems/population.test.ts (42 tests)
```

---

## Files Changed Summary

| File | Changes |
|------|---------|
| `src/game/generators/galaxy.ts` | Added comment explaining homeworld distance values |
| `src/game/systems/turn.ts` | Migrated from growth.ts to population.ts |
| `src/ui/components/Commander.ts` | Removed duplicate keyboard listener |

---

## Recommendations for Future Work

1. **Tech Level Derivation:** Implement proper lookup of terraforming/cloning tech levels from `empire.research.completedTechs` in the `buildPopulationContext()` helper.

2. **Design Spec Cleanup:** Reconcile the homeworld distance formula (§8.4) with the config values (§1.2) in `generation-algorithm.md`.

3. **growth.ts Removal:** The file is marked deprecated. Consider removing it entirely once all dependents are migrated (currently only tests reference it for comparison).

4. **Space Monster Events:** The `spawn_monster` event effect type is marked as "deferred" in `events.ts`. Implement the actual monster spawning when the events system is completed.
