/**
 * AI Threat Assessment — pure TypeScript, NO DOM.
 * src/game/ai/threatAssessment.ts
 *
 * Implements the 5-component weighted Threat_Score formula from:
 *   design/technical/ai-implementation.md §1 Threat Assessment Scoring
 *
 * Formula:
 *   Threat_Score = floor(
 *     (Military_Threat × 0.40) +
 *     (Economic_Threat × 0.25) +
 *     (Tech_Threat × 0.15) +
 *     (Proximity_Threat × 0.10) +
 *     (Hostility_Threat × 0.10)
 *   )
 *
 * Output range: 0–100 (clamped).
 * This replaces the old binary isUnderThreat() heuristic.
 */

import { GameState, EmpireId } from '../state';
import { getEmpireFleetPower } from './strategies';
import { getPersonalityProfile } from './ai-personalities';

// ── §1.2 Weight constants ─────────────────────────────────────────────────────

const W_MILITARY   = 0.40;
const W_ECONOMIC   = 0.25;
const W_TECH       = 0.15;
const W_PROXIMITY  = 0.10;
const W_HOSTILITY  = 0.10;

// ── §1.8 Racial threat perception multipliers ──────────────────────────────────

const RACIAL_THREAT_MODIFIERS: Record<string, number> = {
  guinea_pigs:  0.70,  // Overconfident warriors
  ferrets:      0.85,  // Predator confidence
  budgies:      0.90,  // Warrior's pride
  hamsters:     1.00,  // Balanced assessment
  mice:         1.00,  // Logical calculation
  rats:         1.00,  // Scientific analysis
  ants:         1.10,  // Collective caution
  chameleons:   1.10,  // Paranoid spies
  rabbits:      1.30,  // Fearful prey
  hermit_crabs: 0.80,  // Confident in defenses
};

// ── §1.3 Military Threat ──────────────────────────────────────────────────────

/**
 * Military_Threat = floor(min(100, (Enemy_Fleet_Power / Our_Fleet_Power) × 50))
 *
 * If our fleet power is 0, enemy with any fleet is a 100-point threat.
 */
function calculateMilitaryThreat(
  ourPower: number,
  enemyPower: number,
): number {
  if (ourPower <= 0) return enemyPower > 0 ? 100 : 0;
  return Math.floor(Math.min(100, (enemyPower / ourPower) * 50));
}

// ── §1.4 Economic Threat ──────────────────────────────────────────────────────

/**
 * Total_Production = Σ (Planet_Net_Production) for all planets.
 * We approximate using the industry production slider × factories.
 * Since we don't have net BC per planet readily, we count planets as a proxy
 * (each colonized planet = 1 production unit) weighted by production slider.
 *
 * Economic_Threat = floor(min(100, (Enemy_Production / Our_Production) × 50))
 */
function getEmpireProduction(empireId: EmpireId, state: GameState): number {
  const empire = state.empires.byId[empireId];
  if (!empire) return 1;

  let total = 0;
  for (const planetId of empire.planets) {
    const planet = state.planets.byId[planetId];
    if (!planet || !planet.isColonized) continue;
    // Use factories as the proxy for net production capacity
    total += Math.max(1, planet.factories * (planet.production.industry / 100));
  }
  return Math.max(1, total);
}

function calculateEconomicThreat(
  ourProduction: number,
  enemyProduction: number,
): number {
  return Math.floor(Math.min(100, (enemyProduction / ourProduction) * 50));
}

// ── §1.5 Technology Threat ────────────────────────────────────────────────────

/**
 * Avg_Tech_Level = Σ (Highest_Tech_In_Field) / 6
 * Tech_Gap = Enemy_Avg_Tech_Level - Our_Avg_Tech_Level
 * Tech_Threat = floor(min(100, Tech_Gap × 10))
 *
 * We proxy tech level by counting completed techs per field.
 * The 6 fields are: weapons, propulsion, construction, computers, force_fields, biotechnology.
 */
const TECH_FIELDS = ['weapons', 'propulsion', 'construction', 'computers', 'force_fields', 'biotechnology'] as const;

