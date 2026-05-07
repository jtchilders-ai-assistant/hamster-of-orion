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
  calculateScrapValue,
  calculateRefitCost,
  calculateRefitTime,
  calculateShipMaintenance,
  calculateFleetMaintenance,
  ScrapLocation,
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

describe('Ship Scrap Value (ship-costs.md §9)', () => {
  it('calculates 25% at friendly planet', () => {
    // Per design: At friendly planet = 25%
    expect(calculateScrapValue(1000, 'friendly')).toBe(250);
    expect(calculateScrapValue(400, 'friendly')).toBe(100);
  });

  it('calculates 35% at shipyard world', () => {
    // Per design: At shipyard world = 35%
    expect(calculateScrapValue(1000, 'shipyard')).toBe(350);
  });

  it('calculates 10% in enemy territory', () => {
    // Per design: In enemy territory = 10%
    expect(calculateScrapValue(1000, 'enemy_territory')).toBe(100);
  });

  it('calculates 15% for damaged ships regardless of location', () => {
    // Per design: Damaged ship (< 50% HP) = 15%
    expect(calculateScrapValue(1000, 'friendly', true)).toBe(150);
    expect(calculateScrapValue(1000, 'shipyard', true)).toBe(150);
  });
});

describe('Ship Refitting (ship-costs.md §11-12)', () => {
  it('calculates 50% of cost difference for upgrades', () => {
    // Per design: Refit_Cost = (New_Cost - Old_Cost) × 0.50
    // Example: 600 BC → 400 BC = 200 BC difference × 0.50 = 100 BC
    const result = calculateRefitCost(400, 600, 'medium', 'medium');
    expect(result.valid).toBe(true);
    expect(result.refitCost).toBe(100);
  });

  it('returns 0 cost for downgrades (no refund)', () => {
    // Per design: Minimum Refit Cost = 0 BC (if new design is cheaper, no refund)
    const result = calculateRefitCost(600, 400, 'medium', 'medium');
    expect(result.valid).toBe(true);
    expect(result.refitCost).toBe(0);
  });

  it('rejects hull class changes', () => {
    // Per design: Cannot change hull size
    const result = calculateRefitCost(100, 500, 'small', 'large');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Cannot refit');
  });

  it('respects no_refit_costs ability (Mice)', () => {
    // Per design: Mice can refit for free
    const result = calculateRefitCost(400, 600, 'medium', 'medium', true);
    expect(result.valid).toBe(true);
    expect(result.refitCost).toBe(0);
  });

  it('calculates refit time based on production', () => {
    // Per design: Refit_Time = ceil(Refit_Cost / Planet_Production_Per_Turn)
    // Minimum 1 turn
    expect(calculateRefitTime(100, 50)).toBe(2);  // 100/50 = 2 turns
    expect(calculateRefitTime(100, 100)).toBe(1); // 100/100 = 1 turn
    expect(calculateRefitTime(0, 50)).toBe(1);    // No cost = minimum 1 turn
    expect(calculateRefitTime(100, 0)).toBe(Infinity); // No production = infinite
  });
});

describe('Ship Maintenance (ship-costs.md §5-7)', () => {
  it('calculates 2% of construction cost', () => {
    // Per design: Ship_Maintenance = Ship_Cost × 0.02
    const ctx = { ...DEFAULT_PRODUCTION_CONTEXT, racialMaintenanceModifier: 1.0, fleetLogisticsModifiers: [] };
    expect(calculateShipMaintenance(100, ctx)).toBe(2);  // 100 × 0.02 = 2
    expect(calculateShipMaintenance(500, ctx)).toBe(10); // 500 × 0.02 = 10
  });

  it('enforces minimum 1 BC per ship', () => {
    // Per design: Minimum Maintenance = 1 BC per ship
    const ctx = { ...DEFAULT_PRODUCTION_CONTEXT, racialMaintenanceModifier: 1.0, fleetLogisticsModifiers: [] };
    expect(calculateShipMaintenance(20, ctx)).toBe(1); // 20 × 0.02 = 0.4 → minimum 1
  });

  it('applies racial maintenance modifier', () => {
    // Per design: Ants = 0.75 (25% less)
    const antsCtx = { ...DEFAULT_PRODUCTION_CONTEXT, racialMaintenanceModifier: 0.75, fleetLogisticsModifiers: [] };
    expect(calculateShipMaintenance(1000, antsCtx)).toBe(15); // 1000 × 0.02 × 0.75 = 15
  });

  it('applies fleet logistics tech modifiers multiplicatively', () => {
    // Per design: Fleet Logistics I-III stack multiplicatively
    // With all three: 0.90 × 0.80 × 0.70 = 0.504
    const ctx = {
      ...DEFAULT_PRODUCTION_CONTEXT,
      racialMaintenanceModifier: 1.0,
      fleetLogisticsModifiers: [0.90, 0.80, 0.70],
    };
    // 1000 × 0.02 = 20, then × 0.9 × 0.8 × 0.7 = 10.08 → floor = 10
    expect(calculateShipMaintenance(1000, ctx)).toBe(10);
  });

  it('calculates total fleet maintenance', () => {
    const ctx = { ...DEFAULT_PRODUCTION_CONTEXT, racialMaintenanceModifier: 1.0, fleetLogisticsModifiers: [] };
    const fleet = [
      { cost: 100, count: 10 },  // 2 BC each × 10 = 20 BC
      { cost: 500, count: 5 },   // 10 BC each × 5 = 50 BC
    ];
    expect(calculateFleetMaintenance(fleet, ctx)).toBe(70);
  });
});
