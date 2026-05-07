/**
 * AI strategy helpers — pure TypeScript, NO DOM.
 * src/game/ai/strategies.ts
 *
 * Provides situational analysis and decision-making functions used by the
 * main AIEmpire processor.  All functions are pure and unit-testable.
 *
 * References:
 *   design/species/ai-archetypes.md   — personality types
 *   src/game/state.ts                 — GameState, AIEmpire, Empire, Planet
 */

import {
  GameState,
  AIEmpire,
  Planet,
  Fleet,
  ShipDesign,
  PlanetId,
  SystemId,
  FleetId,
  EmpireId,
  PlanetProduction,
  DiplomaticState,
  ShipClass,
} from '../state';
import { HULL_BASE_HP, ARMOR_MULTIPLIERS } from '../constants';
// Note: threatAssessment.ts imports getEmpireFleetPower from this file, creating a potential
// circular dependency. Do NOT import from './threatAssessment' here — use isUnderThreat() instead.

// ── Racial AI Modifiers ────────────────────────────────────────────────────────
// Source: design/technical/ai-implementation.md §1.8 and §2.10

/**
 * Racial threat perception modifiers.
 * Applied as: Final_Threat = floor(Base_Threat × Racial_Threat_Modifier)
 *
 * Values < 1.0 mean the race underestimates threats (overconfident).
 * Values > 1.0 mean the race overestimates threats (paranoid/fearful).
 *
 * Source: design/technical/ai-implementation.md §1.8
 */
const RACIAL_THREAT_MODIFIERS: Record<string, number> = {
  guinea_pigs: 0.70,    // Overconfident warriors
  ferrets: 0.85,        // Predator confidence
  budgies: 0.90,        // Warrior's pride
  hamsters: 1.00,       // Balanced assessment
  mice: 1.00,           // Logical calculation
  rats: 1.00,           // Scientific analysis
  ants: 1.10,           // Collective caution
  chameleons: 1.10,     // Paranoid spies
  rabbits: 1.30,        // Fearful prey
  hermit_crabs: 0.80,   // Confident in defenses
};

/**
 * Racial expansion weight multipliers.
 * Applied as: Final_Score = floor(Expansion_Score × Racial_Expansion_Weight)
 *
 * Source: design/technical/ai-implementation.md §2.10
 */
const RACIAL_EXPANSION_WEIGHTS: Record<string, number> = {
  rabbits: 1.40,        // Population-focused
  ants: 1.25,           // Industrial expansion
  hamsters: 1.10,       // Balanced growth
  guinea_pigs: 1.05,    // Conquest over colonization
  budgies: 1.00,        // Standard
  mice: 1.00,           // Standard
  ferrets: 0.95,        // Hunting over settling
  chameleons: 1.00,     // Standard
  rats: 0.90,           // Research over expansion
  hermit_crabs: 0.80,   // Slow, careful expansion
};

/**
 * Apply racial threat perception modifier to a raw threat score.
 * Implements design/technical/ai-implementation.md §1.8:
 *   Final_Threat = floor(Base_Threat × Racial_Threat_Modifier)
 */
export function applyRacialThreatModifier(raceId: string, baseThreat: number): number {
  const modifier = RACIAL_THREAT_MODIFIERS[raceId] ?? 1.0;
  return Math.min(100, Math.floor(baseThreat * modifier));
}

/**
 * Apply racial expansion weight to a planet colonization score.
 * Implements design/technical/ai-implementation.md §2.10:
 *   Final_Score = floor(Expansion_Score × Racial_Expansion_Weight)
 */
export function applyRacialExpansionWeight(raceId: string, baseScore: number): number {
  const weight = RACIAL_EXPANSION_WEIGHTS[raceId] ?? 1.0;
  return Math.floor(baseScore * weight);
}

// ── Situation analysis ─────────────────────────────────────────────────────────

/** Phase of the game for production-priority decisions. */
export type GamePhase = 'early' | 'mid' | 'late';

/**
 * Determine the current game phase based on turn number.
 *  - Early:  turns 1–50
 *  - Mid:    turns 51–150
 *  - Late:   turns > 150
 */
export function getGamePhase(turn: number): GamePhase {
  if (turn <= 50) return 'early';
  if (turn <= 150) return 'mid';
  return 'late';
}

/**
 * Return all empire IDs that are currently at war with the given empire.
 */
