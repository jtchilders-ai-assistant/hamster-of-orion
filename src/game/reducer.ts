/**
 * Root reducer — pure TypeScript, NO DOM.
 * src/game/reducer.ts
 *
 * Delegates to sub-reducers by action type.
 */

import { Action } from './store';
import { GameState } from './state';
import { turnReducer } from './actions/turn';

export function rootReducer(state: GameState, action: Action): GameState {
  // Special: LOAD_STATE replaces entire state (used for debug injection)
  if (action.type === 'LOAD_STATE') {
    return action.payload as GameState;
  }

  // Route to sub-reducers
  if (action.type === 'NEXT_TURN') {
    return turnReducer(state, action);
  }

  // Unknown action — return unchanged state
  return state;
}
