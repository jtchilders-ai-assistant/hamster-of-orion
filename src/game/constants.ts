/**
 * Game constants — all values from design documents.
 * src/game/constants.ts
 *
 * Each constant includes a reference to its source design doc.
 * Do NOT change values without updating the corresponding design doc.
 */

// ── General ───────────────────────────────────────────────────────────────────

export const GAME_VERSION = '0.1.0';

// ── Economy: Production ───────────────────────────────────────────────────────
// Source: design/economy/factory-formulas.md

/**
 * Base output per factory per turn (before modifiers).
 * Source: design/economy/factory-formulas.md §Base Values
 *   "Base_Factory_Output = 1 BC per factory per turn"
 */
export const FACTORY_OUTPUT_BASE = 1.0;

/**
 * Base cost to build one factory (before tech reduction).
 * Source: design/economy/factory-formulas.md §Factory Construction Cost
 *   "Base_Factory_Cost = 10 BC"
 */
export const FACTORY_COST_BASE = 10;

/**
 * Minimum factory cost after all tech reductions.
 * Source: design/economy/factory-formulas.md §Factory Construction Cost
 *   "Minimum cost is 2 BC (Improved Industrial Tech 9)"
 */
export const FACTORY_COST_MIN = 2;

/**
 * Production output per population working as laborers.
 * Source: design/economy/slider-mathematics.md §Manual Labor
 *   "Population working as laborers: 0.5 BC per pop"
 */
export const POP_LABOR_OUTPUT = 0.5;

// ── Economy: Population Growth ────────────────────────────────────────────────
// Source: design/economy/population-growth.md

/**
 * Base population growth rate per turn (10%).
 * Source: design/economy/population-growth.md §Base Growth Rate
 *   "Base_Growth_Rate = 0.10 (10% per turn)"
 */
export const BASE_GROWTH_RATE = 0.10;

/**
 * Growth rate bonus from Fertile planet type.
 * Source: design/economy/population-growth.md §Environment Modifiers
 */
export const GROWTH_MOD_FERTILE = 1.5;

/**
 * Growth rate bonus from Gaia planet type.
 * Source: design/economy/population-growth.md §Environment Modifiers
 */
export const GROWTH_MOD_GAIA = 2.0;

/**
 * Growth rate penalty from Hostile planet type.
 * Source: design/economy/population-growth.md §Environment Modifiers
 */
export const GROWTH_MOD_HOSTILE = 0.5;

// ── Economy: Trade ────────────────────────────────────────────────────────────
// Source: design/diplomacy/relationship-formulas.md

/**
 * How many turns a trade agreement takes to reach full income.
 * Source: design/diplomacy/relationship-formulas.md §Trade Income Ramp-Up
 *   "Trade income ramps up over 30 turns"
 */
export const TRADE_RAMP_TURNS = 30;

/**
 * Fraction of prior trade ramp progress retained on renegotiation.
 * Source: design/diplomacy/relationship-formulas.md §Trade Renegotiation
 */
export const TRADE_RENEGOTIATION_RETENTION = 0.5;

/**
 * Hamster trade bonus multiplier (25% extra income).
 * Source: design/species/hamsters.md §Special Abilities
 */
export const HAMSTER_TRADE_BONUS = 1.25;

// ── Combat ────────────────────────────────────────────────────────────────────
// Source: design/ships/combat-algorithm.md

/**
 * Base hit chance before skill differential.
 * Source: design/ships/combat-algorithm.md §Hit Formula
 *   "Base_Hit_Chance = 50%"
 */
export const BASE_HIT_CHANCE = 50;

/**
 * Hit chance modifier per point of skill differential.
 * Source: design/ships/combat-algorithm.md §Hit Formula
 *   "Hit% = 50 + (AttackerSkill - DefenderSkill) × 5"
 */
export const HIT_SKILL_MODIFIER = 5;

/**
 * Minimum hit chance (can't go below this).
 * Source: design/ships/combat-algorithm.md §Hit Formula
 *   "Minimum hit chance: 5%"
 */
export const HIT_CHANCE_MIN = 5;

/**
 * Maximum hit chance (can't go above this).
 * Source: design/ships/combat-algorithm.md §Hit Formula
 *   "Maximum hit chance: 95%"
 */
export const HIT_CHANCE_MAX = 95;

/**
 * Maximum ships per fleet in combat.
 * Source: design/ships/combat-mechanics.md §Fleet Limits
 */
export const MAX_FLEET_SIZE = 20;

// ── Planets ───────────────────────────────────────────────────────────────────
// Source: design/planets/buildings.md

/**
 * Base cost to build one missile base.
 * Source: design/planets/buildings.md §Missile Bases
 *   "Cost: ~150 BC per base"
 */
export const MISSILE_BASE_COST = 150;

/**
 * Maximum planets an empire can control.
 * Source: design/game-mechanics/victory-conditions.md
 */
export const MAX_PLANETS_PER_EMPIRE = 100;

// ── Ship Design ───────────────────────────────────────────────────────────────
// Source: design/ships/ship-design.md

/**
 * Hull space by ship size class.
 * Source: design/ships/ship-design.md §Hull Classes
 */
export const HULL_SPACE = {
  small: 25,
  medium: 60,
  large: 120,
  huge: 250,
} as const;

/**
 * Base cost by ship size class (before components).
 * Source: design/ships/ship-design.md §Hull Classes
 */
export const HULL_COST = {
  small: 6,
  medium: 36,
  large: 120,
  huge: 360,
} as const;

// ── Research ──────────────────────────────────────────────────────────────────
// Source: design/technology/research-formulas.md

/**
 * Base research cost multiplier per tech tier.
 * Source: design/technology/research-formulas.md §Cost Formula
 *   "Cost = BaseCost × (1.5 ^ TechTier)"
 */
export const RESEARCH_COST_TIER_MULTIPLIER = 1.5;

/**
 * Research points per scientist per turn.
 * Source: design/technology/research-formulas.md §Research Output
 *   "Base: 1 RP per scientist"
 */
export const RESEARCH_PER_SCIENTIST = 1;

// ── Espionage ─────────────────────────────────────────────────────────────────
// Source: design/diplomacy/espionage.md

/**
 * Base espionage success chance.
 * Source: design/diplomacy/espionage.md §Success Calculation
 *   "Base success: 30%"
 */
export const ESPIONAGE_BASE_SUCCESS = 0.30;

/**
 * Cost per spy per turn.
 * Source: design/diplomacy/espionage.md §Spy Costs
 */
export const SPY_COST_PER_TURN = 2;

// ── Colonization ──────────────────────────────────────────────────────────────
// Source: design/planets/colonization.md

/**
 * Starting population on a newly colonized planet.
 * Source: design/planets/colonization.md §Initial Colony
 *   "Colonists start with 2 population"
 */
export const COLONY_STARTING_POP = 2;

/**
 * Colony ship cost.
 * Source: design/ships/ship-costs.md §Colony Ships
 */
export const COLONY_SHIP_COST = 500;

// ── UI Actions ────────────────────────────────────────────────────────────────

/** Action shown to display the turn summary / events screen after a turn ends. */
export const SHOW_TURN_SUMMARY = 'SHOW_TURN_SUMMARY';
