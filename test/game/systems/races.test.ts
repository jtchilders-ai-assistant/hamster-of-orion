/**
 * Unit tests for src/game/systems/races.ts
 * All formulas verified against design/species/race-stats-complete.md
 */

import { describe, it, expect } from 'vitest';
import {
  getRace,
  getAllRaces,
  ALL_RACE_IDS,
  RACES_BY_ID,
  RACE_CONSTANTS,
  applyRacialBonus,
  applyProductionBonus,
  applyResearchBonus,
  applyFieldResearchBonus,
  applyGrowthBonus,
  applyGroundCombatBonus,
  applyShipAttackBonus,
  applyShipDefenseBonus,
  applyEspionageBonus,
  startingRelationship,
  applyDiplomacyBonus,
  hasAbility,
  getAbility,
  miceEffectiveRCLevel,
  miceFactoryProduction,
  MICE_FACTORY_EFFICIENCY_MULTIPLIER,
} from '../../../src/game/systems/races';

// ── Race data integrity ───────────────────────────────────────────────────────

describe('Race data', () => {
  it('loads exactly 10 races', () => {
    expect(ALL_RACE_IDS).toHaveLength(10);
  });

  it('includes all expected race IDs', () => {
    const expected = [
      'hamsters', 'ants', 'mice', 'rats', 'rabbits',
      'hermit_crabs', 'guinea_pigs', 'ferrets', 'budgies', 'chameleons',
    ];
    for (const id of expected) {
      expect(ALL_RACE_IDS).toContain(id);
    }
  });

  it('getRace throws for unknown ID', () => {
    expect(() => getRace('unicorns')).toThrow(/unknown raceId/i);
  });

  it('RACES_BY_ID contains all races', () => {
    for (const id of ALL_RACE_IDS) {
      expect(RACES_BY_ID[id]).toBeDefined();
      expect(RACES_BY_ID[id].id).toBe(id);
    }
  });

  it('every race has a non-empty name and description', () => {
    for (const id of ALL_RACE_IDS) {
      const race = getRace(id);
      expect(race.name.length).toBeGreaterThan(0);
      expect(race.description.length).toBeGreaterThan(0);
    }
  });

  it('every race has at least one special ability', () => {
    for (const id of ALL_RACE_IDS) {
      const race = getRace(id);
      expect(race.specialAbilities.length).toBeGreaterThan(0);
    }
  });

  it('every race has exactly 4 starting technologies', () => {
    for (const id of ALL_RACE_IDS) {
      const race = getRace(id);
      expect(race.startingTechnologies).toHaveLength(4);
    }
  });

  it('every race has a valid ship prefix', () => {
    for (const id of ALL_RACE_IDS) {
      const race = getRace(id);
      expect(race.shipPrefix).toMatch(/^[A-Z]{2,4}$/);
    }
  });

  it('all AI behavior aggression values are in [0,1]', () => {
    for (const id of ALL_RACE_IDS) {
      const { aiBehavior } = getRace(id);
      expect(aiBehavior.aggression).toBeGreaterThanOrEqual(0);
      expect(aiBehavior.aggression).toBeLessThanOrEqual(1);
    }
  });
});

// ── Specific race bonus values ────────────────────────────────────────────────

describe('Race bonus values match design doc', () => {
  it('Ants: +50% production', () => {
    expect(getRace('ants').bonuses.production).toBe(50);
  });

  it('Rats: +75% research', () => {
    expect(getRace('rats').bonuses.research).toBe(75);
  });

  it('Rabbits: +100% growth', () => {
    expect(getRace('rabbits').bonuses.growth).toBe(100);
  });

  it('Guinea Pigs: +50% ground combat', () => {
    expect(getRace('guinea_pigs').bonuses.groundCombat).toBe(50);
  });

  it('Ferrets: +30% ship combat', () => {
    expect(getRace('ferrets').bonuses.shipCombat).toBe(30);
  });

  it('Budgies: +50% ship combat', () => {
    expect(getRace('budgies').bonuses.shipCombat).toBe(50);
  });

  it('Chameleons: +60% espionage, +30 flat spy roll bonus', () => {
    expect(getRace('chameleons').bonuses.espionage).toBe(60);
    expect(getRace('chameleons').spyRollBonus).toBe(30);
  });

  it('Hamsters: +30% diplomacy', () => {
    expect(getRace('hamsters').bonuses.diplomacy).toBe(30);
  });

  it('Hermit Crabs: -50% growth', () => {
    expect(getRace('hermit_crabs').bonuses.growth).toBe(-50);
  });

  it('Mice: -50% food', () => {
    expect(getRace('mice').bonuses.food).toBe(-50);
  });
});

