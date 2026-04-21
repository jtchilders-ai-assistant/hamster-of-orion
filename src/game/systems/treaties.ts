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

// ── Relation penalties on break ───────────────────────────────────────────────

/** Relation penalty applied to all empires when a peace treaty is broken. */
export const BREAK_PEACE_PENALTY = -50;

/** Relation penalty applied to all empires when a NAP is broken. */
export const BREAK_NAP_PENALTY = -30;

/** Relation penalty applied to all empires when a military alliance is broken. */
export const BREAK_ALLIANCE_PENALTY = -100;

/** Generic relation penalty for breaking any other treaty type. */
export const BREAK_DEFAULT_PENALTY = -20;

// ── Default treaty terms by type ─────────────────────────────────────────────

const TREATY_DEFAULTS: Record<TreatyType, Partial<TreatyTerms>> = {
  peace:             { breakPenalty: 50 },
  non_aggression:    { nonAggressionDuration: 20, breakPenalty: 30 },
  trade:             { breakPenalty: 20 },
  research:          { researchBonus: 10, breakPenalty: 20 },
  military_alliance: { mustJoinWars: true, sharedIntelligence: true, breakPenalty: 100 },
  defensive_pact:    { mustDefend: true, sharedIntelligence: true, breakPenalty: 50 },
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
function getDiplomaticStateFromValue(
  value: number,
): import('../state').DiplomaticState {
  if (value < -50) return 'war';
  if (value < 0)   return 'unfriendly';
  if (value <= 49) return 'neutral';
  if (value <= 79) return 'friendly';
  return 'allied';
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

/**
 * Compute the base trade income for an agreement between two empires.
 * Formula: (creditPerTurn_A + creditPerTurn_B) / 20
 */
export function computeBaseTradeIncome(empireA: Empire, empireB: Empire): number {
  return (empireA.creditPerTurn + empireB.creditPerTurn) / 20;
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
 * Removes the treaty and applies a relation penalty to all empires in the game
 * (simulating the reputation damage from breaking a treaty).
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

  // Apply penalty to all empire pairs that include the breaker
  const penalty = BREAK_PENALTY_FOR_TYPE[type];
  for (const othEmpireId of next.empires.allIds) {
    if (othEmpireId === breakerId) continue;
    next = nudgeRelation(next, breakerId, othEmpireId, penalty);
    next = nudgeRelation(next, othEmpireId, breakerId, penalty);
  }

  return next;
}

/**
 * Apply treaty effects for the current turn.
 *
 * For each active treaty between empires:
 *  - Trade: Advance the ramp counter and credit both empires.
 *  - Research: Research bonus is handled by the research system; no-op here.
 *  - Timed treaties (NAP, research): Expire after their duration.
 *  - canBreak: Set to true once the minimum lock-in period has passed.
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

const BREAK_PENALTY_FOR_TYPE: Record<TreatyType, number> = {
  peace:             BREAK_PEACE_PENALTY,
  non_aggression:    BREAK_NAP_PENALTY,
  trade:             BREAK_DEFAULT_PENALTY,
  research:          BREAK_DEFAULT_PENALTY,
  military_alliance: BREAK_ALLIANCE_PENALTY,
  defensive_pact:    BREAK_DEFAULT_PENALTY,
};
