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
console.log('[main] DOMContentLoaded state:', document.readyState);

// Start at new-game screen (no galaxy generated yet)
const startingState: GameState = {
  ...initialState,
  currentScreen: 'new_game',
};

// Create store
console.log('[main] Creating store, initial currentScreen:', startingState.currentScreen);
const store = new Store<GameState>(rootReducer, startingState);
console.log('[main] Store created, verified currentScreen:', store.getState().currentScreen);

// Expose debug API in dev mode
initDebugHooks(store);

// Start UI — with full error tracking
try {
  const appEl = document.getElementById('app');
  console.log('[main] #app element:', appEl ? 'found' : 'NOT FOUND', 'children:', appEl?.children.length);
  if (appEl) {
    console.log('[main] #app innerHTML (first 800 chars):', appEl.innerHTML.substring(0, 800));
    // Dump all top-level children IDs
    Array.from(appEl.children).forEach((child, i) => {
      console.log(`[main]   #app child[${i}]: tag=<${child.tagName.toLowerCase()}>, id="${child.id || '(none)'}", class="${child.className || '(none)'}"`);
    });
  }
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
