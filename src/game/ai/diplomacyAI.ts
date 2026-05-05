/**
 * AI diplomatic decision-making — pure TypeScript, NO DOM.
 * src/game/ai/diplomacyAI.ts
 *
 * Determines what diplomatic actions an AI empire should take each turn.
 * Decisions are driven by relation values, personality profiles, treaties
 * in effect, and relative fleet strength.
 *
 * All functions are pure and return new state without mutation.
 *
 * References:
 *   design/diplomacy/ai-personalities.md  — race behavior guidance
 *   src/game/systems/diplomacy.ts         — relation constants & helpers
 *   src/game/ai/ai-personalities.ts       — AIPersonalityProfile
 *   src/game/state.ts                     — GameState, EmpireId, AIEmpire
 */

import { GameState, EmpireId, AIEmpire, DiplomaticRelations, Treaty } from '../state';
import {
  RELATION_MIN,
  STATE_WAR_THRESHOLD,
  STATE_FRIENDLY_THRESHOLD,
  STATE_ALLIED_THRESHOLD,
  getRelationValue,
} from '../systems/diplomacy';
import { getEmpireFleetPower } from './strategies';
import { getPersonalityProfile } from './ai-personalities';

// ── Public types ───────────────────────────────────────────────────────────────

export interface DiplomaticDecision {
  action: 'propose_treaty' | 'break_treaty' | 'declare_war' | 'maintain_relations' | 'trade_deal';
  targetId: EmpireId;
  reasoning: string;
  priority: number; // 1-10
}

// ── Internal helpers ───────────────────────────────────────────────────────────

/**
 * Get the DiplomaticRelations record between two empires, or undefined.
 */
function getRelation(
  state: GameState,
  empireId: EmpireId,
  targetId: EmpireId,
): DiplomaticRelations | undefined {
  return state.empires.byId[empireId]?.relations[targetId];
}

/**
 * Return all active treaties between two empires.
 */
function getActiveTreaties(
  state: GameState,
  empireId: EmpireId,
  targetId: EmpireId,
): Treaty[] {
  const relation = getRelation(state, empireId, targetId);
  if (!relation) return [];
  return relation.treaties.filter((t) => t.isActive);
}

/**
 * Check whether the AI already has a specific treaty type with a target.
 */
function hasTreatyOfType(
  state: GameState,
  empireId: EmpireId,
  targetId: EmpireId,
  type: Treaty['type'],
): boolean {
  return getActiveTreaties(state, empireId, targetId).some((t) => t.type === type);
}

/**
 * Return the strength ratio: myFleetPower / theirFleetPower.
 * Returns Infinity when the opponent has 0 fleet power.
 *
 * Uses fleet power calculation per design/technical/ai-implementation.md §1.3
 * instead of simple ship counts.
 */
function fleetStrengthRatio(
  state: GameState,
  empireId: EmpireId,
  targetId: EmpireId,
): number {
  const mine = getEmpireFleetPower(empireId, state);
  const theirs = getEmpireFleetPower(targetId, state);
  if (theirs === 0) return mine === 0 ? 1 : Infinity;
  return mine / theirs;
}

// ── Core decision functions ────────────────────────────────────────────────────

/**
 * Evaluate whether the AI should propose a peace/trade/research treaty with
 * a target empire.
 *
 * Conditions:
 *   - Not already at war
 *   - Relation value ≥ 0 (at least neutral)
 *   - Does not already have that treaty type
 *   - Personality diplomacy score drives willingness (higher = more eager)
 *
 * Returns null when no proposal is warranted.
 */
