/**
 * Population system tests.
 * test/game/systems/population.test.ts
 *
 * Validates all functions in src/game/systems/population.ts against the
 * worked examples in design/economy/population-growth.md.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMaxPopulation,
  calculatePopulationGrowth,
  processFoodAndStarvation,
  calculateDifficultyGrowthModifier,
  calculateMoraleModifier,
  getTerraformingBonus,
  getCloningBonus,
  makePopulationContext,
  DEFAULT_TECH_STATE,
  type PopulationContext,
  type TechState,
} from '../../../src/game/systems/population';
import { Planet } from '../../../src/game/state';

// ── Test helpers ──────────────────────────────────────────────────────────────

/**
 * Build a minimal Planet + PopulationPlanetFields for tests.
 * Only fields used by population functions need to be set.
 */
function makePlanet(overrides: Partial<Planet & {
  base_population?: number;
  fractional_population?: number;
  soil_enrichment_level?: 0 | 1 | 2;
  morale_numeric?: number;
  farmers?: number;
}>): Planet & {
  base_population?: number;
  fractional_population?: number;
  soil_enrichment_level?: 0 | 1 | 2;
  morale_numeric?: number;
  farmers?: number;
} {
  return {
    // Required Planet fields with sensible defaults
    id: 'p1',
    name: 'Test Planet',
    systemId: 's1',
    orbit: 1,
    type: 'terran',
    size: 'medium',
    gravity: 1.0,
    ownerId: 'player',
    isColonized: true,
    isHomeworld: false,
    population: 50,
    maxPopulation: 100,
    growthRate: 0.0,
    morale: 'content',
    factories: 0,
    maxFactories: 50,
    waste: 0,
    production: { ship: 0, defense: 0, industry: 0, ecology: 100, research: 0 },
    buildQueue: [],
    buildings: [],
    missileBases: 0,
    maxMissileBases: 0,
    planetaryShield: 0,
    isRich: false,
    isPoor: false,
    isGaia: false,
    hasArtifacts: false,
    resourceLevel: 'normal',
    researchMultiplier: 1.0,
    startingPopulation: null,
    startingFactories: null,
    // Population-specific fields
    base_population: 80,
    fractional_population: 0,
    soil_enrichment_level: 0,
    morale_numeric: 50,
    farmers: 0,
    ...overrides,
  };
}

function makeCtx(raceId: string, techOverrides: Partial<TechState> = {}): PopulationContext {
  return makePopulationContext(raceId, { ...DEFAULT_TECH_STATE, ...techOverrides });
}

// ── getTerraformingBonus ──────────────────────────────────────────────────────

describe('getTerraformingBonus', () => {
  it('returns 0 at tech level 0', () => {
    expect(getTerraformingBonus(0)).toBe(0);
  });

  it('returns 10 at tech level 2', () => {
    expect(getTerraformingBonus(2)).toBe(10);
  });

  it('returns 10 for levels 2–5', () => {
    expect(getTerraformingBonus(3)).toBe(10);
    expect(getTerraformingBonus(5)).toBe(10);
  });

  it('returns 20 at tech level 6', () => {
    expect(getTerraformingBonus(6)).toBe(20);
  });

  it('returns 40 at tech level 14', () => {
    expect(getTerraformingBonus(14)).toBe(40);
  });

  it('returns 120 at tech level 46+', () => {
    expect(getTerraformingBonus(46)).toBe(120);
    expect(getTerraformingBonus(99)).toBe(120);
  });

  it('uses highest unlocked (not cumulative)', () => {
    // Level 22 should return 60, not 10+20+30+40+50+60=210
    expect(getTerraformingBonus(22)).toBe(60);
  });
});

// ── getCloningBonus ───────────────────────────────────────────────────────────

describe('getCloningBonus', () => {
  // Design source: design/technology/planetology.md §Cloning Technology
  // Cloning (TL 21): +2 pop/turn
  // Advanced Cloning (TL 42): +5 pop/turn

  it('returns 0 with no cloning tech', () => {
    expect(getCloningBonus(0)).toBe(0);
    expect(getCloningBonus(20)).toBe(0);
  });

  it('returns 2 at tech level 21 (Cloning)', () => {
    expect(getCloningBonus(21)).toBe(2);
  });

  it('returns 2 for levels 21–41', () => {
    expect(getCloningBonus(25)).toBe(2);
    expect(getCloningBonus(41)).toBe(2);
  });

  it('returns 5 at tech level 42 (Advanced Cloning)', () => {
    expect(getCloningBonus(42)).toBe(5);
  });

  it('returns 5 for level > 42', () => {
    expect(getCloningBonus(50)).toBe(5);
  });
});

// ── calculateMoraleModifier ───────────────────────────────────────────────────

