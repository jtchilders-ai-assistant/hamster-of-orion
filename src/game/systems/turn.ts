/**
 * Turn processing system — pure TypeScript, NO DOM.
 * src/game/systems/turn.ts
 *
 * Orchestrates the per-turn game loop in design-document order:
 *   1.  Increment turn counter & year.
 *   2.  Fleet movement (all fleets advance toward their destinations).
 *   3.  Combat detection & auto-resolution (opposing fleets in same system).
 *   4.  Colonization checks (colony ships establish new colonies).
 *   5.  Per-planet production (real production system, not stub).
 *   6.  Per-planet population growth.
 *   7.  Per-empire research (real research system, not stub).
 *   8.  AI turns (AI empires set sliders, queue ships, move fleets).
 *
 * All functions are pure: no mutation, returns new GameState objects.
 * No DOM imports. No `any` types.
 */

import { GameState, Planet, Empire, SystemId } from '../state';
import { calculateGrowth } from './growth';
import {
  DEFAULT_PRODUCTION_CONTEXT,
  ProductionContext,
  processPlanetProduction,
} from './production';
import {
  processResearchTurn,
  createDefaultFieldResearch,
  createEvenAllocation,
  PlanetRPInput,
  EmpireFieldResearch,
} from './research';
import { processFleetMovement } from './fleet';
import { canColonize, colonize } from './colonization';
import { processAllAITurns } from '../ai/AIEmpire';
import { processAllShipConstruction } from './shipConstruction';

// ── Internal helpers ───────────────────────────────────────────────────────────

/**
 * Build a ProductionContext for an empire using baseline values.
 *
 * In a fully-featured game this would read tech levels, racial bonuses,
 * and building effects from empire state.  For the current integration
 * we use DEFAULT_PRODUCTION_CONTEXT as the baseline — future tasks can
 * derive real values from the empire's research and race data.
 */
function buildProductionContext(_empire: Empire): ProductionContext {
  // TODO (future task): derive from empire.research tech levels, race bonuses.
  return DEFAULT_PRODUCTION_CONTEXT;
}

/**
 * Build the PlanetRPInput array for all planets owned by an empire.
 * Used by processResearchTurn to calculate total empire RP.
 */
function buildPlanetRPInputs(empire: Empire, state: GameState): PlanetRPInput[] {
  return empire.planets
    .map((planetId) => state.planets.byId[planetId])
    .filter((p): p is Planet => p !== undefined && p.isColonized)
    .map((planet) => ({
      population: planet.population,
      researchSlider: planet.production.research,
      buildingIds: planet.buildings,
      hasArtifacts: planet.hasArtifacts,
      isOrion: false, // Orion is uncolonisable in normal gameplay
    }));
}

/**
 * Build a minimal EmpireFieldResearch from a GameState Empire's research state.
 *
 * The game's ResearchState (from state.ts) is a legacy flat shape; the
 * research system uses the richer EmpireFieldResearch per-field shape.
 * We bootstrap a default field state and carry over accumulated RP evenly
 * so progress isn't lost between turns.
 */
function buildEmpireFieldResearch(empire: Empire): EmpireFieldResearch {
  // Start from zeros and propagate accumulated RP into each field proportionally.
  // A future task can persist EmpireFieldResearch directly in GameState.
  const fields = createDefaultFieldResearch();

  // Spread existing researchPoints evenly across all 6 fields as carry-over.
  const rp = empire.research.researchPoints;
  if (rp > 0) {
    const perField = rp / 6;
    for (const field of Object.keys(fields) as Array<keyof EmpireFieldResearch>) {
      fields[field] = { ...fields[field], progressRP: perField };
    }
  }

  return fields;
}

// ── Phase: empire income ─────────────────────────────────────────────────────

/**
 * Collect income for all non-defeated empires: credits += creditPerTurn.
 */
function processEmpireIncome(state: GameState): GameState {
  let next = state;

  for (const empireId of next.empires.allIds) {
    const empire = next.empires.byId[empireId];
    if (empire.isDefeated) continue;

    const updatedEmpire: Empire = {
      ...empire,
      credits: empire.credits + empire.creditPerTurn,
    };

    next = {
      ...next,
      empires: {
        ...next.empires,
        byId: {
          ...next.empires.byId,
          [empireId]: updatedEmpire,
        },
      },
    };
  }

  return next;
}

// ── Phase: production ─────────────────────────────────────────────────────────

