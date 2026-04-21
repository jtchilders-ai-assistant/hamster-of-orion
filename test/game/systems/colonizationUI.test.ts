/**
 * Colonization UI flow tests — reducer level.
 * test/game/systems/colonizationUI.test.ts
 *
 * Tests COLONIZE_PLANET action dispatched from the store:
 *   - Colony ship consumed (ship removed from fleet / fleet dissolved)
 *   - Planet becomes a colony with correct starting stats
 *   - Game navigates to 'planet' screen with selectedPlanet set
 *   - Hostile planets cannot be colonized without Planetology tech
 *
 * Uses rootReducer + Store (no DOM — node test environment).
 *
 * Design references:
 *   design/ui-ux/wireframes/galaxy-map.md — State 3 (Uncolonized Planet)
 *   design/planets/planet-types.md — Colonization requirements
 *   .agents/current-task.md — Acceptance criteria
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Store } from '../../../src/game/store';
import { rootReducer } from '../../../src/game/reducer';
import { initialState } from '../../../src/game/initialState';
import {
  GameState,
  Fleet,
  Ship,
  ShipDesign,
  Planet,
  StarSystem,
  Empire,
  PlanetType,
} from '../../../src/game/state';

// ── Fixture helpers (mirrors colonization.test.ts pattern) ───────────────────

function makeSystem(id: string, overrides: Partial<StarSystem> = {}): StarSystem {
  return {
    id,
    name: `System-${id}`,
    coordinates: { x: 0, y: 0 },
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
    ...overrides,
  };
}

function makePlanet(id: string, systemId: string, overrides: Partial<Planet> = {}): Planet {
  return {
    id,
    name: `Planet-${id}`,
    systemId,
    orbit: 1,
    type: 'terran',
    size: 'medium',
    gravity: 1.0,
    ownerId: null,
    isColonized: false,
    isHomeworld: false,
    population: 0,
    maxPopulation: 100,
    growthRate: 0.1,
    morale: 'content',
    factories: 0,
    maxFactories: 50,
    waste: 0,
    production: { ship: 20, defense: 20, industry: 20, ecology: 20, research: 20 },
    buildQueue: [],
    buildings: [],
    missileBases: 0,
    maxMissileBases: 10,
    planetaryShield: 0,
    groundAttack: 1,
    groundDefense: 1,
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

/** Colony ship design — has colony_base special component */
function makeColonyDesign(id: string): ShipDesign {
  return {
    id,
    name: 'Colony Ship',
    class: 'huge',
    ownerId: 'player',
    size: 500,
    spaceUsed: 50,
    spaceFree: 450,
    components: [
      { id: 'colony_base', type: 'special', name: 'Colony Base', space: 50, baseCost: 200, count: 1 },
    ],
    stats: {
      cost: 200, maintenance: 5, hp: 50, shieldHp: 0, speed: 2, range: 10,
      weapons: [], defense: { armor: 1, shields: 0, ecm: 0 }, special: [{ name: 'Colony Base', description: 'Can colonize' }],
    },
    miniaturization: {},
    isObsolete: false,
    shipsBuilt: 1,
  };
}

/** Combat ship design — no colony component */
function makeFrigateDesign(id: string): ShipDesign {
  return {
    id,
    name: 'Frigate',
    class: 'small',
    ownerId: 'player',
    size: 50,
    spaceUsed: 10,
    spaceFree: 40,
    components: [
      { id: 'nuclear_engines', type: 'engine', name: 'Nuclear Engines', space: 5, baseCost: 8, count: 1 },
    ],
    stats: {
      cost: 80, maintenance: 3, hp: 25, shieldHp: 0, speed: 2, range: 5,
      weapons: [], defense: { armor: 1, shields: 0, ecm: 0 }, special: [],
    },
    miniaturization: {},
    isObsolete: false,
    shipsBuilt: 2,
  };
}

function makeShip(id: string, fleetId: string, designId: string, ownerId = 'player'): Ship {
  return {
    id,
    name: `Ship-${id}`,
    designId,
    ownerId,
    fleetId,
    hp: 50,
    maxHp: 50,
    shieldHp: 0,
    maxShieldHp: 0,
    experience: 'green',
    kills: 0,
    combatPosition: null,
    hasActed: false,
    specialSystems: {},
  };
}

function makeFleet(id: string, systemId: string, shipIds: string[], ownerId = 'player'): Fleet {
  return {
    id,
    name: `Fleet-${id}`,
    ownerId,
    shipIds,
    systemId,
    troops: 0,
    destination: null,
    eta: 0,
    route: [],
    movementPoints: 0,
    maxMovement: 0,
    orders: { type: 'none' },
    experience: 'green',
    isInCombat: false,
    combatId: null,
  };
}

