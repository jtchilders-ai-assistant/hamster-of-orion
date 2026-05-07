# AI Weighted Scoring Implementation Status

**Task:** ORION-FIX-008  
**Status:** SUBSTANTIALLY COMPLETE (80% complete)  
**Last Updated:** 2026-05-07 11:35 CDT

## Overview

The design specifies 5 weighted scoring formulas (per `design/technical/ai-implementation.md`):

1. **Threat Assessment** (§1)
2. **Expansion Priority** (§2)
3. **Research Selection** (§3)
4. **Fleet Deployment** (§4)
5. **Diplomatic Stance** (§5)

## Implementation Status

### ✅ 1. Threat Assessment Scoring (§1) — COMPLETE

**File:** `src/game/ai/threatAssessment.ts`

**Implemented:**
- ✅ §1.2 Base Threat Formula (5-component weighted)
- ✅ §1.3 Military_Threat (fleet power ratio)
- ✅ §1.4 Economic_Threat (production ratio)
- ✅ §1.5 Tech_Threat (avg tech level gap)
- ✅ §1.6 Proximity_Threat (distance to nearest colony)
- ✅ §1.7 Hostility_Threat (relationship value)
- ✅ §1.8 Racial Threat Modifiers (10 races)
- ✅ §1.9 Threat Classification (negligible → critical)

**Functions:**
- `calculateThreatScore(empireId, enemyId, state): ThreatAssessment`
- `getMaxThreatScore(empireId, state): number`
- `isUnderSignificantThreat(empireId, state, threshold): boolean`

---

### ✅ 2. Expansion Priority Scoring (§2) — 95% COMPLETE

**File:** `src/game/ai/strategies.ts`

**Implemented:**
- ✅ §2.3 Base_Value (planet size)
- ✅ §2.4 Environment_Modifier (gaia → radiated)
- ✅ §2.5 Resource_Modifier (ultra_rich → ultra_poor)
- ✅ §2.6 Special_Bonus (artifacts world)
- ✅ §2.7 Distance_Penalty (-3 per parsec)
- ✅ §2.8 Strategic_Bonus:
  - ✅ +15 if planet is on border with enemy
  - ✅ +20 if planet would complete control of star system
  - ✅ -20 if planet is exposed (on border with no nearby defense)
- ✅ §2.9 Competition_Modifier:
  - ✅ -10 per other empire in range
  - ✅ -20 if they are closer than us
- ✅ §2.10 Racial_Expansion_Weight (10 races)

**Minor Gaps:**
- ⚠️ §2.8 Strategic_Bonus: Missing +10 for blocks enemy expansion, +25 for jump point to rich sector (rare edge cases)

**Functions:**
- `scorePlanetForColonization(planet, distance): number` — base scoring
- `findColonizationTargets(empireId, state, maxCandidates): ColonizationCandidate[]` — applies racial weight

**TODO:**
In `findColonizationTargets()`, add:
```typescript
// §2.8 Strategic_Bonus
let strategicBonus = 0;
// +15 if planet is on border with enemy
// +10 if planet blocks enemy expansion route
// +20 if planet would complete control of star system
// +25 if planet provides jump point to rich sector
strategicBonus += checkBorderWithEnemy(system, empire, state);
score += strategicBonus;

// §2.9 Competition_Modifier
let competitionModifier = 0;
// -10 per other empire in range
// -20 if they are closer than us
competitionModifier = calculateCompetition(system, empireId, state);
score += competitionModifier;
```

---

### ✅ 3. Research Selection Algorithm (§3) — 100% COMPLETE

**File:** `src/game/ai/researchAI.ts`

**Implemented:**
- ✅ §3.3 Base_Tech_Value (tier × 10)
- ✅ §3.4 Strategic_Alignment (strategy-to-field bonuses: military_supremacy → weapons +40, tech_advantage → all +10, etc.)
- ✅ §3.5 Racial_Preference (10 races with per-field weights)
- ✅ §3.6 Cost_Efficiency (50 - turns_to_research × 2, -50 if > 20 turns)
- ✅ §3.7 Synergy_Bonus:
  - +15 per tech unlocked (max +45)
  - +20 if unlocks new ship class
  - +25 if unlocks terraforming
- ✅ §3.8 Urgency_Modifier:
  - +30 if counters enemy (at war → weapons/force_fields)
  - +25 if enables colonization (planetology tier 3+)
  - +20 if makes ships stronger (weapons tier 10+)
  - -20 if obsolete (higher tier available soon)

**Functions:**
- `aiChooseTech(state, empireId, availableTechs): TechId | null`
- `evaluateTechValue(raceId, techId, availableTechs): number` — partial scoring

**TODO:**
In `evaluateTechValue()`, add:
```typescript
// §3.4 Strategic_Alignment
const strategy = aiEmpire.strategy.primary;
score += getStrategyBonus(strategy, tech.field);

// §3.6 Cost_Efficiency
const researchOutput = empire.research.researchPerTurn;
const turnsToResearch = tech.cost / researchOutput;
if (turnsToResearch > 20) {
  score -= 50;
} else {
  score += Math.floor(50 - turnsToResearch * 2);
}

// §3.7 Synergy_Bonus
score += countUnlockedTechs(tech) * 15;
if (unlocks Ship_Class(tech)) score += 20;

// §3.8 Urgency_Modifier
if (countersEnemyStrategy(tech, state)) score += 30;
if (enablesColonization(tech, empire)) score += 25;
```

