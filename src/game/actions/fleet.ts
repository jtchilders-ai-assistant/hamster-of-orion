/**
 * Fleet actions — pure TypeScript, NO DOM.
 * src/game/actions/fleet.ts
 *
 * Action creators and reducer for fleet operations:
 *   - moveFleet: set fleet destination and calculate ETA
 *   - mergeFleets: combine two fleets at the same location
 *   - splitFleet: divide a fleet's ships into a new fleet
 *   - scrapFleet: destroy a fleet and reclaim ships
 *   - processFleetMovement: advance fleet positions each turn
 */

import { Action } from '../store';
import { GameState, FleetId, ShipId, SystemId } from '../state';
import {
  moveFleet as doMoveFleet,
  mergeFleets as doMergeFleets,
  splitFleet as doSplitFleet,
  scrapFleet as doScrapFleet,
  processFleetMovement as doProcessFleetMovement,
} from '../systems/fleet';

// ── Action types ───────────────────────────────────────────────────────────────

export const MOVE_FLEET = 'MOVE_FLEET';
export const MERGE_FLEETS = 'MERGE_FLEETS';
export const SPLIT_FLEET = 'SPLIT_FLEET';
export const SCRAP_FLEET = 'SCRAP_FLEET';
export const PROCESS_FLEET_MOVEMENT = 'PROCESS_FLEET_MOVEMENT';

// Fleet deployment UI actions
export const OPEN_FLEET_DEPLOYMENT = 'OPEN_FLEET_DEPLOYMENT';
export const UPDATE_DEPLOYMENT_SHIPS = 'UPDATE_DEPLOYMENT_SHIPS';
export const SET_DEPLOYMENT_DESTINATION = 'SET_DEPLOYMENT_DESTINATION';
export const CANCEL_FLEET_DEPLOYMENT = 'CANCEL_FLEET_DEPLOYMENT';

// ── Action payloads ────────────────────────────────────────────────────────────

interface MoveFleetPayload {
  fleetId: FleetId;
  destinationId: SystemId;
}

interface MergeFleetsPayload {
  fleetId1: FleetId;
  fleetId2: FleetId;
}

interface SplitFleetPayload {
  fleetId: FleetId;
  shipIds: ShipId[];
}

interface ScrapFleetPayload {
  fleetId: FleetId;
}

interface OpenFleetDeploymentPayload {
  fleetId: FleetId;
  /** Ship design ID → number of ships to deploy (defaults to all). */
  ships?: Record<string, number>;
}

interface UpdateDeploymentShipsPayload {
  fleetId: FleetId;
  /** Ship design ID → number of ships to deploy. */
  ships: Record<string, number>;
}

interface SetDeploymentDestinationPayload {
  fleetId: FleetId;
  destinationId: SystemId;
}

// ── Action creators ────────────────────────────────────────────────────────────

export const moveFleet = (fleetId: FleetId, destinationId: SystemId): Action => ({
  type: MOVE_FLEET,
  payload: { fleetId, destinationId } satisfies MoveFleetPayload,
});

export const mergeFleets = (fleetId1: FleetId, fleetId2: FleetId): Action => ({
  type: MERGE_FLEETS,
  payload: { fleetId1, fleetId2 } satisfies MergeFleetsPayload,
});

export const splitFleet = (fleetId: FleetId, shipIds: ShipId[]): Action => ({
  type: SPLIT_FLEET,
  payload: { fleetId, shipIds } satisfies SplitFleetPayload,
});

export const scrapFleet = (fleetId: FleetId): Action => ({
  type: SCRAP_FLEET,
  payload: { fleetId } satisfies ScrapFleetPayload,
});

export const processFleetMovement = (): Action => ({
  type: PROCESS_FLEET_MOVEMENT,
});

// Fleet deployment action creators

export const openFleetDeployment = (
  fleetId: FleetId,
  ships?: Record<string, number>,
): Action => ({
  type: OPEN_FLEET_DEPLOYMENT,
  payload: { fleetId, ships },
});

export const updateDeploymentShips = (
  fleetId: FleetId,
  ships: Record<string, number>,
): Action => ({
  type: UPDATE_DEPLOYMENT_SHIPS,
  payload: { fleetId, ships },
});

export const setDeploymentDestination = (
  fleetId: FleetId,
  destinationId: SystemId,
): Action => ({
  type: SET_DEPLOYMENT_DESTINATION,
  payload: { fleetId, destinationId },
});

export const cancelFleetDeployment = (): Action => ({
  type: CANCEL_FLEET_DEPLOYMENT,
});

// ── Reducer ────────────────────────────────────────────────────────────────────

/**
 * Fleet reducer — handles all fleet-related actions.
 * Returns state unchanged if action type is not fleet-related.
 */
export function fleetReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case MOVE_FLEET: {
      const { fleetId, destinationId } = action.payload as MoveFleetPayload;
      const result = doMoveFleet(state, fleetId, destinationId);
      return result.state;
    }

    case MERGE_FLEETS: {
      const { fleetId1, fleetId2 } = action.payload as MergeFleetsPayload;
      const result = doMergeFleets(state, fleetId1, fleetId2);
      return result.state;
    }

    case SPLIT_FLEET: {
      const { fleetId, shipIds } = action.payload as SplitFleetPayload;
      const result = doSplitFleet(state, fleetId, shipIds);
      return result.state;
    }

    case SCRAP_FLEET: {
      const { fleetId } = action.payload as ScrapFleetPayload;
      const result = doScrapFleet(state, fleetId);
      return result.state;
    }

    case PROCESS_FLEET_MOVEMENT: {
      return doProcessFleetMovement(state);
    }

    case OPEN_FLEET_DEPLOYMENT: {
      const { fleetId, ships } = action.payload as OpenFleetDeploymentPayload;
      const fleet = state.fleets.byId[fleetId];
      if (!fleet || !state.ui) return state;
      const shipCount: Record<string, number> = ships || {};
      // Default: deploy all ships
      for (const shipId of fleet.shipIds) {
        const ship = state.ships.byId[shipId];
        if (ship) {
          const designId = ship.designId;
          if (!(designId in shipCount)) {
            shipCount[designId] = fleet.shipIds.filter(
              (sid) => state.ships.byId[sid]?.designId === designId,
            ).length;
          }
        }
      }
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedFleet: fleetId,
          fleetDeploymentMode: {
            fleetId,
            ships: shipCount,
            destinationId: null,
          },
        },
      };
    }

    case UPDATE_DEPLOYMENT_SHIPS: {
      const { fleetId, ships } = action.payload as UpdateDeploymentShipsPayload;
      const deployment = state.ui?.fleetDeploymentMode;
      if (!deployment || deployment.fleetId !== fleetId) return state;
      return {
        ...state,
        ui: {
          ...state.ui!,
          fleetDeploymentMode: {
            ...deployment,
            ships,
          },
        },
      };
    }

    case SET_DEPLOYMENT_DESTINATION: {
      const { fleetId, destinationId } = action.payload as SetDeploymentDestinationPayload;
      const deployment = state.ui?.fleetDeploymentMode;
      if (!deployment || deployment.fleetId !== fleetId) return state;
      return {
        ...state,
        ui: {
          ...state.ui!,
          fleetDeploymentMode: {
            ...deployment,
            destinationId,
          },
        },
      };
    }

    case CANCEL_FLEET_DEPLOYMENT: {
      if (!state.ui?.fleetDeploymentMode) return state;
      return {
        ...state,
        ui: {
          ...state.ui,
          fleetDeploymentMode: null,
        },
      };
    }

    default:
      return state;
  }
}