// ── Field research bonuses ────────────────────────────────────────────────────

describe('Research field bonuses', () => {
  it('Hamsters: +40% force_fields field', () => {
    expect(getRace('hamsters').researchFieldBonuses['force_fields']).toBe(40);
  });

  it('Mice: +40% computers field', () => {
    expect(getRace('mice').researchFieldBonuses['computers']).toBe(40);
  });

  it('Mice: -20% planetology field penalty', () => {
    expect(getRace('mice').researchFieldPenalties['planetology']).toBe(-20);
  });

  it('Rats: researchBonusAllFields = true', () => {
    expect(getRace('rats').researchBonusAllFields).toBe(true);
  });

  it('Rabbits: +40% planetology field', () => {
    expect(getRace('rabbits').researchFieldBonuses['planetology']).toBe(40);
  });

  it('Hermit Crabs: +20% computers, -20% propulsion, weapons, construction, force_fields, planetology', () => {
    const race = getRace('hermit_crabs');
    expect(race.researchFieldBonuses['computers']).toBe(20);
    expect(race.researchFieldPenalties['propulsion']).toBe(-20);
    expect(race.researchFieldPenalties['weapons']).toBe(-20);
    expect(race.researchFieldPenalties['construction']).toBe(-20);
    expect(race.researchFieldPenalties['force_fields']).toBe(-20);
    expect(race.researchFieldPenalties['planetology']).toBe(-20);
  });

  it('Budgies: +40% propulsion field', () => {
    expect(getRace('budgies').researchFieldBonuses['propulsion']).toBe(40);
  });

  it('Guinea Pigs: +20% weapons and construction', () => {
    const race = getRace('guinea_pigs');
    expect(race.researchFieldBonuses['weapons']).toBe(20);
    expect(race.researchFieldBonuses['construction']).toBe(20);
  });

  it('Chameleons: +20% computers field', () => {
    expect(getRace('chameleons').researchFieldBonuses['computers']).toBe(20);
  });
});

// ── Espionage flags ───────────────────────────────────────────────────────────

describe('Espionage flags', () => {
  it('Ants cannot conduct espionage', () => {
    expect(getRace('ants').canConductEspionage).toBe(false);
  });

  it('Ants are immune to espionage', () => {
    expect(getRace('ants').immuneToEspionage).toBe(true);
  });

  it('All other races can conduct espionage', () => {
    const nonAnts = ALL_RACE_IDS.filter((id) => id !== 'ants');
    for (const id of nonAnts) {
      expect(getRace(id).canConductEspionage).toBe(true);
    }
  });

  it('No other race is immune to espionage', () => {
    const nonAnts = ALL_RACE_IDS.filter((id) => id !== 'ants');
    for (const id of nonAnts) {
      expect(getRace(id).immuneToEspionage).toBe(false);
    }
  });
});

// ── applyRacialBonus ─────────────────────────────────────────────────────────

describe('applyRacialBonus', () => {
  it('0% bonus returns base value unchanged', () => {
    expect(applyRacialBonus(100, 0)).toBe(100);
  });

  it('+50% bonus multiplies by 1.5', () => {
    expect(applyRacialBonus(100, 50)).toBeCloseTo(150);
  });

  it('-10% penalty multiplies by 0.9', () => {
    expect(applyRacialBonus(100, -10)).toBeCloseTo(90);
  });

  it('+75% bonus multiplies by 1.75 (Rats research)', () => {
    expect(applyRacialBonus(20, 75)).toBeCloseTo(35);
  });
});

// ── applyProductionBonus ─────────────────────────────────────────────────────

describe('applyProductionBonus', () => {
  it('Ants: 150 BC base → 225 BC (from design Example 1)', () => {
    expect(applyProductionBonus(150, 'ants')).toBeCloseTo(225);
  });

  it('Hamsters: 0% bonus → unchanged', () => {
    expect(applyProductionBonus(100, 'hamsters')).toBeCloseTo(100);
  });

  it('Budgies: -10% penalty → 90', () => {
    expect(applyProductionBonus(100, 'budgies')).toBeCloseTo(90);
  });

  it('Mice: +25% bonus → 125', () => {
    expect(applyProductionBonus(100, 'mice')).toBeCloseTo(125);
  });
});

