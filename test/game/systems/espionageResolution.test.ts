/**
 * Espionage Resolution System tests — secondary mechanics.
 * test/game/systems/espionageResolution.test.ts
 *
 * Tests for ORION-FIX-010: frame jobs, tech modifiers, morale modifiers.
 *
 * Design source: design/diplomacy/espionage.md
 *   §6.2 Tech Theft Tier Modifiers
 *   §6.5 Incite Rebellion (morale modifier)
 *   §6.6 Frame Another Race (diplomatic effects)
 *   §6.7 Assassination (morale penalty on all planets)
 */

import { describe, it, expect } from 'vitest';
import {
  resolveEspionageMissions,
  calculateRebellionMoraleModifier,
  moraleNumericToEnum,
  getProductionSabotagePenalty,
  hasLeaderKilledPenalty,
  getAssassinationProductionPenalty,
  ESPIONAGE_CONSTANTS,
} from '../../../src/game/systems/espionageResolution';
import {
  GameState,
  Empire,
  EmpireId,
  Planet,
  SpyMission,
  ResearchState,
  DiplomaticRelations,
  PlanetId,
} from '../../../src/game/state';

// ── Test helpers ──────────────────────────────────────────────────────────────

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

function makeRelations(empireA: EmpireId, empireB: EmpireId, value = 0): DiplomaticRelations {
  return {
    empireA,
    empireB,
    value,
    state: 'neutral',
    treaties: [],
    events: [],
    warStartTurn: null,
    lastContact: 0,
    modifiers: [],
    incomingProposals: [],
  };
}

function makeEmpire(
  id: EmpireId,
  raceId: string,
  opts: {
    computerTechLevel?: number;
    securityLevel?: number;
    credits?: number;
    planets?: PlanetId[];
    relations?: Record<EmpireId, DiplomaticRelations>;
  } = {},
): Empire {
  return {
    id,
    raceId,
    name: `Empire ${id}`,
    isPlayer: false,
    credits: opts.credits ?? 1000,
    creditPerTurn: 10,
    planets: opts.planets ?? [],
    fleets: [],
    shipDesigns: [],
    scannerTechLevel: 0,
    computerTechLevel: opts.computerTechLevel ?? 5,
    securityLevel: opts.securityLevel ?? 0,
    research: makeResearchState(),
    relations: opts.relations ?? {},
    exploredSystems: [],
    visibleSystems: [],
    isDefeated: false,
    defeatedTurn: null,
  };
}

function makePlanet(id: PlanetId, ownerId: EmpireId, opts: {
  morale_numeric?: number;
  missileBases?: number;
} = {}): Planet {
  return {
    id,
    name: `Planet ${id}`,
    systemId: 'sys1',
    orbit: 0,
    type: 'terran',
    size: 'medium',
    gravity: 1.0,
    ownerId,
    isColonized: true,
    isHomeworld: false,
    population: 50,
    maxPopulation: 100,
    growthRate: 0.05,
    morale: 'content',
    factories: 30,
    maxFactories: 50,
    waste: 0,
    production: { industry: 0, research: 0, ecology: 0, defense: 0 },
    buildQueue: [],
    buildings: [],
    missileBases: opts.missileBases ?? 5,
    maxMissileBases: 20,
    planetaryShield: 0,
    groundAttack: 1,
    groundDefense: 1,
    isRich: false,
    isPoor: false,
    isGaia: false,
    hasArtifacts: false,
    currentDesignId: null,
    shipyardProgress: 0,
    resourceLevel: 'normal',
    researchMultiplier: 1,
    startingPopulation: null,
    startingFactories: null,
    // Extended morale field for population system
    ...(opts.morale_numeric !== undefined ? { morale_numeric: opts.morale_numeric } : {}),
  } as Planet;
}