describe('calculateMoraleModifier', () => {
  it('returns 0.5 at morale 0 (rebellion)', () => {
    expect(calculateMoraleModifier(0)).toBeCloseTo(0.5);
  });

  it('returns 0.75 at morale 50 (content)', () => {
    expect(calculateMoraleModifier(50)).toBeCloseTo(0.75);
  });

  it('returns 0.875 at morale 75 (happy)', () => {
    expect(calculateMoraleModifier(75)).toBeCloseTo(0.875);
  });

  it('returns 1.0 at morale 100 (ecstatic)', () => {
    expect(calculateMoraleModifier(100)).toBeCloseTo(1.0);
  });

  it('returns 0.625 at morale 25 (unrest)', () => {
    expect(calculateMoraleModifier(25)).toBeCloseTo(0.625);
  });
});

// ── calculateMaxPopulation ────────────────────────────────────────────────────

describe('calculateMaxPopulation', () => {
  it('basic terran planet with terraforming', () => {
    // base_pop=80, terra=+20, soil=0 → 100 × 1.0 × 1.0 = 100
    const planet = makePlanet({ type: 'terran', base_population: 80, soil_enrichment_level: 0 });
    const ctx = makeCtx('hamsters', { terraforming_tech_level: 6 }); // level 6 → +20
    const result = calculateMaxPopulation(planet, ctx);

    expect(result.basePop).toBe(80);
    expect(result.terraformingBonus).toBe(20);
    expect(result.soilBonus).toBe(0);
    expect(result.envCapacityModifier).toBe(1.0);
    expect(result.racialCapacityModifier).toBe(1.0);
    expect(result.maxPopulation).toBe(100);
  });

  it('uses base_population, not hardcoded size', () => {
    // Two planets with same size label but different generated base_population
    const p1 = makePlanet({ type: 'terran', base_population: 60, size: 'medium' });
    const p2 = makePlanet({ type: 'terran', base_population: 70, size: 'medium' });
    const ctx = makeCtx('hamsters');

    expect(calculateMaxPopulation(p1, ctx).maxPopulation).toBe(60);
    expect(calculateMaxPopulation(p2, ctx).maxPopulation).toBe(70);
  });

  it('Hermit Crabs on radiated: env penalty ignored', () => {
    // base_pop=60, terra=+30 → raw=90 × 1.0 (HC) × 1.0 = 90
    const planet = makePlanet({ type: 'radiated', base_population: 60 });
    const ctx = makeCtx('hermit_crabs', { terraforming_tech_level: 10 }); // +30
    const result = calculateMaxPopulation(planet, ctx);

    expect(result.envCapacityModifier).toBe(1.0);  // HC ignore env
    expect(result.terraformingBonus).toBe(30);
    expect(result.maxPopulation).toBe(90);  // (60+30) × 1.0 × 1.0
  });

  it('Ants get +25% capacity bonus', () => {
    // base_pop=80, no terra/soil, terran → 80 × 1.0 × 1.25 = 100
    const planet = makePlanet({ type: 'terran', base_population: 80 });
    const ctx = makeCtx('ants');
    const result = calculateMaxPopulation(planet, ctx);

    expect(result.racialCapacityModifier).toBe(1.25);
    expect(result.maxPopulation).toBe(100);
  });

  it('soil enrichment level 1 adds 25', () => {
    const planet = makePlanet({ type: 'terran', base_population: 80, soil_enrichment_level: 1 });
    const ctx = makeCtx('hamsters');
    const result = calculateMaxPopulation(planet, ctx);

    expect(result.soilBonus).toBe(25);
    expect(result.maxPopulation).toBe(105);  // (80+25) × 1.0 × 1.0
  });

  it('soil enrichment level 2 adds 50', () => {
    const planet = makePlanet({ type: 'terran', base_population: 80, soil_enrichment_level: 2 });
    const ctx = makeCtx('hamsters');
    const result = calculateMaxPopulation(planet, ctx);

    expect(result.soilBonus).toBe(50);
    expect(result.maxPopulation).toBe(130);  // (80+50) × 1.0 × 1.0
  });

  it('environment capacity reduces max pop on hostile worlds', () => {
    // base_pop=100, radiated × 0.2 = 20
    const planet = makePlanet({ type: 'radiated', base_population: 100 });
    const ctx = makeCtx('hamsters');
    const result = calculateMaxPopulation(planet, ctx);

    expect(result.envCapacityModifier).toBe(0.2);
    expect(result.maxPopulation).toBe(20);
  });
});

// ── calculatePopulationGrowth ─────────────────────────────────────────────────

