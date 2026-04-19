/**
 * Turn action creators and reducer — pure TypeScript, NO DOM.
 * src/game/actions/turn.ts
 */

import { Action } from '../store';
import { GameState } from '../state';
import { processTurn } from '../systems/turn';

// ── Action type constant ───────────────────────────────────────────────────

export const NEXT_TURN = 'NEXT_TURN' as const;

// ── Action creator ─────────────────────────────────────────────────────────

/** Create a NEXT_TURN action to advance the game by one turn. */
export function nextTurn(): Action {
  return { type: NEXT_TURN };
}

// ── Reducer ────────────────────────────────────────────────────────────────

/**
 * Handle NEXT_TURN actions by delegating to `processTurn`.
 * Returns `state` unchanged for any other action type.
 */
export function turnReducer(state: GameState, action: Action): GameState {
  if (action.type !== NEXT_TURN) return state;
  return processTurn(state);
}
