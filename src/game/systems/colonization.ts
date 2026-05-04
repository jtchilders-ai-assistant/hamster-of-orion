/**
 * Colonization system — pure TypeScript, NO DOM.
 * src/game/systems/colonization.ts
 *
 * Handles colony ship detection, colonization eligibility checks, and the
 * colonize action (consumes the colony ship, initialises the new colony).
 *
 * References:
 *   design/technical/data-structures.md  — Fleet, Ship, Planet interfaces
 *   src/game/state.ts                    — GameState type definitions
 *   src/data/components.json             — colony_base / colony_pod components
 *   .agents/task-colonization.md         — acceptance criteria & starting stats
 */

import {
  GameState,
  Fleet,
  Planet,
  FleetId,
  PlanetId,
  ShipId,
  PlanetType,
  Morale,
} from '../state';
import { ComponentData, SpecialEffect } from '../types/shipComponents';
import componentData from '../../data/components.json';
import { hasUniversalColonization } from './raceAbilities';

// ── Component lookup ───────────────────────────────────────────────────────────

const componentsById: Record<string, ComponentData> = {};
for (const comp of (componentData as { components: ComponentData[] }).components) {
  componentsById[comp.id] = comp;
}

// ── Habitable planet types ────────────────────────────────────────────────────

/**
 * Planet types that cannot be colonised. Gas giants have zero population capacity.
 */
const UNINHABITABLE_TYPES = new Set<PlanetType>([
  'gas_giant',
]);

/**
 * Hostile environments that require Controlled [Environment] tech from Planetology.
 *
 * Source: design/planets/planet-types.md §Hostile Environments
 * "Requires Controlled Environment technology from the Planetology tree to colonize."
 */
export const HOSTILE_ENVIRONMENT_TYPES = new Set<PlanetType>([
  'radiated',
  'toxic',
  'inferno',
  'dead',
  'tundra',
  'barren',
]);

/**
 * Tech IDs that unlock Controlled Environment colonization.
 * Each hostile type maps to its specific controlled tech.
 *
 * Source: design/planets/planet-types.md §Hostile Environments table
 */
export const HOSTILE_ENV_REQUIRED_TECH: Partial<Record<PlanetType, string>> = {
  radiated: 'controlled_radiated',
  toxic:    'controlled_toxic',
  inferno:  'controlled_inferno',
  dead:     'controlled_dead',
  tundra:   'controlled_tundra',
  barren:   'controlled_barren',
};

/**
 * Returns true if the player empire has researched the tech required to
 * colonize the given hostile planet type.
 *
 * Standard environments always return true (no tech required).
 */
export function hasColonizationTech(
  planetType: PlanetType,
  completedTechs: string[],
): boolean {
  if (!HOSTILE_ENVIRONMENT_TYPES.has(planetType)) return true; // standard env
  const requiredTech = HOSTILE_ENV_REQUIRED_TECH[planetType];
  if (!requiredTech) return true; // safety fallback
  return completedTechs.includes(requiredTech);
}

// ── Colony component detection ────────────────────────────────────────────────

/**
 * Returns true if the given component ID is a colonization component
 * (i.e., has the `canColonize` flag set in its SpecialEffect).
 */
function isColonyComponent(componentId: string): boolean {
  const comp = componentsById[componentId];
  if (!comp || comp.category !== 'special') return false;
  return (comp.effect as SpecialEffect).canColonize === true;
}

/**
 * Finds the first ship in the fleet that carries a colony component.
 * Returns the ship ID, or null if none is found.
 */
export function findColonyShipInFleet(
  fleet: Fleet,
  state: GameState,
): ShipId | null {
  for (const shipId of fleet.shipIds) {
    const ship = state.ships.byId[shipId];
    if (!ship) continue;

    const design = state.shipDesigns.byId[ship.designId];
    if (!design) continue;

    for (const component of design.components) {
      if (isColonyComponent(component.id)) {
        return shipId;
      }
    }
  }
  return null;
}

// ── Eligibility check ─────────────────────────────────────────────────────────

/**
 * Returns true when all colonization preconditions are satisfied:
 *   1. The fleet is at the same star system as the planet.
 *   2. The planet is uncolonized (ownerId === null).
 *   3. The planet type is habitable (gas giants are not).
 *   4. The fleet contains at least one ship with a colony component.
 *   5. For hostile environments: empire has Controlled [Environment] tech,
 *      OR the race has universal_adaptation (Hermit Crabs).
 */
export function canColonize(
  fleet: Fleet,
  planet: Planet,
  state: GameState,
): boolean {
  // Condition 1 — fleet must be in the planet's system
  if (fleet.systemId !== planet.systemId) return false;

  // Condition 2 — planet must be unowned
  if (planet.ownerId !== null) return false;

  // Condition 3 — planet must be habitable (gas giants are not)
  if (UNINHABITABLE_TYPES.has(planet.type)) return false;

  // Condition 4 — fleet must contain a colony ship
  // This is ALWAYS required, regardless of race abilities
  if (findColonyShipInFleet(fleet, state) === null) return false;

  // Condition 5 — hostile environments require Controlled [Environment] tech
  // Exception: races with universal_adaptation (Hermit Crabs) can colonize
  // any planet type without the environment tech
  // Source: design/planets/planet-types.md §Colonization Requirements
  const empire = state.empires.byId[fleet.ownerId];
  const raceId = empire?.raceId;

  // Skip hostile environment tech check for races with universal colonization
  if (raceId && hasUniversalColonization(raceId)) {
    return true;
  }

  const completedTechs = empire?.research.completedTechs ?? [];
  if (!hasColonizationTech(planet.type, completedTechs)) return false;

  return true;
}

