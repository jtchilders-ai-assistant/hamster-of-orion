/**
 * Building action creators — pure TypeScript, NO DOM.
 * src/game/actions/buildings.ts
 *
 * Actions for queuing and cancelling building construction.
 * Buildings are purchased via the DEF slider allocation.
 */

import { Action } from '../store';
import { GameState, PlanetId, BuildingId } from '../state';
import { getBuildingById } from '../systems/buildings';

// ── Action type constants ──────────────────────────────────────────────────

export const QUEUE_BUILDING = 'QUEUE_BUILDING' as const;
export const CANCEL_BUILDING = 'CANCEL_BUILDING' as const;

// ── Action creators ────────────────────────────────────────────────────────

/**
 * Queue a building for construction on a planet.
 *
 * Replaces any existing building queue item (one active building at a time,
 * MOO1 style — no discrete build queue beyond a single slot).
 */
export function queueBuilding(planetId: PlanetId, buildingId: BuildingId): Action {
  return {
    type: QUEUE_BUILDING,
    payload: { planetId, buildingId },
  };
}

/**
 * Cancel the active building being constructed on a planet.
 * The accumulated DEF BC is lost (MOO1 style — no refund).
 */
export function cancelBuilding(planetId: PlanetId): Action {
  return {
    type: CANCEL_BUILDING,
    payload: { planetId },
  };
}

// ── Reducer ────────────────────────────────────────────────────────────────

/**
 * Handle building-related actions.
 * Returns `state` unchanged for unrecognized action types.
 */
export function buildingReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case QUEUE_BUILDING: {
      const { planetId, buildingId } = action.payload as {
        planetId: PlanetId;
        buildingId: BuildingId;
      };

      const planet = state.planets.byId[planetId];
      if (!planet || !planet.isColonized) return state;

      const building = getBuildingById(buildingId);
      if (!building) return state;

      // Determine queue item type: missile_base and planetary shields use 'defense',
      // other per-planet buildings use 'building'
      const itemType: 'defense' | 'building' =
        building.category === 'defense' ? 'defense' : 'building';

      // Remove any existing building/defense queue entries (single active slot)
      const filteredQueue = planet.buildQueue.filter(
        (item) => item.type !== 'defense' && item.type !== 'building',
      );

      const newQueueItem = {
        type: itemType,
        targetId: buildingId,
        targetName: building.name,
        costTotal: building.cost,
        costRemaining: building.cost,
        turnsRemaining: 1, // estimated; real value computed from DEF BC/turn
      };

      const updatedPlanet = {
        ...planet,
        buildQueue: [...filteredQueue, newQueueItem],
      };

      return {
        ...state,
        planets: {
          ...state.planets,
          byId: {
            ...state.planets.byId,
            [planetId]: updatedPlanet,
          },
        },
      };
    }

    case CANCEL_BUILDING: {
      const { planetId } = action.payload as { planetId: PlanetId };

      const planet = state.planets.byId[planetId];
      if (!planet) return state;

      // Remove building/defense queue entries
      const updatedQueue = planet.buildQueue.filter(
        (item) => item.type !== 'defense' && item.type !== 'building',
      );

      if (updatedQueue.length === planet.buildQueue.length) return state; // nothing to cancel

      const updatedPlanet = {
        ...planet,
        buildQueue: updatedQueue,
      };

      return {
        ...state,
        planets: {
          ...state.planets,
          byId: {
            ...state.planets.byId,
            [planetId]: updatedPlanet,
          },
        },
      };
    }

    default:
      return state;
  }
}
