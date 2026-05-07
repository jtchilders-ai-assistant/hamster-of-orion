/**
 * Ship construction system tests.
 * test/game/systems/shipConstruction.test.ts
 *
 * Tests: accumulation, spawning, overflow carry-over, HP, fleet assignment,
 *        no-design guard, multiple ships in one turn.
 */

import { describe, it, expect } from 'vitest';
import {
  processPlanetShipConstruction,
  applyShipConstruction,
  processAllShipConstruction,
} from '../../../src/game/systems/shipConstruction';
import { setPlanetDesign, clearPlanetDesign, shipReducer } from '../../../src/game/actions/ship';
import type {
  GameState,
  Planet,
  Empire,
  ShipDesign,
  ResearchState,
} from '../../../src/game/state';

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

function makeResearchState(): ResearchState {
  return {
    currentTech: null,
    researchPoints: 0,
    researchPerTurn: 0,
    completedTechs: [],
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

function makeEmpire(id: string): Empire {
  return {
    id,
    raceId: 'hamsters',
    name: 'Test Empire',
    isPlayer: true,
    credits: 100,
    creditPerTurn: 10,
    planets: ['p1'],
    fleets: [],
    shipDesigns: ['design1'],
    research: makeResearchState(),
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
    production: { ship: 50, defense: 0, industry: 25, ecology: 25, research: 0 },
    buildQueue: [],
    buildings: [],
    missileBases: 0,
    maxMissileBases: 10,
    planetaryShield: 0,
    isRich: false,
    isPoor: false,
    isGaia: false,
    hasArtifacts: false,
    // Shipyard fields
    currentDesignId: 'design1',
    shipyardProgress: 0,
    // Galaxy generation metadata
    resourceLevel: 'normal',
    researchMultiplier: 1.0,
    startingPopulation: null,
    startingFactories: null,
    ...overrides,
  };
}

/** A ship design with a fixed cost of 100 BC and 50 HP. */
function makeDesign(id = 'design1', cost = 100, hp = 50): ShipDesign {
  return {
    id,
    name: 'Scout',
    class: 'small',
    ownerId: 'empire1',
    size: 25,
    spaceUsed: 10,
    spaceFree: 15,
    components: [],
    stats: {
      cost,
      maintenance: 1,
      hp,
      shieldHp: 0,
      speed: 2,
      range: 3,
      weapons: [],
      defense: { armor: 0, shields: 0, ecm: 0 },
      special: [],
    },
    miniaturization: {},
    isObsolete: false,
    shipsBuilt: 0,
  };
}

function makeMinimalState(
  planets: Planet[] = [],
  designs: ShipDesign[] = [],
  empires: Empire[] = [],
): GameState {
  const planetsById = Object.fromEntries(planets.map((p) => [p.id, p]));
  const designsById = Object.fromEntries(designs.map((d) => [d.id, d]));
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
    shipDesigns: {
      byId: designsById,
      allIds: designs.map((d) => d.id),
    },
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

// ─────────────────────────────────────────────────────────────────────────────
// processPlanetShipConstruction
// ─────────────────────────────────────────────────────────────────────────────

describe('processPlanetShipConstruction', () => {
  it('accumulates BC from SHIP allocation across turns (no spawn yet)', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const state = makeMinimalState([planet], [design], [makeEmpire('empire1')]);

    const result = processPlanetShipConstruction(planet, 40, state, 1);

    expect(result.spawnedShipIds).toHaveLength(0);
    expect(result.updatedPlanet.shipyardProgress).toBe(40);
    expect(result.overflow).toBe(0);
  });

  it('accumulates BC across multiple turns', () => {
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');

    let planet = makePlanet({ shipyardProgress: 0 });
    let state = makeMinimalState([planet], [design], [empire]);

    // Turn 1: add 30 BC
    let result = processPlanetShipConstruction(planet, 30, state, 1);
    planet = result.updatedPlanet;
    state = { ...state, planets: { ...state.planets, byId: { p1: planet }, allIds: ['p1'] } };
    expect(planet.shipyardProgress).toBe(30);
    expect(result.spawnedShipIds).toHaveLength(0);

    // Turn 2: add 30 BC → total 60
    result = processPlanetShipConstruction(planet, 30, state, 2);
    planet = result.updatedPlanet;
    expect(planet.shipyardProgress).toBe(60);
    expect(result.spawnedShipIds).toHaveLength(0);

    // Turn 3: add 40 BC → total 100 → spawn!
    result = processPlanetShipConstruction(planet, 40, state, 3);
    expect(result.spawnedShipIds).toHaveLength(1);
    expect(result.updatedPlanet.shipyardProgress).toBe(0);
  });

  it('spawns ship when progress >= cost exactly', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const state = makeMinimalState([planet], [design], [makeEmpire('empire1')]);

    const result = processPlanetShipConstruction(planet, 100, state, 1);

    expect(result.spawnedShipIds).toHaveLength(1);
    expect(result.updatedPlanet.shipyardProgress).toBe(0);
  });

  it('overflow carries to next ship (not lost)', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const state = makeMinimalState([planet], [design], [makeEmpire('empire1')]);

    // Pay 150 BC with cost 100: spawn 1 ship, 50 BC carries forward
    const result = processPlanetShipConstruction(planet, 150, state, 1);

    expect(result.spawnedShipIds).toHaveLength(1);
    expect(result.updatedPlanet.shipyardProgress).toBe(50);
  });

  it('spawns multiple ships when BC is sufficient', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const state = makeMinimalState([planet], [design], [makeEmpire('empire1')]);

    // 250 BC → 2 ships + 50 overflow
    const result = processPlanetShipConstruction(planet, 250, state, 1);

    expect(result.spawnedShipIds).toHaveLength(2);
    expect(result.updatedPlanet.shipyardProgress).toBe(50);
  });

  it('spawns zero ships and leaves progress when BC < cost', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const state = makeMinimalState([planet], [design], [makeEmpire('empire1')]);

    const result = processPlanetShipConstruction(planet, 10, state, 1);

    expect(result.spawnedShipIds).toHaveLength(0);
    expect(result.updatedPlanet.shipyardProgress).toBe(10);
  });

  it('does nothing when no design is selected', () => {
    const planet = makePlanet({ currentDesignId: null, shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const state = makeMinimalState([planet], [design], [makeEmpire('empire1')]);

    const result = processPlanetShipConstruction(planet, 100, state, 1);

    expect(result.spawnedShipIds).toHaveLength(0);
    expect(result.updatedPlanet.shipyardProgress).toBe(0);
    expect(result.updatedPlanet.currentDesignId).toBeNull();
  });

  it('clears design if it no longer exists in state', () => {
    // Design ID set but not in state.shipDesigns
    const planet = makePlanet({ currentDesignId: 'ghost-design', shipyardProgress: 30 });
    const state = makeMinimalState([planet], [], [makeEmpire('empire1')]);

    const result = processPlanetShipConstruction(planet, 50, state, 1);

    expect(result.spawnedShipIds).toHaveLength(0);
    expect(result.updatedPlanet.currentDesignId).toBeNull();
    expect(result.updatedPlanet.shipyardProgress).toBe(0);
  });

  it('carries over prior progress into spawn threshold', () => {
    // Prior progress of 70, cost = 100; add 30 → total 100 → spawn
    const planet = makePlanet({ shipyardProgress: 70 });
    const design = makeDesign('design1', 100, 50);
    const state = makeMinimalState([planet], [design], [makeEmpire('empire1')]);

    const result = processPlanetShipConstruction(planet, 30, state, 1);

    expect(result.spawnedShipIds).toHaveLength(1);
    expect(result.updatedPlanet.shipyardProgress).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// applyShipConstruction — ship stats
// ─────────────────────────────────────────────────────────────────────────────

describe('applyShipConstruction — ship entities', () => {
  it('ship has correct HP based on design', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 75); // 75 HP
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [design], [empire]);

    const result = processPlanetShipConstruction(planet, 100, state, 1);
    const nextState = applyShipConstruction(state, planet, result);

    expect(result.spawnedShipIds).toHaveLength(1);
    const shipId = result.spawnedShipIds[0];
    const ship = nextState.ships.byId[shipId];

    expect(ship).toBeDefined();
    expect(ship.hp).toBe(75);
    expect(ship.maxHp).toBe(75);
  });

  it('spawned ship has the correct designId', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [design], [empire]);

    const result = processPlanetShipConstruction(planet, 100, state, 1);
    const nextState = applyShipConstruction(state, planet, result);

    const shipId = result.spawnedShipIds[0];
    const ship = nextState.ships.byId[shipId];
    expect(ship.designId).toBe('design1');
  });

  it('spawned ship belongs to the planet owner empire', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [design], [empire]);

    const result = processPlanetShipConstruction(planet, 100, state, 1);
    const nextState = applyShipConstruction(state, planet, result);

    const shipId = result.spawnedShipIds[0];
    const ship = nextState.ships.byId[shipId];
    expect(ship.ownerId).toBe('empire1');
  });

  it('spawned ship is added to ships.allIds', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [design], [empire]);

    const result = processPlanetShipConstruction(planet, 100, state, 1);
    expect(state.ships.allIds).toHaveLength(0);

    const nextState = applyShipConstruction(state, planet, result);
    expect(nextState.ships.allIds).toHaveLength(1);
  });

  it('multiple ships from one turn are all added', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [design], [empire]);

    const result = processPlanetShipConstruction(planet, 300, state, 1); // 3 ships
    const nextState = applyShipConstruction(state, planet, result);

    expect(result.spawnedShipIds).toHaveLength(3);
    expect(nextState.ships.allIds).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// applyShipConstruction — fleet assignment
