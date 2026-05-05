/**
 * ProductionContext integration tests.
 * test/game/systems/productionContext-integration.test.ts
 *
 * Integration tests that verify production calculations using the full
 * context-building pipeline, matching the worked examples in
 * design/economy/factory-formulas.md.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateGrossProduction,
  calculateNetProduction,
  operatingFactories,
  ProductionContext,
  basePopOutput,
  getEffectiveRCLevel,
} from '../../../src/game/systems/production';
import {
  getFactoryEfficiencyMultiplier,
  getRoboticControlsBonus,
  getPollutionReduction,
} from '../../../src/game/systems/raceAbilities';
import {
  RACIAL_PRODUCTION_MODIFIERS,
  MINERAL_RICHNESS_MODIFIERS,
} from '../../../src/game/constants';
import { Planet, RaceId } from '../../../src/game/state';

// ── Test Fixtures ──────────────────────────────────────────────────────────────

function makePlanet(overrides: Partial<Planet> = {}): Planet {
  return {
    id: 'p1',
    name: 'Test Planet',
    systemId: 's1',
    orbit: 1,
    type: 'terran',
    size: 'medium',
    gravity: 1.0,
    ownerId: 'empire1',
    isColonized: true,
    isHomeworld: false,
    population: 50,
    maxPopulation: 100,
    growthRate: 0.02,
    morale: 'content',
    factories: 50,
    maxFactories: 100,
    waste: 0,
    production: { ship: 100, defense: 0, industry: 0, ecology: 0, research: 0 },
    buildQueue: [],
    buildings: [],
    missileBases: 0,
    maxMissileBases: 10,
    planetaryShield: 0,
    isRich: false,
    isPoor: false,
    isGaia: false,
    hasArtifacts: false,
    resourceLevel: 'normal',
    researchMultiplier: 1.0,
    startingPopulation: null,
    startingFactories: null,
    ...overrides,
  };
}

/**
 * Build a ProductionContext for a specific race with given tech levels.
 * This mirrors what buildProductionContext in turn.ts does.
 */
function makeContext(
  raceId: RaceId,
  options: {
    rcLevel?: number;
    planetologyTL?: number;
    wasteRate?: number;
    cleanupModifier?: number;
    factoryCost?: number;
  } = {}
): ProductionContext {
  const racialProdMod = RACIAL_PRODUCTION_MODIFIERS[raceId] ?? 1.0;
  const rcBonus = getRoboticControlsBonus(raceId);
  const factoryEfficiency = getFactoryEfficiencyMultiplier(raceId);
  const pollutionReduction = getPollutionReduction(raceId);

  // Apply Mice pollution reduction to waste rate
  let wasteRate = options.wasteRate ?? 1.0;
  if (pollutionReduction > 0) {
    wasteRate *= (1 - pollutionReduction / 100);
  }

  return {
    racialProductionModifier: racialProdMod,
    racialResearchModifier: 1.0,
    difficultyProductionModifier: 1.0,
    roboticControlsLevel: options.rcLevel ?? 2,
    racialRCBonus: rcBonus,
    planetologyTL: options.planetologyTL ?? 1,
    wasteRate,
    cleanupModifier: options.cleanupModifier ?? 1.0,
    factoryCostBC: options.factoryCost ?? 10,
    maxTerraformTier: null,
    terraformTierCost: 200,
    factoryEfficiencyMultiplier: factoryEfficiency,
    racialMaintenanceModifier: 1.0,
    fleetLogisticsModifiers: [],
  };
}

// ── Racial Production Modifier Tests ───────────────────────────────────────────

describe('Racial Production Modifiers (factory-formulas.md §2)', () => {
  it('constants match design doc values', () => {
    expect(RACIAL_PRODUCTION_MODIFIERS['ants']).toBe(1.5);
    expect(RACIAL_PRODUCTION_MODIFIERS['mice']).toBe(1.25);
    expect(RACIAL_PRODUCTION_MODIFIERS['guinea_pigs']).toBe(1.1);
    expect(RACIAL_PRODUCTION_MODIFIERS['hamsters']).toBe(1.0);
    expect(RACIAL_PRODUCTION_MODIFIERS['budgies']).toBe(0.9);
  });
});

// ── Mice Special Abilities Tests ───────────────────────────────────────────────

describe('Mice Special Abilities (factory-formulas.md §1-2)', () => {
  it('Mice get +2 RC level bonus', () => {
    expect(getRoboticControlsBonus('mice')).toBe(2);
  });

  it('Mice have 1.5× factory efficiency', () => {
    expect(getFactoryEfficiencyMultiplier('mice')).toBe(1.5);
  });

  it('Mice have 50% pollution reduction', () => {
    expect(getPollutionReduction('mice')).toBe(50);
  });

  it('Mice effective RC level includes bonus', () => {
    const ctx = makeContext('mice', { rcLevel: 2 });
    expect(getEffectiveRCLevel(ctx)).toBe(4); // 2 base + 2 bonus = RC IV
  });

  it('Mice operate more factories per population', () => {
    const planet = makePlanet({ population: 50, factories: 200 });
    const hamsterCtx = makeContext('hamsters', { rcLevel: 2 });
    const miceCtx = makeContext('mice', { rcLevel: 2 });

    // Hamsters: 50 pop × 2 RC = 100 max operable
    expect(operatingFactories(planet, hamsterCtx)).toBe(100);

    // Mice: 50 pop × (2 + 2 bonus) = 200 max operable
    expect(operatingFactories(planet, miceCtx)).toBe(200);
  });
});

