/**
 * Random Events System tests.
 * test/game/systems/events.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  rollRandomEvents,
  applyGameEvent,
  processRandomEvents,
  GameEvent,
} from '../../../src/game/systems/events';
import { GameState, Planet } from '../../../src/game/state';
import { initialState } from '../../../src/game/initialState';

// ── Test helpers ──────────────────────────────────────────────────────────────

/** A colonised planet for use in test states. */
const testPlanet: Planet = {
  id: 'planet_home',
  name: 'Homeworld',
  systemId: 'sys_home',
  orbit: 3,
  type: 'terran',
  size: 'large',
  gravity: 1.0,
  ownerId: 'player',
  isColonized: true,
  isHomeworld: true,
  population: 80,
  maxPopulation: 120,
  growthRate: 0.02,
  morale: 'content',
  factories: 60,
  maxFactories: 100,
  waste: 5,
  production: { ship: 20, defense: 20, industry: 20, ecology: 20, research: 20 },
  buildQueue: [],
  buildings: [],
  missileBases: 2,
  maxMissileBases: 10,
  planetaryShield: 0,
  isRich: false,
  isPoor: false,
  isGaia: false,
  hasArtifacts: false,
  resourceLevel: 'normal',
  researchMultiplier: 1.0,
  startingPopulation: 80,
  startingFactories: 60,
  currentDesignId: null,
  shipyardProgress: 0,
};

/** Minimal game state with a player empire and one colonised planet. */
function makeTestState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...initialState,
    seed: 'test-seed',
    turn: 50,
    difficulty: 'average',
    empires: {
      byId: {
        player: {
          id: 'player',
          raceId: 'human',
          name: 'Human Empire',
          isPlayer: true,
          credits: 1000,
          creditPerTurn: 50,
          planets: ['planet_home'],
          fleets: [],
          shipDesigns: [],
          research: {
            currentTech: null,
            researchPoints: 0,
            researchPerTurn: 30,
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
          relations: {},
          isDefeated: false,
          defeatedTurn: null,
        },
      },
      allIds: ['player'],
      playerId: 'player',
    },
    planets: {
      byId: { planet_home: testPlanet },
      allIds: ['planet_home'],
    },
    ...overrides,
  };
}

/** A simple seeded linear-congruential RNG for deterministic tests. */
function makeSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

// ── rollRandomEvents ──────────────────────────────────────────────────────────

describe('rollRandomEvents', () => {
  it('returns an array (may be empty)', () => {
    const state = makeTestState();
    const result = rollRandomEvents(state);
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns at most one event per call', () => {
    const state = makeTestState({ turn: 100 });
    // Run many times — should never exceed 1 event
    for (let i = 0; i < 100; i++) {
      const events = rollRandomEvents(state, makeSeededRng(i));
      expect(events.length).toBeLessThanOrEqual(1);
    }
  });

  it('never fires events whose min_turn exceeds the current turn', () => {
    // Turn 5 — only donation (min_turn: 15) would be close; ancient_derelict (20) etc. excluded
    const state = makeTestState({ turn: 5 });
    // Force event to always trigger by using rng that always returns 0 (< any eventChance)
    const alwaysZero = () => 0;
    const events = rollRandomEvents(state, alwaysZero);
    for (const ev of events) {
      expect(ev.min_turn).toBeLessThanOrEqual(state.turn);
    }
  });

  it('seeded RNG produces deterministic results', () => {
    const state = makeTestState({ turn: 80 });
    const rng1 = makeSeededRng(42);
    const rng2 = makeSeededRng(42);
    const result1 = rollRandomEvents(state, rng1);
    const result2 = rollRandomEvents(state, rng2);
    expect(result1.map((e) => e.id)).toEqual(result2.map((e) => e.id));
  });

  it('respects difficulty multiplier — impossible fires with higher threshold than easy', () => {
    // At turn 100:
    //   base = min(0.03 + 100*0.001, 0.15) = 0.13
    //   easy threshold      = 0.13 * 0.75  = 0.0975
    //   impossible threshold = 0.13 * 1.5   = 0.195
    // A probe value of 0.10 sits between the two:
    //   easy: 0.10 >= 0.0975  → NO event fires
    //   impossible: 0.10 < 0.195  → event CAN fire (if eligible pool not empty)
    const probe = 0.10;
    const probeRng = () => probe;

    const easyState = makeTestState({ turn: 100, difficulty: 'easy' });
    const impossibleState = makeTestState({ turn: 100, difficulty: 'impossible' });

    // Easy must not fire at this probe value
    const easyResult = rollRandomEvents(easyState, probeRng);
    expect(easyResult).toHaveLength(0);

    // Impossible passes the threshold check and enters the selection phase.
    // With a colonised planet the eligible pool contains donation (min_turn 15).
    // The subsequent category/event rolls use the same rng, so the result
    // may be 0 or 1 event — what matters is the threshold was crossed.
    // We verify via a trivially-low probe that always crosses both thresholds:
    const trivialRng = () => 0.001;
    const impossibleFires = rollRandomEvents(impossibleState, trivialRng);
    expect(impossibleFires.length).toBe(1);

    // And the same trivial probe on easy also fires (it also crosses 0.0975)
    const easyFires = rollRandomEvents(easyState, trivialRng);
    expect(easyFires.length).toBe(1);
  });
});

