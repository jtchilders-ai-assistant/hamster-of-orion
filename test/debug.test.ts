/**
 * Unit tests for the debug interface (src/debug.ts).
 * test/debug.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Store } from '../src/game/store';
import { GameState } from '../src/game/state';
import { rootReducer } from '../src/game/reducer';
import { initialState } from '../src/game/initialState';
import { buildDebugInterface, initDebugHooks } from '../src/debug';
import { earlyGameState, midGameState } from './fixtures/states';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeStore(): Store<GameState> {
  return new Store<GameState>(rootReducer, initialState);
}

// ── Fixture sanity ────────────────────────────────────────────────────────────

describe('test fixtures', () => {
  it('earlyGameState has turn 1', () => {
    expect(earlyGameState.turn).toBe(1);
  });

  it('earlyGameState has the player empire', () => {
    expect(earlyGameState.empires.allIds).toContain('player');
    expect(earlyGameState.empires.byId['player'].isPlayer).toBe(true);
  });

  it('midGameState has turn 50', () => {
    expect(midGameState.turn).toBe(50);
  });

  it('midGameState has two empires', () => {
    expect(midGameState.empires.allIds).toHaveLength(2);
  });

  it('midGameState player has three planets', () => {
    expect(midGameState.empires.byId['player'].planets).toHaveLength(3);
  });
});

// ── Store: LOAD_STATE action ──────────────────────────────────────────────────

describe('rootReducer LOAD_STATE', () => {
  it('replaces state entirely', () => {
    const store = makeStore();
    expect(store.getState().turn).toBe(1);

    store.dispatch({ type: 'LOAD_STATE', payload: midGameState });
    expect(store.getState().turn).toBe(50);
  });

  it('replaces state with earlyGameState', () => {
    const store = makeStore();
    store.dispatch({ type: 'LOAD_STATE', payload: earlyGameState });
    expect(store.getState().seed).toBe('early-game-fixture');
  });
});

// ── buildDebugInterface ───────────────────────────────────────────────────────

describe('buildDebugInterface', () => {
  let store: Store<GameState>;

  beforeEach(() => {
    store = makeStore();
  });

  it('returns an object with all four required properties', () => {
    const debug = buildDebugInterface(store);
    expect(debug.store).toBe(store);
    expect(typeof debug.getState).toBe('function');
    expect(typeof debug.loadState).toBe('function');
    expect(typeof debug.dispatch).toBe('function');
  });

  it('getState() returns the current store state', () => {
    const debug = buildDebugInterface(store);
    expect(debug.getState()).toBe(store.getState());
  });

  it('loadState() injects test state via LOAD_STATE action', () => {
    const debug = buildDebugInterface(store);
    debug.loadState(midGameState);
    expect(store.getState().turn).toBe(50);
    expect(store.getState().seed).toBe('mid-game-fixture');
  });

  it('dispatch() sends arbitrary actions to the store', () => {
    const debug = buildDebugInterface(store);
    expect(store.getState().turn).toBe(1);
    debug.dispatch({ type: 'NEXT_TURN' });
    expect(store.getState().turn).toBe(2);
  });

  it('dispatch() with unknown action does not mutate state', () => {
    const debug = buildDebugInterface(store);
    const before = store.getState();
    debug.dispatch({ type: 'TOTALLY_UNKNOWN_ACTION' });
    expect(store.getState()).toBe(before);
  });

  it('getState() reflects state after loadState()', () => {
    const debug = buildDebugInterface(store);
    debug.loadState(earlyGameState);
    expect(debug.getState().seed).toBe('early-game-fixture');

    debug.loadState(midGameState);
    expect(debug.getState().seed).toBe('mid-game-fixture');
  });
});

// ── initDebugHooks ────────────────────────────────────────────────────────────

describe('initDebugHooks', () => {
  type DebugGlobal = typeof globalThis & { __HAMSTER_DEBUG__?: unknown };

  afterEach(() => {
    delete (globalThis as DebugGlobal).__HAMSTER_DEBUG__;
  });

  it('does NOT attach __HAMSTER_DEBUG__ when isDev=false', () => {
    const store = makeStore();
    initDebugHooks(store, false);
    expect((globalThis as DebugGlobal).__HAMSTER_DEBUG__).toBeUndefined();
  });

  it('attaches __HAMSTER_DEBUG__ when isDev=true', () => {
    const store = makeStore();
    initDebugHooks(store, true);
    expect((globalThis as DebugGlobal).__HAMSTER_DEBUG__).toBeDefined();
  });

  it('attached interface has all four members', () => {
    const store = makeStore();
    initDebugHooks(store, true);
    const debug = (globalThis as DebugGlobal).__HAMSTER_DEBUG__ as ReturnType<typeof buildDebugInterface>;
    expect(debug.store).toBe(store);
    expect(typeof debug.getState).toBe('function');
    expect(typeof debug.loadState).toBe('function');
    expect(typeof debug.dispatch).toBe('function');
  });

  it('attached getState() returns store state', () => {
    const store = makeStore();
    initDebugHooks(store, true);
    const debug = (globalThis as DebugGlobal).__HAMSTER_DEBUG__ as ReturnType<typeof buildDebugInterface>;
    expect(debug.getState()).toBe(store.getState());
  });

  it('attached loadState() injects state', () => {
    const store = makeStore();
    initDebugHooks(store, true);
    const debug = (globalThis as DebugGlobal).__HAMSTER_DEBUG__ as ReturnType<typeof buildDebugInterface>;
    debug.loadState(midGameState);
    expect(store.getState().turn).toBe(50);
  });

  it('attached dispatch() fires actions', () => {
    const store = makeStore();
    initDebugHooks(store, true);
    const debug = (globalThis as DebugGlobal).__HAMSTER_DEBUG__ as ReturnType<typeof buildDebugInterface>;
    debug.dispatch({ type: 'NEXT_TURN' });
    expect(store.getState().turn).toBe(2);
  });
});
