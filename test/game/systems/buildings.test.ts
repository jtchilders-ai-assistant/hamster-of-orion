/**
 * Buildings system tests.
 * test/game/systems/buildings.test.ts
 *
 * Tests:
 *   1. DEF production accumulates toward the building queue
 *   2. Building completes when cost is fully accumulated
 *   3. Maintenance costs calculated correctly
 *   4. Available buildings filtered by tech level
 *   5. Building effects applied (missile bases, planetary shields)
 *
 * Note: MOO1 doesn't have discrete "buildings" like later 4X games.
 * Infrastructure (missile bases, planetary shields) is built via the DEF
 * slider allocation. There are no separate building queues.
 */

import { describe, it, expect } from 'vitest';
import {
  accumulateBuildingProgress,
  processBuildingConstruction,
  applyBuildingEffects,
  calculateBuildingMaintenance,
  getAvailableBuildings,
  processAllBuildingConstruction,
} from '../../../src/game/systems/buildings';
import type {
  GameState,
  Planet,
  Empire,
  ResearchState,
} from '../../../src/game/state';

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

function makeResearchState(completedTechs: string[] = []): ResearchState {
  return {
    currentTech: null,
    researchPoints: 0,
    researchPerTurn: 0,
    completedTechs,
    availableTechs: {
      weapons: [],
      propulsion: [],
      construction: [],
      computers: [],
      force_fields: [],
      biotechnology: [],
    },
    miniaturization: {},
    stolenTechs: [],
  };
}

function makeEmpire(id = 'empire1', completedTechs: string[] = []): Empire {
  return {
    id,
    raceId: 'hamsters',
    name: 'Test Empire',
    isPlayer: true,
    credits: 500,
    creditPerTurn: 10,
    planets: ['p1'],
    fleets: [],
    shipDesigns: [],
    research: makeResearchState(completedTechs),
    relations: {},
    isDefeated: false,
    defeatedTurn: null,
  };
}

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
    factories: 40,
    maxFactories: 50,
    waste: 0,
    production: { ship: 0, defense: 50, industry: 25, ecology: 25, research: 0 },
    buildQueue: [],
    buildings: [],
    missileBases: 0,
    maxMissileBases: 10,
    planetaryShield: 0,
    isRich: false,
    isPoor: false,
    isGaia: false,
    hasArtifacts: false,
    currentDesignId: null,
    shipyardProgress: 0,
    resourceLevel: 'normal',
    researchMultiplier: 1.0,
    startingPopulation: null,
    startingFactories: null,
    ...overrides,
  };
}

function makeMinimalState(
  planets: Planet[] = [],
  empires: Empire[] = [],
): GameState {
  const planetsById = Object.fromEntries(planets.map((p) => [p.id, p]));
  const empiresById = Object.fromEntries(empires.map((e) => [e.id, e]));

  return {
    version: '0.1.0',
    seed: 'test',
    turn: 1,
    year: 2624, // 2623 + 1 per design doc
    difficulty: 'normal',
    isPaused: false,
    gameSpeed: 'normal',
    currentScreen: 'galaxy',
    victoryCondition: null,
    defeatedTurn: null,
    createdAt: 0,
    lastPlayed: 0,
    playTime: 0,
    galaxy: {
      id: 'g1',
      size: 'small',
      shape: 'spiral',
      width: 1000,
      height: 1000,
      systemCount: 0,
      systems: { byId: {}, allIds: [] },
      quadTree: {
        bounds: { x: 0, y: 0, width: 1000, height: 1000 },
        systemIds: [],
        children: null,
      },
      nebulae: [],
      clusters: [],
      artifactsSystemIds: [],
      orionSystemId: 'orion',
      homeSystemIds: {},
      fogOfWar: {},
    },
    planets: {
      byId: planetsById,
      allIds: planets.map((p) => p.id),
    },
    fleets: { byId: {}, allIds: [] },
    ships: { byId: {}, allIds: [] },
    shipDesigns: { byId: {}, allIds: [] },
    empires: {
      byId: empiresById,
      allIds: empires.map((e) => e.id),
      playerId: empires[0]?.id ?? 'empire1',
    },
    combats: { byId: {}, allIds: [], activeCombatId: null },
    aiEmpires: {},
    highCouncil: null,
    ui: {
      currentScreen: 'galaxy',
      previousScreen: null,
      selectedSystem: null,
      selectedPlanet: null,
      selectedFleet: null,
      selectedShip: null,
      camera: { x: 0, y: 0, zoom: 1, target: null },
      modals: {
        shipDesigner: { open: false },
        diplomacy: { open: false },
        combat: { open: false },
        victory: { open: false },
      },
      notifications: [],
      filters: { planetsSort: 'name', fleetsFilter: 'all' },
      settings: {
        masterVolume: 1,
        musicVolume: 1,
        sfxVolume: 1,
        ambientVolume: 1,
        particleEffects: true,
        animationSpeed: 'normal',
        showGrid: false,
        autosave: true,
        autosaveFrequency: 5,
        autoEndTurn: false,
        confirmEndTurn: true,
        showTutorials: true,
        colorBlindMode: false,
        textSize: 14,
        highContrast: false,
        screenReaderEnabled: false,
        customHotkeys: {},
        quickCombat: false,
      },
    },
  };
}

