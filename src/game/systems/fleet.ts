/**
 * Fleet system — pure TypeScript, NO DOM.
 * src/game/systems/fleet.ts
 *
 * Handles fleet movement, merging, splitting, and turn processing.
 *
 * References:
 *   design/technical/data-structures.md — Fleet, Ship interfaces
 *   design/galaxy/travel.md             — Star Gate travel mechanics
 *   design/planets/buildings.md         — Star Gates building
 *   src/game/state.ts                   — GameState, Fleet, Ship
 *   src/game/types/shipComponents.ts    — ComponentData, EngineEffect
 */

import { GameState, Fleet, Ship, FleetId, ShipId, SystemId, BuildingId } from '../state';
import { ComponentData, EngineEffect } from '../types/shipComponents';
import componentData from '../../data/components.json';

// ── Component lookup ───────────────────────────────────────────────────────────

const componentsById: Record<string, ComponentData> = {};
for (const comp of (componentData as { components: ComponentData[] }).components) {
  componentsById[comp.id] = comp;
}

/**
 * Get the warp speed from a component ID.
 * Returns 0 if the component is not an engine or not found.
 */
function getWarpSpeed(componentId: string): number {
  const comp = componentsById[componentId];
  if (!comp || comp.category !== 'engine') return 0;
  const effect = comp.effect as EngineEffect;
  return effect.warpSpeed ?? 0;
}

/**
 * Get the maximum warp speed of a ship based on its design components.
 * Returns the highest warp speed from any engine component (there may be
 * multiple engine slots — we take the best one, not sum).
 */
export function getShipWarpSpeed(ship: Ship, state: GameState): number {
  const design = state.shipDesigns.byId[ship.designId];
  if (!design) return 1; // fallback minimum

  let maxSpeed = 0;
  for (const component of design.components) {
    if (component.type === 'engine') {
      const speed = getWarpSpeed(component.id);
      if (speed > maxSpeed) maxSpeed = speed;
    }
  }
  return maxSpeed > 0 ? maxSpeed : 1; // minimum warp 1
}

/**
 * Get the warp speed of the slowest ship in a fleet.
 * This determines fleet movement speed.
 */
export function getFleetWarpSpeed(fleet: Fleet, state: GameState): number {
  if (fleet.shipIds.length === 0) return 0;

  let minSpeed = Infinity;
  for (const shipId of fleet.shipIds) {
    const ship = state.ships.byId[shipId];
    if (!ship) continue;
    const speed = getShipWarpSpeed(ship, state);
    if (speed < minSpeed) minSpeed = speed;
  }
  return minSpeed === Infinity ? 0 : minSpeed;
}

// ── Distance calculation ───────────────────────────────────────────────────────

/**
 * Calculate Euclidean distance between two star systems.
 */
