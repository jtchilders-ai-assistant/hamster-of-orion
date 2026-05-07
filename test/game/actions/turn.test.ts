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
    // Start with turn 10 (year should be 2623 + 10 = 2633 per design doc)
    const state: GameState = {
      ...initialState,
      turn: 10,
      year: 2633, // 2623 + 10 per design/game-mechanics/turn-structure.md
    };

    const newState = turnReducer(state, nextTurn());
    
    expect(newState.turn).toBe(11);
    expect(newState.year).toBe(2634); // 2623 + 11
    expect(newState.lastPlayed).toBeGreaterThan(state.lastPlayed);
  });

  it('returns state unchanged for unknown actions', () => {
    const state: GameState = initialState;
    const newState = turnReducer(state, { type: 'UNKNOWN' });
    
    expect(newState).toBe(state);
  });
});
