/**
 * Diplomatic relations system — pure TypeScript, NO DOM.
 *
 * Handles relationship values between empires on a -100 (war) to +100 (allied)
 * scale, with per-empire modifier stacking and per-turn decay toward neutral.
 *
 * Also implements war weariness: prolonged war causes morale degradation and
 * production penalties. Each turn at war reduces morale by 1, capped at -20.
 *
 * All formulas follow design/diplomacy/relationship-formulas.md.
 */

import {
  DiplomaticRelations,
  DiplomaticState,
  Empire,
  EmpireId,
  GameState,
  RelationModifier,
} from '../state';

// ── War Weariness Constants ───────────────────────────────────────────────────

/** Morale penalty per turn at war. */
export const WAR_WEARINESS_MORALE_PER_TURN = 1;

/** Maximum war weariness morale penalty. */
export const WAR_WEARINESS_MAX_PENALTY = 20;

/** Production penalty percentage per 5 morale points lost to war weariness. */
export const WAR_WEARINESS_PRODUCTION_PENALTY_PER_5_MORALE = 2;

// ── Constants ─────────────────────────────────────────────────────────────────

export const RELATION_MIN = -100;
export const RELATION_MAX = 100;
export const RELATION_NEUTRAL = 0;

/** Base decay rate per turn (2 % of the gap to neutral). */
export const DECAY_RATE = 0.02;

/** Threshold below which the relation is "war". */
export const STATE_WAR_THRESHOLD = -50;
/** Threshold at or below which the relation is "unfriendly" (range: -50 to -1). */
export const STATE_UNFRIENDLY_THRESHOLD = 0;
/** Threshold above which the relation is "friendly". */
export const STATE_FRIENDLY_THRESHOLD = 49;
/** Threshold above which the relation is "allied". */
export const STATE_ALLIED_THRESHOLD = 79;

// ── Helper ────────────────────────────────────────────────────────────────────

/** Return the `DiplomaticRelations` object between two empires (by either id). */
function getRelation(
  state: GameState,
  empireAId: EmpireId,
  empireBId: EmpireId,
): DiplomaticRelations | undefined {
  const empireA = state.empires.byId[empireAId];
  if (!empireA) return undefined;
  return empireA.relations[empireBId];
}

/** Clamp a value to the [-100, +100] range. */
function clamp(value: number): number {
  return Math.max(RELATION_MIN, Math.min(RELATION_MAX, value));
}

/** Build a fresh neutral relation entry. */
function makeNeutralRelation(
  empireAId: EmpireId,
  empireBId: EmpireId,
  currentTurn: number,
): DiplomaticRelations {
  return {
    empireA: empireAId,
    empireB: empireBId,
    value: RELATION_NEUTRAL,
    state: 'neutral',
    treaties: [],
    events: [],
    warStartTurn: null,
    lastContact: currentTurn,
    modifiers: [],
    incomingProposals: [],
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Initialise diplomatic relations between every empire pair.
 *
 * Relations start at neutral (0) with no modifiers.
 */
export function initializeRelations(state: GameState): GameState {
  const empires = state.empires.allIds;
  const turn = state.turn;
  const empiresCopy: Record<EmpireId, Empire> = {};

  // Build a fresh neutral relation for every ordered pair (A, B) where A ≠ B.
  for (const empireId of empires) {
    const empire = state.empires.byId[empireId];
    const relations: Record<EmpireId, DiplomaticRelations> = {};

    for (const otherId of empires) {
      if (otherId === empireId) continue;
      relations[otherId] = makeNeutralRelation(empireId, otherId, turn);
    }

    empiresCopy[empireId] = { ...empire, relations };
  }

  return {
    ...state,
    empires: {
      ...state.empires,
      byId: empiresCopy,
    },
  };
}

/**
 * Compute the diplomatic state label from a raw relation value.
 */
export function getDiplomaticState(value: number): DiplomaticState {
  if (value < STATE_WAR_THRESHOLD) return 'war';
  if (value < STATE_UNFRIENDLY_THRESHOLD) return 'unfriendly';
  if (value <= STATE_FRIENDLY_THRESHOLD) return 'neutral';
  if (value <= STATE_ALLIED_THRESHOLD) return 'friendly';
  return 'allied';
}

/**
 * Apply a single modifier to the relation between two empires.
 *
 * Modifiers are stored on the relation object and applied each turn via
 * `processRelations`.
 */
export function applyRelationModifier(
  state: GameState,
  empireAId: EmpireId,
  empireBId: EmpireId,
  modifier: RelationModifier,
): GameState {
  const relation = getRelation(state, empireAId, empireBId);
  if (!relation) return state;

  const newRelations = { ...state.empires.byId[empireAId].relations };
  newRelations[empireBId] = {
    ...relation,
    modifiers: [...relation.modifiers, modifier],
  };

  return {
    ...state,
    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        [empireAId]: { ...state.empires.byId[empireAId], relations: newRelations },
      },
    },
  };
}

