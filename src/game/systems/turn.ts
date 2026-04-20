/**
 * Turn processing system — pure TypeScript, NO DOM.
 * src/game/systems/turn.ts
 *
 * Orchestrates the full per-turn game loop, wiring every sub-system together
 * in the correct MOO1-faithful order:
 *
 *   1.  Advance time (turn counter + year)
 *   2.  Planet production  (net BC, ECO phases, factory construction)
 *   3.  Ship construction  (SHIP BC → spawn ships when cost met)
 *   4.  Research           (sum RP from all planets per empire)
 *   5.  Population growth  (calculateGrowth per colonised planet)
 *   6.  Fleet movement     (decrement ETAs, handle arrivals)
 *   7.  AI turns           (production sliders, fleet dispatch, colonization)
 *
 * All functions are pure — they never mutate the input state.
 */

import { GameState, Planet, Empire } from '../state';
import { calculateGrowth } from './growth';
import {
  processPlanetProduction,
  DEFAULT_PRODUCTION_CONTEXT,
  ProductionContext,
} from './production';
import { processAllShipConstruction } from './shipConstruction';
import {
  processResearchTurn,
  createDefaultFieldResearch,
  createEvenAllocation,
  EmpireFieldResearch,
} from './research';
import { processFleetMovement } from './fleet';
import { processAllAITurns } from '../ai/AIEmpire';

// ── Per-empire research field state cache ──────────────────────────────────────
//
// The legacy Empire.research (ResearchState) doesn't hold the per-field
// EmpireFieldResearch structure that processResearchTurn() expects.
// We keep a module-level map so field state persists across turns without
// mutating the canonical GameState.  This is intentionally NOT persisted to
// the saved state (that's a future serialisation task).
//
const _empireFieldResearch: Record<string, EmpireFieldResearch> = {};

function getFieldResearch(empireId: string): EmpireFieldResearch {
  if (!_empireFieldResearch[empireId]) {
    _empireFieldResearch[empireId] = createDefaultFieldResearch();
  }
  return _empireFieldResearch[empireId];
}

// ── Internal phase helpers ─────────────────────────────────────────────────────

/**
 * Phase 2 — Full production processing for a single colonised planet.
 *
 * Runs:
 *   1. Net production (gross − cleanup)
 *   2. ECO phases (cleanup → growth bonus → terraforming)
 *   3. Factory construction (IND slider)
 *
 * Updates planet.factories and planet.population via returned state.
 * SHIP and DEF BC are accumulated into the empire reserve (handled by
 * processAllShipConstruction in phase 3 and future building-queue tasks).
 *
 * Returns the updated GameState (immutable).
 */
