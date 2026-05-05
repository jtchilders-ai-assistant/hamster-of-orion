/**
 * Game constants — all values from design documents.
 * src/game/constants.ts
 *
 * Design docs:
 *   design/economy/factory-formulas.md
 *   design/economy/population-growth.md
 *   design/economy/slider-mathematics.md
 *   design/ships/combat-algorithm.md
 *   design/diplomacy/relationship-formulas.md
 *   design/technology/research-formulas.md
 *
 * IMPORTANT: Do NOT put hardcoded planet size constants (tiny=20, etc.) here.
 * The economy formulas must use the planet's generated base_population value,
 * not hardcoded per-size constants. See design docs for representative ranges.
 */

// ================================================================
// Factory & Production (factory-formulas.md, slider-mathematics.md)
// ================================================================

export const FACTORY_OUTPUT_BASE = 1.0;

// Population labor scales with Planetology tech:
//   Base_Pop_Output = 0.5 + (Planetology_TL / 50.0 * 1.5)
//   Min: 0.5 BC/pop   Max: 2.0 BC/pop   Cap: TL 50
export const BASE_POP_OUTPUT_MIN = 0.5;
export const BASE_POP_OUTPUT_MAX = 2.0;
export const BASE_POP_OUTPUT_TL_CAP = 50;

export const FACTORY_COST_BASE = 10;
export const FACTORY_COST_MIN = 2;

export const BASE_POLLUTION_PER_FACTORY = 1.0;
export const BASE_CLEANUP_COST_PER_POLLUTION = 0.5;

// Industrial Tech cost reduction table (tech_level → factory_cost)
export const INDUSTRIAL_TECH_FACTORY_COSTS: {
  tech_level: number;
  name: string;
  factory_cost: number;
}[] = [
  { tech_level: 0, name: "None", factory_cost: 10 },
  { tech_level: 3, name: "Industrial Tech 9", factory_cost: 9 },
  { tech_level: 8, name: "Industrial Tech 8", factory_cost: 8 },
  { tech_level: 13, name: "Industrial Tech 7", factory_cost: 7 },
  { tech_level: 18, name: "Industrial Tech 6", factory_cost: 6 },
  { tech_level: 23, name: "Industrial Tech 5", factory_cost: 5 },
  { tech_level: 28, name: "Industrial Tech 4", factory_cost: 4 },
  { tech_level: 33, name: "Industrial Tech 3", factory_cost: 3 },
  { tech_level: 38, name: "Industrial Tech 2", factory_cost: 2 },
];

// Waste reduction from Construction tech (tech_level → waste_rate)
export const WASTE_REDUCTION: { tech_level: number; name: string; waste_rate: number }[] = [
  { tech_level: 0, name: "None", waste_rate: 1.0 },
  { tech_level: 5, name: "Reduced Industrial Waste 80%", waste_rate: 0.8 },
  { tech_level: 15, name: "Reduced Industrial Waste 60%", waste_rate: 0.6 },
  { tech_level: 25, name: "Reduced Industrial Waste 40%", waste_rate: 0.4 },
  { tech_level: 35, name: "Reduced Industrial Waste 20%", waste_rate: 0.2 },
  { tech_level: 45, name: "Industrial Waste Elimination", waste_rate: 0.0 },
];

// Eco Restoration cleanup modifiers (tech_level → cleanup_modifier, waste_per_bc)
export const ECO_RESTORATION: { tech_level: number; name: string; cleanup_modifier: number; waste_per_bc: number }[] = [
  { tech_level: 1, name: "Ecological Restoration", cleanup_modifier: 1.0, waste_per_bc: 2 },
  { tech_level: 4, name: "Improved Eco Restoration", cleanup_modifier: 0.67, waste_per_bc: 3 },
  { tech_level: 11, name: "Enhanced Eco Restoration", cleanup_modifier: 0.4, waste_per_bc: 5 },
  { tech_level: 22, name: "Advanced Eco Restoration", cleanup_modifier: 0.2, waste_per_bc: 10 },
  { tech_level: 29, name: "Complete Eco Restoration", cleanup_modifier: 0.1, waste_per_bc: 20 },
];