export function distanceBetweenSystems(
  fromId: SystemId,
  toId: SystemId,
  state: GameState,
): number {
  const from = state.galaxy.systems.byId[fromId];
  const to = state.galaxy.systems.byId[toId];
  if (!from || !to) return 0;

  const dx = to.coordinates.x - from.coordinates.x;
  const dy = to.coordinates.y - from.coordinates.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate ETA (turns) from a fleet's location to a destination.
 * ETA = ceil(distance / warpSpeed). Minimum 1 turn.
 */
export function calculateEta(
  fleet: Fleet,
  destinationId: SystemId,
  state: GameState,
): number {
  const warpSpeed = getFleetWarpSpeed(fleet, state);
  if (warpSpeed === 0) return Infinity;

  const distance = distanceBetweenSystems(fleet.systemId, destinationId, state);
  if (distance === 0) return 0;

  return Math.ceil(distance / warpSpeed);
}

// ── ID generation ──────────────────────────────────────────────────────────────

let fleetCounter = 0;

/**
 * Generate a unique fleet ID.
 */
function generateFleetId(): FleetId {
  return `fleet-split-${Date.now()}-${++fleetCounter}`;
}

// ── Move fleet ─────────────────────────────────────────────────────────────────

export interface MoveFleetResult {
  success: boolean;
  error?: string;
  state: GameState;
}

/**
 * Set a fleet's destination and calculate ETA based on slowest ship.
 *
 * Validation:
 * - Fleet must exist
 * - Destination must be a different system than current location
 * - Destination system must exist in galaxy
 */
export function moveFleet(
  state: GameState,
  fleetId: FleetId,
  destinationId: SystemId,
): MoveFleetResult {
  const fleet = state.fleets.byId[fleetId];
  if (!fleet) {
    return { success: false, error: `Fleet ${fleetId} not found`, state };
  }

  if (fleet.systemId === destinationId) {
    return { success: false, error: 'Cannot move to current location', state };
  }

  const destSystem = state.galaxy.systems.byId[destinationId];
  if (!destSystem) {
    return { success: false, error: `Destination system ${destinationId} not found`, state };
  }

  const eta = calculateEta(fleet, destinationId, state);

  const updatedFleet: Fleet = {
    ...fleet,
    destination: destinationId,
    eta,
    orders: { type: 'move', target: destinationId },
  };

  return {
    success: true,
    state: {
      ...state,
      fleets: {
        ...state.fleets,
        byId: {
          ...state.fleets.byId,
          [fleetId]: updatedFleet,
        },
      },
    },
  };
}

// ── Merge fleets ───────────────────────────────────────────────────────────────

export interface MergeFleetResult {
  success: boolean;
  error?: string;
  state: GameState;
}

/**
 * Merge two fleets at the same location.
 * Ships from sourceFleet are moved into targetFleet.
 * sourceFleet is removed from state.
 *
 * Validation:
 * - Both fleets must exist
 * - Both fleets must be at the same system
 * - Both fleets must not be in transit (no destination)
 * - Both fleets must belong to the same empire
 */
export function mergeFleets(
  state: GameState,
  fleetId1: FleetId,
  fleetId2: FleetId,
): MergeFleetResult {
  const fleet1 = state.fleets.byId[fleetId1];
  const fleet2 = state.fleets.byId[fleetId2];

  if (!fleet1) {
    return { success: false, error: `Fleet ${fleetId1} not found`, state };
  }
  if (!fleet2) {
    return { success: false, error: `Fleet ${fleetId2} not found`, state };
  }
  if (fleet1.ownerId !== fleet2.ownerId) {
    return { success: false, error: 'Cannot merge fleets from different empires', state };
  }
  if (fleet1.systemId !== fleet2.systemId) {
    return { success: false, error: 'Cannot merge fleets at different locations', state };
  }
  if (fleet1.destination !== null || fleet2.destination !== null) {
    return { success: false, error: 'Cannot merge fleets while in transit', state };
  }

  // Merge fleet2's ships into fleet1
  const mergedFleet: Fleet = {
    ...fleet1,
    shipIds: [...fleet1.shipIds, ...fleet2.shipIds],
  };

  // Update ships to point to merged fleet
  const updatedShipsById = { ...state.ships.byId };
  for (const shipId of fleet2.shipIds) {
    const ship = updatedShipsById[shipId];
    if (ship) {
      updatedShipsById[shipId] = { ...ship, fleetId: fleetId1 };
    }
  }

  // Remove fleet2 from fleets
  const { [fleetId2]: _removed, ...remainingFleetsById } = state.fleets.byId;
  void _removed;

  const updatedFleetAllIds = state.fleets.allIds.filter((id) => id !== fleetId2);

  // Remove fleet2 from empire fleet list
  const empire = state.empires.byId[fleet2.ownerId];
  const updatedEmpire = {
    ...empire,
    fleets: empire.fleets.filter((id) => id !== fleetId2),
  };

  // Remove fleet2 from the star system's fleetIds
  const system = state.galaxy.systems.byId[fleet1.systemId];
  const updatedSystem = system
    ? {
        ...system,
        fleetIds: system.fleetIds.filter((id) => id !== fleetId2),
      }
    : system;

  const updatedSystemsById = updatedSystem
    ? { ...state.galaxy.systems.byId, [fleet1.systemId]: updatedSystem }
    : state.galaxy.systems.byId;

  return {
    success: true,
    state: {
      ...state,
      ships: {
        ...state.ships,
        byId: updatedShipsById,
      },
      fleets: {
        byId: {
          ...remainingFleetsById,
          [fleetId1]: mergedFleet,
        },
        allIds: updatedFleetAllIds,
      },
      empires: {
        ...state.empires,
        byId: {
          ...state.empires.byId,
          [fleet2.ownerId]: updatedEmpire,
        },
      },
      galaxy: {
        ...state.galaxy,
        systems: {
          ...state.galaxy.systems,
          byId: updatedSystemsById,
        },
      },
    },
  };
}

// ── Split fleet ────────────────────────────────────────────────────────────────

export interface SplitFleetResult {
  success: boolean;
  error?: string;
  newFleetId?: FleetId;
  state: GameState;
}

/**
 * Split a fleet by moving the specified ships into a new fleet.
 *
 * Validation:
 * - Source fleet must exist
 * - Ship IDs must be a subset of the fleet's ships
 * - Cannot split all ships (would leave source fleet empty)
 * - Must select at least one ship
 */
export function splitFleet(
  state: GameState,
  fleetId: FleetId,
  shipIds: ShipId[],
): SplitFleetResult {
  const fleet = state.fleets.byId[fleetId];
  if (!fleet) {
    return { success: false, error: `Fleet ${fleetId} not found`, state };
  }
  if (shipIds.length === 0) {
    return { success: false, error: 'Must select at least one ship to split', state };
  }

  // Validate all ship IDs belong to this fleet
  const fleetShipSet = new Set(fleet.shipIds);
  for (const shipId of shipIds) {
    if (!fleetShipSet.has(shipId)) {
      return {
        success: false,
        error: `Ship ${shipId} is not in fleet ${fleetId}`,
        state,
      };
    }
  }

  // Cannot split all ships
  if (shipIds.length >= fleet.shipIds.length) {
    return {
      success: false,
      error: 'Cannot split all ships from fleet (would leave fleet empty)',
      state,
    };
  }

  const splitShipSet = new Set(shipIds);
  const remainingShipIds = fleet.shipIds.filter((id) => !splitShipSet.has(id));

  const newFleetId = generateFleetId();
  const empire = state.empires.byId[fleet.ownerId];

  const newFleet: Fleet = {
    id: newFleetId,
    name: `${fleet.name} (Split)`,
    ownerId: fleet.ownerId,
    shipIds: [...shipIds],
    systemId: fleet.systemId,
    troops: 0,
    destination: null,
    eta: 0,
    route: [],
    movementPoints: 0,
    maxMovement: 0,
    orders: { type: 'none' },
    experience: fleet.experience,
    isInCombat: false,
    combatId: null,
  };

  const updatedSourceFleet: Fleet = {
    ...fleet,
    shipIds: remainingShipIds,
  };

  // Update ships to point to new fleet
  const updatedShipsById = { ...state.ships.byId };
  for (const shipId of shipIds) {
    const ship = updatedShipsById[shipId];
    if (ship) {
      updatedShipsById[shipId] = { ...ship, fleetId: newFleetId };
    }
  }

  // Add new fleet to star system
  const system = state.galaxy.systems.byId[fleet.systemId];
  const updatedSystem = system
    ? {
        ...system,
        fleetIds: [...system.fleetIds, newFleetId],
      }
    : system;

  const updatedSystemsById = updatedSystem
    ? { ...state.galaxy.systems.byId, [fleet.systemId]: updatedSystem }
    : state.galaxy.systems.byId;

  return {
    success: true,
    newFleetId,
    state: {
      ...state,
      ships: {
        ...state.ships,
        byId: updatedShipsById,
      },
      fleets: {
        byId: {
          ...state.fleets.byId,
          [fleetId]: updatedSourceFleet,
          [newFleetId]: newFleet,
        },
        allIds: [...state.fleets.allIds, newFleetId],
      },
      empires: {
        ...state.empires,
        byId: {
          ...state.empires.byId,
          [fleet.ownerId]: {
            ...empire,
            fleets: [...empire.fleets, newFleetId],
          },
        },
      },
      galaxy: {
        ...state.galaxy,
        systems: {
          ...state.galaxy.systems,
          byId: updatedSystemsById,
        },
      },
    },
  };
}

// ── Scrap fleet ────────────────────────────────────────────────────────────────

/**
 * Scrap an entire fleet, removing all ships and the fleet from state.
 * Returns a small credit refund (10% of ship construction cost — stub value).
 */
export function scrapFleet(
  state: GameState,
  fleetId: FleetId,
): { success: boolean; error?: string; creditsRefunded: number; state: GameState } {
  const fleet = state.fleets.byId[fleetId];
  if (!fleet) {
    return { success: false, error: `Fleet ${fleetId} not found`, creditsRefunded: 0, state };
  }

  // Remove all ships in the fleet
  const updatedShipsById = { ...state.ships.byId };
  for (const shipId of fleet.shipIds) {
    delete updatedShipsById[shipId];
  }
  const updatedShipAllIds = state.ships.allIds.filter(
    (id) => !fleet.shipIds.includes(id),
  );

  // Remove fleet from state
  const { [fleetId]: _removed, ...remainingFleetsById } = state.fleets.byId;
  void _removed;
  const updatedFleetAllIds = state.fleets.allIds.filter((id) => id !== fleetId);

  // Remove fleet from empire
  const empire = state.empires.byId[fleet.ownerId];
  const updatedEmpire = {
    ...empire,
    fleets: empire.fleets.filter((id) => id !== fleetId),
  };

  // Remove fleet from star system
  const system = state.galaxy.systems.byId[fleet.systemId];
  const updatedSystem = system
    ? { ...system, fleetIds: system.fleetIds.filter((id) => id !== fleetId) }
    : system;
  const updatedSystemsById = updatedSystem
    ? { ...state.galaxy.systems.byId, [fleet.systemId]: updatedSystem }
    : state.galaxy.systems.byId;

  // Small scrap refund (stub: 0 credits for now)
  const creditsRefunded = 0;

  return {
    success: true,
    creditsRefunded,
    state: {
      ...state,
      ships: { byId: updatedShipsById, allIds: updatedShipAllIds },
      fleets: { byId: remainingFleetsById, allIds: updatedFleetAllIds },
      empires: {
        ...state.empires,
        byId: { ...state.empires.byId, [fleet.ownerId]: updatedEmpire },
      },
      galaxy: {
        ...state.galaxy,
        systems: { ...state.galaxy.systems, byId: updatedSystemsById },
      },
    },
  };
}

// ── Turn processing ────────────────────────────────────────────────────────────

/**
 * Process fleet movement for one turn.
 *
 * For each fleet in transit (destination set, eta > 0):
 *   - Decrement eta by 1
 *   - If eta reaches 0: move fleet to destination, clear destination
 *
 * Updates star system fleetIds accordingly.
 */
export function processFleetMovement(state: GameState): GameState {
  let nextState = state;

  for (const fleetId of nextState.fleets.allIds) {
    const fleet = nextState.fleets.byId[fleetId];
    if (!fleet || fleet.destination === null || fleet.eta <= 0) continue;

    const newEta = fleet.eta - 1;

    if (newEta === 0) {
      // Fleet arrives at destination
      const oldSystemId = fleet.systemId;
      const newSystemId = fleet.destination;

      const updatedFleet: Fleet = {
        ...fleet,
        systemId: newSystemId,
        destination: null,
        eta: 0,
        orders: { type: 'none' },
      };

      // Remove fleet from old system's fleetIds
      const oldSystem = nextState.galaxy.systems.byId[oldSystemId];
      const updatedOldSystem = oldSystem
        ? {
            ...oldSystem,
            fleetIds: oldSystem.fleetIds.filter((id) => id !== fleetId),
          }
        : oldSystem;

      // Add fleet to new system's fleetIds
      const newSystem = nextState.galaxy.systems.byId[newSystemId];
      const updatedNewSystem = newSystem
        ? {
            ...newSystem,
            fleetIds: newSystem.fleetIds.includes(fleetId)
              ? newSystem.fleetIds
              : [...newSystem.fleetIds, fleetId],
          }
        : newSystem;

      const updatedSystemsById = { ...nextState.galaxy.systems.byId };
      if (updatedOldSystem) updatedSystemsById[oldSystemId] = updatedOldSystem;
      if (updatedNewSystem) updatedSystemsById[newSystemId] = updatedNewSystem;

      nextState = {
        ...nextState,
        fleets: {
          ...nextState.fleets,
          byId: {
            ...nextState.fleets.byId,
            [fleetId]: updatedFleet,
          },
        },
        galaxy: {
          ...nextState.galaxy,
          systems: {
            ...nextState.galaxy.systems,
            byId: updatedSystemsById,
          },
        },
      };
    } else {
      // Still in transit, just decrement eta
      const updatedFleet: Fleet = {
        ...fleet,
        eta: newEta,
      };

      nextState = {
        ...nextState,
        fleets: {
          ...nextState.fleets,
          byId: {
            ...nextState.fleets.byId,
            [fleetId]: updatedFleet,
          },
        },
      };
    }
  }

  return nextState;
}
