/**
 * Council screen integration tests.
 * test/ui/councilScreen.test.ts
 *
 * Since the vitest environment is 'node', we can't test DOM rendering directly.
 * These tests verify the underlying council system logic that CouncilScreen uses:
 * - Vote share calculation
 * - Council formation detection
 * - Candidate selection
 * - Voting turn detection
 * - Victory threshold
 */

import { describe, it, expect } from 'vitest';
import {
  calculateVoteShares,
  getCouncilCandidates,
  isCouncilTurn,
  isCouncilFormationMet,
  checkDiplomaticVictory,
  COUNCIL_INTERVAL,
  VICTORY_THRESHOLD,
  MIN_EFFECTIVE_VOTES,
} from '../../src/game/systems/council';
import {
  DiplomaticRelations,
  DiplomaticState,
  Empire,
  EmpireId,
  GameState,
  HighCouncil,
  Planet,
  PlanetId,
  SystemId,
} from '../../src/game/state';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRelation(empireA: EmpireId, empireB: EmpireId, value = 0): DiplomaticRelations {
  const state: DiplomaticState =
    value < -50 ? 'war' : value < 0 ? 'unfriendly' : value < 50 ? 'neutral' : value < 80 ? 'friendly' : 'allied';
  return {
    empireA, empireB, value, state,
    treaties: [], events: [], warStartTurn: null, lastContact: 1, modifiers: [],
  };
}

function makeEmpire(id: EmpireId, isPlayer = false, planetIds: PlanetId[] = []): Empire {
  return {
    id, raceId: 'hamsters', name: `Empire ${id}`,
    isPlayer, credits: 100, creditPerTurn: 10,
    planets: planetIds, fleets: [], shipDesigns: [],
    scannerTechLevel: 0, computerTechLevel: 0, securityLevel: 3,
    research: {
      currentTech: null, researchPoints: 0, researchPerTurn: 10,
      completedTechs: [], availableTechs: {
        propulsion: [], weapons: [], construction: [],
        computers: [], planetology: [], fields: [],
      },
      miniaturization: {}, stolenTechs: [],
    },
    relations: {},
    exploredSystems: [], visibleSystems: [],
    isDefeated: false, defeatedTurn: null,
  };
}

function makePlanet(id: PlanetId, ownerId: EmpireId | null, population = 100): Planet {
  return {
    id,
    systemId: 'sys1' as SystemId,
    name: `Planet ${id}`,
    type: 'terran',
    size: 'medium',
    gravity: 1.0,
    ownerId,
    isColonized: ownerId !== null,
    isHomeworld: false,
    population,
    maxPopulation: 500,
    growthRate: 0.05,
    morale: 100,
    factories: 10,
    maxFactories: 50,
    waste: 0,
    pollution: 0,
    productionQueue: [],
    researchOutput: 0,
    structures: [],
    buildings: [],
  } as unknown as Planet;
}

function makeCouncil(overrides: Partial<HighCouncil> = {}): HighCouncil {
  return {
    isActive: true,
    formationTurn: 1,
    nextVoteTurn: 25,
    voteFrequency: COUNCIL_INTERVAL,
    voteHistory: [],
    voteShares: {},
    ...overrides,
  };
}

function makeState(
  empires: Empire[],
  planets: Planet[] = [],
  turn = 1,
  council: HighCouncil | null = null,
): GameState {
  const empireById: Record<string, Empire> = {};
  for (const e of empires) empireById[e.id] = e;
  const planetById: Record<string, Planet> = {};
  for (const p of planets) planetById[p.id] = p;
  return {
    empires: { byId: empireById, allIds: empires.map(e => e.id) },
    planets: { byId: planetById, allIds: planets.map(p => p.id) },
    systems: { byId: {}, allIds: [] },
    fleets: { byId: {}, allIds: [] },
    ships: { byId: {}, allIds: [] },
    turn,
    difficulty: 'average', // Council formation threshold = 50% on average
    currentScreen: 'council',
    previousScreen: null,
    selectedPlanetId: null,
    selectedFleetId: null,
    notifications: [],
    victoryResult: null,
    isGameOver: false,
    highCouncil: council,
  } as unknown as GameState;
}