// Robotic Controls tech levels (tech_level → factory_ratio, starting tech at TL 1)
export const ROBOTIC_CONTROLS: { tech_level: number; name: string; factory_ratio: number; starting_tech?: boolean }[] = [
  { tech_level: 1, name: "Robotic Controls II", factory_ratio: 2, starting_tech: true },
  { tech_level: 8, name: "Robotic Controls III", factory_ratio: 3 },
  { tech_level: 18, name: "Robotic Controls IV", factory_ratio: 4 },
  { tech_level: 28, name: "Robotic Controls V", factory_ratio: 5 },
  { tech_level: 38, name: "Robotic Controls VI", factory_ratio: 6 },
  { tech_level: 48, name: "Robotic Controls VII", factory_ratio: 7 },
];

// Racial production modifiers
export const RACIAL_PRODUCTION_MODIFIERS: Record<string, number> = {
  ants: 1.5,
  mice: 1.25,
  guinea_pigs: 1.1,
  hamsters: 1.0,
  rabbits: 1.0,
  rats: 1.0,
  ferrets: 1.0,
  budgies: 0.9,
  chameleons: 1.0,
  hermit_crabs: 1.0,
};

// Racial RC bonus (Meklars: +2 to effective RC level)
export const RACIAL_RC_BONUS: Record<string, number> = {
  mice: 2,
};

// Mineral richness modifiers
export const MINERAL_RICHNESS_MODIFIERS: Record<string, number> = {
  ultra_poor: 0.33,
  poor: 0.5,
  normal: 1.0,
  rich: 2.0,
  ultra_rich: 3.0,
};

// Factory build progress carryover
export const FACTORY_BUILD_CARRYOVER_BASE = 0;

// ================================================================
// Slider Mathematics (slider-mathematics.md)
// ================================================================

export const SLIDER_SUM_TARGET = 100;

// Sliders: ship, defense, industry, ecology, tech
export const SLIDER_KEYS: readonly string[] = ["ship", "def", "ind", "eco", "tech"] as const;

export const ECO_PRIORITY_ORDER: { phase: number; name: string; mandatory: boolean }[] = [
  { phase: 1, name: "pollution_cleanup", mandatory: true },
  { phase: 2, name: "population_growth", mandatory: false },
  { phase: 3, name: "terraforming", mandatory: false },
];

export const ECO_GROWTH_BC_EFFICIENCY = 0.1; // 1 BC → 0.1 additional pop growth

// Tech slider: base RP per scientist
export const BASE_RESEARCH_POINTS = 1.0;

// ================================================================
// Population Growth (population-growth.md)
// ================================================================

export const BASE_GROWTH_RATE = 0.10;

// Colony
export const INITIAL_COLONY_POPULATION = 2;
export const COLONY_SHIP_COST = 50;
export const POPULATION_TRANSPORT_CAPACITY = 1; // 1 million pop per transport

// Population transport cost and maintenance
// Design source: population-growth.md §7 Population Transport
export const COLONY_TRANSPORT_COST = 50; // 50 BC to build
export const COLONY_TRANSPORT_MAINTENANCE = 1; // 1 BC/turn maintenance

// Food
export const BASE_FOOD_PER_COLONIST = 1.0;
export const BASE_FOOD_PER_WORKER = 2.0;
export const STARVATION_RATE = 0.5;

// Cloning tech bonuses
// Design source: design/technology/planetology.md §Cloning Technology
export const CLONING: { tech_level: number; name: string; bonus_per_turn: number }[] = [
  { tech_level: 0, name: "None", bonus_per_turn: 0 },
  { tech_level: 21, name: "Cloning", bonus_per_turn: 2 },
  { tech_level: 42, name: "Advanced Cloning", bonus_per_turn: 5 },
];

// Terraforming bonuses by tech level
export const TERRAFORMING_BONUSES: { tech_level: number; name: string; bonus: number }[] = [
  { tech_level: 0, name: "None", bonus: 0 },
  { tech_level: 2, name: "Terraforming +10", bonus: 10 },
  { tech_level: 6, name: "Terraforming +20", bonus: 20 },
  { tech_level: 10, name: "Terraforming +30", bonus: 30 },
  { tech_level: 14, name: "Terraforming +40", bonus: 40 },
  { tech_level: 18, name: "Terraforming +50", bonus: 50 },
  { tech_level: 22, name: "Terraforming +60", bonus: 60 },
  { tech_level: 30, name: "Terraforming +80", bonus: 80 },
  { tech_level: 38, name: "Terraforming +100", bonus: 100 },
  { tech_level: 46, name: "Terraforming +120", bonus: 120 },
];