function makeEmpire(id: string, fleetIds: string[] = [], planetIds: string[] = [], completedTechs: string[] = []): Empire {
  return {
    id,
    raceId: 'hamsters',
    name: `Empire-${id}`,
    isPlayer: id === 'player',
    credits: 1000,
    creditPerTurn: 50,
    planets: planetIds,
    fleets: fleetIds,
    shipDesigns: [],
    scannerTechLevel: 0,
    computerTechLevel: 0,
    securityLevel: 0,
    research: {
      currentTech: null,
      researchPoints: 0,
      researchPerTurn: 10,
      completedTechs,
      availableTechs: { weapons: [], propulsion: [], construction: [], computers: [], force_fields: [], biotechnology: [] },
      miniaturization: {},
      stolenTechs: [],
    },
    relations: {},
    exploredSystems: [],
    visibleSystems: [],
    isDefeated: false,
    defeatedTurn: null,
  };
}

/**
 * Build a test state with:
 *  - System 's1' containing fleet 'f1' and planet 'p1'
 *  - Fleet 'f1' with colony ship 'cs1' (and optional escort 'es1')
 */
interface BuildOptions {
  planetType?: PlanetType;
  withEscort?: boolean;
  planetAlreadyColonized?: boolean;
  completedTechs?: string[];
}

function buildState(opts: BuildOptions = {}): GameState {
  const {
    planetType = 'terran',
    withEscort = false,
    planetAlreadyColonized = false,
    completedTechs = [],
  } = opts;

  const colonyDesign = makeColonyDesign('colony-design');
  const frigateDesign = makeFrigateDesign('frigate-design');

  const shipIds: string[] = ['cs1'];
  if (withEscort) shipIds.push('es1');

  const colonyShip = makeShip('cs1', 'f1', 'colony-design');
  const escortShip = makeShip('es1', 'f1', 'frigate-design');

  const fleet = makeFleet('f1', 's1', shipIds);
  const system = makeSystem('s1', { fleetIds: ['f1'], planetIds: ['p1'] });
  const planet = makePlanet('p1', 's1', {
    type: planetType,
    ownerId: planetAlreadyColonized ? 'player' : null,
    isColonized: planetAlreadyColonized,
    population: planetAlreadyColonized ? 15 : 0,
  });

  const shipsById: Record<string, Ship> = { cs1: colonyShip };
  if (withEscort) shipsById['es1'] = escortShip;

  return {
    ...initialState,
    galaxy: {
      ...initialState.galaxy,
      systems: {
        byId: { s1: system },
        allIds: ['s1'],
      },
    },
    planets: {
      byId: { p1: planet },
      allIds: ['p1'],
    },
    ships: {
      byId: shipsById,
      allIds: Object.keys(shipsById),
    },
    shipDesigns: {
      byId: { 'colony-design': colonyDesign, 'frigate-design': frigateDesign },
      allIds: ['colony-design', 'frigate-design'],
    },
    fleets: {
      byId: { f1: fleet },
      allIds: ['f1'],
    },
    empires: {
      byId: { player: makeEmpire('player', ['f1'], [], completedTechs) },
      allIds: ['player'],
      playerId: 'player',
    },
  };
}

// ── COLONIZE_PLANET reducer tests ─────────────────────────────────────────────

