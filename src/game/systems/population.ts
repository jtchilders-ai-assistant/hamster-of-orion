/**
 * Population growth system — pure TypeScript, NO DOM.
 * src/game/systems/population.ts
 *
 * Implements population growth, max population capacity, food/starvation,
 * and difficulty modifiers per design/economy/population-growth.md.
 *
 * All formulas are logistic growth with environment, racial, and tech
 * modifiers. No DOM, no side effects.
 */

import { Planet, PlanetType } from '../state';

// ── Extended planet fields (optional additions to Planet) ─────────────────────

/**
 * Additional planet fields used by the population system.
 * These are optional on Planet — defaults are applied when absent.
 */
export interface PopulationPlanetFields {
  /** Fractional population accumulated across turns (0–<1). Default: 0. */
  fractional_population?: number;
  /** Soil enrichment level: 0=none, 1=basic (+25), 2=advanced (+50). Default: 0. */
  soil_enrichment_level?: 0 | 1 | 2;
  /** Numeric morale 0–100. Default: 50. */
  morale_numeric?: number;
  /** Number of colonists assigned to farming. Default: 0. */
  farmers?: number;
  /** Per-planet generated base max-pop (from galaxy generation). */
  base_population?: number;
}

/**
 * Empire-level tech context for population calculations.
 */
export interface TechState {
  /** Highest terraforming tech level unlocked (0 = none). */
  terraforming_tech_level: number;
  /** Highest cloning tech level unlocked (0 = none). */
  cloning_tech_level: number;
}

// ── Difficulty type ────────────────────────────────────────────────────────────

export type Difficulty = 'simple' | 'easy' | 'average' | 'hard' | 'impossible';

// ── Environment tables ────────────────────────────────────────────────────────

/** Growth rate modifier by environment. */
const ENV_GROWTH_MODIFIER: Record<PlanetType, number> = {
  gaia:      1.0,
  terran:    1.0,
  jungle:    0.9,
  ocean:     0.9,
  arid:      0.8,
  steppe:    0.8,
  desert:    0.7,
  minimal:   0.6,
  tundra:    0.5,
  barren:    0.4,
  dead:      0.3,
  inferno:   0.2,
  toxic:     0.2,
  radiated:  0.1,
  gas_giant: 0.0,  // uninhabitable
};

/** Maximum population capacity modifier by environment. */
const ENV_CAPACITY_MODIFIER: Record<PlanetType, number> = {
  gaia:      1.0,
  terran:    1.0,
  jungle:    1.0,
  ocean:     1.0,
  arid:      0.9,
  steppe:    0.9,
  desert:    0.8,
  minimal:   0.7,
  tundra:    0.6,
  barren:    0.5,
  dead:      0.4,
  inferno:   0.3,
  toxic:     0.3,
  radiated:  0.2,
  gas_giant: 0.0,  // uninhabitable
};

/** Environment fertility modifier for food production. */
const ENV_FERTILITY: Record<PlanetType, number> = {
  gaia:      1.5,
  terran:    1.0,
  jungle:    1.2,
  ocean:     1.0,
  arid:      0.6,
  steppe:    0.8,
  desert:    0.4,
  minimal:   0.3,
  tundra:    0.2,
  barren:    0.1,
  dead:      0.1,
  inferno:   0.05,
  toxic:     0.05,
  radiated:  0.05,
  gas_giant: 0.0,  // uninhabitable
};

// ── Racial tables ─────────────────────────────────────────────────────────────

/** Racial growth modifier. */
const RACIAL_GROWTH_MODIFIER: Record<string, number> = {
  rabbits:      2.00,
  ants:         1.25,
  guinea_pigs:  1.00,
  hamsters:     1.00,
  rats:         1.00,
  ferrets:      1.00,
  budgies:      1.00,
  chameleons:   1.00,
  mice:         0.75,
  hermit_crabs: 0.50,
};

/** Racial capacity modifier (+25% for Ants). */
const RACIAL_CAPACITY_MODIFIER: Record<string, number> = {
  rabbits:      1.0,
  ants:         1.25,
  guinea_pigs:  1.0,
  hamsters:     1.0,
  rats:         1.0,
  ferrets:      1.0,
  budgies:      1.0,
  chameleons:   1.0,
  mice:         1.0,
  hermit_crabs: 1.0,
};

/** Racial food production modifier. null = no food required (Hermit Crabs). */
const RACIAL_FOOD_MODIFIER: Record<string, number | null> = {
  rabbits:      1.25,
  ants:         1.20,
  budgies:      1.10,
  hamsters:     1.00,
  guinea_pigs:  1.00,
  rats:         1.00,
  ferrets:      1.00,
  chameleons:   1.00,
  mice:         0.50,
  hermit_crabs: null,  // no food required
};

