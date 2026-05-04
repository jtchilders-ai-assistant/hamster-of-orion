# Diplomacy Deepening & Espionage Edge Cases - Implementation Summary

**Date:** 2026-05-02
**Tasks Completed:** 6/6

---

## Task 1: Treaty Maintenance Bonuses ✅

**Files Modified:**
- `src/game/systems/treaties.ts`

**Implementation:**
- Added `TREATY_MAINTENANCE_BONUSES` constant defining bonus percentages per treaty type:
  - Trade Agreement: -5% maintenance
  - Military Alliance: -15% maintenance
  - Defensive Pact: -10% maintenance
- Implemented `calculateTreatyMaintenanceBonus(state, empireId)` function
- Bonuses stack across multiple treaties, capped at 50% maximum reduction

**Usage:**
```typescript
const maintenanceReduction = calculateTreatyMaintenanceBonus(state, empireId);
// Returns e.g. 25 for -25% maintenance cost
```

---

## Task 2: War Weariness ✅

**Files Modified:**
- `src/game/systems/diplomacy.ts`

**Implementation:**
- Added war weariness constants:
  - `WAR_WEARINESS_MORALE_PER_TURN = 1` (1 morale lost per turn at war)
  - `WAR_WEARINESS_MAX_PENALTY = 20` (capped at -20 morale)
  - `WAR_WEARINESS_PRODUCTION_PENALTY_PER_5_MORALE = 2` (2% production penalty per 5 morale lost)
- Implemented core functions:
  - `calculateWarWeariness(state, empireId)` - returns total morale penalty
  - `calculateWarWearinessProductionPenalty(state, empireId)` - returns production % penalty
  - `getTurnsAtWar(state, empireAId, empireBId)` - returns war duration
  - `declareWar(state, attackerId, defenderId)` - starts war, sets warStartTurn
  - `makePeace(state, empireAId, empireBId)` - ends war, clears warStartTurn

**Formula:**
```
war_weariness = min(turns_at_war × 1, 20) per war
total_weariness = min(sum_of_all_wars, 20)
production_penalty = floor(total_weariness / 5) × 2%
```

---

## Task 3: Defensive Pact Duration Lock ✅

**Files Modified:**
- `src/game/systems/treaties.ts`

**Implementation:**
- Added `DEFENSIVE_PACT_FIXED_DURATION = 30` turns
- Added `BREAK_DEFENSIVE_PACT_EARLY_PENALTY = -50` (vs normal -20)
- Updated `TREATY_DEFAULTS` to set `nonAggressionDuration: 30` for defensive pacts
- Modified `breakTreaty()` to check if breaking early and apply severe penalty
- Added `isDefensivePactEarlyBreak(state, empireAId, empireBId)` helper function

**Behavior:**
- Defensive pacts last exactly 30 turns before they can be broken normally
- Breaking early triggers -50 relationship penalty with ALL empires (vs normal -20)

---

## Task 4: "All Spies Fail" Catastrophic Failure ✅

**Files Modified:**
- `src/game/systems/espionageResolution.ts`

**Implementation:**
- Added `CATASTROPHIC_FAILURE_CHANCE = 2` (2% per empire target per turn)
- In `resolveEspionageMissions()`:
  - Groups missions by sender→target pairs
  - Rolls 2% chance per pair each turn
  - If triggered, ALL active missions from that sender against that target auto-fail
  - All affected spies are marked as detected and killed
  - Creates "Catastrophic Intelligence Failure" event for turn summary

**Behavior:**
- Each turn, for each empire you're spying on, there's a 2% chance ALL your agents against them are compromised simultaneously
- Creates dramatic tension for multi-spy operations

---

## Task 5: Frame Job Mission ✅

**Files Modified:**
- `src/game/state.ts` - Added `'frame_job'` to MissionType union
- `src/game/systems/espionage.ts` - Added mission duration and base success rate
- `src/game/systems/espionageResolution.ts` - Implemented Frame Job effect

**Implementation:**
- Mission type: `frame_job`
- Cost: 3 BC to deploy (tracked elsewhere)
- Duration: 2 turns
- Base success: 35%
- Death risk if caught: 40%
- Relationship penalty if caught: -35
- Effect on success: Steals 5-20% of target's current BC, transfers to attacker

**Constants:**
```typescript
FRAME_JOB_COST = 3
FRAME_JOB_STEAL_MIN_PERCENT = 5
FRAME_JOB_STEAL_MAX_PERCENT = 20
```

---

## Task 6: Nebula Capacity Bonus & Stellar Converter ✅

### 6a: Nebula Capacity Bonus

**Files Modified:**
- `src/game/systems/population.ts`

**Implementation:**
- Added `NEBULA_CAPACITY_BONUS = 15`
- Added `in_nebula?: boolean` to `PopulationPlanetFields` interface
- Added `nebulaBonus` to `MaxPopulationResult` interface
- Updated `calculateMaxPopulation()` to include nebula bonus in capacity calculation

**Formula:**
```
max_pop = (base + terraforming + soil + nebula_bonus) × env_mod × racial_mod
```

### 6b: Stellar Converter Building

**Files Modified:**
- `src/data/buildings.json` - Added Stellar Converter building definition
- `src/game/systems/buildings.ts` - Added handling functions

**Building Definition:**
```json
{
  "id": "stellar_converter",
  "name": "Stellar Converter",
  "category": "terraforming",
  "techRequired": "stellar_converter_tech",
  "cost": 5000,
  "maintenance": 50,
  "effects": {
    "allowsGasGiantTerraforming": true,
    "convertsGasGiantToTerran": true,
    "conversionTurns": 50
  },
  "planetTypeRestriction": ["gas_giant"]
}
```

**Functions Added:**
- `canBuildStellarConverter(planet)` - returns true for gas giants without converter
- `checkStellarConverterProgress(planet, currentTurn)` - tracks conversion progress
- `convertGasGiantToTerran(planet)` - converts gas_giant to terran type with 100 base pop

**Behavior:**
- Can only be built on gas_giant planets
- After 50 turns, converts the planet to terran type
- Converted planet has base population capacity of 100
- Building is consumed in the conversion process

---

## Integration Notes

### War Weariness Integration
To integrate war weariness into production, call:
```typescript
import { calculateWarWearinessProductionPenalty } from './diplomacy';

const penalty = calculateWarWearinessProductionPenalty(state, empireId);
// Apply as: production *= (1 - penalty / 100)
```

### Treaty Maintenance Integration
To integrate treaty bonuses into income phase:
```typescript
import { calculateTreatyMaintenanceBonus } from './treaties';

const bonus = calculateTreatyMaintenanceBonus(state, empireId);
// Apply as: maintenance *= (1 - bonus / 100)
```

### Stellar Converter Integration
Check for completed conversions in turn processing:
```typescript
import { checkStellarConverterProgress, convertGasGiantToTerran } from './buildings';

for (const planet of planets) {
  const progress = checkStellarConverterProgress(planet, state.turn);
  if (progress.conversionComplete) {
    planet = convertGasGiantToTerran(planet);
  }
}
```

---

## Testing Recommendations

1. **Treaty Maintenance:** Verify bonuses stack correctly and cap at 50%
2. **War Weariness:** Test multi-war scenarios, verify morale/production penalties apply
3. **Defensive Pact:** Test early break vs normal break penalty differences
4. **Catastrophic Failure:** Run many espionage turns to verify 2% trigger rate
5. **Frame Job:** Test BC transfer mechanics, verify catch rates
6. **Nebula Bonus:** Verify +15 capacity applies to nebula system planets
7. **Stellar Converter:** Test 50-turn conversion timer and planet type change
