/**
 * Turn processing system — pure TypeScript, NO DOM.
 * src/game/systems/turn.ts
 *
 * Orchestrates the per-turn game loop: increments the turn counter,
 * updates the year, and delegates to sub-systems (production, growth,
 * research).  Sub-system calls that are not yet implemented are
 * intentionally left as no-op stubs so that those modules can be
 * filled in without changing this file's API.
 */

import { GameState, Planet, Empire } from '../state';
import { calculateGrowth } from './growth';
import { calculateBaseProduction } from './production';

// ── Stub helpers (replaced by real systems in later tasks) ─────────────────

/**
 * Stub: process production for a single planet.
 * Returns state unchanged until the production system is wired in.
 */
function processProduction(state: GameState, _planet: Planet): GameState {
  // calculateBaseProduction is already implemented; the full turn-integration
  // (spending production points, advancing build queues, etc.) is a future task.
  void calculateBaseProduction(_planet); // exercise the existing function
  return state;
}

/**
 * Stub: process population growth for a single planet.
 * Returns state with updated population when growth is positive.
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

/**
 * Stub: process research for a single empire.
 * Returns state unchanged until the research system is wired in.
 */
function processResearch(state: GameState, _empire: Empire): GameState {
  return state;
}

// ── Core turn processor ────────────────────────────────────────────────────

/**
 * Advance the game by one turn.
 *
 * Sequence:
 *   1. Increment `turn` counter.
 *   2. Update `year` to `2500 + turn`.
 *   3. Run production processing per colonised planet.
 *   4. Run population growth per colonised planet.
 *   5. Run research processing per active empire.
 *
 * The function is pure: it does not mutate `state` and returns a new object.
 */
export function processTurn(state: GameState): GameState {
  // ── Step 1 & 2: advance time ─────────────────────────────────────────────
  const newTurn = state.turn + 1;
  const newYear = 2500 + newTurn;

  let next: GameState = {
    ...state,
    turn: newTurn,
    year: newYear,
    lastPlayed: Math.max(Date.now(), state.lastPlayed + 1),
  };

  // ── Step 3 & 4: per-planet processing ────────────────────────────────────
  for (const planetId of next.planets.allIds) {
    const planet = next.planets.byId[planetId];
    if (!planet.isColonized) continue;

    next = processProduction(next, planet);
    // Re-fetch planet in case processProduction updated it (future-proofing)
    next = processGrowth(next, next.planets.byId[planetId]);
  }

  // ── Step 5: per-empire research ───────────────────────────────────────────
  for (const empireId of next.empires.allIds) {
    const empire = next.empires.byId[empireId];
    if (empire.isDefeated) continue;

    next = processResearch(next, empire);
  }

  return next;
}
