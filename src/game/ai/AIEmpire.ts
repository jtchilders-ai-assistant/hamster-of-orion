/**
 * AI Empire processor — pure TypeScript, NO DOM.
 * src/game/ai/AIEmpire.ts
 *
 * Entry point for per-turn AI processing.  Each non-player empire calls
 * processAITurn() once per game turn.  The function is pure and returns
 * an updated GameState without mutating the input.
 *
 * Decision flow (per turn):
 *   1. Evaluate situation (threats, expansion opportunities)
 *   2. Set production priorities per planet
 *   3. Queue colony-ship builds (early game)
 *   4. Queue military ship builds (when threatened / at war)
 *   5. Move colony fleets toward targets
 *   6. Move military fleets to attack enemy systems
 *   7. Colonize if a colony fleet is in position
 *
 * References:
 *   design/species/ai-archetypes.md   — personality types
 *   src/game/state.ts                 — Empire, GameState, AIEmpire
 *   src/game/systems/colonization.ts  — canColonize(), colonize()
 *   src/game/systems/fleet.ts         — moveFleet()
 */

import {
  GameState,
  EmpireId,
  Planet,
  ShipDesignId,
} from '../state';

import { canColonize, colonize } from '../systems/colonization';
import { moveFleet } from '../systems/fleet';

import {
  getGamePhase,
  isUnderThreat,
  computeProductionSliders,
  shouldBuildMilitary,
  selectAttackTargets,
  findColonizationTargets,
  getIdleColonyFleets,
  fleetHasColonyShip,
} from './strategies';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Find the first available colony ship design for the empire.
 * Returns the ShipDesignId or null if none is available.
 */
function findColonyShipDesign(
  empireId: EmpireId,
  state: GameState,
): ShipDesignId | null {
  for (const designId of state.shipDesigns.allIds) {
    const design = state.shipDesigns.byId[designId];
    if (!design || design.ownerId !== empireId || design.isObsolete) continue;
    // Check for colony component
    for (const comp of design.components) {
      if (comp.id.toLowerCase().includes('colony')) return designId;
    }
  }
  return null;
}

/**
 * Find the first available military ship design for the empire.
 * Prefers designs with weapon components; falls back to any non-colony design.
 */
function findMilitaryShipDesign(
  empireId: EmpireId,
  state: GameState,
): ShipDesignId | null {
  let fallback: ShipDesignId | null = null;

  for (const designId of state.shipDesigns.allIds) {
    const design = state.shipDesigns.byId[designId];
    if (!design || design.ownerId !== empireId || design.isObsolete) continue;

    // Skip colony designs
    const hasColony = design.components.some((c) => c.id.toLowerCase().includes('colony'));
    if (hasColony) continue;

    // Prefer designs with a weapon component
    const hasWeapon = design.components.some((c) => c.type === 'weapon');
    if (hasWeapon) return designId;

    fallback = designId;
  }

  return fallback;
}

/**
 * Queue a ship design to be built at a planet.
 * Only changes currentDesignId if the planet has no current queued design.
 */
function queueShipAtPlanet(
  planet: Planet,
  designId: ShipDesignId,
): Planet {
  if (planet.currentDesignId !== null) return planet; // already building something
  return { ...planet, currentDesignId: designId };
}

// ── Main AI turn processor ─────────────────────────────────────────────────────

/**
 * Process one game turn for a single non-player empire.
 *
 * Returns an updated GameState with:
 *   - Production sliders adjusted per planet
 *   - Colony / military ships queued at planets
 *   - Colony fleets dispatched to targets
 *   - Military fleets dispatched to enemy systems
 *   - Colonization executed where possible
 */
