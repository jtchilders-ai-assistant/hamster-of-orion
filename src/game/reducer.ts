/**
 * Root reducer — pure TypeScript, NO DOM.
 * src/game/reducer.ts
 *
 * Delegates to sub-reducers by action type.
 */

import { Action } from './store';
import { GameState, ScreenType } from './state';
import { turnReducer } from './actions/turn';

const VALID_SCREENS: ReadonlySet<string> = new Set<ScreenType>([
  'menu', 'galaxy', 'planet', 'planet_list', 'fleet', 'research',
  'diplomacy', 'ship_design', 'reports', 'council', 'combat',
]);

export function rootReducer(state: GameState, action: Action): GameState {
  // Special: LOAD_STATE replaces entire state (used for debug injection)
  if (action.type === 'LOAD_STATE') {
    return action.payload as GameState;
  }

  // Screen navigation
  if (action.type === 'NAVIGATE') {
    const screen = (action.payload as { screen: string }).screen;
    if (!VALID_SCREENS.has(screen)) return state;
    return {
      ...state,
      currentScreen: screen as ScreenType,
      ui: {
        ...state.ui,
        previousScreen: state.currentScreen,
        currentScreen: screen as ScreenType,
      },
    };
  }

  // Star system selection
  if (action.type === 'SELECT_SYSTEM') {
    const { systemId } = action.payload as { systemId: string | null };
    return {
      ...state,
      ui: {
        ...state.ui,
        selectedSystem: systemId,
        // Clear sub-selections when switching systems
        selectedPlanet: null,
        selectedFleet: null,
      },
    };
  }

  // Route to sub-reducers
  if (action.type === 'NEXT_TURN') {
    return turnReducer(state, action);
  }

  // Unknown action — return unchanged state
  return state;
}
