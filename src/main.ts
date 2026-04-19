/**
 * Bootstrap entry point.
 * src/main.ts
 */

import { Store } from './game/store';
import { GameState } from './game/state';
import { rootReducer } from './game/reducer';
import { initialState } from './game/initialState';
import { generateGalaxy } from './game/generators/galaxy';
import { App } from './ui/app';

console.log('🐹 Hamster of Orion — Initializing...');

// Generate initial galaxy
const genResult = generateGalaxy({
  size: 'medium',
  shape: 'spiral',
  seed: 42,
  playerCount: 4,
});

const startingState: GameState = {
  ...initialState,
  galaxy: genResult.galaxy,
  planets: {
    byId: genResult.planets,
    allIds: genResult.planetIds,
  },
  currentScreen: 'galaxy',
};

// Create store
const store = new Store<GameState>(rootReducer, startingState);

// Expose debug API in dev mode
if (import.meta.env.DEV) {
  (window as any).__HAMSTER_DEBUG__ = {
    store,
    loadState: (state: GameState) => store.dispatch({ type: 'LOAD_STATE', payload: state }),
    getState: () => store.getState(),
    dispatch: (action: any) => store.dispatch(action),
  };
  console.log('🔧 Debug API available at window.__HAMSTER_DEBUG__');
}

// Start UI
new App(store);

console.log('✅ Hamster of Orion — Ready!');
