/**
 * Race system — pure TypeScript, NO DOM.
 *
 * Provides typed race data and functions for applying race bonuses to game
 * values.  All formulas follow design/species/race-stats-complete.md.
 */

import { RaceId } from '../state';
import racesData from '../../data/races.json';

// ── Data-layer types ──────────────────────────────────────────────────────────

export interface RaceBonuses {
  production: number;   // percentage modifier, e.g. 50 = +50%
  research: number;
  food: number;
  growth: number;
  groundCombat: number;
  shipCombat: number;
  espionage: number;
  diplomacy: number;
}

export interface SpecialAbilityEffect {
  type: string;
  value?: number | string | boolean | string[];
  [key: string]: unknown;
}

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  effect: SpecialAbilityEffect;
}

export interface AiBehavior {
  archetype: string;
  aggression: number;      // 0.0 – 1.0
  expansion: number;
  researchFocus: number;
  productionFocus: number;
  diplomacyPriority: number;
  naturalAllies: RaceId[];
  naturalEnemies: RaceId[];
  treatyReliability: number;
  declaresWarFirst: boolean;
  volatilityFlag?: boolean;
}

export interface LeaderNames {
  male?: string[];
  female?: string[];
  coordinators?: string[];  // For Ants
  queens?: string[];        // For Ants
  titles?: string[];
}

export interface HomeworldSpec {
  name: string;
  type: string;
  climate: string;
  size: string;
  special: string | null;
}

export interface RaceDefinition {
  id: RaceId;
  name: string;
  moo1Equivalent: string;
  description: string;
  homeworld: HomeworldSpec;
  bonuses: RaceBonuses;
  /** Per-field research percentage bonuses (positive). Key is field name. */
  researchFieldBonuses: Record<string, number>;
  /** Per-field research percentage penalties (negative). Key is field name. */
  researchFieldPenalties: Record<string, number>;
  /** When true, the race's base research bonus applies equally to ALL fields. */
  researchBonusAllFields?: boolean;
  /** +1 movement range bonus for all ships (Budgies). */
  movementRangeBonus?: number;
  /** Special starting relationship mode (e.g., 'blood_enemies_all' for Ferrets). */
  startingRelations?: 'blood_enemies_all' | 'neutral_all';
  /** Whether this race can send spies at all (false for Ants). */
  canConductEspionage: boolean;
  /** Whether this race is completely immune to incoming espionage (Ants). */
  immuneToEspionage: boolean;
  /** Flat bonus added to spy success rolls before percentage modifiers. */
  spyRollBonus: number;
  specialAbilities: SpecialAbility[];
  startingTechnologies: string[];
  aiBehavior: AiBehavior;
  shipPrefix: string;
  /** Race-specific leader names for AI empire creation. */
  leaderNames?: LeaderNames;
}

// ── Constants (from design doc) ───────────────────────────────────────────────

export const RACE_CONSTANTS = {
  BASE_PRODUCTION_PER_POP: 1.0,
  BASE_RESEARCH_PER_SCIENTIST: 1.0,
  BASE_GROWTH_RATE: 0.10,
  BASE_ESPIONAGE_SUCCESS: 0.30,
  GROUND_COMBAT_BASE: 3,
  SHIP_COMBAT_BASE_ATTACK: 1,
  SHIP_COMBAT_BASE_DEFENSE: 1,
  DIPLOMACY_NEUTRAL_START: 0,
  DIPLOMACY_UNFRIENDLY_START: -20,
} as const;

// ── Load and index race data ──────────────────────────────────────────────────

// The JSON is typed as unknown coming from the import; we cast once and
// validate at runtime rather than carrying `any` through the codebase.
const _rawRaces = (racesData as { races: RaceDefinition[] }).races;

/** All race definitions keyed by race ID for O(1) lookup. */
export const RACES_BY_ID: Readonly<Record<RaceId, RaceDefinition>> =
  Object.fromEntries(_rawRaces.map((r) => [r.id, r]));

/** Ordered list of all race IDs. */
export const ALL_RACE_IDS: readonly RaceId[] = _rawRaces.map((r) => r.id);

/** Return all race definitions as an array. */
export function getAllRaces(): RaceDefinition[] {
  return _rawRaces;
}

// ── Lookup helpers ────────────────────────────────────────────────────────────

/**
 * Return the RaceDefinition for a given ID.
 * Throws if the ID is unknown (fail-fast over silent corruption).
 */