describe('calculatePopulationGrowth', () => {
  /**
   * Example 1 from design doc: Hamsters on Terran
   * Pop=40, base_pop=80, terraforming=+20 → max=100
   * morale=75 → morale_mod=0.875
   * env_growth=1.0, racial=1.0
   * growth_factor = 1-(40/100) = 0.6
   * natural = 40×0.1×1.0×1.0×0.875×0.6 = 2.1
   * growth=2, fractional=0.1
   */
  it('Example 1: Hamsters on Terran → growth=2, fractional=0.1', () => {
    const planet = makePlanet({
      type: 'terran',
      population: 40,
      base_population: 80,
      morale_numeric: 75,
      fractional_population: 0,
    });
    const ctx = makeCtx('hamsters', { terraforming_tech_level: 6 }); // +20 bonus
    const result = calculatePopulationGrowth(planet, ctx);

    expect(result.maxPopulation).toBe(100);
    expect(result.moraleModifier).toBeCloseTo(0.875);
    expect(result.naturalGrowth).toBeCloseTo(2.1, 5);
    expect(result.cloningBonus).toBe(0);
    expect(result.integerGrowth).toBe(2);
    expect(result.newFractional).toBeCloseTo(0.1, 5);
    expect(result.newPopulation).toBe(42);
  });

  /**
   * Example 2: Rabbits on Jungle with cloning
   * Pop=30, base_pop=100, terra=+40, soil=+25 → max=floor((100+40+25)×1.0×1.0)=165
   * env_growth=0.9, racial=2.0, morale=100→1.0
   * growth_factor = 1-(30/165) ≈ 0.8182
   * natural = 30×0.1×0.9×2.0×1.0×0.8182 ≈ 4.418
   * cloning=+5 (level 22), total=9.418
   * growth=9, fractional≈0.418
   */
  it('Example 2: Rabbits on Jungle with cloning → growth=9', () => {
    const planet = makePlanet({
      type: 'jungle',
      population: 30,
      base_population: 100,
      soil_enrichment_level: 1,  // +25
      morale_numeric: 100,
      fractional_population: 0,
    });
    const ctx = makeCtx('rabbits', {
      terraforming_tech_level: 14,  // +40
      cloning_tech_level: 42,       // +5/turn (Advanced Cloning per planetology.md)
    });
    const result = calculatePopulationGrowth(planet, ctx);

    expect(result.maxPopulation).toBe(165);
    expect(result.moraleModifier).toBeCloseTo(1.0);
    expect(result.naturalGrowth).toBeCloseTo(4.418, 2);
    expect(result.cloningBonus).toBe(5);
    expect(result.totalGrowth).toBeCloseTo(9.418, 2);
    expect(result.integerGrowth).toBe(9);
    expect(result.newFractional).toBeCloseTo(0.418, 2);
    expect(result.newPopulation).toBe(39);
  });

  /**
   * Example 3: Hermit Crabs on Radiated
   * Pop=20, base_pop=60, terra=+30 → max=floor(90×1.0×1.0)=90 (HC ignore env)
   * env_growth=1.0 (HC), racial=0.5, morale=1.0 (HC are Ants? no — but morale=100)
   * growth_factor = 1-(20/90) ≈ 0.778
   * natural = 20×0.1×1.0×0.5×1.0×0.778 = 0.778
   * growth=0, fractional=0.778
   */
  it('Example 3: Hermit Crabs on Radiated → growth=0, fractional=0.778', () => {
    const planet = makePlanet({
      type: 'radiated',
      population: 20,
      base_population: 60,
      morale_numeric: 100,
      fractional_population: 0,
    });
    const ctx = makeCtx('hermit_crabs', { terraforming_tech_level: 10 }); // +30
    const result = calculatePopulationGrowth(planet, ctx);

    expect(result.maxPopulation).toBe(90);
    expect(result.naturalGrowth).toBeCloseTo(0.778, 2);
    expect(result.integerGrowth).toBe(0);
    expect(result.newFractional).toBeCloseTo(0.778, 2);
    expect(result.newPopulation).toBe(20);
  });

  it('fractional carry-over accumulates across turns', () => {
    // Start with fractional=0.9, growth that adds 0.5 → total=1.4 → +1 pop
    const planet = makePlanet({
      type: 'terran',
      population: 10,
      base_population: 100,
      morale_numeric: 100,
      fractional_population: 0.9,
    });
    const ctx = makeCtx('hamsters');
    const result = calculatePopulationGrowth(planet, ctx);

    // natural ≈ 10 × 0.1 × 1.0 × 1.0 × 1.0 × 0.9 = 0.9
    // total_with_frac = 0.9 + 0.9 = 1.8
    expect(result.integerGrowth).toBe(1);
    expect(result.newFractional).toBeCloseTo(0.8, 5);
    expect(result.newPopulation).toBe(11);
  });

  it('at max population: growth = 0', () => {
    const planet = makePlanet({
      type: 'terran',
      population: 100,
      base_population: 100,
      fractional_population: 0.5,
    });
    const ctx = makeCtx('hamsters');
    const result = calculatePopulationGrowth(planet, ctx);

    expect(result.integerGrowth).toBe(0);
    expect(result.newPopulation).toBe(100);
    // fractional unchanged when at max
    expect(result.newFractional).toBeCloseTo(0.5, 5);
  });

  it('cloning bonus wasted when at max pop', () => {
    const planet = makePlanet({
      type: 'terran',
      population: 100,
      base_population: 100,
      fractional_population: 0,
    });
    const ctx = makeCtx('hamsters', { cloning_tech_level: 42 }); // Advanced Cloning per planetology.md
    const result = calculatePopulationGrowth(planet, ctx);

    // At max pop, early return sets cloningBonus=0 (not computed)
    expect(result.cloningBonus).toBe(0);  // cloning bonus not computed when at max
    expect(result.integerGrowth).toBe(0);   // ...no growth
    expect(result.newPopulation).toBe(100);
  });

  it('Ants: morale_modifier is always 1.0', () => {
    // Low morale should not affect Ants
    const planet = makePlanet({
      type: 'terran',
      population: 50,
      base_population: 100,
      morale_numeric: 0,  // rebellion-level morale
    });
    const ctx = makeCtx('ants');
    const result = calculatePopulationGrowth(planet, ctx);

    expect(result.moraleModifier).toBe(1.0);
    // maxPop = floor(100 × 1.0 × 1.25) = 125
    // growth_factor = 1 - 50/125 = 0.6
    // natural = 50 × 0.1 × 1.0 × 1.25 × 1.0 × 0.6 = 3.75
    expect(result.naturalGrowth).toBeCloseTo(3.75, 3);
  });

  it('Hermit Crabs: env_growth_mod is always 1.0', () => {
    // On radiated, HC ignore env penalty
    const planet = makePlanet({
      type: 'radiated',
      population: 50,
      base_population: 100,
      morale_numeric: 100,
    });
    const ctx = makeCtx('hermit_crabs');
    const result = calculatePopulationGrowth(planet, ctx);

    // env_growth would be 0.1 for radiated, but HC use 1.0
    // natural = 50 × 0.1 × 1.0 × 0.5 × 1.0 × (1-(50/20)) → but max=20 < pop=50!
    // Actually HC: maxPop = 100 × 0.2 (radiated) = 20? No — HC ignore env cap too
    // HC: envCapacity=1.0, so maxPop=100
    // natural = 50 × 0.1 × 1.0 × 0.5 × 1.0 × (1-50/100) = 50 × 0.1 × 0.5 × 0.5 = 1.25
    expect(result.maxPopulation).toBe(100); // HC ignore env capacity
    expect(result.naturalGrowth).toBeCloseTo(1.25, 3);
  });
});