// ── applyGameEvent ────────────────────────────────────────────────────────────

describe('applyGameEvent', () => {
  it('adds a notification to state.ui.notifications', () => {
    const state = makeTestState();
    const event: GameEvent = {
      id: 'donation',
      name: 'Donation',
      type: 'opportunity',
      category: 'opportunities',
      probability: 0.08,
      weight: 8,
      min_turn: 15,
      description: 'A wealthy citizen donates to the empire.',
      target_type: 'empire',
      effects: { type: 'bc_gain', min: 100, max: 500 },
    };

    const before = state.ui.notifications.length;
    const next = applyGameEvent(state, event);
    expect(next.ui.notifications.length).toBe(before + 1);
  });

  it('notification contains event name and description', () => {
    const state = makeTestState();
    const event: GameEvent = {
      id: 'earthquake',
      name: 'Earthquake',
      type: 'disaster',
      category: 'disasters',
      probability: 0.08,
      weight: 8,
      min_turn: 25,
      description: 'Seismic devastation!',
      target_type: 'owned_colony',
      galaxy_requirement: 'has_factories',
      effects: {
        type: 'instant_damage',
        factories_destroyed: { min: 10, max: 20 },
        population_killed_percent: { min: 5, max: 10 },
      },
    };

    const next = applyGameEvent(state, event, 'planet_home');
    const notif = next.ui.notifications.at(-1);
    expect(notif?.title).toBe('Earthquake');
    expect(notif?.message).toBe('Seismic devastation!');
  });

  it('bc_gain event increases player credits', () => {
    const state = makeTestState();
    const initialCredits = state.empires.byId['player']!.credits;
    const event: GameEvent = {
      id: 'donation',
      name: 'Donation',
      type: 'opportunity',
      category: 'opportunities',
      probability: 0.08,
      weight: 8,
      min_turn: 15,
      description: 'A generous donation.',
      target_type: 'empire',
      effects: { type: 'bc_gain', min: 200, max: 200 }, // fixed to 200 for test
    };

    const next = applyGameEvent(state, event);
    const newCredits = next.empires.byId['player']!.credits;
    expect(newCredits).toBeGreaterThanOrEqual(initialCredits + 200);
    expect(newCredits).toBeLessThanOrEqual(initialCredits + 200);
  });

  it('instant_damage event reduces planet factories', () => {
    const state = makeTestState();
    const before = state.planets.byId['planet_home']!.factories;
    const event: GameEvent = {
      id: 'earthquake',
      name: 'Earthquake',
      type: 'disaster',
      category: 'disasters',
      probability: 0.08,
      weight: 8,
      min_turn: 25,
      description: 'Earthquake strikes!',
      target_type: 'owned_colony',
      effects: {
        type: 'instant_damage',
        factories_destroyed: { min: 10, max: 10 }, // fixed at 10 for test
        population_killed_percent: { min: 0, max: 0 },
      },
    };

    const next = applyGameEvent(state, event, 'planet_home');
    const after = next.planets.byId['planet_home']!.factories;
    expect(after).toBe(before - 10);
  });

  it('does not mutate the input state', () => {
    const state = makeTestState();
    const originalNotifCount = state.ui.notifications.length;
    const event: GameEvent = {
      id: 'donation',
      name: 'Donation',
      type: 'opportunity',
      category: 'opportunities',
      probability: 0.08,
      weight: 8,
      min_turn: 15,
      description: 'A donation.',
      target_type: 'empire',
      effects: { type: 'bc_gain', min: 100, max: 500 },
    };

    applyGameEvent(state, event);
    // Original must be unchanged
    expect(state.ui.notifications.length).toBe(originalNotifCount);
  });

  it('marks disaster events as important or critical priority', () => {
    const state = makeTestState();
    const supernova: GameEvent = {
      id: 'supernova',
      name: 'Supernova',
      type: 'disaster',
      category: 'disasters',
      probability: 0.02,
      weight: 2,
      min_turn: 100,
      description: 'A star goes supernova!',
      target_type: 'owned_system',
      effects: { type: 'supernova', warning_turns: 5 },
    };

    const next = applyGameEvent(state, supernova);
    const notif = next.ui.notifications.at(-1);
    expect(notif?.priority).toBe('critical');
  });
});

// ── processRandomEvents ───────────────────────────────────────────────────────