// ── Population Output Scaling Tests ────────────────────────────────────────────

describe('Population Output Scaling (factory-formulas.md §3)', () => {
  it('basePopOutput formula: 0.5 + (TL/50 × 1.5)', () => {
    expect(basePopOutput(0)).toBeCloseTo(0.5);
    expect(basePopOutput(1)).toBeCloseTo(0.53);
    expect(basePopOutput(25)).toBeCloseTo(1.25);
    expect(basePopOutput(50)).toBeCloseTo(2.0);
  });

  it('basePopOutput caps at TL 50', () => {
    expect(basePopOutput(100)).toBeCloseTo(2.0);
  });
});

// ── Mineral Richness Tests ─────────────────────────────────────────────────────

describe('Mineral Richness Modifiers (factory-formulas.md §3)', () => {
  it('constants match design doc values', () => {
    expect(MINERAL_RICHNESS_MODIFIERS['ultra_poor']).toBe(0.33);
    expect(MINERAL_RICHNESS_MODIFIERS['poor']).toBe(0.5);
    expect(MINERAL_RICHNESS_MODIFIERS['normal']).toBe(1.0);
    expect(MINERAL_RICHNESS_MODIFIERS['rich']).toBe(2.0);
    expect(MINERAL_RICHNESS_MODIFIERS['ultra_rich']).toBe(3.0);
  });
});

// ── Worked Example 1 (factory-formulas.md) ─────────────────────────────────────

describe('Worked Example 1: Basic Hamster Production', () => {
  /**
   * From design/economy/factory-formulas.md:
   * - Race: Hamsters (1.0 modifier)
   * - Population: 40
   * - Factories: 80
   * - Robotic Controls: II (2:1)
   * - No waste reduction
   * - Planetology TL 1
   * - Mineral richness: Normal (×1.0)
   *
   * Expected:
   * 1. Max operable factories: 40 × 2 = 80
   * 2. Operating factories: 80
   * 3. Base_Pop_Output: 0.53 BC/pop
   * 4. Factory production: 80 × 1 × 1.0 = 80 BC
   * 5. Population production: 40 × 0.53 × 1.0 = 21.2 BC
   * 6. Gross production: 101.2 BC
   * 7. Pollution: 80 × 1.0 = 80 units
   * 8. Cleanup cost: 80 × 0.5 × 1.0 = 40 BC
   * 9. Net production: floor(101.2 - 40) = 61 BC/turn
   */

  it('calculates operating factories correctly', () => {
    const planet = makePlanet({ population: 40, factories: 80 });
    const ctx = makeContext('hamsters', { rcLevel: 2, planetologyTL: 1 });

    expect(operatingFactories(planet, ctx)).toBe(80);
  });

  it('calculates gross production correctly', () => {
    const planet = makePlanet({
      population: 40,
      factories: 80,
      resourceLevel: 'normal',
      production: { ship: 100, defense: 0, industry: 0, ecology: 0, research: 0 },
    });
    const ctx = makeContext('hamsters', { rcLevel: 2, planetologyTL: 1 });

    const result = calculateGrossProduction(planet, ctx);

    expect(result.operatingFactories).toBe(80);
    expect(result.factoryProduction).toBeCloseTo(80, 1);
    // Pop output at TL 1 ≈ 0.53, 40 pop: 40 × 0.53 = 21.2
    expect(result.populationProduction).toBeCloseTo(21.2, 1);
    expect(result.grossProduction).toBeCloseTo(101.2, 1);
  });

  it('calculates net production correctly', () => {
    const planet = makePlanet({
      population: 40,
      factories: 80,
      resourceLevel: 'normal',
      production: { ship: 100, defense: 0, industry: 0, ecology: 0, research: 0 },
    });
    const ctx = makeContext('hamsters', {
      rcLevel: 2,
      planetologyTL: 1,
      wasteRate: 1.0,
      cleanupModifier: 1.0,
    });

    const result = calculateNetProduction(planet, ctx);

    // Pollution: 80 × 1.0 = 80
    // Cleanup: 80 × 0.5 × 1.0 = 40 BC
    expect(result.pollution.pollutionGenerated).toBe(80);
    expect(result.pollution.cleanupCost).toBe(40);

    // Net: floor(101.2 - 40) = 61 BC
    expect(result.netProduction).toBe(61);
  });
});

// ── Worked Example 2 (factory-formulas.md) ─────────────────────────────────────