export function getWarEnemies(
  empireId: EmpireId,
  state: GameState,
): EmpireId[] {
  const empire = state.empires.byId[empireId];
  if (!empire) return [];
  return Object.entries(empire.relations)
    .filter(([, rel]) => (rel as { state: DiplomaticState }).state === 'war')
    .map(([id]) => id);
}

/**
 * Return whether the given empire is currently under threat — either at war
 * or a neighboring empire has a significantly larger fleet.
 *
 * Uses fleet power calculation per design/technical/ai-implementation.md §1.3
 * instead of simple ship counts.
 */
export function isUnderThreat(
  empireId: EmpireId,
  state: GameState,
  _fleetSizeThreshold: number = 1.5,
): boolean {
  const enemies = getWarEnemies(empireId, state);
  if (enemies.length > 0) return true;

  // Check if any neighbor has a much larger fleet (using fleet power, not ship count).
  // Apply racial threat perception modifier so fearful races (Rabbits) feel threatened
  // at lower power differentials, and overconfident races (Guinea Pigs) require a
  // larger gap before they feel threatened.
  // Source: design/technical/ai-implementation.md §1.8
  const myFleetPower = getEmpireFleetPower(empireId, state);
  const empire = state.empires.byId[empireId];
  if (!empire) return false;

  const raceId = empire.raceId ?? 'hamsters';

  for (const otherId of state.empires.allIds) {
    if (otherId === empireId) continue;
    const rel = empire.relations[otherId] as { state: DiplomaticState } | undefined;
    if (!rel) continue;
    if (rel.state === 'war' || rel.state === 'unfriendly') {
      const theirPower = getEmpireFleetPower(otherId, state);
      // Compute base threat ratio (0-100 scale)
      const baseThreat = myFleetPower > 0
        ? Math.min(100, Math.floor((theirPower / myFleetPower) * 50))
        : 100;
      // Apply racial perception modifier
      const perceivedThreat = applyRacialThreatModifier(raceId, baseThreat);
      // Threat is "serious" (>60) → empire feels threatened
      if (perceivedThreat > 60) return true;
    }
  }
  return false;
}

/**
 * Calculate the power rating for a single ship based on its design.
 *
 * Formula (design/technical/ai-implementation.md §1.3):
 *   Ship_Power = floor(
 *     (Hull_HP × Armor_Multiplier × 0.5) +
 *     (Total_Weapon_Damage × 2.0) +
 *     (Shield_Class × 5) +
 *     (Speed × 3)
 *   )
 */
export function calculateShipPower(design: ShipDesign): number {
  // Get base HP from hull size
  const hullHP = HULL_BASE_HP[design.class as ShipClass] ?? HULL_BASE_HP.medium;

  // Find armor multiplier from components
  let armorMultiplier = 1.0;
  for (const comp of design.components) {
    if (comp.type === 'armor') {
      // Normalize armor name to match constants (e.g., 'Zortrium Armor' → 'zortrium')
      const armorName = comp.name.toLowerCase().replace(/\s*armor\s*/i, '').trim();
      armorMultiplier = ARMOR_MULTIPLIERS[armorName] ?? ARMOR_MULTIPLIERS[comp.id] ?? 1.0;
      break;
    }
  }

  // Calculate total weapon damage
  let totalWeaponDamage = 0;
  const weapons = design.stats?.weapons ?? [];
  for (const weapon of weapons) {
    // Parse damage string (e.g., "2-8" or "10")
    const damageStr = weapon.damage ?? '';
    const damageMatch = damageStr.match(/(\d+)(?:-(\d+))?/);
    if (damageMatch) {
      const minDmg = parseInt(damageMatch[1], 10) || 0;
      const maxDmg = parseInt(damageMatch[2], 10) || minDmg;
      // Use average damage for power calculation
      totalWeaponDamage += (minDmg + maxDmg) / 2;
    }
  }

  // Get shield class from defense summary
  const shieldClass = design.stats.defense.shields ?? 0;

  // Get speed from stats
  const speed = design.stats.speed ?? 1;

  // Apply the formula from design doc
  const power = Math.floor(
    (hullHP * armorMultiplier * 0.5) +
    (totalWeaponDamage * 2.0) +
    (shieldClass * 5) +
    (speed * 3)
  );

  return Math.max(1, power); // Minimum power of 1
}

