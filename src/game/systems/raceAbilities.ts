/**
 * Race special abilities system — pure TypeScript, NO DOM.
 * src/game/systems/raceAbilities.ts
 *
 * Provides functions to query and apply race-specific special abilities
 * during gameplay. These abilities are defined in races.json and implemented
 * here for use by other game systems.
 *
 * References:
 *   design/species/race-stats-complete.md — ability definitions
 *   src/data/races.json — ability data
 */

import { RaceId } from '../state';
import { getRace, hasAbility } from './races';

// ── Ability Effect Constants ──────────────────────────────────────────────────

/** Hamsters: +25% trade income bonus */
export const HAMSTER_TRADE_BONUS = 25;

/** Hamsters: +20 starting relations (Universal Diplomat) */
export const HAMSTER_STARTING_RELATIONS_BONUS = 20;

/** Hamsters: -25% colonization penalty reduction */
export const HAMSTER_COLONIZATION_PENALTY_REDUCTION = 25;

/** Ants: +50% colony development speed (Rapid Industrialization) */
export const ANT_COLONY_DEVELOPMENT_BONUS = 50;

/** Ants: -10% military cost reduction (Expendable Units) */
export const ANT_MILITARY_COST_REDUCTION = 10;

/** Ants: +25% max population bonus (Overpopulation) */
export const ANT_MAX_POPULATION_BONUS = 25;

/** Mice: +50% factory efficiency (Automated Production) */
export const MICE_FACTORY_EFFICIENCY = 50;

/** Mice: +2 Robotic Controls level bonus */
export const MICE_RC_LEVEL_BONUS = 2;

/** Mice: +50% pollution reduction */
export const MICE_POLLUTION_REDUCTION = 50;

/** Mice: +50% reverse engineering speed */
export const MICE_REVERSE_ENGINEERING_SPEED = 50;

/** Rats: +50% research cost reduction (Genius Researchers) */
export const RAT_RESEARCH_COST_REDUCTION = 50;

/** Rats: Minimum tech choices per field (Academic Network) */
export const RAT_MIN_TECH_CHOICES = 3;

/** Rats: 5% chance per turn for free tech (Eureka Moments) */
export const RAT_FREE_TECH_CHANCE = 5;

/** Rabbits: 2.0× growth multiplier (Exponential Growth) */
export const RABBIT_GROWTH_MULTIPLIER = 2.0;

/** Rabbits: 50% colony setup reduction (Rapid Colonization) */
export const RABBIT_COLONY_SETUP_REDUCTION = 50;

/** Rabbits: 15% ship cost reduction (Swarm Tactics) */
export const RABBIT_SHIP_COST_REDUCTION = 15;

/** Hermit Crabs: +50% ground defense bonus (Armored Shell) */
export const HERMIT_CRAB_GROUND_DEFENSE_BONUS = 50;

/** Hermit Crabs: +2 minerals per asteroid belt (Mineral Consumption) */
export const HERMIT_CRAB_ASTEROID_MINING = 2;

/** Guinea Pigs: +50% ground damage bonus (Warrior Culture) */
export const GUINEA_PIG_GROUND_DAMAGE_BONUS = 50;

/** Guinea Pigs: +25% troop morale (Warrior Culture) */
export const GUINEA_PIG_MORALE_BONUS = 25;

/** Guinea Pigs: 50% faster conquest integration (Relentless) */
export const GUINEA_PIG_INTEGRATION_SPEED = 50;

/** Ferrets: +4 weapon attack levels (Deadly Accuracy) */
export const FERRET_ATTACK_LEVEL_BONUS = 4;

/** Ferrets: +10% ship cost reduction (Efficient Killers) */
export const FERRET_SHIP_COST_REDUCTION = 10;

/** Ferrets: +50% cloak detection bonus (Hunter's Instinct) */
export const FERRET_CLOAK_DETECTION_BONUS = 50;

/** Budgies: +3 combat initiative (Superior Pilots) */
export const BUDGIE_INITIATIVE_BONUS = 3;

/** Budgies: +3 defense level (Superior Pilots) */
export const BUDGIE_DEFENSE_LEVEL_BONUS = 3;

/** Budgies: +20% evasion (Superior Pilots) */
export const BUDGIE_EVASION_BONUS = 20;

/** Budgies: -30% enemy missile accuracy (Three-Dimensional Tactics) */
export const BUDGIE_ENEMY_MISSILE_PENALTY = 30;

/** Budgies: +15% small ship combat bonus (Dogfighter) */
export const BUDGIE_SMALL_SHIP_BONUS = 15;

/** Chameleons: +50% espionage cost reduction (Master Spies) */
export const CHAMELEON_ESPIONAGE_COST_REDUCTION = 50;

/** Chameleons: +25% espionage success bonus (Master Spies) */
export const CHAMELEON_ESPIONAGE_SUCCESS_BONUS = 25;

