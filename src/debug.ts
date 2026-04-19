/**
 * Debug interface for AI-driven browser testing and manual game state inspection.
 * src/debug.ts
 *
 * Only attaches window.__HAMSTER_DEBUG__ in dev mode (import.meta.env.DEV).
 */

import { Store, Action } from './game/store';
import { GameState } from './game/state';

// ── Type augmentation ──────────────────────────────────────────────────────────

export interface HamsterDebugInterface {
  store: Store<GameState>;
  loadState: (state: GameState) => void;
  getState: () => GameState;
  dispatch: (action: Action) => void;
}

declare global {
  interface Window {
    __HAMSTER_DEBUG__: HamsterDebugInterface;
  }
}

// ── Debug interface factory ───────────────────────────────────────────────────

/**
 * Build the debug interface object for a given store.
 * Pure function — does not touch globals. Useful for unit testing.
 */
export function buildDebugInterface(store: Store<GameState>): HamsterDebugInterface {
  return {
    store,
    loadState: (state: GameState) =>
      store.dispatch({ type: 'LOAD_STATE', payload: state }),
    getState: () => store.getState(),
    dispatch: (action: Action) => store.dispatch(action),
  };
}

// ── Debug hook initializer ────────────────────────────────────────────────────

/**
 * Attach the debug interface to `globalThis.__HAMSTER_DEBUG__`.
 * No-ops in production (import.meta.env.DEV === false).
 *
 * @param store - The game store instance.
 * @param isDev - Override for the DEV flag (defaults to import.meta.env.DEV).
 *   Useful for testing without relying on Vite's compile-time constant.
 */
export function initDebugHooks(
  store: Store<GameState>,
  isDev: boolean = Boolean(import.meta.env.DEV),
): void {
  if (!isDev) return;

  // Use globalThis so this works in both browser and node (test) environments
  (globalThis as typeof globalThis & { __HAMSTER_DEBUG__: HamsterDebugInterface }).__HAMSTER_DEBUG__ =
    buildDebugInterface(store);

  console.log('🔧 Debug API available at window.__HAMSTER_DEBUG__');
}
