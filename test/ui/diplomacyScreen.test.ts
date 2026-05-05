/**
 * Diplomacy screen integration tests.
 * test/ui/diplomacyScreen.test.ts
 *
 * Since the vitest environment is 'node', we can't test DOM rendering directly.
 * These tests verify that:
 * 1. The underlying systems used by DiplomacyScreen produce correct data.
 * 2. The screen's logic produces the right relation labels and class names.
 * 3. The import/type surface is valid (no any, correct signatures).
 */

import { describe, it, expect } from 'vitest';
import {
  getDiplomaticState,
  getRelationValue,
  initializeRelations,
  STATE_WAR_THRESHOLD,
  STATE_FRIENDLY_THRESHOLD,
  STATE_ALLIED_THRESHOLD,
  RELATION_MIN,
  RELATION_MAX,
} from '../../src/game/systems/diplomacy';
import { hasTreaty } from '../../src/game/systems/treaties';
import {
  DiplomaticRelations,
  DiplomaticState,
  Empire,
  EmpireId,
  GameState,
  Treaty,
} from '../../src/game/state';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRelation(
  empireA: EmpireId,
  empireB: EmpireId,
  value = 0,
): DiplomaticRelations {
  const state: DiplomaticState =
    value < -50 ? 'war'
    : value < 0 ? 'unfriendly'
    : value < 50 ? 'neutral'
    : value < 80 ? 'friendly'
    : 'allied';
  return {
    empireA, empireB, value, state,
    treaties: [],
    events: [],
    warStartTurn: null,
    lastContact: 1,
    modifiers: [],
  };
}

function makeEmpire(id: EmpireId, isPlayer = false, relations: Record<string, DiplomaticRelations> = {}): Empire {
  return {
    id, raceId: 'hamsters', name: `Empire ${id}`,
    isPlayer, credits: 100, creditPerTurn: 10,
    planets: [], fleets: [], shipDesigns: [],
    scannerTechLevel: 0, computerTechLevel: 0, securityLevel: 3,
    research: {
      currentTech: null, researchPoints: 0, researchPerTurn: 10,
      completedTechs: [], availableTechs: {
        propulsion: [], weapons: [], construction: [],
        computers: [], planetology: [], fields: [],
      },
      miniaturization: {}, stolenTechs: [],
    },
    relations,
    exploredSystems: [], visibleSystems: [],
    isDefeated: false, defeatedTurn: null,
  };
}

function makeState(empires: Empire[]): GameState {
  const byId: Record<string, Empire> = {};
  for (const e of empires) byId[e.id] = e;
  return {
    empires: { byId, allIds: empires.map(e => e.id) },
    planets: { byId: {}, allIds: [] },
    systems: { byId: {}, allIds: [] },
    fleets: { byId: {}, allIds: [] },
    ships: { byId: {}, allIds: [] },
    turn: 1,
    currentScreen: 'diplomacy',
    previousScreen: null,
    selectedPlanetId: null,
    selectedFleetId: null,
    notifications: [],
    victoryResult: null,
    isGameOver: false,
    highCouncil: null,
  } as unknown as GameState;
}

// ── Tests: getDiplomaticState (relation label logic) ──────────────────────────

describe('DiplomacyScreen – relation label logic', () => {
  it('shows WAR for values at or below -50 (per design doc §1)', () => {
    // Per design/diplomacy/relationship-formulas.md §1:
    // War: -100 to -50 (value ≤ -50)
    expect(getDiplomaticState(-100)).toBe('war');
    expect(getDiplomaticState(-51)).toBe('war');
    expect(getDiplomaticState(-50)).toBe('war');  // -50 IS war (inclusive)
  });

  it('shows unfriendly for -49 through -1', () => {
    // Per design doc: Unfriendly: -49 to -1
    expect(getDiplomaticState(-49)).toBe('unfriendly');
    expect(getDiplomaticState(-25)).toBe('unfriendly');
    expect(getDiplomaticState(-1)).toBe('unfriendly');
  });

  it('shows neutral for zero', () => {
    expect(getDiplomaticState(0)).toBe('neutral');
  });

  it('shows friendly for values 50-79 (per design doc §1)', () => {
    // Per design doc: Friendly: +50 to +79
    expect(getDiplomaticState(50)).toBe('friendly');
    expect(getDiplomaticState(65)).toBe('friendly');
    expect(getDiplomaticState(79)).toBe('friendly');
    expect(getDiplomaticState(49)).toBe('neutral');  // 49 is still neutral
  });

  it('shows allied for values 80+ (per design doc §1)', () => {
    // Per design doc: Allied: +80 to +100
    expect(getDiplomaticState(80)).toBe('allied');
    expect(getDiplomaticState(100)).toBe('allied');
    expect(getDiplomaticState(79)).toBe('friendly');  // 79 is still friendly
  });
});

// ── Tests: getRelationValue (cross-empire lookup) ─────────────────────────────

describe('DiplomacyScreen – relation value lookup', () => {
  it('returns 0 for empires with no defined relation', () => {
    const player = makeEmpire('player', true);
    const ai = makeEmpire('ai');
    const state = makeState([player, ai]);
    expect(getRelationValue(state, 'player', 'ai')).toBe(0);
  });

  it('returns correct value for existing relation', () => {
    const rel = makeRelation('player', 'ai', 42);
    const player = makeEmpire('player', true, { ai: rel });
    const ai = makeEmpire('ai', false, { player: makeRelation('ai', 'player', 42) });
    const state = makeState([player, ai]);
    expect(getRelationValue(state, 'player', 'ai')).toBe(42);
  });

  it('returns RELATION_MIN for war relation', () => {
    const warRel = makeRelation('player', 'ai', RELATION_MIN);
    const player = makeEmpire('player', true, { ai: warRel });
    const ai = makeEmpire('ai', false, { player: makeRelation('ai', 'player', RELATION_MIN) });
    const state = makeState([player, ai]);
    expect(getRelationValue(state, 'player', 'ai')).toBe(RELATION_MIN);
  });
});

