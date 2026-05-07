/**
 * Production system — pure TypeScript, NO DOM.
 * src/game/systems/production.ts
 *
 * Calculates per-turn production for a planet, including:
 *   - Gross production (factories + population labor, scaled by Planetology TL
 *     and mineral richness)
 *   - Pollution generation and cleanup cost
 *   - Net production
 *   - Slider allocation (SHIP / DEF / IND / ECO / TECH)
 *   - ECO sub-phases: cleanup → growth bonus → terraforming
 *   - TECH: scientist diversion reduces Active_Population
 *   - Slider validation and rebalancing
 *   - Overflow to Empire Reserve
 *
 * All formulas follow design/economy/slider-mathematics.md and
 * design/economy/factory-formulas.md.  No DOM, no side effects.
 */

import { Planet, ResourceLevel, DifficultyLevel } from '../state';
import { getProductionMultiplier } from './difficulty';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Base output per factory per turn (BC). */
export const BASE_FACTORY_OUTPUT = 1.0;

/** Base output per colonist at Planetology TL 0. */
export const BASE_POP_OUTPUT_MIN = 0.5;

/** Base output per colonist at Planetology TL ≥ 50 (cap). */
export const BASE_POP_OUTPUT_MAX = 2.0;

/** Planetology TL at which pop output is capped. */
export const PLANETOLOGY_TL_CAP = 50;

/** Base cleanup cost per unit of pollution (BC). */
export const BASE_CLEANUP_COST_PER_POLLUTION = 0.5;

/** Each BC spent on ECO growth bonus adds this much pop growth per turn. */
export const GROWTH_BC_EFFICIENCY = 0.1;

// Ship economics constants imported from constants.ts
import {
  SHIP_MAINTENANCE_RATE,
  MINIMUM_SHIP_MAINTENANCE,
  SCRAP_RATE_EMERGENCY,
  SCRAP_RATE_BASE,
  SCRAP_RATE_SHIPYARD,
  SCRAP_RATE_DAMAGED,
  SCRAP_RATE_ENEMY_TERRITORY,
  REFIT_RATE,
} from '../constants';

// Re-export for backwards compatibility
export { SHIP_MAINTENANCE_RATE, MINIMUM_SHIP_MAINTENANCE };

/** @deprecated Use SCRAP_RATE_EMERGENCY from constants.ts */
export const EMERGENCY_SCRAP_RATE = SCRAP_RATE_EMERGENCY;

/** Mineral richness multipliers keyed by ResourceLevel. */
export const MINERAL_RICHNESS_MODIFIERS: Record<ResourceLevel, number> = {
  ultra_poor: 0.33,
  poor:       0.50,
  normal:     1.00,
  rich:       2.00,
  ultra_rich: 3.00,
};

// ─────────────────────────────────────────────────────────────────────────────
// Empire-level production context
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All empire-level parameters needed to compute production for one planet.
 * Callers derive these from Empire / tech state before calling production fns.
 */
export interface ProductionContext {
  /** Racial production modifier (1.0 = baseline, 1.5 = Ants, etc.). */
  racialProductionModifier: number;

  /** Racial research modifier applied to RP output. */
  racialResearchModifier: number;

  /** Difficulty-based production multiplier (derived from difficulty + isPlayer). */
  difficultyProductionModifier: number;

  /**
   * Base Robotic Controls level from technology (how many factories each colonist can operate).
   * Starting value = 2 (Robotic Controls II).
   * Note: Mice (Meklars) receive +2 to this level via racialRCBonus.
   */
  roboticControlsLevel: number;

  /**
   * Racial bonus to Robotic Controls level.
   * Mice (Meklars) = +2, all others = 0.
   * Effective RC level = roboticControlsLevel + racialRCBonus.
   */
  racialRCBonus: number;

  /**
   * Planetology tech level (0–50).  Drives Base_Pop_Output scaling.
   * 0 = game start (effectively 0.5 BC/pop), 50 = 2.0 BC/pop.
   */
  planetologyTL: number;

  /**
   * Waste rate — fraction of pollution generated per factory per turn.
   * 1.0 = no reduction, 0.0 = Industrial Waste Elimination.
   */
  wasteRate: number;

  /**
   * Eco Restoration cleanup modifier.
   * Cleanup_Cost = Pollution × 0.5 × cleanupModifier.
   * 1.0 = Ecological Restoration (base), 0.10 = Complete Eco Restoration.
   */
  cleanupModifier: number;

  /**
   * Factory cost in BC (used by buildFactories).
   * Starts at 10, reduced by Construction tech (min 2).
   */
  factoryCostBC: number;

  /**
   * Maximum terraform tier the empire has researched.
   * Terraforming_Progress cannot advance past this tier's cost.
   * If null, no terraforming is possible.
   */
  maxTerraformTier: number | null;

  /**
   * Per-tier BC cost to complete a terraforming upgrade.
   * Excess BC at the max researched tier overflows to Empire Reserve.
   */
  terraformTierCost: number;

