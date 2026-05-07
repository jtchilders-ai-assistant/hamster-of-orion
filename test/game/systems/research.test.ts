/**
 * Research system tests.
 * test/game/systems/research.test.ts
 *
 * Verifies all worked examples from design/technology/research-formulas.md
 * and covers edge cases.
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePlanetRP,
  getLabMultiplier,
  getRacialResearchModifier,
  getTechCost,
  getTechCostAI,
  getBaseTierCost,
  getGalaxySizeModifier,
  getDifficultyAICostModifier,
  allocateResearch,
  isValidAllocation,
  getMiniaturizedStats,
  processResearchTurn,
  applyResearchRP,
  createDefaultFieldResearch,
  setResearchTarget,
  calculateEmpireTotalRP,
  createEvenAllocation,
  ALL_RESEARCH_FIELDS,
  BASE_RP_PER_SCIENTIST,
  MINIATURIZATION_RATE,
  getTechPrerequisite,
  isTechResearchable,
  getResearchableForField,
  MINIATURIZATION_MAX,
  type PlanetRPInput,
  type ResearchAllocation,
  type EmpireFieldResearch,
  type ComponentStats,
} from '../../../src/game/systems/research';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeAllocation(overrides: Partial<ResearchAllocation> = {}): ResearchAllocation {
  // Equal split across 6 fields = 100%
  const base: ResearchAllocation = {
    weapons: 20,
    propulsion: 20,
    construction: 20,
    computers: 20,
    force_fields: 10,
    planetology: 10,
  };
  return { ...base, ...overrides };
}

function makePlanet(overrides: Partial<PlanetRPInput> = {}): PlanetRPInput {
  return {
    population: 100,
    researchSlider: 30,
    buildingIds: [],
    hasArtifacts: false,
    isOrion: false,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. RP Generation
// ─────────────────────────────────────────────────────────────────────────────

describe('calculatePlanetRP', () => {
  it('Example 1: Hamsters, pop=100, slider=30, [Research Lab + Supercomputer] → 75 RP', () => {
    const planet = makePlanet({
      population: 100,
      researchSlider: 30,
      buildingIds: ['research_lab', 'supercomputer'],
    });
    // Scientists: 100 × 0.30 = 30
    // Lab multiplier: 1.0 + 0.5 + 1.0 = 2.5
    // Racial: 1.0
    // RP: 30 × 1.0 × 2.5 × 1.0 = 75
    expect(calculatePlanetRP(planet, 'hamsters')).toBeCloseTo(75, 5);
  });

  it('Example 2: Rats, pop=50, slider=40, [Research Lab + Supercomputer] → 75 RP/planet', () => {
    const planet = makePlanet({
      population: 50,
      researchSlider: 40,
      buildingIds: ['research_lab', 'supercomputer'],
    });
    // Scientists: 50 × 0.40 = 20
    // Lab: 2.5×
    // Racial: 1.5
    // RP: 20 × 1.0 × 2.5 × 1.5 = 75
    expect(calculatePlanetRP(planet, 'rats')).toBeCloseTo(75, 5);
  });

  it('Example 2 empire total: 5 Rat planets × 75 RP = 375 RP', () => {
    const planet = makePlanet({
      population: 50,
      researchSlider: 40,
      buildingIds: ['research_lab', 'supercomputer'],
    });
    const planets: PlanetRPInput[] = [planet, planet, planet, planet, planet];
    expect(calculateEmpireTotalRP(planets, 'rats')).toBeCloseTo(375, 5);
  });

  it('no scientists → 0 RP', () => {
    const planet = makePlanet({ population: 100, researchSlider: 0 });
    expect(calculatePlanetRP(planet, 'hamsters')).toBe(0);
  });

  it('base case: no buildings, Hamsters → 1.0 RP per scientist', () => {
    // 10 scientists, no buildings, Hamsters (1.0 racial)
    const planet = makePlanet({ population: 100, researchSlider: 10, buildingIds: [] });
    // Scientists: 10, Lab: 1.0, Racial: 1.0
    // RP: 10 × 1.0 × 1.0 × 1.0 = 10
    expect(calculatePlanetRP(planet, 'hamsters')).toBeCloseTo(10, 5);
  });

  it('applies Artifacts World +25% bonus', () => {
    const planet = makePlanet({
      population: 100,
      researchSlider: 30,
      buildingIds: ['research_lab', 'supercomputer'],
      hasArtifacts: true,
    });
    // Base RP = 75, × 1.25 = 93.75
    expect(calculatePlanetRP(planet, 'hamsters')).toBeCloseTo(93.75, 5);
  });

  it('applies Orion +400% bonus (×4)', () => {
    const planet = makePlanet({
      population: 100,
      researchSlider: 30,
      buildingIds: ['research_lab', 'supercomputer'],
      isOrion: true,
    });
    // Base RP = 75, × 4.0 = 300
    expect(calculatePlanetRP(planet, 'hamsters')).toBeCloseTo(300, 5);
  });

  it('stacks Artifacts and Orion bonuses', () => {
    // Artifacts (×1.25) then Orion (×4.0)
    const planetOrion = makePlanet({
      population: 100,
      researchSlider: 30,
      buildingIds: ['research_lab', 'supercomputer'],
      hasArtifacts: true,
      isOrion: true,
    });
    // 75 × 1.25 × 4.0 = 375
    expect(calculatePlanetRP(planetOrion, 'hamsters')).toBeCloseTo(375, 5);
  });

  // ── researchMultiplier field path (ORION-FIX-007) ──────────────────────────
  // These tests verify the data-driven researchMultiplier path used by the
  // actual game state (buildPlanetRPInputs in turn.ts passes planet.researchMultiplier).
  // Without these, the boolean fallback was the only tested path.

  it('researchMultiplier=1.25 (Artifacts world data-driven path) applies +25% RP', () => {
    // This mirrors what buildPlanetRPInputs produces for an Artifacts world planet
    // galaxy.ts sets planet.researchMultiplier = 1.25 for Artifacts worlds
    const planet = makePlanet({
      population: 100,
      researchSlider: 30,
      buildingIds: ['research_lab', 'supercomputer'],
      hasArtifacts: true,
      researchMultiplier: 1.25,  // data-driven from planet state
    });
    // Scientists: 30, Lab: 2.5, Racial: 1.0 → base 75 RP
    // researchMultiplier path: 75 × 1.25 = 93.75
    expect(calculatePlanetRP(planet, 'hamsters')).toBeCloseTo(93.75, 5);
  });

  it('researchMultiplier=4.0 (Orion data-driven path) applies ×4 RP', () => {
    // galaxy.ts sets planet.researchMultiplier = 4.0 for Orion
    const planet = makePlanet({
      population: 100,
      researchSlider: 30,
      buildingIds: ['research_lab', 'supercomputer'],
      isOrion: true,
      researchMultiplier: 4.0,  // data-driven from planet state
    });
    // Base 75 RP × 4.0 = 300
    expect(calculatePlanetRP(planet, 'hamsters')).toBeCloseTo(300, 5);
  });

  it('researchMultiplier takes precedence over boolean flags when both set', () => {
    // If researchMultiplier is set AND hasArtifacts=true, researchMultiplier wins.
    // This matches calculatePlanetRP logic: researchMultiplier path is else'd over booleans.
    const planet = makePlanet({
      population: 100,
      researchSlider: 10,
      buildingIds: [],
      hasArtifacts: true,    // would be ×1.25 on boolean path
      researchMultiplier: 2.0,  // explicit override — should use this
    });
    // Scientists: 10, Lab: 1.0, Racial: 1.0 → base 10 RP
    // researchMultiplier=2.0 takes effect: 10 × 2.0 = 20
    expect(calculatePlanetRP(planet, 'hamsters')).toBeCloseTo(20, 5);
  });

  it('researchMultiplier=1.0 falls back to boolean flags (backwards compat)', () => {
    // When researchMultiplier is 1.0 (standard planet), the else branch fires.
    // hasArtifacts=true should still apply +25% via the boolean fallback.
    const planet = makePlanet({
      population: 100,
      researchSlider: 10,
      buildingIds: [],
      hasArtifacts: true,
      researchMultiplier: 1.0,  // standard planet multiplier
    });
    // Base 10 RP; researchMultiplier=1.0 → else branch → hasArtifacts ×1.25 = 12.5
    expect(calculatePlanetRP(planet, 'hamsters')).toBeCloseTo(12.5, 5);
  });

  it('Guinea Pigs racial modifier 0.80', () => {
    const planet = makePlanet({ population: 100, researchSlider: 10, buildingIds: [] });
    // 10 × 1.0 × 1.0 × 0.80 = 8
    expect(calculatePlanetRP(planet, 'guinea_pigs')).toBeCloseTo(8, 5);
  });

  it('throws for unknown raceId', () => {
    const planet = makePlanet();
    expect(() => calculatePlanetRP(planet, 'unknown_race' as never)).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Lab Multiplier
// ─────────────────────────────────────────────────────────────────────────────

describe('getLabMultiplier', () => {
  it('no buildings → 1.0', () => {
    expect(getLabMultiplier([])).toBe(1.0);
  });

  it('Research Lab → 1.5', () => {
    expect(getLabMultiplier(['research_lab'])).toBeCloseTo(1.5, 5);
  });

  it('Research Lab + Supercomputer → 2.5', () => {
    expect(getLabMultiplier(['research_lab', 'supercomputer'])).toBeCloseTo(2.5, 5);
  });

  it('Research Lab + Supercomputer + Autolab → 4.0', () => {
    expect(getLabMultiplier(['research_lab', 'supercomputer', 'autolab'])).toBeCloseTo(4.0, 5);
  });

  it('all four buildings → 6.0', () => {
    expect(
      getLabMultiplier(['research_lab', 'supercomputer', 'autolab', 'galactic_cybernet']),
    ).toBeCloseTo(6.0, 5);
  });

  it('ignores non-research building IDs', () => {
    // production or other buildings should not add to multiplier
    expect(getLabMultiplier(['research_lab', 'fusion_plant'])).toBeCloseTo(1.5, 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Racial Research Modifiers
// ─────────────────────────────────────────────────────────────────────────────

describe('getRacialResearchModifier', () => {
  const expected: Array<[string, number]> = [
    ['rats', 1.50],
    ['mice', 1.15],
    ['chameleons', 1.00],
    ['hamsters', 1.00],
    ['budgies', 1.00],
    ['ferrets', 1.00],
    ['hermit_crabs', 1.00],
    ['rabbits', 0.90],
    ['ants', 0.90],
    ['guinea_pigs', 0.80],
  ];

  for (const [race, mod] of expected) {
    it(`${race} → ${mod}`, () => {
      expect(getRacialResearchModifier(race as never)).toBeCloseTo(mod, 5);
    });
  }

  it('throws for unknown race', () => {
    expect(() => getRacialResearchModifier('klingons' as never)).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Tech Cost
// ─────────────────────────────────────────────────────────────────────────────

describe('getBaseTierCost', () => {
  const tierCosts: Array<[number, number]> = [
    [1, 50], [2, 80], [3, 150], [4, 250], [5, 500],
    [6, 800], [7, 1500], [8, 2500], [9, 4000], [10, 6000],
    [11, 8000], [12, 10000], [13, 14000], [14, 18000], [15, 24000],
    [16, 30000], [17, 40000], [18, 50000], [19, 70000], [20, 100000],
  ];

  for (const [tier, cost] of tierCosts) {
    it(`tier ${tier} → ${cost} RP`, () => {
      expect(getBaseTierCost(tier)).toBe(cost);
    });
  }

  it('throws for undefined tier', () => {
    expect(() => getBaseTierCost(21)).toThrow();
    expect(() => getBaseTierCost(0)).toThrow();
  });
});

describe('getGalaxySizeModifier', () => {
  it('small → 0.75', () => expect(getGalaxySizeModifier('small')).toBe(0.75));
  it('medium → 1.00', () => expect(getGalaxySizeModifier('medium')).toBe(1.00));
  it('large → 1.25', () => expect(getGalaxySizeModifier('large')).toBe(1.25));
  it('huge → 1.50', () => expect(getGalaxySizeModifier('huge')).toBe(1.50));
});

describe('getDifficultyAICostModifier', () => {
  it('simple → 1.50 (AI pays more)', () => expect(getDifficultyAICostModifier('simple')).toBe(1.50));
  it('easy → 1.25', () => expect(getDifficultyAICostModifier('easy')).toBe(1.25));
  it('average → 1.00', () => expect(getDifficultyAICostModifier('average')).toBe(1.00));
  it('hard → 0.75', () => expect(getDifficultyAICostModifier('hard')).toBe(0.75));
  it('impossible → 0.50 (AI pays half)', () => expect(getDifficultyAICostModifier('impossible')).toBe(0.50));
});

describe('getTechCost (player)', () => {
  it('Example 4: Tier 10, large galaxy → 7500 RP', () => {
    // Base: 6000, large: 1.25 → 7500
    expect(getTechCost(10, 'large')).toBe(7500);
  });

  it('tier 1, medium galaxy → 50 RP', () => {
    expect(getTechCost(1, 'medium')).toBe(50);
  });

  it('tier 5, small galaxy → 375 RP', () => {
    // 500 × 0.75 = 375
    expect(getTechCost(5, 'small')).toBe(375);
  });

  it('tier 20, huge galaxy → 150000 RP', () => {
    // 100000 × 1.50 = 150000
    expect(getTechCost(20, 'huge')).toBe(150000);
  });
});

describe('getTechCostAI', () => {
  it('tier 10, large, average → same as player (7500)', () => {
    expect(getTechCostAI(10, 'large', 'average')).toBe(7500);
  });

  it('tier 10, large, impossible → 3750 (half the cost)', () => {
    // 6000 × 1.25 × 0.50 = 3750
    expect(getTechCostAI(10, 'large', 'impossible')).toBe(3750);
  });

  it('tier 5, medium, simple → 750 (1.5× player cost)', () => {
    // 500 × 1.00 × 1.50 = 750
    expect(getTechCostAI(5, 'medium', 'simple')).toBe(750);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Field Allocation
// ─────────────────────────────────────────────────────────────────────────────

describe('isValidAllocation', () => {
  it('valid even split (all 6 fields)', () => {
    expect(isValidAllocation(makeAllocation())).toBe(true);
  });

  it('invalid: sums to 99', () => {
    const alloc = makeAllocation({ weapons: 19 }); // 19+20+20+20+10+10 = 99
    expect(isValidAllocation(alloc)).toBe(false);
  });

  it('invalid: negative value', () => {
    const alloc = makeAllocation({ weapons: -5, propulsion: 25 });
    // -5+25+20+20+10+10 = 80 – also fails sum check
    expect(isValidAllocation(alloc)).toBe(false);
  });

  it('valid: single field at 100%', () => {
    const alloc: ResearchAllocation = {
      weapons: 100,
      propulsion: 0,
      construction: 0,
      computers: 0,
      force_fields: 0,
      planetology: 0,
    };
    expect(isValidAllocation(alloc)).toBe(true);
  });
});

describe('allocateResearch', () => {
  it('correctly splits 300 RP with 20/20/20/20/10/10 allocation', () => {
    const alloc = makeAllocation();
    const result = allocateResearch(300, alloc);
    expect(result.weapons).toBeCloseTo(60, 5);
    expect(result.propulsion).toBeCloseTo(60, 5);
    expect(result.construction).toBeCloseTo(60, 5);
    expect(result.computers).toBeCloseTo(60, 5);
    expect(result.force_fields).toBeCloseTo(30, 5);
    expect(result.planetology).toBeCloseTo(30, 5);
  });

  it('single field gets all RP', () => {
    const alloc: ResearchAllocation = {
      weapons: 100,
      propulsion: 0,
      construction: 0,
      computers: 0,
      force_fields: 0,
      planetology: 0,
    };
    const result = allocateResearch(200, alloc);
    expect(result.weapons).toBe(200);
    expect(result.propulsion).toBe(0);
    expect(result.construction).toBe(0);
  });

  it('throws if allocation does not sum to 100', () => {
    const alloc = makeAllocation({ weapons: 0 }); // sums to 80
    expect(() => allocateResearch(100, alloc)).toThrow();
  });

  it('handles fractional RP correctly', () => {
    const alloc: ResearchAllocation = {
      weapons: 33.4,
      propulsion: 33.3,
      construction: 33.3,
      computers: 0,
      force_fields: 0,
      planetology: 0,
    };
    const result = allocateResearch(100, alloc);
    expect(result.weapons).toBeCloseTo(33.4, 5);
    expect(result.propulsion).toBeCloseTo(33.3, 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Miniaturization
// ─────────────────────────────────────────────────────────────────────────────

describe('getMiniaturizedStats', () => {
  it('Example 3: tier 12 vs tier 5, base 20/15 → 13/9.75', () => {
    const component: ComponentStats = { techTier: 5, baseSize: 20, baseCost: 15 };
    const result = getMiniaturizedStats(component, 12);
    // (12-5)×0.05 = 0.35 → size=13, cost=9.75
    expect(result.size).toBeCloseTo(13, 5);
    expect(result.cost).toBeCloseTo(9.75, 5);
    expect(result.reductionApplied).toBeCloseTo(0.35, 5);
  });

  it('design doc example: tier 8 vs tier 3, base 10/50 → 7.5/37.5', () => {
    const component: ComponentStats = { techTier: 3, baseSize: 10, baseCost: 50 };
    const result = getMiniaturizedStats(component, 8);
    // (8-3)×0.05 = 0.25
    expect(result.size).toBeCloseTo(7.5, 5);
    expect(result.cost).toBeCloseTo(37.5, 5);
    expect(result.reductionApplied).toBeCloseTo(0.25, 5);
  });

  it('caps at 50% reduction even with large tier gap', () => {
    const component: ComponentStats = { techTier: 1, baseSize: 20, baseCost: 100 };
    // tier 20 - tier 1 = 19 tiers → 19×0.05 = 0.95, capped at 0.50
    const result = getMiniaturizedStats(component, 20);
    expect(result.reductionApplied).toBeCloseTo(0.50, 5);
    expect(result.size).toBeCloseTo(10, 5);   // 20 × 0.5
    expect(result.cost).toBeCloseTo(50, 5);   // 100 × 0.5
  });

  it('no reduction when currentTier === techTier', () => {
    const component: ComponentStats = { techTier: 5, baseSize: 20, baseCost: 100 };
    const result = getMiniaturizedStats(component, 5);
    expect(result.reductionApplied).toBe(0);
    expect(result.size).toBe(20);
    expect(result.cost).toBe(100);
  });

  it('no reduction when currentTier < techTier (future tech)', () => {
    const component: ComponentStats = { techTier: 8, baseSize: 20, baseCost: 100 };
    const result = getMiniaturizedStats(component, 5);
    expect(result.reductionApplied).toBe(0);
    expect(result.size).toBe(20);
    expect(result.cost).toBe(100);
  });

  it('exactly 50% at 10-tier gap', () => {
    const component: ComponentStats = { techTier: 1, baseSize: 40, baseCost: 200 };
    // 10 tiers × 0.05 = 0.50 exactly → size=20, cost=100
    const result = getMiniaturizedStats(component, 11);
    expect(result.reductionApplied).toBeCloseTo(0.50, 5);
    expect(result.size).toBeCloseTo(20, 5);
    expect(result.cost).toBeCloseTo(100, 5);
  });

  it('one tier gap → 5% reduction', () => {
    const component: ComponentStats = { techTier: 3, baseSize: 10, baseCost: 20 };
    const result = getMiniaturizedStats(component, 4);
    expect(result.reductionApplied).toBeCloseTo(0.05, 5);
    expect(result.size).toBeCloseTo(9.5, 5);
    expect(result.cost).toBeCloseTo(19, 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Research progress tracking (applyResearchRP)
// ─────────────────────────────────────────────────────────────────────────────

describe('applyResearchRP', () => {
  function makeFields(overrides: Partial<EmpireFieldResearch> = {}): EmpireFieldResearch {
    const defaults = createDefaultFieldResearch();
    return { ...defaults, ...overrides };
  }

  it('accumulates RP without completion when below cost', () => {
    const fields = makeFields({
      weapons: {
        currentTechId: 'laser_cannon',
        currentTechTier: 1,
        progressRP: 0,
        currentTier: 0,
        completedTechs: [],
        pendingChoices: [],
      },
    });

    const fieldRP = makeAllocation();
    fieldRP.weapons = 20; // Tier 1 costs 50 in medium galaxy

    const { updatedFields, completions } = applyResearchRP(fields, fieldRP, 'medium', false);
    expect(completions).toHaveLength(0);
    expect(updatedFields.weapons.progressRP).toBeCloseTo(20, 5);
    expect(updatedFields.weapons.currentTechId).toBe('laser_cannon');
  });

  it('detects tech completion and carries overflow', () => {
    const fields = makeFields({
      weapons: {
        currentTechId: 'laser_cannon',
        currentTechTier: 1,
        progressRP: 40, // already 40 accumulated
        currentTier: 0,
        completedTechs: [],
        pendingChoices: [],
      },
    });

    // Add 20 more RP → total 60 ≥ tier 1 cost (50 in medium)
    const fieldRP: ResearchAllocation = {
      weapons: 20,
      propulsion: 0,
      construction: 0,
      computers: 0,
      force_fields: 0,
      planetology: 0,
    };

    const { updatedFields, completions } = applyResearchRP(fields, fieldRP, 'medium', false);

    expect(completions).toHaveLength(1);
    expect(completions[0].field).toBe('weapons');
    expect(completions[0].completedTechId).toBe('laser_cannon');
    expect(completions[0].overflowRP).toBeCloseTo(10, 5); // 60 - 50 = 10

    // Progress resets to overflow
    expect(updatedFields.weapons.progressRP).toBeCloseTo(10, 5);
    expect(updatedFields.weapons.currentTechId).toBeNull();
    expect(updatedFields.weapons.currentTier).toBe(1);
    expect(updatedFields.weapons.completedTechs).toContain('laser_cannon');
  });

  it('accumulates pending RP when no tech is targeted', () => {
    const fields = makeFields(); // all null currentTechId
    const fieldRP: ResearchAllocation = {
      weapons: 50,
      propulsion: 0,
      construction: 0,
      computers: 0,
      force_fields: 0,
      planetology: 0,
    };

    const { updatedFields, completions } = applyResearchRP(fields, fieldRP, 'medium', false);
    expect(completions).toHaveLength(0);
    expect(updatedFields.weapons.progressRP).toBeCloseTo(50, 5);
    expect(updatedFields.weapons.currentTechId).toBeNull();
  });

  it('applies AI cost modifier on impossible difficulty', () => {
    // Tier 1 player cost = 50; AI impossible cost = 50 × 1.00 × 0.50 = 25
    const fields = makeFields({
      weapons: {
        currentTechId: 'laser_cannon',
        currentTechTier: 1,
        progressRP: 20,
        currentTier: 0,
        completedTechs: [],
        pendingChoices: [],
      },
    });

    // 20 + 10 = 30 > 25 (AI cost), so should complete
    const fieldRP: ResearchAllocation = {
      weapons: 10,
      propulsion: 0,
      construction: 0,
      computers: 0,
      force_fields: 0,
      planetology: 0,
    };

    const { completions } = applyResearchRP(fields, fieldRP, 'medium', true, 'impossible');
    expect(completions).toHaveLength(1);
    expect(completions[0].overflowRP).toBeCloseTo(5, 5); // 30 - 25 = 5
  });

  it('does not mutate input fields', () => {
    const fields = makeFields({
      weapons: {
        currentTechId: 'laser',
        currentTechTier: 1,
        progressRP: 0,
        currentTier: 0,
        completedTechs: [],
        pendingChoices: [],
      },
    });
    const fieldRP: ResearchAllocation = {
      weapons: 30,
      propulsion: 0,
      construction: 0,
      computers: 0,
      force_fields: 0,
      planetology: 0,
    };

    applyResearchRP(fields, fieldRP, 'medium', false);
    // Input must be unchanged
    expect(fields.weapons.progressRP).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. processResearchTurn integration
// ─────────────────────────────────────────────────────────────────────────────

describe('processResearchTurn', () => {
  it('produces correct totalRP, fieldRP, and no completion on low RP', () => {
    const planets: PlanetRPInput[] = [
      makePlanet({ population: 100, researchSlider: 30, buildingIds: ['research_lab', 'supercomputer'] }),
    ];
    const fields = createDefaultFieldResearch();
    const alloc = makeAllocation(); // 20/20/20/20/10/10

    const result = processResearchTurn(planets, 'hamsters', alloc, fields, 'medium');

    expect(result.totalRP).toBeCloseTo(75, 5);
    expect(result.fieldRP.weapons).toBeCloseTo(15, 5);     // 75 × 0.20
    expect(result.fieldRP.propulsion).toBeCloseTo(15, 5);
    expect(result.fieldRP.force_fields).toBeCloseTo(7.5, 5); // 75 × 0.10
    expect(result.completions).toHaveLength(0);
  });

  it('Rats empire with 5 planets → 375 total RP', () => {
    const planet = makePlanet({
      population: 50,
      researchSlider: 40,
      buildingIds: ['research_lab', 'supercomputer'],
    });
    const fields = createDefaultFieldResearch();
    const alloc: ResearchAllocation = {
      weapons: 100,
      propulsion: 0,
      construction: 0,
      computers: 0,
      force_fields: 0,
      planetology: 0,
    };

    const result = processResearchTurn(
      [planet, planet, planet, planet, planet],
      'rats',
      alloc,
      fields,
      'medium',
    );

    expect(result.totalRP).toBeCloseTo(375, 5);
    expect(result.fieldRP.weapons).toBeCloseTo(375, 5);
  });

  it('detects completion when enough RP accumulates for tier 1 tech', () => {
    // 100 RP/turn on weapons, tier 1 costs 50 in medium galaxy
    const planet = makePlanet({ population: 100, researchSlider: 100, buildingIds: [] });
    // 100 × 1.0 × 1.0 × 1.0 = 100 RP with Hamsters

    let fields = createDefaultFieldResearch();
    fields = setResearchTarget(fields, 'weapons', 'laser_cannon', 1);

    const alloc: ResearchAllocation = {
      weapons: 100,
      propulsion: 0,
      construction: 0,
      computers: 0,
      force_fields: 0,
      planetology: 0,
    };

    const result = processResearchTurn([planet], 'hamsters', alloc, fields, 'medium');
    expect(result.completions).toHaveLength(1);
    expect(result.completions[0].field).toBe('weapons');
    expect(result.completions[0].overflowRP).toBeCloseTo(50, 5); // 100 - 50
  });

  it('zero planets → 0 total RP', () => {
    const fields = createDefaultFieldResearch();
    const alloc = makeAllocation();
    const result = processResearchTurn([], 'hamsters', alloc, fields, 'medium');
    expect(result.totalRP).toBe(0);
    for (const field of ALL_RESEARCH_FIELDS) {
      expect(result.fieldRP[field]).toBe(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. setResearchTarget
// ─────────────────────────────────────────────────────────────────────────────

describe('setResearchTarget', () => {
  it('sets tech target for a field without clearing progress', () => {
    let fields = createDefaultFieldResearch();
    // Manually give some progress
    fields = {
      ...fields,
      weapons: { ...fields.weapons, progressRP: 25 },
    };

    const updated = setResearchTarget(fields, 'weapons', 'laser_cannon', 1);
    expect(updated.weapons.currentTechId).toBe('laser_cannon');
    expect(updated.weapons.currentTechTier).toBe(1);
    expect(updated.weapons.progressRP).toBe(25); // preserved
  });

  it('does not mutate input fields', () => {
    const fields = createDefaultFieldResearch();
    setResearchTarget(fields, 'weapons', 'laser', 1);
    expect(fields.weapons.currentTechId).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. createDefaultFieldResearch
// ─────────────────────────────────────────────────────────────────────────────

describe('createDefaultFieldResearch', () => {
  it('creates zeroed state for all 6 fields', () => {
    const fields = createDefaultFieldResearch();
    for (const field of ALL_RESEARCH_FIELDS) {
      expect(fields[field].currentTechId).toBeNull();
      expect(fields[field].currentTechTier).toBeNull();
      expect(fields[field].progressRP).toBe(0);
      expect(fields[field].currentTier).toBe(0);
      expect(fields[field].completedTechs).toHaveLength(0);
      expect(fields[field].pendingChoices).toHaveLength(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. createEvenAllocation
// ─────────────────────────────────────────────────────────────────────────────

describe('createEvenAllocation', () => {
  it('produces an allocation that sums to 100', () => {
    const alloc = createEvenAllocation();
    expect(isValidAllocation(alloc)).toBe(true);
  });

  it('all 6 fields are represented', () => {
    const alloc = createEvenAllocation();
    for (const field of ALL_RESEARCH_FIELDS) {
      expect(alloc[field]).toBeGreaterThanOrEqual(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. Constants
// ─────────────────────────────────────────────────────────────────────────────

describe('constants', () => {
  it('BASE_RP_PER_SCIENTIST is 1.0', () => {
    expect(BASE_RP_PER_SCIENTIST).toBe(1.0);
  });

  it('MINIATURIZATION_RATE is 0.05', () => {
    expect(MINIATURIZATION_RATE).toBe(0.05);
  });

  it('MINIATURIZATION_MAX is 0.50', () => {
    expect(MINIATURIZATION_MAX).toBe(0.50);
  });

  it('ALL_RESEARCH_FIELDS has exactly 6 fields', () => {
    expect(ALL_RESEARCH_FIELDS).toHaveLength(6);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. Force Fields accelerated cost schedule (fix-13)
// Per design/technology/research-formulas.md §6 and design/technology/force-fields.md
// ─────────────────────────────────────────────────────────────────────────────

import {
  getTechBaseCostById,
  getTechTierById,
} from '../../../src/game/systems/research';

describe('getTechBaseCostById', () => {
  it('returns correct cost for a Weapons tech (laser_tech tier 1 = 50)', () => {
    expect(getTechBaseCostById('laser_tech')).toBe(50);
  });

  it('returns undefined for unknown tech ID', () => {
    expect(getTechBaseCostById('nonexistent_tech')).toBeUndefined();
  });
});

describe('getTechTierById', () => {
  it('returns correct tier for a Force Fields tech', () => {
    expect(getTechTierById('deflector_15_tech')).toBe(14);
  });

  it('returns undefined for unknown tech ID', () => {
    expect(getTechTierById('nonexistent_tech')).toBeUndefined();
  });
});

describe('Force Fields accelerated cost schedule (design/technology/force-fields.md)', () => {
  /**
   * Force Fields has 14 internal tiers but uses an accelerated RP cost schedule.
   * Per research-formulas.md §6:
   *   "Force Fields Tier 14 costs 50,000 RP (equivalent to global Tier 18), not 18,000 RP."
   *
   * This test ensures applyResearchRP uses the tech-specific cost, not the global tier table.
   */

  it('Force Fields Tier 14 tech (deflector_15_tech) costs 50000 RP, not 18000', () => {
    // Verify tech-tree.json has the correct cost
    const cost = getTechBaseCostById('deflector_15_tech');
    expect(cost).toBe(50000);

    // Confirm this differs from the global tier 14 cost (18000)
    expect(getBaseTierCost(14)).toBe(18000);
    expect(cost).not.toBe(getBaseTierCost(14));
  });

  it('Force Fields Tier 13 tech (deflector_14_tech) costs 30000 RP', () => {
    expect(getTechBaseCostById('deflector_14_tech')).toBe(30000);
    // Global tier 13 = 14000 RP
    expect(getBaseTierCost(13)).toBe(14000);
  });

  it('applyResearchRP uses tech-specific cost for Force Fields', () => {
    // Set up Force Fields research targeting tier 14 tech (50000 base cost)
    let fields = createDefaultFieldResearch();
    fields = setResearchTarget(fields, 'force_fields', 'deflector_15_tech', 14);
    // Pre-fill to 49999 RP (just under completion)
    fields = {
      ...fields,
      force_fields: { ...fields.force_fields, progressRP: 49999 },
    };

    // Add 2 RP → total 50001 ≥ 50000 → should complete
    const fieldRP: ResearchAllocation = {
      weapons: 0,
      propulsion: 0,
      construction: 0,
      computers: 0,
      force_fields: 2,
      planetology: 0,
    };

    const { completions, updatedFields } = applyResearchRP(fields, fieldRP, 'medium', false);

    expect(completions).toHaveLength(1);
    expect(completions[0].field).toBe('force_fields');
    expect(completions[0].completedTechId).toBe('deflector_15_tech');
    expect(completions[0].overflowRP).toBeCloseTo(1, 5); // 50001 - 50000 = 1
    expect(updatedFields.force_fields.progressRP).toBeCloseTo(1, 5);
  });

  it('would NOT complete with global tier 14 cost (18000)', () => {
    // If we used global tier cost (18000), 18500 RP would complete.
    // With correct accelerated cost (50000), it should NOT complete.
    let fields = createDefaultFieldResearch();
    fields = setResearchTarget(fields, 'force_fields', 'deflector_15_tech', 14);
    fields = {
      ...fields,
      force_fields: { ...fields.force_fields, progressRP: 18500 },
    };

    const fieldRP: ResearchAllocation = {
      weapons: 0,
      propulsion: 0,
      construction: 0,
      computers: 0,
      force_fields: 0,
      planetology: 0,
    };

    const { completions } = applyResearchRP(fields, fieldRP, 'medium', false);

    // Should NOT complete because 18500 < 50000
    expect(completions).toHaveLength(0);
  });

  it('galaxy size modifier applies to Force Fields tech cost', () => {
    // Huge galaxy: 50000 × 1.5 = 75000 RP
    let fields = createDefaultFieldResearch();
    fields = setResearchTarget(fields, 'force_fields', 'deflector_15_tech', 14);
    fields = {
      ...fields,
      force_fields: { ...fields.force_fields, progressRP: 74999 },
    };

    const fieldRP: ResearchAllocation = {
      weapons: 0,
      propulsion: 0,
      construction: 0,
      computers: 0,
      force_fields: 2,
      planetology: 0,
    };

    const { completions } = applyResearchRP(fields, fieldRP, 'huge', false);

    expect(completions).toHaveLength(1);
    expect(completions[0].overflowRP).toBeCloseTo(1, 5); // 75001 - 75000 = 1
  });

  it('AI difficulty modifier applies to Force Fields tech cost', () => {
    // Impossible AI: 50000 × 1.0 (medium) × 0.5 = 25000 RP
    let fields = createDefaultFieldResearch();
    fields = setResearchTarget(fields, 'force_fields', 'deflector_15_tech', 14);
    fields = {
      ...fields,
      force_fields: { ...fields.force_fields, progressRP: 24999 },
    };

    const fieldRP: ResearchAllocation = {
      weapons: 0,
      propulsion: 0,
      construction: 0,
      computers: 0,
      force_fields: 2,
      planetology: 0,
    };

    const { completions } = applyResearchRP(fields, fieldRP, 'medium', true, 'impossible');

    expect(completions).toHaveLength(1);
    expect(completions[0].overflowRP).toBeCloseTo(1, 5); // 25001 - 25000 = 1
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. Edge cases
// ─────────────────────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('research slider at exactly 100% → all population are scientists', () => {
    const planet = makePlanet({ population: 50, researchSlider: 100, buildingIds: [] });
    // 50 × 1.0 × 1.0 × 1.0 = 50
    expect(calculatePlanetRP(planet, 'hamsters')).toBeCloseTo(50, 5);
  });

  it('miniaturization: tier difference exactly at 10 → exactly 50% reduction', () => {
    const component: ComponentStats = { techTier: 5, baseSize: 100, baseCost: 200 };
    const result = getMiniaturizedStats(component, 15);
    // (15-5)×0.05 = 0.50 → exactly at cap
    expect(result.reductionApplied).toBeCloseTo(0.50, 5);
    expect(result.size).toBeCloseTo(50, 5);
    expect(result.cost).toBeCloseTo(100, 5);
  });

  it('allocateResearch with zero totalRP produces zero per field', () => {
    const alloc = makeAllocation();
    const result = allocateResearch(0, alloc);
    for (const field of ALL_RESEARCH_FIELDS) {
      expect(result[field]).toBe(0);
    }
  });

  // ─── Tech Prerequisite Enforcement (ORION-FIX-012) ─────────────────────────