// ── processFoodAndStarvation ──────────────────────────────────────────────────

describe('processFoodAndStarvation', () => {
  /**
   * Example 4 from design doc: Starvation Scenario
   * Race: Hamsters, Pop=50, Farmers=10, Desert (0.4 fertility)
   * food_required = 50 × 1.0 = 50
   * food_produced = 10 × 2.0 × 0.4 × 1.0 = 8
   * deficit = 42, deaths = floor(42 × 0.5) = 21
   */
  it('Example 4: Hamsters, pop=50, 10 farmers, Desert → 21 deaths', () => {
    const planet = makePlanet({ type: 'desert', population: 50, farmers: 10 });
    const result = processFoodAndStarvation(planet, { raceId: 'hamsters' });

    expect(result.foodRequired).toBeCloseTo(50, 5);
    expect(result.foodProduced).toBeCloseTo(8, 5);
    expect(result.foodBalance).toBeCloseTo(-42, 5);
    expect(result.starvationDeaths).toBe(21);
    expect(result.newPopulation).toBe(29);
    expect(result.moraleDelta).toBe(-20);
  });

  it('Hermit Crabs: no food required, no deaths', () => {
    const planet = makePlanet({ type: 'desert', population: 50, farmers: 0 });
    const result = processFoodAndStarvation(planet, { raceId: 'hermit_crabs' });

    expect(result.foodRequired).toBe(0);
    expect(result.foodProduced).toBe(0);
    expect(result.starvationDeaths).toBe(0);
    expect(result.newPopulation).toBe(50);
    expect(result.moraleDelta).toBe(0);
  });

  it('Mice: food_per_colonist = 0.5', () => {
    // Pop=50, Mice: food_required = 50 × 0.5 = 25
    // Farmers=10, Terran (1.0 fertility), Mice food modifier=0.5
    // food_produced = 10 × 2.0 × 1.0 × 0.5 = 10
    // deficit = 25 - 10 = 15, deaths = floor(15 × 0.5) = 7
    const planet = makePlanet({ type: 'terran', population: 50, farmers: 10 });
    const result = processFoodAndStarvation(planet, { raceId: 'mice' });

    expect(result.foodRequired).toBeCloseTo(25, 5);
    expect(result.foodProduced).toBeCloseTo(10, 5);
    expect(result.starvationDeaths).toBe(7);
    expect(result.newPopulation).toBe(43);
  });

  it('surplus food: no starvation deaths', () => {
    // Pop=20, farmers=30, Terran (1.0), Hamsters
    // food_required = 20, food_produced = 30 × 2.0 × 1.0 × 1.0 = 60 → surplus
    const planet = makePlanet({ type: 'terran', population: 20, farmers: 30 });
    const result = processFoodAndStarvation(planet, { raceId: 'hamsters' });

    expect(result.foodBalance).toBeGreaterThan(0);
    expect(result.starvationDeaths).toBe(0);
    expect(result.newPopulation).toBe(20);
    expect(result.moraleDelta).toBe(0);
  });

  it('Rabbits: food modifier 1.25 produces more food', () => {
    // Pop=50, farmers=10, Terran
    // food_required = 50
    // food_produced = 10 × 2.0 × 1.0 × 1.25 = 25
    // deficit = 25, deaths = floor(25 × 0.5) = 12
    const planet = makePlanet({ type: 'terran', population: 50, farmers: 10 });
    const result = processFoodAndStarvation(planet, { raceId: 'rabbits' });

    expect(result.foodProduced).toBeCloseTo(25, 5);
    expect(result.starvationDeaths).toBe(12);
  });
});

