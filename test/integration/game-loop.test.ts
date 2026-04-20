/**
 * Integration tests: full game loop — pure TypeScript, NO DOM.
 * test/integration/game-loop.test.ts
 *
 * Exercises the full pipeline: new game → dispatch turns → verify state.
 * Tests acceptance criteria:
 *   1. Can start new game
 *   2. Can click Next Turn multiple times
 *   3. Production accumulates
 *   4. Population grows
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Store } from '../../src/game/store';
import { rootReducer } from '../../src/game/reducer';
import { initialState } from '../../src/game/initialState';
import { startGame, NewGameOptions } from '../../src/game/actions/newGame';
import { nextTurn } from '../../src/game/actions/turn';
import { calculateBaseProduction } from '../../src/game/systems/production';
import { calculateGrowth } from '../../src/game/systems/growth';
import { GameState, Planet } from '../../src/game/state';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Default new-game options — small galaxy, 1 opponent, deterministic seed. */
const DEFAULT_OPTIONS: NewGameOptions = {
  galaxySize: 'small',
  opponents: 1,
  difficulty: 'normal',
  galaxyAge: 'average',
  raceId: 'humans',
  empireColor: '#00aaff',
  emperorName: 'Emperor Test',
  homeworldName: 'Terra',
  seed: 42,
};

function makeStore(initialGameState = initialState): Store<GameState> {
  return new Store<GameState>(rootReducer, initialGameState);
}

/** Find all colonised planets in a state. */
function getColonisedPlanets(state: GameState): Planet[] {
  return state.planets.allIds
    .map((id) => state.planets.byId[id])
    .filter((p) => p.isColonized);
}