describe('Tech prerequisite enforcement', () => {
  // battle_computer_2_tech requires battle_computer_1_tech (from tech-tree.json)
  const PREREQ_TECH = 'battle_computer_1_tech';
  const CHAIN_TECH  = 'battle_computer_2_tech';
  const FREE_TECH   = 'laser_tech'; // tier 1, no prerequisite

  describe('getTechPrerequisite', () => {
    it('returns undefined for techs with no prerequisite', () => {
      expect(getTechPrerequisite(FREE_TECH)).toBeUndefined();
    });

    it('returns the prereq ID for chained techs', () => {
      expect(getTechPrerequisite(CHAIN_TECH)).toBe(PREREQ_TECH);
    });

    it('returns undefined for an unknown tech ID', () => {
      expect(getTechPrerequisite('nonexistent_tech')).toBeUndefined();
    });
  });

  describe('isTechResearchable', () => {
    it('allows a tech with no prerequisite when not completed', () => {
      expect(isTechResearchable(FREE_TECH, [])).toBe(true);
    });

    it('blocks a tech that is already completed', () => {
      expect(isTechResearchable(FREE_TECH, [FREE_TECH])).toBe(false);
    });

    it('blocks a chained tech when its prerequisite is not completed', () => {
      expect(isTechResearchable(CHAIN_TECH, [])).toBe(false);
    });

    it('blocks a chained tech when completed list omits the prereq', () => {
      // some other completed tech shouldn't unlock it
      expect(isTechResearchable(CHAIN_TECH, [FREE_TECH])).toBe(false);
    });

    it('allows a chained tech when its prerequisite is completed', () => {
      expect(isTechResearchable(CHAIN_TECH, [PREREQ_TECH])).toBe(true);
    });

    it('blocks a chained tech that is itself already completed', () => {
      expect(isTechResearchable(CHAIN_TECH, [PREREQ_TECH, CHAIN_TECH])).toBe(false);
    });

    it('accepts a ReadonlySet as completedTechs', () => {
      const done = new Set([PREREQ_TECH]);
      expect(isTechResearchable(CHAIN_TECH, done)).toBe(true);
    });
  });

  describe('getResearchableForField', () => {
    it('returns techs with met prerequisites', () => {
      const researchable = getResearchableForField('computers', [PREREQ_TECH]);
      const ids = researchable.map((t) => t.id);
      // CHAIN_TECH is now unlocked because PREREQ_TECH is done
      expect(ids).toContain(CHAIN_TECH);
    });

    it('excludes techs whose prerequisite is unmet', () => {
      const researchable = getResearchableForField('computers', []);
      const ids = researchable.map((t) => t.id);
      expect(ids).not.toContain(CHAIN_TECH);
    });

    it('excludes techs that are already completed', () => {
      const researchable = getResearchableForField('computers', [PREREQ_TECH, CHAIN_TECH]);
      const ids = researchable.map((t) => t.id);
      expect(ids).not.toContain(CHAIN_TECH);
      expect(ids).not.toContain(PREREQ_TECH);
    });
  });

  describe('setResearchTarget with prerequisite validation', () => {
    it('allows selecting a tech with no prerequisite', () => {
      const fields = createDefaultFieldResearch();
      const updated = setResearchTarget(fields, 'weapons', FREE_TECH, 1, []);
      expect(updated.weapons.currentTechId).toBe(FREE_TECH);
    });

    it('allows selecting a chained tech when prereq is done', () => {
      const fields = createDefaultFieldResearch();
      const updated = setResearchTarget(fields, 'computers', CHAIN_TECH, 2, [PREREQ_TECH]);
      expect(updated.computers.currentTechId).toBe(CHAIN_TECH);
    });

    it('throws when selecting a chained tech whose prereq is missing', () => {
      const fields = createDefaultFieldResearch();
      expect(() =>
        setResearchTarget(fields, 'computers', CHAIN_TECH, 2, []),
      ).toThrow(/prerequisite/);
    });

    it('throws mentioning the prereq ID in the error message', () => {
      const fields = createDefaultFieldResearch();
      expect(() =>
        setResearchTarget(fields, 'computers', CHAIN_TECH, 2, []),
      ).toThrow(PREREQ_TECH);
    });

    it('skips validation when completedTechs is omitted (backwards-compat)', () => {
      // Omitting completedTechs bypasses the check — should not throw.
      const fields = createDefaultFieldResearch();
      const updated = setResearchTarget(fields, 'computers', CHAIN_TECH, 2);
      expect(updated.computers.currentTechId).toBe(CHAIN_TECH);
    });
  });
});

it('multiple fields complete in the same turn', () => {
    // Set up all 6 fields close to completion, add enough RP to complete several
    let fields = createDefaultFieldResearch();
    for (const field of ALL_RESEARCH_FIELDS) {
      fields = setResearchTarget(fields, field, `${field}_tech`, 1);
      // Pre-fill to just 1 RP below threshold (tier 1 = 50 RP, medium)
      fields = {
        ...fields,
        [field]: { ...fields[field], progressRP: 49 },
      };
    }

    // Add 2 RP per field → all should complete (49+2=51 > 50)
    const fieldRP: ResearchAllocation = {
      weapons: 2,
      propulsion: 2,
      construction: 2,
      computers: 2,
      force_fields: 2,
      planetology: 2,
    };

    const { completions } = applyResearchRP(fields, fieldRP, 'medium', false);
    expect(completions).toHaveLength(6);
    // Each has 1 RP overflow
    for (const c of completions) {
      expect(c.overflowRP).toBeCloseTo(1, 5);
    }
  });
});