// ── calculateDifficultyGrowthModifier ────────────────────────────────────────

describe('calculateDifficultyGrowthModifier', () => {
  it('Simple: player=1.25, ai=0.75', () => {
    expect(calculateDifficultyGrowthModifier('simple', true)).toBeCloseTo(1.25);
    expect(calculateDifficultyGrowthModifier('simple', false)).toBeCloseTo(0.75);
  });

  it('Easy: player=1.10, ai=0.90', () => {
    expect(calculateDifficultyGrowthModifier('easy', true)).toBeCloseTo(1.10);
    expect(calculateDifficultyGrowthModifier('easy', false)).toBeCloseTo(0.90);
  });

  it('Average: player=1.00, ai=1.00', () => {
    expect(calculateDifficultyGrowthModifier('average', true)).toBeCloseTo(1.00);
    expect(calculateDifficultyGrowthModifier('average', false)).toBeCloseTo(1.00);
  });

  it('Hard: player=0.90, ai=1.25', () => {
    expect(calculateDifficultyGrowthModifier('hard', true)).toBeCloseTo(0.90);
    expect(calculateDifficultyGrowthModifier('hard', false)).toBeCloseTo(1.25);
  });

  it('Impossible: player=0.75, ai=1.50', () => {
    expect(calculateDifficultyGrowthModifier('impossible', true)).toBeCloseTo(0.75);
    expect(calculateDifficultyGrowthModifier('impossible', false)).toBeCloseTo(1.50);
  });
});

// ── processConqueredPopulation (fix-14/17) ──────────────────────────────────

import {
  processConqueredPopulation,
  processOvercrowding,
  canAutoTransportOverflow,
  calculateOverflowTransport,
} from '../../../src/game/systems/population';

describe('processConqueredPopulation', () => {
  /**
   * Per design/economy/population-growth.md §Conquered Population:
   *   Conquest_Survivors = floor(Post_Bombardment_Pop × 0.50)
   *   Ferrets: 40% reduction → 60% survival
   */

  it('most races: 50% reduction, minimum 1 survivor', () => {
    const result = processConqueredPopulation(100, 'hamsters');
    expect(result.survivalRate).toBe(0.5);
    expect(result.newPopulation).toBe(50);
    expect(result.populationLost).toBe(50);
  });

  it('ferrets: 40% reduction (60% survival)', () => {
    const result = processConqueredPopulation(100, 'ferrets');
    expect(result.survivalRate).toBe(0.6);
    expect(result.newPopulation).toBe(60);
    expect(result.populationLost).toBe(40);
  });

  it('minimum 1 survivor (cannot depopulate planet)', () => {
    const result = processConqueredPopulation(1, 'hamsters');
    expect(result.newPopulation).toBe(1);
    expect(result.populationLost).toBe(0);
  });

  it('floors fractional survivors', () => {
    // 17 × 0.5 = 8.5 → 8
    const result = processConqueredPopulation(17, 'hamsters');
    expect(result.newPopulation).toBe(8);
  });
});

// ── processOvercrowding (fix-14/17) ──────────────────────────────────────────

describe('processOvercrowding', () => {
  /**
   * Per design/economy/population-growth.md §Overcrowding:
   *   When current_population > max_population:
   *   - Excess pop starves at 0.5 per turn
   *   - Population converges to max over several turns
   */

  const ctx: PopulationContext = {
    raceId: 'hamsters',
    techState: { terraforming_tech_level: 0, cloning_tech_level: 0 },
  };

  it('not overcrowded: no starvation', () => {
    const planet = makePlanet({ population: 50, maxPopulation: 100, base_population: 100 });
    const result = processOvercrowding(planet, ctx);
    expect(result.isOvercrowded).toBe(false);
    expect(result.starvationDeaths).toBe(0);
    expect(result.newPopulation).toBe(50);
  });

  it('exactly at max: no starvation', () => {
    const planet = makePlanet({ population: 100, maxPopulation: 100, base_population: 100 });
    const result = processOvercrowding(planet, ctx);
    expect(result.isOvercrowded).toBe(false);
    expect(result.starvationDeaths).toBe(0);
  });

  it('overcrowded: excess population starves at 0.5 rate', () => {
    // Pop 110, max 100 → 10 excess → floor(10 × 0.5) = 5 deaths
    const planet = makePlanet({ population: 110, maxPopulation: 100, base_population: 100 });
    const result = processOvercrowding(planet, ctx);
    expect(result.isOvercrowded).toBe(true);
    expect(result.excessPopulation).toBe(10);
    expect(result.starvationDeaths).toBe(5);
    expect(result.newPopulation).toBe(105);
    expect(result.moraleDelta).toBe(-20);
  });

  it('large overcrowding converges to max over several turns', () => {
    // Pop 160, max 100 → 60 excess → floor(60 × 0.5) = 30 deaths
    const planet = makePlanet({ population: 160, maxPopulation: 100, base_population: 100 });
    const result = processOvercrowding(planet, ctx);
    expect(result.starvationDeaths).toBe(30);
    expect(result.newPopulation).toBe(130); // Still over max, needs more turns
  });
});

