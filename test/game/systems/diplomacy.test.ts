/**
 * Diplomacy system tests.
 * test/game/systems/diplomacy.test.ts
 *
 * Validates the functions in src/game/systems/diplomacy.ts against the
 * relationship formulas defined in design/diplomacy/relationship-formulas.md.
 */

import { describe, it, expect } from 'vitest';
import {
  initializeRelations,
  getDiplomaticState,
  applyRelationModifier,
  processRelations,
  getRelationValue,
  DECAY_RATE,
  RELATION_MIN,
  RELATION_MAX,
} from '../../../src/game/systems/diplomacy';
import { Empire, GameState, DiplomaticRelations } from '../../../src/game/state';

// ── Minimal state factory ─────────────────────────────────────────────────────

/** Build a minimal Empire stub — only the fields diplomacy touches. */
function makeEmpire(id: string, relations: Record<string, DiplomaticRelations> = {}): Empire {
  return {
    id,
    raceId: 'hamsters',
    name: `Empire ${id}`,
    isPlayer: false,
    credits: 0,
    creditPerTurn: 0,
    planets: [],
    fleets: [],
    shipDesigns: [],
    research: {
      currentTech: null,
      researchPoints: 0,
      researchPerTurn: 0,
      completedTechs: [],
      availableTechs: {
        weapons: [],
        propulsion: [],
        construction: [],
        computers: [],
        force_fields: [],
        biotechnology: [],
      },
      miniaturization: {},
      stolenTechs: [],
    },
    relations,
    isDefeated: false,
    defeatedTurn: null,
  };
}

/** Build a minimal GameState with the given empire ids. No relations pre-set. */
function makeState(empireIds: string[], turn = 1): GameState {
  const byId: Record<string, Empire> = {};
  for (const id of empireIds) {
    byId[id] = makeEmpire(id);
  }

  // Satisfy the TypeScript shape — all other fields are irrelevant for tests.
  return {
    version: '0.1.0',
    seed: 'test',
    turn,
    year: 2400 + turn,
    difficulty: 'normal',
    isPaused: false,
    gameSpeed: 'normal',
    currentScreen: 'galaxy',
    victoryCondition: null,
    defeatedTurn: null,
    createdAt: 0,
    lastPlayed: 0,
    playTime: 0,
    galaxy: {
      id: 'g1',
      size: 'small',
      shape: 'spiral',
      width: 100,
      height: 100,
      systemCount: 0,
      systems: { byId: {}, allIds: [] },
      quadTree: { bounds: { x: 0, y: 0, width: 100, height: 100 }, systemIds: [], children: null },
      nebulae: [],
      clusters: [],
      artifactsSystemIds: [],
      orionSystemId: 's_orion',
      homeSystemIds: {},
      fogOfWar: {},
    },
    planets: { byId: {}, allIds: [] },
    fleets: { byId: {}, allIds: [] },
    ships: { byId: {}, allIds: [] },
    shipDesigns: { byId: {}, allIds: [] },
    empires: {
      byId,
      allIds: empireIds,
      playerId: empireIds[0],
    },
    combats: { byId: {}, allIds: [], activeCombatId: null },
    aiEmpires: {},
    highCouncil: null,
    ui: {
      currentScreen: 'galaxy',
      previousScreen: null,
      selectedSystem: null,
      selectedPlanet: null,
      selectedFleet: null,
      selectedShip: null,
      camera: { x: 0, y: 0, zoom: 1, target: null },
      modals: {
        shipDesigner: { open: false },
        diplomacy: { open: false },
        combat: { open: false },
        victory: { open: false },
      },
      notifications: [],
      filters: { planetsSort: 'name', fleetsFilter: 'all' },
      settings: {
        masterVolume: 1,
        musicVolume: 1,
        sfxVolume: 1,
        ambientVolume: 1,
        particleEffects: true,
        animationSpeed: 'normal',
        showGrid: false,
        autosave: true,
        autosaveFrequency: 10,
        autoEndTurn: false,
        confirmEndTurn: true,
        showTutorials: true,
        colorBlindMode: false,
        textSize: 14,
        highContrast: false,
        screenReaderEnabled: false,
        customHotkeys: {},
        quickCombat: false,
      },
    },
  } as GameState;
}

// ── Tests: initializeRelations ────────────────────────────────────────────────