function runPlanetProduction(state: GameState, planet: Planet): GameState {
  const ctx: ProductionContext = { ...DEFAULT_PRODUCTION_CONTEXT };
  const result = processPlanetProduction(planet, ctx, 0, 0);

  // Apply factory construction results to the planet
  const newFactories = Math.min(
    planet.factories + result.factories.factoriesBuilt,
    planet.maxFactories,
  );

  // Apply ECO growth bonus to population
  const growthFromEco = result.eco.growthBonus;
  const newPop = Math.min(
    planet.population + growthFromEco,
    planet.maxPopulation,
  );

  const updatedPlanet: Planet = {
    ...planet,
    factories: newFactories,
    population: newPop,
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
 * Phase 2 (credit income) — collect base income from empire planets.
 *
 * Very light stub: adds creditPerTurn to each non-defeated empire's credits.
 * Full BC calculation (maintenance, trade, tribute) is a future task.
 */
function runEmpireIncome(state: GameState, empire: Empire): GameState {
  const updatedEmpire: Empire = {
    ...empire,
    credits: empire.credits + empire.creditPerTurn,
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

/**
 * Phase 4 — Research processing for a single empire.
 *
 * Gathers RP from all owned planets, allocates to fields, advances research.
 * Updates the legacy ResearchState.researchPoints for backward compatibility.
 */
function runEmpireResearch(state: GameState, empire: Empire): GameState {
  // Collect planet RP inputs for this empire
  const planetInputs = empire.planets
    .map((pid) => state.planets.byId[pid])
    .filter((p): p is Planet => p !== undefined && p.isColonized)
    .map((p) => ({
      population: p.population,
      researchSlider: p.production.research,
      buildingIds: p.buildings,
      hasArtifacts: p.hasArtifacts,
      isOrion: false,
    }));

  // Use even allocation as default (no player choice stored yet)
  const allocation = createEvenAllocation();
  const fields = getFieldResearch(empire.id);

  let result;
  try {
    result = processResearchTurn(
      planetInputs,
      empire.raceId,
      allocation,
      fields,
      state.galaxy.size,
      !empire.isPlayer,
    );
  } catch {
    // Unknown raceId or other research error — skip silently
    return state;
  }

  // Persist updated field research
  _empireFieldResearch[empire.id] = result.updatedFields;

  // Update the legacy ResearchState for backward compatibility
  const updatedResearch = {
    ...empire.research,
    researchPoints: empire.research.researchPoints + Math.floor(result.totalRP),
    researchPerTurn: Math.floor(result.totalRP),
    // Record newly completed techs in the legacy list
    completedTechs: [
      ...empire.research.completedTechs,
      ...result.completions.map((c) => c.completedTechId),
    ],
  };

  const updatedEmpire: Empire = {
    ...empire,
    research: updatedResearch,
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

/**
 * Phase 5 — Population growth for a single colonised planet.
 *
 * Uses calculateGrowth() which already handles morale multipliers and
 * capacity capping.
 */
function runPlanetGrowth(state: GameState, planet: Planet): GameState {
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

// ── Core turn processor ────────────────────────────────────────────────────────

/**
 * Advance the game by one turn.
 *
 * Turn sequence (mirrors design/game-mechanics/turn-structure.md):
 *   1.  Increment turn + year.
 *   2.  Empire income (credits += creditPerTurn) — per non-defeated empire.
 *   3.  Planet production: net BC, ECO phases, factory construction — per colonised planet.
 *   4.  Ship construction: SHIP BC → spawn ships — all planets in one pass.
 *   5.  Research: RP from all planets, advance field progress — per active empire.
 *   6.  Population growth (calculateGrowth) — per colonised planet.
 *   7.  Fleet movement: decrement ETAs, handle arrivals.
 *   8.  AI turns: production sliders, fleet dispatch, colonization.
 *
 * Pure — does not mutate `state`. Returns a new GameState object.
 */
export function processTurn(state: GameState): GameState {
  // ── Step 1: Advance time ────────────────────────────────────────────────
  const newTurn = state.turn + 1;
  const newYear = 2500 + newTurn;

  let next: GameState = {
    ...state,
    turn: newTurn,
    year: newYear,
    lastPlayed: Math.max(Date.now(), state.lastPlayed + 1),
  };

  // ── Step 2: Empire income ───────────────────────────────────────────────
  for (const empireId of next.empires.allIds) {
    const empire = next.empires.byId[empireId];
    if (!empire || empire.isDefeated) continue;
    next = runEmpireIncome(next, empire);
  }

  // ── Step 3: Planet production ───────────────────────────────────────────
  for (const planetId of next.planets.allIds) {
    const planet = next.planets.byId[planetId];
    if (!planet.isColonized || planet.ownerId === null) continue;
    next = runPlanetProduction(next, planet);
  }

  // ── Step 4: Ship construction (all planets in one pass) ─────────────────
  // Build the SHIP BC map: planet → BC allocated to ship construction this turn.
  // We use the allocation from the current planet state (after production).
  const shipBcByPlanet: Record<string, number> = {};
  for (const planetId of next.planets.allIds) {
    const planet = next.planets.byId[planetId];
    if (!planet.isColonized || planet.ownerId === null) continue;

    // Re-derive SHIP BC using the same logic as allocateSliders
    const p = planet.production;
    const nonTechTotal = p.ship + p.defense + p.industry + p.ecology;
    const scale = nonTechTotal > 0 ? 100 / nonTechTotal : 0;
    const grossApprox = planet.factories + planet.population * 0.53; // rough net estimate
    const shipBc = Math.floor(grossApprox * (p.ship * scale) / 100);
    if (shipBc > 0) {
      shipBcByPlanet[planetId] = shipBc;
    }
  }
  next = processAllShipConstruction(next, shipBcByPlanet);

  // ── Step 5: Research ────────────────────────────────────────────────────
  for (const empireId of next.empires.allIds) {
    const empire = next.empires.byId[empireId];
    if (!empire || empire.isDefeated) continue;
    next = runEmpireResearch(next, empire);
  }

  // ── Step 6: Population growth ───────────────────────────────────────────
  for (const planetId of next.planets.allIds) {
    const planet = next.planets.byId[planetId];
    if (!planet.isColonized) continue;
    // Re-fetch in case production phase updated the planet
    next = runPlanetGrowth(next, next.planets.byId[planetId]);
  }

  // ── Step 7: Fleet movement ──────────────────────────────────────────────
  next = processFleetMovement(next);

  // ── Step 8: AI turns ────────────────────────────────────────────────────
  next = processAllAITurns(next);

  return next;
}
