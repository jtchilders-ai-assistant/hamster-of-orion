/**
 * Galactic High Council — diplomatic victory system.
 * Pure TypeScript, NO DOM, no `any`.
 *
 * All formulas follow design/diplomacy/council.md.
 */

import { EmpireId, GameState, Planet, PlanetType } from '../state';
import { getRelationValue } from './diplomacy';

// ── Constants ─────────────────────────────────────────────────────────────────

export const COUNCIL_INTERVAL = 25;
export const VICTORY_THRESHOLD = 2 / 3;
export const MIN_VOTE_THRESHOLD = 1.0;          // % — below this, race can't be candidate
export const MIN_EFFECTIVE_VOTES = 50.0;        // % — quorum
export const RELATION_WEIGHT = 0.5;
export const FEAR_WEIGHT = 15;
export const MAX_MILITARY_RATIO = 3.0;
export const BRIBERY_WEIGHT = 100;
export const MAX_BRIBERY_FACTOR = 50;
export const REPUTATION_WEIGHT = 0.15;
export const HAMSTER_COUNCIL_BONUS = 5;
export const ABSTAIN_THRESHOLD = 5;
export const LOW_SCORE_THRESHOLD = 20;
export const DOMINANCE_COUNCIL_PENALTY = -20;
export const DOMINANCE_THRESHOLD = 0.40;        // 40% of galactic population
export const HERMIT_CRAB_ABSTAIN_CHANCE = 0.25;

/** Planet types that are NOT habitable (cannot be colonised, excluded from council formation). */
const NON_HABITABLE_TYPES: ReadonlySet<PlanetType> = new Set<PlanetType>([
  'gas_giant',
]);

// ── Racial tables ─────────────────────────────────────────────────────────────

interface RaceModifiers {
  fearModifier: number;
  briberModifier: number;
  councilBonus: number;
  hermitCrabAbstain: boolean;
}

const RACE_MODIFIERS: Record<string, RaceModifiers> = {
  hamsters:     { fearModifier: 1.0, briberModifier: 1.0, councilBonus: 5,  hermitCrabAbstain: false },
  guinea_pigs:  { fearModifier: 0.1, briberModifier: 0.3, councilBonus: 0,  hermitCrabAbstain: false },
  chameleons:   { fearModifier: 1.0, briberModifier: 1.2, councilBonus: 0,  hermitCrabAbstain: false },
  budgies:      { fearModifier: 0.4, briberModifier: 0.5, councilBonus: 0,  hermitCrabAbstain: false },
  ferrets:      { fearModifier: 0.3, briberModifier: 0.6, councilBonus: 0,  hermitCrabAbstain: false },
  rats:         { fearModifier: 1.5, briberModifier: 1.0, councilBonus: 0,  hermitCrabAbstain: false },
  rabbits:      { fearModifier: 2.0, briberModifier: 1.5, councilBonus: 0,  hermitCrabAbstain: false },
  mice:         { fearModifier: 1.2, briberModifier: 1.3, councilBonus: 0,  hermitCrabAbstain: false },
  ants:         { fearModifier: 0.6, briberModifier: 1.0, councilBonus: 0,  hermitCrabAbstain: false },
  hermit_crabs: { fearModifier: 0.8, briberModifier: 0.8, councilBonus: 0,  hermitCrabAbstain: true  },
};

