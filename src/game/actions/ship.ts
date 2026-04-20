/**
 * Ship action creators — pure TypeScript, NO DOM.
 * src/game/actions/ship.ts
 *
 * Actions for managing ship construction and fleet assignment.
 */

import { Action } from '../store';
import { GameState, PlanetId, ShipDesignId } from '../state';
import { applyShipConstruction, processPlanetShipConstruction } from '../systems/shipConstruction';

// ── Action type constants ──────────────────────────────────────────────────

export const SET_PLANET_DESIGN = 'SET_PLANET_DESIGN' as const;
export const CLEAR_PLANET_DESIGN = 'CLEAR_PLANET_DESIGN' as const;
export const PROCESS_SHIP_CONSTRUCTION = 'PROCESS_SHIP_CONSTRUCTION' as const;

// ── Action creators ────────────────────────────────────────────────────────

/**
 * Set the ship design to build at a planet's shipyard.
 * Resets shipyardProgress to 0 (switching designs discards partial progress).
 */
export function setPlanetDesign(
  planetId: PlanetId,
  designId: ShipDesignId,
): Action {
  return {
    type: SET_PLANET_DESIGN,
    payload: { planetId, designId },
  };
}

/**
 * Clear the ship design at a planet's shipyard.
 * Shipyard progress is retained (player may switch back to same design).
 */
export function clearPlanetDesign(planetId: PlanetId): Action {
  return {
    type: CLEAR_PLANET_DESIGN,
    payload: { planetId },
  };
}

/**
 * Manually trigger ship construction processing for a planet with given BC.
 * (Normally called automatically by turn processing; exposed for testing/UI.)
 */
export function processShipConstruction(
  planetId: PlanetId,
  shipBc: number,
): Action {
  return {
    type: PROCESS_SHIP_CONSTRUCTION,
    payload: { planetId, shipBc },
  };
}

// ── Reducer ────────────────────────────────────────────────────────────────

/**
 * Handle ship-related actions.
 * Returns `state` unchanged for unrecognized action types.
 */
export function shipReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case SET_PLANET_DESIGN: {
      const { planetId, designId } = action.payload as {
        planetId: PlanetId;
        designId: ShipDesignId;
      };

      const planet = state.planets.byId[planetId];
      if (!planet) return state;

      // Reset progress when switching designs
      const updatedPlanet = {
        ...planet,
        currentDesignId: designId,
        shipyardProgress: 0,
      };

      return {
        ...state,
        planets: {
          ...state.planets,
          byId: { ...state.planets.byId, [planetId]: updatedPlanet },
        },
      };
    }

    case CLEAR_PLANET_DESIGN: {
      const { planetId } = action.payload as { planetId: PlanetId };

      const planet = state.planets.byId[planetId];
      if (!planet) return state;

      const updatedPlanet = {
        ...planet,
        currentDesignId: null as ShipDesignId | null,
      };

      return {
        ...state,
        planets: {
          ...state.planets,
          byId: { ...state.planets.byId, [planetId]: updatedPlanet },
        },
      };
    }

    case PROCESS_SHIP_CONSTRUCTION: {
      const { planetId, shipBc } = action.payload as {
        planetId: PlanetId;
        shipBc: number;
      };

      const planet = state.planets.byId[planetId];
      if (!planet || !planet.isColonized) return state;

      const result = processPlanetShipConstruction(
        planet,
        shipBc,
        state,
        state.turn,
      );

      return applyShipConstruction(state, planet, result);
    }

    default:
      return state;
  }
}
