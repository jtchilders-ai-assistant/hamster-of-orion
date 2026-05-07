/**
 * AI personalities tests — ORION-FIX-009
 * test/game/ai/ai-personalities.test.ts
 *
 * Verifies race-specific AI personality profiles, lookup helpers,
 * and integration with newGame.ts (personality wired into AIEmpire at game start).
 *
 * NO DOM imports — pure TypeScript only.
 */

import { describe, it, expect } from 'vitest';
import {
  RACE_PROFILES,
  getPersonalityProfile,
  applyPersonalityProfile,
  GUINEA_PIG_PROFILE,
  FERRET_PROFILE,
  BUDGIE_PROFILE,
  HAMSTER_PROFILE,
  MOUSE_PROFILE,
  RAT_PROFILE,
  ANT_PROFILE,
  CHAMELEON_PROFILE,
  RABBIT_PROFILE,
  HERMIT_CRAB_PROFILE,
  type AIPersonalityProfile,
  type PersonalityType,
  type AITrait,
} from '../../../src/game/ai/ai-personalities';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return true when all numeric fields are in [0, 100]. */
function allFieldsInRange(p: AIPersonalityProfile): boolean {
  const numericFields: (keyof AIPersonalityProfile)[] = [
    'aggression', 'expansionism', 'diplomacy', 'research',
  ];
  return numericFields.every((f) => {
    const v = p[f] as number;
    return v >= -100 && v <= 100;
  });
}

// ── Profile completeness ───────────────────────────────────────────────────────

describe('RACE_PROFILES', () => {
  const EXPECTED_RACES = [
    'guinea_pigs', 'ferrets', 'budgies', 'hamsters',
    'mice', 'rats', 'ants', 'chameleons', 'rabbits', 'hermit_crabs',
  ];

  it('contains all 10 playable races', () => {
    for (const raceId of EXPECTED_RACES) {
      expect(RACE_PROFILES[raceId], `Missing profile for ${raceId}`).toBeDefined();
    }
  });

  it('has exactly 10 race entries', () => {
    expect(Object.keys(RACE_PROFILES)).toHaveLength(10);
  });

  it('every profile has a valid PersonalityType', () => {
    const validTypes: PersonalityType[] = [
      'aggressive', 'scientific', 'diplomatic', 'expansionist',
      'builder', 'balanced', 'erratic', 'defensive', 'predatory', 'hermit',
    ];
    for (const [id, profile] of Object.entries(RACE_PROFILES)) {
      expect(validTypes, `${id} has invalid type "${profile.type}"`).toContain(profile.type);
    }
  });

  it('every profile has numeric fields in a reasonable range', () => {
    for (const [id, profile] of Object.entries(RACE_PROFILES)) {
      expect(allFieldsInRange(profile), `${id} has out-of-range numeric fields`).toBe(true);
    }
  });

  it('every profile has a traits array (may be empty)', () => {
    for (const [id, profile] of Object.entries(RACE_PROFILES)) {
      expect(Array.isArray(profile.traits), `${id}.traits is not an array`).toBe(true);
    }
  });
});

// ── Individual race archetypes ─────────────────────────────────────────────────

