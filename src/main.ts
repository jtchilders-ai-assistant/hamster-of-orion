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
import { initDebugHooks } from './debug';

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
initDebugHooks(store);

// Start UI
new App(store);

console.log('✅ Hamster of Orion — Ready!');