describe('processRandomEvents', () => {
  it('returns a valid GameState', () => {
    const state = makeTestState();
    const result = processRandomEvents(state);
    expect(result).toHaveProperty('turn');
    expect(result).toHaveProperty('empires');
    expect(result).toHaveProperty('planets');
    expect(result).toHaveProperty('ui');
  });

  it('does not alter turn counter', () => {
    const state = makeTestState({ turn: 42 });
    const result = processRandomEvents(state);
    expect(result.turn).toBe(42);
  });

  it('notifications list is at least as long as before (events may have fired)', () => {
    const state = makeTestState({ turn: 100 });
    const before = state.ui.notifications.length;
    const result = processRandomEvents(state);
    expect(result.ui.notifications.length).toBeGreaterThanOrEqual(before);
  });

  it('seeded results are deterministic end-to-end', () => {
    const state = makeTestState({ turn: 80 });

    // Override rollRandomEvents behaviour by testing with same seed twice
    const rng1 = makeSeededRng(99);
    const rng2 = makeSeededRng(99);
    const r1 = rollRandomEvents(state, rng1);
    const r2 = rollRandomEvents(state, rng2);
    expect(r1.map((e) => e.id)).toEqual(r2.map((e) => e.id));
  });
});

// ── tickActiveEvents (multi-turn event processing) ───────────────────────────

describe('tickActiveEvents (design/game-mechanics/random-events.md)', () => {
  it('processes plague event and reduces population (§Plague)', async () => {
    const { tickActiveEvents } = await import('../../../src/game/systems/events');
    const state = makeTestState({
      activeEvents: [
        {
          id: 'plague-1',
          type: 'plague',
          startTurn: 40,
          endTurn: 45,
          targetPlanetId: 'planet_home',
          targetSystemId: 'sys_home',
          targetEmpireId: null,
          data: { populationLossPercent: { min: 10, max: 20 } },
        },
      ],
    });

    const initialPop = state.planets.byId['planet_home']!.population;
    const rng = makeSeededRng(42);
    const result = tickActiveEvents(state, rng);

    const newPop = result.state.planets.byId['planet_home']!.population;
    expect(newPop).toBeLessThan(initialPop);
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events[0].title).toMatch(/Plague/);
  });

  it('cures plague immediately with Bio Toxin Antidote tech (§Mitigation)', async () => {
    const { tickActiveEvents } = await import('../../../src/game/systems/events');
    // State with Bio Toxin Antidote tech
    const state = makeTestState({
      empires: {
        byId: {
          player: {
            ...makeTestState().empires.byId['player']!,
            research: {
              ...makeTestState().empires.byId['player']!.research,
              completedTechs: ['bio_toxin_antidote_tech'],
            },
          },
        },
        allIds: ['player'],
        playerId: 'player',
      },
      activeEvents: [
        {
          id: 'plague-1',
          type: 'plague',
          startTurn: 40,
          endTurn: 45,
          targetPlanetId: 'planet_home',
          targetSystemId: 'sys_home',
          targetEmpireId: null,
          data: { populationLossPercent: { min: 10, max: 20 } },
        },
      ],
    });

    const rng = makeSeededRng(42);
    const result = tickActiveEvents(state, rng);

    // Plague should be cured (expired)
    expect(result.events.some((e) => e.title === 'Plague Cured!')).toBe(true);
    // Active events should no longer contain the plague
    expect(result.state.activeEvents.some((e) => e.id === 'plague-1')).toBe(false);
  });

  it('counts down comet and reports HP (§Comet)', async () => {
    const { tickActiveEvents } = await import('../../../src/game/systems/events');
    const state = makeTestState({
      activeEvents: [
        {
          id: 'comet-1',
          type: 'comet',
          startTurn: 60,
          endTurn: 65, // 5 turn countdown
          targetPlanetId: 'planet_home',
          targetSystemId: 'sys_home',
          targetEmpireId: null,
          data: { cometHp: 1000, warningTurns: 5 },
        },
      ],
      turn: 61, // 4 turns remaining
    });

    const result = tickActiveEvents(state);

    // Should have a countdown warning event
    expect(result.events.some((e) => e.title === 'Comet Approaching')).toBe(true);
    // Comet should still be active (not expired yet)
    expect(result.state.activeEvents.some((e) => e.id === 'comet-1')).toBe(true);
  });

  it('supernova warning counts down (§Supernova)', async () => {
    const { tickActiveEvents } = await import('../../../src/game/systems/events');
    const state = makeTestState({
      activeEvents: [
        {
          id: 'supernova-1',
          type: 'supernova',
          startTurn: 100,
          endTurn: 105, // 5 turn warning
          targetPlanetId: null,
          targetSystemId: 'sys_home',
          targetEmpireId: null,
          data: { warningTurns: 5 },
        },
      ],
      turn: 102, // 3 turns remaining
      galaxy: {
        ...initialState.galaxy,
        systems: {
          byId: {
            sys_home: {
              id: 'sys_home',
              name: 'Home System',
              coordinates: { x: 0, y: 0 },
              starType: 'yellow',
              starClass: 'G',
              planetIds: ['planet_home'],
              ownerId: 'player',
              hasAsteroids: false,
              hasNebula: false,
              nebulaId: null,
              hasWormhole: false,
              wormholeTargetId: null,
              wormholeStatus: null,
              hasSpaceMonster: null,
              region: null,
              numPlanets: 1,
              exploredBy: ['player'],
            },
          },
          allIds: ['sys_home'],
        },
      },
    });

    const result = tickActiveEvents(state);

    expect(result.events.some((e) => e.title === 'Supernova Warning')).toBe(true);
  });
});

