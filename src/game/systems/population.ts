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

import { Planet, PlanetType, DifficultyLevel } from '../state';
import { getGrowthMultiplier } from './difficulty';

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
  /** Whether this planet is in a nebula system (bonus capacity). Default: false. */
  in_nebula?: boolean;
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

// Re-export Difficulty type from state (now DifficultyLevel)
export type Difficulty = DifficultyLevel;

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
/**
 * Cloning tech bonus: flat population added per turn per planet.
 * Design source: design/technology/planetology.md §Cloning Technology
 * - Cloning (TL 21): +2 pop/turn
 * - Advanced Cloning (TL 42): +5 pop/turn
 */
const CLONING_BONUS_TABLE: Array<{ minLevel: number; bonus: number }> = [
  { minLevel: 42, bonus: 5 },
  { minLevel: 21, bonus: 2 },
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

// ── Nebula capacity bonus ─────────────────────────────────────────────────────

// NOTE: Nebula capacity bonus removed per design review (fix-14)
// Design doc (population-growth.md) does not specify nebula bonuses for population

// ── Helper: get race ID from planet/empire ────────────────────────────────────

/**
 * Shared context passed to population functions.
 */
export interface PopulationContext {
  /** Race identifier string (e.g. 'hamsters', 'rabbits'). */
  raceId: string;
  /** Tech state for terraforming and cloning lookups. */
  techState: TechState;
  /** Difficulty level for growth modifiers. */
  difficulty?: DifficultyLevel;
  /** Whether this is the player's empire (affects difficulty modifier direction). */
  isPlayer?: boolean;
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

  // NOTE: Nebula capacity bonus removed per design review (fix-14)
  // Design doc does not mention nebula bonuses for population capacity

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

  // Difficulty growth modifier
  const difficultyGrowthMod = ctx.difficulty 
    ? getGrowthMultiplier(ctx.difficulty, ctx.isPlayer ?? true) 
    : 1.0;

  // Natural growth (with difficulty modifier)
  const naturalGrowth = pop * 0.10 * envGrowthMod * racialMod * moraleModifier * growthFactor * difficultyGrowthMod;

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
const DIFFICULTY_GROWTH_MODIFIERS: Record<Exclude<Difficulty, 'custom'>, { player: number; ai: number }> = {
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
  // Custom difficulty defaults to Average
  const key = difficulty === 'custom' ? 'average' : difficulty;
  const entry = DIFFICULTY_GROWTH_MODIFIERS[key];
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

// ── Conquered Population (Post-Invasion) ─────────────────────────────────────

/**
 * Conquest population reduction modifier by race.
 * Most races: 0.50 (50% reduction)
 * Ferrets: 0.60 (40% reduction) — more efficient at conquest
 *
 * Per design/economy/population-growth.md:
 *   "Post-invasion reduction: After your troops win, the surviving
 *    post-bombardment population is reduced by 50%.
 *    Ferrets reduce the post-invasion 50% to 40%."
 */
const CONQUEST_SURVIVAL_RATE: Record<string, number> = {
  ferrets: 0.60, // 40% reduction → 60% survival
};
const DEFAULT_CONQUEST_SURVIVAL_RATE = 0.50; // 50% reduction → 50% survival

/** Minimum population after conquest (cannot depopulate planet). */
const MIN_CONQUEST_SURVIVORS = 1;

export interface ConquestResult {
  /** Population before conquest reduction. */
  priorPopulation: number;
  /** Survival rate applied (0.50 for most, 0.60 for Ferrets). */
  survivalRate: number;
  /** Final population after conquest reduction. */
  newPopulation: number;
  /** Population lost to conquest reduction. */
  populationLost: number;
}

/**
 * Calculate population after conquest.
 *
 * Per design/economy/population-growth.md §Conquered Population:
 *   Post_Bombardment_Pop = Planet_Population - Bombardment_Kills
 *   Conquest_Survivors = floor(Post_Bombardment_Pop × 0.50)
 *   Final_Population = max(Conquest_Survivors, 1)
 *
 * Ferrets reduce the 50% to 40% (i.e., 60% survival rate).
 *
 * @param postBombardmentPop Population remaining after bombardment phase
 * @param conquerorRaceId Race ID of the conquering empire
 * @returns Conquest result with new population
 */
export function processConqueredPopulation(
  postBombardmentPop: number,
  conquerorRaceId: string,
): ConquestResult {
  const survivalRate = CONQUEST_SURVIVAL_RATE[conquerorRaceId] ?? DEFAULT_CONQUEST_SURVIVAL_RATE;
  const survivors = Math.floor(postBombardmentPop * survivalRate);
  const newPopulation = Math.max(survivors, MIN_CONQUEST_SURVIVORS);
  const populationLost = postBombardmentPop - newPopulation;

  return {
    priorPopulation: postBombardmentPop,
    survivalRate,
    newPopulation,
    populationLost,
  };
}

// ── Overcrowding ──────────────────────────────────────────────────────────────

/** Starvation rate for overcrowded population per turn. */
const OVERCROWDING_STARVATION_RATE = 0.5;

export interface OvercrowdingResult {
  /** Whether the planet is overcrowded. */
  isOvercrowded: boolean;
  /** Excess population above max. */
  excessPopulation: number;
  /** Deaths this turn due to overcrowding starvation. */
  starvationDeaths: number;
  /** New population after overcrowding starvation. */
  newPopulation: number;
  /** Morale penalty from overcrowding starvation (-20 if starving). */
  moraleDelta: number;
}

/**
 * Process overcrowding when population exceeds max capacity.
 *
 * Per design/economy/population-growth.md §Overcrowding:
 *   When current_population > new_max_population:
 *     - Excess population does NOT die immediately
 *     - Growth is suppressed to zero (handled by calculatePopulationGrowth)
 *     - Excess population starves at Starvation_Rate (0.5) per turn
 *     - Population converges to Max_Population over several turns
 *
 * This function should be called AFTER calculateMaxPopulation but BEFORE
 * calculatePopulationGrowth. If overcrowded, the starvation here handles
 * the reduction; processFoodAndStarvation handles normal food deficits.
 *
 * @param planet Planet to check for overcrowding
 * @param ctx Population context with race and tech info
 * @returns Overcrowding result with any starvation deaths
 */
export function processOvercrowding(
  planet: Planet & PopulationPlanetFields,
  ctx: PopulationContext,
): OvercrowdingResult {
  const { maxPopulation } = calculateMaxPopulation(planet, ctx);
  const pop = planet.population;

  if (pop <= maxPopulation) {
    return {
      isOvercrowded: false,
      excessPopulation: 0,
      starvationDeaths: 0,
      newPopulation: pop,
      moraleDelta: 0,
    };
  }

  // Overcrowded: excess population starves
  const excessPopulation = pop - maxPopulation;
  const starvationDeaths = Math.floor(excessPopulation * OVERCROWDING_STARVATION_RATE);
  const newPopulation = Math.max(maxPopulation, pop - starvationDeaths);

  return {
    isOvercrowded: true,
    excessPopulation,
    starvationDeaths,
    newPopulation,
    moraleDelta: starvationDeaths > 0 ? -20 : 0,
  };
}

// ── Rabbits Overflow Transport Ability ────────────────────────────────────────

/**
 * Check if a race can auto-redirect overflow population to transports.
 *
 * Per design/economy/population-growth.md §Overflow Population:
 *   "Rabbits Special: Can redirect overflow population to transports
 *    automatically (unique ability)."
 *
 * When a planet reaches max population:
 *   - Normal races: Growth ceases, cloning bonus wasted
 *   - Rabbits: Excess growth can be queued to colony transports
 *
 * @param raceId Race identifier
 * @returns True if race can auto-redirect overflow to transports
 */
export function canAutoTransportOverflow(raceId: string): boolean {
  return raceId === 'rabbits';
}

export interface OverflowTransportResult {
  /** Whether overflow was redirected to transports. */
  redirected: boolean;
  /** Population redirected to transports (0 if not applicable). */
  populationRedirected: number;
  /** Growth that was wasted (not redirected). */
  wastedGrowth: number;
}

/**
 * Calculate overflow population that can be redirected to transports.
 *
 * Per design/economy/population-growth.md:
 *   When population reaches max:
 *   - Natural growth ceases (growth factor = 0)
 *   - Cloning bonus is wasted (does not overflow)
 *   - Rabbits: Can redirect overflow to transports automatically
 *
 * This calculates how much growth would have occurred if not at max,
 * and whether it can be redirected to transports (Rabbits only).
 *
 * @param planet Planet at max population
 * @param ctx Population context
 * @param potentialGrowth The growth that would have occurred if not at max
 * @returns Overflow transport result
 */
export function calculateOverflowTransport(
  _planet: Planet & PopulationPlanetFields,
  ctx: PopulationContext,
  potentialGrowth: number,
): OverflowTransportResult {
  const canRedirect = canAutoTransportOverflow(ctx.raceId);

  if (!canRedirect || potentialGrowth <= 0) {
    return {
      redirected: false,
      populationRedirected: 0,
      wastedGrowth: potentialGrowth > 0 ? potentialGrowth : 0,
    };
  }

  // Rabbits can redirect overflow to transports
  // Only natural growth can be redirected; cloning bonus is still wasted
  // For simplicity, we allow all potential growth to be redirected
  return {
    redirected: true,
    populationRedirected: Math.floor(potentialGrowth),
    wastedGrowth: 0,
  };
}

// ── Bio Weapon Max Population Reduction ───────────────────────────────────────

/**
 * Bio weapon effects on max population.
 * Design source: design/economy/population-growth.md §Edge Cases - Biological Weapon Damage
 * Design source: design/technology/planetology.md §Biological Weapons
 *
 * Bio weapons permanently reduce a planet's maximum population capacity:
 *   - Death Spores (Planetology TL 9): -10% permanent
 *   - Doom Virus (Planetology TL 25): -25% permanent
 *   - Bio Terminator (Planetology TL 33): -50% permanent
 *
 * The reduction is permanent until the planet is re-terraformed.
 */

import {
  BIO_WEAPONS,
  BioWeaponType,
  COLONY_TRANSPORT_COST,
  COLONY_TRANSPORT_MAINTENANCE,
  POPULATION_TRANSPORT_CAPACITY,
} from '../constants';

/** Extended planet fields for bio weapon damage tracking. */
export interface BioWeaponPlanetFields {
  /**
   * Cumulative bio weapon max population reduction factor.
   * Value between 0 and 1 (e.g., 0.10 = 10% reduction).
   * Applied to max population calculation.
   * Reset when planet is re-terraformed.
   */
  bioWeaponMaxPopReduction?: number;
}

export interface BioWeaponDamageResult {
  /** Population killed this attack. */
  populationKilled: number;
  /** New population after kills. */
  newPopulation: number;
  /** Max pop reduction applied (0.0 to 1.0). */
  maxPopReductionApplied: number;
  /** New cumulative max pop reduction factor on planet. */
  newTotalMaxPopReduction: number;
  /** New max population after reduction. */
  newMaxPopulation: number;
  /** Whether planet was already at max reduction (no further reduction applied). */
  atMaxReduction: boolean;
}

/**
 * Maximum cumulative bio weapon max population reduction.
 * Even multiple bio attacks cannot reduce max pop below this factor.
 */
const MAX_BIO_WEAPON_REDUCTION = 0.90; // Max 90% reduction, min 10% of original capacity

/**
 * Process bio weapon damage to a planet.
 *
 * Per design/economy/population-growth.md §Biological Weapon Damage:
 *   Population_Killed = Weapon_Kill_Rate × Number_Of_Weapons × Combat_Rounds_Survived
 *   New_Max_Pop = Old_Max_Pop × (1 - Max_Pop_Reduction)
 *
 * The max pop reduction is cumulative across multiple attacks, but capped.
 *
 * @param planet Planet being attacked (with population and optional bioWeaponMaxPopReduction)
 * @param weaponType Type of bio weapon used
 * @param weaponCount Number of weapons firing
 * @param combatRounds Number of combat rounds the attacking ship survived
 * @param ctx Population context for max population calculation
 * @param antidoteReduction Casualties negated by defender's antidote tech (per attack)
 * @returns Bio weapon damage result
 */
export function processBioWeaponDamage(
  planet: Planet & PopulationPlanetFields & BioWeaponPlanetFields,
  weaponType: BioWeaponType,
  weaponCount: number,
  combatRounds: number,
  ctx: PopulationContext,
  antidoteReduction: number = 0,
): BioWeaponDamageResult {
  const weapon = BIO_WEAPONS[weaponType];

  // Calculate gross casualties
  const grossKills = weapon.killRatePerRound * weaponCount * combatRounds;

  // Apply antidote reduction (per round, not per weapon)
  const antidoteTotal = antidoteReduction * combatRounds;
  const netKills = Math.max(0, grossKills - antidoteTotal);

  // Apply population kills
  const currentPop = planet.population;
  const populationKilled = Math.min(netKills, currentPop - 1); // Minimum 1 survivor
  const newPopulation = currentPop - populationKilled;

  // Calculate max population reduction
  const currentReduction = planet.bioWeaponMaxPopReduction ?? 0;
  let atMaxReduction = false;

  // Check if already at max reduction
  if (currentReduction >= MAX_BIO_WEAPON_REDUCTION) {
    atMaxReduction = true;
    // No further reduction, but still kill population
    const { maxPopulation } = calculateMaxPopulation(planet, ctx);
    const reducedMaxPop = Math.floor(maxPopulation * (1 - currentReduction));

    return {
      populationKilled,
      newPopulation,
      maxPopReductionApplied: 0,
      newTotalMaxPopReduction: currentReduction,
      newMaxPopulation: Math.max(1, reducedMaxPop),
      atMaxReduction: true,
    };
  }

  // Apply new reduction (cumulative)
  const weaponReduction = weapon.maxPopReduction;
  const newTotalReduction = Math.min(
    currentReduction + weaponReduction,
    MAX_BIO_WEAPON_REDUCTION,
  );
  const actualReductionApplied = newTotalReduction - currentReduction;

  // Calculate new max population
  const { maxPopulation: baseMaxPop } = calculateMaxPopulation(planet, ctx);
  const newMaxPopulation = Math.max(1, Math.floor(baseMaxPop * (1 - newTotalReduction)));

  return {
    populationKilled,
    newPopulation,
    maxPopReductionApplied: actualReductionApplied,
    newTotalMaxPopReduction: newTotalReduction,
    newMaxPopulation,
    atMaxReduction,
  };
}

/**
 * Clear bio weapon damage from a planet (e.g., after re-terraforming).
 *
 * Per design/economy/population-growth.md:
 *   "Max population reduction is permanent until the planet is re-terraformed."
 *
 * @param planet Planet to clear bio weapon reduction from
 * @returns The reduction that was cleared (0 if none)
 */
export function clearBioWeaponDamage(
  planet: BioWeaponPlanetFields,
): number {
  const cleared = planet.bioWeaponMaxPopReduction ?? 0;
  planet.bioWeaponMaxPopReduction = 0;
  return cleared;
}

/**
 * Calculate effective max population accounting for bio weapon damage.
 *
 * This should be called instead of calculateMaxPopulation when
 * bio weapon damage needs to be considered.
 *
 * @param planet Planet with potential bio weapon damage
 * @param ctx Population context
 * @returns Effective max population after bio weapon reduction
 */
export function getEffectiveMaxPopulation(
  planet: Planet & PopulationPlanetFields & BioWeaponPlanetFields,
  ctx: PopulationContext,
): number {
  const { maxPopulation } = calculateMaxPopulation(planet, ctx);
  const bioReduction = planet.bioWeaponMaxPopReduction ?? 0;

  if (bioReduction <= 0) {
    return maxPopulation;
  }

  return Math.max(1, Math.floor(maxPopulation * (1 - bioReduction)));
}

// ── Population Transport Constants ────────────────────────────────────────────

/**
 * Population transport ship specifications.
 * Design source: design/economy/population-growth.md §7 Population Transport
 *
 * Colony Transport: 50 BC cost, 1 BC/turn maintenance, 1 million pop capacity
 */
export const POPULATION_TRANSPORT = {
  cost: COLONY_TRANSPORT_COST,
  maintenance: COLONY_TRANSPORT_MAINTENANCE,
  capacity: POPULATION_TRANSPORT_CAPACITY,
} as const;

// ── Re-export env tables for callers that need them ───────────────────────────

export { ENV_GROWTH_MODIFIER, ENV_CAPACITY_MODIFIER, ENV_FERTILITY };
export { RACIAL_GROWTH_MODIFIER, RACIAL_FOOD_MODIFIER };
