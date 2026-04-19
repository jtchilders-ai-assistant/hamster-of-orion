/**
 * Colony actions — pure TypeScript, NO DOM.
 * src/game/actions/colony.ts
 */

import { Action } from '../store';

export const colonizePlanet = (planetId: string, empireId: string): Action => ({
  type: 'COLONIZE_PLANET',
  payload: { planetId, empireId },
});

export const updateProduction = (
  planetId: string,
  sliders: {
    ship?: number;
    defense?: number;
    industry?: number;
    ecology?: number;
    research?: number;
  },
): Action => ({
  type: 'UPDATE_PRODUCTION',
  payload: { planetId, sliders },
});