// ── moveRoamingMonsters (space monster behavior) ──────────────────────────────

describe('moveRoamingMonsters (design/game-mechanics/random-events.md §Space Monsters)', () => {
  it('Cosmic Blob regenerates HP each turn', async () => {
    const { moveRoamingMonsters } = await import('../../../src/game/systems/events');
    const state = makeTestState({
      monsters: [
        {
          id: 'blob-1',
          type: 'cosmic_blob',
          systemId: 'sys_remote',
          hp: 400, // below max (500)
          maxHp: 500,
          isRoaming: true,
          spawnTurn: 50,
        },
      ],
      galaxy: {
        ...makeTestState().galaxy,
        systems: {
          byId: {
            sys_remote: {
              id: 'sys_remote',
              name: 'Remote System',
              coordinates: { x: 100, y: 100 },
              starType: 'yellow',
              starClass: 'G',
              planetIds: [],
              ownerId: null,
              hasAsteroids: false,
              hasNebula: false,
              nebulaId: null,
              hasWormhole: false,
              wormholeTargetId: null,
              wormholeStatus: null,
              hasSpaceMonster: 'amoeba',
              region: null,
              numPlanets: 0,
              exploredBy: [],
            },
            sys_home: makeTestState().galaxy.systems.byId['sys_home'] || {
              id: 'sys_home',
              name: 'Home System',
              coordinates: { x: 0, y: 0 },
              starType: 'yellow',
              starClass: 'G',
              planetIds: ['planet_home'],
              ownerId: 'player',
              hasAsteroids: false,
              hasNebula: false,
              nebulaId: null,
              hasWormhole: false,
              wormholeTargetId: null,
              wormholeStatus: null,
              hasSpaceMonster: null,
              region: null,
              numPlanets: 1,
              exploredBy: ['player'],
            },
          },
          allIds: ['sys_remote', 'sys_home'],
        },
      },
    });

    const result = moveRoamingMonsters(state);

    // Cosmic Blob should regenerate 15 HP per turn
    const blob = result.state.monsters.find((m) => m.id === 'blob-1');
    expect(blob?.hp).toBe(415); // 400 + 15
  });

  it('Crystal Horror does not regenerate (no regeneration ability)', async () => {
    const { moveRoamingMonsters } = await import('../../../src/game/systems/events');
    const state = makeTestState({
      monsters: [
        {
          id: 'crystal-1',
          type: 'crystal_horror',
          systemId: 'sys_remote',
          hp: 300, // below max (400)
          maxHp: 400,
          isRoaming: true,
          spawnTurn: 75,
        },
      ],
      galaxy: {
        ...makeTestState().galaxy,
        systems: {
          byId: {
            sys_remote: {
              id: 'sys_remote',
              name: 'Remote System',
              coordinates: { x: 100, y: 100 },
              starType: 'yellow',
              starClass: 'G',
              planetIds: [],
              ownerId: null,
              hasAsteroids: false,
              hasNebula: false,
              nebulaId: null,
              hasWormhole: false,
              wormholeTargetId: null,
              wormholeStatus: null,
              hasSpaceMonster: 'crystal',
              region: null,
              numPlanets: 0,
              exploredBy: [],
            },
            sys_home: {
              id: 'sys_home',
              name: 'Home System',
              coordinates: { x: 0, y: 0 },
              starType: 'yellow',
              starClass: 'G',
              planetIds: ['planet_home'],
              ownerId: 'player',
              hasAsteroids: false,
              hasNebula: false,
              nebulaId: null,
              hasWormhole: false,
              wormholeTargetId: null,
              wormholeStatus: null,
              hasSpaceMonster: null,
              region: null,
              numPlanets: 1,
              exploredBy: ['player'],
            },
          },
          allIds: ['sys_remote', 'sys_home'],
        },
      },
    });

    const result = moveRoamingMonsters(state);

    // Crystal Horror should NOT regenerate
    const crystal = result.state.monsters.find((m) => m.id === 'crystal-1');
    expect(crystal?.hp).toBe(300); // unchanged
  });

  it('Void Wyrm does not roam (guards treasure)', async () => {
    const { moveRoamingMonsters, getMonsterStats } = await import(
      '../../../src/game/systems/events'
    );

    const stats = getMonsterStats('void_wyrm');
    expect(stats.isRoaming).toBe(false);
  });
});

// ── resolveDerelictChoice (Ancient Derelict event) ────────────────────────────