/**
 * Calculate the total fleet power for a single fleet.
 *
 * Formula (design/technical/ai-implementation.md §1.3):
 *   Fleet_Power = Σ (Ship_Power × Ship_Count) for all ship designs
 */
export function calculateFleetPower(fleet: Fleet, state: GameState): number {
  let totalPower = 0;

  for (const shipId of fleet.shipIds) {
    const ship = state.ships.byId[shipId];
    if (!ship) continue;

    const design = state.shipDesigns.byId[ship.designId];
    if (!design) continue;

    const shipPower = calculateShipPower(design);

    // Adjust power based on ship's current HP vs max HP
    const hpRatio = ship.maxHp > 0 ? ship.hp / ship.maxHp : 1;
    totalPower += Math.floor(shipPower * hpRatio);
  }

  return totalPower;
}

/**
 * Calculate total fleet power for an entire empire.
 *
 * This replaces the simple ship count with actual power calculation
 * per design/technical/ai-implementation.md §1.3.
 */
export function getEmpireFleetPower(empireId: EmpireId, state: GameState): number {
  const empire = state.empires.byId[empireId];
  if (!empire) return 0;

  let totalPower = 0;
  for (const fleetId of empire.fleets) {
    const fleet = state.fleets.byId[fleetId];
    if (fleet) {
      totalPower += calculateFleetPower(fleet, state);
    }
  }

  return totalPower;
}

/**
 * Count total ships across all fleets for an empire.
 *
 * @deprecated Use getEmpireFleetPower() for threat assessment.
 * This is kept for backwards compatibility and simple ship counting.
 */
export function getEmpireFleetSize(empireId: EmpireId, state: GameState): number {
  const empire = state.empires.byId[empireId];
  if (!empire) return 0;
  let total = 0;
  for (const fleetId of empire.fleets) {
    const fleet = state.fleets.byId[fleetId];
    if (fleet) total += fleet.shipIds.length;
  }
  return total;
}

// ── Production slider decisions ────────────────────────────────────────────────

/**
 * Compute the production slider allocation for a single planet based on
 * game phase, threat level, and AI personality.
 *
 * All five values sum to exactly 100.
 */
export function computeProductionSliders(
  _planet: Planet,
  aiEmpire: AIEmpire,
  phase: GamePhase,
  threatened: boolean,
): PlanetProduction {
  const { personality } = aiEmpire;

  if (threatened) {
    // Crisis mode: maximise SHIP and DEF
    const shipBase = 40 + Math.round(personality.aggression * 0.3);
    const defBase = 30;
    const indBase = 15;
    const ecoBase = 10;
    const resBase = 100 - shipBase - defBase - indBase - ecoBase;
    return normalise({ ship: shipBase, defense: defBase, industry: indBase, ecology: ecoBase, research: resBase });
  }

  switch (phase) {
    case 'early': {
      // Priority: IND and colony ships; secondary: ECO for growth
      const ship = 20 + Math.round(personality.aggression * 0.15);
      const defense = 5;
      const industry = 40 + Math.round((100 - personality.research) * 0.1);
      const ecology = 20 + Math.round(personality.diplomacy * 0.05);
      const research = 100 - ship - defense - industry - ecology;
      return normalise({ ship, defense, industry, ecology, research });
    }

    case 'mid': {
      // Balance between SHIP, DEF, TECH
      const ship = 20 + Math.round(personality.aggression * 0.2);
      const defense = 15 + Math.round(personality.aggression * 0.1);
      const industry = 20;
      const ecology = 15;
      const research = 100 - ship - defense - industry - ecology;
      return normalise({ ship, defense, industry, ecology, research });
    }

    case 'late':
    default: {
      // Peaceful focus or aggression depending on personality
      if (personality.aggression > 60) {
        const ship = 35;
        const defense = 20;
        const industry = 15;
        const ecology = 10;
        const research = 20;
        return normalise({ ship, defense, industry, ecology, research });
      }
      // Peaceful: prioritise TECH and ECO
      const ship = 10;
      const defense = 10;
      const industry = 20;
      const ecology = 25;
      const research = 35;
      return normalise({ ship, defense, industry, ecology, research });
    }
  }
}

/**
 * Clamp all slider values to [0, 100] and redistribute so they sum to 100.
 * Proportionally scales all sliders if the sum exceeds 100.
 */
