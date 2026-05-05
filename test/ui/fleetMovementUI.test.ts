/**
 * Fleet movement UI tests.
 * test/ui/fleetMovementUI.test.ts
 *
 * Tests for fleet selection, deployment mode, move dispatch, and
 * cancel flow — all via the store/reducer (no DOM required).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Store } from '../../src/game/store';
import { rootReducer } from '../../src/game/reducer';
import { initialState } from '../../src/game/initialState';
import { GameState, Fleet, Ship, ShipDesign, StarSystem, Empire } from '../../src/game/state';

// ── Fixture helpers ────────────────────────────────────────────────────────────

function makeSystem(id: string, x: number, y: number): StarSystem {
  return {
    id,
    name: `System-${id}`,
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

function makeShipDesign(id: string, ownerId: string): ShipDesign {
  return {
    id,
    name: 'Scout',
    class: 'small',
    ownerId,
    size: 100,
    spaceUsed: 50,
    spaceFree: 50,
    components: [],
    stats: {
      cost: 100,
      maintenance: 5,
      hp: 10,
      shieldHp: 0,
      speed: 2,
      range: 4,
      weapons: [],
      defense: { armor: 0, shields: 0, ecm: 0 },
      special: [],
    },
    miniaturization: {},
    isObsolete: false,
    shipsBuilt: 0,
  };
}

function makeShip(id: string, designId: string, ownerId: string, fleetId: string): Ship {
  return {
    id,
    name: `Ship-${id}`,
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

function makeFleet(id: string, systemId: string, ownerId: string, shipIds: string[]): Fleet {
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
    experience: 'rookie',
    isInCombat: false,
    combatId: null,
  };
}

function makeEmpire(id: string, isPlayer: boolean, fleetIds: string[]): Empire {
  return {
    id,
    raceId: 'human',
    name: 'Terrans',
    isPlayer,
    credits: 1000,
    creditPerTurn: 50,
    planets: [],
    fleets: fleetIds,
    shipDesigns: [],
    scannerTechLevel: 0,
    computerTechLevel: 0,
    securityLevel: 0,
    research: {
      currentTech: null,
      researchPoints: 0,
      researchPerTurn: 10,
      completedTechs: [],
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

// Build a test state with two systems, a player fleet at sys-1, and a destination sys-2
function buildTestState(): GameState {
  const playerId = 'player';
  const sys1 = makeSystem('sys-1', 0, 0);
  const sys2 = makeSystem('sys-2', 10, 0);
  const design = makeShipDesign('design-1', playerId);
  const ship = makeShip('ship-1', 'design-1', playerId, 'fleet-1');
  const fleet = makeFleet('fleet-1', 'sys-1', playerId, ['ship-1']);
  const empire = makeEmpire(playerId, true, ['fleet-1']);

  sys1.fleetIds = ['fleet-1'];

  return {
    ...initialState,
    galaxy: {
      ...initialState.galaxy,
      width: 30,
      height: 30,
      systems: {
        byId: { 'sys-1': sys1, 'sys-2': sys2 },
        allIds: ['sys-1', 'sys-2'],
      },
    },
    ships: {
      byId: { 'ship-1': ship },
      allIds: ['ship-1'],
    },
    shipDesigns: {
      byId: { 'design-1': design },
      allIds: ['design-1'],
    },
    fleets: {
      byId: { 'fleet-1': fleet },
      allIds: ['fleet-1'],
    },
    empires: {
      byId: { [playerId]: empire },
      allIds: [playerId],
      playerId,
    },
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('Fleet movement UI — SELECT_FLEET action', () => {
  let store: Store<GameState>;

  beforeEach(() => {
    store = new Store(rootReducer, buildTestState());
  });

  it('SELECT_FLEET sets selectedFleet in ui state', () => {
    store.dispatch({ type: 'SELECT_FLEET', payload: { fleetId: 'fleet-1' } });
    expect(store.getState().ui.selectedFleet).toBe('fleet-1');
  });

  it('SELECT_FLEET for a player fleet at rest opens fleet deployment mode', () => {
    store.dispatch({ type: 'SELECT_FLEET', payload: { fleetId: 'fleet-1' } });
    const deployment = store.getState().ui.fleetDeploymentMode;
    expect(deployment).not.toBeNull();
    expect(deployment?.fleetId).toBe('fleet-1');
    expect(deployment?.destinationId).toBeNull();
  });

  it('SELECT_FLEET populates ship counts in deployment mode', () => {
    store.dispatch({ type: 'SELECT_FLEET', payload: { fleetId: 'fleet-1' } });
    const deployment = store.getState().ui.fleetDeploymentMode;
    expect(deployment?.ships['design-1']).toBe(1);
  });

  it('SELECT_FLEET with null clears deployment mode', () => {
    // First open it
    store.dispatch({ type: 'SELECT_FLEET', payload: { fleetId: 'fleet-1' } });
    expect(store.getState().ui.fleetDeploymentMode).not.toBeNull();
    // Then clear
    store.dispatch({ type: 'SELECT_FLEET', payload: { fleetId: null } });
    expect(store.getState().ui.fleetDeploymentMode).toBeNull();
    expect(store.getState().ui.selectedFleet).toBeNull();
  });

  it('SELECT_FLEET does not open deployment mode for AI fleet', () => {
    // Add an AI fleet
    const aiEmpireId = 'ai-1';
    const aiFleet = makeFleet('ai-fleet-1', 'sys-2', aiEmpireId, []);
    const state = store.getState();
    store.dispatch({
      type: 'LOAD_STATE',
      payload: {
        ...state,
        fleets: {
          byId: { ...state.fleets.byId, 'ai-fleet-1': aiFleet },
          allIds: [...state.fleets.allIds, 'ai-fleet-1'],
        },
        galaxy: {
          ...state.galaxy,
          systems: {
            ...state.galaxy.systems,
            byId: {
              ...state.galaxy.systems.byId,
              'sys-2': { ...state.galaxy.systems.byId['sys-2'], fleetIds: ['ai-fleet-1'] },
            },
          },
        },
      },
    });

    store.dispatch({ type: 'SELECT_FLEET', payload: { fleetId: 'ai-fleet-1' } });
    expect(store.getState().ui.fleetDeploymentMode).toBeNull();
    expect(store.getState().ui.selectedFleet).toBe('ai-fleet-1');
  });
});

describe('Fleet movement UI — deployment mode actions', () => {
  let store: Store<GameState>;

  beforeEach(() => {
    store = new Store(rootReducer, buildTestState());
    // Open deployment mode
    store.dispatch({ type: 'SELECT_FLEET', payload: { fleetId: 'fleet-1' } });
  });

  it('SET_DEPLOYMENT_DESTINATION sets the destination', () => {
    store.dispatch({
      type: 'SET_DEPLOYMENT_DESTINATION',
      payload: { fleetId: 'fleet-1', destinationId: 'sys-2' },
    });
    expect(store.getState().ui.fleetDeploymentMode?.destinationId).toBe('sys-2');
  });

  it('UPDATE_DEPLOYMENT_SHIPS updates ship counts', () => {
    store.dispatch({
      type: 'UPDATE_DEPLOYMENT_SHIPS',
      payload: { fleetId: 'fleet-1', ships: { 'design-1': 0 } },
    });
    expect(store.getState().ui.fleetDeploymentMode?.ships['design-1']).toBe(0);
  });

  it('CANCEL_FLEET_DEPLOYMENT clears deployment mode', () => {
    store.dispatch({ type: 'CANCEL_FLEET_DEPLOYMENT' });
    expect(store.getState().ui.fleetDeploymentMode).toBeNull();
  });

  it('CANCEL_FLEET_DEPLOYMENT is a no-op when deployment mode is not active', () => {
    // Close first
    store.dispatch({ type: 'CANCEL_FLEET_DEPLOYMENT' });
    expect(store.getState().ui.fleetDeploymentMode).toBeNull();
    // Cancel again — should not throw
    store.dispatch({ type: 'CANCEL_FLEET_DEPLOYMENT' });
    expect(store.getState().ui.fleetDeploymentMode).toBeNull();
  });
});

describe('Fleet movement UI — MOVE_FLEET dispatched via store', () => {
  let store: Store<GameState>;

  beforeEach(() => {
    store = new Store(rootReducer, buildTestState());
  });

  it('MOVE_FLEET sets destination and ETA on the fleet', () => {
    store.dispatch({
      type: 'MOVE_FLEET',
      payload: { fleetId: 'fleet-1', destinationId: 'sys-2' },
    });

    const fleet = store.getState().fleets.byId['fleet-1'];
    expect(fleet.destination).toBe('sys-2');
    expect(fleet.eta).toBeGreaterThan(0);
  });

  it('MOVE_FLEET sets fleet orders to move type', () => {
    store.dispatch({
      type: 'MOVE_FLEET',
      payload: { fleetId: 'fleet-1', destinationId: 'sys-2' },
    });

    const fleet = store.getState().fleets.byId['fleet-1'];
    expect(fleet.orders.type).toBe('move');
    if (fleet.orders.type === 'move') {
      expect(fleet.orders.target).toBe('sys-2');
    }
  });

  it('MOVE_FLEET to same system is a no-op', () => {
    const before = store.getState().fleets.byId['fleet-1'];
    store.dispatch({
      type: 'MOVE_FLEET',
      payload: { fleetId: 'fleet-1', destinationId: 'sys-1' },
    });
    const after = store.getState().fleets.byId['fleet-1'];
    expect(after.destination).toBe(before.destination); // still null
  });

  it('MOVE_FLEET for unknown fleet is a no-op', () => {
    const stateBefore = store.getState();
    store.dispatch({
      type: 'MOVE_FLEET',
      payload: { fleetId: 'fleet-nonexistent', destinationId: 'sys-2' },
    });
    // State should not change for fleets
    expect(store.getState().fleets).toEqual(stateBefore.fleets);
  });
});

describe('Fleet movement UI — SELECT_SYSTEM clears deployment mode', () => {
  let store: Store<GameState>;

  beforeEach(() => {
    store = new Store(rootReducer, buildTestState());
  });

  it('SELECT_SYSTEM clears selectedFleet (existing behavior)', () => {
    store.dispatch({ type: 'SELECT_FLEET', payload: { fleetId: 'fleet-1' } });
    store.dispatch({ type: 'SELECT_SYSTEM', payload: { systemId: 'sys-2' } });
    expect(store.getState().ui.selectedFleet).toBeNull();
  });

  it('SELECT_SYSTEM clears deployment mode', () => {
    store.dispatch({ type: 'SELECT_FLEET', payload: { fleetId: 'fleet-1' } });
    expect(store.getState().ui.fleetDeploymentMode).not.toBeNull();
    store.dispatch({ type: 'SELECT_SYSTEM', payload: { systemId: 'sys-2' } });
    expect(store.getState().ui.fleetDeploymentMode).toBeNull();
  });
});

describe('Fleet movement UI — ETA calculation', () => {
  let store: Store<GameState>;

  beforeEach(() => {
    store = new Store(rootReducer, buildTestState());
  });

  it('ETA is ceil(distance / warpSpeed), min 1', () => {
    // sys-1 at (0,0), sys-2 at (10,0) → distance = 10
    // Ship has no engine components → warp speed fallback = 1
    // ETA = ceil(10 / 1) = 10
    store.dispatch({
      type: 'MOVE_FLEET',
      payload: { fleetId: 'fleet-1', destinationId: 'sys-2' },
    });
    const eta = store.getState().fleets.byId['fleet-1'].eta;
    expect(eta).toBe(10);
  });
});