// ── Tests: CouncilScreen – inactive state ─────────────────────────────────────

describe('CouncilScreen – council formation', () => {
  it('council not formed when less than 50% planets colonized', () => {
    const planets = [
      makePlanet('p1', 'player', 100),   // colonized
      makePlanet('p2', null, 0),          // empty
      makePlanet('p3', null, 0),          // empty
    ];
    const state = makeState([makeEmpire('player', true, ['p1'])], planets);
    expect(isCouncilFormationMet(state)).toBe(false);
  });

  it('council forms when exactly 50% planets are colonized', () => {
    const planets = [
      makePlanet('p1', 'player', 100),
      makePlanet('p2', 'ai1', 100),
      makePlanet('p3', null, 0),
      makePlanet('p4', null, 0),
    ];
    const state = makeState(
      [makeEmpire('player', true, ['p1']), makeEmpire('ai1', false, ['p2'])],
      planets,
    );
    expect(isCouncilFormationMet(state)).toBe(true);
  });

  it('council forms when more than 50% planets are colonized', () => {
    const planets = [
      makePlanet('p1', 'player', 100),
      makePlanet('p2', 'ai1', 100),
      makePlanet('p3', 'ai1', 100),
      makePlanet('p4', null, 0),
    ];
    const state = makeState(
      [makeEmpire('player', true, ['p1']), makeEmpire('ai1', false, ['p2', 'p3'])],
      planets,
    );
    expect(isCouncilFormationMet(state)).toBe(true);
  });
});

// ── Tests: CouncilScreen – voting turn detection ──────────────────────────────

describe('CouncilScreen – voting turn detection', () => {
  it('isCouncilTurn fires on COUNCIL_INTERVAL boundaries', () => {
    expect(isCouncilTurn(COUNCIL_INTERVAL)).toBe(true);
    expect(isCouncilTurn(COUNCIL_INTERVAL * 2)).toBe(true);
    expect(isCouncilTurn(COUNCIL_INTERVAL * 3)).toBe(true);
  });

  it('isCouncilTurn is false on non-boundary turns', () => {
    expect(isCouncilTurn(1)).toBe(false);
    expect(isCouncilTurn(COUNCIL_INTERVAL - 1)).toBe(false);
    expect(isCouncilTurn(COUNCIL_INTERVAL + 1)).toBe(false);
  });
});

// ── Tests: CouncilScreen – vote shares ────────────────────────────────────────

describe('CouncilScreen – vote share percentages', () => {
  it('vote shares sum to 100%', () => {
    const planets = [
      makePlanet('p1', 'player', 300),
      makePlanet('p2', 'ai1', 200),
      makePlanet('p3', 'ai2', 100),
    ];
    const player = makeEmpire('player', true, ['p1']);
    const ai1 = makeEmpire('ai1', false, ['p2']);
    const ai2 = makeEmpire('ai2', false, ['p3']);
    // Set up cross-relations
    player.relations = { ai1: makeRelation('player', 'ai1'), ai2: makeRelation('player', 'ai2') };
    ai1.relations = { player: makeRelation('ai1', 'player'), ai2: makeRelation('ai1', 'ai2') };
    ai2.relations = { player: makeRelation('ai2', 'player'), ai1: makeRelation('ai2', 'ai1') };
    const state = makeState([player, ai1, ai2], planets);
    const shares = calculateVoteShares(state);
    const total = Object.values(shares).reduce((s, v) => s + v, 0);
    expect(total).toBeCloseTo(100, 1);
  });

  it('empire with more population gets higher vote share', () => {
    const planets = [
      makePlanet('p1', 'player', 600),  // large empire
      makePlanet('p2', 'ai1', 100),     // small empire
      makePlanet('p3', 'ai1', 100),
    ];
    const player = makeEmpire('player', true, ['p1']);
    const ai1 = makeEmpire('ai1', false, ['p2', 'p3']);
    player.relations = { ai1: makeRelation('player', 'ai1') };
    ai1.relations = { player: makeRelation('ai1', 'player') };
    const state = makeState([player, ai1], planets);
    const shares = calculateVoteShares(state);
    expect(shares['player']!).toBeGreaterThan(shares['ai1']!);
  });
});

