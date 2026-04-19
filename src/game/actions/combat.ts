/**
 * Combat actions — pure TypeScript, NO DOM.
 * src/game/actions/combat.ts
 */

import { Action } from '../store';

export const startCombat = (systemId: string, attackerFleetId: string, defenderFleetId: string): Action => ({
  type: 'START_COMBAT',
  payload: { systemId, attackerFleetId, defenderFleetId },
});

export const endCombat = (combatId: string, victorId: string | null): Action => ({
  type: 'END_COMBAT',
  payload: { combatId, victorId },
});
