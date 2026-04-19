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

import { Planet, ResourceLevel } from '../state';

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

  /**
   * Robotic Controls level (how many factories each colonist can operate).
   * Starting value = 2 (Robotic Controls II).
   */
  roboticControlsLevel: number;

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
}

/**
 * Sensible defaults for a baseline Hamster empire at game start.
 * Override individual fields as needed in tests or game logic.
 */
export const DEFAULT_PRODUCTION_CONTEXT: ProductionContext = {
  racialProductionModifier: 1.0,
  racialResearchModifier:   1.0,
  roboticControlsLevel:     2,
  planetologyTL:            1,
  wasteRate:                1.0,
  cleanupModifier:          1.0,
  factoryCostBC:            10,
  maxTerraformTier:         null,
  terraformTierCost:        200,
  factoryEfficiencyMultiplier: 1.0,
};

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
 * Number of factories a planet can actually operate, given its population
 * and Robotic Controls level.
 */
export function operatingFactories(planet: Planet, ctx: ProductionContext): number {
  const maxOperable = planet.population * ctx.roboticControlsLevel;
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

  // Factory output — Mice have a factoryEfficiencyMultiplier of 1.5
  const factoryBC = opFac * BASE_FACTORY_OUTPUT * ctx.factoryEfficiencyMultiplier * ctx.racialProductionModifier;

  // Population labor output
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
 * Net_Production = floor(Gross_Production − Cleanup_Cost)
 * Clamped to 0 (cleanup cost can never exceed gross production in outcome;
 * shortfall is tracked via ECO allocation, not deducted from net production
 * directly — cleanup is actually paid *from ECO_BC* per slider-mathematics.md).
 *
 * Note on design reconciliation:
 *   factory-formulas.md shows cleanup deducted from gross to get net.
 *   slider-mathematics.md shows cleanup as first charge against ECO_BC.
 *   The authoritative model (slider-mathematics.md §5) is:
 *     1. Gross production is calculated.
 *     2. Cleanup_Cost is subtracted → Net_Production.
 *     3. Net_Production is split by SHIP/DEF/IND/ECO sliders.
 *     4. ECO allocation then handles growth/terraform *after* cleanup.
 *   We follow this: cleanup is deducted pre-split from gross, giving net.
 */
export function calculateNetProduction(
  planet: Planet,
  ctx: ProductionContext,
): NetProductionResult {
  const gross = calculateGrossProduction(planet, ctx);
  const pollution = calculatePollution(gross.operatingFactories, ctx);
  const netContinuous = Math.max(0, gross.grossProduction - pollution.cleanupCost);
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
  const techRP = scientists * 1.0 * ctx.racialResearchModifier;

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
  const maxFactories = planet.maxPopulation * ctx.roboticControlsLevel;
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
  | { ok: false; error: 'NO_UNLOCKED_SLIDERS' | 'LOCKED_SUM_EXCEEDS_100' };

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
// Legacy distributeProduction (used by existing tests)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Distribute production output according to slider percentages.
 *
 * @deprecated  Use allocateSliders() with a ProductionContext for new code.
 *              Kept for backwards compatibility with existing tests.
 */
export interface ProductionOutput {
  ship: number;
  defense: number;
  industry: number;
  ecology: number;
  research: number;
}

/**
 * @deprecated  Use allocateSliders() with a ProductionContext for new code.
 */
export function distributeProduction(planet: Planet): ProductionOutput {
  const base = calculateBaseProduction(planet);
  const p = planet.production;

  // Normalize sliders (they should sum to 100, but guard against edge cases)
  const total = p.ship + p.defense + p.industry + p.ecology + p.research;
  const scale = total > 0 ? 100 / total : 0;

  return {
    ship:     (base * p.ship     * scale) / 100,
    defense:  (base * p.defense  * scale) / 100,
    industry: (base * p.industry * scale) / 100,
    ecology:  (base * p.ecology  * scale) / 100,
    research: (base * p.research * scale) / 100,
  };
}

/**
 * Calculate maximum factories for a planet (based on population).
 *
 * @deprecated  Use planet.maxPopulation × ctx.roboticControlsLevel.
 */
export function calculateMaxFactories(population: number): number {
  return Math.floor(population);
}