// ── Rabbits Overflow Transport (fix-14/17) ───────────────────────────────────

describe('canAutoTransportOverflow', () => {
  /**
   * Per design/economy/population-growth.md §Overflow Population:
   *   Rabbits Special: Can redirect overflow to transports automatically
   */

  it('rabbits can auto-transport overflow', () => {
    expect(canAutoTransportOverflow('rabbits')).toBe(true);
  });

  it('other races cannot auto-transport overflow', () => {
    expect(canAutoTransportOverflow('hamsters')).toBe(false);
    expect(canAutoTransportOverflow('ferrets')).toBe(false);
    expect(canAutoTransportOverflow('ants')).toBe(false);
  });
});

describe('calculateOverflowTransport', () => {
  const rabbitsCtx: PopulationContext = {
    raceId: 'rabbits',
    techState: DEFAULT_TECH_STATE,
  };
  const hamstersCtx: PopulationContext = {
    raceId: 'hamsters',
    techState: DEFAULT_TECH_STATE,
  };

  it('rabbits redirect overflow to transports', () => {
    const planet = makePlanet({ population: 100, maxPopulation: 100 });
    const result = calculateOverflowTransport(planet, rabbitsCtx, 5);
    expect(result.redirected).toBe(true);
    expect(result.populationRedirected).toBe(5);
    expect(result.wastedGrowth).toBe(0);
  });

  it('non-rabbits waste overflow', () => {
    const planet = makePlanet({ population: 100, maxPopulation: 100 });
    const result = calculateOverflowTransport(planet, hamstersCtx, 5);
    expect(result.redirected).toBe(false);
    expect(result.populationRedirected).toBe(0);
    expect(result.wastedGrowth).toBe(5);
  });

  it('zero growth: nothing to redirect', () => {
    const planet = makePlanet({ population: 100, maxPopulation: 100 });
    const result = calculateOverflowTransport(planet, rabbitsCtx, 0);
    expect(result.redirected).toBe(false);
    expect(result.populationRedirected).toBe(0);
    expect(result.wastedGrowth).toBe(0);
  });
});

// ── Bio Weapon Max Population Reduction (fix-53) ──────────────────────────────

import {
  processBioWeaponDamage,
  clearBioWeaponDamage,
  getEffectiveMaxPopulation,
  BioWeaponPlanetFields,
  POPULATION_TRANSPORT,
} from '../../../src/game/systems/population';
import { BIO_WEAPONS } from '../../../src/game/constants';

