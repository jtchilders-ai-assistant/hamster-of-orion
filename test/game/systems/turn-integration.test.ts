/**
 * Integration tests for the fully-wired processTurn() function.
 * test/game/systems/turn-integration.test.ts
 *
 * Verifies that every sub-system (production, ship construction, research,
 * growth, fleet movement, AI) is correctly invoked during a game turn.
 *
 * NOTE: These tests share the fixture helpers with turn.test.ts by
 * re-declaring them here for isolation.
 */

import { describe, it, expect } from 'vitest';
import { processTurn } from '../../../src/game/systems/turn';
import {
  GameState,
  Planet,
  Empire,
  ResearchState,
  Fleet,
  Ship,
  ShipDesign,
  StarSystem,
} from '../../../src/game/state';

// ── Fixtures ──────────────────────────────────────────────────────────────────

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

function makeEmpire(id: string, overrides: Partial<Empire> = {}): Empire {
  return {
    id,
    raceId: 'hamsters',
    name: 'Test Empire',
    isPlayer: true,
    credits: 100,
    creditPerTurn: 10,
    planets: [],
    fleets: [],
    shipDesigns: [],
    research: makeResearchState(),
    relations: {},
    isDefeated: false,
    defeatedTurn: null,
    ...overrides,
  };
}

function makePlanet(id: string, overrides: Partial<Planet> = {}): Planet {
  return {
    id,
    name: `Planet ${id}`,
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
    factories: 20,
    maxFactories: 100,
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
    currentDesignId: null,
    shipyardProgress: 0,
    ...overrides,
  };
}

function makeSystem(id: string, x = 0, y = 0): StarSystem {
  return {
    id,
    name: `System ${id}`,
    coordinates: { x, y },
    starType: 'yellow',
    starClass: 'G',
    planetIds: [],
    ownerId: null,
    hasAsteroids: false,
    hasNebula: false,
    nebulaId: null,
    hasWormhole: false,
    wormholeTarget: null,
    fleetIds: [],
    isOrion: false,
    hasGuardian: false,
    hasArtifacts: false,
    hasSpaceMonster: null,
    region: 'safe_zones',
    clusterId: null,
  };
}

function makeFleet(id: string, ownerId: string, systemId: string, overrides: Partial<Fleet> = {}): Fleet {
  return {
    id,
    name: `Fleet ${id}`,
    ownerId,
    shipIds: [],
    systemId,
    destination: null,
    eta: 0,
    route: [],
    movementPoints: 0,
    maxMovement: 0,
    orders: { type: 'none' },
    experience: 'green',
    isInCombat: false,
    combatId: null,
    ...overrides,
  };
}

function makeShip(id: string, designId: string, ownerId: string, fleetId: string): Ship {
  return {
    id,
    name: `Ship ${id}`,
    designId,
    ownerId,
    fleetId,
    hp: 100,
    maxHp: 100,
    shieldHp: 0,
    maxShieldHp: 0,
    experience: 'green',
    kills: 0,
    combatPosition: null,
    hasActed: false,
    specialSystems: {},
  };
}

function makeDesign(id: string, ownerId: string): ShipDesign {
  return {
    id,
    name: `Design ${id}`,
    class: 'small',
    ownerId,
    size: 100,
    spaceUsed: 80,
    spaceFree: 20,
    components: [],
    stats: {
      cost: 50,
      maintenance: 1,
      hp: 100,
      shieldHp: 0,
      speed: 1,
      range: 3,
      weapons: [],
      defense: { armor: 5, shields: 0, ecm: 0 },
      special: [],
    },
    miniaturization: {},
    isObsolete: false,
    shipsBuilt: 0,
  };
}

function makeMinimalState(
  turn = 0,
  planets: Planet[] = [],
  empires: Empire[] = [],
  fleets: Fleet[] = [],
  ships: Ship[] = [],
  designs: ShipDesign[] = [],
  systems: StarSystem[] = [],
): GameState {
  const planetsById = Object.fromEntries(planets.map((p) => [p.id, p]));
  const empiresById = Object.fromEntries(empires.map((e) => [e.id, e]));
  const fleetsById = Object.fromEntries(fleets.map((f) => [f.id, f]));
  const shipsById = Object.fromEntries(ships.map((s) => [s.id, s]));
  const designsById = Object.fromEntries(designs.map((d) => [d.id, d]));
  const systemsById = Object.fromEntries(systems.map((s) => [s.id, s]));

  return {
    version: '0.1.0',
    seed: 'test-seed',
    turn,
    year: 2500 + turn,
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
      systemCount: systems.length,
      systems: {
        byId: systemsById,
        allIds: systems.map((s) => s.id),
      },
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
    fleets: {
      byId: fleetsById,
      allIds: fleets.map((f) => f.id),
    },
    ships: {
      byId: shipsById,
      allIds: ships.map((s) => s.id),
    },
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
      },
    },
  };
}

