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
 * AI starting tech bonus configuration per difficulty.
 * From design/game-mechanics/difficulty.md §AI Starting Tech Bonuses.
 *
 * Hard: 2 bonus techs (racial_preference, random)
 * Impossible: 4 bonus techs (racial_preference x2, weapons, random), starting tier 2
 */
export type BonusTechField = 'racial_preference' | 'random' | 'weapons';

export interface AIStartingTechBonus {
  /** Number of bonus starting techs for AI. */
  bonusTechs: number;
  /** Starting tech tier (1 = normal, 2 = advanced start). */
  startingTier: number;
  /** Multiplier on AI tech costs. */
  techCostMult: number;
  /** Multiplier on AI research speed. */
  researchSpeedMult: number;
  /** Fields from which to select bonus techs (undefined = none). */
  bonusTechFields?: BonusTechField[];
}

/**
 * AI starting tech bonus table by difficulty.
 * Values from design/game-mechanics/difficulty.md §AI Starting Tech Bonuses.
 */
export const AI_STARTING_TECH_BONUSES: Record<Exclude<DifficultyLevel, 'custom'>, AIStartingTechBonus> = {
  simple: {
    bonusTechs: 0,
    startingTier: 1,
    techCostMult: 1.50,
    researchSpeedMult: 0.67,
  },
  easy: {
    bonusTechs: 0,
    startingTier: 1,
    techCostMult: 1.25,
    researchSpeedMult: 0.80,
  },
  average: {
    bonusTechs: 0,
    startingTier: 1,
    techCostMult: 1.00,
    researchSpeedMult: 1.00,
  },
  hard: {
    bonusTechs: 2,
    startingTier: 1,
    techCostMult: 0.75,
    researchSpeedMult: 1.33,
    bonusTechFields: ['racial_preference', 'random'],
  },
  impossible: {
    bonusTechs: 4,
    startingTier: 2,
    techCostMult: 0.50,
    researchSpeedMult: 2.00,
    bonusTechFields: ['racial_preference', 'racial_preference', 'weapons', 'random'],
  },
};

/**
 * Get AI starting tech bonus configuration for a difficulty level.
 * @param difficulty Game difficulty level.
 * @returns AI starting tech bonus configuration.
 */
export function getAIStartingTechBonus(difficulty: DifficultyLevel): AIStartingTechBonus {
  if (difficulty === 'custom') {
    return AI_STARTING_TECH_BONUSES.average;
  }
  return AI_STARTING_TECH_BONUSES[difficulty];
}

// ─────────────────────────────────────────────────────────────────────────────
// Guardian of Orion Stats
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Guardian of Orion combat stats by difficulty.
 * From design/game-mechanics/difficulty.md §Guardian of Orion Modifiers.
 *
 * | Stat          | Simple | Easy   | Average | Hard   | Impossible |
 * |---------------|--------|--------|---------|--------|------------|
 * | HP            | 16,000 | 24,000 | 32,000  | 40,000 | 48,000     |
 * | Attack Rating | +5     | +7     | +10     | +12    | +15        |
 * | Shields       | X      | XII    | XV      | XVIII  | XX         |
 * | Armor         | ×2.0   | ×3.0   | ×4.0    | ×5.0   | ×6.0       |
 * | Speed         | 2      | 3      | 4       | 5      | 6          |
 */
export interface GuardianStats {
  /** Guardian base HP. */
  hp: number;
  /** Attack rating bonus. */
  attackRating: number;
  /** Shield class (Roman numeral as number, e.g., 10 = X). */
  shieldClass: number;
  /** Armor damage reduction multiplier. */
  armorMultiplier: number;
  /** Movement speed in combat. */
  speed: number;
}

/**
 * Guardian of Orion stats by difficulty level.
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
 * @returns Guardian stats.
 */
export function getGuardianStats(difficulty: DifficultyLevel): GuardianStats {
  if (difficulty === 'custom') {
    return GUARDIAN_STATS.average;
  }
  return GUARDIAN_STATS[difficulty];
}