// Soil enrichment bonuses by tech level
export const SOIL_ENRICHMENT: { tech_level: number; name: string; max_pop_bonus: number; upgrade_cost: number }[] = [
  { tech_level: 0, name: "None", max_pop_bonus: 0, upgrade_cost: 0 },
  { tech_level: 14, name: "Soil Enrichment", max_pop_bonus: 25, upgrade_cost: 150 },
  { tech_level: 26, name: "Advanced Soil Enrichment", max_pop_bonus: 50, upgrade_cost: 300 },
];

// Environment colonisation tech
export const ENVIRONMENT_COLONIZATION: { tech_level: number; name: string; unlocks: string[] }[] = [
  { tech_level: 0, name: "Standard", unlocks: ["gaia", "terran", "jungle", "ocean", "arid", "steppe", "desert", "minimal"] },
  { tech_level: 3, name: "Controlled Barren", unlocks: ["barren"] },
  { tech_level: 6, name: "Controlled Tundra", unlocks: ["tundra"] },
  { tech_level: 9, name: "Controlled Dead", unlocks: ["dead"] },
  { tech_level: 12, name: "Controlled Inferno", unlocks: ["inferno"] },
  { tech_level: 15, name: "Controlled Toxic", unlocks: ["toxic"] },
  { tech_level: 18, name: "Controlled Radiated", unlocks: ["radiated"] },
];

// Environment modifiers — growth, capacity, fertility
// Design doc source: population-growth.md §3 Environment Modifiers
export const ENVIRONMENT_GROWTH_MODIFIERS: Record<string, number> = {
  gaia: 1.0,
  terran: 1.0,
  jungle: 0.9,
  ocean: 0.9,
  arid: 0.8,
  steppe: 0.8,
  desert: 0.7,
  minimal: 0.6,
  tundra: 0.5,
  barren: 0.4,
  dead: 0.3,
  inferno: 0.2,
  toxic: 0.2,
  radiated: 0.1,
};

export const ENVIRONMENT_CAPACITY_MODIFIERS: Record<string, number> = {
  gaia: 1.0,
  terran: 1.0,
  jungle: 1.0,
  ocean: 1.0,
  arid: 0.9,
  steppe: 0.9,
  desert: 0.8,
  minimal: 0.7,
  tundra: 0.6,
  barren: 0.5,
  dead: 0.4,
  inferno: 0.3,
  toxic: 0.3,
  radiated: 0.2,
};

export const ENVIRONMENT_FERTILITY: Record<string, number> = {
  gaia: 1.5,
  terran: 1.0,
  jungle: 1.2,
  ocean: 1.0,
  arid: 0.6,
  steppe: 0.8,
  desert: 0.4,
  minimal: 0.3,
  tundra: 0.2,
  barren: 0.1,
  dead: 0.1,
  inferno: 0.05,
  toxic: 0.05,
  radiated: 0.05,
};

// Racial growth modifiers
// Design doc source: population-growth.md §4 Racial Growth Modifiers
export const RACIAL_GROWTH_MODIFIERS: Record<string, number> = {
  rabbits: 2.0,
  ants: 1.25,
  guinea_pigs: 1.0,
  hamsters: 1.0,
  rats: 1.0,
  ferrets: 1.0,
  budgies: 1.0,
  chameleons: 1.0,
  mice: 0.75,
  hermit_crabs: 0.5,
};

// Racial food modifiers (null = no food required)
// Design doc source: population-growth.md §9 Food Requirements — Racial Food Modifiers
export const RACIAL_FOOD_MODIFIERS: Record<string, number | null> = {
  rabbits: 1.25,
  ants: 1.2,
  budgies: 1.1,
  hamsters: 1.0,
  guinea_pigs: 1.0,
  rats: 1.0,
  ferrets: 1.0,
  chameleons: 1.0,
  mice: 0.5, // Cybernetic — reduced food needs
  hermit_crabs: null, // No food required
};

// Racial capacity modifiers (ants: 1.25 from Overpopulation)
export const RACIAL_CAPACITY_MODIFIERS: Record<string, number> = {
  rabbits: 1.0,
  ants: 1.25,
  guinea_pigs: 1.0,
  hamsters: 1.0,
  rats: 1.0,
  ferrets: 1.0,
  budgies: 1.0,
  chameleons: 1.0,
  mice: 1.0,
  hermit_crabs: 1.0,
};

// Morale modifier: 0.5 + (morale / 200)
// Design doc source: population-growth.md §11
export const MORALE_BASE_MODIFIER = 0.5;
export const MORALE_DIVISOR = 200;

// Conquest population reduction
export const CONQUEST_POPULATION_REDUCTION = 0.5; // 50% default
export const FERRET_CONQUEST_REDUCTION = 0.4; // Ferrets: 40%

