/**
 * Production system — pure TypeScript, NO DOM.
 * src/game/systems/production.ts
 *
 * Calculates per-turn production output for a planet.
 */

import { Planet } from '../state';

/**
 * Calculate total production output (in BC) for a planet this turn,
 * before slider allocation.
 */
export function calculateBaseProduction(planet: Planet): number {
  if (!planet.isColonized || planet.ownerId === null) return 0;

  const factoryOutput = planet.factories * 1.0;
  const popOutput = planet.population * 0.5;
  const total = (factoryOutput + popOutput) * getRichnessMultiplier(planet);

  return Math.max(0, total - planet.waste);
}

/**
 * Get the mineral richness multiplier for production.
 */
export function getRichnessMultiplier(planet: Planet): number {
  if (planet.isRich) return 1.5;
  if (planet.isPoor) return 0.75;
  return 1.0;
}

/**
 * Distribute production output according to slider percentages.
 */
export interface ProductionOutput {
  ship: number;
  defense: number;
  industry: number;
  ecology: number;
  research: number;
}

export function distributeProduction(planet: Planet): ProductionOutput {
  const base = calculateBaseProduction(planet);
  const p = planet.production;

  // Normalize sliders (they should sum to 100, but guard against edge cases)
  const total = p.ship + p.defense + p.industry + p.ecology + p.research;
  const scale = total > 0 ? 100 / total : 0;

  return {
    ship: (base * p.ship * scale) / 100,
    defense: (base * p.defense * scale) / 100,
    industry: (base * p.industry * scale) / 100,
    ecology: (base * p.ecology * scale) / 100,
    research: (base * p.research * scale) / 100,
  };
}

/**
 * Calculate maximum factories for a planet (based on population).
 */
export function calculateMaxFactories(population: number): number {
  return Math.floor(population);
}
