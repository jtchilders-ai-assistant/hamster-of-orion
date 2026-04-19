/**
 * Diplomacy actions — pure TypeScript, NO DOM.
 * src/game/actions/diplomacy.ts
 */

import { Action } from '../store';

export const declareWar = (attackerId: string, defenderId: string): Action => ({
  type: 'DECLARE_WAR',
  payload: { attackerId, defenderId },
});

export const proposeTreaty = (
  fromEmpireId: string,
  toEmpireId: string,
  treatyType: string,
): Action => ({
  type: 'PROPOSE_TREATY',
  payload: { fromEmpireId, toEmpireId, treatyType },
});