/** Chameleons: +50% tech theft bonus (Technology Theft) */
export const CHAMELEON_TECH_THEFT_BONUS = 50;

/** Chameleons: Max sabotage delay turns (Sleeper Agents) */
export const CHAMELEON_SLEEPER_AGENT_MAX_DELAY = 5;

// ── Ability Query Functions ───────────────────────────────────────────────────

/**
 * Check if a race is immune to morale penalties/unrest.
 * Applies to: Ants (hive_mind), Hermit Crabs (patient)
 */
export function isImmuneToMorale(raceId: RaceId): boolean {
  return hasAbility(raceId, 'perfect_efficiency') ||
         hasAbility(raceId, 'patient');
}

/**
 * Check if a race is immune to espionage.
 * Applies to: Ants (hive_mind)
 */
export function isImmuneToEspionage(raceId: RaceId): boolean {
  const race = getRace(raceId);
  return race.immuneToEspionage;
}

/**
 * Check if a race can conduct espionage operations.
 * Applies to: All except Ants (hive_mind)
 */
export function canConductEspionage(raceId: RaceId): boolean {
  const race = getRace(raceId);
  return race.canConductEspionage;
}

/**
 * Check if a race has universal colonization (no planet restrictions).
 * Applies to: Hermit Crabs
 */
export function hasUniversalColonization(raceId: RaceId): boolean {
  return hasAbility(raceId, 'universal_adaptation');
}

/**
 * Check if a race cannot terraform.
 * Applies to: Hermit Crabs
 */
export function cannotTerraform(raceId: RaceId): boolean {
  return hasAbility(raceId, 'cannot_terraform');
}

/**
 * Check if a race has no food requirement.
 * Applies to: Hermit Crabs
 */
export function hasNoFoodRequirement(raceId: RaceId): boolean {
  return hasAbility(raceId, 'no_food_requirement');
}

/**
 * Check if a race has no pollution cost.
 * Applies to: Hermit Crabs
 */
export function hasNoPollutionCost(raceId: RaceId): boolean {
  return hasAbility(raceId, 'no_pollution_cost');
}

/**
 * Check if a race has no refit costs for ship upgrades.
 * Applies to: Mice
 */
export function hasNoRefitCosts(raceId: RaceId): boolean {
  return hasAbility(raceId, 'no_refit_costs');
}

/**
 * Check if a race has first strike combat initiative.
 * Applies to: Ferrets
 */
export function hasFirstStrike(raceId: RaceId): boolean {
  return hasAbility(raceId, 'first_strike');
}

/**
 * Check if a race can reverse-engineer captured tech instantly.
 * Applies to: Rats
 */
export function hasInstantReverseEngineering(raceId: RaceId): boolean {
  return hasAbility(raceId, 'quick_study');
}

/**
 * Check if a race is immune to false intelligence.
 * Applies to: Rats
 */
export function isImmuneToFalseIntel(raceId: RaceId): boolean {
  return hasAbility(raceId, 'scientific_method');
}

/**
 * Check if a race can frame other races for espionage.
 * Applies to: Chameleons
 */
export function canFrameOtherRaces(raceId: RaceId): boolean {
  return hasAbility(raceId, 'false_flags');
}

/**
 * Check if a race can transfer population instantly.
 * Applies to: Rabbits
 */
export function hasInstantPopulationTransfer(raceId: RaceId): boolean {
  return hasAbility(raceId, 'overflow_population');
}

/**
 * Check if a race is immune to battle morale loss.
 * Applies to: Guinea Pigs
 */
export function isImmuneToBattleMoraleLoss(raceId: RaceId): boolean {
  return hasAbility(raceId, 'fearless');
}

/**
 * Check if a race can colonize high-gravity worlds without penalty.
 * Applies to: Guinea Pigs
 */
export function hasNoHighGravityPenalty(raceId: RaceId): boolean {
  return hasAbility(raceId, 'heavy_worlders');
}

/**
 * Check if a race can work hostile environments without penalty.
 * Applies to: Mice, Hermit Crabs
 */
export function hasNoHostileEnvironmentPenalty(raceId: RaceId): boolean {
  return hasAbility(raceId, 'robotic_labor') ||
         hasAbility(raceId, 'radiation_immunity');
}

// ── Ability Effect Functions ──────────────────────────────────────────────────

/**
 * Get the factory efficiency multiplier for a race.
 * Mice factories operate at 150% normal efficiency.
 */
export function getFactoryEfficiencyMultiplier(raceId: RaceId): number {
  if (hasAbility(raceId, 'automated_production')) {
    return 1.5; // 50% bonus
  }
  return 1.0;
}

/**
 * Get the effective Robotic Controls level bonus for a race.
 * Mice start with +2 RC levels above baseline.
 */