// ================================================================
// Bio Weapon Max Population Reduction (population-growth.md, planetology.md)
// ================================================================
// Bio weapons permanently reduce a planet's maximum population capacity.
// This reduction persists until the planet is re-terraformed.

/**
 * Bio weapon definitions with kill rate and max population reduction.
 * Design source: design/economy/population-growth.md §Edge Cases - Biological Weapon Damage
 * Design source: design/technology/planetology.md §Biological Weapons
 */
export const BIO_WEAPONS = {
  death_spores: {
    techLevel: 10,
    killRatePerRound: 1, // 1M pop killed per combat round
    maxPopReduction: 0.10, // -10% max pop permanent
    spaceCost: 150,
    buildCost: 100,
  },
  doom_virus: {
    techLevel: 25,
    killRatePerRound: 2, // 2M pop killed per combat round
    maxPopReduction: 0.25, // -25% max pop permanent
    spaceCost: 200,
    buildCost: 200,
  },
  bio_terminator: {
    techLevel: 33,
    killRatePerRound: 3, // 3M pop killed per combat round
    maxPopReduction: 0.50, // -50% max pop permanent
    spaceCost: 250,
    buildCost: 300,
  },
} as const;

/** Type for bio weapon IDs */
export type BioWeaponType = keyof typeof BIO_WEAPONS;

/**
 * Get the max population reduction for a bio weapon type.
 * @param weaponType Bio weapon identifier
 * @returns Reduction factor (0.10 = 10% reduction)
 */
export function getBioWeaponMaxPopReduction(weaponType: BioWeaponType): number {
  return BIO_WEAPONS[weaponType].maxPopReduction;
}

/**
 * Bio weapon diplomacy penalty.
 * Design source: design/technology/planetology.md §Constants Reference
 */
export const BIO_WEAPON_DIPLOMACY_PENALTY = -100;

// Planet size reference — NOT to be used in formulas.
// See design docs: "Economy formulas must use the planet's generated base_population value."
// These are representative mid-range values only.
export const PLANET_SIZE_REFERENCE = {
  tiny: { max_population: 15, range: [10, 20] as [number, number] },
  small: { max_population: 32, range: [25, 40] as [number, number] },
  medium: { max_population: 55, range: [45, 70] as [number, number] },
  large: { max_population: 85, range: [75, 100] as [number, number] },
  huge: { max_population: 120, range: [100, 150] as [number, number] },
};

// ================================================================
// Combat (combat-algorithm.md)
// ================================================================

// Hit chance formula constants
export const BASE_HIT_CHANCE = 50; // 50% base when levels equal
export const HIT_SKILL_MODIFIER = 10; // per point of attacker/defender level
export const MIN_HIT_CHANCE = 5;
export const MAX_HIT_CHANCE = 95;

// Damage sequence: shield → armor → hull → crew
// Design doc source: combat-algorithm.md
// "Each class of hull takes 20 HP damage before a crew member is killed"
export const HP_PER_CREW_KILL = 20;

// Shield class: absorbs 1 damage per class level
export const SHIELD_DAMAGE_CONSTANT = 1;

// Shield damage calculation: 1 point of shield absorbs 1 damage
export const SHIELD_DAMAGE_ABSORPTION_RATE = 1; // each point of shield class absorbs 1 damage
export const SHIELD_REGENERATION_BETWEEN_COMBATS = true;

// Base HP by hull size
// Design doc source: combat-algorithm.md §13 Base_HP by Hull Size (MOO1)
export const HULL_BASE_HP = {
  small: 3,
  medium: 18,
  large: 100,
  huge: 600,
};

// Armor multipliers by type
// Design doc source: combat-algorithm.md §3.1
export const ARMOR_MULTIPLIERS: Record<string, number> = {
  none: 1.0,
  titanium: 1.0,
  monomolecular: 1.15,
  composite: 1.3,
  ferrocarbide: 1.5,
  zortrium: 1.8,
};

// Engine combat speed (1-8) and maneuver rating (1-6, +1 per mark)
export const MIN_COMBAT_SPEED = 1;
export const MAX_COMBAT_SPEED = 8;

export const ENGINE_MANEUVER_BONUS = 2; // Engine_Maneuver_Rating × 2 → Initiative_Bonus

// Battle computer marks: I=1, II=2, III=3, IV=4, V=5
export const BATTLE_COMPUTER_MARKS: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
};