/**
 * Process per-turn modifier application and natural decay.
 *
 * For each relation:
 *   1. Sum and apply all active modifiers (including expiration).
 *   2. Decay the resulting value toward neutral (0) by DECAY_RATE.
 *   3. Clamp to [-100, +100].
 *   4. Re-compute the state label.
 */
export function processRelations(state: GameState): GameState {
  const empiresCopy: Record<EmpireId, Empire> = {};

  for (const empireId of state.empires.allIds) {
    const empire = state.empires.byId[empireId];
    const oldRelations = empire.relations;
    const newRelations: Record<EmpireId, DiplomaticRelations> = {};

    for (const targetId of Object.keys(oldRelations)) {
      if (targetId === empireId) continue;

      const relation = oldRelations[targetId];
      const turn = state.turn;

      // 1. Sum modifiers, drop expired ones
      let modifierSum = 0;
      const activeModifiers: RelationModifier[] = [];
      for (const mod of relation.modifiers) {
        if (mod.expiresAtTurn !== undefined && turn >= mod.expiresAtTurn) {
          continue; // expired
        }
        activeModifiers.push(mod);
        modifierSum += mod.amount;
      }

      let newValue = clamp(relation.value + modifierSum);

      // 2. Decay toward neutral (0)
      const decayAmount = Math.floor(
        (newValue - RELATION_NEUTRAL) * DECAY_RATE,
      );
      newValue = clamp(newValue - decayAmount);

      // 3. & 4. Re-compute state
      const newState = getDiplomaticState(newValue);

      newRelations[targetId] = {
        ...relation,
        value: newValue,
        state: newState,
        modifiers: activeModifiers,
        lastContact: turn,
      };
    }

    empiresCopy[empireId] = { ...empire, relations: newRelations };
  }

  return {
    ...state,
    empires: {
      ...state.empires,
      byId: empiresCopy,
    },
  };
}

/**
 * Return the current relation value between two empires.
 *
 * Returns the value from either empire's view of the other. If no relation
 * exists yet, returns the neutral baseline.
 */
export function getRelationValue(
  state: GameState,
  empireAId: EmpireId,
  empireBId: EmpireId,
): number {
  const relation = getRelation(state, empireAId, empireBId);
  if (!relation) return RELATION_NEUTRAL;
  return relation.value;
}

// ── War Weariness ─────────────────────────────────────────────────────────────

/**
 * Calculate the war weariness penalty for an empire based on active wars.
 * Returns the total morale penalty from all active wars.
 */
export function calculateWarWeariness(
  state: GameState,
  empireId: EmpireId,
): number {
  const empire = state.empires.byId[empireId];
  if (!empire) return 0;

  let totalWeariness = 0;

  for (const otherId of Object.keys(empire.relations)) {
    if (otherId === empireId) continue;

    const rel = empire.relations[otherId];
    if (!rel) continue;

    // Check if at war (state is 'war' and warStartTurn is set)
    if (rel.state === 'war' && rel.warStartTurn !== null) {
      const turnsAtWar = state.turn - rel.warStartTurn;
      // 1 morale penalty per turn at war, capped at 20 per war
      const weariness = Math.min(turnsAtWar * WAR_WEARINESS_MORALE_PER_TURN, WAR_WEARINESS_MAX_PENALTY);
      totalWeariness += weariness;
    }
  }

  // Global cap at 20 total (sum of all wars)
  return Math.min(totalWeariness, WAR_WEARINESS_MAX_PENALTY);
}