describe('processBioWeaponDamage', () => {
  const ctx = makeCtx('hamsters');

  /**
   * Per design/economy/population-growth.md §Biological Weapon Damage:
   *   Population_Killed = Weapon_Kill_Rate × Number_Of_Weapons × Combat_Rounds_Survived
   *   New_Max_Pop = Old_Max_Pop × (1 - Max_Pop_Reduction)
   *
   * Bio weapons:
   *   Death Spores: 1M/round, -10% max pop
   *   Doom Virus: 2M/round, -25% max pop
   *   Bio Terminator: 3M/round, -50% max pop
   */

  it('death spores kills 1M per round per weapon', () => {
    const planet = makePlanet({ population: 50, maxPopulation: 100, base_population: 100 });
    const result = processBioWeaponDamage(
      planet as Planet & BioWeaponPlanetFields,
      'death_spores',
      1, // 1 weapon
      3, // 3 combat rounds
      ctx,
    );
    // 1M × 1 weapon × 3 rounds = 3M killed
    expect(result.populationKilled).toBe(3);
    expect(result.newPopulation).toBe(47);
  });

  it('doom virus kills 2M per round per weapon', () => {
    const planet = makePlanet({ population: 50, maxPopulation: 100, base_population: 100 });
    const result = processBioWeaponDamage(
      planet as Planet & BioWeaponPlanetFields,
      'doom_virus',
      2, // 2 weapons
      2, // 2 combat rounds
      ctx,
    );
    // 2M × 2 weapons × 2 rounds = 8M killed
    expect(result.populationKilled).toBe(8);
    expect(result.newPopulation).toBe(42);
  });

  it('bio terminator kills 3M per round per weapon', () => {
    const planet = makePlanet({ population: 50, maxPopulation: 100, base_population: 100 });
    const result = processBioWeaponDamage(
      planet as Planet & BioWeaponPlanetFields,
      'bio_terminator',
      1, // 1 weapon
      4, // 4 combat rounds
      ctx,
    );
    // 3M × 1 weapon × 4 rounds = 12M killed
    expect(result.populationKilled).toBe(12);
    expect(result.newPopulation).toBe(38);
  });

  it('death spores reduces max pop by 10%', () => {
    const planet = makePlanet({ population: 50, maxPopulation: 100, base_population: 100 });
    const result = processBioWeaponDamage(
      planet as Planet & BioWeaponPlanetFields,
      'death_spores',
      1,
      1,
      ctx,
    );
    expect(result.maxPopReductionApplied).toBeCloseTo(0.10);
    expect(result.newTotalMaxPopReduction).toBeCloseTo(0.10);
    // 100 × (1 - 0.10) = 90
    expect(result.newMaxPopulation).toBe(90);
  });

  it('doom virus reduces max pop by 25%', () => {
    const planet = makePlanet({ population: 50, maxPopulation: 100, base_population: 100 });
    const result = processBioWeaponDamage(
      planet as Planet & BioWeaponPlanetFields,
      'doom_virus',
      1,
      1,
      ctx,
    );
    expect(result.maxPopReductionApplied).toBeCloseTo(0.25);
    expect(result.newTotalMaxPopReduction).toBeCloseTo(0.25);
    // 100 × (1 - 0.25) = 75
    expect(result.newMaxPopulation).toBe(75);
  });

  it('bio terminator reduces max pop by 50%', () => {
    const planet = makePlanet({ population: 50, maxPopulation: 100, base_population: 100 });
    const result = processBioWeaponDamage(
      planet as Planet & BioWeaponPlanetFields,
      'bio_terminator',
      1,
      1,
      ctx,
    );
    expect(result.maxPopReductionApplied).toBeCloseTo(0.50);
    expect(result.newTotalMaxPopReduction).toBeCloseTo(0.50);
    // 100 × (1 - 0.50) = 50
    expect(result.newMaxPopulation).toBe(50);
  });

  it('antidote reduces casualties per round', () => {
    const planet = makePlanet({ population: 50, maxPopulation: 100, base_population: 100 });
    // Death spores: 1M/round × 3 weapons × 4 rounds = 12M gross
    // Antidote: 1M per round × 4 rounds = 4M reduction
    // Net: 12 - 4 = 8M killed
    const result = processBioWeaponDamage(
      planet as Planet & BioWeaponPlanetFields,
      'death_spores',
      3, // 3 weapons
      4, // 4 combat rounds
      ctx,
      1, // Bio Toxin Antidote: -1M per round
    );
    expect(result.populationKilled).toBe(8);
    expect(result.newPopulation).toBe(42);
  });

  it('leaves at least 1 survivor', () => {
    const planet = makePlanet({ population: 5, maxPopulation: 100, base_population: 100 });
    // Bio terminator: 3M × 1 × 10 rounds = 30M, but only 5M pop
    const result = processBioWeaponDamage(
      planet as Planet & BioWeaponPlanetFields,
      'bio_terminator',
      1,
      10, // 10 rounds
      ctx,
    );
    // Can only kill 4, leaving 1 survivor
    expect(result.populationKilled).toBe(4);
    expect(result.newPopulation).toBe(1);
  });

  it('cumulative max pop reduction across multiple attacks', () => {
    const planet: Planet & BioWeaponPlanetFields = {
      ...makePlanet({ population: 80, maxPopulation: 100, base_population: 100 }),
      bioWeaponMaxPopReduction: 0.10, // Already hit by death spores before
    };
    // Add doom virus reduction (25%)
    const result = processBioWeaponDamage(
      planet,
      'doom_virus',
      1,
      1,
      ctx,
    );
    // 0.10 + 0.25 = 0.35 total reduction
    expect(result.newTotalMaxPopReduction).toBeCloseTo(0.35);
    // 100 × (1 - 0.35) = 65
    expect(result.newMaxPopulation).toBe(65);
  });

  it('max pop reduction is capped at 90%', () => {
    const planet: Planet & BioWeaponPlanetFields = {
      ...makePlanet({ population: 50, maxPopulation: 100, base_population: 100 }),
      bioWeaponMaxPopReduction: 0.80, // Already heavily damaged
    };
    // Bio terminator would add 50%, but cap at 90%
    const result = processBioWeaponDamage(
      planet,
      'bio_terminator',
      1,
      1,
      ctx,
    );
    // Capped at 0.90
    expect(result.newTotalMaxPopReduction).toBeCloseTo(0.90);
    // Only applied 0.10 more
    expect(result.maxPopReductionApplied).toBeCloseTo(0.10);
    // baseMaxPop (99 for hamsters with default tech) × (1 - 0.90) = 9.9 → 9
    // Minimum cap ensures at least 1
    expect(result.newMaxPopulation).toBeGreaterThanOrEqual(1);
    expect(result.newMaxPopulation).toBeLessThanOrEqual(10);
  });

  it('reports atMaxReduction when already at cap', () => {
    const planet: Planet & BioWeaponPlanetFields = {
      ...makePlanet({ population: 20, maxPopulation: 100, base_population: 100 }),
      bioWeaponMaxPopReduction: 0.90, // Already at max reduction
    };
    const result = processBioWeaponDamage(
      planet,
      'death_spores',
      1,
      1,
      ctx,
    );
    expect(result.atMaxReduction).toBe(true);
    expect(result.maxPopReductionApplied).toBe(0);
    expect(result.newTotalMaxPopReduction).toBeCloseTo(0.90);
    // Still kills population
    expect(result.populationKilled).toBe(1);
  });
});