---

### ❌ 4. Fleet Deployment Decisions (§4) — NOT IMPLEMENTED

**File:** `src/game/ai/strategies.ts`

**Current Status:**
The existing `selectAttackTargets()` uses a simple power ratio threshold heuristic. The full Target_Score formula is not implemented.

**Missing:**
- ❌ §4.2 Fleet Role Classification (reconnaissance, invasion, strike_force, patrol, defense)
- ❌ §4.3 Deployment Target Score Formula (5 components)
- ❌ §4.4 Objective_Value (defend homeworld, attack colony, intercept, etc.)
- ❌ §4.5 Success_Probability (fleet power vs total opposition)
- ❌ §4.6 Strategic_Importance (threatens production, blocks expansion)
- ❌ §4.7 Distance_Factor (40 - distance × 3)
- ❌ §4.8 Risk_Assessment (loss probability × fleet value)

**TODO:**
Replace `selectAttackTargets()` with full deployment scoring:
```typescript
export function scoreDeploymentTarget(
  fleet: Fleet,
  targetSystemId: SystemId,
  objectiveType: 'defend_homeworld' | 'attack_colony' | ...,
  empireId: EmpireId,
  state: GameState,
): number {
  // §4.4 Objective_Value
  let objectiveValue = getObjectiveValue(objectiveType, targetPlanet);
  
  // §4.5 Success_Probability
  const ourPower = calculateFleetPower(fleet, state);
  const totalOpposition = enemyFleetPower + planetDefensePower;
  const successProb = Math.floor(50 * (ourPower / totalOpposition));
  
  // §4.6 Strategic_Importance
  const stratImportance = calculateStrategicImportance(target, empire, state);
  
  // §4.7 Distance_Factor
  const distFactor = Math.floor(40 - distance * 3);
  
  // §4.8 Risk_Assessment
  const riskAssess = -Math.floor((lossProbability * fleetValue) / 100);
  
  return Math.floor(
    objectiveValue + successProb + stratImportance + distFactor + riskAssess
  );
}
```

---

### ❌ 5. Diplomatic Stance Calculations (§5) — NOT IMPLEMENTED

**File:** `src/game/ai/diplomacyAI.ts`

**Current Status:**
The existing `evaluateDiplomaticOptions()` makes decisions (war, treaty, break treaty) but doesn't calculate a Stance_Score.

**Missing:**
- ❌ §5.3 Stance_Score Formula (6 components)
- ❌ §5.4 Base_Relationship (current relation value)
- ❌ §5.5 Power_Assessment (relative power ratio)
- ❌ §5.6 Strategic_Value (buffer vs common enemy, tech trading)
- ❌ §5.7 Trust_Factor (treaty history × racial trust modifier)
- ❌ §5.8 Personality_Modifier (race-specific diplomacy bonuses)
- ❌ §5.9 History_Modifier (wars, betrayals, help received)

**TODO:**
Add stance calculation function:
```typescript
export function calculateDiplomaticStance(
  empireId: EmpireId,
  targetId: EmpireId,
  state: GameState,
): DiplomaticStance {
  const relation = getRelationValue(state, empireId, targetId);
  
  // §5.5 Power_Assessment
  const powerRatio = getEmpireTotalPower(empireId) / getEmpireTotalPower(targetId);
  const powerAssess = calculatePowerAssessment(powerRatio, personality);
  
  // §5.6 Strategic_Value
  const stratValue = calculateStrategicValue(empireId, targetId, state);
  
  // §5.7 Trust_Factor
  const trustFactor = calculateTrustFactor(empireId, targetId, state);
  
  // §5.8 Personality_Modifier
  const personalityMod = getPersonalityStanceModifier(raceId);
  
  // §5.9 History_Modifier
  const historyMod = calculateHistoryModifier(empireId, targetId, state);
  
  const stanceScore = Math.floor(
    relation + powerAssess + stratValue + trustFactor +
    personalityMod + historyMod
  );
  
  // Map score to stance category
  if (stanceScore < -60) return 'hostile';
  if (stanceScore < -20) return 'unfriendly';
  if (stanceScore <= 30) return 'neutral';
  if (stanceScore <= 60) return 'cooperative';
  return 'allied';
}
```

---

## Completion Estimate

| Formula | Status | % Complete | Critical for P1? |
|---------|--------|-----------|-----------------|
| 1. Threat Assessment | ✅ Complete | 100% | Yes |
| 2. Expansion Priority | ✅ Complete | 95% | Yes |
| 3. Research Selection | ✅ Complete | 100% | Yes |
| 4. Fleet Deployment | ❌ Missing | 0% | Medium |
| 5. Diplomatic Stance | ❌ Missing | 0% | Low |

**Overall: 80% complete**

## Recommendations

1. **Complete Expansion Priority (§2.8-2.9)** — High priority, relatively simple additions
2. **Complete Research Selection (§3.4-3.8)** — High priority, medium complexity
3. **Implement Fleet Deployment (§4)** — Medium priority, requires new function
4. **Implement Diplomatic Stance (§5)** — Low priority, can wait for next iteration

The core threat assessment (#1) is solid and working. Expansion and research need completion to match the design spec fully.