export function aiDecideTreaty(
  state: GameState,
  empireId: EmpireId,
  targetId: EmpireId,
): DiplomaticDecision | null {
  const empire = state.empires.byId[empireId];
  if (!empire) return null;
  if (empire.isDefeated) return null;

  const relation = getRelation(state, empireId, targetId);
  if (!relation) return null;
  if (relation.state === 'war') return null;

  const relValue = relation.value;

  // Personality-driven diplomacy willingness
  const aiEmpire: AIEmpire | undefined = state.aiEmpires[empireId];
  const profile = getPersonalityProfile(empire.raceId);
  const diplomacyScore = aiEmpire?.personality.diplomacy ?? profile.diplomacy;
  const treatyBonus = profile.treatyBonus;

  // Determine treaty type to propose based on relation depth
  // Friendly → propose trade; Allied → propose research pact
  let targetType: Treaty['type'] | null = null;
  let basePriority = 0;

  if (relValue > STATE_ALLIED_THRESHOLD && !hasTreatyOfType(state, empireId, targetId, 'research')) {
    targetType = 'research';
    basePriority = 7;
  } else if (relValue > STATE_FRIENDLY_THRESHOLD && !hasTreatyOfType(state, empireId, targetId, 'trade')) {
    targetType = 'trade';
    basePriority = 6;
  } else if (relValue >= 0 && !hasTreatyOfType(state, empireId, targetId, 'non_aggression')) {
    targetType = 'non_aggression';
    basePriority = 4;
  }

  if (!targetType) return null;

  // Personality gate: backstabbers and low-diplomacy AIs are reluctant
  const diplomaticThreshold = 30 - treatyBonus;
  if (diplomacyScore < diplomaticThreshold) return null;

  // Priority boosted by diplomacy score
  const priority = Math.min(10, basePriority + Math.round(diplomacyScore / 20));

  return {
    action: 'propose_treaty',
    targetId,
    reasoning: `Relation ${relValue} with ${targetId} warrants ${targetType} treaty (diplomacy score: ${diplomacyScore})`,
    priority,
  };
}

/**
 * Evaluate whether the AI should break an existing treaty.
 *
 * Conditions:
 *   - Active treaty exists
 *   - Relation has deteriorated below the unfriendly threshold OR
 *     the AI has a high backstab tendency AND a military advantage
 *   - Honorable AIs never break treaties (backstabTendency = 0 + 'honorable' trait)
 *
 * Returns null when no break is warranted.
 */
export function aiDecideBreakTreaty(
  state: GameState,
  empireId: EmpireId,
  targetId: EmpireId,
): DiplomaticDecision | null {
  const empire = state.empires.byId[empireId];
  if (!empire) return null;
  if (empire.isDefeated) return null;

  const activeTreaties = getActiveTreaties(state, empireId, targetId);
  if (activeTreaties.length === 0) return null;

  const profile = getPersonalityProfile(empire.raceId);

  // Honorable races never break treaties
  if (profile.traits.includes('honorable')) return null;

  const relValue = getRelationValue(state, empireId, targetId);
  const ratio = fleetStrengthRatio(state, empireId, targetId);

  // Break if relation has fallen below unfriendly and treaty can be broken
  const breakableExists = activeTreaties.some((t) => t.canBreak);
  if (!breakableExists) return null;

  const relBelowUnfriendly = relValue < STATE_WAR_THRESHOLD / 2; // < -25
  const backstabOpportunity = profile.backstabTendency > 40 && ratio > 1.5;

  if (!relBelowUnfriendly && !backstabOpportunity) return null;

  const priority = backstabOpportunity
    ? Math.min(10, 5 + Math.round(profile.backstabTendency / 20))
    : 4;

  const reason = backstabOpportunity
    ? `Opportunistic treaty break: fleet advantage ${ratio.toFixed(1)}x, backstab tendency ${profile.backstabTendency}`
    : `Relations deteriorated to ${relValue}, breaking treaty`;

  return {
    action: 'break_treaty',
    targetId,
    reasoning: reason,
    priority,
  };
}

/**
 * Evaluate whether the AI should declare war on a target empire.
 *
 * Conditions:
 *   - Not already at war
 *   - Aggression and war reluctance scores pass threshold
 *   - Fleet strength ratio is favorable
 *   - Relation is deeply unfriendly
 *
 * Peaceful / defensive personalities (low aggression, high warReluctance)
 * will not declare war unless they are already at the war threshold.
 *
 * Returns null when war is not warranted.
 */
