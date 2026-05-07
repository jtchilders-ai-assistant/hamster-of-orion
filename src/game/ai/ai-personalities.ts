/**
 * AI personality data — pure TypeScript, NO DOM.
 * src/game/ai/ai-personalities.ts
 *
 * Race-specific AI behavior parameters derived from MOO1 archetypes.
 * These define how each race thinks, fights, and relates to others.
 *
 * References:
 *   design/technical/ai-implementation.md  — scoring formulas
 *   design/species/race-stats-complete.md  — race bonuses
 */

// ── Types ──────────────────────────────────────────────────────────────────────

/**
 * Personality profile for an AI race.
 * Maps to the AIPersonality type in state.ts but with default values.
 */
export interface AIPersonalityProfile {
  /** Personality type from MOO1 equivalent */
  type: PersonalityType;
  /** 0-100: How likely to attack */
  aggression: number;
  /** 0-100: How likely to expand/colonize */
  expansionism: number;
  /** 0-100: How likely to seek diplomacy/alliances */
  diplomacy: number;
  /** 0-100: How likely to focus on research */
  research: number;
  /** 0-100: Base friendliness in diplomacy calculations */
  baseFriendliness: number;
  /** 0-100: Reluctance to declare war */
  warReluctance: number;
  /** 0-100: Bonus to treaty acceptance */
  treatyBonus: number;
  /** 0-100: Tendency to backstab allies */
  backstabTendency: number;
  /** Trait flags */
  traits: AITrait[];
}

/** Personality type labels (matches MOO1 archetypes) */
export type PersonalityType =
  | 'aggressive'
  | 'scientific'
  | 'diplomatic'
  | 'expansionist'
  | 'builder'
  | 'balanced'
  | 'erratic'
  | 'defensive'
  | 'predatory'
  | 'hermit';

/** Behavioral trait flags */
export type AITrait =
  | 'honorable'
  | 'backstabber'
  | 'logical'
  | 'xenophobic'
  | 'tech_trader'
  | 'war_monger'
  | 'peaceful'
  | 'hive_mind';

// ── Race profiles (MOO1 equivalents) ──────────────────────────────────────────

/**
 * Guinea Pigs (MOO1: Bulrathi) — +50% Ground Combat
 * Warriors who prefer conquest over colonization.
 */
export const GUINEA_PIG_PROFILE: AIPersonalityProfile = {
  type: 'aggressive',
  aggression: 85,
  expansionism: 50,
  diplomacy: 20,
  research: 10,
  baseFriendliness: -20,
  warReluctance: -30,
  treatyBonus: -10,
  backstabTendency: 10,
  traits: ['honorable'],
};

/**
 * Ferrets (MOO1: Mrrshan) — +30% Ship Attack
 * Predatory hunters who value hunting over settling.
 */
export const FERRET_PROFILE: AIPersonalityProfile = {
  type: 'predatory',
  aggression: 70,
  expansionism: 30,
  diplomacy: 15,
  research: 25,
  baseFriendliness: -10,
  warReluctance: -15,
  treatyBonus: -5,
  backstabTendency: 30,
  traits: ['xenophobic'],
};

/**
 * Budgies (MOO1: Alkari) — +50% Ship Defense
 * Warrior's pride with balanced approach.
 */
export const BUDGIE_PROFILE: AIPersonalityProfile = {
  type: 'balanced',
  aggression: 55,
  expansionism: 40,
  diplomacy: 35,
  research: 25,
  baseFriendliness: 0,
  warReluctance: 0,
  treatyBonus: 5,
  backstabTendency: 5,
  traits: [],
};

/**
 * Hamsters (MOO1: Humans) — Diplomatic, Balanced
 * The default balanced race.
 */
export const HAMSTER_PROFILE: AIPersonalityProfile = {
  type: 'balanced',
  aggression: 30,
  expansionism: 50,
  diplomacy: 55,
  research: 30,
  baseFriendliness: 20,
  warReluctance: 30,
  treatyBonus: 15,
  backstabTendency: 0,
  traits: ['honorable'],
};

/**
 * Mice (MOO1: Meklar) — +25% Production (Cybernetic)
 * Logical and methodical builders.
 */