describe('clearBioWeaponDamage', () => {
  it('clears bio weapon reduction and returns amount cleared', () => {
    const planet: BioWeaponPlanetFields = {
      bioWeaponMaxPopReduction: 0.35,
    };
    const cleared = clearBioWeaponDamage(planet);
    expect(cleared).toBeCloseTo(0.35);
    expect(planet.bioWeaponMaxPopReduction).toBe(0);
  });

  it('returns 0 if no damage to clear', () => {
    const planet: BioWeaponPlanetFields = {};
    const cleared = clearBioWeaponDamage(planet);
    expect(cleared).toBe(0);
  });
});

describe('getEffectiveMaxPopulation', () => {
  const ctx = makeCtx('hamsters');

  it('returns normal max pop when no bio damage', () => {
    const planet = makePlanet({ population: 50, maxPopulation: 100, base_population: 100 });
    const effectiveMax = getEffectiveMaxPopulation(
      planet as Planet & BioWeaponPlanetFields,
      ctx,
    );
    expect(effectiveMax).toBe(100);
  });

  it('reduces max pop by bio weapon damage factor', () => {
    const planet: Planet & BioWeaponPlanetFields = {
      ...makePlanet({ population: 50, maxPopulation: 100, base_population: 100 }),
      bioWeaponMaxPopReduction: 0.25,
    };
    const effectiveMax = getEffectiveMaxPopulation(planet, ctx);
    // 100 × (1 - 0.25) = 75
    expect(effectiveMax).toBe(75);
  });

  it('returns minimum 1 even with extreme reduction', () => {
    const planet: Planet & BioWeaponPlanetFields = {
      ...makePlanet({ population: 5, maxPopulation: 10, base_population: 10 }),
      bioWeaponMaxPopReduction: 0.99,
    };
    const effectiveMax = getEffectiveMaxPopulation(planet, ctx);
    // 10 × (1 - 0.99) = 0.1 → floor = 0 → min 1
    expect(effectiveMax).toBe(1);
  });
});

describe('POPULATION_TRANSPORT constant', () => {
  /**
   * Per design/economy/population-growth.md §7:
   *   Colony Transport: 50 BC cost, 1 BC/turn maintenance, 1 million pop capacity
   */
  it('has correct cost', () => {
    expect(POPULATION_TRANSPORT.cost).toBe(50);
  });

  it('has correct maintenance', () => {
    expect(POPULATION_TRANSPORT.maintenance).toBe(1);
  });

  it('has correct capacity', () => {
    expect(POPULATION_TRANSPORT.capacity).toBe(1);
  });
});

describe('BIO_WEAPONS constants', () => {
  /**
   * Per design/technology/planetology.md:
   *   Death Spores: TL 10, 1M/round, -10% max pop, 150 space, 100 BC
   *   Doom Virus: TL 25, 2M/round, -25% max pop, 200 space, 200 BC
   *   Bio Terminator: TL 33, 3M/round, -50% max pop, 250 space, 300 BC
   */

  it('death spores has correct stats', () => {
    expect(BIO_WEAPONS.death_spores.techLevel).toBe(10);
    expect(BIO_WEAPONS.death_spores.killRatePerRound).toBe(1);
    expect(BIO_WEAPONS.death_spores.maxPopReduction).toBe(0.10);
    expect(BIO_WEAPONS.death_spores.spaceCost).toBe(150);
    expect(BIO_WEAPONS.death_spores.buildCost).toBe(100);
  });

  it('doom virus has correct stats', () => {
    expect(BIO_WEAPONS.doom_virus.techLevel).toBe(25);
    expect(BIO_WEAPONS.doom_virus.killRatePerRound).toBe(2);
    expect(BIO_WEAPONS.doom_virus.maxPopReduction).toBe(0.25);
    expect(BIO_WEAPONS.doom_virus.spaceCost).toBe(200);
    expect(BIO_WEAPONS.doom_virus.buildCost).toBe(200);
  });

  it('bio terminator has correct stats', () => {
    expect(BIO_WEAPONS.bio_terminator.techLevel).toBe(33);
    expect(BIO_WEAPONS.bio_terminator.killRatePerRound).toBe(3);
    expect(BIO_WEAPONS.bio_terminator.maxPopReduction).toBe(0.50);
    expect(BIO_WEAPONS.bio_terminator.spaceCost).toBe(250);
    expect(BIO_WEAPONS.bio_terminator.buildCost).toBe(300);
  });
});