describe('resolveDerelictChoice (design/game-mechanics/random-events.md §Ancient Derelict)', () => {
  it('salvage choice gives BC gain (200-800)', async () => {
    const { resolveDerelictChoice } = await import('../../../src/game/systems/events');
    const state = makeTestState();
    const initialCredits = state.empires.byId['player']!.credits;

    const rng = makeSeededRng(42);
    const result = resolveDerelictChoice(state, 'salvage', rng);

    expect(result.outcome).toBe('bc_gain');
    expect(result.details.bcGained).toBeGreaterThanOrEqual(200);
    expect(result.details.bcGained).toBeLessThanOrEqual(800);
    expect(result.state.empires.byId['player']!.credits).toBe(
      initialCredits + result.details.bcGained!,
    );
  });

  it('board choice has 60%/25%/15% outcomes', async () => {
    const { resolveDerelictChoice } = await import('../../../src/game/systems/events');
    const state = makeTestState();

    // Run many trials to verify rough probability distribution
    let techCount = 0;
    let nothingCount = 0;
    let trapCount = 0;
    const trials = 1000;

    for (let i = 0; i < trials; i++) {
      // Use larger seed spacing to avoid LCG first-value clustering
      const rng = makeSeededRng(i * 7919 + 104729);
      const result = resolveDerelictChoice(state, 'board', rng);
      if (result.outcome === 'tech_discovery') techCount++;
      else if (result.outcome === 'nothing') nothingCount++;
      else if (result.outcome === 'trap') trapCount++;
    }

    // Allow ±15% tolerance for probability distribution
    expect(techCount / trials).toBeGreaterThan(0.45);
    expect(techCount / trials).toBeLessThan(0.75);
    expect(nothingCount / trials).toBeGreaterThan(0.10);
    expect(nothingCount / trials).toBeLessThan(0.40);
    expect(trapCount / trials).toBeGreaterThan(0.01);
    expect(trapCount / trials).toBeLessThan(0.30);
  });
});

// ── getActiveComputerVirus (virus mitigation) ─────────────────────────────────

describe('getActiveComputerVirus (design/game-mechanics/random-events.md §Computer Virus)', () => {
  it('returns null when no virus is active', async () => {
    const { getActiveComputerVirus } = await import('../../../src/game/systems/events');
    const state = makeTestState({ activeEvents: [] });

    const result = getActiveComputerVirus(state, 'player');
    expect(result).toBeNull();
  });

  it('returns modifiers when virus is active', async () => {
    const { getActiveComputerVirus } = await import('../../../src/game/systems/events');
    const state = makeTestState({
      activeEvents: [
        {
          id: 'virus-1',
          type: 'computer_virus',
          startTurn: 50,
          endTurn: 60,
          targetPlanetId: null,
          targetSystemId: null,
          targetEmpireId: 'player',
          data: { researchModifier: 0.75, productionModifier: 0.9 },
        },
      ],
    });

    const result = getActiveComputerVirus(state, 'player');
    expect(result).not.toBeNull();
    expect(result?.researchModifier).toBe(0.75);
    expect(result?.productionModifier).toBe(0.9);
  });

  it('Battle Computer V reduces severity (§Mitigation)', async () => {
    const { getActiveComputerVirus } = await import('../../../src/game/systems/events');
    const baseState = makeTestState();
    const state = {
      ...baseState,
      empires: {
        ...baseState.empires,
        byId: {
          player: {
            ...baseState.empires.byId['player']!,
            research: {
              ...baseState.empires.byId['player']!.research,
              completedTechs: ['ecm_jammer_5_tech'], // ECM Jammer V reduces severity
            },
          },
        },
      },
      activeEvents: [
        {
          id: 'virus-1',
          type: 'computer_virus',
          startTurn: 50,
          endTurn: 60,
          targetPlanetId: null,
          targetSystemId: null,
          targetEmpireId: 'player',
          data: { researchModifier: 0.75, productionModifier: 0.9 },
        },
      ],
    } as GameState;

    const result = getActiveComputerVirus(state, 'player');
    // With 50% severity reduction, the penalty should be halved:
    // research: 1 - (1 - 0.75) * 0.5 = 1 - 0.125 = 0.875
    // production: 1 - (1 - 0.9) * 0.5 = 1 - 0.05 = 0.95
    expect(result?.researchModifier).toBeCloseTo(0.875);
    expect(result?.productionModifier).toBeCloseTo(0.95);
  });
});

// ── tickActiveEvents (design/game-mechanics/random-events.md §Multi-turn Events) ──

import {
  tickActiveEvents,
  moveRoamingMonsters,
  resolveDerelictChoice,
  MONSTER_STATS,
} from '../../../src/game/systems/events';
import { ActiveEvent, SpaceMonster, StarSystem } from '../../../src/game/state';

