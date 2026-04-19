/**
 * Unit tests for src/game/systems/turn.ts and src/game/actions/turn.ts
 * test/game/systems/turn.test.ts
 */

import { describe, it, expect } from 'vitest';
import { processTurn } from '../../../src/game/systems/turn';
import { nextTurn, turnReducer, NEXT_TURN } from '../../../src/game/actions/turn';
import { Store } from '../../../src/game/store';
import { rootReducer } from '../../../src/game/reducer';
import { GameState, Planet, Empire, ResearchState } from '../../../src/game/state';

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

function makeEmpire(id: string, isDefeated = false): Empire {
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
    isDefeated,
    defeatedTurn: isDefeated ? 1 : null,
  };
}

function makePlanet(id: string, colonized = true): Planet {
  return {
    id,
    name: `Planet ${id}`,
    systemId: 's1',
    orbit: 1,
    type: 'terran',
    size: 'medium',
    gravity: 1.0,
    ownerId: colonized ? 'empire1' : null,
    isColonized: colonized,
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
}

function makeMinimalState(turn = 0, planets: Planet[] = [], empires: Empire[] = []): GameState {
  const planetsById = Object.fromEntries(planets.map((p) => [p.id, p]));
  const empiresById = Object.fromEntries(empires.map((e) => [e.id, e]));

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
      },
    },
  };
}

// ── processTurn ───────────────────────────────────────────────────────────────

describe('processTurn', () => {
  it('increments turn counter by 1', () => {
    const state = makeMinimalState(0);
    const next = processTurn(state);
    expect(next.turn).toBe(1);
  });

  it('increments turn counter from non-zero start', () => {
    const state = makeMinimalState(42);
    const next = processTurn(state);
    expect(next.turn).toBe(43);
  });

  it('updates year to 2500 + turn', () => {
    const state = makeMinimalState(0);
    const next = processTurn(state);
    expect(next.year).toBe(2501);
  });

  it('year formula: year === 2500 + turn after processing', () => {
    const state = makeMinimalState(99);
    const next = processTurn(state);
    expect(next.year).toBe(2500 + next.turn);
  });

  it('multiple consecutive turns increment correctly', () => {
    let state = makeMinimalState(0);
    for (let i = 1; i <= 10; i++) {
      state = processTurn(state);
      expect(state.turn).toBe(i);
      expect(state.year).toBe(2500 + i);
    }
  });

  it('does not mutate the original state', () => {
    const state = makeMinimalState(5);
    const originalTurn = state.turn;
    const originalYear = state.year;
    processTurn(state);
    expect(state.turn).toBe(originalTurn);
    expect(state.year).toBe(originalYear);
  });

  it('returned state is a different object reference', () => {
    const state = makeMinimalState(0);
    const next = processTurn(state);
    expect(next).not.toBe(state);
  });

  it('processes planets without throwing', () => {
    const empire = makeEmpire('empire1');
    const planet = makePlanet('p1', true);
    const state = makeMinimalState(0, [planet], [empire]);
    expect(() => processTurn(state)).not.toThrow();
  });

  it('skips uncolonised planets', () => {
    const planet = makePlanet('p1', false);
    const state = makeMinimalState(0, [planet]);
    const next = processTurn(state);
    // population should remain unchanged for uncolonised planet
    expect(next.planets.byId['p1'].population).toBe(planet.population);
  });

  it('population grows for colonised planet with room to grow', () => {
    const empire = makeEmpire('empire1');
    const planet = makePlanet('p1', true); // 50 pop, 100 max, 2% growth, content
    const state = makeMinimalState(0, [planet], [empire]);
    const next = processTurn(state);
    // growth = 50 * 0.02 * 1.0 * (1 - 50/100) = 0.5 (content morale)
    expect(next.planets.byId['p1'].population).toBeGreaterThan(planet.population);
  });

  it('population does not exceed maxPopulation', () => {
    const empire = makeEmpire('empire1');
    const planet = makePlanet('p1', true);
    const atCapPlanet: Planet = { ...planet, population: 100, maxPopulation: 100 };
    const state = makeMinimalState(0, [atCapPlanet], [empire]);
    const next = processTurn(state);
    expect(next.planets.byId['p1'].population).toBe(100);
  });

  it('processes empires without throwing', () => {
    const empire = makeEmpire('empire1');
    const state = makeMinimalState(0, [], [empire]);
    expect(() => processTurn(state)).not.toThrow();
  });

  it('skips defeated empires', () => {
    const defeated = makeEmpire('empire1', true);
    const state = makeMinimalState(0, [], [defeated]);
    // Should not throw and should not attempt to process research for defeated empire
    expect(() => processTurn(state)).not.toThrow();
  });
});

