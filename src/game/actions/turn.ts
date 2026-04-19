/**
 * Turn actions — pure TypeScript, NO DOM.
 * src/game/actions/turn.ts
 */

import { Action } from '../store';
import { GameState } from '../state';

export const nextTurn = (): Action => ({
  type: 'NEXT_TURN',
});

export function turnReducer(state: GameState, action: Action): GameState {
  if (action.type !== 'NEXT_TURN') return state;

  const newTurn = state.turn + 1;

  return {
    ...state,
    turn: newTurn,
    year: 2500 + newTurn,
    lastPlayed: Date.now(),
  };
}
