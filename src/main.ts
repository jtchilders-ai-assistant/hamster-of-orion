/**
 * Bootstrap entry point.
 * src/main.ts
 */

import './styles/main.css';
import { Store } from './game/store';
import { GameState } from './game/state';
import { rootReducer } from './game/reducer';
import { initialState } from './game/initialState';
import { Commander } from './ui/components/Commander';
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

// Start UI — with full error tracking
try {
  const appEl = document.getElementById('app');
  console.log('[main] #app element:', appEl ? 'found' : 'NOT FOUND');
  if (!appEl) {
    console.error('[main] FATAL: #app element not in DOM!');
    document.body.innerHTML = '<h1 style="color:red;padding:20px;">FATAL: #app element not found in HTML</h1>';
  }
  new Commander(appEl!, store);
  console.log('[main] Commander created successfully');
} catch (err) {
  console.error('[main] FATAL during Commander creation:', err);
  document.body.innerHTML = `<h1 style="color:red;padding:20px;">FATAL: ${err}</h1>`;
}

console.log('✅ Hamster of Orion — Ready!');
