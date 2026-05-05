/**
 * Treaty system — pure TypeScript, NO DOM.
 *
 * Handles proposing, accepting, breaking, and processing effects of treaties
 * between empires. Trade income ramps up over TRADE_RAMP_TURNS turns per the
 * design in design/diplomacy/treaties.md.
 *
 * All functions are pure: they return a new GameState and never mutate.
 */

import {
  DiplomaticRelations,
  Empire,
  EmpireId,
  GameState,
  Treaty,
  TreatyTerms,
  TreatyType,
} from '../state';

// ── Constants ─────────────────────────────────────────────────────────────────

/** Turns for trade income to ramp from 0% to 100%. */
export const TRADE_RAMP_TURNS = 30;

/** Fraction of prior ramp progress retained when a treaty is renegotiated. */
export const TRADE_RENEGOTIATION_RETENTION = 0.5;

/** Hamster race id — receives a 25% trade income bonus. */
export const HAMSTER_RACE_ID = 'hamsters';

/** Hamster trade income multiplier. */
export const HAMSTER_TRADE_BONUS = 1.25;

// ── Relation penalties on break (design/diplomacy/relationship-formulas.md §3.2) ──

/**
 * Treaty break penalties from design doc Section 3.2.
 * Each treaty type has a penalty for the target and a separate penalty for all other races.
 */
export interface BreakPenalty {
  target: number;  // Penalty applied to the target of the broken treaty
  all: number;     // Penalty applied to all other races
}

export const BREAK_PENALTIES: Record<TreatyType, BreakPenalty> = {
  // Peace break: -50 to all races (design §2.2 says "with all races")
  peace:             { target: -50,  all: -50 },
  trade:             { target: -25,  all: -10 },
  research:          { target: -20,  all: -10 },
  non_aggression:    { target: -30,  all: -15 },
  defensive_pact:    { target: -40,  all: -20 },
  military_alliance: { target: -100, all: -50 },
};

// Legacy exports for backward compatibility with tests
export const BREAK_PEACE_PENALTY = -50;
export const BREAK_NAP_PENALTY = -30;
export const BREAK_ALLIANCE_PENALTY = -100;
export const BREAK_DEFAULT_PENALTY = -20;

/** Severe penalty for breaking a defensive pact early (before duration expires). */
export const BREAK_DEFENSIVE_PACT_EARLY_PENALTY = -50;

/** Fixed duration in turns for defensive pacts (cannot be broken early without severe penalty). */
export const DEFENSIVE_PACT_FIXED_DURATION = 30;

/** Maintenance cost reduction per alliance tier (percentage). */
export const TREATY_MAINTENANCE_BONUSES: Partial<Record<TreatyType, number>> = {
  trade: 5,               // -5% maintenance with trade partner
  military_alliance: 15,  // -15% maintenance with ally
  defensive_pact: 10,     // -10% maintenance with defensive pact
};

/**
 * Per-turn relationship maintenance bonuses from active treaties.
 * design/diplomacy/relationship-formulas.md §3.1
 *
 * Formula: TreatyBonus_PerTurn = TreatyBaseBonus / 100
 * These are fractionally accumulated each turn.
 */
export const TREATY_RELATION_MAINTENANCE: Partial<Record<TreatyType, number>> = {
  trade:             0.20,  // +0.20/turn, +2.0/year
  research:          0.15,  // +0.15/turn, +1.5/year
  non_aggression:    0.10,  // +0.10/turn, +1.0/year
  defensive_pact:    0.20,  // +0.20/turn, +2.0/year
  military_alliance: 0.30,  // +0.30/turn, +3.0/year
};

/** Maximum treaty maintenance bonus per turn from all treaties combined. */
export const TREATY_MAINTENANCE_CAP = 10;

/**
 * Treaty duration bonus formula: floor(TurnsActive / 25) × 5
 * design/diplomacy/relationship-formulas.md §3.3
 */
export const TREATY_DURATION_BONUS_INTERVAL = 25;
export const TREATY_DURATION_BONUS_INCREMENT = 5;
export const TREATY_DURATION_BONUS_MAX = 20;

// ── Default treaty terms by type ─────────────────────────────────────────────

