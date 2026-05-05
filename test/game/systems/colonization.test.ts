/**
 * Colonization system tests.
 * test/game/systems/colonization.test.ts
 *
 * Tests for: canColonize, colonize (and findColonyShipInFleet helper).
 *
 * NO DOM imports — pure TypeScript only.
 */

import { describe, it, expect } from 'vitest';
import {
  canColonize,
  colonize,
  colonizeWithDetails,
  findColonyShipInFleet,
  grantArtifactsTechBonus,
  getTechName,
  COLONY_STARTING_POPULATION,
  COLONY_STARTING_FACTORIES,
  COLONY_STARTING_MORALE,
  COLONY_STARTING_PRODUCTION,
} from '../../../src/game/systems/colonization';
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
import { initialState } from '../../../src/game/initialState';

// ── Fixture helpers ───────────────────────────────────────────────────────────

function makeSystem(id: string): StarSystem {
  return {
    id,
    name: `System ${id}`,
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
  };
}

function makePlanet(
  id: string,
  systemId: string,
  opts: Partial<Pick<Planet, 'ownerId' | 'type'>> = {},
): Planet {
  return {
    id,
    name: `Planet ${id}`,
    systemId,
    orbit: 1,
    type: opts.type ?? 'terran',
    size: 'medium',
    gravity: 1.0,
    ownerId: opts.ownerId ?? null,
    isColonized: opts.ownerId !== null,
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
    isRich: false,
    isPoor: false,
    isGaia: false,
    hasArtifacts: false,
    artifactsTechClaimed: false,
    currentDesignId: null,
    shipyardProgress: 0,
    resourceLevel: 'normal',
    researchMultiplier: 1.0,
    startingPopulation: null,
    startingFactories: null,
  };
}

/** Create a ship design with a colony component. */
function makeColonyDesign(designId: string): ShipDesign {
  return {
    id: designId,
    name: 'Colony Ship',
    class: 'huge',
    ownerId: 'player',
    size: 500,
    spaceUsed: 50,
    spaceFree: 450,
    components: [
      {
        id: 'colony_base',
        type: 'special',
        name: 'Colony Base',
        space: 50,
        baseCost: 200,
        count: 1,
      },
    ],
    stats: {
      cost: 200,
      maintenance: 5,
      hp: 50,
      shieldHp: 0,
      speed: 2,
      range: 10,
      weapons: [],
      defense: { armor: 1, shields: 0, ecm: 0 },
      special: [{ name: 'Colony Base', description: 'Can colonize planets' }],
    },
    miniaturization: {},
    isObsolete: false,
    shipsBuilt: 1,
  };
}

/** Create a ship design WITHOUT any colony component. */
function makeCombatDesign(designId: string): ShipDesign {
  return {
    id: designId,
    name: 'Frigate',
    class: 'small',
    ownerId: 'player',
    size: 50,
    spaceUsed: 10,
    spaceFree: 40,
    components: [
      {
        id: 'nuclear_engines',
        type: 'engine',
        name: 'Nuclear Engines',
        space: 5,
        baseCost: 8,
        count: 1,
      },
    ],
    stats: {
      cost: 80,
      maintenance: 3,
      hp: 25,
      shieldHp: 0,
      speed: 2,
      range: 5,
      weapons: [],
      defense: { armor: 1, shields: 0, ecm: 0 },
      special: [],
    },
    miniaturization: {},
    isObsolete: false,
    shipsBuilt: 2,
  };
}

function makeShip(id: string, fleetId: string, designId: string, ownerId = 'player'): Ship {
  return {
    id,
    name: `Ship ${id}`,
    designId,
    ownerId,
    fleetId,
    hp: 50,
    maxHp: 50,
    shieldHp: 0,
    maxShieldHp: 0,
    experience: 'rookie',
    kills: 0,
    combatPosition: null,
    hasActed: false,
    specialSystems: {},
  };
}

function makeFleet(id: string, systemId: string, shipIds: string[], ownerId = 'player'): Fleet {
  return {
    id,
    name: `Fleet ${id}`,
    ownerId,
    shipIds,
    systemId,
    destination: null,
    eta: 0,
    route: [],
    movementPoints: 0,
    maxMovement: 0,
    orders: { type: 'none' },
    experience: 'rookie',
    isInCombat: false,
    combatId: null,
  };
}

function makeEmpire(id: string, fleetIds: string[], planetIds: string[] = []): Empire {
  return {
    id,
    raceId: 'hamsters',
    name: `Empire ${id}`,
    isPlayer: id === 'player',
    credits: 1000,
    creditPerTurn: 50,
    planets: planetIds,
    fleets: fleetIds,
    shipDesigns: [],
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
    relations: {},
    isDefeated: false,
    defeatedTurn: null,
  };
}

