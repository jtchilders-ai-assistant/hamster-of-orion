/**
 * Difficulty system tests.
 * test/game/systems/difficulty.test.ts
 *
 * Validates functions in src/game/systems/difficulty.ts against
 * design/game-mechanics/difficulty.md.
 */

import { describe, it, expect } from 'vitest';
import {
  getDifficultyModifiers,
  getProductionMultiplier,
  getResearchCostMultiplier,
  getCombatAttackModifier,
  getCombatDefenseModifier,
  getGroundCombatModifier,
  getGrowthMultiplier,
  getMaintenanceMultiplier,
  getEventFrequencyMultiplier,
  getEventNegativeBias,
  getMonsterStrengthMultiplier,
  getSpySuccessModifier,
  getSpyCostMultiplier,
  getStartingConditions,
  getGuardianStats,
  getGuardianEffectiveHP,
  getAIStartingTechBonus,
  getCouncilFormationThreshold,
  DIFFICULTY_MODIFIERS,
  STARTING_CONDITIONS,
  AI_STARTING_CONDITIONS,
  GUARDIAN_STATS,
  AI_STARTING_TECH_BONUSES,
  DifficultyModifiers,
  StartingConditions,
  GuardianStats,
  AIStartingTechBonus,
} from '../../../src/game/systems/difficulty';
import { DifficultyLevel } from '../../../src/game/state';

// ── 1. Production Modifiers ──────────────────────────────────────────────────

describe('Production Modifiers (design/game-mechanics/difficulty.md §Production)', () => {
  it('Simple: player 1.25×, AI 0.75×', () => {
    expect(getProductionMultiplier('simple', true)).toBe(1.25);
    expect(getProductionMultiplier('simple', false)).toBe(0.75);
  });

  it('Easy: player 1.10×, AI 0.90×', () => {
    expect(getProductionMultiplier('easy', true)).toBe(1.10);
    expect(getProductionMultiplier('easy', false)).toBe(0.90);
  });

  it('Average: player 1.00×, AI 1.00×', () => {
    expect(getProductionMultiplier('average', true)).toBe(1.00);
    expect(getProductionMultiplier('average', false)).toBe(1.00);
  });

  it('Hard: player 0.90×, AI 1.25×', () => {
    expect(getProductionMultiplier('hard', true)).toBe(0.90);
    expect(getProductionMultiplier('hard', false)).toBe(1.25);
  });

  it('Impossible: player 0.75×, AI 1.50×', () => {
    expect(getProductionMultiplier('impossible', true)).toBe(0.75);
    expect(getProductionMultiplier('impossible', false)).toBe(1.50);
  });
});

// ── 2. Research Modifiers ────────────────────────────────────────────────────

describe('Research Cost Modifiers (design/game-mechanics/difficulty.md §Research)', () => {
  it('Player research cost is always 1.00× regardless of difficulty', () => {
    expect(getResearchCostMultiplier('simple', true)).toBe(1.00);
    expect(getResearchCostMultiplier('average', true)).toBe(1.00);
    expect(getResearchCostMultiplier('impossible', true)).toBe(1.00);
  });

  it('AI research cost: Simple 1.50×, Easy 1.25×, Average 1.00×, Hard 0.75×, Impossible 0.50×', () => {
    expect(getResearchCostMultiplier('simple', false)).toBe(1.50);
    expect(getResearchCostMultiplier('easy', false)).toBe(1.25);
    expect(getResearchCostMultiplier('average', false)).toBe(1.00);
    expect(getResearchCostMultiplier('hard', false)).toBe(0.75);
    expect(getResearchCostMultiplier('impossible', false)).toBe(0.50);
  });
});

// ── 3. Combat Modifiers ──────────────────────────────────────────────────────