/** Food per colonist per turn. Mice need only 0.5. */
const FOOD_PER_COLONIST: Record<string, number> = {
  mice:         0.5,
};
const DEFAULT_FOOD_PER_COLONIST = 1.0;

// ── Terraforming bonus table ──────────────────────────────────────────────────

/**
 * Terraforming bonus lookup: highest unlocked level, NOT cumulative.
 * Returns the bonus for the highest tech level ≤ given level.
 */
const TERRAFORMING_BONUS_TABLE: Array<{ minLevel: number; bonus: number }> = [
  { minLevel: 46, bonus: 120 },
  { minLevel: 38, bonus: 100 },
  { minLevel: 30, bonus:  80 },
  { minLevel: 22, bonus:  60 },
  { minLevel: 18, bonus:  50 },
  { minLevel: 14, bonus:  40 },
  { minLevel: 10, bonus:  30 },
  { minLevel:  6, bonus:  20 },
  { minLevel:  2, bonus:  10 },
  { minLevel:  0, bonus:   0 },
];

/**
 * Get the terraforming population bonus for a given tech level.
 * Uses the highest unlocked tier (non-cumulative).
 */
export function getTerraformingBonus(techLevel: number): number {
  for (const entry of TERRAFORMING_BONUS_TABLE) {
    if (techLevel >= entry.minLevel) {
      return entry.bonus;
    }
  }
  return 0;
}

// ── Cloning bonus table ───────────────────────────────────────────────────────

/**
 * Cloning tech bonus: flat population added per turn per planet.
 */
const CLONING_BONUS_TABLE: Array<{ minLevel: number; bonus: number }> = [
  { minLevel: 22, bonus: 5 },
  { minLevel: 11, bonus: 2 },
  { minLevel:  0, bonus: 0 },
];

/**
 * Get the flat cloning population bonus per turn for a given tech level.
 */
export function getCloningBonus(techLevel: number): number {
  for (const entry of CLONING_BONUS_TABLE) {
    if (techLevel >= entry.minLevel) {
      return entry.bonus;
    }
  }
  return 0;
}

// ── Soil enrichment bonus ─────────────────────────────────────────────────────

const SOIL_ENRICHMENT_BONUS: Record<0 | 1 | 2, number> = {
  0: 0,
  1: 25,
  2: 50,
};

// ── Helper: get race ID from planet/empire ────────────────────────────────────

/**
 * Shared context passed to population functions.
 */
export interface PopulationContext {
  /** Race identifier string (e.g. 'hamsters', 'rabbits'). */
  raceId: string;
  /** Tech state for terraforming and cloning lookups. */
  techState: TechState;
}

// ── calculateMaxPopulation ────────────────────────────────────────────────────

export interface MaxPopulationResult {
  /** Computed maximum population (floored integer). */
  maxPopulation: number;
  /** Base population used in calculation. */
  basePop: number;
  /** Terraforming bonus applied. */
  terraformingBonus: number;
  /** Soil enrichment bonus applied. */
  soilBonus: number;
  /** Environment capacity modifier (1.0 for Hermit Crabs). */
  envCapacityModifier: number;
  /** Racial capacity modifier (1.25 for Ants, 1.0 others). */
  racialCapacityModifier: number;
}

/**
 * Calculate maximum population capacity for a planet.
 *
 * Formula:
 *   Max_Population = floor(
 *     (base_population + terraforming_bonus + soil_bonus)
 *     × env_capacity_modifier
 *     × racial_capacity_modifier
 *   )
 *
 * Hermit Crabs: env_capacity_modifier = 1.0 always.
 * Ants: racial_capacity_modifier = 1.25.
 */
export function calculateMaxPopulation(
  planet: Planet & PopulationPlanetFields,
  ctx: PopulationContext,
): MaxPopulationResult {
  const isHermitCrab = ctx.raceId === 'hermit_crabs';

  // Use per-planet generated base_population, falling back to maxPopulation
  // (which may have been set during generation from base_population)
  const basePop = planet.base_population ?? planet.maxPopulation;

  const terraformingBonus = getTerraformingBonus(ctx.techState.terraforming_tech_level);

  const soilLevel = (planet.soil_enrichment_level ?? 0) as 0 | 1 | 2;
  const soilBonus = SOIL_ENRICHMENT_BONUS[soilLevel];

  // Hermit Crabs ignore environment capacity
  const envCapacityModifier = isHermitCrab ? 1.0 : (ENV_CAPACITY_MODIFIER[planet.type] ?? 1.0);

  const racialCapacityModifier = RACIAL_CAPACITY_MODIFIER[ctx.raceId] ?? 1.0;

  const maxPopulation = Math.floor(
    (basePop + terraformingBonus + soilBonus)
    * envCapacityModifier
    * racialCapacityModifier,
  );

  return {
    maxPopulation,
    basePop,
    terraformingBonus,
    soilBonus,
    envCapacityModifier,
    racialCapacityModifier,
  };
}