// Racial bonuses
export const RACIAL_ATTACK_BONUS: Record<string, number> = {
  ferrets: 4, // Ferrets
};
export const RACIAL_DEFENSE_BONUS: Record<string, number> = {
  budgies: 3, // Budgies
};
export const RACIAL_PRODUCTION_BONUS: Record<string, number> = {
  ferrets: 1.25, // Ferrets: +25% combat damage
  ants: 1.5, // Ants: +50% production
  mice: 1.25, // Meklars: +25%
  budgies: 0.9,
};

// Experience thresholds
export const EXPERIENCE_LEVELS = {
  rookie: { min_battles: 0, accuracy: -5, damage: 0 },
  regular: { min_battles: 1, accuracy: 0, damage: 0 },
  veteran: { min_battles: 3, accuracy: 5, damage: 5 },
  elite: { min_battles: 10, accuracy: 10, damage: 10 },
} as const;

// ================================================================
// Movement & Special Systems (combat-algorithm.md)
// ================================================================

// Ship retreat: speed-based chance, +20 for Budgies
export const RETREAT_BASE_SPEED_RATIO = 50; // (own_speed / max_enemy_speed) × 50
export const RETREAT_BASE_OFFSET = 25;
export const BUDGIE_RETREAT_BONUS = 20;
export const MAX_RETREAT_CHANCE = 95;

// Displacement device: 33% chance to avoid
export const DISPLACEMENT_CHANCE = 33;

// Mauler: always hits
export const MAULER_ALWAYS_HITS = true;

// Point defense: damage and intercept count
export const POINT_DEFENSE_DAMAGE = 5;
export const POINT_DEFENSE_INITIAL_INTERCEPTS = 4;

// Point defense intercepts by tech level (combat-algorithm.md §24)
export const POINT_DEFENSE_INTERCEPTS_BY_TL: Record<string, number> = {
  I: 2,
  II: 3,
  III: 4,
  IV: 5,
  V: 6,
};

// Point defense tech levels
export const POINT_DEFENSE_TECH_LEVELS: { tech_level: number; mark: string; intercepts: number }[] = [
  { tech_level: 0, mark: "I", intercepts: 2 },
  { tech_level: 10, mark: "II", intercepts: 3 },
  { tech_level: 20, mark: "III", intercepts: 4 },
  { tech_level: 30, mark: "IV", intercepts: 5 },
  { tech_level: 40, mark: "V", intercepts: 6 },
];

// ================================================================
// Weapons & Missiles (combat-algorithm.md, combat-arrays.md)
// ================================================================

// Missile types (combat-algorithm.md §20-21)
export const MISSILE_TYPES: Record<string, { damage: number; range: number; speed: number; ammo: number }> = {
  atomic: { damage: 10, range: 5, speed: 2, ammo: 6 },
  antiproton: { damage: 15, range: 7, speed: 3, ammo: 5 },
  antimatter: { damage: 25, range: 8, speed: 4, ammo: 4 },
};

// Missile base cost (from ship-costs.md)
export const MISSILE_BASE_COST = 100;

// Planet size to missile base cost mapping (from combat-algorithm.md §13)
export const PLANET_MISSILE_BASE_COST = {
  small: 100,
  medium: 150,
  large: 200,
  huge: 300,
};

// ================================================================
// Range Classes (combat-algorithm.md)
// ================================================================

export const RANGE_CLASSES = {
  point_blank: { min: 1, max: 1, hit_bonus: 10 },
  short: { min: 2, max: 4, hit_bonus: 0 },
  medium: { min: 5, max: 8, hit_bonus: -5 },
  long: { min: 9, max: 15, hit_bonus: -10 },
  very_long: { min: 16, max: Infinity, hit_bonus: -20 },
};

// ================================================================
// System Damage Effects (combat-algorithm.md §15)
// ================================================================

export const SYSTEM_DAMAGE_EFFECTS: Record<string, string> = {
  weapons: "weapons_disabled",
  engines: "speed_2",
  shields: "shields_down",
  sensors: "sensors_disabled",
};

// ================================================================
// Trade (trade-formulas.md, design/diplomacy/trade.md)
// ================================================================

// Trade deal progression over 30 turns
export const TRADE_INITIAL_COST_MULTIPLIER = 3;
export const TRADE_MONTHLY_BENEFIT_PER_POINT = 1.0;
export const TRADE_VALUE_PER_POINT = 1.5;
export const TRADE_MONTHS = 30;
export const TRADE_RENEGOTIATION_RETENTION = 0.5;