describe('Combat Modifiers (design/game-mechanics/difficulty.md §Combat)', () => {
  it('Simple: player +10% attack/defense, AI -10%', () => {
    expect(getCombatAttackModifier('simple', true)).toBe(0.10);
    expect(getCombatDefenseModifier('simple', true)).toBe(0.10);
    expect(getCombatAttackModifier('simple', false)).toBe(-0.10);
    expect(getCombatDefenseModifier('simple', false)).toBe(-0.10);
  });

  it('Average: no modifiers for either player or AI', () => {
    expect(getCombatAttackModifier('average', true)).toBe(0.00);
    expect(getCombatDefenseModifier('average', true)).toBe(0.00);
    expect(getCombatAttackModifier('average', false)).toBe(0.00);
    expect(getCombatDefenseModifier('average', false)).toBe(0.00);
  });

  it('Impossible: player -10%, AI +10%', () => {
    expect(getCombatAttackModifier('impossible', true)).toBe(-0.10);
    expect(getCombatDefenseModifier('impossible', true)).toBe(-0.10);
    expect(getCombatAttackModifier('impossible', false)).toBe(0.10);
    expect(getCombatDefenseModifier('impossible', false)).toBe(0.10);
  });
});

// ── 4. Ground Combat Modifiers ───────────────────────────────────────────────

describe('Ground Combat Modifiers (design/game-mechanics/difficulty.md §Ground Combat)', () => {
  it('Simple: player +15%, AI -15%', () => {
    expect(getGroundCombatModifier('simple', true)).toBe(0.15);
    expect(getGroundCombatModifier('simple', false)).toBe(-0.15);
  });

  it('Impossible: player -15%, AI +15%', () => {
    expect(getGroundCombatModifier('impossible', true)).toBe(-0.15);
    expect(getGroundCombatModifier('impossible', false)).toBe(0.15);
  });
});

// ── 5. Population Growth Modifiers ───────────────────────────────────────────

describe('Population Growth Modifiers (design/game-mechanics/difficulty.md §Growth)', () => {
  it('Simple: player 1.25×, AI 0.75×', () => {
    expect(getGrowthMultiplier('simple', true)).toBe(1.25);
    expect(getGrowthMultiplier('simple', false)).toBe(0.75);
  });

  it('Average: player 1.00×, AI 1.00×', () => {
    expect(getGrowthMultiplier('average', true)).toBe(1.00);
    expect(getGrowthMultiplier('average', false)).toBe(1.00);
  });

  it('Impossible: player 0.75×, AI 1.25×', () => {
    expect(getGrowthMultiplier('impossible', true)).toBe(0.75);
    expect(getGrowthMultiplier('impossible', false)).toBe(1.25);
  });
});

// ── 6. Ship Maintenance Modifiers ────────────────────────────────────────────

describe('Ship Maintenance Modifiers (design/game-mechanics/difficulty.md §Maintenance)', () => {
  it('Simple: player 0.75×, AI 1.25×', () => {
    expect(getMaintenanceMultiplier('simple', true)).toBe(0.75);
    expect(getMaintenanceMultiplier('simple', false)).toBe(1.25);
  });

  it('Impossible: player 1.25×, AI 0.75×', () => {
    expect(getMaintenanceMultiplier('impossible', true)).toBe(1.25);
    expect(getMaintenanceMultiplier('impossible', false)).toBe(0.75);
  });
});

// ── 7. Event Modifiers ───────────────────────────────────────────────────────

describe('Event Modifiers (design/game-mechanics/difficulty.md §Events)', () => {
  it('Event frequency: Simple 0.50×, Average 1.00×, Impossible 1.50×', () => {
    expect(getEventFrequencyMultiplier('simple')).toBe(0.50);
    expect(getEventFrequencyMultiplier('average')).toBe(1.00);
    expect(getEventFrequencyMultiplier('impossible')).toBe(1.50);
  });

  it('Negative event bias: Simple -0.25, Average 0.00, Impossible +0.25', () => {
    expect(getEventNegativeBias('simple')).toBe(-0.25);
    expect(getEventNegativeBias('average')).toBe(0.00);
    expect(getEventNegativeBias('impossible')).toBe(0.25);
  });

  it('Monster strength: Simple 0.75×, Average 1.00×, Impossible 1.50×', () => {
    expect(getMonsterStrengthMultiplier('simple')).toBe(0.75);
    expect(getMonsterStrengthMultiplier('average')).toBe(1.00);
    expect(getMonsterStrengthMultiplier('impossible')).toBe(1.50);
  });
});