const TREATY_DEFAULTS: Record<TreatyType, Partial<TreatyTerms>> = {
  peace:             { breakPenalty: 50 },
  non_aggression:    { nonAggressionDuration: 20, breakPenalty: 30 },
  trade:             { breakPenalty: 20 },
  research:          { researchBonus: 10, breakPenalty: 20 },
  military_alliance: { mustJoinWars: true, sharedIntelligence: true, breakPenalty: 100 },
  defensive_pact:    { mustDefend: true, sharedIntelligence: true, breakPenalty: 50, nonAggressionDuration: DEFENSIVE_PACT_FIXED_DURATION },
};

// ── ID generator ─────────────────────────────────────────────────────────────

let _treatyCounter = 0;

/** Generate a stable, deterministic-ish treaty id. */
function makeTreatyId(
  type: TreatyType,
  empireA: EmpireId,
  empireB: EmpireId,
  turn: number,
): string {
  return `treaty-${type}-${empireA}-${empireB}-t${turn}-${++_treatyCounter}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return the ordered canonical pair (smaller id first). */
function canonicalPair(a: EmpireId, b: EmpireId): [EmpireId, EmpireId] {
  return a < b ? [a, b] : [b, a];
}

/**
 * Deep-clone one `DiplomaticRelations` object.
 * Only copies the arrays/objects we mutate; primitives are copied by spread.
 */
function cloneRelation(rel: DiplomaticRelations): DiplomaticRelations {
  return {
    ...rel,
    treaties: [...rel.treaties],
    events: [...rel.events],
    modifiers: [...rel.modifiers],
    incomingProposals: [...rel.incomingProposals],
  };
}

/**
 * Return the `DiplomaticRelations` between empireA and empireB.
 * Returns `undefined` if either empire or the relation doesn't exist.
 */
function getRelation(
  state: GameState,
  empireAId: EmpireId,
  empireBId: EmpireId,
): DiplomaticRelations | undefined {
  return state.empires.byId[empireAId]?.relations[empireBId];
}

/**
 * Immutably update a bilateral relation (both A→B and B→A) in state.
 *
 * `updater` receives the current relation (from empireA's perspective) and
 * returns the new relation. The inverse relation (B→A) is updated symmetrically
 * so treaties are always consistent from both sides.
 */
function updateBilateral(
  state: GameState,
  empireAId: EmpireId,
  empireBId: EmpireId,
  updater: (rel: DiplomaticRelations) => DiplomaticRelations,
): GameState {
  const empireA = state.empires.byId[empireAId];
  const empireB = state.empires.byId[empireBId];
  if (!empireA || !empireB) return state;

  const relAB = empireA.relations[empireBId];
  const relBA = empireB.relations[empireAId];
  if (!relAB || !relBA) return state;

  const newRelAB = updater(cloneRelation(relAB));
  // Mirror: swap empireA/B perspective but keep same treaty list
  const newRelBA: DiplomaticRelations = {
    ...cloneRelation(relBA),
    treaties: newRelAB.treaties.map(t => t),
    modifiers: relBA.modifiers,
  };

  return {
    ...state,
    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        [empireAId]: {
          ...empireA,
          relations: { ...empireA.relations, [empireBId]: newRelAB },
        },
        [empireBId]: {
          ...empireB,
          relations: { ...empireB.relations, [empireAId]: newRelBA },
        },
      },
    },
  };
}

/**
 * Apply a one-time relation value change to one empire's view of another.
 * Does not add a persistent modifier; adjusts `value` directly and recalculates
 * the diplomatic state.
 */
function nudgeRelation(
  state: GameState,
  empireAId: EmpireId,
  empireBId: EmpireId,
  delta: number,
): GameState {
  const empireA = state.empires.byId[empireAId];
  if (!empireA) return state;
  const rel = empireA.relations[empireBId];
  if (!rel) return state;

  const newValue = Math.max(-100, Math.min(100, rel.value + delta));
  const newState = getDiplomaticStateFromValue(newValue);

  return {
    ...state,
    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        [empireAId]: {
          ...empireA,
          relations: {
            ...empireA.relations,
            [empireBId]: { ...rel, value: newValue, state: newState },
          },
        },
      },
    },
  };
}

/** Recompute the DiplomaticState label from a numeric value. */
/**
 * Recompute the DiplomaticState label from a numeric value.
 *
 * Per design/diplomacy/relationship-formulas.md §1:
 *   War:        -100 to -50 (value ≤ -50)
 *   Unfriendly: -49 to -1
 *   Neutral:    0 to +49
 *   Friendly:   +50 to +79
 *   Allied:     +80 to +100
 */
function getDiplomaticStateFromValue(
  value: number,
): import('../state').DiplomaticState {
  if (value <= -50) return 'war';      // -100 to -50
  if (value < 0)    return 'unfriendly'; // -49 to -1
  if (value < 50)   return 'neutral';    // 0 to 49
  if (value < 80)   return 'friendly';   // 50 to 79
  return 'allied';                       // 80 to 100
}

/**
 * Compute the trade income ramp multiplier.
 *
 * Uses the linear ramp from design/diplomacy/treaties.md:
 *   TradeIncome = BaseTradeIncome × (TradeTurnProgress / TRADE_RAMP_TURNS)
 *
 *   - Turn 1  → ~3.3 %
 *   - Turn 10 → ~33 %
 *   - Turn 30 → 100 %
 */
export function tradeRampMultiplier(turnsActive: number): number {
  if (turnsActive <= 0) return 0;
  const capped = Math.min(turnsActive, TRADE_RAMP_TURNS);
  return capped / TRADE_RAMP_TURNS;
}

/**
 * Compute actual trade income for one empire in a trade agreement.
 *
 * Applies the ramp-up multiplier and, if the benefiting empire is a Hamster,
 * the 25 % racial bonus.
 */
export function computeTradeIncome(
  baseIncome: number,
  turnsActive: number,
  receivingEmpire: Empire,
): number {
  const ramp = tradeRampMultiplier(turnsActive);
  const income = baseIncome * ramp;
  if (receivingEmpire.raceId === HAMSTER_RACE_ID) {
    return income * HAMSTER_TRADE_BONUS;
  }
  return income;
}

/** Base trade income offset when a trade agreement exists. */
export const TRADE_BASE_OFFSET = 5;

/**
 * Compute the base trade income for an agreement between two empires.
 * Formula: TRADE_BASE_OFFSET + (creditPerTurn_A + creditPerTurn_B) / 20
 * 
 * The +5 offset represents the baseline benefit of establishing trade
 * relations, even between small economies.
 */
export function computeBaseTradeIncome(empireA: Empire, empireB: Empire): number {
  return TRADE_BASE_OFFSET + (empireA.creditPerTurn + empireB.creditPerTurn) / 20;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Propose a treaty.
 *
 * Adds a *pending* (isActive=false) treaty to the relation between proposer
 * and target. The other empire must call `acceptTreaty` to activate it.
 *
 * - If an active treaty of the same type already exists, returns state unchanged.
 * - If an existing pending proposal for the same type exists, it is replaced.
 */
export function proposeTreaty(
  state: GameState,
  proposerId: EmpireId,
  targetId: EmpireId,
  type: TreatyType,
): GameState {
  if (!state.empires.byId[proposerId] || !state.empires.byId[targetId]) return state;
  if (proposerId === targetId) return state;

  const [idA, idB] = canonicalPair(proposerId, targetId);

  // Reject if already active
  if (hasTreaty(state, idA, idB, type)) return state;

  const empireA = state.empires.byId[idA];
  const empireB = state.empires.byId[idB];
  const baseIncome =
    type === 'trade' ? computeBaseTradeIncome(empireA, empireB) : undefined;

  const treaty: Treaty = {
    id: makeTreatyId(type, proposerId, targetId, state.turn),
    type,
    signedTurn: state.turn,
    duration: TREATY_DEFAULTS[type].nonAggressionDuration ?? null,
    terms: {
      ...TREATY_DEFAULTS[type],
      ...(baseIncome !== undefined ? { tradeIncome: baseIncome } : {}),
    },
    isActive: false,
    canBreak: false,
    tradeRampTurns: type === 'trade' ? 0 : undefined,
  };

  return updateBilateral(state, idA, idB, rel => {
    // Remove any existing pending proposal of the same type
    const filtered = rel.treaties.filter(
      t => !(t.type === type && !t.isActive),
    );
    const updated = { ...rel, treaties: [...filtered, treaty] };

    // If the target is the player and the proposer is not (AI → player),
    // also record the proposal in incomingProposals so the UI can render it.
    if (proposerId !== targetId) {
      const proposer = state.empires.byId[proposerId];
      const target = state.empires.byId[targetId];
      if (target?.isPlayer && proposer) {
        // Check if this empire already has a pending proposal of this type from
        // the same empire to avoid duplicates
        const alreadyExists = updated.incomingProposals.some(
          p => p.type === type && p.fromEmpireId === proposerId,
        );
        if (!alreadyExists) {
          updated.incomingProposals = [
            ...updated.incomingProposals,
            { type, fromEmpireId: proposerId, proposedTurn: state.turn },
          ];
        }
      }
    }

    return updated;
  });
}

/**
 * Accept a pending treaty proposal.
 *
 * Marks the matching pending treaty as active, sets `canBreak` based on any
 * minimum duration, and applies the relation bonus from the design doc.
 */
export function acceptTreaty(
  state: GameState,
  empireAId: EmpireId,
  empireBId: EmpireId,
  type: TreatyType,
): GameState {
  const [idA, idB] = canonicalPair(empireAId, empireBId);
  const rel = getRelation(state, idA, idB);
  if (!rel) return state;

  const pending = rel.treaties.find(t => t.type === type && !t.isActive);
  if (!pending) return state;

  const minDuration = TREATY_DEFAULTS[type].nonAggressionDuration;
  const activeTreaty: Treaty = {
    ...pending,
    signedTurn: state.turn,
    isActive: true,
    // canBreak becomes true once the minimum duration has elapsed
    canBreak: minDuration === undefined,
    tradeRampTurns: type === 'trade' ? 0 : undefined,
  };

  let next = updateBilateral(state, idA, idB, rel => ({
    ...rel,
    treaties: [
      ...rel.treaties.filter(t => !(t.type === type && !t.isActive)),
      activeTreaty,
    ],
  }));

  // Apply relation bonus
  const relationBonus = RELATION_BONUS_FOR_TYPE[type];
  if (relationBonus) {
    next = nudgeRelation(next, idA, idB, relationBonus);
    next = nudgeRelation(next, idB, idA, relationBonus);
  }

  // Clear the proposal from incomingProposals (for both sides, in case both proposed)
  for (const accepterId of [empireAId, empireBId]) {
    const otherId = accepterId === empireAId ? empireBId : empireAId;
    const accepter = next.empires.byId[accepterId];
    if (accepter?.relations[otherId]?.incomingProposals?.length) {
      const updated = { ...accepter.relations[otherId] };
      updated.incomingProposals = updated.incomingProposals.filter(
        p => !(p.fromEmpireId === otherId && p.type === type)
      );
      next = {
        ...next,
        empires: {
          ...next.empires,
          byId: {
            ...next.empires.byId,
            [accepterId]: {
              ...accepter,
              relations: {
                ...accepter.relations,
                [otherId]: updated,
              },
            },
          },
        },
      };
    }
  }

  return next;
}

/**
 * Reject an incoming treaty proposal.
 *
 * Removes the proposal from the target's incomingProposals array and
 * removes the pending (inactive) treaty from the relations.
 */
export function rejectProposal(
  state: GameState,
  rejecterId: EmpireId,
  proposerId: EmpireId,
  type: TreatyType,
): GameState {
  const [idA, idB] = canonicalPair(rejecterId, proposerId);
  const rel = getRelation(state, idA, idB);
  if (!rel) return state;

  // Remove from incomingProposals
  const rejecter = state.empires.byId[rejecterId];
  if (rejecter?.relations[proposerId]) {
    const updated = { ...rejecter.relations[proposerId] };
    updated.incomingProposals = updated.incomingProposals.filter(
      p => !(p.fromEmpireId === proposerId && p.type === type)
    );
    state = {
      ...state,
      empires: {
        ...state.empires,
        byId: {
          ...state.empires.byId,
          [rejecterId]: {
            ...rejecter,
            relations: {
              ...rejecter.relations,
              [proposerId]: updated,
            },
          },
        },
      },
    };
  }

  // Remove pending treaty from bilateral relations
  return updateBilateral(state, idA, idB, r => ({
    ...r,
    treaties: r.treaties.filter(t => !(t.type === type && !t.isActive)),
  }));
}

/**
 * Break/cancel an active treaty.
 *
 * Removes the treaty and applies relation penalties per the design doc:
 * - Target empire receives full penalty
 * - All other empires receive reduced penalty
 *
 * design/diplomacy/relationship-formulas.md §3.2
 */
export function breakTreaty(
  state: GameState,
  breakerId: EmpireId,
  otherId: EmpireId,
  type: TreatyType,
): GameState {
  const [idA, idB] = canonicalPair(breakerId, otherId);
  const rel = getRelation(state, idA, idB);
  if (!rel) return state;

  const treaty = rel.treaties.find(t => t.type === type && t.isActive);
  if (!treaty) return state;

  // Remove the treaty from both sides
  let next = updateBilateral(state, idA, idB, rel => ({
    ...rel,
    treaties: rel.treaties.filter(t => !(t.type === type && t.isActive)),
  }));

  // Get penalties from design doc - different for target vs all other races
  const penalties = BREAK_PENALTIES[type];
  let targetPenalty = penalties.target;
  let allPenalty = penalties.all;

  // Defensive pacts have severe early-break penalty
  if (type === 'defensive_pact') {
    const turnsActive = state.turn - treaty.signedTurn;
    if (turnsActive < DEFENSIVE_PACT_FIXED_DURATION) {
      // Early break: use severe penalty instead of normal penalty
      targetPenalty = BREAK_DEFENSIVE_PACT_EARLY_PENALTY;
    }
  }

  // Apply penalties: target gets targetPenalty, all others get allPenalty
  for (const empireId of next.empires.allIds) {
    if (empireId === breakerId) continue;

    // Determine which penalty to apply
    const penalty = (empireId === otherId) ? targetPenalty : allPenalty;

    // Apply penalty bidirectionally (breaker's rep with this empire drops)
    next = nudgeRelation(next, breakerId, empireId, penalty);
    next = nudgeRelation(next, empireId, breakerId, penalty);
  }

  return next;
}

/**
 * Calculate the treaty duration bonus for a treaty.
 * Formula: floor(TurnsActive / 25) × 5, max +20
 * design/diplomacy/relationship-formulas.md §3.3
 */
export function calculateTreatyDurationBonus(turnsActive: number): number {
  const bonus = Math.floor(turnsActive / TREATY_DURATION_BONUS_INTERVAL) * TREATY_DURATION_BONUS_INCREMENT;
  return Math.min(bonus, TREATY_DURATION_BONUS_MAX);
}

/**
 * Apply treaty effects for the current turn.
 *
 * For each active treaty between empires:
 *  - Apply per-turn relation maintenance bonus (capped at +10 total)
 *  - Apply treaty duration bonus for long-held treaties
 *  - Trade: Advance the ramp counter and credit both empires.
 *  - Research: Research bonus is handled by the research system; no-op here.
 *  - Timed treaties (NAP, research): Expire after their duration.
 *  - canBreak: Set to true once the minimum lock-in period has passed.
 *
 * design/diplomacy/relationship-formulas.md §3.1, §3.3
 */
export function processTreatyEffects(state: GameState): GameState {
  let next = state;

  // Track which bilateral pairs we've already processed (canonical order)
  const processed = new Set<string>();

  for (const empireId of state.empires.allIds) {
    const empire = state.empires.byId[empireId];
    for (const otherId of Object.keys(empire.relations)) {
      const [idA, idB] = canonicalPair(empireId, otherId);
      const key = `${idA}:${idB}`;
      if (processed.has(key)) continue;
      processed.add(key);

      const rel = getRelation(next, idA, idB);
      if (!rel) continue;

      const empireANow = next.empires.byId[idA];
      const empireBNow = next.empires.byId[idB];
      if (!empireANow || !empireBNow) continue;

      let updatedTreaties: Treaty[] = [];
      let creditDeltaA = 0;
      let creditDeltaB = 0;
      let relationMaintenanceBonus = 0;  // Accumulated per-turn bonus for this pair

      for (const treaty of rel.treaties) {
        if (!treaty.isActive) {
          updatedTreaties.push(treaty);
          continue;
        }

        const turnsActive = next.turn - treaty.signedTurn;

        // Expire timed treaties
        if (
          treaty.duration !== null &&
          turnsActive >= treaty.duration
        ) {
          // Treaty expires — skip (don't push it)
          continue;
        }

        // Update canBreak once minimum duration elapses
        const minDuration = TREATY_DEFAULTS[treaty.type].nonAggressionDuration;
        const canBreakNow =
          minDuration === undefined || turnsActive >= minDuration;

        let updatedTreaty: Treaty = { ...treaty, canBreak: canBreakNow };

        // Accumulate per-turn maintenance bonus for this treaty type
        const maintenanceRate = TREATY_RELATION_MAINTENANCE[treaty.type] ?? 0;
        relationMaintenanceBonus += maintenanceRate;

        // Trade: advance ramp counter and compute income
        if (treaty.type === 'trade' && treaty.terms.tradeIncome !== undefined) {
          const prevRamp = treaty.tradeRampTurns ?? 0;
          const newRamp = prevRamp + 1;
          updatedTreaty = { ...updatedTreaty, tradeRampTurns: newRamp };

          creditDeltaA += computeTradeIncome(
            treaty.terms.tradeIncome,
            newRamp,
            empireANow,
          );
          creditDeltaB += computeTradeIncome(
            treaty.terms.tradeIncome,
            newRamp,
            empireBNow,
          );
        }

        updatedTreaties.push(updatedTreaty);
      }

      // Write updated treaties back bilaterally
      next = updateBilateral(next, idA, idB, rel => ({
        ...rel,
        treaties: updatedTreaties,
      }));

      // Apply per-turn relation maintenance bonus (capped at TREATY_MAINTENANCE_CAP)
      // This is fractionally accumulated - we floor to get integer relation change
      const cappedBonus = Math.min(relationMaintenanceBonus, TREATY_MAINTENANCE_CAP);
      if (cappedBonus >= 1) {
        const intBonus = Math.floor(cappedBonus);
        next = nudgeRelation(next, idA, idB, intBonus);
        next = nudgeRelation(next, idB, idA, intBonus);
      }

      // Credit empires if trade income accrued
      if (creditDeltaA !== 0 || creditDeltaB !== 0) {
        const a = next.empires.byId[idA];
        const b = next.empires.byId[idB];
        next = {
          ...next,
          empires: {
            ...next.empires,
            byId: {
              ...next.empires.byId,
              [idA]: { ...a, credits: a.credits + Math.round(creditDeltaA) },
              [idB]: { ...b, credits: b.credits + Math.round(creditDeltaB) },
            },
          },
        };
      }
    }
  }

  return next;
}

/**
 * Check whether two empires have an active treaty of the given type.
 */
export function hasTreaty(
  state: GameState,
  empireA: EmpireId,
  empireB: EmpireId,
  type: TreatyType,
): boolean {
  const [idA, idB] = canonicalPair(empireA, empireB);
  const rel = getRelation(state, idA, idB);
  if (!rel) return false;
  return rel.treaties.some(t => t.type === type && t.isActive);
}

// ── Relation bonus per treaty type (from design doc) ─────────────────────────

const RELATION_BONUS_FOR_TYPE: Partial<Record<TreatyType, number>> = {
  non_aggression:    10,
  trade:             20,
  research:          15,
  military_alliance: 50,
  defensive_pact:    30,
  // peace treaty: no relation bonus — it just ends the war state
};

// Note: BREAK_PENALTY_FOR_TYPE is deprecated.
// Use BREAK_PENALTIES which has separate target/all penalties per design doc §3.2.

/**
 * Calculate the total maintenance bonus percentage for an empire based on active treaties.
 * Returns a percentage reduction (e.g., 20 means -20% maintenance).
 */
export function calculateTreatyMaintenanceBonus(
  state: GameState,
  empireId: EmpireId,
): number {
  const empire = state.empires.byId[empireId];
  if (!empire) return 0;

  let totalBonus = 0;

  for (const otherId of Object.keys(empire.relations)) {
    if (otherId === empireId) continue;

    const rel = empire.relations[otherId];
    if (!rel) continue;

    for (const treaty of rel.treaties) {
      if (!treaty.isActive) continue;

      const bonus = TREATY_MAINTENANCE_BONUSES[treaty.type];
      if (bonus) {
        totalBonus += bonus;
      }
    }
  }

  // Cap at 50% maximum reduction
  return Math.min(totalBonus, 50);
}

/**
 * Check if breaking a defensive pact would incur the early-break penalty.
 * Returns true if the pact hasn't reached its minimum duration yet.
 */
export function isDefensivePactEarlyBreak(
  state: GameState,
  empireAId: EmpireId,
  empireBId: EmpireId,
): boolean {
  const rel = getRelation(state, empireAId, empireBId);
  if (!rel) return false;

  const pact = rel.treaties.find(t => t.type === 'defensive_pact' && t.isActive);
  if (!pact) return false;

  const turnsActive = state.turn - pact.signedTurn;
  return turnsActive < DEFENSIVE_PACT_FIXED_DURATION;
}