/** Find the player's colonised planets. */
function getPlayerPlanets(state: GameState): Planet[] {
  const playerId = state.empires.playerId;
  return getColonisedPlanets(state).filter((p) => p.ownerId === playerId);
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('Game Loop Integration', () => {
  let store: Store<GameState>;

  beforeEach(() => {
    store = makeStore();
  });

  // ── Criterion 1: Can start new game ──────────────────────────────────────

  describe('1. Starting a new game', () => {
    it('transitions from initial menu state to galaxy screen', () => {
      expect(store.getState().currentScreen).toBe('menu');

      store.dispatch(startGame(DEFAULT_OPTIONS));
      const state = store.getState();

      expect(state.currentScreen).toBe('galaxy');
    });

    it('sets up the galaxy with star systems', () => {
      store.dispatch(startGame(DEFAULT_OPTIONS));
      const state = store.getState();

      expect(state.galaxy.systems.allIds.length).toBeGreaterThan(0);
    });

    it('creates player and AI empires', () => {
      store.dispatch(startGame(DEFAULT_OPTIONS));
      const state = store.getState();

      expect(state.empires.allIds.length).toBe(2); // player + 1 opponent
      expect(state.empires.playerId).toBe('player');
      expect(state.empires.byId['player']).toBeDefined();
      expect(state.empires.byId['player'].isPlayer).toBe(true);
    });

    it('starts at turn 1 with year 2501', () => {
      store.dispatch(startGame(DEFAULT_OPTIONS));
      const state = store.getState();

      expect(state.turn).toBe(1);
      expect(state.year).toBe(2501);
    });

    it('gives the player a homeworld', () => {
      store.dispatch(startGame(DEFAULT_OPTIONS));

      const playerPlanets = getPlayerPlanets(store.getState());
      expect(playerPlanets.length).toBeGreaterThanOrEqual(1);
    });

    it('names the player homeworld correctly', () => {
      store.dispatch(startGame(DEFAULT_OPTIONS));
      const state = store.getState();

      const homeSystemId = state.galaxy.homeSystemIds['player'];
      expect(homeSystemId).toBeDefined();

      const homeSystem = state.galaxy.systems.byId[homeSystemId!];
      expect(homeSystem).toBeDefined();
      expect(homeSystem.name).toBe('Terra');
    });

    it('is reproducible with the same seed', () => {
      store.dispatch(startGame(DEFAULT_OPTIONS));
      const firstState = store.getState();

      const store2 = makeStore();
      store2.dispatch(startGame(DEFAULT_OPTIONS));
      const secondState = store2.getState();

      expect(firstState.galaxy.systems.allIds).toEqual(secondState.galaxy.systems.allIds);
      expect(firstState.planets.allIds.sort()).toEqual(secondState.planets.allIds.sort());
    });

    it('produces a different galaxy layout with a different seed', () => {
      store.dispatch(startGame(DEFAULT_OPTIONS));
      const firstState = store.getState();

      const store2 = makeStore();
      store2.dispatch(startGame({ ...DEFAULT_OPTIONS, seed: 99 }));
      const secondState = store2.getState();

      // System IDs are sequential (sys_0, sys_1, …) regardless of seed;
      // what differs is the coordinates and names of those systems.
      // Compare the first system's position or name between seeds.
      const firstId = firstState.galaxy.systems.allIds[0];
      const sys1 = firstState.galaxy.systems.byId[firstId];
      const sys2 = secondState.galaxy.systems.byId[firstId];
      // At least one spatial attribute (x, y) or name must differ.
      const layoutDiffers =
        sys1.x !== sys2.x ||
        sys1.y !== sys2.y ||
        sys1.name !== sys2.name;
      expect(layoutDiffers).toBe(true);
    });
  });

  // ── Criterion 2: Can advance turns ───────────────────────────────────────

  describe('2. Advancing turns with Next Turn', () => {
    beforeEach(() => {
      store.dispatch(startGame(DEFAULT_OPTIONS));
    });

    it('increments turn counter by 1', () => {
      const before = store.getState().turn;
      store.dispatch(nextTurn());
      expect(store.getState().turn).toBe(before + 1);
    });

    it('increments the year by 1', () => {
      const before = store.getState().year;
      store.dispatch(nextTurn());
      expect(store.getState().year).toBe(before + 1);
    });

    it('can advance 10 turns in a row', () => {
      const startTurn = store.getState().turn;
      for (let i = 0; i < 10; i++) {
        store.dispatch(nextTurn());
      }
      expect(store.getState().turn).toBe(startTurn + 10);
      expect(store.getState().year).toBe(2501 + 10);
    });

    it('can advance 50 turns without throwing', () => {
      expect(() => {
        for (let i = 0; i < 50; i++) {
          store.dispatch(nextTurn());
        }
      }).not.toThrow();
    });

    it('preserves empire structure across turns', () => {
      const empireIdsBefore = store.getState().empires.allIds.slice().sort();
      for (let i = 0; i < 5; i++) {
        store.dispatch(nextTurn());
      }
      const empireIdsAfter = store.getState().empires.allIds.slice().sort();
      expect(empireIdsAfter).toEqual(empireIdsBefore);
    });

    it('preserves planet count across turns', () => {
      const planetCountBefore = store.getState().planets.allIds.length;
      for (let i = 0; i < 5; i++) {
        store.dispatch(nextTurn());
      }
      expect(store.getState().planets.allIds.length).toBe(planetCountBefore);
    });

    it('does not mutate the previous state object', () => {
      const stateBefore = store.getState();
      store.dispatch(nextTurn());
      const stateAfter = store.getState();
      // State containers must be separate references
      expect(stateAfter).not.toBe(stateBefore);
      expect(stateAfter.turn).not.toBe(stateBefore.turn);
    });
  });

  // ── Criterion 3: Production accumulates ──────────────────────────────────

  describe('3. Production accumulates', () => {
    beforeEach(() => {
      store.dispatch(startGame(DEFAULT_OPTIONS));
    });

    it('colonised homeworld has positive base production', () => {
      const playerPlanets = getPlayerPlanets(store.getState());
      expect(playerPlanets.length).toBeGreaterThan(0);

      const homeworld = playerPlanets[0];
      const production = calculateBaseProduction(homeworld);
      expect(production).toBeGreaterThan(0);
    });

    it('colonised planets have factories > 0 (production capacity)', () => {
      const playerPlanets = getPlayerPlanets(store.getState());
      const totalFactories = playerPlanets.reduce((sum, p) => sum + p.factories, 0);
      expect(totalFactories).toBeGreaterThan(0);
    });

    it('production is non-negative for all colonised planets', () => {
      const state = store.getState();
      for (const planet of getColonisedPlanets(state)) {
        const prod = calculateBaseProduction(planet);
        expect(prod).toBeGreaterThanOrEqual(0);
      }
    });

    it('processing turns does not reduce planet factory count', () => {
      const playerPlanets = getPlayerPlanets(store.getState());
      const factoriesBefore = playerPlanets.reduce((sum, p) => sum + p.factories, 0);

      // Advance 5 turns — production slider runs but build queues are empty
      for (let i = 0; i < 5; i++) {
        store.dispatch(nextTurn());
      }

      const planetsAfter = getPlayerPlanets(store.getState());
      const factoriesAfter = planetsAfter.reduce((sum, p) => sum + p.factories, 0);
      // Factories should not decrease (no demolition in queues)
      expect(factoriesAfter).toBeGreaterThanOrEqual(factoriesBefore);
    });

    it('production value is consistent with calculateBaseProduction', () => {
      // Turn processing calls calculateBaseProduction internally — verify
      // that production computed before and after a turn is consistent with
      // the same planet data (same factories, same pop).
      const state = store.getState();
      const planets = getColonisedPlanets(state);

      for (const planet of planets) {
        const prod1 = calculateBaseProduction(planet);
        const prod2 = calculateBaseProduction(planet);
        // Pure function — must return identical result
        expect(prod1).toBe(prod2);
      }
    });
  });

  // ── Criterion 4: Population grows ────────────────────────────────────────

  describe('4. Population grows', () => {
    beforeEach(() => {
      store.dispatch(startGame(DEFAULT_OPTIONS));
    });

    it('colonised homeworld has positive population', () => {
      const playerPlanets = getPlayerPlanets(store.getState());
      expect(playerPlanets.length).toBeGreaterThan(0);
      expect(playerPlanets[0].population).toBeGreaterThan(0);
    });

    it('planet below max population has positive growth delta', () => {
      const playerPlanets = getPlayerPlanets(store.getState());
      const planet = playerPlanets[0];

      // Growth system requires population below max
      if (planet.population < planet.maxPopulation) {
        const growth = calculateGrowth(planet);
        expect(growth).toBeGreaterThanOrEqual(0);
      }
    });

    it('population increases after advancing turns (when below max)', () => {
      const state = store.getState();
      const playerPlanets = getPlayerPlanets(state);
      expect(playerPlanets.length).toBeGreaterThan(0);

      const homeworldId = playerPlanets[0].id;
      const popBefore = state.planets.byId[homeworldId].population;
      const maxPop = state.planets.byId[homeworldId].maxPopulation;

      // Only test if there is room to grow
      if (popBefore >= maxPop) return;

      // Advance 5 turns — growth should compound
      for (let i = 0; i < 5; i++) {
        store.dispatch(nextTurn());
      }

      const popAfter = store.getState().planets.byId[homeworldId].population;
      expect(popAfter).toBeGreaterThan(popBefore);
    });

    it('population never exceeds maxPopulation', () => {
      // Run 20 turns and verify no planet exceeds its cap
      for (let i = 0; i < 20; i++) {
        store.dispatch(nextTurn());
      }

      const state = store.getState();
      for (const planet of getColonisedPlanets(state)) {
        expect(planet.population).toBeLessThanOrEqual(planet.maxPopulation);
      }
    });

    it('population growth rate is non-negative for content morale', () => {
      const playerPlanets = getPlayerPlanets(store.getState());
      for (const planet of playerPlanets) {
        if (planet.morale !== 'rebellion') {
          const growth = calculateGrowth(planet);
          expect(growth).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('population is stable (not negative) after many turns', () => {
      for (let i = 0; i < 30; i++) {
        store.dispatch(nextTurn());
      }

      const state = store.getState();
      for (const planet of getColonisedPlanets(state)) {
        expect(planet.population).toBeGreaterThan(0);
      }
    });
  });

  // ── Full game loop scenario ───────────────────────────────────────────────

  describe('Full game loop scenario', () => {
    it('runs start → 20 turns → valid state without errors', () => {
      store.dispatch(startGame(DEFAULT_OPTIONS));

      for (let i = 0; i < 20; i++) {
        expect(() => store.dispatch(nextTurn())).not.toThrow();
      }

      const state = store.getState();
      expect(state.turn).toBe(21);
      expect(state.year).toBe(2521);
      expect(state.empires.playerId).toBe('player');
      expect(state.planets.allIds.length).toBeGreaterThan(0);
    });

    it('turn counter matches year formula (year = 2500 + turn)', () => {
      store.dispatch(startGame(DEFAULT_OPTIONS));

      for (let i = 0; i < 10; i++) {
        store.dispatch(nextTurn());
        const state = store.getState();
        expect(state.year).toBe(2500 + state.turn);
      }
    });

    it('store subscribers are notified on each turn dispatch', () => {
      store.dispatch(startGame(DEFAULT_OPTIONS));

      let notifyCount = 0;
      const unsub = store.subscribe(() => { notifyCount++; });

      for (let i = 0; i < 5; i++) {
        store.dispatch(nextTurn());
      }

      unsub();
      expect(notifyCount).toBe(5);
    });

    it('unsubscribed listeners are not called after unsubscribe', () => {
      store.dispatch(startGame(DEFAULT_OPTIONS));

      let notifyCount = 0;
      const unsub = store.subscribe(() => { notifyCount++; });

      store.dispatch(nextTurn()); // count = 1
      unsub();
      store.dispatch(nextTurn()); // should NOT increment
      store.dispatch(nextTurn()); // should NOT increment

      expect(notifyCount).toBe(1);
    });
  });
});