function normalise(raw: PlanetProduction): PlanetProduction {
  let ship = Math.max(0, raw.ship);
  let defense = Math.max(0, raw.defense);
  let industry = Math.max(0, raw.industry);
  let ecology = Math.max(0, raw.ecology);
  let research = Math.max(0, raw.research);

  const sum = ship + defense + industry + ecology + research;
  if (sum === 0) {
    // Default: split evenly
    return { ship: 20, defense: 20, industry: 20, ecology: 20, research: 20 };
  }

  // Scale proportionally to sum to 100
  const scale = 100 / sum;
  ship = Math.round(ship * scale);
  defense = Math.round(defense * scale);
  industry = Math.round(industry * scale);
  ecology = Math.round(ecology * scale);
  research = Math.round(research * scale);

  // Adjust research to account for rounding errors
  const newSum = ship + defense + industry + ecology + research;
  research += (100 - newSum);

  return { ship, defense, industry, ecology, research };
}

// ── Colony ship detection ──────────────────────────────────────────────────────

/**
 * Return whether the given fleet contains at least one colony ship.
 * We detect colony ships by checking the ship's design components for any
 * component with id containing 'colony'.
 */
export function fleetHasColonyShip(fleet: Fleet, state: GameState): boolean {
  for (const shipId of fleet.shipIds) {
    const ship = state.ships.byId[shipId];
    if (!ship) continue;
    const design = state.shipDesigns.byId[ship.designId];
    if (!design) continue;
    for (const comp of design.components) {
      if (comp.id.toLowerCase().includes('colony')) return true;
    }
  }
  return false;
}

/**
 * Return whether the given fleet contains only military ships
 * (no colony components, at least one weapon or combat design).
 */
export function fleetIsMilitary(fleet: Fleet, state: GameState): boolean {
  if (fleet.shipIds.length === 0) return false;
  return !fleetHasColonyShip(fleet, state);
}

// ── Expansion target selection ────────────────────────────────────────────────
//
// Per design/technical/ai-implementation.md §2 Expansion Priority Scoring

export interface ColonizationCandidate {
  planetId: PlanetId;
  systemId: SystemId;
  score: number;
  distance: number;
}

/**
 * Base expansion value by planet size.
 * Source: design/technical/ai-implementation.md §2.3
 */
const EXPANSION_BASE_VALUE: Record<string, number> = {
  tiny: 20,
  small: 40,
  medium: 60,
  large: 80,
  huge: 100,
};

/**
 * Environment modifier for expansion scoring.
 * Source: design/technical/ai-implementation.md §2.4
 */
const EXPANSION_ENVIRONMENT_MODIFIER: Record<string, number> = {
  radiated: -40,
  toxic: -35,
  inferno: -30,
  dead: -25,
  tundra: -20,
  barren: -15,
  minimal: 0,
  desert: 5,
  steppe: 10,
  arid: 15,
  ocean: 20,
  jungle: 25,
  terran: 40,
  gaia: 60,
};

/**
 * Resource modifier for expansion scoring.
 * Source: design/technical/ai-implementation.md §2.5
 */
const EXPANSION_RESOURCE_MODIFIER: Record<string, number> = {
  ultra_poor: -30,
  poor: -15,
  normal: 0,
  rich: 30,
  ultra_rich: 50,
};

/**
 * Distance penalty per parsec.
 * Source: design/technical/ai-implementation.md §2.7
 */
const DISTANCE_PENALTY_PER_PARSEC = 3;

/**
 * Artifacts world bonus.
 * Source: design/technical/ai-implementation.md §2.6
 */
const ARTIFACTS_BONUS = 40;

/**
 * Homeworld capture bonus.
 * Source: design/technical/ai-implementation.md §2.6
 */
const HOMEWORLD_CAPTURE_BONUS = 60;

/**
 * Competition penalty per competing empire in range.
 * Source: design/technical/ai-implementation.md §2.9
 */
const COMPETITION_PENALTY_PER_EMPIRE = 10;

/**
 * Additional competition penalty when another empire is closer to the planet.
 * Source: design/technical/ai-implementation.md §2.9
 */
const COMPETITION_CLOSER_PENALTY = 20;