describe('initializeRelations', () => {
  it('creates neutral relations (value=0) for every empire pair', () => {
    const state = makeState(['hamsters', 'rats', 'guinea_pigs']);
    const result = initializeRelations(state);

    expect(getRelationValue(result, 'hamsters', 'rats')).toBe(0);
    expect(getRelationValue(result, 'hamsters', 'guinea_pigs')).toBe(0);
    expect(getRelationValue(result, 'rats', 'guinea_pigs')).toBe(0);
  });

  it('sets initial diplomatic state to neutral for all pairs', () => {
    const state = makeState(['a', 'b', 'c']);
    const result = initializeRelations(state);

    expect(result.empires.byId['a'].relations['b'].state).toBe('neutral');
    expect(result.empires.byId['b'].relations['a'].state).toBe('neutral');
    expect(result.empires.byId['a'].relations['c'].state).toBe('neutral');
  });

  it('populates both directions (A→B and B→A)', () => {
    const state = makeState(['alpha', 'beta']);
    const result = initializeRelations(state);

    expect(result.empires.byId['alpha'].relations['beta']).toBeDefined();
    expect(result.empires.byId['beta'].relations['alpha']).toBeDefined();
  });

  it('initialises with empty modifier lists', () => {
    const state = makeState(['x', 'y']);
    const result = initializeRelations(state);

    expect(result.empires.byId['x'].relations['y'].modifiers).toEqual([]);
    expect(result.empires.byId['y'].relations['x'].modifiers).toEqual([]);
  });

  it('does not create a self-relation entry', () => {
    const state = makeState(['solo', 'other']);
    const result = initializeRelations(state);

    expect(result.empires.byId['solo'].relations['solo']).toBeUndefined();
  });
});

// ── Tests: getDiplomaticState ─────────────────────────────────────────────────

describe('getDiplomaticState (design/diplomacy/relationship-formulas.md §1)', () => {
  it('returns "war" for values at or below -50', () => {
    expect(getDiplomaticState(-100)).toBe('war');
    expect(getDiplomaticState(-51)).toBe('war');
    expect(getDiplomaticState(-50)).toBe('war'); // -50 is included in war range
  });

  it('returns "unfriendly" for values from -49 to -1', () => {
    expect(getDiplomaticState(-49)).toBe('unfriendly');
    expect(getDiplomaticState(-25)).toBe('unfriendly');
    expect(getDiplomaticState(-1)).toBe('unfriendly');
  });

  it('returns "neutral" for values from 0 to 49', () => {
    expect(getDiplomaticState(0)).toBe('neutral');
    expect(getDiplomaticState(25)).toBe('neutral');
    expect(getDiplomaticState(49)).toBe('neutral');
  });

  it('returns "friendly" for values from 50 to 79', () => {
    expect(getDiplomaticState(50)).toBe('friendly');
    expect(getDiplomaticState(65)).toBe('friendly');
    expect(getDiplomaticState(79)).toBe('friendly');
  });

  it('returns "allied" for values 80 and above', () => {
    expect(getDiplomaticState(80)).toBe('allied');
    expect(getDiplomaticState(100)).toBe('allied');
  });
});

// ── Tests: applyRelationModifier ──────────────────────────────────────────────

describe('applyRelationModifier', () => {
  it('appends a modifier to the target relation', () => {
    const base = initializeRelations(makeState(['a', 'b']));
    const mod = { reason: 'border incursion', amount: -10 };
    const result = applyRelationModifier(base, 'a', 'b', mod);

    expect(result.empires.byId['a'].relations['b'].modifiers).toHaveLength(1);
    expect(result.empires.byId['a'].relations['b'].modifiers[0].amount).toBe(-10);
  });

  it('stacks multiple modifiers without clobbering previous ones', () => {
    const base = initializeRelations(makeState(['a', 'b']));
    const s1 = applyRelationModifier(base, 'a', 'b', { reason: 'attack', amount: -30 });
    const s2 = applyRelationModifier(s1, 'a', 'b', { reason: 'gift', amount: +10 });

    expect(s2.empires.byId['a'].relations['b'].modifiers).toHaveLength(2);
    expect(s2.empires.byId['a'].relations['b'].modifiers[1].amount).toBe(10);
  });

  it('does not mutate the relation value immediately (modifiers are pending)', () => {
    const base = initializeRelations(makeState(['a', 'b']));
    const result = applyRelationModifier(base, 'a', 'b', { reason: 'war declared', amount: -100 });

    // Value stays at 0 until processRelations runs
    expect(result.empires.byId['a'].relations['b'].value).toBe(0);
  });

  it('returns state unchanged when empireId does not exist', () => {
    const base = initializeRelations(makeState(['a', 'b']));
    const result = applyRelationModifier(base, 'missing', 'b', { reason: 'ghost', amount: -5 });

    // Unchanged — no crash
    expect(result).toBe(base);
  });
});