// ─────────────────────────────────────────────────────────────────────────────

describe('applyShipConstruction — fleet assignment', () => {
  it('creates a new local fleet when none exists', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [design], [empire]);

    const result = processPlanetShipConstruction(planet, 100, state, 1);
    const nextState = applyShipConstruction(state, planet, result);

    expect(nextState.fleets.allIds).toHaveLength(1);
    const fleetId = nextState.fleets.allIds[0];
    const fleet = nextState.fleets.byId[fleetId];
    expect(fleet.systemId).toBe('s1');
    expect(fleet.ownerId).toBe('empire1');
  });

  it('ship is added to the new fleet', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [design], [empire]);

    const result = processPlanetShipConstruction(planet, 100, state, 1);
    const nextState = applyShipConstruction(state, planet, result);

    const shipId = result.spawnedShipIds[0];
    const fleetId = nextState.fleets.allIds[0];
    const fleet = nextState.fleets.byId[fleetId];

    expect(fleet.shipIds).toContain(shipId);

    const ship = nextState.ships.byId[shipId];
    expect(ship.fleetId).toBe(fleetId);
  });

  it('new fleet is added to empire fleet list', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [design], [empire]);

    expect(state.empires.byId['empire1'].fleets).toHaveLength(0);

    const result = processPlanetShipConstruction(planet, 100, state, 1);
    const nextState = applyShipConstruction(state, planet, result);

    expect(nextState.empires.byId['empire1'].fleets).toHaveLength(1);
  });

  it('appends ships to an existing local fleet', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');

    // Pre-create a fleet at the same system
    const existingFleet = {
      id: 'fleet-existing',
      name: 'Existing Fleet',
      ownerId: 'empire1' as const,
      shipIds: ['ship-old'] as string[],
      systemId: 's1',
      destination: null,
      route: [] as string[],
      movementPoints: 0,
      maxMovement: 0,
      orders: { type: 'none' as const },
      experience: 'regular' as const,
      isInCombat: false,
      combatId: null,
    };

    const empireWithFleet = { ...empire, fleets: ['fleet-existing'] };
    const state = {
      ...makeMinimalState([planet], [design], [empireWithFleet]),
      fleets: {
        byId: { 'fleet-existing': existingFleet },
        allIds: ['fleet-existing'],
      },
    };

    const result = processPlanetShipConstruction(planet, 100, state, 1);
    const nextState = applyShipConstruction(state, planet, result);

    // Should reuse existing fleet, not create a new one
    expect(nextState.fleets.allIds).toHaveLength(1);
    const fleet = nextState.fleets.byId['fleet-existing'];
    expect(fleet.shipIds).toHaveLength(2); // old + new
    expect(fleet.shipIds).toContain('ship-old');
  });

  it('does not add ship to fleet if no ships were spawned', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [design], [empire]);

    // Only 40 BC — not enough to spawn
    const result = processPlanetShipConstruction(planet, 40, state, 1);
    const nextState = applyShipConstruction(state, planet, result);

    expect(nextState.fleets.allIds).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// processAllShipConstruction