/**
 * Score a planet for colonization desirability.
 *
 * Implements the full Expansion_Score formula from design/technical/ai-implementation.md §2.2:
 *   Expansion_Score = floor(
 *     Base_Value +
 *     Environment_Modifier +
 *     Resource_Modifier +
 *     Distance_Penalty +
 *     Special_Bonus +
 *     Strategic_Bonus +
 *     Competition_Modifier
 *   )
 *
 * The context-dependent Strategic_Bonus and Competition_Modifier require
 * additional game state and are applied in findColonizationTargets().
 * This function computes the context-independent components only.
 */
export function scorePlanetForColonization(
  planet: Planet,
  distance: number = 0,
): number {
  // Base value by planet size (§2.3)
  const baseValue = EXPANSION_BASE_VALUE[planet.size] ?? 60;

  // Environment modifier (§2.4)
  // If planet.isGaia is true, use gaia modifier (+60) instead of base type
  // This handles planets that are flagged as gaia regardless of their base type
  const envType = planet.isGaia ? 'gaia' : planet.type;
  const envModifier = EXPANSION_ENVIRONMENT_MODIFIER[envType] ?? 0;

  // Resource modifier (§2.5)
  const resourceModifier = EXPANSION_RESOURCE_MODIFIER[planet.resourceLevel] ?? 0;

  // Distance penalty (§2.7): -Distance_In_Parsecs × 3
  const distancePenalty = -distance * DISTANCE_PENALTY_PER_PARSEC;

  // Special bonuses (§2.6)
  let specialBonus = 0;
  if (planet.hasArtifacts) specialBonus += ARTIFACTS_BONUS;
  // Note: Homeworld capture bonus is handled separately in strategic scoring

  const score = Math.floor(
    baseValue + envModifier + resourceModifier + distancePenalty + specialBonus
  );

  return score;
}

/**
 * Find candidate uncolonized planets for an empire, sorted by score
 * (descending) then by distance (ascending) as a tiebreaker.
 *
 * Only planets in systems the empire has visibility of are considered
 * (for simplicity, all galaxy systems are iterated — fog-of-war is a
 * future enhancement).
 */
