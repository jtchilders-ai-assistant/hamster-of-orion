/**
 * Population growth system — pure TypeScript, NO DOM.
 * src/game/systems/growth.ts
 */

import { Planet, Morale } from '../state';

/**
 * Calculate population growth for a planet this turn.
 * Returns delta in millions.
 */
export function calculateGrowth(planet: Planet): number {
  if (!planet.isColonized) return 0;
  if (planet.population >= planet.maxPopulation) return 0;

  const baseMoraleMultiplier = getMoraleMultiplier(planet.morale);
  const capacityFactor = 1 - planet.population / planet.maxPopulation;

  const growth = planet.population * planet.growthRate * baseMoraleMultiplier * capacityFactor;
  return Math.max(0, growth);
}

/**
 * Get morale multiplier for growth rate.
 */
export function getMoraleMultiplier(morale: Morale): number {
  switch (morale) {
    case 'ecstatic':   return 1.5;
    case 'happy':      return 1.25;
    case 'content':    return 1.0;
    case 'unrest':     return 0.5;
    case 'rebellion':  return 0.0;
  }
}