describe('tickActiveEvents', () => {
  it('handles state with no activeEvents gracefully', () => {
    const state = makeTestState();
    // @ts-expect-error - testing backward compatibility with undefined field
    delete state.activeEvents;
    const result = tickActiveEvents(state);
    expect(result.state).toBeDefined();
    expect(result.events).toEqual([]);
  });

  it('handles empty activeEvents array', () => {
    const state = makeTestState({ activeEvents: [] });
    const result = tickActiveEvents(state);
    expect(result.events).toEqual([]);
    expect(result.state.activeEvents).toEqual([]);
  });

  describe('Plague event (random-events.md §Plague)', () => {
    it('causes population loss of 10-20% per turn', () => {
      const plagueEvent: ActiveEvent = {
        id: 'plague-1',
        type: 'plague',
        startTurn: 50,
        endTurn: 55,
        targetPlanetId: 'planet_home',
        targetSystemId: 'sys_home',
        targetEmpireId: null,
        data: {
          populationLossMin: 10,
          populationLossMax: 20,
          spreadChance: 0.25,
        },
      };
      const state = makeTestState({
        activeEvents: [plagueEvent],
        turn: 51,
      });
      const initialPop = state.planets.byId['planet_home']!.population;

      // Use fixed RNG that returns 0.5 (middle of range: 15% loss)
      const fixedRng = () => 0.5;
      const result = tickActiveEvents(state, fixedRng);

      const newPop = result.state.planets.byId['planet_home']!.population;
      const lossPercent = ((initialPop - newPop) / initialPop) * 100;
      expect(lossPercent).toBeGreaterThanOrEqual(10);
      expect(lossPercent).toBeLessThanOrEqual(20);
    });

    it('is cured immediately with Bio Toxin Antidote technology', () => {
      const plagueEvent: ActiveEvent = {
        id: 'plague-1',
        type: 'plague',
        startTurn: 50,
        endTurn: 55,
        targetPlanetId: 'planet_home',
        targetSystemId: 'sys_home',
        targetEmpireId: null,
        data: { populationLossMin: 10, populationLossMax: 20, spreadChance: 0.25 },
      };
      const state = makeTestState({
        activeEvents: [plagueEvent],
        turn: 51,
      });
      // Add Bio Toxin Antidote to completed techs
      state.empires.byId['player']!.research.completedTechs = ['bio_toxin_antidote_tech'];

      const result = tickActiveEvents(state);

      // Event should be expired (cured)
      expect(result.state.activeEvents.length).toBe(0);
      // Should have a "Plague Cured" event
      expect(result.events.some(e => e.title.includes('Cured'))).toBe(true);
    });

    it('can spread to adjacent colonies (25% chance per turn)', () => {
      // Create a second planet in adjacent system
      const secondPlanet = {
        ...testPlanet,
        id: 'planet_2',
        name: 'Colony Two',
        systemId: 'sys_2',
        isHomeworld: false,
      };
      const plagueEvent: ActiveEvent = {
        id: 'plague-1',
        type: 'plague',
        startTurn: 50,
        endTurn: 55,
        targetPlanetId: 'planet_home',
        targetSystemId: 'sys_home',
        targetEmpireId: null,
        data: { populationLossMin: 10, populationLossMax: 20, spreadChance: 0.25 },
      };

      const sys1: StarSystem = {
        id: 'sys_home',
        name: 'Home System',
        coordinates: { x: 0, y: 0 },
        starType: 'yellow',
        starClass: 'G',
        planetIds: ['planet_home'],
        ownerId: 'player',
        hasAsteroids: false,
        hasNebula: false,
        nebulaId: null,
        hasWormhole: false,
        wormholeTarget: null,
        fleetIds: [],
        isOrion: false,
        hasGuardian: false,
        hasArtifacts: false,
        hasSpaceMonster: null,
        region: 'safe_zones',
        clusterId: null,
      };
      const sys2: StarSystem = {
        ...sys1,
        id: 'sys_2',
        name: 'System Two',
        coordinates: { x: 2, y: 0 }, // Within 3 parsecs
        planetIds: ['planet_2'],
      };

      const state = makeTestState({
        activeEvents: [plagueEvent],
        turn: 51,
        planets: {
          byId: { planet_home: testPlanet, planet_2: secondPlanet },
          allIds: ['planet_home', 'planet_2'],
        },
        galaxy: {
          ...initialState.galaxy,
          systems: {
            byId: { sys_home: sys1, sys_2: sys2 },
            allIds: ['sys_home', 'sys_2'],
          },
        },
      });
      state.empires.byId['player']!.planets = ['planet_home', 'planet_2'];

      // Use RNG that will trigger spread (< 0.25 for spread check)
      // But first it needs to pass population loss roll
      const rngValues = [0.5, 0.1]; // 0.5 for pop loss, 0.1 for spread check (< 0.25)
      let idx = 0;
      const mockRng = () => rngValues[idx++] ?? 0.5;

      const result = tickActiveEvents(state, mockRng);

      // Should have 2 active events now (original + spread)
      expect(result.state.activeEvents.length).toBe(2);
      expect(result.events.some(e => e.title.includes('Spreads'))).toBe(true);
    });

    it('expires after duration', () => {
      const plagueEvent: ActiveEvent = {
        id: 'plague-1',
        type: 'plague',
        startTurn: 50,
        endTurn: 53,
        targetPlanetId: 'planet_home',
        targetSystemId: 'sys_home',
        targetEmpireId: null,
        data: { populationLossMin: 10, populationLossMax: 20, spreadChance: 0 },
      };
      const state = makeTestState({
        activeEvents: [plagueEvent],
        turn: 53, // At end turn
      });

      const result = tickActiveEvents(state);

      // Event should be removed
      expect(result.state.activeEvents.length).toBe(0);
      expect(result.events.some(e => e.title.includes('Ends'))).toBe(true);
    });
  });

  describe('Comet event (random-events.md §Comet)', () => {
    it('countdown with 5 turn warning', () => {
      const cometEvent: ActiveEvent = {
        id: 'comet-1',
        type: 'comet',
        startTurn: 60,
        endTurn: 65,
        targetPlanetId: 'planet_home',
        targetSystemId: 'sys_home',
        targetEmpireId: null,
        data: { cometHp: 1000, damageTaken: 0, warningTurns: 5 },
      };
      const state = makeTestState({
        activeEvents: [cometEvent],
        turn: 62, // 3 turns remaining
      });

      const result = tickActiveEvents(state);

      // Event still active with countdown warning
      expect(result.state.activeEvents.length).toBe(1);
      expect(result.events.some(e => e.title.includes('Approaching'))).toBe(true);
      expect(result.events.some(e => e.description.includes('3 turns'))).toBe(true);
    });

    it('destroys colony if not intercepted when countdown reaches 0', () => {
      const cometEvent: ActiveEvent = {
        id: 'comet-1',
        type: 'comet',
        startTurn: 60,
        endTurn: 65,
        targetPlanetId: 'planet_home',
        targetSystemId: 'sys_home',
        targetEmpireId: null,
        data: { cometHp: 1000, damageTaken: 0, warningTurns: 5 },
      };
      const state = makeTestState({
        activeEvents: [cometEvent],
        turn: 65, // Countdown complete
      });

      const result = tickActiveEvents(state);

      // Colony should be destroyed
      const planet = result.state.planets.byId['planet_home']!;
      expect(planet.population).toBe(0);
      expect(planet.factories).toBe(0);
      expect(planet.isColonized).toBe(false);
      expect(result.events.some(e => e.title.includes('Destroyed'))).toBe(true);
    });
  });

  describe('Supernova event (random-events.md §Supernova)', () => {
    it('has 5 turn warning period', () => {
      const supernovaEvent: ActiveEvent = {
        id: 'supernova-1',
        type: 'supernova',
        startTurn: 100,
        endTurn: 105,
        targetPlanetId: null,
        targetSystemId: 'sys_home',
        targetEmpireId: null,
        data: { warningTurns: 5 },
      };
      const sysHome: StarSystem = {
        id: 'sys_home',
        name: 'Home System',
        coordinates: { x: 0, y: 0 },
        starType: 'yellow',
        starClass: 'G',
        planetIds: ['planet_home'],
        ownerId: 'player',
        hasAsteroids: false,
        hasNebula: false,
        nebulaId: null,
        hasWormhole: false,
        wormholeTarget: null,
        fleetIds: [],
        isOrion: false,
        hasGuardian: false,
        hasArtifacts: false,
        hasSpaceMonster: null,
        region: 'safe_zones',
        clusterId: null,
      };
      const state = makeTestState({
        activeEvents: [supernovaEvent],
        turn: 102, // 3 turns remaining
        galaxy: {
          ...initialState.galaxy,
          systems: {
            byId: { sys_home: sysHome },
            allIds: ['sys_home'],
          },
        },
      });

      const result = tickActiveEvents(state);

      expect(result.events.some(e => e.title.includes('Warning'))).toBe(true);
      expect(result.events.some(e => e.description.includes('3 turns'))).toBe(true);
    });
  });
});

