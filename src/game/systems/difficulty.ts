/**
 * Difficulty system — pure TypeScript, NO DOM.
 * src/game/systems/difficulty.ts
 *
 * Defines difficulty constants and modifiers per design/game-mechanics/difficulty.md.
 *
 * Key concepts:
 *   - 5 difficulty levels: Simple, Easy, Average, Hard, Impossible (+ Custom)
 *   - Each level defines multipliers for production, research, combat, growth, events
 *   - Separate modifiers for player and AI empires
 *   - All functions are pure; no mutation.
 */

import { DifficultyLevel } from '../state';

// ─────────────────────────────────────────────────────────────────────────────
// Difficulty Modifiers Type
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Complete set of difficulty modifiers for one difficulty level.
 * Values are multipliers (1.0 = no change) unless otherwise noted.
 */
export interface DifficultyModifiers {
  // ── Production ────────────────────────────────────────────────────────────
  /** Multiplier on player production output (factory + population). */
  playerProduction: number;
  /** Multiplier on AI production output. */
  aiProduction: number;

  // ── Research ──────────────────────────────────────────────────────────────
  /** Multiplier on player tech cost (1.0 = full cost, lower = cheaper). */
  playerResearchCost: number;
  /** Multiplier on AI tech cost. */
  aiResearchCost: number;

  // ── Combat ────────────────────────────────────────────────────────────────
  /** Additive modifier to player attack rating (e.g., +0.10 = +10%). */
  playerCombatAttack: number;
  /** Additive modifier to player defense rating. */
  playerCombatDefense: number;
  /** Additive modifier to AI attack rating. */
  aiCombatAttack: number;
  /** Additive modifier to AI defense rating. */
  aiCombatDefense: number;

  // ── Ground Combat ─────────────────────────────────────────────────────────
  /** Additive modifier to player ground combat effectiveness. */
  playerGroundCombat: number;
  /** Additive modifier to AI ground combat effectiveness. */
  aiGroundCombat: number;

  // ── Population Growth ─────────────────────────────────────────────────────
  /** Multiplier on player population growth rate. */
  playerGrowth: number;
  /** Multiplier on AI population growth rate. */
  aiGrowth: number;

  // ── Ship Maintenance ──────────────────────────────────────────────────────
  /** Multiplier on player ship maintenance costs. */
  playerMaintenance: number;
  /** Multiplier on AI ship maintenance costs. */
  aiMaintenance: number;

  // ── Events ────────────────────────────────────────────────────────────────
  /** Multiplier on event frequency (1.0 = baseline rate). */
  eventFrequency: number;
  /** Additive bias toward negative events (positive = more negative events). */
  eventNegativeBias: number;
  /** Multiplier on space monster stats (HP, damage). */
  monsterStrength: number;

  // ── Espionage ─────────────────────────────────────────────────────────────
  /** Additive modifier to player spy success chance. */
  playerSpySuccess: number;
  /** Additive modifier to AI spy success chance. */
  aiSpySuccess: number;
  /** Multiplier on player spy training cost. */
  playerSpyCost: number;

  // ── Diplomacy ─────────────────────────────────────────────────────────────
  /** Probability of AI forming anti-player coalition (0.0–1.0). */
  coalitionProbability: number;
  /** AI war declaration threshold modifier (negative = more eager). */
  aiWarThreshold: number;
  /** Multiplier on AI diplomatic forgiveness rate. */
  aiForgiveness: number;

