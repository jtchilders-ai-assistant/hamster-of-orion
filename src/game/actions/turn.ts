/**
 * Turn action creators and reducer — pure TypeScript, NO DOM.
 * src/game/actions/turn.ts
 */

import { Action } from '../store';
import { GameState, ScreenType, TurnPhase } from '../state';
import { processTurn } from '../systems/turn';

// ── Action type constants ──────────────────────────────────────────────────

export const NEXT_TURN = 'NEXT_TURN' as const;
export const SKIP_TURN_SUMMARY = 'SKIP_TURN_SUMMARY' as const;
export const SET_TURN_PHASE = 'SET_TURN_PHASE' as const;

// ── Action creators ────────────────────────────────────────────────────────

/**
 * Create a NEXT_TURN action to advance the game by one turn.
 * After processing, navigates to the turn summary screen by default.
 * Pass { skipSummary: true } to go directly to galaxy view.
 */
export function nextTurn(options?: { skipSummary?: boolean }): Action {
  if (options?.skipSummary) {
    return { type: NEXT_TURN, payload: { skipSummary: true } };
  }
  return { type: NEXT_TURN };
}

/**
 * Create an action to skip the turn summary and go directly to galaxy view.
 * Used when the player has auto-end-turn enabled.
 */
export function skipTurnSummary(): Action {
  return { type: SKIP_TURN_SUMMARY };
}

/**
 * Create an action to update the current turn phase (for UI display during processing).
 * This is typically used internally during turn processing.
 */
export function setTurnPhase(phase: TurnPhase | null): Action {
  return {
    type: SET_TURN_PHASE,
    payload: { phase },
  };
}

// ── Reducer ────────────────────────────────────────────────────────────────

/**
 * Handle turn-related actions by delegating to `processTurn`.
 * Returns `state` unchanged for any other action type.
 */
export function turnReducer(state: GameState, action: Action): GameState {
  // Handle NEXT_TURN
  if (action.type === NEXT_TURN) {
    const payload = action.payload as { skipSummary?: boolean } | undefined;
    const skipSummary = payload?.skipSummary ?? false;

    // Process the turn through all 12 phases
    const afterTurn = processTurn(state);

    // If game is over, navigate to victory screen
    if (afterTurn.isGameOver) {
      return {
        ...afterTurn,
        currentScreen: 'victory' as ScreenType,
        ui: {
          ...afterTurn.ui,
          previousScreen: afterTurn.currentScreen,
          currentScreen: 'victory' as ScreenType,
        },
      };
    }

    // Navigate based on skipSummary option
    const nextScreen: ScreenType = skipSummary ? 'galaxy' : 'turn_summary';

    return {
      ...afterTurn,
      currentScreen: nextScreen,
      ui: {
        ...afterTurn.ui,
        previousScreen: afterTurn.currentScreen,
        currentScreen: nextScreen,
      },
    };
  }

  // Handle SKIP_TURN_SUMMARY (navigate from summary to galaxy)
  if (action.type === SKIP_TURN_SUMMARY) {
    return {
      ...state,
      currentScreen: 'galaxy' as ScreenType,
      ui: {
        ...state.ui,
        previousScreen: state.currentScreen,
        currentScreen: 'galaxy' as ScreenType,
      },
    };
  }

  // Handle SET_TURN_PHASE (update current phase for UI display)
  if (action.type === SET_TURN_PHASE) {
    const payload = action.payload as { phase: TurnPhase | null };
    return {
      ...state,
      currentPhase: payload.phase,
    };
  }

  return state;
}