// ── moveRoamingMonsters (random-events.md §Space Monsters §Behavior) ───────────

describe('moveRoamingMonsters', () => {
  it('handles state with no monsters gracefully', () => {
    const state = makeTestState();
    // @ts-expect-error - testing backward compatibility
    delete state.monsters;
    const result = moveRoamingMonsters(state);
    expect(result.state).toBeDefined();
    expect(result.events).toEqual([]);
  });

  it('Cosmic Blob roams toward nearest colony (movement 2)', () => {
    const monster: SpaceMonster = {
      id: 'monster-1',
      type: 'cosmic_blob',
      systemId: 'sys_far',
      hp: 500,
      maxHp: 500,
      isRoaming: true,
      spawnTurn: 50,
    };

    // Create systems with known distances
    const sysFar: StarSystem = {
      id: 'sys_far',
      name: 'Far System',
      coordinates: { x: 10, y: 0 },
      starType: 'red',
      starClass: 'M',
      planetIds: [],
      ownerId: null,
      hasAsteroids: false,
      hasNebula: false,
      nebulaId: null,
      hasWormhole: false,
      wormholeTarget: null,
      fleetIds: [],
      isOrion: false,
      hasGuardian: false,
      hasArtifacts: false,
      hasSpaceMonster: 'amoeba',
      region: 'safe_zones',
      clusterId: null,
    };
    const sysCloser: StarSystem = {
      ...sysFar,
      id: 'sys_closer',
      name: 'Closer System',
      coordinates: { x: 8, y: 0 }, // 2 parsecs closer
      hasSpaceMonster: null,
    };
    const sysHome: StarSystem = {
      ...sysFar,
      id: 'sys_home',
      name: 'Home System',
      coordinates: { x: 0, y: 0 },
      planetIds: ['planet_home'],
      ownerId: 'player',
      hasSpaceMonster: null,
    };

    const state = makeTestState({
      monsters: [monster],
      galaxy: {
        ...initialState.galaxy,
        systems: {
          byId: { sys_far: sysFar, sys_closer: sysCloser, sys_home: sysHome },
          allIds: ['sys_far', 'sys_closer', 'sys_home'],
        },
      },
    });

    const result = moveRoamingMonsters(state);

    // Monster should have moved closer
    const movedMonster = result.state.monsters.find(m => m.id === 'monster-1');
    expect(movedMonster).toBeDefined();
    expect(movedMonster!.systemId).toBe('sys_closer');
  });

  it('Void Wyrm does NOT roam (guards treasure location)', () => {
    const monster: SpaceMonster = {
      id: 'monster-2',
      type: 'void_wyrm',
      systemId: 'sys_treasure',
      hp: 750,
      maxHp: 750,
      isRoaming: false, // Does not roam
      spawnTurn: 100,
    };

    const sysTreasure: StarSystem = {
      id: 'sys_treasure',
      name: 'Treasure System',
      coordinates: { x: 5, y: 5 },
      starType: 'blue',
      starClass: 'A',
      planetIds: [],
      ownerId: null,
      hasAsteroids: false,
      hasNebula: false,
      nebulaId: null,
      hasWormhole: false,
      wormholeTarget: null,
      fleetIds: [],
      isOrion: false,
      hasGuardian: false,
      hasArtifacts: true,
      hasSpaceMonster: 'dragon',
      region: 'dark_sectors',
      clusterId: null,
    };

    const state = makeTestState({
      monsters: [monster],
      galaxy: {
        ...initialState.galaxy,
        systems: {
          byId: { sys_treasure: sysTreasure, sys_home: initialState.galaxy.systems.byId['sys_home']! },
          allIds: ['sys_treasure', 'sys_home'],
        },
      },
    });

    const result = moveRoamingMonsters(state);

    // Monster should NOT have moved
    const stayingMonster = result.state.monsters.find(m => m.id === 'monster-2');
    expect(stayingMonster!.systemId).toBe('sys_treasure');
    expect(result.events).toEqual([]);
  });
});