// ── Tests: hasTreaty (treaty display logic) ───────────────────────────────────

describe('DiplomacyScreen – treaty detection', () => {
  function makeTreaty(type: Treaty['type']): Treaty {
    return {
      id: `t-${type}`,
      type,
      empireA: 'player',
      empireB: 'ai',
      startTurn: 1,
      terms: {},
      isActive: true,
    };
  }

  it('detects trade treaty between two empires', () => {
    const tradeTreaty = makeTreaty('trade');
    const rel = { ...makeRelation('player', 'ai', 20), treaties: [tradeTreaty] };
    const player = makeEmpire('player', true, { ai: rel });
    const ai = makeEmpire('ai', false, { player: rel });
    const state = makeState([player, ai]);
    expect(hasTreaty(state, 'player', 'ai', 'trade')).toBe(true);
  });

  it('returns false when no treaty of that type exists', () => {
    const rel = makeRelation('player', 'ai', 20);
    const player = makeEmpire('player', true, { ai: rel });
    const ai = makeEmpire('ai', false, { player: rel });
    const state = makeState([player, ai]);
    expect(hasTreaty(state, 'player', 'ai', 'military_alliance')).toBe(false);
  });

  it('detects non-aggression pact', () => {
    const napTreaty = makeTreaty('non_aggression');
    const rel = { ...makeRelation('player', 'ai', 10), treaties: [napTreaty] };
    const player = makeEmpire('player', true, { ai: rel });
    const ai = makeEmpire('ai', false, { player: rel });
    const state = makeState([player, ai]);
    expect(hasTreaty(state, 'player', 'ai', 'non_aggression')).toBe(true);
  });
});

// ── Tests: known empire filtering ─────────────────────────────────────────────

describe('DiplomacyScreen – known empires list', () => {
  it('lists all non-player non-defeated empires with relations', () => {
    const rel1 = makeRelation('player', 'ai1', 10);
    const rel2 = makeRelation('player', 'ai2', -30);
    const player = makeEmpire('player', true, { ai1: rel1, ai2: rel2 });
    const ai1 = makeEmpire('ai1');
    const ai2 = makeEmpire('ai2');
    const state = makeState([player, ai1, ai2]);

    // simulate screen logic: filter known empires
    const known = Object.keys(player.relations)
      .map(id => state.empires.byId[id])
      .filter((e): e is Empire => !!e && !e.isPlayer && !e.isDefeated);

    expect(known).toHaveLength(2);
    expect(known.map(e => e.id)).toContain('ai1');
    expect(known.map(e => e.id)).toContain('ai2');
  });

  it('excludes defeated empires from the list', () => {
    const rel1 = makeRelation('player', 'ai1', 10);
    const rel2 = makeRelation('player', 'defeated', -90);
    const player = makeEmpire('player', true, { ai1: rel1, defeated: rel2 });
    const ai1 = makeEmpire('ai1');
    const defeated = { ...makeEmpire('defeated'), isDefeated: true };
    const state = makeState([player, ai1, defeated]);

    const known = Object.keys(player.relations)
      .map(id => state.empires.byId[id])
      .filter((e): e is Empire => !!e && !e.isPlayer && !e.isDefeated);

    expect(known).toHaveLength(1);
    expect(known[0]?.id).toBe('ai1');
  });

  it('shows empty list when player has no known races', () => {
    const player = makeEmpire('player', true, {});
    const state = makeState([player]);

    const known = Object.keys(player.relations)
      .map(id => state.empires.byId[id])
      .filter((e): e is Empire => !!e && !e.isPlayer && !e.isDefeated);

    expect(known).toHaveLength(0);
  });
});

// ── Tests: relation value range ───────────────────────────────────────────────

describe('DiplomacyScreen – relation value range', () => {
  it('RELATION_MIN is -100 and RELATION_MAX is 100', () => {
    expect(RELATION_MIN).toBe(-100);
    expect(RELATION_MAX).toBe(100);
  });

  it('war threshold is at -50 (inclusive per design doc)', () => {
    expect(STATE_WAR_THRESHOLD).toBe(-50);
    // Per design/diplomacy/relationship-formulas.md §1:
    // War: -100 to -50 (value ≤ -50)
    expect(getDiplomaticState(-51)).toBe('war');
    expect(getDiplomaticState(-50)).toBe('war');  // -50 IS war (inclusive)
    expect(getDiplomaticState(-49)).toBe('unfriendly');  // -49 is unfriendly
  });
});

// ── Tests: initializeRelations ────────────────────────────────────────────────

describe('DiplomacyScreen – initializeRelations', () => {
  it('creates neutral relations between all empire pairs', () => {
    const player = makeEmpire('player', true);
    const ai1 = makeEmpire('ai1');
    const ai2 = makeEmpire('ai2');
    const state = makeState([player, ai1, ai2]);
    const next = initializeRelations(state);
    expect(getRelationValue(next, 'player', 'ai1')).toBe(0);
    expect(getRelationValue(next, 'player', 'ai2')).toBe(0);
    expect(getRelationValue(next, 'ai1', 'ai2')).toBe(0);
  });
});
