/**
 * Trade Disruption and Sanctions tests.
 * test/game/systems/tradeDisruption.test.ts
 *
 * Tests for design/diplomacy/trade.md §Pirates & Space Monsters and §Trade Sanctions.
 */

import { describe, it, expect } from 'vitest';
import {
  hasActivePiracyEvent,
  calculatePiracyTradeMultiplier,
  hasSpaceMonsterDisruption,
  calculateMonsterTradeMultiplier,
  calculateTradeDisruptionMultiplier,
  isUnderSanctions,
  getSanction,
  calculateSanctionTradeMultiplier,
  wouldViolateSanctions,
  imposeSanctions,
  liftSanctions,
  applySanctionViolationPenalty,
  computeTradeIncomeWithDisruption,
  computeTradeIncome,
  TRADE_RAMP_TURNS,
} from '../../../src/game/systems/treaties';
import { initializeRelations } from '../../../src/game/systems/diplomacy';
import {
  PIRATE_TRADE_REDUCTION_BASE,
  PIRATE_TRADE_REDUCTION_MAX,
  SANCTION_BREAK_RELATION_PENALTY,
  SANCTION_TRADE_INCOME_PENALTY,
} from '../../../src/game/constants';
import {
  ActiveEvent,
  DiplomaticRelations,
  Empire,
  GameState,
  HighCouncil,
  SpaceMonster,
  TradeSanction,
} from '../../../src/game/state';

// ── Minimal state factory ─────────────────────────────────────────────────────

function makeEmpire(
  id: string,
  relations: Record<string, DiplomaticRelations> = {},
  raceId = 'rats',
  creditPerTurn = 200,
  planets: string[] = [],
): Empire {
  return {
    id,
    raceId,
    name: `Empire ${id}`,
    isPlayer: false,
    credits: 0,
    creditPerTurn,
    planets,
    fleets: [],
    shipDesigns: [],
    scannerTechLevel: 0,
    computerTechLevel: 0,
    securityLevel: 0,
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
    exploredSystems: [],
    visibleSystems: [],
    isDefeated: false,
    defeatedTurn: null,
  };
}