export function findColonizationTargets(
  empireId: EmpireId,
  state: GameState,
  maxCandidates: number = 5,
): ColonizationCandidate[] {
  const empire = state.empires.byId[empireId];
  if (!empire || empire.planets.length === 0) return [];

  // Resolve race ID for racial expansion weight
  // Source: design/technical/ai-implementation.md §2.10
  const raceId = empire.raceId ?? 'hamsters';

  // Compute empire "center of gravity" from owned planets
  let cx = 0;
  let cy = 0;
  let count = 0;
  for (const planetId of empire.planets) {
    const planet = state.planets.byId[planetId];
    if (!planet) continue;
    const system = state.galaxy.systems.byId[planet.systemId];
    if (!system) continue;
    cx += system.coordinates.x;
    cy += system.coordinates.y;
    count++;
  }
  if (count === 0) return [];
  cx /= count;
  cy /= count;

  const candidates: ColonizationCandidate[] = [];

  for (const systemId of state.galaxy.systems.allIds) {
    const system = state.galaxy.systems.byId[systemId];
    if (!system) continue;
    if (system.hasSpaceMonster || system.hasGuardian) continue;

    for (const planetId of system.planetIds) {
      const planet = state.planets.byId[planetId];
      if (!planet) continue;
      if (planet.ownerId !== null) continue;
      if (!planet.isColonized === false) continue; // safety: should be false if unowned
      if (planet.type === 'gas_giant') continue;

      const dx = system.coordinates.x - cx;
      const dy = system.coordinates.y - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Base colonization score including distance penalty (§2.2–§2.7)
      const baseScore = scorePlanetForColonization(planet, distance);

      // §2.8 Strategic_Bonus — context-dependent factors
      let strategicBonus = 0;

      // +20 if the planet is in a system near Orion
      if (system.isOrion) strategicBonus += 20;

      // +60 if this is a captured homeworld
      if (planet.isHomeworld) strategicBonus += HOMEWORLD_CAPTURE_BONUS;

      // Check if this system is on the border with an enemy empire
      let onEnemyBorder = false;
      for (const otherId of state.empires.allIds) {
        if (otherId === empireId) continue;
        const otherEmpire = state.empires.byId[otherId];
        if (!otherEmpire) continue;
        const rel = empire.relations[otherId] as { state: DiplomaticState } | undefined;
        if (!rel) continue;

        // Check adjacency: any other empire planet within 8 parsecs = border
        for (const theirPlanetId of otherEmpire.planets) {
          const theirPlanet = state.planets.byId[theirPlanetId];
          if (!theirPlanet) continue;
          const theirSystem = state.galaxy.systems.byId[theirPlanet.systemId];
          if (!theirSystem) continue;
          const bdx = system.coordinates.x - theirSystem.coordinates.x;
          const bdy = system.coordinates.y - theirSystem.coordinates.y;
          if (Math.sqrt(bdx * bdx + bdy * bdy) < 8) {
            if (rel.state === 'war' || rel.state === 'unfriendly') {
              onEnemyBorder = true;
            }
            break;
          }
        }
        if (onEnemyBorder) break;
      }
      if (onEnemyBorder) strategicBonus += 15; // §2.8: +15 if planet is on border with enemy

      // §2.8: +20 if planet would complete control of star system
      //  (all other planets in this system are either ours, gas giants, or this target)
      const otherPlanetsInSystem = system.planetIds.filter(pid => pid !== planetId);
      const allControlled = otherPlanetsInSystem.every(pid => {
        const p = state.planets.byId[pid];
        return p && (p.ownerId === empireId || p.type === 'gas_giant');
      });
      if (allControlled && otherPlanetsInSystem.length > 0) {
        strategicBonus += 20; // Complete system control
      }

      // §2.8: -20 if planet is exposed (easily attacked)
      //  Exposed means: on border AND we have no other planets within 5 parsecs for defense
      if (onEnemyBorder) {
        let hasNearbyDefense = false;
        for (const ourPlanetId of empire.planets) {
          const ourPlanet = state.planets.byId[ourPlanetId];
          if (!ourPlanet) continue;
          const ourSystem = state.galaxy.systems.byId[ourPlanet.systemId];
          if (!ourSystem) continue;
          const ddx = system.coordinates.x - ourSystem.coordinates.x;
          const ddy = system.coordinates.y - ourSystem.coordinates.y;
          if (Math.sqrt(ddx * ddx + ddy * ddy) <= 5) {
            hasNearbyDefense = true;
            break;
          }
        }
        if (!hasNearbyDefense) {
          strategicBonus -= 20; // Exposed position
        }
      }

      // §2.9 Competition_Modifier — penalty when other empires are also in range
      let competitionModifier = 0;
      for (const otherId of state.empires.allIds) {
        if (otherId === empireId) continue;
        const otherEmpire = state.empires.byId[otherId];
        if (!otherEmpire || otherEmpire.planets.length === 0) continue;

        // Compute other empire's center of gravity
        let ocx = 0, ocy = 0, oc = 0;
        for (const oPlanetId of otherEmpire.planets) {
          const op = state.planets.byId[oPlanetId];
          if (!op) continue;
          const os = state.galaxy.systems.byId[op.systemId];
          if (!os) continue;
          ocx += os.coordinates.x;
          ocy += os.coordinates.y;
          oc++;
        }
        if (oc === 0) continue;
        ocx /= oc;
        ocy /= oc;

        const theirDistToPlanet = Math.sqrt(
          (system.coordinates.x - ocx) ** 2 + (system.coordinates.y - ocy) ** 2
        );

        // Another empire in range of this planet
        if (theirDistToPlanet < distance + 10) {
          competitionModifier -= COMPETITION_PENALTY_PER_EMPIRE; // §2.9: -10 per empire
          // Additional penalty if they're closer than us
          if (theirDistToPlanet < distance) {
            competitionModifier -= COMPETITION_CLOSER_PENALTY; // §2.9: -20 if closer
          }
        }
      }

      const expansionScore = baseScore + strategicBonus + competitionModifier;

      // §2.10 Apply racial expansion weight multiplier:
      //   Final_Score = floor(Expansion_Score × Racial_Expansion_Weight)
      const score = applyRacialExpansionWeight(raceId, expansionScore);

      candidates.push({ planetId, systemId, score, distance });
    }
  }

  // Sort: score descending, then distance ascending
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.distance - b.distance;
  });

  return candidates.slice(0, maxCandidates);
}

// ── Military decisions ─────────────────────────────────────────────────────────