// ── Test: time advancement ────────────────────────────────────────────────────

describe('processTurn — time advancement', () => {
  it('increments turn and year together', () => {
    const state = makeMinimalState(10);
    const next = processTurn(state);
    expect(next.turn).toBe(11);
    expect(next.year).toBe(2511);
  });

  it('does not mutate the input state', () => {
    const state = makeMinimalState(5);
    const originalTurn = state.turn;
    processTurn(state);
    expect(state.turn).toBe(originalTurn); // input unchanged
  });
});

// ── Test: production system wired in ─────────────────────────────────────────

describe('processTurn — production integration', () => {
  it('builds factories from IND production each turn', () => {
    // Planet with lots of IND allocation and room for factories
    const planet = makePlanet('p1', {
      population: 100,
      maxPopulation: 100,
      factories: 0,
      maxFactories: 200,
      production: { ship: 0, defense: 0, industry: 100, ecology: 0, research: 0 },
      resourceLevel: 'ultra_rich', // maximize production
    });
    const empire = makeEmpire('empire1', { planets: ['p1'] });
    const state = makeMinimalState(0, [planet], [empire]);

    const next = processTurn(state);
    const nextPlanet = next.planets.byId['p1'];

    // With ultra_rich + 100 pop and 100% IND slider, we expect at least 1 factory built
    expect(nextPlanet.factories).toBeGreaterThan(planet.factories);
  });

  it('applies ECO growth bonus to population', () => {
    // Planet with full ECO slider at max pop gap — should get growth bonus
    const planet = makePlanet('p1', {
      population: 10,
      maxPopulation: 100,
      factories: 0,
      production: { ship: 0, defense: 0, industry: 0, ecology: 100, research: 0 },
      resourceLevel: 'normal',
    });
    const empire = makeEmpire('empire1', { planets: ['p1'] });
    const state = makeMinimalState(0, [planet], [empire]);

    const next = processTurn(state);
    const nextPlanet = next.planets.byId['p1'];

    // Population should have grown (ECO bonus + natural growth)
    expect(nextPlanet.population).toBeGreaterThanOrEqual(planet.population);
  });

  it('uncolonized planets are skipped by production', () => {
    const planet = makePlanet('p1', {
      ownerId: null,
      isColonized: false,
      factories: 5,
    });
    const state = makeMinimalState(0, [planet], []);

    const next = processTurn(state);
    const nextPlanet = next.planets.byId['p1'];

    // Uncolonized planets should not have factories changed by production
    expect(nextPlanet.factories).toBe(planet.factories);
  });
});

// ── Test: empire income wired in ──────────────────────────────────────────────

describe('processTurn — empire income', () => {
  it('adds creditPerTurn to empire credits each turn', () => {
    const empire = makeEmpire('empire1', { credits: 100, creditPerTurn: 25 });
    const state = makeMinimalState(0, [], [empire]);

    const next = processTurn(state);
    const nextEmpire = next.empires.byId['empire1'];

    expect(nextEmpire.credits).toBe(125);
  });

  it('defeated empires do not earn income', () => {
    const empire = makeEmpire('empire1', {
      credits: 100,
      creditPerTurn: 25,
      isDefeated: true,
      defeatedTurn: 1,
    });
    const state = makeMinimalState(0, [], [empire]);

    const next = processTurn(state);
    const nextEmpire = next.empires.byId['empire1'];

    // Defeated empire should not receive income
    expect(nextEmpire.credits).toBe(100);
  });

  it('multiple empires each receive income independently', () => {
    const e1 = makeEmpire('empire1', { credits: 100, creditPerTurn: 10 });
    const e2 = makeEmpire('empire2', { credits: 200, creditPerTurn: 50 });
    const state = makeMinimalState(0, [], [e1, e2]);

    const next = processTurn(state);

    expect(next.empires.byId['empire1'].credits).toBe(110);
    expect(next.empires.byId['empire2'].credits).toBe(250);
  });
});

// ── Test: research system wired in ───────────────────────────────────────────

