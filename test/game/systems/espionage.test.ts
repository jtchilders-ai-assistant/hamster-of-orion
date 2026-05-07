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

    // Base for reconnaissance = 80
    // Hamsters espionage bonus = 0 (per design/diplomacy/espionage.md §2.1)
    // SpyEffectiveness = (30 + 0 + 0 + 0 - 0) × 1.00 = 30
    // SuccessChance = 80 + 30 = 110, clamped to 95 (MAX_SUCCESS)
    expect(prob).toBeCloseTo(0.95, 2);
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
    // Hamsters espionage bonus = 0 (per design/diplomacy/espionage.md §2.1)
    // SpyEffectiveness = (30 + 0 + 0 + 10 - 0) × 1.00 = 40
    // Base sabotage = 40
    // SuccessChance = 40 + 40 = 80
    expect(prob).toBeCloseTo(0.80, 2);
  });

  it('high security reduces success', () => {
    const sender = { raceId: 'hamsters', computerTechLevel: 10 };
    const target = { raceId: 'hamsters', computerTechLevel: 10, securityLevel: 5 };

    const prob = calculateMissionProbability(sender, target, 'assassination');

    // Security penalty = 5 × 10 = 50
    // Hamsters espionage bonus = 0 (per design/diplomacy/espionage.md §2.1)
    // SpyEffectiveness = (30 + 0 + 0 + 0 - 50) × 1.00 = -20
    // Base assassination = 10
    // SuccessChance = 10 + (-20) = -10 → clamped to 5 (minimum)
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

    const newState = sendSpyMission(state, 'emp1', 'emp2', 'sabotage_bases');

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

    state = sendSpyMission(state, 'emp1', 'emp2', 'assassination'); // duration = 6
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

    state = sendSpyMission(state, 'emp1', 'emp2', 'frame_race');
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
        type: 'frame_race',
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

// Tests for §6.2 Tech Theft Tier Modifiers
import { getTechTheftTierModifier, calculateTechTheftProbability } from '../../../src/game/systems/espionage';

describe('getTechTheftTierModifier (§6.2)', () => {
  it('returns +10 for Tier 1-3 (easier to steal basic tech)', () => {
    expect(getTechTheftTierModifier(1)).toBe(10);
    expect(getTechTheftTierModifier(2)).toBe(10);
    expect(getTechTheftTierModifier(3)).toBe(10);
  });

  it('returns +0 for Tier 4-6', () => {
    expect(getTechTheftTierModifier(4)).toBe(0);
    expect(getTechTheftTierModifier(5)).toBe(0);
    expect(getTechTheftTierModifier(6)).toBe(0);
  });

  it('returns -5 for Tier 7-9', () => {
    expect(getTechTheftTierModifier(7)).toBe(-5);
    expect(getTechTheftTierModifier(8)).toBe(-5);
    expect(getTechTheftTierModifier(9)).toBe(-5);
  });

  it('returns -10 for Tier 10-12', () => {
    expect(getTechTheftTierModifier(10)).toBe(-10);
    expect(getTechTheftTierModifier(11)).toBe(-10);
    expect(getTechTheftTierModifier(12)).toBe(-10);
  });

  it('returns -15 for Tier 13+ (hardest to steal advanced tech)', () => {
    expect(getTechTheftTierModifier(13)).toBe(-15);
    expect(getTechTheftTierModifier(14)).toBe(-15);
    expect(getTechTheftTierModifier(20)).toBe(-15);
  });
});

describe('calculateTechTheftProbability (§6.2)', () => {
  it('low tier tech has higher success rate', () => {
    const sender = { raceId: 'hamsters', computerTechLevel: 10 };
    const target = { raceId: 'hamsters', computerTechLevel: 10, securityLevel: 0 };

    const lowTierProb = calculateTechTheftProbability(sender, target, 2);
    const highTierProb = calculateTechTheftProbability(sender, target, 14);

    // Tier 2 gets +10, Tier 14 gets -15 = 25 point difference
    expect(lowTierProb).toBeGreaterThan(highTierProb);
    expect(lowTierProb - highTierProb).toBeCloseTo(0.25, 2);
  });

  it('Chameleons stealing tier 1 tech have maximum success (capped at 95%)', () => {
    const sender = { raceId: 'chameleons', computerTechLevel: 10 };
    const target = { raceId: 'rabbits', computerTechLevel: 5, securityLevel: 0 };

    const prob = calculateTechTheftProbability(sender, target, 1);

    expect(prob).toBe(0.95); // Capped at 95%
  });

  it('returns 0 when targeting Ants (immune)', () => {
    const sender = { raceId: 'chameleons', computerTechLevel: 10 };
    const target = { raceId: 'ants', computerTechLevel: 10, securityLevel: 0 };

    const prob = calculateTechTheftProbability(sender, target, 5);

    expect(prob).toBe(0);
  });
});

// Tests for §1.3 All Spies Fail
describe('All Spies Fail (§1.3)', () => {
  it('skipTurns is decremented each turn for active missions', () => {
    const hamster1 = makeEmpire('emp1', 'hamsters', 10, 0);
    const hamster2 = makeEmpire('emp2', 'hamsters', 10, 0);
    let state = makeState({ emp1: hamster1, emp2: hamster2 }, 5);

    // Add a mission with skipTurns
    state.spyMissions = [{
      id: 'm1',
      type: 'steal_technology',
      senderId: 'emp1',
      targetId: 'emp2',
      startTurn: 1,
      durationTurns: 3,
      successProbability: 0.5,
      status: 'active',
      skipTurns: 2,
    }];

    // Process turn - should decrement skipTurns
    const newState = processEspionageTurns(state, () => 0.99); // Won't succeed or detect

    expect(newState.spyMissions[0].skipTurns).toBe(1);
  });

  it('missions with skipTurns > 0 are not processed', () => {
    const hamster1 = makeEmpire('emp1', 'hamsters', 10, 0);
    const hamster2 = makeEmpire('emp2', 'hamsters', 10, 0);
    let state = makeState({ emp1: hamster1, emp2: hamster2 }, 5);

    // Add a mission that should be ready but has skipTurns = 2
    // After first pass decrement, skipTurns = 1 (still > 0, so not processed)
    state.spyMissions = [{
      id: 'm1',
      type: 'reconnaissance',
      senderId: 'emp1',
      targetId: 'emp2',
      startTurn: 1,
      durationTurns: 1,
      successProbability: 0.99, // Would almost certainly succeed
      status: 'active',
      skipTurns: 2,
    }];

    // Process turn with guaranteed success roll
    const newState = processEspionageTurns(state, () => 0.01);

    // Mission should still be active (not processed), skipTurns decremented to 1
    expect(newState.spyMissions[0].status).toBe('active');
    expect(newState.spyMissions[0].skipTurns).toBe(1);
  });

  it('catastrophic roll (100) penalizes all sender\'s active spies', () => {
    const hamster1 = makeEmpire('emp1', 'hamsters', 10, 0);
    const hamster2 = makeEmpire('emp2', 'hamsters', 10, 5);
    let state = makeState({ emp1: hamster1, emp2: hamster2 }, 5);

    // Add two missions from same sender
    state.spyMissions = [
      {
        id: 'm1',
        type: 'sabotage_factories',
        senderId: 'emp1',
        targetId: 'emp2',
        startTurn: 1,
        durationTurns: 2,
        successProbability: 0.5,
        status: 'active',
      },
      {
        id: 'm2',
        type: 'reconnaissance',
        senderId: 'emp1',
        targetId: 'emp2',
        startTurn: 1,
        durationTurns: 1,
        successProbability: 0.5,
        status: 'active',
      },
    ];

    // Use RNG that returns exactly 1.0 (after ceiling * 100 = 100) for detection
    // First call: success roll, second call: detection (must be exactly 1.0 for 100)
    let callCount = 0;
    const catastrophicRng = () => {
      callCount++;
      // Success roll (fails)
      if (callCount % 2 === 1) return 0.99;
      // Detection roll - exactly 1.0 means ceil(1.0 * 100) = 100
      return 0.9999999999; // Close to 1.0, will ceil to 100
    };

    const newState = processEspionageTurns(state, catastrophicRng);

    // Both missions should have skipTurns set to 1
    const m1 = newState.spyMissions.find(m => m.id === 'm1');
    const m2 = newState.spyMissions.find(m => m.id === 'm2');

    // Both should have skipTurns added (either existing mission or foiled but penalty applied)
    expect(m1?.skipTurns).toBe(1);
    expect(m2?.skipTurns).toBe(1);
  });
});