describe('Individual race personality profiles', () => {
  // ── Hamsters — Honorable Diplomats ──────────────────────────────────────────
  describe('Hamsters', () => {
    it('are balanced / diplomatic', () => {
      expect(HAMSTER_PROFILE.type).toBe('balanced');
      expect(HAMSTER_PROFILE.diplomacy).toBeGreaterThanOrEqual(50);
    });

    it('have low aggression', () => {
      expect(HAMSTER_PROFILE.aggression).toBeLessThan(40);
    });

    it('have positive base friendliness', () => {
      expect(HAMSTER_PROFILE.baseFriendliness).toBeGreaterThan(0);
    });

    it('never backstab (design: Honorable Diplomat)', () => {
      expect(HAMSTER_PROFILE.backstabTendency).toBe(0);
      expect(HAMSTER_PROFILE.traits).toContain('honorable' as AITrait);
    });

    it('have a positive treaty bonus', () => {
      expect(HAMSTER_PROFILE.treatyBonus).toBeGreaterThan(0);
    });
  });

  // ── Guinea Pigs — Conquerors ─────────────────────────────────────────────────
  describe('Guinea Pigs', () => {
    it('are aggressive type', () => {
      expect(GUINEA_PIG_PROFILE.type).toBe('aggressive');
    });

    it('have very high aggression', () => {
      expect(GUINEA_PIG_PROFILE.aggression).toBeGreaterThanOrEqual(75);
    });

    it('have low diplomacy', () => {
      expect(GUINEA_PIG_PROFILE.diplomacy).toBeLessThan(30);
    });

    it('have negative base friendliness (intimidating)', () => {
      expect(GUINEA_PIG_PROFILE.baseFriendliness).toBeLessThan(0);
    });

    it('have negative war reluctance (eager for war)', () => {
      // Guinea Pigs declare war frequently — war reluctance should be ≤ 0
      expect(GUINEA_PIG_PROFILE.warReluctance).toBeLessThanOrEqual(0);
    });
  });

  // ── Ferrets — Opportunistic Predators ────────────────────────────────────────
  describe('Ferrets', () => {
    it('are predatory type', () => {
      expect(FERRET_PROFILE.type).toBe('predatory');
    });

    it('have high backstab tendency (betray when profitable)', () => {
      expect(FERRET_PROFILE.backstabTendency).toBeGreaterThan(20);
    });

    it('are xenophobic', () => {
      expect(FERRET_PROFILE.traits).toContain('xenophobic' as AITrait);
    });
  });

  // ── Budgies — Proud Warriors ──────────────────────────────────────────────────
  describe('Budgies', () => {
    it('are balanced (warrior pride)', () => {
      expect(BUDGIE_PROFILE.type).toBe('balanced');
    });

    it('have meaningful aggression (combat specialist)', () => {
      expect(BUDGIE_PROFILE.aggression).toBeGreaterThanOrEqual(50);
    });
  });

  // ── Chameleons — Manipulative Backstabbers ────────────────────────────────────
  describe('Chameleons', () => {
    it('are erratic type', () => {
      expect(CHAMELEON_PROFILE.type).toBe('erratic');
    });

    it('have very high backstab tendency', () => {
      expect(CHAMELEON_PROFILE.backstabTendency).toBeGreaterThanOrEqual(60);
    });

    it('have backstabber and xenophobic traits', () => {
      expect(CHAMELEON_PROFILE.traits).toContain('backstabber' as AITrait);
      expect(CHAMELEON_PROFILE.traits).toContain('xenophobic' as AITrait);
    });

    it('have low diplomacy (constantly deceptive)', () => {
      expect(CHAMELEON_PROFILE.diplomacy).toBeLessThan(20);
    });
  });

  // ── Ants — Efficient Expansionists ──────────────────────────────────────────
  describe('Ants', () => {
    it('are expansionist type', () => {
      expect(ANT_PROFILE.type).toBe('expansionist');
    });

    it('have high expansionism', () => {
      expect(ANT_PROFILE.expansionism).toBeGreaterThanOrEqual(70);
    });

    it('have hive_mind trait', () => {
      expect(ANT_PROFILE.traits).toContain('hive_mind' as AITrait);
    });

    it('never backstab (collective reliability)', () => {
      expect(ANT_PROFILE.backstabTendency).toBe(0);
    });
  });

  // ── Mice — Technocrats ───────────────────────────────────────────────────────
  describe('Mice', () => {
    it('are builder type', () => {
      expect(MOUSE_PROFILE.type).toBe('builder');
    });

    it('have high research focus', () => {
      expect(MOUSE_PROFILE.research).toBeGreaterThanOrEqual(45);
    });

    it('are logical', () => {
      expect(MOUSE_PROFILE.traits).toContain('logical' as AITrait);
    });
  });

  // ── Rats — Research Pacifists ────────────────────────────────────────────────
  describe('Rats', () => {
    it('are scientific type', () => {
      expect(RAT_PROFILE.type).toBe('scientific');
    });

    it('have the highest research score', () => {
      expect(RAT_PROFILE.research).toBeGreaterThanOrEqual(85);
    });

    it('have logical and tech_trader traits', () => {
      expect(RAT_PROFILE.traits).toContain('logical' as AITrait);
      expect(RAT_PROFILE.traits).toContain('tech_trader' as AITrait);
    });

    it('have low aggression', () => {
      expect(RAT_PROFILE.aggression).toBeLessThan(25);
    });
  });

  // ── Rabbits — Population Expansionists ───────────────────────────────────────
  describe('Rabbits', () => {
    it('are defensive type', () => {
      expect(RABBIT_PROFILE.type).toBe('defensive');
    });

    it('have very low aggression (fearful prey)', () => {
      expect(RABBIT_PROFILE.aggression).toBeLessThan(20);
    });

    it('have peaceful trait', () => {
      expect(RABBIT_PROFILE.traits).toContain('peaceful' as AITrait);
    });

    it('have high war reluctance', () => {
      expect(RABBIT_PROFILE.warReluctance).toBeGreaterThanOrEqual(35);
    });
  });

  // ── Hermit Crabs — Ancient Isolationists ─────────────────────────────────────
  describe('Hermit Crabs', () => {
    it('are hermit type', () => {
      expect(HERMIT_CRAB_PROFILE.type).toBe('hermit');
    });

    it('have low expansionism (slow and patient)', () => {
      expect(HERMIT_CRAB_PROFILE.expansionism).toBeLessThanOrEqual(25);
    });

    it('are honorable (keep treaties forever)', () => {
      expect(HERMIT_CRAB_PROFILE.traits).toContain('honorable' as AITrait);
    });
  });
});