/**
 * Return true when the AI should build military ships this turn.
 * Conditions:
 *   - At war with any empire, OR
 *   - Under significant threat (weighted 5-component score ≥60 per §1.2), OR
 *   - Phase is mid/late and aggression is high
 *
 * @param precomputedThreat - Optional pre-computed threat flag from
 *   threatAssessment.isUnderSignificantThreat().  When provided, it is used
 *   directly instead of the legacy isUnderThreat() heuristic, avoiding the
 *   circular-dependency that would arise if strategies.ts imported
 *   threatAssessment.ts directly (threatAssessment imports getEmpireFleetPower
 *   from this file).  AIEmpire.ts always passes this pre-computed value.
 */
export function shouldBuildMilitary(
  empireId: EmpireId,
  state: GameState,
  aiEmpire: AIEmpire,
  phase: GamePhase,
  precomputedThreat?: boolean,
): boolean {
  const enemies = getWarEnemies(empireId, state);
  if (enemies.length > 0) return true;

  // Use pre-computed weighted threat score when available (injected by AIEmpire.ts);
  // fall back to legacy binary heuristic for direct unit-test callers.
  const threatened = precomputedThreat ?? isUnderThreat(empireId, state, aiEmpire.weights.fleetSizeThreshold);
  if (threatened) return true;

  if (phase !== 'early' && aiEmpire.personality.aggression > 50) return true;

  return false;
}

/**
 * Return the enemy fleet IDs that the AI should attack this turn, using the
 * weighted Target_Score formula from design/technical/ai-implementation.md §4.3:
 *
 *   Target_Score = floor(
 *     Objective_Value +      §4.4
 *     Success_Probability +  §4.5
 *     Strategic_Importance + §4.6
 *     Distance_Factor +      §4.7
 *     Risk_Assessment        §4.8
 *   )
 *
 * Only targets with Target_Score > 0 are selected.
 * Each fleet attacks the highest-scoring target.
 */