export function aiDecideDeclareWar(
  state: GameState,
  empireId: EmpireId,
  targetId: EmpireId,
): DiplomaticDecision | null {
  const empire = state.empires.byId[empireId];
  if (!empire) return null;
  if (empire.isDefeated) return null;

  const relation = getRelation(state, empireId, targetId);
  if (!relation) return null;
  if (relation.state === 'war') return null; // already at war

  const profile = getPersonalityProfile(empire.raceId);
  const aiEmpire: AIEmpire | undefined = state.aiEmpires[empireId];
  const aggression = aiEmpire?.personality.aggression ?? profile.aggression;

  // Peaceful races never start wars
  if (profile.traits.includes('peaceful')) return null;
  if (profile.traits.includes('honorable') && relation.state !== 'unfriendly') return null;

  const relValue = relation.value;
  const ratio = fleetStrengthRatio(state, empireId, targetId);
  const warReluctance = profile.warReluctance;

  // Must have a meaningful fleet advantage to risk war (adjusted by war reluctance)
  const requiredRatio = 1.0 + (warReluctance / 100); // 0 reluctance → 1.0x, 40 reluctance → 1.4x
  if (ratio < requiredRatio) return null;

  // Aggression threshold: more aggressive races tolerate neutral relations for war
  const aggressionThreshold = 60;
  const relationThreshold = aggression >= aggressionThreshold
    ? STATE_WAR_THRESHOLD * 0.5    // aggressive: -25
    : STATE_WAR_THRESHOLD;         // normal: -50

  if (relValue > relationThreshold) return null;

  // Priority: worse relations + stronger fleet → higher priority
  const relFactor = Math.round(Math.abs(relValue - RELATION_MIN) / 20);
  const ratioBonus = Math.min(3, Math.floor(ratio - requiredRatio));
  const priority = Math.min(10, 4 + relFactor + ratioBonus);

  return {
    action: 'declare_war',
    targetId,
    reasoning: `Declaring war on ${targetId}: relation ${relValue}, fleet ratio ${ratio.toFixed(1)}x, aggression ${aggression}`,
    priority,
  };
}

/**
 * Evaluate all diplomatic options for an AI empire across every other empire.
 *
 * Returns a list of decisions sorted by priority descending.
 * An empire may have decisions toward multiple targets.
 */
export function evaluateDiplomaticOptions(
  state: GameState,
  empireId: EmpireId,
  aiState: AIEmpire,
): DiplomaticDecision[] {
  const empire = state.empires.byId[empireId];
  if (!empire || empire.isDefeated) return [];

  const decisions: DiplomaticDecision[] = [];

  for (const targetId of state.empires.allIds) {
    if (targetId === empireId) continue;

    const target = state.empires.byId[targetId];
    if (!target || target.isDefeated) continue;

    // War declaration (highest potential disruption — check first)
    const warDecision = aiDecideDeclareWar(state, empireId, targetId);
    if (warDecision) decisions.push(warDecision);

    // Treaty break (must happen before proposing replacement)
    const breakDecision = aiDecideBreakTreaty(state, empireId, targetId);
    if (breakDecision) decisions.push(breakDecision);

    // Treaty proposal
    const treatyDecision = aiDecideTreaty(state, empireId, targetId);
    if (treatyDecision) decisions.push(treatyDecision);

    // Trade deal (high-diplomacy empires seek trade when friendly)
    const dipScore = aiState.personality.diplomacy;
    const relValue = getRelationValue(state, empireId, targetId);

    if (
      dipScore >= 40 &&
      relValue > STATE_FRIENDLY_THRESHOLD &&
      !hasTreatyOfType(state, empireId, targetId, 'trade')
    ) {
      decisions.push({
        action: 'trade_deal',
        targetId,
        reasoning: `Friendly relations (${relValue}) and high diplomacy (${dipScore}) favor trade deal`,
        priority: Math.min(10, 3 + Math.round(dipScore / 20)),
      });
    }
  }

  // Sort by priority descending
  decisions.sort((a, b) => b.priority - a.priority);

  return decisions;
}

/**
 * Apply AI diplomatic decisions to the game state for all AI empires.
 *
 * For each AI empire, evaluates diplomatic options and applies the
 * highest-priority non-conflicting decision per target pair.
 *
 * Side effects applied to state:
 *   - War declarations: set relation state to 'war'
 *   - Treaty proposals: add a pending treaty (type non_aggression/trade/research)
 *   - Treaty breaks: deactivate the treaty
 *
 * Returns the updated GameState.
 */
