/**
 * Diplomatic relations system — pure TypeScript, NO DOM.
 *
 * Handles relationship values between empires on a -100 (war) to +100 (allied)
 * scale, with per-empire modifier stacking and per-turn decay toward racial baseline.
 *
 * Also implements war weariness: prolonged war causes morale degradation and
 * production penalties. War weariness is calculated as:
 *   BaseDuration + CasualtyFactor + EconomicStrain
 * with racial multipliers applied.
 *
 * All formulas follow design/diplomacy/relationship-formulas.md.
 */

import {
  DiplomaticRelations,
  DiplomaticState,
  Empire,
  EmpireId,
  GameState,
  RaceId,
  RelationModifier,
  TreatyType,
} from '../state';
// Note: Race data is used via RACIAL_* constants defined above

// ── Constants (design/diplomacy/relationship-formulas.md §10) ────────────────

export const RELATION_MIN = -100;
export const RELATION_MAX = 100;
export const RELATION_NEUTRAL = 0;

/** Base decay rate per turn (2% of the gap to baseline). */
export const DECAY_RATE = 0.02;

/**
 * Diplomatic state thresholds (design/diplomacy/relationship-formulas.md §1):
 *   War:        -100 to -50 (≤ -50)
 *   Unfriendly: -49 to -1
 *   Neutral:    0 to +49
 *   Friendly:   +50 to +79
 *   Allied:     +80 to +100
 */
export const STATE_WAR_THRESHOLD = -50;
export const STATE_UNFRIENDLY_THRESHOLD = -1;
export const STATE_FRIENDLY_THRESHOLD = 50;
export const STATE_ALLIED_THRESHOLD = 80;

/** Turns per duration bonus for treaty maintenance. */
export const TREATY_DURATION_BONUS_INTERVAL = 25;
export const TREATY_DURATION_BONUS_MAX = 20;

/** Maximum per-turn bonus from treaty maintenance. */
export const TREATY_MAINTENANCE_CAP = 10;

/** War weariness interval (turns per base weariness point). */
export const WAR_WEARINESS_INTERVAL = 10;

/** Border friction penalty per contested system. */
export const BORDER_FRICTION_PER_SYSTEM = -5;
export const BORDER_FRICTION_MAX = -25;

/** Hamster racial diplomacy constants (§5.2, §10). */
export const HAMSTER_DIPLOMACY_BASE = 1.30;
export const HAMSTER_POSITIVE_MULTIPLIER = 2.0;
export const HAMSTER_POSITIVE_COMBINED = 2.60; // 1.30 × 2.0
export const HAMSTER_TRADE_BONUS = 1.25;
export const HAMSTER_TREATY_BONUS = 5;

/** Treaty maintenance bonuses per turn (§3.1). */
export const TREATY_MAINTENANCE_BONUSES: Record<TreatyType, number> = {
  trade: 0.20,
  research: 0.15,
  non_aggression: 0.10,
  defensive_pact: 0.20,
  military_alliance: 0.30,
  peace: 0,
};

/**
 * Racial war weariness multipliers (design/diplomacy/relationship-formulas.md §4.2).
 */
export const RACIAL_WAR_WEARINESS_MULTIPLIERS: Record<RaceId, number> = {
  guinea_pigs: 0.5,
  hermit_crabs: 0.6,
  ferrets: 0.7,
  budgies: 0.75,
  ants: 0.8,
  chameleons: 0.9,
  hamsters: 1.0,
  mice: 1.0,
  rats: 1.2,
  rabbits: 1.5,
};

/**
 * Racial diplomacy modifiers (design/diplomacy/relationship-formulas.md §5.1).
 * Value is the multiplier (e.g. 1.30 means +30%).
 */
export const RACIAL_DIPLOMACY_MODIFIERS: Record<RaceId, number> = {
  hamsters: 1.30,
  chameleons: 1.20,
  rabbits: 1.05,
  mice: 1.0,
  rats: 1.0,
  ants: 1.0,
  hermit_crabs: 1.0,
  budgies: 0.95,
  ferrets: 0.90,
  guinea_pigs: 0.80,
};

/**
 * Ship weight values for war weariness casualty calculation (§4.1).
 */
export const SHIP_WEIGHT: Record<string, number> = {
  small: 0.1,
  medium: 0.5,
  large: 2.0,
  huge: 6.0,
};

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
 *
 * Thresholds per design/diplomacy/relationship-formulas.md §1:
 *   War:        -100 to -50 (value ≤ -50)
 *   Unfriendly: -49 to -1   (-50 < value < 0)
 *   Neutral:    0 to +49    (0 ≤ value < 50)
 *   Friendly:   +50 to +79  (50 ≤ value < 80)
 *   Allied:     +80 to +100 (value ≥ 80)
 */
