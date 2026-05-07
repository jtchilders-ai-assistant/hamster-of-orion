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

import { GameState, EmpireId, AIEmpire, DiplomaticRelations, Treaty, TreatyType } from '../state';
import {
  RELATION_MIN,
  STATE_WAR_THRESHOLD,
  STATE_FRIENDLY_THRESHOLD,
  STATE_ALLIED_THRESHOLD,
  getRelationValue,
} from '../systems/diplomacy';
import { proposeTreaty, acceptTreaty } from '../systems/treaties';
import { getEmpireFleetPower } from './strategies';
import { getPersonalityProfile } from './ai-personalities';

// ── Public types ───────────────────────────────────────────────────────────────

/**
 * Output from the Stance_Score calculation (§5.3).
 * Stance drives which diplomatic actions the AI considers.
 */
export type DiplomaticStance = 'hostile' | 'unfriendly' | 'neutral' | 'cooperative' | 'allied';

export interface DiplomaticDecision {
  action: 'propose_treaty' | 'break_treaty' | 'declare_war' | 'maintain_relations' | 'trade_deal';
  targetId: EmpireId;
  reasoning: string;
  priority: number; // 1-10
  /** Treaty type for propose_treaty actions. */
  treatyType?: Treaty['type'];
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

// ── Stance_Score formula (§5.3–§5.9) ─────────────────────────────────────────────────────────────────

/** Personality stance modifiers (design/technical/ai-implementation.md §5.8) */
const PERSONALITY_STANCE_MODIFIERS: Record<string, {
  baseFriendliness: number;
  warReluctance: number;
  treatyBonus: number;
}> = {
  hamsters:     { baseFriendliness: 20,  warReluctance: 30,  treatyBonus: 15 },
  guinea_pigs:  { baseFriendliness: -20, warReluctance: -30, treatyBonus: -10 },
  chameleons:   { baseFriendliness: 0,   warReluctance: 10,  treatyBonus: 0 },
  budgies:      { baseFriendliness: 0,   warReluctance: 0,   treatyBonus: 5 },
  ferrets:      { baseFriendliness: -10, warReluctance: -15, treatyBonus: -5 },
  rats:         { baseFriendliness: 15,  warReluctance: 25,  treatyBonus: 20 },
  rabbits:      { baseFriendliness: 25,  warReluctance: 40,  treatyBonus: 10 },
  mice:         { baseFriendliness: 10,  warReluctance: 15,  treatyBonus: 15 },
  ants:         { baseFriendliness: -5,  warReluctance: 10,  treatyBonus: 0 },
  hermit_crabs: { baseFriendliness: 0,   warReluctance: 30,  treatyBonus: -5 },
};

/** Trust modifiers per race (design/technical/ai-implementation.md §5.7) */
const TRUST_MODIFIERS: Record<string, number> = {
  hamsters:    1.3,
  rabbits:     1.2,
  rats:        1.1,
  ferrets:     0.9,
  chameleons:  0.7,
  guinea_pigs: 0.8,
};

/**
 * Calculate the Stance_Score between two empires using the full 6-component
 * weighted formula from design/technical/ai-implementation.md §5.3:
 *
 *   Stance_Score = floor(
 *     Base_Relationship +    §5.4: current diplomatic value
 *     Power_Assessment +     §5.5: relative power ratio
 *     Strategic_Value +      §5.6: strategic factors
 *     Trust_Factor +         §5.7: historical trust
 *     Personality_Modifier + §5.8: race-based friendliness
 *     History_Modifier       §5.9: decayed historical events
 *   )
 *
 * Score-to-Stance mapping:
 *   < -60      → hostile
 *   -60 to -20 → unfriendly
 *   -19 to +30 → neutral
 *   +31 to +60 → cooperative
 *   > +60      → allied
 */
export function calculateStanceScore(
  state: GameState,
  empireId: EmpireId,
  targetId: EmpireId,
): { score: number; stance: DiplomaticStance } {
  const empire = state.empires.byId[empireId];
  const target = state.empires.byId[targetId];
  if (!empire || !target) return { score: 0, stance: 'neutral' };

  const relation = getRelation(state, empireId, targetId);
  const aiEmpire: AIEmpire | undefined = state.aiEmpires[empireId];
  const raceId = empire.raceId ?? 'hamsters';
  const profile = getPersonalityProfile(raceId);

  // §5.4 Base_Relationship
  const baseRelationship = relation?.value ?? 0;

  // §5.5 Power_Assessment
  // Total_Power = Fleet_Power + (Production × 5) + (Tech_Level × 10)
  const myFleetPower    = getEmpireFleetPower(empireId, state);
  const theirFleetPower = getEmpireFleetPower(targetId, state);
  const myProd          = empire.planets.length * 20;
  const theirProd       = target.planets.length * 20;
  const myTech          = empire.research?.completedTechs?.length ?? 0;
  const theirTech       = target.research?.completedTechs?.length ?? 0;

  const myTotalPower    = myFleetPower    + (myProd    * 5) + (myTech    * 10);
  const theirTotalPower = theirFleetPower + (theirProd * 5) + (theirTech * 10);
  const powerRatio      = theirTotalPower === 0 ? 2.0 : myTotalPower / theirTotalPower;

  const aggression   = aiEmpire?.personality.aggression ?? profile.aggression;
  const isAggressive = aggression > 60;

  let powerAssessment: number;
  if      (powerRatio < 0.5)  powerAssessment = isAggressive ? -30 : 30;
  else if (powerRatio < 0.8)  powerAssessment = isAggressive ? -15 : 15;
  else if (powerRatio <= 1.2) powerAssessment = 0;
  else if (powerRatio <= 2.0) powerAssessment = isAggressive ? 15 : -15;
  else                        powerAssessment = isAggressive ? 30 : -30;

  // §5.6 Strategic_Value
  let strategicValue = 0;
  if (theirTech > myTech + 2)                        strategicValue += 25; // tech trading beneficial
  if (target.planets.length > empire.planets.length) strategicValue += 20; // trade profitable

  // -20 if target is allied with our enemy
  const ourEnemyIds = Object.entries(empire.relations)
    .filter(([, r]) => r.state === 'war').map(([id]) => id);
  for (const enemyId of ourEnemyIds) {
    const theirRel = target.relations[enemyId];
    if (theirRel && ['allied', 'cooperative'].includes(theirRel.state)) {
      strategicValue -= 20;
      break;
    }
  }

  // -30 if they block our expansion (adjacent to our home system)
  const ourHomeSys = empire.planets[0]
    ? state.galaxy.systems.byId[state.planets.byId[empire.planets[0]]?.systemId ?? ''] ?? null
    : null;
  if (ourHomeSys) {
    for (const pid of target.planets) {
      const theirSys = state.galaxy.systems.byId[state.planets.byId[pid]?.systemId ?? ''];
      if (!theirSys) continue;
      const dx = ourHomeSys.coordinates.x - theirSys.coordinates.x;
      const dy = ourHomeSys.coordinates.y - theirSys.coordinates.y;
      if (Math.sqrt(dx * dx + dy * dy) < 5) { strategicValue -= 30; break; }
    }
  }

  // §5.7 Trust_Factor = floor(Trust_Base × Trust_Modifier)
  let trustBase = 0;
  if (relation) {
    const broken      = relation.events?.filter(e => e.type === 'treaty_broken').length ?? 0;
    const attacked    = relation.events?.some(e => e.type === 'unprovoked_attack') ?? false;
    const honored     = relation.events?.some(e => e.type === 'honored_pact') ?? false;
    const neverBroken = broken === 0 && relation.treaties.length > 0;
    if (attacked)         trustBase = -50;
    else if (broken > 0)  trustBase = -30;
    else if (neverBroken) trustBase = 40;
    else if (honored)     trustBase = 20;
  }
  const trustMod     = TRUST_MODIFIERS[raceId] ?? 1.0;
  const chameleonPen = raceId === 'chameleons' ? -80 : 0;
  const trustFactor  = Math.floor(trustBase * trustMod) + chameleonPen;

  // §5.8 Personality_Modifier
  const personalityModifier = PERSONALITY_STANCE_MODIFIERS[raceId]?.baseFriendliness ?? 0;

  // §5.9 History_Modifier = Σ(event_value × 0.98^turns_since_event)
  let historyModifier = 0;
  if (relation?.events) {
    for (const event of relation.events) {
      const turnsSince  = Math.max(0, state.turn - (event.turn ?? state.turn));
      const decayFactor = Math.pow(0.98, turnsSince);
      let eventValue = 0;
      switch (event.type) {
        case 'war_declared':         eventValue = -30; break;
        case 'attacked_ally':        eventValue = -20; break;
        case 'helped_in_war':        eventValue =  25; break;
        case 'long_standing_trade':  eventValue =  15; break;
        case 'tech_shared':          eventValue =  10; break;
        case 'treaty_broken':        eventValue = -40; break;
        default:                     eventValue =   0; break;
      }
      historyModifier += Math.floor(eventValue * decayFactor);
    }
  }

  // §5.3 Stance_Score
  const score = Math.floor(
    baseRelationship + powerAssessment + strategicValue +
    trustFactor + personalityModifier + historyModifier,
  );

  // Score-to-Stance mapping
  let stance: DiplomaticStance;
  if      (score < -60) stance = 'hostile';
  else if (score < -20) stance = 'unfriendly';
  else if (score <= 30) stance = 'neutral';
  else if (score <= 60) stance = 'cooperative';
  else                  stance = 'allied';

  return { score, stance };
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

  // Personality-driven diplomacy willingness.
  // Prefer stored AIPersonality fields (populated from canonical profile at game start);
  // fall back to getPersonalityProfile() for saves that pre-date ORION-FIX-009.
  const aiEmpire: AIEmpire | undefined = state.aiEmpires[empireId];
  const profile = getPersonalityProfile(empire.raceId);
  const diplomacyScore = aiEmpire?.personality.diplomacy ?? profile.diplomacy;
  const treatyBonus = aiEmpire?.personality.treatyBonus ?? profile.treatyBonus;

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
    treatyType: targetType,
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

  // Prefer stored AIPersonality fields; fall back to profile for pre-fix saves.
  const profile = getPersonalityProfile(empire.raceId);
  const aiEmpireForBreak: AIEmpire | undefined = state.aiEmpires[empireId];
  const storedTraits = aiEmpireForBreak?.personality.traits ?? profile.traits;
  const backstabTendency = aiEmpireForBreak?.personality.backstabTendency ?? profile.backstabTendency;

  // Honorable races never break treaties
  if (storedTraits.includes('honorable')) return null;

  const relValue = getRelationValue(state, empireId, targetId);
  const ratio = fleetStrengthRatio(state, empireId, targetId);

  // Break if relation has fallen below unfriendly and treaty can be broken
  const breakableExists = activeTreaties.some((t) => t.canBreak);
  if (!breakableExists) return null;

  const relBelowUnfriendly = relValue < STATE_WAR_THRESHOLD / 2; // < -25
  const backstabOpportunity = backstabTendency > 40 && ratio > 1.5;

  if (!relBelowUnfriendly && !backstabOpportunity) return null;

  const priority = backstabOpportunity
    ? Math.min(10, 5 + Math.round(backstabTendency / 20))
    : 4;

  const reason = backstabOpportunity
    ? `Opportunistic treaty break: fleet advantage ${ratio.toFixed(1)}x, backstab tendency ${backstabTendency}`
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

  // Prefer stored AIPersonality fields (populated from canonical profile at game start);
  // fall back to getPersonalityProfile() for saves that pre-date ORION-FIX-009.
  const profile = getPersonalityProfile(empire.raceId);
  const aiEmpire: AIEmpire | undefined = state.aiEmpires[empireId];
  const aggression = aiEmpire?.personality.aggression ?? profile.aggression;

  // Use traits from stored personality when available, otherwise from canonical profile.
  // Stored traits are populated via archetypeToTraits() in newGame.ts.
  const traits = aiEmpire?.personality.traits ?? profile.traits;

  // Peaceful races never start wars (design/diplomacy/ai-personalities.md)
  if (traits.includes('peaceful')) return null;

  // Honorable races with low aggression (< 50) never start wars — they only
  // defend when attacked. This applies to Hamsters ("Never declares war first")
  // and Hermit Crabs ("Triggers War: Direct attack only").
  // Honorable races with high aggression (Guinea Pigs, Budgies) CAN declare war
  // when provoked (relations are unfriendly) — they just keep their treaties.
  const HONORABLE_AGGRESSION_THRESHOLD = 50;
  if (traits.includes('honorable')) {
    if (aggression < HONORABLE_AGGRESSION_THRESHOLD) {
      // Low-aggression honorable races never initiate war
      return null;
    }
    // High-aggression honorable races only declare war when relations are unfriendly
    if (relation.state !== 'unfriendly') {
      return null;
    }
  }

  const relValue = relation.value;
  const ratio = fleetStrengthRatio(state, empireId, targetId);
  // Prefer stored warReluctance (from canonical profile, set at game start)
  const warReluctance = aiEmpire?.personality.warReluctance ?? profile.warReluctance;

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

    // §5.3 Compute the weighted Stance_Score to gate and prioritize decisions.
    const { score: stanceScore, stance } = calculateStanceScore(state, empireId, targetId);

    // War declaration (highest potential disruption — only viable when stance is hostile/unfriendly)
    if (stance === 'hostile' || stance === 'unfriendly') {
      const warDecision = aiDecideDeclareWar(state, empireId, targetId);
      if (warDecision) {
        // Boost priority for hostile stance; reduce for unfriendly
        const stanceBoost = stance === 'hostile' ? 2 : 0;
        decisions.push({ ...warDecision, priority: Math.min(10, warDecision.priority + stanceBoost) });
      }
    }

    // Treaty break (viable when stance has deteriorated to unfriendly or worse)
    if (stance === 'hostile' || stance === 'unfriendly') {
      const breakDecision = aiDecideBreakTreaty(state, empireId, targetId);
      if (breakDecision) decisions.push(breakDecision);
    }

    // Treaty proposal (viable when stance is neutral or better)
    if (stance !== 'hostile') {
      const treatyDecision = aiDecideTreaty(state, empireId, targetId);
      if (treatyDecision) {
        // Cooperative/allied stance boosts treaty priority
        const stanceBoost = (stance === 'cooperative' || stance === 'allied') ? 1 : 0;
        decisions.push({ ...treatyDecision, priority: Math.min(10, treatyDecision.priority + stanceBoost) });
      }
    }

    // Trade deal (high-diplomacy empires seek trade when stance is neutral+)
    // Per design/diplomacy/relationship-formulas.md §5.4, trade requires +10 relations.
    // Stance score provides a more nuanced gate than raw relation value.
    const TRADE_MIN_STANCE = -19; // neutral or better
    const dipScore = aiState.personality.diplomacy;
    const relValue = getRelationValue(state, empireId, targetId);

    if (
      dipScore >= 40 &&
      stanceScore >= TRADE_MIN_STANCE &&
      relValue >= 10 &&
      !hasTreatyOfType(state, empireId, targetId, 'trade')
    ) {
      const tradeBoost = stanceScore > 30 ? 2 : 0; // extra push for cooperative/allied
      decisions.push({
        action: 'trade_deal',
        targetId,
        reasoning: `Stance score ${stanceScore} (${stance}) and diplomacy ${dipScore} favor trade`,
        priority: Math.min(10, 3 + Math.round(dipScore / 20) + tradeBoost),
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
          // Use the treaty type from the decision, fallback to non_aggression
          next = applyProposeTreaty(
            next,
            empireId,
            decision.targetId,
            decision.treatyType ?? 'non_aggression',
          );
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

/**
 * Apply a treaty proposal using the proper treaties.ts flow.
 *
 * Uses the canonical proposeTreaty function to create a pending treaty.
 * For AI-to-AI treaties, auto-accepts immediately (since there's no UI).
 * For AI-to-player treaties, leaves as pending for player to accept/reject.
 *
 * Design reference: design/diplomacy/relationship-formulas.md §9.1
 * NOTE: Full AI acceptance formula (AcceptanceChance) is not yet implemented.
 * Currently AI-to-AI treaties auto-accept; this should eventually use the
 * formula: AcceptanceChance = BaseChance + RelationBonus + RacialBonus + ...
 */
function applyProposeTreaty(
  state: GameState,
  empireId: EmpireId,
  targetId: EmpireId,
  type: TreatyType,
): GameState {
  const target = state.empires.byId[targetId];
  if (!target) return state;

  // Use the proper treaty proposal flow from treaties.ts
  let next = proposeTreaty(state, empireId, targetId, type);

  // If the target is the player, leave as pending for UI acceptance.
  // If the target is AI, auto-accept the treaty.
  // TODO: Implement AI acceptance formula per design/diplomacy/relationship-formulas.md §9.1
  if (!target.isPlayer) {
    next = acceptTreaty(next, empireId, targetId, type);
  }

  return next;
}