/**
 * Helper: planet with a missile base queued, partially paid.
 *
 * Design Reference: design/economy/slider-mathematics.md
 *   Missile Base Cost: Base 100 BC (reduced by Construction tech)
 */
function planetWithMissileBaseQueued(costRemaining: number): Planet {
  return makePlanet({
    buildQueue: [
      {
        type: 'defense',
        targetId: 'missile_base',
        targetName: 'Missile Base',
        costTotal: 100, // design/economy/slider-mathematics.md: Base 100 BC
        costRemaining,
        turnsRemaining: 1,
      },
    ],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. DEF production accumulates toward building queue
// ─────────────────────────────────────────────────────────────────────────────

describe('DEF production accumulates toward building queue', () => {
  it('reduces costRemaining by the DEF BC applied', () => {
    const planet = planetWithMissileBaseQueued(100); // 100 BC base cost per slider-mathematics.md
    const state = makeMinimalState([planet], [makeEmpire()]);

    const result = accumulateBuildingProgress(state, 'p1', 50);
    const updatedPlanet = result.state.planets.byId['p1'];

    expect(updatedPlanet.buildQueue[0].costRemaining).toBe(50);
    expect(result.overflow).toBe(0);
  });

  it('accumulates across multiple turns (partial payments)', () => {
    const planet = planetWithMissileBaseQueued(100); // 100 BC base cost
    const empire = makeEmpire();
    let state = makeMinimalState([planet], [empire]);

    // Turn 1: pay 40
    let result = accumulateBuildingProgress(state, 'p1', 40);
    state = result.state;
    expect(state.planets.byId['p1'].buildQueue[0].costRemaining).toBe(60);

    // Turn 2: pay 40 more
    result = accumulateBuildingProgress(state, 'p1', 40);
    state = result.state;
    expect(state.planets.byId['p1'].buildQueue[0].costRemaining).toBe(20);
  });

  it('does not go below zero costRemaining', () => {
    const planet = planetWithMissileBaseQueued(30);
    const state = makeMinimalState([planet], [makeEmpire()]);

    // Pay 200 BC (way more than the 30 remaining)
    const result = accumulateBuildingProgress(state, 'p1', 200);
    const updatedPlanet = result.state.planets.byId['p1'];

    // costRemaining should be 0 and building removed (complete)
    expect(updatedPlanet.buildQueue).toHaveLength(0);
    expect(updatedPlanet.missileBases).toBe(1);
    // Overflow: 200 paid - 30 needed = 170 BC
    expect(result.overflow).toBe(170);
  });

  it('no-ops when build queue is empty', () => {
    const planet = makePlanet({ buildQueue: [] });
    const state = makeMinimalState([planet], [makeEmpire()]);

    const result = accumulateBuildingProgress(state, 'p1', 100);
    expect(result.state).toBe(state); // same reference — pure no-op
    // All BC overflows when queue is empty
    expect(result.overflow).toBe(100);
  });

  it('no-ops for uncolonized planets', () => {
    const planet = makePlanet({ isColonized: false, ownerId: null });
    const state = makeMinimalState([planet], [makeEmpire()]);

    const result = accumulateBuildingProgress(state, 'p1', 100);
    expect(result.state).toBe(state);
    expect(result.overflow).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Building completes when cost fully accumulated
// ─────────────────────────────────────────────────────────────────────────────

describe('Building completes when cost accumulated', () => {
  it('missile base is added when fully paid (design/economy/slider-mathematics.md: 100 BC)', () => {
    const planet = planetWithMissileBaseQueued(100);
    const state = makeMinimalState([planet], [makeEmpire()]);

    const result = accumulateBuildingProgress(state, 'p1', 100);
    const updatedPlanet = result.state.planets.byId['p1'];

    expect(updatedPlanet.missileBases).toBe(1);
    expect(updatedPlanet.buildQueue).toHaveLength(0);
    expect(result.overflow).toBe(0);
  });

  it('missile base count increments (multiple bases)', () => {
    // Planet already has 2 bases; build a 3rd
    const planet = makePlanet({
      missileBases: 2,
      buildQueue: [
        {
          type: 'defense',
          targetId: 'missile_base',
          targetName: 'Missile Base',
          costTotal: 100, // design/economy/slider-mathematics.md: Base 100 BC
          costRemaining: 0, // already fully paid
          turnsRemaining: 0,
        },
      ],
    });
    const state = makeMinimalState([planet], [makeEmpire()]);

    // processBuildingConstruction directly (costRemaining already 0)
    const nextState = processBuildingConstruction(state, planet);
    expect(nextState.planets.byId['p1'].missileBases).toBe(3);
  });

  it('planetary shield is set when shield building completes', () => {
    const planet = makePlanet({
      buildQueue: [
        {
          type: 'defense',
          targetId: 'planetary_shield_5',
          targetName: 'Planetary Shield V',
          costTotal: 500,
          costRemaining: 0,
          turnsRemaining: 0,
        },
      ],
    });
    const empire = makeEmpire('empire1', ['planetary_5_tech']);
    const state = makeMinimalState([planet], [empire]);

    const nextState = processBuildingConstruction(state, planet);
    expect(nextState.planets.byId['p1'].planetaryShield).toBe(5);
  });

  it('build queue is cleared after building completes', () => {
    const planet = planetWithMissileBaseQueued(100);
    const state = makeMinimalState([planet], [makeEmpire()]);

    const result = accumulateBuildingProgress(state, 'p1', 100);
    expect(result.state.planets.byId['p1'].buildQueue).toHaveLength(0);
  });

  it('processAllBuildingConstruction completes buildings across all planets', () => {
    const planet1 = makePlanet({
      id: 'p1',
      buildQueue: [
        {
          type: 'defense',
          targetId: 'missile_base',
          targetName: 'Missile Base',
          costTotal: 100, // design/economy/slider-mathematics.md: Base 100 BC
          costRemaining: 100,
          turnsRemaining: 1,
        },
      ],
    });
    const planet2 = makePlanet({
      id: 'p2',
      buildQueue: [
        {
          type: 'defense',
          targetId: 'missile_base',
          targetName: 'Missile Base',
          costTotal: 100, // design/economy/slider-mathematics.md: Base 100 BC
          costRemaining: 100,
          turnsRemaining: 1,
        },
      ],
    });
    const empire = makeEmpire();
    const state = makeMinimalState([planet1, planet2], [empire]);

    const result = processAllBuildingConstruction(state, { p1: 100, p2: 100 });

    expect(result.state.planets.byId['p1'].missileBases).toBe(1);
    expect(result.state.planets.byId['p2'].missileBases).toBe(1);
    expect(result.overflowByEmpire).toEqual({});
  });

  it('processAllBuildingConstruction returns overflow grouped by empire', () => {
    const planet1 = makePlanet({
      id: 'p1',
      ownerId: 'empire1',
      buildQueue: [
        {
          type: 'defense',
          targetId: 'missile_base',
          targetName: 'Missile Base',
          costTotal: 100, // design/economy/slider-mathematics.md: Base 100 BC
          costRemaining: 40, // only 40 BC needed
          turnsRemaining: 1,
        },
      ],
    });
    const empire = makeEmpire();
    const state = makeMinimalState([planet1], [empire]);

    // Pay 100 BC when only 40 needed → 60 BC overflow
    const result = processAllBuildingConstruction(state, { p1: 100 });

    expect(result.state.planets.byId['p1'].missileBases).toBe(1);
    expect(result.overflowByEmpire).toEqual({ empire1: 60 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Maintenance costs calculated correctly
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateBuildingMaintenance', () => {
  it('returns 0 for a planet with no buildings', () => {
    const planet = makePlanet({ buildings: [], planetaryShield: 0 });
    expect(calculateBuildingMaintenance(planet)).toBe(0);
  });

  it('returns correct maintenance for a planetary shield V (5 BC/turn)', () => {
    // Shield V is tracked via planetaryShield = 5, not in buildings list
    const planet = makePlanet({ buildings: [], planetaryShield: 5 });
    expect(calculateBuildingMaintenance(planet)).toBe(5);
  });

  it('returns correct maintenance for planetary shield X (10 BC/turn)', () => {
    const planet = makePlanet({ buildings: [], planetaryShield: 10 });
    expect(calculateBuildingMaintenance(planet)).toBe(10);
  });

  it('missile bases have zero maintenance cost', () => {
    // Missile bases are tracked as planet.missileBases (count), not in buildings[]
    const planet = makePlanet({ missileBases: 10, buildings: [], planetaryShield: 0 });
    expect(calculateBuildingMaintenance(planet)).toBe(0);
  });

  it('star gate has zero maintenance cost', () => {
    const planet = makePlanet({
      buildings: ['star_gate' as import('../../../src/game/state').BuildingId],
      planetaryShield: 0,
    });
    expect(calculateBuildingMaintenance(planet)).toBe(0);
  });

  it('sums maintenance from multiple buildings', () => {
    // soil_enrichment: 2 BC/turn maintenance
    // planetary shield V: 5 BC/turn
    const planet = makePlanet({
      buildings: ['soil_enrichment' as import('../../../src/game/state').BuildingId],
      planetaryShield: 5,
    });
    expect(calculateBuildingMaintenance(planet)).toBe(7);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Available buildings filtered by tech
// ─────────────────────────────────────────────────────────────────────────────

describe('getAvailableBuildings — tech filtering', () => {
  it('missile base is available without any tech', () => {
    const planet = makePlanet();
    const empire = makeEmpire('empire1', []); // no completed techs
    const available = getAvailableBuildings(planet, empire);
    const ids = available.map((b) => b.id);
    expect(ids).toContain('missile_base');
  });

  it('planetary shield V requires planetary_5_tech', () => {
    const planet = makePlanet();

    // Without tech: shield should not be available
    const noTechEmpire = makeEmpire('empire1', []);
    const noTechAvail = getAvailableBuildings(planet, noTechEmpire);
    expect(noTechAvail.map((b) => b.id)).not.toContain('planetary_shield_5');

    // With tech: shield should be available
    const withTechEmpire = makeEmpire('empire1', ['planetary_5_tech']);
    const withTechAvail = getAvailableBuildings(planet, withTechEmpire);
    expect(withTechAvail.map((b) => b.id)).toContain('planetary_shield_5');
  });

  it('star gate requires star_gates_tech', () => {
    const planet = makePlanet();
    const empire = makeEmpire('empire1', ['star_gates_tech']);
    const available = getAvailableBuildings(planet, empire);
    expect(available.map((b) => b.id)).toContain('star_gate');
  });

  it('higher shield tier requires its own tech', () => {
    const planet = makePlanet({ planetaryShield: 5 }); // already has Shield V
    const empireX = makeEmpire('empire1', ['planetary_5_tech', 'planetary_10_tech']);
    const available = getAvailableBuildings(planet, empireX);
    const ids = available.map((b) => b.id);
    // Shield V is already built (planetaryShield = 5), Shield X should be available
    expect(ids).not.toContain('planetary_shield_5');
    expect(ids).toContain('planetary_shield_10');
  });

  it('filters out tech-unlock/empire-scoped buildings (not per-planet)', () => {
    const planet = makePlanet();
    const empire = makeEmpire('empire1', ['robotic_controls_2_tech']);
    const available = getAvailableBuildings(planet, empire);
    const ids = available.map((b) => b.id);
    expect(ids).not.toContain('robotic_controls_2');
    expect(ids).not.toContain('robotic_controls_3');
  });

  it('filters out ecology slider buildings (not DEF slider)', () => {
    const planet = makePlanet();
    const empire = makeEmpire('empire1', ['soil_enrichment_tech']);
    const available = getAvailableBuildings(planet, empire);
    const ids = available.map((b) => b.id);
    expect(ids).not.toContain('soil_enrichment');
    expect(ids).not.toContain('terraforming_10');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Building effects applied
// ─────────────────────────────────────────────────────────────────────────────

describe('Building effects applied', () => {
  it('completing missile base increments missileBases', () => {
    const planet = makePlanet({ missileBases: 5 });
    const queuedPlanet = {
      ...planet,
      buildQueue: [
        {
          type: 'defense' as const,
          targetId: 'missile_base',
          targetName: 'Missile Base',
          costTotal: 100, // design/economy/slider-mathematics.md: Base 100 BC
          costRemaining: 0,
          turnsRemaining: 0,
        },
      ],
    };
    const state = makeMinimalState([queuedPlanet], [makeEmpire()]);
    const nextState = processBuildingConstruction(state, queuedPlanet);

    expect(nextState.planets.byId['p1'].missileBases).toBe(6);
  });

  it('completing Shield XV sets planetaryShield to 15', () => {
    const planet = makePlanet({
      planetaryShield: 10,
      buildQueue: [
        {
          type: 'defense' as const,
          targetId: 'planetary_shield_15',
          targetName: 'Planetary Shield XV',
          costTotal: 2000,
          costRemaining: 0,
          turnsRemaining: 0,
        },
      ],
    });
    const empire = makeEmpire('empire1', ['planetary_15_tech']);
    const state = makeMinimalState([planet], [empire]);

    const nextState = processBuildingConstruction(state, planet);
    expect(nextState.planets.byId['p1'].planetaryShield).toBe(15);
  });

  it('completing star gate adds it to planet.buildings', () => {
    const planet = makePlanet({
      buildQueue: [
        {
          type: 'defense' as const,
          targetId: 'star_gate',
          targetName: 'Intergalactic Star Gate',
          costTotal: 3000,
          costRemaining: 0,
          turnsRemaining: 0,
        },
      ],
    });
    const empire = makeEmpire('empire1', ['star_gates_tech']);
    const state = makeMinimalState([planet], [empire]);

    const nextState = processBuildingConstruction(state, planet);
    expect(nextState.planets.byId['p1'].buildings).toContain('star_gate');
  });

  it('applyBuildingEffects returns state unchanged (pass-through)', () => {
    const planet = makePlanet({ missileBases: 3, planetaryShield: 5 });
    const state = makeMinimalState([planet], [makeEmpire()]);
    const nextState = applyBuildingEffects(state);
    // Pure pass-through in current implementation — same structure
    expect(nextState.planets.byId['p1'].missileBases).toBe(3);
    expect(nextState.planets.byId['p1'].planetaryShield).toBe(5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// No DOM imports guard
// ─────────────────────────────────────────────────────────────────────────────

describe('no DOM imports', () => {
  it('document is not defined (no DOM access in game systems)', () => {
    expect(typeof document).toBe('undefined');
  });

  it('window is not defined (no DOM access in game systems)', () => {
    expect(typeof window).toBe('undefined');
  });
});