  /**
   * Factory efficiency multiplier (e.g. 1.5 for Mice "Automated Production").
   * Applied per factory on top of the base 1 BC/factory output.
   */
  factoryEfficiencyMultiplier: number;

  /**
   * Racial ship maintenance modifier (e.g. 0.80 for Mice, 0.75 for Ants).
   * Applied to ship maintenance costs.
   */
  racialMaintenanceModifier: number;

  /**
   * Tech-based fleet logistics modifiers (multiplicative).
   * Example: [0.90, 0.80, 0.70] for Fleet Logistics I, II, III.
   */
  fleetLogisticsModifiers: number[];
}

/**
 * Sensible defaults for a baseline Hamster empire at game start.
 * Override individual fields as needed in tests or game logic.
 */
export const DEFAULT_PRODUCTION_CONTEXT: ProductionContext = {
  racialProductionModifier: 1.0,
  racialResearchModifier:   1.0,
  difficultyProductionModifier: 1.0,
  roboticControlsLevel:     2,
  racialRCBonus:            0,
  planetologyTL:            1,
  wasteRate:                1.0,
  cleanupModifier:          1.0,
  factoryCostBC:            10,
  maxTerraformTier:         null,
  terraformTierCost:        200,
  factoryEfficiencyMultiplier: 1.0,
  racialMaintenanceModifier: 1.0,
  fleetLogisticsModifiers:  [],
};

/**
 * Create a production context with difficulty modifiers applied.
 * @param baseContext The base context without difficulty applied.
 * @param difficulty  Game difficulty level.
 * @param isPlayer    Whether this is for the player empire.
 */