// ── Default starting colony stats ─────────────────────────────────────────────

/** Starting population for a new colony (in millions). */
export const COLONY_STARTING_POPULATION = 10;

/** Starting factories for a new colony. */
export const COLONY_STARTING_FACTORIES = 0;

/** Starting pollution for a new colony. */
export const COLONY_STARTING_POLLUTION = 0;

/** Starting morale for a new colony. */
export const COLONY_STARTING_MORALE: Morale = 'content';

/** Balanced production sliders (20/20/20/20/20). */
export const COLONY_STARTING_PRODUCTION = {
  ship: 20,
  defense: 20,
  industry: 20,
  ecology: 20,
  research: 20,
} as const;

// ── Colonize action ───────────────────────────────────────────────────────────

/**
 * Executes the colonize action for a fleet at a planet.
 *
 * Steps:
 *  1. Validates that colonization is possible (throws if not).
 *  2. Finds the colony ship in the fleet.
 *  3. Removes the colony ship from the fleet (and from ships registry).
 *     If the fleet becomes empty, removes the fleet entirely (including its
 *     reference in the owning empire and the star system).
 *  4. Initialises the planet as a new colony.
 *  5. Adds the planet to the colonizing empire's planet list.
 *
 * Returns the updated GameState (immutable — all intermediate states are new
 * objects; the input state is never mutated).
 *
 * @throws {Error} if the fleet or planet cannot be found, or if colonization
 *                 preconditions are not met.
 */
export function colonize(
  fleetId: FleetId,
  planetId: PlanetId,
  state: GameState,
): GameState {
  const fleet = state.fleets.byId[fleetId];
  if (!fleet) throw new Error(`Fleet not found: ${fleetId}`);

  const planet = state.planets.byId[planetId];
  if (!planet) throw new Error(`Planet not found: ${planetId}`);

  if (!canColonize(fleet, planet, state)) {
    throw new Error(
      `Colonization preconditions not met for fleet ${fleetId} at planet ${planetId}`,
    );
  }

  const colonyShipId = findColonyShipInFleet(fleet, state)!; // safe: canColonize ensures non-null

  // ── 1. Remove the colony ship from the fleet ──────────────────────────────

  const remainingShipIds = fleet.shipIds.filter((id) => id !== colonyShipId);
  const fleetBecomesEmpty = remainingShipIds.length === 0;

  // ── 2. Update planet → new colony ─────────────────────────────────────────

  const updatedPlanet: Planet = {
    ...planet,
    ownerId: fleet.ownerId,
    isColonized: true,
    population: COLONY_STARTING_POPULATION,
    factories: COLONY_STARTING_FACTORIES,
    waste: COLONY_STARTING_POLLUTION,
    morale: COLONY_STARTING_MORALE,
    production: { ...COLONY_STARTING_PRODUCTION },
  };

  // ── 3. Update ships registry (remove colony ship) ─────────────────────────

  const newShipsById = { ...state.ships.byId };
  delete newShipsById[colonyShipId];
  const newShipsAllIds = state.ships.allIds.filter((id) => id !== colonyShipId);

  // ── 4. Update fleets registry ─────────────────────────────────────────────

  let newFleetsById = { ...state.fleets.byId };
  let newFleetsAllIds = [...state.fleets.allIds];

  if (fleetBecomesEmpty) {
    // Fleet is dissolved — remove it entirely
    delete newFleetsById[fleetId];
    newFleetsAllIds = newFleetsAllIds.filter((id) => id !== fleetId);
  } else {
    // Fleet persists with the remaining ships
    newFleetsById = {
      ...newFleetsById,
      [fleetId]: { ...fleet, shipIds: remainingShipIds },
    };
  }

  // ── 5. Update empire — add planet, remove fleet if dissolved ──────────────

  const empire = state.empires.byId[fleet.ownerId];
  const updatedEmpirePlanets = empire
    ? [...empire.planets, planetId]
    : [planetId];

  const updatedEmpireFleets =
    empire && fleetBecomesEmpty
      ? empire.fleets.filter((id) => id !== fleetId)
      : empire?.fleets ?? [];

  const updatedEmpire = empire
    ? {
        ...empire,
        planets: updatedEmpirePlanets,
        fleets: updatedEmpireFleets,
      }
    : empire;

  // ── 6. Update star system — remove fleet reference if dissolved ───────────

  const starSystem = state.galaxy.systems.byId[fleet.systemId];
  const updatedSystemFleetIds =
    starSystem && fleetBecomesEmpty
      ? starSystem.fleetIds.filter((id) => id !== fleetId)
      : starSystem?.fleetIds ?? [];

  const updatedSystem = starSystem
    ? { ...starSystem, fleetIds: updatedSystemFleetIds }
    : starSystem;

  // ── 7. Assemble next state ─────────────────────────────────────────────────

  return {
    ...state,

    planets: {
      ...state.planets,
      byId: {
        ...state.planets.byId,
        [planetId]: updatedPlanet,
      },
    },

    ships: {
      byId: newShipsById,
      allIds: newShipsAllIds,
    },

    fleets: {
      byId: newFleetsById,
      allIds: newFleetsAllIds,
    },

    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        ...(updatedEmpire ? { [fleet.ownerId]: updatedEmpire } : {}),
      },
    },

    galaxy: {
      ...state.galaxy,
      systems: {
        ...state.galaxy.systems,
        byId: {
          ...state.galaxy.systems.byId,
          ...(updatedSystem ? { [fleet.systemId]: updatedSystem } : {}),
        },
      },
    },
  };
}
