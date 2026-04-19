/**
 * Fleet actions — pure TypeScript, NO DOM.
 * src/game/actions/fleet.ts
 */

import { Action } from '../store';

export const moveFleet = (fleetId: string, destinationId: string): Action => ({
  type: 'MOVE_FLEET',
  payload: { fleetId, destinationId },
});

export const mergeFleets = (sourceFleetId: string, targetFleetId: string): Action => ({
  type: 'MERGE_FLEETS',
  payload: { sourceFleetId, targetFleetId },
});