function getEmpireAvgTechLevel(empireId: EmpireId, state: GameState): number {
  const empire = state.empires.byId[empireId];
  if (!empire) return 0;

  // Count completed techs per field and use count as a proxy for tech level
  let totalTechLevel = 0;
  for (const field of TECH_FIELDS) {
    const available = empire.research.availableTechs[field as keyof typeof empire.research.availableTechs] ?? [];
    const completed = empire.research.completedTechs.filter((_t) => {
      // We approximate: any completed tech contributes to overall level
      return true;
    }).length;
    // Use available + completed as proxy; in the absence of per-field tier data
    // count available (unlocked but not yet researched) + completed total / 6
    totalTechLevel += available.length;
    void completed;
  }
  // More accurate: count completedTechs total / 6 fields
  const avgFromCompleted = (empire.research.completedTechs.length) / 6;
  return Math.max(0, avgFromCompleted + (totalTechLevel / 6) * 0.1);
}

function calculateTechThreat(
  ourAvgTech: number,
  enemyAvgTech: number,
): number {
  const techGap = enemyAvgTech - ourAvgTech;
  return Math.floor(Math.min(100, Math.max(0, techGap * 10)));
}

// ── §1.6 Proximity Threat ─────────────────────────────────────────────────────

/**
 * Proximity_Threat = floor(100 - (Distance_To_Nearest_Enemy_Colony × 5))
 * Minimum: 0 (very far). Maximum: 100 (adjacent).
 *
 * Distance is the shortest Euclidean distance (parsecs) between any of our
 * colonies and any of their colonies.
 */
function calculateProximityThreat(
  empireId: EmpireId,
  enemyId: EmpireId,
  state: GameState,
): number {
  const ourEmpire   = state.empires.byId[empireId];
  const theirEmpire = state.empires.byId[enemyId];
  if (!ourEmpire || !theirEmpire) return 0;

  let minDistance = Infinity;

  for (const ourPlanetId of ourEmpire.planets) {
    const ourPlanet = state.planets.byId[ourPlanetId];
    if (!ourPlanet) continue;
    const ourSystem = state.galaxy.systems.byId[ourPlanet.systemId];
    if (!ourSystem) continue;

    for (const theirPlanetId of theirEmpire.planets) {
      const theirPlanet = state.planets.byId[theirPlanetId];
      if (!theirPlanet) continue;
      const theirSystem = state.galaxy.systems.byId[theirPlanet.systemId];
      if (!theirSystem) continue;

      const dx = ourSystem.coordinates.x - theirSystem.coordinates.x;
      const dy = ourSystem.coordinates.y - theirSystem.coordinates.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) minDistance = dist;
    }
  }

  if (!isFinite(minDistance)) return 0;
  return Math.floor(Math.max(0, 100 - minDistance * 5));
}

// ── §1.7 Hostility Threat ─────────────────────────────────────────────────────

/**
 * Hostility_Threat = floor((50 - Relationship) × 1.0)
 * Clamped to [0, 100].
 * At War (relation ~ -100): ≈150 → clamped to 100.
 * Neutral (0): 50.
 * Allied (+100): -50 → clamped to 0.
 */
function calculateHostilityThreat(relationValue: number): number {
  return Math.floor(Math.max(0, Math.min(100, (50 - relationValue))));
}

// ── §1.2 Combined Threat Score ────────────────────────────────────────────────

export interface ThreatAssessment {
  /** 0-100: combined weighted score */
  totalScore: number;
  /** 0-100 each component */
  militaryThreat: number;
  economicThreat: number;
  techThreat: number;
  proximityThreat: number;
  hostilityThreat: number;
  /** Threat classification per §1.9 */
  level: 'negligible' | 'minor' | 'moderate' | 'serious' | 'critical';
}

