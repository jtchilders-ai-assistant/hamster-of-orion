/**
 * Buildings system — pure TypeScript, NO DOM.
 * src/game/systems/buildings.ts
 *
 * Handles building construction via the DEF slider, building effects,
 * maintenance costs, and availability filtering by tech level.
 *
 * In MOO1 style, buildings are queued one at a time per planet.
 * DEF slider BC accumulates toward the queued building cost.
 *
 * References:
 *   src/data/buildings.json       — building data
 *   design/planets/buildings.md   — canonical design spec
 *   src/game/systems/production.ts — how production points work
 */

import buildingsData from '../../data/buildings.json';
import {
  GameState,
  Planet,
  Empire,
  PlanetId,
  BuildingId,
} from '../state';
import { cannotTerraform } from './raceAbilities';

// ─────────────────────────────────────────────────────────────────────────────
// Terraforming eligibility
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a planet can be terraformed.
 *
 * Design Reference: design/planets/buildings.md
 *   - Terraforming is built via Ecology (ECO) slider after pollution cleared
 *   - All standard planet types in MOO1 can be terraformed
 *
 * Design Note: In MOO1, Stellar Converter is a ship weapon that destroys
 * planets (design/ships/weapons-complete.md, design/planets/special-planets.md),
 * NOT a building. Gas giants are not part of the MOO1-faithful PlanetType.
 *
 * Hermit Crabs have the `cannot_terraform` ability and are checked via
 * raceAbilities.cannotTerraform().
 */
