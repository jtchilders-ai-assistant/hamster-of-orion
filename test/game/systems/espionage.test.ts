/**
 * Espionage system tests.
 * test/game/systems/espionage.test.ts
 *
 * Tests spy mission mechanics: success probability, mission creation,
 * turn processing, detection, and racial modifiers.
 */

import { describe, it, expect } from 'vitest';
import {
  sendSpyMission,
  calculateMissionProbability,
  processEspionageTurns,
  foilMission,
  getActiveMissions,
  applyMissionEffect,
} from '../../../src/game/systems/espionage';
import {
  GameState,
  Empire,
  EmpireId,
  MissionType,
  SpyMission,
  ResearchState,
} from '../../../src/game/state';

// ── Test helpers ──────────────────────────────────────────────────────────────

function makeEmpire(
  id: EmpireId,
  raceId: string,
  computerTechLevel: number = 0,
  securityLevel: number = 0,
): Empire {
  return {
    id,
    raceId,
    name: `Empire ${id}`,
    isPlayer: false,
    credits: 100,
    creditPerTurn: 10,
    planets: [],
    fleets: [],
    shipDesigns: [],
    scannerTechLevel: 0,
    computerTechLevel,
    securityLevel,
    research: makeResearchState(),
    relations: {},
    exploredSystems: [],
    visibleSystems: [],
    isDefeated: false,
    defeatedTurn: null,
  };
}

function makeResearchState(): ResearchState {
  return {
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
  };
}