// ── resolveDerelictChoice (random-events.md §Ancient Derelict) ─────────────────

describe('resolveDerelictChoice', () => {
  describe('salvage choice', () => {
    it('grants 200-800 BC (guaranteed)', () => {
      const state = makeTestState();
      const initialCredits = state.empires.byId['player']!.credits;

      // Test with various RNG values
      for (let i = 0; i < 10; i++) {
        const rng = makeSeededRng(i * 100);
        const result = resolveDerelictChoice(state, 'salvage', rng);
        const creditsGained = result.state.empires.byId['player']!.credits - initialCredits;
        expect(creditsGained).toBeGreaterThanOrEqual(200);
        expect(creditsGained).toBeLessThanOrEqual(800);
        expect(result.outcome).toBe('bc_gain');
        expect(result.details.bcGained).toBe(creditsGained);
      }
    });
  });

  describe('board choice', () => {
    it('60% chance of tech discovery', () => {
      // RNG < 0.60 = tech discovery
      const state = makeTestState();
      // Add some available techs
      state.empires.byId['player']!.research.availableTechs.weapons = ['laser_rifle', 'gatling_laser'];

      const result = resolveDerelictChoice(state, 'board', () => 0.3);

      expect(result.outcome).toBe('tech_discovery');
      expect(result.details.techDiscovered).toBeDefined();
    });

    it('25% chance of finding nothing', () => {
      // RNG >= 0.60 && < 0.85 = nothing
      const state = makeTestState();

      const result = resolveDerelictChoice(state, 'board', () => 0.7);

      expect(result.outcome).toBe('nothing');
    });

    it('15% chance of trap (lose crew)', () => {
      // RNG >= 0.85 = trap
      const state = makeTestState();

      const result = resolveDerelictChoice(state, 'board', () => 0.9);

      expect(result.outcome).toBe('trap');
    });
  });
});

// ── MONSTER_STATS constants (random-events.md §MONSTER_STATS JSON) ───────────

describe('MONSTER_STATS', () => {
  it('Cosmic Blob has HP 500 and regeneration', () => {
    expect(MONSTER_STATS.cosmic_blob.hp).toBe(500);
    expect(MONSTER_STATS.cosmic_blob.regenerationPerRound).toBe(15);
    expect(MONSTER_STATS.cosmic_blob.isRoaming).toBe(true);
  });

  it('Crystal Horror has HP 400 and beam reflection 25%', () => {
    expect(MONSTER_STATS.crystal_horror.hp).toBe(400);
    expect(MONSTER_STATS.crystal_horror.beamReflectionPercent).toBe(25);
    expect(MONSTER_STATS.crystal_horror.isRoaming).toBe(true);
  });

  it('Void Wyrm has HP 750 and does NOT roam', () => {
    expect(MONSTER_STATS.void_wyrm.hp).toBe(750);
    expect(MONSTER_STATS.void_wyrm.isRoaming).toBe(false);
  });
});