// ── 8. Starting Conditions ───────────────────────────────────────────────────

describe('Starting Conditions (design/game-mechanics/difficulty.md §Starting Conditions)', () => {
  it('Simple player: 50 pop, 40 factories, 100 BC, 2 scouts, 1 fighter', () => {
    const conditions = getStartingConditions('simple', true);
    expect(conditions.population).toBe(50);
    expect(conditions.factories).toBe(40);
    expect(conditions.reserveBC).toBe(100);
    expect(conditions.scouts).toBe(2);
    expect(conditions.fighters).toBe(1);
  });

  it('Easy player: 45 pop, 35 factories, 50 BC, 2 scouts, 0 fighters', () => {
    const conditions = getStartingConditions('easy', true);
    expect(conditions.population).toBe(45);
    expect(conditions.factories).toBe(35);
    expect(conditions.reserveBC).toBe(50);
    expect(conditions.scouts).toBe(2);
    expect(conditions.fighters).toBe(0);
  });

  it('Average/Hard/Impossible player: 40 pop, 30 factories, 0 BC, 1 scout, 0 fighters', () => {
    for (const diff of ['average', 'hard', 'impossible'] as DifficultyLevel[]) {
      const conditions = getStartingConditions(diff, true);
      expect(conditions.population).toBe(40);
      expect(conditions.factories).toBe(30);
      expect(conditions.reserveBC).toBe(0);
      expect(conditions.scouts).toBe(1);
      expect(conditions.fighters).toBe(0);
    }
  });

  it('AI always starts with Average-level conditions', () => {
    for (const diff of ['simple', 'easy', 'average', 'hard', 'impossible'] as DifficultyLevel[]) {
      const conditions = getStartingConditions(diff, false);
      expect(conditions.population).toBe(40);
      expect(conditions.factories).toBe(30);
      expect(conditions.reserveBC).toBe(0);
      expect(conditions.scouts).toBe(1);
      expect(conditions.fighters).toBe(0);
    }
  });
});

// ── 9. Guardian of Orion Stats ───────────────────────────────────────────────

describe('Guardian of Orion Stats (design/game-mechanics/difficulty.md §Guardian)', () => {
  it('Simple: 16k HP, +5 attack, shield X, 2.0× armor, speed 2', () => {
    const stats = getGuardianStats('simple');
    expect(stats.hp).toBe(16000);
    expect(stats.attackRating).toBe(5);
    expect(stats.shieldClass).toBe(10);
    expect(stats.armorMultiplier).toBe(2.0);
    expect(stats.speed).toBe(2);
  });

  it('Average: 32k HP, +10 attack, shield XV, 4.0× armor, speed 4', () => {
    const stats = getGuardianStats('average');
    expect(stats.hp).toBe(32000);
    expect(stats.attackRating).toBe(10);
    expect(stats.shieldClass).toBe(15);
    expect(stats.armorMultiplier).toBe(4.0);
    expect(stats.speed).toBe(4);
  });

  it('Impossible: 48k HP, +15 attack, shield XX, 6.0× armor, speed 6', () => {
    const stats = getGuardianStats('impossible');
    expect(stats.hp).toBe(48000);
    expect(stats.attackRating).toBe(15);
    expect(stats.shieldClass).toBe(20);
    expect(stats.armorMultiplier).toBe(6.0);
    expect(stats.speed).toBe(6);
  });

  it('Effective HP calculation: HP × armorMultiplier', () => {
    expect(getGuardianEffectiveHP('simple')).toBe(16000 * 2.0);    // 32k
    expect(getGuardianEffectiveHP('average')).toBe(32000 * 4.0);   // 128k
    expect(getGuardianEffectiveHP('impossible')).toBe(48000 * 6.0); // 288k
  });
});

// ── 10. AI Starting Tech Bonuses ─────────────────────────────────────────────

