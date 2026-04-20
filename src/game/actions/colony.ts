/**
 * Colony actions — pure TypeScript, NO DOM.
 * src/game/actions/colony.ts
 */

import { Action } from '../store';
import { PlanetId } from '../state';

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

/**
 * Lock a slider so it is excluded from automatic rebalancing.
 */
export const lockSlider = (planetId: PlanetId, slider: string): Action => ({
  type: 'LOCK_SLIDER',
  payload: { planetId, slider },
});

/**
 * Unlock a slider so it participates in rebalancing again.
 */
export const unlockSlider = (planetId: PlanetId, slider: string): Action => ({
  type: 'UNLOCK_SLIDER',
  payload: { planetId, slider },
});

/**
 * Navigate to the planet screen for a specific planet.
 * Sets ui.selectedPlanet and transitions to the 'planet' screen.
 */
export const selectPlanet = (planetId: PlanetId): Action => ({
  type: 'SELECT_PLANET',
  payload: { planetId },
});
