/**
 * Ground combat system — pure TypeScript, NO DOM.
 *
 * Implements planetary invasion and ground combat mechanics.
 * Based on Master of Orion ground combat:
 *   - Orbital bombardment softens defenses before ground assault
 *   - Ground combat compares attacker troops vs. defender troops + defenses
 *   - Racial bonuses apply to both sides
 *   - Winner captures the planet or repels the invasion
 */

import { GameState, EmpireId, Fleet, Planet } from '../state';
import { applyGroundCombatBonus } from './races';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GroundCombatResult {
  attackerId: EmpireId;
  defenderId: EmpireId;
  planetId: string;
  attackerLosses: number;
  defenderLosses: number;
  winner: EmpireId | null;  // null = stalemate/ongoing
  bombardmentBonus: number;  // % bonus from orbital bombardment
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Bombardment bonus percentage per ship in orbit (simplified). */
const BOMBARDMENT_BONUS_PER_SHIP = 5;

/** Maximum bombardment bonus percentage. */
const MAX_BOMBARDMENT_BONUS = 50;

/** Base combat strength per troop unit. */
const BASE_TROOP_STRENGTH = 1;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Calculate ground combat odds given troop counts and modifiers.
 *
 * Formula (simplified Master of Orion approach):
 *   Attacker Effective = attackerTroops × attackerAttackFactor × (1 + bombardmentBonus)
 *   Defender Effective = defenderTroops × defenderDefenseFactor
 *   
 *   Total = Attacker Effective + Defender Effective
 *   Attacker Chance = Attacker Effective / Total
 *   Defender Chance = Defender Effective / Total
 */
export function calculateGroundCombatOdds(
  attackerTroops: number,
  defenderTroops: number,
  defenderDefenseFactor: number,
  attackerAttackFactor: number,
  bombardmentBonus: number,
): { attackerChance: number; defenderChance: number } {
  if (attackerTroops <= 0) {
    return { attackerChance: 0, defenderChance: 1 };
  }
  if (defenderTroops <= 0) {
    return { attackerChance: 1, defenderChance: 0 };
  }

  const bombardmentMultiplier = 1 + bombardmentBonus / 100;
  const attackerEffective = attackerTroops * attackerAttackFactor * bombardmentMultiplier;
  const defenderEffective = defenderTroops * defenderDefenseFactor;

  const total = attackerEffective + defenderEffective;
  
  if (total === 0) {
    return { attackerChance: 0.5, defenderChance: 0.5 };
  }

  return {
    attackerChance: attackerEffective / total,
    defenderChance: defenderEffective / total,
  };
}

/**
 * Execute ground combat phase (bombardment + ground attack).
 *
 * Steps:
 *  1. Calculate bombardment bonus from orbital fleet
 *  2. Apply racial ground combat bonuses
 *  3. Calculate combat odds
 *  4. Resolve combat (apply casualties)
 *  5. If attacker wins, capture planet
 *
 * Returns updated GameState with combat results applied.
 */
export function executeGroundCombat(
  state: GameState,
  attackerId: EmpireId,
  defenderId: EmpireId,
  planetId: string,
): GameState {
  const planet = state.planets.byId[planetId];
  if (!planet) {
    throw new Error(`executeGroundCombat: Planet ${planetId} not found`);
  }

  if (planet.ownerId !== defenderId) {
    throw new Error(`executeGroundCombat: Planet ${planetId} not owned by defender ${defenderId}`);
  }

  // Find attacker fleet at this planet's system
  const attackerFleet = findFleetAtSystem(state, attackerId, planet.systemId);
  if (!attackerFleet) {
    throw new Error(`executeGroundCombat: No attacker fleet found at system ${planet.systemId}`);
  }

  if (attackerFleet.troops <= 0) {
    // No troops to invade with
    return state;
  }

  // 1. Calculate bombardment bonus (based on number of ships in fleet)
  const bombardmentBonus = Math.min(
    attackerFleet.shipIds.length * BOMBARDMENT_BONUS_PER_SHIP,
    MAX_BOMBARDMENT_BONUS,
  );

  // 2. Get racial bonuses
  const attackerRace = state.empires.byId[attackerId]?.raceId;
  const defenderRace = state.empires.byId[defenderId]?.raceId;

  if (!attackerRace || !defenderRace) {
    throw new Error('executeGroundCombat: Missing race data for combatants');
  }

  const attackerStrength = applyGroundCombatBonus(
    attackerFleet.troops * BASE_TROOP_STRENGTH,
    attackerRace,
  );
  
  // Defender gets troops from population + garrison + planet defense factor
  const defenderTroops = Math.floor(planet.population * 0.1); // 10% of pop fights
  const defenderStrength = applyGroundCombatBonus(
    defenderTroops * BASE_TROOP_STRENGTH * planet.groundDefense,
    defenderRace,
  );

  // 3. Calculate odds
  const { attackerChance } = calculateGroundCombatOdds(
    attackerStrength,
    defenderStrength,
    planet.groundDefense,
    planet.groundAttack,
    bombardmentBonus,
  );

  // 4. Resolve combat (simple: compare odds to random roll)
  const roll = Math.random();
  const attackerWins = roll < attackerChance;

  // Calculate casualties (proportional to enemy strength)
  const attackerLosses = attackerWins
    ? Math.floor(attackerFleet.troops * 0.3) // 30% losses on victory
    : attackerFleet.troops; // Total loss on defeat
    
  const defenderLosses = attackerWins
    ? defenderTroops // All defenders eliminated
    : Math.floor(defenderTroops * 0.5); // 50% losses on victory

  // 5. Apply results
  let nextState = state;

  // Update attacker fleet troops
  const updatedFleet: Fleet = {
    ...attackerFleet,
    troops: Math.max(0, attackerFleet.troops - attackerLosses),
  };

  nextState = {
    ...nextState,
    fleets: {
      ...nextState.fleets,
      byId: {
        ...nextState.fleets.byId,
        [attackerFleet.id]: updatedFleet,
      },
    },
  };

  // Update planet
  if (attackerWins) {
    // Attacker captures the planet
    nextState = capturePlanet(nextState, attackerId, planetId);
    
    // Reduce population from combat damage
    const updatedPlanet = nextState.planets.byId[planetId];
    if (updatedPlanet) {
      const populationLoss = defenderLosses / 10; // Convert troop losses to population
      nextState = {
        ...nextState,
        planets: {
          ...nextState.planets,
          byId: {
            ...nextState.planets.byId,
            [planetId]: {
              ...updatedPlanet,
              population: Math.max(1, updatedPlanet.population - populationLoss),
            },
          },
        },
      };
    }
  } else {
    // Defender repels invasion - reduce planet population slightly
    const updatedPlanet: Planet = {
      ...planet,
      population: Math.max(1, planet.population - defenderLosses / 10),
    };

    nextState = {
      ...nextState,
      planets: {
        ...nextState.planets,
        byId: {
          ...nextState.planets.byId,
          [planetId]: updatedPlanet,
        },
      },
    };
  }

  return nextState;
}

/**
 * Transfer troops from a fleet to a planet for invasion.
 * This prepares the fleet to execute an invasion order.
 *
 * Note: Troops are added to the fleet, not removed from the planet.
 * Actual planet→fleet troop movement would require a separate load mechanism.
 */
export function transferTroops(
  state: GameState,
  empireId: EmpireId,
  fleetId: string,
  planetId: string,
): GameState {
  const fleet = state.fleets.byId[fleetId];
  const planet = state.planets.byId[planetId];

  if (!fleet) {
    throw new Error(`transferTroops: Fleet ${fleetId} not found`);
  }
  if (!planet) {
    throw new Error(`transferTroops: Planet ${planetId} not found`);
  }
  if (fleet.ownerId !== empireId) {
    throw new Error(`transferTroops: Fleet ${fleetId} not owned by ${empireId}`);
  }
  if (planet.ownerId !== empireId) {
    throw new Error(`transferTroops: Planet ${planetId} not owned by ${empireId}`);
  }

  // For now, this is a simple placeholder that sets troop count based on population
  // In a full implementation, you'd track garrison troops separately
  const troopsAvailable = Math.floor(planet.population * 0.2); // 20% of pop available as troops
  
  const updatedFleet: Fleet = {
    ...fleet,
    troops: troopsAvailable,
  };

  return {
    ...state,
    fleets: {
      ...state.fleets,
      byId: {
        ...state.fleets.byId,
        [fleetId]: updatedFleet,
      },
    },
  };
}

/**
 * Capture a planet (after victory in ground combat).
 *
 * Changes ownership, resets production sliders, clears build queue.
 * Keeps existing buildings and infrastructure (conquering, not destroying).
 */
export function capturePlanet(
  state: GameState,
  newOwner: EmpireId,
  planetId: string,
): GameState {
  const planet = state.planets.byId[planetId];
  if (!planet) {
    throw new Error(`capturePlanet: Planet ${planetId} not found`);
  }

  const oldOwner = planet.ownerId;

  // Update planet ownership
  const updatedPlanet: Planet = {
    ...planet,
    ownerId: newOwner,
    isColonized: true,
    buildQueue: [],
    production: {
      ship: 0,
      defense: 0,
      industry: 25,
      ecology: 50,
      research: 25,
    },
    morale: 'unrest', // Conquered planets start with low morale
  };

  let nextState: GameState = {
    ...state,
    planets: {
      ...state.planets,
      byId: {
        ...state.planets.byId,
        [planetId]: updatedPlanet,
      },
    },
  };

  // Update empire planet lists
  if (oldOwner) {
    const oldEmpire = nextState.empires.byId[oldOwner];
    if (oldEmpire) {
      nextState = {
        ...nextState,
        empires: {
          ...nextState.empires,
          byId: {
            ...nextState.empires.byId,
            [oldOwner]: {
              ...oldEmpire,
              planets: oldEmpire.planets.filter((id) => id !== planetId),
            },
          },
        },
      };
    }
  }

  const newEmpire = nextState.empires.byId[newOwner];
  if (newEmpire) {
    nextState = {
      ...nextState,
      empires: {
        ...nextState.empires,
        byId: {
          ...nextState.empires.byId,
          [newOwner]: {
            ...newEmpire,
            planets: [...newEmpire.planets, planetId],
          },
        },
      },
    };
  }

  // Update system ownership
  const system = nextState.galaxy.systems.byId[planet.systemId];
  if (system) {
    nextState = {
      ...nextState,
      galaxy: {
        ...nextState.galaxy,
        systems: {
          ...nextState.galaxy.systems,
          byId: {
            ...nextState.galaxy.systems.byId,
            [planet.systemId]: {
              ...system,
              ownerId: newOwner,
            },
          },
        },
      },
    };
  }

  return nextState;
}

// ── UI Simulation: round-by-round combat data ─────────────────────────────────

/** A single round of combat with dice rolls and casualties. */
export interface GroundCombatRoundUI {
  roundNumber: number;
  /** d10 rolls for each attacker troop */
  attackerRolls: number[];
  /** d10 rolls for each defender troop */
  defenderRolls: number[];
  /**
   * Attacker troops lost this round (defender hits that connected).
   * Per design/ui-ux/ground-combat-ui.md §2: each side's hits cause
   * casualties to the OPPOSING side independently.
   */
  attackerCasualties: number;
  /**
   * Defender troops lost this round (attacker hits that connected).
   */
  defenderCasualties: number;
  /** Troops remaining on attacker side after this round */
  attackerRemaining: number;
  /** Troops remaining on defender side after this round */
  defenderRemaining: number;
}

/** Full ground combat simulation result for UI display. */
export interface GroundCombatResultUI {
  attackerName: string;
  defenderName: string;
  planetName: string;
  attackerBonus: number;
  defenderBonus: number;
  rounds: GroundCombatRoundUI[];
  attackerWins: boolean;
  /** Total attacker troops lost across all rounds */
  totalAttackerLosses: number;
  /** Total defender troops lost across all rounds */
  totalDefenderLosses: number;
  /** Remaining attacker troops (0 if lost) */
  attackerRemaining: number;
  /** Remaining defender troops (0 if lost) */
  defenderRemaining: number;
}

/**
 * Simulate ground combat and return round-by-round data for the UI.
 *
 * Combat mechanic (simplified MoO1 style):
 *   - Each round, each troop on each side rolls 1d10.
 *   - A roll of 7+ scores a hit (1 casualty).
 *   - Hits are matched: attacker hits → defender casualties,
 *     defender hits → attacker casualties.
 *   - Combat continues until one side is eliminated.
 *
 * This function does NOT mutate game state — it produces pure display data.
 */
export function simulateGroundCombat(
  attackerName: string,
  defenderName: string,
  planetName: string,
  totalAttackers: number,
  totalDefenders: number,
  attackerBonus = 1,
  defenderBonus = 1
): GroundCombatResultUI {
  let curAtk = Math.round(totalAttackers * attackerBonus);
  let curDef = Math.round(totalDefenders * defenderBonus);

  const rounds: GroundCombatRoundUI[] = [];
  let totalAtkLosses = 0;
  let totalDefLosses = 0;
  let roundNum = 1;

  // Hit threshold: roll >= 7 is a hit (design/ui-ux/ground-combat-ui.md §2 Dice Roll Mechanic).
  // Each troop rolls 1d10; rolls >= 7 score hits against the opposing side.
  // Attacker hits => defender casualties; defender hits => attacker casualties.
  // The bonus multipliers (attackerBonus, defenderBonus) are factored in by
  // adjusting the effective hit threshold for each side:
  //   effectiveThreshold = round(7 / bonus)  — higher bonus = lower threshold = more hits.
  const BASE_HIT_ROLL = 7;
  const atkHitThreshold = Math.max(1, Math.round(BASE_HIT_ROLL / attackerBonus));
  const defHitThreshold = Math.max(1, Math.round(BASE_HIT_ROLL / defenderBonus));

  while (curAtk > 0 && curDef > 0) {
    // Attacker rolls — each troop rolls 1d10
    const attackerRolls: number[] = [];
    for (let i = 0; i < curAtk; i++) {
      attackerRolls.push(Math.ceil(Math.random() * 10));
    }

    // Defender rolls — each troop rolls 1d10
    const defenderRolls: number[] = [];
    for (let i = 0; i < curDef; i++) {
      defenderRolls.push(Math.ceil(Math.random() * 10));
    }

    // Attacker hits => defender casualties; defender hits => attacker casualties
    // Hits are capped to the surviving troop count on the target side.
    const rawAttackerHits = attackerRolls.filter((r) => r >= atkHitThreshold).length;
    const rawDefenderHits = defenderRolls.filter((r) => r >= defHitThreshold).length;

    const defenderCasualties = Math.min(rawAttackerHits, curDef);
    const attackerCasualties = Math.min(rawDefenderHits, curAtk);

    totalAtkLosses += attackerCasualties;
    totalDefLosses += defenderCasualties;
    curAtk -= attackerCasualties;
    curDef -= defenderCasualties;

    rounds.push({
      roundNumber: roundNum,
      attackerRolls,
      defenderRolls,
      attackerCasualties,
      defenderCasualties,
      attackerRemaining: curAtk,
      defenderRemaining: curDef,
    });

    roundNum++;
  }

  return {
    attackerName,
    defenderName,
    planetName,
    attackerBonus,
    defenderBonus,
    rounds,
    attackerWins: curAtk > 0,
    totalAttackerLosses: totalAtkLosses,
    totalDefenderLosses: totalDefLosses,
    attackerRemaining: curAtk,
    defenderRemaining: curDef,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Find a fleet owned by an empire at a specific system.
 */
function findFleetAtSystem(
  state: GameState,
  empireId: EmpireId,
  systemId: string,
): Fleet | null {
  for (const fleetId of state.empires.byId[empireId]?.fleets ?? []) {
    const fleet = state.fleets.byId[fleetId];
    if (fleet && fleet.systemId === systemId) {
      return fleet;
    }
  }
  return null;
}