// ── nextTurn action creator ───────────────────────────────────────────────────

describe('nextTurn action creator', () => {
  it('returns an action with type NEXT_TURN', () => {
    const action = nextTurn();
    expect(action.type).toBe(NEXT_TURN);
    expect(action.type).toBe('NEXT_TURN');
  });

  it('has no payload by default', () => {
    const action = nextTurn();
    expect(action.payload).toBeUndefined();
  });

  it('each call returns a new action object', () => {
    const a = nextTurn();
    const b = nextTurn();
    expect(a).not.toBe(b);
  });
});

// ── turnReducer ───────────────────────────────────────────────────────────────

describe('turnReducer', () => {
  it('handles NEXT_TURN and increments turn', () => {
    const state = makeMinimalState(0);
    const next = turnReducer(state, nextTurn());
    expect(next.turn).toBe(1);
  });

  it('ignores unknown action types', () => {
    const state = makeMinimalState(5);
    const next = turnReducer(state, { type: 'UNKNOWN_ACTION' });
    expect(next).toBe(state); // same reference — no copy made
    expect(next.turn).toBe(5);
  });

  it('handles multiple dispatches', () => {
    let state = makeMinimalState(0);
    state = turnReducer(state, nextTurn());
    state = turnReducer(state, nextTurn());
    state = turnReducer(state, nextTurn());
    expect(state.turn).toBe(3);
    expect(state.year).toBe(2503);
  });
});

// ── Store integration ─────────────────────────────────────────────────────────

describe('Store + rootReducer integration', () => {
  it('dispatching nextTurn advances the store turn', () => {
    const state = makeMinimalState(0);
    const store = new Store(rootReducer, state);
    store.dispatch(nextTurn());
    expect(store.getState().turn).toBe(1);
    expect(store.getState().year).toBe(2501);
  });

  it('dispatching nextTurn multiple times works correctly', () => {
    const state = makeMinimalState(0);
    const store = new Store(rootReducer, state);
    for (let i = 1; i <= 5; i++) {
      store.dispatch(nextTurn());
    }
    expect(store.getState().turn).toBe(5);
    expect(store.getState().year).toBe(2505);
  });

  it('subscriber is notified after each dispatch', () => {
    const state = makeMinimalState(0);
    const store = new Store(rootReducer, state);
    const turns: number[] = [];
    store.subscribe((s) => turns.push(s.turn));

    store.dispatch(nextTurn());
    store.dispatch(nextTurn());
    store.dispatch(nextTurn());

    expect(turns).toEqual([1, 2, 3]);
  });

  it('LOAD_STATE action replaces entire state', () => {
    const state = makeMinimalState(0);
    const store = new Store(rootReducer, state);
    const replacement = makeMinimalState(99);
    store.dispatch({ type: 'LOAD_STATE', payload: replacement });
    expect(store.getState().turn).toBe(99);
  });

  it('state is not mutated after dispatch', () => {
    const state = makeMinimalState(0);
    const store = new Store(rootReducer, state);
    const before = store.getState();
    store.dispatch(nextTurn());
    const after = store.getState();
    expect(before).not.toBe(after);
    expect(before.turn).toBe(0); // original unchanged
  });
});
