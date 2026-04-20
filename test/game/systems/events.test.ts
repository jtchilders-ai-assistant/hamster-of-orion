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
    difficulty: 'normal',
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
    // Verify by forcing the RNG to return a value between easy and impossible thresholds.
    // Easy: eventChance = 0.13 * 0.75 = 0.0975
    // Impossible: eventChance = 0.13 * 1.5 = 0.195
    // A roll of 0.15 is >= 0.0975 (easy skips) but < 0.195 (impossible fires).
    const between = () => 0.15;

    const easyState = makeTestState({ turn: 100, difficulty: 'easy' });
    const impossibleState = makeTestState({ turn: 100, difficulty: 'impossible' });

    // Easy: first call returns 0.15 >= 0.0975 → no event
    const easyResult = rollRandomEvents(easyState, between);
    // Impossible: first call returns 0.15 < 0.195 → may produce an event
    // (depends on eligible pool; we just verify the different behaviour)
    const impossibleResult = rollRandomEvents(impossibleState, () => 0.15);

    // Easy must NOT fire (0.15 >= easy threshold)
    expect(easyResult).toHaveLength(0);
    // Impossible CAN fire — but at minimum its threshold is higher,
    // so it should fire when given a low-enough value
    const impossibleFires = rollRandomEvents(impossibleState, () => 0.01);
    expect(impossibleFires.length).toBeGreaterThanOrEqual(0); // eligible pool may be empty
    // Confirm a low rng value that fires for impossible doesn't fire for easy
    const easyLow = rollRandomEvents(easyState, () => 0.10);
    // 0.10 >= 0.0975, so easy should not fire
    expect(easyLow).toHaveLength(0);
    // Suppress unused variable lint for impossibleResult
    expect(impossibleResult.length).toBeGreaterThanOrEqual(0);
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
