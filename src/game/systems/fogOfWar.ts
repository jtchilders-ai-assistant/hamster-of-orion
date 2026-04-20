/**
 * Fog of War system — pure TypeScript, NO DOM.
 * src/game/systems/fogOfWar.ts
 *
 * Handles exploration, sensor range, and visibility for each empire.
 *
 * Sensor range = 1 ly (base) + scannerTechLevel.
 * Colonies always reveal their own system.
 * Fleets reveal systems within sensor range of their current position.
 */

import { GameState, Empire, EmpireId, SystemId, Fleet } from '../state';
import { distanceBetweenSystems } from './fleet';

// ── Constants ────────────────────────────────────────────────────────────────

const BASE_SENSOR_RANGE = 1; // light-years

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Get the sensor range for an empire in light-years.
 * Base 1 ly + scannerTechLevel.
 */
export function getSensorRange(empire: Pick<Empire, 'scannerTechLevel'>): number {
  return BASE_SENSOR_RANGE + empire.scannerTechLevel;
}

/**
 * Mark a star system as explored by an empire.
 */
export function exploreSystem(
  state: GameState,
  empireId: EmpireId,
  systemId: SystemId,
): GameState {
  const empire = state.empires.byId[empireId];
  if (!empire) return state;

  if (empire.exploredSystems.includes(systemId)) {
    // Already explored, just make sure it's visible
    return makeVisible(state, empireId, systemId);
  }

  const updated = {
    ...empire,
    exploredSystems: [...empire.exploredSystems, systemId],
  };

  return {
    ...state,
    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        [empireId]: updated,
      },
    },
  };
}

/**
 * Ensure a system is marked as visible for an empire.
 */
function makeVisible(
  state: GameState,
  empireId: EmpireId,
  systemId: SystemId,
): GameState {
  const empire = state.empires.byId[empireId];
  if (!empire) return state;

  if (empire.visibleSystems.includes(systemId)) {
    return state;
  }

  const updated = {
    ...empire,
    visibleSystems: [...empire.visibleSystems, systemId],
  };

  return {
    ...state,
    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        [empireId]: updated,
      },
    },
  };
}

/**
 * Check if a system is visible to an empire (explored OR in sensor range).
 */
export function isSystemVisible(
  state: GameState,
  empireId: EmpireId,
  systemId: SystemId,
): boolean {
  const empire = state.empires.byId[empireId];
  if (!empire) return false;

  // Explored systems are always visible
  if (empire.exploredSystems.includes(systemId)) return true;

  return empire.visibleSystems.includes(systemId);
}

/**
 * Collect systems within sensor range of a fleet's current position.
 */
function getSystemsInRange(
  fleet: Fleet,
  state: GameState,
  sensorRange: number,
): SystemId[] {
  const allSystems = state.galaxy.systems.allIds;
  const inRange: SystemId[] = [];

  for (const sysId of allSystems) {
    if (sysId === fleet.systemId) continue; // Skip own system
    const dist = distanceBetweenSystems(fleet.systemId, sysId, state);
    if (dist <= sensorRange) {
      inRange.push(sysId);
    }
  }

  return inRange;
}

/**
 * Update visibility for an empire: mark systems in sensor range as visible.
 */
export function updateVisibility(
  state: GameState,
  empireId: EmpireId,
): GameState {
  const empire = state.empires.byId[empireId];
  if (!empire) return state;

  const sensorRange = getSensorRange(empire);
  if (sensorRange <= 0) return state;

  const updatedVisible: Set<SystemId> = new Set(empire.visibleSystems);

  // Colonies reveal their own system
  for (const planetId of empire.planets) {
    const planet = state.planets.byId[planetId];
    if (planet) {
      updatedVisible.add(planet.systemId);
    }
  }

  // Fleets reveal systems within sensor range
  for (const fleetId of empire.fleets) {
    const fleet = state.fleets.byId[fleetId];
    if (!fleet) continue;

    const nearbySystems = getSystemsInRange(fleet, state, sensorRange);
    for (const sysId of nearbySystems) {
      updatedVisible.add(sysId);
    }
  }

  const newVisibleArray = Array.from(updatedVisible);

  // If nothing changed, no need to create a new state
  if (newVisibleArray.length === empire.visibleSystems.length &&
      newVisibleArray.every((s, i) => s === empire.visibleSystems[i])) {
    return state;
  }

  const updated = {
    ...empire,
    visibleSystems: newVisibleArray,
  };

  return {
    ...state,
    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        [empireId]: updated,
      },
    },
  };
}

/**
 * Process fog of war for all empires this turn.
 * Updates visibility for every empire based on fleets, colonies, and sensor range.
 * Also marks systems as explored where fleets and colonies currently reside.
 */
export function processFogOfWar(state: GameState): GameState {
  let result = state;

  for (const empireId of state.empires.allIds) {
    const empire = state.empires.byId[empireId];
    if (!empire || empire.isDefeated) continue;

    // First: update visibility from fleets and colonies
    result = updateVisibility(result, empireId);

    // Then: mark systems as explored for fleets currently stationed there
    for (const fleetId of empire.fleets) {
      const fleet = state.fleets.byId[fleetId];
      if (fleet && fleet.destination === null) {
        result = exploreSystem(result, empireId, fleet.systemId);
      }
    }

    // And for planets currently owned (colonies always count as explored)
    for (const planetId of empire.planets) {
      const planet = state.planets.byId[planetId];
      if (planet && planet.isColonized) {
        result = exploreSystem(result, empireId, planet.systemId);
      }
    }
  }

  return result;
}