export function canTerraformPlanet(_planet: Planet, raceId: string): boolean {
  // Hermit Crabs (and any race with cannot_terraform ability) cannot terraform
  if (cannotTerraform(raceId)) {
    return false;
  }

  // All MOO1 planet types in the PlanetType union are terraformable
  // (gas giants are not part of MOO1-faithful design)
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Building data types (matching buildings.json schema)
// ─────────────────────────────────────────────────────────────────────────────

export interface BuildingEffectData {
  planetaryDefense?: boolean;
  missilesPerBase?: number;
  bombardmentAbsorption?: number;
  maxPopulationIncrease?: number;
  maxPopulationBonus?: number;
  pollutionReductionRate?: number;
  factoriesPerPopulation?: number;
  factoryEfficiencyMultiplier?: number;
  wasteMultiplier?: number;
  factoryCostModifier?: number;
  productionPerTurn?: number;
  instantTravel?: boolean;
  planetTypeUpgrade?: boolean;
  allowsGasGiantTerraforming?: boolean;
  convertsGasGiantToTerran?: boolean;
  conversionTurns?: number;
  maxPerPlanet?: number;
  note?: string;
  [key: string]: unknown;
}

export interface BuildingData {
  id: string;
  name: string;
  category: string;
  techRequired: string | null;
  cost: number;
  maintenance: number;
  effects: BuildingEffectData;
  builtVia: string;
  upgrades?: string;
  prerequisite?: string;
  scope?: string;
  startingTech?: boolean;
  limitFormula?: string;
  costFormula?: string;
  strategyNotes?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Building index (loaded once from JSON)
// ─────────────────────────────────────────────────────────────────────────────

const ALL_BUILDINGS: BuildingData[] = buildingsData.buildings as BuildingData[];

const BUILDINGS_BY_ID: Record<string, BuildingData> = Object.fromEntries(
  ALL_BUILDINGS.map((b) => [b.id, b]),
);

/**
 * Look up a building definition by ID.
 * Returns undefined if not found.
 */
export function getBuildingById(id: string): BuildingData | undefined {
  return BUILDINGS_BY_ID[id];
}

// ─────────────────────────────────────────────────────────────────────────────
// Building queue state (fields expected on Planet)
// ─────────────────────────────────────────────────────────────────────────────
//
// The Planet type in state.ts already has:
//   buildQueue: BuildQueueItem[]   — used by the ship system too
//   buildings: BuildingId[]        — completed buildings on the planet
//   missileBases: number           — count of missile bases
//   planetaryShield: number        — shield absorption value
//
// We interpret:
//   planet.buildQueue[0] (where type === 'defense')
//     as the active building being constructed.
//   planet.buildings as IDs of completed per-planet buildings.
//
// No new fields need to be added to Planet.

// ─────────────────────────────────────────────────────────────────────────────
// Available buildings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return the list of buildings available to queue on this planet, filtered by:
 *   1. Tech requirement (must be in empire's completedTechs, or techRequired === null)
 *   2. builtVia === 'defense_slider' or 'special_project' (DEF slider buildings)
 *   3. Not already built (planet.buildings does not contain this ID, for one-off buildings)
 *   4. For shields: only the best available tier that improves on current shield
 *   5. Terraforming buildings: only on terraformable environments (not gas_giant, and
 *      not for races with cannot_terraform ability like Hermit Crabs)
 *
 * Missile bases are always available (no tech requirement, unlimited count).
 * Tech-unlock buildings are empire-wide and not queued per-planet.
 */
export function getAvailableBuildings(planet: Planet, empire: Empire): BuildingData[] {
  const completedTechs = new Set(empire.research.completedTechs);
  const completedBuildings = new Set(planet.buildings);

  return ALL_BUILDINGS.filter((b) => {
    // Only DEF slider and special project buildings are per-planet purchases
    if (b.builtVia !== 'defense_slider' && b.builtVia !== 'special_project') {
      return false;
    }

    // Terraforming category buildings require a terraformable environment
    // and a race that can terraform
    if (b.category === 'terraforming') {
      if (!canTerraformPlanet(planet, empire.raceId)) {
        return false;
      }
    }

    // Tech-unlock scope buildings are empire-wide, not per-planet
    if (b.scope === 'empire') return false;

    // Check tech requirement
    if (b.techRequired !== null && !completedTechs.has(b.techRequired)) {
      return false;
    }

    // One-off buildings: skip if already built
    if (b.id !== 'missile_base' && completedBuildings.has(b.id as BuildingId)) {
      return false;
    }

    // Planetary shields: only show if it would upgrade current shield level
    if (b.effects.bombardmentAbsorption !== undefined) {
      const absorption = b.effects.bombardmentAbsorption;
      if (absorption <= planet.planetaryShield) return false;
    }

    return true;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Maintenance cost
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate total maintenance cost (BC/turn) for all buildings on a planet.
 *
 * Includes: planetary shield maintenance.
 * Missile bases have 0 maintenance in the data (MOO1 style).
 * Returns 0 for planets with no buildings.
 */
export function calculateBuildingMaintenance(planet: Planet): number {
  let total = 0;

  for (const buildingId of planet.buildings) {
    const building = BUILDINGS_BY_ID[buildingId];
    if (building) {
      total += building.maintenance;
    }
  }

  // Planetary shield maintenance is tracked by the shield level, not as a
  // building ID in planet.buildings. Look it up by current absorption value.
  if (planet.planetaryShield > 0) {
    const shieldBuilding = ALL_BUILDINGS.find(
      (b) => b.effects.bombardmentAbsorption === planet.planetaryShield,
    );
    if (shieldBuilding) {
      // Only add if NOT already in planet.buildings (avoid double-counting)
      if (!planet.buildings.includes(shieldBuilding.id as BuildingId)) {
        total += shieldBuilding.maintenance;
      }
    }
  }

  return total;
}

// ─────────────────────────────────────────────────────────────────────────────
// Building construction (DEF slider)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of processing one planet's building construction for one turn.
 */
export interface BuildingConstructionResult {
  /** Updated planet state (immutable — caller integrates into GameState). */
  updatedPlanet: Planet;
  /** IDs of buildings completed this turn (may be empty). */
  completedBuildingIds: string[];
  /** BC that overflowed after building completion (returned to Empire Reserve). */
  overflow: number;
}

/**
 * Process building construction for a single planet for one turn.
 *
 * The active building queue item is planet.buildQueue[0] with type 'defense'.
 * DEF BC is accumulated in costRemaining until it reaches 0, then the building
 * is marked complete and the queue item is removed.
 *
 * For missile bases: increments planet.missileBases.
 * For planetary shields: sets planet.planetaryShield to the absorption value.
 * For other buildings: adds the building ID to planet.buildings.
 *
 * Pure function — does not mutate state.
 */
export function processBuildingConstruction(
  state: GameState,
  planet: Planet,
): GameState {
  if (!planet.isColonized || planet.ownerId === null) return state;

  // Find the active building queue item (defense type — missile bases and shields)
  const activeItem = planet.buildQueue.find(
    (item) => item.type === 'defense',
  );

  if (!activeItem) return state;

  // DEF BC for this turn comes from the slider allocation stored in costRemaining delta
  // The turn system pre-computes DEF BC and reduces costRemaining before calling us.
  // If costRemaining <= 0, the building is complete.
  if (activeItem.costRemaining > 0) return state;

  // Building is complete — apply its effects
  const buildingId = activeItem.targetId;
  const building = BUILDINGS_BY_ID[buildingId];

  let updatedPlanet: Planet = { ...planet };

  if (building) {
    if (buildingId === 'missile_base') {
      // Increment missile base count
      updatedPlanet = {
        ...updatedPlanet,
        missileBases: updatedPlanet.missileBases + 1,
      };
    } else if (building.effects.bombardmentAbsorption !== undefined) {
      // Upgrade planetary shield
      updatedPlanet = {
        ...updatedPlanet,
        planetaryShield: building.effects.bombardmentAbsorption,
        buildings: updatedPlanet.buildings.includes(buildingId as BuildingId)
          ? updatedPlanet.buildings
          : ([...updatedPlanet.buildings, buildingId] as BuildingId[]),
      };
    } else {
      // Generic building — add to completed list
      if (!updatedPlanet.buildings.includes(buildingId as BuildingId)) {
        updatedPlanet = {
          ...updatedPlanet,
          buildings: [...updatedPlanet.buildings, buildingId] as BuildingId[],
        };
      }
    }
  }

  // Remove the completed item from the queue
  updatedPlanet = {
    ...updatedPlanet,
    buildQueue: updatedPlanet.buildQueue.filter((item) => item !== activeItem),
  };

  return {
    ...state,
    planets: {
      ...state.planets,
      byId: {
        ...state.planets.byId,
        [planet.id]: updatedPlanet,
      },
    },
  };
}

/**
 * Accumulate DEF BC toward the active building in the queue.
 *
 * This is called each turn with the DEF BC allocated from the slider.
 * It reduces costRemaining and, if the building is complete, calls
 * processBuildingConstruction to apply the effects.
 *
 * Pure function — returns new GameState.
 */
/**
 * Result of accumulating building progress, including any overflow BC.
 */
export interface AccumulateBuildingResult {
  /** Updated game state with building progress applied. */
  state: GameState;
  /** BC that overflowed after building completion (to add to Empire Reserve). */
  overflow: number;
}

/**
 * Accumulate DEF BC toward the active building in the queue.
 *
 * This is called each turn with the DEF BC allocated from the slider.
 * It reduces costRemaining and, if the building is complete, calls
 * processBuildingConstruction to apply the effects.
 *
 * Returns both the updated state AND overflow BC (to be added to Empire Reserve).
 * Pure function — does not mutate state.
 */
export function accumulateBuildingProgress(
  state: GameState,
  planetId: PlanetId,
  defBc: number,
): AccumulateBuildingResult {
  const planet = state.planets.byId[planetId];
  if (!planet || !planet.isColonized || planet.ownerId === null) {
    return { state, overflow: 0 };
  }

  const activeIndex = planet.buildQueue.findIndex(
    (item) => item.type === 'defense',
  );

  if (activeIndex === -1) {
    // No building in queue — all BC overflows to reserve
    return { state, overflow: defBc };
  }

  const activeItem = planet.buildQueue[activeIndex];
  const newCostRemaining = Math.max(0, activeItem.costRemaining - defBc);
  // Overflow = BC spent beyond what was needed to complete the building
  const overflow = newCostRemaining === 0
    ? Math.max(0, defBc - activeItem.costRemaining)
    : 0;

  const updatedQueue = planet.buildQueue.map((item, idx) =>
    idx === activeIndex
      ? { ...item, costRemaining: newCostRemaining, turnsRemaining: 0 }
      : item,
  );

  const updatedPlanet: Planet = {
    ...planet,
    buildQueue: updatedQueue,
  };

  let nextState: GameState = {
    ...state,
    planets: {
      ...state.planets,
      byId: {
        ...state.planets.byId,
        [planetId]: updatedPlanet,
      },
    },
  };

  // If fully paid, complete the building
  if (newCostRemaining === 0) {
    nextState = processBuildingConstruction(nextState, updatedPlanet);
  }

  return { state: nextState, overflow };
}

// ─────────────────────────────────────────────────────────────────────────────
// Apply building effects (empire-wide pass)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply building effects to all planets and the empire.
 *
 * Currently handles:
 *   - Planetary shields (already stored directly on planet.planetaryShield)
 *   - Missile bases (already stored on planet.missileBases)
 *   - Future: morale, production bonuses, etc.
 *
 * For now this is mostly a pass-through since effects are applied directly
 * when buildings complete. This function exists as the canonical hook for
 * any derived/aggregate effects that need re-computation each turn.
 *
 * Pure function — returns new GameState (may be identical to input).
 */
export function applyBuildingEffects(state: GameState): GameState {
  // Most building effects in MOO1 style are already reflected in planet fields
  // (missileBases, planetaryShield). This function is the extension point for
  // future aggregate effects (morale, production bonuses, etc.).
  //
  // For now: recompute maxMissileBases based on planet size if needed.
  // (No-op if already correct — pure pass-through.)
  return state;
}

// ─────────────────────────────────────────────────────────────────────────────
// Process all planets (turn integration)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of processing all building construction for one turn.
 */
export interface ProcessAllBuildingsResult {
  /** Updated game state with all building progress applied. */
  state: GameState;
  /** Total BC overflow from all planets (to add to Empire Reserves). */
  overflowByEmpire: Record<string, number>;
}

/**
 * Process building construction for all colonized planets in one turn.
 *
 * Called from processTurn() after DEF BC is allocated per planet.
 * Returns overflow BC grouped by empire ID for reserve contribution.
 *
 * @param state          Current game state.
 * @param defBcByPlanet  Map of planetId → DEF BC allocated this turn.
 */
export function processAllBuildingConstruction(
  state: GameState,
  defBcByPlanet: Record<PlanetId, number>,
): ProcessAllBuildingsResult {
  let nextState = state;
  const overflowByEmpire: Record<string, number> = {};

  for (const planetId of nextState.planets.allIds) {
    const planet = nextState.planets.byId[planetId];
    if (!planet.isColonized || planet.ownerId === null) continue;

    const defBc = defBcByPlanet[planetId] ?? 0;
    if (defBc === 0 && planet.buildQueue.length === 0) continue;

    const result = accumulateBuildingProgress(nextState, planetId, defBc);
    nextState = result.state;

    // Accumulate overflow to the planet's owning empire
    if (result.overflow > 0) {
      const empireId = planet.ownerId;
      overflowByEmpire[empireId] = (overflowByEmpire[empireId] ?? 0) + result.overflow;
    }
  }

  return {
    state: applyBuildingEffects(nextState),
    overflowByEmpire,
  };
}