// ── Tests: CouncilScreen – candidates ────────────────────────────────────────

describe('CouncilScreen – two candidates shown', () => {
  it('returns exactly two candidates', () => {
    const planets = [
      makePlanet('p1', 'player', 300),
      makePlanet('p2', 'ai1', 200),
      makePlanet('p3', 'ai2', 100),
    ];
    const player = makeEmpire('player', true, ['p1']);
    const ai1 = makeEmpire('ai1', false, ['p2']);
    const ai2 = makeEmpire('ai2', false, ['p3']);
    player.relations = { ai1: makeRelation('player', 'ai1'), ai2: makeRelation('player', 'ai2') };
    ai1.relations = { player: makeRelation('ai1', 'player'), ai2: makeRelation('ai1', 'ai2') };
    ai2.relations = { player: makeRelation('ai2', 'player'), ai1: makeRelation('ai2', 'ai1') };
    const state = makeState([player, ai1, ai2], planets);
    const candidates = getCouncilCandidates(state);
    expect(candidates).toHaveLength(2);
  });

  it('top two vote-share empires are candidates', () => {
    const planets = [
      makePlanet('p1', 'player', 500),  // highest
      makePlanet('p2', 'ai1', 300),     // second highest
      makePlanet('p3', 'ai2', 50),      // lowest — NOT a candidate
    ];
    const player = makeEmpire('player', true, ['p1']);
    const ai1 = makeEmpire('ai1', false, ['p2']);
    const ai2 = makeEmpire('ai2', false, ['p3']);
    player.relations = { ai1: makeRelation('player', 'ai1'), ai2: makeRelation('player', 'ai2') };
    ai1.relations = { player: makeRelation('ai1', 'player'), ai2: makeRelation('ai1', 'ai2') };
    ai2.relations = { player: makeRelation('ai2', 'player'), ai1: makeRelation('ai2', 'ai1') };
    const state = makeState([player, ai1, ai2], planets);
    const candidates = getCouncilCandidates(state);
    expect(candidates).toContain('player');
    expect(candidates).toContain('ai1');
    expect(candidates).not.toContain('ai2');
  });
});

// ── Tests: CouncilScreen – victory display ────────────────────────────────────

describe('CouncilScreen – victory conditions', () => {
  it('VICTORY_THRESHOLD is 2/3', () => {
    expect(VICTORY_THRESHOLD).toBeCloseTo(2 / 3, 5);
  });

  it('MIN_EFFECTIVE_VOTES is 50', () => {
    expect(MIN_EFFECTIVE_VOTES).toBe(50);
  });

  it('reports diplomatic victory when a candidate receives 2/3+ of votes', () => {
    // Simple vote scenario: player gets 80% of 100% effective votes
    const voteShares: Record<EmpireId, number> = { player: 80, ai1: 20 };
    // All empires cast votes (no abstentions)
    const votes: Record<EmpireId, EmpireId> = { player: 'player', ai1: 'player' };
    const candidates: [EmpireId, EmpireId] = ['player', 'ai1'];
    const winner = checkDiplomaticVictory(voteShares, votes, candidates);
    expect(winner).toBe('player');
  });

  it('does not report victory when no candidate has 2/3 of votes', () => {
    const voteShares: Record<EmpireId, number> = { player: 40, ai1: 60 };
    const votes: Record<EmpireId, EmpireId> = { player: 'player', ai1: 'ai1' };
    const candidates: [EmpireId, EmpireId] = ['player', 'ai1'];
    const winner = checkDiplomaticVictory(voteShares, votes, candidates);
    // ai1 has 60% which is < 2/3 (~66.7%)
    expect(winner).toBeNull();
  });

  it('council interval constant is 25 turns', () => {
    expect(COUNCIL_INTERVAL).toBe(25);
  });
});