export function getRoboticControlsBonus(raceId: RaceId): number {
  if (hasAbility(raceId, 'cybernetic_workers')) {
    return MICE_RC_LEVEL_BONUS;
  }
  return 0;
}

/**
 * Get the research cost reduction for a race.
 * Rats pay 50% less RP for tech.
 */
export function getResearchCostReduction(raceId: RaceId): number {
  if (hasAbility(raceId, 'genius_researchers')) {
    return RAT_RESEARCH_COST_REDUCTION;
  }
  return 0;
}

/**
 * Get minimum tech choices per research field.
 * Rats always get at least 3 choices.
 */
export function getMinTechChoices(raceId: RaceId): number {
  if (hasAbility(raceId, 'academic_network')) {
    return RAT_MIN_TECH_CHOICES;
  }
  return 1; // Default is 1
}

/**
 * Get population growth multiplier for a race.
 * Rabbits have doubled growth rate.
 */
export function getGrowthMultiplier(raceId: RaceId): number {
  if (hasAbility(raceId, 'exponential_growth')) {
    return RABBIT_GROWTH_MULTIPLIER;
  }
  return 1.0;
}

/**
 * Get colony setup time reduction for a race.
 * Rabbits colonize 50% faster.
 */
export function getColonySetupReduction(raceId: RaceId): number {
  if (hasAbility(raceId, 'rapid_colonization')) {
    return RABBIT_COLONY_SETUP_REDUCTION;
  }
  if (hasAbility(raceId, 'rapid_industrialization')) {
    return ANT_COLONY_DEVELOPMENT_BONUS;
  }
  return 0;
}

/**
 * Get ship cost reduction for a race.
 * Rabbits: 15%, Ferrets: 10%
 */
export function getShipCostReduction(raceId: RaceId): number {
  if (hasAbility(raceId, 'swarm_tactics')) {
    return RABBIT_SHIP_COST_REDUCTION;
  }
  if (hasAbility(raceId, 'efficient_killers')) {
    return FERRET_SHIP_COST_REDUCTION;
  }
  return 0;
}

/**
 * Get military cost reduction for a race.
 * Ants: 10% off ships and troops.
 */
export function getMilitaryCostReduction(raceId: RaceId): number {
  if (hasAbility(raceId, 'expendable_units')) {
    return ANT_MILITARY_COST_REDUCTION;
  }
  return 0;
}

/**
 * Get max population bonus percentage for a race.
 * Ants can support 25% more population.
 */
export function getMaxPopulationBonus(raceId: RaceId): number {
  if (hasAbility(raceId, 'overpopulation')) {
    return ANT_MAX_POPULATION_BONUS;
  }
  return 0;
}

/**
 * Get weapon attack level bonus for a race.
 * Ferrets: +4 attack levels.
 */
export function getWeaponAttackLevelBonus(raceId: RaceId): number {
  if (hasAbility(raceId, 'deadly_accuracy')) {
    return FERRET_ATTACK_LEVEL_BONUS;
  }
  return 0;
}

/**
 * Get ship combat bonuses from Superior Pilots (Budgies).
 * Returns { initiative, defenseLevels, evasion }
 */
export function getSuperiorPilotsBonuses(raceId: RaceId): {
  initiative: number;
  defenseLevels: number;
  evasion: number;
} {
  if (hasAbility(raceId, 'superior_pilots')) {
    return {
      initiative: BUDGIE_INITIATIVE_BONUS,
      defenseLevels: BUDGIE_DEFENSE_LEVEL_BONUS,
      evasion: BUDGIE_EVASION_BONUS,
    };
  }
  return { initiative: 0, defenseLevels: 0, evasion: 0 };
}

/**
 * Get small ship combat bonus for a race.
 * Budgies: +15% for small ships.
 */
export function getSmallShipBonus(raceId: RaceId): number {
  if (hasAbility(raceId, 'dogfighter')) {
    return BUDGIE_SMALL_SHIP_BONUS;
  }
  return 0;
}

/**
 * Get enemy missile accuracy penalty for a race.
 * Budgies: -30% enemy missile accuracy.
 */
export function getEnemyMissilePenalty(raceId: RaceId): number {
  if (hasAbility(raceId, 'three_dimensional_tactics')) {
    return BUDGIE_ENEMY_MISSILE_PENALTY;
  }
  return 0;
}

/**
 * Get cloak detection bonus for a race.
 * Ferrets: +50% detection.
 */
export function getCloakDetectionBonus(raceId: RaceId): number {
  if (hasAbility(raceId, 'hunters_instinct')) {
    return FERRET_CLOAK_DETECTION_BONUS;
  }
  return 0;
}

/**
 * Get espionage cost reduction for a race.
 * Chameleons: 50% cheaper.
 */
