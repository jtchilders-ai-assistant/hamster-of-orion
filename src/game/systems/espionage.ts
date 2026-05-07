/**
 * Espionage system — pure TypeScript, NO DOM.
 *
 * Implements spy missions between empires: reconnaissance, technology theft,
 * sabotage (factories/bases), inciting rebellion, framing races, and assassination.
 *
 * All formulas follow design/diplomacy/espionage.md (spec-017, v1.4).
 *
 * Key design decisions:
 *  - HoO uses a % success formula rather than MOO1's two-phase roll chart.
 *  - Frame jobs are a standalone mission type (HoO original; see design doc §6.6).
 *  - Racial aggression multipliers scale spy effectiveness (v1.4, §1.2).
 *  - Ants: cannot conduct espionage AND are immune to it (two separate flags).
 *  - All Spies Fail catastrophic result on natural 100 (§1.3).
 *  - Tech theft includes tier-based value modifiers (§6.2).
 */

import { EmpireId, GameState, MissionType, SpyMission } from '../state';
import { getRace } from './races';

// ── Re-export types so consumers can import from this module ──────────────────
export type { MissionType, SpyMission };

// ── Constants (design/diplomacy/espionage.md §12) ─────────────────────────────

const BASE_EFFECTIVENESS = 30;
const TECH_MODIFIER = 2;           // each tech level = ±2% success
const TECH_BONUS_CAP = 20;         // capped at ±10 levels
const BASE_DETECTION = 10;         // 10% base detection even at security 0
const MIN_DETECTION = 5;
const MAX_DETECTION = 99;
const MIN_SUCCESS = 5;
const MAX_SUCCESS = 95;
const SECURITY_DETECTION_PER_LEVEL = 10; // +10% detection per security level
const ALL_SPIES_FAIL_THRESHOLD = 100;    // §1.3: Natural 100 on d100 detection = catastrophic failure

/** Duration in turns for each mission type. */
const MISSION_DURATION: Record<MissionType, number> = {
  reconnaissance: 1,
  steal_technology: 3,
  sabotage_factories: 2,
  sabotage_bases: 2,
  incite_rebellion: 4,
  assassination:          6,
  frame_race: 2,
};

/** Base success % (0-100 integer) per mission type, from §5.1 and §6. */
const BASE_MISSION_SUCCESS: Record<MissionType, number> = {
  reconnaissance: 80,     // §6.1 Reconnaissance (Passive Intelligence)
  steal_technology: 30,   // §6.2 Steal Technology
  sabotage_factories: 40, // §6.3 Sabotage Factories
  sabotage_bases: 35,     // §6.4 Sabotage Missile Bases (medium-high risk)
  incite_rebellion: 25,   // §6.5 Incite Rebellion (high risk)
  assassination: 10,      // §6.7 Assassination (extreme risk)
  frame_race: 50,         // §6.6 Frame Another Race (high risk)
};

/**
 * Tech theft tier-based value modifiers from §6.2.
 * Lower tiers are easier to steal; higher tiers are harder.
 */
const TECH_THEFT_TIER_MODIFIERS: Array<{ maxTier: number; modifier: number }> = [
  { maxTier: 3, modifier: 10 },   // Tier 1-3: +10 (easier to steal basic tech)
  { maxTier: 6, modifier: 0 },    // Tier 4-6: +0
  { maxTier: 9, modifier: -5 },   // Tier 7-9: -5
  { maxTier: 12, modifier: -10 }, // Tier 10-12: -10
  { maxTier: Infinity, modifier: -15 }, // Tier 13+: -15 (hardest to steal advanced tech)
];

/**
 * Racial aggression multipliers from §2.1 (v1.4).
 * Ants are excluded by canConductEspionage=false, so their multiplier is never used.
 */
const RACIAL_AGGRESSION_MULTIPLIER: Record<string, number> = {
  chameleons:   1.60,
  ferrets:      1.10,
  rats:         1.00,
  hamsters:     1.00,
  mice:         1.00,
  budgies:      1.00,
  rabbits:      0.95,  // §2.1: Too nervous for spy work
  guinea_pigs:  0.90,  // §2.1: Too direct, despise subterfuge
  hermit_crabs: 0.85,  // §2.1: Slow, obvious, patient not sneaky
  ants:         1.00,  // never applied (blocked by flag)
};

/**
 * Racial defensive security bonuses from §2.2.
 * These are ADDED to the target's detection chance.
 */