export function processAITurn(state: GameState, empireId: EmpireId): GameState {
  const aiEmpire = state.aiEmpires[empireId];
  if (!aiEmpire) return state; // No AI data — skip

  const empire = state.empires.byId[empireId];
  if (!empire || empire.isDefeated || empire.planets.length === 0) return state;

  const phase = getGamePhase(state.turn);
  const threatened = isUnderThreat(empireId, state, aiEmpire.weights.fleetSizeThreshold);

  let nextState = state;

  // ── Step 1: Set production sliders per planet ─────────────────────────────

  const updatedPlanetsById = { ...nextState.planets.byId };

  for (const planetId of empire.planets) {
    const planet = nextState.planets.byId[planetId];
    if (!planet || !planet.isColonized) continue;

    const newProduction = computeProductionSliders(planet, aiEmpire, phase, threatened);
    updatedPlanetsById[planetId] = { ...planet, production: newProduction };
  }

  nextState = {
    ...nextState,
    planets: { ...nextState.planets, byId: updatedPlanetsById },
  };

  // ── Step 2: Queue colony ships (early game expansion) ─────────────────────

  if (phase === 'early') {
    const colonyDesign = findColonyShipDesign(empireId, nextState);
    if (colonyDesign !== null) {
      const planetsById2 = { ...nextState.planets.byId };
      // Queue at up to 2 planets (don't flood the queue)
      let queued = 0;
      for (const planetId of empire.planets) {
        if (queued >= 2) break;
        const planet = planetsById2[planetId];
        if (!planet || !planet.isColonized) continue;
        if (planet.currentDesignId !== null) continue;

        planetsById2[planetId] = queueShipAtPlanet(planet, colonyDesign);
        queued++;
      }
      nextState = {
        ...nextState,
        planets: { ...nextState.planets, byId: planetsById2 },
      };
    }
  }

  // ── Step 3: Queue military ships when needed ───────────────────────────────

  if (shouldBuildMilitary(empireId, nextState, aiEmpire, phase)) {
    const militaryDesign = findMilitaryShipDesign(empireId, nextState);
    if (militaryDesign !== null) {
      const planetsById3 = { ...nextState.planets.byId };
      // Queue at homeworld first, then other planets
      const sortedPlanets = [...empire.planets].sort((a, b) => {
        const pa = planetsById3[a];
        const pb = planetsById3[b];
        if (!pa || !pb) return 0;
        if (pa.isHomeworld && !pb.isHomeworld) return -1;
        if (!pa.isHomeworld && pb.isHomeworld) return 1;
        return 0;
      });

      let queued = 0;
      for (const planetId of sortedPlanets) {
        if (queued >= 3) break;
        const planet = planetsById3[planetId];
        if (!planet || !planet.isColonized) continue;
        if (planet.currentDesignId !== null) continue;

        planetsById3[planetId] = queueShipAtPlanet(planet, militaryDesign);
        queued++;
      }
      nextState = {
        ...nextState,
        planets: { ...nextState.planets, byId: planetsById3 },
      };
    }
  }

  // ── Step 4: Dispatch colony fleets to colonization targets ────────────────

  const colonyTargets = findColonizationTargets(empireId, nextState, 5);
  const idleColonyFleets = getIdleColonyFleets(empireId, nextState);

  let targetIdx = 0;
  for (const colonyFleet of idleColonyFleets) {
    if (targetIdx >= colonyTargets.length) break;

    const target = colonyTargets[targetIdx];
    targetIdx++;

    // Don't dispatch if already at destination
    if (colonyFleet.systemId === target.systemId) continue;

    const result = moveFleet(nextState, colonyFleet.id, target.systemId);
    if (result.success) {
      nextState = result.state;
    }
  }

  // ── Step 5: Dispatch military fleets to attack enemy systems ──────────────

  const attackTargets = selectAttackTargets(empireId, nextState, aiEmpire);
  for (const attack of attackTargets) {
    const result = moveFleet(nextState, attack.attackerFleetId, attack.targetSystemId);
    if (result.success) {
      nextState = result.state;
    }
  }

  // ── Step 6: Colonize if a colony fleet is in position ─────────────────────

  // Re-read current empire state (fleets may have changed)
  const currentEmpire = nextState.empires.byId[empireId];
  if (currentEmpire) {
    for (const fleetId of currentEmpire.fleets) {
      const fleet = nextState.fleets.byId[fleetId];
      if (!fleet || !fleetHasColonyShip(fleet, nextState)) continue;
      if (fleet.destination !== null) continue; // en route — not there yet

      // Find uncolonized planets in this system
      const system = nextState.galaxy.systems.byId[fleet.systemId];
      if (!system) continue;

      for (const planetId of system.planetIds) {
        const planet = nextState.planets.byId[planetId];
        if (!planet) continue;
        if (!canColonize(fleet, planet, nextState)) continue;

        try {
          nextState = colonize(fleetId, planetId, nextState);
        } catch {
          // canColonize passed but colonize threw — skip gracefully
        }
        break; // one colonization per fleet per turn
      }
    }
  }

  return nextState;
}

/**
 * Process AI turns for all non-player empires in a single pass.
 * Called by the turn system after the player's turn is committed.
 */
export function processAllAITurns(state: GameState): GameState {
  let nextState = state;

  for (const empireId of state.empires.allIds) {
    const empire = state.empires.byId[empireId];
    if (!empire || empire.isPlayer || empire.isDefeated) continue;

    nextState = processAITurn(nextState, empireId);
  }

  return nextState;
}
