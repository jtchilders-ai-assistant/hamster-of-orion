/**
 * Production system tests.
 * test/game/systems/production.test.ts
 */

import { describe, it, expect } from 'vitest';
import { calculateBaseProduction, getRichnessMultiplier, distributeProduction } from '../../../src/game/systems/production';
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
    };

    const output = calculateBaseProduction(planet);
    // 40 factories * 1.0 + 50 pop * 0.5 = 40 + 25 = 65
    expect(output).toBe(65);
  });

  it('applies richness multiplier correctly', () => {
    const richPlanet = { isRich: true, isPoor: false } as Planet;
    const poorPlanet = { isRich: false, isPoor: true } as Planet;
    const normalPlanet = { isRich: false, isPoor: false } as Planet;

    expect(getRichnessMultiplier(richPlanet)).toBe(1.5);
    expect(getRichnessMultiplier(poorPlanet)).toBe(0.75);
    expect(getRichnessMultiplier(normalPlanet)).toBe(1.0);
  });

  it('distributes production according to sliders', () => {
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
    };

    const output = distributeProduction(planet);
    const total = calculateBaseProduction(planet);
    
    expect(output.ship).toBeCloseTo(total * 0.5);
    expect(output.defense).toBe(0);
    expect(output.industry).toBeCloseTo(total * 0.25);
    expect(output.ecology).toBe(0);
    expect(output.research).toBeCloseTo(total * 0.25);
  });
});