export function selectAttackTargets(
  empireId: EmpireId,
  state: GameState,
  aiEmpire: AIEmpire,
): Array<{ attackerFleetId: FleetId; targetSystemId: SystemId }> {
  const enemies = getWarEnemies(empireId, state);
  if (enemies.length === 0) return [];

  const empire = state.empires.byId[empireId];
  if (!empire) return [];

  // Compute our empire's center of gravity (for distance calculations)
  let ecx = 0, ecy = 0, ec = 0;
  for (const planetId of empire.planets) {
    const p = state.planets.byId[planetId];
    if (!p) continue;
    const sys = state.galaxy.systems.byId[p.systemId];
    if (!sys) continue;
    ecx += sys.coordinates.x;
    ecy += sys.coordinates.y;
    ec++;
  }
  if (ec > 0) { ecx /= ec; ecy /= ec; }

  const attacks: Array<{ attackerFleetId: FleetId; targetSystemId: SystemId }> = [];
  // Personality aggression modifies attack willingness:
  // more aggressive AIs attack even marginal targets (score > -10 threshold for aggression > 70)
  const attackScoreThreshold = aiEmpire.personality.aggression > 70 ? -10 : 0;

  for (const fleetId of empire.fleets) {
    const fleet = state.fleets.byId[fleetId];
    if (!fleet || fleet.destination !== null) continue; // already moving
    if (fleetHasColonyShip(fleet, state)) continue;     // colony ships don’t attack

    // §1.3 Our fleet power
    const myStrength = calculateFleetPower(fleet, state);
    if (myStrength === 0) continue;

    // Fleet cost (for Risk_Assessment)
    const fleetValue = fleet.shipIds.reduce((sum, sid) => {
      const ship = state.ships.byId[sid];
      if (!ship) return sum;
      const design = state.shipDesigns.byId[ship.designId];
      return sum + (design?.stats?.cost ?? 0);
    }, 0);

    let bestScore = attackScoreThreshold; // Threshold based on aggression personality
    let bestTarget: SystemId | null = null;

    for (const enemyId of enemies) {
      const enemyEmpire = state.empires.byId[enemyId];
      if (!enemyEmpire) continue;

      for (const planetId of enemyEmpire.planets) {
        const planet = state.planets.byId[planetId];
        if (!planet) continue;

        const targetSystem = state.galaxy.systems.byId[planet.systemId];
        if (!targetSystem) continue;

        // §4.4 Objective_Value
        let objectiveValue: number;
        const prod = planet.production;
        const planetProduction = prod
          ? prod.ship + prod.defense + prod.industry + prod.ecology + prod.research
          : 0;
        if (planet.isHomeworld) {
          objectiveValue = 150; // Attack Enemy Homeworld
        } else {
          objectiveValue = 40 + (planetProduction * 2); // Attack Enemy Colony
        }

        // §4.5 Success_Probability
        // Total enemy fleet power at target system
        let enemyFleetPower = 0;
        for (const eFleetId of targetSystem.fleetIds) {
          const eFleet = state.fleets.byId[eFleetId];
          if (eFleet && eFleet.ownerId === enemyId) {
            enemyFleetPower += calculateFleetPower(eFleet, state);
          }
        }
        // Planet_Defense_Power = (Missile_Bases × 100) + (Planetary_Shields × 20)
        const missileBases = planet.missileBases ?? 0;
        const planetaryShield = planet.planetaryShield ?? 0;
        const planetDefensePower = (missileBases * 100) + (planetaryShield * 20);
        const totalOpposition = enemyFleetPower + planetDefensePower;

        let successProbability: number;
        if (totalOpposition === 0) {
          successProbability = 100; // Undefended
        } else {
          successProbability = Math.floor(50 * (myStrength / totalOpposition));
          successProbability = Math.max(-50, Math.min(100, successProbability));
        }

        // §4.6 Strategic_Importance
        let strategicImportance = 0;

        // +25 if target threatens our production (enemy has planets near ours)
        const nearOurPlanet = empire.planets.some(ourPlanetId => {
          const ourP = state.planets.byId[ourPlanetId];
          if (!ourP) return false;
          const ourSys = state.galaxy.systems.byId[ourP.systemId];
          if (!ourSys) return false;
          const dx = targetSystem.coordinates.x - ourSys.coordinates.x;
          const dy = targetSystem.coordinates.y - ourSys.coordinates.y;
          return Math.sqrt(dx * dx + dy * dy) < 6;
        });
        if (nearOurPlanet) strategicImportance += 25;

        // +30 if blocking expansion (enemy controls a high-value system we want)
        if (targetSystem.hasArtifacts || targetSystem.isOrion) strategicImportance += 30;

        // -10 if peripheral (far from our gravity center)
        const tdx = targetSystem.coordinates.x - ecx;
        const tdy = targetSystem.coordinates.y - ecy;
        const distFromCenter = Math.sqrt(tdx * tdx + tdy * tdy);
        if (distFromCenter > 20) strategicImportance -= 10;

        // §4.7 Distance_Factor: floor(40 - Distance_In_Parsecs × 3), min -50
        // Compute distance from our fleet's current system
        const fleetSystem = state.galaxy.systems.byId[fleet.systemId];
        let distanceParsecs = 0;
        if (fleetSystem) {
          const fdx = targetSystem.coordinates.x - fleetSystem.coordinates.x;
          const fdy = targetSystem.coordinates.y - fleetSystem.coordinates.y;
          distanceParsecs = Math.sqrt(fdx * fdx + fdy * fdy);
        }
        const distanceFactor = Math.max(-50, Math.floor(40 - distanceParsecs * 3));

        // §4.8 Risk_Assessment: -floor((Loss_Probability × Fleet_Value) / 100)
        const lossProbability = 100 - successProbability;
        const riskAssessment = -Math.floor((lossProbability * fleetValue) / 100);

        // §4.3 Target_Score
        const targetScore = Math.floor(
          objectiveValue +
          successProbability +
          strategicImportance +
          distanceFactor +
          riskAssessment,
        );

        if (targetScore > bestScore) {
          bestScore = targetScore;
          bestTarget = planet.systemId;
        }
      }
    }

    if (bestTarget !== null) {
      attacks.push({ attackerFleetId: fleetId, targetSystemId: bestTarget });
    }
  }

  return attacks;
}

/**
 * Find idle AI fleets with colony ships that are not yet en route anywhere.
 */
export function getIdleColonyFleets(
  empireId: EmpireId,
  state: GameState,
): Fleet[] {
  const empire = state.empires.byId[empireId];
  if (!empire) return [];

  const idle: Fleet[] = [];
  for (const fleetId of empire.fleets) {
    const fleet = state.fleets.byId[fleetId];
    if (!fleet) continue;
    if (fleet.destination !== null) continue; // already moving
    if (fleetHasColonyShip(fleet, state)) idle.push(fleet);
  }
  return idle;
}