export function getEspionageCostReduction(raceId: RaceId): number {
  if (hasAbility(raceId, 'master_spies')) {
    return CHAMELEON_ESPIONAGE_COST_REDUCTION;
  }
  return 0;
}

/**
 * Get espionage success bonus for a race.
 * Chameleons: +25% success chance.
 */
export function getEspionageSuccessBonus(raceId: RaceId): number {
  if (hasAbility(raceId, 'master_spies')) {
    return CHAMELEON_ESPIONAGE_SUCCESS_BONUS;
  }
  return 0;
}

/**
 * Get tech theft bonus for a race.
 * Chameleons: +50% easier.
 */
export function getTechTheftBonus(raceId: RaceId): number {
  if (hasAbility(raceId, 'technology_theft')) {
    return CHAMELEON_TECH_THEFT_BONUS;
  }
  return 0;
}

/**
 * Get ground damage bonus for a race.
 * Guinea Pigs: +50%.
 */
export function getGroundDamageBonus(raceId: RaceId): number {
  if (hasAbility(raceId, 'warrior_culture')) {
    return GUINEA_PIG_GROUND_DAMAGE_BONUS;
  }
  return 0;
}

/**
 * Get ground defense bonus for a race.
 * Hermit Crabs: +50% (Armored Shell).
 */
export function getGroundDefenseBonus(raceId: RaceId): number {
  if (hasAbility(raceId, 'armored_shell')) {
    return HERMIT_CRAB_GROUND_DEFENSE_BONUS;
  }
  return 0;
}

/**
 * Get troop morale bonus for a race.
 * Guinea Pigs: +25%.
 */
export function getTroopMoraleBonus(raceId: RaceId): number {
  if (hasAbility(raceId, 'warrior_culture')) {
    return GUINEA_PIG_MORALE_BONUS;
  }
  return 0;
}

/**
 * Get conquest integration speed bonus for a race.
 * Guinea Pigs: 50% faster.
 */
export function getConquestIntegrationSpeed(raceId: RaceId): number {
  if (hasAbility(raceId, 'relentless')) {
    return GUINEA_PIG_INTEGRATION_SPEED;
  }
  return 0;
}

/**
 * Get pollution reduction for a race.
 * Mice: 50% slower pollution generation.
 */
export function getPollutionReduction(raceId: RaceId): number {
  if (hasAbility(raceId, 'reduced_waste')) {
    return MICE_POLLUTION_REDUCTION;
  }
  return 0;
}

/**
 * Get reverse engineering speed bonus for a race.
 * Mice: 50% faster.
 */
export function getReverseEngineeringSpeed(raceId: RaceId): number {
  if (hasAbility(raceId, 'tech_integration')) {
    return MICE_REVERSE_ENGINEERING_SPEED;
  }
  return 0;
}

/**
 * Get trade bonus for a race.
 * Hamsters: +25%.
 */
export function getTradeBonus(raceId: RaceId): number {
  if (hasAbility(raceId, 'trade_hub')) {
    return HAMSTER_TRADE_BONUS;
  }
  return 0;
}

/**
 * Get council vote bonus for a race.
 * Hamsters: +1 vote.
 */
export function getCouncilVoteBonus(raceId: RaceId): number {
  if (hasAbility(raceId, 'council_favorite')) {
    return 1;
  }
  return 0;
}

/**
 * Get colonization penalty reduction for a race.
 * Hamsters: -25% hostility penalty.
 */
export function getColonizationPenaltyReduction(raceId: RaceId): number {
  if (hasAbility(raceId, 'adaptive')) {
    return HAMSTER_COLONIZATION_PENALTY_REDUCTION;
  }
  return 0;
}

/**
 * Get asteroid mining bonus for a race.
 * Hermit Crabs: +2 minerals per asteroid belt.
 */
export function getAsteroidMiningBonus(raceId: RaceId): number {
  if (hasAbility(raceId, 'mineral_consumption')) {
    return HERMIT_CRAB_ASTEROID_MINING;
  }
  return 0;
}

/**
 * Get the chance per turn for a free tech breakthrough.
 * Rats: 5% per turn.
 */
export function getFreeTechChance(raceId: RaceId): number {
  if (hasAbility(raceId, 'eureka_moments')) {
    return RAT_FREE_TECH_CHANCE;
  }
  return 0;
}

/**
 * Get starting ship experience bonus for a race.
 * Budgies: +1 experience level (Flight School).
 */
export function getStartingShipExperience(raceId: RaceId): number {
  if (hasAbility(raceId, 'flight_school')) {
    return 1;
  }
  return 0;
}

/**
 * Get rebellion reduction for a race.
 * Rabbits: 50% less rebellions.
 */
export function getRebellionReduction(raceId: RaceId): number {
  if (hasAbility(raceId, 'democratic_resilience')) {
    return 50;
  }
  return 0;
}