/**
 * Calculate Guardian effective HP (HP × armor multiplier).
 * From design/game-mechanics/difficulty.md §Guardian Effective HP Calculation.
 *
 * Effective_HP = Base_HP × Armor_Multiplier
 *
 * @param difficulty Game difficulty level.
 * @returns Guardian effective HP.
 */
export function getGuardianEffectiveHP(difficulty: DifficultyLevel): number {
  const stats = getGuardianStats(difficulty);
  return stats.hp * stats.armorMultiplier;
}

// ─────────────────────────────────────────────────────────────────────────────
// Space Monster Stats
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Space monster type identifiers.
 */
export type SpaceMonsterId = 'cosmic_blob' | 'crystal_horror' | 'void_wyrm';

/**
 * Difficulty scaling for space monsters.
 */
export interface MonsterDifficultyScaling {
  /** HP multiplier. */
  hpMult: number;
  /** Damage multiplier. */
  damageMult: number;
  /** Regeneration multiplier (for cosmic blob). */
  regenMult?: number;
  /** Shield class override (for crystal horror). */
  shieldClass?: number;
  /** Attack rating override (for void wyrm). */
  attackRating?: number;
}

/**
 * Base stats for a space monster.
 * From design/game-mechanics/difficulty.md §Monster Stats JSON Data.
 */
export interface SpaceMonsterStats {
  id: SpaceMonsterId;
  name: string;
  description: string;
  baseStats: {
    hp: number;
    regenPerTurn: number;
    speed: number;
    attackRating: number;
    defenseRating: number;
    damageMin: number;
    damageMax: number;
    armorClass?: number;
    shieldClass?: number;
  };
  difficultyScaling: Record<Exclude<DifficultyLevel, 'custom'>, MonsterDifficultyScaling>;
  abilities: string[];
}

/**
 * Space monster definitions from design doc.
 */
export const SPACE_MONSTERS: Record<SpaceMonsterId, SpaceMonsterStats> = {
  cosmic_blob: {
    id: 'cosmic_blob',
    name: 'Cosmic Blob',
    description: 'Amorphous space creature with regenerative abilities',
    baseStats: {
      hp: 1000,
      regenPerTurn: 100,
      speed: 1,
      attackRating: 0,
      defenseRating: 0,
      damageMin: 50,
      damageMax: 100,
      armorClass: 5,
    },
    difficultyScaling: {
      simple: { hpMult: 0.75, regenMult: 0.75, damageMult: 0.75 },
      easy: { hpMult: 0.90, regenMult: 0.90, damageMult: 0.90 },
      average: { hpMult: 1.00, regenMult: 1.00, damageMult: 1.00 },
      hard: { hpMult: 1.25, regenMult: 1.25, damageMult: 1.25 },
      impossible: { hpMult: 1.50, regenMult: 1.50, damageMult: 1.50 },
    },
    abilities: ['regeneration', 'immune_to_missiles'],
  },
  crystal_horror: {
    id: 'crystal_horror',
    name: 'Crystal Horror',
    description: 'Crystalline entity with powerful energy shields',
    baseStats: {
      hp: 800,
      regenPerTurn: 0,
      speed: 2,
      attackRating: 3,
      defenseRating: 2,
      damageMin: 75,
      damageMax: 125,
      shieldClass: 10,
    },
    difficultyScaling: {
      simple: { hpMult: 0.75, shieldClass: 8, damageMult: 0.75 },
      easy: { hpMult: 0.90, shieldClass: 9, damageMult: 0.90 },
      average: { hpMult: 1.00, shieldClass: 10, damageMult: 1.00 },
      hard: { hpMult: 1.25, shieldClass: 11, damageMult: 1.25 },
      impossible: { hpMult: 1.50, shieldClass: 12, damageMult: 1.50 },
    },
    abilities: ['reflect_beam_weapons', 'shield_regeneration'],
  },
  void_wyrm: {
    id: 'void_wyrm',
    name: 'Void Wyrm',
    description: 'Massive serpentine creature capable of devastating attacks',
    baseStats: {
      hp: 1500,
      regenPerTurn: 0,
      speed: 3,
      attackRating: 5,
      defenseRating: 3,
      damageMin: 100,
      damageMax: 200,
      armorClass: 8,
    },
    difficultyScaling: {
      simple: { hpMult: 0.75, damageMult: 0.75, attackRating: 3 },
      easy: { hpMult: 0.90, damageMult: 0.90, attackRating: 4 },
      average: { hpMult: 1.00, damageMult: 1.00, attackRating: 5 },
      hard: { hpMult: 1.25, damageMult: 1.25, attackRating: 6 },
      impossible: { hpMult: 1.50, damageMult: 1.50, attackRating: 7 },
    },
    abilities: ['multi_attack', 'armor_piercing'],
  },
};

