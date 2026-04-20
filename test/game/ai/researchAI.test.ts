/**
 * AI Research Priority Selection tests.
 * test/game/ai/researchAI.test.ts
 *
 * Tests for selectResearchPriorities(), aiChooseTech(),
 * evaluateTechValue(), processAIResearch(), and researchFieldToTechField().
 *
 * NO DOM imports — pure TypeScript / Vitest only.
 */

import { describe, it, expect } from 'vitest';
import {
  selectResearchPriorities,
  aiChooseTech,
  evaluateTechValue,
  processAIResearch,
  researchFieldToTechField,
  ResearchDecision,
} from '../../../src/game/ai/researchAI';
import {
  GameState,
  Empire,
  AIEmpire,
  AIPersonality,
  AIStrategy,
  AIMemory,
  AIWeights,
  EmpireId,
} from '../../../src/game/state';
import { initialState } from '../../../src/game/initialState';

// ── Fixture helpers ───────────────────────────────────────────────────────────

function makeEmpire(id: string, planetIds: string[] = []): Empire {
  return {
    id,
    raceId: 'hamsters',
    name: `Empire ${id}`,
    isPlayer: false,
    credits: 1000,
    creditPerTurn: 50,
    planets: planetIds,
    fleets: [],
    shipDesigns: [],
    scannerTechLevel: 0,
    research: {
      currentTech: null,
      researchPoints: 0,
      researchPerTurn: 10,
      completedTechs: [],
      availableTechs: {
        weapons:      ['laser_tech', 'nuclear_missile_tech'],
        propulsion:   ['nuclear_drive_tech'],
        construction: ['reinforced_hull_tech'],
        computers:    ['electronic_computer_tech'],
        force_fields: ['class_i_shield_tech'],
        biotechnology: ['terraforming_tech'],
      },
      miniaturization: {},
      stolenTechs: [],
    },
    relations: {},
    exploredSystems: [],
    visibleSystems: [],
    isDefeated: false,
    defeatedTurn: null,
  };
}

function makeAIEmpire(id: string, overrides: Partial<AIPersonality> = {}): AIEmpire {
  const personality: AIPersonality = {
    type: 'balanced',
    aggression: 40,
    expansionism: 60,
    diplomacy: 50,
    research: 50,
    traits: ['logical'],
    ...overrides,
  };

  const weights: AIWeights = {
    shipWeight: 20,
    defenseWeight: 15,
    industryWeight: 30,
    ecologyWeight: 20,
    researchWeight: 15,
    weaponsPriority:      50,
    propulsionPriority:   50,
    constructionPriority: 30,
    computersPriority:    30,
    forceFieldsPriority:  60,
    biotechPriority:      45,
    fleetSizeThreshold: 1.5,
    threatTolerance:    30,
    retreatThreshold:   0.3,
  };

  const strategy: AIStrategy = {
    primary: 'expansion',
    secondary: 'tech_advantage',
    economicFocus: 'production',
    militaryStance: 'neutral',
    diplomaticGoal: 'alliances',
    targetEmpires: {},
    targetSystems: [],
    lastEvaluation: 0,
    nextEvaluation: 10,
  };

  const memory: AIMemory = {
    playerBetrayals: 0,
    playerAggression: 0,
    playerDiplomacy: 0,
    lastWars: [],
    failedInvasions: [],
    lostSystems: [],
    brokenTreaties: [],
    receivedHelp: [],
  };

  return { id, raceId: 'hamsters', empireName: `AI ${id}`, personality, strategy, memory, weights };
}

function makeBaseState(turn = 1, extraOverrides: Partial<GameState> = {}): GameState {
  const empire = makeEmpire('ai1', ['p1']);
  const ai     = makeAIEmpire('ai1');

  return {
    ...initialState,
    turn,
    empires: {
      byId: { ai1: empire },
      allIds: ['ai1'],
      playerId: 'player',
    },
    aiEmpires: { ai1: ai },
    ...extraOverrides,
  };
}

// Convenience: pull all available tech ids from an empire's research state
function allAvailable(state: GameState, empireId: EmpireId): string[] {
  const empire = state.empires.byId[empireId];
  if (!empire) return [];
  return (Object.values(empire.research.availableTechs) as string[][]).flat();
}

// ── selectResearchPriorities ──────────────────────────────────────────────────

