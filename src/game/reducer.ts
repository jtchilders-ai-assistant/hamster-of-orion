/**
 * Root reducer — pure TypeScript, NO DOM.
 * src/game/reducer.ts
 *
 * Delegates to sub-reducers by action type.
 */

import { Action } from './store';
import { GameState, ScreenType } from './state';
import { turnReducer } from './actions/turn';
import { newGameReducer } from './actions/newGame';

const VALID_SCREENS: ReadonlySet<string> = new Set<ScreenType>([
  'menu', 'new_game', 'galaxy', 'planet', 'planet_list', 'fleet', 'research',
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

  // Planet selection — navigates to planet screen
  if (action.type === 'SELECT_PLANET') {
    const { planetId } = action.payload as { planetId: string | null };
    return {
      ...state,
      currentScreen: 'planet' as const,
      ui: {
        ...state.ui,
        selectedPlanet: planetId,
        previousScreen: state.currentScreen,
        currentScreen: 'planet' as const,
      },
    };
  }

  // Fleet selection
  if (action.type === 'SELECT_FLEET') {
    const { fleetId } = action.payload as { fleetId: string | null };
    return {
      ...state,
      ui: {
        ...state.ui,
        selectedFleet: fleetId,
      },
    };
  }

  // Production slider update
  if (action.type === 'UPDATE_PRODUCTION') {
    const { planetId, sliders } = action.payload as {
      planetId: string;
      sliders: Partial<{
        ship: number;
        defense: number;
        industry: number;
        ecology: number;
        research: number;
      }>;
    };

    const planet = state.planets.byId[planetId];
    if (!planet) return state;

    const updated = {
      ...planet,
      production: {
        ship:     sliders.ship     ?? planet.production.ship,
        defense:  sliders.defense  ?? planet.production.defense,
        industry: sliders.industry ?? planet.production.industry,
        ecology:  sliders.ecology  ?? planet.production.ecology,
        research: sliders.research ?? planet.production.research,
      },
    };

    return {
      ...state,
      planets: {
        ...state.planets,
        byId: { ...state.planets.byId, [planetId]: updated },
      },
    };
  }

  // Lock / unlock slider flags (stored as ui hints; no planet state change needed)
  // These are purely UI-side; PlanetScreen tracks them locally.
  // We handle them here to keep the store as single source of truth if needed later.
  if (action.type === 'LOCK_SLIDER' || action.type === 'UNLOCK_SLIDER') {
    // No persistent state change for now — PlanetScreen manages lock state internally.
    return state;
  }

  // Route to sub-reducers
  if (action.type === 'NEXT_TURN') {
    return turnReducer(state, action);
  }

  if (action.type === 'START_GAME') {
    return newGameReducer(state, action);
  }

  // ── Ship Design CRUD ─────────────────────────────────────────────────────

  if (action.type === 'ADD_SHIP_DESIGN') {
    const design = (action.payload as { design: import('./state').ShipDesign }).design;
    const empireId = state.empires.playerId;
    const empire = state.empires.byId[empireId];
    if (!empire) return state;

    return {
      ...state,
      shipDesigns: {
        byId: { ...state.shipDesigns.byId, [design.id]: design },
        allIds: state.shipDesigns.allIds.includes(design.id)
          ? state.shipDesigns.allIds
          : [...state.shipDesigns.allIds, design.id],
      },
      empires: {
        ...state.empires,
        byId: {
          ...state.empires.byId,
          [empireId]: {
            ...empire,
            shipDesigns: empire.shipDesigns.includes(design.id)
              ? empire.shipDesigns
              : [...empire.shipDesigns, design.id],
          },
        },
      },
    };
  }

  if (action.type === 'DELETE_SHIP_DESIGN') {
    const { designId } = action.payload as { designId: string };
    const empireId = state.empires.playerId;
    const empire = state.empires.byId[empireId];

    const newById = { ...state.shipDesigns.byId };
    delete newById[designId];

    return {
      ...state,
      shipDesigns: {
        byId: newById,
        allIds: state.shipDesigns.allIds.filter((id) => id !== designId),
      },
      empires: empire
        ? {
            ...state.empires,
            byId: {
              ...state.empires.byId,
              [empireId]: {
                ...empire,
                shipDesigns: empire.shipDesigns.filter((id) => id !== designId),
              },
            },
          }
        : state.empires,
    };
  }

  // Unknown action — return unchanged state
  return state;
}
