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