// ── Pirates & Space Monsters Trade Disruption ─────────────────────────────────
// Design source: design/diplomacy/trade.md §Pirates & Space Monsters

/**
 * Minimum trade income reduction from pirates.
 * Pirates reduce income by 20-50%.
 */
export const PIRATE_TRADE_REDUCTION_MIN = 0.20;

/**
 * Maximum trade income reduction from pirates.
 * Pirates reduce income by 20-50%.
 */
export const PIRATE_TRADE_REDUCTION_MAX = 0.50;

/**
 * Base pirate trade reduction when a piracy event is active.
 * The actual reduction scales with pirate severity/presence.
 */
export const PIRATE_TRADE_REDUCTION_BASE = 0.20;

/**
 * Trade income reduction when a space monster is present in a trade route system.
 * Space monsters block trade routes entirely when in the path.
 */
export const SPACE_MONSTER_TRADE_REDUCTION = 1.00;

// ── Trade Sanctions (Council Action) ──────────────────────────────────────────
// Design source: design/diplomacy/trade.md §Trade Sanctions

/**
 * Trade income penalty applied to a sanctioned empire.
 * Council sanctions reduce the target's total trade income by 50%.
 */
export const SANCTION_TRADE_INCOME_PENALTY = 0.50;

/**
 * Relation penalty for breaking trade sanctions.
 * Breaking sanctions: -30 relations with all races.
 */
export const SANCTION_BREAK_RELATION_PENALTY = -30;

// ================================================================
// Diplomacy & Relationships (relationship-formulas.md)
// ================================================================

// First meeting modifier
export const FIRST_MEETING_REPUTATION_WEIGHT = 0.3;

// Trade-related diplomacy constants
export const TRADE_TECH_TRANSFER_COST = 200; // Base cost for tech transfer
export const TRADE_RESEARCH_VALUE_PER_POINT = 1.0; // Research value per trade point

// ================================================================
// Research (research-formulas.md)
// ================================================================

// Tech cost tiers: 50, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600
// Formula: Base × 1.5^n where n is the tier
export const RESEARCH_COST_TIER_MULTIPLIER = 1.5;

// Planet research bonuses
// Design doc source: research-formulas.md
export const PLANET_RESEARCH_BONUS: Record<string, number> = {
  standard: 0.25,
  ancient_ruins: 0.25,
  gas_giant: -0.5,
  dead_star: -0.5,
  pulsar: -1.0,
  black_hole: -1.0,
};

// Galaxy size modifier
export const GALAXY_SIZE_RESEARCH_MODIFIER: Record<string, number> = {
  tiny: 0.5,
  small: 0.75,
  standard: 1.0,
  large: 1.25,
  huge: 1.5,
};

// Research field multipliers
export const COMPUTING_RESEARCH_MODIFIER = 2.0;
export const PHYSICS_RESEARCH_MODIFIER = 1.0;
export const BIOLOGY_RESEARCH_MODIFIER = 1.0;

// Computing technology multipliers (1.5 per mark)
export const COMPUTING_MULTIPLIER_PER_MARK = 1.5;

// Planet type bonuses (from combat-algorithm.md §13)
export const PLANET_COMBAT_MODIFIERS = {
  standard: { defense: 0, production: 0, research: 0 },
  gas_giant: { defense: 0, production: -20, research: -10 },
  dead_star: { defense: -20, production: -20, research: -30 },
  pulsar: { defense: -20, production: -20, research: -30 },
  black_hole: { defense: -30, production: -20, research: -30 },
  terraformed: { defense: 10, production: 10, research: 10 },
  ancient: { defense: 20, production: 10, research: 10 },
};

// Planet defense base (small = 1, medium = 2, large = 3)
export const PLANET_DEFENSE_BASE = {
  small: 1,
  medium: 2,
  large: 3,
};

// ================================================================
// Retro-fitted / existing (kept from prior iteration, still used)
// ================================================================

export const BASE_RESEARCH_POINTS_PER_SCIENTIST = 1.0;

export const PLANET_MODIFIERS = {
  STANDARD: { research: 0.25, production: 0, growth: 0 },
  GAIA: { research: 0, production: 10, growth: 20 },
  HOSTILE: { research: 0, production: -10, growth: -15 },
  GAS_GIANT: { research: -50, production: -50, growth: -50 },
  DEAD_STAR: { research: -50, production: -50, growth: -50 },
  PULSAR: { research: -50, production: -50, growth: -50 },
  BLACK_HOLE: { research: -50, production: -50, growth: -50 },
};