  // ── Council ───────────────────────────────────────────────────────────────
  /** Galaxy colonization percentage to trigger council formation. */
  councilFormationThreshold: number;
  /** Multiplier on bribe effectiveness for council votes. */
  bribeEffectiveness: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Difficulty Constants Table
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Complete difficulty modifier table.
 * Values from design/game-mechanics/difficulty.md.
 */
export const DIFFICULTY_MODIFIERS: Record<Exclude<DifficultyLevel, 'custom'>, DifficultyModifiers> = {
  simple: {
    // Production
    playerProduction: 1.25,
    aiProduction: 0.75,
    // Research
    playerResearchCost: 1.00,
    aiResearchCost: 1.50,
    // Combat
    playerCombatAttack: 0.10,
    playerCombatDefense: 0.10,
    aiCombatAttack: -0.10,
    aiCombatDefense: -0.10,
    // Ground combat
    playerGroundCombat: 0.15,
    aiGroundCombat: -0.15,
    // Growth
    playerGrowth: 1.25,
    aiGrowth: 0.75,
    // Maintenance
    playerMaintenance: 0.75,
    aiMaintenance: 1.25,
    // Events
    eventFrequency: 0.50,
    eventNegativeBias: -0.25,
    monsterStrength: 0.75,
    // Espionage
    playerSpySuccess: 0.20,
    aiSpySuccess: -0.20,
    playerSpyCost: 0.75,
    // Diplomacy
    coalitionProbability: 0.00,
    aiWarThreshold: 30,
    aiForgiveness: 1.50,
    // Council
    councilFormationThreshold: 0.60,
    bribeEffectiveness: 1.50,
  },

  easy: {
    // Production
    playerProduction: 1.10,
    aiProduction: 0.90,
    // Research
    playerResearchCost: 1.00,
    aiResearchCost: 1.25,
    // Combat
    playerCombatAttack: 0.05,
    playerCombatDefense: 0.05,
    aiCombatAttack: -0.05,
    aiCombatDefense: -0.05,
    // Ground combat
    playerGroundCombat: 0.10,
    aiGroundCombat: -0.10,
    // Growth
    playerGrowth: 1.10,
    aiGrowth: 0.90,
    // Maintenance
    playerMaintenance: 0.90,
    aiMaintenance: 1.10,
    // Events
    eventFrequency: 0.75,
    eventNegativeBias: -0.10,
    monsterStrength: 0.90,
    // Espionage
    playerSpySuccess: 0.10,
    aiSpySuccess: -0.10,
    playerSpyCost: 0.90,
    // Diplomacy
    coalitionProbability: 0.10,
    aiWarThreshold: 15,
    aiForgiveness: 1.25,
    // Council
    councilFormationThreshold: 0.55,
    bribeEffectiveness: 1.25,
  },

  average: {
    // Production
    playerProduction: 1.00,
    aiProduction: 1.00,
    // Research
    playerResearchCost: 1.00,
    aiResearchCost: 1.00,
    // Combat
    playerCombatAttack: 0.00,
    playerCombatDefense: 0.00,
    aiCombatAttack: 0.00,
    aiCombatDefense: 0.00,
    // Ground combat
    playerGroundCombat: 0.00,
    aiGroundCombat: 0.00,
    // Growth
    playerGrowth: 1.00,
    aiGrowth: 1.00,
    // Maintenance
    playerMaintenance: 1.00,
    aiMaintenance: 1.00,
    // Events
    eventFrequency: 1.00,
    eventNegativeBias: 0.00,
    monsterStrength: 1.00,
    // Espionage
    playerSpySuccess: 0.00,
    aiSpySuccess: 0.00,
    playerSpyCost: 1.00,
    // Diplomacy
    coalitionProbability: 0.25,
    aiWarThreshold: 0,
    aiForgiveness: 1.00,
    // Council
    councilFormationThreshold: 0.50,
    bribeEffectiveness: 1.00,
  },

  hard: {
    // Production
    playerProduction: 0.90,
    aiProduction: 1.25,
    // Research
    playerResearchCost: 1.00,
    aiResearchCost: 0.75,
    // Combat
    playerCombatAttack: -0.05,
    playerCombatDefense: -0.05,
    aiCombatAttack: 0.05,
    aiCombatDefense: 0.05,
    // Ground combat
    playerGroundCombat: -0.10,
    aiGroundCombat: 0.10,
    // Growth
    playerGrowth: 0.90,
    aiGrowth: 1.10,
    // Maintenance
    playerMaintenance: 1.10,
    aiMaintenance: 0.90,
    // Events
    eventFrequency: 1.25,
    eventNegativeBias: 0.10,
    monsterStrength: 1.25,
    // Espionage
    playerSpySuccess: -0.10,
    aiSpySuccess: 0.10,
    playerSpyCost: 1.10,
    // Diplomacy
    coalitionProbability: 0.50,
    aiWarThreshold: -15,
    aiForgiveness: 0.75,
    // Council
    councilFormationThreshold: 0.45,
    bribeEffectiveness: 0.75,
  },

  impossible: {
    // Production
    playerProduction: 0.75,
    aiProduction: 1.50,
    // Research
    playerResearchCost: 1.00,
    aiResearchCost: 0.50,
    // Combat
    playerCombatAttack: -0.10,
    playerCombatDefense: -0.10,
    aiCombatAttack: 0.10,
    aiCombatDefense: 0.10,
    // Ground combat
    playerGroundCombat: -0.15,
    aiGroundCombat: 0.15,
    // Growth
    playerGrowth: 0.75,
    aiGrowth: 1.25,
    // Maintenance
    playerMaintenance: 1.25,
    aiMaintenance: 0.75,
    // Events
    eventFrequency: 1.50,
    eventNegativeBias: 0.25,
    monsterStrength: 1.50,
    // Espionage
    playerSpySuccess: -0.20,
    aiSpySuccess: 0.20,
    playerSpyCost: 1.25,
    // Diplomacy
    coalitionProbability: 0.75,
    aiWarThreshold: -30,
    aiForgiveness: 0.50,
    // Council
    councilFormationThreshold: 0.40,
    bribeEffectiveness: 0.50,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Accessor Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the difficulty modifiers for a given difficulty level.
 * Custom difficulty returns Average modifiers as baseline.
 */
export function getDifficultyModifiers(difficulty: DifficultyLevel): DifficultyModifiers {
  if (difficulty === 'custom') {
    // Custom difficulty defaults to Average; real custom would use per-field overrides.
    return DIFFICULTY_MODIFIERS.average;
  }
  return DIFFICULTY_MODIFIERS[difficulty];
}

/**
 * Get the production multiplier for an empire.
 * @param difficulty Game difficulty level.
 * @param isPlayer   True if this is the player empire.
 * @returns Production multiplier to apply to gross production.
 */
export function getProductionMultiplier(difficulty: DifficultyLevel, isPlayer: boolean): number {
  const mods = getDifficultyModifiers(difficulty);
  return isPlayer ? mods.playerProduction : mods.aiProduction;
}

/**
 * Get the research cost multiplier for an empire.
 * @param difficulty Game difficulty level.
 * @param isPlayer   True if this is the player empire.
 * @returns Research cost multiplier (lower = faster research).
 */
export function getResearchCostMultiplier(difficulty: DifficultyLevel, isPlayer: boolean): number {
  const mods = getDifficultyModifiers(difficulty);
  return isPlayer ? mods.playerResearchCost : mods.aiResearchCost;
}

/**
 * Get the combat attack modifier for an empire.
 * @param difficulty Game difficulty level.
 * @param isPlayer   True if this is the player empire.
 * @returns Additive attack modifier (e.g., 0.10 = +10% hit chance).
 */
export function getCombatAttackModifier(difficulty: DifficultyLevel, isPlayer: boolean): number {
  const mods = getDifficultyModifiers(difficulty);
  return isPlayer ? mods.playerCombatAttack : mods.aiCombatAttack;
}

/**
 * Get the combat defense modifier for an empire.
 * @param difficulty Game difficulty level.
 * @param isPlayer   True if this is the player empire.
 * @returns Additive defense modifier.
 */
export function getCombatDefenseModifier(difficulty: DifficultyLevel, isPlayer: boolean): number {
  const mods = getDifficultyModifiers(difficulty);
  return isPlayer ? mods.playerCombatDefense : mods.aiCombatDefense;
}

/**
 * Get the ground combat modifier for an empire.
 * @param difficulty Game difficulty level.
 * @param isPlayer   True if this is the player empire.
 * @returns Additive ground combat modifier.
 */
export function getGroundCombatModifier(difficulty: DifficultyLevel, isPlayer: boolean): number {
  const mods = getDifficultyModifiers(difficulty);
  return isPlayer ? mods.playerGroundCombat : mods.aiGroundCombat;
}

/**
 * Get the population growth multiplier for an empire.
 * @param difficulty Game difficulty level.
 * @param isPlayer   True if this is the player empire.
 * @returns Growth multiplier.
 */
export function getGrowthMultiplier(difficulty: DifficultyLevel, isPlayer: boolean): number {
  const mods = getDifficultyModifiers(difficulty);
  return isPlayer ? mods.playerGrowth : mods.aiGrowth;
}

/**
 * Get the ship maintenance multiplier for an empire.
 * @param difficulty Game difficulty level.
 * @param isPlayer   True if this is the player empire.
 * @returns Maintenance cost multiplier.
 */
export function getMaintenanceMultiplier(difficulty: DifficultyLevel, isPlayer: boolean): number {
  const mods = getDifficultyModifiers(difficulty);
  return isPlayer ? mods.playerMaintenance : mods.aiMaintenance;
}

/**
 * Get the event frequency multiplier.
 * @param difficulty Game difficulty level.
 * @returns Event frequency multiplier (higher = more events).
 */
export function getEventFrequencyMultiplier(difficulty: DifficultyLevel): number {
  return getDifficultyModifiers(difficulty).eventFrequency;
}

/**
 * Get the event negative bias.
 * @param difficulty Game difficulty level.
 * @returns Additive bias (positive = more negative events).
 */
export function getEventNegativeBias(difficulty: DifficultyLevel): number {
  return getDifficultyModifiers(difficulty).eventNegativeBias;
}

/**
 * Get the monster strength multiplier.
 * @param difficulty Game difficulty level.
 * @returns Monster stat multiplier.
 */
export function getMonsterStrengthMultiplier(difficulty: DifficultyLevel): number {
  return getDifficultyModifiers(difficulty).monsterStrength;
}

/**
 * Get the spy success modifier for an empire.
 * @param difficulty Game difficulty level.
 * @param isPlayer   True if this is the player empire.
 * @returns Additive spy success modifier.
 */
export function getSpySuccessModifier(difficulty: DifficultyLevel, isPlayer: boolean): number {
  const mods = getDifficultyModifiers(difficulty);
  return isPlayer ? mods.playerSpySuccess : mods.aiSpySuccess;
}

/**
 * Get the spy cost multiplier for the player.
 * AI always pays baseline (1.0) per design doc.
 * @param difficulty Game difficulty level.
 * @param isPlayer   True if this is the player empire.
 * @returns Spy cost multiplier.
 */
export function getSpyCostMultiplier(difficulty: DifficultyLevel, isPlayer: boolean): number {
  if (!isPlayer) return 1.0; // AI always pays baseline
  return getDifficultyModifiers(difficulty).playerSpyCost;
}

// ─────────────────────────────────────────────────────────────────────────────
// Starting Conditions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Starting conditions for player homeworld based on difficulty.
 * From design/game-mechanics/difficulty.md §Starting Conditions.
 *
 * | Difficulty | Population | Factories | Ships | Reserve BC |
 * |------------|------------|-----------|-------|------------|
 * | Simple     | 50         | 40        | 2 Scouts, 1 Fighter | 100 |
 * | Easy       | 45         | 35        | 2 Scouts            | 50  |
 * | Average    | 40         | 30        | 1 Scout             | 0   |
 * | Hard       | 40         | 30        | 1 Scout             | 0   |
 * | Impossible | 40         | 30        | 1 Scout             | 0   |
 *
 * Note: AI empires always start with Average-level conditions (40 pop, 30 factories, 1 scout, 0 BC).
 */
export interface StartingConditions {
  /** Homeworld starting population. */
  population: number;
  /** Homeworld starting factories. */
  factories: number;
  /** Starting treasury (BC). */
  reserveBC: number;
  /** Number of scout ships. */
  scouts: number;
  /** Number of fighter ships. */
  fighters: number;
}

/**
 * Starting conditions table by difficulty level.
 */
export const STARTING_CONDITIONS: Record<Exclude<DifficultyLevel, 'custom'>, StartingConditions> = {
  simple: {
    population: 50,
    factories: 40,
    reserveBC: 100,
    scouts: 2,
    fighters: 1,
  },
  easy: {
    population: 45,
    factories: 35,
    reserveBC: 50,
    scouts: 2,
    fighters: 0,
  },
  average: {
    population: 40,
    factories: 30,
    reserveBC: 0,
    scouts: 1,
    fighters: 0,
  },
  hard: {
    population: 40,
    factories: 30,
    reserveBC: 0,
    scouts: 1,
    fighters: 0,
  },
  impossible: {
    population: 40,
    factories: 30,
    reserveBC: 0,
    scouts: 1,
    fighters: 0,
  },
};

/**
 * AI empires always use Average-level starting conditions.
 */
export const AI_STARTING_CONDITIONS: StartingConditions = STARTING_CONDITIONS.average;

/**
 * Get starting conditions for an empire based on difficulty.
 * @param difficulty Game difficulty level.
 * @param isPlayer   True if this is the player empire.
 * @returns Starting conditions for homeworld and treasury.
 */
export function getStartingConditions(difficulty: DifficultyLevel, isPlayer: boolean): StartingConditions {
  if (!isPlayer) {
    // AI empires always start with Average-level conditions
    return AI_STARTING_CONDITIONS;
  }
  if (difficulty === 'custom' || !(difficulty in STARTING_CONDITIONS)) {
    // Custom difficulty or unknown difficulty defaults to Average starting conditions
    return STARTING_CONDITIONS.average;
  }
  return STARTING_CONDITIONS[difficulty];
}


// ─────────────────────────────────────────────────────────────────────────────
// AI Starting Tech Bonuses
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AI starting tech bonus configuration by difficulty.
 * From design/game-mechanics/difficulty.md §AI Starting Tech Bonuses.
 *
 * | Difficulty | Bonus Techs | Starting Tier | Fields                            |
 * |------------|-------------|---------------|-----------------------------------|
 * | Simple     | 0           | 1             | none                              |
 * | Easy       | 0           | 1             | none                              |
 * | Average    | 0           | 1             | none                              |
 * | Hard       | 2           | 1             | racial_preference, random         |
 * | Impossible | 4           | 2             | 2×racial_pref, weapons, random    |
 */
export interface AIStartingTechBonus {
  /** Number of bonus starting techs for AI. */
  bonusTechs: number;
  /** Starting tech tier (1 = normal, 2 = advanced start for Impossible). */
  startingTier: number;
  /**
   * Fields to select bonus techs from:
   *   'racial_preference' — pick from race's preferred tech field
   *   'random' — pick any tier-appropriate tech
   *   'weapons' — guarantee early weapon upgrade
   */
  bonusTechFields: Array<'racial_preference' | 'random' | 'weapons'>;
}

/**
 * AI starting tech bonus table by difficulty.
 */
export const AI_STARTING_TECH_BONUSES: Record<Exclude<DifficultyLevel, 'custom'>, AIStartingTechBonus> = {
  simple: {
    bonusTechs: 0,
    startingTier: 1,
    bonusTechFields: [],
  },
  easy: {
    bonusTechs: 0,
    startingTier: 1,
    bonusTechFields: [],
  },
  average: {
    bonusTechs: 0,
    startingTier: 1,
    bonusTechFields: [],
  },
  hard: {
    bonusTechs: 2,
    startingTier: 1,
    bonusTechFields: ['racial_preference', 'random'],
  },
  impossible: {
    bonusTechs: 4,
    startingTier: 2,
    bonusTechFields: ['racial_preference', 'racial_preference', 'weapons', 'random'],
  },
};

/**
 * Get AI starting tech bonuses for a difficulty level.
 * @param difficulty Game difficulty level.
 * @returns AI starting tech bonus configuration.
 */
export function getAIStartingTechBonus(difficulty: DifficultyLevel): AIStartingTechBonus {
  if (difficulty === 'custom' || !(difficulty in AI_STARTING_TECH_BONUSES)) {
    return AI_STARTING_TECH_BONUSES.average;
  }
  return AI_STARTING_TECH_BONUSES[difficulty];
}

// ─────────────────────────────────────────────────────────────────────────────
// Guardian of Orion Stats
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Guardian of Orion stats by difficulty level.
 * From design/game-mechanics/difficulty.md §Guardian of Orion Modifiers.
 *
 * | Stat          | Simple | Easy   | Average | Hard   | Impossible |
 * |---------------|--------|--------|---------|--------|------------|
 * | HP            | 16,000 | 24,000 | 32,000  | 40,000 | 48,000     |
 * | Attack Rating | +5     | +7     | +10     | +12    | +15        |
 * | Shield Class  | X (10) | XII    | XV      | XVIII  | XX (20)    |
 * | Armor Mult    | ×2.0   | ×3.0   | ×4.0    | ×5.0   | ×6.0       |
 * | Speed         | 2      | 3      | 4       | 5      | 6          |
 *
 * Effective HP = Base HP × Armor Multiplier
 */
export interface GuardianStats {
  /** Base HP (before armor multiplier). */
  hp: number;
  /** Attack rating bonus. */
  attackRating: number;
  /** Shield class (damage absorbed per hit). */
  shieldClass: number;
  /** Armor multiplier (effective HP = hp × armorMultiplier). */
  armorMultiplier: number;
  /** Combat speed (hexes per turn). */
  speed: number;
}

/**
 * Guardian stats table by difficulty level.
 */
export const GUARDIAN_STATS: Record<Exclude<DifficultyLevel, 'custom'>, GuardianStats> = {
  simple: {
    hp: 16000,
    attackRating: 5,
    shieldClass: 10,
    armorMultiplier: 2.0,
    speed: 2,
  },
  easy: {
    hp: 24000,
    attackRating: 7,
    shieldClass: 12,
    armorMultiplier: 3.0,
    speed: 3,
  },
  average: {
    hp: 32000,
    attackRating: 10,
    shieldClass: 15,
    armorMultiplier: 4.0,
    speed: 4,
  },
  hard: {
    hp: 40000,
    attackRating: 12,
    shieldClass: 18,
    armorMultiplier: 5.0,
    speed: 5,
  },
  impossible: {
    hp: 48000,
    attackRating: 15,
    shieldClass: 20,
    armorMultiplier: 6.0,
    speed: 6,
  },
};

/**
 * Get Guardian of Orion stats for a difficulty level.
 * @param difficulty Game difficulty level.
 * @returns Guardian combat stats.
 */
export function getGuardianStats(difficulty: DifficultyLevel): GuardianStats {
  if (difficulty === 'custom' || !(difficulty in GUARDIAN_STATS)) {
    return GUARDIAN_STATS.average;
  }
  return GUARDIAN_STATS[difficulty];
}

/**
 * Calculate effective HP for Guardian (HP × armor multiplier).
 * From design/game-mechanics/difficulty.md §Guardian Effective HP Calculation:
 *   - Simple: 16,000 × 2.0 = 32,000 effective HP
 *   - Impossible: 48,000 × 6.0 = 288,000 effective HP
 *
 * @param difficulty Game difficulty level.
 * @returns Effective HP after armor.
 */
export function getGuardianEffectiveHP(difficulty: DifficultyLevel): number {
  const stats = getGuardianStats(difficulty);
  return stats.hp * stats.armorMultiplier;
}

// ─────────────────────────────────────────────────────────────────────────────
// Diplomacy & Council Accessors
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the probability of AI forming an anti-player coalition.
 * From design/game-mechanics/difficulty.md §Anti-Player Coalition:
 *   - Simple: 0%, Easy: 10%, Average: 25%, Hard: 50%, Impossible: 75%
 *
 * Coalition triggers when player has 1.5× average AI power.
 *
 * @param difficulty Game difficulty level.
 * @returns Coalition probability (0.0–1.0).
 */
export function getCoalitionProbability(difficulty: DifficultyLevel): number {
  return getDifficultyModifiers(difficulty).coalitionProbability;
}

/**
 * Get the council formation threshold (galaxy colonization percentage).
 * From design/game-mechanics/difficulty.md §Council Formation Timing:
 *   - Simple: 60%, Easy: 55%, Average: 50%, Hard: 45%, Impossible: 40%
 *
 * @param difficulty Game difficulty level.
 * @returns Colonization percentage required (0.0–1.0).
 */
export function getCouncilFormationThreshold(difficulty: DifficultyLevel): number {
  return getDifficultyModifiers(difficulty).councilFormationThreshold;
}

/**
 * Get the bribe effectiveness multiplier for council votes.
 * From design/game-mechanics/difficulty.md §AI Vote Behavior:
 *   - Simple: 1.50×, Easy: 1.25×, Average: 1.00×, Hard: 0.75×, Impossible: 0.50×
 *
 * @param difficulty Game difficulty level.
 * @returns Bribe effectiveness multiplier.
 */
export function getBribeEffectiveness(difficulty: DifficultyLevel): number {
  return getDifficultyModifiers(difficulty).bribeEffectiveness;
}

/**
 * Get the AI war declaration threshold modifier.
 * From design/game-mechanics/difficulty.md §AI Diplomatic Behavior:
 *   - Simple: +30 (very reluctant), Easy: +15, Average: 0, Hard: -15, Impossible: -30
 * Negative values mean AI is more eager to declare war.
 *
 * @param difficulty Game difficulty level.
 * @returns War threshold modifier (additive to relation level).
 */
export function getAIWarThreshold(difficulty: DifficultyLevel): number {
  return getDifficultyModifiers(difficulty).aiWarThreshold;
}

/**
 * Get the AI diplomatic forgiveness rate multiplier.
 * From design/game-mechanics/difficulty.md §AI Diplomatic Behavior:
 *   - Simple: 1.50×, Easy: 1.25×, Average: 1.00×, Hard: 0.75×, Impossible: 0.50×
 * Higher = faster relation recovery after negative events.
 *
 * @param difficulty Game difficulty level.
 * @returns Forgiveness multiplier.
 */
export function getAIForgiveness(difficulty: DifficultyLevel): number {
  return getDifficultyModifiers(difficulty).aiForgiveness;
}
