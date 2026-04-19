/**
 * Turn action tests.
 * test/game/actions/turn.test.ts
 */

import { describe, it, expect } from 'vitest';
import { nextTurn, turnReducer } from '../../../src/game/actions/turn';
import { GameState } from '../../../src/game/state';
import { initialState } from '../../../src/game/initialState';

describe('Turn Actions', () => {
  it('creates a NEXT_TURN action', () => {
    const action = nextTurn();
    expect(action.type).toBe('NEXT_TURN');
  });

  it('increments turn and year on NEXT_TURN', () => {
    const state: GameState = {
      ...initialState,
      turn: 10,
      year: 2510,
    };

    const newState = turnReducer(state, nextTurn());
    
    expect(newState.turn).toBe(11);
    expect(newState.year).toBe(2511);
    expect(newState.lastPlayed).toBeGreaterThan(state.lastPlayed);
  });

  it('returns state unchanged for unknown actions', () => {
    const state: GameState = initialState;
    const newState = turnReducer(state, { type: 'UNKNOWN' });
    
    expect(newState).toBe(state);
  });
});