export function getDiplomaticState(value: number): DiplomaticState {
  if (value <= STATE_WAR_THRESHOLD) return 'war';
  if (value <= STATE_UNFRIENDLY_THRESHOLD) return 'unfriendly';
  if (value < STATE_FRIENDLY_THRESHOLD) return 'neutral';
  if (value < STATE_ALLIED_THRESHOLD) return 'friendly';
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
 * Get the racial baseline relationship between two races.
 * Per design/diplomacy/relationship-formulas.md §5.3, this is based on
 * the racial attitude matrix.
 */
export function getRacialBaseline(
  raceAId: RaceId,
  raceBId: RaceId,
): number {
  let baseline = 0;

  // Hamsters: +10 toward everyone (Universal Diplomat)
  if (raceAId === 'hamsters') {
    baseline += 10;
  }
  if (raceBId === 'hamsters') {
    baseline += 10;
  }

  // Chameleons: -10 outgoing (no one trusts them) + -10 incoming (universal unease)
  if (raceAId === 'chameleons') {
    baseline -= 10; // outgoing distrust
  }
  if (raceBId === 'chameleons') {
    baseline -= 10; // incoming distrust
  }

  // Specific racial attitudes
  if (raceAId === 'guinea_pigs' && raceBId === 'hamsters') baseline -= 30;
  if (raceAId === 'guinea_pigs' && raceBId === 'chameleons') baseline -= 20;
  if (raceAId === 'ferrets' && raceBId === 'rabbits') baseline -= 25;
  if (raceAId === 'ferrets' && raceBId === 'chameleons') baseline -= 15;
  if (raceAId === 'budgies' && raceBId === 'guinea_pigs') baseline += 10;
  if (raceAId === 'budgies' && raceBId === 'ferrets') baseline += 10;
  if (raceAId === 'rats' && raceBId === 'mice') baseline += 15;
  if (raceAId === 'mice' && raceBId === 'rats') baseline += 15;

  return baseline;
}

/**
 * Calculate the treaty maintenance bonus per turn for a relation.
 * Per design/diplomacy/relationship-formulas.md §3.1.
 */
export function calculateTreatyMaintenanceBonus(
  relation: DiplomaticRelations,
): number {
  let totalBonus = 0;
  for (const treaty of relation.treaties) {
    const bonus = TREATY_MAINTENANCE_BONUSES[treaty.type] ?? 0;
    totalBonus += bonus;
  }
  // Cap at TREATY_MAINTENANCE_CAP per turn
  return Math.min(totalBonus, TREATY_MAINTENANCE_CAP);
}

/**
 * Apply racial diplomacy modifier to a relationship change.
 * Per design/diplomacy/relationship-formulas.md §2.1:
 *   RelationChange = floor(BaseChange × RacialMod × ReputationMod × DifficultyMod)
 *
 * For Hamsters with positive actions, applies the Universal Diplomat 2× bonus.
 */
export function applyRacialDiplomacyModifier(
  baseChange: number,
  initiatorRaceId: RaceId,
  isPositiveAction: boolean = baseChange > 0,
): number {
  let racialMod = RACIAL_DIPLOMACY_MODIFIERS[initiatorRaceId] ?? 1.0;

  // Hamsters get 2× multiplier on positive actions (Universal Diplomat)
  if (initiatorRaceId === 'hamsters' && isPositiveAction) {
    racialMod = HAMSTER_POSITIVE_COMBINED; // 1.30 × 2.0 = 2.60
  }

  return Math.floor(baseChange * racialMod);
}

/**
 * Process per-turn modifier application, treaty bonuses, and natural decay.
 *
 * Per design/diplomacy/relationship-formulas.md §12:
 *   1. Apply action-based changes (modifiers) from this turn
 *   2. Apply treaty maintenance bonuses
 *   3. Apply natural decay toward racial baseline
 *   4. Apply border friction (TODO: requires contested systems data)
 *   5. Clamp to [-100, +100]
 *   6. Re-compute the state label
 */
export function processRelations(state: GameState): GameState {
  const empiresCopy: Record<EmpireId, Empire> = {};

  for (const empireId of state.empires.allIds) {
    const empire = state.empires.byId[empireId];
    const oldRelations = empire.relations;
    const newRelations: Record<EmpireId, DiplomaticRelations> = {};
    const empireRaceId = empire.raceId;

    for (const targetId of Object.keys(oldRelations)) {
      if (targetId === empireId) continue;

      const relation = oldRelations[targetId];
      const targetEmpire = state.empires.byId[targetId];
      const targetRaceId = targetEmpire?.raceId ?? 'hamsters';
      const turn = state.turn;

      // Step 1: Sum modifiers, drop expired ones
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

      // Step 2: Apply treaty maintenance bonuses (fractional accumulation)
      const treatyBonus = calculateTreatyMaintenanceBonus(relation);
      // Accumulate fractional bonus in the relation (simplified: apply floor per turn)
      if (treatyBonus > 0) {
        // For simplicity, accumulate and apply when >= 1
        const accumulatedBonus = (relation.treatyBonusAccumulator ?? 0) + treatyBonus;
        if (accumulatedBonus >= 1) {
          newValue = clamp(newValue + Math.floor(accumulatedBonus));
        }
        // Store remainder for next turn (will be in updated relation)
      }

      // Step 3: Decay toward racial baseline (not neutral 0)
      const baseline = getRacialBaseline(empireRaceId, targetRaceId);
      const decayAmount = Math.floor((newValue - baseline) * DECAY_RATE);
      newValue = clamp(newValue - decayAmount);

      // Step 4: Border friction (TODO: requires contested systems tracking)
      // This will be implemented when the territory system is in place

      // Step 5 & 6: Re-compute state
      const newState = getDiplomaticState(newValue);

      newRelations[targetId] = {
        ...relation,
        value: newValue,
        state: newState,
        modifiers: activeModifiers,
        lastContact: turn,
        treatyBonusAccumulator:
          treatyBonus > 0 ? ((relation.treatyBonusAccumulator ?? 0) + treatyBonus) % 1 : 0,
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

// ── War Weariness (design/diplomacy/relationship-formulas.md §4) ──────────────

/**
 * War weariness data tracked per empire for accurate calculation.
 * This interface represents the inputs needed for the full formula.
 */
export interface WarWearinessInputs {
  turnsAtWar: number;
  shipsLost: { small: number; medium: number; large: number; huge: number };
  populationLost: number;
  warMaintenanceCost: number;
  totalIncome: number;
}

/**
 * Calculate war weariness for a single conflict.
 * Per design/diplomacy/relationship-formulas.md §4.1:
 *   WarWeariness = BaseDuration + CasualtyFactor + EconomicStrain
 *
 * Where:
 *   BaseDuration = floor(TurnsAtWar / 10)
 *   CasualtyFactor = floor(ShipsLost × ShipWeight + PopulationLost × 0.01)
 *   EconomicStrain = floor((WarMaintenanceCost / TotalIncome) × 20)
 */
export function calculateWarWearinessForConflict(
  inputs: WarWearinessInputs,
  raceId: RaceId,
): number {
  const { turnsAtWar, shipsLost, populationLost, warMaintenanceCost, totalIncome } = inputs;

  // BaseDuration = floor(TurnsAtWar / 10)
  const baseDuration = Math.floor(turnsAtWar / WAR_WEARINESS_INTERVAL);

  // CasualtyFactor = floor(ShipsLost × ShipWeight + PopulationLost × 0.01)
  const shipCasualties =
    shipsLost.small * SHIP_WEIGHT.small +
    shipsLost.medium * SHIP_WEIGHT.medium +
    shipsLost.large * SHIP_WEIGHT.large +
    shipsLost.huge * SHIP_WEIGHT.huge;
  const casualtyFactor = Math.floor(shipCasualties + populationLost * 0.01);

  // EconomicStrain = floor((WarMaintenanceCost / TotalIncome) × 20)
  const economicStrain =
    totalIncome > 0 ? Math.floor((warMaintenanceCost / totalIncome) * 20) : 0;

  // Total weariness before racial modifier
  const rawWeariness = baseDuration + casualtyFactor + economicStrain;

  // Apply racial multiplier (§4.2)
  const racialMultiplier = RACIAL_WAR_WEARINESS_MULTIPLIERS[raceId] ?? 1.0;
  return Math.floor(rawWeariness * racialMultiplier);
}

/**
 * Calculate the total war weariness for an empire across all active wars.
 * Simplified version that uses turn-based duration when detailed casualty
 * data is not available.
 */
export function calculateWarWeariness(
  state: GameState,
  empireId: EmpireId,
): number {
  const empire = state.empires.byId[empireId];
  if (!empire) return 0;

  let totalWeariness = 0;
  const raceId = empire.raceId;

  for (const otherId of Object.keys(empire.relations)) {
    if (otherId === empireId) continue;

    const rel = empire.relations[otherId];
    if (!rel) continue;

    // Check if at war (state is 'war' and warStartTurn is set)
    if (rel.state === 'war' && rel.warStartTurn !== null) {
      const turnsAtWar = state.turn - rel.warStartTurn;

      // Simplified calculation when detailed casualty data unavailable:
      // Use BaseDuration with racial multiplier
      const baseDuration = Math.floor(turnsAtWar / WAR_WEARINESS_INTERVAL);
      const racialMultiplier = RACIAL_WAR_WEARINESS_MULTIPLIERS[raceId] ?? 1.0;
      const weariness = Math.floor(baseDuration * racialMultiplier);

      totalWeariness += weariness;
    }
  }

  return totalWeariness;
}

/**
 * Calculate the production penalty percentage from war weariness.
 * Per design/diplomacy/relationship-formulas.md §4.1 War Weariness Scale:
 *   0-10:   0% (Fresh)
 *   11-25:  -5% (Tired)
 *   26-50:  -10% (Weary)
 *   51-75:  -15% (Exhausted)
 *   76-100: -20% (Critical)
 *   100+:   -25% (Desperate)
 */
export function calculateWarWearinessProductionPenalty(
  state: GameState,
  empireId: EmpireId,
): number {
  const weariness = calculateWarWeariness(state, empireId);

  if (weariness <= 10) return 0;        // Fresh
  if (weariness <= 25) return 5;        // Tired
  if (weariness <= 50) return 10;       // Weary
  if (weariness <= 75) return 15;       // Exhausted
  if (weariness <= 100) return 20;      // Critical
  return 25;                             // Desperate
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