describe('AI Starting Tech Bonuses (design/game-mechanics/difficulty.md §AI Starting Tech)', () => {
  it('Simple/Easy/Average: 0 bonus techs, tier 1 start', () => {
    for (const diff of ['simple', 'easy', 'average'] as DifficultyLevel[]) {
      const bonus = getAIStartingTechBonus(diff);
      expect(bonus.bonusTechs).toBe(0);
      expect(bonus.startingTier).toBe(1);
      expect(bonus.bonusTechFields).toHaveLength(0);
    }
  });

  it('Hard: 2 bonus techs (racial_preference + random), tier 1 start', () => {
    const bonus = getAIStartingTechBonus('hard');
    expect(bonus.bonusTechs).toBe(2);
    expect(bonus.startingTier).toBe(1);
    expect(bonus.bonusTechFields).toEqual(['racial_preference', 'random']);
  });

  it('Impossible: 4 bonus techs (2 racial + weapons + random), tier 2 start', () => {
    const bonus = getAIStartingTechBonus('impossible');
    expect(bonus.bonusTechs).toBe(4);
    expect(bonus.startingTier).toBe(2);
    expect(bonus.bonusTechFields).toEqual(['racial_preference', 'racial_preference', 'weapons', 'random']);
  });
});

// ── 11. Council Formation Threshold ──────────────────────────────────────────

describe('Council Formation Threshold (design/game-mechanics/difficulty.md §Council)', () => {
  it('Thresholds: Simple 60%, Easy 55%, Average 50%, Hard 45%, Impossible 40%', () => {
    expect(getCouncilFormationThreshold('simple')).toBe(0.60);
    expect(getCouncilFormationThreshold('easy')).toBe(0.55);
    expect(getCouncilFormationThreshold('average')).toBe(0.50);
    expect(getCouncilFormationThreshold('hard')).toBe(0.45);
    expect(getCouncilFormationThreshold('impossible')).toBe(0.40);
  });
});

// ── 12. Custom Difficulty ────────────────────────────────────────────────────

describe('Custom Difficulty', () => {
  it('Custom difficulty defaults to Average modifiers', () => {
    const customMods = getDifficultyModifiers('custom');
    const averageMods = getDifficultyModifiers('average');
    expect(customMods).toEqual(averageMods);
  });

  it('Custom starting conditions default to Average', () => {
    const customConds = getStartingConditions('custom', true);
    const averageConds = getStartingConditions('average', true);
    expect(customConds).toEqual(averageConds);
  });

  it('Custom Guardian stats default to Average', () => {
    const customStats = getGuardianStats('custom');
    const averageStats = getGuardianStats('average');
    expect(customStats).toEqual(averageStats);
  });

  it('Custom AI tech bonus defaults to Average (no bonus)', () => {
    const customBonus = getAIStartingTechBonus('custom');
    const averageBonus = getAIStartingTechBonus('average');
    expect(customBonus).toEqual(averageBonus);
  });
});

// ── 13. Espionage Modifiers ──────────────────────────────────────────────────

describe('Espionage Modifiers (design/game-mechanics/difficulty.md §Espionage)', () => {
  it('Spy success modifiers scale by difficulty', () => {
    expect(getSpySuccessModifier('simple', true)).toBe(0.20);
    expect(getSpySuccessModifier('simple', false)).toBe(-0.20);
    expect(getSpySuccessModifier('impossible', true)).toBe(-0.20);
    expect(getSpySuccessModifier('impossible', false)).toBe(0.20);
  });

  it('AI always pays baseline spy cost (1.0)', () => {
    for (const diff of ['simple', 'easy', 'average', 'hard', 'impossible'] as DifficultyLevel[]) {
      expect(getSpyCostMultiplier(diff, false)).toBe(1.0);
    }
  });

  it('Player spy cost varies: Simple 0.75×, Impossible 1.25×', () => {
    expect(getSpyCostMultiplier('simple', true)).toBe(0.75);
    expect(getSpyCostMultiplier('easy', true)).toBe(0.90);
    expect(getSpyCostMultiplier('average', true)).toBe(1.00);
    expect(getSpyCostMultiplier('hard', true)).toBe(1.10);
    expect(getSpyCostMultiplier('impossible', true)).toBe(1.25);
  });
});