/** Racial affinity: voter raceId → candidate raceId → point bonus (positive or negative). */
const RACIAL_AFFINITY: Record<string, Record<string, number>> = {
  guinea_pigs:  { guinea_pigs: 20, chameleons: -20 },
  budgies:      { budgies: 15, ferrets: 15, chameleons: -15 },
  ferrets:      { ferrets: 15, budgies: 15, rabbits: -10 },
  ants:         { ants: 10 },
  mice:         { mice: 10, rats: 10 },
  rats:         { rats: 10, mice: 10 },
  rabbits:      { hamsters: 15, guinea_pigs: -20, ferrets: -20 },
  hermit_crabs: { hermit_crabs: 10 },
  chameleons:   {},
  hamsters:     {},
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getRaceId(state: GameState, empireId: EmpireId): string {
  return state.empires.byId[empireId]?.raceId ?? '';
}

function getRaceModifiers(raceId: string): RaceModifiers {
  return RACE_MODIFIERS[raceId] ?? { fearModifier: 1.0, briberModifier: 1.0, councilBonus: 0, hermitCrabAbstain: false };
}

/** Sum military strength for an empire: total ship count (proxy for military power when no raw strength available). */
function getMilitaryStrength(state: GameState, empireId: EmpireId): number {
  const empire = state.empires.byId[empireId];
  if (!empire) return 0;
  return empire.fleets.reduce((acc, fleetId) => {
    const fleet = state.fleets.byId[fleetId];
    return acc + (fleet?.shipIds.length ?? 0);
  }, 0);
}

/** Total population for a single empire across all its colonised planets. */
function getEmpirePopulation(state: GameState, empireId: EmpireId): number {
  const empire = state.empires.byId[empireId];
  if (!empire) return 0;
  return empire.planets.reduce((sum, pid) => {
    const planet = state.planets.byId[pid];
    return sum + (planet?.population ?? 0);
  }, 0);
}

/** All habitable (non-gas-giant, non-asteroid) planets in the galaxy. */
function habitablePlanets(state: GameState): Planet[] {
  return state.planets.allIds
    .map(pid => state.planets.byId[pid])
    .filter((p): p is Planet => p !== undefined && !NON_HABITABLE_TYPES.has(p.type));
}

/** Living (non-defeated) empire IDs. */
function livingEmpireIds(state: GameState): EmpireId[] {
  return state.empires.allIds.filter(id => !state.empires.byId[id]?.isDefeated);
}

/** Whether two empires are at war. */
function atWar(state: GameState, empireAId: EmpireId, empireBId: EmpireId): boolean {
  const rel = state.empires.byId[empireAId]?.relations[empireBId];
  return rel?.state === 'war';
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns true if `turn` is a council turn.
 *
 * The first council turn is 25 (first multiple of COUNCIL_INTERVAL > 0);
 * subsequent meetings every 25 turns: 25, 50, 75, …
 */
export function isCouncilTurn(turn: number): boolean {
  return turn > 0 && turn % COUNCIL_INTERVAL === 0;
}

/**
 * Calculate each living empire's vote share (% of total inhabited population).
 *
 * Follows the formula in council.md §2.2:
 *   weight = floor((pop / total) × 10000) / 100  — two decimal precision
 * Rounding error is assigned to the empire with the largest share.
 */
export function calculateVoteShares(state: GameState): Record<EmpireId, number> {
  const living = livingEmpireIds(state);
  const populations: Record<EmpireId, number> = {};
  let totalPop = 0;

  for (const id of living) {
    const pop = getEmpirePopulation(state, id);
    populations[id] = pop;
    totalPop += pop;
  }

  if (totalPop === 0) {
    // Edge case: all empires have zero population — distribute equally.
    const equal = living.length > 0 ? 100 / living.length : 0;
    const shares: Record<EmpireId, number> = {};
    for (const id of living) shares[id] = equal;
    return shares;
  }

  const shares: Record<EmpireId, number> = {};
  let weightSum = 0;
  for (const id of living) {
    const w = Math.floor((populations[id] / totalPop) * 10000) / 100;
    shares[id] = w;
    weightSum += w;
  }

  // Normalise rounding residual to largest-share empire.
  const residual = Math.round((100 - weightSum) * 100) / 100;
  if (residual !== 0 && living.length > 0) {
    const largest = living.reduce((a, b) => (shares[a] >= shares[b] ? a : b));
    shares[largest] = Math.round((shares[largest] + residual) * 100) / 100;
  }

  return shares;
}

/**
 * Determine the two council candidates (top 2 by vote share / population).
 *
 * Tie-breaking: higher diplomatic reputation → alphabetical by EmpireId.
 * (Reputation scoring is simplified to relation average as a proxy here.)
 */
export function getCouncilCandidates(state: GameState): [EmpireId, EmpireId] {
  const shares = calculateVoteShares(state);
  const living = livingEmpireIds(state);

  if (living.length < 2) {
    // Degenerate case — caller should guard, but return what we have.
    const first = living[0] ?? '';
    return [first, first];
  }

  // Sort descending by share, then by alphabetical id for determinism.
  const sorted = [...living].sort((a, b) => {
    const diff = shares[b] - shares[a];
    if (diff !== 0) return diff;
    // Tie-break: alphabetical (id string comparison)
    return a < b ? -1 : 1;
  });

  return [sorted[0], sorted[1]];
}

// ── AI vote internals ─────────────────────────────────────────────────────────

/**
 * Racial affinity score for voter→candidate pair.
 * Hamsters receive a universal +5 from everyone.
 */
function getRacialAffinity(voterRaceId: string, candidateRaceId: string): number {
  const affinities = RACIAL_AFFINITY[voterRaceId] ?? {};
  let score = affinities[candidateRaceId] ?? 0;
  // Universal diplomat bonus: all non-hostile voters get +5 for hamsters
  if (candidateRaceId === 'hamsters') {
    score += HAMSTER_COUNCIL_BONUS;
  }
  return score;
}

/**
 * Compute the vote score for a single voter→candidate pair.
 *
 * Score = RelationFactor + FearFactor + BriberyFactor + RacialFactor + ReputationFactor + DominancePenalty
 *
 * Note: Bribery and Reputation are simplified (no active bribe/reputation tracking yet).
 */
function calculateVoteScore(
  state: GameState,
  voterId: EmpireId,
  candidateId: EmpireId,
  voteShares: Record<EmpireId, number>,
): number {
  const voterRaceId = getRaceId(state, voterId);
  const candidateRaceId = getRaceId(state, candidateId);
  const mods = getRaceModifiers(voterRaceId);

  // Relation factor
  const relationValue = getRelationValue(state, voterId, candidateId);
  const relationFactor = relationValue * RELATION_WEIGHT;

  // Fear factor
  const voterMilitary = getMilitaryStrength(state, voterId);
  const candidateMilitary = getMilitaryStrength(state, candidateId);
  let militaryRatio = 0;
  if (voterMilitary > 0) {
    militaryRatio = Math.min((candidateMilitary / voterMilitary) - 1, MAX_MILITARY_RATIO);
  } else if (candidateMilitary > 0) {
    militaryRatio = MAX_MILITARY_RATIO;
  }
  const fearFactor = Math.max(0, militaryRatio) * FEAR_WEIGHT * mods.fearModifier;

  // Bribery factor (zero until bribe system is implemented)
  const briberyFactor = 0;

  // Racial affinity
  const racialFactor = getRacialAffinity(voterRaceId, candidateRaceId);

  // Reputation factor (simplified: use relation as a proxy for reputation)
  const reputationScore = relationValue / 100; // normalise to [-1, +1]
  const reputationFactor = reputationScore * 100 * REPUTATION_WEIGHT; // scale back to points

  // Dominance penalty: candidate controls ≥40% of galactic population
  const candidateShare = voteShares[candidateId] ?? 0;
  const dominancePenalty = candidateShare >= DOMINANCE_THRESHOLD * 100 ? DOMINANCE_COUNCIL_PENALTY : 0;

  return relationFactor + fearFactor + briberyFactor + racialFactor + reputationFactor + dominancePenalty;
}

/**
 * Run AI votes for all non-player, non-candidate, living empires.
 *
 * Returns a map: voterId → candidateId (the empire they voted for).
 * Abstaining empires are NOT included in the returned map.
 *
 * Candidates always vote for themselves.
 */
export function runAIVotes(
  state: GameState,
  candidates: [EmpireId, EmpireId],
): Record<EmpireId, EmpireId> {
  const [c1, c2] = candidates;
  const living = livingEmpireIds(state);
  const voteShares = calculateVoteShares(state);
  const votes: Record<EmpireId, EmpireId> = {};

  for (const voterId of living) {
    // Candidates always vote for themselves.
    if (voterId === c1) { votes[voterId] = c1; continue; }
    if (voterId === c2) { votes[voterId] = c2; continue; }

    const voterRaceId = getRaceId(state, voterId);
    const mods = getRaceModifiers(voterRaceId);

    // Mandatory abstention: at war with both candidates.
    const warC1 = atWar(state, voterId, c1);
    const warC2 = atWar(state, voterId, c2);
    if (warC1 && warC2) continue; // abstain

    // War override: can't vote for active enemy.
    if (warC1) { votes[voterId] = c2; continue; }
    if (warC2) { votes[voterId] = c1; continue; }

    // Hermit crab random abstention (uses a deterministic hash-like approach
    // based on turn + empire id to avoid true randomness in pure functions).
    if (mods.hermitCrabAbstain) {
      // Deterministic pseudo-random: hash turn + voterId.
      const hash = (state.turn * 2654435761 + voterId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) >>> 0;
      if ((hash % 100) / 100 < HERMIT_CRAB_ABSTAIN_CHANCE) continue; // abstain
    }

    const score1 = calculateVoteScore(state, voterId, c1, voteShares);
    const score2 = calculateVoteScore(state, voterId, c2, voteShares);

    // Abstain if both scores are negative.
    if (score1 < 0 && score2 < 0) continue;

    // Abstain if scores within threshold and both low.
    if (Math.abs(score1 - score2) < ABSTAIN_THRESHOLD && Math.max(score1, score2) < LOW_SCORE_THRESHOLD) continue;

    votes[voterId] = score1 >= score2 ? c1 : c2;
  }

  return votes;
}

/**
 * Check if a candidate has reached the 2/3 majority required for diplomatic victory.
 *
 * - `voteShares`: each empire's % of total votes
 * - `votes`: map of voterId → candidateId (abstainers omitted)
 * - `candidates`: the two nominees
 *
 * Returns the winning EmpireId or null if no winner.
 */
export function checkDiplomaticVictory(
  voteShares: Record<EmpireId, number>,
  votes: Record<EmpireId, EmpireId>,
  candidates: [EmpireId, EmpireId],
): EmpireId | null {
  const [c1, c2] = candidates;

  // Sum abstention weight (empires with shares but not in votes).
  let abstentionWeight = 0;
  for (const empireId of Object.keys(voteShares)) {
    if (!(empireId in votes)) {
      abstentionWeight += voteShares[empireId] ?? 0;
    }
  }

  const effectiveTotal = 100 - abstentionWeight;

  // No quorum.
  if (effectiveTotal < MIN_EFFECTIVE_VOTES) return null;

  let c1Votes = 0;
  let c2Votes = 0;
  for (const [voterId, choice] of Object.entries(votes)) {
    const share = voteShares[voterId] ?? 0;
    if (choice === c1) c1Votes += share;
    else if (choice === c2) c2Votes += share;
  }

  // Victory threshold: ceil(effectiveTotal × 2/3)
  const threshold = Math.ceil(effectiveTotal * VICTORY_THRESHOLD);

  if (c1Votes >= threshold) return c1;
  if (c2Votes >= threshold) return c2;
  return null;
}

// ── Council formation check ───────────────────────────────────────────────────

/**
 * Check whether the council formation condition is met:
 * ≥50% of habitable planets are colonised.
 */
export function isCouncilFormationMet(state: GameState): boolean {
  const habitable = habitablePlanets(state);
  if (habitable.length === 0) return false;
  const colonised = habitable.filter(p => p.isColonized).length;
  return colonised / habitable.length >= 0.5;
}