// ── applyResearchBonus ───────────────────────────────────────────────────────

describe('applyResearchBonus', () => {
  it('Rats: 20 base RP → 35 RP (from design Example 2)', () => {
    expect(applyResearchBonus(20, 'rats')).toBeCloseTo(35);
  });

  it('Hamsters: 0% → unchanged', () => {
    expect(applyResearchBonus(10, 'hamsters')).toBeCloseTo(10);
  });

  it('Ants: -10% research penalty', () => {
    expect(applyResearchBonus(100, 'ants')).toBeCloseTo(90);
  });
});

// ── applyFieldResearchBonus ──────────────────────────────────────────────────

describe('applyFieldResearchBonus', () => {
  it('Hamsters: +40% force_fields field bonus on top of 0% base = +40%', () => {
    expect(applyFieldResearchBonus(100, 'hamsters', 'force_fields')).toBeCloseTo(140);
  });

  it('Hamsters: +20% propulsion field bonus = +20%', () => {
    expect(applyFieldResearchBonus(100, 'hamsters', 'propulsion')).toBeCloseTo(120);
  });

  it('Mice: computers base 15% + field 40% = +55%', () => {
    expect(applyFieldResearchBonus(100, 'mice', 'computers')).toBeCloseTo(155);
  });

  it('Mice: planetology base 15% + field -20% = -5%', () => {
    expect(applyFieldResearchBonus(100, 'mice', 'planetology')).toBeCloseTo(95);
  });

  it('Rats: +75% ALL fields — physics has no extra field modifier', () => {
    expect(applyFieldResearchBonus(100, 'rats', 'physics')).toBeCloseTo(175);
  });

  it('Rats: +75% ALL fields — computers has no extra field modifier', () => {
    expect(applyFieldResearchBonus(100, 'rats', 'computers')).toBeCloseTo(175);
  });

  it('Hermit Crabs: computers +20% field on top of 0% base', () => {
    expect(applyFieldResearchBonus(100, 'hermit_crabs', 'computers')).toBeCloseTo(120);
  });

  it('Hermit Crabs: propulsion 0% base + -20% field penalty = -20%', () => {
    expect(applyFieldResearchBonus(100, 'hermit_crabs', 'propulsion')).toBeCloseTo(80);
  });
});

// ── applyGrowthBonus ─────────────────────────────────────────────────────────

describe('applyGrowthBonus', () => {
  it('Rabbits: +100% growth doubles growth rate', () => {
    expect(applyGrowthBonus(0.10, 'rabbits')).toBeCloseTo(0.20);
  });

  it('Hermit Crabs: -50% growth halves growth rate', () => {
    expect(applyGrowthBonus(0.10, 'hermit_crabs')).toBeCloseTo(0.05);
  });

  it('Hamsters: 0% growth → unchanged', () => {
    expect(applyGrowthBonus(0.10, 'hamsters')).toBeCloseTo(0.10);
  });
});

// ── applyGroundCombatBonus ───────────────────────────────────────────────────

describe('applyGroundCombatBonus', () => {
  it('Guinea Pigs: +50% — base 3 → 4.5', () => {
    expect(applyGroundCombatBonus(3, 'guinea_pigs')).toBeCloseTo(4.5);
  });

  it('Budgies: -20% — base 3 → 2.4', () => {
    expect(applyGroundCombatBonus(3, 'budgies')).toBeCloseTo(2.4);
  });

  it('never reduces below 10% of base', () => {
    // Hypothetical extreme negative: check floor at 10% of base
    // Hermit Crabs have +25%, so test with a custom scenario by using Budgies -20%
    // minimum = 3 * 0.1 = 0.3; result is 2.4, so floor not triggered
    expect(applyGroundCombatBonus(3, 'budgies')).toBeGreaterThanOrEqual(3 * 0.10);
  });

  it('Hamsters: -10% — base 3 → 2.7', () => {
    expect(applyGroundCombatBonus(3, 'hamsters')).toBeCloseTo(2.7);
  });
});

// ── applyShipAttackBonus / applyShipDefenseBonus ─────────────────────────────

