/**
 * Bootstrap entry point.
 * src/main.ts
 */

import { Store } from './game/store';
import { GameState } from './game/state';
import { rootReducer } from './game/reducer';
import { initialState } from './game/initialState';
import { App } from './ui/app';
import { initDebugHooks } from './debug';

console.log('🐹 Hamster of Orion — Initializing...');

// Start at new-game screen (no galaxy generated yet)
const startingState: GameState = {
  ...initialState,
  currentScreen: 'new_game',
};

// Create store
const store = new Store<GameState>(rootReducer, startingState);

// Expose debug API in dev mode
initDebugHooks(store);

// Start UI
new App(store);

console.log('✅ Hamster of Orion — Ready!');