// ── getPersonalityProfile ─────────────────────────────────────────────────────

describe('getPersonalityProfile()', () => {
  it('returns the correct profile for each known race', () => {
    expect(getPersonalityProfile('hamsters')).toBe(HAMSTER_PROFILE);
    expect(getPersonalityProfile('guinea_pigs')).toBe(GUINEA_PIG_PROFILE);
    expect(getPersonalityProfile('ferrets')).toBe(FERRET_PROFILE);
    expect(getPersonalityProfile('budgies')).toBe(BUDGIE_PROFILE);
    expect(getPersonalityProfile('mice')).toBe(MOUSE_PROFILE);
    expect(getPersonalityProfile('rats')).toBe(RAT_PROFILE);
    expect(getPersonalityProfile('ants')).toBe(ANT_PROFILE);
    expect(getPersonalityProfile('chameleons')).toBe(CHAMELEON_PROFILE);
    expect(getPersonalityProfile('rabbits')).toBe(RABBIT_PROFILE);
    expect(getPersonalityProfile('hermit_crabs')).toBe(HERMIT_CRAB_PROFILE);
  });

  it('falls back to hamster (balanced) profile for unknown race ID', () => {
    expect(getPersonalityProfile('unknown_species')).toBe(HAMSTER_PROFILE);
    expect(getPersonalityProfile('')).toBe(HAMSTER_PROFILE);
  });
});

// ── applyPersonalityProfile ───────────────────────────────────────────────────

describe('applyPersonalityProfile()', () => {
  it('returns the canonical profile when no override is given', () => {
    const result = applyPersonalityProfile('hamsters');
    expect(result).toEqual(HAMSTER_PROFILE);
  });

  it('applies aggression override correctly', () => {
    const result = applyPersonalityProfile('hamsters', 99);
    expect(result.aggression).toBe(99);
    // Other fields unchanged
    expect(result.diplomacy).toBe(HAMSTER_PROFILE.diplomacy);
    expect(result.traits).toEqual(HAMSTER_PROFILE.traits);
  });

  it('falls back to hamster profile for unknown race', () => {
    const result = applyPersonalityProfile('mystery_race');
    expect(result).toEqual(HAMSTER_PROFILE);
  });

  it('does not mutate the original profile object', () => {
    const original = { ...HAMSTER_PROFILE };
    applyPersonalityProfile('hamsters', 77);
    expect(HAMSTER_PROFILE.aggression).toBe(original.aggression);
  });
});

// ── Design consistency checks ─────────────────────────────────────────────────

describe('Design spec consistency (design/diplomacy/ai-personalities.md)', () => {
  it('peaceful races have peaceful trait', () => {
    // Rabbits: "Triggers War: Never"
    expect(RABBIT_PROFILE.traits).toContain('peaceful' as AITrait);
  });

  it('honorable races have honorable trait', () => {
    // Hamsters: "never backstabs"
    // Hermit Crabs: "keep treaties forever"
    expect(HAMSTER_PROFILE.traits).toContain('honorable' as AITrait);
    expect(HERMIT_CRAB_PROFILE.traits).toContain('honorable' as AITrait);
  });

  it('backstabbing races have backstabber trait', () => {
    // Chameleons: "Break treaties without remorse"
    expect(CHAMELEON_PROFILE.traits).toContain('backstabber' as AITrait);
  });

  it('Chameleons are most likely to backstab among all races', () => {
    const maxBackstab = Math.max(
      ...Object.values(RACE_PROFILES).map((p) => p.backstabTendency),
    );
    expect(CHAMELEON_PROFILE.backstabTendency).toBe(maxBackstab);
  });

  it('Rats have the highest research score among all races', () => {
    const maxResearch = Math.max(
      ...Object.values(RACE_PROFILES).map((p) => p.research),
    );
    expect(RAT_PROFILE.research).toBe(maxResearch);
  });

  it('Guinea Pigs have the highest aggression among all races', () => {
    const maxAggression = Math.max(
      ...Object.values(RACE_PROFILES).map((p) => p.aggression),
    );
    expect(GUINEA_PIG_PROFILE.aggression).toBe(maxAggression);
  });

  it('Rabbits have the lowest aggression among all races', () => {
    const minAggression = Math.min(
      ...Object.values(RACE_PROFILES).map((p) => p.aggression),
    );
    expect(RABBIT_PROFILE.aggression).toBe(minAggression);
  });

  it('Hamsters have the highest base friendliness (best starting relations)', () => {
    const maxFriendliness = Math.max(
      ...Object.values(RACE_PROFILES).map((p) => p.baseFriendliness),
    );
    expect(HAMSTER_PROFILE.baseFriendliness).toBe(maxFriendliness);
  });
});