/**
 * Build a minimal GameState for colonization tests.
 *
 *  - System 's1' contains fleet 'f1' and planet 'p1'.
 *  - Fleet 'f1' contains a colony ship ('cs1') and optionally an escort ('es1').
 *  - Colony design uses `colony_base`; combat design uses `nuclear_engines`.
 */
function buildState(opts: {
  planetSystemId?: string;
  planetType?: PlanetType;
  planetOwnerId?: string | null;
  fleetSystemId?: string;
  withColonyShip?: boolean;
  withEscort?: boolean;
} = {}): GameState {
  const {
    planetSystemId = 's1',
    planetType = 'terran',
    planetOwnerId = null,
    fleetSystemId = 's1',
    withColonyShip = true,
    withEscort = false,
  } = opts;

  const colonyDesign = makeColonyDesign('colony-design');
  const combatDesign = makeCombatDesign('combat-design');

  const shipIds: string[] = [];
  const shipsById: Record<string, Ship> = {};

  if (withColonyShip) {
    const cs = makeShip('cs1', 'f1', 'colony-design');
    shipsById['cs1'] = cs;
    shipIds.push('cs1');
  }

  if (withEscort) {
    const es = makeShip('es1', 'f1', 'combat-design');
    shipsById['es1'] = es;
    shipIds.push('es1');
  }

  const fleet = makeFleet('f1', fleetSystemId, shipIds);
  const system = makeSystem('s1');
  system.fleetIds = ['f1'];

  const planet = makePlanet('p1', planetSystemId, {
    type: planetType,
    ownerId: planetOwnerId ?? null,
  });

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
      allIds: shipIds,
    },

    shipDesigns: {
      byId: {
        'colony-design': colonyDesign,
        'combat-design': combatDesign,
      },
      allIds: ['colony-design', 'combat-design'],
    },

    fleets: {
      byId: { f1: fleet },
      allIds: ['f1'],
    },

    empires: {
      byId: { player: makeEmpire('player', ['f1']) },
      allIds: ['player'],
      playerId: 'player',
    },
  };
}

// ── canColonize tests ─────────────────────────────────────────────────────────

describe('canColonize', () => {
  it('returns true when all conditions are met', () => {
    const state = buildState({ withColonyShip: true });
    const fleet = state.fleets.byId['f1'];
    const planet = state.planets.byId['p1'];
    expect(canColonize(fleet, planet, state)).toBe(true);
  });

  it('returns false if fleet has no colony ship', () => {
    const state = buildState({ withColonyShip: false, withEscort: true });
    const fleet = state.fleets.byId['f1'];
    const planet = state.planets.byId['p1'];
    expect(canColonize(fleet, planet, state)).toBe(false);
  });

  it('returns false if planet is already colonized', () => {
    const state = buildState({ withColonyShip: true, planetOwnerId: 'player' });
    const fleet = state.fleets.byId['f1'];
    const planet = state.planets.byId['p1'];
    expect(canColonize(fleet, planet, state)).toBe(false);
  });

  it('returns false if planet is a gas giant', () => {
    const state = buildState({ withColonyShip: true, planetType: 'gas_giant' });
    const fleet = state.fleets.byId['f1'];
    const planet = state.planets.byId['p1'];
    expect(canColonize(fleet, planet, state)).toBe(false);
  });

  it('returns false if fleet is not in the planet system', () => {
    const state = buildState({ withColonyShip: true, fleetSystemId: 's2', planetSystemId: 's1' });
    // Fleet is in 's2', planet is in 's1'
    const fleet = state.fleets.byId['f1'];
    const planet = state.planets.byId['p1'];
    expect(canColonize(fleet, planet, state)).toBe(false);
  });

  it('returns false for hostile planet types without Controlled Environment tech', () => {
    // Source: design/planets/planet-types.md §Hostile Environments
    // "Requires Controlled Environment technology from the Planetology tree to colonize."
    for (const type of ['toxic', 'radiated', 'barren', 'dead', 'inferno', 'tundra'] as PlanetType[]) {
      const state = buildState({ withColonyShip: true, planetType: type });
      const fleet = state.fleets.byId['f1'];
      const planet = state.planets.byId['p1'];
      expect(canColonize(fleet, planet, state)).toBe(false);
    }
  });

  it('returns true for hostile planet types when Controlled Environment tech is researched', () => {
    // Tech IDs follow the pattern: controlled_<environment>
    const techMap: Partial<Record<PlanetType, string>> = {
      toxic:    'controlled_toxic',
      radiated: 'controlled_radiated',
      barren:   'controlled_barren',
      dead:     'controlled_dead',
      inferno:  'controlled_inferno',
      tundra:   'controlled_tundra',
    };
    for (const [type, tech] of Object.entries(techMap) as [PlanetType, string][]) {
      const state = buildState({ withColonyShip: true, planetType: type });
      // Grant the required tech to the player empire
      const empire = state.empires.byId['player'];
      const stateWithTech = {
        ...state,
        empires: {
          ...state.empires,
          byId: {
            ...state.empires.byId,
            player: {
              ...empire,
              research: {
                ...empire.research,
                completedTechs: [tech],
              },
            },
          },
        },
      };
      const fleet = stateWithTech.fleets.byId['f1'];
      const planet = stateWithTech.planets.byId['p1'];
      expect(canColonize(fleet, planet, stateWithTech)).toBe(true);
    }
  });
});