// ─────────────────────────────────────────────────────────────────────────────

describe('processAllShipConstruction', () => {
  it('processes multiple planets in one pass', () => {
    const planet1 = makePlanet({ id: 'p1', shipyardProgress: 0 });
    const planet2 = makePlanet({ id: 'p2', systemId: 's2', shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');

    const state = makeMinimalState([planet1, planet2], [design], [empire]);
    const shipBcByPlanet = { p1: 100, p2: 100 };

    const result = processAllShipConstruction(state, shipBcByPlanet);

    expect(result.state.ships.allIds).toHaveLength(2);
  });

  it('skips uncolonized planets', () => {
    const colonized = makePlanet({ id: 'p1', shipyardProgress: 0 });
    const uncolonized = makePlanet({
      id: 'p2',
      systemId: 's2',
      isColonized: false,
      ownerId: null,
      currentDesignId: null,
    });
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');

    const state = makeMinimalState([colonized, uncolonized], [design], [empire]);
    const result = processAllShipConstruction(state, { p1: 100, p2: 100 });

    // Only p1 should have produced a ship
    expect(result.state.ships.allIds).toHaveLength(1);
  });

  it('skips planets with zero BC and zero progress', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [design], [empire]);

    const result = processAllShipConstruction(state, {}); // no allocation
    expect(result.state.ships.allIds).toHaveLength(0);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Empire Reserve overflow tests (per slider-mathematics.md §8)
  // ───────────────────────────────────────────────────────────────────────────

  it('returns overflow when queue is empty (no currentDesignId)', () => {
    const planet = makePlanet({ currentDesignId: null, shipyardProgress: 0 });
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [], [empire]);

    const result = processAllShipConstruction(state, { p1: 50 });

    expect(result.overflowByEmpire['empire1']).toBe(50);
    expect(result.state.planets.byId['p1'].shipyardProgress).toBe(0);
  });

  it('also overflows existing shipyardProgress when queue is cleared', () => {
    // Planet has progress from a design that was deleted
    const planet = makePlanet({ currentDesignId: null, shipyardProgress: 30 });
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [], [empire]);

    const result = processAllShipConstruction(state, { p1: 50 });

    // Both the new BC (50) and existing progress (30) should overflow
    expect(result.overflowByEmpire['empire1']).toBe(80);
    expect(result.state.planets.byId['p1'].shipyardProgress).toBe(0);
  });

  it('accumulates overflow across multiple planets for same empire', () => {
    const planet1 = makePlanet({ id: 'p1', currentDesignId: null, shipyardProgress: 0 });
    const planet2 = makePlanet({ id: 'p2', systemId: 's2', currentDesignId: null, shipyardProgress: 0 });
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet1, planet2], [], [empire]);

    const result = processAllShipConstruction(state, { p1: 30, p2: 20 });

    expect(result.overflowByEmpire['empire1']).toBe(50);
  });

  it('does not overflow when actively building ships', () => {
    const planet = makePlanet({ shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [design], [empire]);

    const result = processAllShipConstruction(state, { p1: 50 });

    // BC goes to shipyard progress, not overflow
    expect(result.overflowByEmpire['empire1']).toBeUndefined();
    expect(result.state.planets.byId['p1'].shipyardProgress).toBe(50);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setPlanetDesign / clearPlanetDesign actions
// ─────────────────────────────────────────────────────────────────────────────

describe('setPlanetDesign action', () => {
  it('sets currentDesignId on the planet', () => {
    const planet = makePlanet({ currentDesignId: null, shipyardProgress: 0 });
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [design], [empire]);

    const action = setPlanetDesign('p1', 'design1');
    const next = shipReducer(state, action);

    expect(next.planets.byId['p1'].currentDesignId).toBe('design1');
  });

  it('resets shipyardProgress to 0 when switching designs', () => {
    const planet = makePlanet({ currentDesignId: 'design1', shipyardProgress: 60 });
    const design1 = makeDesign('design1', 100, 50);
    const design2 = makeDesign('design2', 200, 80);
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [design1, design2], [empire]);

    const action = setPlanetDesign('p1', 'design2');
    const next = shipReducer(state, action);

    expect(next.planets.byId['p1'].currentDesignId).toBe('design2');
    expect(next.planets.byId['p1'].shipyardProgress).toBe(0);
  });

  it('is a no-op for unknown planet ID', () => {
    const planet = makePlanet();
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [design], [empire]);

    const action = setPlanetDesign('no-such-planet', 'design1');
    const next = shipReducer(state, action);
    expect(next).toBe(state);
  });
});

describe('clearPlanetDesign action', () => {
  it('clears currentDesignId', () => {
    const planet = makePlanet({ currentDesignId: 'design1', shipyardProgress: 30 });
    const design = makeDesign('design1', 100, 50);
    const empire = makeEmpire('empire1');
    const state = makeMinimalState([planet], [design], [empire]);

    const action = clearPlanetDesign('p1');
    const next = shipReducer(state, action);

    expect(next.planets.byId['p1'].currentDesignId).toBeNull();
    // Progress is retained when clearing (player may switch back)
    expect(next.planets.byId['p1'].shipyardProgress).toBe(30);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// No DOM imports guard
// ─────────────────────────────────────────────────────────────────────────────

describe('no DOM imports', () => {
  it('document is not defined (no DOM access in game systems)', () => {
    // Vitest runs in a Node environment; document should be undefined
    // unless jsdom is configured. This test explicitly guards the contract.
    expect(typeof document).toBe('undefined');
  });

  it('window is not defined (no DOM access in game systems)', () => {
    expect(typeof window).toBe('undefined');
  });
});