/**
 * Get space monster base stats.
 * @param monsterId Monster type identifier.
 * @returns Base monster stats definition.
 */
export function getSpaceMonsterStats(monsterId: SpaceMonsterId): SpaceMonsterStats {
  return SPACE_MONSTERS[monsterId];
}

/**
 * Get scaled monster stats for a given difficulty.
 * @param monsterId Monster type identifier.
 * @param difficulty Game difficulty level.
 * @returns Scaled monster stats with difficulty adjustments applied.
 */
export function getScaledMonsterStats(
  monsterId: SpaceMonsterId,
  difficulty: DifficultyLevel,
): {
  hp: number;
  regenPerTurn: number;
  speed: number;
  attackRating: number;
  defenseRating: number;
  damageMin: number;
  damageMax: number;
  armorClass?: number;
  shieldClass?: number;
  abilities: string[];
} {
  const monster = SPACE_MONSTERS[monsterId];
  const diffKey = difficulty === 'custom' ? 'average' : difficulty;
  const scaling = monster.difficultyScaling[diffKey];
  const base = monster.baseStats;

  return {
    hp: Math.round(base.hp * scaling.hpMult),
    regenPerTurn: scaling.regenMult
      ? Math.round(base.regenPerTurn * scaling.regenMult)
      : base.regenPerTurn,
    speed: base.speed,
    attackRating: scaling.attackRating ?? base.attackRating,
    defenseRating: base.defenseRating,
    damageMin: Math.round(base.damageMin * scaling.damageMult),
    damageMax: Math.round(base.damageMax * scaling.damageMult),
    armorClass: base.armorClass,
    shieldClass: scaling.shieldClass ?? base.shieldClass,
    abilities: monster.abilities,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Coalition & Diplomacy
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Coalition check constants from design/game-mechanics/difficulty.md.
 */
export const COALITION_CONSTANTS = {
  /** Turns between coalition formation checks. */
  CHECK_INTERVAL: 25,
  /** Power ratio (leader vs. average AI) required to trigger coalition. */
  LEADER_THRESHOLD: 1.5,
} as const;

/**
 * Get the anti-player coalition probability for a difficulty level.
 * @param difficulty Game difficulty level.
 * @returns Probability (0.0–1.0) of AI forming anti-player coalition.
 */
export function getCoalitionProbability(difficulty: DifficultyLevel): number {
  return getDifficultyModifiers(difficulty).coalitionProbability;
}

/**
 * Get the AI war threshold modifier for a difficulty level.
 * Negative values mean AI is more eager to declare war.
 * @param difficulty Game difficulty level.
 * @returns War threshold modifier.
 */
export function getAIWarThreshold(difficulty: DifficultyLevel): number {
  return getDifficultyModifiers(difficulty).aiWarThreshold;
}

/**
 * Get the AI diplomatic forgiveness multiplier.
 * Higher values mean AI forgives transgressions more quickly.
 * @param difficulty Game difficulty level.
 * @returns Forgiveness multiplier.
 */
export function getAIForgiveness(difficulty: DifficultyLevel): number {
  return getDifficultyModifiers(difficulty).aiForgiveness;
}

/**
 * Get the council formation threshold for a difficulty level.
 * Council forms when this percentage of habitable planets are colonized.
 * From design/game-mechanics/difficulty.md §Council Voting Modifiers.
 *
 * | Difficulty | Council Formation |
 * |------------|-------------------|
 * | Simple     | 60% colonized     |
 * | Easy       | 55% colonized     |
 * | Average    | 50% colonized     |
 * | Hard       | 45% colonized     |
 * | Impossible | 40% colonized     |
 *
 * @param difficulty Game difficulty level.
 * @returns Council formation threshold as decimal (0.0–1.0).
 */
export function getCouncilFormationThreshold(difficulty: DifficultyLevel): number {
  return getDifficultyModifiers(difficulty).councilFormationThreshold;
}

/**
 * Get the bribe effectiveness multiplier for council votes.
 * @param difficulty Game difficulty level.
 * @returns Bribe effectiveness multiplier.
 */
export function getBribeEffectiveness(difficulty: DifficultyLevel): number {
  return getDifficultyModifiers(difficulty).bribeEffectiveness;
}

// ─────────────────────────────────────────────────────────────────────────────
// Difficulty Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * General difficulty system constants.
 * From design/game-mechanics/difficulty.md §Constants Summary.
 */
export const DIFFICULTY_CONSTANTS = {
  /** Number of difficulty levels (excluding custom). */
  DIFFICULTY_COUNT: 5,
  /** Simple difficulty index (0-indexed). */
  MIN_DIFFICULTY_INDEX: 0,
  /** Impossible difficulty index (0-indexed). */
  MAX_DIFFICULTY_INDEX: 4,
  /** Default difficulty index (Average). */
  DEFAULT_DIFFICULTY: 2,
  /** Turns between coalition checks. */
  COALITION_CHECK_INTERVAL: 25,
  /** Power ratio to trigger coalition. */
  COALITION_LEADER_THRESHOLD: 1.5,
  /** AI grace period (no aggression). */
  AI_GRACE_PERIOD_TURNS: 50,
  /** Minimum factory output per turn. */
  MIN_FACTORY_OUTPUT_PER_TURN: 1,
  /** Turn limit for AI to research tier 1 tech. */
  TIER_1_TECH_TURN_LIMIT: 20,
} as const;

/**
 * Score multipliers for leaderboards/achievements by difficulty.
 * From design/game-mechanics/difficulty.md §Constants JSON Data.
 */
export const SCORE_MULTIPLIERS: Record<Exclude<DifficultyLevel, 'custom'>, number> = {
  simple: 0.50,
  easy: 0.75,
  average: 1.00,
  hard: 1.50,
  impossible: 2.00,
};

/**
 * Get score multiplier for a difficulty level.
 * @param difficulty Game difficulty level.
 * @returns Score multiplier.
 */
export function getScoreMultiplier(difficulty: DifficultyLevel): number {
  if (difficulty === 'custom') {
    return SCORE_MULTIPLIERS.average;
  }
  return SCORE_MULTIPLIERS[difficulty];
}

/**
 * Difficulty level names for display.
 */
export const DIFFICULTY_NAMES: Record<Exclude<DifficultyLevel, 'custom'>, string> = {
  simple: 'Simple',
  easy: 'Easy',
  average: 'Average',
  hard: 'Hard',
  impossible: 'Impossible',
};

/**
 * Get display name for a difficulty level.
 * @param difficulty Difficulty level.
 * @returns Human-readable difficulty name.
 */
export function getDifficultyName(difficulty: DifficultyLevel): string {
  if (difficulty === 'custom') {
    return 'Custom';
  }
  return DIFFICULTY_NAMES[difficulty];
}