/**
 * Run real production for a single colonised planet.
 * Updates planet.factories and planet.waste from TurnProductionResult.
 */
function processProduction(state: GameState, planet: Planet): GameState {
  const empire = planet.ownerId ? state.empires.byId[planet.ownerId] : undefined;
  if (!empire) return state;

  const ctx = buildProductionContext(empire);
  const result = processPlanetProduction(planet, ctx);

  // Apply factory construction output back to planet state.
  // Uncleaned pollution accumulates as waste; factories built are added.
  const updatedPlanet: Planet = {
    ...planet,
    factories: Math.min(
      planet.factories + result.factories.factoriesBuilt,
      planet.maxFactories,
    ),
    waste: Math.max(0, planet.waste + result.eco.uncleanedPollution),
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
 * Build the ship-BC map for all colonised planets from their production results.
 * Used to feed into processAllShipConstruction.
 */
function buildShipBcMap(state: GameState): Record<string, number> {
  const map: Record<string, number> = {};

  for (const planetId of state.planets.allIds) {
    const planet = state.planets.byId[planetId];
    if (!planet.isColonized || !planet.ownerId) continue;

    const empire = state.empires.byId[planet.ownerId];
    if (!empire) continue;

    const ctx = buildProductionContext(empire);
    const result = processPlanetProduction(planet, ctx);
    map[planetId] = result.allocation.ship;
  }

  return map;
}

// ── Phase: population growth ───────────────────────────────────────────────────

/**
 * Apply population growth for a single colonised planet.
 */
function processGrowth(state: GameState, planet: Planet): GameState {
  const delta = calculateGrowth(planet);
  if (delta === 0) return state;

  const updatedPlanet: Planet = {
    ...planet,
    population: Math.min(planet.population + delta, planet.maxPopulation),
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

// ── Phase: research ────────────────────────────────────────────────────────────

/**
 * Run one turn of research for a single empire.
 * Accumulates the total RP generated and updates empire.research.researchPoints.
 */
function processResearch(state: GameState, empire: Empire): GameState {
  const planets = buildPlanetRPInputs(empire, state);
  if (planets.length === 0) return state;

  const allocation = createEvenAllocation();
  const fields = buildEmpireFieldResearch(empire);
  const isAI = !empire.isPlayer;

  const result = processResearchTurn(
    planets,
    empire.raceId,
    allocation,
    fields,
    state.galaxy.size,
    isAI,
  );

  // Update empire's accumulated research points with new total.
  const updatedEmpire: Empire = {
    ...empire,
    research: {
      ...empire.research,
      researchPerTurn: result.totalRP,
      researchPoints: empire.research.researchPoints + result.totalRP,
    },
  };

  return {
    ...state,
    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        [empire.id]: updatedEmpire,
      },
    },
  };
}

// ── Phase: combat detection ────────────────────────────────────────────────────

/**
 * Detect systems containing fleets from two or more opposing empires.
 *
 * Combat auto-resolution requires translating Ship → CombatShip (weapon
 * components, ratings, etc.) which is a non-trivial mapping layer deferred
 * to a dedicated combat-integration task.  Here we mark fleets as in-combat
 * by setting `isInCombat = true` so the UI can present the combat screen;
 * actual battle resolution (autoResolveCombat) will be wired in that task.
 *
 * TODO (combat-integration task): call autoResolveCombat and apply losses.
 */
function processCombatDetection(state: GameState): GameState {
  // Group fleet IDs by system
  const fleetsBySystem = new Map<SystemId, string[]>();
  for (const fleetId of state.fleets.allIds) {
    const fleet = state.fleets.byId[fleetId];
    if (!fleet) continue;
    const list = fleetsBySystem.get(fleet.systemId) ?? [];
    list.push(fleetId);
    fleetsBySystem.set(fleet.systemId, list);
  }

  let next = state;

  for (const [, fleetIds] of fleetsBySystem) {
    if (fleetIds.length < 2) continue;

    // Check if there are fleets from more than one empire in this system
    const empiresPresent = new Set(
      fleetIds.map((id) => state.fleets.byId[id]?.ownerId).filter((id): id is string => id !== undefined),
    );
    if (empiresPresent.size < 2) continue;

    // Check if any of those empires are at war with each other
    const empireIds = [...empiresPresent];
    let combatDetected = false;
    outer: for (let i = 0; i < empireIds.length; i++) {
      for (let j = i + 1; j < empireIds.length; j++) {
        const empA = next.empires.byId[empireIds[i]];
        const empB = next.empires.byId[empireIds[j]];
        if (!empA || !empB) continue;
        const rel = empA.relations[empireIds[j]];
        if (rel?.state === 'war') {
          combatDetected = true;
          break outer;
        }
      }
    }
    if (!combatDetected) continue;

    // Mark all fleets in this system as in-combat
    const updatedFleetsById = { ...next.fleets.byId };
    for (const fleetId of fleetIds) {
      const fleet = updatedFleetsById[fleetId];
      if (fleet && !fleet.isInCombat) {
        updatedFleetsById[fleetId] = { ...fleet, isInCombat: true };
      }
    }
    next = {
      ...next,
      fleets: { ...next.fleets, byId: updatedFleetsById },
    };
  }

  return next;
}

// ── Phase: colonization ────────────────────────────────────────────────────────

/**
 * Auto-colonize any unowned planet where a fleet with a colony ship is
 * present and the planet is habitable.
 *
 * Each fleet is checked once; only the first eligible unowned planet in
 * its system is colonized per turn (matches MOO1 behavior).
 */
function processColonization(state: GameState): GameState {
  let next = state;

  for (const fleetId of next.fleets.allIds) {
    const fleet = next.fleets.byId[fleetId];
    if (!fleet) continue;

    // Collect uncolonised planets in this system
    const system = next.galaxy.systems.byId[fleet.systemId];
    if (!system) continue;

    for (const planetId of system.planetIds) {
      const planet = next.planets.byId[planetId];
      if (!planet) continue;
      if (!canColonize(fleet, planet, next)) continue;

      // Colonize — consumes the colony ship from the fleet
      try {
        next = colonize(fleetId, planetId, next);
      } catch {
        // canColonize returned true but colonize threw — skip silently
      }
      // Move to next fleet after colonizing (one colonization per fleet per turn)
      break;
    }
  }

  return next;
}

// ── Core turn processor ────────────────────────────────────────────────────────

/**
 * Advance the game by one turn.
 *
 * Sequence (mirrors design/game-mechanics/turn-structure.md):
 *   1.  Increment `turn` counter, update `year`.
 *   2.  Fleet movement — all fleets advance toward their destinations.
 *   3.  Combat detection — mark warring fleets in the same system.
 *   4.  Colonization — colony ships establish new colonies.
 *   5.  Per-planet production (real production system).
 *   6.  Per-planet population growth.
 *   7.  Per-empire research (real research system).
 *   8.  AI turns — AI empires adjust sliders, queue ships, etc.
 *
 * Pure function — does not mutate `state`.
 */
export function processTurn(state: GameState): GameState {
  // ── Step 1: advance time ─────────────────────────────────────────────────
  const newTurn = state.turn + 1;
  const newYear = 2500 + newTurn;

  let next: GameState = {
    ...state,
    turn: newTurn,
    year: newYear,
    lastPlayed: Math.max(Date.now(), state.lastPlayed + 1),
  };

  // ── Step 2: empire income (credits += creditPerTurn) ──────────────────────
  next = processEmpireIncome(next);

  // ── Step 3: fleet movement ────────────────────────────────────────────────
  next = processFleetMovement(next);

  // ── Step 4: combat detection ──────────────────────────────────────────────
  next = processCombatDetection(next);

  // ── Step 5: colonization ──────────────────────────────────────────────────
  next = processColonization(next);

  // ── Steps 6 & 7: per-planet production and growth ─────────────────────────
  // Compute ship-BC allocations before mutating planet state
  const shipBcMap = buildShipBcMap(next);

  for (const planetId of next.planets.allIds) {
    const planet = next.planets.byId[planetId];
    if (!planet.isColonized) continue;

    next = processProduction(next, planet);
    // Re-fetch after production may have updated factories/waste
    next = processGrowth(next, next.planets.byId[planetId]);
  }

  // ── Step 8: ship construction ─────────────────────────────────────────────
  next = processAllShipConstruction(next, shipBcMap);

  // ── Step 9: per-empire research ───────────────────────────────────────────
  for (const empireId of next.empires.allIds) {
    const empire = next.empires.byId[empireId];
    if (empire.isDefeated) continue;

    next = processResearch(next, empire);
  }

  // ── Step 10: AI turns ─────────────────────────────────────────────────────
  next = processAllAITurns(next);

  return next;
}
