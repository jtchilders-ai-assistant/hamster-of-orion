/**
 * Store class unit tests.
 * test/game/store.test.ts
 */

import { describe, it, expect, vi } from 'vitest';
import { Store, Action } from '../../src/game/store';

// ── Minimal test types ────────────────────────────────────────────────────────

interface CounterState {
  count: number;
  lastAction: string;
}

const initialCounter: CounterState = { count: 0, lastAction: 'INIT' };

function counterReducer(state: CounterState, action: Action): CounterState {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1, lastAction: 'INCREMENT' };
    case 'DECREMENT':
      return { ...state, count: state.count - 1, lastAction: 'DECREMENT' };
    case 'ADD':
      return { ...state, count: state.count + (action.payload as number), lastAction: 'ADD' };
    case 'RESET':
      return { ...initialCounter };
    default:
      return state;
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Store', () => {

  describe('constructor and getState()', () => {
    it('initializes with the provided initial state', () => {
      const store = new Store(counterReducer, initialCounter);
      expect(store.getState()).toEqual(initialCounter);
    });

    it('returns the exact initial state reference before any dispatch', () => {
      const state = { count: 42, lastAction: 'INIT' };
      const store = new Store(counterReducer, state);
      expect(store.getState()).toBe(state);
    });

    it('accepts generic type parameter', () => {
      interface StringState { value: string }
      const reducer = (s: StringState, _a: Action): StringState => s;
      const store = new Store(reducer, { value: 'hello' });
      expect(store.getState().value).toBe('hello');
    });
  });

  describe('dispatch()', () => {
    it('updates state via the reducer', () => {
      const store = new Store(counterReducer, initialCounter);
      store.dispatch({ type: 'INCREMENT' });
      expect(store.getState().count).toBe(1);
    });

    it('applies multiple dispatches sequentially', () => {
      const store = new Store(counterReducer, initialCounter);
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'INCREMENT' });
      expect(store.getState().count).toBe(3);
    });

    it('passes payload to the reducer', () => {
      const store = new Store(counterReducer, initialCounter);
      store.dispatch({ type: 'ADD', payload: 10 });
      expect(store.getState().count).toBe(10);
    });

    it('does not mutate state — returns a new state object', () => {
      const store = new Store(counterReducer, initialCounter);
      const before = store.getState();
      store.dispatch({ type: 'INCREMENT' });
      const after = store.getState();
      expect(after).not.toBe(before);
    });

    it('leaves state unchanged for unknown action types', () => {
      const store = new Store(counterReducer, initialCounter);
      const before = store.getState();
      store.dispatch({ type: 'UNKNOWN_ACTION' });
      expect(store.getState()).toBe(before);
    });

    it('records the latest action in state', () => {
      const store = new Store(counterReducer, initialCounter);
      store.dispatch({ type: 'DECREMENT' });
      expect(store.getState().lastAction).toBe('DECREMENT');
    });

    it('correctly applies RESET back to initial values', () => {
      const store = new Store(counterReducer, initialCounter);
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'RESET' });
      expect(store.getState().count).toBe(0);
    });
  });

  describe('subscribe()', () => {
    it('calls listener after each dispatch', () => {
      const store = new Store(counterReducer, initialCounter);
      const listener = vi.fn();
      store.subscribe(listener);

      store.dispatch({ type: 'INCREMENT' });
      expect(listener).toHaveBeenCalledTimes(1);

      store.dispatch({ type: 'INCREMENT' });
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('calls listener with the new state', () => {
      const store = new Store(counterReducer, initialCounter);
      const listener = vi.fn();
      store.subscribe(listener);

      store.dispatch({ type: 'INCREMENT' });
      expect(listener).toHaveBeenCalledWith({ count: 1, lastAction: 'INCREMENT' });
    });

    it('supports multiple listeners', () => {
      const store = new Store(counterReducer, initialCounter);
      const listenerA = vi.fn();
      const listenerB = vi.fn();

      store.subscribe(listenerA);
      store.subscribe(listenerB);
      store.dispatch({ type: 'INCREMENT' });

      expect(listenerA).toHaveBeenCalledTimes(1);
      expect(listenerB).toHaveBeenCalledTimes(1);
    });

    it('does NOT call listener before any dispatch', () => {
      const store = new Store(counterReducer, initialCounter);
      const listener = vi.fn();
      store.subscribe(listener);
      expect(listener).not.toHaveBeenCalled();
    });

    it('returns an unsubscribe function', () => {
      const store = new Store(counterReducer, initialCounter);
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');
    });

    it('stops calling listener after unsubscribe', () => {
      const store = new Store(counterReducer, initialCounter);
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);

      store.dispatch({ type: 'INCREMENT' });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      store.dispatch({ type: 'INCREMENT' });
      expect(listener).toHaveBeenCalledTimes(1); // still 1 — no new call
    });

    it('unsubscribing one listener does not affect others', () => {
      const store = new Store(counterReducer, initialCounter);
      const listenerA = vi.fn();
      const listenerB = vi.fn();

      const unsubscribeA = store.subscribe(listenerA);
      store.subscribe(listenerB);

      unsubscribeA();
      store.dispatch({ type: 'INCREMENT' });

      expect(listenerA).not.toHaveBeenCalled();
      expect(listenerB).toHaveBeenCalledTimes(1);
    });

    it('calling unsubscribe multiple times does not throw', () => {
      const store = new Store(counterReducer, initialCounter);
      const unsubscribe = store.subscribe(vi.fn());
      expect(() => {
        unsubscribe();
        unsubscribe();
      }).not.toThrow();
    });

    it('allows re-subscribing after unsubscribe', () => {
      const store = new Store(counterReducer, initialCounter);
      const listener = vi.fn();

      const unsub = store.subscribe(listener);
      unsub();

      store.subscribe(listener);
      store.dispatch({ type: 'INCREMENT' });

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Action interface', () => {
    it('accepts action with type only', () => {
      const action: Action = { type: 'INCREMENT' };
      expect(action.type).toBe('INCREMENT');
    });

    it('accepts action with type and payload', () => {
      const action: Action = { type: 'ADD', payload: 5 };
      expect(action.payload).toBe(5);
    });

    it('accepts complex payload types', () => {
      const payload = { nested: { value: 42 } };
      const action: Action = { type: 'COMPLEX', payload };
      expect((action.payload as typeof payload).nested.value).toBe(42);
    });
  });

  describe('integration with GameState-like structure', () => {
    interface SimpleGameState {
      turn: number;
      credits: number;
    }

    function gameReducer(state: SimpleGameState, action: Action): SimpleGameState {
      if (action.type === 'NEXT_TURN') {
        return { ...state, turn: state.turn + 1 };
      }
      if (action.type === 'EARN_CREDITS') {
        return { ...state, credits: state.credits + (action.payload as number) };
      }
      if (action.type === 'LOAD_STATE') {
        return action.payload as SimpleGameState;
      }
      return state;
    }

    it('can model a simple turn-based game state', () => {
      const store = new Store(gameReducer, { turn: 1, credits: 100 });

      store.dispatch({ type: 'NEXT_TURN' });
      store.dispatch({ type: 'EARN_CREDITS', payload: 50 });

      expect(store.getState()).toEqual({ turn: 2, credits: 150 });
    });

    it('supports LOAD_STATE for debug injection', () => {
      const store = new Store(gameReducer, { turn: 1, credits: 100 });
      const injectedState: SimpleGameState = { turn: 50, credits: 9999 };

      store.dispatch({ type: 'LOAD_STATE', payload: injectedState });

      expect(store.getState()).toEqual(injectedState);
    });

    it('notifies listeners on LOAD_STATE dispatch', () => {
      const store = new Store(gameReducer, { turn: 1, credits: 0 });
      const listener = vi.fn();
      store.subscribe(listener);

      const injected: SimpleGameState = { turn: 99, credits: 1000 };
      store.dispatch({ type: 'LOAD_STATE', payload: injected });

      expect(listener).toHaveBeenCalledWith(injected);
    });
  });
});