export function applyDifficultyToContext(
  baseContext: ProductionContext,
  difficulty: DifficultyLevel,
  isPlayer: boolean,
): ProductionContext {
  return {
    ...baseContext,
    difficultyProductionModifier: getProductionMultiplier(difficulty, isPlayer),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Basic helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Population labor output rate (BC per colonist per turn) based on
 * Planetology tech level.
 *
 * Formula: 0.5 + (min(TL, 50) / 50 × 1.5)
 *   TL  0 → 0.50  |  TL 25 → 1.25  |  TL 50 → 2.00
 */
export function basePopOutput(planetologyTL: number): number {
  const clampedTL = Math.min(Math.max(planetologyTL, 0), PLANETOLOGY_TL_CAP);
  return BASE_POP_OUTPUT_MIN + (clampedTL / PLANETOLOGY_TL_CAP) * (BASE_POP_OUTPUT_MAX - BASE_POP_OUTPUT_MIN);
}

/**
 * Mineral richness multiplier from the planet's ResourceLevel.
 * Uses isRich / isPoor for backwards-compat when resourceLevel is not set.
 */
export function getRichnessMultiplier(planet: Planet): number {
  // resourceLevel is authoritative when present
  return MINERAL_RICHNESS_MODIFIERS[planet.resourceLevel] ?? 1.0;
}

/**
 * Get effective Robotic Controls level, including racial bonuses.
 * Mice (Meklars) receive +2 to their effective RC level.
 *
 * @param ctx ProductionContext with base RC level and racial bonus.
 * @returns Effective RC level (roboticControlsLevel + racialRCBonus).
 */
export function getEffectiveRCLevel(ctx: ProductionContext): number {
  return ctx.roboticControlsLevel + ctx.racialRCBonus;
}

/**
 * Number of factories a planet can actually operate, given its population
 * and effective Robotic Controls level (including racial bonuses).
 */
export function operatingFactories(planet: Planet, ctx: ProductionContext): number {
  const effectiveRC = getEffectiveRCLevel(ctx);
  const maxOperable = planet.population * effectiveRC;
  return Math.min(planet.factories, maxOperable);
}

// ─────────────────────────────────────────────────────────────────────────────
// Gross production
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of a gross production calculation.
 */
export interface GrossProductionResult {
  /** Factories that contributed to output this turn. */
  operatingFactories: number;
  /** Idle factories (built but not operable due to population limit). */
  idleFactories: number;
  /** BC output from factory operations. */
  factoryProduction: number;
  /** BC output from population labor (TECH workers excluded). */
  populationProduction: number;
  /** Total gross BC before richness modifier. */
  grossBeforeRichness: number;
  /** Gross BC after mineral richness multiplier applied. */
  grossProduction: number;
}

/**
 * Compute gross production for a planet.
 *
 * TECH diversion:  TECH_Percent removes workers from the labor pool.
 * Active_Population = Population × (1 − TECH_Percent / 100)
 *
 * Factory operation uses total population (factories need tenders), but
 * population production bonus uses only Active_Population (MOO1 faithful).
 *
 * Returns 0 for uncolonised planets.
 */
export function calculateGrossProduction(
  planet: Planet,
  ctx: ProductionContext,
): GrossProductionResult {
  if (!planet.isColonized || planet.ownerId === null) {
    return {
      operatingFactories: 0,
      idleFactories: 0,
      factoryProduction: 0,
      populationProduction: 0,
      grossBeforeRichness: 0,
      grossProduction: 0,
    };
  }

  const techPercent = planet.production.research; // TECH slider
  const activePop = planet.population * (1 - techPercent / 100);

  // Factories are operated by *total* population (not just active workers)
  const opFac = operatingFactories(planet, ctx);
  const idleFac = planet.factories - opFac;

  // Factory output formula per design/economy/factory-formulas.md §2:
  //   Effective_Factory_Output = Operating_Factories × Base_Factory_Output × Racial_Production_Modifier
  // The factoryEfficiencyMultiplier handles special abilities like Mice "Automated Production"
  // which stacks with the base racial production modifier.
  // Difficulty modifier is NOT applied here — it applies to NET production after cleanup.
  const factoryBC = opFac * BASE_FACTORY_OUTPUT * ctx.factoryEfficiencyMultiplier 
    * ctx.racialProductionModifier;

  // Population labor output — difficulty modifier is NOT applied here.
  // Per design/economy/factory-formulas.md §Difficulty Modifiers:
  //   "These modifiers apply to the final net production after cleanup costs."
  const popRate = basePopOutput(ctx.planetologyTL);
  const popBC = activePop * popRate * ctx.racialProductionModifier;

  const grossBeforeRichness = factoryBC + popBC;
  const richness = getRichnessMultiplier(planet);
  const grossProduction = grossBeforeRichness * richness;

  return {
    operatingFactories: opFac,
    idleFactories: idleFac,
    factoryProduction: factoryBC * richness,
    populationProduction: popBC * richness,
    grossBeforeRichness,
    grossProduction,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pollution and cleanup
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of pollution / cleanup calculation.
 */
export interface PollutionResult {
  /** Pollution units generated by operating factories. */
  pollutionGenerated: number;
  /** BC required to fully clean up pollution. */
  cleanupCost: number;
}

/**
 * Calculate pollution generated and full cleanup cost.
 *
 * Pollution_Generated = Operating_Factories × wasteRate
 * Cleanup_Cost        = Pollution_Generated × 0.5 × cleanupModifier
 */
export function calculatePollution(opFac: number, ctx: ProductionContext): PollutionResult {
  const pollutionGenerated = opFac * ctx.wasteRate;
  const cleanupCost = pollutionGenerated * BASE_CLEANUP_COST_PER_POLLUTION * ctx.cleanupModifier;
  return { pollutionGenerated, cleanupCost };
}

// ─────────────────────────────────────────────────────────────────────────────
// Net production
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Combined result of one full production pass.
 */
export interface NetProductionResult {
  gross: GrossProductionResult;
  pollution: PollutionResult;
  /** Net BC available for slider allocation (floored). */
  netProduction: number;
}

/**
 * Compute net production for a planet.
 *
 * Net_Production = floor((Gross_Production − Cleanup_Cost) × Difficulty_Modifier)
 *
 * Per design/economy/factory-formulas.md §Difficulty Modifiers:
 *   "These modifiers apply to the final net production after cleanup costs."
 *
 * Note on design reconciliation:
 *   factory-formulas.md shows cleanup deducted from gross to get net.
 *   slider-mathematics.md shows cleanup as first charge against ECO_BC.
 *   The authoritative model (slider-mathematics.md §5) is:
 *     1. Gross production is calculated.
 *     2. Cleanup_Cost is subtracted → Net_Production (pre-difficulty).
 *     3. Difficulty modifier is applied to net production.
 *     4. Net_Production is split by SHIP/DEF/IND/ECO sliders.
 *     5. ECO allocation then handles growth/terraform *after* cleanup.
 */
export function calculateNetProduction(
  planet: Planet,
  ctx: ProductionContext,
): NetProductionResult {
  const gross = calculateGrossProduction(planet, ctx);
  const pollution = calculatePollution(gross.operatingFactories, ctx);
  // Calculate net before difficulty modifier
  const netBeforeDifficulty = Math.max(0, gross.grossProduction - pollution.cleanupCost);
  // Apply difficulty modifier to NET production (after cleanup costs)
  const netContinuous = netBeforeDifficulty * ctx.difficultyProductionModifier;
  const netProduction = Math.floor(netContinuous);
  return { gross, pollution, netProduction };
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy / backwards-compat helpers (used by existing tests & turn.ts)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simplified base production used by early tests and the turn-system stub.
 *
 * Uses DEFAULT_PRODUCTION_CONTEXT (Hamster baseline, TL 1, no waste reduction).
 * For the full calculation, call calculateNetProduction() with a real context.
 */
export function calculateBaseProduction(planet: Planet): number {
  if (!planet.isColonized || planet.ownerId === null) return 0;
  const result = calculateNetProduction(planet, DEFAULT_PRODUCTION_CONTEXT);
  return result.netProduction;
}

// ─────────────────────────────────────────────────────────────────────────────
// Slider allocation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate that slider percentages sum to 100 (within 1% tolerance for
 * floating-point).  Returns true if valid.
 */
export function validateSliders(production: Planet['production']): boolean {
  const sum = production.ship + production.defense + production.industry
    + production.ecology + production.research;
  return Math.abs(sum - 100) < 1;
}

/**
 * BC allocated per production category after net production is split by sliders.
 * Values are floored to integer BC.
 */
export interface SliderAllocation {
  ship: number;
  defense: number;
  industry: number;
  ecology: number;
  /** RP per turn (not BC — TECH diverts pop, doesn't spend BC). */
  techRP: number;
  /** BC for scientists (population × TECH% / 100). */
  scientists: number;
}

/**
 * Allocate net production across sliders.
 *
 * TECH works differently: it diverts population from labor (already
 * accounted for in grossProduction via activePop) and generates RP.
 * The remaining 4 sliders (SHIP/DEF/IND/ECO) split 100% of netProduction.
 *
 * Per slider-mathematics.md §5:
 *   "TECH_Percent removes workers from labor pool before production is
 *    calculated. The other 4 sliders split 100% of the (now smaller)
 *    Net_Production."
 */
export function allocateSliders(
  planet: Planet,
  netProduction: number,
  ctx: ProductionContext,
): SliderAllocation {
  const p = planet.production;

  // The 4 non-TECH sliders split net production; they must sum ≤ 100 after
  // TECH is excluded. Renormalise in case of floating-point drift.
  const nonTechTotal = p.ship + p.defense + p.industry + p.ecology;
  const scale = nonTechTotal > 0 ? 100 / nonTechTotal : 0;

  const ship     = Math.floor(netProduction * (p.ship    * scale) / 100);
  const defense  = Math.floor(netProduction * (p.defense * scale) / 100);
  const industry = Math.floor(netProduction * (p.industry * scale) / 100);
  const ecology  = Math.floor(netProduction * (p.ecology  * scale) / 100);

  // TECH: scientists = population × (TECH% / 100), RP per scientist = 1.0 × racialResearchModifier
  const scientists = planet.population * (p.research / 100);
  const baseRP = scientists * 1.0 * ctx.racialResearchModifier;
  // Apply planet-specific research multiplier (Orion=4.0, Artifacts=2.0, default=1.0)
  const researchMultiplier = planet.researchMultiplier ?? 1.0;
  const techRP = baseRP * researchMultiplier;

  return { ship, defense, industry, ecology, techRP, scientists };
}

// ─────────────────────────────────────────────────────────────────────────────
// ECO sub-phases
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of processing the ECO allocation through its three priority phases.
 */
export interface EcoPhaseResult {
  /** BC actually spent on cleanup (may be < cleanupCost if ECO_BC short). */
  cleanupPaid: number;
  /** Uncleaned pollution (pollution units not addressed). */
  uncleanedPollution: number;
  /** BC spent on population growth bonus. */
  growthBCSpent: number;
  /** Fractional population growth bonus added this turn. */
  growthBonus: number;
  /** BC allocated to terraforming progress. */
  terraformBCSpent: number;
  /** BC that overflowed to Empire Reserve (max pop + max terraform tier). */
  ecoReserveOverflow: number;
}

/**
 * Process ECO allocation through the three priority phases:
 *   1. Pollution cleanup (mandatory)
 *   2. Population growth bonus
 *   3. Terraforming
 *
 * @param ecoBc           BC from ECO slider
 * @param pollutionResult Pollution/cleanup amounts for this turn
 * @param planet          Current planet state
 * @param ctx             Empire production context
 * @param terraformProgress Current terraforming progress (BC accumulated so far)
 */
export function processEcoPhases(
  ecoBc: number,
  pollutionResult: PollutionResult,
  planet: Planet,
  ctx: ProductionContext,
  terraformProgress: number,
): EcoPhaseResult {
  let remaining = ecoBc;

  // ── Phase 1: Pollution cleanup ────────────────────────────────────────────
  const cleanupNeeded = pollutionResult.cleanupCost;
  const cleanupPaid = Math.min(remaining, cleanupNeeded);
  remaining -= cleanupPaid;

  // Uncleaned pollution in pollution units (not BC)
  const uncleanedPollution =
    cleanupPaid < cleanupNeeded
      ? (cleanupNeeded - cleanupPaid) / (BASE_CLEANUP_COST_PER_POLLUTION * ctx.cleanupModifier)
      : 0;

  // ── Phase 2: Population growth bonus ─────────────────────────────────────
  let growthBCSpent = 0;
  let growthBonus = 0;
  const popGap = planet.maxPopulation - planet.population;

  if (remaining > 0 && popGap > 0) {
    // Cap: can't grow beyond maxPopulation
    const growthCap = popGap; // 1 BC → 0.1 pop; cap = gap / efficiency
    const growthBcCap = growthCap / GROWTH_BC_EFFICIENCY;
    growthBCSpent = Math.min(remaining, growthBcCap);
    growthBonus = growthBCSpent * GROWTH_BC_EFFICIENCY;
    remaining -= growthBCSpent;
  }

  // ── Phase 3: Terraforming ─────────────────────────────────────────────────
  let terraformBCSpent = 0;
  let ecoReserveOverflow = 0;

  if (remaining > 0 && ctx.maxTerraformTier !== null) {
    // Caller is responsible for advancing terraformProgress in planet state.
    // We just report how much BC was allocated to terraforming.
    // If already at the maximum researched tier, the excess overflows.
    // terraformProgress is passed in so callers can compute tier completion;
    // here we only consume remaining BC (no overflow within a tier).
    void terraformProgress; // used by caller to track tier completion
    terraformBCSpent = remaining;
    remaining = 0;
  } else if (remaining > 0) {
    // No terraforming tech available → overflow
    ecoReserveOverflow += remaining;
    remaining = 0;
  }

  // If population is at max AND no terraforming available, everything after
  // cleanup is overflow (already handled above, but be explicit)
  void remaining; // consumed

  return {
    cleanupPaid,
    uncleanedPollution,
    growthBCSpent,
    growthBonus,
    terraformBCSpent,
    ecoReserveOverflow,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory construction (IND slider)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of processing IND production allocation.
 */
export interface FactoryBuildResult {
  /** Factories built this turn. */
  factoriesBuilt: number;
  /** Partial BC carried to next turn. */
  buildProgress: number;
  /** BC overflowed to Empire Reserve (planet at max factories). */
  indReserveOverflow: number;
}

/**
 * Build factories from IND allocation.
 *
 * @param indBc             BC from IND slider
 * @param planet            Current planet state
 * @param ctx               Empire context (factoryCostBC, roboticControlsLevel)
 * @param prevBuildProgress BC carried over from previous turn
 */
export function buildFactories(
  indBc: number,
  planet: Planet,
  ctx: ProductionContext,
  prevBuildProgress: number,
): FactoryBuildResult {
  const totalBC = indBc + prevBuildProgress;
  const effectiveRC = getEffectiveRCLevel(ctx);
  const maxFactories = planet.maxPopulation * effectiveRC;
  const factoriesNeeded = Math.max(0, maxFactories - planet.factories);

  if (factoriesNeeded === 0) {
    // Already at max → all BC overflows
    return {
      factoriesBuilt: 0,
      buildProgress: 0,
      indReserveOverflow: totalBC,
    };
  }

  const factoriesPossible = Math.floor(totalBC / ctx.factoryCostBC);
  const factoriesBuilt = Math.min(factoriesPossible, factoriesNeeded);
  const bcSpent = factoriesBuilt * ctx.factoryCostBC;
  const buildProgress = totalBC - bcSpent;

  // If we've now hit max, progress carries but is refunded to reserve
  const newFactoryCount = planet.factories + factoriesBuilt;
  const newMax = newFactoryCount >= maxFactories;
  const indReserveOverflow = newMax ? buildProgress : 0;
  const finalProgress = newMax ? 0 : buildProgress;

  return {
    factoriesBuilt,
    buildProgress: finalProgress,
    indReserveOverflow,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Full turn production result
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full result of a single-planet production turn.
 */
export interface TurnProductionResult {
  net: NetProductionResult;
  allocation: SliderAllocation;
  eco: EcoPhaseResult;
  factories: FactoryBuildResult;
  /** Total BC added to Empire Reserve this turn from this planet. */
  reserveContribution: number;
}

/**
 * Process one full production turn for a planet.
 *
 * @param planet            Current planet state
 * @param ctx               Empire-level production context
 * @param prevBuildProgress BC carried over into factory construction
 * @param terraformProgress Current terraforming accumulation on this planet
 */
export function processPlanetProduction(
  planet: Planet,
  ctx: ProductionContext,
  prevBuildProgress: number = 0,
  terraformProgress: number = 0,
): TurnProductionResult {
  // Step 1: Net production
  const net = calculateNetProduction(planet, ctx);

  // Step 2: Slider allocation
  const allocation = allocateSliders(planet, net.netProduction, ctx);

  // Step 3: ECO phases
  const eco = processEcoPhases(
    allocation.ecology,
    net.pollution,
    planet,
    ctx,
    terraformProgress,  // passed through; caller manages persistence
  );

  // Step 4: Factory construction (IND)
  const factories = buildFactories(
    allocation.industry,
    planet,
    ctx,
    prevBuildProgress,
  );

  // Step 5: Reserve contributions
  // (SHIP and DEF overflow handling is a future task with build queues)
  const reserveContribution = eco.ecoReserveOverflow + factories.indReserveOverflow;

  return { net, allocation, eco, factories, reserveContribution };
}

// ─────────────────────────────────────────────────────────────────────────────
// Slider rebalancing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Slider state including lock flag.
 */
export interface SliderState {
  ship:     { value: number; locked: boolean };
  defense:  { value: number; locked: boolean };
  industry: { value: number; locked: boolean };
  ecology:  { value: number; locked: boolean };
  research: { value: number; locked: boolean };
}

/**
 * Result of a slider rebalancing operation.
 */
export type RebalanceResult =
  | { ok: true; sliders: SliderState }
  | { ok: false; error: 'NO_UNLOCKED_SLIDERS' | 'LOCKED_SUM_EXCEEDS_100' | 'CANNOT_LOCK_LAST_SLIDER' };

/**
 * Rebalance sliders after one is changed.
 *
 * Rules (from slider-mathematics.md §7):
 *   - At least one slider must remain unlocked.
 *   - Locked sliders cannot sum to > 100.
 *   - If locked sliders sum to exactly 100, all unlocked are forced to 0.
 *   - The delta is distributed proportionally among unlocked, non-changed sliders.
 *   - Values are clamped to ≥ 0.
 *   - Rounding remainder is given to the last adjustable slider.
 *
 * @param current      Current slider state
 * @param changedKey   Which slider the player moved
 * @param newValue     New value for changedKey (0–100, will be clamped)
 */
export function rebalanceSliders(
  current: SliderState,
  changedKey: keyof SliderState,
  newValue: number,
): RebalanceResult {
  const keys: Array<keyof SliderState> = ['ship', 'defense', 'industry', 'ecology', 'research'];

  // Clamp new value
  const clamped = Math.max(0, Math.min(100, newValue));

  // Build a working copy
  const draft: SliderState = {
    ship:     { ...current.ship },
    defense:  { ...current.defense },
    industry: { ...current.industry },
    ecology:  { ...current.ecology },
    research: { ...current.research },
  };

  // Identify adjustable (unlocked, not the changed key)
  const adjustable = keys.filter(k => k !== changedKey && !draft[k].locked);

  // Per slider-mathematics.md §7: "At least one slider must remain unlocked"
  // Count total unlocked sliders (including the changed one if it's unlocked)
  const totalUnlocked = keys.filter(k => !draft[k].locked).length;
  if (totalUnlocked === 0) {
    return { ok: false, error: 'NO_UNLOCKED_SLIDERS' };
  }

  if (adjustable.length === 0) {
    return { ok: false, error: 'NO_UNLOCKED_SLIDERS' };
  }

  // Check locked sliders (excluding the changed one) don't already exceed 100
  const lockedSum = keys
    .filter(k => k !== changedKey && draft[k].locked)
    .reduce((acc, k) => acc + draft[k].value, 0);

  if (lockedSum + clamped > 100) {
    return { ok: false, error: 'LOCKED_SUM_EXCEEDS_100' };
  }

  // Apply the changed slider
  const delta = clamped - draft[changedKey].value;
  draft[changedKey].value = clamped;

  // Distribute -delta proportionally among adjustable sliders
  const totalAdjustable = adjustable.reduce((acc, k) => acc + draft[k].value, 0);

  for (const k of adjustable) {
    if (totalAdjustable > 0) {
      draft[k].value = draft[k].value - delta * (draft[k].value / totalAdjustable);
    } else {
      draft[k].value = draft[k].value - delta / adjustable.length;
    }
    draft[k].value = Math.max(0, draft[k].value);
  }

  // Final clamp: ensure sum == 100, give remainder to last adjustable
  const currentSum = keys.reduce((acc, k) => acc + draft[k].value, 0);
  const remainder = 100 - currentSum;
  draft[adjustable[adjustable.length - 1]].value = Math.max(
    0,
    draft[adjustable[adjustable.length - 1]].value + remainder,
  );

  return { ok: true, sliders: draft };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ship Maintenance
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate maintenance cost for a single ship.
 *
 * Per design/economy/ship-costs.md §5:
 *   Ship_Maintenance = Ship_Cost × 0.02
 *   Minimum 1 BC per ship.
 *
 * Modifiers:
 *   - Racial maintenance modifier (e.g., Mice = 0.80, Ants = 0.75)
 *   - Fleet Logistics tech modifiers (multiplicative stack)
 *
 * @param shipCost The construction cost of the ship in BC.
 * @param ctx      Production context with maintenance modifiers.
 * @returns Maintenance cost per turn in BC (minimum 1).
 */
export function calculateShipMaintenance(
  shipCost: number,
  ctx: ProductionContext,
): number {
  // Base maintenance: 2% of construction cost
  let maintenance = shipCost * SHIP_MAINTENANCE_RATE;

  // Apply racial modifier
  maintenance *= ctx.racialMaintenanceModifier;

  // Apply tech modifiers (multiplicative stack)
  for (const mod of ctx.fleetLogisticsModifiers) {
    maintenance *= mod;
  }

  // Minimum 1 BC per ship
  return Math.max(MINIMUM_SHIP_MAINTENANCE, Math.floor(maintenance));
}

/**
 * Calculate total fleet maintenance for an empire.
 *
 * @param shipDesigns Map of ship design ID to design info (with cost and count).
 * @param ctx         Production context with maintenance modifiers.
 * @returns Total fleet maintenance per turn in BC.
 */
export function calculateFleetMaintenance(
  shipDesigns: Array<{ cost: number; count: number }>,
  ctx: ProductionContext,
): number {
  let totalMaintenance = 0;

  for (const design of shipDesigns) {
    const perShip = calculateShipMaintenance(design.cost, ctx);
    totalMaintenance += perShip * design.count;
  }

  return totalMaintenance;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bankruptcy Handling
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ship info for bankruptcy scuttle decisions.
 */
export interface ScuttleCandidate {
  shipId: string;
  cost: number;
}

/**
 * Result of bankruptcy handling.
 */
export interface BankruptcyResult {
  /** Ships that were scuttled (ship IDs). */
  scuttledShips: string[];
  /** Total BC recovered from emergency scrapping. */
  recoveredBC: number;
  /** Final treasury balance (should be >= 0). */
  finalTreasury: number;
  /** Whether all ships were exhausted before treasury became positive. */
  empireCollapsed: boolean;
}

/**
 * Handle bankruptcy by scuttling ships at emergency scrap rate.
 *
 * Per design/economy/ship-costs.md §10:
 *   When empire cannot pay maintenance:
 *     - Scuttle ships at 10% emergency scrap rate until treasury positive
 *     - Each scrapped ship adds Ship_Cost × 0.10 to treasury
 *
 * @param treasury       Current treasury balance (negative = bankruptcy).
 * @param ships          Array of ships that can be scuttled, ordered by preference
 *                       (oldest/weakest first per design doc).
 * @returns Result with scuttled ships and final treasury.
 */
export function handleBankruptcy(
  treasury: number,
  ships: ScuttleCandidate[],
): BankruptcyResult {
  const scuttledShips: string[] = [];
  let recoveredBC = 0;
  let currentTreasury = treasury;

  // If treasury is positive, no bankruptcy
  if (currentTreasury >= 0) {
    return {
      scuttledShips: [],
      recoveredBC: 0,
      finalTreasury: currentTreasury,
      empireCollapsed: false,
    };
  }

  // Scuttle ships until treasury is positive or no ships remain
  const remainingShips = [...ships];

  while (currentTreasury < 0 && remainingShips.length > 0) {
    const ship = remainingShips.shift()!;
    const scrapValue = Math.floor(ship.cost * EMERGENCY_SCRAP_RATE);

    scuttledShips.push(ship.shipId);
    recoveredBC += scrapValue;
    currentTreasury += scrapValue;
  }

  return {
    scuttledShips,
    recoveredBC,
    finalTreasury: currentTreasury,
    empireCollapsed: currentTreasury < 0, // No ships left but still negative
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ship Scrap Value
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Location type for scrap rate calculation.
 */
export type ScrapLocation = 'friendly' | 'shipyard' | 'enemy_territory';

/**
 * Calculate scrap value for a ship.
 *
 * Per design/economy/ship-costs.md §9:
 *   - At friendly planet: 25%
 *   - At shipyard world: 35%
 *   - Damaged ship (< 50% HP): 15%
 *   - In enemy territory: 10%
 *   - Self-destruct in combat: 0%
 *
 * @param shipCost    Construction cost of the ship in BC.
 * @param location    Where the ship is being scrapped.
 * @param isDamaged   True if ship is below 50% HP.
 * @returns Scrap value in BC.
 */
export function calculateScrapValue(
  shipCost: number,
  location: ScrapLocation,
  isDamaged: boolean = false,
): number {
  let scrapRate: number;

  // Damaged ship overrides location-based rate
  if (isDamaged) {
    scrapRate = SCRAP_RATE_DAMAGED;
  } else {
    switch (location) {
      case 'shipyard':
        scrapRate = SCRAP_RATE_SHIPYARD;
        break;
      case 'enemy_territory':
        scrapRate = SCRAP_RATE_ENEMY_TERRITORY;
        break;
      case 'friendly':
      default:
        scrapRate = SCRAP_RATE_BASE;
        break;
    }
  }

  return Math.floor(shipCost * scrapRate);
}

// ─────────────────────────────────────────────────────────────────────────────
// Ship Refitting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of a refit cost calculation.
 */
export interface RefitResult {
  /** Whether refit is valid (same hull class). */
  valid: boolean;
  /** Error message if invalid. */
  error?: string;
  /** Cost to refit in BC (0 if downgrading). */
  refitCost: number;
}

/**
 * Calculate refit cost for upgrading a ship to a new design.
 *
 * Per design/economy/ship-costs.md §11:
 *   Refit_Cost = (New_Design_Cost - Old_Design_Value) × 0.50
 *   Minimum: 0 BC (if new design is cheaper, no refund)
 *
 * Restrictions:
 *   - Ships must be at a planet with shipyard
 *   - Cannot change hull size (e.g., Small → Large impossible)
 *
 * @param oldDesignCost  Construction cost of the current design.
 * @param newDesignCost  Construction cost of the new design.
 * @param oldHullClass   Hull class of current design (small/medium/large/huge).
 * @param newHullClass   Hull class of new design.
 * @param hasNoRefitCosts If true (e.g., Mice race ability), refit is free.
 * @returns Refit calculation result.
 */
export function calculateRefitCost(
  oldDesignCost: number,
  newDesignCost: number,
  oldHullClass: string,
  newHullClass: string,
  hasNoRefitCosts: boolean = false,
): RefitResult {
  // Cannot change hull class
  if (oldHullClass !== newHullClass) {
    return {
      valid: false,
      error: `Cannot refit from ${oldHullClass} to ${newHullClass} hull`,
      refitCost: 0,
    };
  }

  // Mice (no_refit_costs ability) can refit for free
  if (hasNoRefitCosts) {
    return {
      valid: true,
      refitCost: 0,
    };
  }

  const costDifference = newDesignCost - oldDesignCost;

  // Downgrade: no cost, but no refund either
  if (costDifference <= 0) {
    return {
      valid: true,
      refitCost: 0,
    };
  }

  // Upgrade: pay 50% of the difference
  const refitCost = Math.floor(costDifference * REFIT_RATE);

  return {
    valid: true,
    refitCost,
  };
}

/**
 * Calculate refit time based on cost and planet production.
 *
 * Per design/economy/ship-costs.md §12:
 *   Refit_Time = ceil(Refit_Cost / Planet_Production_Per_Turn)
 *   Minimum: 1 turn for any refit.
 *
 * @param refitCost             BC required for the refit.
 * @param planetProductionPerTurn Net production per turn at the planet.
 * @returns Number of turns to complete refit.
 */
export function calculateRefitTime(
  refitCost: number,
  planetProductionPerTurn: number,
): number {
  if (refitCost <= 0) return 1; // No-cost refits still take 1 turn
  if (planetProductionPerTurn <= 0) return Infinity; // No production = infinite time

  return Math.max(1, Math.ceil(refitCost / planetProductionPerTurn));
}

// ─────────────────────────────────────────────────────────────────────────────
// Slider Lock Validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate that a slider lock operation is allowed.
 *
 * Per slider-mathematics.md §7:
 *   "At least one slider must remain unlocked (otherwise re-balancing is impossible)"
 *
 * @param current   Current slider state.
 * @param keyToLock The slider key the player wants to lock.
 * @returns True if locking is allowed, false if it would lock the last slider.
 */
export function canLockSlider(
  current: SliderState,
  keyToLock: keyof SliderState,
): boolean {
  const keys: Array<keyof SliderState> = ['ship', 'defense', 'industry', 'ecology', 'research'];

  // If this slider is already locked, no change
  if (current[keyToLock].locked) {
    return true;
  }

  // Count currently unlocked sliders
  const unlockedCount = keys.filter(k => !current[k].locked).length;

  // Must have at least 2 unlocked to allow locking one more
  return unlockedCount >= 2;
}

/**
 * Attempt to lock a slider. Returns error if it would leave no unlocked sliders.
 *
 * @param current   Current slider state.
 * @param keyToLock The slider key to lock.
 * @returns Updated slider state or error.
 */
export function lockSlider(
  current: SliderState,
  keyToLock: keyof SliderState,
): RebalanceResult {
  if (!canLockSlider(current, keyToLock)) {
    return { ok: false, error: 'CANNOT_LOCK_LAST_SLIDER' };
  }

  const newState: SliderState = {
    ship:     { ...current.ship },
    defense:  { ...current.defense },
    industry: { ...current.industry },
    ecology:  { ...current.ecology },
    research: { ...current.research },
  };

  newState[keyToLock].locked = true;

  return { ok: true, sliders: newState };
}

// ─────────────────────────────────────────────────────────────────────────────
// REMOVED DEPRECATED FUNCTIONS (2026-04-29)
// ─────────────────────────────────────────────────────────────────────────────
//
// The following functions were REMOVED (not just deprecated) because they
// produced incorrect results and were superseded by modern implementations:
//
// 1. distributeProduction(planet)
//    PROBLEM: Incorrectly included TECH in net production allocation.
//             TECH doesn't consume BC—it diverts population from labor.
//    REPLACEMENT: Use allocateSliders(planet, netProduction, ctx) which
//                 correctly handles TECH as population diversion and
//                 splits only SHIP/DEF/IND/ECO across net production.
//
// 2. calculateMaxFactories(population)
//    PROBLEM: Returned floor(population), ignoring Robotic Controls level.
//             This is only correct for RC II (2:1 ratio) early game.
//    REPLACEMENT: Use planet.maxPopulation * ctx.roboticControlsLevel.
//                 RC levels range from 2 (RC II) to 7 (RC VII).
//
// If you have code that depended on these functions, migrate to:
//   - processPlanetProduction() for full turn production
//   - allocateSliders() for slider allocation
//   - operatingFactories(planet, ctx) for factory operations
// ─────────────────────────────────────────────────────────────────────────────