export const MOUSE_PROFILE: AIPersonalityProfile = {
  type: 'builder',
  aggression: 20,
  expansionism: 55,
  diplomacy: 45,
  research: 50,
  baseFriendliness: 10,
  warReluctance: 15,
  treatyBonus: 15,
  backstabTendency: 5,
  traits: ['logical'],
};

/**
 * Rats (MOO1: Psilons) — +75% Research (ALL fields)
 * Research-focused, scientific.
 */
export const RAT_PROFILE: AIPersonalityProfile = {
  type: 'scientific',
  aggression: 15,
  expansionism: 25,
  diplomacy: 50,
  research: 90,
  baseFriendliness: 15,
  warReluctance: 25,
  treatyBonus: 20,
  backstabTendency: 10,
  traits: ['logical', 'tech_trader'],
};

/**
 * Ants (MOO1: Klackons) — +50% Production, Hive Mind
 * Industrial expansionists.
 */
export const ANT_PROFILE: AIPersonalityProfile = {
  type: 'expansionist',
  aggression: 40,
  expansionism: 80,
  diplomacy: 15,
  research: 20,
  baseFriendliness: -5,
  warReluctance: 10,
  treatyBonus: 0,
  backstabTendency: 0,
  traits: ['hive_mind'],
};

/**
 * Chameleons (MOO1: Darloks) — +60% Espionage
 * Paranoid spies who never trust.
 */
export const CHAMELEON_PROFILE: AIPersonalityProfile = {
  type: 'erratic',
  aggression: 45,
  expansionism: 35,
  diplomacy: 10,
  research: 40,
  baseFriendliness: 0,
  warReluctance: 10,
  treatyBonus: 0,
  backstabTendency: 70,
  traits: ['backstabber', 'xenophobic'],
};

/**
 * Rabbits (MOO1: Sakkra) — +100% Population Growth
 * Fearful prey who focus on population.
 * Note: Appease to survive, but Hamsters are the canonical "best starting
 * relations" race (design/diplomacy/ai-personalities.md).
 */
export const RABBIT_PROFILE: AIPersonalityProfile = {
  type: 'defensive',
  aggression: 10,
  expansionism: 45,
  diplomacy: 40,
  research: 30,
  baseFriendliness: 18,
  warReluctance: 40,
  treatyBonus: 10,
  backstabTendency: 0,
  traits: ['peaceful'],
};

/**
 * Hermit Crabs (MOO1: Silicoids) — Universal Planet Colonization
 * Slow, careful expansionists confident in their defenses.
 */
export const HERMIT_CRAB_PROFILE: AIPersonalityProfile = {
  type: 'hermit',
  aggression: 25,
  expansionism: 20,
  diplomacy: 30,
  research: 35,
  baseFriendliness: 0,
  warReluctance: 30,
  treatyBonus: -5,
  backstabTendency: 10,
  traits: ['honorable'],
};

// ── Lookup by race ─────────────────────────────────────────────────────────────

export type RaceProfileMap = Record<string, AIPersonalityProfile>;

export const RACE_PROFILES: RaceProfileMap = {
  'guinea_pigs': GUINEA_PIG_PROFILE,
  'ferrets': FERRET_PROFILE,
  'budgies': BUDGIE_PROFILE,
  'hamsters': HAMSTER_PROFILE,
  'mice': MOUSE_PROFILE,
  'rats': RAT_PROFILE,
  'ants': ANT_PROFILE,
  'chameleons': CHAMELEON_PROFILE,
  'rabbits': RABBIT_PROFILE,
  'hermit_crabs': HERMIT_CRAB_PROFILE,
};

/**
 * Get the personality profile for a given race ID.
 * Falls back to the hamster (balanced) profile if unknown.
 */
export function getPersonalityProfile(raceId: string): AIPersonalityProfile {
  return RACE_PROFILES[raceId] ?? HAMSTER_PROFILE;
}

/**
 * Apply personality profile to an existing AIPersonality object.
 * Used when initializing AIEmpire from race data.
 */
export function applyPersonalityProfile(
  raceId: string,
  aggressionOverride?: number,
): AIPersonalityProfile {
  const profile = getPersonalityProfile(raceId);
  return aggressionOverride !== undefined
    ? { ...profile, aggression: aggressionOverride }
    : profile;
}