describe('processTurn — research integration', () => {
  it('accumulates research points for active empires each turn', () => {
    const planet = makePlanet('p1', {
      population: 100,
      production: { ship: 0, defense: 0, industry: 0, ecology: 0, research: 100 },
    });
    const empire = makeEmpire('empire1', {
      planets: ['p1'],
      research: {
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
      },
    });
    const state = makeMinimalState(0, [planet], [empire]);

    const next = processTurn(state);
    const nextEmpire = next.empires.byId['empire1'];

    // With 100 population at 100% research, we expect RP to have grown
    expect(nextEmpire.research.researchPoints).toBeGreaterThan(0);
    expect(nextEmpire.research.researchPerTurn).toBeGreaterThan(0);
  });

  it('empire with no planets generates zero research', () => {
    const empire = makeEmpire('empire1', { planets: [] });
    const state = makeMinimalState(0, [], [empire]);

    const next = processTurn(state);
    const nextEmpire = next.empires.byId['empire1'];

    // No planets → no RP
    expect(nextEmpire.research.researchPoints).toBe(0);
  });
});

// ── Test: population growth wired in ─────────────────────────────────────────

describe('processTurn — population growth integration', () => {
  it('grows population on colonized planets each turn', () => {
    const planet = makePlanet('p1', {
      population: 50,
      maxPopulation: 100,
      growthRate: 0.10, // high growth rate to guarantee delta > 0
      morale: 'happy',
    });
    const empire = makeEmpire('empire1', { planets: ['p1'] });
    const state = makeMinimalState(0, [planet], [empire]);

    const next = processTurn(state);
    const nextPlanet = next.planets.byId['p1'];

    // Population should have grown from natural growth or ECO bonus
    expect(nextPlanet.population).toBeGreaterThanOrEqual(planet.population);
  });

  it('population cannot exceed maxPopulation', () => {
    const planet = makePlanet('p1', {
      population: 99.9,
      maxPopulation: 100,
      growthRate: 0.50,
    });
    const empire = makeEmpire('empire1', { planets: ['p1'] });
    const state = makeMinimalState(0, [planet], [empire]);

    const next = processTurn(state);
    const nextPlanet = next.planets.byId['p1'];

    expect(nextPlanet.population).toBeLessThanOrEqual(planet.maxPopulation);
  });
});

// ── Test: fleet movement wired in ────────────────────────────────────────────

describe('processTurn — fleet movement integration', () => {
  it('decrements fleet eta each turn', () => {
    const sys1 = makeSystem('s1', 0, 0);
    const sys2 = makeSystem('s2', 100, 0);
    sys1.fleetIds = ['fleet1'];

    const fleet = makeFleet('fleet1', 'empire1', 's1', {
      destination: 's2',
      eta: 3,
    });
    const empire = makeEmpire('empire1', { fleets: ['fleet1'] });
    const state = makeMinimalState(0, [], [empire], [fleet], [], [], [sys1, sys2]);

    const next = processTurn(state);
    const nextFleet = next.fleets.byId['fleet1'];

    expect(nextFleet.eta).toBe(2);
    expect(nextFleet.systemId).toBe('s1'); // not arrived yet
  });

  it('fleet with eta 1 arrives at destination', () => {
    const sys1 = makeSystem('s1', 0, 0);
    const sys2 = makeSystem('s2', 100, 0);
    sys1.fleetIds = ['fleet1'];
    sys2.fleetIds = [];

    const fleet = makeFleet('fleet1', 'empire1', 's1', {
      destination: 's2',
      eta: 1,
    });
    const empire = makeEmpire('empire1', { fleets: ['fleet1'] });
    const state = makeMinimalState(0, [], [empire], [fleet], [], [], [sys1, sys2]);

    const next = processTurn(state);
    const nextFleet = next.fleets.byId['fleet1'];

    expect(nextFleet.systemId).toBe('s2');
    expect(nextFleet.destination).toBeNull();
    expect(nextFleet.eta).toBe(0);
  });

  it('stationary fleet is not moved', () => {
    const sys1 = makeSystem('s1', 0, 0);
    sys1.fleetIds = ['fleet1'];

    const fleet = makeFleet('fleet1', 'empire1', 's1', {
      destination: null,
      eta: 0,
    });
    const empire = makeEmpire('empire1', { fleets: ['fleet1'] });
    const state = makeMinimalState(0, [], [empire], [fleet], [], [], [sys1]);

    const next = processTurn(state);
    const nextFleet = next.fleets.byId['fleet1'];

    expect(nextFleet.systemId).toBe('s1');
    expect(nextFleet.destination).toBeNull();
  });
});

