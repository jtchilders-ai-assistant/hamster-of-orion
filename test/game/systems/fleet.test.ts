/**
 * Fleet system tests.
 * test/game/systems/fleet.test.ts
 *
 * Tests for: moveFleet, mergeFleets, splitFleet, scrapFleet,
 *            processFleetMovement, ETA calculation, distance logic.
 *
 * NO DOM imports — pure TypeScript only.
 */

import { describe, it, expect } from 'vitest';
import {
  moveFleet,
  mergeFleets,
  splitFleet,
  scrapFleet,
  processFleetMovement,
  calculateEta,
  distanceBetweenSystems,
  getFleetWarpSpeed,
  systemHasStarGate,
  canUseStarGateTravel,
} from '../../../src/game/systems/fleet';
import { GameState, Fleet, Ship, ShipDesign, StarSystem, Empire, Planet, BuildingId, PlanetId } from '../../../src/game/state';
import { initialState } from '../../../src/game/initialState';

// ── Test fixture helpers ───────────────────────────────────────────────────────

function makeSystem(id: string, x: number, y: number): StarSystem {
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

function makeDesignWithEngine(designId: string, engineId: string): ShipDesign {
  return {
    id: designId,
    name: `Design ${designId}`,
    class: 'small',
    ownerId: 'player',
    size: 50,
    spaceUsed: 10,
    spaceFree: 40,
    components: [
      {
        id: engineId,
        type: 'engine',
        name: 'Engine',
        space: 5,
        baseCost: 8,
        count: 1,
      },
    ],
    stats: {
      cost: 100,
      maintenance: 5,
      hp: 10,
      shieldHp: 0,
      speed: 1,
      range: 5,
      weapons: [],
      defense: { armor: 1, shields: 0, ecm: 0 },
      special: [],
    },
    miniaturization: {},
    isObsolete: false,
    shipsBuilt: 0,
  };
}

function makeShip(
  id: string,
  fleetId: string,
  designId: string,
  ownerId = 'player',
): Ship {
  return {
    id,
    name: `Ship ${id}`,
    designId,
    ownerId,
    fleetId,
    hp: 10,
    maxHp: 10,
    shieldHp: 0,
    maxShieldHp: 0,
    experience: 'rookie',
    kills: 0,
    combatPosition: null,
    hasActed: false,
    specialSystems: {},
  };
}

function makeFleet(
  id: string,
  systemId: string,
  shipIds: string[],
  ownerId = 'player',
): Fleet {
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

function makeEmpire(id: string, fleetIds: string[]): Empire {
  return {
    id,
    raceId: 'hamsters',
    name: `Empire ${id}`,
    isPlayer: id === 'player',
    credits: 1000,
    creditPerTurn: 50,
    planets: [],
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
 * Build a minimal GameState with two systems (s1, s2), a ship design,
 * ships, and fleets as specified.
 */
function buildState({
  system1 = { id: 's1', x: 0, y: 0 },
  system2 = { id: 's2', x: 3, y: 4 }, // distance = 5
  engineId = 'retro_engines', // warpSpeed=1 from components.json
  fleets = [{ id: 'f1', systemId: 's1', shipIds: ['ship1', 'ship2'] }],
}: {
  system1?: { id: string; x: number; y: number };
  system2?: { id: string; x: number; y: number };
  engineId?: string;
  fleets?: Array<{ id: string; systemId: string; shipIds: string[] }>;
} = {}): GameState {
  const designId = 'design1';
  const design = makeDesignWithEngine(designId, engineId);

  const allShipIds = fleets.flatMap((f) => f.shipIds);
  const shipsById: Record<string, Ship> = {};
  for (const f of fleets) {
    for (const shipId of f.shipIds) {
      shipsById[shipId] = makeShip(shipId, f.id, designId);
    }
  }

  const fleetsById: Record<string, Fleet> = {};
  for (const f of fleets) {
    fleetsById[f.id] = makeFleet(f.id, f.systemId, f.shipIds);
  }

  const fleetIds = fleets.map((f) => f.id);

  const sys1 = makeSystem(system1.id, system1.x, system1.y);
  const sys2 = makeSystem(system2.id, system2.x, system2.y);
  // Assign fleets to their systems
  for (const f of fleets) {
    if (f.systemId === sys1.id) {
      sys1.fleetIds.push(f.id);
    } else if (f.systemId === sys2.id) {
      sys2.fleetIds.push(f.id);
    }
  }

  return {
    ...initialState,
    galaxy: {
      ...initialState.galaxy,
      systems: {
        byId: { [sys1.id]: sys1, [sys2.id]: sys2 },
        allIds: [sys1.id, sys2.id],
      },
    },
    ships: {
      byId: shipsById,
      allIds: allShipIds,
    },
    shipDesigns: {
      byId: { [designId]: design },
      allIds: [designId],
    },
    fleets: {
      byId: fleetsById,
      allIds: fleetIds,
    },
    empires: {
      byId: { player: makeEmpire('player', fleetIds) },
      allIds: ['player'],
      playerId: 'player',
    },
  };
}

// ── Distance tests ─────────────────────────────────────────────────────────────

describe('distanceBetweenSystems', () => {
  it('calculates Euclidean distance correctly', () => {
    const state = buildState({
      system1: { id: 's1', x: 0, y: 0 },
      system2: { id: 's2', x: 3, y: 4 },
    });
    const dist = distanceBetweenSystems('s1', 's2', state);
    expect(dist).toBeCloseTo(5.0);
  });

  it('returns 0 for same system', () => {
    const state = buildState();
    const dist = distanceBetweenSystems('s1', 's1', state);
    expect(dist).toBe(0);
  });

  it('returns 0 for unknown system', () => {
    const state = buildState();
    const dist = distanceBetweenSystems('s1', 'unknown', state);
    expect(dist).toBe(0);
  });
});

// ── Warp speed tests ───────────────────────────────────────────────────────────

describe('getFleetWarpSpeed', () => {
  it('returns warp speed of slowest ship (retro_engines = warp 1)', () => {
    const state = buildState({ engineId: 'retro_engines' });
    const fleet = state.fleets.byId['f1'];
    const speed = getFleetWarpSpeed(fleet, state);
    expect(speed).toBe(1);
  });

  it('returns 0 for empty fleet', () => {
    const state = buildState({ fleets: [{ id: 'f1', systemId: 's1', shipIds: [] }] });
    const fleet = state.fleets.byId['f1'];
    const speed = getFleetWarpSpeed(fleet, state);
    expect(speed).toBe(0);
  });
});

// ── ETA calculation ────────────────────────────────────────────────────────────

describe('calculateEta', () => {
  it('rounds up fractional travel time', () => {
    // distance = 5, warpSpeed = 1 → ETA = ceil(5/1) = 5
    const state = buildState({
      system1: { id: 's1', x: 0, y: 0 },
      system2: { id: 's2', x: 3, y: 4 }, // distance = 5
      engineId: 'retro_engines', // warpSpeed = 1
    });
    const fleet = state.fleets.byId['f1'];
    const eta = calculateEta(fleet, 's2', state);
    expect(eta).toBe(5);
  });

  it('always returns whole number of turns', () => {
    // distance = sqrt(2) ≈ 1.41, warpSpeed = 1 → ETA = ceil(1.41) = 2
    const state = buildState({
      system1: { id: 's1', x: 0, y: 0 },
      system2: { id: 's2', x: 1, y: 1 },
      engineId: 'retro_engines',
    });
    const fleet = state.fleets.byId['f1'];
    const eta = calculateEta(fleet, 's2', state);
    expect(Number.isInteger(eta)).toBe(true);
    expect(eta).toBe(2); // ceil(1.41) = 2
  });

  it('returns 0 for current location', () => {
    const state = buildState();
    const fleet = state.fleets.byId['f1'];
    const eta = calculateEta(fleet, 's1', state);
    expect(eta).toBe(0);
  });
});

// ── moveFleet ─────────────────────────────────────────────────────────────────

describe('moveFleet', () => {
  it('sets destination on the fleet', () => {
    const state = buildState();
    const result = moveFleet(state, 'f1', 's2');
    expect(result.success).toBe(true);
    expect(result.state.fleets.byId['f1'].destination).toBe('s2');
  });

  it('calculates correct ETA based on slowest ship engine speed', () => {
    // distance(s1→s2) = 5, warpSpeed(retro_engines) = 1 → ETA = 5
    const state = buildState({
      system1: { id: 's1', x: 0, y: 0 },
      system2: { id: 's2', x: 3, y: 4 },
      engineId: 'retro_engines',
    });
    const result = moveFleet(state, 'f1', 's2');
    expect(result.success).toBe(true);
    expect(result.state.fleets.byId['f1'].eta).toBe(5);
  });

  it('rejects move to current location', () => {
    const state = buildState();
    const result = moveFleet(state, 'f1', 's1'); // s1 is the fleet's current system
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/current location/i);
    // State should be unchanged
    expect(result.state).toBe(state);
  });

  it('rejects move for nonexistent fleet', () => {
    const state = buildState();
    const result = moveFleet(state, 'no-fleet', 's2');
    expect(result.success).toBe(false);
    expect(result.state).toBe(state);
  });

  it('sets orders to move', () => {
    const state = buildState();
    const result = moveFleet(state, 'f1', 's2');
    expect(result.success).toBe(true);
    const fleet = result.state.fleets.byId['f1'];
    expect(fleet.orders).toEqual({ type: 'move', target: 's2' });
  });
});

// ── processFleetMovement ───────────────────────────────────────────────────────

describe('processFleetMovement', () => {
  it('decrements ETA each turn for in-transit fleets', () => {
    // Set up fleet already en route with ETA=3
    const baseState = buildState();
    const stateWithMove = moveFleet(baseState, 'f1', 's2').state;
    // Manually set eta=3 for predictability
    const stateWithEta3: GameState = {
      ...stateWithMove,
      fleets: {
        ...stateWithMove.fleets,
        byId: {
          ...stateWithMove.fleets.byId,
          f1: { ...stateWithMove.fleets.byId['f1'], eta: 3 },
        },
      },
    };
    const after = processFleetMovement(stateWithEta3);
    expect(after.fleets.byId['f1'].eta).toBe(2);
    expect(after.fleets.byId['f1'].destination).toBe('s2'); // still in transit
  });

  it('moves fleet to destination when ETA reaches 0', () => {
    // Set fleet with eta=1, so after one turn it arrives
    const baseState = buildState();
    const stateWithFleetMoving: GameState = {
      ...baseState,
      fleets: {
        ...baseState.fleets,
        byId: {
          ...baseState.fleets.byId,
          f1: {
            ...baseState.fleets.byId['f1'],
            destination: 's2',
            eta: 1,
            orders: { type: 'move', target: 's2' },
          },
        },
      },
    };
    const after = processFleetMovement(stateWithFleetMoving);
    const fleet = after.fleets.byId['f1'];
    expect(fleet.systemId).toBe('s2');
    expect(fleet.destination).toBeNull();
    expect(fleet.eta).toBe(0);
  });

  it('updates star system fleetIds when fleet arrives', () => {
    const baseState = buildState();
    const stateWithFleetMoving: GameState = {
      ...baseState,
      fleets: {
        ...baseState.fleets,
        byId: {
          ...baseState.fleets.byId,
          f1: {
            ...baseState.fleets.byId['f1'],
            destination: 's2',
            eta: 1,
            orders: { type: 'move', target: 's2' },
          },
        },
      },
    };
    const after = processFleetMovement(stateWithFleetMoving);
    // Fleet should appear in s2's fleetIds, removed from s1's
    expect(after.galaxy.systems.byId['s2'].fleetIds).toContain('f1');
    expect(after.galaxy.systems.byId['s1'].fleetIds).not.toContain('f1');
  });

  it('does not move stationary fleets', () => {
    const state = buildState();
    const after = processFleetMovement(state);
    expect(after.fleets.byId['f1'].systemId).toBe('s1');
    expect(after.fleets.byId['f1'].destination).toBeNull();
  });
});

// ── mergeFleets ───────────────────────────────────────────────────────────────

describe('mergeFleets', () => {
  function buildMergeState() {
    return buildState({
      fleets: [
        { id: 'f1', systemId: 's1', shipIds: ['ship1', 'ship2'] },
        { id: 'f2', systemId: 's1', shipIds: ['ship3'] },
      ],
    });
  }

  it('combines ship lists from both fleets', () => {
    const state = buildMergeState();
    const result = mergeFleets(state, 'f1', 'f2');
    expect(result.success).toBe(true);
    const merged = result.state.fleets.byId['f1'];
    expect(merged.shipIds).toContain('ship1');
    expect(merged.shipIds).toContain('ship2');
    expect(merged.shipIds).toContain('ship3');
    expect(merged.shipIds.length).toBe(3);
  });

  it('removes the source fleet from state', () => {
    const state = buildMergeState();
    const result = mergeFleets(state, 'f1', 'f2');
    expect(result.success).toBe(true);
    expect(result.state.fleets.byId['f2']).toBeUndefined();
    expect(result.state.fleets.allIds).not.toContain('f2');
  });

  it('updates merged ships to point to target fleet', () => {
    const state = buildMergeState();
    const result = mergeFleets(state, 'f1', 'f2');
    expect(result.success).toBe(true);
    expect(result.state.ships.byId['ship3'].fleetId).toBe('f1');
  });

  it('rejects merge of fleets at different locations', () => {
    const state = buildState({
      fleets: [
        { id: 'f1', systemId: 's1', shipIds: ['ship1'] },
        { id: 'f2', systemId: 's2', shipIds: ['ship2'] },
      ],
    });
    const result = mergeFleets(state, 'f1', 'f2');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/different locations/i);
    expect(result.state).toBe(state);
  });

  it('rejects merge for nonexistent fleet', () => {
    const state = buildMergeState();
    const result = mergeFleets(state, 'f1', 'no-fleet');
    expect(result.success).toBe(false);
  });

  it('removes source fleet from empire fleet list', () => {
    const state = buildMergeState();
    const result = mergeFleets(state, 'f1', 'f2');
    expect(result.success).toBe(true);
    expect(result.state.empires.byId['player'].fleets).not.toContain('f2');
    expect(result.state.empires.byId['player'].fleets).toContain('f1');
  });
});

// ── splitFleet ────────────────────────────────────────────────────────────────

describe('splitFleet', () => {
  function buildSplitState() {
    return buildState({
      fleets: [
        { id: 'f1', systemId: 's1', shipIds: ['ship1', 'ship2', 'ship3'] },
      ],
    });
  }

  it('creates a new fleet with the selected ships', () => {
    const state = buildSplitState();
    const result = splitFleet(state, 'f1', ['ship1']);
    expect(result.success).toBe(true);
    const newFleetId = result.newFleetId!;
    const newFleet = result.state.fleets.byId[newFleetId];
    expect(newFleet).toBeDefined();
    expect(newFleet.shipIds).toContain('ship1');
    expect(newFleet.shipIds.length).toBe(1);
  });

  it('removes selected ships from source fleet', () => {
    const state = buildSplitState();
    const result = splitFleet(state, 'f1', ['ship1']);
    expect(result.success).toBe(true);
    const sourceFleet = result.state.fleets.byId['f1'];
    expect(sourceFleet.shipIds).not.toContain('ship1');
    expect(sourceFleet.shipIds).toContain('ship2');
    expect(sourceFleet.shipIds).toContain('ship3');
  });

  it('updates split ships to point to new fleet', () => {
    const state = buildSplitState();
    const result = splitFleet(state, 'f1', ['ship1']);
    expect(result.success).toBe(true);
    const newFleetId = result.newFleetId!;
    expect(result.state.ships.byId['ship1'].fleetId).toBe(newFleetId);
    // Non-split ships unchanged
    expect(result.state.ships.byId['ship2'].fleetId).toBe('f1');
  });

  it('places new fleet at same system as source', () => {
    const state = buildSplitState();
    const result = splitFleet(state, 'f1', ['ship1']);
    expect(result.success).toBe(true);
    const newFleet = result.state.fleets.byId[result.newFleetId!];
    expect(newFleet.systemId).toBe('s1');
    expect(newFleet.destination).toBeNull();
  });

  it('rejects splitting all ships (would leave source empty)', () => {
    const state = buildSplitState();
    const result = splitFleet(state, 'f1', ['ship1', 'ship2', 'ship3']);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/empty/i);
    expect(result.state).toBe(state);
  });

  it('rejects splitting with no ships selected', () => {
    const state = buildSplitState();
    const result = splitFleet(state, 'f1', []);
    expect(result.success).toBe(false);
    expect(result.state).toBe(state);
  });

  it('rejects ship IDs not in fleet', () => {
    const state = buildSplitState();
    const result = splitFleet(state, 'f1', ['not-my-ship']);
    expect(result.success).toBe(false);
    expect(result.state).toBe(state);
  });

  it('adds new fleet to empire fleet list', () => {
    const state = buildSplitState();
    const result = splitFleet(state, 'f1', ['ship1']);
    expect(result.success).toBe(true);
    const empire = result.state.empires.byId['player'];
    expect(empire.fleets).toContain(result.newFleetId);
  });
});

// ── Star Gate travel tests (design/galaxy/travel.md §Star Gates) ───────────────

function makePlanet(
  id: string,
  systemId: string,
  ownerId: string | null,
  buildings: BuildingId[] = [],
): Planet {
  return {
    id: id as PlanetId,
    name: `Planet ${id}`,
    systemId,
    orbit: 1,
    type: 'terran',
    size: 'medium',
    gravity: 1.0,
    ownerId,
    isColonized: ownerId !== null,
    isHomeworld: false,
    population: ownerId ? 50 : 0,
    maxPopulation: 100,
    growthRate: 0.1,
    morale: 'content',
    factories: 0,
    maxFactories: 100,
    waste: 0,
    production: { ship: 0, defense: 0, industry: 100, ecology: 0, research: 0 },
    buildQueue: [],
    buildings,
    missileBases: 0,
    maxMissileBases: 10,
    planetaryShield: 0,
    groundAttack: 0,
    groundDefense: 0,
    isRich: false,
    isPoor: false,
    isGaia: false,
    hasArtifacts: false,
    artifactsClaimed: false,
    isHomeBase: false,
    spacePort: false,
    pollution: 0,
    terraformLevel: 0,
    currentDesignId: null,
    shipyardProgress: 0,
    defenseProgress: 0,
    industryProgress: 0,
    ecologyProgress: 0,
  };
}

/**
 * Build a GameState with star gates for testing instant travel.
 *
 * Creates two systems far apart (distance = 50 parsecs):
 *   - s1 at (0,0) with planet p1
 *   - s2 at (30,40) with planet p2 (distance = 50)
 *
 * Star gates can be added to either planet via options.
 */
function buildStarGateState({
  s1HasGate = false,
  s2HasGate = false,
  s1OwnerId = 'player',
  s2OwnerId = 'player',
}: {
  s1HasGate?: boolean;
  s2HasGate?: boolean;
  s1OwnerId?: string | null;
  s2OwnerId?: string | null;
} = {}): GameState {
  const designId = 'design1';
  const design = makeDesignWithEngine(designId, 'retro_engines'); // warpSpeed=1

  const ship1 = makeShip('ship1', 'f1', designId);
  const fleet1 = makeFleet('f1', 's1', ['ship1']);

  const sys1 = makeSystem('s1', 0, 0);
  const sys2 = makeSystem('s2', 30, 40); // distance = 50
  sys1.fleetIds = ['f1'];
  sys1.planetIds = ['p1'];
  sys2.planetIds = ['p2'];

  const p1Buildings: BuildingId[] = s1HasGate ? ['star_gate' as BuildingId] : [];
  const p2Buildings: BuildingId[] = s2HasGate ? ['star_gate' as BuildingId] : [];

  const planet1 = makePlanet('p1', 's1', s1OwnerId, p1Buildings);
  const planet2 = makePlanet('p2', 's2', s2OwnerId, p2Buildings);

  return {
    ...initialState,
    galaxy: {
      ...initialState.galaxy,
      systems: {
        byId: { s1: sys1, s2: sys2 },
        allIds: ['s1', 's2'],
      },
    },
    planets: {
      byId: {
        p1: planet1,
        p2: planet2,
      },
      allIds: ['p1', 'p2'],
    },
    ships: {
      byId: { ship1 },
      allIds: ['ship1'],
    },
    shipDesigns: {
      byId: { [designId]: design },
      allIds: [designId],
    },
    fleets: {
      byId: { f1: fleet1 },
      allIds: ['f1'],
    },
    empires: {
      byId: {
        player: makeEmpire('player', ['f1']),
      },
      allIds: ['player'],
      playerId: 'player',
    },
  };
}

describe('systemHasStarGate (design/galaxy/travel.md §Star Gates)', () => {
  it('returns false if system has no planets', () => {
    const state = buildState(); // default: no planets in system
    expect(systemHasStarGate('s1', 'player', state)).toBe(false);
  });

  it('returns false if planet has no star gate', () => {
    const state = buildStarGateState({ s1HasGate: false });
    expect(systemHasStarGate('s1', 'player', state)).toBe(false);
  });

  it('returns true if planet has star gate owned by empire', () => {
    const state = buildStarGateState({ s1HasGate: true, s1OwnerId: 'player' });
    expect(systemHasStarGate('s1', 'player', state)).toBe(true);
  });

  it('returns false if star gate planet owned by different empire', () => {
    const state = buildStarGateState({ s1HasGate: true, s1OwnerId: 'other_empire' });
    expect(systemHasStarGate('s1', 'player', state)).toBe(false);
  });

  it('returns false for uncolonized planet with star gate', () => {
    const state = buildStarGateState({ s1HasGate: true, s1OwnerId: null });
    expect(systemHasStarGate('s1', 'player', state)).toBe(false);
  });
});

describe('canUseStarGateTravel (design/galaxy/travel.md §Star Gates)', () => {
  it('returns true when both systems have star gates', () => {
    const state = buildStarGateState({ s1HasGate: true, s2HasGate: true });
    const fleet = state.fleets.byId['f1'];
    expect(canUseStarGateTravel(fleet, 's2', state)).toBe(true);
  });

  it('returns false when origin has no star gate', () => {
    const state = buildStarGateState({ s1HasGate: false, s2HasGate: true });
    const fleet = state.fleets.byId['f1'];
    expect(canUseStarGateTravel(fleet, 's2', state)).toBe(false);
  });

  it('returns false when destination has no star gate', () => {
    const state = buildStarGateState({ s1HasGate: true, s2HasGate: false });
    const fleet = state.fleets.byId['f1'];
    expect(canUseStarGateTravel(fleet, 's2', state)).toBe(false);
  });

  it('returns false when neither system has star gate', () => {
    const state = buildStarGateState({ s1HasGate: false, s2HasGate: false });
    const fleet = state.fleets.byId['f1'];
    expect(canUseStarGateTravel(fleet, 's2', state)).toBe(false);
  });

  it('returns false when destination gate owned by different empire', () => {
    const state = buildStarGateState({
      s1HasGate: true,
      s2HasGate: true,
      s1OwnerId: 'player',
      s2OwnerId: 'other_empire',
    });
    const fleet = state.fleets.byId['f1'];
    expect(canUseStarGateTravel(fleet, 's2', state)).toBe(false);
  });
});

describe('calculateEta with star gates (design/galaxy/travel.md §Star Gates)', () => {
  it('returns ETA=1 for star gate travel regardless of distance', () => {
    // Distance = 50 parsecs, warp speed 1 = would normally be 50 turns
    const state = buildStarGateState({ s1HasGate: true, s2HasGate: true });
    const fleet = state.fleets.byId['f1'];
    expect(calculateEta(fleet, 's2', state)).toBe(1);
  });

  it('returns normal ETA when star gates not available', () => {
    // Distance = 50 parsecs, warp speed 1 = 50 turns
    const state = buildStarGateState({ s1HasGate: false, s2HasGate: false });
    const fleet = state.fleets.byId['f1'];
    expect(calculateEta(fleet, 's2', state)).toBe(50);
  });

  it('returns normal ETA when only origin has star gate', () => {
    const state = buildStarGateState({ s1HasGate: true, s2HasGate: false });
    const fleet = state.fleets.byId['f1'];
    expect(calculateEta(fleet, 's2', state)).toBe(50);
  });

  it('returns normal ETA when only destination has star gate', () => {
    const state = buildStarGateState({ s1HasGate: false, s2HasGate: true });
    const fleet = state.fleets.byId['f1'];
    expect(calculateEta(fleet, 's2', state)).toBe(50);
  });
});

describe('moveFleet with star gates (design/galaxy/travel.md §Star Gates)', () => {
  it('sets ETA=1 when using star gate travel', () => {
    const state = buildStarGateState({ s1HasGate: true, s2HasGate: true });
    const result = moveFleet(state, 'f1', 's2');
    expect(result.success).toBe(true);
    const movedFleet = result.state.fleets.byId['f1'];
    expect(movedFleet.destination).toBe('s2');
    expect(movedFleet.eta).toBe(1);
  });

  it('sets normal ETA without star gates', () => {
    const state = buildStarGateState({ s1HasGate: false, s2HasGate: false });
    const result = moveFleet(state, 'f1', 's2');
    expect(result.success).toBe(true);
    const movedFleet = result.state.fleets.byId['f1'];
    expect(movedFleet.eta).toBe(50);
  });
});