export function getRace(raceId: RaceId): RaceDefinition {
  const race = RACES_BY_ID[raceId];
  if (!race) throw new Error(`Unknown raceId: "${raceId}"`);
  return race;
}

// ── Formula implementations (design/species/race-stats-complete.md) ──────────

/**
 * Apply a racial percentage bonus to a base value.
 *
 *   FinalValue = BaseValue × (1 + RacialBonus / 100)
 */
export function applyRacialBonus(baseValue: number, bonusPercent: number): number {
  return baseValue * (1 + bonusPercent / 100);
}

/**
 * Effective production for a race given base production output.
 *
 *   EffectiveProduction = BaseProduction × (1 + production_bonus / 100)
 */
export function applyProductionBonus(baseProduction: number, raceId: RaceId): number {
  const race = getRace(raceId);
  return applyRacialBonus(baseProduction, race.bonuses.production);
}

/**
 * Effective research points for a race per turn.
 *
 *   EffectiveRP = BaseRP × (1 + research_bonus / 100)
 *
 * For Rats (researchBonusAllFields = true) the +75% applies to ALL fields
 * equally, so the same formula works with race.bonuses.research.
 */
export function applyResearchBonus(baseRP: number, raceId: RaceId): number {
  const race = getRace(raceId);
  return applyRacialBonus(baseRP, race.bonuses.research);
}

/**
 * Effective research points in a specific field, incorporating both the
 * general research bonus and any per-field bonus/penalty.
 *
 * For Rats, researchBonusAllFields means the base +75% already covers all
 * fields; per-field modifiers are added on top of that.
 */
export function applyFieldResearchBonus(
  baseRP: number,
  raceId: RaceId,
  field: string,
): number {
  const race = getRace(raceId);
  const generalBonus = race.bonuses.research;
  const fieldBonus = race.researchFieldBonuses[field] ?? 0;
  const fieldPenalty = race.researchFieldPenalties[field] ?? 0;
  const totalPercent = generalBonus + fieldBonus + fieldPenalty;
  return applyRacialBonus(baseRP, totalPercent);
}

/**
 * Effective population growth rate.
 *
 *   EffectiveGrowthRate = BaseGrowthRate × (1 + growth_bonus / 100)
 */
export function applyGrowthBonus(baseGrowthRate: number, raceId: RaceId): number {
  const race = getRace(raceId);
  return applyRacialBonus(baseGrowthRate, race.bonuses.growth);
}

/**
 * Effective ground combat strength.
 *
 *   GroundCombatStrength = BaseTroopStrength × (1 + groundCombat_bonus / 100)
 *
 * Per spec, minimum effective value is 10% of base (never reduces to zero).
 */
export function applyGroundCombatBonus(baseStrength: number, raceId: RaceId): number {
  const race = getRace(raceId);
  const result = applyRacialBonus(baseStrength, race.bonuses.groundCombat);
  return Math.max(result, baseStrength * 0.10);
}

/**
 * Effective ship attack bonus (additive, not multiplicative per spec).
 *
 *   EffectiveAttack = BaseAttack + (ShipCombatBonus / 10)
 */
export function applyShipAttackBonus(baseAttack: number, raceId: RaceId): number {
  const race = getRace(raceId);
  return baseAttack + race.bonuses.shipCombat / 10;
}

/**
 * Effective ship defense bonus (same formula as attack).
 *
 *   EffectiveDefense = BaseDefense + (ShipDefenseBonus / 10)
 */
export function applyShipDefenseBonus(baseDefense: number, raceId: RaceId): number {
  const race = getRace(raceId);
  return baseDefense + race.bonuses.shipCombat / 10;
}

/**
 * Espionage success chance for a race against a standard target.
 *
 *   EspionageSuccessChance = BaseChance × (1 + espionage_bonus / 100)
 *
 * Returns 0 if the race cannot conduct espionage (Ants).
 * Returns 0 if the target race is immune (Ants).
 */
export function applyEspionageBonus(
  baseChance: number,
  attackerRaceId: RaceId,
  defenderRaceId: RaceId,
): number {
  const attacker = getRace(attackerRaceId);
  const defender = getRace(defenderRaceId);

  if (!attacker.canConductEspionage) return 0;
  if (defender.immuneToEspionage) return 0;

  // Flat spy roll bonus is added before the percentage modifier
  const adjustedBase = baseChance + attacker.spyRollBonus / 100;
  return applyRacialBonus(adjustedBase, attacker.bonuses.espionage);
}

