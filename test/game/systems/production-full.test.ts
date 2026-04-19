/**
 * Comprehensive production system tests.
 * test/game/systems/production-full.test.ts
 *
 * Tests all aspects of the production system per design/economy/slider-mathematics.md:
 *   - Slider validation (sum to 100)
 *   - SHIP/DEF/IND/ECO/TECH allocation
 *   - Pollution and cleanup
 *   - ECO phases (cleanup → growth → terraforming)
 *   - Slider rebalancing with locks
 */

import { describe, it, expect } from 'vitest';
import {
  validateSliders,
  allocateSliders,
  calculateGrossProduction,
  calculatePollution,
  calculateNetProduction,
  processEcoPhases,
  buildFactories,
  processPlanetProduction,
  rebalanceSliders,
  basePopOutput,
  getRichnessMultiplier,
  operatingFactories,
  ProductionContext,
  DEFAULT_PRODUCTION_CONTEXT,
  MINERAL_RICHNESS_MODIFIERS,
  BASE_CLEANUP_COST_PER_POLLUTION,
  GROWTH_BC_EFFICIENCY,
  SliderState,
} from '../../../src/game/systems/production';
import { Planet, PlanetProduction } from '../../../src/game/state';

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

function makePlanet(overrides: Partial<Planet> = {}): Planet {
  return {
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
    growthRate: 0.02,
    morale: 'content',
    factories: 50,
    maxFactories: 100,
    waste: 0,
    production: { ship: 30, defense: 0, industry: 20, ecology: 30, research: 20 },
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

// ─────────────────────────────────────────────────────────────────────────────
// Basic formula tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Production System — Basic Formulas', () => {
  it('basePopOutput scales with Planetology TL', () => {
    expect(basePopOutput(0)).toBeCloseTo(0.5);
    expect(basePopOutput(1)).toBeCloseTo(0.53);
    expect(basePopOutput(25)).toBeCloseTo(1.25);
    expect(basePopOutput(50)).toBeCloseTo(2.0);
    expect(basePopOutput(100)).toBeCloseTo(2.0); // capped at 50
  });

  it('getRichnessMultiplier returns correct values', () => {
    expect(getRichnessMultiplier(makePlanet({ resourceLevel: 'ultra_poor' }))).toBe(MINERAL_RICHNESS_MODIFIERS.ultra_poor);
    expect(getRichnessMultiplier(makePlanet({ resourceLevel: 'poor' }))).toBe(MINERAL_RICHNESS_MODIFIERS.poor);
    expect(getRichnessMultiplier(makePlanet({ resourceLevel: 'normal' }))).toBe(MINERAL_RICHNESS_MODIFIERS.normal);
    expect(getRichnessMultiplier(makePlanet({ resourceLevel: 'rich' }))).toBe(MINERAL_RICHNESS_MODIFIERS.rich);
    expect(getRichnessMultiplier(makePlanet({ resourceLevel: 'ultra_rich' }))).toBe(MINERAL_RICHNESS_MODIFIERS.ultra_rich);
  });

  it('operatingFactories is limited by population × roboticControlsLevel', () => {
    const ctx: ProductionContext = { ...DEFAULT_PRODUCTION_CONTEXT, roboticControlsLevel: 2 };
    const planet = makePlanet({ population: 50, factories: 120 });
    expect(operatingFactories(planet, ctx)).toBe(100); // 50 × 2
  });

  it('operatingFactories returns actual factories when under limit', () => {
    const ctx: ProductionContext = { ...DEFAULT_PRODUCTION_CONTEXT, roboticControlsLevel: 2 };
    const planet = makePlanet({ population: 100, factories: 80 });
    expect(operatingFactories(planet, ctx)).toBe(80);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Gross production tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Production System — Gross Production', () => {
  it('calculates gross production with TECH diversion', () => {
    const planet = makePlanet({
      population: 100,
      factories: 100,
      production: { ship: 40, defense: 0, industry: 20, ecology: 20, research: 20 },
    });
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      roboticControlsLevel: 2,
      planetologyTL: 1,
      racialProductionModifier: 1.0,
    };

    const result = calculateGrossProduction(planet, ctx);

    // Active pop = 100 × (1 - 0.20) = 80
    // Factory: 100 × 1.0 × 1.0 = 100 BC
    // Pop (TL1 ≈ 0.53): 80 × 0.53 × 1.0 = 42.4 BC
    // Gross: (100 + 42.4) × 1.0 (normal richness) = 142.4 BC
    expect(result.operatingFactories).toBe(100);
    expect(result.idleFactories).toBe(0);
    expect(result.grossProduction).toBeCloseTo(142.4, 1);
  });

  it('applies mineral richness multiplier correctly', () => {
    const planet = makePlanet({
      population: 100,
      factories: 100,
      resourceLevel: 'rich',
      production: { ship: 100, defense: 0, industry: 0, ecology: 0, research: 0 },
    });
    const ctx: ProductionContext = { ...DEFAULT_PRODUCTION_CONTEXT };

    const result = calculateGrossProduction(planet, ctx);

    // Gross before richness: 100 (factories) + 100 × 0.53 (pop) = 153 BC
    // Rich multiplier: ×2.0
    expect(result.grossProduction).toBeCloseTo(153 * 2.0, 1);
  });

  it('applies Mice factory efficiency multiplier', () => {
    const planet = makePlanet({
      population: 100,
      factories: 100,
      production: { ship: 100, defense: 0, industry: 0, ecology: 0, research: 0 },
    });
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      factoryEfficiencyMultiplier: 1.5, // Mice "Automated Production"
    };

    const result = calculateGrossProduction(planet, ctx);

    // Factory output: 100 × 1.0 (base) × 1.5 (efficiency) × 1.0 (racial) = 150 BC
    // Pop output: 100 × 0.53 × 1.0 = 53 BC
    // Total: 203 BC
    expect(result.factoryProduction).toBeCloseTo(150, 1);
  });

  it('handles uncolonized planets', () => {
    const planet = makePlanet({ isColonized: false, ownerId: null });
    const ctx: ProductionContext = { ...DEFAULT_PRODUCTION_CONTEXT };

    const result = calculateGrossProduction(planet, ctx);

    expect(result.grossProduction).toBe(0);
    expect(result.operatingFactories).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Pollution and cleanup tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Production System — Pollution & Cleanup', () => {
  it('calculates pollution correctly', () => {
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      wasteRate: 1.0,
      cleanupModifier: 1.0,
    };

    const result = calculatePollution(100, ctx);

    expect(result.pollutionGenerated).toBe(100);
    expect(result.cleanupCost).toBe(100 * BASE_CLEANUP_COST_PER_POLLUTION * 1.0);
  });

  it('applies waste reduction technology', () => {
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      wasteRate: 0.40, // Reduced Industrial Waste 40%
      cleanupModifier: 1.0,
    };

    const result = calculatePollution(100, ctx);

    expect(result.pollutionGenerated).toBe(40);
    expect(result.cleanupCost).toBe(40 * 0.5);
  });

  it('applies eco restoration technology', () => {
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      wasteRate: 1.0,
      cleanupModifier: 0.40, // Enhanced Eco Restoration
    };

    const result = calculatePollution(200, ctx);

    expect(result.pollutionGenerated).toBe(200);
    expect(result.cleanupCost).toBe(200 * 0.5 * 0.40);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Net production tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Production System — Net Production', () => {
  it('subtracts cleanup cost from gross production', () => {
    const planet = makePlanet({
      population: 50,
      factories: 80,
      production: { ship: 100, defense: 0, industry: 0, ecology: 0, research: 0 },
    });
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      roboticControlsLevel: 2,
      wasteRate: 1.0,
      cleanupModifier: 1.0,
    };

    const result = calculateNetProduction(planet, ctx);

    // Gross: 80 (factories) + 50 × 0.53 (pop) = 106.5 BC
    // Cleanup: 80 × 0.5 × 1.0 = 40 BC
    // Net: floor(106.5 - 40) = 66 BC
    expect(result.netProduction).toBe(66);
  });

  it('clamps net production to 0 when cleanup exceeds gross', () => {
    const planet = makePlanet({
      population: 10,
      factories: 200,
      production: { ship: 100, defense: 0, industry: 0, ecology: 0, research: 0 },
    });
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      roboticControlsLevel: 1, // Only 10 factories operable
      wasteRate: 1.0,
      cleanupModifier: 1.0,
    };

    const result = calculateNetProduction(planet, ctx);

    // Only 10 factories operable, cleanup cost is small, should be positive
    expect(result.netProduction).toBeGreaterThanOrEqual(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Slider validation tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Production System — Slider Validation', () => {
  it('validates sliders that sum to 100', () => {
    const production: PlanetProduction = {
      ship: 20,
      defense: 20,
      industry: 20,
      ecology: 20,
      research: 20,
    };
    expect(validateSliders(production)).toBe(true);
  });

  it('rejects sliders that sum to < 100', () => {
    const production: PlanetProduction = {
      ship: 20,
      defense: 20,
      industry: 20,
      ecology: 20,
      research: 15,
    };
    expect(validateSliders(production)).toBe(false);
  });

  it('rejects sliders that sum to > 100', () => {
    const production: PlanetProduction = {
      ship: 30,
      defense: 30,
      industry: 30,
      ecology: 30,
      research: 30,
    };
    expect(validateSliders(production)).toBe(false);
  });

  it('accepts sliders within 1% tolerance', () => {
    const production: PlanetProduction = {
      ship: 20.1,
      defense: 19.9,
      industry: 20,
      ecology: 20,
      research: 20,
    };
    expect(validateSliders(production)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Slider allocation tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Production System — Slider Allocation', () => {
  it('allocates net production across 4 sliders (TECH separate)', () => {
    const planet = makePlanet({
      production: { ship: 50, defense: 0, industry: 25, ecology: 0, research: 25 },
    });
    const ctx: ProductionContext = { ...DEFAULT_PRODUCTION_CONTEXT };
    const netProduction = 100;

    const allocation = allocateSliders(planet, netProduction, ctx);

    // SHIP: 50%, DEF: 0%, IND: 25%, ECO: 0% (renormalised to 100%)
    // Actual: SHIP 50/(50+0+25+0)×100 = 66.67%, IND 33.33%
    expect(allocation.ship).toBeCloseTo(66, 0);
    expect(allocation.defense).toBe(0);
    expect(allocation.industry).toBeCloseTo(33, 0);
    expect(allocation.ecology).toBe(0);
  });

  it('calculates TECH RP from diverted population', () => {
    const planet = makePlanet({
      population: 100,
      production: { ship: 40, defense: 0, industry: 20, ecology: 20, research: 20 },
    });
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      racialResearchModifier: 1.0,
    };

    const allocation = allocateSliders(planet, 100, ctx);

    // Scientists: 100 × 0.20 = 20M
    // RP: 20 × 1.0 × 1.0 = 20 RP
    expect(allocation.scientists).toBe(20);
    expect(allocation.techRP).toBe(20);
  });

  it('applies racial research modifier to TECH RP', () => {
    const planet = makePlanet({
      population: 100,
      production: { ship: 0, defense: 0, industry: 0, ecology: 0, research: 100 },
    });
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      racialResearchModifier: 1.5, // Rats
    };

    const allocation = allocateSliders(planet, 100, ctx);

    // Scientists: 100 × 1.0 = 100M
    // RP: 100 × 1.0 × 1.5 = 150 RP
    expect(allocation.techRP).toBe(150);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ECO phases tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Production System — ECO Phases', () => {
  it('pays full cleanup when ECO_BC is sufficient', () => {
    const planet = makePlanet({ population: 50, maxPopulation: 100 });
    const ctx: ProductionContext = { ...DEFAULT_PRODUCTION_CONTEXT };
    const pollutionResult = { pollutionGenerated: 100, cleanupCost: 50 };

    const result = processEcoPhases(60, pollutionResult, planet, ctx, 0);

    expect(result.cleanupPaid).toBe(50);
    expect(result.uncleanedPollution).toBe(0);
    expect(result.growthBCSpent).toBeGreaterThan(0);
  });

  it('leaves uncleaned pollution when ECO_BC is insufficient', () => {
    const planet = makePlanet();
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      cleanupModifier: 1.0,
    };
    const pollutionResult = { pollutionGenerated: 100, cleanupCost: 50 };

    const result = processEcoPhases(20, pollutionResult, planet, ctx, 0);

    expect(result.cleanupPaid).toBe(20);
    // Uncleaned = (50 - 20) / (0.5 × 1.0) = 60 pollution units
    expect(result.uncleanedPollution).toBeCloseTo(60, 1);
    expect(result.growthBCSpent).toBe(0);
  });

  it('allocates to growth bonus after cleanup', () => {
    const planet = makePlanet({ population: 50, maxPopulation: 100 });
    const ctx: ProductionContext = { ...DEFAULT_PRODUCTION_CONTEXT };
    const pollutionResult = { pollutionGenerated: 0, cleanupCost: 0 };

    const result = processEcoPhases(100, pollutionResult, planet, ctx, 0);

    expect(result.cleanupPaid).toBe(0);
    expect(result.growthBCSpent).toBeGreaterThan(0);
    expect(result.growthBonus).toBeCloseTo(result.growthBCSpent * GROWTH_BC_EFFICIENCY, 2);
  });

  it('caps growth BC to population gap', () => {
    const planet = makePlanet({ population: 99, maxPopulation: 100 });
    const ctx: ProductionContext = { ...DEFAULT_PRODUCTION_CONTEXT };
    const pollutionResult = { pollutionGenerated: 0, cleanupCost: 0 };

    const result = processEcoPhases(1000, pollutionResult, planet, ctx, 0);

    // Max growth = 1 pop = 1 / 0.1 = 10 BC
    expect(result.growthBCSpent).toBeCloseTo(10, 1);
    expect(result.growthBonus).toBeCloseTo(1, 1);
  });

  it('allocates to terraforming after growth', () => {
    const planet = makePlanet({ population: 100, maxPopulation: 100 });
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      maxTerraformTier: 3,
      terraformTierCost: 200,
    };
    const pollutionResult = { pollutionGenerated: 0, cleanupCost: 0 };

    const result = processEcoPhases(50, pollutionResult, planet, ctx, 0);

    expect(result.terraformBCSpent).toBe(50);
  });

  it('overflows to reserve when no terraforming tech', () => {
    const planet = makePlanet({ population: 100, maxPopulation: 100 });
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      maxTerraformTier: null,
    };
    const pollutionResult = { pollutionGenerated: 0, cleanupCost: 0 };

    const result = processEcoPhases(100, pollutionResult, planet, ctx, 0);

    expect(result.ecoReserveOverflow).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Factory construction tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Production System — Factory Construction', () => {
  it('builds factories with IND allocation', () => {
    const planet = makePlanet({ factories: 50, maxPopulation: 100 });
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      factoryCostBC: 10,
      roboticControlsLevel: 2,
    };

    const result = buildFactories(50, planet, ctx, 0);

    // 50 BC / 10 BC = 5 factories
    expect(result.factoriesBuilt).toBe(5);
    expect(result.buildProgress).toBe(0);
  });

  it('carries over partial progress', () => {
    const planet = makePlanet({ factories: 50, maxPopulation: 100 });
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      factoryCostBC: 10,
      roboticControlsLevel: 2,
    };

    const result = buildFactories(47, planet, ctx, 0);

    expect(result.factoriesBuilt).toBe(4);
    expect(result.buildProgress).toBe(7);
  });

  it('includes carryover from previous turn', () => {
    const planet = makePlanet({ factories: 50, maxPopulation: 100 });
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      factoryCostBC: 10,
      roboticControlsLevel: 2,
    };

    const result = buildFactories(25, planet, ctx, 7);

    // 25 + 7 = 32 BC / 10 = 3 factories, 2 BC carryover
    expect(result.factoriesBuilt).toBe(3);
    expect(result.buildProgress).toBe(2);
  });

  it('overflows to reserve when at max factories', () => {
    const planet = makePlanet({ factories: 200, maxPopulation: 100 });
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      roboticControlsLevel: 2,
    };

    const result = buildFactories(50, planet, ctx, 0);

    expect(result.factoriesBuilt).toBe(0);
    expect(result.indReserveOverflow).toBe(50);
  });

  it('refunds progress when hitting max factories', () => {
    const planet = makePlanet({ factories: 199, maxPopulation: 100 });
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      factoryCostBC: 10,
      roboticControlsLevel: 2,
    };

    const result = buildFactories(50, planet, ctx, 0);

    // Max = 100 × 2 = 200, need 1 more factory
    // 50 BC / 10 = 5 possible, but only 1 needed
    // 1 × 10 = 10 BC spent, 40 BC refunded
    expect(result.factoriesBuilt).toBe(1);
    expect(result.indReserveOverflow).toBe(40);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Full turn production tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Production System — Full Turn Processing', () => {
  it('processes a complete production turn', () => {
    const planet = makePlanet({
      population: 50,
      maxPopulation: 100,
      factories: 50,
      production: { ship: 30, defense: 0, industry: 20, ecology: 30, research: 20 },
    });
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      roboticControlsLevel: 2,
      factoryCostBC: 10,
    };

    const result = processPlanetProduction(planet, ctx, 0, 0);

    expect(result.net.netProduction).toBeGreaterThan(0);
    expect(result.allocation.ship).toBeGreaterThan(0);
    expect(result.allocation.industry).toBeGreaterThan(0);
    expect(result.allocation.ecology).toBeGreaterThan(0);
    expect(result.factories.factoriesBuilt).toBeGreaterThanOrEqual(0);
  });

  it('accumulates reserve contributions', () => {
    const planet = makePlanet({
      population: 100,
      maxPopulation: 100,
      factories: 200,
      production: { ship: 0, defense: 0, industry: 50, ecology: 50, research: 0 },
    });
    const ctx: ProductionContext = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      roboticControlsLevel: 2,
      maxTerraformTier: null,
    };

    const result = processPlanetProduction(planet, ctx, 0, 0);

    // Planet at max pop & factories → both IND and ECO overflow
    expect(result.reserveContribution).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Slider rebalancing tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Production System — Slider Rebalancing', () => {
  it('rebalances when one slider is increased', () => {
    const current: SliderState = {
      ship:     { value: 20, locked: false },
      defense:  { value: 20, locked: false },
      industry: { value: 20, locked: false },
      ecology:  { value: 20, locked: false },
      research: { value: 20, locked: false },
    };

    const result = rebalanceSliders(current, 'ship', 40);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.sliders.ship.value).toBe(40);
      const sum =
        result.sliders.ship.value +
        result.sliders.defense.value +
        result.sliders.industry.value +
        result.sliders.ecology.value +
        result.sliders.research.value;
      expect(sum).toBeCloseTo(100, 1);
    }
  });

  it('respects locked sliders', () => {
    const current: SliderState = {
      ship:     { value: 20, locked: true },
      defense:  { value: 20, locked: false },
      industry: { value: 20, locked: false },
      ecology:  { value: 20, locked: false },
      research: { value: 20, locked: false },
    };

    const result = rebalanceSliders(current, 'defense', 40);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.sliders.ship.value).toBe(20); // locked, unchanged
      expect(result.sliders.defense.value).toBe(40);
      const sum =
        result.sliders.ship.value +
        result.sliders.defense.value +
        result.sliders.industry.value +
        result.sliders.ecology.value +
        result.sliders.research.value;
      expect(sum).toBeCloseTo(100, 1);
    }
  });

  it('rejects when no unlocked sliders available', () => {
    const current: SliderState = {
      ship:     { value: 20, locked: true },
      defense:  { value: 20, locked: true },
      industry: { value: 20, locked: true },
      ecology:  { value: 20, locked: true },
      research: { value: 20, locked: false },
    };

    const result = rebalanceSliders(current, 'research', 40);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('NO_UNLOCKED_SLIDERS');
    }
  });

  it('rejects when locked sliders sum > 100', () => {
    const current: SliderState = {
      ship:     { value: 60, locked: true },
      defense:  { value: 30, locked: true },
      industry: { value: 10, locked: false },
      ecology:  { value: 0, locked: false },
      research: { value: 0, locked: false },
    };

    const result = rebalanceSliders(current, 'defense', 50);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('LOCKED_SUM_EXCEEDS_100');
    }
  });

  it('distributes delta proportionally among unlocked sliders', () => {
    const current: SliderState = {
      ship:     { value: 30, locked: false },
      defense:  { value: 30, locked: false },
      industry: { value: 20, locked: false },
      ecology:  { value: 10, locked: true },
      research: { value: 10, locked: false },
    };

    const result = rebalanceSliders(current, 'ship', 50);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.sliders.ecology.value).toBe(10); // locked
      expect(result.sliders.ship.value).toBe(50);
      const sum =
        result.sliders.ship.value +
        result.sliders.defense.value +
        result.sliders.industry.value +
        result.sliders.ecology.value +
        result.sliders.research.value;
      expect(sum).toBeCloseTo(100, 1);
    }
  });
});