function makeState(empires: Record<EmpireId, Empire>, turn: number = 1): GameState {
  return {
    version: '0.1.0',
    seed: 'test',
    turn,
    year: 2500,
    difficulty: 'normal',
    isPaused: false,
    gameSpeed: 'normal',
    currentScreen: 'galaxy',
    victoryCondition: null,
    defeatedTurn: null,
    isGameOver: false,
    victoryResult: null,
    createdAt: Date.now(),
    lastPlayed: Date.now(),
    playTime: 0,
    galaxy: {
      id: 'galaxy_0',
      size: 'medium',
      shape: 'spiral',
      width: 30,
      height: 30,
      systemCount: 0,
      systems: { byId: {}, allIds: [] },
      nebulae: [],
      clusters: [],
      artifactsSystemIds: [],
      orionSystemId: '',
      homeSystemIds: {},
      fogOfWar: {},
      quadTree: {
        bounds: { x: 0, y: 0, width: 30, height: 30 },
        systemIds: [],
        children: null,
      },
    },
    planets: { byId: {}, allIds: [] },
    fleets: { byId: {}, allIds: [] },
    ships: { byId: {}, allIds: [] },
    shipDesigns: { byId: {}, allIds: [] },
    empires: {
      byId: empires,
      allIds: Object.keys(empires),
      playerId: 'player',
    },
    combats: { byId: {}, allIds: [], activeCombatId: null },
    aiEmpires: {},
    highCouncil: null,
    spyMissions: [],
    ui: {
      selectedPlanetId: null,
      selectedSystemId: null,
      selectedFleetId: null,
      selectedShipDesignId: null,
      currentScreen: 'galaxy',
      previousScreen: 'menu',
      isModalOpen: false,
      modalType: null,
      modalData: null,
      notifications: [],
      filters: { planetsSort: 'name', fleetsFilter: 'all' },
      settings: {
        soundVolume: 0.5,
        musicVolume: 0.5,
        animationSpeed: 1,
        showGrid: true,
        showPaths: true,
      },
      panels: {
        planets: { open: true },
        fleets: { open: true },
        research: { open: true },
        diplomacy: { open: true },
        victory: { open: false },
      },
    },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('calculateMissionProbability', () => {
  it('returns base success for equal tech, no security', () => {
    const sender = { raceId: 'hamsters', computerTechLevel: 10 };
    const target = { raceId: 'hamsters', computerTechLevel: 10, securityLevel: 0 };

    const prob = calculateMissionProbability(sender, target, 'reconnaissance');

    // Base for intelligence_gathering = 80
    // Hamsters espionage bonus = -20 (from races.json)
    // SpyEffectiveness = (30 + (-20) + 0 + 0 - 0) × 1.00 = 10
    // SuccessChance = 80 + 10 = 90, clamped to 0.90
    expect(prob).toBeCloseTo(0.90, 2);
  });

  it('Chameleons have high success vs Hamsters (racial bonus)', () => {
    const sender = { raceId: 'chameleons', computerTechLevel: 10 };
    const target = { raceId: 'hamsters', computerTechLevel: 10, securityLevel: 0 };

    const prob = calculateMissionProbability(sender, target, 'steal_technology');

    // Chameleons: espionage +60, spyRollBonus +30, aggression 1.60
    // SpyEffectiveness = (30 + 60 + 30 + 0 - 0) × 1.60 = 120 × 1.60 = 192
    // Base theft = 30
    // SuccessChance = 30 + 192 = 222 → clamped to 95
    expect(prob).toBe(0.95);
  });

  it('tech advantage increases success', () => {
    const sender = { raceId: 'hamsters', computerTechLevel: 15 };
    const target = { raceId: 'hamsters', computerTechLevel: 10, securityLevel: 0 };

    const prob = calculateMissionProbability(sender, target, 'sabotage_factories');

    // Tech bonus = (15 - 10) × 2 = 10
    // SpyEffectiveness = (30 + (-20) + 0 + 10 - 0) × 1.00 = 20
    // Base sabotage = 40
    // SuccessChance = 40 + 20 = 60
    expect(prob).toBeCloseTo(0.60, 2);
  });

  it('high security reduces success', () => {
    const sender = { raceId: 'hamsters', computerTechLevel: 10 };
    const target = { raceId: 'hamsters', computerTechLevel: 10, securityLevel: 5 };

    const prob = calculateMissionProbability(sender, target, 'assassination');

    // Security penalty = 5 × 10 = 50
    // SpyEffectiveness = (30 + (-20) + 0 + 0 - 50) × 1.00 = -40
    // Base assassination = 10
    // SuccessChance = 10 + (-40) = -30 → clamped to 5 (minimum)
    expect(prob).toBeCloseTo(0.05, 2);
  });

  it('returns 0 for Ants attempting espionage (cannot conduct)', () => {
    const sender = { raceId: 'ants', computerTechLevel: 10 };
    const target = { raceId: 'hamsters', computerTechLevel: 10, securityLevel: 0 };

    const prob = calculateMissionProbability(sender, target, 'steal_technology');

    expect(prob).toBe(0);
  });

  it('returns 0 for missions against Ants (immune)', () => {
    const sender = { raceId: 'chameleons', computerTechLevel: 10 };
    const target = { raceId: 'ants', computerTechLevel: 10, securityLevel: 0 };

    const prob = calculateMissionProbability(sender, target, 'sabotage_factories');

    expect(prob).toBe(0);
  });
});

describe('sendSpyMission', () => {
  it('creates a new spy mission', () => {
    const chameleon = makeEmpire('emp1', 'chameleons', 10, 0);
    const hamster = makeEmpire('emp2', 'hamsters', 10, 2);
    const state = makeState({ emp1: chameleon, emp2: hamster });

    const newState = sendSpyMission(state, 'emp1', 'emp2', 'steal_technology');

    expect(newState.spyMissions).toHaveLength(1);
    expect(newState.spyMissions[0].type).toBe('steal_technology');
    expect(newState.spyMissions[0].senderId).toBe('emp1');
    expect(newState.spyMissions[0].targetId).toBe('emp2');
    expect(newState.spyMissions[0].status).toBe('active');
    expect(newState.spyMissions[0].successProbability).toBeGreaterThan(0);
  });

  it('blocks Ants from sending missions', () => {
    const ant = makeEmpire('emp1', 'ants', 10, 0);
    const hamster = makeEmpire('emp2', 'hamsters', 10, 0);
    const state = makeState({ emp1: ant, emp2: hamster });

    const newState = sendSpyMission(state, 'emp1', 'emp2', 'sabotage_factories');

    expect(newState.spyMissions).toHaveLength(0);
  });

  it('blocks missions against Ants (immune)', () => {
    const chameleon = makeEmpire('emp1', 'chameleons', 10, 0);
    const ant = makeEmpire('emp2', 'ants', 10, 0);
    const state = makeState({ emp1: chameleon, emp2: ant });

    const newState = sendSpyMission(state, 'emp1', 'emp2', 'propaganda');

    expect(newState.spyMissions).toHaveLength(0);
  });

  it('prevents self-espionage', () => {
    const hamster = makeEmpire('emp1', 'hamsters', 10, 0);
    const state = makeState({ emp1: hamster });

    const newState = sendSpyMission(state, 'emp1', 'emp1', 'steal_technology');

    expect(newState.spyMissions).toHaveLength(0);
  });
});

describe('processEspionageTurns', () => {
  it('completes a mission when duration elapses and succeeds', () => {
    const chameleon = makeEmpire('emp1', 'chameleons', 10, 0);
    const hamster = makeEmpire('emp2', 'hamsters', 10, 0);
    let state = makeState({ emp1: chameleon, emp2: hamster }, 1);

    // Send a theft mission (duration = 3 turns)
    state = sendSpyMission(state, 'emp1', 'emp2', 'steal_technology');
    expect(state.spyMissions[0].status).toBe('active');

    // Fast-forward 3 turns with guaranteed success
    state = { ...state, turn: 4 };
    let calls = 0;
    const deterministicRng = () => (calls++ % 2 === 0 ? 0.01 : 0.50); // success, then no detection
    state = processEspionageTurns(state, deterministicRng);

    expect(state.spyMissions[0].status).toBe('completed');
    expect(state.spyMissions[0].reward).toBeDefined();
    expect(state.spyMissions[0].reward?.type).toBe('tech_stolen');
  });

  it('foils a mission when detected', () => {
    const hamster1 = makeEmpire('emp1', 'hamsters', 5, 0);
    const hamster2 = makeEmpire('emp2', 'hamsters', 5, 5); // high security
    let state = makeState({ emp1: hamster1, emp2: hamster2 }, 1);

    state = sendSpyMission(state, 'emp1', 'emp2', 'sabotage_factories');
    state = { ...state, turn: 3 }; // sabotage duration = 2

    // Force detection with high detection roll
    const detectedRng = () => 0.01; // Always detected
    state = processEspionageTurns(state, detectedRng);

    expect(state.spyMissions[0].status).toBe('foiled');
  });

  it('does not process missions still in progress', () => {
    const chameleon = makeEmpire('emp1', 'chameleons', 10, 0);
    const hamster = makeEmpire('emp2', 'hamsters', 10, 0);
    let state = makeState({ emp1: chameleon, emp2: hamster }, 1);

    state = sendSpyMission(state, 'emp1', 'emp2', 'infiltration'); // duration = 5
    state = { ...state, turn: 3 }; // Only 2 turns elapsed

    state = processEspionageTurns(state);

    expect(state.spyMissions[0].status).toBe('active');
  });
});

describe('foilMission', () => {
  it('marks an active mission as foiled', () => {
    const chameleon = makeEmpire('emp1', 'chameleons', 10, 0);
    const hamster = makeEmpire('emp2', 'hamsters', 10, 0);
    let state = makeState({ emp1: chameleon, emp2: hamster });

    state = sendSpyMission(state, 'emp1', 'emp2', 'propaganda');
    const missionId = state.spyMissions[0].id;

    state = foilMission(state, missionId);

    expect(state.spyMissions[0].status).toBe('foiled');
  });

  it('does not affect already completed missions', () => {
    const mission: SpyMission = {
      id: 'mission_1',
      type: 'steal_technology',
      senderId: 'emp1',
      targetId: 'emp2',
      startTurn: 1,
      durationTurns: 3,
      successProbability: 0.5,
      status: 'completed',
      reward: { type: 'tech_stolen', value: 1 },
    };

    const state = makeState({}, 1);
    state.spyMissions = [mission];

    const newState = foilMission(state, 'mission_1');

    expect(newState.spyMissions[0].status).toBe('completed');
  });
});

describe('getActiveMissions', () => {
  it('returns only active missions for an empire', () => {
    const state = makeState({}, 1);
    state.spyMissions = [
      {
        id: 'm1',
        type: 'steal_technology',
        senderId: 'emp1',
        targetId: 'emp2',
        startTurn: 1,
        durationTurns: 3,
        successProbability: 0.5,
        status: 'active',
      },
      {
        id: 'm2',
        type: 'sabotage_factories',
        senderId: 'emp1',
        targetId: 'emp3',
        startTurn: 1,
        durationTurns: 2,
        successProbability: 0.4,
        status: 'completed',
      },
      {
        id: 'm3',
        type: 'propaganda',
        senderId: 'emp2',
        targetId: 'emp1',
        startTurn: 1,
        durationTurns: 4,
        successProbability: 0.6,
        status: 'active',
      },
    ];

    const active = getActiveMissions(state, 'emp1');

    expect(active).toHaveLength(1);
    expect(active[0].id).toBe('m1');
  });
});

describe('applyMissionEffect', () => {
  it('returns state unchanged (effects handled by turn reducer)', () => {
    const mission: SpyMission = {
      id: 'mission_1',
      type: 'sabotage_factories',
      senderId: 'emp1',
      targetId: 'emp2',
      startTurn: 1,
      durationTurns: 2,
      successProbability: 0.4,
      status: 'completed',
      reward: { type: 'factories_destroyed', value: 10 },
    };

    const state = makeState({}, 1);
    const newState = applyMissionEffect(state, mission);

    // applyMissionEffect is a pure pass-through for now
    expect(newState).toBe(state);
  });
});