function makeState(
  empireIds: string[],
  turn = 1,
  creditPerTurn = 200,
  options: {
    activeEvents?: ActiveEvent[];
    monsters?: SpaceMonster[];
    highCouncil?: HighCouncil | null;
    planets?: Record<string, { systemId: string }>;
  } = {},
): GameState {
  const byId: Record<string, Empire> = {};
  const planetIds: string[] = [];

  for (const id of empireIds) {
    const empirePlanets: string[] = [];
    if (options.planets) {
      for (const planetId of Object.keys(options.planets)) {
        if (planetId.startsWith(`planet-${id}`)) {
          empirePlanets.push(planetId);
          planetIds.push(planetId);
        }
      }
    }
    byId[id] = makeEmpire(id, {}, 'rats', creditPerTurn, empirePlanets);
  }

  const planetsById: Record<string, unknown> = {};
  if (options.planets) {
    for (const [planetId, data] of Object.entries(options.planets)) {
      const empireId = planetId.split('-')[1];
      planetsById[planetId] = {
        id: planetId,
        name: planetId,
        systemId: data.systemId,
        ownerId: empireId,
        isColonized: true,
        population: 10,
        maxPopulation: 50,
      };
    }
  }

  return {
    version: '0.1.0',
    seed: 'test',
    turn,
    year: 2400 + turn,
    difficulty: 'normal' as const,
    isPaused: false,
    gameSpeed: 'normal' as const,
    currentScreen: 'galaxy' as const,
    victoryCondition: null,
    defeatedTurn: null,
    isGameOver: false,
    victoryResult: null,
    createdAt: 0,
    lastPlayed: 0,
    playTime: 0,
    galaxy: {
      id: 'g1',
      size: 'small' as const,
      shape: 'spiral' as const,
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
    planets: { byId: planetsById, allIds: planetIds } as GameState['planets'],
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
    highCouncil: options.highCouncil ?? null,
    spyMissions: [],
    activeEvents: options.activeEvents ?? [],
    monsters: options.monsters ?? [],
    turnEvents: [],
    currentPhase: null,
    phaseOutputs: [],
    ui: {
      currentScreen: 'galaxy' as const,
      previousScreen: null,
      selectedSystem: null,
      selectedPlanet: null,
      selectedFleet: null,
      selectedShip: null,
      fleetDeploymentMode: null,
      camera: { x: 0, y: 0, zoom: 1, target: null },
      modals: {
        shipDesigner: { open: false },
        diplomacy: { open: false },
        combat: { open: false },
        victory: { open: false },
        groundCombat: null,
      },
      notifications: [],
      filters: { planetsSort: 'name' as const, fleetsFilter: 'all' as const },
      settings: {
        masterVolume: 1,
        musicVolume: 1,
        sfxVolume: 1,
        ambientVolume: 1,
        particleEffects: true,
        animationSpeed: 'normal' as const,
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
      },
    },
  } as GameState;
}

/** Convenience: initialise a state with relations for the given empires. */
function makeInitedState(
  empireIds: string[],
  turn = 1,
  creditPerTurn = 200,
  options: Parameters<typeof makeState>[3] = {},
): GameState {
  return initializeRelations(makeState(empireIds, turn, creditPerTurn, options));
}

// ── Tests: Piracy Trade Disruption ────────────────────────────────────────────

describe('Piracy Trade Disruption (design/diplomacy/trade.md §Pirates)', () => {
  describe('hasActivePiracyEvent', () => {
    it('returns false when no active events exist', () => {
      const state = makeState(['alpha', 'beta']);
      expect(hasActivePiracyEvent(state, 'alpha')).toBe(false);
    });

    it('returns false when piracy event targets different empire', () => {
      const piracyEvent: ActiveEvent = {
        id: 'piracy-1',
        type: 'piracy',
        startTurn: 1,
        endTurn: 5,
        targetPlanetId: null,
        targetSystemId: null,
        targetEmpireId: 'beta',
        data: {},
      };
      const state = makeState(['alpha', 'beta'], 1, 200, { activeEvents: [piracyEvent] });
      expect(hasActivePiracyEvent(state, 'alpha')).toBe(false);
    });

    it('returns true when piracy event targets the empire', () => {
      const piracyEvent: ActiveEvent = {
        id: 'piracy-1',
        type: 'piracy',
        startTurn: 1,
        endTurn: 5,
        targetPlanetId: null,
        targetSystemId: null,
        targetEmpireId: 'alpha',
        data: {},
      };
      const state = makeState(['alpha', 'beta'], 1, 200, { activeEvents: [piracyEvent] });
      expect(hasActivePiracyEvent(state, 'alpha')).toBe(true);
    });
  });

  describe('calculatePiracyTradeMultiplier', () => {
    it('returns 1.0 when no piracy event', () => {
      const state = makeState(['alpha', 'beta']);
      expect(calculatePiracyTradeMultiplier(state, 'alpha')).toBe(1.0);
    });

    it('returns base reduction (0.80) for piracy with no severity data', () => {
      const piracyEvent: ActiveEvent = {
        id: 'piracy-1',
        type: 'piracy',
        startTurn: 1,
        endTurn: 5,
        targetPlanetId: null,
        targetSystemId: null,
        targetEmpireId: 'alpha',
        data: {},
      };
      const state = makeState(['alpha', 'beta'], 1, 200, { activeEvents: [piracyEvent] });

      // Base reduction = 20%, so multiplier = 0.80
      const mult = calculatePiracyTradeMultiplier(state, 'alpha');
      expect(mult).toBeCloseTo(1.0 - PIRATE_TRADE_REDUCTION_BASE, 5);
    });

    it('returns maximum reduction (0.50) for piracy with severity=1.0', () => {
      const piracyEvent: ActiveEvent = {
        id: 'piracy-1',
        type: 'piracy',
        startTurn: 1,
        endTurn: 5,
        targetPlanetId: null,
        targetSystemId: null,
        targetEmpireId: 'alpha',
        data: { severity: 1.0 },
      };
      const state = makeState(['alpha', 'beta'], 1, 200, { activeEvents: [piracyEvent] });

      // Max reduction = 50%, so multiplier = 0.50
      const mult = calculatePiracyTradeMultiplier(state, 'alpha');
      expect(mult).toBeCloseTo(1.0 - PIRATE_TRADE_REDUCTION_MAX, 5);
    });

    it('scales reduction between 20-50% based on severity', () => {
      const piracyEvent: ActiveEvent = {
        id: 'piracy-1',
        type: 'piracy',
        startTurn: 1,
        endTurn: 5,
        targetPlanetId: null,
        targetSystemId: null,
        targetEmpireId: 'alpha',
        data: { severity: 0.5 },
      };
      const state = makeState(['alpha', 'beta'], 1, 200, { activeEvents: [piracyEvent] });

      // At severity 0.5: reduction = 0.20 + (0.5 * 0.30) = 0.35
      // Multiplier = 1.0 - 0.35 = 0.65
      const mult = calculatePiracyTradeMultiplier(state, 'alpha');
      const expectedReduction = PIRATE_TRADE_REDUCTION_BASE + 
        (0.5 * (PIRATE_TRADE_REDUCTION_MAX - PIRATE_TRADE_REDUCTION_BASE));
      expect(mult).toBeCloseTo(1.0 - expectedReduction, 5);
    });
  });
});

// ── Tests: Space Monster Trade Disruption ─────────────────────────────────────

describe('Space Monster Trade Disruption (design/diplomacy/trade.md §Space Monsters)', () => {
  describe('hasSpaceMonsterDisruption', () => {
    it('returns false when no monsters exist', () => {
      const state = makeState(['alpha', 'beta']);
      expect(hasSpaceMonsterDisruption(state, 'alpha')).toBe(false);
    });

    it('returns false when monster is in unrelated system', () => {
      const monster: SpaceMonster = {
        id: 'monster-1',
        type: 'cosmic_blob',
        systemId: 'system-gamma',
        hp: 100,
        maxHp: 100,
        isRoaming: true,
        spawnTurn: 1,
      };
      const state = makeState(['alpha', 'beta'], 1, 200, {
        monsters: [monster],
        planets: {
          'planet-alpha-1': { systemId: 'system-alpha' },
        },
      });
      expect(hasSpaceMonsterDisruption(state, 'alpha')).toBe(false);
    });

    it('returns true when monster is in empire system', () => {
      const monster: SpaceMonster = {
        id: 'monster-1',
        type: 'cosmic_blob',
        systemId: 'system-alpha',
        hp: 100,
        maxHp: 100,
        isRoaming: true,
        spawnTurn: 1,
      };
      const state = makeState(['alpha', 'beta'], 1, 200, {
        monsters: [monster],
        planets: {
          'planet-alpha-1': { systemId: 'system-alpha' },
        },
      });
      expect(hasSpaceMonsterDisruption(state, 'alpha')).toBe(true);
    });
  });

  describe('calculateMonsterTradeMultiplier', () => {
    it('returns 1.0 when no monster disruption', () => {
      const state = makeState(['alpha', 'beta']);
      expect(calculateMonsterTradeMultiplier(state, 'alpha')).toBe(1.0);
    });

    it('returns 0.0 when monster blocks trade route', () => {
      const monster: SpaceMonster = {
        id: 'monster-1',
        type: 'void_wyrm',
        systemId: 'system-alpha',
        hp: 200,
        maxHp: 200,
        isRoaming: true,
        spawnTurn: 1,
      };
      const state = makeState(['alpha', 'beta'], 1, 200, {
        monsters: [monster],
        planets: {
          'planet-alpha-1': { systemId: 'system-alpha' },
        },
      });
      // Space monster completely blocks trade (100% reduction)
      expect(calculateMonsterTradeMultiplier(state, 'alpha')).toBe(0.0);
    });
  });
});

// ── Tests: Combined Trade Disruption ──────────────────────────────────────────

describe('calculateTradeDisruptionMultiplier', () => {
  it('returns 1.0 with no disruptions', () => {
    const state = makeState(['alpha', 'beta']);
    expect(calculateTradeDisruptionMultiplier(state, 'alpha')).toBe(1.0);
  });

  it('combines piracy and monster disruptions multiplicatively', () => {
    const piracyEvent: ActiveEvent = {
      id: 'piracy-1',
      type: 'piracy',
      startTurn: 1,
      endTurn: 5,
      targetPlanetId: null,
      targetSystemId: null,
      targetEmpireId: 'alpha',
      data: { severity: 0.0 }, // 20% reduction, mult = 0.80
    };
    const monster: SpaceMonster = {
      id: 'monster-1',
      type: 'cosmic_blob',
      systemId: 'system-alpha',
      hp: 100,
      maxHp: 100,
      isRoaming: true,
      spawnTurn: 1,
    };
    const state = makeState(['alpha', 'beta'], 1, 200, {
      activeEvents: [piracyEvent],
      monsters: [monster],
      planets: {
        'planet-alpha-1': { systemId: 'system-alpha' },
      },
    });

    // Piracy mult (0.80) * Monster mult (0.0) = 0.0
    expect(calculateTradeDisruptionMultiplier(state, 'alpha')).toBe(0.0);
  });
});

// ── Tests: Trade Sanctions ────────────────────────────────────────────────────

describe('Trade Sanctions (design/diplomacy/trade.md §Trade Sanctions)', () => {
  describe('isUnderSanctions', () => {
    it('returns false when no highCouncil exists', () => {
      const state = makeState(['alpha', 'beta']);
      expect(isUnderSanctions(state, 'alpha')).toBe(false);
    });

    it('returns false when no sanctions exist', () => {
      const highCouncil: HighCouncil = {
        isActive: true,
        formationTurn: 1,
        nextVoteTurn: 26,
        voteFrequency: 25,
        voteHistory: [],
        voteShares: {},
        sanctions: [],
      };
      const state = makeState(['alpha', 'beta'], 1, 200, { highCouncil });
      expect(isUnderSanctions(state, 'alpha')).toBe(false);
    });

    it('returns true when empire is sanctioned', () => {
      const sanction: TradeSanction = {
        targetEmpireId: 'alpha',
        imposedTurn: 5,
        supportingEmpires: ['beta', 'gamma'],
      };
      const highCouncil: HighCouncil = {
        isActive: true,
        formationTurn: 1,
        nextVoteTurn: 26,
        voteFrequency: 25,
        voteHistory: [],
        voteShares: {},
        sanctions: [sanction],
      };
      const state = makeState(['alpha', 'beta', 'gamma'], 1, 200, { highCouncil });
      expect(isUnderSanctions(state, 'alpha')).toBe(true);
    });

    it('returns false for non-sanctioned empire', () => {
      const sanction: TradeSanction = {
        targetEmpireId: 'alpha',
        imposedTurn: 5,
        supportingEmpires: ['beta', 'gamma'],
      };
      const highCouncil: HighCouncil = {
        isActive: true,
        formationTurn: 1,
        nextVoteTurn: 26,
        voteFrequency: 25,
        voteHistory: [],
        voteShares: {},
        sanctions: [sanction],
      };
      const state = makeState(['alpha', 'beta', 'gamma'], 1, 200, { highCouncil });
      expect(isUnderSanctions(state, 'beta')).toBe(false);
    });
  });

  describe('getSanction', () => {
    it('returns undefined when no sanction exists', () => {
      const state = makeState(['alpha', 'beta']);
      expect(getSanction(state, 'alpha')).toBeUndefined();
    });

    it('returns the sanction record for sanctioned empire', () => {
      const sanction: TradeSanction = {
        targetEmpireId: 'alpha',
        imposedTurn: 5,
        supportingEmpires: ['beta', 'gamma'],
      };
      const highCouncil: HighCouncil = {
        isActive: true,
        formationTurn: 1,
        nextVoteTurn: 26,
        voteFrequency: 25,
        voteHistory: [],
        voteShares: {},
        sanctions: [sanction],
      };
      const state = makeState(['alpha', 'beta', 'gamma'], 1, 200, { highCouncil });
      const result = getSanction(state, 'alpha');
      expect(result).toEqual(sanction);
    });
  });

  describe('calculateSanctionTradeMultiplier', () => {
    it('returns 1.0 for non-sanctioned empire', () => {
      const state = makeState(['alpha', 'beta']);
      expect(calculateSanctionTradeMultiplier(state, 'alpha')).toBe(1.0);
    });

    it('returns 0.50 for sanctioned empire (-50% trade income)', () => {
      const sanction: TradeSanction = {
        targetEmpireId: 'alpha',
        imposedTurn: 5,
        supportingEmpires: ['beta'],
      };
      const highCouncil: HighCouncil = {
        isActive: true,
        formationTurn: 1,
        nextVoteTurn: 26,
        voteFrequency: 25,
        voteHistory: [],
        voteShares: {},
        sanctions: [sanction],
      };
      const state = makeState(['alpha', 'beta'], 1, 200, { highCouncil });
      expect(calculateSanctionTradeMultiplier(state, 'alpha')).toBeCloseTo(
        1.0 - SANCTION_TRADE_INCOME_PENALTY,
        5,
      );
    });
  });

  describe('wouldViolateSanctions', () => {
    it('returns false when neither empire is sanctioned', () => {
      const state = makeState(['alpha', 'beta']);
      expect(wouldViolateSanctions(state, 'alpha', 'beta')).toBe(false);
    });

    it('returns true when first empire is sanctioned', () => {
      const sanction: TradeSanction = {
        targetEmpireId: 'alpha',
        imposedTurn: 5,
        supportingEmpires: ['beta'],
      };
      const highCouncil: HighCouncil = {
        isActive: true,
        formationTurn: 1,
        nextVoteTurn: 26,
        voteFrequency: 25,
        voteHistory: [],
        voteShares: {},
        sanctions: [sanction],
      };
      const state = makeState(['alpha', 'beta'], 1, 200, { highCouncil });
      expect(wouldViolateSanctions(state, 'alpha', 'beta')).toBe(true);
    });

    it('returns true when second empire is sanctioned', () => {
      const sanction: TradeSanction = {
        targetEmpireId: 'beta',
        imposedTurn: 5,
        supportingEmpires: ['alpha'],
      };
      const highCouncil: HighCouncil = {
        isActive: true,
        formationTurn: 1,
        nextVoteTurn: 26,
        voteFrequency: 25,
        voteHistory: [],
        voteShares: {},
        sanctions: [sanction],
      };
      const state = makeState(['alpha', 'beta'], 1, 200, { highCouncil });
      expect(wouldViolateSanctions(state, 'alpha', 'beta')).toBe(true);
    });
  });

  describe('imposeSanctions', () => {
    it('adds sanction to highCouncil', () => {
      const state = makeState(['alpha', 'beta', 'gamma']);
      const result = imposeSanctions(state, 'alpha', ['beta', 'gamma']);

      expect(result.highCouncil).toBeDefined();
      expect(result.highCouncil!.sanctions).toHaveLength(1);
      expect(result.highCouncil!.sanctions[0].targetEmpireId).toBe('alpha');
      expect(result.highCouncil!.sanctions[0].supportingEmpires).toEqual(['beta', 'gamma']);
    });

    it('creates highCouncil if not present', () => {
      const state = makeState(['alpha', 'beta']);
      expect(state.highCouncil).toBeNull();

      const result = imposeSanctions(state, 'alpha', ['beta']);
      expect(result.highCouncil).toBeDefined();
      expect(result.highCouncil!.isActive).toBe(true);
    });

    it('does not double-sanction', () => {
      const sanction: TradeSanction = {
        targetEmpireId: 'alpha',
        imposedTurn: 5,
        supportingEmpires: ['beta'],
      };
      const highCouncil: HighCouncil = {
        isActive: true,
        formationTurn: 1,
        nextVoteTurn: 26,
        voteFrequency: 25,
        voteHistory: [],
        voteShares: {},
        sanctions: [sanction],
      };
      const state = makeState(['alpha', 'beta', 'gamma'], 10, 200, { highCouncil });
      const result = imposeSanctions(state, 'alpha', ['gamma']);

      // Should not add duplicate sanction
      expect(result.highCouncil!.sanctions).toHaveLength(1);
    });
  });

  describe('liftSanctions', () => {
    it('removes sanction from highCouncil', () => {
      const sanction: TradeSanction = {
        targetEmpireId: 'alpha',
        imposedTurn: 5,
        supportingEmpires: ['beta'],
      };
      const highCouncil: HighCouncil = {
        isActive: true,
        formationTurn: 1,
        nextVoteTurn: 26,
        voteFrequency: 25,
        voteHistory: [],
        voteShares: {},
        sanctions: [sanction],
      };
      const state = makeState(['alpha', 'beta'], 1, 200, { highCouncil });
      const result = liftSanctions(state, 'alpha');

      expect(result.highCouncil!.sanctions).toHaveLength(0);
    });

    it('does nothing when no highCouncil exists', () => {
      const state = makeState(['alpha', 'beta']);
      const result = liftSanctions(state, 'alpha');
      expect(result).toBe(state);
    });

    it('keeps other sanctions intact', () => {
      const sanction1: TradeSanction = {
        targetEmpireId: 'alpha',
        imposedTurn: 5,
        supportingEmpires: ['beta'],
      };
      const sanction2: TradeSanction = {
        targetEmpireId: 'gamma',
        imposedTurn: 6,
        supportingEmpires: ['beta'],
      };
      const highCouncil: HighCouncil = {
        isActive: true,
        formationTurn: 1,
        nextVoteTurn: 26,
        voteFrequency: 25,
        voteHistory: [],
        voteShares: {},
        sanctions: [sanction1, sanction2],
      };
      const state = makeState(['alpha', 'beta', 'gamma'], 1, 200, { highCouncil });
      const result = liftSanctions(state, 'alpha');

      expect(result.highCouncil!.sanctions).toHaveLength(1);
      expect(result.highCouncil!.sanctions[0].targetEmpireId).toBe('gamma');
    });
  });

  describe('applySanctionViolationPenalty', () => {
    it('applies -30 relation penalty to all empires', () => {
      const state = makeInitedState(['alpha', 'beta', 'gamma']);

      const valueBefore = state.empires.byId['alpha'].relations['beta'].value;
      const result = applySanctionViolationPenalty(state, 'alpha');
      const valueAfter = result.empires.byId['alpha'].relations['beta'].value;

      // Should be reduced by SANCTION_BREAK_RELATION_PENALTY (-30)
      expect(valueAfter).toBe(Math.max(-100, valueBefore + SANCTION_BREAK_RELATION_PENALTY));
    });

    it('applies penalty symmetrically', () => {
      const state = makeInitedState(['alpha', 'beta']);
      const result = applySanctionViolationPenalty(state, 'alpha');

      // Both directions should be penalized
      expect(result.empires.byId['alpha'].relations['beta'].value).toBeLessThan(
        state.empires.byId['alpha'].relations['beta'].value,
      );
      expect(result.empires.byId['beta'].relations['alpha'].value).toBeLessThan(
        state.empires.byId['beta'].relations['alpha'].value,
      );
    });
  });
});

// ── Tests: computeTradeIncomeWithDisruption ───────────────────────────────────

describe('computeTradeIncomeWithDisruption', () => {
  it('returns same as computeTradeIncome with no disruptions', () => {
    const state = makeState(['alpha', 'beta']);
    const empire = state.empires.byId['alpha'];
    const baseIncome = 100;
    const turnsActive = TRADE_RAMP_TURNS; // Full ramp

    const normalIncome = computeTradeIncome(baseIncome, turnsActive, empire);
    const disruptedIncome = computeTradeIncomeWithDisruption(baseIncome, turnsActive, empire, state);

    expect(disruptedIncome).toBe(normalIncome);
  });

  it('reduces income by 20% with base piracy event', () => {
    const piracyEvent: ActiveEvent = {
      id: 'piracy-1',
      type: 'piracy',
      startTurn: 1,
      endTurn: 5,
      targetPlanetId: null,
      targetSystemId: null,
      targetEmpireId: 'alpha',
      data: { severity: 0.0 },
    };
    const state = makeState(['alpha', 'beta'], 1, 200, { activeEvents: [piracyEvent] });
    const empire = state.empires.byId['alpha'];
    const baseIncome = 100;
    const turnsActive = TRADE_RAMP_TURNS;

    const normalIncome = computeTradeIncome(baseIncome, turnsActive, empire);
    const disruptedIncome = computeTradeIncomeWithDisruption(baseIncome, turnsActive, empire, state);

    expect(disruptedIncome).toBeCloseTo(normalIncome * 0.80, 5);
  });

  it('reduces income by 50% for sanctioned empire', () => {
    const sanction: TradeSanction = {
      targetEmpireId: 'alpha',
      imposedTurn: 1,
      supportingEmpires: ['beta'],
    };
    const highCouncil: HighCouncil = {
      isActive: true,
      formationTurn: 1,
      nextVoteTurn: 26,
      voteFrequency: 25,
      voteHistory: [],
      voteShares: {},
      sanctions: [sanction],
    };
    const state = makeState(['alpha', 'beta'], 1, 200, { highCouncil });
    const empire = state.empires.byId['alpha'];
    const baseIncome = 100;
    const turnsActive = TRADE_RAMP_TURNS;

    const normalIncome = computeTradeIncome(baseIncome, turnsActive, empire);
    const disruptedIncome = computeTradeIncomeWithDisruption(baseIncome, turnsActive, empire, state);

    expect(disruptedIncome).toBeCloseTo(normalIncome * 0.50, 5);
  });

  it('combines all disruption effects', () => {
    const piracyEvent: ActiveEvent = {
      id: 'piracy-1',
      type: 'piracy',
      startTurn: 1,
      endTurn: 5,
      targetPlanetId: null,
      targetSystemId: null,
      targetEmpireId: 'alpha',
      data: { severity: 0.0 }, // 20% reduction, mult = 0.80
    };
    const sanction: TradeSanction = {
      targetEmpireId: 'alpha',
      imposedTurn: 1,
      supportingEmpires: ['beta'],
    };
    const highCouncil: HighCouncil = {
      isActive: true,
      formationTurn: 1,
      nextVoteTurn: 26,
      voteFrequency: 25,
      voteHistory: [],
      voteShares: {},
      sanctions: [sanction],
    };
    const state = makeState(['alpha', 'beta'], 1, 200, {
      activeEvents: [piracyEvent],
      highCouncil,
    });
    const empire = state.empires.byId['alpha'];
    const baseIncome = 100;
    const turnsActive = TRADE_RAMP_TURNS;

    const normalIncome = computeTradeIncome(baseIncome, turnsActive, empire);
    const disruptedIncome = computeTradeIncomeWithDisruption(baseIncome, turnsActive, empire, state);

    // Piracy (0.80) * Sanctions (0.50) = 0.40
    expect(disruptedIncome).toBeCloseTo(normalIncome * 0.80 * 0.50, 5);
  });

  it('returns 0 when monster blocks all trade', () => {
    const monster: SpaceMonster = {
      id: 'monster-1',
      type: 'cosmic_blob',
      systemId: 'system-alpha',
      hp: 100,
      maxHp: 100,
      isRoaming: true,
      spawnTurn: 1,
    };
    const state = makeState(['alpha', 'beta'], 1, 200, {
      monsters: [monster],
      planets: {
        'planet-alpha-1': { systemId: 'system-alpha' },
      },
    });
    const empire = state.empires.byId['alpha'];
    const baseIncome = 100;
    const turnsActive = TRADE_RAMP_TURNS;

    const disruptedIncome = computeTradeIncomeWithDisruption(baseIncome, turnsActive, empire, state);

    expect(disruptedIncome).toBe(0);
  });
});