/**
 * Calculate the full weighted Threat_Score for a given enemy empire.
 *
 * Design reference: design/technical/ai-implementation.md §1.2
 *
 * Threat_Score = floor(
 *   (Military_Threat × 0.40) +
 *   (Economic_Threat × 0.25) +
 *   (Tech_Threat × 0.15) +
 *   (Proximity_Threat × 0.10) +
 *   (Hostility_Threat × 0.10)
 * )
 *
 * Then multiplied by the racial threat perception modifier (§1.8).
 */
export function calculateThreatScore(
  empireId: EmpireId,
  enemyId: EmpireId,
  state: GameState,
): ThreatAssessment {
  // §1.3 Military Threat
  const ourPower    = getEmpireFleetPower(empireId, state);
  const enemyPower  = getEmpireFleetPower(enemyId, state);
  const militaryThreat = calculateMilitaryThreat(ourPower, enemyPower);

  // §1.4 Economic Threat
  const ourProduction    = getEmpireProduction(empireId, state);
  const enemyProduction  = getEmpireProduction(enemyId, state);
  const economicThreat   = calculateEconomicThreat(ourProduction, enemyProduction);

  // §1.5 Technology Threat
  const ourTech   = getEmpireAvgTechLevel(empireId, state);
  const enemyTech = getEmpireAvgTechLevel(enemyId, state);
  const techThreat = calculateTechThreat(ourTech, enemyTech);

  // §1.6 Proximity Threat
  const proximityThreat = calculateProximityThreat(empireId, enemyId, state);

  // §1.7 Hostility Threat
  const empire      = state.empires.byId[empireId];
  const relation    = empire?.relations[enemyId];
  const relValue    = relation?.value ?? 0;
  const hostilityThreat = calculateHostilityThreat(relValue);

  // §1.2 Weighted sum
  const rawScore = Math.floor(
    (militaryThreat  * W_MILITARY)  +
    (economicThreat  * W_ECONOMIC)  +
    (techThreat      * W_TECH)      +
    (proximityThreat * W_PROXIMITY) +
    (hostilityThreat * W_HOSTILITY),
  );

  // §1.8 Apply racial threat modifier
  const raceId   = state.aiEmpires[empireId]?.raceId ?? 'hamsters';
  const modifier = RACIAL_THREAT_MODIFIERS[raceId] ?? 1.0;
  const totalScore = Math.floor(Math.min(100, Math.max(0, rawScore * modifier)));

  // §1.9 Classification
  let level: ThreatAssessment['level'];
  if (totalScore <= 20)       level = 'negligible';
  else if (totalScore <= 40)  level = 'minor';
  else if (totalScore <= 60)  level = 'moderate';
  else if (totalScore <= 80)  level = 'serious';
  else                        level = 'critical';

  return {
    totalScore,
    militaryThreat,
    economicThreat,
    techThreat,
    proximityThreat,
    hostilityThreat,
    level,
  };
}

/**
 * Evaluate threat from all other empires and return the highest score.
 * Used to decide whether the AI should switch to defensive posture.
 */
export function getMaxThreatScore(empireId: EmpireId, state: GameState): number {
  let max = 0;
  for (const otherId of state.empires.allIds) {
    if (otherId === empireId) continue;
    const other = state.empires.byId[otherId];
    if (!other || other.isDefeated) continue;
    const assessment = calculateThreatScore(empireId, otherId, state);
    if (assessment.totalScore > max) max = assessment.totalScore;
  }
  return max;
}

/**
 * Return whether the AI empire faces a "critical" or "serious" threat
 * from any opponent, replacing the old binary isUnderThreat() heuristic.
 *
 * §1.9 Threat Classification:
 *   0-20 Negligible | 21-40 Minor | 41-60 Moderate | 61-80 Serious | 81-100 Critical
 */
export function isUnderSignificantThreat(
  empireId: EmpireId,
  state: GameState,
  threshold: number = 60,   // 'moderate' or higher
): boolean {
  return getMaxThreatScore(empireId, state) >= threshold;
}

/**
 * Get the personality profile's racial threat modifier for display/logging.
 */
export function getRacialThreatModifier(raceId: string): number {
  return RACIAL_THREAT_MODIFIERS[raceId] ?? 1.0;
}

// Re-export for convenience
export { getPersonalityProfile };