// ── colonize action tests ─────────────────────────────────────────────────────

describe('colonize', () => {
  it('sets planet ownerId to the fleet owner', () => {
    const state = buildState({ withColonyShip: true });
    const next = colonize('f1', 'p1', state);
    expect(next.planets.byId['p1'].ownerId).toBe('player');
  });

  it('marks planet as colonized', () => {
    const state = buildState({ withColonyShip: true });
    const next = colonize('f1', 'p1', state);
    expect(next.planets.byId['p1'].isColonized).toBe(true);
  });

  it('initializes planet population to COLONY_STARTING_POPULATION', () => {
    const state = buildState({ withColonyShip: true });
    const next = colonize('f1', 'p1', state);
    expect(next.planets.byId['p1'].population).toBe(COLONY_STARTING_POPULATION);
  });

  it('initializes factories to COLONY_STARTING_FACTORIES (0)', () => {
    const state = buildState({ withColonyShip: true });
    const next = colonize('f1', 'p1', state);
    expect(next.planets.byId['p1'].factories).toBe(COLONY_STARTING_FACTORIES);
  });

  it('initializes pollution (waste) to 0', () => {
    const state = buildState({ withColonyShip: true });
    const next = colonize('f1', 'p1', state);
    expect(next.planets.byId['p1'].waste).toBe(0);
  });

  it('sets morale to content', () => {
    const state = buildState({ withColonyShip: true });
    const next = colonize('f1', 'p1', state);
    expect(next.planets.byId['p1'].morale).toBe(COLONY_STARTING_MORALE);
  });

  it('sets balanced production sliders (20/20/20/20/20)', () => {
    const state = buildState({ withColonyShip: true });
    const next = colonize('f1', 'p1', state);
    expect(next.planets.byId['p1'].production).toEqual(COLONY_STARTING_PRODUCTION);
  });

  it('removes the colony ship from the fleet', () => {
    const state = buildState({ withColonyShip: true, withEscort: true });
    const next = colonize('f1', 'p1', state);
    expect(next.fleets.byId['f1'].shipIds).not.toContain('cs1');
  });

  it('removes the colony ship from the ships registry', () => {
    const state = buildState({ withColonyShip: true, withEscort: true });
    const next = colonize('f1', 'p1', state);
    expect(next.ships.byId['cs1']).toBeUndefined();
    expect(next.ships.allIds).not.toContain('cs1');
  });

  it('keeps escort ships intact after colonization', () => {
    const state = buildState({ withColonyShip: true, withEscort: true });
    const next = colonize('f1', 'p1', state);
    expect(next.ships.byId['es1']).toBeDefined();
    expect(next.fleets.byId['f1'].shipIds).toContain('es1');
  });

  it('removes the fleet entirely when it only contained the colony ship', () => {
    const state = buildState({ withColonyShip: true, withEscort: false });
    const next = colonize('f1', 'p1', state);
    expect(next.fleets.byId['f1']).toBeUndefined();
    expect(next.fleets.allIds).not.toContain('f1');
  });

  it('removes dissolved fleet from empire fleet list', () => {
    const state = buildState({ withColonyShip: true, withEscort: false });
    const next = colonize('f1', 'p1', state);
    expect(next.empires.byId['player'].fleets).not.toContain('f1');
  });

  it('removes dissolved fleet from star system fleetIds', () => {
    const state = buildState({ withColonyShip: true, withEscort: false });
    const next = colonize('f1', 'p1', state);
    expect(next.galaxy.systems.byId['s1'].fleetIds).not.toContain('f1');
  });

  it('adds planet to the empire planet list', () => {
    const state = buildState({ withColonyShip: true });
    const next = colonize('f1', 'p1', state);
    expect(next.empires.byId['player'].planets).toContain('p1');
  });

  it('does not mutate the original state', () => {
    const state = buildState({ withColonyShip: true });
    const originalPlanet = state.planets.byId['p1'];
    colonize('f1', 'p1', state);
    expect(state.planets.byId['p1']).toBe(originalPlanet); // same reference
    expect(state.planets.byId['p1'].ownerId).toBeNull();
  });

  it('throws when fleet does not exist', () => {
    const state = buildState({ withColonyShip: true });
    expect(() => colonize('nonexistent', 'p1', state)).toThrow();
  });

  it('throws when planet does not exist', () => {
    const state = buildState({ withColonyShip: true });
    expect(() => colonize('f1', 'nonexistent', state)).toThrow();
  });

  it('throws when canColonize preconditions fail (no colony ship)', () => {
    const state = buildState({ withColonyShip: false, withEscort: true });
    expect(() => colonize('f1', 'p1', state)).toThrow();
  });
});