const RACIAL_DEFENSE_BONUS: Record<string, number> = {
  ants:        999, // immune — handled by flag, not formula
  chameleons:  30,
  mice:        10,
  rats:        5,
  hamsters:    0,
  guinea_pigs: 0,
  ferrets:     0,
  budgies:     0,
  rabbits:     -5,
  hermit_crabs: -10,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

let _missionCounter = 0;
function newMissionId(): string {
  return `mission_${++_missionCounter}_${Date.now()}`;
}

/**
 * Get the tech theft modifier for a given tech tier (§6.2).
 * Lower tier techs are easier to steal; higher tier techs are harder.
 */
export function getTechTheftTierModifier(techTier: number): number {
  for (const entry of TECH_THEFT_TIER_MODIFIERS) {
    if (techTier <= entry.maxTier) {
      return entry.modifier;
    }
  }
  return -15; // Fallback for tier 13+
}

// ── Core formula: spy effectiveness (§1.2) ───────────────────────────────────

/**
 * Calculate raw spy effectiveness for a sender attacking a target.
 *
 * SpyEffectiveness =
 *   (BASE + racialBonus + spyRollBonus + techBonus − targetSecurity)
 *   × racial_aggression_multiplier
 *
 * Returned as an integer (floor).
 */
export function calculateSpyEffectiveness(
  senderRaceId: string,
  targetRaceId: string,
  senderComputerTech: number,
  targetComputerTech: number,
  targetSecurityLevel: number,
): number {
  const senderRace = getRace(senderRaceId);
  const targetRace = getRace(targetRaceId);

  // Pre-check flags
  if (!senderRace.canConductEspionage) return 0;
  if (targetRace.immuneToEspionage) return 0;

  const racialBonus   = senderRace.bonuses.espionage;          // % modifier (+60 for Chameleons)
  const spyRollBonus  = senderRace.spyRollBonus;               // flat addition (+30 for Chameleons)
  const techDiff      = senderComputerTech - targetComputerTech;
  const techBonus     = clamp(techDiff * TECH_MODIFIER, -TECH_BONUS_CAP, TECH_BONUS_CAP);
  const securityPenalty = targetSecurityLevel * SECURITY_DETECTION_PER_LEVEL;

  const multiplier = RACIAL_AGGRESSION_MULTIPLIER[senderRaceId] ?? 1.00;

  const effectiveness =
    (BASE_EFFECTIVENESS + racialBonus + spyRollBonus + techBonus - securityPenalty)
    * multiplier;

  return Math.floor(effectiveness);
}

// ── Core formula: detection chance (§4.2) ────────────────────────────────────

/**
 * Calculate the target empire's chance (0-100 integer %) of detecting a spy.
 *
 * DetectionChance = BASE_DETECTION + (securityLevel × 10) + racialDefenseBonus
 * Clamped to [MIN_DETECTION, MAX_DETECTION].
 */
export function calculateDetectionChance(
  targetRaceId: string,
  targetSecurityLevel: number,
): number {
  if (getRace(targetRaceId).immuneToEspionage) return 0; // immune target silently blocks

  const defensBonus = RACIAL_DEFENSE_BONUS[targetRaceId] ?? 0;
  const raw = BASE_DETECTION + targetSecurityLevel * SECURITY_DETECTION_PER_LEVEL + defensBonus;
  return clamp(raw, MIN_DETECTION, MAX_DETECTION);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Calculate mission success probability (0-1, two decimal precision) based on:
 * - espionage tech levels (sender vs target)
 * - diplomatic state (warring empire gets +20% sabotage cover, per §14.3)
 * - mission type base success
 * - spy effectiveness
 *
 * Follows design §5.2: SuccessChance = BaseMissionSuccess + SpyEffectiveness
 * clamped to [MIN_SUCCESS, MAX_SUCCESS].
 *
 * Takes Empire objects so callers don't need to duplicate field lookups.
 */
export function calculateMissionProbability(
  sender: { raceId: string; computerTechLevel: number },
  target: { raceId: string; computerTechLevel: number; securityLevel: number },
  missionType: MissionType,
): number {
  const targetRace = getRace(target.raceId);
  if (targetRace.immuneToEspionage) return 0;

  const senderRace = getRace(sender.raceId);
  if (!senderRace.canConductEspionage) return 0;

  const effectiveness = calculateSpyEffectiveness(
    sender.raceId,
    target.raceId,
    sender.computerTechLevel,
    target.computerTechLevel,
    target.securityLevel,
  );

  const base = BASE_MISSION_SUCCESS[missionType];
  const raw  = base + effectiveness;
  const pct  = clamp(raw, MIN_SUCCESS, MAX_SUCCESS);

  // Return as 0-1 probability, two-decimal precision
  return Math.round(pct) / 100;
}

/**
 * Calculate tech theft success probability with tier modifier (§6.2).
 * Uses the base steal_technology success formula, plus a tier-based modifier:
 *   - Tier 1-3: +10 (easier to steal basic tech)
 *   - Tier 4-6: +0
 *   - Tier 7-9: -5
 *   - Tier 10-12: -10
 *   - Tier 13+: -15 (hardest to steal advanced tech)
 */
export function calculateTechTheftProbability(
  sender: { raceId: string; computerTechLevel: number },
  target: { raceId: string; computerTechLevel: number; securityLevel: number },
  techTier: number,
): number {
  const targetRace = getRace(target.raceId);
  if (targetRace.immuneToEspionage) return 0;

  const senderRace = getRace(sender.raceId);
  if (!senderRace.canConductEspionage) return 0;

  const effectiveness = calculateSpyEffectiveness(
    sender.raceId,
    target.raceId,
    sender.computerTechLevel,
    target.computerTechLevel,
    target.securityLevel,
  );

  const base = BASE_MISSION_SUCCESS.steal_technology;
  const tierModifier = getTechTheftTierModifier(techTier);
  const raw = base + effectiveness + tierModifier;
  const pct = clamp(raw, MIN_SUCCESS, MAX_SUCCESS);

  return Math.round(pct) / 100;
}

/**
 * Send a spy mission from sender to target.
 * Returns an updated GameState with the new SpyMission appended to spyMissions.
 *
 * Guards:
 *  - sender must exist and be able to conduct espionage
 *  - target must exist and not be immune
 *  - sender cannot spy on itself
 */
export function sendSpyMission(
  state: GameState,
  senderId: EmpireId,
  targetId: EmpireId,
  missionType: MissionType,
): GameState {
  const sender = state.empires.byId[senderId];
  const target = state.empires.byId[targetId];

  if (!sender || !target) return state;
  if (senderId === targetId) return state;

  const senderRace = getRace(sender.raceId);
  const targetRace = getRace(target.raceId);

  if (!senderRace.canConductEspionage) return state;
  if (targetRace.immuneToEspionage) return state;

  const successProbability = calculateMissionProbability(
    { raceId: sender.raceId, computerTechLevel: sender.computerTechLevel },
    { raceId: target.raceId, computerTechLevel: target.computerTechLevel, securityLevel: target.securityLevel },
    missionType,
  );

  const mission: SpyMission = {
    id: newMissionId(),
    type: missionType,
    senderId,
    targetId,
    startTurn: state.turn,
    durationTurns: MISSION_DURATION[missionType],
    successProbability,
    status: 'active',
  };

  return {
    ...state,
    spyMissions: [...state.spyMissions, mission],
  };
}

/**
 * Process all active spy missions for the current turn.
 *
 * For each active mission whose durationTurns have elapsed since startTurn:
 *  - If mission has skipTurns > 0, decrement and skip processing
 *  - Roll against successProbability → if succeeds: 'completed', apply reward
 *  - Roll against detectionChance → if detected: 'foiled'
 *  - §1.3 All Spies Fail: if detection roll is exactly 100 (d100), ALL of the
 *    sender's active spies skip their next turn
 *
 * Uses a deterministic PRNG seeded on mission id + turn to keep state pure
 * (no real random in the hot path — callers may inject a rng for testing).
 */
export function processEspionageTurns(
  state: GameState,
  rng: () => number = Math.random,
): GameState {
  let nextState = state;
  const allSpiesFailSenders = new Set<EmpireId>(); // Track empires that rolled catastrophic failure

  // First pass: decrement skipTurns for all active missions
  for (const mission of state.spyMissions) {
    if (mission.status !== 'active') continue;
    if (mission.skipTurns && mission.skipTurns > 0) {
      const decremented = { ...mission, skipTurns: mission.skipTurns - 1 };
      nextState = replaceMission(nextState, decremented);
    }
  }

  // Second pass: process missions that are ready
  for (const mission of nextState.spyMissions) {
    if (mission.status !== 'active') continue;

    // Skip if this spy is still skipping turns
    if (mission.skipTurns && mission.skipTurns > 0) continue;

    const elapsed = state.turn - mission.startTurn;
    if (elapsed < mission.durationTurns) continue;

    const target = nextState.empires.byId[mission.targetId];
    if (!target) continue;

    // Roll for success
    const successRoll = rng();
    const succeeded = successRoll < mission.successProbability;

    // Roll for detection (as d100: 1-100)
    const detectionChance = calculateDetectionChance(target.raceId, target.securityLevel) / 100;
    const detectionRollRaw = rng();
    const detectionRoll = Math.ceil(detectionRollRaw * 100); // Convert to 1-100 scale
    const detected = detectionRollRaw < detectionChance;

    // §1.3: Check for catastrophic "All Spies Fail" (natural 100 on d100)
    if (detectionRoll === ALL_SPIES_FAIL_THRESHOLD) {
      allSpiesFailSenders.add(mission.senderId);
    }

    let updatedMission: SpyMission;

    if (detected) {
      updatedMission = { ...mission, status: 'foiled' };
    } else if (succeeded) {
      const reward = computeReward(mission.type);
      updatedMission = { ...mission, status: 'completed', reward };
    } else {
      // Not detected, not succeeded yet — extend by one more turn
      updatedMission = { ...mission, startTurn: state.turn };
    }

    nextState = replaceMission(nextState, updatedMission);
    if (updatedMission.status === 'completed') {
      nextState = applyMissionEffect(nextState, updatedMission);
    }
  }

  // Third pass: apply "All Spies Fail" catastrophic result
  // All active spies from the affected empires lose their next turn (§1.3)
  if (allSpiesFailSenders.size > 0) {
    nextState = applyAllSpiesFailPenalty(nextState, allSpiesFailSenders);
  }

  return nextState;
}

/**
 * Apply the "All Spies Fail" catastrophic penalty (§1.3).
 * All active spy missions from the affected empires skip their next turn.
 */
function applyAllSpiesFailPenalty(
  state: GameState,
  affectedEmpires: Set<EmpireId>,
): GameState {
  let nextState = state;

  for (const mission of state.spyMissions) {
    if (mission.status !== 'active') continue;
    if (!affectedEmpires.has(mission.senderId)) continue;

    // Add 1 skip turn to this spy
    const currentSkip = mission.skipTurns ?? 0;
    const penalized = { ...mission, skipTurns: currentSkip + 1 };
    nextState = replaceMission(nextState, penalized);
  }

  return nextState;
}

/**
 * Forcibly foil a mission (target detects and neutralises a spy).
 * No-ops if the mission is not active or not found.
 */
export function foilMission(state: GameState, missionId: string): GameState {
  const mission = state.spyMissions.find((m) => m.id === missionId);
  if (!mission || mission.status !== 'active') return state;

  return replaceMission(state, { ...mission, status: 'foiled' });
}

/**
 * Apply the effects of a completed mission to the game state.
 *
 * Current effects:
 *  - completed mission reward is recorded in mission.reward (already set)
 *  - future: apply factory damage, relation modifiers, stolen tech, etc.
 *
 * This is a pure state transform — side-effects (notifications, UI) live
 * outside this module.
 */
export function applyMissionEffect(state: GameState, _mission: SpyMission): GameState {
  // The reward is already stamped on the mission.
  // Downstream reducers (production, diplomacy, research) will read spyMissions
  // to process completed-mission rewards each turn.
  // For now: no direct mutation of empire state — that belongs in the turn reducer.
  return state;
}

/**
 * Return all active missions for the given empire (as sender).
 */
export function getActiveMissions(state: GameState, empireId: EmpireId): SpyMission[] {
  return state.spyMissions.filter(
    (m) => m.senderId === empireId && m.status === 'active',
  );
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Immutably replace a mission in state.spyMissions by id. */
function replaceMission(state: GameState, updated: SpyMission): GameState {
  return {
    ...state,
    spyMissions: state.spyMissions.map((m) => (m.id === updated.id ? updated : m)),
  };
}

/** Compute a simple reward descriptor for a completed mission. */
function computeReward(type: MissionType): { type: string; value: number } {
  switch (type) {
    case 'reconnaissance': return { type: 'intel',      value: 1 };
    case 'steal_technology':                  return { type: 'tech_stolen', value: 1 };
    case 'sabotage_factories':               return { type: 'factories_destroyed', value: 10 };
    case 'sabotage_bases':             return { type: 'morale_reduced',     value: 5 };
    case 'incite_rebellion':           return { type: 'rebellion_points',   value: 10 };
    case 'assassination':          return { type: 'leader_killed',      value: 1 };
    case 'frame_race':              return { type: 'bc_stolen',          value: 0 }; // Value set during resolution
  }
}