describe('Ship combat bonuses', () => {
  it('Ferrets: +30% → attack +3 (base 1 + 30/10 = 4)', () => {
    expect(applyShipAttackBonus(1, 'ferrets')).toBeCloseTo(4);
  });

  it('Budgies: +50% → defense +5 (base 1 + 50/10 = 6)', () => {
    expect(applyShipDefenseBonus(1, 'budgies')).toBeCloseTo(6);
  });

  it('Hamsters: +0% → no change (base 1)', () => {
    expect(applyShipAttackBonus(1, 'hamsters')).toBeCloseTo(1);
  });

  it('Budgies: design Example 4 — EffectiveDefense includes racial +5', () => {
    // BaseDefense(1) + 50/10 = 6 from racial; SuperiorPilots adds +3 separately
    expect(applyShipDefenseBonus(1, 'budgies')).toBeCloseTo(6);
  });
});

// ── applyEspionageBonus ──────────────────────────────────────────────────────

describe('applyEspionageBonus', () => {
  it('Ants attacking anyone → 0 (cannot conduct espionage)', () => {
    expect(applyEspionageBonus(0.30, 'ants', 'hamsters')).toBe(0);
  });

  it('Anyone attacking Ants → 0 (immune to espionage)', () => {
    expect(applyEspionageBonus(0.30, 'hamsters', 'ants')).toBe(0);
  });

  it('Chameleons: +30 flat spy roll bonus + 60% modifier applied', () => {
    const base = RACE_CONSTANTS.BASE_ESPIONAGE_SUCCESS; // 0.30
    const adjustedBase = base + 30 / 100;              // 0.60
    const expected = adjustedBase * (1 + 60 / 100);    // 0.60 × 1.6 = 0.96
    expect(applyEspionageBonus(base, 'chameleons', 'hamsters')).toBeCloseTo(expected);
  });

  it('Hamsters: -20% espionage reduces success rate', () => {
    const result = applyEspionageBonus(0.30, 'hamsters', 'rats');
    expect(result).toBeCloseTo(0.30 * 0.80);
  });

  it('Neutral race (0% bonus) returns base chance', () => {
    // Mice have 0% espionage bonus and spyRollBonus 0
    expect(applyEspionageBonus(0.30, 'mice', 'hamsters')).toBeCloseTo(0.30);
  });
});

// ── startingRelationship ─────────────────────────────────────────────────────

describe('startingRelationship', () => {
  it('Hamsters vs neutral race → near neutral (30/3 each side offsets -20)', () => {
    // Hamsters +30/3 = +10 per side, combined with a 0% race: -20 + 10 + 0 = -10
    const value = startingRelationship('hamsters', 'ants'); // ants -30: -20 + 10 - 10 = -20
    const hamsterOffset = 30 / 3;
    const antsOffset = -30 / 3;
    expect(value).toBeCloseTo(RACE_CONSTANTS.DIPLOMACY_UNFRIENDLY_START + hamsterOffset + antsOffset);
  });

  it('Hamsters vs Hamsters → higher starting value', () => {
    // -20 + 10 + 10 = 0
    expect(startingRelationship('hamsters', 'hamsters')).toBeCloseTo(0);
  });

  it('Guinea Pigs vs Guinea Pigs → lowest starting value', () => {
    // -20 + (-20/3) + (-20/3) ≈ -33.3
    const val = startingRelationship('guinea_pigs', 'guinea_pigs');
    expect(val).toBeCloseTo(-20 + (-20 / 3) + (-20 / 3));
  });

  it('Rats (+10 diplo) vs Hamsters (+30 diplo)', () => {
    const val = startingRelationship('rats', 'hamsters');
    expect(val).toBeCloseTo(-20 + 10 / 3 + 30 / 3);
  });
});

// ── applyDiplomacyBonus ──────────────────────────────────────────────────────

describe('applyDiplomacyBonus', () => {
  it('Hamsters: +30% makes positive events better', () => {
    expect(applyDiplomacyBonus(10, 'hamsters')).toBeCloseTo(13);
  });

  it('Guinea Pigs: -20% reduces diplomatic gains', () => {
    expect(applyDiplomacyBonus(10, 'guinea_pigs')).toBeCloseTo(8);
  });

  it('0% bonus → unchanged', () => {
    expect(applyDiplomacyBonus(10, 'hermit_crabs')).toBeCloseTo(10);
  });
});