/**
 * Calculate the production penalty percentage from war weariness.
 * Returns a percentage reduction (e.g., 8 means -8% production).
 */
export function calculateWarWearinessProductionPenalty(
  state: GameState,
  empireId: EmpireId,
): number {
  const weariness = calculateWarWeariness(state, empireId);
  // 2% production penalty per 5 morale points lost
  return Math.floor(weariness / 5) * WAR_WEARINESS_PRODUCTION_PENALTY_PER_5_MORALE;
}

/**
 * Get the number of turns an empire has been at war with another empire.
 * Returns 0 if not at war or if warStartTurn is not set.
 */
export function getTurnsAtWar(
  state: GameState,
  empireAId: EmpireId,
  empireBId: EmpireId,
): number {
  const relation = getRelation(state, empireAId, empireBId);
  if (!relation || relation.state !== 'war' || relation.warStartTurn === null) {
    return 0;
  }
  return state.turn - relation.warStartTurn;
}

/**
 * Start a war between two empires. Sets warStartTurn and updates state to war.
 */
export function declareWar(
  state: GameState,
  attackerId: EmpireId,
  defenderId: EmpireId,
): GameState {
  const relation = getRelation(state, attackerId, defenderId);
  if (!relation) return state;

  // Already at war
  if (relation.state === 'war') return state;

  const newRelations = { ...state.empires.byId[attackerId].relations };
  newRelations[defenderId] = {
    ...relation,
    value: RELATION_MIN,
    state: 'war',
    warStartTurn: state.turn,
    modifiers: [
      ...relation.modifiers,
      {
        reason: 'War declaration',
        amount: -50,
        expiresAtTurn: undefined, // permanent until peace
      },
    ],
  };

  // Update both empires' relations
  let nextState: GameState = {
    ...state,
    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        [attackerId]: { ...state.empires.byId[attackerId], relations: newRelations },
      },
    },
  };

  // Mirror the war state for the defender
  const defenderRelations = { ...nextState.empires.byId[defenderId].relations };
  defenderRelations[attackerId] = {
    ...defenderRelations[attackerId],
    value: RELATION_MIN,
    state: 'war',
    warStartTurn: state.turn,
  };

  nextState = {
    ...nextState,
    empires: {
      ...nextState.empires,
      byId: {
        ...nextState.empires.byId,
        [defenderId]: { ...nextState.empires.byId[defenderId], relations: defenderRelations },
      },
    },
  };

  return nextState;
}

/**
 * End a war between two empires. Clears warStartTurn and updates state.
 */
export function makePeace(
  state: GameState,
  empireAId: EmpireId,
  empireBId: EmpireId,
): GameState {
  const relation = getRelation(state, empireAId, empireBId);
  if (!relation || relation.state !== 'war') return state;

  const newRelationsA = { ...state.empires.byId[empireAId].relations };
  newRelationsA[empireBId] = {
    ...relation,
    value: -45, // Just above war threshold
    state: 'unfriendly',
    warStartTurn: null,
  };

  let nextState: GameState = {
    ...state,
    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        [empireAId]: { ...state.empires.byId[empireAId], relations: newRelationsA },
      },
    },
  };

  // Mirror for the other empire
  const newRelationsB = { ...nextState.empires.byId[empireBId].relations };
  newRelationsB[empireAId] = {
    ...newRelationsB[empireAId],
    value: -45,
    state: 'unfriendly',
    warStartTurn: null,
  };

  nextState = {
    ...nextState,
    empires: {
      ...nextState.empires,
      byId: {
        ...nextState.empires.byId,
        [empireBId]: { ...nextState.empires.byId[empireBId], relations: newRelationsB },
      },
    },
  };

  return nextState;
}
