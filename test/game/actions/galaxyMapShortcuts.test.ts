/**
 * Galaxy Map Shortcuts Tests
 * test/game/actions/galaxyMapShortcuts.test.ts
 *
 * Tests for fix-39: Galaxy Map keyboard shortcuts per interaction-spec.md §2.2.
 * - N/Shift+N: Cycle colonies
 * - F/Shift+F: Cycle fleets
 * - G: Toggle grid
 * - R: Toggle range circles
 * - T: Toggle trade routes
 * - E: Highlight enemy fleets
 */

import { describe, it, expect } from 'vitest';
import { rootReducer } from '../../../src/game/reducer';
import { initialState } from '../../../src/game/initialState';
import type { GameState, Planet, Fleet } from '../../../src/game/state';

/** Create a test state with colonies and fleets for the player. */
function createTestState(): GameState {
  const playerId = 'player';
  const enemyId = 'enemy';

  // Create mock planets (colonies)
  const planet1: Planet = {
    id: 'planet-1',
    systemId: 'system-1',
    name: 'Alpha Colony',
    ownerId: playerId,
    environment: 'terran',
    size: 'large',
    mineralRichness: 'normal',
    maxPopulation: 100,
    currentPopulation: 50,
    factories: 20,
    maxFactories: 100,
    defenseInstallations: [],
    buildings: [],
    buildQueue: [],
    productionAllocation: { ship: 0, defense: 0, industry: 0, ecology: 0, research: 0 },
    sliderLocks: { ship: false, defense: false, industry: false, ecology: false, research: false },
    morale: 100,
    unrest: 0,
    pollutionLevel: 0,
    terraformProgress: 0,
    isHomeworld: true,
    hasArtifacts: false,
    researchMultiplier: 1.0,
    productionProgress: 0,
  };

  const planet2: Planet = {
    ...planet1,
    id: 'planet-2',
    systemId: 'system-2',
    name: 'Beta Colony',
    isHomeworld: false,
  };

  const planet3: Planet = {
    ...planet1,
    id: 'planet-3',
    systemId: 'system-3',
    name: 'Gamma Colony',
    ownerId: enemyId, // Enemy planet — should not be selected
  };

  // Create mock fleets
  const fleet1: Fleet = {
    id: 'fleet-1',
    name: 'First Fleet',
    ownerId: playerId,
    systemId: 'system-1',
    destination: null,
    shipIds: [],
    isInCombat: false,
    eta: 0,
    route: [],
    troops: 0,
    movementPoints: 3,
    maxMovement: 3,
    orders: 'guard',
    experience: 'green',
    combatId: null,
  };

  const fleet2: Fleet = {
    ...fleet1,
    id: 'fleet-2',
    name: 'Second Fleet',
    systemId: 'system-2',
  };

  const fleet3: Fleet = {
    ...fleet1,
    id: 'fleet-3',
    name: 'Enemy Fleet',
    ownerId: enemyId, // Enemy fleet — should not be selected
    systemId: 'system-3',
  };

  return {
    ...initialState,
    empires: {
      byId: {
        [playerId]: {
          id: playerId,
          name: 'Player Empire',
          raceId: 'hamsters',
          color: '#00ff00',
          homeSystemId: 'system-1',
          controlledSystemIds: ['system-1', 'system-2'],
          knownSystemIds: ['system-1', 'system-2', 'system-3'],
          treasury: 100,
          researchPoints: {},
          currentResearch: {},
          completedTechs: [],
          diplomaticRelations: {},
          spyNetwork: {},
          traits: [],
          isPlayer: true,
          isDefeated: false,
        },
        [enemyId]: {
          id: enemyId,
          name: 'Enemy Empire',
          raceId: 'guinea_pigs',
          color: '#ff0000',
          homeSystemId: 'system-3',
          controlledSystemIds: ['system-3'],
          knownSystemIds: ['system-1', 'system-2', 'system-3'],
          treasury: 100,
          researchPoints: {},
          currentResearch: {},
          completedTechs: [],
          diplomaticRelations: {},
          spyNetwork: {},
          traits: [],
          isPlayer: false,
          isDefeated: false,
        },
      },
      allIds: [playerId, enemyId],
      playerId,
    },
    planets: {
      byId: {
        'planet-1': planet1,
        'planet-2': planet2,
        'planet-3': planet3,
      },
      allIds: ['planet-1', 'planet-2', 'planet-3'],
    },
    fleets: {
      byId: {
        'fleet-1': fleet1,
        'fleet-2': fleet2,
        'fleet-3': fleet3,
      },
      allIds: ['fleet-1', 'fleet-2', 'fleet-3'],
    },
    ui: {
      ...initialState.ui,
      selectedSystem: null,
      selectedFleet: null,
    },
  };
}