// Planet size — used in colony ship queue and UI display
export const PLANET_SIZE = {
  TINY: 20,
  SMALL: 40,
  MEDIUM: 60,
  LARGE: 80,
  HUGE: 100,
};

export const FLEET_SPEED = 8;

export const MAX_PLANETS_PER_EMPIRE = 100;

export const MAX_FLEET_SIZE = 10;

export const COMBAT_SCREEN_SHOWN = true;
export const SHOW_TURN_SUMMARY = true;
export const MAX_SCIENCE_PIPS = 10;

export const GAME_VERSION = "0.1.0-alpha.1";

// Shield class: absorbs 1 damage per class level (1-15)
export const SHIELD_CLASS_DMG_CONSTANT = 1;

// Shield HP = class × 10
export const SHIELD_HP_PER_CLASS = 10;

// Damage sequence: shields → armor → hull → crew
export const DAMAGE_SEQUENCE = {
  SHIELDS: "shields",
  ARMOR: "armor",
  HULL: "hull",
  CREW: "crew",
};

// Each class of hull takes 20 HP damage before crew is killed
export const CREW_KILL_THRESHOLD = 20;

// Racial bonuses for combat
export const RACIAL_BONUSES = {
  ferrets: { attack: 4, defense: 0, speed: 0 },
  budgies: { attack: 0, defense: 3, speed: 0 },
  ants: { attack: 0, defense: 0, speed: 0 },
  mice: { attack: 0, defense: 0, speed: 0 },
  hamsters: { attack: 0, defense: 0, speed: 0 },
  rabbits: { attack: 0, defense: 0, speed: 0 },
  rats: { attack: 0, defense: 0, speed: 0 },
  guinea_pigs: { attack: 0, defense: 0, speed: 0 },
  ferrets_special: { attack: 4, defense: 0, speed: 0 },
  budgies_special: { attack: 0, defense: 3, speed: 0 },
};

export const EXPERIENCE_THRESHOLDS = {
  ROOKIE: 0,
  REGULAR: 1,
  VETERAN: 3,
  ELITE: 10,
};

export const SHIP_CLASS_HP = {
  small: 3,
  medium: 18,
  large: 54,
  huge: 120,
};

// Engine combat speed (1-8)
export const ENGINE_COMBAT_SPEED = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
};

// Battle computer marks: I=1, II=2, III=3, IV=4, V=5
export const BATTLE_COMPUTER_MARK = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
};

// Planetary shields and missile bases (ship-costs.md)
export const PLANETARY_SHIELD_BASE_COST = 100; // Base cost, varies by tech tier
export const MISSILE_BASE_COST_PLANETARY = 100; // Base cost for missile bases on planets

// Ship classes
export const SHIP_CLASSES = {
  SCOUT: "scout",
  COLONY: "colony",
  TRANSPORT: "transport",
  DESTROYER: "destroyer",
  CRUISER: "cruiser",
  BATTLESHIP: "battleship",
  STARBASE: "starbase",
} as const;

// Combat experience effects (accuracy %, damage %)
export const EXPERIENCE_EFFECTS = {
  ROOKIE: { accuracy: -5, damage: 0 },
  REGULAR: { accuracy: 0, damage: 0 },
  VETERAN: { accuracy: 5, damage: 5 },
  ELITE: { accuracy: 10, damage: 10 },
};

// Engine maneuver rating (1-6, +1 per mark)
export const ENGINE_MANEUVER_RATING = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
};

// Shield class (1-15)
export const SHIELD_CLASS_MAX = 15;

// Ship build progress carryover
export const BUILD_PROGRESS_CARRYOVER = 0;

// ================================================================
// Scanner Range (design/galaxy/exploration.md §Scanner Range)
// ================================================================

/**
 * Base scanner range from owned colonies (parsecs).
 * Design source: design/galaxy/exploration.md §Scanner Range
 */
export const BASE_SCANNER_RANGE_PARSECS = 2;

/**
 * Scanner range increase per tech level (parsecs).
 * scannerTechLevel 0 = base (2 parsecs)
 * scannerTechLevel 1 = Deep Space Scanner (4 parsecs)
 * scannerTechLevel 2 = Subspace Scanner (6 parsecs)
 * scannerTechLevel 3 = Deep Space Scanner II (8 parsecs)
 *
 * Formula: range = BASE_SCANNER_RANGE_PARSECS + (scannerTechLevel * SCANNER_RANGE_PER_TECH_LEVEL)
 */
export const SCANNER_RANGE_PER_TECH_LEVEL = 2;