// ── calculatePopulationGrowth ─────────────────────────────────────────────────

export interface PopulationGrowthResult {
  /** Integer population added this turn (may be 0). */
  integerGrowth: number;
  /** New fractional population to store on planet. */
  newFractional: number;
  /** New total population after growth (capped at maxPop). */
  newPopulation: number;
  /** Natural growth before cloning (floating point). */
  naturalGrowth: number;
  /** Cloning bonus added this turn. */
  cloningBonus: number;
  /** Total growth (natural + cloning) before fractional carry-over. */
  totalGrowth: number;
  /** Max population used in calculation. */
  maxPopulation: number;
  /** Morale modifier used. */
  moraleModifier: number;
}

/**
 * Calculate population growth for one turn.
 *
 * Formula:
 *   Natural_Growth = pop × 0.10 × env_growth_mod × racial_mod × morale_mod × (1 - pop/max_pop)
 *   Cloning_Bonus  = cloning tech bonus (0, 2, or 5)
 *   Total_Growth   = Natural_Growth + Cloning_Bonus
 *   total_with_frac = Total_Growth + planet.fractional_population
 *   integer_growth  = floor(total_with_frac)
 *   new_fractional  = total_with_frac - integer_growth
 *   new_population  = min(pop + integer_growth, max_pop)
 *
 * Special cases:
 * - Hermit Crabs: env_growth_mod = 1.0 always
 * - Ants: morale_modifier = 1.0 always (hive mind)
 * - If pop >= max_pop: growth = 0, fractional unchanged, cloning wasted
 */
export function calculatePopulationGrowth(
  planet: Planet & PopulationPlanetFields,
  ctx: PopulationContext,
): PopulationGrowthResult {
  const isHermitCrab = ctx.raceId === 'hermit_crabs';
  const isAnt = ctx.raceId === 'ants';

  const { maxPopulation } = calculateMaxPopulation(planet, ctx);
  const pop = planet.population;

  // At or above max: no growth
  if (pop >= maxPopulation) {
    return {
      integerGrowth: 0,
      newFractional: planet.fractional_population ?? 0,
      newPopulation: pop,
      naturalGrowth: 0,
      cloningBonus: 0,
      totalGrowth: 0,
      maxPopulation,
      moraleModifier: calculateMoraleModifier(planet.morale_numeric ?? 50),
    };
  }

  // Environment growth modifier (Hermit Crabs always 1.0)
  const envGrowthMod = isHermitCrab ? 1.0 : (ENV_GROWTH_MODIFIER[planet.type] ?? 1.0);

  // Racial growth modifier
  const racialMod = RACIAL_GROWTH_MODIFIER[ctx.raceId] ?? 1.0;

  // Morale modifier: 0.5 + (morale / 200). Ants always 1.0.
  const moraleNumeric = planet.morale_numeric ?? 50;
  const moraleModifier = isAnt ? 1.0 : calculateMoraleModifier(moraleNumeric);

  // Logistic growth factor
  const growthFactor = 1 - pop / maxPopulation;

  // Natural growth
  const naturalGrowth = pop * 0.10 * envGrowthMod * racialMod * moraleModifier * growthFactor;

  // Cloning bonus
  const cloningBonus = getCloningBonus(ctx.techState.cloning_tech_level);

  // Total growth + fractional carry-over
  const totalGrowth = naturalGrowth + cloningBonus;
  const fractional = planet.fractional_population ?? 0;
  const totalWithFrac = totalGrowth + fractional;

  const integerGrowth = Math.floor(totalWithFrac);
  const newFractional = totalWithFrac - integerGrowth;
  const newPopulation = Math.min(pop + integerGrowth, maxPopulation);

  return {
    integerGrowth,
    newFractional,
    newPopulation,
    naturalGrowth,
    cloningBonus,
    totalGrowth,
    maxPopulation,
    moraleModifier,
  };
}

// ── Morale modifier helper ────────────────────────────────────────────────────

/**
 * Morale modifier: 0.5 + (morale / 200).
 * Morale ranges 0–100.
 * Morale=100 → 1.0, Morale=50 → 0.75, Morale=0 → 0.5.
 */
export function calculateMoraleModifier(moraleNumeric: number): number {
  return 0.5 + moraleNumeric / 200;
}

// ── processFoodAndStarvation ──────────────────────────────────────────────────