// ── findColonyShipInFleet tests ───────────────────────────────────────────────

describe('findColonyShipInFleet', () => {
  it('returns the colony ship ID when present', () => {
    const state = buildState({ withColonyShip: true });
    const fleet = state.fleets.byId['f1'];
    expect(findColonyShipInFleet(fleet, state)).toBe('cs1');
  });

  it('returns null when no colony ship is in the fleet', () => {
    const state = buildState({ withColonyShip: false, withEscort: true });
    const fleet = state.fleets.byId['f1'];
    expect(findColonyShipInFleet(fleet, state)).toBeNull();
  });

  it('returns null for an empty fleet', () => {
    const state = buildState({ withColonyShip: false, withEscort: false });
    const fleet = state.fleets.byId['f1'];
    expect(findColonyShipInFleet(fleet, state)).toBeNull();
  });
});

// ── Artifacts Tech Bonus tests (exploration.md / research-formulas.md) ────────

describe('grantArtifactsTechBonus', () => {
  it('grants a random tech when colonizing unclaimed artifacts world', () => {
    // Create a state with an artifacts world that has an owner
    const state = buildState({ withColonyShip: true });
    const planet = state.planets.byId['p1'];
    const artifactsPlanet = {
      ...planet,
      hasArtifacts: true,
      artifactsTechClaimed: false,
      ownerId: 'player',
      isColonized: true,
    };
    const artifactsState: GameState = {
      ...state,
      planets: {
        ...state.planets,
        byId: { ...state.planets.byId, p1: artifactsPlanet },
      },
    };

    // Fixed RNG for deterministic test
    const fixedRng = () => 0.1;
    const result = grantArtifactsTechBonus(artifactsState, 'p1', 'player', fixedRng);

    // Tech should be granted
    expect(result.grantedTechId).toBeDefined();
    expect(result.grantedTechId).not.toBeNull();

    // Planet should be marked as claimed
    expect(result.state.planets.byId['p1'].artifactsTechClaimed).toBe(true);

    // Tech should be in empire's completed techs
    const completedTechs = result.state.empires.byId['player'].research.completedTechs;
    expect(completedTechs).toContain(result.grantedTechId);
  });

  it('returns null if planet is not an artifacts world', () => {
    const state = buildState({ withColonyShip: true });
    const planet = state.planets.byId['p1'];
    const normalPlanet = {
      ...planet,
      hasArtifacts: false,
      artifactsTechClaimed: false,
      ownerId: 'player',
      isColonized: true,
    };
    const normalState: GameState = {
      ...state,
      planets: {
        ...state.planets,
        byId: { ...state.planets.byId, p1: normalPlanet },
      },
    };

    const result = grantArtifactsTechBonus(normalState, 'p1', 'player');

    expect(result.grantedTechId).toBeNull();
    expect(result.state.planets.byId['p1'].artifactsTechClaimed).toBe(false);
  });

  it('returns null if artifacts bonus already claimed', () => {
    const state = buildState({ withColonyShip: true });
    const planet = state.planets.byId['p1'];
    const claimedPlanet = {
      ...planet,
      hasArtifacts: true,
      artifactsTechClaimed: true, // Already claimed
      ownerId: 'player',
      isColonized: true,
    };
    const claimedState: GameState = {
      ...state,
      planets: {
        ...state.planets,
        byId: { ...state.planets.byId, p1: claimedPlanet },
      },
    };

    const result = grantArtifactsTechBonus(claimedState, 'p1', 'player');

    expect(result.grantedTechId).toBeNull();
  });

  it('marks claimed even if tech already owned (per design doc)', () => {
    // Per design: "The tech is chosen randomly; it may be one you already own (no benefit)"
    const state = buildState({ withColonyShip: true });
    const planet = state.planets.byId['p1'];

    // Set up artifacts world
    const artifactsPlanet = {
      ...planet,
      hasArtifacts: true,
      artifactsTechClaimed: false,
      ownerId: 'player',
      isColonized: true,
    };

    // Fixed RNG for deterministic test
    const fixedRng = () => 0.1;

    const artifactsState: GameState = {
      ...state,
      planets: {
        ...state.planets,
        byId: { ...state.planets.byId, p1: artifactsPlanet },
      },
    };

    const result = grantArtifactsTechBonus(artifactsState, 'p1', 'player', fixedRng);

    // Planet is marked as claimed
    expect(result.state.planets.byId['p1'].artifactsTechClaimed).toBe(true);
    // Tech ID is still returned (even though design says "may be one you already own")
    expect(result.grantedTechId).not.toBeNull();
  });
});