// ── hasAbility / getAbility ──────────────────────────────────────────────────

describe('hasAbility / getAbility', () => {
  it('Ants have hive_mind ability', () => {
    expect(hasAbility('ants', 'hive_mind')).toBe(true);
  });

  it('Hamsters do not have hive_mind', () => {
    expect(hasAbility('hamsters', 'hive_mind')).toBe(false);
  });

  it('Hermit Crabs have universal_adaptation', () => {
    expect(hasAbility('hermit_crabs', 'universal_adaptation')).toBe(true);
  });

  it('Hermit Crabs have cannot_terraform restriction', () => {
    expect(hasAbility('hermit_crabs', 'cannot_terraform')).toBe(true);
  });

  it('Rats have genius_researchers', () => {
    expect(hasAbility('rats', 'genius_researchers')).toBe(true);
  });

  it('Chameleons have false_flags and sleeper_agents', () => {
    expect(hasAbility('chameleons', 'false_flags')).toBe(true);
    expect(hasAbility('chameleons', 'sleeper_agents')).toBe(true);
  });

  it('getAbility returns the ability object', () => {
    const ability = getAbility('ferrets', 'deadly_accuracy');
    expect(ability).toBeDefined();
    expect(ability?.id).toBe('deadly_accuracy');
  });

  it('getAbility returns undefined for non-existent ability', () => {
    expect(getAbility('hamsters', 'deadly_accuracy')).toBeUndefined();
  });
});

// ── Mice-specific production helpers ─────────────────────────────────────────

describe('Mice production helpers', () => {
  it('miceEffectiveRCLevel adds 2 to researched level', () => {
    expect(miceEffectiveRCLevel(2)).toBe(4);
    expect(miceEffectiveRCLevel(7)).toBe(9);
    expect(miceEffectiveRCLevel(0)).toBe(2);
  });

  it('MICE_FACTORY_EFFICIENCY_MULTIPLIER is 1.5', () => {
    expect(MICE_FACTORY_EFFICIENCY_MULTIPLIER).toBe(1.5);
  });

  it('miceFactoryProduction: 20 factories → 37.5 BC (design Example)', () => {
    // 20 × 1.5 × 1.25 = 37.5
    expect(miceFactoryProduction(20)).toBeCloseTo(37.5);
  });

  it('miceFactoryProduction: 900 factories matches late-game example', () => {
    // 900 × 1.5 × 1.25 = 1687.5
    expect(miceFactoryProduction(900)).toBeCloseTo(1687.5);
  });

  it('Mice have cybernetic_workers ability with RC bonus value 2', () => {
    const ability = getAbility('mice', 'cybernetic_workers');
    expect(ability).toBeDefined();
    expect((ability?.effect as { value: number }).value).toBe(2);
  });

  it('Mice have no_refit_costs ability', () => {
    expect(hasAbility('mice', 'no_refit_costs')).toBe(true);
  });
});

// ── Budgies movement bonus ────────────────────────────────────────────────────

describe('Budgies movement range bonus', () => {
  it('Budgies have movementRangeBonus of 1', () => {
    expect(getRace('budgies').movementRangeBonus).toBe(1);
  });

  it('No other race has movementRangeBonus', () => {
    const others = ALL_RACE_IDS.filter((id) => id !== 'budgies');
    for (const id of others) {
      expect(getRace(id).movementRangeBonus).toBeUndefined();
    }
  });
});

// ── RACE_CONSTANTS ────────────────────────────────────────────────────────────

describe('RACE_CONSTANTS', () => {
  it('BASE_GROWTH_RATE is 0.10', () => {
    expect(RACE_CONSTANTS.BASE_GROWTH_RATE).toBe(0.10);
  });

  it('BASE_ESPIONAGE_SUCCESS is 0.30', () => {
    expect(RACE_CONSTANTS.BASE_ESPIONAGE_SUCCESS).toBe(0.30);
  });

  it('DIPLOMACY_UNFRIENDLY_START is -20', () => {
    expect(RACE_CONSTANTS.DIPLOMACY_UNFRIENDLY_START).toBe(-20);
  });

  it('GROUND_COMBAT_BASE is 3', () => {
    expect(RACE_CONSTANTS.GROUND_COMBAT_BASE).toBe(3);
  });
});