export interface FoodAndStarvationResult {
  /** Food required this turn. */
  foodRequired: number;
  /** Food produced this turn. */
  foodProduced: number;
  /** Food surplus (positive) or deficit (negative). */
  foodBalance: number;
  /** Population that died from starvation (0 if no deficit). */
  starvationDeaths: number;
  /** New population after starvation deaths. */
  newPopulation: number;
  /** Morale change due to starvation (-20 if starving, 0 otherwise). */
  moraleDelta: number;
}

/**
 * Process food production and starvation for one turn.
 *
 * Formula:
 *   food_required = pop × food_per_colonist (1.0; Mice = 0.5)
 *   food_produced = farmers × 2.0 × env_fertility × racial_food_mod
 *   if food_produced < food_required:
 *     deficit = food_required - food_produced
 *     deaths = floor(deficit × 0.5)
 *     population -= deaths
 *     morale -= 20
 *
 * Hermit Crabs: no food required, return early with zeros.
 */
export function processFoodAndStarvation(
  planet: Planet & PopulationPlanetFields,
  ctx: Pick<PopulationContext, 'raceId'>,
): FoodAndStarvationResult {
  // Hermit Crabs need no food
  if (ctx.raceId === 'hermit_crabs') {
    return {
      foodRequired: 0,
      foodProduced: 0,
      foodBalance: 0,
      starvationDeaths: 0,
      newPopulation: planet.population,
      moraleDelta: 0,
    };
  }

  const pop = planet.population;

  // Food per colonist
  const foodPerColonist = FOOD_PER_COLONIST[ctx.raceId] ?? DEFAULT_FOOD_PER_COLONIST;
  const foodRequired = pop * foodPerColonist;

  // Food production
  const farmers = planet.farmers ?? 0;
  const envFertility = ENV_FERTILITY[planet.type] ?? 1.0;
  const racialFoodMod = RACIAL_FOOD_MODIFIER[ctx.raceId] ?? 1.0;
  // racialFoodMod is number (not null) here since Hermit Crabs returned early
  const foodProduced = farmers * 2.0 * envFertility * (racialFoodMod as number);

  const foodBalance = foodProduced - foodRequired;

  if (foodBalance >= 0) {
    // Surplus: no starvation
    return {
      foodRequired,
      foodProduced,
      foodBalance,
      starvationDeaths: 0,
      newPopulation: pop,
      moraleDelta: 0,
    };
  }

  // Deficit: starvation
  const deficit = foodRequired - foodProduced;
  const starvationDeaths = Math.floor(deficit * 0.5);
  const newPopulation = Math.max(0, pop - starvationDeaths);

  return {
    foodRequired,
    foodProduced,
    foodBalance,
    starvationDeaths,
    newPopulation,
    moraleDelta: -20,
  };
}

// ── calculateDifficultyGrowthModifier ────────────────────────────────────────

/**
 * Difficulty growth modifier for player and AI empires.
 *
 * | Difficulty | Player | AI   |
 * |------------|--------|------|
 * | Simple     | 1.25   | 0.75 |
 * | Easy       | 1.10   | 0.90 |
 * | Average    | 1.00   | 1.00 |
 * | Hard       | 0.90   | 1.25 |
 * | Impossible | 0.75   | 1.50 |
 */
const DIFFICULTY_GROWTH_MODIFIERS: Record<Difficulty, { player: number; ai: number }> = {
  simple:     { player: 1.25, ai: 0.75 },
  easy:       { player: 1.10, ai: 0.90 },
  average:    { player: 1.00, ai: 1.00 },
  hard:       { player: 0.90, ai: 1.25 },
  impossible: { player: 0.75, ai: 1.50 },
};

/**
 * Get the growth modifier for a given difficulty and empire type.
 *
 * @param difficulty  Game difficulty level
 * @param isPlayer    True for the player empire, false for AI empires
 * @returns Growth modifier (multiplier on natural growth)
 */
export function calculateDifficultyGrowthModifier(
  difficulty: Difficulty,
  isPlayer: boolean,
): number {
  const entry = DIFFICULTY_GROWTH_MODIFIERS[difficulty];
  return isPlayer ? entry.player : entry.ai;
}

// ── Empire context builder helpers ────────────────────────────────────────────

/**
 * Build a PopulationContext from an empire's raceId and a TechState.
 */
export function makePopulationContext(raceId: string, techState: TechState): PopulationContext {
  return { raceId, techState };
}

/**
 * Default TechState for testing/baseline (no tech unlocked).
 */
export const DEFAULT_TECH_STATE: TechState = {
  terraforming_tech_level: 0,
  cloning_tech_level: 0,
};

// ── Re-export env tables for callers that need them ───────────────────────────

export { ENV_GROWTH_MODIFIER, ENV_CAPACITY_MODIFIER, ENV_FERTILITY };
export { RACIAL_GROWTH_MODIFIER, RACIAL_FOOD_MODIFIER };
