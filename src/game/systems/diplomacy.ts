/**
 * Diplomatic relations system — pure TypeScript, NO DOM.
 *
 * Handles relationship values between empires on a -100 (war) to +100 (allied)
 * scale, with per-empire modifier stacking and per-turn decay toward neutral.
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