export function applyAIDiplomaticDecisions(state: GameState): GameState {
  let next = state;

  for (const empireId of state.empires.allIds) {
    const empire = state.empires.byId[empireId];
    if (!empire || empire.isPlayer || empire.isDefeated) continue;

    const aiState = state.aiEmpires[empireId];
    if (!aiState) continue;

    const decisions = evaluateDiplomaticOptions(next, empireId, aiState);

    // Track which targets we've already acted on this turn (one action per pair)
    const actedOn = new Set<EmpireId>();

    for (const decision of decisions) {
      if (actedOn.has(decision.targetId)) continue;
      actedOn.add(decision.targetId);

      switch (decision.action) {
        case 'declare_war':
          next = applyDeclareWar(next, empireId, decision.targetId);
          break;
        case 'break_treaty':
          next = applyBreakTreaty(next, empireId, decision.targetId);
          break;
        case 'propose_treaty':
          next = applyProposeTreaty(next, empireId, decision.targetId, 'non_aggression');
          break;
        case 'trade_deal':
          next = applyProposeTreaty(next, empireId, decision.targetId, 'trade');
          break;
        case 'maintain_relations':
          // No state change needed
          break;
      }
    }
  }

  return next;
}

// ── State mutation helpers (pure) ─────────────────────────────────────────────

function applyDeclareWar(
  state: GameState,
  empireId: EmpireId,
  targetId: EmpireId,
): GameState {
  const empire = state.empires.byId[empireId];
  const target = state.empires.byId[targetId];
  if (!empire || !target) return state;

  const updateRelation = (
    fromId: EmpireId,
    toId: EmpireId,
  ) => {
    const rel = state.empires.byId[fromId]?.relations[toId];
    if (!rel) return state.empires.byId[fromId]?.relations ?? {};
    const updated = {
      ...rel,
      state: 'war' as const,
      value: Math.min(rel.value, STATE_WAR_THRESHOLD - 1),
      warStartTurn: state.turn,
      // Deactivate all non-aggression/peace treaties on war declaration
      treaties: rel.treaties.map((t) =>
        t.type === 'non_aggression' || t.type === 'peace'
          ? { ...t, isActive: false }
          : t,
      ),
    };
    return { ...state.empires.byId[fromId]!.relations, [toId]: updated };
  };

  return {
    ...state,
    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        [empireId]: {
          ...empire,
          relations: updateRelation(empireId, targetId),
        },
        [targetId]: {
          ...target,
          relations: updateRelation(targetId, empireId),
        },
      },
    },
  };
}

function applyBreakTreaty(
  state: GameState,
  empireId: EmpireId,
  targetId: EmpireId,
): GameState {
  const empire = state.empires.byId[empireId];
  if (!empire) return state;

  const rel = empire.relations[targetId];
  if (!rel) return state;

  // Deactivate the first breakable treaty
  let broke = false;
  const updatedTreaties = rel.treaties.map((t) => {
    if (!broke && t.isActive && t.canBreak) {
      broke = true;
      return { ...t, isActive: false };
    }
    return t;
  });

  if (!broke) return state;

  return {
    ...state,
    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        [empireId]: {
          ...empire,
          relations: {
            ...empire.relations,
            [targetId]: { ...rel, treaties: updatedTreaties },
          },
        },
      },
    },
  };
}

function applyProposeTreaty(
  state: GameState,
  empireId: EmpireId,
  targetId: EmpireId,
  type: Treaty['type'],
): GameState {
  const empire = state.empires.byId[empireId];
  if (!empire) return state;

  const rel = empire.relations[targetId];
  if (!rel) return state;

  // Don't duplicate treaty types
  if (rel.treaties.some((t) => t.isActive && t.type === type)) return state;

  const newTreaty: Treaty = {
    id: `treaty-${empireId}-${targetId}-${type}-${state.turn}`,
    type,
    signedTurn: state.turn,
    duration: null,
    terms: {},
    isActive: true,
    canBreak: type !== 'peace',
  };

  const target = state.empires.byId[targetId];
  const targetRel = target?.relations[empireId];

  // When the target is the player (or any empire), populate their incomingProposals
  // so the DiplomacyScreen can display Accept/Reject buttons.
  const updatedById: Record<EmpireId, typeof empire> = {
    ...state.empires.byId,
    [empireId]: {
      ...empire,
      relations: {
        ...empire.relations,
        [targetId]: {
          ...rel,
          treaties: [...rel.treaties, newTreaty],
        },
      },
    },
  };

  if (target && targetRel) {
    updatedById[targetId] = {
      ...target,
      relations: {
        ...target.relations,
        [empireId]: {
          ...targetRel,
          incomingProposals: [
            ...(targetRel.incomingProposals ?? []),
            { type: type, fromEmpireId: empireId, proposedTurn: state.turn },
          ],
        },
      },
    };
  }

  return {
    ...state,
    empires: {
      ...state.empires,
      byId: updatedById,
    },
  };
}
