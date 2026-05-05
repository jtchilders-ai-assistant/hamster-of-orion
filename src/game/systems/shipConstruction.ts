/**
 * Ship construction system — pure TypeScript, NO DOM.
 * src/game/systems/shipConstruction.ts
 *
 * Handles accumulation of SHIP BC toward the current ship design and
 * spawning ships when the cost threshold is reached.
 *
 * References:
 *   design/economy/slider-mathematics.md   — SHIP slider allocation
 *   src/game/systems/shipDesign.ts         — calculateDesignCost()
 *   src/game/state.ts                      — GameState, Planet, Fleet, Ship
 */

import {
  GameState,
  Planet,
  Fleet,
  Ship,
  ShipDesign,
  EmpireId,
  FleetId,
  ShipId,
  ShipDesignId,
} from '../state';
import { calculateDesignCost, ShipDesignInput } from './shipDesign';

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of processing one planet's SHIP allocation for one turn.
 */
export interface ShipConstructionResult {
  /** Planets whose shipyardProgress or currentDesignId changed. */
  updatedPlanet: Planet;
  /** IDs of ships spawned this turn from this planet. */
  spawnedShipIds: ShipId[];
  /** BC that overflowed after all ships were built (returned to Empire Reserve). */
  overflow: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a unique ship ID. */
function generateShipId(turn: number, planetId: string, index: number): ShipId {
  return `ship-${planetId}-t${turn}-${index}`;
}

/** Generate a unique fleet ID for a new local fleet at a planet. */
function generateFleetId(turn: number, planetId: string): FleetId {
  return `fleet-${planetId}-t${turn}`;
}

/**
 * Look up the design cost for a ShipDesign stored in state.
 * Reconstructs a ShipDesignInput from the stored ShipDesign to call
 * calculateDesignCost(), which is the single source of truth.
 *
 * Falls back to `design.stats.cost` if component data is sufficient
 * (already computed at design time).
 */
function getDesignCost(design: ShipDesign): number {
  // Use pre-computed cost stored in ShipDesignStats (calculated at design time).
  // This is authoritative: calculateDesignCost() was called when the design
  // was saved, and the result is stored in design.stats.cost.
  if (design.stats.cost > 0) return design.stats.cost;

  // Fallback: re-derive from components (should not normally be needed).
  const input: ShipDesignInput = {
    hullSize: design.class,
    components: design.components.map((c) => ({
      componentId: c.id,
      count: c.count,
    })),
  };
  return calculateDesignCost(input);
}

/**
 * Resolve the local fleet for a planet (a fleet stationed at the same system
 * as the planet and owned by the same empire).
 *
 * Returns `undefined` if no suitable fleet exists — caller should create one.
 */
function findLocalFleet(
  state: GameState,
  planet: Planet,
  ownerId: EmpireId,
): Fleet | undefined {
  const empire = state.empires.byId[ownerId];
  if (!empire) return undefined;

  for (const fleetId of empire.fleets) {
    const fleet = state.fleets.byId[fleetId];
    if (!fleet) continue;
    if (fleet.systemId === planet.systemId && fleet.ownerId === ownerId) {
      return fleet;
    }
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: process SHIP BC for one planet
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Process the SHIP production allocation for a single planet for one turn.
 *
 * Algorithm:
 *   1. If no design is selected (`currentDesignId === null`), return unchanged.
 *   2. Add `shipBc` to `planet.shipyardProgress`.
 *   3. While `shipyardProgress >= designCost`:
 *      a. Spawn a ship entity.
 *      b. Subtract `designCost` from `shipyardProgress` (overflow carries forward).
 *   4. Return updated planet and list of spawned ship IDs.
 *
 * This function is PURE — it does not mutate state.  The caller is responsible
 * for integrating the result into the GameState.
 *
 * @param planet   Current planet state (must be colonized).
 * @param shipBc   BC allocated to ship construction this turn (from SHIP slider).
 * @param state    Full game state (for design lookup).
 * @param turn     Current turn number (used for unique ID generation).
 */
export function processPlanetShipConstruction(
  planet: Planet,
  shipBc: number,
  state: GameState,
  turn: number,
): ShipConstructionResult {
  // Per slider-mathematics.md §SHIP: "If queue is empty, overflow goes to Empire Reserve"
  // When no design is selected, all SHIP BC overflows to reserve.
  if (planet.currentDesignId === null) {
    // Any existing shipyardProgress should also overflow (e.g., design was cleared)
    const totalOverflow = shipBc + planet.shipyardProgress;
    return {
      updatedPlanet: { ...planet, shipyardProgress: 0 },
      spawnedShipIds: [],
      overflow: totalOverflow,
    };
  }

  const design: ShipDesign | undefined = state.shipDesigns.byId[planet.currentDesignId];
  if (!design) {
    // Design missing from state (deleted?); clear the selection
    return {
      updatedPlanet: { ...planet, currentDesignId: null, shipyardProgress: 0 },
      spawnedShipIds: [],
      overflow: 0,
    };
  }

  const designCost = getDesignCost(design);
  let progress = planet.shipyardProgress + shipBc;
  const spawnedShipIds: ShipId[] = [];

  // Spawn ships until we can no longer afford one
  while (progress >= designCost) {
    const shipId = generateShipId(turn, planet.id, spawnedShipIds.length);
    spawnedShipIds.push(shipId);
    progress -= designCost;
  }

  const updatedPlanet: Planet = {
    ...planet,
    shipyardProgress: progress,
  };

  return {
    updatedPlanet,
    spawnedShipIds,
    overflow: 0, // overflow stays in shipyardProgress for next ship
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// State integration: apply ship construction across the full GameState
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply ship construction results to the full GameState.
 *
 * For each spawned ship:
 *   1. Create a Ship entity and add it to `state.ships`.
 *   2. Find (or create) a local fleet at the planet's system.
 *   3. Add the ship to that fleet's `shipIds`.
 *   4. Add the fleet to the empire's `fleets` list if newly created.
 *
 * @param state           GameState to update (not mutated — returns new state).
 * @param planet          Planet where ships are being built.
 * @param result          Output of `processPlanetShipConstruction`.
 */
export function applyShipConstruction(
  state: GameState,
  planet: Planet,
  result: ShipConstructionResult,
): GameState {
  if (result.spawnedShipIds.length === 0) {
    // No ships spawned, just update planet progress
    return {
      ...state,
      planets: {
        ...state.planets,
        byId: {
          ...state.planets.byId,
          [planet.id]: result.updatedPlanet,
        },
      },
    };
  }

  const ownerId = planet.ownerId!; // planet must be colonized at this point
  const design = state.shipDesigns.byId[planet.currentDesignId!]!;

  let nextState = { ...state };

  // ── Build new Ship entities ──────────────────────────────────────────────
  const newShips: Record<ShipId, Ship> = {};
  for (const shipId of result.spawnedShipIds) {
    const ship: Ship = {
      id: shipId,
      name: design.name,
      designId: design.id as ShipDesignId,
      ownerId,
      fleetId: '', // assigned below after fleet resolution
      hp: design.stats.hp,
      maxHp: design.stats.hp,
      shieldHp: design.stats.shieldHp,
      maxShieldHp: design.stats.shieldHp,
      experience: 'rookie',
      kills: 0,
      combatPosition: null,
      hasActed: false,
      specialSystems: {},
    };
    newShips[shipId] = ship;
  }

  // ── Resolve local fleet ──────────────────────────────────────────────────
  let localFleet = findLocalFleet(nextState, planet, ownerId);
  let isNewFleet = false;

  if (!localFleet) {
    isNewFleet = true;
    const fleetId = generateFleetId(nextState.turn, planet.id);
    localFleet = {
      id: fleetId,
      name: `${planet.name} Fleet`,
      ownerId,
      shipIds: [],
      systemId: planet.systemId,
      troops: 0,
      destination: null,
      eta: 0,
      route: [],
      movementPoints: 0,
      maxMovement: 0,
      orders: { type: 'none' },
      experience: 'rookie',
      isInCombat: false,
      combatId: null,
    };
  }

  // ── Assign fleetId to new ships and build updated fleet ──────────────────
  const newShipIds = result.spawnedShipIds;
  for (const shipId of newShipIds) {
    newShips[shipId] = { ...newShips[shipId], fleetId: localFleet.id };
  }

  const updatedFleet: Fleet = {
    ...localFleet,
    shipIds: [...localFleet.shipIds, ...newShipIds],
  };

  // ── Update ships in state ─────────────────────────────────────────────────
  nextState = {
    ...nextState,
    ships: {
      byId: { ...nextState.ships.byId, ...newShips },
      allIds: [...nextState.ships.allIds, ...newShipIds],
    },
    fleets: {
      byId: { ...nextState.fleets.byId, [updatedFleet.id]: updatedFleet },
      allIds: isNewFleet
        ? [...nextState.fleets.allIds, updatedFleet.id]
        : nextState.fleets.allIds,
    },
  };

  // ── Update empire fleet list if new fleet created ────────────────────────
  if (isNewFleet) {
    const empire = nextState.empires.byId[ownerId];
    nextState = {
      ...nextState,
      empires: {
        ...nextState.empires,
        byId: {
          ...nextState.empires.byId,
          [ownerId]: {
            ...empire,
            fleets: [...empire.fleets, updatedFleet.id],
          },
        },
      },
    };
  }

  // ── Update planet state ───────────────────────────────────────────────────
  // Also record total ships built on the design
  const updatedDesign: ShipDesign = {
    ...design,
    shipsBuilt: design.shipsBuilt + newShipIds.length,
  };

  nextState = {
    ...nextState,
    planets: {
      ...nextState.planets,
      byId: {
        ...nextState.planets.byId,
        [planet.id]: result.updatedPlanet,
      },
    },
    shipDesigns: {
      ...nextState.shipDesigns,
      byId: {
        ...nextState.shipDesigns.byId,
        [design.id]: updatedDesign,
      },
    },
  };

  return nextState;
}

// ─────────────────────────────────────────────────────────────────────────────
// Turn integration: process all planets in one pass
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of processing all ship construction for a turn.
 * Per design/economy/slider-mathematics.md §8: Reserve / Overflow Mechanics.
 */
export interface AllShipConstructionResult {
  /** Updated game state with ships spawned and shipyardProgress updated. */
  state: GameState;
  /** BC overflow by empire ID to add to Empire Reserve. */
  overflowByEmpire: Record<EmpireId, number>;
}

/**
 * Process ship construction for all colonized planets in one turn.
 *
 * Intended to be called from `processTurn()` after SHIP BC is allocated
 * via `allocateSliders()`.
 *
 * Per design/economy/slider-mathematics.md §8:
 *   - SHIP BC accumulates toward the current design.
 *   - When a ship completes, overflow carries to the next ship.
 *   - When the queue is empty (no currentDesignId), overflow goes to Empire Reserve.
 *
 * @param state    Current game state.
 * @param shipBcByPlanet   Map of planetId → SHIP BC allocated this turn.
 * @returns Updated state and overflow BC by empire for reserve contribution.
 */
export function processAllShipConstruction(
  state: GameState,
  shipBcByPlanet: Record<string, number>,
): AllShipConstructionResult {
  let nextState = state;
  const overflowByEmpire: Record<EmpireId, number> = {};

  for (const planetId of nextState.planets.allIds) {
    const planet = nextState.planets.byId[planetId];
    if (!planet.isColonized || planet.ownerId === null) continue;

    const shipBc = shipBcByPlanet[planetId] ?? 0;
    if (shipBc === 0 && planet.shipyardProgress === 0) continue;

    const result = processPlanetShipConstruction(
      planet,
      shipBc,
      nextState,
      nextState.turn,
    );

    // Track overflow for this empire's reserve
    if (result.overflow > 0) {
      const empireId = planet.ownerId;
      overflowByEmpire[empireId] = (overflowByEmpire[empireId] ?? 0) + result.overflow;
    }

    nextState = applyShipConstruction(nextState, planet, result);
  }

  return { state: nextState, overflowByEmpire };
}
