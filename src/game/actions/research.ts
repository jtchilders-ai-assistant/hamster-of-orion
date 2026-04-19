/**
 * Research actions — pure TypeScript, NO DOM.
 * src/game/actions/research.ts
 */

import { Action } from '../store';

export const setResearchTarget = (techId: string): Action => ({
  type: 'SET_RESEARCH_TARGET',
  payload: { techId },
});

export const completeTech = (techId: string, empireId: string): Action => ({
  type: 'COMPLETE_TECH',
  payload: { techId, empireId },
});