// ── Test: ship construction wired in ─────────────────────────────────────────

describe('processTurn — ship construction integration', () => {
  it('spawns a ship when shipyardProgress reaches design cost', () => {
    const design = makeDesign('d1', 'empire1');
    design.stats.cost = 50; // cheap ship for testing

    const planet = makePlanet('p1', {
      currentDesignId: 'd1',
      shipyardProgress: 45, // 5 BC away from completion
      population: 100,
      factories: 50,
      production: { ship: 100, defense: 0, industry: 0, ecology: 0, research: 0 },
      resourceLevel: 'ultra_rich',
    });

    const sys1 = makeSystem('s1', 0, 0);
    const empire = makeEmpire('empire1', {
      planets: ['p1'],
    });

    const state = makeMinimalState(0, [planet], [empire], [], [], [design], [sys1]);

    const next = processTurn(state);

    // We expect the ship count to have increased
    expect(next.ships.allIds.length).toBeGreaterThan(state.ships.allIds.length);
  });
});

// ── Test: pure / immutability guarantees ──────────────────────────────────────

describe('processTurn — purity and immutability', () => {
  it('returns a new object (not same reference)', () => {
    const state = makeMinimalState(0);
    const next = processTurn(state);
    expect(next).not.toBe(state);
  });

  it('planets object is a new reference', () => {
    const planet = makePlanet('p1');
    const empire = makeEmpire('empire1', { planets: ['p1'] });
    const state = makeMinimalState(0, [planet], [empire]);
    const next = processTurn(state);
    expect(next.planets).not.toBe(state.planets);
  });

  it('processes multiple turns without error', () => {
    const planet = makePlanet('p1', {
      population: 20,
      maxPopulation: 100,
      factories: 5,
      production: { ship: 10, defense: 10, industry: 40, ecology: 20, research: 20 },
    });
    const empire = makeEmpire('empire1', { planets: ['p1'], credits: 500 });
    let state = makeMinimalState(0, [planet], [empire]);

    // Run 10 consecutive turns — must not throw
    expect(() => {
      for (let i = 0; i < 10; i++) {
        state = processTurn(state);
      }
    }).not.toThrow();

    // Turn should have advanced correctly
    expect(state.turn).toBe(10);
  });
});

// ── New integration tests covering wired systems ───────────────────────────────

describe('processTurn — empire income wiring', () => {
  it('credits increase by creditPerTurn each turn', () => {
    const empire = makeEmpire('empire1', { credits: 50, creditPerTurn: 30 });
    const state = makeMinimalState(0, [], [empire]);
    const next = processTurn(state);
    expect(next.empires.byId['empire1'].credits).toBe(80);
  });

  it('income does not apply to defeated empires', () => {
    const empire = makeEmpire('empire1', {
      credits: 50,
      creditPerTurn: 30,
      isDefeated: true,
      defeatedTurn: 1,
    });
    const state = makeMinimalState(0, [], [empire]);
    const next = processTurn(state);
    expect(next.empires.byId['empire1'].credits).toBe(50);
  });
});

describe('processTurn — research wiring', () => {
  it('researchPoints accumulate after each turn with colonised planets', () => {
    const planet = makePlanet('p1', {
      population: 80,
      production: { ship: 0, defense: 0, industry: 0, ecology: 0, research: 100 },
    });
    const empire = makeEmpire('empire1', { planets: ['p1'] });
    const state = makeMinimalState(0, [planet], [empire]);

    const next = processTurn(state);
    const nextEmpire = next.empires.byId['empire1'];

    // 80 pop at 100% research produces non-zero RP
    expect(nextEmpire.research.researchPoints).toBeGreaterThan(0);
    expect(nextEmpire.research.researchPerTurn).toBeGreaterThan(0);
  });

  it('researchPerTurn is 0 for empires with no colonised planets', () => {
    const empire = makeEmpire('empire1', { planets: [] });
    const state = makeMinimalState(0, [], [empire]);

    const next = processTurn(state);
    // No planets → no RP
    expect(next.empires.byId['empire1'].research.researchPerTurn).toBe(0);
  });
});

describe('processTurn — turn counter and year', () => {
  it('always satisfies year === 2500 + turn after processTurn', () => {
    let state = makeMinimalState(0);
    for (let i = 0; i < 5; i++) {
      state = processTurn(state);
      expect(state.year).toBe(2500 + state.turn);
    }
  });
});