describe('Galaxy Map Shortcuts (interaction-spec.md §2.2)', () => {
  describe('TOGGLE_GRID (G key)', () => {
    it('toggles showGrid from false to true', () => {
      const state = createTestState();
      expect(state.ui.settings.showGrid).toBe(false);

      const newState = rootReducer(state, { type: 'TOGGLE_GRID' });
      expect(newState.ui.settings.showGrid).toBe(true);
    });

    it('toggles showGrid from true to false', () => {
      const state = createTestState();
      state.ui.settings.showGrid = true;

      const newState = rootReducer(state, { type: 'TOGGLE_GRID' });
      expect(newState.ui.settings.showGrid).toBe(false);
    });
  });

  describe('TOGGLE_RANGE_CIRCLES (R key)', () => {
    it('toggles showRangeCircles from false to true', () => {
      const state = createTestState();
      expect(state.ui.galaxyMapToggles.showRangeCircles).toBe(false);

      const newState = rootReducer(state, { type: 'TOGGLE_RANGE_CIRCLES' });
      expect(newState.ui.galaxyMapToggles.showRangeCircles).toBe(true);
    });

    it('toggles showRangeCircles from true to false', () => {
      const state = createTestState();
      state.ui.galaxyMapToggles.showRangeCircles = true;

      const newState = rootReducer(state, { type: 'TOGGLE_RANGE_CIRCLES' });
      expect(newState.ui.galaxyMapToggles.showRangeCircles).toBe(false);
    });
  });

  describe('TOGGLE_TRADE_ROUTES (T key)', () => {
    it('toggles showTradeRoutes from false to true', () => {
      const state = createTestState();
      expect(state.ui.galaxyMapToggles.showTradeRoutes).toBe(false);

      const newState = rootReducer(state, { type: 'TOGGLE_TRADE_ROUTES' });
      expect(newState.ui.galaxyMapToggles.showTradeRoutes).toBe(true);
    });

    it('toggles showTradeRoutes from true to false', () => {
      const state = createTestState();
      state.ui.galaxyMapToggles.showTradeRoutes = true;

      const newState = rootReducer(state, { type: 'TOGGLE_TRADE_ROUTES' });
      expect(newState.ui.galaxyMapToggles.showTradeRoutes).toBe(false);
    });
  });

  describe('TOGGLE_HIGHLIGHT_ENEMIES (E key)', () => {
    it('toggles highlightEnemyFleets from false to true', () => {
      const state = createTestState();
      expect(state.ui.galaxyMapToggles.highlightEnemyFleets).toBe(false);

      const newState = rootReducer(state, { type: 'TOGGLE_HIGHLIGHT_ENEMIES' });
      expect(newState.ui.galaxyMapToggles.highlightEnemyFleets).toBe(true);
    });

    it('toggles highlightEnemyFleets from true to false', () => {
      const state = createTestState();
      state.ui.galaxyMapToggles.highlightEnemyFleets = true;

      const newState = rootReducer(state, { type: 'TOGGLE_HIGHLIGHT_ENEMIES' });
      expect(newState.ui.galaxyMapToggles.highlightEnemyFleets).toBe(false);
    });
  });

  describe('SELECT_NEXT_COLONY (N key)', () => {
    it('selects first player colony when nothing selected', () => {
      const state = createTestState();
      expect(state.ui.selectedSystem).toBeNull();

      const newState = rootReducer(state, { type: 'SELECT_NEXT_COLONY' });
      // Should select first player colony alphabetically (Alpha Colony)
      expect(newState.ui.selectedSystem).toBe('system-1');
      expect(newState.ui.selectedPlanet).toBe('planet-1');
    });

    it('cycles to next player colony', () => {
      const state = createTestState();
      state.ui.selectedSystem = 'system-1';

      const newState = rootReducer(state, { type: 'SELECT_NEXT_COLONY' });
      // Should select Beta Colony (next alphabetically)
      expect(newState.ui.selectedSystem).toBe('system-2');
      expect(newState.ui.selectedPlanet).toBe('planet-2');
    });

    it('wraps around to first colony after last', () => {
      const state = createTestState();
      state.ui.selectedSystem = 'system-2'; // Beta Colony (last player colony)

      const newState = rootReducer(state, { type: 'SELECT_NEXT_COLONY' });
      // Should wrap to Alpha Colony
      expect(newState.ui.selectedSystem).toBe('system-1');
      expect(newState.ui.selectedPlanet).toBe('planet-1');
    });

    it('skips enemy colonies', () => {
      // The test state has Gamma Colony owned by enemy — it should be skipped
      const state = createTestState();
      state.ui.selectedSystem = 'system-1';

      const newState1 = rootReducer(state, { type: 'SELECT_NEXT_COLONY' });
      expect(newState1.ui.selectedSystem).toBe('system-2'); // Beta Colony

      const newState2 = rootReducer(newState1, { type: 'SELECT_NEXT_COLONY' });
      expect(newState2.ui.selectedSystem).toBe('system-1'); // Back to Alpha, skipped Gamma
    });
  });

  describe('SELECT_PREV_COLONY (Shift+N)', () => {
    it('selects last player colony when nothing selected', () => {
      const state = createTestState();
      expect(state.ui.selectedSystem).toBeNull();

      const newState = rootReducer(state, { type: 'SELECT_PREV_COLONY' });
      // Should select last player colony alphabetically (Beta Colony)
      expect(newState.ui.selectedSystem).toBe('system-2');
      expect(newState.ui.selectedPlanet).toBe('planet-2');
    });

    it('cycles to previous player colony', () => {
      const state = createTestState();
      state.ui.selectedSystem = 'system-2'; // Beta Colony

      const newState = rootReducer(state, { type: 'SELECT_PREV_COLONY' });
      // Should select Alpha Colony
      expect(newState.ui.selectedSystem).toBe('system-1');
      expect(newState.ui.selectedPlanet).toBe('planet-1');
    });

    it('wraps around to last colony after first', () => {
      const state = createTestState();
      state.ui.selectedSystem = 'system-1'; // Alpha Colony (first player colony)

      const newState = rootReducer(state, { type: 'SELECT_PREV_COLONY' });
      // Should wrap to Beta Colony
      expect(newState.ui.selectedSystem).toBe('system-2');
      expect(newState.ui.selectedPlanet).toBe('planet-2');
    });
  });

  describe('SELECT_NEXT_FLEET (F key)', () => {
    it('selects first player fleet when nothing selected', () => {
      const state = createTestState();
      expect(state.ui.selectedFleet).toBeNull();

      const newState = rootReducer(state, { type: 'SELECT_NEXT_FLEET' });
      // Should select first player fleet alphabetically (First Fleet)
      expect(newState.ui.selectedFleet).toBe('fleet-1');
      expect(newState.ui.selectedSystem).toBe('system-1');
    });

    it('cycles to next player fleet', () => {
      const state = createTestState();
      state.ui.selectedFleet = 'fleet-1';

      const newState = rootReducer(state, { type: 'SELECT_NEXT_FLEET' });
      // Should select Second Fleet
      expect(newState.ui.selectedFleet).toBe('fleet-2');
    });

    it('wraps around to first fleet after last', () => {
      const state = createTestState();
      state.ui.selectedFleet = 'fleet-2'; // Second Fleet (last player fleet)

      const newState = rootReducer(state, { type: 'SELECT_NEXT_FLEET' });
      // Should wrap to First Fleet
      expect(newState.ui.selectedFleet).toBe('fleet-1');
    });

    it('skips enemy fleets', () => {
      const state = createTestState();
      state.ui.selectedFleet = 'fleet-1';

      const newState1 = rootReducer(state, { type: 'SELECT_NEXT_FLEET' });
      expect(newState1.ui.selectedFleet).toBe('fleet-2'); // Second Fleet

      const newState2 = rootReducer(newState1, { type: 'SELECT_NEXT_FLEET' });
      expect(newState2.ui.selectedFleet).toBe('fleet-1'); // Back to First, skipped Enemy
    });
  });

  describe('SELECT_PREV_FLEET (Shift+F)', () => {
    it('selects last player fleet when nothing selected', () => {
      const state = createTestState();
      expect(state.ui.selectedFleet).toBeNull();

      const newState = rootReducer(state, { type: 'SELECT_PREV_FLEET' });
      // Should select last player fleet alphabetically (Second Fleet)
      expect(newState.ui.selectedFleet).toBe('fleet-2');
    });

    it('cycles to previous player fleet', () => {
      const state = createTestState();
      state.ui.selectedFleet = 'fleet-2'; // Second Fleet

      const newState = rootReducer(state, { type: 'SELECT_PREV_FLEET' });
      // Should select First Fleet
      expect(newState.ui.selectedFleet).toBe('fleet-1');
    });

    it('wraps around to last fleet after first', () => {
      const state = createTestState();
      state.ui.selectedFleet = 'fleet-1'; // First Fleet (first player fleet)

      const newState = rootReducer(state, { type: 'SELECT_PREV_FLEET' });
      // Should wrap to Second Fleet
      expect(newState.ui.selectedFleet).toBe('fleet-2');
    });
  });
});