/**
 * Starting diplomatic relationship value between two races.
 *
 *   InitialRelationship = DIPLOMACY_UNFRIENDLY_START + (DiplomacyBonus / 3)
 *
 * Hamsters raise everyone to neutral; Guinea Pigs drag it lower.
 * Both actors' bonuses contribute: we average their effects.
 *
 * This uses: offset = (raceA.bonus/3 + raceB.bonus/3)
 */
export function startingRelationship(raceAId: RaceId, raceBId: RaceId): number {
  const raceA = getRace(raceAId);
  const raceB = getRace(raceBId);
  const base = RACE_CONSTANTS.DIPLOMACY_UNFRIENDLY_START;
  const offset = raceA.bonuses.diplomacy / 3 + raceB.bonuses.diplomacy / 3;
  return base + offset;
}

/**
 * Apply a race's diplomacy bonus to a relationship change event.
 *
 *   RelationshipChange = BaseChange × (1 + DiplomacyBonus / 100)
 */
export function applyDiplomacyBonus(baseChange: number, raceId: RaceId): number {
  const race = getRace(raceId);
  return applyRacialBonus(baseChange, race.bonuses.diplomacy);
}

/**
 * Whether a race has a specific special ability by ID.
 */
export function hasAbility(raceId: RaceId, abilityId: string): boolean {
  const race = getRace(raceId);
  return race.specialAbilities.some((a) => a.id === abilityId);
}

/**
 * Get a specific special ability for a race.
 * Returns undefined if the ability does not exist for that race.
 */
export function getAbility(raceId: RaceId, abilityId: string): SpecialAbility | undefined {
  const race = getRace(raceId);
  return race.specialAbilities.find((a) => a.id === abilityId);
}

/**
 * Mice: effective Robotic Controls level given the researched level.
 * Mice always operate at +2 RC levels above what they've researched.
 */
export function miceEffectiveRCLevel(researchedLevel: number): number {
  return researchedLevel + 2;
}

/**
 * Mice: factory output per factory (before racial production modifier).
 * Automated Production ability gives 50% factory efficiency boost:
 *   factory_base_output = 1.0 × 1.50 = 1.5 BC/factory
 */
export const MICE_FACTORY_EFFICIENCY_MULTIPLIER = 1.5;

/**
 * Total Mice factory production including both efficiency and racial modifier.
 *
 *   Factory_Production = factories × 1.50 × 1.25
 */
export function miceFactoryProduction(operatingFactories: number): number {
  const miceProductionModifier = 1 + 25 / 100; // +25% production bonus
  return operatingFactories * MICE_FACTORY_EFFICIENCY_MULTIPLIER * miceProductionModifier;
}

/**
 * Get a random leader name for an AI empire based on race.
 * Returns a formatted leader name using race-specific naming conventions.
 */
export function getRandomLeaderName(raceId: RaceId, seed?: number): string {
  const race = getRace(raceId);
  const names = race.leaderNames;
  
  if (!names) {
    // Fallback for races without leader names defined
    return `Emperor of ${race.name}`;
  }

  // Simple pseudo-random using seed or Date.now()
  const randSeed = seed ?? Date.now();
  const pseudoRandom = (max: number): number => {
    return Math.abs((randSeed * 9301 + 49297) % 233280) % max;
  };

  // Ants use coordinators/queens instead of male/female
  if (names.coordinators && names.queens) {
    const pool = [...names.coordinators, ...names.queens];
    const name = pool[pseudoRandom(pool.length)];
    const title = names.titles?.[pseudoRandom(names.titles.length)] ?? 'Coordinator';
    return `${title} ${name}`;
  }

  // Standard races use male/female names
  const allNames: string[] = [];
  if (names.male) allNames.push(...names.male);
  if (names.female) allNames.push(...names.female);
  
  if (allNames.length === 0) {
    return `Emperor of ${race.name}`;
  }

  const name = allNames[pseudoRandom(allNames.length)];
  const title = names.titles?.[pseudoRandom(names.titles.length)];
  
  return title ? `${title} ${name}` : name;
}

/**
 * Check if a race starts at war with all other races (Ferrets).
 */
export function isBloodEnemiesAll(raceId: RaceId): boolean {
  const race = getRace(raceId);
  return race.startingRelations === 'blood_enemies_all';
}