describe('selectResearchPriorities', () => {
  it('returns exactly 6 decisions — one per field', () => {
    const state   = makeBaseState();
    const techs   = allAvailable(state, 'ai1');
    const results = selectResearchPriorities(state, 'ai1', techs, 'balanced');

    expect(results).toHaveLength(6);
    const fields = results.map(d => d.field);
    expect(fields).toContain('weapons');
    expect(fields).toContain('propulsion');
    expect(fields).toContain('construction');
    expect(fields).toContain('computers');
    expect(fields).toContain('force_fields');
    expect(fields).toContain('planetology');
  });

  it('returns decisions sorted descending by priority', () => {
    const state   = makeBaseState();
    const techs   = allAvailable(state, 'ai1');
    const results = selectResearchPriorities(state, 'ai1', techs, 'balanced');

    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].priority).toBeGreaterThanOrEqual(results[i].priority);
    }
  });

  it('all priorities are clamped 0–100', () => {
    const state   = makeBaseState();
    const techs   = allAvailable(state, 'ai1');
    const results = selectResearchPriorities(state, 'ai1', techs, 'balanced');

    for (const d of results) {
      expect(d.priority).toBeGreaterThanOrEqual(0);
      expect(d.priority).toBeLessThanOrEqual(100);
    }
  });

  it('balanced personality puts force_fields near top (Hamster lore)', () => {
    const state   = makeBaseState();
    const techs   = allAvailable(state, 'ai1');
    const results = selectResearchPriorities(state, 'ai1', techs, 'balanced');

    const ffDecision = results.find((d: ResearchDecision) => d.field === 'force_fields')!;
    const weapDecision = results.find((d: ResearchDecision) => d.field === 'weapons')!;
    // Force fields should score higher than weapons for balanced/Hamster profile
    expect(ffDecision.priority).toBeGreaterThanOrEqual(weapDecision.priority);
  });

  it('aggressive personality puts weapons at top', () => {
    const state   = makeBaseState();
    const techs   = allAvailable(state, 'ai1');
    const results = selectResearchPriorities(state, 'ai1', techs, 'aggressive');

    const top2Fields = results.slice(0, 2).map((d: ResearchDecision) => d.field);
    expect(top2Fields).toContain('weapons');
  });

  it('applies war-time weapons bonus', () => {
    // Give the empire a war relation
    const state = makeBaseState();
    const empire = state.empires.byId['ai1']!;
    const warState: GameState = {
      ...state,
      empires: {
        ...state.empires,
        byId: {
          ai1: {
            ...empire,
            relations: {
              enemy1: {
                empireA: 'ai1',
                empireB: 'enemy1',
                state: 'war',
                treaties: [],
                tradeIncome: 0,
                tradeRampTurn: null,
              },
            },
          },
        },
      },
    };

    const techs      = allAvailable(warState, 'ai1');
    const peacePrios = selectResearchPriorities(state, 'ai1', techs, 'balanced');
    const warPrios   = selectResearchPriorities(warState, 'ai1', techs, 'balanced');

    const peaceWeapScore = peacePrios.find((d: ResearchDecision) => d.field === 'weapons')!.priority;
    const warWeapScore   = warPrios.find((d: ResearchDecision) => d.field === 'weapons')!.priority;

    expect(warWeapScore).toBeGreaterThan(peaceWeapScore);
  });

  it('reasons string is non-empty for each decision', () => {
    const state   = makeBaseState();
    const techs   = allAvailable(state, 'ai1');
    const results = selectResearchPriorities(state, 'ai1', techs, 'balanced');

    for (const d of results) {
      expect(d.reason.length).toBeGreaterThan(0);
    }
  });

  it('works with an empty available-techs list', () => {
    const state   = makeBaseState();
    const results = selectResearchPriorities(state, 'ai1', [], 'balanced');
    expect(results).toHaveLength(6);
  });

  it('falls back gracefully for unknown personality type', () => {
    const state   = makeBaseState();
    const techs   = allAvailable(state, 'ai1');
    // Unknown personality → default weights; should not throw
    const results = selectResearchPriorities(state, 'ai1', techs, 'totally_unknown_race');
    expect(results).toHaveLength(6);
    for (const d of results) {
      expect(d.priority).toBeGreaterThanOrEqual(0);
    }
  });
});

// ── aiChooseTech ──────────────────────────────────────────────────────────────

describe('aiChooseTech', () => {
  it('returns null when availableTechs is empty', () => {
    const state  = makeBaseState();
    const chosen = aiChooseTech(state, 'ai1', []);
    expect(chosen).toBeNull();
  });

  it('returns a tech id that is in availableTechs', () => {
    const state  = makeBaseState();
    const techs  = allAvailable(state, 'ai1');
    const chosen = aiChooseTech(state, 'ai1', techs);

    expect(chosen).not.toBeNull();
    expect(techs).toContain(chosen);
  });

  it('returns the only available tech when list has one entry', () => {
    const state  = makeBaseState();
    const chosen = aiChooseTech(state, 'ai1', ['laser_tech']);
    expect(chosen).toBe('laser_tech');
  });

  it('prefers known techs over unknown ones', () => {
    const state  = makeBaseState();
    // Pass a list with a valid tech and a nonexistent one
    const chosen = aiChooseTech(state, 'ai1', ['totally_fake_tech_id', 'laser_tech']);
    // evaluateTechValue returns 0 for unknown ids; laser_tech should win
    expect(chosen).toBe('laser_tech');
  });
});

// ── evaluateTechValue ─────────────────────────────────────────────────────────