// ── Tests: processRelations ───────────────────────────────────────────────────

describe('processRelations', () => {
  it('applies pending modifiers to the relation value', () => {
    const base = initializeRelations(makeState(['a', 'b']));
    const withMod = applyRelationModifier(base, 'a', 'b', { reason: 'trade deal', amount: +20 });
    const result = processRelations(withMod);

    // Value = 0 + 20 = 20; then decay: floor((20-0)*0.02) = 0 → value = 20
    expect(getRelationValue(result, 'a', 'b')).toBe(20);
  });

  it('decays positive relations toward neutral', () => {
    // Start at +75 (friendly) with no modifiers
    const base = initializeRelations(makeState(['a', 'b']));
    const withHighRelation: GameState = {
      ...base,
      empires: {
        ...base.empires,
        byId: {
          ...base.empires.byId,
          a: {
            ...base.empires.byId['a'],
            relations: {
              b: {
                ...base.empires.byId['a'].relations['b'],
                value: 75,
                state: 'friendly',
              },
            },
          },
        },
      },
    };

    const result = processRelations(withHighRelation);
    const newValue = getRelationValue(result, 'a', 'b');

    // decayAmount = floor((75 - 0) * 0.02) = floor(1.5) = 1
    expect(newValue).toBe(74);
  });

  it('decays negative relations toward neutral', () => {
    const base = initializeRelations(makeState(['a', 'b']));
    const withLowRelation: GameState = {
      ...base,
      empires: {
        ...base.empires,
        byId: {
          ...base.empires.byId,
          a: {
            ...base.empires.byId['a'],
            relations: {
              b: {
                ...base.empires.byId['a'].relations['b'],
                value: -80,
                state: 'war',
              },
            },
          },
        },
      },
    };

    const result = processRelations(withLowRelation);
    const newValue = getRelationValue(result, 'a', 'b');

    // decayAmount = floor((-80 - 0) * 0.02) = floor(-1.6) = -1 (Math.floor)
    // newValue = -80 - (-1) = -79  (subtract decay, which is negative, so add)
    // Wait: the code does `newValue - decayAmount`. decayAmount = floor(-80*0.02)=floor(-1.6)=-2
    // newValue = -80 - (-2) = -78
    expect(newValue).toBeGreaterThan(-80);
    expect(newValue).toBeLessThan(0);
  });

  it('removes expired modifiers after processing', () => {
    const base = initializeRelations(makeState(['a', 'b'], 5));
    // Modifier expires at turn 5 (current turn)
    const withMod = applyRelationModifier(base, 'a', 'b', {
      reason: 'temporary boost',
      amount: +15,
      expiresAtTurn: 5,
    });
    const result = processRelations(withMod);

    expect(result.empires.byId['a'].relations['b'].modifiers).toHaveLength(0);
  });

  it('keeps non-expired modifiers after processing', () => {
    const base = initializeRelations(makeState(['a', 'b'], 5));
    // Modifier expires at turn 10 — should persist
    const withMod = applyRelationModifier(base, 'a', 'b', {
      reason: 'ongoing treaty',
      amount: +5,
      expiresAtTurn: 10,
    });
    const result = processRelations(withMod);

    expect(result.empires.byId['a'].relations['b'].modifiers).toHaveLength(1);
  });

  it('clamps relation value at RELATION_MAX (+100) before decay', () => {
    // value=95 + modifier(+50) = 145 → clamp to 100 → decay floor(100*0.02)=2 → 98
    const base = initializeRelations(makeState(['a', 'b']));
    const withMaxRelation: GameState = {
      ...base,
      empires: {
        ...base.empires,
        byId: {
          ...base.empires.byId,
          a: {
            ...base.empires.byId['a'],
            relations: {
              b: {
                ...base.empires.byId['a'].relations['b'],
                value: 95,
                state: 'allied',
              },
            },
          },
        },
      },
    };
    const withBigMod = applyRelationModifier(
      withMaxRelation, 'a', 'b', { reason: 'big gift', amount: +50 }
    );
    const result = processRelations(withBigMod);

    // Capped at 100 before decay; decay of 2 applied → final value = 98
    expect(getRelationValue(result, 'a', 'b')).toBeLessThanOrEqual(RELATION_MAX);
    expect(getRelationValue(result, 'a', 'b')).toBeGreaterThan(90);
  });

  it('clamps relation value at RELATION_MIN (-100) before decay', () => {
    // value=-90 + modifier(-100) = -190 → clamp to -100 → decay floor(-100*0.02)=-2 → -100+2=-98
    const base = initializeRelations(makeState(['a', 'b']));
    const withMinRelation: GameState = {
      ...base,
      empires: {
        ...base.empires,
        byId: {
          ...base.empires.byId,
          a: {
            ...base.empires.byId['a'],
            relations: {
              b: {
                ...base.empires.byId['a'].relations['b'],
                value: -90,
                state: 'war',
              },
            },
          },
        },
      },
    };
    const withBigNegMod = applyRelationModifier(
      withMinRelation, 'a', 'b', { reason: 'declare war', amount: -100 }
    );
    const result = processRelations(withBigNegMod);

    // Capped at -100 before decay; decay pulls toward 0 → final value > -100
    expect(getRelationValue(result, 'a', 'b')).toBeGreaterThanOrEqual(RELATION_MIN);
    expect(getRelationValue(result, 'a', 'b')).toBeLessThan(-90);
  });

  it('updates the diplomatic state label to "war" when value drops to -50 or below', () => {
    const base = initializeRelations(makeState(['a', 'b']));
    const withRelation: GameState = {
      ...base,
      empires: {
        ...base.empires,
        byId: {
          ...base.empires.byId,
          a: {
            ...base.empires.byId['a'],
            relations: {
              b: {
                ...base.empires.byId['a'].relations['b'],
                value: -20,
                state: 'unfriendly',
              },
            },
          },
        },
      },
    };
    const withWarMod = applyRelationModifier(
      withRelation, 'a', 'b', { reason: 'war declared', amount: -100 }
    );
    const result = processRelations(withWarMod);

    expect(result.empires.byId['a'].relations['b'].state).toBe('war');
  });

  it('updates the diplomatic state label to "allied" when value reaches 80+', () => {
    const base = initializeRelations(makeState(['a', 'b']));
    const withRelation: GameState = {
      ...base,
      empires: {
        ...base.empires,
        byId: {
          ...base.empires.byId,
          a: {
            ...base.empires.byId['a'],
            relations: {
              b: {
                ...base.empires.byId['a'].relations['b'],
                value: 60,
                state: 'friendly',
              },
            },
          },
        },
      },
    };
    const withAllianceMod = applyRelationModifier(
      withRelation, 'a', 'b', { reason: 'form alliance', amount: +50 }
    );
    const result = processRelations(withAllianceMod);

    expect(result.empires.byId['a'].relations['b'].state).toBe('allied');
  });
});

// ── Tests: getRelationValue ───────────────────────────────────────────────────

describe('getRelationValue', () => {
  it('returns 0 (neutral) for freshly-initialised empires', () => {
    const state = initializeRelations(makeState(['a', 'b']));
    expect(getRelationValue(state, 'a', 'b')).toBe(0);
  });

  it('returns 0 (neutral baseline) when empire does not exist', () => {
    const state = initializeRelations(makeState(['a', 'b']));
    expect(getRelationValue(state, 'nonexistent', 'b')).toBe(0);
  });

  it('returns the correct value after modifiers are processed', () => {
    const base = initializeRelations(makeState(['a', 'b']));
    const withMod = applyRelationModifier(base, 'a', 'b', { reason: 'spy caught', amount: -20 });
    const processed = processRelations(withMod);
    // decay: floor((-20-0)*0.02) = floor(-0.4) = -1 → newValue = -20 - (-1) = -19
    expect(getRelationValue(processed, 'a', 'b')).toBe(-19);
  });
});
