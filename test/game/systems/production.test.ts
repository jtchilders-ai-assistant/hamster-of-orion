/**
 * Production system tests.
 * test/game/systems/production.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  calculateBaseProduction,
  getRichnessMultiplier,
  allocateSliders,
  calculateNetProduction,
  DEFAULT_PRODUCTION_CONTEXT,
} from '../../../src/game/systems/production';
import { Planet } from '../../../src/game/state';

describe('Production System', () => {
  it('calculates base production correctly', () => {
    const planet: Planet = {
      id: 'p1',
      name: 'Test',
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
      factories: 40,
      maxFactories: 50,
      waste: 0,
      production: { ship: 20, defense: 20, industry: 20, ecology: 20, research: 20 },
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
    };

    const output = calculateBaseProduction(planet);
    // With TECH slider at 20%, active pop = 50 × 0.8 = 40
    // Factory: 40 × 1.0 = 40 BC
    // Pop (TL1): 40 × 0.53 = 21.2 BC
    // Gross: 61.2 BC
    // Pollution: 40 factories × 1.0 waste = 40 units
    // Cleanup: 40 × 0.5 × 1.0 = 20 BC
    // Net: floor(61.2 - 20) = 41 BC
    expect(output).toBe(41);
  });

  it('applies richness multiplier correctly', () => {
    const richPlanet = { isRich: true, isPoor: false, resourceLevel: 'rich' } as Planet;
    const poorPlanet = { isRich: false, isPoor: true, resourceLevel: 'poor' } as Planet;
    const normalPlanet = { isRich: false, isPoor: false, resourceLevel: 'normal' } as Planet;

    expect(getRichnessMultiplier(richPlanet)).toBe(2.0);
    expect(getRichnessMultiplier(poorPlanet)).toBe(0.5);
    expect(getRichnessMultiplier(normalPlanet)).toBe(1.0);
  });

  it('allocates production according to sliders (modern API)', () => {
    const planet: Planet = {
      id: 'p1',
      name: 'Test',
      systemId: 's1',
      orbit: 1,
      type: 'terran',
      size: 'medium',
      gravity: 1.0,
      ownerId: 'player',
      isColonized: true,
      isHomeworld: false,
      population: 100,
      maxPopulation: 100,
      growthRate: 0.02,
      morale: 'content',
      factories: 100,
      maxFactories: 100,
      waste: 0,
      // TECH at 25% diverts pop from labor; SHIP/DEF/IND/ECO split the remaining
      // net production. Here: SHIP=50, IND=25, ECO=0, DEF=0 (sum=75, renormalizes)
      production: { ship: 50, defense: 0, industry: 25, ecology: 0, research: 25 },
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
    };

    const netResult = calculateNetProduction(planet, DEFAULT_PRODUCTION_CONTEXT);
    const allocation = allocateSliders(planet, netResult.netProduction, DEFAULT_PRODUCTION_CONTEXT);
    
    // Non-TECH sliders: ship=50, def=0, ind=25, eco=0 (total 75).
    // Renormalized: ship=66.7%, ind=33.3%
    // Ship should get ~2/3 of net, industry ~1/3.
    const netProd = netResult.netProduction;
    expect(allocation.ship).toBeCloseTo(Math.floor(netProd * (50 / 75)), 0);
    expect(allocation.defense).toBe(0);
    expect(allocation.industry).toBeCloseTo(Math.floor(netProd * (25 / 75)), 0);
    expect(allocation.ecology).toBe(0);
    // TECH generates RP from scientists (population × 25% = 25 scientists × 1.0 = 25 RP)
    expect(allocation.techRP).toBeCloseTo(25, 0);
  });
});