describe('Worked Example 2: Ants with Advanced Tech', () => {
  /**
   * From design/economy/factory-formulas.md:
   * - Race: Ants (1.5 modifier)
   * - Population: 60
   * - Factories: 300
   * - Robotic Controls: V (5:1)
   * - Reduced Industrial Waste 40% (wasteRate = 0.40)
   * - Enhanced Eco Restoration (cleanup_modifier = 0.40)
   * - Planetology TL 30
   * - Mineral richness: Rich (×2.0)
   *
   * Expected:
   * 1. Max operable: 60 × 5 = 300
   * 2. Operating: 300
   * 3. Base_Pop_Output: 0.5 + (30/50 × 1.5) = 1.40 BC/pop
   * 4. Factory production: 300 × 1 × 1.5 = 450 BC
   * 5. Pop production: 60 × 1.40 × 1.5 = 126 BC
   * 6. Gross: (450 + 126) × 2.0 = 1,152 BC
   * 7. Pollution: 300 × 0.40 = 120 units
   * 8. Cleanup: 120 × 0.5 × 0.40 = 24 BC
   * 9. Net: 1,152 - 24 = 1,128 BC/turn
   */

  it('calculates operating factories correctly with RC V', () => {
    const planet = makePlanet({ population: 60, factories: 300 });
    const ctx = makeContext('ants', { rcLevel: 5 });

    expect(operatingFactories(planet, ctx)).toBe(300);
  });

  it('calculates gross production with racial modifier and richness', () => {
    const planet = makePlanet({
      population: 60,
      factories: 300,
      resourceLevel: 'rich',
      production: { ship: 100, defense: 0, industry: 0, ecology: 0, research: 0 },
    });
    const ctx = makeContext('ants', { rcLevel: 5, planetologyTL: 30 });

    const result = calculateGrossProduction(planet, ctx);

    expect(result.operatingFactories).toBe(300);
    // Factory: 300 × 1.0 × 1.0 (ants have no efficiency bonus) × 1.5 (racial) = 450 BC
    // After richness: 450 × 2.0 = 900 BC
    expect(result.factoryProduction).toBeCloseTo(900, 1);

    // Pop output at TL 30: 0.5 + (30/50 × 1.5) = 1.40
    // Pop: 60 × 1.40 × 1.5 = 126 BC, after richness: 252 BC
    expect(result.populationProduction).toBeCloseTo(252, 1);

    // Total: 1,152 BC
    expect(result.grossProduction).toBeCloseTo(1152, 1);
  });

  it('calculates net production with waste reduction and eco restoration', () => {
    const planet = makePlanet({
      population: 60,
      factories: 300,
      resourceLevel: 'rich',
      production: { ship: 100, defense: 0, industry: 0, ecology: 0, research: 0 },
    });
    const ctx = makeContext('ants', {
      rcLevel: 5,
      planetologyTL: 30,
      wasteRate: 0.40,
      cleanupModifier: 0.40,
    });

    const result = calculateNetProduction(planet, ctx);

    // Pollution: 300 × 0.40 = 120 units
    expect(result.pollution.pollutionGenerated).toBe(120);

    // Cleanup: 120 × 0.5 × 0.40 = 24 BC
    expect(result.pollution.cleanupCost).toBe(24);

    // Net: floor(1152 - 24) = 1128 BC
    expect(result.netProduction).toBe(1128);
  });
});

// ── Mice Stacking Bonuses Test ─────────────────────────────────────────────────

describe('Mice Stacking Production Bonuses (factory-formulas.md §2 Note)', () => {
  /**
   * Per design doc, Mice have THREE stacking bonuses:
   * 1. +25% base production modifier (1.25×)
   * 2. +2 RC level bonus (more max-operable factories)
   * 3. +50% factory efficiency (each factory outputs 1.5 BC)
   */

  it('all three bonuses stack multiplicatively', () => {
    const planet = makePlanet({
      population: 50,
      factories: 200, // Will need RC IV effective to operate all
      resourceLevel: 'normal',
      production: { ship: 100, defense: 0, industry: 0, ecology: 0, research: 0 },
    });

    // Mice with base RC II (effective RC IV = 4 factories/pop)
    const ctx = makeContext('mice', { rcLevel: 2, planetologyTL: 1 });

    expect(getEffectiveRCLevel(ctx)).toBe(4); // 2 + 2 bonus

    const result = calculateGrossProduction(planet, ctx);

    // Max operable: 50 × 4 = 200 (all factories can operate)
    expect(result.operatingFactories).toBe(200);

    // Factory output: 200 × 1.0 × 1.5 (efficiency) × 1.25 (racial) = 375 BC
    expect(result.factoryProduction).toBeCloseTo(375, 1);

    // Pop output at TL 1: 50 × 0.53 × 1.25 = 33.125 BC
    expect(result.populationProduction).toBeCloseTo(33.125, 1);
  });

  it('Mice pollution reduction reduces waste rate', () => {
    const ctx = makeContext('mice', { wasteRate: 1.0 });
    // Mice 50% pollution reduction should reduce effective waste rate
    // wasteRate * (1 - 50/100) = 0.5
    expect(ctx.wasteRate).toBeCloseTo(0.5);
  });
});