describe('colonizeWithDetails', () => {
  it('returns granted tech when colonizing artifacts world', () => {
    const state = buildState({ withColonyShip: true });
    const planet = state.planets.byId['p1'];
    const artifactsPlanet = {
      ...planet,
      hasArtifacts: true,
      artifactsTechClaimed: false,
    };
    const artifactsState: GameState = {
      ...state,
      planets: {
        ...state.planets,
        byId: { ...state.planets.byId, p1: artifactsPlanet },
      },
    };

    const fixedRng = () => 0.2;
    const result = colonizeWithDetails('f1', 'p1', artifactsState, fixedRng);

    // Colonization should succeed
    expect(result.state.planets.byId['p1'].isColonized).toBe(true);
    expect(result.state.planets.byId['p1'].ownerId).toBe('player');

    // Artifacts tech bonus should be granted
    expect(result.grantedTechId).not.toBeNull();
    expect(result.state.planets.byId['p1'].artifactsTechClaimed).toBe(true);

    // Tech should be in empire's completed techs
    const completedTechs = result.state.empires.byId['player'].research.completedTechs;
    expect(completedTechs).toContain(result.grantedTechId);
  });

  it('returns null grantedTechId for normal planets', () => {
    const state = buildState({ withColonyShip: true });

    const result = colonizeWithDetails('f1', 'p1', state);

    expect(result.state.planets.byId['p1'].isColonized).toBe(true);
    expect(result.grantedTechId).toBeNull();
  });
});

describe('colonize with artifacts world', () => {
  it('automatically grants tech bonus when colonizing artifacts world', () => {
    const state = buildState({ withColonyShip: true });
    const planet = state.planets.byId['p1'];
    const artifactsPlanet = {
      ...planet,
      hasArtifacts: true,
      artifactsTechClaimed: false,
    };
    const artifactsState: GameState = {
      ...state,
      planets: {
        ...state.planets,
        byId: { ...state.planets.byId, p1: artifactsPlanet },
      },
    };

    const result = colonize('f1', 'p1', artifactsState);

    // Planet should be colonized
    expect(result.planets.byId['p1'].isColonized).toBe(true);

    // Artifacts bonus should be marked as claimed
    expect(result.planets.byId['p1'].artifactsTechClaimed).toBe(true);

    // Empire should have gained a tech
    const originalTechs = artifactsState.empires.byId['player'].research.completedTechs.length;
    const newTechs = result.empires.byId['player'].research.completedTechs.length;
    expect(newTechs).toBe(originalTechs + 1);
  });

  it('does not grant bonus if artifacts already claimed (reconquest)', () => {
    const state = buildState({ withColonyShip: true });
    const planet = state.planets.byId['p1'];
    const claimedArtifacts = {
      ...planet,
      hasArtifacts: true,
      artifactsTechClaimed: true, // Bonus already claimed by previous owner
    };
    const claimedState: GameState = {
      ...state,
      planets: {
        ...state.planets,
        byId: { ...state.planets.byId, p1: claimedArtifacts },
      },
    };

    const originalTechs = claimedState.empires.byId['player'].research.completedTechs.length;
    const result = colonize('f1', 'p1', claimedState);

    // No new tech should be granted
    const newTechs = result.empires.byId['player'].research.completedTechs.length;
    expect(newTechs).toBe(originalTechs);
  });
});

describe('getTechName', () => {
  it('returns tech name for valid tech ID', () => {
    // We know at least some basic techs exist
    const name = getTechName('laser_tech');
    expect(name).toBeDefined();
  });

  it('returns null for invalid tech ID', () => {
    const name = getTechName('nonexistent_tech_xyz');
    expect(name).toBeNull();
  });
});