describe('COLONIZE_PLANET action — via rootReducer', () => {
  let store: Store<GameState>;

  beforeEach(() => {
    store = new Store(rootReducer, buildState());
  });

  it('marks the planet as colonized (isColonized = true)', () => {
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    expect(store.getState().planets.byId['p1'].isColonized).toBe(true);
  });

  it('sets planet ownerId to the player empire', () => {
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    expect(store.getState().planets.byId['p1'].ownerId).toBe('player');
  });

  it('initializes planet population to 10 (COLONY_STARTING_POPULATION)', () => {
    // Per design/planets/colonization.md: new colony starts with 10M pop
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    expect(store.getState().planets.byId['p1'].population).toBe(10);
  });

  it('initializes factories to 0 (COLONY_STARTING_FACTORIES)', () => {
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    expect(store.getState().planets.byId['p1'].factories).toBe(0);
  });

  it('initializes waste (pollution) to 0', () => {
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    expect(store.getState().planets.byId['p1'].waste).toBe(0);
  });

  it('sets balanced production sliders (20/20/20/20/20)', () => {
    // Per galaxy-map.md: new colony has balanced production
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    const production = store.getState().planets.byId['p1'].production;
    expect(production).toEqual({ ship: 20, defense: 20, industry: 20, ecology: 20, research: 20 });
  });

  it('navigates to planet screen (currentScreen = planet)', () => {
    // Acceptance criteria #4: planet management screen opens after colonization
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    expect(store.getState().ui.currentScreen).toBe('planet');
  });

  it('sets ui.selectedPlanet to the colonized planet', () => {
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    expect(store.getState().ui.selectedPlanet).toBe('p1');
  });

  it('consumes the colony ship (removes from ships registry)', () => {
    // Acceptance criteria #5: colony ship is consumed
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    expect(store.getState().ships.byId['cs1']).toBeUndefined();
    expect(store.getState().ships.allIds).not.toContain('cs1');
  });

  it('dissolves fleet when it contained only the colony ship', () => {
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    expect(store.getState().fleets.byId['f1']).toBeUndefined();
    expect(store.getState().fleets.allIds).not.toContain('f1');
  });

  it('keeps escort ships when fleet had additional ships', () => {
    store = new Store(rootReducer, buildState({ withEscort: true }));
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    expect(store.getState().ships.byId['es1']).toBeDefined();
    expect(store.getState().fleets.byId['f1']).toBeDefined();
    expect(store.getState().fleets.byId['f1'].shipIds).toContain('es1');
    expect(store.getState().fleets.byId['f1'].shipIds).not.toContain('cs1');
  });

  it('adds the planet to the empire planet list', () => {
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    expect(store.getState().empires.byId['player'].planets).toContain('p1');
  });

  it('removes dissolved fleet from empire fleet list', () => {
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    expect(store.getState().empires.byId['player'].fleets).not.toContain('f1');
  });

  it('removes dissolved fleet from star system fleetIds', () => {
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    expect(store.getState().galaxy.systems.byId['s1'].fleetIds).not.toContain('f1');
  });

  it('is a no-op when planet is already colonized', () => {
    store = new Store(rootReducer, buildState({ planetAlreadyColonized: true }));
    const before = store.getState();
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    // State should not change — planet already colonized
    expect(store.getState().planets.byId['p1']).toBe(before.planets.byId['p1']);
    expect(store.getState().ui.currentScreen).toBe(before.ui.currentScreen);
  });

  it('is a no-op for unknown fleetId', () => {
    const before = store.getState();
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'nonexistent' } });
    expect(store.getState().planets.byId['p1'].isColonized).toBe(false);
    expect(store.getState()).toBe(before);
  });

  it('is a no-op for unknown planetId', () => {
    const before = store.getState();
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'nonexistent', fleetId: 'f1' } });
    expect(store.getState()).toBe(before);
  });

  it('does not mutate the original state', () => {
    const originalPlanet = store.getState().planets.byId['p1'];
    store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
    // Original planet reference should be unchanged
    expect(originalPlanet.isColonized).toBe(false);
    expect(originalPlanet.ownerId).toBeNull();
  });
});

// ── Hostile planet colonization tests ────────────────────────────────────────

describe('COLONIZE_PLANET — hostile planet environments (design/planets/planet-types.md)', () => {
  /**
   * Hostile environments require Controlled [Environment] tech from Planetology.
   * Standard environments: terran, ocean, jungle, arid, steppe, desert, minimal, gaia
   * Hostile environments: toxic, radiated, dead, inferno, tundra, barren
   */

  const HOSTILE_TYPES: PlanetType[] = ['toxic', 'radiated', 'dead', 'inferno', 'tundra', 'barren'];
  const STANDARD_TYPES: PlanetType[] = ['terran', 'ocean', 'jungle', 'arid', 'steppe', 'desert', 'minimal', 'gaia'];

  it.each(STANDARD_TYPES)(
    'standard environment (%s) can be colonized without any tech',
    (type) => {
      const store = new Store(rootReducer, buildState({ planetType: type }));
      store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
      // Should succeed
      expect(store.getState().planets.byId['p1'].isColonized).toBe(true);
    },
  );

  it.each(HOSTILE_TYPES)(
    'hostile environment (%s) cannot be colonized without Controlled Environment tech',
    (type) => {
      // No tech → colonization should fail
      const store = new Store(rootReducer, buildState({ planetType: type, completedTechs: [] }));
      store.dispatch({ type: 'COLONIZE_PLANET', payload: { planetId: 'p1', fleetId: 'f1' } });
      // canColonize in colonization.ts should block this
      // NOTE: if not yet implemented, this test documents the requirement
      expect(store.getState().planets.byId['p1'].isColonized).toBe(false);
    },
  );
});