// ================================================================
// Population Dominance Coalition (design/diplomacy/relationship-formulas.md §7)
// ================================================================

/**
 * Population fraction that triggers a warning to the dominant empire.
 * Design source: design/diplomacy/relationship-formulas.md §7.1
 */
export const DOMINANCE_WARNING_THRESHOLD = 0.33;

/**
 * Population fraction that triggers the coalition penalty.
 * Design source: design/diplomacy/relationship-formulas.md §7.1
 */
export const DOMINANCE_COALITION_THRESHOLD = 0.40;

/**
 * Per-turn relation penalty toward the dominant empire.
 * Design source: design/diplomacy/relationship-formulas.md §7.3
 */
export const DOMINANCE_PENALTY_PER_TURN = 2;

/**
 * Floor for dominance penalty: stops pushing relations below -30.
 * Design source: design/diplomacy/relationship-formulas.md §7.3
 */
export const DOMINANCE_PENALTY_MAX = -30;

/**
 * AI war tendency boost vs the dominant empire when coalition active.
 * Design source: design/diplomacy/relationship-formulas.md §7.4
 */
export const COALITION_WAR_BOOST = 20;

/**
 * AI alliance acceptance boost among non-dominant races when coalition active.
 * Design source: design/diplomacy/relationship-formulas.md §7.4
 */
export const COALITION_ALLIANCE_BOOST = 30;

/**
 * Hysteresis buffer: warning resets when empire shrinks below threshold - 3%.
 * Design source: design/diplomacy/relationship-formulas.md §7.5
 */
export const DOMINANCE_WARNING_RESET_BUFFER = 0.03;

// ================================================================
// Reputation System (design/diplomacy/relationship-formulas.md §8)
// ================================================================

/**
 * Maximum value for any reputation track.
 * Design source: design/diplomacy/relationship-formulas.md §8.1
 */
export const REPUTATION_TRACK_MAX = 100;

/**
 * Minimum value for any reputation track.
 * Design source: design/diplomacy/relationship-formulas.md §8.1
 */
export const REPUTATION_TRACK_MIN = -100;

/**
 * Reputation change events by category.
 * Design source: design/diplomacy/relationship-formulas.md §8.2
 */
export const REPUTATION_EVENTS = {
  // Honor track
  KEEP_TREATY_25_TURNS: { track: 'honor' as const, change: 5 },
  BREAK_ANY_TREATY: { track: 'honor' as const, change: -25 },
  HONOR_DEFENSIVE_PACT: { track: 'honor' as const, change: 15 },
  REFUSE_ALLY_WAR_HELP: { track: 'honor' as const, change: -20 },

  // Peace track
  PEACE_25_TURNS: { track: 'peace' as const, change: 5 },
  DECLARE_WAR: { track: 'peace' as const, change: -15 },
  ACCEPT_PEACE_AS_LOSER: { track: 'peace' as const, change: 5 },
  REJECT_PEACE_WHILE_WINNING: { track: 'peace' as const, change: -10 },

  // Fairness track
  FAIR_TECH_TRADE: { track: 'fairness' as const, change: 5 },
  DEMAND_EXCESSIVE_TRIBUTE: { track: 'fairness' as const, change: -10 },
  BREAK_TRADE_FOR_ADVANTAGE: { track: 'fairness' as const, change: -15 },

  // Mercy track
  ACCEPT_SURRENDER: { track: 'mercy' as const, change: 10 },
  RELEASE_CAPTURED_PLANET: { track: 'mercy' as const, change: 15 },
  ORBITAL_BOMBARDMENT: { track: 'mercy' as const, change: -20 },
  USE_BIO_WEAPONS: { track: 'mercy' as const, change: -50 },
  EXTERMINATE_POPULATION: { track: 'mercy' as const, change: -75 },
};

// ================================================================
// Treaty Breaker Status (design/diplomacy/relationship-formulas.md §3.2)
// ================================================================

/**
 * Base duration of treaty breaker status in turns.
 * Design source: design/diplomacy/relationship-formulas.md §3.2
 */
export const TREATY_BREAKER_DURATION = 50;

/**
 * Additional duration added per violation while status is active.
 * Design source: design/diplomacy/relationship-formulas.md §3.2
 */
export const TREATY_BREAKER_STACK_DURATION = 25;

/**
 * Penalty to all new treaty negotiations while flagged as treaty breaker.
 * Design source: design/diplomacy/relationship-formulas.md §3.2
 */
export const TREATY_BREAKER_NEGOTIATION_PENALTY = -20;