describe('evaluateTechValue', () => {
  it('returns 0 for an unknown tech id', () => {
    expect(evaluateTechValue('ai1', 'nonexistent_tech_xyz', [])).toBe(0);
  });

  it('returns a positive score for a known tech', () => {
    // laser_tech is tier 1 weapons — should produce > 0
    const score = evaluateTechValue('ai1', 'laser_tech', ['laser_tech']);
    expect(score).toBeGreaterThan(0);
  });

  it('higher-tier tech scores higher than lower-tier in same field', () => {
    // gatling_laser_tech is tier 2; laser_tech is tier 1 — both weapons
    const tier1 = evaluateTechValue('ai1', 'laser_tech',         ['laser_tech']);
    const tier2 = evaluateTechValue('ai1', 'gatling_laser_tech', ['gatling_laser_tech']);
    expect(tier2).toBeGreaterThan(tier1);
  });

  it('unique-field bonus: solo tech in its field scores higher', () => {
    // When laser_tech is the only available option in weapons it gets a bonus
    const withBonus    = evaluateTechValue('ai1', 'laser_tech', ['laser_tech']);
    // When another weapons tech is also available the uniqueness bonus disappears
    const withoutBonus = evaluateTechValue('ai1', 'laser_tech', ['laser_tech', 'heavy_laser_tech']);
    expect(withBonus).toBeGreaterThan(withoutBonus);
  });
});

// ── processAIResearch ─────────────────────────────────────────────────────────

describe('processAIResearch', () => {
  it('does not mutate the input state', () => {
    const state  = makeBaseState();
    const before = JSON.stringify(state);
    processAIResearch(state);
    expect(JSON.stringify(state)).toBe(before);
  });

  it('sets currentTech for an AI empire that has none', () => {
    const state = makeBaseState();
    expect(state.empires.byId['ai1']!.research.currentTech).toBeNull();

    const next = processAIResearch(state);
    const tech = next.empires.byId['ai1']!.research.currentTech;

    expect(tech).not.toBeNull();
    // Must be a tech that was actually in the available list
    const available = allAvailable(state, 'ai1');
    expect(available).toContain(tech);
  });

  it('does not change currentTech when one is already set', () => {
    const state = makeBaseState();
    // Pre-set a current tech
    const preloaded: GameState = {
      ...state,
      empires: {
        ...state.empires,
        byId: {
          ai1: {
            ...state.empires.byId['ai1']!,
            research: {
              ...state.empires.byId['ai1']!.research,
              currentTech: 'laser_tech',
            },
          },
        },
      },
    };

    const next = processAIResearch(preloaded);
    expect(next.empires.byId['ai1']!.research.currentTech).toBe('laser_tech');
  });

  it('skips the player empire', () => {
    // Add a player empire alongside the AI
    const state = makeBaseState();
    const playerEmpire = makeEmpire('player', []);
    const extState: GameState = {
      ...state,
      empires: {
        byId: {
          ai1:    state.empires.byId['ai1']!,
          player: playerEmpire,
        },
        allIds: ['ai1', 'player'],
        playerId: 'player',
      },
    };

    const next = processAIResearch(extState);
    // Player's currentTech must stay null (untouched)
    expect(next.empires.byId['player']!.research.currentTech).toBeNull();
    // AI's currentTech should be set
    expect(next.empires.byId['ai1']!.research.currentTech).not.toBeNull();
  });

  it('skips defeated AI empires', () => {
    const state   = makeBaseState();
    const defeated: GameState = {
      ...state,
      empires: {
        ...state.empires,
        byId: {
          ai1: {
            ...state.empires.byId['ai1']!,
            isDefeated: true,
          },
        },
      },
    };

    const next = processAIResearch(defeated);
    expect(next.empires.byId['ai1']!.research.currentTech).toBeNull();
  });

  it('handles AI empire with no available techs', () => {
    const state = makeBaseState();
    const empty: GameState = {
      ...state,
      empires: {
        ...state.empires,
        byId: {
          ai1: {
            ...state.empires.byId['ai1']!,
            research: {
              ...state.empires.byId['ai1']!.research,
              availableTechs: {
                weapons: [], propulsion: [], construction: [],
                computers: [], force_fields: [], biotechnology: [],
              },
            },
          },
        },
      },
    };

    const next = processAIResearch(empty);
    expect(next.empires.byId['ai1']!.research.currentTech).toBeNull();
  });
});

// ── researchFieldToTechField ──────────────────────────────────────────────────

describe('researchFieldToTechField', () => {
  it('maps planetology → biotechnology', () => {
    expect(researchFieldToTechField('planetology')).toBe('biotechnology');
  });

  it('passes non-planetology fields through unchanged', () => {
    expect(researchFieldToTechField('weapons')).toBe('weapons');
    expect(researchFieldToTechField('propulsion')).toBe('propulsion');
    expect(researchFieldToTechField('construction')).toBe('construction');
    expect(researchFieldToTechField('computers')).toBe('computers');
    expect(researchFieldToTechField('force_fields')).toBe('force_fields');
  });
});
