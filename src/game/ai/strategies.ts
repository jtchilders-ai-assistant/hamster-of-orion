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
  fleetSizeThreshold: number = 1.5,
): boolean {
  const enemies = getWarEnemies(empireId, state);
  if (enemies.length > 0) return true;

  // Check if any neighbor has a much larger fleet (using fleet power, not ship count)
  const myFleetPower = getEmpireFleetPower(empireId, state);
  const empire = state.empires.byId[empireId];
  if (!empire) return false;

  for (const otherId of state.empires.allIds) {
    if (otherId === empireId) continue;
    const rel = empire.relations[otherId] as { state: DiplomaticState } | undefined;
    if (!rel) continue;
    if (rel.state === 'war' || rel.state === 'unfriendly') {
      const theirPower = getEmpireFleetPower(otherId, state);
      if (theirPower > myFleetPower * fleetSizeThreshold) return true;
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

export interface ColonizationCandidate {
  planetId: PlanetId;
  systemId: SystemId;
  score: number;
  distance: number;
}

/**
 * Score a planet for colonization desirability.
 *
 * Higher is better:
 *   - Resource richness bonus: ultra_rich=4, rich=2, normal=0, poor=-1, ultra_poor=-2
 *   - Size bonus: huge=4, large=3, medium=2, small=1, tiny=0
 *   - Artifacts bonus: +2
 *   - Gaia bonus: +3
 */
export function scorePlanetForColonization(planet: Planet): number {
  let score = 0;

  // Resource richness
  switch (planet.resourceLevel) {
    case 'ultra_rich': score += 4; break;
    case 'rich': score += 2; break;
    case 'normal': score += 0; break;
    case 'poor': score -= 1; break;
    case 'ultra_poor': score -= 2; break;
  }

  // Size
  switch (planet.size) {
    case 'huge': score += 4; break;
    case 'large': score += 3; break;
    case 'medium': score += 2; break;
    case 'small': score += 1; break;
    case 'tiny': score += 0; break;
  }

  if (planet.hasArtifacts) score += 2;
  if (planet.isGaia) score += 3;

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

      const score = scorePlanetForColonization(planet);
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
 *   - A neighbour has a larger fleet (relative to personality aggression), OR
 *   - Phase is mid/late and aggression is high
 */
export function shouldBuildMilitary(
  empireId: EmpireId,
  state: GameState,
  aiEmpire: AIEmpire,
  phase: GamePhase,
): boolean {
  const enemies = getWarEnemies(empireId, state);
  if (enemies.length > 0) return true;

  if (isUnderThreat(empireId, state, aiEmpire.weights.fleetSizeThreshold)) return true;

  if (phase !== 'early' && aiEmpire.personality.aggression > 50) return true;

  return false;
}

/**
 * Return the enemy fleet IDs that the AI should attack this turn.
 * Condition: the AI fleet is at the same system as an enemy fleet AND the
 * AI fleet is large enough relative to the enemy (fleetSizeThreshold).
 *
 * Uses fleet power calculation per design/technical/ai-implementation.md §1.3
 * instead of simple ship counts.
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

  const attacks: Array<{ attackerFleetId: FleetId; targetSystemId: SystemId }> = [];
  const threshold = aiEmpire.weights.fleetSizeThreshold;

  for (const fleetId of empire.fleets) {
    const fleet = state.fleets.byId[fleetId];
    if (!fleet || fleet.destination !== null) continue; // already moving
    if (fleetHasColonyShip(fleet, state)) continue; // don't send colony ships to fight

    // Calculate our fleet's power using the Ship_Power formula
    const myStrength = calculateFleetPower(fleet, state);

    for (const enemyId of enemies) {
      const enemyEmpire = state.empires.byId[enemyId];
      if (!enemyEmpire) continue;

      // Find enemy systems (planets owned by enemy)
      for (const planetId of enemyEmpire.planets) {
        const planet = state.planets.byId[planetId];
        if (!planet) continue;

        // Calculate total enemy fleet power at that system
        const enemySystem = state.galaxy.systems.byId[planet.systemId];
        if (!enemySystem) continue;

        let enemyStrength = 0;
        for (const eFleetId of enemySystem.fleetIds) {
          const eFleet = state.fleets.byId[eFleetId];
          if (eFleet && eFleet.ownerId === enemyId) {
            enemyStrength += calculateFleetPower(eFleet, state);
          }
        }

        if (myStrength > enemyStrength * threshold) {
          attacks.push({ attackerFleetId: fleetId, targetSystemId: planet.systemId });
          break; // one target per fleet per turn
        }
      }
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