function makeState(
  empires: Record<EmpireId, Empire>,
  planets: Record<PlanetId, Planet> = {},
  turn = 10,
): GameState {
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
    planets: { byId: planets, allIds: Object.keys(planets) },
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

function makeActiveMission(
  opts: Partial<SpyMission> & { type: SpyMission['type']; senderId: EmpireId; targetId: EmpireId },
  currentTurn = 10,
): SpyMission {
  const duration = 1;
  return {
    id: `mission_${Date.now()}_${Math.random()}`,
    startTurn: currentTurn - duration, // Mission duration has elapsed
    durationTurns: duration,
    successProbability: 0.99,
    status: 'active',
    ...opts,
  };
}

// ── §6.5 Incite Rebellion — Morale Modifier ───────────────────────────────────

describe('calculateRebellionMoraleModifier (§6.5)', () => {
  it('returns 0 for morale >= 70 (cannot attempt on high-morale planets)', () => {
    expect(calculateRebellionMoraleModifier(70)).toBe(0);
    expect(calculateRebellionMoraleModifier(80)).toBe(0);
    expect(calculateRebellionMoraleModifier(100)).toBe(0);
  });

  it('returns (70 - morale) / 2 for morale < 70', () => {
    expect(calculateRebellionMoraleModifier(60)).toBe(5);   // (70-60)/2 = 5
    expect(calculateRebellionMoraleModifier(50)).toBe(10);  // (70-50)/2 = 10
    expect(calculateRebellionMoraleModifier(40)).toBe(15);  // (70-40)/2 = 15
    expect(calculateRebellionMoraleModifier(30)).toBe(20);  // (70-30)/2 = 20
    expect(calculateRebellionMoraleModifier(20)).toBe(25);  // (70-20)/2 = 25
    expect(calculateRebellionMoraleModifier(0)).toBe(35);   // (70-0)/2 = 35
  });
});

// ── §6.7 moraleNumericToEnum ──────────────────────────────────────────────────

describe('moraleNumericToEnum', () => {
  it('returns ecstatic for 85-100', () => {
    expect(moraleNumericToEnum(85)).toBe('ecstatic');
    expect(moraleNumericToEnum(100)).toBe('ecstatic');
  });

  it('returns happy for 60-84', () => {
    expect(moraleNumericToEnum(60)).toBe('happy');
    expect(moraleNumericToEnum(84)).toBe('happy');
  });

  it('returns content for 40-59', () => {
    expect(moraleNumericToEnum(40)).toBe('content');
    expect(moraleNumericToEnum(59)).toBe('content');
  });

  it('returns unrest for 20-39', () => {
    expect(moraleNumericToEnum(20)).toBe('unrest');
    expect(moraleNumericToEnum(39)).toBe('unrest');
  });

  it('returns rebellion for 0-19', () => {
    expect(moraleNumericToEnum(0)).toBe('rebellion');
    expect(moraleNumericToEnum(19)).toBe('rebellion');
  });
});

// ── §6.3 Production Sabotage Modifier ────────────────────────────────────────

describe('getProductionSabotagePenalty (§6.3)', () => {
  it('returns 0 when no active sabotage modifiers', () => {
    const planet = makePlanet('p1', 'emp1');
    const emp1 = makeEmpire('emp1', 'hamsters', { planets: ['p1'] });
    const state = makeState({ emp1 }, { p1: planet });

    expect(getProductionSabotagePenalty(state, 'p1')).toBe(0);
  });

  it('returns penalty when active productionSabotage modifier exists', () => {
    const planet = makePlanet('p1', 'emp1');
    const emp1 = makeEmpire('emp1', 'hamsters', {
      planets: ['p1'],
    });
    // Manually inject an active modifier
    emp1.espionageModifiers = [
      {
        id: 'mod1',
        type: 'productionSabotage',
        sourceEmpireId: 'emp2',
        targetPlanetId: 'p1',
        value: 30,
        appliedTurn: 9,
        expiresTurn: 12, // still active at turn 10
        reason: 'Sabotage by emp2',
      },
    ];
    const state = makeState({ emp1 }, { p1: planet });

    expect(getProductionSabotagePenalty(state, 'p1')).toBe(30);
  });

  it('returns 0 for expired modifiers', () => {
    const planet = makePlanet('p1', 'emp1');
    const emp1 = makeEmpire('emp1', 'hamsters', { planets: ['p1'] });
    emp1.espionageModifiers = [
      {
        id: 'mod1',
        type: 'productionSabotage',
        sourceEmpireId: 'emp2',
        targetPlanetId: 'p1',
        value: 30,
        appliedTurn: 5,
        expiresTurn: 9, // expired at turn 10 (expiresTurn <= current turn)
        reason: 'Sabotage by emp2',
      },
    ];
    const state = makeState({ emp1 }, { p1: planet });

    expect(getProductionSabotagePenalty(state, 'p1')).toBe(0);
  });

  it('sums multiple active sabotage modifiers', () => {
    const planet = makePlanet('p1', 'emp1');
    const emp1 = makeEmpire('emp1', 'hamsters', { planets: ['p1'] });
    emp1.espionageModifiers = [
      {
        id: 'mod1',
        type: 'productionSabotage',
        sourceEmpireId: 'emp2',
        targetPlanetId: 'p1',
        value: 30,
        appliedTurn: 9,
        expiresTurn: 12,
        reason: 'Sabotage 1',
      },
      {
        id: 'mod2',
        type: 'productionSabotage',
        sourceEmpireId: 'emp3',
        targetPlanetId: 'p1',
        value: 30,
        appliedTurn: 9,
        expiresTurn: 12,
        reason: 'Sabotage 2',
      },
    ];
    const state = makeState({ emp1 }, { p1: planet });

    // Both active, but capped at 100
    expect(getProductionSabotagePenalty(state, 'p1')).toBe(60);
  });
});

// ── §6.7 Assassination — Morale & Production Modifiers ───────────────────────

describe('hasLeaderKilledPenalty (§6.7)', () => {
  it('returns active=false when no leaderKilled modifier', () => {
    const emp1 = makeEmpire('emp1', 'hamsters');
    const state = makeState({ emp1 });

    const result = hasLeaderKilledPenalty(state, 'emp1');
    expect(result.active).toBe(false);
    expect(result.productionPenalty).toBe(0);
    expect(result.moralePenalty).toBe(0);
  });

  it('returns active=true with penalties when leaderKilled modifier exists', () => {
    const emp1 = makeEmpire('emp1', 'hamsters');
    emp1.espionageModifiers = [
      {
        id: 'mod1',
        type: 'leaderKilled',
        sourceEmpireId: 'emp2',
        value: ESPIONAGE_CONSTANTS.ASSASSINATION_PRODUCTION_PENALTY,
        appliedTurn: 8,
        expiresTurn: 18, // active at turn 10
        reason: 'Leader assassination by emp2',
      },
    ];
    const state = makeState({ emp1 });

    const result = hasLeaderKilledPenalty(state, 'emp1');
    expect(result.active).toBe(true);
    expect(result.productionPenalty).toBe(ESPIONAGE_CONSTANTS.ASSASSINATION_PRODUCTION_PENALTY);
    expect(result.moralePenalty).toBe(ESPIONAGE_CONSTANTS.ASSASSINATION_MORALE_PENALTY);
  });

  it('returns active=false for expired leaderKilled modifier', () => {
    const emp1 = makeEmpire('emp1', 'hamsters');
    emp1.espionageModifiers = [
      {
        id: 'mod1',
        type: 'leaderKilled',
        sourceEmpireId: 'emp2',
        value: 20,
        appliedTurn: 1,
        expiresTurn: 8, // expired at turn 10
        reason: 'Leader assassination',
      },
    ];
    const state = makeState({ emp1 });

    const result = hasLeaderKilledPenalty(state, 'emp1');
    expect(result.active).toBe(false);
  });
});

describe('getAssassinationProductionPenalty (§6.7)', () => {
  it('returns 0 with no modifiers', () => {
    const emp1 = makeEmpire('emp1', 'hamsters');
    const state = makeState({ emp1 });
    expect(getAssassinationProductionPenalty(state, 'emp1')).toBe(0);
  });

  it('returns sum of active leaderKilled penalties', () => {
    const emp1 = makeEmpire('emp1', 'hamsters');
    emp1.espionageModifiers = [
      {
        id: 'mod1',
        type: 'leaderKilled',
        sourceEmpireId: 'emp2',
        value: 20,
        appliedTurn: 9,
        expiresTurn: 20,
        reason: 'Assassination',
      },
    ];
    const state = makeState({ emp1 });
    expect(getAssassinationProductionPenalty(state, 'emp1')).toBe(20);
  });
});

// ── §6.6 Frame Job — Diplomatic Effects ──────────────────────────────────────

describe('frame_race mission — diplomatic effects on framed empire (§6.6)', () => {
  it('applies diplomatic penalty to framed empire when framedEmpireId is set', () => {
    // emp1 (chameleons) frames emp3 (rats) in the eyes of emp2 (hamsters)
    const emp1 = makeEmpire('emp1', 'chameleons', { credits: 500 });
    const emp2 = makeEmpire('emp2', 'hamsters', {
      credits: 2000,
      relations: {
        emp1: makeRelations('emp2', 'emp1', 10),
        emp3: makeRelations('emp2', 'emp3', 30), // currently friendly-ish
      },
    });
    const emp3 = makeEmpire('emp3', 'rats', { credits: 500 });

    const state = makeState({ emp1, emp2, emp3 });

    const mission: SpyMission = makeActiveMission(
      {
        type: 'frame_race',
        senderId: 'emp1',
        targetId: 'emp2',
        successProbability: 0.99,
        framedEmpireId: 'emp3', // Blame emp3
      },
      10,
    );

    const stateWithMission = { ...state, spyMissions: [mission] };

    // RNG ordering:
    //  call 1: catastrophic check per sender-target pair (must be > 0.02 to avoid triggering)
    //  call 2: success roll (must be < 0.99 to succeed)
    //  call 3: detection roll (must be > 0.10 to avoid detection at 0% security + base 10%)
    //  call 4: stealPercent for applyFrameRace
    //  call 5: framedPenalty roll
    let callCount = 0;
    const rng = () => {
      callCount++;
      if (callCount === 1) return 0.50; // catastrophic check: 0.50 * 100 = 50 > 2, no catastrophe
      if (callCount === 2) return 0.01; // success roll: 0.01 * 100 = 1 <= 99, succeeds
      if (callCount === 3) return 0.99; // detection roll: 0.99 * 100 = 99 > 10 (base), not detected
      if (callCount === 4) return 0.10; // stealPercent: 5 + 0.10 * 15 = 6.5%
      if (callCount === 5) return 0.50; // framedPenalty: 20 + 0.50 * 30 = 35
      return 0.5;
    };

    const { state: resultState } = resolveEspionageMissions(stateWithMission, rng);

    // emp2's relations with emp3 should be reduced
    const emp2After = resultState.empires.byId['emp2'];
    expect(emp2After).toBeDefined();
    const relationsWithFramed = emp2After?.relations['emp3'];
    expect(relationsWithFramed).toBeDefined();
    expect(relationsWithFramed!.value).toBeLessThan(30); // Relations degraded from 30

    // emp1's credits should increase (BC stolen from emp2)
    const emp1After = resultState.empires.byId['emp1'];
    expect(emp1After!.credits).toBeGreaterThan(500);

    // emp2's credits should decrease
    const emp2Credits = resultState.empires.byId['emp2'];
    expect(emp2Credits!.credits).toBeLessThan(2000);
  });

  it('does not crash when framedEmpireId is not set (plain BC theft)', () => {
    const emp1 = makeEmpire('emp1', 'chameleons', { credits: 500 });
    const emp2 = makeEmpire('emp2', 'hamsters', { credits: 2000 });

    const state = makeState({ emp1, emp2 });
    const mission: SpyMission = makeActiveMission(
      {
        type: 'frame_race',
        senderId: 'emp1',
        targetId: 'emp2',
        successProbability: 0.99,
        // No framedEmpireId — pure BC theft
      },
      10,
    );

    const stateWithMission = { ...state, spyMissions: [mission] };
    let callCount = 0;
    const rng = () => {
      callCount++;
      if (callCount === 1) return 0.50; // catastrophic check (no)
      if (callCount === 2) return 0.01; // success
      if (callCount === 3) return 0.99; // not detected
      return 0.10; // stealPercent
    };

    expect(() => resolveEspionageMissions(stateWithMission, rng)).not.toThrow();

    const { state: resultState } = resolveEspionageMissions(stateWithMission, rng);
    expect(resultState.empires.byId['emp1']!.credits).toBeGreaterThan(500);
  });
});

// ── §6.7 Assassination — Morale Applied to Planets ───────────────────────────

describe('assassination mission — morale applied to target planets (§6.7)', () => {
  it('reduces morale_numeric on all target planets by ASSASSINATION_MORALE_PENALTY', () => {
    const planet1 = makePlanet('p1', 'emp2', { morale_numeric: 70 });
    const planet2 = makePlanet('p2', 'emp2', { morale_numeric: 50 });

    const emp1 = makeEmpire('emp1', 'chameleons', { computerTechLevel: 10 });
    const emp2 = makeEmpire('emp2', 'hamsters', {
      planets: ['p1', 'p2'],
      securityLevel: 0,
      relations: { emp1: makeRelations('emp2', 'emp1') },
    });

    const state = makeState({ emp1, emp2 }, { p1: planet1, p2: planet2 });
    const mission: SpyMission = makeActiveMission(
      {
        type: 'assassination',
        senderId: 'emp1',
        targetId: 'emp2',
        successProbability: 0.99,
        durationTurns: 1,
      },
      10,
    );

    const stateWithMission = { ...state, spyMissions: [mission] };

    let callCount = 0;
    const rng = () => {
      callCount++;
      if (callCount === 1) return 0.50; // catastrophic check (no)
      if (callCount === 2) return 0.01; // success (99% threshold)
      if (callCount === 3) return 0.99; // not detected
      return 0.5;
    };

    const { state: resultState } = resolveEspionageMissions(stateWithMission, rng);

    // Both planets should have reduced morale_numeric
    const p1After = resultState.planets.byId['p1'] as Planet & { morale_numeric?: number };
    const p2After = resultState.planets.byId['p2'] as Planet & { morale_numeric?: number };

    expect(p1After.morale_numeric).toBe(70 - ESPIONAGE_CONSTANTS.ASSASSINATION_MORALE_PENALTY);
    expect(p2After.morale_numeric).toBe(50 - ESPIONAGE_CONSTANTS.ASSASSINATION_MORALE_PENALTY);
  });

  it('clamps morale_numeric to minimum 0 when penalty would go negative', () => {
    const planet = makePlanet('p1', 'emp2', { morale_numeric: 5 }); // Very low morale

    const emp1 = makeEmpire('emp1', 'chameleons', { computerTechLevel: 10 });
    const emp2 = makeEmpire('emp2', 'hamsters', {
      planets: ['p1'],
      securityLevel: 0,
      relations: { emp1: makeRelations('emp2', 'emp1') },
    });

    const state = makeState({ emp1, emp2 }, { p1: planet });
    const mission: SpyMission = makeActiveMission(
      {
        type: 'assassination',
        senderId: 'emp1',
        targetId: 'emp2',
        successProbability: 0.99,
        durationTurns: 1,
      },
      10,
    );

    const stateWithMission = { ...state, spyMissions: [mission] };
    let callCount = 0;
    const rng = () => {
      callCount++;
      if (callCount === 1) return 0.50; // catastrophic check
      if (callCount === 2) return 0.01; // success
      if (callCount === 3) return 0.99; // not detected
      return 0.5;
    };

    const { state: resultState } = resolveEspionageMissions(stateWithMission, rng);
    const p1After = resultState.planets.byId['p1'] as Planet & { morale_numeric?: number };

    // morale_numeric should be clamped to 0, not negative
    expect(p1After.morale_numeric).toBe(0);
  });

  it('applies leaderKilled espionageModifier to target empire for production penalty', () => {
    const emp1 = makeEmpire('emp1', 'chameleons', { computerTechLevel: 10 });
    const emp2 = makeEmpire('emp2', 'hamsters', {
      securityLevel: 0,
      relations: { emp1: makeRelations('emp2', 'emp1') },
    });

    const state = makeState({ emp1, emp2 });
    const mission: SpyMission = makeActiveMission(
      {
        type: 'assassination',
        senderId: 'emp1',
        targetId: 'emp2',
        successProbability: 0.99,
        durationTurns: 1,
      },
      10,
    );

    const stateWithMission = { ...state, spyMissions: [mission] };
    let callCount = 0;
    const rng = () => {
      callCount++;
      if (callCount === 1) return 0.50;
      if (callCount === 2) return 0.01; // success
      if (callCount === 3) return 0.99; // not detected
      return 0.5;
    };

    const { state: resultState } = resolveEspionageMissions(stateWithMission, rng);

    // emp2 should have a leaderKilled espionageModifier
    const emp2After = resultState.empires.byId['emp2'];
    expect(emp2After?.espionageModifiers).toBeDefined();
    expect(emp2After?.espionageModifiers?.length).toBeGreaterThan(0);

    const killedMod = emp2After?.espionageModifiers?.find((m) => m.type === 'leaderKilled');
    expect(killedMod).toBeDefined();
    expect(killedMod?.value).toBe(ESPIONAGE_CONSTANTS.ASSASSINATION_PRODUCTION_PENALTY);
    expect(killedMod?.expiresTurn).toBe(10 + ESPIONAGE_CONSTANTS.ASSASSINATION_DURATION_TURNS);
  });
});

// ── cleanupExpiredModifiers ───────────────────────────────────────────────────

describe('cleanupExpiredModifiers (via resolveEspionageMissions)', () => {
  it('removes expired modifiers from empire each turn', () => {
    const emp1 = makeEmpire('emp1', 'hamsters');
    // Inject an expired modifier
    emp1.espionageModifiers = [
      {
        id: 'mod_expired',
        type: 'productionSabotage',
        sourceEmpireId: 'emp2',
        targetPlanetId: 'p1',
        value: 30,
        appliedTurn: 1,
        expiresTurn: 9, // expires at 9, current turn is 10
        reason: 'old sabotage',
      },
      {
        id: 'mod_active',
        type: 'productionSabotage',
        sourceEmpireId: 'emp2',
        targetPlanetId: 'p1',
        value: 30,
        appliedTurn: 9,
        expiresTurn: 12, // still active
        reason: 'current sabotage',
      },
    ];

    const emp2 = makeEmpire('emp2', 'hamsters');
    const state: GameState = { ...makeState({ emp1, emp2 }), spyMissions: [] };

    const { state: resultState } = resolveEspionageMissions(state, () => 0.5);

    const emp1After = resultState.empires.byId['emp1'];
    // Only the active modifier should remain
    expect(emp1After?.espionageModifiers?.length).toBe(1);
    expect(emp1After?.espionageModifiers?.[0].id).toBe('mod_active');
  });
});
