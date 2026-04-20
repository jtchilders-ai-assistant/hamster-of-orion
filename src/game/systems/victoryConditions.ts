/**
 * Victory conditions — check end-of-turn victory states.
 * Pure TypeScript, NO DOM, no `any`.
 *
 * Two victory types per MOO1 design:
 * 1. Diplomatic — win a 2/3 majority vote in the High Council
 * 2. Military   — eliminate all other empires (no colonies, no colony ships)
 * 3. Conquest   — dominate by owning 3+ star systems (including Orion)
 */

import { EmpireId, GameState } from '../state';
import {
  checkDiplomaticVictory,
  getCouncilCandidates,
  calculateVoteShares,
  runAIVotes,
  isCouncilTurn,
} from './council';

export type VictoryType = 'diplomatic' | 'military' | 'conquest';

export interface VictoryResult {
  winnerId: EmpireId;
  type: VictoryType;
  description: string;
}

/** Minimum number of owned star systems for a conquest victory. */
const CONQUEST_SYSTEM_THRESHOLD = 3;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** All living (non-defeated) empire IDs. */
function livingEmpireIds(state: GameState): EmpireId[] {
  return state.empires.allIds.filter(
    (id) => !state.empires.byId[id]?.isDefeated,
  );
}

/** Whether a ship design is a colony ship (has a 'special' component named with 'colony'). */
function designIsColonyShip(state: GameState, designId: string): boolean {
  const design = state.shipDesigns.byId[designId];
  if (!design) return false;
  return design.components.some(
    (c) => c.type === 'special' && c.name.toLowerCase().includes('colony'),
  );
}

/** Whether an empire has at least one colony ship anywhere in its fleets. */
function hasColonyShip(state: GameState, empireId: EmpireId): boolean {
  const empire = state.empires.byId[empireId];
  if (!empire) return false;
  for (const fleetId of empire.fleets) {
    const fleet = state.fleets.byId[fleetId];
    if (!fleet) continue;
    for (const shipId of fleet.shipIds) {
      const ship = state.ships.byId[shipId];
      if (ship && designIsColonyShip(state, ship.designId)) return true;
    }
  }
  return false;
}

/**
 * Count distinct star systems owned by an empire.
 * A system is "owned" when the empire owns at least one of its planets.
 */
function ownedSystemCount(state: GameState, empireId: EmpireId): number {
  const empire = state.empires.byId[empireId];
  if (!empire) return 0;
  const systemIds = new Set<string>();
  for (const planetId of empire.planets) {
    const planet = state.planets.byId[planetId];
    if (planet) systemIds.add(planet.systemId);
  }
  return systemIds.size;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Check all victory conditions for the current turn.
 * Returns the first VictoryResult found, or null if none.
 *
 * Priority: military → conquest → diplomatic.
 */
export function checkVictoryConditions(
  state: GameState,
): VictoryResult | null {
  // 1. Military: only one living empire remains.
  const militaryWinnerId = checkMilitaryVictory(state);
  if (militaryWinnerId !== null) {
    const name = state.empires.byId[militaryWinnerId]?.name ?? 'Unknown';
    return {
      winnerId: militaryWinnerId,
      type: 'military',
      description: `${name} has eliminated all rival empires and achieved Military Conquest`,
    };
  }

  // 2. Conquest: an empire controls 3+ star systems.
  const conquestWinnerId = checkConquestVictory(state);
  if (conquestWinnerId !== null) {
    const name = state.empires.byId[conquestWinnerId]?.name ?? 'Unknown';
    const count = ownedSystemCount(state, conquestWinnerId);
    return {
      winnerId: conquestWinnerId,
      type: 'conquest',
      description: `${name} has established dominance over ${count} star systems`,
    };
  }

  // 3. Diplomatic: council election on council turns.
  if (isCouncilTurn(state.turn) && state.highCouncil?.isActive) {
    const diplomaticWinnerId = runDiplomaticCheck(state);
    if (diplomaticWinnerId !== null) {
      const name = state.empires.byId[diplomaticWinnerId]?.name ?? 'Unknown';
      return {
        winnerId: diplomaticWinnerId,
        type: 'diplomatic',
        description: `${name} has won the High Council election with a 2/3 majority`,
      };
    }
  }

  return null;
}

/**
 * Check military victory: all empires except one have been defeated.
 *
 * Returns the surviving empire's ID, or null if more than one empire is still alive.
 */
export function checkMilitaryVictory(state: GameState): EmpireId | null {
  const living = livingEmpireIds(state);
  if (living.length !== 1) return null;

  const [winnerId] = living;
  const empire = state.empires.byId[winnerId];
  // Winner must actually control something (has colonies or colony ships).
  if (!empire || (empire.planets.length === 0 && !hasColonyShip(state, winnerId))) {
    return null;
  }
  return winnerId;
}

/**
 * Check conquest victory: any living empire owns 3+ star systems.
 *
 * Orion counts as a normal system here; owning it is a major strategic advantage
 * but not a special-cased win condition.
 */
export function checkConquestVictory(state: GameState): EmpireId | null {
  for (const empireId of livingEmpireIds(state)) {
    if (ownedSystemCount(state, empireId) >= CONQUEST_SYSTEM_THRESHOLD) {
      return empireId;
    }
  }
  return null;
}

/**
 * Mark an empire as defeated, returning the updated GameState.
 *
 * Sets `isDefeated = true` and `defeatedTurn` on the empire record.
 * The `defeatedBy` parameter is accepted for API consistency
 * (future: record who destroyed the empire for score/lore purposes).
 */
export function markEmpireDefeated(
  state: GameState,
  empireId: EmpireId,
  _defeatedBy: EmpireId,
): GameState {
  const empire = state.empires.byId[empireId];
  if (!empire || empire.isDefeated) return state;

  return {
    ...state,
    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        [empireId]: {
          ...empire,
          isDefeated: true,
          defeatedTurn: state.turn,
        },
      },
    },
  };
}

// ── Internal ──────────────────────────────────────────────────────────────────

/**
 * Run the full diplomatic victory check for the current state.
 * Derives candidates, vote shares, and AI votes, then delegates
 * to council.checkDiplomaticVictory for the 2/3 threshold check.
 */
function runDiplomaticCheck(state: GameState): EmpireId | null {
  const candidates = getCouncilCandidates(state);
  const voteShares = calculateVoteShares(state);
  const votes = runAIVotes(state, candidates);
  return checkDiplomaticVictory(voteShares, votes, candidates);
}
